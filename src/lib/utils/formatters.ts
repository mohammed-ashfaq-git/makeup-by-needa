export function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return dateStr;
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
      dateStyle: "medium",
    });
  } catch {
    return dateStr;
  }
}

export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}
