import { getDb } from "../client";
import { galleryImages } from "../schema";
import { eq, asc, desc } from "drizzle-orm";
import type { GalleryImage, GalleryCategory } from "../schema";

export async function getAllGalleryImages(activeOnly = false): Promise<GalleryImage[]> {
  const db = getDb();
  if (!db) return [];

  try {
    if (activeOnly) {
      return await db
        .select()
        .from(galleryImages)
        .where(eq(galleryImages.active, true))
        .orderBy(asc(galleryImages.displayOrder), desc(galleryImages.createdAt));
    }

    return await db
      .select()
      .from(galleryImages)
      .orderBy(asc(galleryImages.displayOrder), desc(galleryImages.createdAt));
  } catch (error) {
    console.error("Failed to get gallery images:", error);
    return [];
  }
}

export async function getGalleryByCategory(
  category: GalleryCategory,
  activeOnly = true
): Promise<GalleryImage[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const { and } = await import("drizzle-orm");

    if (activeOnly) {
      return await db
        .select()
        .from(galleryImages)
        .where(and(eq(galleryImages.category, category), eq(galleryImages.active, true)))
        .orderBy(asc(galleryImages.displayOrder), desc(galleryImages.createdAt));
    }

    return await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.category, category))
      .orderBy(asc(galleryImages.displayOrder), desc(galleryImages.createdAt));
  } catch (error) {
    console.error("Failed to get gallery by category:", error);
    return [];
  }
}

export async function getGalleryImageById(id: string): Promise<GalleryImage | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(galleryImages).where(eq(galleryImages.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Failed to get gallery image by id:", error);
    return null;
  }
}
