/**
 * CMS content layer for the public website.
 *
 * Every getter tries the database first and falls back to the static
 * configuration in `lib/site-data.ts` when the database is unavailable
 * or a table has not been seeded yet. Public pages therefore never
 * render blank.
 *
 * Getters are wrapped in React `cache()` so a single request that renders
 * the layout plus several components never queries the same data twice.
 */
import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import {
  artistProfile,
  faqs,
  galleryItems as galleryTable,
  services as servicesTable,
  siteSettings,
  testimonials as testimonialsTable,
} from "@/lib/db/schema";
import { queryWithFallback } from "@/lib/db";
import {
  artist as staticArtist,
  business,
  galleryItems as staticGallery,
  services as staticServices,
} from "@/lib/site-data";

/* ------------------------------------------------------------------ */
/* View types used by public pages                                     */
/* ------------------------------------------------------------------ */

export type PublicSettings = {
  businessName: string;
  logoUrl: string;
  /** Homepage hero image; NULL → use the first active gallery image. */
  heroImageUrl: string | null;
  phone: string | null;
  email: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  whatsappMessage: string;
  location: string;
  address: string | null;
  hours: string | null;
  instagramMakeupHandle: string;
  instagramMakeupUrl: string;
  instagramNailsHandle: string;
  instagramNailsUrl: string;
  facebookUrl: string | null;
  homeTitle: string;
  homeDescription: string;
  footerText: string;
};

export type PublicService = {
  id: number;
  name: string;
  category: "Makeup" | "Hair" | "Nails";
  shortDescription: string | null;
  description: string;
  /** Display text, e.g. "$150", "From $120" or "Enquire for pricing". */
  priceDisplay: string;
  hasNumericPrice: boolean;
  duration: string | null;
  imageUrl: string | null;
  featured: boolean;
};

export type PublicGalleryItem = {
  id: number;
  title: string;
  category: "Makeup" | "Bridal" | "Hair" | "Nails";
  imageUrl: string;
  altText: string;
  caption: string | null;
};

export type PublicTestimonial = {
  id: number;
  clientName: string;
  quote: string;
  rating: number;
  photoUrl: string | null;
  service: string | null;
};

export type PublicFaq = {
  id: number;
  question: string;
  answer: string;
};

export type PublicArtist = {
  name: string;
  photoUrl: string | null;
  shortBio: string;
  /** Split into paragraphs on blank lines. */
  bioParagraphs: string[];
  experience: string | null;
  specialties: string[];
  qualifications: string[];
  location: string | null;
  instagram: string | null;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatPrice(price: string | null): string | null {
  if (price == null) return null;
  const value = Number(price);
  if (Number.isNaN(value)) return null;
  const formatted = value.toFixed(2).replace(/\.00$/, "");
  return `$${formatted}`;
}

function splitLines(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitParagraphs(value: string): string[] {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const getSettings = cache(async (): Promise<PublicSettings> => {
  const rows = await queryWithFallback((db) =>
    db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1),
  );
  const row = rows?.[0];

  if (!row) {
    return {
      businessName: business.name,
      logoUrl: "/makeup-by-needa-logo.jpg",
      heroImageUrl: null,
      phone: null,
      email: business.email,
      whatsappNumber: business.whatsapp,
      whatsappDisplay: business.whatsappDisplay,
      whatsappMessage: business.whatsappMessage,
      location: business.location,
      address: null,
      hours: business.hours,
      instagramMakeupHandle: business.instagramMakeup,
      instagramMakeupUrl: business.instagramMakeupUrl,
      instagramNailsHandle: business.instagramNails,
      instagramNailsUrl: business.instagramNailsUrl,
      facebookUrl: null,
      homeTitle: business.homeTitle,
      homeDescription: business.homeDescription,
      footerText: business.footerText,
    };
  }

  return {
    businessName: row.businessName || business.name,
    logoUrl: row.logoUrl || "/makeup-by-needa-logo.jpg",
    heroImageUrl: row.heroImageUrl || null,
    phone: row.phone || null,
    email: row.email || business.email,
    whatsappNumber: row.whatsappNumber || business.whatsapp,
    whatsappDisplay: row.whatsappDisplay || business.whatsappDisplay,
    whatsappMessage: row.whatsappMessage || business.whatsappMessage,
    location: row.location || business.location,
    address: row.address || null,
    hours: row.hours || null,
    instagramMakeupHandle:
      row.instagramMakeupHandle || business.instagramMakeup,
    instagramMakeupUrl: row.instagramMakeupUrl || business.instagramMakeupUrl,
    instagramNailsHandle: row.instagramNailsHandle || business.instagramNails,
    instagramNailsUrl: row.instagramNailsUrl || business.instagramNailsUrl,
    facebookUrl: row.facebookUrl || null,
    homeTitle: row.homeTitle || business.homeTitle,
    homeDescription: row.homeDescription || business.homeDescription,
    footerText: row.footerText || business.footerText,
  };
});

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export const getServices = cache(
  async (options?: { activeOnly?: boolean }): Promise<PublicService[]> => {
    const activeOnly = options?.activeOnly ?? true;

    const rows = await queryWithFallback((db) =>
      db
        .select()
        .from(servicesTable)
        .orderBy(asc(servicesTable.displayOrder), asc(servicesTable.id)),
    );

    if (!rows) {
      return staticServices.map((service, index) => ({
        id: index + 1,
        name: service.name,
        category: service.category,
        shortDescription: null,
        description: service.description,
        priceDisplay: service.price,
        hasNumericPrice: false,
        duration: service.duration,
        imageUrl: null,
        featured: Boolean(service.featured),
      }));
    }

    return rows
      .filter((row) => (activeOnly ? row.active : true))
      .map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        shortDescription: row.shortDescription,
        description: row.description,
        priceDisplay:
          row.priceDisplay || formatPrice(row.price) || "Enquire for pricing",
        hasNumericPrice: row.price != null,
        duration: row.duration,
        imageUrl: row.imageUrl,
        featured: row.featured,
      }));
  },
);

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export const getGalleryItems = cache(async (): Promise<PublicGalleryItem[]> => {
  const rows = await queryWithFallback((db) =>
    db
      .select()
      .from(galleryTable)
      .orderBy(asc(galleryTable.displayOrder), asc(galleryTable.id)),
  );

  if (!rows) {
    return staticGallery.map((item, index) => ({
      id: index + 1,
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      altText: item.altText,
      caption: null,
    }));
  }

  return rows
    .filter((row) => row.active && row.imageUrl)
    .map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      imageUrl: row.imageUrl,
      altText: row.altText || row.title,
      caption: row.caption,
    }));
});

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

export const getTestimonials = cache(async (): Promise<PublicTestimonial[]> => {
  const rows = await queryWithFallback((db) =>
    db
      .select()
      .from(testimonialsTable)
      .orderBy(asc(testimonialsTable.displayOrder), asc(testimonialsTable.id)),
  );

  if (!rows) return [];

  return rows
    .filter((row) => row.active)
    .map((row) => ({
      id: row.id,
      clientName: row.clientName,
      quote: row.quote,
      rating: row.rating,
      photoUrl: row.photoUrl,
      service: row.service,
    }));
});

/* ------------------------------------------------------------------ */
/* FAQs                                                                */
/* ------------------------------------------------------------------ */

export const getFaqs = cache(async (): Promise<PublicFaq[]> => {
  const rows = await queryWithFallback((db) =>
    db.select().from(faqs).orderBy(asc(faqs.displayOrder), asc(faqs.id)),
  );

  if (!rows) return [];

  return rows
    .filter((row) => row.active)
    .map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
    }));
});

/* ------------------------------------------------------------------ */
/* Artist                                                              */
/* ------------------------------------------------------------------ */

export const getArtist = cache(async (): Promise<PublicArtist> => {
  const rows = await queryWithFallback((db) =>
    db.select().from(artistProfile).where(eq(artistProfile.id, 1)).limit(1),
  );
  const row = rows?.[0];

  if (!row) {
    return {
      name: staticArtist.name,
      photoUrl: null,
      shortBio: staticArtist.shortBio,
      bioParagraphs: splitParagraphs(staticArtist.bio),
      experience: staticArtist.experience || null,
      specialties: splitLines(staticArtist.specialties),
      qualifications: splitLines(staticArtist.qualifications),
      location: staticArtist.location,
      instagram: staticArtist.instagram,
    };
  }

  return {
    name: row.name || staticArtist.name,
    photoUrl: row.photoUrl || null,
    shortBio: row.shortBio || staticArtist.shortBio,
    bioParagraphs: splitParagraphs(row.bio || staticArtist.bio),
    experience: row.experience || null,
    specialties: splitLines(row.specialties),
    qualifications: splitLines(row.qualifications),
    location: row.location || null,
    instagram: row.instagram || null,
  };
});
