"use client";

import { useMemo, useState } from "react";

export type ServiceSearchItem = {
  id: string;
  name: string;
  price: string;
  description?: string;
  /** Chip grouping. */
  category: "Makeup" | "Hair" | "Nails";
  /** Section the service is listed under, e.g. "Bridal Hair Services". */
  group: string;
  /** Anchor of the section this service is listed in, e.g. "#hair-bridal". */
  href: string;
};

const CATEGORY_ORDER = ["Makeup", "Hair", "Nails"] as const;
type Chip = "All" | (typeof CATEGORY_ORDER)[number];

/**
 * Search across the whole services page: every hairstyling price-list entry
 * plus each makeup and nail service the CMS provides.
 *
 * The result list only appears once a filter is active — until then the page
 * below is the menu, and this panel is a fast way to find one entry and jump
 * to it.
 */
export function ServiceSearch({ items }: { items: ServiceSearchItem[] }) {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<Chip>("All");

  const chips = useMemo<Chip[]>(
    () => [
      "All",
      ...CATEGORY_ORDER.filter((category) =>
        items.some((item) => item.category === category),
      ),
    ],
    [items],
  );

  const trimmedQuery = query.trim().toLowerCase();
  const filtering = trimmedQuery !== "" || chip !== "All";

  const results = useMemo(() => {
    if (!trimmedQuery && chip === "All") return [];
    const needle = trimmedQuery;

    return items.filter((item) => {
      if (chip !== "All" && item.category !== chip) return false;
      if (!needle) return true;

      return (
        item.name.toLowerCase().includes(needle) ||
        item.group.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle) ||
        (item.description?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [chip, items, trimmedQuery]);

  const clear = () => {
    setQuery("");
    setChip("All");
  };

  return (
    <section className="service-search" id="service-search">
      <div className="shell">
        <header className="service-search-header">
          <p className="eyebrow">Find your service</p>

          <h2>Search the full menu.</h2>

          <p className="service-search-lede">
            Every hairstyling price-list entry and each makeup or nail service,
            in one list. Search by name, or filter by category and jump straight
            to the details.
          </p>
        </header>

        <div className="service-search-panel" role="search">
          <div className="service-search-field">
            <label className="service-search-label" htmlFor="service-search-input">
              Search services
            </label>

            <input
              className="service-search-input"
              id="service-search-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try “bridal”, “blowout”, “nail art”…"
              autoComplete="off"
              aria-controls="service-search-results"
            />
          </div>

          <div className="service-search-chips" role="group" aria-label="Filter by category">
            {chips.map((option) => (
              <button
                key={option}
                type="button"
                className={`service-search-chip${
                  option === chip ? " is-active" : ""
                }`}
                onClick={() => setChip(option)}
                aria-pressed={option === chip}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="service-search-status">
            {filtering ? (
              <>
                <span className="service-search-count" aria-live="polite">
                  {results.length} of {items.length} services
                </span>

                <button
                  type="button"
                  className="service-search-clear"
                  onClick={clear}
                >
                  Clear
                </button>
              </>
            ) : (
              <span className="service-search-hint">
                {items.length} services in the full menu — start typing to filter.
              </span>
            )}
          </div>

          <div
            className="service-search-results"
            id="service-search-results"
            aria-live="polite"
          >
            {filtering && results.length === 0 ? (
              <div className="service-search-empty">
                <p>
                  No services match that search. Try another word, or clear the
                  filters to see the whole menu.
                </p>

                <button
                  type="button"
                  className="service-search-clear"
                  onClick={clear}
                >
                  Clear filters
                </button>
              </div>
            ) : null}

            {filtering && results.length > 0 ? (
              <ul className="service-search-list">
                {results.map((item) => (
                  <li className="service-search-result" key={item.id}>
                    <div className="service-search-result-main">
                      <h3 className="service-search-result-name">{item.name}</h3>

                      <p className="service-search-result-meta">
                        {item.group} · {item.category === "Nails" ? "Nail Art" : item.category}
                      </p>

                      {item.description ? (
                        <p className="service-search-result-desc">
                          {item.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="service-search-result-side">
                      <strong className="service-search-result-price">
                        {item.price}
                      </strong>

                      <a className="service-search-details" href={item.href}>
                        Details <b>→</b>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
