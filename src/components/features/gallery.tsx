"use client";

import Image from "next/image";
import { useState } from "react";
import { galleryItems, galleryImages } from "@/config/site";
import { Reveal } from "@/components/motion/motion";

const filters = ["All", "Makeup", "Bridal", "Hair", "Nails"] as const;

export function Gallery({ limit }: { limit?: number }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<number | null>(null);

  const placeholderItems = galleryItems.filter(
    (item) => !galleryImages.some((image) => image.title === item.title)
  );

  const allItems = [
    ...galleryImages,
    ...placeholderItems.map((item) => ({
      src: null,
      title: item.title,
      category: item.category,
      tone: item.tone,
    })),
  ];

  const filteredItems = allItems.filter(
    (item) => filter === "All" || item.category === filter
  );

  const items = filteredItems.slice(0, limit);
  const selectedItem = selected !== null ? items[selected] : null;

  return (
    <>
      <div className="filters" role="group" aria-label="Gallery filters">
        {filters.map((item) => (
          <button
            type="button"
            className={filter === item ? "active" : ""}
            onClick={() => {
              setFilter(item);
              setSelected(null);
            }}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      <div className={`gallery-grid ${limit ? "gallery-featured" : "gallery-editorial"}`}>
        {items.map((item, index) => (
          <Reveal
            key={`${item.title}-${index}`}
            delay={index * 90}
            direction={index % 2 ? "right" : "left"}
            media
          >
            <button
              type="button"
              className={`gallery-card ${"tone" in item ? (item as any).tone : ""}`}
              onClick={() => setSelected(index)}
              aria-label={`View ${item.title}`}
            >
              {item.src ? (
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes={
                    limit
                      ? "(max-width: 760px) 100vw, 33vw"
                      : "(max-width: 760px) 100vw, 50vw"
                  }
                />
              ) : (
                <span className="gallery-card-placeholder">Portfolio image</span>
              )}

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
          onClick={() => setSelected(null)}
        >
          <div
            className={`lightbox-content ${"tone" in selectedItem ? (selectedItem as any).tone : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close gallery preview"
            >
              ×
            </button>

            {selectedItem.src ? (
              <div className="lightbox-image">
                <Image src={selectedItem.src} alt={selectedItem.title} fill sizes="90vw" />
              </div>
            ) : (
              <div className="lightbox-placeholder">Portfolio image</div>
            )}

            <span>{selectedItem.category}</span>
            <h2>{selectedItem.title}</h2>
            <p>Makeup by Needa · Toronto, Canada</p>
          </div>
        </div>
      )}
    </>
  );
}
