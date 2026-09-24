"use client";

import { useState } from "react";
import {
  deleteGalleryItemAction,
  moveGalleryItemAction,
  saveGalleryItemAction,
  toggleGalleryItemAction,
} from "@/lib/actions/gallery";
import { isExternalVideoUrl } from "@/lib/video-url";
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
  /** Optional portrait crop served on phones (< 640px). */
  mobileImageUrl: string | null;
  title: string;
  caption: string | null;
  altText: string | null;
  category: "Makeup" | "Bridal" | "Hair" | "Nails";
  mediaType?: "image" | "video";
  videoUrl?: string | null;
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

  const imageCount = items.filter((i) => i.mediaType !== "video").length;
  const videoCount = items.filter((i) => i.mediaType === "video").length;

  return (
    <div className="a-card">
      <div className="a-card-head">
        <div>
          <h2>Gallery items</h2>
          <p className="a-muted">
            {items.length} item{items.length === 1 ? "" : "s"} ({imageCount} image{imageCount === 1 ? "" : "s"}, {videoCount} video{videoCount === 1 ? "" : "s"}) · hidden items
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
            + Add to gallery
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
          <p className="a-empty">No gallery items yet.</p>
        )}

        {items.map((item) => {
          const isVideo = item.mediaType === "video";
          return (
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
                <span className="a-thumb" style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.altText || item.title} />
                  {isVideo && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 4,
                        right: 4,
                        background: "rgba(0,0,0,0.75)",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                      }}
                      title="Video"
                    >
                      ▶
                    </span>
                  )}
                </span>

                <div>
                  <strong>
                    {item.title}{" "}
                    {isVideo && (
                      <span
                        className="a-badge"
                        style={{
                          background: "#e8f0fe",
                          color: "#1a73e8",
                          marginRight: 6,
                        }}
                      >
                        ▶ Video
                      </span>
                    )}
                    <ActiveBadge active={item.active} />
                  </strong>
                  <div className="meta">
                    {item.category}
                    {item.mobileImageUrl ? " · Mobile crop" : ""}
                    {item.caption ? ` · ${item.caption}` : ""}
                    {isVideo && item.videoUrl ? (
                      <span className="a-muted">
                        {" "}
                        ·{" "}
                        {isExternalVideoUrl(item.videoUrl)
                          ? "External link"
                          : "Uploaded video"}
                      </span>
                    ) : null}
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
          );
        })}
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
  const [mediaType, setMediaType] = useState<"image" | "video">(
    initial?.mediaType === "video" ? "video" : "image",
  );

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

      {/* Media Type selection */}
      <div className="a-field">
        <label>Media type</label>
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.25rem" }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="mediaType"
              value="image"
              checked={mediaType === "image"}
              onChange={() => setMediaType("image")}
            />
            <span>Photo / Image</span>
          </label>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="mediaType"
              value="video"
              checked={mediaType === "video"}
              onChange={() => setMediaType("video")}
            />
            <span>Video (Link or Upload)</span>
          </label>
        </div>
      </div>

      {mediaType === "image" ? (
        <>
          <ImageField
            name="image"
            label={initial ? "Desktop image — replace file" : "Desktop image file"}
            hint="JPG, PNG, or WEBP up to 5 MB. Shown on desktop and tablet."
            state={state}
            currentImageUrl={initial?.imageUrl ?? null}
          />

          <ImageField
            name="mobileImage"
            label="Mobile portrait crop (optional)"
            hint="Recommended 4:5 portrait, JPG/PNG/WEBP up to 5 MB. Shown on phones; when empty, the desktop image is used on mobile instead."
            state={state}
            currentImageUrl={initial?.mobileImageUrl ?? null}
            removeName="removeMobileImage"
            removeLabel="Use the desktop image on mobile instead"
            previewWidth={110}
          />
        </>
      ) : (
        <div
          style={{
            background: "rgba(0,0,0,0.02)",
            padding: "1rem",
            borderRadius: 8,
            marginBottom: "1rem",
            border: "1px solid #e5dbcf",
          }}
        >
          <div className="a-field">
            <label htmlFor={`gl-video-url-${initial?.id ?? "new"}`}>
              Video link (YouTube, Vimeo, or MP4)
            </label>
            <input
              id={`gl-video-url-${initial?.id ?? "new"}`}
              name="videoUrl"
              defaultValue={initial?.videoUrl ?? ""}
              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
              className={fieldClass("videoUrl", state)}
            />
            <span className="hint">
              Paste a YouTube or Vimeo link, or leave blank to upload a video
              file below.
            </span>
            <FieldError name="videoUrl" state={state} />
          </div>

          <div className="a-field" style={{ marginTop: "0.75rem" }}>
            <label htmlFor={`gl-video-file-${initial?.id ?? "new"}`}>
              Or upload video file (MP4, WebM, MOV up to 40 MB)
            </label>
            <input
              id={`gl-video-file-${initial?.id ?? "new"}`}
              type="file"
              name="videoFile"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              className={fieldClass("videoFile", state)}
            />
            <FieldError name="videoFile" state={state} />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <ImageField
              name="image"
              label="Video thumbnail / poster image — desktop (optional)"
              hint="JPG, PNG, or WEBP up to 5 MB. YouTube thumbnails are detected automatically if left blank."
              state={state}
              currentImageUrl={initial?.imageUrl ?? null}
            />

            <ImageField
              name="mobileImage"
              label="Video thumbnail / poster image — mobile portrait crop (optional)"
              hint="Recommended 4:5 portrait. Shown on phones; when empty, the desktop thumbnail is used on mobile instead."
              state={state}
              currentImageUrl={initial?.mobileImageUrl ?? null}
              removeName="removeMobileImage"
              removeLabel="Use the desktop thumbnail on mobile instead"
              previewWidth={110}
            />
          </div>
        </div>
      )}

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
            placeholder="Describe for accessibility & SEO"
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
          {initial
            ? "Save changes"
            : mediaType === "video"
            ? "Add video"
            : "Upload image"}
        </SubmitButton>
        <button type="button" className="a-btn ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
