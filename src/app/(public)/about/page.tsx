import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { getArtist, getSettings } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "About",
    description: `Meet the artist behind ${settings.businessName}.`,
  };
}

export default async function About() {
  const [artist, settings] = await Promise.all([getArtist(), getSettings()]);

  const hasDetails =
    Boolean(artist.experience) ||
    artist.specialties.length > 0 ||
    artist.qualifications.length > 0;

  return (
    <main>
      <section className="page-hero about-page-hero">
        <div className="shell">
          <div className="about-hero-layout">
            <div>
              <p className="eyebrow">About {settings.businessName}</p>

              <h1>
                Beauty should feel
                <br />
                <i>entirely your own.</i>
              </h1>

              <p className="lede">{artist.shortBio}</p>

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
            <SectionHeading
              eyebrow="The artist"
              title={`Meet ${artist.name}.`}
              text={artist.shortBio}
            />

            <div className="about-copy">
              {artist.bioParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {hasDetails && (
              <div className="about-facts">
                {artist.experience && (
                  <p>
                    <strong>Experience</strong>
                    <span>{artist.experience}</span>
                  </p>
                )}

                {artist.specialties.length > 0 && (
                  <p>
                    <strong>Specialties</strong>
                    <span>{artist.specialties.join(" · ")}</span>
                  </p>
                )}

                {artist.qualifications.length > 0 && (
                  <p>
                    <strong>Qualifications</strong>
                    <span>{artist.qualifications.join(" · ")}</span>
                  </p>
                )}

                {artist.location && (
                  <p>
                    <strong>Location</strong>
                    <span>{artist.location}</span>
                  </p>
                )}

                {artist.instagram && (
                  <p>
                    <strong>Instagram</strong>
                    <span>{artist.instagram}</span>
                  </p>
                )}
              </div>
            )}

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
              eyebrow="Philosophy"
              title="An edit of what makes you feel confident."
              text="A calm, collaborative beauty experience rooted in personal style — never a one-size-fits-all look."
            />
          </div>

          <div className="about-values">
            <article className="about-value">
              <span>01</span>

              <div>
                <h3>Personal</h3>
                <p>
                  Your features, preferences, outfit, and occasion all help
                  shape the final look.
                </p>
              </div>
            </article>

            <article className="about-value">
              <span>02</span>

              <div>
                <h3>Thoughtful</h3>
                <p>
                  Every detail has a purpose, from the overall finish to the
                  smallest beauty detail.
                </p>
              </div>
            </article>

            <article className="about-value">
              <span>03</span>

              <div>
                <h3>Confident</h3>
                <p>
                  The goal is not simply to create a beautiful look, but one
                  that still feels like you.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="about-experience-section">
        <div className="shell">
          <div className="about-experience-card">
            <div>
              <p className="eyebrow">{settings.businessName}</p>

              <h2>
                Your occasion.
                <br />
                Your style.
                <br />
                <i>Your moment.</i>
              </h2>
            </div>

            <div className="about-experience-copy">
              <p>
                From makeup and hair styling to nail artistry, each service is
                approached with the same intention: creating a polished result
                that feels considered, comfortable, and personal.
              </p>

              <Link className="button button-light" href="/gallery">
                Explore My Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section about-closing-section">
        <div className="shell about-closing">
          <p className="eyebrow">Ready when you are</p>

          <h2>
            Let&apos;s create something
            <br />
            <i>beautiful.</i>
          </h2>

          <Link className="text-link" href="/book">
            Start an appointment enquiry <b>→</b>
          </Link>
        </div>
      </section>
    </main>
  );
}
