/**
 * Static site configuration.
 *
 * This is the FALLBACK configuration used whenever the CMS database is
 * unreachable (or not yet seeded). The database is the source of truth;
 * these values only keep the public website online if the database
 * cannot be reached.
 */

export const business = {
  name: "Makeup by Needa",
  location: "Toronto, Canada",

  instagram: "@makeupbynee_",
  instagramUrl: "https://www.instagram.com/makeupbynee_/",

  instagramMakeup: "@makeupbynee_",
  instagramMakeupUrl: "https://www.instagram.com/makeupbynee_/",

  instagramNails: "@nailsbyneeda",
  instagramNailsUrl: "https://www.instagram.com/nailsbyneeda/",

  whatsapp: "+15483287786",
  whatsappDisplay: "+1 548 328 7786",
  whatsappMessage:
    "Hi Makeup by Needa, I’d like to enquire about your services.",

  email: "aurastudioneeda@gmail.com",

  address: "Toronto, Canada",
  hours: "By appointment",

  homeTitle: "Makeup by Needa | Toronto Makeup Artist",
  homeDescription: "Makeup, hair and nail artistry in Toronto, Canada.",

  footerText: "Makeup by Needa. All rights reserved.",
};

export const navigation = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Services",
    href: "/services",
  },
  {
    label: "Gallery",
    href: "/gallery",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export type Service = {
  name: string;
  category: "Makeup" | "Hair" | "Nails";
  description: string;
  price: string;
  duration: string;
  featured?: boolean;
};

/** Featured / fallback services for homepage & CMS-offline mode.
 *  Full hairstyling menu with prices lives in `lib/hair-services.ts`. */
export const services: Service[] = [
  {
    name: "Bridal Makeup",
    category: "Makeup",
    description:
      "A tailored bridal beauty look designed around your features, outfit, and wedding-day vision.",
    price: "Enquire for pricing",
    duration: "Duration available on enquiry",
    featured: true,
  },
  {
    name: "Bridal Hairstyle",
    category: "Hair",
    description:
      "Customized bridal hairstyle designed around your face shape, outfit, jewellery, and personal preference.",
    price: "From $150",
    duration: "Duration available on enquiry",
    featured: true,
  },
  {
    name: "Bridal Nail Art",
    category: "Nails",
    description:
      "Detailed bridal nail finishes shaped around your celebration and personal style.",
    price: "Enquire for pricing",
    duration: "Duration available on enquiry",
    featured: true,
  },
  {
    name: "Glam Updo",
    category: "Hair",
    description:
      "Detailed updo with volume, curls, texture and polished finishing for events and celebrations.",
    price: "$100+",
    duration: "Duration available on enquiry",
    featured: true,
  },
  {
    name: "Soft Glam Makeup",
    category: "Makeup",
    description:
      "A softly luminous makeup finish for engagements, events, and portrait sessions.",
    price: "Enquire for pricing",
    duration: "Duration available on enquiry",
    featured: true,
  },
  {
    name: "Hollywood Waves",
    category: "Hair",
    description:
      "Classic polished waves suitable for formal events, photoshoots and parties.",
    price: "$100+",
    duration: "Duration available on enquiry",
    featured: true,
  },
  {
    name: "Party / Event Makeup",
    category: "Makeup",
    description:
      "A polished event makeup look designed around your outfit and occasion.",
    price: "Enquire for pricing",
    duration: "Duration available on enquiry",
    featured: false,
  },
  {
    name: "Curls / Waves",
    category: "Hair",
    description:
      "Soft curls, Hollywood waves, beach waves or customized curls.",
    price: "$55+",
    duration: "Duration available on enquiry",
    featured: false,
  },
  {
    name: "South Asian Bridal Hairstyle",
    category: "Hair",
    description:
      "Traditional or contemporary bridal styling with customized buns, braids, curls and bridal finishing.",
    price: "From $175",
    duration: "Duration available on enquiry",
    featured: false,
  },
  {
    name: "Photoshoot Makeup",
    category: "Makeup",
    description:
      "Camera-ready makeup for portfolios, fashion shoots, and content creation.",
    price: "Enquire for pricing",
    duration: "Duration available on enquiry",
    featured: false,
  },
  {
    name: "Classic Nail Art",
    category: "Nails",
    description:
      "Clean, polished nail finishes with optional subtle design detail.",
    price: "Enquire for pricing",
    duration: "Duration available on enquiry",
    featured: false,
  },
  {
    name: "Custom Nail Art",
    category: "Nails",
    description:
      "Expressive nail design tailored to your outfit, celebration, or personal style.",
    price: "Enquire for pricing",
    duration: "Duration available on enquiry",
    featured: false,
  },
];

export type GalleryItem = {
  title: string;
  category: "Makeup" | "Bridal" | "Hair" | "Nails";
  imageUrl: string;
  altText: string;
};

/**
 * The four real portfolio images currently on the website. Used as the
 * gallery fallback; placeholder tiles are intentionally not included.
 */
export const galleryItems: GalleryItem[] = [
  {
    title: "Signature beauty",
    category: "Makeup",
    imageUrl: "/images/makeup-by-needa-hero.jpg",
    altText: "Signature beauty look by Makeup by Needa",
  },
  {
    title: "Glamorous makeup artistry",
    category: "Makeup",
    imageUrl: "/images/Glamorous-Makeup-Artistry.jpg",
    altText: "Glamorous makeup artistry by Makeup by Needa",
  },
  {
    title: "Makeup artistry",
    category: "Makeup",
    imageUrl: "/images/makeup-by-needa-portfolio-01.jpg",
    altText: "Makeup artistry portfolio piece by Makeup by Needa",
  },
  {
    title: "Beauty details",
    category: "Makeup",
    imageUrl: "/images/makeup-by-needa-portfolio-02.jpg",
    altText: "Beauty details portfolio piece by Makeup by Needa",
  },
];

/** Fallback artist info (matches the current About page copy). */
export const artist = {
  name: "Needa",
  shortBio:
    "A personal approach to makeup, hair styling, and nail art, thoughtfully designed around your features, your occasion, and the way you want to feel.",
  bio: "Hi, I'm Needa — a makeup, hair and nail artist based in Toronto. My work is built around a simple belief: beauty should feel personal, never templated.\n\n\n\nEvery appointment begins with a conversation — your occasion, your features, your outfit, and above all, the way you want to feel when you walk out the door. From there, the look is designed around you: softly luminous bridal makeup, defined evening glamour, romantic waves, sleek finished hair, or nail art detailed to complete the story.\n\n\n\nWhether it is your wedding morning, an engagement celebration, a reception, or a portrait session, the intention stays the same — a polished, enduring finish that still feels entirely like you.",
  experience: "",
  specialties: "",
  qualifications: "",
  location: "Toronto, Canada",
  instagram: "@makeupbynee_",
};
