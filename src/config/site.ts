/**
 * Business configuration
 * Centralized business data - will be migrated to CMS in future phase
 * All hardcoded business content identified here for CMS migration
 */

import type { BusinessInfo, NavigationItem, Service, GalleryItem, ServiceCategory } from "@/types";

export const business: BusinessInfo = {
  name: "Makeup by Needa",
  location: "Toronto, Canada",
  instagramMakeup: "@makeupbynee_",
  instagramMakeupUrl: "https://www.instagram.com/makeupbynee_/",
  instagramNails: "@nailsbyneeda",
  instagramNailsUrl: "https://www.instagram.com/nailsbyneeda/",
  instagramAccounts: [
    {
      handle: "@makeupbynee_",
      url: "https://www.instagram.com/makeupbynee_/",
      label: "Makeup & Hair Portfolio",
      category: "Makeup & Hair",
    },
    {
      handle: "@nailsbyneeda",
      url: "https://www.instagram.com/nailsbyneeda/",
      label: "Nail Art Portfolio",
      category: "Nail Art",
    },
  ],
  whatsapp: "+15483287786",
  whatsappDisplay: "+1 548 328 7786",
  whatsappMessage: "Hi Makeup by Needa, I'd like to enquire about your services.",
  email: "aurastudioneeda@gmail.com",
  address: "Toronto, Canada",
  hours: "By appointment",
};

export const navigation: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

// Service definitions - hardcoded for now, CMS-managed in future
const serviceNames: Record<ServiceCategory, string[]> = {
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
    }))
);

// Gallery items - placeholder tones will be replaced with real images via CMS
export const galleryItems: GalleryItem[] = [
  { title: "Soft glamour", category: "Makeup", tone: "rose" },
  { title: "Bridal glow", category: "Bridal", tone: "sand" },
  { title: "Modern details", category: "Nails", tone: "cocoa" },
  { title: "Celebration styling", category: "Hair", tone: "clay" },
  { title: "Evening beauty", category: "Makeup", tone: "ivory" },
  { title: "Bridal artistry", category: "Bridal", tone: "mauve" },
];

export const galleryImages = [
  {
    src: "/images/makeup-by-needa-hero.jpg",
    title: "Signature beauty",
    category: "Makeup" as const,
  },
  {
    src: "/images/Glamorous-Makeup-Artistry.jpg",
    title: "Glamorous makeup artistry",
    category: "Makeup" as const,
  },
  {
    src: "/images/makeup-by-needa-portfolio-01.jpg",
    title: "Makeup artistry",
    category: "Makeup" as const,
  },
  {
    src: "/images/makeup-by-needa-portfolio-02.jpg",
    title: "Beauty details",
    category: "Makeup" as const,
  },
];
