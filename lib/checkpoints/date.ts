/** Rolling window for dashboard totals and default list filters. */
export const CHECKPOINTS_TWO_YEAR_DAYS = 730;

export function getTodayDateString(): string {
  return formatDateParts(new Date());
}

export function getCheckpointsTwoYearStartDate(): string {
  return getDateDaysAgo(CHECKPOINTS_TWO_YEAR_DAYS);
}

/** ISO date string for N days before today (inclusive window start). */
export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateParts(date);
}

/** First day of the current calendar year (YYYY-01-01). */
export function getCalendarYearStartDateString(): string {
  return `${new Date().getFullYear()}-01-01`;
}

export function getWeekDateRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: formatDateParts(monday),
    end: formatDateParts(sunday),
  };
}

export function formatDateParts(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isCheckpointUpcoming(
  dateStr: string | null | undefined,
): boolean {
  if (!dateStr) return false;
  return dateStr >= getTodayDateString();
}

export function formatCheckpointDate(
  dateStr: string | null | undefined,
): string {
  if (!dateStr) return "Date unavailable";

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
