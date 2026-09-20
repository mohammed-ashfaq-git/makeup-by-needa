import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";

export default function About() {
  return (
    <main>
      <section className="page-hero about-page-hero">
        <div className="shell">
          <div className="about-hero-layout">
            <div>
              <p className="eyebrow">About Makeup by Needa</p>

              <h1>
                Beauty should feel
                <br />
                <i>entirely your own.</i>
              </h1>

              <p className="lede">
                A personal approach to makeup, hair styling, and nail art,
                thoughtfully designed around your features, your occasion, and
                the way you want to feel.
              </p>

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
          <div className="portrait-placeholder" aria-label="Artist portrait">
            <div className="portrait-placeholder-inner">
              <span>Makeup by Needa</span>
            </div>
            <strong>01</strong>
          </div>

          <div className="about-story-content">
            <SectionHeading
              eyebrow="The artist"
              title="Artistry rooted in personal connection."
              text="A calm, collaborative experience focused on enhancing what makes you feel most confident."
            />

            <div className="about-copy">
              <p>
                Makeup by Needa is a Toronto-based beauty artistry studio
                specializing in bridal, event, and editorial looks across
                makeup, hair styling, and nail art. Each appointment is
                approached with care, listening to your vision and tailoring
                every detail to your personal style.
              </p>

              <p>
                From soft, luminous finishes to beautifully defined glamour,
                the focus is always on creating a polished result that feels
                comfortable, considered, and entirely your own.
              </p>
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
              <p className="eyebrow">Makeup by Needa</p>
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
