import { CheckpointKpiCards } from "@/components/dashboard/checkpoint-kpi-cards";
import { UpcomingCheckpoints } from "@/components/dashboard/upcoming-checkpoints";
import {
  getCheckpointStats,
  getUpcomingCheckpoints,
} from "@/lib/checkpoints/repository";

export default async function DashboardPage() {
  const [statsResult, upcomingResult] = await Promise.all([
    getCheckpointStats(),
    getUpcomingCheckpoints(12),
  ]);

  const hasError = statsResult.error || upcomingResult.error;
  const errorMessage = statsResult.error ?? upcomingResult.error;

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
          Live DUI checkpoint intelligence for California — KPIs and upcoming
          operations from your database.
        </p>
      </div>

      {hasError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-inter text-sm text-red-200"
        >
          Could not load checkpoint data: {errorMessage}. Ensure the{" "}
          <code className="rounded bg-white/10 px-1">Checkpoints</code> table
          exists and RLS policies allow authenticated reads.
        </div>
      ) : null}

      {statsResult.data ? <CheckpointKpiCards stats={statsResult.data} /> : null}

      <UpcomingCheckpoints checkpoints={upcomingResult.data} />
    </div>
  );
}
