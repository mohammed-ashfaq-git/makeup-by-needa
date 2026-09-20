/**
 * Database Utilities
 * - Enquiry number generation (MBN-2026-0001)
 * - Slug generation
 * - Safe error handling
 * Works with both Drizzle and Prisma
 */

import { getDb } from "./client";
import { enquiries } from "./schema";
import { like, desc } from "drizzle-orm";

/**
 * Generate human-readable enquiry number like MBN-2026-0001
 * Format: MBN-YYYY-NNNN (year + sequential number)
 * Does NOT use database ID as customer-facing number
 */
export async function generateEnquiryNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `MBN-${year}-`;

  try {
    const db = getDb();

    if (!db) {
      // Fallback if no DB connection - generate temp number
      return `${prefix}${String(Date.now()).slice(-4).padStart(4, "0")}`;
    }

    // Find latest enquiry for current year using Drizzle
    const latest = await db
      .select({ enquiryNumber: enquiries.enquiryNumber })
      .from(enquiries)
      .where(like(enquiries.enquiryNumber, `${prefix}%`))
      .orderBy(desc(enquiries.enquiryNumber))
      .limit(1);

    let nextNumber = 1;

    if (latest.length > 0) {
      const match = latest[0].enquiryNumber.match(/MBN-\d{4}-(\d+)/);
      if (match) {
        const currentNumber = parseInt(match[1], 10);
        nextNumber = currentNumber + 1;
      }
    }

    const paddedNumber = String(nextNumber).padStart(4, "0");
    return `${prefix}${paddedNumber}`;
  } catch (error) {
    console.warn("Failed to generate enquiry number from DB, using fallback:", error);
    // Fallback to timestamp-based
    return `${prefix}${String(Date.now()).slice(-4).padStart(4, "0")}`;
  }
}

/**
 * Generate URL-friendly slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate unique slug for bulk operations
 */
export async function generateUniqueSlug(
  name: string,
  existingSlugs?: Set<string>
): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  if (existingSlugs) {
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    existingSlugs.add(slug);
    return slug;
  }

  // For DB check, we need db instance
  try {
    const db = getDb();
    if (!db) {
      return slug;
    }

    const { services } = await import("./schema");
    const { eq } = await import("drizzle-orm");

    while (true) {
      const existing = await db
        .select({ id: services.id })
        .from(services)
        .where(eq(services.slug, slug))
        .limit(1);

      if (existing.length === 0) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  } catch (error) {
    console.warn("Failed to check slug uniqueness:", error);
  }

  return slug;
}

/**
 * Safe database operation wrapper
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage = "Database operation failed"
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return fallback;
  }
}

/**
 * Generate CUID-like ID (simple version for offline)
 * In production, use cuid() from @prisma/client or nanoid
 */
export function generateId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).substring(2, 10)}`;
}
