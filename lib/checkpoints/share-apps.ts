import type { CheckpointSharePayload } from "@/lib/checkpoints/share";

export type ShareAppId =
  | "whatsapp"
  | "telegram"
  | "facebook"
  | "gmail"
  | "outlook"
  | "email"
  | "teams"
  | "linkedin"
  | "twitter";

/** Windows-style “Share using” grid order */
export const SHARE_APP_DISPLAY_ORDER: ShareAppId[] = [
  "facebook",
  "teams",
  "whatsapp",
  "telegram",
  "gmail",
  "outlook",
  "email",
  "linkedin",
  "twitter",
];

export type ShareAppTarget = {
  id: ShareAppId;
  label: string;
  appUrl: string;
  webUrl: string;
  installUrl?: string;
};

export function isMobileShareDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Try custom URI scheme without replacing the dashboard tab (except iOS). */
export function launchProtocolUrl(url: string): void {
  if (isIOSDevice()) {
    window.location.href = url;
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export type OpenAppWithFallbackOptions = {
  delayMs?: number;
  /** Used on desktop when app is missing (store / download page). */
  installUrl?: string;
};

/**
 * 1. Attempt to open the installed app via deep link.
 * 2. If the page stays focused (app not opened), open web / install fallback.
 */
export function openAppWithFallback(
  appUrl: string,
  webUrl: string,
  options?: OpenAppWithFallbackOptions,
): void {
  let opened = false;
  const delayMs =
    options?.delayMs ?? (isMobileShareDevice() ? 1600 : 900);

  const markOpened = () => {
    if (opened) return;
    opened = true;
    window.clearTimeout(timer);
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener("blur", markOpened);
    window.removeEventListener("pagehide", markOpened);
    document.removeEventListener("visibilitychange", onVisibility);
  };

  const onVisibility = () => {
    if (document.visibilityState === "hidden") markOpened();
  };

  window.addEventListener("blur", markOpened);
  window.addEventListener("pagehide", markOpened);
  document.addEventListener("visibilitychange", onVisibility);

  try {
    launchProtocolUrl(appUrl);
  } catch {
    // continue to fallback
  }

  const timer = window.setTimeout(() => {
    cleanup();
    if (opened) return;

    const fallback =
      !isMobileShareDevice() && options?.installUrl
        ? options.installUrl
        : webUrl;

    try {
      if (isMobileShareDevice()) {
        window.location.assign(fallback);
      } else {
        const tab = window.open(fallback, "_blank", "noopener,noreferrer");
        if (!tab) window.location.assign(fallback);
      }
    } catch {
      window.location.assign(fallback);
    }
  }, delayMs);
}

function whatsAppAppUrl(text: string): string {
  const encoded = encodeURIComponent(text);
  if (isAndroidDevice()) {
    return `intent://send?text=${encoded}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
  }
  return `whatsapp://send?text=${encoded}`;
}

function whatsAppWebUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function telegramAppUrl(text: string): string {
  return `tg://msg?text=${encodeURIComponent(text)}`;
}

function telegramWebUrl(url: string, text: string): string {
  const params = new URLSearchParams({ url, text });
  return `https://t.me/share/url?${params.toString()}`;
}

function facebookAppUrl(url: string): string {
  return `fb://facewebmodal/f?href=${encodeURIComponent(url)}`;
}

function facebookWebUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

function gmailAppUrl(title: string, body: string): string {
  const params = new URLSearchParams({
    subject: title,
    body,
  });
  return `googlegmail://co?${params.toString()}`;
}

function gmailWebUrl(title: string, body: string): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    su: title,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function emailAppUrl(title: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

function teamsAppUrl(text: string): string {
  return `msteams:/l/chat/0/0?message=${encodeURIComponent(text)}`;
}

function teamsWebUrl(text: string): string {
  return `https://teams.microsoft.com/l/chat/0/0?message=${encodeURIComponent(text)}`;
}

function twitterAppUrl(text: string, url: string): string {
  return `twitter://post?message=${encodeURIComponent(`${text} ${url}`)}`;
}

function twitterWebUrl(summary: string, url: string): string {
  const params = new URLSearchParams({
    text: summary,
    url,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function outlookAppUrl(title: string, body: string): string {
  return `ms-outlook://compose?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

function outlookWebUrl(title: string, body: string): string {
  const params = new URLSearchParams({ subject: title, body });
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}

function linkedInAppUrl(url: string): string {
  return `linkedin://shareArticle?mini=true&url=${encodeURIComponent(url)}`;
}

function linkedInWebUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function buildShareAppTargets(
  payload: CheckpointSharePayload,
): ShareAppTarget[] {
  const { title, summary, text, url } = payload;

  return [
    {
      id: "whatsapp",
      label: "WhatsApp",
      appUrl: whatsAppAppUrl(text),
      webUrl: whatsAppWebUrl(text),
      installUrl: "https://www.whatsapp.com/download",
    },
    {
      id: "telegram",
      label: "Telegram",
      appUrl: telegramAppUrl(text),
      webUrl: telegramWebUrl(url, text),
      installUrl: "https://telegram.org/apps",
    },
    {
      id: "facebook",
      label: "Facebook",
      appUrl: facebookAppUrl(url),
      webUrl: facebookWebUrl(url),
      installUrl: "https://www.facebook.com/mobile",
    },
    {
      id: "gmail",
      label: "Gmail",
      appUrl: gmailAppUrl(title, text),
      webUrl: gmailWebUrl(title, text),
      installUrl: "https://mail.google.com/mail/",
    },
    {
      id: "outlook",
      label: "Outlook",
      appUrl: outlookAppUrl(title, text),
      webUrl: outlookWebUrl(title, text),
      installUrl: "https://www.microsoft.com/microsoft-365/outlook/email-and-calendar-software-microsoft-outlook",
    },
    {
      id: "email",
      label: "Mail",
      appUrl: emailAppUrl(title, text),
      webUrl: emailAppUrl(title, text),
    },
    {
      id: "teams",
      label: "Microsoft Teams",
      appUrl: teamsAppUrl(text),
      webUrl: teamsWebUrl(text),
      installUrl: "https://www.microsoft.com/microsoft-teams/download-app",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      appUrl: linkedInAppUrl(url),
      webUrl: linkedInWebUrl(url),
      installUrl: "https://www.linkedin.com/apps",
    },
    {
      id: "twitter",
      label: "X (Twitter)",
      appUrl: twitterAppUrl(summary, url),
      webUrl: twitterWebUrl(summary, url),
      installUrl: "https://twitter.com/download",
    },
  ];
}

export function getOrderedShareAppTargets(
  payload: CheckpointSharePayload,
): ShareAppTarget[] {
  const map = new Map(
    buildShareAppTargets(payload).map((t) => [t.id, t] as const),
  );
  return SHARE_APP_DISPLAY_ORDER.map((id) => map.get(id)).filter(
    (t): t is ShareAppTarget => !!t,
  );
}

export function openShareApp(
  target: ShareAppTarget,
  options?: OpenAppWithFallbackOptions,
): void {
  if (target.id === "email") {
    try {
      launchProtocolUrl(target.appUrl);
    } catch {
      window.location.assign(target.webUrl);
    }
    return;
  }

  openAppWithFallback(target.appUrl, target.webUrl, {
    installUrl: target.installUrl,
    ...options,
  });
}
