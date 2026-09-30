import type { Metadata } from "next";
import { Gallery } from "@/components/gallery";
import { getGalleryItems, getPageContent, getSettings } from "@/lib/cms";
import { getAbsoluteSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = "Browse the portfolio — nail sets, nail designs and beauty work by Needa.";
  const canonicalUrl = getAbsoluteSiteUrl("/gallery");

  return {
    title: "Gallery",
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title: `Gallery | ${settings.businessName}`,
      description,
      type: "website",
      locale: "en_CA",
      siteName: settings.businessName,
      url: canonicalUrl,
    },
  };
}

export default async function GalleryPage() {
  const [items, settings, content] = await Promise.all([
    getGalleryItems(),
    getSettings(),
    getPageContent(),
  ]);

  return (
    <main>
      <section className="page-hero gallery-page-hero">
        <div className="shell">
          <div className="gallery-hero-layout">
            <div>
              <p className="eyebrow">Portfolio · Nail Technician</p>

              <h1>{content.galleryTitle}</h1>

              <p className="lede">
                {content.galleryIntroduction}
              </p>

              <div className="gallery-hero-meta">
                <span>Nail Technician</span>
                <span>Makeup</span>
                <span>Hair</span>
              </div>
            </div>

            <div className="gallery-hero-mark" aria-hidden="true">
              <span>04</span>
              <small>Portfolio</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section cream gallery-collection-section">
        <div className="shell">
          <div className="gallery-introduction">
            <div>
              <p className="eyebrow">The collection</p>
            </div>

            <div>
              <h2>
                Beauty in every
                <br />
                <i>detail.</i>
              </h2>

              <p>
                Explore the portfolio by beauty discipline and occasion. New
                work can be added as the {settings.businessName} portfolio
                continues to grow.
              </p>
            </div>
          </div>

          <Gallery
            items={items}
            businessName={settings.businessName}
            location={settings.location}
          />
        </div>
      </section>

      <section className="gallery-closing-section">
        <div className="shell">
          <div className="gallery-closing">
            <p className="eyebrow">Your look, your moment</p>

            <h2>
              Ready to create
              <br />
              something <i>beautiful?</i>
            </h2>

            <a className="button" href="/book">
              Book Your Appointment
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
