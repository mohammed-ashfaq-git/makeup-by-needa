"use client";

import { useState } from "react";
import {
  deleteTestimonialAction,
  moveTestimonialAction,
  saveTestimonialAction,
  toggleTestimonialAction,
} from "@/lib/actions/testimonials";
import { SubmitButton } from "./SubmitButton";
import { FieldError, FormBanner, fieldClass } from "./FormFeedback";
import { ImageField } from "./ImageField";
import {
  ActiveBadge,
  InlineForm,
  ManagerRow,
  useManagerForm,
} from "./manager-utils";

export type AdminTestimonial = {
  id: number;
  clientName: string;
  quote: string;
  rating: number;
  photoUrl: string | null;
  service: string | null;
  active: boolean;
};

export function TestimonialsManager({
  items,
}: {
  items: AdminTestimonial[];
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="a-card">
      <div className="a-card-head">
        <div>
          <h2>Testimonials</h2>
          <p className="a-muted">
            {items.length} testimonial{items.length === 1 ? "" : "s"} · shown
            on the homepage
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
            + Add testimonial
          </button>
        )}
      </div>

      {adding && (
        <InlineForm>
          <TestimonialForm initial={null} onDone={() => setAdding(false)} />
        </InlineForm>
      )}

      <div className="manager-list">
        {items.length === 0 && !adding && (
          <p className="a-empty">
            No testimonials yet — add one and it will appear on the homepage.
          </p>
        )}

        {items.map((item) => (
          <div key={item.id}>
            <ManagerRow
              actions={
                <>
                  <form action={moveTestimonialAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      className="a-btn ghost small"
                      aria-label={`Move ${item.clientName} up`}
                      title="Move up"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveTestimonialAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      className="a-btn ghost small"
                      aria-label={`Move ${item.clientName} down`}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </form>
                  <button
                    type="button"
                    className="a-btn small"
                    onClick={() => {
                      setEditingId(editingId === item.id ? null : item.id);
                      setAdding(false);
                    }}
                  >
                    {editingId === item.id ? "Close" : "Edit"}
                  </button>
                  <form action={toggleTestimonialAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="a-btn ghost small">
                      {item.active ? "Hide" : "Show"}
                    </button>
                  </form>
                  <form action={deleteTestimonialAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <SubmitButton
                      className="a-btn danger small"
                      pendingText="…"
                      confirm={`Delete the testimonial from ${item.clientName}? This cannot be undone.`}
                    >
                      Delete
                    </SubmitButton>
                  </form>
                </>
              }
            >
              {item.photoUrl && (
                <span className="a-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.photoUrl} alt="" />
                </span>
              )}

              <div>
                <strong>
                  {item.clientName} <ActiveBadge active={item.active} />
                </strong>
                <div className="meta">
                  {"★".repeat(item.rating)}
                  {"☆".repeat(5 - item.rating)}
                  {item.service ? ` · ${item.service}` : ""}
                </div>
                <div className="meta" style={{ marginTop: 4 }}>
                  “{item.quote.length > 90
                    ? `${item.quote.slice(0, 90)}…`
                    : item.quote}”
                </div>
              </div>
            </ManagerRow>

            {editingId === item.id && (
              <InlineForm>
                <TestimonialForm
                  initial={item}
                  onDone={() => setEditingId(null)}
                />
              </InlineForm>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialForm({
  initial,
  onDone,
}: {
  initial: AdminTestimonial | null;
  onDone: () => void;
}) {
  const [state, formAction] = useManagerForm(saveTestimonialAction, onDone);

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
          <label htmlFor={`t-name-${initial?.id ?? "new"}`}>Client name</label>
          <input
            id={`t-name-${initial?.id ?? "new"}`}
            name="clientName"
            defaultValue={initial?.clientName ?? ""}
            required
            className={fieldClass("clientName", state)}
          />
          <FieldError name="clientName" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`t-rating-${initial?.id ?? "new"}`}>
            Rating
          </label>
          <select
            id={`t-rating-${initial?.id ?? "new"}`}
            name="rating"
            defaultValue={String(initial?.rating ?? 5)}
            className={fieldClass("rating", state, "a-select")}
          >
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★☆ (4)</option>
            <option value="3">★★★☆☆ (3)</option>
            <option value="2">★★☆☆☆ (2)</option>
            <option value="1">★☆☆☆☆ (1)</option>
          </select>
          <FieldError name="rating" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`t-service-${initial?.id ?? "new"}`}>
            Service
          </label>
          <input
            id={`t-service-${initial?.id ?? "new"}`}
            name="service"
            defaultValue={initial?.service ?? ""}
            placeholder="Optional — e.g. Bridal Makeup"
            className={fieldClass("service", state)}
          />
          <FieldError name="service" state={state} />
        </div>
      </div>

      <div className="a-field">
        <label htmlFor={`t-quote-${initial?.id ?? "new"}`}>Testimonial</label>
        <textarea
          id={`t-quote-${initial?.id ?? "new"}`}
          name="quote"
          defaultValue={initial?.quote ?? ""}
          required
          rows={4}
          className={fieldClass("quote", state, "a-textarea")}
        />
        <FieldError name="quote" state={state} />
      </div>

      <ImageField
        name="photo"
        label="Client photo"
        hint="Optional — shown next to the client name."
        state={state}
        currentImageUrl={initial?.photoUrl ?? null}
        removeName="removePhoto"
        removeLabel="Remove the current photo"
      />

      <label className="a-check">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
        />
        Visible on the website
      </label>

      <div className="a-btn-row">
        <SubmitButton pendingText="Saving…">
          {initial ? "Save testimonial" : "Add testimonial"}
        </SubmitButton>
        <button type="button" className="a-btn ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
