/**
 * Makeup by Needa automated setup script.
 *
 * 1. Verifies database connection.
 * 2. Ensures hair services with subcategories and price list are seeded/upserted.
 * 3. Safe and idempotent — does not duplicate services if they exist.
 *
 * Usage: node scripts/setup.mjs
 */
import "dotenv/config";
import mysql from "mysql2/promise";
import { execSync } from "child_process";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (see .env.example).");
  process.exit(1);
}

// Canonical hair services menu sections
const HAIR_SECTIONS = [
  {
    id: "everyday",
    title: "Everyday Hair Services",
    items: [
      {
        name: "Hair Wash & Blow-Dry",
        price: "$45+",
        description:
          "Includes shampoo, conditioning and professional blow-dry styling.",
      },
      {
        name: "Blowout",
        price: "$50+",
        description: "Smooth, voluminous or bouncy blowout.",
      },
      {
        name: "Straight Hair Styling",
        price: "$50+",
        description:
          "Professional heat styling for a sleek, polished finish.",
      },
      {
        name: "Soft Curls / Beach Waves",
        price: "$55+",
        description: "Loose, romantic curls or effortless textured waves.",
      },
      {
        name: "Glam / Hollywood Waves",
        price: "$75+",
        description:
          "Classic, sculpted, red-carpet-worthy waves with high-gloss finish.",
      },
      {
        name: "Half-Up, Half-Down Styling",
        price: "$70+",
        description:
          "Softly pinned with volume at the crown and falling curls.",
      },
    ],
  },
  {
    id: "event",
    title: "Event Hairstyling",
    items: [
      {
        name: "Messy Textured Bun",
        price: "$80+",
        description: "Modern, effortless updo with face-framing pieces.",
      },
      {
        name: "Sleek Low Bun",
        price: "$80+",
        description: "Clean, elegant, center or side-parted polished low bun.",
      },
      {
        name: "High Bun / Top Knot",
        price: "$85+",
        description: "Voluminous high bun with neat or textured styling.",
      },
      {
        name: "Textured Ponytail",
        price: "$75+",
        description:
          "Voluminous ponytail with soft waves and wrapped base.",
      },
      {
        name: "Sleek High / Low Ponytail",
        price: "$70+",
        description: "Smooth, snatched ponytail with high-shine finish.",
      },
      {
        name: "French Twist / Classic Chignon",
        price: "$90+",
        description:
          "Timeless, sophisticated updo for galas and formal events.",
      },
      {
        name: "Boho Braided Updo",
        price: "$95+",
        description:
          "Braids woven into a textured, romantic low or high bun.",
      },
      {
        name: "Vintage / Retro Waves",
        price: "$90+",
        description: "Precision finger waves or 1920s–1950s inspired styling.",
      },
      {
        name: "Side-Swept Curls / Hollywood Glam",
        price: "$85+",
        description:
          "Dramatic one-shoulder waves pinned securely with gloss.",
      },
    ],
  },
  {
    id: "bridal",
    title: "Bridal Hairstyling",
    items: [
      {
        name: "Bridal Hair Trial",
        price: "$90+",
        description:
          "90-minute consultation and styling session to design your wedding-day look.",
        details: [
          "Includes 1–2 style variations",
          "Veil & accessory placement trial",
          "Hair prep recommendations",
        ],
      },
      {
        name: "Bridal Updo (Wedding Day)",
        price: "$120+",
        description:
          "Signature bridal updo customized to your dress neckline, veil and personal style.",
        details: [
          "Intricate low or high bun, chignon or textured romantic updo",
          "Padding & structural support included if needed",
          "Veil placement & secure accessory setting",
          "Long-lasting hold for all-day wear",
        ],
      },
      {
        name: "Bridal Down / Half-Up Styling",
        price: "$110+",
        description:
          "Hollywood waves, romantic curls or half-up styling with volume and shine.",
        details: [
          "Extensions clipped in & blended (client provides extensions)",
          "Accessory & veil setting included",
        ],
      },
      {
        name: "South Asian Bridal Hair",
        price: "$140+",
        description:
          "Specialized styling designed to support heavy dupattas, maang tikka, matha patti and jewellery.",
        details: [
          "Extra structural padding & teasing",
          "Dupatta draping & pinning included",
          "Maang tikka / matha patti / passa placement",
          "Traditional or modern braided/bun finish",
        ],
      },
      {
        name: "Bridal Touch-Up Service (Per Hour)",
        price: "$50/hr",
        description:
          "On-site presence for veil change, reception look transition, photo touch-ups.",
      },
    ],
  },
  {
    id: "south-asian",
    title: "South Asian Hairstyling",
    items: [
      {
        name: "Dupatta Setting & Pinning",
        price: "$30+",
        description:
          "Secure, weight-balanced pinning for heavy embroidered or sheer dupattas.",
      },
      {
        name: "Jewellery Placement Only",
        price: "$25+",
        description:
          "Professional placement of maang tikka, matha patti, passa or sheeshpatti.",
      },
      {
        name: "Traditional Indian Braid",
        price: "$80+",
        description:
          "Thick, styled braid embellished with parandi, gotapatti or fresh flowers.",
      },
      {
        name: "Messy Bridal Braid",
        price: "$85+",
        description:
          "Modern loose, voluminous braid with baby's breath or floral pins.",
      },
      {
        name: "Heavy Bun for Dupatta Support",
        price: "$90+",
        description:
          "Reinforced donut/padding base engineered to carry heavy bridal dupattas without pulling.",
      },
      {
        name: "Saree Draping",
        price: "$35+",
        description:
          "Professional pleating and pinning (Nivi, Gujarati, Bengali or modern styles).",
      },
    ],
  },
  {
    id: "accessories",
    title: "Hair Accessories",
    items: [
      {
        name: "Floral Placement (Fresh / Artificial)",
        price: "$20+",
        description:
          "Gajra, baby's breath, rose buds or custom florals pinned seamlessly.",
      },
      {
        name: "Hair Accessory Placement",
        price: "$15+",
        description:
          "Vines, combs, tiaras, pearl pins or decorative hair clips set securely.",
      },
      {
        name: "Gajra Setting (Traditional)",
        price: "$20+",
        description:
          "Jasmine or floral garland wrapped around bun or woven along braid.",
      },
      {
        name: "Hair Brooch / Pearl Pin Detailing",
        price: "$15+",
        description:
          "Scattered or patterned placement throughout the hairstyle.",
      },
    ],
  },
  {
    id: "photoshoot",
    title: "Photoshoot & Fashion Hair",
    items: [
      {
        name: "Editorial / Fashion Hairstyling",
        price: "$85+",
        description:
          "High-fashion, creative or conceptual hair for portfolio or brand shoots.",
      },
      {
        name: "Maternity Photoshoot Hair",
        price: "$75+",
        description:
          "Soft, glowing waves or romantic half-up for maternity sessions.",
      },
      {
        name: "Graduation / Prom Hairstyling",
        price: "$75+",
        description:
          "Youthful, stylish curls, waves, half-up or sleek buns for milestone events.",
      },
    ],
  },
  {
    id: "extensions",
    title: "Hair Extensions",
    items: [
      {
        name: "Clip-In Extension Application & Blending",
        price: "$30+",
        description:
          "Professional placement, teasing and heat-styling blend (client provides extensions).",
      },
      {
        name: "Extension Styling (Pre-Washed)",
        price: "$40+",
        description:
          "Curling, straightening or wave styling of clip-in wefts before or during service.",
      },
      {
        name: "Halo / Wire Extension Placement",
        price: "$20+",
        description: "Seamless fitting and styling integration.",
      },
    ],
  },
  {
    id: "braids",
    title: "Braids & Special Styling",
    items: [
      {
        name: "Dutch Braids (2 Braids)",
        price: "$45+",
        description: "Clean, tight or pancaked Dutch braids.",
      },
      {
        name: "French Braid (Single / Double)",
        price: "$40+",
        description: "Classic French braiding for an active or neat look.",
      },
      {
        name: "Fishtail Braid",
        price: "$50+",
        description: "Intricate two-strand fishtail braid, sleek or textured.",
      },
      {
        name: "Waterfall Braid",
        price: "$50+",
        description: "Romantic cascading braid paired with soft curls.",
      },
      {
        name: "Crown / Halo Braid",
        price: "$65+",
        description:
          "Full wrap-around braided crown, elegant and boho-chic.",
      },
      {
        name: "Bubble Ponytail",
        price: "$55+",
        description:
          "Playful, voluminous segmented ponytail with hidden elastics.",
      },
      {
        name: "Pull-Through Braid",
        price: "$60+",
        description:
          "Faux-braid with maximum volume and density appearance.",
      },
    ],
  },
  {
    id: "add-ons",
    title: "Hair Add-Ons",
    items: [
      { name: "Hair Volume / Teasing", price: "+$15" },
      { name: "Hair Padding", price: "+$15" },
      { name: "Hair Extension Styling", price: "From $25" },
      { name: "Specialty Accessories", price: "From $15" },
      { name: "Extra-Long / Extra-Thick Hair", price: "From $15" },
      { name: "Additional Styling Time", price: "From $25" },
    ],
  },
  {
    id: "bridal-party",
    title: "Bridal Party Services",
    items: [
      { name: "Bridesmaid Hairstyling", price: "From $100/person" },
      { name: "Mother of Bride / Groom", price: "From $100/person" },
      { name: "Wedding Guest Hairstyling", price: "From $85/person" },
      { name: "Flower Girl Hairstyling", price: "From $50" },
      {
        name: "Bridal Party Hair Package",
        price: "Custom Quote",
        description:
          "Group packages can be created based on the number of people, services and getting-ready timeline.",
      },
    ],
  },
];

async function main() {
  console.log("→ Running Makeup by Needa setup…");

  // Step 1: Run Drizzle migrations
  try {
    console.log("→ Applying database migrations…");
    execSync("npm run db:migrate", { stdio: "inherit" });
    console.log("✓ Migrations applied successfully.");
  } catch (err) {
    console.warn("⚠ Note: migrations command had an output or was already up to date.");
  }

  // Step 2: Seed or upsert hair menu into services table
  console.log("→ Connecting to database to seed/upsert hair menu…");
  const db = await mysql.createConnection({ uri: url, multipleStatements: false });

  try {
    let order = 1000;
    let addedCount = 0;
    let updatedCount = 0;

    for (const section of HAIR_SECTIONS) {
      for (const item of section.items) {
        order += 10;
        const detailsStr = item.details ? item.details.join("\n") : null;

        // Check if service already exists by name and category
        const [existing] = await db.execute(
          "SELECT id, subcategory, price_display FROM services WHERE name = ? AND category = 'Hair' LIMIT 1",
          [item.name],
        );

        if (existing.length === 0) {
          await db.execute(
            `INSERT INTO services (name, category, subcategory, short_description,
               description, details, price_display, active, display_order)
             VALUES (?, 'Hair', ?, ?, ?, ?, ?, true, ?)`,
            [
              item.name,
              section.title,
              item.description || null,
              item.description || item.name,
              detailsStr,
              item.price,
              order,
            ],
          );
          addedCount += 1;
        } else {
          // Update subcategory and details if not set
          await db.execute(
            `UPDATE services
             SET subcategory = COALESCE(subcategory, ?),
                 price_display = COALESCE(price_display, ?),
                 details = COALESCE(details, ?)
             WHERE id = ?`,
            [section.title, item.price, detailsStr, existing[0].id],
          );
          updatedCount += 1;
        }
      }
    }

    console.log(
      `✓ Hair menu processed: ${addedCount} added, ${updatedCount} verified/updated.`,
    );
    console.log("✓ Setup complete!");
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error("✗ Setup failed:", err);
  process.exit(1);
});
