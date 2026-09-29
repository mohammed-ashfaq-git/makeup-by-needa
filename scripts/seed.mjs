/**
 * Database seed — one-time bootstrap of CMS content.
 *
 * Seeds the website settings, artist profile and the four real gallery
 * images, mirroring the static configuration in src/lib/site-data.ts.
 *
 * Services are not seeded: the public website publishes the nail price list
 * from src/lib/nail-services.ts, not from the services table.
 *
 * Idempotent: it never overwrites rows that already exist, so it is safe
 * to re-run.
 *
 * Usage: npm run db:seed
 */
import "dotenv/config";
import mysql from "mysql2/promise";

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
  homeTitle: "Needa Beauty Lab | Toronto Nail Technician",
  homeDescription:
    "Premium nail services in Toronto, Canada \u2014 gel polish, extensions, nail art, premium finishes and signature sets.",
  footerText: "Needa Beauty Lab. All rights reserved.",
};

const ARTIST = {
  name: "Needa",
  shortBio:
    "A personal approach to nail care and nail design, thoughtfully shaped around your style, your occasion, and the way you want to feel.",
  bio: "Hi, I'm Needa \u2014 the nail technician behind Needa Beauty Lab in Toronto. My work is built around a simple belief: beauty should feel personal, never templated.\n\nEvery appointment begins with a conversation \u2014 your style, your occasion, your preferred length and shape, and the finish you have in mind. From there, each set is designed around you: a clean gel manicure, soft French tips, glossy chrome or cat eye, lightweight extensions, or detailed nail art finished with charms and 3D details.\n\nWhether it is an everyday refresh, a celebration, or a special event, the intention stays the same \u2014 a polished, long-lasting finish that still feels entirely like you.",
  location: "Toronto, Canada",
  instagram: "@nailsbyneeda",
};

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

    console.log("Seed complete.");
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
