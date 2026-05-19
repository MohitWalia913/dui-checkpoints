import type {
  CheckpointListItem,
  CheckpointStats,
} from "@/lib/checkpoints/types";

type ApiError = { error: string };

export async function fetchCheckpointStatsFromApi(): Promise<{
  data: CheckpointStats | null;
  error: string | null;
}> {
  const res = await fetch("/api/checkpoints/stats", {
    credentials: "include",
    cache: "no-store",
  });

  const json = (await res.json()) as { data?: CheckpointStats } & ApiError;

  if (!res.ok || !json.data) {
    return {
      data: null,
      error: json.error ?? "Failed to load stats",
    };
  }

  return { data: json.data, error: null };
}

export async function fetchUpcomingCheckpointsFromApi(limit = 12): Promise<{
  data: CheckpointListItem[];
  error: string | null;
}> {
  const res = await fetch(
    `/api/checkpoints?upcoming=true&limit=${limit}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  const json = (await res.json()) as {
    data?: CheckpointListItem[];
  } & ApiError;

  if (!res.ok) {
    return {
      data: [],
      error: json.error ?? "Failed to load checkpoints",
    };
  }

  return { data: json.data ?? [], error: null };
}
