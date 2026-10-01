import Image from "next/image";
import Link from "next/link";
import { navigation } from "@/lib/site-data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { PublicSettings } from "@/lib/cms";

export function SiteFooter({
  settings,
  serviceLinks,
}: {
  settings: PublicSettings;
  /** One link per price-list section, deep-linking into /services. */
  serviceLinks: { name: string; href: string }[];
}) {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div className="footer-brand-col">
          <Link href="/" className="brand-lockup brand-lockup-footer" aria-label={`${settings.businessName} - Home`}>
            <Image
              src={settings.logoUrl}
              alt={settings.businessName}
              width={96}
              height={48}
              className="brand-logo"
            />
            <span className="brand-identity">
              <span className="brand-name">{settings.businessName}</span>
              <span className="brand-services-pill">Makeup • Nails • Hair</span>
            </span>
          </Link>
          <p className="footer-tagline">
            Makeup, nail, and hair services, thoughtfully tailored to you. Based in{" "}
            {settings.location}.
          </p>
        </div>

        <div>
          <p className="eyebrow">Explore</p>
          {navigation.slice(1, 5).map((x) => (
            <Link key={x.href} href={x.href}>
              {x.label}
            </Link>
          ))}
        </div>

        <div>
          <p className="eyebrow">Services</p>
          {serviceLinks.map((x) => (
            <Link key={x.href} href={x.href}>
              {x.name}
            </Link>
          ))}
          <Link href="/services" className="footer-all-services">
            All services <b>→</b>
          </Link>
        </div>

        <div className="footer-connect-col">
          <p className="eyebrow">Connect</p>
          <a
            href={settings.instagramNailsUrl}
            target="_blank"
            rel="noreferrer"
            className="footer-social-link"
            aria-label={`Nail Technician Instagram ${settings.instagramNailsHandle}`}
          >
            <span className="footer-social-tag">Nail Technician:</span>{" "}
            {settings.instagramNailsHandle}
          </a>
          <a
            href={settings.instagramMakeupUrl}
            target="_blank"
            rel="noreferrer"
            className="footer-social-link"
            aria-label={`Makeup and Hair Instagram ${settings.instagramMakeupHandle}`}
          >
            <span className="footer-social-tag">Makeup &amp; Hair:</span>{" "}
            {settings.instagramMakeupHandle}
          </a>
          {settings.facebookUrl && (
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="footer-social-link"
              aria-label={`${settings.businessName} on Facebook`}
            >
              <span className="footer-social-tag">Facebook:</span> Facebook page
            </a>
          )}
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="footer-social-link">
              <span className="footer-social-tag">Phone:</span> {settings.phone}
            </a>
          )}
          <a
            href={buildWhatsAppUrl(
              settings.whatsappNumber,
              settings.whatsappMessage,
            )}
            target="_blank"
            rel="noreferrer"
            className="footer-social-link"
          >
            <span className="footer-social-tag">WhatsApp:</span>{" "}
            {settings.whatsappDisplay}
          </a>
          <a
            href={`mailto:${settings.email}`}
            className="footer-social-link"
          >
            <span className="footer-social-tag">Email:</span> {settings.email}
          </a>
          <span className="footer-location-tag">⌖ {settings.location}</span>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span suppressHydrationWarning>
          © {new Date().getFullYear()} {settings.footerText}
        </span>
        <span>{settings.location} · Nail Technician</span>
      </div>
    </footer>
  );
}
