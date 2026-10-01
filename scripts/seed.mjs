/**
 * Database seed — one-time bootstrap of CMS content.
 *
 * Seeds the website settings, artist profile and the four real gallery
 * images, mirroring the static configuration in src/lib/site-data.ts.
 *
 * Seeds the current nail, makeup, and hair catalogues into the editable
 * services table, adding only missing default entries. The source catalogues are the same ones
 * used by the public website.
 *
 * Idempotent: it never overwrites rows that already exist, so it is safe
 * to re-run.
 *
 * Usage: npm run db:seed
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import ts from "typescript";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (see .env.example).");
  process.exit(1);
}

/** The four real portfolio images currently on the website. */
const GALLERY = [
  [
    "/images/makeup-by-needa-hero.jpg",
    "Signature beauty",
    "Makeup",
    "Signature beauty look by Needa Beauty Lab",
  ],
  [
    "/images/Glamorous-Makeup-Artistry.jpg",
    "Glamorous makeup artistry",
    "Makeup",
    "Glamorous makeup artistry by Needa Beauty Lab",
  ],
  [
    "/images/makeup-by-needa-portfolio-01.jpg",
    "Makeup artistry",
    "Makeup",
    "Makeup artistry portfolio piece by Needa Beauty Lab",
  ],
  [
    "/images/makeup-by-needa-portfolio-02.jpg",
    "Beauty details",
    "Makeup",
    "Beauty details portfolio piece by Needa Beauty Lab",
  ],
];

const SETTINGS = {
  businessName: "Needa Beauty Lab",
  email: "aurastudioneeda@gmail.com",
  whatsappNumber: "15483287786",
  whatsappDisplay: "+1 548 328 7786",
  whatsappMessage:
    "Hi Needa Beauty Lab, I\u2019d like to enquire about your nail services.",
  location: "Toronto, Canada",
  hours: "By appointment",
  instagramMakeupHandle: "@makeupbynee_",
  instagramMakeupUrl: "https://www.instagram.com/makeupbynee_/",
  instagramNailsHandle: "@nailsbyneeda",
  instagramNailsUrl: "https://www.instagram.com/nailsbyneeda/",
  homeTitle: "Needa Beauty Lab | Makeup, Hair & Nail Services",
  homeDescription:
    "Makeup, hairstyling and nail services in Toronto, Canada, with personalized looks and current pricing.",
  footerText: "Needa Beauty Lab. All rights reserved.",
};

const LEGACY_HOME_DESCRIPTION =
  "Premium nail services in Toronto, Canada \u2014 gel polish, extensions, nail art, premium finishes and signature sets.";

const ARTIST = {
  name: "Needa",
  shortBio:
    "A personal approach to nail care and nail design, thoughtfully shaped around your style, your occasion, and the way you want to feel.",
  bio: "Hi, I'm Needa \u2014 the nail technician behind Needa Beauty Lab in Toronto. My work is built around a simple belief: beauty should feel personal, never templated.\n\nEvery appointment begins with a conversation \u2014 your style, your occasion, your preferred length and shape, and the finish you have in mind. From there, each set is designed around you: a clean gel manicure, soft French tips, glossy chrome or cat eye, lightweight extensions, or detailed nail art finished with charms and 3D details.\n\nWhether it is an everyday refresh, a celebration, or a special event, the intention stays the same \u2014 a polished, long-lasting finish that still feels entirely like you.",
  location: "Toronto, Canada",
  instagram: "@nailsbyneeda",
};

/** Load a data-only TypeScript catalogue without maintaining a second copy. */
async function loadTypeScriptCatalogue(relativePath) {
  const filePath = fileURLToPath(new URL(relativePath, import.meta.url));
  const source = await readFile(filePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
  return import(moduleUrl);
}

async function getDefaultServices() {
  const [nails, makeupHair] = await Promise.all([
    loadTypeScriptCatalogue("../src/lib/nail-services.ts"),
    loadTypeScriptCatalogue("../src/lib/aura-services.ts"),
  ]);

  const catalogues = [
    ...nails.nailServiceSections.map((section) => ({
      ...section,
      category: "Nails",
    })),
    ...makeupHair.auraSections.map((section) => ({
      ...section,
      category: section.category === "Hair" ? "Hair" : "Makeup",
    })),
  ];

  let displayOrder = 10;
  return catalogues.flatMap((section) =>
    section.items.map((item, itemIndex) => {
      const priceMatch = item.price.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
      const description = [
        item.description,
        itemIndex === 0 ? section.note : null,
      ]
        .filter(Boolean)
        .join(" ");
      const service = {
        name: item.name,
        category: section.category,
        subcategory: section.title,
        shortDescription: description ? description.slice(0, 300) : null,
        description,
        details: item.details?.join("\n") ?? null,
        price: priceMatch ? Number(priceMatch[1].replace(/,/g, "")).toFixed(2) : null,
        priceDisplay: item.price,
        duration: null,
        imageUrl: null,
        featured: false,
        active: true,
        displayOrder,
      };
      displayOrder += 10;
      return service;
    }),
  );
}

async function seedServices(db) {
  await db.beginTransaction();

  try {
    const catalog = await getDefaultServices();
    const [existingServices] = await db.query(
      "SELECT name, category, subcategory FROM services",
    );
    const serviceKey = (service) =>
      `${service.category}\u0000${service.subcategory ?? ""}\u0000${service.name}`.toLowerCase();
    const existingKeys = new Set(existingServices.map(serviceKey));
    const missing = catalog.filter((service) => {
      const key = serviceKey(service);
      if (existingKeys.has(key)) return false;
      existingKeys.add(key);
      return true;
    });

    if (missing.length === 0) {
      await db.commit();
      console.log(`All ${catalog.length} default services are already present — skipped.`);
      return;
    }

    const columns = [
      "name",
      "category",
      "subcategory",
      "short_description",
      "description",
      "details",
      "price",
      "price_display",
      "duration",
      "image_url",
      "featured",
      "active",
      "display_order",
    ];
    const rowPlaceholder = `(${columns.map(() => "?").join(", ")})`;

    for (let offset = 0; offset < missing.length; offset += 40) {
      const rows = missing.slice(offset, offset + 40);
      const placeholders = rows.map(() => rowPlaceholder).join(", ");
      const values = rows.flatMap((service) => [
        service.name,
        service.category,
        service.subcategory,
        service.shortDescription,
        service.description,
        service.details,
        service.price,
        service.priceDisplay,
        service.duration,
        service.imageUrl,
        service.featured,
        service.active,
        service.displayOrder,
      ]);

      await db.execute(
        `INSERT INTO services (${columns.join(", ")}) VALUES ${placeholders}`,
        values,
      );
    }

    await db.commit();
    console.log(`Added ${missing.length} missing editable services from the website price lists.`);
  } catch (error) {
    await db.rollback();
    throw error;
  }
}

async function main() {
  const db = await mysql.createConnection({ uri: url, multipleStatements: false });

  try {
    // ---- Website settings (single row) ----
    await db.execute(
      `INSERT INTO site_settings (id, business_name, email, whatsapp_number,
         whatsapp_display, whatsapp_message, location, hours,
         instagram_makeup_handle, instagram_makeup_url,
         instagram_nails_handle, instagram_nails_url,
         home_title, home_description, footer_text)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id = id`,
      [
        SETTINGS.businessName,
        SETTINGS.email,
        SETTINGS.whatsappNumber,
        SETTINGS.whatsappDisplay,
        SETTINGS.whatsappMessage,
        SETTINGS.location,
        SETTINGS.hours,
        SETTINGS.instagramMakeupHandle,
        SETTINGS.instagramMakeupUrl,
        SETTINGS.instagramNailsHandle,
        SETTINGS.instagramNailsUrl,
        SETTINGS.homeTitle,
        SETTINGS.homeDescription,
        SETTINGS.footerText,
      ],
    );

    await db.execute(
      `UPDATE site_settings
       SET home_title = IF(home_title = ?, ?, home_title),
           home_description = IF(home_description = ?, ?, home_description)
       WHERE id = 1`,
      [
        "Needa Beauty Lab | Toronto Nail Technician",
        SETTINGS.homeTitle,
        LEGACY_HOME_DESCRIPTION,
        SETTINGS.homeDescription,
      ],
    );

    // ---- Artist profile (single row) ----
    await db.execute(
      `INSERT INTO artist_profile (id, name, short_bio, bio, location, instagram)
       VALUES (1, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id = id`,
      [
        ARTIST.name,
        ARTIST.shortBio,
        ARTIST.bio,
        ARTIST.location,
        ARTIST.instagram,
      ],
    );

    // ---- Gallery (only when the table is empty) ----
    const [[galleryCount]] = await db.query(
      "SELECT COUNT(*) AS count FROM gallery_items",
    );

    if (galleryCount.count === 0) {
      let order = 10;
      for (const [imageUrl, title, category, altText] of GALLERY) {
        await db.execute(
          `INSERT INTO gallery_items (image_url, title, alt_text, category, active, display_order)
           VALUES (?, ?, ?, ?, true, ?)`,
          [imageUrl, title, altText, category, order],
        );
        order += 10;
      }
      console.log(`Seeded ${GALLERY.length} gallery images.`);
    } else {
      console.log(`Gallery already seeded (${galleryCount.count} rows) — skipped.`);
    }

    // ---- Editable price list (only when the table is empty) ----
    await seedServices(db);

    console.log("Seed complete.");
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
