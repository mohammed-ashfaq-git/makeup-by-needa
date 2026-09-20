/**
 * Email client - Drizzle + MySQL aware
 */

import { business } from "@/config/site";
import { getDb } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export function hasEmailConfig(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY ||
      (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  );
}

export function getRecipientEmail(): string {
  return process.env.BUSINESS_INQUIRY_EMAIL || business.email;
}

export async function getRecipientEmailFromDB(): Promise<string> {
  try {
    const db = getDb();
    if (!db) return getRecipientEmail();

    const settings = await db.select().from(siteSettings).orderBy(asc(siteSettings.createdAt)).limit(1);
    return settings[0]?.email || getRecipientEmail();
  } catch {
    return getRecipientEmail();
  }
}

export async function sendEmail(_options: EmailOptions): Promise<{ success: boolean; message: string }> {
  return {
    success: false,
    message: "Email delivery not yet configured. Using WhatsApp fallback.",
  };
}
