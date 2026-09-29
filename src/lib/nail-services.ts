/**
 * Premium Nail Services & Price List — the one service catalogue published
 * on the public website.
 *
 * It drives the services page (price list + search), the homepage slideshow
 * (one slide per section), the footer services column and the booking form.
 * The business name and location shown around it come from the CMS
 * (`site_settings`), never from this file.
 */

export type NailServiceItem = {
  name: string;
  price: string;
  description?: string;
};

export type NailServiceSection = {
  /** Anchor slug; the section renders with id `nail-${id}`. */
  id: string;
  emoji: string;
  title: string;
  /** One-line summary used by the homepage slideshow card. */
  summary: string;
  /** Set to false to keep a section off the homepage slideshow. */
  showcase?: boolean;
  items: NailServiceItem[];
};

export const nailMenu = {
  title: "Premium Nail Services & Price List",
  pricingNote:
    "Final pricing may vary based on length, shape, design complexity, number of colors, charms, crystals and 3D details.",
} as const;

export const nailServiceSections: NailServiceSection[] = [
  {
    id: "natural",
    emoji: "💅",
    title: "Natural Nail Services",
    summary:
      "Gel polish manicures on natural nails — French tips, chrome, cat eye, ombre and nail art.",
    items: [
      {
        name: "Gel Polish Manicure",
        price: "$35",
        description:
          "Gel polish application on natural nails with nail prep and finishing.",
      },
      {
        name: "Gel Polish + French Tips",
        price: "$45",
        description:
          "Classic or modern French tips with a clean, polished finish.",
      },
      {
        name: "Gel Polish + Chrome",
        price: "$45",
        description: "Gel polish finished with a premium chrome effect.",
      },
      {
        name: "Gel Polish + Cat Eye",
        price: "$48",
        description: "Magnetic cat-eye effect with a glossy finish.",
      },
      {
        name: "Gel Polish + Ombre",
        price: "$50+",
        description: "Beautifully blended ombre using two or more shades.",
      },
      {
        name: "Gel Polish + Nail Art",
        price: "$45+",
        description: "Includes basic customized nail art.",
      },
    ],
  },
  {
    id: "extensions",
    emoji: "💎",
    title: "Nail Extensions",
    summary:
      "Gel-X, acrylic and bio gel extensions shaped to your preferred length, plus refills and repairs.",
    items: [
      {
        name: "Gel-X Extensions",
        price: "$65+",
        description:
          "Lightweight soft-gel extensions with your choice of shape and color.",
      },
      {
        name: "Acrylic Extensions",
        price: "$60+",
        description:
          "Durable extensions customized to your preferred length and shape.",
      },
      {
        name: "Bio Gel Extensions",
        price: "$65+",
        description:
          "Flexible, lightweight enhancement with a natural appearance.",
      },
      {
        name: "Extension Refill",
        price: "$45+",
        description: "Maintenance for existing extensions.",
      },
      {
        name: "Extra Length",
        price: "$10+",
        description: "Additional charge for extra-long extensions.",
      },
      { name: "Single Nail Repair", price: "$7+/nail" },
    ],
  },
  {
    id: "art",
    emoji: "🎨",
    title: "Nail Art",
    summary:
      "From simple lines and dots to intricate hand-painted and fully custom artwork.",
    items: [
      {
        name: "Simple Art",
        price: "$3+/nail",
        description: "Lines, dots, minimal designs and simple details.",
      },
      {
        name: "Medium Art",
        price: "$10+/nail",
        description:
          "Marble, abstract patterns, detailed lines and multi-color designs.",
      },
      {
        name: "Advanced Art",
        price: "$15+/nail",
        description: "Intricate hand-painted and highly detailed designs.",
      },
      {
        name: "Custom Art",
        price: "$20+/nail",
        description: "Specialized artwork created from your inspiration.",
      },
    ],
  },
  {
    id: "premium-finishes",
    emoji: "✨",
    title: "Premium Finishes",
    summary:
      "Add French tips, chrome, cat eye, ombre, pearl, glitter or special-effect finishes to any set.",
    items: [
      { name: "French Tips", price: "$12+" },
      { name: "Chrome", price: "$10+" },
      { name: "Cat Eye", price: "$12+" },
      { name: "Ombre", price: "$15+" },
      { name: "Pearl / Glazed Finish", price: "$10+" },
      { name: "Glitter / Shimmer", price: "$8+" },
      { name: "Special Effect Chrome", price: "$12+" },
    ],
  },
  {
    id: "charms",
    emoji: "💎",
    title: "Charms • Bling • 3D",
    summary:
      "Charms, crystals, pearls, chains, 3D flowers and luxury bling, priced per nail.",
    items: [
      { name: "Mini Charms", price: "$1+/nail" },
      { name: "Rhinestones / Crystals", price: "$2+/nail" },
      { name: "Pearls", price: "$2+/nail" },
      { name: "Chains / Beads", price: "$3+/nail" },
      { name: "Premium Charms", price: "$5+/nail" },
      { name: "3D Flowers", price: "$7+/nail" },
      { name: "3D Custom Art", price: "$8+/nail" },
      { name: "Luxury Bling", price: "$8+/nail" },
    ],
  },
  {
    id: "removal",
    emoji: "🧼",
    title: "Removal",
    summary:
      "Gentle removal of gel polish, acrylic, Gel-X, bio gel and foreign product.",
    // A practical add-on rather than a showcase service: listed on the price
    // list, in search and in the footer, but not given a homepage slide.
    showcase: false,
    items: [
      { name: "Gel Polish Removal", price: "$15" },
      { name: "Acrylic / Gel-X / Bio Gel Removal", price: "$20" },
      { name: "Removal + New Set", price: "$15+" },
      { name: "Foreign Product Removal", price: "$25+" },
    ],
  },
  {
    id: "signature-sets",
    emoji: "👑",
    title: "Signature Sets",
    summary:
      "Complete signature looks — French, cat eye, chrome, ombre, bling, 3D and custom luxury sets.",
    items: [
      { name: "Classic French Set", price: "$55+" },
      { name: "Cat Eye Glam Set", price: "$60+" },
      { name: "Chrome Glam Set", price: "$60+" },
      { name: "Ombre Set", price: "$65+" },
      { name: "Luxury Bling Set", price: "$75+" },
      { name: "3D Art Set", price: "$80+" },
      { name: "Custom Luxury Set", price: "$85+" },
    ],
  },
];

/** Sections shown on the homepage slideshow (six of the seven). */
export const showcaseNailSections = nailServiceSections.filter(
  (section) => section.showcase !== false,
);

/** DOM id of a price-list section, e.g. `nail-natural`. */
export function nailSectionId(section: Pick<NailServiceSection, "id">): string {
  return `nail-${section.id}`;
}

/** Deep link from anywhere on the site to a section of the services page. */
export function nailSectionHref(section: Pick<NailServiceSection, "id">): string {
  return `/services#${nailSectionId(section)}`;
}

/** Lowest numeric price in a section, rendered as "From $35" (or "From $1/nail"). */
export function nailSectionStartingPrice(section: NailServiceSection): string {
  let best: { value: number; suffix: string } | null = null;

  for (const item of section.items) {
    const match = item.price.match(/\$(\d+(?:\.\d+)?)\+?(\/nail)?/);
    if (!match) continue;
    const value = Number(match[1]);
    if (best === null || value < best.value) {
      best = { value, suffix: match[2] ?? "" };
    }
  }

  return best ? `From $${best.value}${best.suffix}` : "See price list";
}

/** Every service in menu order, flattened (used by search and booking). */
export function allNailServices() {
  return nailServiceSections.flatMap((section) =>
    section.items.map((item) => ({ ...item, section })),
  );
}
