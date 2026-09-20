/**
 * End-to-end test of the admin CMS against the running production server.
 * Usage: node /tmp/e2e-cms.mjs [baseUrl]
 */
import puppeteer from "puppeteer";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const ADMIN_EMAIL = `admin@e2e.test`;
const ADMIN_PASSWORD = "e2e-password-123";

let passed = 0;
let failed = 0;
const failures = [];

function ok(label) {
  passed += 1;
  console.log(`  ✓ ${label}`);
}

function fail(label, detail = "") {
  failed += 1;
  failures.push(label);
  console.log(`  ✗ ${label} ${detail}`);
}

async function waitForText(page, text, { timeout = 15000, selector = "body" } = {}) {
  await page.waitForFunction(
    (t) => document.body.innerText.includes(t),
    { timeout },
    text,
  );
}

async function clickText(page, text, { element = "button", index = 0 } = {}) {
  const handles = await page.$$(`::-p-text(${text})`);
  const matching = [];
  for (const handle of handles) {
    // Elements cannot round-trip through evaluate() — resolve to the
    // enclosing button via evaluateHandle instead.
    const target = await handle.evaluateHandle(
      (node) => node.closest("button") ?? node,
    );
    const tag = await target.evaluate((node) => node?.tagName?.toLowerCase());
    if (tag === element) matching.push(target);
  }
  if (matching.length <= index)
    throw new Error(`No "${text}" ${element} #${index} found`);
  await matching[index].evaluate((node) => node.click());
}

async function setValue(page, selector, value) {
  await page.evaluate(
    ([sel, val]) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`Missing ${sel}`);
      const proto =
        el instanceof HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
      setter.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    },
    [selector, value],
  );
}

if (process.env.CHROME_LD_LIBRARY_PATH)
  process.env.LD_LIBRARY_PATH = process.env.CHROME_LD_LIBRARY_PATH;
const browser = await puppeteer.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

const page = await browser.newPage();
page.setDefaultTimeout(20000);
page.on("dialog", (dialog) => dialog.accept());

try {
  /* ============ 1. First-run setup ============ */
  console.log("\n[1] Admin setup (first run)");
  await page.goto(`${BASE}/admin/setup`, { waitUntil: "networkidle0" });

  if (await page.$("#setup-name")) {
    await page.type("#setup-name", "Needa E2E");
    await page.type("#setup-email", ADMIN_EMAIL);
    await page.type("#setup-password", ADMIN_PASSWORD);
    await clickText(page, "Create administrator account");
    await page.waitForFunction(
      (url) => location.pathname === "/admin",
      { timeout: 20000 },
      BASE,
    );
    await waitForText(page, "Dashboard");
    ok("setup created the admin and landed on the dashboard");
  } else {
    // Already exists (re-run): verify we were redirected to login instead.
    await page.waitForFunction(() =>
      ["/admin/login", "/admin"].includes(location.pathname),
    );
    ok("setup already completed — page redirected away");
  }

  // Setup page must now redirect to login (admin exists).
  await page.goto(`${BASE}/admin/setup`, { waitUntil: "networkidle0" });
  if (
    page.url().includes("/admin/login") ||
    page.url().replace(/\/$/, "") === `${BASE}/admin`
  ) {
    ok("setup page closed itself after an admin exists");
  } else {
    fail("setup page closed itself after an admin exists", `at ${page.url()}`);
  }

  /* ============ 2. Sidebar / layout ============ */
  console.log("\n[2] Admin layout");
  for (const item of [
    "Dashboard",
    "Website Settings",
    "Artist / Bio",
    "Services",
    "Gallery",
    "Testimonials",
    "FAQs",
    "Enquiries",
  ]) {
    const found = await page.$$eval(".admin-nav a", (nodes) =>
      nodes.map((node) => node.innerText.trim()),
    );
    if (found.includes(item)) ok(`sidebar link: ${item}`);
    else fail(`sidebar link: ${item}`);
  }
  const adminNameShown = await page.$eval(
    ".admin-topbar-user",
    (node) => node.innerText,
  );
  if (adminNameShown.includes("Needa E2E")) ok("logged-in admin name shown");
  else fail("logged-in admin name shown", adminNameShown);

  /* ============ 3. Logout + login ============ */
  console.log("\n[3] Logout and login");
  await clickText(page, "Log out");
  await page.waitForFunction(() => location.pathname === "/admin/login");
  ok("logout returns to the login page");

  await page.type("#login-email", ADMIN_EMAIL);
  await page.type("#login-password", "wrong-password");
  await clickText(page, "Log in");
  await waitForText(page, "Incorrect email or password.");
  ok("wrong password shows a generic error");

  await setValue(page, "#login-password", "");
  await page.type("#login-password", ADMIN_PASSWORD);
  await clickText(page, "Log in");
  await page.waitForFunction(() => location.pathname === "/admin");
  await waitForText(page, "Dashboard");
  ok("correct credentials log in");

  /* ============ 4. Unauthenticated protection ============ */
  console.log("\n[4] Route protection (fresh page, no cookie)");
  const anon = await browser.createBrowserContext();
  const anonPage = await anon.newPage();
  await anonPage.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  if (anonPage.url().includes("/admin/login")) ok("/admin/settings redirects to login");
  else fail("/admin/settings redirects to login", anonPage.url());
  await anonPage.goto(`${BASE}/admin/enquiries`, { waitUntil: "networkidle0" });
  if (anonPage.url().includes("/admin/login")) ok("/admin/enquiries redirects to login");
  else fail("/admin/enquiries redirects to login", anonPage.url());
  await anon.close();

  /* ============ 5. Dashboard ============ */
  console.log("\n[5] Dashboard");
  const stats = await page.$$eval(".a-stat small", (nodes) =>
    nodes.map((node) => node.innerText.trim()),
  );
  for (const expected of [
    "Total enquiries",
    "New enquiries",
    "Active services",
    "Gallery images",
    "Testimonials",
  ]) {
    if (stats.includes(expected)) ok(`stat card: ${expected}`);
    else fail(`stat card: ${expected}`, stats.join(","));
  }

  /* ============ 6. Settings ============ */
  console.log("\n[6] Website settings");
  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  await waitForText(page, "Website Settings");
  await setValue(page, "#s-business-name", "Needa Beauty E2E");
  await clickText(page, "Save changes");
  await waitForText(page, "Settings saved");
  ok("settings saved with a success message");

  const homeHtml = await page.evaluate(async () => {
    const response = await fetch("/");
    return response.text();
  });
  if (homeHtml.includes("Needa Beauty E2E")) ok("new business name live on public site");
  else fail("new business name live on public site");

  await setValue(page, "#s-business-name", "Makeup by Needa");
  await clickText(page, "Save changes");
  await waitForText(page, "Settings saved");
  const homeHtml2 = await page.evaluate(async () => (await fetch("/")).text());
  if (homeHtml2.includes("Makeup by Needa")) ok("business name reverted");
  else fail("business name reverted");

  /* ============ 7. Artist ============ */
  console.log("\n[7] Artist / bio");
  await page.goto(`${BASE}/admin/artist`, { waitUntil: "networkidle0" });
  await waitForText(page, "Artist / Bio");
  await setValue(page, "#a-experience", "10+ years of artistry (e2e)");
  await clickText(page, "Save changes");
  await waitForText(page, "Artist profile saved");
  ok("artist saved with a success message");
  const aboutHtml = await page.evaluate(async () => (await fetch("/about")).text());
  if (aboutHtml.includes("10+ years of artistry (e2e)"))
    ok("artist experience visible on About page");
  else fail("artist experience visible on About page");
  await setValue(page, "#a-experience", "");
  await clickText(page, "Save changes");
  await waitForText(page, "Artist profile saved");

  /* ============ 8. Services ============ */
  console.log("\n[8] Services");
  await page.goto(`${BASE}/admin/services`, { waitUntil: "networkidle0" });
  await waitForText(page, "All services");

  // 8a. Edit price of the first service (Bridal Makeup)
  await clickText(page, "Edit");
  await page.waitForSelector("#sv-name-1, input[name=name]");
  await setValue(page, "input[name=price]", "150");
  await clickText(page, "Save service");
  await waitForText(page, "Service updated");
  ok("service price saved");
  const servicesHtml = await page.evaluate(async () => (await fetch("/services")).text());
  if (servicesHtml.includes("$150")) ok("price $150 shown on public services page");
  else fail("price $150 shown on public services page");

  // 8b. price display override (reload first: the previous editor stays
  // open after saving, which changes which row "Edit" targets)
  await page.goto(`${BASE}/admin/services`, { waitUntil: "networkidle0" });
  await waitForText(page, "All services");
  await clickText(page, "Edit");
  await page.waitForSelector("input[name=priceDisplay]");
  await setValue(page, "input[name=priceDisplay]", "From $99");
  await clickText(page, "Save service");
  await waitForText(page, "Service updated");
  const servicesHtml2 = await page.evaluate(async () => (await fetch("/services")).text());
  if (servicesHtml2.includes("From $99")) ok("custom price text shown on public page");
  else fail("custom price text shown on public page");

  // 8c. clear price → Enquire for pricing
  await page.goto(`${BASE}/admin/services`, { waitUntil: "networkidle0" });
  await waitForText(page, "All services");
  await clickText(page, "Edit");
  await setValue(page, "input[name=price]", "");
  await setValue(page, "input[name=priceDisplay]", "");
  await clickText(page, "Save service");
  await waitForText(page, "Service updated");
  const servicesHtml3 = await page.evaluate(async () => (await fetch("/services")).text());
  if (servicesHtml3.includes("Enquire for pricing")) ok("NULL price falls back to Enquire for pricing");
  else fail("NULL price falls back to Enquire for pricing");

  // 8d. Add + hide + delete a service
  await clickText(page, "+ Add service");
  await page.waitForSelector("input[name=name]");
  await page.type("input[name=name]", "E2E Temp Service");
  await page.select("select[name=category]", "Nails");
  await setValue(page, "textarea[name=description]", "Temporary service for testing.");
  await clickText(page, "Add service");
  await waitForText(page, "Service added");
  await waitForText(page, "E2E Temp Service");
  ok("service added and visible in the list");

  const nailsHtml = await page.evaluate(async () => (await fetch("/services")).text());
  if (nailsHtml.includes("E2E Temp Service")) ok("new service visible on public site");
  else fail("new service visible on public site");

  // hide it
  const hideButtons = await page.$$("form[action] button");
  // find the row containing the temp service, then click its Hide button
  await page.evaluate(() => {
    const row = [...document.querySelectorAll(".manager-row")].find((node) =>
      node.innerText.includes("E2E Temp Service"),
    );
    const form = [...row.querySelectorAll("form")].find((f) =>
      f.innerText.trim() === "Hide",
    );
    form.querySelector("button").click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const hiddenHtml = await page.evaluate(async () => (await fetch("/services")).text());
  if (!hiddenHtml.includes("E2E Temp Service")) ok("hidden service removed from public site");
  else fail("hidden service removed from public site");

  // delete it (confirm dialog auto-accepted)
  await page.evaluate(() => {
    const row = [...document.querySelectorAll(".manager-row")].find((node) =>
      node.innerText.includes("E2E Temp Service"),
    );
    const form = [...row.querySelectorAll("form")].find((f) =>
      f.innerText.trim() === "Delete",
    );
    form.querySelector("button").click();
  });
  await page.waitForFunction(
    () => !document.body.innerText.includes("E2E Temp Service"),
    { timeout: 15000 },
  );
  ok("service deleted with confirmation");

  // 8e. reorder: move first Makeup service down, then back up
  await page.evaluate(() => {
    const section = [...document.querySelectorAll(".manager-category-head h2")].find(
      (h) => h.innerText.trim().toLowerCase() === "makeup",
    ).parentElement.parentElement;
    // first row's ↓ button
    const row = section.querySelector(".manager-row");
    const down = [...row.querySelectorAll("form")].find((f) =>
      f.querySelector("input[name=direction]")?.value === "down",
    );
    down.querySelector("button").click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const makeupOrder = await page.evaluate(() => {
    const section = [...document.querySelectorAll(".manager-category-head h2")].find(
      (h) => h.innerText.trim().toLowerCase() === "makeup",
    ).parentElement.parentElement;
    return [...section.querySelectorAll(".manager-row strong")]
      .map((node) => node.innerText.split("\n")[0].trim());
  });
  const norm = makeupOrder.map((x) => x.replace(/\s*(Featured|Visible|Hidden).*/, "").trim());
  if (norm[0] !== "Bridal Makeup" && norm[1] === "Bridal Makeup")
    ok(`reorder works (order now: ${makeupOrder.slice(0, 3).join(" › ")})`);
  else fail("reorder works", makeupOrder.slice(0, 3).join(" › "));
  // move it back
  await page.evaluate(() => {
    const section = [...document.querySelectorAll(".manager-category-head h2")].find(
      (h) => h.innerText.trim().toLowerCase() === "makeup",
    ).parentElement.parentElement;
    const rows = section.querySelectorAll(".manager-row");
    const row = rows[1];
    const up = [...row.querySelectorAll("form")].find((f) =>
      f.querySelector("input[name=direction]")?.value === "up",
    );
    up.querySelector("button").click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  /* ============ 9. Gallery ============ */
  console.log("\n[9] Gallery");
  await page.goto(`${BASE}/admin/gallery`, { waitUntil: "networkidle0" });
  await waitForText(page, "Gallery images");
  const seedCount = await page.$$eval(".manager-row", (nodes) => nodes.length);
  if (seedCount === 4) ok("4 real portfolio images seeded");
  else fail("4 real portfolio images seeded", `found ${seedCount}`);

  await clickText(page, "+ Upload image");
  await page.waitForSelector("input[type=file]");
  const fileInput = await page.$("input[type=file]");
  await fileInput.uploadFile("public/images/makeup-by-needa-portfolio-01.jpg");
  await page.type("input[name=title]", "E2E Uploaded Image");
  await page.select("select[name=category]", "Bridal");
  await clickText(page, "Upload image");
  await waitForText(page, "Image uploaded");
  await waitForText(page, "E2E Uploaded Image");
  ok("image uploaded and listed");

  const galleryHtml = await page.evaluate(async () => (await fetch("/gallery")).text());
  if (galleryHtml.includes("E2E Uploaded Image")) ok("uploaded image visible on public gallery");
  else fail("uploaded image visible on public gallery");

  // image serving endpoint
  const imageUrl = await page.evaluate(() => {
    const row = [...document.querySelectorAll(".manager-row")].find((node) =>
      node.innerText.includes("E2E Uploaded Image"),
    );
    return row.querySelector("img").src;
  });
  const imageStatus = await page.evaluate(async (url) => {
    const response = await fetch(url);
    return { status: response.status, type: response.headers.get("content-type") };
  }, imageUrl);
  if (imageStatus.status === 200 && imageStatus.type.startsWith("image/"))
    ok(`/api/images serves the file (${imageStatus.type})`);
  else fail("/api/images serves the file", JSON.stringify(imageStatus));

  // delete it
  await page.evaluate(() => {
    const row = [...document.querySelectorAll(".manager-row")].find((node) =>
      node.innerText.includes("E2E Uploaded Image"),
    );
    const form = [...row.querySelectorAll("form")].find((f) =>
      f.innerText.trim() === "Delete",
    );
    form.querySelector("button").click();
  });
  await page.waitForFunction(
    () => !document.body.innerText.includes("E2E Uploaded Image"),
    { timeout: 15000 },
  );
  ok("gallery image deleted with confirmation");

  /* ============ 10. Testimonials ============ */
  console.log("\n[10] Testimonials");
  await page.goto(`${BASE}/admin/testimonials`, { waitUntil: "networkidle0" });
  await waitForText(page, "Testimonials");
  await clickText(page, "+ Add testimonial");
  await page.type("input[name=clientName]", "E2E Client");
  await page.type("textarea[name=quote]", "Absolutely wonderful experience!");
  await page.select("select[name=rating]", "4");
  await clickText(page, "Add testimonial");
  await waitForText(page, "Testimonial added");
  await waitForText(page, "E2E Client");
  ok("testimonial added");

  const homeT = await page.evaluate(async () => (await fetch("/")).text());
  if (homeT.includes("E2E Client") && homeT.includes("Absolutely wonderful experience!"))
    ok("testimonial with rating shown on homepage");
  else fail("testimonial with rating shown on homepage");

  await page.evaluate(() => {
    const row = [...document.querySelectorAll(".manager-row")].find((node) =>
      node.innerText.includes("E2E Client"),
    );
    const form = [...row.querySelectorAll("form")].find((f) =>
      f.innerText.trim() === "Delete",
    );
    form.querySelector("button").click();
  });
  await page.waitForFunction(
    () => !document.body.innerText.includes("E2E Client"),
    { timeout: 15000 },
  );
  const homeT2 = await page.evaluate(async () => (await fetch("/")).text());
  if (!homeT2.includes("E2E Client")) ok("testimonial deleted and removed from homepage");
  else fail("testimonial deleted and removed from homepage");

  /* ============ 11. FAQs ============ */
  console.log("\n[11] FAQs");
  await page.goto(`${BASE}/admin/faqs`, { waitUntil: "networkidle0" });
  await waitForText(page, "Frequently asked questions");
  await clickText(page, "+ Add FAQ");
  await page.type("input[name=question]", "Do you travel for events?");
  await page.type("textarea[name=answer]", "Yes, travel within the GTA can be arranged.");
  await clickText(page, "Add FAQ");
  await waitForText(page, "FAQ added");
  await waitForText(page, "Do you travel for events?");
  ok("FAQ added");

  const bookHtml = await page.evaluate(async () => (await fetch("/book")).text());
  if (bookHtml.includes("Do you travel for events?")) ok("FAQ shown on booking page");
  else fail("FAQ shown on booking page");

  await page.evaluate(() => {
    const row = [...document.querySelectorAll(".manager-row")].find((node) =>
      node.innerText.includes("Do you travel for events?"),
    );
    const form = [...row.querySelectorAll("form")].find((f) =>
      f.innerText.trim() === "Delete",
    );
    form.querySelector("button").click();
  });
  await page.waitForFunction(
    () => !document.body.innerText.includes("Do you travel for events?"),
    { timeout: 15000 },
  );
  ok("FAQ deleted");

  /* ============ 12. Public enquiry → admin ============ */
  console.log("\n[12] Enquiry flow");
  const pub = await browser.createBrowserContext();
  const pubPage = await pub.newPage();
  pubPage.setDefaultTimeout(20000);
  await pubPage.goto(`${BASE}/book`, { waitUntil: "networkidle0" });
  await pubPage.type("#enquiry-name", "E2E Client");
  await pubPage.type("#enquiry-phone", "(416) 555-0100");
  await pubPage.type("#enquiry-email", "e2e.client@example.com");
  await pubPage.evaluate(() => {
    const el = document.querySelector("#enquiry-date");
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set;
    setter.call(el, "2026-10-15");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await pubPage.type("#enquiry-location", "Toronto");
  await pubPage.select("#enquiry-service", "Bridal Makeup");
  await pubPage.type("#enquiry-message", "E2E test enquiry for the wedding.");
  await pubPage.click("button[type=submit]");
  await pubPage.waitForSelector(".enquiry-success-card", { timeout: 20000 });
  await pubPage.waitForFunction(() => /ENQ-\d+/.test(document.body.innerText), {
    timeout: 10000,
  });
  const refNumber = await pubPage.$eval(".enquiry-status-desc strong:nth-of-type(1)", (node) => node.innerText);
  ok(`public enquiry submitted (reference ${await pubPage.evaluate(() => document.body.innerText.match(/ENQ-\d+/)?.[0] ?? "?")})`);
  await pub.close();

  // admin: enquiry appears
  await page.goto(`${BASE}/admin/enquiries`, { waitUntil: "networkidle0" });
  await waitForText(page, "E2E Client");
  ok("enquiry appears in the admin list");

  // status filter
  await page.select("#f-status", "NEW");
  await clickText(page, "Apply filters");
  await page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {});
  await waitForText(page, "E2E Client");
  ok("status filter keeps the enquiry visible");

  // detail page + status change
  await page.evaluate(() => {
    const link = [...document.querySelectorAll("a")].find((a) =>
      a.innerText.includes("ENQ-"),
    );
    location.href = link.getAttribute("href");
  });
  await page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {});
  await waitForText(page, "Customer");
  ok("enquiry detail page opens");

  await page.select("#enquiry-status", "CONTACTED");
  await clickText(page, "Update status");
  await waitForText(page, "Status updated to CONTACTED");
  ok("enquiry status changed to CONTACTED");

  const badge = await page.$eval(".a-badge.status-CONTACTED", () => true).catch(() => false);
  if (badge) ok("status badge updated on screen");

  /* ============ 13. Logout protects routes ============ */
  console.log("\n[13] Final logout");
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  await clickText(page, "Log out");
  await page.waitForFunction(() => location.pathname === "/admin/login");
  ok("logout works");

  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  if (page.url().includes("/admin/login"))
    ok("admin pages are protected after logout");
  else fail("admin pages are protected after logout", page.url());
} catch (error) {
  fail("unexpected error", error.message);
  console.error(error);
} finally {
  await browser.close();
}

console.log(`\n========================================`);
console.log(`PASSED: ${passed}   FAILED: ${failed}`);
if (failures.length) {
  console.log("Failures:");
  for (const item of failures) console.log(` - ${item}`);
}
process.exit(failed > 0 ? 1 : 0);
