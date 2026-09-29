import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Gallery } from "@/components/gallery";
import { ResponsiveImage } from "@/components/responsive-image";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCarousel } from "@/components/service-carousel";
import {
  getArtist,
  getGalleryItems,
  getSettings,
  getTestimonials,
} from "@/lib/cms";
import {
  nailSectionHref,
  nailSectionStartingPrice,
  showcaseNailSections,
} from "@/lib/nail-services";
import { getAbsoluteSiteUrl } from "@/lib/site-url";

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

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const canonicalUrl = getAbsoluteSiteUrl("/");

  return {
    title: { absolute: settings.homeTitle },
    description: settings.homeDescription,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title: settings.homeTitle,
      description: settings.homeDescription,
      type: "website",
      locale: "en_CA",
      siteName: settings.businessName,
      url: canonicalUrl,
    },
  };
}

export default async function Home() {
  const [settings, galleryItems, testimonials, artist] = await Promise.all([
    getSettings(),
    getGalleryItems(),
    getTestimonials(),
    getArtist(),
  ]);

  // Homepage slideshow: six looping slides, one per showcase section of the
  // nail price list. Each card deep-links to its section on /services.
  const carouselServices = showcaseNailSections.map((section) => ({
    id: section.id,
    name: section.title,
    category: "Nails",
    description: section.summary,
    priceDisplay: nailSectionStartingPrice(section),
    detailsHref: nailSectionHref(section),
    enquirable: false,
  }));

  // Hero image: dedicated CMS hero, else the first active gallery image,
  // else the static file that ships with the site.
  const heroImage =
    settings.heroImageUrl ||
    galleryItems[0]?.imageUrl ||
    "/images/makeup-by-needa-hero.jpg";

  // Mobile hero (< 768px): the dedicated mobile crop when the CMS has one,
  // otherwise the mobile crop of the gallery image used as the hero. When
  // neither exists, ResponsiveImage falls back to the desktop hero.
  const heroImageMobile =
    settings.heroImageMobileUrl ||
    (settings.heroImageUrl ? null : galleryItems[0]?.mobileImageUrl) ||
    null;

  // Two-line wordmark for the intro panel, e.g. "NEEDA / BEAUTY LAB".
  const [brandFirstWord, ...brandOtherWords] = settings.businessName
    .toUpperCase()
    .split(/\s+/);
  const brandRest = brandOtherWords.join(" ");

  // Monogram for the hero stamp, derived from the CMS business name.
  const brandInitials = settings.businessName
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <>
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="hero-section">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Nail Technician · {settings.businessName}</p>

            <h1>
              Beauty, artistry &amp; confidence —
              <i> created just for you.</i>
            </h1>

            <p className="lede">
              Premium gel manicures, extensions, nail art and signature sets —
              thoughtfully tailored to your style and every occasion worth
              remembering.
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
              <span aria-hidden="true">⌖</span> {settings.location}
            </p>
          </div>

          <div
            className="hero-art"
            aria-label={`${settings.businessName} beauty portfolio`}
          >
            <div className="hero-photo-stage">
              <div className="hero-photo-glow" aria-hidden="true" />
              <div className="arch-shape" aria-hidden="true" />

              <ResponsiveImage
                className="hero-photo"
                desktopSrc={heroImage}
                mobileSrc={heroImageMobile}
                mobileBreakpoint={768}
                alt={`${settings.businessName} beauty artistry`}
                priority
                sizes="(max-width: 760px) 88vw, 48vw"
              />
            </div>

            <div className="hero-stamp" aria-hidden="true">
              {brandInitials}
              <br />
              <i>{settings.location.split(",")[0]}</i>
            </div>

            <div className="art-label">
              <span>Beauty, personally considered</span>
              <em>Nail Technician</em>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO
      ========================================================= */}
      <section className="section intro editorial-intro">
        <div className="shell intro-composition">
          <div className="intro-visual" aria-hidden="true">
            <div className="intro-visual-inner" />

            <p>
              {brandFirstWord}
              {brandRest ? (
                <>
                  <br />
                  {brandRest}
                </>
              ) : null}
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
                From a clean gel manicure to a fully custom luxury set, each
                appointment is approached with care and tailored to your
                personal style.
              </p>

              <Link className="text-link" href="/about">
                Discover {settings.businessName} <b>→</b>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SERVICES — one slide per section of the nail price list
      ========================================================= */}
      <section className="section cream services-home">
        <div className="service-halo" aria-hidden="true" />

        <div className="shell">
          <div className="row-heading">
            <SectionHeading
              eyebrow="Services"
              title="Premium nail services."
              text="From natural nail care to signature sets. Choose a collection to see its full price list."
            />

            <Link className="text-link" href="/services">
              View All Services <b>→</b>
            </Link>
          </div>

          <ServiceCarousel
            services={carouselServices}
            label="Nail services"
          />
        </div>
      </section>

      {/* =========================================================
          PORTFOLIO (rendered only while the CMS has gallery images)
      ========================================================= */}
      {galleryItems.length > 0 && (
      <section className="section portfolio-home">
        <div className="shell">
          <div className="row-heading">
            <SectionHeading
              eyebrow="Selected work"
              title="The beauty is in the details."
              text="A growing portfolio of work by Needa."
            />

            <Link className="text-link" href="/gallery">
              View Full Gallery <b>→</b>
            </Link>
          </div>

          <Gallery
            items={galleryItems}
            limit={3}
            businessName={settings.businessName}
            location={settings.location}
          />
        </div>
      </section>
      )}

      {/* =========================================================
          TESTIMONIALS (rendered only when the CMS has some)
      ========================================================= */}
      {testimonials.length > 0 && (
        <section className="section cream testimonials-home">
          <div className="shell">
            <div className="row-heading">
              <SectionHeading
                eyebrow="Kind words"
                title="Loved by clients."
                text="What clients say about their experience."
              />
            </div>

            <div className="testimonial-grid">
              {testimonials.slice(0, 6).map((testimonial) => (
                <article className="testimonial-card" key={testimonial.id}>
                  <div className="testimonial-stars" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} filled={star <= testimonial.rating} />
                    ))}
                  </div>

                  <blockquote>“{testimonial.quote}”</blockquote>

                  <footer>
                    {testimonial.photoUrl ? (
                      <Image
                        src={testimonial.photoUrl}
                        alt={testimonial.clientName}
                        width={44}
                        height={44}
                        className="testimonial-photo"
                      />
                    ) : (
                      <span className="testimonial-initial" aria-hidden="true">
                        {testimonial.clientName.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <span>
                      <strong>{testimonial.clientName}</strong>
                      {testimonial.service && <small>{testimonial.service}</small>}
                    </span>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          APPROACH
      ========================================================= */}
      <section className="section dark approach-section">
        <div className="approach-line" aria-hidden="true" />

        <div className="shell specialties">
          <div>
            <p className="eyebrow">The {settings.businessName} approach</p>

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

      {/* =========================================================
          INSTAGRAM
      ========================================================= */}
      <section className="section social-home">
        <div className="shell social-home-grid">
          <div className="social-home-intro">
            <p className="eyebrow">Follow the artistry</p>

            <h2>Beauty beyond the appointment.</h2>

            <p className="lede">
              Follow the official Instagram channels for the latest sets,
              portfolio updates and nail inspiration.
            </p>
          </div>

          <div className="social-cards">
            <a
              href={settings.instagramNailsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
              aria-label={`Visit ${settings.instagramNailsHandle} on Instagram`}
            >
              <div className="social-card-top">
                <InstagramIcon />

                <span className="social-category-tag">Nail Technician</span>
              </div>

              <strong className="social-card-handle">
                {settings.instagramNailsHandle}
              </strong>

              <p className="social-card-bio">
                Custom nail designs ranging from refined minimalist details to
                statement event sets.
              </p>

              <span className="social-card-cta">
                Visit Instagram <b>↗</b>
              </span>
            </a>
            <a
              href={settings.instagramMakeupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
              aria-label={`Visit ${settings.businessName} on Instagram ${settings.instagramMakeupHandle}`}
            >
              <div className="social-card-top">
                <InstagramIcon />

                <span className="social-category-tag">
                  Makeup &amp; Hair
                </span>
              </div>

              <strong className="social-card-handle">
                {settings.instagramMakeupHandle}
              </strong>

              <p className="social-card-bio">
                Makeup artistry and hair styling for celebrations and special
                occasions in {settings.location}.
              </p>

              <span className="social-card-cta">
                Visit Instagram <b>↗</b>
              </span>
            </a>

          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL BOOKING CTA
      ========================================================= */}
      <section className="section cta">
        <div className="shell">
          <p className="eyebrow">Your appointment</p>

          <h2>Let&apos;s create something beautiful.</h2>

          <p className="lede">
            Share a few details about your occasion, preferred service, and
            the set you have in mind. {artist.name} will review your enquiry and connect
            with you directly.
          </p>

          <Link className="button light" href="/book">
            Book Your Appointment
          </Link>
        </div>
      </section>
    </>
  );
}
