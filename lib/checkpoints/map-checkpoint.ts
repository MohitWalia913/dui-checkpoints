import {
  resolveCheckpointCoordinates,
  type LatLng,
} from "@/lib/checkpoints/coordinates";
import { isCheckpointUpcoming } from "@/lib/checkpoints/date";
import type { CheckpointListItem } from "@/lib/checkpoints/types";

export type CheckpointMapStatus = "upcoming" | "past";

export type MapCheckpoint = CheckpointListItem & {
  coordinates: LatLng;
  status: CheckpointMapStatus;
};

function isValidCoordinate({ lat, lng }: LatLng): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

export function toMapCheckpoint(item: CheckpointListItem): MapCheckpoint | null {
  const coordinates = resolveCheckpointCoordinates(item);
  if (!isValidCoordinate(coordinates)) return null;

  return {
    ...item,
    coordinates,
    status: isCheckpointUpcoming(item.Date) ? "upcoming" : "past",
  };
}

export function toMapCheckpoints(items: CheckpointListItem[]): MapCheckpoint[] {
  return items
    .map(toMapCheckpoint)
    .filter((item): item is MapCheckpoint => item !== null);
}
