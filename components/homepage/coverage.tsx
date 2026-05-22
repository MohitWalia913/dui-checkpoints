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
      mapOnly
    />
  );
}

export function Coverage() {
  return (
    <section
      id="view-map"
      className="relative w-full scroll-mt-[80px] overflow-hidden bg-[#040F20]"
      aria-label="California DUI checkpoints map"
    >
      <div className="flex h-[min(85vh,900px)] min-h-[560px] flex-col overflow-hidden">
        <Suspense fallback={<MapLocatorSkeleton mapOnly />}>
          <HomeMapContent />
        </Suspense>
      </div>
    </section>
  );
}
