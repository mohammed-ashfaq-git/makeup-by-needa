"use client";

import type { ActionState } from "@/lib/form";

/** Success / error banner for useActionState-driven forms. */
export function FormBanner({ state }: { state: ActionState | null }) {
  if (!state?.message) return null;

  return (
    <div
      className={`a-banner ${state.ok ? "ok" : "error"}`}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true">{state.ok ? "✓" : "!"}</span>
      <span>{state.message}</span>
    </div>
  );
}

/** Inline validation message for a single field. */
export function FieldError({
  name,
  state,
}: {
  name: string;
  state: ActionState | null;
}) {
  const message = state?.fieldErrors?.[name];
  if (!message) return null;

  return (
    <p className="a-field-error" role="alert">
      {message}
    </p>
  );
}

/** Adds the error outline class when a field failed validation. */
export function fieldClass(
  name: string,
  state: ActionState | null,
  base = "a-input",
): string {
  return state?.fieldErrors?.[name] ? `${base} a-error-input` : base;
}
