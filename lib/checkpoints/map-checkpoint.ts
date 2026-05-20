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

export function toMapCheckpoint(item: CheckpointListItem): MapCheckpoint {
  return {
    ...item,
    coordinates: resolveCheckpointCoordinates(item),
    status: isCheckpointUpcoming(item.Date) ? "upcoming" : "past",
  };
}

export function toMapCheckpoints(items: CheckpointListItem[]): MapCheckpoint[] {
  return items.map(toMapCheckpoint);
}
