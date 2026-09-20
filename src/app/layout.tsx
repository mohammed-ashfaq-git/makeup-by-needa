import type { Metadata } from "next";
import "./globals.css";
import "./refinement.css";
import "./admin.css";

export const metadata: Metadata = {
  title: {
    default: "Makeup by Needa | Toronto Makeup Artist",
    template: "%s | Makeup by Needa",
  },
  description: "Makeup, hair and nail artistry in Toronto, Canada.",
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
      <body>{children}</body>
    </html>
  );
}
