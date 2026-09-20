import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

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
          <div className="portrait-placeholder">
            <div className="portrait-placeholder-inner">
              <span>Professional artist portrait</span>
              <small>Image will be added</small>
            </div>

            <strong>01</strong>
          </div>

          <div className="about-story-content">
            <SectionHeading
              eyebrow="The artist"
              title="The story, in your own words."
              text="A personal introduction will live here, giving visitors a chance to understand the artist behind the work."
            />

            <div className="about-copy">
              <p>
                Artist introduction and professional story will be added here
                once the final details are provided. This space is designed
                for a genuine introduction rather than generic marketing
                copy.
              </p>

              <p>
                Experience, qualifications, creative influences, and the
                details that make the Makeup by Needa experience distinctive
                can be added here.
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