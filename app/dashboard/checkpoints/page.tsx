import { CheckpointsTabs } from "@/components/dashboard/checkpoints-tabs";
import {
  CHECKPOINTS_LIST_MAX,
  parseCheckpointListFilters,
} from "@/lib/checkpoints/list-filters";
import { getCheckpointTabCounts } from "@/lib/checkpoints/repository";
import {
  fetchPastCheckpointsFromApiServer,
  fetchUpcomingCheckpointsFromApiServer,
} from "@/lib/checkpoints/server-api-fetch";
import { Suspense } from "react";

function CheckpointsTabsFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="h-10 w-36 animate-pulse rounded-xl bg-white/10" aria-hidden />
        <div className="h-10 w-36 animate-pulse rounded-xl bg-white/10" aria-hidden />
      </div>
      <div className="h-10 w-48 animate-pulse rounded-lg bg-white/10" aria-hidden />
    </div>
  );
}

type PageProps = {
  searchParams: Promise<{
    tab?: string;
    year?: string;
    month?: string;
  }>;
};

export default async function CheckpointsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseCheckpointListFilters(params);
  const dateRange = {
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  };

  const [upcomingResult, pastResult, tabCounts] = await Promise.all([
    fetchUpcomingCheckpointsFromApiServer(CHECKPOINTS_LIST_MAX, dateRange),
    fetchPastCheckpointsFromApiServer(CHECKPOINTS_LIST_MAX, dateRange),
    getCheckpointTabCounts(dateRange),
  ]);

  const error =
    upcomingResult.error ?? pastResult.error ?? tabCounts.error;
  const isUnauthorized =
    upcomingResult.status === 401 || pastResult.status === 401;

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <div>
        <p className="font-montserrat text-sm font-semibold uppercase tracking-wider text-[#F57E3A]">
          California DUI data
        </p>
        <h1 className="font-montserrat mt-2 text-3xl font-bold text-white md:text-4xl">
          Checkpoints
        </h1>
        <p className="font-inter mt-3 max-w-2xl text-base leading-relaxed text-white/70">
          Browse upcoming and past DUI checkpoints from the live database (last
          2 years). Use tabs and search to narrow the list.
        </p>
      </div>

      <Suspense fallback={<CheckpointsTabsFallback />}>
        <CheckpointsTabs
          upcoming={upcomingResult.data}
          past={pastResult.data}
          upcomingTotal={tabCounts.upcoming}
          pastTotal={tabCounts.past}
          totalInWindow={tabCounts.totalInWindow}
          error={error}
          isUnauthorized={isUnauthorized}
        />
      </Suspense>
    </div>
  );
}
