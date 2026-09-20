import { business } from "@/config/site";
import type { EnquiryPayload } from "@/types";

export function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return dateStr;
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
      dateStyle: "medium",
    });
  } catch {
    return dateStr;
  }
}

export function buildEnquiryWhatsAppMessage(payload: Partial<EnquiryPayload>): string {
  const formattedDate = payload.date ? formatDateForDisplay(payload.date) : "Not specified";

  const lines = [
    `*New Appointment Enquiry - Makeup by Needa*`,
    ``,
    `*Name:* ${payload.name?.trim()}`,
    `*Service:* ${payload.service?.trim()}`,
    `*Event Date:* ${formattedDate}`,
    payload.time?.trim() ? `*Preferred Time:* ${payload.time.trim()}` : null,
    `*Location:* ${payload.location?.trim()}`,
    payload.people?.trim() ? `*Number of People:* ${payload.people.trim()}` : null,
    `*Phone:* ${payload.phone?.trim()}`,
    `*Email:* ${payload.email?.trim()}`,
    ``,
    `*Message / Notes:*`,
    `${payload.message?.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");

  return lines;
}

export function buildEnquiryWhatsAppUrl(payload: Partial<EnquiryPayload>): string {
  const message = buildEnquiryWhatsAppMessage(payload);
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function getDefaultWhatsAppUrl(): string {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(business.whatsappMessage)}`;
}
