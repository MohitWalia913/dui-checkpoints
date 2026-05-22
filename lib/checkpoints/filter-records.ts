import {
  formatDateParts,
  getCheckpointsTwoYearStartDate,
  getTodayDateString,
} from "@/lib/checkpoints/date";
import type { CheckpointListItem } from "@/lib/checkpoints/types";
import type { CheckpointsListParams } from "@/lib/checkpoints/types";

type DateLikeRow = {
  Date: string | null;
  created_at?: string | null;
};

/** Normalize event dates stored as text (ISO, M/D/YYYY, etc.). */
export function normalizeCheckpointDateString(
  dateStr: string | null | undefined,
): string | null {
  if (!dateStr?.trim()) return null;

  const trimmed = dateStr.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const usSlash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usSlash) {
    const [, month, day, year] = usSlash;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const usDash = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (usDash) {
    const [, month, day, year] = usDash;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return formatDateParts(parsed);
  }

  return null;
}

/** Event date for filters; falls back to created_at date when Date is missing/unparseable. */
export function getCheckpointEventDate(row: DateLikeRow): string | null {
  return (
    normalizeCheckpointDateString(row.Date) ?? row.created_at?.slice(0, 10) ?? null
  );
}

export function isCheckpointInTwoYearWindow(row: DateLikeRow): boolean {
  const eventDate = getCheckpointEventDate(row);
  if (!eventDate) return false;
  return eventDate >= getCheckpointsTwoYearStartDate();
}

export function filterCheckpointList<
  T extends CheckpointListItem & { created_at?: string | null },
>(items: T[], params: CheckpointsListParams): T[] {
  const today = getTodayDateString();
  let result = items;

  if (params.upcoming || params.past) {
    result = result.filter((row) => {
      const eventDate = getCheckpointEventDate(row);
      if (!eventDate) return false;
      if (params.upcoming) return eventDate >= today;
      if (params.past) return eventDate < today;
      return true;
    });
  }

  if (params.fromDate) {
    result = result.filter((row) => {
      const eventDate = getCheckpointEventDate(row);
      return eventDate != null && eventDate >= params.fromDate!;
    });
  }

  if (params.toDate) {
    result = result.filter((row) => {
      const eventDate = getCheckpointEventDate(row);
      return eventDate != null && eventDate <= params.toDate!;
    });
  }

  if (params.state) {
    result = result.filter((row) => row.State === params.state);
  }
  if (params.county) {
    result = result.filter((row) => row.County === params.county);
  }
  if (params.city) {
    result = result.filter((row) => row.City === params.city);
  }

  if (params.latest) {
    result = [...result].sort((a, b) => {
      const dateCmp = (getCheckpointEventDate(b) ?? "").localeCompare(
        getCheckpointEventDate(a) ?? "",
      );
      if (dateCmp !== 0) return dateCmp;
      return (b.created_at ?? "").localeCompare(a.created_at ?? "");
    });
  } else {
    result = [...result].sort((a, b) => {
      const dateCmp = (getCheckpointEventDate(a) ?? "").localeCompare(
        getCheckpointEventDate(b) ?? "",
      );
      if (dateCmp !== 0) return dateCmp;
      const countyCmp = a.County.localeCompare(b.County);
      if (countyCmp !== 0) return countyCmp;
      return a.City.localeCompare(b.City);
    });
  }

  const offset = params.offset ?? 0;
  const limit = params.limit ?? 50;
  return result.slice(offset, offset + limit);
}

export function countFilteredCheckpoints(
  items: CheckpointListItem[],
  params: Pick<
    CheckpointsListParams,
    "upcoming" | "past" | "fromDate" | "toDate"
  >,
): number {
  return filterCheckpointList(items, { ...params, limit: items.length, offset: 0 })
    .length;
}

export function getCheckpointTabCountsFromItems(
  items: CheckpointListItem[],
  params?: { fromDate?: string; toDate?: string },
) {
  const fromDate = params?.fromDate ?? getCheckpointsTwoYearStartDate();
  const base = filterCheckpointList(items, {
    fromDate,
    toDate: params?.toDate,
    limit: items.length,
    offset: 0,
  });

  const past = countFilteredCheckpoints(base, {
    past: true,
    fromDate,
    toDate: params?.toDate,
  });
  const upcoming = countFilteredCheckpoints(base, {
    upcoming: true,
    fromDate,
    toDate: params?.toDate,
  });

  return {
    past,
    upcoming,
    totalInWindow: base.length,
  };
}
