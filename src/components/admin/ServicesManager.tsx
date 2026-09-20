"use client";

import { useState } from "react";
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
  shortDescription: string | null;
  description: string;
  price: string | null;
  priceDisplay: string | null;
  duration: string | null;
  imageUrl: string | null;
  featured: boolean;
  active: boolean;
};

const CATEGORIES = ["Makeup", "Hair", "Nails"] as const;

export function ServicesManager({ services }: { services: AdminService[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

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

      {adding && (
        <InlineForm>
          <ServiceFormFields
            initial={null}
            onDone={() => setAdding(false)}
          />
        </InlineForm>
      )}

      {CATEGORIES.map((category) => {
        const categoryServices = services.filter(
          (service) => service.category === category,
        );

        return (
          <div key={category} style={{ marginTop: 18 }}>
            <div className="manager-category-head">
              <h2>{category}</h2>
              <span className="a-muted">
                {categoryServices.length} item
                {categoryServices.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="manager-list">
              {categoryServices.length === 0 && (
                <p className="a-empty">No services in this category yet.</p>
              )}

              {categoryServices.map((service) => (
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
                        {service.priceDisplay ||
                          (service.price != null
                            ? `$${service.price}`
                            : "Enquire for pricing")}
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
            defaultValue={initial?.category ?? "Makeup"}
            className={fieldClass("category", state, "a-select")}
          >
            <option value="Makeup">Makeup</option>
            <option value="Hair">Hair</option>
            <option value="Nails">Nails</option>
          </select>
          <FieldError name="category" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`sv-price-${initial?.id ?? "new"}`}>
            Price (CAD)
          </label>
          <input
            id={`sv-price-${initial?.id ?? "new"}`}
            name="price"
            inputMode="decimal"
            defaultValue={initial?.price ?? ""}
            placeholder="Leave blank for “Enquire for pricing”"
            className={fieldClass("price", state)}
          />
          <span className="hint">
            Numbers only, e.g. 150 or 150.00. Leave blank if the price is set
            per enquiry.
          </span>
          <FieldError name="price" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`sv-price-display-${initial?.id ?? "new"}`}>
            Price display text
          </label>
          <input
            id={`sv-price-display-${initial?.id ?? "new"}`}
            name="priceDisplay"
            defaultValue={initial?.priceDisplay ?? ""}
            placeholder='Optional — e.g. "From $120"'
            className={fieldClass("priceDisplay", state)}
          />
          <span className="hint">
            Overrides the price above when shown on the website.
          </span>
          <FieldError name="priceDisplay" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`sv-duration-${initial?.id ?? "new"}`}>Duration</label>
          <input
            id={`sv-duration-${initial?.id ?? "new"}`}
            name="duration"
            defaultValue={initial?.duration ?? ""}
            placeholder="e.g. 90 minutes"
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
          placeholder="Optional — one line, used on the homepage cards"
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
          rows={4}
          className={fieldClass("description", state, "a-textarea")}
        />
        <FieldError name="description" state={state} />
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
