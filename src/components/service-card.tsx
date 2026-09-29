import Image from "next/image";
import Link from "next/link";
import { AddToEnquiryButton } from "@/components/service-cart";

/**
 * Shape of one card in the homepage slideshow. On the homepage each card is a
 * section of the nail price list and links straight to that section.
 */
export type ServiceCardData = {
  id?: number | string | null;
  name: string;
  category: string;
  subcategory?: string | null;
  description: string;
  priceDisplay: string;
  imageUrl?: string | null;
  /** Where the card and its "Details" link go; defaults to /services. */
  detailsHref?: string;
  /** Show the "Add to enquiry" button (off for whole price-list sections). */
  enquirable?: boolean;
};

/** Customer-facing label for a category: "Nails" is shown as "Nail Technician". */
export function getCategoryLabel(category: string): string {
  return category === "Nails" ? "Nail Technician" : category;
}

/**
 * A single service card, rendered by the homepage slideshow.
 *
 * Deliberately not marked "use client": it renders inside the slideshow
 * (a client component) and must therefore stay free of server-only imports.
 */
export function ServiceCard({
  service,
  index = 0,
  sizes = "(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 31vw",
}: {
  service: ServiceCardData;
  /** Position in the list; drives the two-digit number and visual variant. */
  index?: number;
  sizes?: string;
}) {
  const detailsHref = service.detailsHref ?? "/services";
  const enquirable = service.enquirable ?? true;
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
          {enquirable ? (
            <AddToEnquiryButton
              service={{
                id: service.id ?? undefined,
                name: service.name,
                category: service.category,
                subcategory: service.subcategory ?? null,
                price: service.priceDisplay,
              }}
            />
          ) : null}

          <Link href={detailsHref} className="service-details-link">
            {enquirable ? "Details" : "View prices"} <b>→</b>
          </Link>
        </div>
      </div>
    </article>
  );
}
