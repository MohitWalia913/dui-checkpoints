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

export function isMobileShareDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function isSystemShareAvailable(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

/** WhatsApp Web — new tab, no app / download page. */
export function whatsAppWebShareUrl(text: string): string {
  return `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function facebookWebShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/** Always opens in a new browser tab (does not replace the dashboard tab). */
export function openShareInNewTab(url: string): void {
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.assign(url);
  }
}

/**
 * Opens the device “Share using” dialog.
 * On desktop we share text only (with link inside) so Windows does not
 * open api.whatsapp.com / app-store pages in the same Chrome tab.
 */
export async function shareViaSystemSheet(data: {
  title: string;
  summary: string;
  text: string;
  url: string;
}): Promise<boolean> {
  if (!isSystemShareAvailable()) return false;

  const attempts: ShareData[] = isMobileShareDevice()
    ? [
        { title: data.title, text: data.text, url: data.url },
        { title: data.title, text: data.summary, url: data.url },
        { text: data.text },
      ]
    : [
        { title: data.title, text: data.text },
        { text: data.text },
        { title: data.title, text: data.summary },
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
