import { CheckpointsTabs } from "@/components/dashboard/checkpoints-tabs";
import {
  fetchPastCheckpointsFromApiServer,
  fetchUpcomingCheckpointsFromApiServer,
} from "@/lib/checkpoints/server-api-fetch";
import { Suspense } from "react";

function CheckpointsTabsFallback() {
  return (
    <div className="h-10 w-48 animate-pulse rounded-lg bg-white/10" aria-hidden />
  );
}

export default async function CheckpointsPage() {
  const [upcomingResult, pastResult] = await Promise.all([
    fetchUpcomingCheckpointsFromApiServer(50),
    fetchPastCheckpointsFromApiServer(50),
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
          Browse upcoming and past DUI checkpoints. Switch tabs to filter by
          schedule.
        </p>
      </div>

      <Suspense fallback={<CheckpointsTabsFallback />}>
        <CheckpointsTabs
          upcoming={upcomingResult.data}
          past={pastResult.data}
          error={error}
          isUnauthorized={isUnauthorized}
        />
      </Suspense>
    </div>
  );
}
