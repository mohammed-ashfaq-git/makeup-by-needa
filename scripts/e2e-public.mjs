/**
 * Public website CMS-integration E2E (companion to e2e-cms.mjs).
 *
 * Verifies that every public page is driven by the CMS database:
 * logo, hero image, artist photo, phone, WhatsApp, business name,
 * testimonials/FAQ visibility toggles, seeded services, empty states
 * and a customer-facing content audit.
 *
 * Usage: node scripts/e2e-public.mjs [base-url]
 * Requires an admin account: admin@e2e.test / e2e-password-123
 *
 * Custom Chromium build (e.g. in a sandbox):
 *   CHROME_PATH=/tmp/chromium CHROME_LD_LIBRARY_PATH=/tmp/al2023-libs/lib \
 *     node scripts/e2e-public.mjs http://127.0.0.1:3000
 */
if (process.env.CHROME_LD_LIBRARY_PATH)
  process.env.LD_LIBRARY_PATH = process.env.CHROME_LD_LIBRARY_PATH;
import puppeteer from "puppeteer";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const EMAIL = "admin@e2e.test";
const PASSWORD = "e2e-password-123";
const UPLOAD = "public/images/makeup-by-needa-portfolio-02.jpg";

let passed = 0;
let failed = 0;
const failures = [];

function ok(name) {
  passed++;
  console.log(`  ✓ ${name}`);
}
function fail(name, detail = "") {
  failed++;
  failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  console.log(`  ✗ ${name}${detail ? ` ${detail}` : ""}`);
}

async function settle(page, ms = 900) {
  await new Promise((r) => setTimeout(r, ms));
}

/** next/image wraps srcs as /_next/image?url=<encoded>&w=… — decode. */
function realSrc(src) {
  if (!src) return src;
  if (src.startsWith("/_next/image?")) {
    const url = new URL(src, BASE);
    return url.searchParams.get("url") ?? src;
  }
  return src;
}

async function clickText(page, text) {
  const handles = await page.$$("button, a");
  for (const handle of handles) {
    const value = (await handle.evaluate((n) => n.innerText)).trim();
    if (value === text) {
      await handle.click();
      return true;
    }
  }
  return false;
}

async function setInputValue(page, selector, value) {
  await page.evaluate(
    (sel, val) => {
      const el = document.querySelector(sel);
      const proto =
        el instanceof HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
      setter.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    },
    selector,
    value,
  );
}

/** Finds the Hide/Show toggle button inside a manager row. */
async function findToggle_button(page, rowText) {
  const handle = await page.evaluateHandle((text) => {
    const row = [...document.querySelectorAll(".manager-row")].find((n) =>
      n.innerText.includes(text),
    );
    const form = [...(row?.querySelectorAll("form[action]") ?? [])].find((f) => {
      const btn = f.querySelector("button");
      return (
        btn &&
        (btn.innerText.trim() === "Hide" || btn.innerText.trim() === "Show")
      );
    });
    return form?.querySelector("button");
  }, rowText);
  return handle.asElement();
}

async function findDeleteButton(page, rowText) {
  const handle = await page.evaluateHandle((text) => {
    const row = [...document.querySelectorAll(".manager-row")].find((n) =>
      n.innerText.includes(text),
    );
    return [...(row?.querySelectorAll("button") ?? [])].find((b) =>
      b.innerText.includes("Delete"),
    );
  }, rowText);
  return handle.asElement();
}

/* ---------------------------------------------------------------- */

const browser = await puppeteer.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });
page.on("dialog", (d) => d.accept());

try {
  /* ---------------- Login ---------------- */
  console.log("\n[1] Admin login");
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle0" });
  await page.type("#login-email", EMAIL);
  await page.type("#login-password", PASSWORD);
  await page.click("form.a-form button[type=submit]");
  await page.waitForFunction(
    () => !window.location.href.includes("/admin/login"),
    { timeout: 15000 },
  );
  ok("logged in");

  /* ---------------- Content audit ---------------- */
  console.log("\n[2] Customer-facing content audit");
  const forbidden = [
    "Image will be added",
    "will be added",
    "Coming soon",
    "coming soon",
    "lorem",
    "Lorem",
    "placeholder text",
    "future appointment",
    "[object Object]",
    "undefined",
  ];
  for (const path of ["/", "/about", "/services", "/gallery", "/book", "/contact"]) {
    const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0" });
    if (res.status() !== 200) {
      fail(`${path} returns 200`, `status ${res.status()}`);
      continue;
    }
    const text = await page.evaluate(() => document.body.innerText);
    const hits = forbidden.filter((word) => text.includes(word));
    if (hits.length === 0) ok(`${path} clean (no dev/placeholder wording)`);
    else fail(`${path} clean`, `found: ${hits.join(", ")}`);
  }

  /* ---------------- Seeded services on the public page ---------------- */
  console.log("\n[3] Services page — seeded CMS content");
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0" });
  const serviceNames = await page.$$eval(".service-block h3", (nodes) =>
    nodes.map((n) => n.innerText.trim()),
  );
  if (serviceNames.length === 22) ok("all 22 seeded services shown");
  else fail("all 22 seeded services shown", `got ${serviceNames.length}`);

  const firstMakeup = await page.$eval(
    ".service-feature .service-block h3",
    (n) => n.innerText.trim(),
  );
  if (firstMakeup === "Bridal Makeup")
    ok("display order respected (Bridal Makeup first)");
  else fail("display order respected (Bridal Makeup first)", firstMakeup);

  const prices = await page.$$eval(".block-detail strong", (nodes) =>
    nodes.map((n) => n.innerText.trim()),
  );
  if (prices.every((p) => p === "Enquire for pricing"))
    ok("NULL prices render as Enquire for pricing");
  else fail("NULL prices render as Enquire for pricing", prices.join(", "));

  const durations = await page.$$eval(".block-detail span", (nodes) =>
    nodes.map((n) => n.innerText.trim()),
  );
  if (durations.includes("Duration available on enquiry"))
    ok("CMS duration text shown");
  else fail("CMS duration text shown", durations.slice(0, 3).join(", "));

  /* ---------------- Gallery ---------------- */
  console.log("\n[4] Gallery page — only the real images");
  await page.goto(`${BASE}/gallery`, { waitUntil: "networkidle0" });
  const cards = await page.$$eval(".gallery-card", (nodes) =>
    nodes.map((n) => ({
      title: n.querySelector(".gallery-card-info strong")?.innerText.trim(),
      src: n.querySelector("img")?.getAttribute("src"),
    })),
  );
  if (cards.length === 4) ok("4 seeded gallery images shown");
  else fail("4 seeded gallery images shown", `got ${cards.length}`);
  if ((cards[0]?.title ?? "").toLowerCase() === "signature beauty")
    ok("gallery display order respected");
  else fail("gallery display order respected", cards[0]?.title ?? "none");
  const realSrcs = cards.map((c) => realSrc(c.src));
  const allReal =
    realSrcs.length === 4 && realSrcs.every((s) => s.startsWith("/images/"));
  if (allReal) ok("no fake/placeholder gallery tiles");
  else fail("no fake/placeholder gallery tiles", JSON.stringify(realSrcs));

  /* ---------------- About page ---------------- */
  console.log("\n[5] About page — CMS artist profile");
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle0" });
  const aboutText = await page.evaluate(() => document.body.innerText);
  if (aboutText.includes("beauty should feel personal"))
    ok("artist bio from the CMS");
  else fail("artist bio from the CMS", "expected seeded bio copy");
  if (await page.$(".portrait-placeholder .portrait-monogram"))
    ok("missing portrait handled by monogram fallback");
  else fail("missing portrait handled by monogram fallback", "no monogram");

  /* ---------------- Business name → header/footer ---------------- */
  console.log("\n[6] Business name change → header & footer");
  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  await setInputValue(page, "#s-business-name", "Needa Beauty Studio");
  await clickText(page, "Save changes");
  await page.waitForFunction(
    () => document.body.innerText.includes("Settings saved"),
    { timeout: 15000 },
  );
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  const brandNames = await page.$$eval(".brand-name", (nodes) =>
    nodes.map((n) => n.innerText.trim()),
  );
  if (
    brandNames.length >= 2 &&
    brandNames.every((n) => n.toLowerCase() === "needa beauty studio")
  )
    ok("header + footer brand name updated live");
  else fail("header + footer brand name updated live", brandNames.join(", "));

  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  await setInputValue(
    page,
    "#s-home-title",
    "Needa Beauty Studio | Makeup Artist",
  );
  await clickText(page, "Save changes");
  await page.waitForFunction(
    () => document.body.innerText.includes("Settings saved"),
    { timeout: 15000 },
  );
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  const pageTitle = await page.title();
  if (pageTitle === "Needa Beauty Studio | Makeup Artist")
    ok("homepage <title> uses the CMS home title setting");
  else fail("homepage <title> uses the CMS home title setting", pageTitle);
  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  await setInputValue(
    page,
    "#s-home-title",
    "Makeup by Needa | Toronto Makeup Artist",
  );
  await setInputValue(page, "#s-business-name", "Makeup by Needa");
  await clickText(page, "Save changes");
  await page.waitForFunction(
    () => document.body.innerText.includes("Settings saved"),
    { timeout: 15000 },
  );
  ok("business name + home title reverted");

  /* ---------------- Logo upload → header/footer ---------------- */
  console.log("\n[7] Logo upload → header & footer");
  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  const logoInput = await page.$("#logo-input");
  await logoInput.uploadFile(UPLOAD);
  await clickText(page, "Save changes");
  await page.waitForFunction(
    () => document.body.innerText.includes("Settings saved"),
    { timeout: 20000 },
  );
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  const logoSrcs = (
    await page.$$eval(".brand-logo", (nodes) =>
      nodes.map((n) => n.getAttribute("src")),
    )
  ).map(realSrc);
  const logoManaged = logoSrcs.filter((s) => s && s.startsWith("/api/images/"));
  if (logoSrcs.length >= 2 && logoManaged.length === logoSrcs.length)
    ok("uploaded logo shown in header + footer");
  else fail("uploaded logo shown in header + footer", logoSrcs.join(", "));
  const logoResp = await page.goto(`${BASE}${logoManaged[0]}`, {
    waitUntil: "networkidle0",
  });
  if ((logoResp.headers()["content-type"] ?? "").startsWith("image/"))
    ok("uploaded logo served via /api/images");
  else fail("uploaded logo served via /api/images", "not an image");

  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  if (await page.$('input[name="removeLogo"]')) {
    await page.click('input[name="removeLogo"]');
    await clickText(page, "Save changes");
    await page.waitForFunction(
      () => document.body.innerText.includes("Settings saved"),
      { timeout: 20000 },
    );
    await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
    const reverted = realSrc(
      await page.$eval(".brand-logo", (n) => n.getAttribute("src")),
    );
    if (reverted === "/makeup-by-needa-logo.jpg")
      ok("logo removal restores the default logo");
    else fail("logo removal restores the default logo", reverted);
  }

  /* ---------------- Hero image ---------------- */
  console.log("\n[8] Homepage hero image from the CMS");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  const heroBefore = realSrc(
    await page.$eval(".hero-photo", (n) => n.getAttribute("src")),
  );
  if (heroBefore === "/images/makeup-by-needa-hero.jpg")
    ok("default hero = first active gallery image");
  else fail("default hero = first active gallery image", heroBefore);

  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  const heroInput = await page.$("#hero-input");
  await heroInput.uploadFile(UPLOAD);
  await clickText(page, "Save changes");
  await page.waitForFunction(
    () => document.body.innerText.includes("Settings saved"),
    { timeout: 20000 },
  );
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  const heroAfter = realSrc(
    await page.$eval(".hero-photo", (n) => n.getAttribute("src")),
  );
  if (heroAfter && heroAfter.startsWith("/api/images/"))
    ok("dedicated hero image overrides the gallery default");
  else fail("dedicated hero image overrides the gallery default", heroAfter);

  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  if (await page.$('input[name="removeHero"]')) {
    await page.click('input[name="removeHero"]');
    await clickText(page, "Save changes");
    await page.waitForFunction(
      () => document.body.innerText.includes("Settings saved"),
      { timeout: 20000 },
    );
    await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
    const heroReverted = realSrc(
      await page.$eval(".hero-photo", (n) => n.getAttribute("src")),
    );
    if (heroReverted === "/images/makeup-by-needa-hero.jpg")
      ok("hero removal falls back to the first gallery image");
    else
      fail("hero removal falls back to the first gallery image", heroReverted);
  }

  /* ---------------- Artist photo → About ---------------- */
  console.log("\n[9] Artist photo upload → About page");
  await page.goto(`${BASE}/admin/artist`, { waitUntil: "networkidle0" });
  const photoInput = await page.$("#photo-input");
  if (photoInput) {
    await photoInput.uploadFile(UPLOAD);
    await clickText(page, "Save changes");
    await page.waitForFunction(
      () => document.body.innerText.toLowerCase().includes("saved"),
      { timeout: 20000 },
    );
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle0" });
    const portrait = await page.$(".portrait-photo img");
    const monogram = await page.$(".portrait-placeholder");
    if (portrait && !monogram) ok("uploaded artist photo shown on About");
    else fail("uploaded artist photo shown on About", "still placeholder");

    await page.goto(`${BASE}/admin/artist`, { waitUntil: "networkidle0" });
    if (await page.$('input[name="removePhoto"]')) {
      await page.click('input[name="removePhoto"]');
      await clickText(page, "Save changes");
      await page.waitForFunction(
        () => document.body.innerText.toLowerCase().includes("saved"),
        { timeout: 20000 },
      );
      await page.goto(`${BASE}/about`, { waitUntil: "networkidle0" });
      if (await page.$(".portrait-placeholder .portrait-monogram"))
        ok("photo removal returns to the monogram fallback");
      else
        fail("photo removal returns to the monogram fallback", "no monogram");
    }
  }

  /* ---------------- Phone → footer + contact ---------------- */
  console.log("\n[10] Phone change → footer & contact page");
  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  await setInputValue(page, "#s-phone", "+1 416 555 0134");
  await clickText(page, "Save changes");
  await page.waitForFunction(
    () => document.body.innerText.includes("Settings saved"),
    { timeout: 15000 },
  );
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle0" });
  const contactText = await page.evaluate(() => document.body.innerText);
  if (contactText.includes("+1 416 555 0134"))
    ok("phone shown on the contact page");
  else fail("phone shown on the contact page", "number missing");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  const footerText = await page.evaluate(
    () => document.querySelector(".footer").innerText,
  );
  if (footerText.includes("+1 416 555 0134"))
    ok("phone shown in the footer");
  else fail("phone shown in the footer", "number missing");

  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  await setInputValue(page, "#s-phone", "");
  await clickText(page, "Save changes");
  await page.waitForFunction(
    () => document.body.innerText.includes("Settings saved"),
    { timeout: 15000 },
  );
  ok("phone cleared (optional field)");

  /* ---------------- WhatsApp → buttons + contact ---------------- */
  console.log("\n[11] WhatsApp change → all WhatsApp links");
  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  await setInputValue(page, "#s-whatsapp", "14165550199");
  await setInputValue(page, "#s-whatsapp-message", "Hello from the CMS test");
  await clickText(page, "Save changes");
  await page.waitForFunction(
    () => document.body.innerText.includes("Settings saved"),
    { timeout: 15000 },
  );
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  const waHref = await page.$eval("a.whatsapp", (n) => n.getAttribute("href"));
  if (
    waHref ===
    "https://wa.me/14165550199?text=" +
      encodeURIComponent("Hello from the CMS test")
  )
    ok("floating WhatsApp button uses CMS number + message");
  else fail("floating WhatsApp button uses CMS number + message", waHref);

  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle0" });
  const contactWa = await page.evaluate(() =>
    [...document.querySelectorAll('a[href*="wa.me"]')].map((n) =>
      n.getAttribute("href"),
    ),
  );
  if (
    contactWa.length > 0 &&
    contactWa.every((h) => h.includes("wa.me/14165550199"))
  )
    ok("contact page WhatsApp link uses the CMS number");
  else fail("contact page WhatsApp link uses the CMS number", contactWa[0]);

  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  await setInputValue(page, "#s-whatsapp", "15483287786");
  await setInputValue(
    page,
    "#s-whatsapp-message",
    "Hi Makeup by Needa, I’d like to enquire about your services.",
  );
  await clickText(page, "Save changes");
  await page.waitForFunction(
    () => document.body.innerText.includes("Settings saved"),
    { timeout: 15000 },
  );
  ok("WhatsApp settings reverted");

  /* ---------------- Testimonial visibility ---------------- */
  console.log("\n[12] Testimonial visibility toggle → homepage");
  await page.goto(`${BASE}/admin/testimonials`, { waitUntil: "networkidle0" });
  await clickText(page, "+ Add testimonial");
  await settle(page, 400);
  await page.type('input[name="clientName"]', "Toggle Test Client");
  await page.type(
    'textarea[name="quote"]',
    "Wonderful experience from start to finish.",
  );
  await clickText(page, "Add testimonial");
  await page.waitForFunction(
    () => document.body.innerText.includes("Toggle Test Client"),
    { timeout: 15000 },
  );
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  const homeWith = await page.evaluate(() => document.body.innerText);
  if (homeWith.includes("Toggle Test Client"))
    ok("new testimonial appears on the homepage");
  else fail("new testimonial appears on the homepage", "not found");

  await page.goto(`${BASE}/admin/testimonials`, { waitUntil: "networkidle0" });
  const hideButton = await findToggle_button(page, "Toggle Test Client");
  if (hideButton) {
    await hideButton.click();
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll(".manager-row")]
          .find((n) => n.innerText.includes("Toggle Test Client"))
          ?.innerText.includes("Hidden"),
      { timeout: 15000 },
    );
    await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
    const homeHidden = await page.evaluate(() => document.body.innerText);
    if (!homeHidden.includes("Toggle Test Client"))
      ok("hidden testimonial removed from the homepage");
    else fail("hidden testimonial removed from the homepage", "still visible");
  } else {
    fail("hidden testimonial removed from the homepage", "hide button missing");
  }

  await page.goto(`${BASE}/admin/testimonials`, { waitUntil: "networkidle0" });
  const delButton = await findDeleteButton(page, "Toggle Test Client");
  if (delButton) {
    await delButton.click();
    await settle(page, 900);
    ok("test testimonial cleaned up");
  }

  /* ---------------- FAQ visibility ---------------- */
  console.log("\n[13] FAQ visibility toggle → booking page");
  await page.goto(`${BASE}/admin/faqs`, { waitUntil: "networkidle0" });
  await clickText(page, "+ Add FAQ");
  await settle(page, 400);
  await page.type('input[name="question"]', "Do you travel for events?");
  await page.type(
    'textarea[name="answer"]',
    "Yes — travel within the GTA can be discussed during your enquiry.",
  );
  await clickText(page, "Add FAQ");
  await page.waitForFunction(
    () => document.body.innerText.includes("Do you travel for events?"),
    { timeout: 15000 },
  );
  await page.goto(`${BASE}/book`, { waitUntil: "networkidle0" });
  const bookWith = await page.evaluate(() => document.body.innerText);
  if (bookWith.includes("Do you travel for events?"))
    ok("new FAQ appears on the booking page");
  else fail("new FAQ appears on the booking page", "not found");

  await page.goto(`${BASE}/admin/faqs`, { waitUntil: "networkidle0" });
  const faqHideButton = await findToggle_button(page, "Do you travel for events?");
  if (faqHideButton) {
    await faqHideButton.click();
    await settle(page, 1200);
    await page.goto(`${BASE}/book`, { waitUntil: "networkidle0" });
    const bookHidden = await page.evaluate(() => document.body.innerText);
    if (!bookHidden.includes("Do you travel for events?"))
      ok("hidden FAQ removed from the booking page");
    else fail("hidden FAQ removed from the booking page", "still visible");
  } else {
    fail("hidden FAQ removed from the booking page", "hide button missing");
  }

  await page.goto(`${BASE}/admin/faqs`, { waitUntil: "networkidle0" });
  const faqDeleteButton = await findDeleteButton(page, "Do you travel for events?");
  if (faqDeleteButton) {
    await faqDeleteButton.click();
    await settle(page, 900);
    ok("test FAQ cleaned up");
  }

  /* ---------------- Service order on the public page ---------------- */
  console.log("\n[14] Service reorder → public order changes");
  await page.goto(`${BASE}/admin/services`, { waitUntil: "networkidle0" });
  const firstBefore = await page.$eval(
    ".manager-row strong",
    (n) => n.innerText.trim(),
  );
  const downHandle = await page.evaluateHandle(() => {
    const row = document.querySelector(".manager-row");
    return [...row.querySelectorAll("button")].find(
      (b) => b.innerText.trim() === "↓",
    );
  });
  const downButton = await downHandle.asElement();
  if (downButton && firstBefore.includes("Bridal Makeup")) {
    await downButton.click();
    await settle(page, 1200);
    await page.goto(`${BASE}/services`, { waitUntil: "networkidle0" });
    const publicFirst = await page.$eval(
      ".service-feature .service-block h3",
      (n) => n.innerText.trim(),
    );
    if (publicFirst !== "Bridal Makeup")
      ok("reorder reflected on the public services page");
    else fail("reorder reflected on the public services page", "still first");

    await page.goto(`${BASE}/admin/services`, { waitUntil: "networkidle0" });
    const upHandle = await page.evaluateHandle(() => {
      const row = [...document.querySelectorAll(".manager-row")].find((n) =>
        n.innerText.includes("Bridal Makeup"),
      );
      return [...row.querySelectorAll("button")].find(
        (b) => b.innerText.trim() === "↑",
      );
    });
    const upButton = await upHandle.asElement();
    if (upButton) {
      await upButton.click();
      await settle(page, 1200);
      ok("service order restored");
    }
  } else {
    fail("reorder reflected on the public services page", "controls missing");
  }

  /* ---------------- Footer service links ---------------- */
  console.log("\n[15] Footer uses CMS featured services");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  const footerServices = await page.$$eval(
    ".footer a[href='/services']",
    (nodes) => nodes.map((n) => n.innerText.trim()),
  );
  if (footerServices.includes("Bridal Makeup"))
    ok("footer lists CMS services");
  else fail("footer lists CMS services", footerServices.join(", "));

  console.log("\n========================================");
  console.log(`PASSED: ${passed}   FAILED: ${failed}`);
  if (failed > 0) {
    console.log("Failures:");
    for (const f of failures) console.log(` - ${f}`);
  }
} catch (error) {
  failed++;
  console.error(`\nUNEXPECTED ERROR: ${error.message}`);
  console.error(error.stack?.split("\n").slice(0, 4).join("\n"));
  console.log(`\nPASSED: ${passed}   FAILED: ${failed}`);
} finally {
  await browser.close();
}

process.exit(failed > 0 ? 1 : 0);
