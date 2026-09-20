import Image from "next/image";
import Link from "next/link";
import { Gallery } from "@/components/features/gallery";
import { SectionHeading } from "@/components/ui/section-heading";
import { business, services } from "@/config/site";

function InstagramIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Home() {
  const featured = [
    services.find((service) => service.name === "Bridal Makeup"),
    services.find((service) => service.name === "Bridal Hair Styling"),
    services.find((service) => service.name === "Bridal Nail Art"),
    services.find((service) => service.name === "Soft Curls & Waves"),
  ].filter(Boolean);

  const getCategoryLabel = (category: string) =>
    category === "Nails" ? "Nail Art" : category;

  return (
    <>
      <section className="hero-section">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Makeup · Hair · Nail Art</p>

            <h1>
              Beauty, artistry &amp; confidence —
              <i> created just for you.</i>
            </h1>

            <p className="lede">
              Thoughtfully tailored beauty artistry for bridal moments,
              celebrations, photographs, and every occasion worth remembering.
            </p>

            <div className="actions">
              <Link className="button" href="/book">
                Book Your Appointment
              </Link>

              <Link className="text-link" href="/gallery">
                Explore My Work <b>→</b>
              </Link>
            </div>

            <p className="location">
              <span aria-hidden="true">⌖</span> {business.location}
            </p>
          </div>

          <div
            className="hero-art"
            aria-label="Makeup by Needa beauty portfolio"
          >
            <div className="hero-photo-stage">
              <div className="hero-photo-glow" aria-hidden="true" />
              <div className="arch-shape" aria-hidden="true" />

              <Image
                className="hero-photo"
                src="/images/makeup-by-needa-hero.jpg"
                alt="Makeup by Needa beauty artistry"
                fill
                priority
                sizes="(max-width: 760px) 88vw, 48vw"
              />
            </div>

            <div className="hero-stamp" aria-hidden="true">
              MBN
              <br />
              <i>Toronto</i>
            </div>

            <div className="art-label">
              <span>Beauty, personally considered</span>
              <em>Makeup · Hair · Nail Art</em>
            </div>
          </div>
        </div>
      </section>

      <section className="section intro editorial-intro">
        <div className="shell intro-composition">
          <div className="intro-visual" aria-hidden="true">
            <div className="intro-visual-inner" />

            <p>
              MAKEUP
              <br />
              BY NEEDA
            </p>
          </div>

          <div className="intro-content">
            <SectionHeading
              eyebrow="A thoughtful experience"
              title="Refined artistry, made to feel like you."
              text="Every appointment begins with listening: your vision, your occasion, and the details that make you feel most yourself."
            />

            <div className="intro-note">
              <p>
                From softly luminous to beautifully defined, each look is
                approached with care and tailored to your personal style.
              </p>

              <Link className="text-link" href="/about">
                Discover Makeup by Needa <b>→</b>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section cream services-home">
        <div className="service-halo" aria-hidden="true" />

        <div className="shell">
          <div className="row-heading">
            <SectionHeading
              eyebrow="Services"
              title="Beauty for every chapter."
              text="Considered artistry across makeup, hair, and nail art — tailored to your occasion."
            />

            <Link className="text-link" href="/services">
              View All Services <b>→</b>
            </Link>
          </div>

          <div className="service-grid">
            {featured.map((service, index) => {
              if (!service) return null;

              const categoryLabel = getCategoryLabel(service.category);

              return (
                <article className="service-card" key={service.name}>
                  <Link
                    href="/services"
                    className="service-card-link"
                    aria-label={`View ${service.name} service details`}
                  >
                    <div
                      className={`service-visual service-visual-${index + 1}`}
                    >
                      <span>{categoryLabel}</span>
                    </div>

                    <div className="service-card-copy">
                      <span className="service-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <p className="eyebrow">{categoryLabel}</p>

                      <h3>{service.name}</h3>

                      <p>{service.description}</p>

                      <div className="service-meta">
                        <strong>Enquire for pricing</strong>

                        <span>
                          Details <b>→</b>
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section portfolio-home">
        <div className="shell">
          <div className="row-heading">
            <SectionHeading
              eyebrow="Selected work"
              title="The beauty is in the details."
              text="A growing portfolio of makeup, bridal beauty, hair styling, and nail artistry."
            />

            <Link className="text-link" href="/gallery">
              View Full Gallery <b>→</b>
            </Link>
          </div>

          <Gallery limit={3} />
        </div>
      </section>

      <section className="section dark approach-section">
        <div className="approach-line" aria-hidden="true" />

        <div className="shell specialties">
          <div>
            <p className="eyebrow">The Makeup by Needa approach</p>

            <h2>
              Intentional from the first conversation to the final touch.
            </h2>

            <p className="lede">
              Your appointment should feel considered, comfortable, and
              completely personal.
            </p>
          </div>

          <div className="specialty-list">
            <span>
              <small>01</small>
              <b>Personalised consultation</b>
            </span>

            <span>
              <small>02</small>
              <b>Elegant, enduring finishes</b>
            </span>

            <span>
              <small>03</small>
              <b>Care for every detail</b>
            </span>
          </div>
        </div>
      </section>

      <section className="section social-home">
        <div className="shell social-home-grid">
          <div className="social-home-intro">
            <p className="eyebrow">Follow the artistry</p>

            <h2>Beauty beyond the appointment.</h2>

            <p className="lede">
              Follow the official Instagram channels for portfolio updates,
              beauty inspiration, makeup artistry, hair styling, and nail art.
            </p>
          </div>

          <div className="social-cards">
            <a
              href={business.instagramMakeupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
              aria-label={`Visit Makeup by Needa on Instagram ${business.instagramMakeup}`}
            >
              <div className="social-card-top">
                <InstagramIcon />

                <span className="social-category-tag">
                  Makeup &amp; Hair
                </span>
              </div>

              <strong className="social-card-handle">
                {business.instagramMakeup}
              </strong>

              <p className="social-card-bio">
                Makeup artistry and hair styling for bridal moments,
                celebrations, and special occasions in Toronto.
              </p>

              <span className="social-card-cta">
                Visit Instagram <b>↗</b>
              </span>
            </a>

            <a
              href={business.instagramNailsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
              aria-label={`Visit Nails by Needa on Instagram ${business.instagramNails}`}
            >
              <div className="social-card-top">
                <InstagramIcon />

                <span className="social-category-tag">Nail Art</span>
              </div>

              <strong className="social-card-handle">
                {business.instagramNails}
              </strong>

              <p className="social-card-bio">
                Custom nail artistry ranging from refined minimalist details
                to statement bridal and event looks.
              </p>

              <span className="social-card-cta">
                Visit Instagram <b>↗</b>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="section cta">
        <div className="shell">
          <p className="eyebrow">Your appointment</p>

          <h2>Let&apos;s create something beautiful.</h2>

          <p className="lede">
            Share a few details about your occasion, preferred service, and
            desired look. Needa will review your enquiry and connect with you
            directly.
          </p>

          <Link className="button light" href="/book">
            Book Your Appointment
          </Link>
        </div>
      </section>
    </>
  );
}
