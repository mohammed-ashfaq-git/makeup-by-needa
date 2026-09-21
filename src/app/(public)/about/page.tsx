import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { getArtist, getSettings } from "@/lib/cms";
import { getAbsoluteSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = `Meet the artist behind ${settings.businessName} and discover a thoughtful approach to makeup, hair styling, and nail artistry.`;
  const canonicalUrl = getAbsoluteSiteUrl("/about");

  return {
    title: "About",
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title: `About | ${settings.businessName}`,
      description,
      type: "website",
      locale: "en_CA",
      siteName: settings.businessName,
      url: canonicalUrl,
    },
  };
}

export default async function About() {
  const artist = await getArtist();

  return (
    <main>
      <section className="page-hero about-page-hero">
        <div className="shell">
          <div className="about-hero-layout">
            <div>
              <p className="eyebrow">Meet the Artist</p>

              <h1>
                Needa —
                <br />
                <i>Founder & Beauty Artist at AURA BEAUTY</i>
              </h1>

              <p className="lede">Welcome to Aura Beauty — Confident You.</p>

              <div className="about-hero-actions">
                <Link className="button" href="/book">
                  Book Your Appointment
                </Link>

                <Link className="text-link" href="/services">
                  Explore services <b>→</b>
                </Link>
              </div>
            </div>

            <div className="about-hero-mark" aria-hidden="true">
              <span>MN</span>
              <small>Makeup · Hair · Nail Art</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section cream about-story-section">
        <div className="shell about-grid">
          {artist.photoUrl ? (
            <div className="portrait-photo">
              <Image
                src={artist.photoUrl}
                alt={`${artist.name}, makeup artist`}
                fill
                sizes="(max-width: 760px) 92vw, 40vw"
                priority
              />
            </div>
          ) : (
            <div className="portrait-placeholder" aria-hidden="true">
              <div className="portrait-placeholder-inner">
                <strong className="portrait-monogram">
                  {artist.name.charAt(0).toUpperCase()}
                </strong>

                <small>{artist.name} · Makeup · Hair · Nail Art</small>
              </div>
            </div>
          )}

          <div className="about-story-content">
            <div className="about-copy">
              <p>
                I’m Needa, the founder and beauty artist behind Aura Beauty.
                With 5+ years of experience in the beauty industry, my passion
                is creating personalized beauty looks that help every client
                feel confident, comfortable and beautiful.
              </p>

              <p>
                My professional beauty education began in India, where I
                completed my Cosmetology training at Lakmé Academy. This gave
                me a strong foundation in professional makeup, hairstyling,
                skincare and beauty techniques.
              </p>

              <p>
                After continuing my beauty journey in Canada, I completed
                Canadian makeup training and became Ontario-certified in Makeup,
                further developing my knowledge of professional makeup
                application and working with Canadian clients and beauty
                standards.
              </p>
            </div>

            <p className="eyebrow">My Qualifications</p>

            <div className="about-qual-groups">
              <div>
                <h3>India</h3>

                <ul className="about-bullets">
                  <li>Professional Cosmetology Training</li>
                  <li>Lakmé Academy</li>
                  <li>
                    Training in professional beauty and cosmetology techniques
                  </li>
                </ul>
              </div>

              <div>
                <h3>Canada</h3>

                <ul className="about-bullets">
                  <li>Ontario-Certified Makeup Artist</li>
                  <li>Canadian professional makeup training</li>
                </ul>
              </div>
            </div>

            <Link className="text-link" href="/contact">
              Get in touch <b>→</b>
            </Link>
          </div>
        </div>
      </section>

      <section className="section about-philosophy-section">
        <div className="shell">
          <div className="about-philosophy-heading">
            <SectionHeading
              eyebrow="Experience"
              title="5+ Years of Beauty Experience"
              text="Over the years, I have worked with a variety of beauty looks, clients and occasions. My experience includes:"
            />
          </div>

          <div className="about-values">
            <article className="about-value">
              <span>01</span>
              <h3>Makeup</h3>
            </article>

            <article className="about-value">
              <span>02</span>
              <h3>South Asian & Bridal Makeup</h3>
            </article>

            <article className="about-value">
              <span>03</span>
              <h3>Soft Glam & Full Glam</h3>
            </article>

            <article className="about-value">
              <span>04</span>
              <h3>Event & Photoshoot Makeup</h3>
            </article>

            <article className="about-value">
              <span>05</span>
              <h3>Hairstyling</h3>
            </article>

            <article className="about-value">
              <span>06</span>
              <h3>Bridal Hairstyling</h3>
            </article>

            <article className="about-value">
              <span>07</span>
              <h3>Nail Services</h3>
            </article>

            <article className="about-value">
              <span>08</span>
              <h3>Nail Art</h3>
            </article>

            <article className="about-value">
              <span>09</span>
              <h3>Creative Beauty Looks</h3>
            </article>
          </div>
        </div>
      </section>

      <section className="about-experience-section">
        <div className="shell">
          <div className="about-experience-card">
            <div>
              <p className="eyebrow">My Approach</p>

              <h2>
                I believe makeup and beauty should enhance your individuality,
                <br />
                <i>not hide it.</i>
              </h2>
            </div>

            <div className="about-experience-copy">
              <p>
                Every client has their own features, style, personality and
                vision. I take the time to understand what you are looking for
                and customize each service accordingly — whether you want a
                soft natural look, elegant glam, a South Asian bridal
                transformation, a statement hairstyle or detailed nail art.
              </p>

              <p>
                My goal is for you to feel comfortable throughout your
                appointment and leave feeling confident in your look.
              </p>

              <Link className="button button-light" href="/gallery">
                Explore My Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section cream about-aura-section">
        <div className="shell">
          <p className="eyebrow">The Aura Beauty Experience</p>

          <p className="lede">
            When you book with Aura Beauty, you can expect:
          </p>

          <ul className="about-bullets about-bullets-grid">
            <li>Personalized consultation</li>
            <li>Customized beauty services</li>
            <li>Professional techniques</li>
            <li>Attention to detail</li>
            <li>Hygiene-focused service</li>
            <li>Quality professional products</li>
            <li>A comfortable and welcoming environment</li>
            <li>Beauty looks designed around your individual style</li>
          </ul>

          <p className="copy">
            Whether you’re getting ready for your wedding, engagement,
            birthday, special event, photoshoot or simply treating yourself,
            I’m here to help bring your vision to life.
          </p>
        </div>
      </section>

      <section className="section about-closing-section">
        <div className="shell about-closing">
          <p className="eyebrow">My Philosophy</p>

          <h2>
            Beauty is personal.
            <br />
            <i>Confidence is powerful.</i>
          </h2>

          <p className="lede">
            At Aura Beauty, every service is created with one goal:
          </p>

          <p className="about-promise">
            To help you feel like the most confident version of YOU.
          </p>

          <p className="copy">
            Thank you for trusting me with your special moments. I look forward
            to welcoming you to Aura Beauty.
          </p>

          <p className="about-signoff">
            <strong>AURA BEAUTY</strong>
            <span>Makeup • Hair • Nails • Bridal Beauty</span>
            <em>Confident You.</em>
          </p>

          <Link className="text-link" href="/book">
            Start an appointment enquiry <b>→</b>
          </Link>
        </div>
      </section>
    </main>
  );
}
