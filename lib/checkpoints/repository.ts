import { createClient } from "@/lib/supabase/server";
import { getTodayDateString, getWeekDateRange } from "@/lib/checkpoints/date";
import {
  CHECKPOINTS_TABLE,
  type Checkpoint,
  type CheckpointInsert,
  type CheckpointListItem,
  type CheckpointStats,
  type CheckpointUpdate,
  type CheckpointsListParams,
  type DashboardCheckpointsResponse,
} from "@/lib/checkpoints/types";

const LIST_COLUMNS =
  "id, State, County, City, Location, Date, Time, Source, mapurl, location_id, created_at";

export async function listCheckpoints(params: CheckpointsListParams = {}) {
  const supabase = await createClient();
  const today = getTodayDateString();

  let query = supabase
    .from(CHECKPOINTS_TABLE)
    .select(LIST_COLUMNS, { count: "exact" });

  if (params.upcoming) {
    query = query.gte("Date", today);
  }
  if (params.past) {
    query = query.lt("Date", today);
  }
  if (params.state) {
    query = query.eq("State", params.state);
  }
  if (params.county) {
    query = query.eq("County", params.county);
  }
  if (params.city) {
    query = query.eq("City", params.city);
  }
  if (params.fromDate) {
    query = query.gte("Date", params.fromDate);
  }
  if (params.toDate) {
    query = query.lte("Date", params.toDate);
  }

  if (params.latest) {
    query = query
      .order("Date", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query
      .order("Date", { ascending: true })
      .order("County", { ascending: true })
      .order("City", { ascending: true });
  }

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

export async function getCheckpointStats(): Promise<{
  data: CheckpointStats | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const today = getTodayDateString();
  const week = getWeekDateRange();

  const [totalRes, upcomingRes, weekRes, countiesRes] = await Promise.all([
    supabase.from(CHECKPOINTS_TABLE).select("*", { count: "exact", head: true }),
    supabase
      .from(CHECKPOINTS_TABLE)
      .select("*", { count: "exact", head: true })
      .gte("Date", today),
    supabase
      .from(CHECKPOINTS_TABLE)
      .select("*", { count: "exact", head: true })
      .gte("Date", week.start)
      .lte("Date", week.end),
    supabase.from(CHECKPOINTS_TABLE).select("County"),
  ]);

  const firstError =
    totalRes.error?.message ||
    upcomingRes.error?.message ||
    weekRes.error?.message ||
    countiesRes.error?.message ||
    null;

  if (firstError) {
    return { data: null, error: firstError };
  }

  const uniqueCounties = new Set(
    (countiesRes.data ?? [])
      .map((row) => row.County as string)
      .filter(Boolean),
  );

  return {
    data: {
      total: totalRes.count ?? 0,
      upcoming: upcomingRes.count ?? 0,
      thisWeek: weekRes.count ?? 0,
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
