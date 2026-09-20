import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getServices, getSettings } from "@/lib/cms";
import styles from "./services.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Services",
    description: `Makeup, hair styling and nail artistry services by ${settings.businessName}.`,
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
      "Elegant updos, romantic waves, and sleek finishes designed to complement your features, outfit, and occasion.",
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
  const [services, settings] = await Promise.all([getServices(), getSettings()]);

  return (
    <div className={styles.scope}>
      <main>
        <section className="page-hero services-page-hero">
          <div className="shell">
            <div className="services-hero-copy">
              <p className="eyebrow">Services · Makeup · Hair · Nail Art</p>

              <h1>
                Beauty, thoughtfully
                <br />
                created for <i>you.</i>
              </h1>

              <p className="lede">
                Explore a collection of beauty services designed around your
                occasion, personal style, and the finish you want to feel
                confident in.
              </p>

              <div className="services-hero-actions">
                <Link className="button" href="/book">
                  Book Your Appointment
                </Link>

                <Link className="text-link" href="/gallery">
                  Explore the portfolio <b>→</b>
                </Link>
              </div>

              <div className="services-hero-meta">
                <span>{settings.location}</span>
                <span>{settings.hours || "By appointment"}</span>
              </div>
            </div>

            <div className="services-hero-number" aria-hidden="true">
              <span>03</span>
              <small>Beauty disciplines</small>
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
                From the first detail
                <br />
                to the <i>final finish.</i>
              </h2>

              <p>
                Whether you are preparing for a bridal celebration, an
                engagement, an event, a photoshoot, or simply want to enjoy a
                beautifully considered look, each service can be discussed and
                tailored during your enquiry.
              </p>
            </div>
          </div>
        </section>

        {services.length === 0 && (
          <section className="section">
            <div className="shell">
              <div className="empty-state">
                <p className="eyebrow">Services</p>
                <p>
                  The service menu is being updated. Please enquire about
                  makeup, hair styling or nail artistry and {settings.businessName}{" "}
                  will be happy to help.
                </p>
              </div>
            </div>
          </section>
        )}

        {categories.map((category, categoryIndex) => {
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
                          <p>{service.shortDescription || service.description}</p>
                        </div>

                        <div className="block-detail">
                          <strong>{service.priceDisplay}</strong>
                          <span>{service.duration || "Duration on enquiry"}</span>

                          <Link href="/book">
                            Enquire <b>→</b>
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>

                  <Link
                    className="button service-enquiry"
                    href="/book"
                  >
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
                  Not sure where
                  <br />
                  to <i>begin?</i>
                </h2>
              </div>

              <div className="services-closing-copy">
                <p>
                  Tell me about your occasion, preferred service, and the look
                  you have in mind. The right details, timing, and pricing can
                  then be confirmed together.
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
