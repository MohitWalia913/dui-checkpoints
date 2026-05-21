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

/**
 * Opens Teams chat compose with the full message (link included as plain text).
 * More reliable than share?href when the page needs login (no link preview).
 */
export function teamsComposeUrl(fullMessage: string): string {
  return `https://teams.microsoft.com/l/chat/0/0?message=${encodeURIComponent(fullMessage)}`;
}

export function isMobileShareDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/** WhatsApp Desktop / mobile app */
export function whatsAppAppShareUrl(text: string): string {
  return `whatsapp://send?text=${encodeURIComponent(text)}`;
}

/** WhatsApp Web in browser (no “download app” page on desktop). */
export function whatsAppWebShareUrl(text: string): string {
  return `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/** Mobile deep link; opens app when installed. */
export function whatsAppMobileShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function whatsAppShareUrl(text: string): string {
  return isMobileShareDevice()
    ? whatsAppMobileShareUrl(text)
    : whatsAppWebShareUrl(text);
}

export function facebookAppShareUrl(url: string): string {
  return `fb://share?link=${encodeURIComponent(url)}`;
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/**
 * Try the native app (whatsapp://, fb://); if the window stays focused, open the web URL.
 */
export function openAppOrWebShare({
  appUrl,
  webUrl,
  delayMs = 700,
}: {
  appUrl: string;
  webUrl: string;
  delayMs?: number;
}): void {
  let opened = false;
  const onBlur = () => {
    opened = true;
    window.clearTimeout(timer);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("pagehide", onBlur);
  };

  window.addEventListener("blur", onBlur);
  window.addEventListener("pagehide", onBlur);
  window.location.assign(appUrl);

  const timer = window.setTimeout(() => {
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("pagehide", onBlur);
    if (!opened) {
      window.location.assign(webUrl);
    }
  }, isMobileShareDevice() ? 1200 : delayMs);
}

export function twitterShareUrl(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function emailShareUrl(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
