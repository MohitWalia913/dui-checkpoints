import { CheckpointKpiCards } from "@/components/dashboard/checkpoint-kpi-cards";
import { UpcomingCheckpoints } from "@/components/dashboard/upcoming-checkpoints";
import {
  fetchCheckpointStatsFromApiServer,
  fetchDashboardCheckpointsFromApiServer,
} from "@/lib/checkpoints/server-api-fetch";

export default async function DashboardPage() {
  const [statsResult, checkpointsResult] = await Promise.all([
    fetchCheckpointStatsFromApiServer(),
    fetchDashboardCheckpointsFromApiServer(12),
  ]);

  const errorMessage = statsResult.error ?? checkpointsResult.error;
  const isUnauthorized =
    statsResult.status === 401 || checkpointsResult.status === 401;

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <div>
        <p className="font-montserrat text-sm font-semibold uppercase tracking-wider text-[#F57E3A]">
          Welcome back
        </p>
        <h1 className="font-montserrat mt-2 text-3xl font-bold text-white md:text-4xl">
          Dashboard
        </h1>
        <p className="font-inter mt-3 max-w-2xl text-base leading-relaxed text-white/70">
          Live DUI checkpoint data loaded from{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">
            /api/checkpoints
          </code>
        </p>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-inter text-sm text-red-200"
        >
          {isUnauthorized
            ? "Session expired. Please log in again."
            : `Could not load checkpoint data: ${errorMessage}`}
        </div>
      ) : null}

      {statsResult.data ? (
        <CheckpointKpiCards stats={statsResult.data} />
      ) : null}

      <UpcomingCheckpoints
        checkpoints={checkpointsResult.data}
        listType={checkpointsResult.listType}
      />
    </div>
  );
}
