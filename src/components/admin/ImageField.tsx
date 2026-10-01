"use client";

import { useEffect, useRef, useState } from "react";
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
  recommendedDimensions,
  fit = "crop",
}: {
  name: string;
  label: string;
  hint?: string;
  state: ActionState | null;
  currentImageUrl?: string | null;
  removeName?: string;
  removeLabel?: string;
  previewWidth?: number;
  recommendedDimensions?: {
    width: number;
    height: number;
    shape: string;
  };
  fit?: "crop" | "contain";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDimensions, setSelectedDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const shownUrl = previewUrl ?? currentImageUrl ?? null;

  return (
    <div className="a-field">
      <label htmlFor={`${name}-input`}>{label}</label>
      {hint && (
        <span className="hint">{hint}</span>
      )}
      {recommendedDimensions && (
        <span className="hint">
          Recommended size: {recommendedDimensions.width} × {recommendedDimensions.height} px ({recommendedDimensions.shape}). {fit === "crop" ? "The site crops photos to fit its layout." : "Keep the full logo within the image; it will not be cropped."}
        </span>
      )}
      <span className="hint">Accepted: JPG, PNG, or WebP · Max 5 MB.</span>

      <div className="a-image-field">
        {shownUrl && (
          <div
            className={`a-image-preview${fit === "contain" ? " a-image-preview-contain" : ""}`}
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
          accept="image/jpeg,image/png,image/webp"
          className={fieldClass(name, state, "a-input")}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              const objectUrl = URL.createObjectURL(file);
              setPreviewUrl(objectUrl);
              setSelectedDimensions(null);

              const image = new window.Image();
              image.onload = () => {
                setSelectedDimensions({
                  width: image.naturalWidth,
                  height: image.naturalHeight,
                });
              };
              image.src = objectUrl;
            } else {
              setPreviewUrl(null);
              setSelectedDimensions(null);
            }
          }}
        />

        {selectedDimensions && (
          <span
            className={`hint${
              recommendedDimensions &&
              (selectedDimensions.width < recommendedDimensions.width ||
                selectedDimensions.height < recommendedDimensions.height)
                ? " image-dimensions-warning"
                : ""
            }`}
            aria-live="polite"
          >
            Selected image: {selectedDimensions.width} × {selectedDimensions.height} px.
            {recommendedDimensions &&
              (selectedDimensions.width < recommendedDimensions.width ||
                selectedDimensions.height < recommendedDimensions.height)
              ? " This is below the recommended size and may look soft on the site."
              : ""}
          </span>
        )}

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
