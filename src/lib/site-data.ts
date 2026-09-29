/**
 * Static site configuration.
 *
 * This is the FALLBACK configuration used whenever the CMS database is
 * unreachable (or not yet seeded). The database is the source of truth;
 * these values only keep the public website online if the database
 * cannot be reached.
 */

export const business = {
  name: "Needa Beauty Lab",
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
    "Hi Needa Beauty Lab, I’d like to enquire about your nail services.",

  email: "aurastudioneeda@gmail.com",

  address: "Toronto, Canada",
  hours: "By appointment",

  homeTitle: "Needa Beauty Lab | Toronto Nail Technician",
  homeDescription:
    "Premium nail services in Toronto, Canada — gel polish, extensions, nail art, premium finishes and signature sets.",

  footerText: "Needa Beauty Lab. All rights reserved.",
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
    altText: "Signature beauty look by Needa Beauty Lab",
  },
  {
    title: "Glamorous makeup artistry",
    category: "Makeup",
    imageUrl: "/images/Glamorous-Makeup-Artistry.jpg",
    altText: "Glamorous makeup artistry by Needa Beauty Lab",
  },
  {
    title: "Makeup artistry",
    category: "Makeup",
    imageUrl: "/images/makeup-by-needa-portfolio-01.jpg",
    altText: "Makeup artistry portfolio piece by Needa Beauty Lab",
  },
  {
    title: "Beauty details",
    category: "Makeup",
    imageUrl: "/images/makeup-by-needa-portfolio-02.jpg",
    altText: "Beauty details portfolio piece by Needa Beauty Lab",
  },
];

/** Fallback artist info (used when the CMS artist profile is unavailable). */
export const artist = {
  name: "Needa",
  shortBio:
    "A personal approach to nail care and nail design, thoughtfully shaped around your style, your occasion, and the way you want to feel.",
  bio: "Hi, I'm Needa — the nail technician behind Needa Beauty Lab in Toronto. My work is built around a simple belief: beauty should feel personal, never templated.\n\nEvery appointment begins with a conversation — your style, your occasion, your preferred length and shape, and the finish you have in mind. From there, each set is designed around you: a clean gel manicure, soft French tips, glossy chrome or cat eye, lightweight extensions, or detailed nail art finished with charms and 3D details.\n\nWhether it is an everyday refresh, a celebration, or a special event, the intention stays the same — a polished, long-lasting finish that still feels entirely like you.",
  experience: "",
  specialties: "",
  qualifications: "",
  location: "Toronto, Canada",
  instagram: "@nailsbyneeda",
};
