import { CheckpointsLocatorDynamic } from "@/components/map/checkpoints-locator-dynamic";
import { MapLocatorSkeleton } from "@/components/map/map-locator-skeleton";
import { fetchMapCheckpointsFromApiServer } from "@/lib/checkpoints/server-api-fetch";
import { Suspense } from "react";

async function MapPageContent() {
  const result = await fetchMapCheckpointsFromApiServer(250);

  return (
    <CheckpointsLocatorDynamic
      initialCheckpoints={result.data}
      loadError={result.error}
    />
  );
}

export default function DashboardMapPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <Suspense fallback={<MapLocatorSkeleton />}>
        <MapPageContent />
      </Suspense>
    </div>
  );
}
