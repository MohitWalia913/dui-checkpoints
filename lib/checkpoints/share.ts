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

/** Microsoft Teams desktop app */
export function teamsAppShareUrl(fullMessage: string): string {
  return `msteams:/l/chat/0/0?message=${encodeURIComponent(fullMessage)}`;
}

export function isSystemShareAvailable(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

/** Launch custom protocol without navigating the dashboard tab away. */
export function launchProtocolUrl(url: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
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

  const markOpened = () => {
    opened = true;
    window.clearTimeout(timer);
    cleanup();
  };

  const onBlur = () => markOpened();
  const onVisibility = () => {
    if (document.visibilityState === "hidden") markOpened();
  };

  const cleanup = () => {
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("pagehide", onBlur);
    document.removeEventListener("visibilitychange", onVisibility);
  };

  window.addEventListener("blur", onBlur);
  window.addEventListener("pagehide", onBlur);
  document.addEventListener("visibilitychange", onVisibility);

  launchProtocolUrl(appUrl);

  const timer = window.setTimeout(() => {
    cleanup();
    if (!opened) {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }
  }, isMobileShareDevice() ? 1200 : delayMs);
}

/** Windows / mobile system share sheet (WhatsApp, Mail, Teams, etc.). */
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
    { url: data.url },
    { title: data.title, text: data.text },
    { text: data.text },
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

export function twitterShareUrl(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function emailShareUrl(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
