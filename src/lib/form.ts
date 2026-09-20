/**
 * Shared helpers for server actions (plain module — no "use server" here so
 * types and sync helpers can be exported).
 */

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export const ACTION_IDLE: ActionState = { ok: false, message: "" };

/** Reads a trimmed string field. Empty string becomes null. */
export function readString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Reads a string field that may legitimately be empty (""). */
export function readRawString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Reads a checkbox field ("on" when checked). */
export function readBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

/** Reads an optional file input. Returns null when nothing was chosen. */
export function readOptionalFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  if (value instanceof File && value.size > 0) return value;
  return null;
}

/** Parses a positive integer ID, or null when invalid. */
export function readId(formData: FormData, key = "id"): number | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || String(parsed) !== value.trim()) {
    return null;
  }
  return parsed;
}

/** Parses an optional decimal price string into "123.45" or null. */
export function parsePrice(value: string | null): string | null {
  if (value == null) return null;
  const parsed = Number.parseFloat(value.replace(/[$,\s]/g, ""));
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 99999) return null;
  return parsed.toFixed(2);
}
