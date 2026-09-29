import type { Metadata } from "next";
import Link from "next/link";
import { AddToEnquiryButton } from "@/components/service-cart";
import {
  ServiceSearch,
  type ServiceSearchItem,
} from "@/components/service-search";
import { getSettings } from "@/lib/cms";
import {
  nailMenu,
  nailSectionId,
  nailServiceSections,
} from "@/lib/nail-services";
import { getAbsoluteSiteUrl } from "@/lib/site-url";
import styles from "./services.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = `${settings.businessName} premium nail services & price list — gel polish manicures, nail extensions, nail art, premium finishes, charms, removal and signature sets in ${settings.location}.`;
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

/**
 * Services page — publishes exactly one catalogue: the Premium Nail Services
 * & Price List from `lib/nail-services.ts`. Every section has its own anchor
 * (`#nail-…`) so the homepage slideshow and the search panel can link to it.
 */
export default async function Services() {
  const settings = await getSettings();

  // The price list is branded with the business name and location from the
  // CMS, so the menu never falls back to another studio's copy.
  const brandName = settings.businessName;
  const brandInitials = brandName
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 3)
    .toUpperCase();

  const serviceCount = nailServiceSections.reduce(
    (total, section) => total + section.items.length,
    0,
  );

  /** Everything the search panel can find and jump to. */
  const searchItems: ServiceSearchItem[] = nailServiceSections.flatMap(
    (section) =>
      section.items.map((item) => ({
        id: `${nailSectionId(section)}-${item.name}`,
        name: item.name,
        price: item.price,
        description: item.description,
        group: section.title,
        href: `#${nailSectionId(section)}`,
      })),
  );

  return (
    <div className={styles.scope}>
      <main>
        <section className="page-hero services-page-hero">
          <div className="shell">
            <div className="services-hero-copy">
              <p className="eyebrow">{brandName} · Services &amp; Price List</p>

              <h1>
                Premium nail services
                <br />
                &amp; <i>price list.</i>
              </h1>

              <p className="lede">
                Gel polish manicures, nail extensions, nail art, premium
                finishes, charms and signature sets — {serviceCount} services
                with transparent pricing, each tailored to your preferred
                length, shape and style.
              </p>

              <div className="services-hero-actions">
                <Link className="button" href="/book">
                  Book Your Appointment
                </Link>

                <a className="text-link" href="#nail-menu">
                  View price list <b>→</b>
                </a>
              </div>

              <div className="services-hero-meta">
                <span>{settings.location}</span>
                <span>{settings.hours || "By appointment"}</span>
              </div>
            </div>

            <div className="services-hero-number" aria-hidden="true">
              <span>{brandInitials}</span>
              <small>Nail Technician</small>
            </div>
          </div>
        </section>

        {/* ---- Search across the price list ---- */}
        <ServiceSearch
          items={searchItems}
          groups={nailServiceSections.map((section) => section.title)}
        />

        {/* ---- Premium Nail Services & Price List ---- */}
        <section className="nail-menu" id="nail-menu">
          <div className="shell">
            <header className="nail-menu-header">
              <p className="eyebrow">Price List</p>
              <p className="nail-menu-brand">{brandName.toUpperCase()}</p>
              <h2>{nailMenu.title}</h2>
              <div className="nail-menu-divider" aria-hidden="true" />
            </header>

            <nav className="nail-menu-toc" aria-label="Nail service categories">
              {nailServiceSections.map((section) => (
                <a key={section.id} href={`#${nailSectionId(section)}`}>
                  {section.emoji} {section.title}
                </a>
              ))}
            </nav>

            {nailServiceSections.map((section) => (
              <section
                className="nail-section"
                id={nailSectionId(section)}
                key={section.id}
              >
                <div className="nail-section-heading">
                  <span aria-hidden="true">{section.emoji}</span>
                  <h3>{section.title}</h3>
                </div>

                {section.items.map((item) => (
                  <article className="nail-item" key={item.name}>
                    <div className="nail-item-row-main">
                      <div className="nail-item-info">
                        <h4 className="nail-item-name">{item.name}</h4>
                        <div className="nail-item-price">{item.price}</div>
                      </div>
                      <div className="nail-item-btn-wrapper">
                        <AddToEnquiryButton
                          service={{
                            name: item.name,
                            category: "Nails",
                            subcategory: section.title,
                            price: item.price,
                          }}
                        />
                      </div>
                    </div>

                    {item.description ? (
                      <p className="nail-item-desc">{item.description}</p>
                    ) : null}
                  </article>
                ))}

                <p className="nail-section-note">{nailMenu.pricingNote}</p>
              </section>
            ))}

            <div className="nail-menu-signoff">
              <strong>{brandName}</strong>
              <span className="disciplines">Nail Technician</span>
              <span className="location">{settings.location}</span>

              <div className="nail-menu-cta">
                <Link className="button" href="/book">
                  Book Your Appointment
                </Link>
                <Link className="text-link" href="/contact">
                  Ask a question <b>→</b>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="services-closing">
          <div className="shell">
            <div className="services-closing-inner">
              <div>
                <p className="eyebrow">Your appointment</p>

                <h2>
                  Ready to book
                  <br />
                  your <i>set?</i>
                </h2>
              </div>

              <div className="services-closing-copy">
                <p>
                  Tell me which service you would like, your preferred length
                  and shape, and any inspiration you have in mind. Timing,
                  details and final pricing can then be confirmed together —
                  including the $10 booking deposit to secure your appointment.
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
