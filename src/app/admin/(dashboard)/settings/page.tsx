import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { DbError } from "@/components/admin/DbError";
import { queryWithFallback } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { getSettingsDefaults } from "@/lib/schemas";

export const metadata: Metadata = { title: "Website Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();

  // Prefer the saved row; fall back to the static defaults for the form.
  const row = await queryWithFallback((db) =>
    db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1),
  );

  if (row && row.length === 0 && queryWithFallback !== null) {
    // Database reachable but not seeded — show defaults.
  }

  const fallback = getSettingsDefaults();
  const saved = row?.[0];

  const dbDown = row === null;

  const initial = saved
    ? {
        businessName: saved.businessName,
        logoUrl: saved.logoUrl,
        heroImageUrl: saved.heroImageUrl,
        heroImageMobileUrl: saved.heroImageMobileUrl,
        phone: saved.phone,
        email: saved.email,
        whatsappNumber: saved.whatsappNumber,
        whatsappDisplay: saved.whatsappDisplay,
        whatsappMessage: saved.whatsappMessage,
        location: saved.location,
        address: saved.address,
        hours: saved.hours,
        instagramMakeupHandle: saved.instagramMakeupHandle,
        instagramMakeupUrl: saved.instagramMakeupUrl,
        instagramNailsHandle: saved.instagramNailsHandle,
        instagramNailsUrl: saved.instagramNailsUrl,
        facebookUrl: saved.facebookUrl,
        homeTitle: saved.homeTitle,
        homeDescription: saved.homeDescription,
        footerText: saved.footerText,
      }
    : {
        businessName: fallback.businessName,
        logoUrl: null,
        heroImageUrl: null,
        heroImageMobileUrl: null,
        phone: fallback.phone,
        email: fallback.email,
        whatsappNumber: fallback.whatsappNumber,
        whatsappDisplay: fallback.whatsappDisplay,
        whatsappMessage: fallback.whatsappMessage,
        location: fallback.location,
        address: fallback.address,
        hours: fallback.hours,
        instagramMakeupHandle: fallback.instagramMakeupHandle,
        instagramMakeupUrl: fallback.instagramMakeupUrl,
        instagramNailsHandle: fallback.instagramNailsHandle,
        instagramNailsUrl: fallback.instagramNailsUrl,
        facebookUrl: fallback.facebookUrl,
        homeTitle: fallback.homeTitle,
        homeDescription: fallback.homeDescription,
        footerText: fallback.footerText,
      };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Website Settings</h1>
          <p>
            Business details shown across the website — contact channels,
            social links, homepage title and footer.
          </p>
        </div>
      </div>

      {dbDown ? <DbError /> : <SettingsForm initial={initial} />}
    </>
  );
}
