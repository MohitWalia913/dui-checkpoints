import { getCheckpointsTwoYearStartDate } from "@/lib/checkpoints/date";

/** Max rows fetched on the checkpoints list page (all matching filters). */
export const CHECKPOINTS_LIST_MAX = 5000;

/** Default list window when no year/month filter is selected (matches KPI). */
export function getDefaultCheckpointListFromDate(): string {
  return getCheckpointsTwoYearStartDate();
}

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type CheckpointListFilterParams = {
  year: number;
  month: number | null;
  fromDate: string;
  toDate?: string;
};

/** Current calendar year and previous year (newest first). */
export function getCheckpointYearOptions(): number[] {
  const thisYear = new Date().getFullYear();
  return [thisYear, thisYear - 1];
}

export function getDefaultFilterYear(): number {
  return getCheckpointYearOptions()[0];
}

export function parseCheckpointListFilters(searchParams?: {
  tab?: string;
  year?: string;
  month?: string;
}): CheckpointListFilterParams {
  const yearRaw = searchParams?.year;
  const monthRaw = searchParams?.month;

  const yearParsed = yearRaw ? Number.parseInt(yearRaw, 10) : Number.NaN;
  const monthParsed = monthRaw ? Number.parseInt(monthRaw, 10) : Number.NaN;

  const allowedYears = new Set(getCheckpointYearOptions());
  const defaultYear = getDefaultFilterYear();

  const year =
    Number.isFinite(yearParsed) && allowedYears.has(yearParsed)
      ? yearParsed
      : defaultYear;

  const month =
    Number.isFinite(monthParsed) &&
    monthParsed >= 1 &&
    monthParsed <= 12
      ? monthParsed
      : null;

  const range = getDateRangeForYearMonth(year, month);

  return {
    year,
    month,
    fromDate: range.fromDate ?? `${year}-01-01`,
    toDate: range.toDate,
  };
}

export function getDateRangeForYearMonth(
  year: number | null,
  month: number | null,
): { fromDate?: string; toDate?: string } {
  if (!year) return {};

  if (!month) {
    return {
      fromDate: `${year}-01-01`,
      toDate: `${year}-12-31`,
    };
  }

  const monthStr = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  const dayStr = String(lastDay).padStart(2, "0");

  return {
    fromDate: `${year}-${monthStr}-01`,
    toDate: `${year}-${monthStr}-${dayStr}`,
  };
}

export function getCheckpointMonthOptions(): { value: number; label: string }[] {
  return MONTH_LABELS.map((label, index) => ({
    value: index + 1,
    label,
  }));
}

export function formatCheckpointFilterLabel(
  year: number | null,
  month: number | null,
): string {
  if (!year) return "All dates";
  if (!month) return String(year);
  const monthLabel = MONTH_LABELS[month - 1];
  return `${monthLabel} ${year}`;
}

export function formatYearButtonLabel(year: number): string {
  const thisYear = getDefaultFilterYear();
  if (year === thisYear) return "This year";
  if (year === thisYear - 1) return "Last year";
  return String(year);
}

export function filterCheckpointsBySearch<
  T extends {
    Location: string;
    City: string;
    County: string;
    State: string;
    Date: string;
    Time: string;
  },
>(checkpoints: T[], query: string): T[] {
  const term = query.trim().toLowerCase();
  if (!term) return checkpoints;

  return checkpoints.filter((checkpoint) => {
    const haystack = [
      checkpoint.Location,
      checkpoint.City,
      checkpoint.County,
      checkpoint.State,
      checkpoint.Date,
      checkpoint.Time,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

export function hasActiveCheckpointFilters(
  filterYear: number,
  filterMonth: number | null,
  searchQuery: string,
  tab: "upcoming" | "past",
): boolean {
  const defaultYear = getDefaultFilterYear();
  const yearChanged = filterYear !== defaultYear;
  return Boolean(yearChanged || filterMonth || searchQuery.trim() || tab === "past");
}
