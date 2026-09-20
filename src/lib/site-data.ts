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

const serviceNames = {
  Makeup: [
    "Bridal Makeup",
    "Engagement Makeup",
    "Reception Makeup",
    "Party / Event Makeup",
    "Photoshoot Makeup",
    "Custom Makeup",
  ],

  Hair: [
    "Bridal Hair Styling",
    "Engagement Hair",
    "Reception Hair",
    "Party / Event Hair",
    "Soft Curls & Waves",
    "Elegant Updo",
    "Sleek Hair Styling",
    "Custom Hair Styling",
  ],

  Nails: [
    "Classic Nail Art",
    "Bridal Nail Art",
    "French Tips",
    "Gel Nails",
    "Nail Extensions",
    "Custom Nail Art",
    "Minimal Nail Art",
    "Luxury Nail Art",
  ],
};

export const services: Service[] = Object.entries(serviceNames).flatMap(
  ([category, names]) =>
    names.map((name, index) => ({
      name,
      category: category as Service["category"],
      description:
        "A tailored service designed around your occasion, preferred finish, and personal style.",
      price: "Enquire for pricing",
      duration: "Duration available on enquiry",
      featured: index < 2,
    })),
);

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
