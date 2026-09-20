/**
 * Shared types for Makeup by Needa
 * These types are used across frontend and backend.
 * Future CMS integration will use these as base schemas.
 */

export type ServiceCategory = "Makeup" | "Hair" | "Nails";
export type GalleryCategory = "Makeup" | "Bridal" | "Hair" | "Nails";

export interface Service {
  name: string;
  category: ServiceCategory;
  description: string;
  price: string;
  duration: string;
  featured?: boolean;
}

export interface GalleryItem {
  title: string;
  category: GalleryCategory;
  tone: string;
  src?: string | null;
}

export interface GalleryImage {
  src: string;
  title: string;
  category: GalleryCategory;
}

export interface BusinessInfo {
  name: string;
  location: string;
  email: string;
  address: string;
  hours: string;
  whatsapp: string;
  whatsappDisplay: string;
  whatsappMessage: string;
  instagramMakeup: string;
  instagramMakeupUrl: string;
  instagramNails: string;
  instagramNailsUrl: string;
  instagramAccounts: {
    handle: string;
    url: string;
    label: string;
    category: string;
  }[];
}

export interface NavigationItem {
  label: string;
  href: string;
}

export interface EnquiryPayload {
  name: string;
  phone: string;
  email: string;
  date: string;
  location: string;
  service: string;
  time?: string;
  people?: string;
  message: string;
}

export interface EnquiryResponse {
  ok: boolean;
  delivery?: "email" | "whatsapp_fallback";
  message?: string;
  whatsappUrl?: string;
  errors?: Record<string, string>;
  recipient?: string;
}
