import type { Metadata } from "next";
import "./globals.css";
import "./refinement.css";
import "./admin.css";
import { getSettings } from "@/lib/cms";
import { getAbsoluteSiteUrl, getSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  // Business name and homepage copy come from the CMS; the static config
  // in lib/site-data is only used if the database is unavailable.
  const settings = await getSettings();
  const homeUrl = getAbsoluteSiteUrl("/");

  return {
    metadataBase: getSiteUrl() ?? undefined,
    applicationName: settings.businessName,
    title: {
      default: settings.homeTitle,
      template: `%s | ${settings.businessName}`,
    },
    description: settings.homeDescription,
    openGraph: {
      title: settings.homeTitle,
      description: settings.homeDescription,
      locale: "en_CA",
      type: "website",
      siteName: settings.businessName,
      url: homeUrl,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
