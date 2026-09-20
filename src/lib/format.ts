/**
 * Date formatting helpers for the admin UI.
 *
 * Datetime strings from the database are "YYYY-MM-DD HH:MM:SS". They are
 * formatted WITHOUT timezone conversion so the admin always sees exactly
 * what was stored.
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2026-09-20" or "2026-09-20 15:41:22" → "Sep 20, 2026" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}

/** "2026-09-20 15:41:22" → "Sep 20, 2026 · 3:41 PM" */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const match =
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return value;
  const [, year, month, day, hourRaw, minute] = match;
  const hour = Number(hourRaw);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year} · ${hour12}:${minute} ${period}`;
}
