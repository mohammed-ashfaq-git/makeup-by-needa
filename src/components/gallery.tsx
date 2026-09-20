"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/motion";

const filters = ["All", "Makeup", "Bridal", "Hair", "Nails"] as const;

export type GalleryViewItem = {
  id: number;
  title: string;
  category: (typeof filters)[number];
  imageUrl: string;
  altText: string;
  caption: string | null;
};

/**
 * Gallery grid. Items come from the CMS (with a static fallback), so every
 * card is a real portfolio image.
 */
export function Gallery({
  items,
  limit,
  businessName,
  location,
}: {
  items: GalleryViewItem[];
  limit?: number;
  businessName: string;
  location: string;
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredItems = items.filter(
    (item) => filter === "All" || item.category === filter,
  );

  // No portfolio images yet — show a quiet note instead of an empty grid.
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p className="eyebrow">Portfolio</p>
        <p>
          The portfolio is being refreshed — new work will be shared here
          soon. Please enquire for recent examples of {businessName}&apos;s
          makeup, hair and nail artistry.
        </p>
      </div>
    );
  }

  const itemsShown = filteredItems.slice(0, limit);

  const selectedItem =
    selectedId !== null
      ? itemsShown.find((item) => item.id === selectedId) ?? null
      : null;

  return (
    <>
      <div className="filters" role="group" aria-label="Gallery filters">
        {filters.map((item) => (
          <button
            type="button"
            className={filter === item ? "active" : ""}
            onClick={() => {
              setFilter(item);
              setSelectedId(null);
            }}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      <div
        className={`gallery-grid ${
          limit ? "gallery-featured" : "gallery-editorial"
        }`}
      >
        {itemsShown.map((item, index) => (
          <Reveal
            key={item.id}
            delay={index * 90}
            direction={index % 2 ? "right" : "left"}
            media
          >
            <button
              type="button"
              className="gallery-card"
              onClick={() => setSelectedId(item.id)}
              aria-label={`View ${item.title}`}
            >
              <Image
                src={item.imageUrl}
                alt={item.altText || item.title}
                fill
                sizes={
                  limit
                    ? "(max-width: 760px) 100vw, 33vw"
                    : "(max-width: 760px) 100vw, 50vw"
                }
              />

              <span className="gallery-card-overlay" />

              <span className="gallery-card-info">
                <span>{item.category}</span>
                <strong>{item.title}</strong>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {selectedItem && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery preview"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close gallery preview"
            >
              ×
            </button>

            <div className="lightbox-image">
              <Image
                src={selectedItem.imageUrl}
                alt={selectedItem.altText || selectedItem.title}
                fill
                sizes="90vw"
              />
            </div>

            <span>{selectedItem.category}</span>

            <h2>{selectedItem.title}</h2>

            {selectedItem.caption && <p>{selectedItem.caption}</p>}

            <p>
              {businessName} · {location}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
