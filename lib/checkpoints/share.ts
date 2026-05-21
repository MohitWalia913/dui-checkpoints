import { formatCheckpointDate } from "@/lib/checkpoints/date";
import type { Checkpoint } from "@/lib/checkpoints/types";

export function getCheckpointSharePath(id: number): string {
  return `/dashboard/checkpoints/${id}`;
}

export function buildCheckpointShareContent(
  checkpoint: Pick<
    Checkpoint,
    "id" | "Location" | "City" | "County" | "State" | "Date" | "Time"
  >,
  pageUrl: string,
) {
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

export function isSystemShareAvailable(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

/**
 * Opens the system “Share using” dialog (Windows share, Android/iOS share sheet).
 * The OS lists installed apps (WhatsApp, Facebook, Teams, etc.); choosing one
 * opens the app, or the store / install page if it is not installed.
 */
export async function shareViaSystemSheet(data: {
  title: string;
  summary: string;
  text: string;
  url: string;
}): Promise<boolean> {
  if (!isSystemShareAvailable()) return false;

  const attempts: ShareData[] = [
    { title: data.title, text: data.text, url: data.url },
    { title: data.title, text: data.summary, url: data.url },
    { url: data.url, text: data.text },
    { title: data.title, text: data.text },
    { text: data.text },
    { url: data.url },
  ];

  for (const payload of attempts) {
    if (navigator.canShare && !navigator.canShare(payload)) continue;
    try {
      await navigator.share(payload);
      return true;
    } catch (err) {
      if ((err as Error).name === "AbortError") return true;
    }
  }

  return false;
}
