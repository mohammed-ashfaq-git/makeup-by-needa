/**
 * Centralised WhatsApp deep-link builder.
 *
 * Every WhatsApp link on the website is constructed here so the number
 * format and URL encoding stay consistent. The number and message come
 * from the CMS settings (with static fallbacks) — never hardcode them.
 */

/** Normalises a phone number for wa.me (digits only, leading + allowed in input). */
export function normaliseWhatsAppNumber(number: string): string {
  return number.replace(/[^\d]/g, "");
}

/** Builds a https://wa.me/<number>?text=<message> link. */
export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${normaliseWhatsAppNumber(number)}?text=${encodeURIComponent(
    message,
  )}`;
}
