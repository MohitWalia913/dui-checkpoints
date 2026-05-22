"use client";

import dynamic from "next/dynamic";
import { MapLocatorSkeleton } from "@/components/map/map-locator-skeleton";
import type { CheckpointListItem } from "@/lib/checkpoints/types";

const CheckpointsLocator = dynamic(
  () =>
    import("@/components/map/checkpoints-locator").then(
      (mod) => mod.CheckpointsLocator,
    ),
  {
    ssr: false,
    loading: () => <MapLocatorSkeleton />,
  },
);

export function CheckpointsLocatorDynamic({
  initialCheckpoints,
  loadError,
  mapOnly = false,
}: {
  initialCheckpoints: CheckpointListItem[];
  loadError: string | null;
  mapOnly?: boolean;
}) {
  return (
    <CheckpointsLocator
      initialCheckpoints={initialCheckpoints}
      loadError={loadError}
      mapOnly={mapOnly}
    />
  );
}
