/**
 * Database seed — one-time bootstrap of CMS content.
 *
 * Seeds the website settings, artist profile, services and the four real
 * gallery images, mirroring the static configuration in
 * src/lib/site-data.ts so the public website looks exactly the same as
 * before, but now driven by the database.
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

const DESCRIPTION =
  "A tailored service designed around your occasion, preferred finish, and personal style.";

/** display_order is chosen so the first four featured services match the
 *  current homepage selection, and the footer shows six featured services. */
const SERVICES = [
  // name, category, displayOrder, featured
  ["Bridal Makeup", "Makeup", 10, true],
  ["Bridal Hair Styling", "Hair", 20, true],
  ["Bridal Nail Art", "Nails", 30, true],
  ["Soft Curls & Waves", "Hair", 40, true],
  ["Engagement Makeup", "Makeup", 50, true],
  ["Engagement Hair", "Hair", 60, true],
  ["Reception Makeup", "Makeup", 70, false],
  ["Reception Hair", "Hair", 80, false],
  ["Party / Event Makeup", "Makeup", 90, false],
  ["Party / Event Hair", "Hair", 100, false],
  ["Photoshoot Makeup", "Makeup", 110, false],
  ["Elegant Updo", "Hair", 120, false],
  ["Sleek Hair Styling", "Hair", 130, false],
  ["Custom Makeup", "Makeup", 140, false],
  ["Custom Hair Styling", "Hair", 150, false],
  ["Classic Nail Art", "Nails", 160, false],
  ["French Tips", "Nails", 170, false],
  ["Gel Nails", "Nails", 180, false],
  ["Nail Extensions", "Nails", 190, false],
  ["Custom Nail Art", "Nails", 200, false],
  ["Minimal Nail Art", "Nails", 210, false],
  ["Luxury Nail Art", "Nails", 220, false],
];

/** The four real portfolio images currently on the website. */
const GALLERY = [
  [
    "/images/makeup-by-needa-hero.jpg",
    "Signature beauty",
    "Makeup",
    "Signature beauty look by Makeup by Needa",
  ],
  [
    "/images/Glamorous-Makeup-Artistry.jpg",
    "Glamorous makeup artistry",
    "Makeup",
    "Glamorous makeup artistry by Makeup by Needa",
  ],
  [
    "/images/makeup-by-needa-portfolio-01.jpg",
    "Makeup artistry",
    "Makeup",
    "Makeup artistry portfolio piece by Makeup by Needa",
  ],
  [
    "/images/makeup-by-needa-portfolio-02.jpg",
    "Beauty details",
    "Makeup",
    "Beauty details portfolio piece by Makeup by Needa",
  ],
];

const SETTINGS = {
  businessName: "Makeup by Needa",
  email: "aurastudioneeda@gmail.com",
  whatsappNumber: "15483287786",
  whatsappDisplay: "+1 548 328 7786",
  whatsappMessage:
    "Hi Makeup by Needa, I\u2019d like to enquire about your services.",
  location: "Toronto, Canada",
  hours: "By appointment",
  instagramMakeupHandle: "@makeupbynee_",
  instagramMakeupUrl: "https://www.instagram.com/makeupbynee_/",
  instagramNailsHandle: "@nailsbyneeda",
  instagramNailsUrl: "https://www.instagram.com/nailsbyneeda/",
  homeTitle: "Makeup by Needa | Toronto Makeup Artist",
  homeDescription: "Makeup, hair and nail artistry in Toronto, Canada.",
  footerText: "Makeup by Needa. All rights reserved.",
};

const ARTIST = {
  name: "Needa",
  shortBio:
    "A personal approach to makeup, hair styling, and nail art, thoughtfully designed around your features, your occasion, and the way you want to feel.",
  bio: "Hi, I'm Needa — a makeup, hair and nail artist based in Toronto. My work is built around a simple belief: beauty should feel personal, never templated.\n\n\n\nEvery appointment begins with a conversation — your occasion, your features, your outfit, and above all, the way you want to feel when you walk out the door. From there, the look is designed around you: softly luminous bridal makeup, defined evening glamour, romantic waves, sleek finished hair, or nail art detailed to complete the story.\n\n\n\nWhether it is your wedding morning, an engagement celebration, a reception, or a portrait session, the intention stays the same — a polished, enduring finish that still feels entirely like you.",
  location: "Toronto, Canada",
  instagram: "@makeupbynee_",
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

    // ---- Services (only when the table is empty) ----
    const [[serviceCount]] = await db.query(
      "SELECT COUNT(*) AS count FROM services",
    );

    if (serviceCount.count === 0) {
      for (const [name, category, order, featured] of SERVICES) {
        await db.execute(
          `INSERT INTO services (name, category, short_description, description,
             price, price_display, duration, featured, active, display_order)
           VALUES (?, ?, NULL, ?, NULL, NULL, 'Duration available on enquiry', ?, true, ?)`,
          [name, category, DESCRIPTION, featured, order],
        );
      }
      console.log(`Seeded ${SERVICES.length} services.`);
    } else {
      console.log(`Services already seeded (${serviceCount.count} rows) — skipped.`);
    }

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
