"use client";

import { useRef, useState } from "react";
import { FieldError, fieldClass } from "./FormFeedback";
import type { ActionState } from "@/lib/form";

/**
 * Image upload field with a live preview, an optional "current image"
 * indicator and a remove checkbox. The file itself is submitted with the
 * form — nothing is uploaded until the whole form is saved.
 */
export function ImageField({
  name,
  label,
  hint,
  state,
  currentImageUrl,
  removeName,
  removeLabel = "Remove image",
  previewWidth = 120,
}: {
  name: string;
  label: string;
  hint?: string;
  state: ActionState | null;
  currentImageUrl?: string | null;
  removeName?: string;
  removeLabel?: string;
  previewWidth?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const shownUrl = previewUrl ?? currentImageUrl ?? null;

  return (
    <div className="a-field">
      <label htmlFor={`${name}-input`}>{label}</label>
      {hint && (
        <span className="hint">{hint}</span>
      )}

      <div className="a-image-field">
        {shownUrl && (
          <div
            className="a-image-preview"
            style={{ width: previewWidth, height: previewWidth }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shownUrl} alt="Image preview" />
          </div>
        )}

        <input
          ref={inputRef}
          id={`${name}-input`}
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={fieldClass(name, state, "a-input")}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              setPreviewUrl(URL.createObjectURL(file));
            } else {
              setPreviewUrl(null);
            }
          }}
        />

        {currentImageUrl && removeName && (
          <label className="a-check">
            <input type="checkbox" name={removeName} />
            {removeLabel}
          </label>
        )}
      </div>

      <FieldError name={name} state={state} />
    </div>
  );
}
