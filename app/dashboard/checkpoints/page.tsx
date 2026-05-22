import { CheckpointsTabs } from "@/components/dashboard/checkpoints-tabs";
import {
  CHECKPOINTS_LIST_MAX,
  parseCheckpointListFilters,
} from "@/lib/checkpoints/list-filters";
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

  const [upcomingResult, pastResult] = await Promise.all([
    fetchUpcomingCheckpointsFromApiServer(CHECKPOINTS_LIST_MAX, dateRange),
    fetchPastCheckpointsFromApiServer(CHECKPOINTS_LIST_MAX, dateRange),
  ]);

  const error = upcomingResult.error ?? pastResult.error;
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
          Browse upcoming and past DUI checkpoints. Filter by year and month,
          or switch tabs to filter by schedule.
        </p>
      </div>

      <Suspense fallback={<CheckpointsTabsFallback />}>
        <CheckpointsTabs
          upcoming={upcomingResult.data}
          past={pastResult.data}
          upcomingTotal={upcomingResult.count}
          pastTotal={pastResult.count}
          filterYear={filters.year}
          filterMonth={filters.month}
          error={error}
          isUnauthorized={isUnauthorized}
        />
      </Suspense>
    </div>
  );
}
