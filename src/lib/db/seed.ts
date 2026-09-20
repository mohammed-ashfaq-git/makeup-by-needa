/**
 * Database Seed Script - Drizzle ORM + MySQL
 * Migrates existing hardcoded content from src/config/site.ts
 * Preserves existing website content, does NOT invent fake data
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import * as schema from "./schema";
import { business, services as hardcodedServices, galleryImages as hardcodedGalleryImages, galleryItems } from "@/config/site";
import { generateSlug, generateId } from "./utils";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set. Please set it in .env.local");
    console.error("   Example: DATABASE_URL=\"mysql://user:password@localhost:3306/makeup_by_needa\"");
    process.exit(1);
  }

  console.log("🌱 Starting database seed with Drizzle ORM...\n");
  console.log(`📡 Connecting to MySQL...`);

  const pool = mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 10,
  });

  const db = drizzle(pool, { schema, mode: "default" });

  try {
    // Test connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("✅ MySQL connected\n");
  } catch (error) {
    console.error("❌ Failed to connect to MySQL:", error);
    process.exit(1);
  }

  // ============================================================
  // 1. Site Settings
  // ============================================================
  console.log("📋 Seeding Site Settings...");

  const existingSettings = await db.select().from(schema.siteSettings).limit(1);

  if (existingSettings.length === 0) {
    await db.insert(schema.siteSettings).values({
      id: generateId(),
      businessName: business.name,
      logo: "/makeup-by-needa-logo.jpg",
      phone: business.whatsappDisplay,
      email: business.email,
      whatsapp: business.whatsapp,
      whatsappDisplay: business.whatsappDisplay,
      whatsappMessage: business.whatsappMessage,
      location: business.location,
      address: business.address,
      hours: business.hours,
      instagram: business.instagramMakeup,
      instagramUrl: business.instagramMakeupUrl,
      instagramMakeup: business.instagramMakeup,
      instagramMakeupUrl: business.instagramMakeupUrl,
      instagramNails: business.instagramNails,
      instagramNailsUrl: business.instagramNailsUrl,
      facebook: null,
      homepageTitle: "Beauty, artistry & confidence — created just for you.",
      homepageDescription:
        "Thoughtfully tailored beauty artistry for bridal moments, celebrations, photographs, and every occasion worth remembering.",
      footerText: "Thoughtful beauty artistry for the moments that matter. Based in Toronto, Canada.",
    });
    console.log("✅ Site Settings created");
  } else {
    console.log("⏭️  Site Settings already exists, skipping");
  }

  // ============================================================
  // 2. Artist Profile
  // ============================================================
  console.log("\n👩‍🎨 Seeding Artist Profile...");

  const existingProfile = await db.select().from(schema.artistProfiles).limit(1);

  if (existingProfile.length === 0) {
    await db.insert(schema.artistProfiles).values({
      id: generateId(),
      name: "Needa",
      profileImage: null,
      shortBio: "Toronto-based beauty artist specializing in bridal, event, and editorial looks.",
      fullBio:
        "Makeup by Needa is a Toronto-based beauty artistry studio specializing in bridal, event, and editorial looks across makeup, hair styling, and nail art. Each appointment is approached with care, listening to your vision and tailoring every detail to your personal style. From soft, luminous finishes to beautifully defined glamour, the focus is always on creating a polished result that feels comfortable, considered, and entirely your own.",
      experience: "Professional makeup, hair and nail artist based in Toronto, Canada.",
      specialties: "Bridal Makeup, Hair Styling, Nail Art, Event Makeup, Photoshoot Makeup",
      qualifications: "Professional beauty artistry",
      location: business.location,
      instagram: business.instagramMakeup,
    });
    console.log("✅ Artist Profile created");
  } else {
    console.log("⏭️  Artist Profile already exists, skipping");
  }

  // ============================================================
  // 3. Services - 22 services
  // ============================================================
  console.log("\n💄 Seeding Services (22 services)...");

  const existingServices = await db.select({ count: schema.services.id }).from(schema.services);
  const existingServicesCount = existingServices.length;

  if (existingServicesCount === 0) {
    const slugSet = new Set<string>();
    let displayOrder = 0;

    for (const svc of hardcodedServices) {
      const slug = await generateUniqueSlugForSeed(svc.name, slugSet);
      const category = svc.category as "Makeup" | "Hair" | "Nails";

      await db.insert(schema.services).values({
        id: generateId(),
        name: svc.name,
        slug,
        shortDescription: svc.description,
        description: svc.description,
        price: null,
        priceText: svc.price || "Enquire for pricing",
        duration: svc.duration || "Duration available on enquiry",
        image: null,
        category,
        featured: svc.featured || false,
        active: true,
        displayOrder: displayOrder++,
      });
    }

    console.log(`✅ ${hardcodedServices.length} Services created`);
  } else {
    console.log(`⏭️  Services already exist (${existingServicesCount} found), skipping`);
  }

  // ============================================================
  // 4. Gallery Images - 4 real images only
  // ============================================================
  console.log("\n🖼️  Seeding Gallery Images (4 real images)...");

  const existingGallery = await db.select().from(schema.galleryImages);
  
  if (existingGallery.length === 0) {
    let order = 0;

    for (const img of hardcodedGalleryImages) {
      await db.insert(schema.galleryImages).values({
        id: generateId(),
        image: img.src,
        title: img.title,
        caption: `${img.title} - Makeup by Needa`,
        altText: `${img.title} - Makeup by Needa beauty artistry`,
        category: img.category as "Makeup" | "Bridal" | "Hair" | "Nails",
        active: true,
        displayOrder: order++,
      });
    }

    console.log(`✅ ${hardcodedGalleryImages.length} Real Gallery Images created`);
    console.log(`ℹ️  ${galleryItems.length} placeholder items identified for replacement - NOT seeded as fake photos`);
    console.log("   Placeholders: Soft glamour, Bridal glow, Modern details, Celebration styling, Evening beauty, Bridal artistry");
  } else {
    console.log(`⏭️  Gallery Images already exist (${existingGallery.length} found), skipping`);
  }

  // ============================================================
  // 5. Testimonials
  // ============================================================
  console.log("\n⭐ Seeding Testimonials...");

  const existingTestimonials = await db.select().from(schema.testimonials);

  if (existingTestimonials.length === 0) {
    await db.insert(schema.testimonials).values([
      {
        id: generateId(),
        clientName: "Sample Client",
        testimonial:
          "Needa created the most beautiful bridal look for my wedding day. Thoughtful, professional, and truly talented.",
        rating: 5,
        service: "Bridal Makeup",
        active: false,
        displayOrder: 0,
      },
      {
        id: generateId(),
        clientName: "Sample Client",
        testimonial:
          "Amazing attention to detail and such a calm, comfortable experience. My makeup lasted all day and photographed beautifully.",
        rating: 5,
        service: "Party / Event Makeup",
        active: false,
        displayOrder: 1,
      },
    ]);
    console.log("✅ 2 Sample Testimonials created (inactive)");
  } else {
    console.log(`⏭️  Testimonials already exist (${existingTestimonials.length} found), skipping`);
  }

  // ============================================================
  // 6. FAQ
  // ============================================================
  console.log("\n❓ Seeding FAQs...");

  const existingFaqs = await db.select().from(schema.faqs);

  if (existingFaqs.length === 0) {
    await db.insert(schema.faqs).values([
      {
        id: generateId(),
        question: "How do I book an appointment?",
        answer:
          "You can book by filling out the enquiry form on the Book page or contacting directly via WhatsApp or Instagram. Share your event date, preferred service, and location, and Needa will confirm availability.",
        active: true,
        displayOrder: 0,
      },
      {
        id: generateId(),
        question: "Do you travel for bridal appointments?",
        answer:
          "Yes, travel can be arranged for bridal and event appointments in Toronto and surrounding areas. Location details can be discussed during your enquiry.",
        active: true,
        displayOrder: 1,
      },
      {
        id: generateId(),
        question: "What services do you offer?",
        answer:
          "Makeup artistry (bridal, engagement, reception, party, photoshoot, custom), hair styling (bridal, engagement, reception, party, soft curls, updos, sleek styling), and nail artistry (classic, bridal, French tips, gel, extensions, custom, minimal, luxury).",
        active: true,
        displayOrder: 2,
      },
      {
        id: generateId(),
        question: "How far in advance should I book?",
        answer:
          "For bridal bookings, it's recommended to enquire 3-6 months in advance, especially during peak wedding season. For events and parties, 2-4 weeks notice is ideal.",
        active: true,
        displayOrder: 3,
      },
    ]);
    console.log("✅ 4 FAQs created");
  } else {
    console.log(`⏭️  FAQs already exist (${existingFaqs.length} found), skipping`);
  }

  // ============================================================
  // 7. Admin User
  // ============================================================
  console.log("\n🔐 Checking Admin User...");

  const adminUsers = await db.select().from(schema.adminUsers);

  if (adminUsers.length === 0) {
    console.log("ℹ️  No admin user found.");
    console.log("   To create initial admin, set ADMIN_EMAIL and ADMIN_PASSWORD env vars and run seed,");
    console.log("   or use the secure setup endpoint /api/admin/setup with ADMIN_SETUP_SECRET");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      await db.insert(schema.adminUsers).values({
        id: generateId(),
        name: "Admin",
        email: adminEmail.toLowerCase().trim(),
        passwordHash: hashedPassword,
      });

      console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
      console.log("⏭️  Skipping admin creation (no ADMIN_EMAIL/ADMIN_PASSWORD env)");
    }
  } else {
    console.log(`⏭️  Admin user already exists (${adminUsers.length} found), skipping`);
  }

  // Summary
  const finalCounts = {
    siteSettings: (await db.select().from(schema.siteSettings)).length,
    artistProfiles: (await db.select().from(schema.artistProfiles)).length,
    services: (await db.select().from(schema.services)).length,
    galleryImages: (await db.select().from(schema.galleryImages)).length,
    testimonials: (await db.select().from(schema.testimonials)).length,
    faqs: (await db.select().from(schema.faqs)).length,
    adminUsers: (await db.select().from(schema.adminUsers)).length,
    enquiries: (await db.select().from(schema.enquiries)).length,
  };

  console.log("\n🎉 Database seeding completed!\n");
  console.log("Summary:");
  console.log(`- Site Settings: ${finalCounts.siteSettings}`);
  console.log(`- Artist Profiles: ${finalCounts.artistProfiles}`);
  console.log(`- Services: ${finalCounts.services}`);
  console.log(`- Gallery Images: ${finalCounts.galleryImages} (real images only)`);
  console.log(`- Testimonials: ${finalCounts.testimonials}`);
  console.log(`- FAQs: ${finalCounts.faqs}`);
  console.log(`- Admin Users: ${finalCounts.adminUsers}`);
  console.log(`- Enquiries: ${finalCounts.enquiries}`);

  await pool.end();
}

async function generateUniqueSlugForSeed(name: string, slugSet: Set<string>): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (slugSet.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  slugSet.add(slug);
  return slug;
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
