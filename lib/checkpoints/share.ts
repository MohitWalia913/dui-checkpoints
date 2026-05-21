import { formatCheckpointDate } from "@/lib/checkpoints/date";
import type { Checkpoint } from "@/lib/checkpoints/types";

export function getCheckpointSharePath(id: number): string {
  return `/dashboard/checkpoints/${id}`;
}

export type CheckpointSharePayload = {
  title: string;
  summary: string;
  text: string;
  url: string;
};

export function buildCheckpointShareContent(
  checkpoint: Pick<
    Checkpoint,
    "id" | "Location" | "City" | "County" | "State" | "Date" | "Time"
  >,
  pageUrl: string,
): CheckpointSharePayload {
  const summary = [
    `DUI Checkpoint: ${checkpoint.Location}`,
    `${checkpoint.City}, ${checkpoint.County} County, ${checkpoint.State}`,
    `${formatCheckpointDate(checkpoint.Date)} · ${checkpoint.Time || "—"}`,
  ].join("\n");

  const text = `${summary}\n\nView checkpoint:\n${pageUrl}`;

  return {
    title: `DUI Checkpoint — ${checkpoint.Location}`,
    summary,
    text,
    url: pageUrl,
  };
}
