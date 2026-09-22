import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getServices, getSettings } from "@/lib/cms";
import {
  hairInfoBlocks,
  hairMenuBrand,
  hairServiceSections,
} from "@/lib/hair-services";
import { getAbsoluteSiteUrl } from "@/lib/site-url";
import styles from "./services.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = `Aura Beauty hairstyling services & price list — everyday hair, bridal, South Asian, event styling, extensions and more. Makeup and nail artistry also available.`;
  const canonicalUrl = getAbsoluteSiteUrl("/services");

  return {
    title: "Services",
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title: `Services | ${settings.businessName}`,
      description,
      type: "website",
      locale: "en_CA",
      siteName: settings.businessName,
      url: canonicalUrl,
    },
  };
}

const categories = ["Makeup", "Hair", "Nails"] as const;

const categoryContent: Record<
  (typeof categories)[number],
  {
    title: string;
    eyebrow: string;
    intro: string;
    visualLabel: string;
    direction: string;
    enquiryLabel: string;
  }
> = {
  Makeup: {
    title: "Makeup artistry",
    eyebrow: "01 · Makeup",
    intro:
      "A considered beauty look for celebrations, portraits, and occasions that call for a little more intention.",
    visualLabel: "Makeup artistry",
    direction: "visual-left",
    enquiryLabel: "makeup",
  },
  Hair: {
    title: "Hair styling",
    eyebrow: "02 · Hair",
    intro:
      "Elegant updos, romantic waves, and sleek finishes designed to complement your features, outfit, and occasion. See the full Aura Beauty hairstyling price list below.",
    visualLabel: "Hair styling",
    direction: "visual-right",
    enquiryLabel: "hair styling",
  },
  Nails: {
    title: "Nail artistry",
    eyebrow: "03 · Nail Art",
    intro:
      "Detailed finishes and expressive design, shaped around your celebration, personal style, and preferred level of detail.",
    visualLabel: "Nail artistry",
    direction: "visual-left",
    enquiryLabel: "nail art",
  },
};

export default async function Services() {
  const [services, settings] = await Promise.all([
    getServices(),
    getSettings(),
  ]);

  const makeupAndNails = categories.filter((category) => category !== "Hair");

  return (
    <div className={styles.scope}>
      <main>
        <section className="page-hero services-page-hero">
          <div className="shell">
            <div className="services-hero-copy">
              <p className="eyebrow">Aura Beauty · Services & Price List</p>

              <h1>
                Hairstyling, makeup
                <br />
                &amp; nails — <i>Confident You.</i>
              </h1>

              <p className="lede">
                Explore the full Aura Beauty hairstyling menu with transparent
                pricing, plus makeup and nail artistry designed around your
                occasion, personal style, and the finish you want to feel
                confident in.
              </p>

              <div className="services-hero-actions">
                <Link className="button" href="/book">
                  Book Your Appointment
                </Link>

                <a className="text-link" href="#hair-menu">
                  View hair price list <b>→</b>
                </a>
              </div>

              <div className="services-hero-meta">
                <span>{hairMenuBrand.location}</span>
                <span>{settings.hours || "By appointment"}</span>
              </div>
            </div>

            <div className="services-hero-number" aria-hidden="true">
              <span>AB</span>
              <small>Hair · Makeup · Nails</small>
            </div>
          </div>
        </section>

        <section className="services-introduction">
          <div className="shell services-introduction-grid">
            <div>
              <p className="eyebrow">The collection</p>
            </div>

            <div>
              <h2>
                From everyday styling
                <br />
                to <i>bridal beauty.</i>
              </h2>

              <p>
                Whether you are preparing for a bridal celebration, an
                engagement, an event, a photoshoot, or simply want beautifully
                finished hair, each service can be discussed and tailored during
                your enquiry. Final pricing is confirmed before your
                appointment.
              </p>
            </div>
          </div>
        </section>

        {/* ---- Full Aura Beauty Hairstyling Price List ---- */}
        <section className="hair-menu" id="hair-menu">
          <div className="shell">
            <header className="hair-menu-header">
              <p className="eyebrow">Price List</p>
              <p className="hair-menu-brand">{hairMenuBrand.name}</p>
              <h2>{hairMenuBrand.title}</h2>
              <p className="hair-menu-tagline">{hairMenuBrand.tagline}</p>
              <div className="hair-menu-divider" aria-hidden="true" />
            </header>

            <nav className="hair-menu-toc" aria-label="Hairstyling categories">
              {hairServiceSections.map((section) => (
                <a key={section.id} href={`#hair-${section.id}`}>
                  {section.emoji} {section.title}
                </a>
              ))}
              {hairInfoBlocks.map((block) => (
                <a key={block.id} href={`#hair-${block.id}`}>
                  {block.emoji} {block.title}
                </a>
              ))}
            </nav>

            {hairServiceSections.map((section) => (
              <section
                className="hair-section"
                id={`hair-${section.id}`}
                key={section.id}
              >
                <div className="hair-section-heading">
                  <span aria-hidden="true">{section.emoji}</span>
                  <h3>{section.title}</h3>
                </div>

                {section.items.map((item) => (
                  <article className="hair-item" key={item.name}>
                    <h4 className="hair-item-name">{item.name}</h4>
                    <div className="hair-item-price">{item.price}</div>

                    {item.description ? (
                      <p className="hair-item-desc">{item.description}</p>
                    ) : null}

                    {item.details && item.details.length > 0 ? (
                      <ul className="hair-item-details">
                        {item.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}

                {section.note ? (
                  <p className="hair-section-note">{section.note}</p>
                ) : null}
              </section>
            ))}

            <div className="hair-info-grid">
              {hairInfoBlocks.map((block) => (
                <aside
                  className="hair-info-card"
                  id={`hair-${block.id}`}
                  key={block.id}
                >
                  <h3>
                    <span aria-hidden="true">{block.emoji}</span>
                    {block.title}
                  </h3>

                  {block.intro ? <p className="intro">{block.intro}</p> : null}

                  <ul>
                    {block.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>

                  {block.footer ? (
                    <p className="footer-note">{block.footer}</p>
                  ) : null}
                </aside>
              ))}
            </div>

            <div className="hair-menu-signoff">
              <strong>{hairMenuBrand.name}</strong>
              <span className="disciplines">{hairMenuBrand.disciplines}</span>
              <em>{hairMenuBrand.closing}</em>
              <span className="location">{hairMenuBrand.location}</span>

              <div className="hair-menu-cta">
                <Link className="button" href="/book">
                  Book Hairstyling
                </Link>
                <Link className="text-link" href="/contact">
                  Ask a question <b>→</b>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Makeup & Nails (CMS-driven) ---- */}
        {services.length === 0 && (
          <section className="section">
            <div className="shell">
              <div className="empty-state">
                <p className="eyebrow">More services</p>
                <p>
                  Makeup and nail artistry menus are being updated. Please
                  enquire and {settings.businessName} will be happy to help.
                </p>
              </div>
            </div>
          </section>
        )}

        {makeupAndNails.map((category, categoryIndex) => {
          const content = categoryContent[category];
          const categoryServices = services.filter(
            (service) => service.category === category,
          );
          const categoryImage = categoryServices.find(
            (service) => service.imageUrl,
          )?.imageUrl;

          if (categoryServices.length === 0) return null;

          return (
            <section
              className={`service-feature ${content.direction}`}
              key={category}
            >
              <div className="service-feature-background" />

              <div className="shell service-feature-grid">
                <div
                  className={`service-feature-visual ${category.toLowerCase()}-visual`}
                >
                  <div className="service-feature-frame" />

                  {categoryImage ? (
                    <Image
                      className="service-feature-image"
                      src={categoryImage}
                      alt={content.visualLabel}
                      fill
                      sizes="(max-width: 1000px) 92vw, 42vw"
                    />
                  ) : null}

                  <div className="service-visual-overlay">
                    <span>{content.visualLabel}</span>
                    <strong>0{categoryIndex + 1}</strong>
                  </div>
                </div>

                <div className="service-feature-content">
                  <p className="eyebrow">{content.eyebrow}</p>

                  <h2>{content.title}</h2>

                  <p className="service-intro">{content.intro}</p>

                  <div className="service-blocks">
                    {categoryServices.map((service, serviceIndex) => (
                      <article className="service-block" key={service.id}>
                        <span className="block-number">
                          {String(serviceIndex + 1).padStart(2, "0")}
                        </span>

                        <div className="service-block-main">
                          <h3>{service.name}</h3>
                          <p>
                            {service.shortDescription || service.description}
                          </p>
                        </div>

                        <div className="block-detail">
                          <strong>{service.priceDisplay}</strong>
                          <span>
                            {service.duration || "Duration on enquiry"}
                          </span>

                          <Link href="/book">
                            Enquire <b>→</b>
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>

                  <Link className="button service-enquiry" href="/book">
                    Enquire about {content.enquiryLabel}
                  </Link>
                </div>
              </div>
            </section>
          );
        })}

        <section className="services-closing">
          <div className="shell">
            <div className="services-closing-inner">
              <div>
                <p className="eyebrow">Your appointment</p>

                <h2>
                  Ready to book
                  <br />
                  your <i>look?</i>
                </h2>
              </div>

              <div className="services-closing-copy">
                <p>
                  Tell me about your occasion, preferred service, and the look
                  you have in mind. Timing, details, and final pricing can then
                  be confirmed together — including the $10 booking deposit to
                  secure your appointment.
                </p>

                <Link className="text-link" href="/book">
                  Start an appointment enquiry <b>→</b>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
