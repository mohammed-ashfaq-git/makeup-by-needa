/**
 * Service Enquiry Cart & WhatsApp Message Builder.
 *
 * Keeps client-side selected services in localStorage and constructs a
 * structured, professional WhatsApp enquiry message with categorized
 * services, dates, and client notes.
 */
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export type CartItem = {
  id: string;
  name: string;
  category: string;
  subcategory?: string | null;
  price?: string | null;
  quantity: number;
};

export const CART_STORAGE_KEY = "mbn_aura_cart_v1";

/** Loads items from localStorage safely in the browser. */
export function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is CartItem =>
          item != null &&
          typeof item === "object" &&
          typeof item.name === "string" &&
          item.name.length > 0 &&
          typeof item.quantity === "number" &&
          item.quantity > 0,
      );
    }
  } catch {
    // Ignore invalid JSON in localStorage
  }
  return [];
}

/** Saves cart items to localStorage in the browser. */
export function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage quota or privacy mode error
  }
}

/**
 * Builds a formatted WhatsApp enquiry message string matching the
 * Site specification:
 *
 * Hi {businessName}! ✨
 * I'd like to enquire about the following services:
 * *Hair*
 * 1. Glam Updo (Event Hairstyling) — $100+
 * *Makeup*
 * 2. Soft Glam Makeup — Enquire for pricing
 * Event / preferred date: …
 * Notes: …
 * Please let me know availability and next steps. Thank you!
 */
export function buildCartWhatsAppMessage({
  businessName,
  items,
  eventDate,
  notes,
}: {
  businessName: string;
  items: CartItem[];
  eventDate?: string;
  notes?: string;
}): string {
  const lines: string[] = [];
  lines.push(`Hi ${businessName}! ✨`);
  lines.push("I'd like to enquire about the following services:");
  lines.push("");

  // Preferred ordering: Hair, Makeup, Nails, others
  const categoryOrder = ["Hair", "Makeup", "Nails"];
  const grouped = new Map<string, CartItem[]>();

  for (const item of items) {
    const cat = item.category || "Hair";
    const list = grouped.get(cat) ?? [];
    list.push(item);
    grouped.set(cat, list);
  }

  const sortedCategories = Array.from(grouped.keys()).sort((a, b) => {
    const idxA = categoryOrder.indexOf(a);
    const idxB = categoryOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  let counter = 1;
  for (const cat of sortedCategories) {
    lines.push(`*${cat}*`);
    const catItems = grouped.get(cat) ?? [];
    for (const item of catItems) {
      const sub = item.subcategory ? ` (${item.subcategory})` : "";
      const price = item.price ? ` — ${item.price}` : " — Enquire for pricing";
      const qty = item.quantity > 1 ? ` (×${item.quantity})` : "";
      lines.push(`${counter}. ${item.name}${sub}${qty}${price}`);
      counter += 1;
    }
    lines.push("");
  }

  if (eventDate && eventDate.trim()) {
    lines.push(`Event / preferred date: ${eventDate.trim()}`);
  }
  if (notes && notes.trim()) {
    lines.push(`Notes: ${notes.trim()}`);
  }
  if ((eventDate && eventDate.trim()) || (notes && notes.trim())) {
    lines.push("");
  }

  lines.push("Please let me know availability and next steps. Thank you!");

  return lines.join("\n");
}

/** Builds the full wa.me link with URL-encoded message. */
export function buildCartWhatsAppLink({
  whatsappNumber,
  businessName,
  items,
  eventDate,
  notes,
}: {
  whatsappNumber: string;
  businessName: string;
  items: CartItem[];
  eventDate?: string;
  notes?: string;
}): string {
  const message = buildCartWhatsAppMessage({
    businessName,
    items,
    eventDate,
    notes,
  });
  return buildWhatsAppUrl(whatsappNumber, message);
}
