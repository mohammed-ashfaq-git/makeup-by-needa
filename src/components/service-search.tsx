"use client";

import { useMemo, useState } from "react";

export type ServiceSearchItem = {
  id: string;
  name: string;
  price: string;
  description?: string;
  /** Price-list section the service is listed under, e.g. "Nail Extensions". */
  group: string;
  /** Anchor of that section, e.g. "#nail-extensions". */
  href: string;
};

const ALL = "All";

/**
 * Search across the nail price list. The chips are the price-list sections
 * themselves (passed in `groups`), so they can never drift from the menu.
 *
 * The result list only appears once a filter is active — until then the page
 * below is the menu, and this panel is a fast way to find one entry and jump
 * to it.
 */
export function ServiceSearch({
  items,
  groups,
}: {
  items: ServiceSearchItem[];
  /** Section titles in menu order; each becomes a filter chip. */
  groups: string[];
}) {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<string>(ALL);

  const chips = useMemo(
    () => [ALL, ...groups.filter((group) => items.some((item) => item.group === group))],
    [groups, items],
  );

  const trimmedQuery = query.trim().toLowerCase();
  const filtering = trimmedQuery !== "" || chip !== ALL;

  const results = useMemo(() => {
    if (!trimmedQuery && chip === ALL) return [];
    const needle = trimmedQuery;

    return items.filter((item) => {
      if (chip !== ALL && item.group !== chip) return false;
      if (!needle) return true;

      return (
        item.name.toLowerCase().includes(needle) ||
        item.group.toLowerCase().includes(needle) ||
        (item.description?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [chip, items, trimmedQuery]);

  const clear = () => {
    setQuery("");
    setChip(ALL);
  };

  return (
    <section className="service-search" id="service-search">
      <div className="shell">
        <header className="service-search-header">
          <p className="eyebrow">Find your service</p>

          <h2>Search the price list.</h2>

          <p className="service-search-lede">
            Nail, makeup and hair services in one list. Search by name, or filter by
            section and jump straight to the details.
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
              placeholder="Try “chrome”, “Gel-X”, “French”…"
              autoComplete="off"
              aria-controls="service-search-results"
            />
          </div>

          <div className="service-search-chips" role="group" aria-label="Filter by section">
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
                {items.length} services in the price list — start typing to filter.
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
                  filters to see the whole price list.
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
                        {item.group}
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
