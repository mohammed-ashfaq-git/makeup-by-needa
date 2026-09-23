/**
 * Zod validation schemas + form defaults (plain module, safe to import
 * from server actions and server components alike).
 *
 * Form readers can produce `null` for empty fields, so every schema below
 * is written to tolerate null/undefined input and produce clean,
 * user-friendly messages.
 */
import { z } from "zod";
import { business } from "@/lib/site-data";

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

/** Required, trimmed, non-empty string with a friendly message. */
const requiredText = (max: number, message: string) =>
  z.preprocess(
    (v) => (v == null ? "" : v),
    z.string().trim().min(1, message).max(max),
  );

/** Optional string: null/undefined/"" all become null. */
const optionalText = (max: number) =>
  z.preprocess(
    (v) => (v == null ? null : v),
    z
      .string()
      .trim()
      .max(max)
      .nullable()
      .transform((v) => (v ? v : null)),
  );

/** Optional URL: empty becomes null, otherwise must be a valid http(s) URL. */
const optionalUrl = z.preprocess(
  (v) => (v == null || v === "" ? null : v),
  z
    .string()
    .trim()
    .url("Please enter a full URL (https://…)")
    .max(500)
    .refine((v) => /^https?:\/\//.test(v), "Please enter a full URL (https://…)")
    .nullable(),
);

/** Required http(s) URL. */
const requiredUrl = (message: string) =>
  z.preprocess(
    (v) => (v == null ? "" : v),
    z
      .string()
      .trim()
      .min(1, message)
      .url("Please enter a full URL (https://…)")
      .max(500)
      .refine((v) => /^https?:\/\//.test(v), "Please enter a full URL (https://…)"),
  );

/** Price: null/"" → null (Enquire for pricing), otherwise "123.45". */
const priceValue = z.preprocess(
  (v) => (v == null || `${v}`.trim() === "" ? null : `${v}`),
  z
    .string()
    .max(20)
    .refine(
      (v) => /^\$?\s?\d[\d,]*(\.\d{1,2})?$/.test(v),
      'Price must be a number like 150 or 150.00 (or leave blank for "Enquire for pricing").',
    )
    .nullable()
    .transform((v) => {
      if (v == null) return null;
      return Number.parseFloat(v.replace(/[$,\s]/g, "")).toFixed(2);
    }),
);

/* ------------------------------------------------------------------ */
/* Website settings                                                    */
/* ------------------------------------------------------------------ */

export const settingsSchema = z.object({
  businessName: requiredText(160, "Business name is required."),
  phone: optionalText(50),
  email: z.preprocess(
    (v) => (v == null ? "" : v),
    z.email("Please enter a valid email address.").max(255),
  ),
  whatsappNumber: z
    .string()
    .trim()
    .min(5, "WhatsApp number is required (digits only, e.g. 15483287786).")
    .max(30)
    .regex(
      /^\+?[0-9]+$/,
      "WhatsApp number should contain digits only (you may start with +).",
    ),
  whatsappDisplay: requiredText(50, "WhatsApp display number is required."),
  whatsappMessage: requiredText(500, "WhatsApp message is required."),
  location: requiredText(120, "Location is required."),
  address: optionalText(255),
  hours: optionalText(255),
  instagramMakeupHandle: requiredText(120, "Instagram handle is required."),
  instagramMakeupUrl: requiredUrl("Instagram link is required."),
  instagramNailsHandle: requiredText(120, "Instagram handle is required."),
  instagramNailsUrl: requiredUrl("Instagram link is required."),
  facebookUrl: optionalUrl,
  homeTitle: requiredText(255, "Homepage title is required."),
  homeDescription: requiredText(500, "Homepage description is required."),
  footerText: requiredText(500, "Footer text is required."),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export function getSettingsDefaults(): SettingsInput {
  return {
    businessName: business.name,
    phone: null,
    email: business.email,
    whatsappNumber: business.whatsapp.replace("+", ""),
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

/* ------------------------------------------------------------------ */
/* Artist / bio                                                        */
/* ------------------------------------------------------------------ */

export const artistSchema = z.object({
  name: requiredText(120, "Name is required."),
  shortBio: requiredText(500, "A short bio is required."),
  bio: z.preprocess(
    (v) => (v == null ? "" : v),
    z.string().trim().min(1, "The biography is required.").max(8000),
  ),
  experience: optionalText(255),
  specialties: z.preprocess(
    (v) => (v == null ? null : v),
    z
      .string()
      .trim()
      .max(2000)
      .nullable()
      .transform((v) => (v ? v : null)),
  ),
  qualifications: z.preprocess(
    (v) => (v == null ? null : v),
    z
      .string()
      .trim()
      .max(2000)
      .nullable()
      .transform((v) => (v ? v : null)),
  ),
  location: optionalText(120),
  instagram: optionalText(160),
});

export type ArtistInput = z.infer<typeof artistSchema>;

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export const SERVICE_CATEGORIES = ["Makeup", "Hair", "Nails"] as const;
export const GALLERY_CATEGORIES = ["Makeup", "Bridal", "Hair", "Nails"] as const;

export const serviceSchema = z.object({
  name: requiredText(160, "Service name is required."),
  category: z.enum(SERVICE_CATEGORIES, {
    message: "Please choose a category.",
  }),
  subcategory: optionalText(160),
  shortDescription: optionalText(300),
  description: requiredText(4000, "A description is required."),
  details: optionalText(4000),
  price: priceValue,
  priceDisplay: optionalText(100),
  duration: optionalText(100),
  featured: z.boolean(),
  active: z.boolean(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export const galleryItemSchema = z.object({
  title: requiredText(160, "Title is required."),
  category: z.enum(GALLERY_CATEGORIES, {
    message: "Please choose a category.",
  }),
  caption: optionalText(300),
  altText: optionalText(200),
  mediaType: z.enum(["image", "video"]).default("image"),
  videoUrl: optionalUrl,
  active: z.boolean(),
});

export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

export const testimonialSchema = z.object({
  clientName: requiredText(120, "Client name is required."),
  quote: requiredText(2000, "The testimonial is required."),
  rating: z.preprocess(
    (v) => (v == null ? 0 : v),
    z.coerce
      .number()
      .int("Rating must be a whole number.")
      .min(1, "Rating must be between 1 and 5.")
      .max(5, "Rating must be between 1 and 5."),
  ),
  service: optionalText(160),
  active: z.boolean(),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

/* ------------------------------------------------------------------ */
/* FAQs                                                                */
/* ------------------------------------------------------------------ */

export const faqSchema = z.object({
  question: requiredText(300, "The question is required."),
  answer: requiredText(4000, "The answer is required."),
  active: z.boolean(),
});

export type FaqInput = z.infer<typeof faqSchema>;

/* ------------------------------------------------------------------ */
/* Enquiries                                                           */
/* ------------------------------------------------------------------ */

export const ENQUIRY_STATUS_VALUES = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const enquiryStatusSchema = z.enum(ENQUIRY_STATUS_VALUES, {
  message: "Unknown status.",
});

export const enquirySubmissionSchema = z.object({
  name: requiredText(120, "Full name is required."),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(40)
    .regex(/^[0-9+()\s-]{7,20}$/, "Please enter a valid phone number."),
  email: z.preprocess(
    (v) => (v == null ? "" : v),
    z.email("A valid email address is required.").max(255),
  ),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A valid event date is required."),
  location: requiredText(160, "Location or city is required."),
  service: requiredText(200, "Please select a service."),
  time: optionalText(60),
  people: optionalText(40),
  message: requiredText(
    4000,
    "Please share a few details about your appointment.",
  ),
});

export type EnquirySubmission = z.infer<typeof enquirySubmissionSchema>;
