import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppButton } from "@/components/features/whatsapp-button";
import { PageTransition } from "@/components/motion/motion";

export const metadata: Metadata = {
  title: {
    default: "Makeup by Needa | Toronto Makeup Artist",
    template: "%s | Makeup by Needa",
  },
  description:
    "Makeup, hair and nail artistry in Toronto, Canada. Thoughtful beauty artistry for bridal moments, celebrations, and special occasions.",
  openGraph: {
    title: "Makeup by Needa",
    description: "Beauty artistry for your most meaningful moments.",
    locale: "en_CA",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <WhatsAppButton />
      </body>
    </html>
  );
}
