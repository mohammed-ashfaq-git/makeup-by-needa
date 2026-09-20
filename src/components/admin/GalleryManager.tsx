"use client";

import { useState } from "react";
import {
  deleteGalleryItemAction,
  moveGalleryItemAction,
  saveGalleryItemAction,
  toggleGalleryItemAction,
} from "@/lib/actions/gallery";
import { SubmitButton } from "./SubmitButton";
import { FieldError, FormBanner, fieldClass } from "./FormFeedback";
import { ImageField } from "./ImageField";
import {
  ActiveBadge,
  InlineForm,
  ManagerRow,
  useManagerForm,
} from "./manager-utils";

export type AdminGalleryItem = {
  id: number;
  imageUrl: string;
  title: string;
  caption: string | null;
  altText: string | null;
  category: "Makeup" | "Bridal" | "Hair" | "Nails";
  active: boolean;
};

const CATEGORIES = ["Makeup", "Bridal", "Hair", "Nails"] as const;

export function GalleryManager({
  items,
}: {
  items: AdminGalleryItem[];
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="a-card">
      <div className="a-card-head">
        <div>
          <h2>Gallery images</h2>
          <p className="a-muted">
            {items.length} image{items.length === 1 ? "" : "s"} · hidden images
            are not shown on the website
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
            + Upload image
          </button>
        )}
      </div>

      {adding && (
        <InlineForm>
          <GalleryItemForm initial={null} onDone={() => setAdding(false)} />
        </InlineForm>
      )}

      <div className="manager-list">
        {items.length === 0 && !adding && (
          <p className="a-empty">No gallery images yet.</p>
        )}

        {items.map((item) => (
          <div key={item.id}>
            <ManagerRow
              actions={
                <>
                  <form action={moveGalleryItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      className="a-btn ghost small"
                      aria-label={`Move ${item.title} up`}
                      title="Move up"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveGalleryItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      className="a-btn ghost small"
                      aria-label={`Move ${item.title} down`}
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
                  <form action={toggleGalleryItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="a-btn ghost small">
                      {item.active ? "Hide" : "Show"}
                    </button>
                  </form>
                  <form action={deleteGalleryItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <SubmitButton
                      className="a-btn danger small"
                      pendingText="…"
                      confirm={`Delete “${item.title}”? This cannot be undone.`}
                    >
                      Delete
                    </SubmitButton>
                  </form>
                </>
              }
            >
              <span className="a-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.altText || item.title} />
              </span>

              <div>
                <strong>
                  {item.title} <ActiveBadge active={item.active} />
                </strong>
                <div className="meta">
                  {item.category}
                  {item.caption ? ` · ${item.caption}` : ""}
                </div>
              </div>
            </ManagerRow>

            {editingId === item.id && (
              <InlineForm>
                <GalleryItemForm
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

function GalleryItemForm({
  initial,
  onDone,
}: {
  initial: AdminGalleryItem | null;
  onDone: () => void;
}) {
  const [state, formAction] = useManagerForm(saveGalleryItemAction, onDone);

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

      <ImageField
        name="image"
        label={initial ? "Replace image" : "Image"}
        hint="JPG, PNG, WEBP or GIF up to 5 MB."
        state={state}
        currentImageUrl={initial?.imageUrl ?? null}
      />

      <div className="a-grid-2">
        <div className="a-field">
          <label htmlFor={`gl-title-${initial?.id ?? "new"}`}>Title</label>
          <input
            id={`gl-title-${initial?.id ?? "new"}`}
            name="title"
            defaultValue={initial?.title ?? ""}
            required
            className={fieldClass("title", state)}
          />
          <FieldError name="title" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`gl-category-${initial?.id ?? "new"}`}>
            Category
          </label>
          <select
            id={`gl-category-${initial?.id ?? "new"}`}
            name="category"
            defaultValue={initial?.category ?? "Makeup"}
            className={fieldClass("category", state, "a-select")}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <FieldError name="category" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`gl-caption-${initial?.id ?? "new"}`}>
            Caption
          </label>
          <input
            id={`gl-caption-${initial?.id ?? "new"}`}
            name="caption"
            defaultValue={initial?.caption ?? ""}
            placeholder="Optional — shown in the lightbox"
            className={fieldClass("caption", state)}
          />
          <FieldError name="caption" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor={`gl-alt-${initial?.id ?? "new"}`}>
            Alt text
          </label>
          <input
            id={`gl-alt-${initial?.id ?? "new"}`}
            name="altText"
            defaultValue={initial?.altText ?? ""}
            placeholder="Describe the image for accessibility & SEO"
            className={fieldClass("altText", state)}
          />
          <FieldError name="altText" state={state} />
        </div>
      </div>

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
          {initial ? "Save changes" : "Upload image"}
        </SubmitButton>
        <button type="button" className="a-btn ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
