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
  year: number | null;
  month: number | null;
  fromDate?: string;
  toDate?: string;
};

export function parseCheckpointListFilters(searchParams: {
  year?: string | string[];
  month?: string | string[];
}): CheckpointListFilterParams {
  const yearRaw = Array.isArray(searchParams.year)
    ? searchParams.year[0]
    : searchParams.year;
  const monthRaw = Array.isArray(searchParams.month)
    ? searchParams.month[0]
    : searchParams.month;

  const yearParsed = yearRaw ? Number.parseInt(yearRaw, 10) : Number.NaN;
  const monthParsed = monthRaw ? Number.parseInt(monthRaw, 10) : Number.NaN;

  const year =
    Number.isFinite(yearParsed) && yearParsed >= 2000 && yearParsed <= 2100
      ? yearParsed
      : null;
  const month =
    year &&
    Number.isFinite(monthParsed) &&
    monthParsed >= 1 &&
    monthParsed <= 12
      ? monthParsed
      : null;

  const range = getDateRangeForYearMonth(year, month);
  const fromDate = range.fromDate ?? (year ? undefined : getDefaultCheckpointListFromDate());

  return {
    year,
    month,
    fromDate,
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

/** Years for dropdown (newest first), includes next calendar year for scheduled data. */
export function getCheckpointYearOptions(): number[] {
  const end = new Date().getFullYear() + 1;
  const start = 2018;
  const years: number[] = [];
  for (let y = end; y >= start; y--) years.push(y);
  return years;
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
  year: number | null,
  month: number | null,
  searchQuery: string,
  tab: "upcoming" | "past",
): boolean {
  return Boolean(year || month || searchQuery.trim() || tab === "past");
}
