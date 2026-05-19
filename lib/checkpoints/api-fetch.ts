import type {
  CheckpointListItem,
  CheckpointStats,
} from "@/lib/checkpoints/types";

type ApiError = { error?: string };

export async function fetchCheckpointStatsFromApi(): Promise<{
  data: CheckpointStats | null;
  error: string | null;
}> {
  const res = await fetch("/api/checkpoints/stats", {
    credentials: "include",
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as {
    data?: CheckpointStats;
  } & ApiError;

  if (!res.ok || !json.data) {
    return {
      data: null,
      error: json.error ?? `Failed to load stats (${res.status})`,
    };
  }

  return { data: json.data, error: null };
}

export async function fetchDashboardCheckpointsFromApi(limit = 12): Promise<{
  data: CheckpointListItem[];
  listType: "upcoming" | "latest";
  error: string | null;
}> {
  const res = await fetch(
    `/api/checkpoints?dashboard=true&limit=${limit}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  const json = (await res.json().catch(() => ({}))) as {
    data?: CheckpointListItem[];
    meta?: { listType?: "upcoming" | "latest" };
  } & ApiError;

  if (!res.ok) {
    return {
      data: [],
      listType: "latest",
      error: json.error ?? `Failed to load checkpoints (${res.status})`,
    };
  }

  return {
    data: json.data ?? [],
    listType: json.meta?.listType ?? "latest",
    error: null,
  };
}
