import type { Metadata } from "next";
import Link from "next/link";
import { AddToEnquiryButton } from "@/components/service-cart";
import {
  ServiceSearch,
  type ServiceSearchItem,
} from "@/components/service-search";
import { getPageContent, getServices, getSettings } from "@/lib/cms";
import {
  nailMenu,
  nailSectionId,
  nailServiceSections,
} from "@/lib/nail-services";
import { auraSections, bookingNotes } from "@/lib/aura-services";
import { getAbsoluteSiteUrl } from "@/lib/site-url";
import styles from "./services.module.css";

const SERVICE_GROUPS = [
  { id: "nails", label: "Nails" },
  { id: "makeup", label: "Makeup" },
  { id: "bridal", label: "Bridal" },
  { id: "hair", label: "Hair" },
  { id: "packages", label: "Packages" },
  { id: "extras", label: "Extras" },
] as const;

const auraGroupOrder = SERVICE_GROUPS.map((group) => group.label);

function serviceGroup(category: string, subcategory: string, name: string) {
  const detail = `${subcategory} ${name}`.toLowerCase();
  if (/package/.test(detail) || category === "Packages") return "Packages";
  if (/add[- ]?on|extra|removal|touch[- ]?up/.test(detail)) return "Extras";
  if (category === "Nails") return "Nails";
  if (category === "Hair") return "Hair";
  if (/bridal|bride|wedding|trial|bridesmaid|family/.test(detail) || category === "Bridal") return "Bridal";
  return "Makeup";
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = `${settings.businessName} nail, makeup, hair and bridal services & price list — gel manicures, event makeup, bridal looks and hairstyling in ${settings.location}.`;
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
 * Services page — publishes nail services alongside the Aura Beauty makeup,
 * bridal and hair menus. Each section has an anchor for search navigation.
 */
export default async function Services() {
  const [settings, cmsServices, content] = await Promise.all([getSettings(), getServices(), getPageContent()]);
  const useCmsServices = cmsServices.length > 0;

  // The price list is branded with the business name and location from the
  // CMS, so the menu never falls back to another studio's copy.
  const brandName = settings.businessName;
  const brandInitials = brandName
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 3)
    .toUpperCase();

  /** Keep filters broad while each result still jumps to its details. */
  const searchItems: ServiceSearchItem[] = useCmsServices
    ? cmsServices.map((service) => {
        const group = serviceGroup(service.category, service.subcategory ?? "", service.name);
        const groupId = SERVICE_GROUPS.find((candidate) => candidate.label === group)?.id ?? "makeup";
        return {
          id: `cms-${service.id}`,
          name: service.name,
          price: service.priceDisplay,
          description: service.shortDescription || service.description,
          group,
          href: `#services-${groupId}`,
        };
      })
    : [
        ...nailServiceSections.flatMap((section) =>
          section.items.map((item) => ({
            id: `${nailSectionId(section)}-${item.name}`,
            name: item.name,
            price: item.price,
            description: item.description,
            group: "Nails",
            href: `#${nailSectionId(section)}`,
          })),
        ),
        ...auraSections.flatMap((section) =>
          section.items.map((item, index) => ({
            id: `aura-${section.id}-${index}`,
            name: item.name,
            price: item.price,
            description: item.description,
            group: serviceGroup(section.category, section.title, item.name),
            href: `#aura-${section.id}`,
          })),
        ),
      ];

  const orderedCmsServices = SERVICE_GROUPS.map((group) => ({
    ...group,
    services: cmsServices.filter(
      (service) => serviceGroup(service.category, service.subcategory ?? "", service.name) === group.label,
    ),
  })).filter((group) => group.services.length > 0);
  const orderedAuraSections = [...auraSections].sort((a, b) => {
    const groupA = serviceGroup(a.category, a.title, "");
    const groupB = serviceGroup(b.category, b.title, "");
    return auraGroupOrder.indexOf(groupA as (typeof auraGroupOrder)[number]) -
      auraGroupOrder.indexOf(groupB as (typeof auraGroupOrder)[number]);
  });

  return (
    <div className={styles.scope}>
      <main>
        <section className="page-hero services-page-hero">
          <div className="shell">
            <div className="services-hero-copy">
              <p className="eyebrow">{brandName} · Services &amp; Price List</p>

              <h1>{content.servicesTitle}</h1>

              <p className="lede">
                {content.servicesIntroduction}
              </p>

              <div className="services-hero-actions">
                <Link className="button" href="/book">
                  Book Your Appointment
                </Link>

                {useCmsServices ? (
                  <a className="text-link" href="#aura-menu">Browse service categories <b aria-hidden="true">&rarr;</b></a>
                ) : (
                  <>
                    <a className="text-link" href="#nail-menu">Nail price list <b aria-hidden="true">&rarr;</b></a>
                    <a className="text-link" href="#aura-menu">Makeup &amp; hair price list <b aria-hidden="true">&rarr;</b></a>
                  </>
                )}
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

        <section className="nail-menu" id="aura-menu">
          <div className="shell">
            <header className="nail-menu-header">
              <p className="eyebrow">Aura Beauty · Confident You</p>
              <p className="nail-menu-brand">MAKEUP • NAILS • HAIR • BRIDAL</p>
              <h2>{useCmsServices ? "Services & pricing" : "Makeup, hair &amp; bridal services"}</h2>
              <p>{useCmsServices ? "Choose a category to explore current services and pricing." : "Two supplied makeup menus are shown separately where prices differ. Please confirm your final quote when booking."}</p>
            </header>
          </div>

          {/* The search filters replace the duplicate Aura category links. */}
          <ServiceSearch
            items={searchItems}
            groups={[...SERVICE_GROUPS]}
          />

          {useCmsServices ? (
            <div className={`shell ${styles.cmsServiceGroups}`}>
              {orderedCmsServices.map((group) => (
                <section className="nail-section" id={`services-${group.id}`} key={group.id}>
                  <div className="nail-section-heading"><h3>{group.label}</h3></div>
                  {group.services.map((service) => (
                    <article className="nail-item" id={`cms-service-${service.id}`} key={service.id}>
                      <div className="nail-item-row-main">
                        <div className="nail-item-info">
                          <h4 className="nail-item-name">{service.name}</h4>
                          <div className="nail-item-price">{service.priceDisplay}</div>
                        </div>
                        <div className="nail-item-btn-wrapper">
                          <AddToEnquiryButton service={{
                            name: service.name,
                            category: service.category,
                            subcategory: service.subcategory,
                            price: service.priceDisplay,
                          }} />
                        </div>
                      </div>
                      {(service.shortDescription || service.description) && (
                        <p className="nail-item-desc">{service.shortDescription || service.description}</p>
                      )}
                      {service.details.length > 0 && (
                        <ul className={styles.details}>{service.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                      )}
                    </article>
                  ))}
                </section>
              ))}
            </div>
          ) : null}

          {!useCmsServices && <div className="shell">
            {orderedAuraSections.map((section) => (
              <section className="nail-section" id={`aura-${section.id}`} key={section.id}>
                <div className="nail-section-heading"><span aria-hidden="true">{section.emoji}</span><h3>{section.title}</h3></div>
                {section.items.map((item, index) => (
                  <article className="nail-item" key={`${item.name}-${index}`}>
                    <div className="nail-item-row-main">
                      <div className="nail-item-info"><h4 className="nail-item-name">{item.name}</h4><div className="nail-item-price">{item.price}</div></div>
                      <div className="nail-item-btn-wrapper"><AddToEnquiryButton service={{ name: item.name, category: section.category, subcategory: section.title, price: item.price }} /></div>
                    </div>
                    {item.description && <p className="nail-item-desc">{item.description}</p>}
                    {item.details && <ul className={styles.details}>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>}
                  </article>
                ))}
                {section.note && <p className="nail-section-note">{section.note}</p>}
              </section>
            ))}
            <section className="nail-section" id="aura-location">
              <div className="nail-section-heading"><span aria-hidden="true">🚗</span><h3>On-Location Makeup</h3></div>
              <p>Aura Beauty offers mobile makeup services for weddings, bridal parties, events, photoshoots, fashion shows and private celebrations. Travel fees apply depending on location.</p>
              <p>On-location bridal bookings can include setup, professional lighting requirements and a customized service timeline.</p>
            </section>
            <section className="nail-section" id="aura-booking">
              <div className="nail-section-heading"><span aria-hidden="true">📌</span><h3>Booking Information</h3></div>
              <ul className={styles.details}>{bookingNotes.map((note) => <li key={note}>{note}</li>)}</ul>
            </section>
          </div>}
        </section>

        {/* ---- Premium Nail Services & Price List ---- */}
        {!useCmsServices && <section className="nail-menu" id="nail-menu">
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
        </section>}

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
                  Tell me which service you would like and any inspiration you
                  have in mind. Timing, details and final pricing can then
                  be confirmed together —
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
