import { createClient } from "@/lib/supabase/server";
import {
  getCheckpointEventDate,
  getCheckpointTabCountsFromItems,
  filterCheckpointList,
} from "@/lib/checkpoints/filter-records";
import { getTodayDateString, getWeekDateRange } from "@/lib/checkpoints/date";
import {
  CHECKPOINTS_TABLE,
  CHECKPOINT_REPORTS_TABLE,
  type Checkpoint,
  type CheckpointInsert,
  type CheckpointListItem,
  type CheckpointReport,
  type CheckpointReportInsert,
  type CheckpointStats,
  type CheckpointUpdate,
  type CheckpointsListParams,
  type DashboardCheckpointsResponse,
} from "@/lib/checkpoints/types";

const LIST_COLUMNS =
  "id, State, County, City, Location, Date, Time, Source, mapurl, location_id, created_at";

const CHECKPOINTS_FETCH_CAP = 5000;

function usesInMemoryDateFiltering(params: CheckpointsListParams): boolean {
  return Boolean(
    params.upcoming ||
      params.past ||
      params.fromDate ||
      params.toDate ||
      params.latest,
  );
}

export async function loadAllCheckpointListItems(): Promise<{
  data: CheckpointListItem[];
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(CHECKPOINTS_TABLE)
    .select(LIST_COLUMNS)
    .order("id", { ascending: true })
    .limit(CHECKPOINTS_FETCH_CAP);

  return {
    data: (data ?? []) as CheckpointListItem[],
    error: error?.message ?? null,
  };
}

export async function listCheckpoints(params: CheckpointsListParams = {}) {
  if (usesInMemoryDateFiltering(params)) {
    const loaded = await loadAllCheckpointListItems();
    if (loaded.error) {
      return { data: [], count: 0, error: loaded.error };
    }

    const full = filterCheckpointList(loaded.data, {
      ...params,
      limit: loaded.data.length,
      offset: 0,
    });
    const data = filterCheckpointList(loaded.data, params);

    return {
      data,
      count: full.length,
      error: null,
    };
  }

  const supabase = await createClient();

  let query = supabase
    .from(CHECKPOINTS_TABLE)
    .select(LIST_COLUMNS, { count: "exact" });

  if (params.state) {
    query = query.eq("State", params.state);
  }
  if (params.county) {
    query = query.eq("County", params.county);
  }
  if (params.city) {
    query = query.eq("City", params.city);
  }

  query = query
    .order("Date", { ascending: true })
    .order("County", { ascending: true })
    .order("City", { ascending: true });

  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  return {
    data: (data ?? []) as CheckpointListItem[],
    count: count ?? 0,
    error: error?.message ?? null,
  };
}

export async function getUpcomingCheckpoints(limit = 50) {
  return listCheckpoints({ upcoming: true, limit });
}

export async function getPastCheckpoints(limit = 50) {
  return listCheckpoints({ past: true, latest: true, limit });
}

export async function getLatestCheckpoints(limit = 12) {
  return listCheckpoints({ latest: true, limit });
}

/** Upcoming first; if none (e.g. all dates in the past), return latest records. */
export async function getDashboardCheckpoints(
  limit = 12,
): Promise<DashboardCheckpointsResponse> {
  const upcoming = await listCheckpoints({ upcoming: true, limit });

  if (upcoming.error) {
    return { data: [], listType: "upcoming", error: upcoming.error };
  }

  if (upcoming.data.length > 0) {
    return { data: upcoming.data, listType: "upcoming", error: null };
  }

  const latest = await listCheckpoints({ latest: true, limit });

  return {
    data: latest.data,
    listType: "latest",
    error: latest.error,
  };
}

export async function getCheckpointById(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(CHECKPOINTS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return {
    data: (data as Checkpoint | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function getCheckpointTabCounts(params?: {
  fromDate?: string;
  toDate?: string;
}): Promise<{
  past: number;
  upcoming: number;
  totalInWindow: number;
  error: string | null;
}> {
  const loaded = await loadAllCheckpointListItems();
  if (loaded.error) {
    return { past: 0, upcoming: 0, totalInWindow: 0, error: loaded.error };
  }

  const counts = getCheckpointTabCountsFromItems(loaded.data, params);
  return { ...counts, error: null };
}

export async function getCheckpointStats(): Promise<{
  data: CheckpointStats | null;
  error: string | null;
}> {
  const loaded = await loadAllCheckpointListItems();
  if (loaded.error) {
    return { data: null, error: loaded.error };
  }

  const today = getTodayDateString();
  const week = getWeekDateRange();
  const tabCounts = getCheckpointTabCountsFromItems(loaded.data);

  const upcoming = loaded.data.filter((row) => {
    const eventDate = getCheckpointEventDate(row);
    return eventDate != null && eventDate >= today;
  }).length;

  const thisWeek = loaded.data.filter((row) => {
    const eventDate = getCheckpointEventDate(row);
    return (
      eventDate != null && eventDate >= week.start && eventDate <= week.end
    );
  }).length;

  const uniqueCounties = new Set(
    loaded.data.map((row) => row.County).filter(Boolean),
  );

  return {
    data: {
      total: tabCounts.totalInWindow,
      upcoming,
      thisWeek,
      counties: uniqueCounties.size,
    },
    error: null,
  };
}

export async function createCheckpoint(payload: CheckpointInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(CHECKPOINTS_TABLE)
    .insert(payload)
    .select("*")
    .single();

  return {
    data: (data as Checkpoint | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function createCheckpointReport(payload: CheckpointReportInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(CHECKPOINT_REPORTS_TABLE)
    .insert(payload)
    .select("*")
    .single();

  return {
    data: (data as CheckpointReport | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function updateCheckpoint(id: number, payload: CheckpointUpdate) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(CHECKPOINTS_TABLE)
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  return {
    data: (data as Checkpoint | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function deleteCheckpoint(id: number) {
  const supabase = await createClient();

  const { error } = await supabase.from(CHECKPOINTS_TABLE).delete().eq("id", id);

  return { error: error?.message ?? null };
}
