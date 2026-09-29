import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { PageTransition } from "@/components/motion";
import { ServiceCartProvider } from "@/components/service-cart";
import { getSettings } from "@/lib/cms";
import { nailSectionHref, nailServiceSections } from "@/lib/nail-services";

/**
 * Public website shell. Content is rendered per-request so CMS changes
 * appear immediately; if the database is unavailable the CMS getters fall
 * back to the static configuration.
 */
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <ServiceCartProvider
      businessName={settings.businessName}
      whatsappNumber={settings.whatsappNumber}
    >
      <SiteHeader
        businessName={settings.businessName}
        logoUrl={settings.logoUrl}
      />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter
        settings={settings}
        serviceLinks={nailServiceSections.map((section) => ({
          name: section.title,
          href: nailSectionHref(section),
        }))}
      />
      <WhatsAppButton
        whatsappNumber={settings.whatsappNumber}
        whatsappMessage={settings.whatsappMessage}
      />
    </ServiceCartProvider>
  );
}
