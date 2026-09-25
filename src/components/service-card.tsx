import Image from "next/image";
import Link from "next/link";
import { AddToEnquiryButton } from "@/components/service-cart";

/**
 * Shape shared by the homepage slideshow and the services page. Both the
 * CMS-backed services and the static fallback in `lib/site-data.ts` fit it.
 */
export type ServiceCardData = {
  id?: number | string | null;
  name: string;
  category: string;
  subcategory?: string | null;
  description: string;
  priceDisplay: string;
  imageUrl?: string | null;
};

/** "Nails" reads better as "Nail Art" in customer-facing labels. */
export function getCategoryLabel(category: string): string {
  return category === "Nails" ? "Nail Art" : category;
}

/**
 * A single service card — one shared implementation for the homepage
 * slideshow and any grid that lists CMS services, so a service always looks
 * the same wherever it appears.
 *
 * Deliberately not marked "use client": it renders inside the slideshow
 * (a client component) and must therefore stay free of server-only imports.
 */
export function ServiceCard({
  service,
  index = 0,
  detailsHref = "/services",
  sizes = "(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 31vw",
}: {
  service: ServiceCardData;
  /** Position in the list; drives the two-digit number and visual variant. */
  index?: number;
  detailsHref?: string;
  sizes?: string;
}) {
  const categoryLabel = getCategoryLabel(service.category);
  // Four gradient variants ship with the site; cycle through them.
  const visualVariant = (index % 4) + 1;

  return (
    <article className="service-card">
      <Link
        href={detailsHref}
        className="service-card-link"
        aria-label={`View ${service.name} service details`}
      >
        <div className={`service-visual service-visual-${visualVariant}`}>
          {service.imageUrl ? (
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              sizes={sizes}
            />
          ) : (
            <span>{categoryLabel}</span>
          )}
        </div>

        <div className="service-card-copy">
          <span className="service-number">
            {String(index + 1).padStart(2, "0")}
          </span>

          <p className="eyebrow">{categoryLabel}</p>

          <h3>{service.name}</h3>

          <p>{service.description}</p>
        </div>
      </Link>

      <div className="service-card-actions-row">
        <strong>{service.priceDisplay}</strong>

        <div className="service-card-btns">
          <AddToEnquiryButton
            service={{
              id: service.id ?? undefined,
              name: service.name,
              category: service.category,
              subcategory: service.subcategory ?? null,
              price: service.priceDisplay,
            }}
          />

          <Link href={detailsHref} className="service-details-link">
            Details <b>→</b>
          </Link>
        </div>
      </div>
    </article>
  );
}
