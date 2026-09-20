import Link from "next/link";
import { getSettings } from "@/lib/cms";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

function InstagramSvg() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppSvg() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.4 11.4a8.35 8.35 0 0 1-8.3 8.35 8.25 8.25 0 0 1-3.95-1l-4.15 1.1 1.1-4.05a8.3 8.3 0 1 1 15.3-.4Z" />
      <path d="M8.2 8.4c.2-.45.42-.47.78-.47h.35c.16 0 .34.02.48.38l.62 1.5c.1.25.06.43-.08.62l-.43.55c-.14.18-.1.34.02.54.32.53.75.98 1.25 1.34.55.4 1.05.65 1.55.83.2.07.34.05.47-.1l.55-.65c.14-.17.3-.2.53-.1l1.48.7c.27.13.43.2.5.32.07.12.07.7-.17 1.07-.24.37-.92.73-1.27.78-.32.05-.74.08-1.2-.06-.27-.08-.62-.2-1.08-.4a8.8 8.8 0 0 1-3.35-2.35A10.15 10.15 0 0 1 8.5 11.2c-.27-.47-.7-1.24-.7-1.9 0-.65.34-.96.4-.9Z" />
    </svg>
  );
}

function EmailSvg() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3.5 6 8.5 6.1L20.5 6" />
    </svg>
  );
}

function ArrowSvg() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 19 19 5" />
      <path d="M9 5h10v10" />
    </svg>
  );
}

function SparkleSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m12 2 1.35 6.65L20 10l-6.65 1.35L12 18l-1.35-6.65L4 10l6.65-1.35L12 2Z" />
      <path d="m19 16 .55 2.45L22 19l-2.45.55L19 22l-.55-2.45L16 19l2.45-.55L19 16Z" />
    </svg>
  );
}

export default async function Contact() {
  const business = await getSettings();

  const whatsappUrl = buildWhatsAppUrl(
    business.whatsappNumber,
    business.whatsappMessage,
  );

  return (
    <>
      <style>{`
        .contact-page {
          position: relative;
          overflow: clip;
          background:
            radial-gradient(circle at 86% 10%, rgba(196, 157, 136, 0.16), transparent 28%),
            linear-gradient(135deg, #fbf8f3 0%, #f7f0e9 54%, #f2e6dc 100%);
        }

        .contact-page::before {
          content: "";
          position: absolute;
          width: 360px;
          height: 360px;
          border: 1px solid rgba(113, 79, 61, 0.13);
          border-radius: 50%;
          right: -180px;
          top: 120px;
          pointer-events: none;
        }

        .contact-page::after {
          content: "";
          position: absolute;
          width: 190px;
          height: 190px;
          background: rgba(255, 255, 255, 0.28);
          border-radius: 50%;
          left: -95px;
          bottom: 90px;
          filter: blur(2px);
          pointer-events: none;
        }

        .contact-hero {
          position: relative;
          min-height: 430px;
          display: grid;
          align-items: center;
          padding-top: 90px;
          padding-bottom: 90px;
        }

        .contact-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
          gap: 90px;
          align-items: end;
        }

        .contact-hero-copy {
          max-width: 720px;
        }

        .contact-hero h1 {
          max-width: 760px;
          margin: 16px 0 24px;
          font-size: clamp(48px, 6vw, 76px);
          line-height: 0.94;
          letter-spacing: -0.055em;
        }

        .contact-hero h1 i {
          font-weight: 400;
        }

        .contact-hero .lede {
          max-width: 610px;
          margin: 0;
          font-size: 16px;
          line-height: 1.8;
        }

        .contact-hero-note {
          padding: 22px 0 0;
          border-top: 1px solid rgba(77, 48, 35, 0.18);
        }

        .contact-hero-note strong {
          display: block;
          margin-bottom: 7px;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .contact-hero-note span {
          display: block;
          max-width: 270px;
          font-size: 13px;
          line-height: 1.7;
          opacity: 0.72;
        }

        .contact-main {
          position: relative;
          z-index: 1;
          padding: 0 0 110px;
        }

        .contact-main-grid {
          display: grid;
          grid-template-columns: minmax(280px, 0.78fr) minmax(0, 1.22fr);
          gap: 28px;
          align-items: stretch;
        }

        .contact-visual {
          position: relative;
          min-height: 620px;
          padding: 38px;
          overflow: hidden;
          color: #f9f5ef;
          background:
            linear-gradient(145deg, rgba(84, 57, 44, 0.96), rgba(52, 35, 28, 0.98));
          box-shadow: 0 22px 55px rgba(72, 48, 36, 0.11);
        }

        .contact-visual::before {
          content: "";
          position: absolute;
          width: 270px;
          height: 360px;
          right: -55px;
          top: 74px;
          border: 1px solid rgba(239, 220, 205, 0.38);
          border-radius: 150px 150px 0 0;
          transform: rotate(7deg);
        }

        .contact-visual::after {
          content: "";
          position: absolute;
          width: 210px;
          height: 210px;
          left: -100px;
          bottom: -95px;
          border: 1px solid rgba(239, 220, 205, 0.22);
          border-radius: 50%;
        }

        .contact-visual-top {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .contact-visual-number {
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.65;
        }

        .contact-visual-mark {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border: 1px solid rgba(239, 220, 205, 0.35);
          border-radius: 50%;
        }

        .contact-visual-content {
          position: absolute;
          z-index: 2;
          left: 38px;
          right: 38px;
          bottom: 40px;
        }

        .contact-visual-content .eyebrow {
          color: rgba(239, 220, 205, 0.72);
        }

        .contact-visual-content h2 {
          max-width: 360px;
          margin: 14px 0 18px;
          color: #f9f5ef;
          font-size: clamp(34px, 4vw, 50px);
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .contact-visual-content p {
          max-width: 360px;
          margin: 0;
          color: rgba(249, 245, 239, 0.7);
          font-size: 14px;
          line-height: 1.75;
        }

        .contact-visual-location {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-top: 28px;
          padding-top: 18px;
          border-top: 1px solid rgba(239, 220, 205, 0.2);
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .contact-panel {
          padding: 34px 38px;
          background: rgba(255, 252, 248, 0.62);
          border: 1px solid rgba(111, 77, 59, 0.14);
          box-shadow: 0 22px 55px rgba(72, 48, 36, 0.055);
          backdrop-filter: blur(10px);
        }

        .contact-panel-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 30px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(111, 77, 59, 0.14);
        }

        .contact-panel-header h2 {
          margin: 7px 0 0;
          font-size: 29px;
          line-height: 1.05;
          letter-spacing: -0.035em;
        }

        .contact-panel-header p {
          max-width: 205px;
          margin: 0;
          font-size: 12px;
          line-height: 1.65;
          opacity: 0.66;
          text-align: right;
        }

        .contact-channel {
          display: grid;
          grid-template-columns: 125px minmax(0, 1fr);
          gap: 25px;
          padding: 25px 0;
          border-bottom: 1px solid rgba(111, 77, 59, 0.13);
        }

        .contact-channel:last-of-type {
          border-bottom: 0;
        }

        .contact-channel-label {
          padding-top: 4px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.17em;
          line-height: 1.5;
          text-transform: uppercase;
          color: rgba(111, 77, 59, 0.68);
        }

        .contact-channel-main {
          min-width: 0;
        }

        .contact-channel-link {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: inherit;
          text-decoration: none;
          transition:
            transform 180ms ease,
            opacity 180ms ease;
        }

        .contact-channel-link:hover {
          transform: translateX(3px);
          opacity: 0.72;
        }

        .contact-channel-link strong {
          font-size: 15px;
          font-weight: 500;
        }

        .contact-channel-arrow {
          display: inline-flex;
          margin-left: 4px;
          opacity: 0.55;
        }

        .contact-channel-subtext {
          margin: 8px 0 0;
          font-size: 12px;
          line-height: 1.65;
          opacity: 0.58;
        }

        .contact-location-value {
          margin: 0;
          font-size: 16px;
          line-height: 1.5;
        }

        .contact-panel-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid rgba(111, 77, 59, 0.14);
        }

        .contact-panel-footer p {
          max-width: 310px;
          margin: 0;
          font-size: 12px;
          line-height: 1.7;
          opacity: 0.6;
        }

        .contact-panel-footer .button {
          flex-shrink: 0;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .contact-hero-inner {
            grid-template-columns: 1fr;
            gap: 38px;
          }

          .contact-hero-note {
            max-width: 420px;
          }

          .contact-main-grid {
            grid-template-columns: 1fr;
          }

          .contact-visual {
            min-height: 460px;
          }
        }

        @media (max-width: 640px) {
          .contact-page::before {
            width: 260px;
            height: 260px;
            right: -150px;
            top: 190px;
          }

          .contact-hero {
            min-height: auto;
            padding-top: 68px;
            padding-bottom: 68px;
          }

          .contact-hero h1 {
            font-size: clamp(43px, 13vw, 58px);
          }

          .contact-hero .lede {
            font-size: 15px;
            line-height: 1.75;
          }

          .contact-main {
            padding-bottom: 75px;
          }

          .contact-visual {
            min-height: 410px;
            padding: 25px;
          }

          .contact-visual-content {
            left: 25px;
            right: 25px;
            bottom: 28px;
          }

          .contact-visual-content h2 {
            font-size: 38px;
          }

          .contact-panel {
            padding: 25px 20px;
          }

          .contact-panel-header {
            display: block;
          }

          .contact-panel-header p {
            margin-top: 12px;
            text-align: left;
          }

          .contact-channel {
            grid-template-columns: 1fr;
            gap: 9px;
            padding: 21px 0;
          }

          .contact-channel-label {
            padding-top: 0;
          }

          .contact-channel-link strong {
            font-size: 14px;
          }

          .contact-panel-footer {
            display: block;
          }

          .contact-panel-footer p {
            margin-bottom: 18px;
          }

          .contact-panel-footer .button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-channel-link {
            transition: none;
          }

          .contact-channel-link:hover {
            transform: none;
          }
        }
      `}</style>

      <main className="contact-page">
        <section className="contact-hero shell">
          <div className="contact-hero-inner">
            <div className="contact-hero-copy">
              <p className="eyebrow">Contact &amp; Connect</p>

              <h1>
                Start with a <i>conversation.</i>
              </h1>

              <p className="lede">
                For appointment bookings and bridal enquiries, share your event
                details through the enquiry form or connect directly through
                the official channels below.
              </p>
            </div>

            <div className="contact-hero-note">
              <strong>Beauty, considered personally.</strong>
              <span>
                Tell us what you are planning, and we can begin with the
                details that matter most to you.
              </span>
            </div>
          </div>
        </section>

        <section className="contact-main">
          <div className="shell contact-main-grid">
            <div className="contact-visual">
              <div className="contact-visual-top">
                <span className="contact-visual-number">01 / Connect</span>

                <span className="contact-visual-mark">
                  <SparkleSvg />
                </span>
              </div>

              <div className="contact-visual-content">
                <p className="eyebrow">{business.businessName}</p>

                <h2>
                  Let&apos;s create something that feels like you.
                </h2>

                <p>
                  From bridal beauty to celebrations, photographs, and
                  carefully finished nail art, every enquiry begins with your
                  vision.
                </p>

                <span className="contact-visual-location">
                  <span aria-hidden="true">•</span>
                  {business.location}
                </span>
              </div>
            </div>

            <div className="contact-panel">
              <div className="contact-panel-header">
                <div>
                  <p className="eyebrow">Official channels</p>
                  <h2>Choose how you&apos;d like to connect.</h2>
                </div>

                <p>
                  Prefer a quick message? WhatsApp is available for direct
                  enquiries.
                </p>
              </div>

              <div className="contact-channel">
                <span className="contact-channel-label">
                  Makeup &amp; Hair
                  <br />
                  Portfolio
                </span>

                <div className="contact-channel-main">
                  <a
                    href={business.instagramMakeupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-channel-link"
                    aria-label={`Visit ${business.instagramMakeupHandle} on Instagram`}
                  >
                    <InstagramSvg />
                    <strong>{business.instagramMakeupHandle}</strong>
                    <span className="contact-channel-arrow">
                      <ArrowSvg />
                    </span>
                  </a>

                  <p className="contact-channel-subtext">
                    Bridal, soft glam, reception, and event hair &amp; makeup
                    styling.
                  </p>
                </div>
              </div>

              <div className="contact-channel">
                <span className="contact-channel-label">
                  Nail Art
                  <br />
                  Portfolio
                </span>

                <div className="contact-channel-main">
                  <a
                    href={business.instagramNailsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-channel-link"
                    aria-label={`Visit ${business.instagramNailsHandle} on Instagram`}
                  >
                    <InstagramSvg />
                    <strong>{business.instagramNailsHandle}</strong>
                    <span className="contact-channel-arrow">
                      <ArrowSvg />
                    </span>
                  </a>

                  <p className="contact-channel-subtext">
                    Custom nail artistry, bridal sets, and luxury extensions.
                  </p>
                </div>
              </div>

              <div className="contact-channel">
                <span className="contact-channel-label">WhatsApp</span>

                <div className="contact-channel-main">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-channel-link"
                    aria-label={`Chat with ${business.businessName} on WhatsApp at ${business.whatsappDisplay}`}
                  >
                    <WhatsAppSvg />
                    <strong>{business.whatsappDisplay}</strong>
                    <span className="contact-channel-arrow">
                      <ArrowSvg />
                    </span>
                  </a>

                  <p className="contact-channel-subtext">
                    Direct enquiries and appointment conversations.
                  </p>
                </div>
              </div>

              <div className="contact-channel">
                <span className="contact-channel-label">Email</span>

                <div className="contact-channel-main">
                  <a
                    href={`mailto:${business.email}`}
                    className="contact-channel-link"
                    aria-label={`Email ${business.businessName} at ${business.email}`}
                  >
                    <EmailSvg />
                    <strong>{business.email}</strong>
                    <span className="contact-channel-arrow">
                      <ArrowSvg />
                    </span>
                  </a>

                  <p className="contact-channel-subtext">
                    For detailed enquiries and appointment information.
                  </p>
                </div>
              </div>

              {business.facebookUrl && (
                <div className="contact-channel">
                  <span className="contact-channel-label">Facebook</span>

                  <div className="contact-channel-main">
                    <a
                      href={business.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-channel-link"
                      aria-label={`Visit ${business.businessName} on Facebook`}
                    >
                      <InstagramSvg />
                      <strong>Facebook page</strong>
                      <span className="contact-channel-arrow">
                        <ArrowSvg />
                      </span>
                    </a>

                    <p className="contact-channel-subtext">
                      Updates, inspiration and recent work.
                    </p>
                  </div>
                </div>
              )}

              {business.phone && (
                <div className="contact-channel">
                  <span className="contact-channel-label">Phone</span>

                <div className="contact-channel-main">
                  <a
                    href={`tel:${business.phone}`}
                    className="contact-channel-link"
                    aria-label={`Call ${business.businessName} at ${business.phone}`}
                  >
                    <EmailSvg />
                    <strong>{business.phone}</strong>
                    <span className="contact-channel-arrow">
                      <ArrowSvg />
                    </span>
                  </a>

                  <p className="contact-channel-subtext">
                    Call or text for quick enquiries.
                  </p>
                </div>
              </div>
              )}

              <div className="contact-channel">
                <span className="contact-channel-label">Location</span>

                <div className="contact-channel-main">
                  <p className="contact-location-value">
                    {business.address || business.location}
                  </p>

                  <p className="contact-channel-subtext">
                    Appointment location details can be discussed during your
                    enquiry.
                  </p>
                </div>
              </div>

              <div className="contact-channel">
                <span className="contact-channel-label">Availability</span>

                <div className="contact-channel-main">
                  <p className="contact-location-value">
                    {business.hours || "By appointment only"}
                  </p>

                  <p className="contact-channel-subtext">
                    Please enquire with your preferred date and service.
                  </p>
                </div>
              </div>

              <div className="contact-panel-footer">
                <p>
                  Ready to discuss your appointment? Start an enquiry and share
                  your preferred date, service, and event details.
                </p>

                <Link className="button" href="/book">
                  Start an enquiry
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}