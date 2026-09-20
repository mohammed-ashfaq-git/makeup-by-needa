/**
 * CMS Module
 * Content management for Makeup by Needa
 * MySQL-backed with fallback to hardcoded config
 */

export * from "./content";

export const cmsInfo = {
  isConfigured: true,
  database: "MySQL with Prisma",
  contentTypes: ["business", "services", "gallery", "artist", "testimonials", "faqs", "enquiries"],
  features: ["MySQL persistence", "Admin auth", "Image management", "Enquiry tracking"],
};
