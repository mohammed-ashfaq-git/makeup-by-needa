import Image from "next/image";
import Link from "next/link";
import { business, navigation, services } from "@/config/site";

export function SiteFooter() {
  const featuredServices = services.filter((x) => x.featured);

  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div className="footer-brand-col">
          <Link href="/" className="brand-lockup brand-lockup-footer" aria-label="Makeup by Needa - Home">
            <Image
              src="/makeup-by-needa-logo.jpg"
              alt="Makeup by Needa"
              width={96}
              height={48}
              className="brand-logo"
            />
            <span className="brand-identity">
              <span className="brand-name">Makeup by Needa</span>
              <span className="brand-services-pill">Makeup · Hair · Nail Art</span>
            </span>
          </Link>
          <p className="footer-tagline">
            Thoughtful beauty artistry for the moments that matter. Based in Toronto, Canada.
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
            href={business.instagramMakeupUrl}
            target="_blank"
            rel="noreferrer"
            className="footer-social-link"
            aria-label="Makeup and Hair Instagram @makeupbynee_"
          >
            <span className="footer-social-tag">Makeup &amp; Hair:</span> {business.instagramMakeup}
          </a>
          <a
            href={business.instagramNailsUrl}
            target="_blank"
            rel="noreferrer"
            className="footer-social-link"
            aria-label="Nail Art Instagram @nailsbyneeda"
          >
            <span className="footer-social-tag">Nail Art:</span> {business.instagramNails}
          </a>
          <a
            href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(business.whatsappMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="footer-social-link"
          >
            <span className="footer-social-tag">WhatsApp:</span> {business.whatsappDisplay}
          </a>
          <a
            href={`mailto:${business.email}`}
            className="footer-social-link"
          >
            <span className="footer-social-tag">Email:</span> {business.email}
          </a>
          <span className="footer-location-tag">⌖ {business.location}</span>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span suppressHydrationWarning>© {new Date().getFullYear()} Makeup by Needa. All rights reserved.</span>
        <span>Toronto, ON · Makeup · Hair · Nail Art</span>
      </div>
    </footer>
  );
}
