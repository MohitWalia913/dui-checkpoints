import { CheckpointsLocatorDynamic } from "@/components/map/checkpoints-locator-dynamic";
import { MapLocatorSkeleton } from "@/components/map/map-locator-skeleton";
import { listCheckpoints } from "@/lib/checkpoints/repository";
import { Suspense } from "react";

async function HomeMapContent() {
  const result = await listCheckpoints({ limit: 250 });

  return (
    <CheckpointsLocatorDynamic
      initialCheckpoints={result.data}
      loadError={result.error}
    />
  );
}

export function Coverage() {
  return (
    <section
      id="view-map"
      className="relative w-full scroll-mt-[80px] overflow-hidden"
      aria-label="California DUI checkpoints map"
    >
      <div className="mx-auto max-w-[1338px] px-6 pb-8 pt-12 md:px-10 md:pt-14 lg:px-14 lg:pt-16">
        <header className="mx-auto max-w-3xl text-center">
          <h2 className="font-inter mx-auto w-full max-w-[720px] text-[28px] font-semibold leading-tight text-[#040F20] sm:text-[32px] lg:text-[36px]">
            Explore Live DUI{" "}
            <span className="text-[#F57E3A]">Checkpoints</span> Across California
          </h2>
          <p className="font-inter mx-auto mt-4 max-w-[640px] text-base font-normal leading-relaxed text-[#5C6573] sm:text-[18px]">
            Search upcoming and past checkpoints on the interactive map. Filter
            by county, select a row to focus the map, or tap a marker for full
            details.
          </p>
          <div
            className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#F57E3A]"
            aria-hidden
          />
        </header>
      </div>

      <div className="flex h-[min(92vh,960px)] min-h-[640px] flex-col overflow-hidden bg-[#040F20]">
        <Suspense fallback={<MapLocatorSkeleton />}>
          <HomeMapContent />
        </Suspense>
      </div>
    </section>
  );
}
