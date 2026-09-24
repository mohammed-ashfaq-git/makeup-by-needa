"use client";

import { useMemo, useState } from "react";
import {
  deleteServiceAction,
  moveServiceAction,
  saveServiceAction,
  toggleServiceAction,
} from "@/lib/actions/services";
import { SubmitButton } from "./SubmitButton";
import { FieldError, FormBanner, fieldClass } from "./FormFeedback";
import { ImageField } from "./ImageField";
import {
  ActiveBadge,
  InlineForm,
  ManagerRow,
  useManagerForm,
} from "./manager-utils";

export type AdminService = {
  id: number;
  name: string;
  category: "Makeup" | "Hair" | "Nails";
  subcategory: string | null;
  shortDescription: string | null;
  description: string;
  details: string | null;
  price: string | null;
  priceDisplay: string | null;
  duration: string | null;
  imageUrl: string | null;
  featured: boolean;
  active: boolean;
};

const CATEGORIES = ["Makeup", "Hair", "Nails"] as const;

const COMMON_SUBCATEGORIES = [
  "Everyday Hair Services",
  "Event Hairstyling",
  "Bridal Hairstyling",
  "South Asian Hairstyling",
  "Hair Accessories",
  "Photoshoot & Fashion Hair",
  "Hair Extensions",
  "Braids & Special Styling",
  "Hair Add-Ons",
  "Bridal Party Services",
  "Bridal Makeup",
  "Event Makeup",
  "Photoshoot Makeup",
  "Gel Nails",
  "Nail Extensions",
  "Custom Nail Art",
];

export function ServicesManager({ services }: { services: AdminService[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (categoryFilter !== "All" && service.category !== categoryFilter) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        service.name.toLowerCase().includes(q) ||
        (service.subcategory && service.subcategory.toLowerCase().includes(q)) ||
        service.description.toLowerCase().includes(q) ||
        (service.priceDisplay && service.priceDisplay.toLowerCase().includes(q))
      );
    });
  }, [services, categoryFilter, search]);

  const displayedCategories =
    categoryFilter === "All" ? CATEGORIES : [categoryFilter as (typeof CATEGORIES)[number]];

  return (
    <div className="a-card">
      <div className="a-card-head">
        <div>
          <h2>All services</h2>
          <p className="a-muted">
            {services.length} service{services.length === 1 ? "" : "s"} ·
            hidden ones stay editable but are not shown on the website
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            className="a-btn primary"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
          >
            + Add service
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          marginBottom: "1.25rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #e5dbcf",
        }}
      >
        <div style={{ flex: "1 1 240px" }}>
          <input
            type="search"
            placeholder="Search services by name, subcategory, price…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.55rem 0.85rem",
              borderRadius: "6px",
              border: "1px solid #d5c8ba",
              background: "#fff",
              fontSize: "0.925rem",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`a-btn small ${
                categoryFilter === cat ? "primary" : "ghost"
              }`}
              style={{ padding: "0.4rem 0.75rem" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {adding && (
        <InlineForm>
          <ServiceFormFields
            initial={null}
            onDone={() => setAdding(false)}
          />
        </InlineForm>
      )}

      {displayedCategories.map((category) => {
        const categoryServices = filteredServices.filter(
          (service) => service.category === category,
        );

        if (categoryFilter !== "All" && categoryServices.length === 0) {
          return (
            <div key={category} style={{ marginTop: 18 }}>
              <p className="a-empty">No services matching your filter.</p>
            </div>
          );
        }

        if (categoryServices.length === 0 && search.trim()) {
          return null;
        }

        // Group by subcategory
        const subcategoryMap = new Map<string, AdminService[]>();
        for (const s of categoryServices) {
          const sub = s.subcategory?.trim() || "General / Uncategorized";
          const list = subcategoryMap.get(sub) ?? [];
          list.push(s);
          subcategoryMap.set(sub, list);
        }

        return (
          <div key={category} style={{ marginTop: 18 }}>
            <div className="manager-category-head">
              <h2>{category}</h2>
              <span className="a-muted">
                {categoryServices.length} item
                {categoryServices.length === 1 ? "" : "s"}
              </span>
            </div>

            {categoryServices.length === 0 && (
              <p className="a-empty">No services in this category yet.</p>
            )}

            {Array.from(subcategoryMap.entries()).map(([subTitle, itemsInSub]) => (
              <div key={subTitle} style={{ marginTop: 12, marginBottom: 12 }}>
                {subcategoryMap.size > 1 || subTitle !== "General / Uncategorized" ? (
                  <h3
                    style={{
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#8c673d",
                      margin: "0.75rem 0 0.5rem 0.25rem",
                      fontWeight: 600,
                    }}
                  >
                    {subTitle} ({itemsInSub.length})
                  </h3>
                ) : null}

                <div className="manager-list">
                  {itemsInSub.map((service) => (
                    <div key={service.id}>
                      <ManagerRow
                        actions={
                          <>
                            <form action={moveServiceAction}>
                              <input type="hidden" name="id" value={service.id} />
                              <input type="hidden" name="direction" value="up" />
                              <button
                                type="submit"
                                className="a-btn ghost small"
                                aria-label={`Move ${service.name} up`}
                                title="Move up"
                              >
                                ↑
                              </button>
                            </form>
                            <form action={moveServiceAction}>
                              <input type="hidden" name="id" value={service.id} />
                              <input type="hidden" name="direction" value="down" />
                              <button
                                type="submit"
                                className="a-btn ghost small"
                                aria-label={`Move ${service.name} down`}
                                title="Move down"
                              >
                                ↓
                              </button>
                            </form>
                            <button
                              type="button"
                              className="a-btn small"
                              onClick={() => {
                                setEditingId(
                                  editingId === service.id ? null : service.id,
                                );
                                setAdding(false);
                              }}
                            >
                              {editingId === service.id ? "Close" : "Edit"}
                            </button>
                            <form action={toggleServiceAction}>
                              <input type="hidden" name="id" value={service.id} />
                              <button type="submit" className="a-btn ghost small">
                                {service.active ? "Hide" : "Show"}
                              </button>
                            </form>
                            <form action={deleteServiceAction}>
                              <input type="hidden" name="id" value={service.id} />
                              <SubmitButton
                                className="a-btn danger small"
                                pendingText="…"
                                confirm={`Delete “${service.name}”? This cannot be undone.`}
                              >
                                Delete
                              </SubmitButton>
                            </form>
                          </>
                        }
                      >
                        {service.imageUrl && (
                          <span className="a-thumb">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={service.imageUrl} alt="" />
                          </span>
                        )}

                        <div>
                          <strong>
                            {service.name}{" "}
                            {service.featured && (
                              <span className="a-badge status-NEW">Featured</span>
                            )}{" "}
                            <ActiveBadge active={service.active} />
                          </strong>
                          <div className="meta">
                            {service.subcategory ? (
                              <span
                                style={{
                                  background: "#f3ede5",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  marginRight: 6,
                                  fontSize: "0.8em",
                                }}
                              >
                                {service.subcategory}
                              </span>
                            ) : null}
                            <strong>
                              {service.priceDisplay ||
                                (service.price != null
                                  ? `$${service.price}`
                                  : "Enquire for pricing")}
                            </strong>
                            {service.duration ? ` · ${service.duration}` : ""}
                          </div>
                        </div>
                      </ManagerRow>

                      {editingId === service.id && (
                        <InlineForm>
                          <ServiceFormFields
                            initial={service}
                            onDone={() => setEditingId(null)}
                          />
                        </InlineForm>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ServiceFormFields({
  initial,
  onDone,
}: {
  initial: AdminService | null;
  onDone: () => void;
}) {
  const [state, formAction] = useManagerForm(saveServiceAction, onDone);

  return (
    <form
      action={formAction}
      className="a-form"
      // React resets forms after a server action finishes; cancel that so
      // the user's input survives validation errors and successful saves.
      onReset={(event) => event.preventDefault()}
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <FormBanner state={state} />

      <datalist id="subcategories-list">
        {COMMON_SUBCATEGORIES.map((sub) => (
          <option key={sub} value={sub} />
        ))}
      </datalist>

      <div className="a-grid-2">
        <div className="a-field">
          <label htmlFor={`sv-name-${initial?.id ?? "new"}`}>Name</label>
          <input
            id={`sv-name-${initial?.id ?? "new"}`}
            name="name"
            defaultValue={initial?.name ?? ""}
            required
            className={fieldClass("name", state)}
          />
          <FieldError name="name" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`sv-category-${initial?.id ?? "new"}`}>Category</label>
          <select
            id={`sv-category-${initial?.id ?? "new"}`}
            name="category"
            defaultValue={initial?.category ?? "Hair"}
            className={fieldClass("category", state, "a-select")}
          >
            <option value="Hair">Hair</option>
            <option value="Makeup">Makeup</option>
            <option value="Nails">Nails</option>
          </select>
          <FieldError name="category" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`sv-subcategory-${initial?.id ?? "new"}`}>
            Subcategory / Group
          </label>
          <input
            id={`sv-subcategory-${initial?.id ?? "new"}`}
            name="subcategory"
            list="subcategories-list"
            defaultValue={initial?.subcategory ?? ""}
            placeholder="e.g. Everyday Hair Services, Event Hairstyling…"
            className={fieldClass("subcategory", state)}
          />
          <span className="hint">
            Used to group services on the menu (e.g. Everyday Hair, Event Styling, Bridal).
          </span>
          <FieldError name="subcategory" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`sv-price-display-${initial?.id ?? "new"}`}>
            Price display text
          </label>
          <input
            id={`sv-price-display-${initial?.id ?? "new"}`}
            name="priceDisplay"
            defaultValue={initial?.priceDisplay ?? ""}
            placeholder='e.g. "$45+", "From $100", "Custom Quote"'
            className={fieldClass("priceDisplay", state)}
          />
          <span className="hint">
            Text displayed on the public menu and enquiry cart.
          </span>
          <FieldError name="priceDisplay" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`sv-price-${initial?.id ?? "new"}`}>
            Numeric Price in CAD (optional)
          </label>
          <input
            id={`sv-price-${initial?.id ?? "new"}`}
            name="price"
            inputMode="decimal"
            defaultValue={initial?.price ?? ""}
            placeholder="e.g. 50 or 50.00"
            className={fieldClass("price", state)}
          />
          <span className="hint">
            Base numeric price for sorting/calculations.
          </span>
          <FieldError name="price" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`sv-duration-${initial?.id ?? "new"}`}>Duration</label>
          <input
            id={`sv-duration-${initial?.id ?? "new"}`}
            name="duration"
            defaultValue={initial?.duration ?? ""}
            placeholder="e.g. 60–90 min"
            className={fieldClass("duration", state)}
          />
          <FieldError name="duration" state={state} />
        </div>
      </div>

      <div className="a-field">
        <label htmlFor={`sv-short-${initial?.id ?? "new"}`}>
          Short description
        </label>
        <input
          id={`sv-short-${initial?.id ?? "new"}`}
          name="shortDescription"
          defaultValue={initial?.shortDescription ?? ""}
          placeholder="Optional — one line summary"
          className={fieldClass("shortDescription", state)}
        />
        <FieldError name="shortDescription" state={state} />
      </div>

      <div className="a-field">
        <label htmlFor={`sv-description-${initial?.id ?? "new"}`}>
          Full description
        </label>
        <textarea
          id={`sv-description-${initial?.id ?? "new"}`}
          name="description"
          defaultValue={initial?.description ?? ""}
          required
          rows={3}
          className={fieldClass("description", state, "a-textarea")}
        />
        <FieldError name="description" state={state} />
      </div>

      <div className="a-field">
        <label htmlFor={`sv-details-${initial?.id ?? "new"}`}>
          Detail bullets (one per line)
        </label>
        <textarea
          id={`sv-details-${initial?.id ?? "new"}`}
          name="details"
          defaultValue={initial?.details ?? ""}
          rows={3}
          placeholder="e.g.&#10;Includes wash and blow-dry&#10;Heat protection applied&#10;Long-lasting setting spray"
          className={fieldClass("details", state, "a-textarea")}
        />
        <span className="hint">
          Optional bullet points shown under the service in the price list.
        </span>
        <FieldError name="details" state={state} />
      </div>

      <ImageField
        name="image"
        label="Service image"
        hint="Optional — shown on the homepage service cards and category panels."
        state={state}
        currentImageUrl={initial?.imageUrl ?? null}
        removeName="removeImage"
        removeLabel="Remove the current image"
      />

      <div className="a-btn-row">
        <label className="a-check">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initial?.featured ?? false}
          />
          Featured on the homepage
        </label>

        <label className="a-check">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initial?.active ?? true}
          />
          Visible on the website
        </label>
      </div>

      <div className="a-btn-row">
        <SubmitButton pendingText="Saving…">
          {initial ? "Save service" : "Add service"}
        </SubmitButton>
        <button type="button" className="a-btn ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
