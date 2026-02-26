/**
 * Format a Date to "YYYY-MM-DD" using local date parts.
 *
 * Unlike `d.toISOString().split("T")[0]`, this does NOT convert to UTC first,
 * so it won't shift the date in non-UTC timezones (e.g. Israel UTC+2/+3).
 */
export function formatDateLocal(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date and day-of-week in Israel timezone.
 *
 * Uses Intl.DateTimeFormat with timeZone: "Asia/Jerusalem" so it returns
 * the correct Israel date regardless of server timezone (UTC on Netlify).
 */
export function getIsraelToday(): { dateStr: string; dayOfWeek: number } {
  const now = new Date();

  // Use Intl to extract date parts in Israel timezone
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  const dateStr = `${year}-${month}-${day}`;

  // Compute day of week from the Israel date (use noon to avoid timezone edge cases)
  const israelDate = new Date(dateStr + "T12:00:00");
  return { dateStr, dayOfWeek: israelDate.getDay() };
}
