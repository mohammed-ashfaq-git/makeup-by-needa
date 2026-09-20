/**
 * Database Module - MySQL with Drizzle ORM (Primary)
 * Production-ready for Hostinger Node.js
 */

// Drizzle (Primary)
export { getDb, checkDatabaseConnection, disconnectDatabase } from "./client";
export { db } from "./client";
export * as schema from "./schema";
export { generateEnquiryNumber, generateSlug, generateUniqueSlug, safeDbOperation, generateId } from "./utils";

// Repositories
export * as siteSettingsRepo from "./repositories/site-settings";
export * as servicesRepo from "./repositories/services";
export * as galleryRepo from "./repositories/gallery";
export * as enquiriesRepo from "./repositories/enquiries";

// Types from Drizzle schema
export type {
  AdminUser,
  SiteSettings,
  ArtistProfile,
  Service,
  GalleryImage,
  Testimonial,
  FAQ,
  Enquiry,
  EnquiryStatus,
  ServiceCategory,
  GalleryCategory,
} from "./schema";

// Optional Prisma export for backward compatibility (may be null in offline build)
export let prisma: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const clientModule = require("./client");
  prisma = clientModule.prisma || null;
} catch {
  prisma = null;
}
