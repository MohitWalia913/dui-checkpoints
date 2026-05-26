import { getCheckpointsTwoYearStartDate } from "@/lib/checkpoints/date";

/** Max rows fetched on the checkpoints list page (all matching filters). */
export const CHECKPOINTS_LIST_MAX = 5000;

/** Default list window (matches dashboard KPI — last 2 years). */
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
  fromDate: string;
  toDate?: string;
};

export function parseCheckpointListFilters(_searchParams?: {
  tab?: string;
  year?: string;
  month?: string;
}): CheckpointListFilterParams {
  return {
    fromDate: getDefaultCheckpointListFromDate(),
  };
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
  searchQuery: string,
  tab: "upcoming" | "past",
): boolean {
  return Boolean(searchQuery.trim() || tab === "past");
}
