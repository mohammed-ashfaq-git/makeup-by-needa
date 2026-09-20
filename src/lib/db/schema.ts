/**
 * Drizzle ORM Schema for Makeup by Needa - MySQL Production
 * Designed for Hostinger Node.js deployment with persistent MySQL
 */

import {
  mysqlTable,
  varchar,
  text,
  boolean,
  int,
  decimal,
  datetime,
  tinyint,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// Enums
export const enquiryStatusEnum = mysqlEnum("enquiry_status", [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]);

export const serviceCategoryEnum = mysqlEnum("service_category", [
  "Makeup",
  "Hair",
  "Nails",
]);

export const galleryCategoryEnum = mysqlEnum("gallery_category", [
  "Makeup",
  "Bridal",
  "Hair",
  "Nails",
]);

// Admin User
export const adminUsers = mysqlTable("admin_users", {
  id: varchar("id", { length: 30 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: datetime("created_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// Site Settings
export const siteSettings = mysqlTable("site_settings", {
  id: varchar("id", { length: 30 }).primaryKey(),
  businessName: varchar("business_name", { length: 255 }).notNull().default("Makeup by Needa"),
  logo: varchar("logo", { length: 500 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  whatsappDisplay: varchar("whatsapp_display", { length: 50 }),
  whatsappMessage: text("whatsapp_message"),
  location: varchar("location", { length: 255 }),
  address: varchar("address", { length: 500 }),
  hours: varchar("hours", { length: 255 }),
  instagram: varchar("instagram", { length: 255 }),
  instagramUrl: varchar("instagram_url", { length: 500 }),
  instagramMakeup: varchar("instagram_makeup", { length: 255 }),
  instagramMakeupUrl: varchar("instagram_makeup_url", { length: 500 }),
  instagramNails: varchar("instagram_nails", { length: 255 }),
  instagramNailsUrl: varchar("instagram_nails_url", { length: 500 }),
  facebook: varchar("facebook", { length: 500 }),
  homepageTitle: text("homepage_title"),
  homepageDescription: text("homepage_description"),
  footerText: text("footer_text"),
  createdAt: datetime("created_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// Artist Profile
export const artistProfiles = mysqlTable("artist_profiles", {
  id: varchar("id", { length: 30 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().default("Needa"),
  profileImage: varchar("profile_image", { length: 500 }),
  shortBio: text("short_bio"),
  fullBio: text("full_bio"),
  experience: text("experience"),
  specialties: text("specialties"),
  qualifications: text("qualifications"),
  location: varchar("location", { length: 255 }),
  instagram: varchar("instagram", { length: 255 }),
  createdAt: datetime("created_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// Service
export const services = mysqlTable("services", {
  id: varchar("id", { length: 30 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  shortDescription: text("short_description"),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  priceText: varchar("price_text", { length: 255 }).default("Enquire for pricing"),
  duration: varchar("duration", { length: 255 }),
  image: varchar("image", { length: 500 }),
  category: serviceCategoryEnum.notNull(),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  displayOrder: int("display_order").notNull().default(0),
  createdAt: datetime("created_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// Gallery Image
export const galleryImages = mysqlTable("gallery_images", {
  id: varchar("id", { length: 30 }).primaryKey(),
  image: varchar("image", { length: 500 }).notNull(),
  title: varchar("title", { length: 255 }),
  caption: text("caption"),
  altText: varchar("alt_text", { length: 500 }),
  category: galleryCategoryEnum,
  active: boolean("active").notNull().default(true),
  displayOrder: int("display_order").notNull().default(0),
  createdAt: datetime("created_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// Testimonial
export const testimonials = mysqlTable("testimonials", {
  id: varchar("id", { length: 30 }).primaryKey(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  testimonial: text("testimonial").notNull(),
  rating: tinyint("rating").notNull().default(5),
  clientPhoto: varchar("client_photo", { length: 500 }),
  service: varchar("service", { length: 255 }),
  active: boolean("active").notNull().default(true),
  displayOrder: int("display_order").notNull().default(0),
  createdAt: datetime("created_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// FAQ
export const faqs = mysqlTable("faqs", {
  id: varchar("id", { length: 30 }).primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  active: boolean("active").notNull().default(true),
  displayOrder: int("display_order").notNull().default(0),
  createdAt: datetime("created_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// Enquiry
export const enquiries = mysqlTable("enquiries", {
  id: varchar("id", { length: 30 }).primaryKey(),
  enquiryNumber: varchar("enquiry_number", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  service: varchar("service", { length: 255 }),
  eventDate: datetime("event_date", { mode: "date" }),
  eventDateRaw: varchar("event_date_raw", { length: 100 }),
  preferredTime: varchar("preferred_time", { length: 100 }),
  location: varchar("location", { length: 255 }),
  people: int("people"),
  peopleRaw: varchar("people_raw", { length: 50 }),
  message: text("message").notNull(),
  status: enquiryStatusEnum.notNull().default("NEW"),
  createdAt: datetime("created_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// Types for TypeScript
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;

export type ArtistProfile = typeof artistProfiles.$inferSelect;
export type NewArtistProfile = typeof artistProfiles.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

export type FAQ = typeof faqs.$inferSelect;
export type NewFAQ = typeof faqs.$inferInsert;

export type Enquiry = typeof enquiries.$inferSelect;
export type NewEnquiry = typeof enquiries.$inferInsert;

export type EnquiryStatus = "NEW" | "CONTACTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type ServiceCategory = "Makeup" | "Hair" | "Nails";
export type GalleryCategory = "Makeup" | "Bridal" | "Hair" | "Nails";
