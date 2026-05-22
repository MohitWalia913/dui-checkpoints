import { cookies, headers } from "next/headers";
import type {
  CheckpointListItem,
  CheckpointStats,
} from "@/lib/checkpoints/types";

async function getAppOrigin(): Promise<string> {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

async function fetchFromAppApi<T>(path: string): Promise<{
  data: T | null;
  error: string | null;
  status: number;
}> {
  const origin = await getAppOrigin();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(`${origin}${path}`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: "no-store",
  });

  const json = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    return {
      data: null,
      error:
        typeof json === "object" && json && "error" in json && json.error
          ? String(json.error)
          : `Request failed (${response.status})`,
      status: response.status,
    };
  }

  return { data: json as T, error: null, status: response.status };
}

export async function fetchCheckpointStatsFromApiServer() {
  const result = await fetchFromAppApi<{ data: CheckpointStats }>(
    "/api/checkpoints/stats",
  );

  return {
    data: result.data?.data ?? null,
    error: result.error,
    status: result.status,
  };
}

export async function fetchDashboardCheckpointsFromApiServer(limit = 12) {
  const result = await fetchFromAppApi<{
    data: CheckpointListItem[];
    meta?: { listType?: "upcoming" | "latest" };
  }>(`/api/checkpoints?dashboard=true&limit=${limit}`);

  return {
    data: result.data?.data ?? [],
    listType: result.data?.meta?.listType ?? "latest",
    error: result.error,
    status: result.status,
  };
}

export type CheckpointsApiListResult = {
  data: CheckpointListItem[];
  count: number;
  error: string | null;
  status: number;
};

function buildCheckpointsQuery(params: {
  upcoming?: boolean;
  past?: boolean;
  latest?: boolean;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}): string {
  const search = new URLSearchParams();
  if (params.upcoming) search.set("upcoming", "true");
  if (params.past) search.set("past", "true");
  if (params.latest) search.set("latest", "true");
  if (params.fromDate) search.set("fromDate", params.fromDate);
  if (params.toDate) search.set("toDate", params.toDate);
  search.set("limit", String(params.limit ?? 50));
  if (params.offset) search.set("offset", String(params.offset));
  return `/api/checkpoints?${search.toString()}`;
}

export async function fetchCheckpointsListFromApiServer(params: {
  upcoming?: boolean;
  past?: boolean;
  latest?: boolean;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}): Promise<CheckpointsApiListResult> {
  const result = await fetchFromAppApi<{
    data: CheckpointListItem[];
    meta?: { count?: number; limit?: number; offset?: number };
  }>(buildCheckpointsQuery(params));

  const data = result.data?.data ?? [];
  const count = result.data?.meta?.count ?? data.length;

  return {
    data,
    count,
    error: result.error,
    status: result.status,
  };
}

export async function fetchUpcomingCheckpointsFromApiServer(
  limit = 50,
  dateRange?: { fromDate?: string; toDate?: string },
) {
  return fetchCheckpointsListFromApiServer({
    upcoming: true,
    limit,
    ...dateRange,
  });
}

export async function fetchMapCheckpointsFromApiServer(limit = 250) {
  const result = await fetchFromAppApi<{ data: CheckpointListItem[] }>(
    `/api/checkpoints?limit=${limit}`,
  );

  return {
    data: result.data?.data ?? [],
    error: result.error,
    status: result.status,
  };
}

export async function fetchPastCheckpointsFromApiServer(
  limit = 50,
  dateRange?: { fromDate?: string; toDate?: string },
) {
  return fetchCheckpointsListFromApiServer({
    past: true,
    latest: true,
    limit,
    ...dateRange,
  });
}
