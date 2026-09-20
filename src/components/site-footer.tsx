import Image from "next/image";
import Link from "next/link";
import { navigation } from "@/lib/site-data";
import type { PublicSettings } from "@/lib/cms";

export function SiteFooter({
  settings,
  featuredServices,
}: {
  settings: PublicSettings;
  featuredServices: { name: string; category: string }[];
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
              <span className="brand-services-pill">Makeup · Hair · Nail Art</span>
            </span>
          </Link>
          <p className="footer-tagline">
            Thoughtful beauty artistry for the moments that matter. Based in{" "}
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
          {featuredServices.map((x) => (
            <Link key={x.name} href="/services">
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
            href={settings.instagramMakeupUrl}
            target="_blank"
            rel="noreferrer"
            className="footer-social-link"
            aria-label={`Makeup and Hair Instagram ${settings.instagramMakeupHandle}`}
          >
            <span className="footer-social-tag">Makeup &amp; Hair:</span>{" "}
            {settings.instagramMakeupHandle}
          </a>
          <a
            href={settings.instagramNailsUrl}
            target="_blank"
            rel="noreferrer"
            className="footer-social-link"
            aria-label={`Nail Art Instagram ${settings.instagramNailsHandle}`}
          >
            <span className="footer-social-tag">Nail Art:</span>{" "}
            {settings.instagramNailsHandle}
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
            href={`https://wa.me/${settings.whatsappNumber.replace("+", "")}?text=${encodeURIComponent(settings.whatsappMessage)}`}
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
        <span>{settings.location} · Makeup · Hair · Nail Art</span>
      </div>
    </footer>
  );
}
