/**
 * Aura Beauty — Hairstyling Services & Price List
 * Static curated menu shown on the public Services page.
 */

export type HairServiceItem = {
  name: string;
  price: string;
  description?: string;
  details?: string[];
};

export type HairServiceSection = {
  id: string;
  emoji: string;
  title: string;
  items: HairServiceItem[];
  note?: string;
};

export type HairInfoBlock = {
  id: string;
  emoji: string;
  title: string;
  intro?: string;
  bullets: string[];
  footer?: string;
};

export const hairMenuBrand = {
  name: "AURA BEAUTY",
  title: "Hairstyling Services & Price List",
  tagline: "Confident You",
  location: "Cambridge, Ontario",
  disciplines: "HAIR • MAKEUP • NAILS • BRIDAL",
  closing: "Beautifully Styled. Confidently You.",
} as const;

export const hairServiceSections: HairServiceSection[] = [
  {
    id: "everyday",
    emoji: "💇‍♀️",
    title: "Everyday Hair Services",
    items: [
      {
        name: "Hair Wash & Blow-Dry",
        price: "$45+",
        description:
          "Includes shampoo, conditioning and professional blow-dry styling.",
      },
      {
        name: "Blowout",
        price: "$50+",
        description: "Smooth, voluminous or bouncy blowout.",
      },
      {
        name: "Straight Hair Styling",
        price: "$50+",
        description: "Professional heat styling for a sleek, polished finish.",
      },
      {
        name: "Curls / Waves",
        price: "$55+",
        description:
          "Soft curls, Hollywood waves, beach waves or customized curls.",
      },
      {
        name: "Iron Styling",
        price: "$45+",
        description: "Straightening or basic heat styling.",
      },
      {
        name: "Hair Wash + Styling",
        price: "$60+",
        description: "Hair wash followed by customized heat styling.",
      },
    ],
  },
  {
    id: "event",
    emoji: "✨",
    title: "Event Hairstyling",
    items: [
      {
        name: "Half-Up Hairstyle",
        price: "$70+",
        description:
          "Elegant half-up styling customized to your outfit and occasion.",
      },
      {
        name: "Simple Updo",
        price: "$75+",
        description:
          "A clean and elegant updo for parties, dinners and events.",
      },
      {
        name: "Glam Updo",
        price: "$100+",
        description:
          "Detailed updo with volume, curls, texture and polished finishing.",
      },
      {
        name: "Low Bun",
        price: "$85+",
        description: "Sleek, soft or textured low-bun styling.",
      },
      {
        name: "High Bun",
        price: "$90+",
        description: "Classic or glamorous high-bun styling.",
      },
      {
        name: "Ponytail Styling",
        price: "$75+",
        description: "Sleek, textured, curled or voluminous ponytail.",
      },
      {
        name: "Glam Ponytail",
        price: "$95+",
        description:
          "Detailed ponytail with volume, curls and customized finishing.",
      },
      {
        name: "Hollywood Waves",
        price: "$100+",
        description:
          "Classic polished waves suitable for formal events, photoshoots and parties.",
      },
      {
        name: "Braided Hairstyle",
        price: "From $65",
        description:
          "Customized braids, accent braids or braided event hairstyles.",
      },
    ],
  },
  {
    id: "bridal",
    emoji: "👰",
    title: "Bridal Hairstyling",
    items: [
      {
        name: "Bridal Hairstyle",
        price: "From $150",
        description: "Customized bridal hairstyle designed around your:",
        details: [
          "Face shape",
          "Outfit",
          "Jewellery",
          "Dupatta / veil",
          "Hair length",
          "Hair texture",
          "Personal preference",
        ],
      },
      {
        name: "South Asian Bridal Hairstyle",
        price: "From $175",
        description:
          "Traditional or contemporary bridal styling, including customized buns, braids, curls and bridal finishing.",
      },
      {
        name: "Bridal Hair Trial",
        price: "$100",
        description: "Trial appointment to finalize your wedding-day hairstyle.",
      },
      {
        name: "Bridal Hair + Makeup",
        price: "From $350",
        description: "Complete bridal makeup and hairstyling package.",
      },
      {
        name: "South Asian Bridal Hair + Makeup",
        price: "From $400",
        description:
          "Customized bridal makeup and hairstyling for South Asian wedding events.",
      },
    ],
  },
  {
    id: "south-asian",
    emoji: "🌸",
    title: "South Asian Hairstyling",
    items: [
      {
        name: "Saree Hairstyle",
        price: "From $100",
        description: "Hairstyle designed to complement a saree and jewellery.",
      },
      {
        name: "Lehenga Hairstyle",
        price: "From $100",
        description:
          "Customized hairstyle for engagement, reception or wedding outfits.",
      },
      {
        name: "Dupatta-Friendly Hairstyle",
        price: "From $100",
        description: "Designed specifically to accommodate dupatta placement.",
      },
      {
        name: "Traditional Bridal Bun",
        price: "From $150",
        description: "Elegant bun styling with customized accessories.",
      },
      {
        name: "Braided Bridal Hairstyle",
        price: "From $150",
        description: "Detailed traditional or modern bridal braid.",
      },
      {
        name: "Gajra / Hair Accessory Setting",
        price: "From $20",
        description:
          "Professional placement of gajra, flowers and hair accessories.",
      },
    ],
  },
  {
    id: "accessories",
    emoji: "🎀",
    title: "Hair Accessories",
    items: [
      {
        name: "Hair Accessories Placement",
        price: "From $15",
        description:
          "Includes placement of client-provided accessories such as:",
        details: [
          "Hair pins",
          "Jewelled clips",
          "Flowers",
          "Gajra",
          "Hair chains",
          "Decorative accessories",
        ],
      },
      {
        name: "Veil Setting",
        price: "From $25",
      },
      {
        name: "Dupatta Setting",
        price: "From $40",
      },
      {
        name: "Gajra Setting",
        price: "From $20",
      },
    ],
  },
  {
    id: "photoshoot",
    emoji: "📸",
    title: "Photoshoot & Fashion Hair",
    items: [
      {
        name: "Photoshoot Hairstyling",
        price: "From $100",
        description: "Customized styling for:",
        details: [
          "Makeup portfolios",
          "Fashion shoots",
          "Brand shoots",
          "Content creation",
          "Editorial photography",
        ],
      },
      {
        name: "Editorial / Creative Hairstyling",
        price: "From $125",
        description:
          "Complex or creative hairstyles are quoted according to the design and time required.",
      },
      {
        name: "Fashion Show Hairstyling",
        price: "Custom Quote",
        description: "Group and backstage bookings available.",
      },
    ],
  },
  {
    id: "extensions",
    emoji: "💎",
    title: "Hair Extensions",
    items: [
      {
        name: "Extension Styling",
        price: "From $30",
        description: "Styling of client-provided extensions.",
      },
      {
        name: "Extension Installation",
        price: "From $75",
        description: "Price depends on the type and amount of extensions.",
      },
      {
        name: "Extension + Glam Styling",
        price: "From $100",
        description: "Installation and customized styling.",
      },
    ],
    note: "Extension hair is not included unless specifically arranged.",
  },
  {
    id: "braids",
    emoji: "🪮",
    title: "Braids & Special Styling",
    items: [
      { name: "Basic Braid", price: "From $35" },
      { name: "French / Dutch Braid", price: "From $45" },
      { name: "Fishtail Braid", price: "From $50" },
      { name: "Bubble Braid", price: "From $50" },
      { name: "Decorative Braid", price: "From $65" },
      { name: "Braided Updo", price: "From $85" },
      { name: "Custom Braided Style", price: "From $100" },
    ],
  },
  {
    id: "add-ons",
    emoji: "✨",
    title: "Hair Add-Ons",
    items: [
      { name: "Hair Volume / Teasing", price: "+$15" },
      { name: "Hair Padding", price: "+$15" },
      { name: "Hair Extension Styling", price: "From $25" },
      { name: "Specialty Accessories", price: "From $15" },
      { name: "Extra-Long / Extra-Thick Hair", price: "From $15" },
      { name: "Additional Styling Time", price: "From $25" },
    ],
  },
  {
    id: "bridal-party",
    emoji: "👰",
    title: "Bridal Party Services",
    items: [
      { name: "Bridesmaid Hairstyling", price: "From $100/person" },
      { name: "Mother of Bride / Groom", price: "From $100/person" },
      { name: "Wedding Guest Hairstyling", price: "From $85/person" },
      { name: "Flower Girl Hairstyling", price: "From $50" },
      {
        name: "Bridal Party Hair Package",
        price: "Custom Quote",
        description:
          "Group packages can be created based on the number of people, services and getting-ready timeline.",
      },
    ],
  },
];

export const hairInfoBlocks: HairInfoBlock[] = [
  {
    id: "length-density",
    emoji: "👩‍🦱",
    title: "Hair Length & Density",
    intro: "Prices may increase for:",
    bullets: [
      "Very long hair",
      "Very thick hair",
      "Extra-dense hair",
      "Extensions",
      "Complex styling",
      "Styles requiring additional preparation",
    ],
    footer: "The final price will be confirmed before the service.",
  },
  {
    id: "on-location",
    emoji: "🚗",
    title: "On-Location Hairstyling",
    intro: "Aura Beauty provides mobile hairstyling for:",
    bullets: [
      "Weddings",
      "Bridal parties",
      "Events",
      "Photoshoots",
      "Fashion shows",
      "Private celebrations",
    ],
    footer:
      "Travel fees apply depending on location. For larger bridal parties, group bookings can be arranged with a customized quote.",
  },
  {
    id: "booking-policy",
    emoji: "📌",
    title: "Booking Policy",
    bullets: [
      "Advance booking is required.",
      "A $10 non-refundable booking deposit is required to secure your appointment.",
      "24-hour notice is required for rescheduling.",
      "Late cancellations and no-shows may result in loss of the deposit.",
      "Please arrive with clean, dry hair unless a wash is included in your service.",
      "Please inform us in advance if you have extensions or very thick/long hair.",
      "Inspiration photos are welcome.",
      "Complex hairstyles should be discussed before booking.",
      "Travel fees apply for mobile services.",
      "Final pricing may vary depending on hair length, density, extensions and styling complexity.",
    ],
  },
];

/**
 * Groups CMS services by subcategory to construct the hairstyling menu.
 * Falls back to the curated price list if no hair services with subcategories
 * are present in the database.
 */
export function groupHairServicesBySubcategory(
  services: Array<{
    id: number;
    name: string;
    category: string;
    subcategory?: string | null;
    description?: string;
    shortDescription?: string | null;
    details?: string[];
    priceDisplay?: string;
  }>,
): HairServiceSection[] {
  const hairServices = services.filter((s) => s.category === "Hair");
  const hasCmsHairWithSubcat = hairServices.some(
    (s) => s.subcategory && s.subcategory.trim() !== "",
  );

  if (!hasCmsHairWithSubcat) {
    return hairServiceSections;
  }

  const assignedServiceIds = new Set<number>();

  const sections: HairServiceSection[] = hairServiceSections.map((section) => {
    const matching = hairServices.filter((s) => {
      if (!s.subcategory) return false;
      const subNorm = s.subcategory.toLowerCase().trim();
      const secNorm = section.title.toLowerCase().trim();
      const idNorm = section.id.toLowerCase().trim();
      return (
        subNorm === secNorm ||
        subNorm === idNorm ||
        secNorm.includes(subNorm) ||
        subNorm.includes(secNorm)
      );
    });

    if (matching.length === 0) {
      return section;
    }

    matching.forEach((s) => assignedServiceIds.add(s.id));

    return {
      ...section,
      items: matching.map((s) => ({
        name: s.name,
        price: s.priceDisplay || "Enquire for pricing",
        description: s.shortDescription || s.description || undefined,
        details: s.details && s.details.length > 0 ? s.details : undefined,
      })),
    };
  });

  // Handle any additional custom subcategories not in the static list
  const remaining = hairServices.filter(
    (s) => !assignedServiceIds.has(s.id) && s.subcategory?.trim(),
  );
  if (remaining.length > 0) {
    const bySub = new Map<string, typeof remaining>();
    for (const item of remaining) {
      const sub = item.subcategory!.trim();
      const list = bySub.get(sub) ?? [];
      list.push(item);
      bySub.set(sub, list);
    }

    for (const [subTitle, items] of bySub.entries()) {
      const id = subTitle
        .toLowerCase()
        .replace(/[^\w]+/g, "-")
        .replace(/^-|-$/g, "");
      sections.push({
        id,
        emoji: "✨",
        title: subTitle,
        items: items.map((s) => ({
          name: s.name,
          price: s.priceDisplay || "Enquire for pricing",
          description: s.shortDescription || s.description || undefined,
          details: s.details && s.details.length > 0 ? s.details : undefined,
        })),
      });
    }
  }

  return sections;
}
