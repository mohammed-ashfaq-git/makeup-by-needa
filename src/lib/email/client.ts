/**
 * Email client placeholder
 * Future implementation will handle enquiry email delivery
 * Supports RESEND_API_KEY or SMTP configuration via environment variables
 */

import { business } from "@/config/site";

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

// Placeholder for future email implementation
export async function sendEmail(_options: EmailOptions): Promise<{ success: boolean; message: string }> {
  // TODO: Implement with Resend or Nodemailer when credentials are configured
  // For now, this is intentionally not implemented - API route will use WhatsApp fallback
  return {
    success: false,
    message: "Email delivery not yet configured. Using WhatsApp fallback.",
  };
}
