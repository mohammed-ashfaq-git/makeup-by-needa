import { getDb } from "../client";
import { siteSettings } from "../schema";
import { asc } from "drizzle-orm";
import type { SiteSettings } from "../schema";
import { generateId } from "../utils";

/**
 * Site Settings Repository - Drizzle
 * Single record pattern
 */

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(siteSettings)
      .orderBy(asc(siteSettings.createdAt))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Failed to get site settings:", error);
    return null;
  }
}

export async function createSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const id = data.id || generateId();

  await db.insert(siteSettings).values({
    id,
    businessName: data.businessName || "Makeup by Needa",
    logo: data.logo,
    phone: data.phone,
    email: data.email,
    whatsapp: data.whatsapp,
    whatsappDisplay: data.whatsappDisplay,
    whatsappMessage: data.whatsappMessage,
    location: data.location,
    address: data.address,
    hours: data.hours,
    instagram: data.instagram,
    instagramUrl: data.instagramUrl,
    instagramMakeup: data.instagramMakeup,
    instagramMakeupUrl: data.instagramMakeupUrl,
    instagramNails: data.instagramNails,
    instagramNailsUrl: data.instagramNailsUrl,
    facebook: data.facebook,
    homepageTitle: data.homepageTitle,
    homepageDescription: data.homepageDescription,
    footerText: data.footerText,
  });

  const created = await getSiteSettings();
  if (!created) throw new Error("Failed to create site settings");
  return created;
}

export async function updateSiteSettings(id: string, data: Partial<SiteSettings>): Promise<SiteSettings> {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const { eq } = await import("drizzle-orm");

  await db
    .update(siteSettings)
    .set({
      businessName: data.businessName,
      logo: data.logo,
      phone: data.phone,
      email: data.email,
      whatsapp: data.whatsapp,
      whatsappDisplay: data.whatsappDisplay,
      whatsappMessage: data.whatsappMessage,
      location: data.location,
      address: data.address,
      hours: data.hours,
      instagram: data.instagram,
      instagramUrl: data.instagramUrl,
      instagramMakeup: data.instagramMakeup,
      instagramMakeupUrl: data.instagramMakeupUrl,
      instagramNails: data.instagramNails,
      instagramNailsUrl: data.instagramNailsUrl,
      facebook: data.facebook,
      homepageTitle: data.homepageTitle,
      homepageDescription: data.homepageDescription,
      footerText: data.footerText,
    })
    .where(eq(siteSettings.id, id));

  const updated = await getSiteSettings();
  if (!updated) throw new Error("Failed to update site settings");
  return updated;
}

export async function upsertSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const existing = await getSiteSettings();

  if (existing) {
    return updateSiteSettings(existing.id, data);
  }

  return createSiteSettings(data);
}
