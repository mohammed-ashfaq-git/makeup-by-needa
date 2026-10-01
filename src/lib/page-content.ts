/** Public page copy defaults and the field map used by the CMS editor. */
export const PAGE_CONTENT_FIELDS = {
  home: [
    ["homeHeroTitle", "Hero heading", "Beauty, artistry & confidence — created just for you."],
    ["homeHeroDescription", "Hero introduction", "Makeup, hairstyling and nail services, thoughtfully tailored to your style and every occasion worth remembering."],
    ["homeIntroTitle", "Introduction heading", "Refined artistry, made to feel like you."],
    ["homeIntroDescription", "Introduction copy", "Every appointment begins with listening: your vision, your occasion, and the details that make you feel most yourself."],
    ["homeIntroNote", "Introduction note", "From a clean gel manicure to a fully custom luxury set, each appointment is approached with care and tailored to your personal style."],
    ["homeServicesTitle", "Services heading", "Makeup, hair & nail services."],
    ["homeServicesDescription", "Services introduction", "Explore makeup, hair and nail services, with current prices and details for every category."],
    ["homePortfolioTitle", "Portfolio heading", "The beauty is in the details."],
    ["homePortfolioDescription", "Portfolio introduction", "A growing portfolio of work by Needa."],
    ["homeTestimonialsTitle", "Testimonials heading", "Loved by clients."],
    ["homeTestimonialsDescription", "Testimonials introduction", "What clients say about their experience."],
    ["homeApproachTitle", "Approach heading", "Intentional from the first conversation to the final touch."],
    ["homeApproachDescription", "Approach introduction", "Your appointment should feel considered, comfortable, and completely personal."],
    ["homeSocialTitle", "Social heading", "Beauty beyond the appointment."],
    ["homeSocialDescription", "Social introduction", "Follow the official Instagram channels for the latest sets, portfolio updates and nail inspiration."],
    ["homeCtaTitle", "Booking callout heading", "Let’s create something beautiful."],
    ["homeCtaDescription", "Booking callout introduction", "Share a few details about your occasion, preferred service, and the set you have in mind. Needa will review your enquiry and connect with you directly."],
  ],
  about: [
    ["aboutTitle", "Page heading", "Needa — Founder & Nail Technician"],
    ["aboutIntroduction", "Page introduction", "Welcome to Needa Beauty Lab."],
    ["aboutStory", "Artist story", "I’m Needa, the founder and nail technician behind Needa Beauty Lab. With 5+ years of experience in the beauty industry, my passion is creating personalized beauty looks that help every client feel confident, comfortable and beautiful."],
  ],
  services: [
    ["servicesTitle", "Page heading", "Beauty services & price list."],
    ["servicesIntroduction", "Page introduction", "Explore makeup, hair and nail services with transparent pricing. From everyday glam to special occasions, find a look that feels like you."],
  ],
  gallery: [
    ["galleryTitle", "Page heading", "Moments, made memorable."],
    ["galleryIntroduction", "Page introduction", "A growing collection of beauty work, from refined everyday details to the artistry created for meaningful occasions."],
  ],
  contact: [
    ["contactTitle", "Page heading", "Get in touch."],
    ["contactIntroduction", "Page introduction", "Questions about a service or your upcoming occasion? Send a note and Needa will be in touch."],
  ],
  booking: [
    ["bookingTitle", "Page heading", "Let’s plan your appointment."],
    ["bookingIntroduction", "Page introduction", "Tell us a little about the look you have in mind and the date you’re planning for. Needa will follow up to confirm availability and details."],
  ],
} as const;

export type PageContentKey = (typeof PAGE_CONTENT_FIELDS)[keyof typeof PAGE_CONTENT_FIELDS][number][0];
export type PageContent = Record<PageContentKey, string>;

export const DEFAULT_PAGE_CONTENT = Object.fromEntries(
  Object.values(PAGE_CONTENT_FIELDS).flat().map(([key, , value]) => [key, value]),
) as PageContent;

export function mergePageContent(raw: string | null | undefined): PageContent {
  if (!raw) return DEFAULT_PAGE_CONTENT;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return DEFAULT_PAGE_CONTENT;
    }
    const values = parsed as Record<string, unknown>;
    const merged = Object.fromEntries(
      Object.entries(DEFAULT_PAGE_CONTENT).map(([key, fallback]) => [
        key,
        typeof values[key] === "string" && values[key].trim()
          ? values[key].trim()
          : fallback,
      ]),
    ) as PageContent;

    // Upgrade the exact old defaults in persisted site content while keeping
    // any copy the owner has customized in the CMS.
    if (merged.homeServicesTitle === "Premium nail services.") {
      merged.homeServicesTitle = DEFAULT_PAGE_CONTENT.homeServicesTitle;
    }
    if (merged.homeServicesDescription.startsWith("From natural nail care to signature sets.")) {
      merged.homeServicesDescription = DEFAULT_PAGE_CONTENT.homeServicesDescription;
    }
    if (merged.homeHeroDescription.startsWith("Premium gel manicures, extensions, nail art and signature sets")) {
      merged.homeHeroDescription = DEFAULT_PAGE_CONTENT.homeHeroDescription;
    }

    return merged;
  } catch {
    return DEFAULT_PAGE_CONTENT;
  }
}
