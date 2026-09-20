import { getDb } from "../client";
import { services } from "../schema";
import { eq, asc } from "drizzle-orm";
import type { Service, ServiceCategory } from "../schema";

export async function getAllServices(activeOnly = false): Promise<Service[]> {
  const db = getDb();
  if (!db) return [];

  try {
    if (activeOnly) {
      return await db
        .select()
        .from(services)
        .where(eq(services.active, true))
        .orderBy(asc(services.displayOrder), asc(services.name));
    }

    return await db
      .select()
      .from(services)
      .orderBy(asc(services.displayOrder), asc(services.name));
  } catch (error) {
    console.error("Failed to get services:", error);
    return [];
  }
}

export async function getServicesByCategory(
  category: ServiceCategory,
  activeOnly = true
): Promise<Service[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const { and } = await import("drizzle-orm");

    if (activeOnly) {
      return await db
        .select()
        .from(services)
        .where(and(eq(services.category, category), eq(services.active, true)))
        .orderBy(asc(services.displayOrder), asc(services.name));
    }

    return await db
      .select()
      .from(services)
      .where(eq(services.category, category))
      .orderBy(asc(services.displayOrder), asc(services.name));
  } catch (error) {
    console.error("Failed to get services by category:", error);
    return [];
  }
}

export async function getFeaturedServices(): Promise<Service[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const { and } = await import("drizzle-orm");
    return await db
      .select()
      .from(services)
      .where(and(eq(services.featured, true), eq(services.active, true)))
      .orderBy(asc(services.displayOrder), asc(services.name));
  } catch (error) {
    console.error("Failed to get featured services:", error);
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Failed to get service by slug:", error);
    return null;
  }
}

export async function getServiceById(id: string): Promise<Service | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Failed to get service by id:", error);
    return null;
  }
}
