/**
 * CMS Content Fetcher - Drizzle + MySQL
 * Tries DB first, falls back to hardcoded config
 */

import { getDb } from "@/lib/db/client";
import { siteSettings, services as servicesTable, galleryImages as galleryImagesTable } from "@/lib/db/schema";
import { business as hardcodedBusiness, services as hardcodedServices, galleryImages as hardcodedGalleryImages } from "@/config/site";
import type { BusinessInfo, Service } from "@/types";
import { safeDbOperation } from "@/lib/db/utils";
import { asc, desc, eq } from "drizzle-orm";

export async function getBusinessInfo(): Promise<BusinessInfo> {
  return safeDbOperation(
    async () => {
      const db = getDb();
      if (!db) return hardcodedBusiness;

      const settings = await db.select().from(siteSettings).orderBy(asc(siteSettings.createdAt)).limit(1);

      if (settings.length === 0) {
        return hardcodedBusiness;
      }

      const s = settings[0];

      return {
        name: s.businessName || hardcodedBusiness.name,
        location: s.location || hardcodedBusiness.location,
        email: s.email || hardcodedBusiness.email,
        address: s.address || hardcodedBusiness.address,
        hours: s.hours || hardcodedBusiness.hours,
        whatsapp: s.whatsapp || hardcodedBusiness.whatsapp,
        whatsappDisplay: s.whatsappDisplay || hardcodedBusiness.whatsappDisplay,
        whatsappMessage: s.whatsappMessage || hardcodedBusiness.whatsappMessage,
        instagramMakeup: s.instagramMakeup || hardcodedBusiness.instagramMakeup,
        instagramMakeupUrl: s.instagramMakeupUrl || hardcodedBusiness.instagramMakeupUrl,
        instagramNails: s.instagramNails || hardcodedBusiness.instagramNails,
        instagramNailsUrl: s.instagramNailsUrl || hardcodedBusiness.instagramNailsUrl,
        instagramAccounts: hardcodedBusiness.instagramAccounts,
      };
    },
    hardcodedBusiness,
    "Failed to fetch business info from DB"
  );
}

export async function getServices(activeOnly = true): Promise<Service[]> {
  return safeDbOperation(
    async () => {
      const db = getDb();
      if (!db) return hardcodedServices;

      let dbServices;

      if (activeOnly) {
        dbServices = await db
          .select()
          .from(servicesTable)
          .where(eq(servicesTable.active, true))
          .orderBy(asc(servicesTable.displayOrder), asc(servicesTable.name));
      } else {
        dbServices = await db
          .select()
          .from(servicesTable)
          .orderBy(asc(servicesTable.displayOrder), asc(servicesTable.name));
      }

      if (dbServices.length === 0) {
        return hardcodedServices;
      }

      return dbServices.map((s) => ({
        name: s.name,
        category: s.category as Service["category"],
        description: s.description,
        price: s.priceText || (s.price ? `$${s.price}` : "Enquire for pricing"),
        duration: s.duration || "Duration available on enquiry",
        featured: s.featured,
      }));
    },
    hardcodedServices,
    "Failed to fetch services from DB"
  );
}

export async function getGalleryImages(activeOnly = true) {
  return safeDbOperation(
    async () => {
      const db = getDb();
      if (!db) return hardcodedGalleryImages;

      let dbImages;

      if (activeOnly) {
        dbImages = await db
          .select()
          .from(galleryImagesTable)
          .where(eq(galleryImagesTable.active, true))
          .orderBy(asc(galleryImagesTable.displayOrder), desc(galleryImagesTable.createdAt));
      } else {
        dbImages = await db
          .select()
          .from(galleryImagesTable)
          .orderBy(asc(galleryImagesTable.displayOrder), desc(galleryImagesTable.createdAt));
      }

      if (dbImages.length === 0) {
        return hardcodedGalleryImages;
      }

      return dbImages.map((img) => ({
        src: img.image,
        title: img.title || "Portfolio image",
        category: (img.category as any) || "Makeup",
      }));
    },
    hardcodedGalleryImages,
    "Failed to fetch gallery from DB"
  );
}
