"use client";

import { CheckpointKpiCards } from "@/components/dashboard/checkpoint-kpi-cards";
import { UpcomingCheckpoints } from "@/components/dashboard/upcoming-checkpoints";
import {
  fetchCheckpointStatsFromApi,
  fetchUpcomingCheckpointsFromApi,
} from "@/lib/checkpoints/api-fetch";
import type { CheckpointListItem, CheckpointStats } from "@/lib/checkpoints/types";
import { useCallback, useEffect, useState } from "react";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[120px] rounded-xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
      <div className="h-[320px] rounded-xl border border-white/10 bg-white/5" />
    </div>
  );
}

export function DashboardApiContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CheckpointStats | null>(null);
  const [checkpoints, setCheckpoints] = useState<CheckpointListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [statsResult, upcomingResult] = await Promise.all([
      fetchCheckpointStatsFromApi(),
      fetchUpcomingCheckpointsFromApi(12),
    ]);

    const errors = [statsResult.error, upcomingResult.error].filter(Boolean);

    if (errors.length > 0) {
      setError(errors.join(" · "));
    }

    setStats(statsResult.data);
    setCheckpoints(upcomingResult.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-inter text-sm text-red-200"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={loadData}
            className="font-montserrat mt-3 text-sm font-semibold text-[#F57E3A] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : null}

      {stats ? <CheckpointKpiCards stats={stats} /> : null}

      <UpcomingCheckpoints checkpoints={checkpoints} />
    </>
  );
}
