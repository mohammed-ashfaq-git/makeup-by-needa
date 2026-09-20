import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { PageTransition } from "@/components/motion";
import { getServices, getSettings } from "@/lib/cms";

/**
 * Public website shell. Content is rendered per-request so CMS changes
 * appear immediately; if the database is unavailable the CMS getters fall
 * back to the static configuration.
 */
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: LayoutProps<"/">) {
  const [settings, services] = await Promise.all([
    getSettings(),
    getServices(),
  ]);

  const flagged = services.filter((service) => service.featured);
  const featuredServices = (
    flagged.length > 0 ? flagged : services
  ).slice(0, 6);

  return (
    <>
      <SiteHeader
        businessName={settings.businessName}
        logoUrl={settings.logoUrl}
      />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter
        settings={settings}
        featuredServices={featuredServices.map((service) => ({
          name: service.name,
          category: service.category,
        }))}
      />
      <WhatsAppButton
        whatsappNumber={settings.whatsappNumber}
        whatsappMessage={settings.whatsappMessage}
      />
    </>
  );
}
