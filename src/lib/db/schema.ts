/**
 * Database schema for Makeup by Needa (MySQL, via Drizzle ORM).
 *
 * Conventions:
 * - snake_case column names in MySQL, camelCase in TypeScript.
 * - Datetimes are stored/read as strings ("YYYY-MM-DD HH:MM:SS") to avoid
 *   timezone conversion surprises; dates as "YYYY-MM-DD".
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  date,
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/** LONGBLOB column (raw bytes for uploaded images). */
const longblob = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "longblob";
  },
});

/* ------------------------------------------------------------------ */
/* Admin authentication                                                */
/* ------------------------------------------------------------------ */

export const adminUsers = mysqlTable(
  "admin_users",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    /** bcrypt hash. Never exposed to the client. */
    passwordHash: varchar("password_hash", { length: 100 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP`),
    lastLoginAt: datetime("last_login_at", { mode: "string" }),
  },
  (table) => [uniqueIndex("admin_users_email_unique").on(table.email)],
);

/**
 * Admin sessions. The cookie stores a random token; only its SHA-256
 * hash is persisted, so a database leak cannot be replayed as a login.
 */
export const adminSessions = mysqlTable(
  "admin_sessions",
  {
    tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
    adminId: int("admin_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: datetime("expires_at", { mode: "string" }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("admin_sessions_admin_id_idx").on(table.adminId)],
);

/* ------------------------------------------------------------------ */
/* Website settings (single row, id = 1)                               */
/* ------------------------------------------------------------------ */

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").primaryKey(),
  businessName: varchar("business_name", { length: 160 }).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }),
  /** Homepage hero image. NULL → the first active gallery image is used. */
  heroImageUrl: varchar("hero_image_url", { length: 500 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }).notNull(),
  whatsappNumber: varchar("whatsapp_number", { length: 30 }).notNull(),
  whatsappDisplay: varchar("whatsapp_display", { length: 50 }).notNull(),
  whatsappMessage: varchar("whatsapp_message", { length: 500 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  address: varchar("address", { length: 255 }),
  hours: varchar("hours", { length: 255 }),
  instagramMakeupHandle: varchar("instagram_makeup_handle", {
    length: 120,
  }).notNull(),
  instagramMakeupUrl: varchar("instagram_makeup_url", { length: 500 }).notNull(),
  instagramNailsHandle: varchar("instagram_nails_handle", {
    length: 120,
  }).notNull(),
  instagramNailsUrl: varchar("instagram_nails_url", { length: 500 }).notNull(),
  facebookUrl: varchar("facebook_url", { length: 500 }),
  homeTitle: varchar("home_title", { length: 255 }).notNull(),
  homeDescription: varchar("home_description", { length: 500 }).notNull(),
  footerText: varchar("footer_text", { length: 500 }).notNull(),
  updatedAt: datetime("updated_at", { mode: "string" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP`),
});

/* ------------------------------------------------------------------ */
/* Artist / bio (single row, id = 1)                                   */
/* ------------------------------------------------------------------ */

export const artistProfile = mysqlTable("artist_profile", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  photoUrl: varchar("photo_url", { length: 500 }),
  shortBio: varchar("short_bio", { length: 500 }).notNull(),
  bio: text("bio").notNull(),
  /** Free text; lines are rendered as a list. */
  experience: varchar("experience", { length: 255 }),
  specialties: text("specialties"),
  qualifications: text("qualifications"),
  location: varchar("location", { length: 120 }),
  instagram: varchar("instagram", { length: 160 }),
  updatedAt: datetime("updated_at", { mode: "string" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP`),
});

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

/** DECIMAL(10,2) read back as a string to avoid float issues. */
const decimal = customType<{ data: string; driverData: string }>({
  dataType() {
    return "decimal(10,2)";
  },
});

export const services = mysqlTable(
  "services",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    category: mysqlEnum("category", ["Makeup", "Hair", "Nails"]).notNull(),
    subcategory: varchar("subcategory", { length: 160 }),
    shortDescription: varchar("short_description", { length: 300 }),
    description: text("description").notNull(),
    details: text("details"),
    /** Numeric price in CAD. NULL means "Enquire for pricing". */
    price: decimal("price"),
    /** Optional custom price text, e.g. "From $120" or "Enquire for pricing". */
    priceDisplay: varchar("price_display", { length: 100 }),
    duration: varchar("duration", { length: 100 }),
    imageUrl: varchar("image_url", { length: 500 }),
    featured: boolean("featured").notNull().default(false),
    active: boolean("active").notNull().default(true),
    displayOrder: int("display_order").notNull().default(0),
    createdAt: datetime("created_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP`),
  },
  (table) => [index("services_display_order_idx").on(table.displayOrder)],
);

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export const galleryItems = mysqlTable(
  "gallery_items",
  {
    id: int("id").autoincrement().primaryKey(),
    imageUrl: varchar("image_url", { length: 500 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    caption: varchar("caption", { length: 300 }),
    altText: varchar("alt_text", { length: 200 }),
    category: mysqlEnum("category", ["Makeup", "Bridal", "Hair", "Nails"]).notNull(),
    mediaType: mysqlEnum("media_type", ["image", "video"]).notNull().default("image"),
    videoUrl: varchar("video_url", { length: 700 }),
    active: boolean("active").notNull().default(true),
    displayOrder: int("display_order").notNull().default(0),
    createdAt: datetime("created_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP`),
  },
  (table) => [index("gallery_display_order_idx").on(table.displayOrder)],
);

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

export const testimonials = mysqlTable(
  "testimonials",
  {
    id: int("id").autoincrement().primaryKey(),
    clientName: varchar("client_name", { length: 120 }).notNull(),
    quote: text("quote").notNull(),
    /** 1 to 5. */
    rating: tinyint("rating").notNull().default(5),
    photoUrl: varchar("photo_url", { length: 500 }),
    service: varchar("service", { length: 160 }),
    active: boolean("active").notNull().default(true),
    displayOrder: int("display_order").notNull().default(0),
    createdAt: datetime("created_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP`),
  },
  (table) => [index("testimonials_display_order_idx").on(table.displayOrder)],
);

/* ------------------------------------------------------------------ */
/* FAQs                                                                */
/* ------------------------------------------------------------------ */

export const faqs = mysqlTable(
  "faqs",
  {
    id: int("id").autoincrement().primaryKey(),
    question: varchar("question", { length: 300 }).notNull(),
    answer: text("answer").notNull(),
    active: boolean("active").notNull().default(true),
    displayOrder: int("display_order").notNull().default(0),
    createdAt: datetime("created_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP`),
  },
  (table) => [index("faqs_display_order_idx").on(table.displayOrder)],
);

/* ------------------------------------------------------------------ */
/* Enquiries (no calendar / no bookings — enquiry management only)     */
/* ------------------------------------------------------------------ */

export const ENQUIRY_STATUSES = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const enquiries = mysqlTable(
  "enquiries",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Human-friendly reference, e.g. ENQ-0042. */
    enquiryNumber: varchar("enquiry_number", { length: 20 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    service: varchar("service", { length: 200 }).notNull(),
    eventDate: date("event_date", { mode: "string" }).notNull(),
    eventTime: varchar("event_time", { length: 60 }),
    location: varchar("location", { length: 160 }).notNull(),
    people: varchar("people", { length: 40 }),
    message: text("message").notNull(),
    status: mysqlEnum("status", [...ENQUIRY_STATUSES])
      .notNull()
      .default("NEW"),
    createdAt: datetime("created_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("enquiries_number_unique").on(table.enquiryNumber),
    index("enquiries_status_idx").on(table.status),
    index("enquiries_created_at_idx").on(table.createdAt),
  ],
);

/* ------------------------------------------------------------------ */
/* Uploaded images (stored in the database, served via /api/images/:id) */
/* ------------------------------------------------------------------ */

export const siteImages = mysqlTable("site_images", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 60 }).notNull(),
  byteSize: int("byte_size").notNull(),
  data: longblob("data").notNull(),
  createdAt: timestamp("created_at", { mode: "string" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/* ------------------------------------------------------------------ */
/* Inferred types                                                      */
/* ------------------------------------------------------------------ */

export type AdminUserRow = typeof adminUsers.$inferSelect;
export type SiteSettingsRow = typeof siteSettings.$inferSelect;
export type ArtistProfileRow = typeof artistProfile.$inferSelect;
export type ServiceRow = typeof services.$inferSelect;
export type GalleryItemRow = typeof galleryItems.$inferSelect;
export type TestimonialRow = typeof testimonials.$inferSelect;
export type FaqRow = typeof faqs.$inferSelect;
export type EnquiryRow = typeof enquiries.$inferSelect;
export type SiteImageRow = typeof siteImages.$inferSelect;
