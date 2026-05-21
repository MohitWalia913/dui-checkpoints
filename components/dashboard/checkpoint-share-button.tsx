"use client";

import {
  buildCheckpointShareContent,
  facebookWebShareUrl,
  getCheckpointSharePath,
  isSystemShareAvailable,
  openShareInNewTab,
  shareViaSystemSheet,
  whatsAppWebShareUrl,
} from "@/lib/checkpoints/share";
import type { Checkpoint } from "@/lib/checkpoints/types";
import { cn } from "@/lib/utils";
import { Check, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type ShareCheckpoint = Pick<
  Checkpoint,
  "id" | "Location" | "City" | "County" | "State" | "Date" | "Time"
>;

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const webBtnClass =
  "inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition-colors hover:border-[#F57E3A]/40 hover:text-[#F57E3A]";

export function CheckpointShareButton({
  checkpoint,
  className,
  variant = "default",
}: {
  checkpoint: ShareCheckpoint;
  className?: string;
  variant?: "default" | "compact";
}) {
  const [pageUrl, setPageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    setPageUrl(`${origin}${getCheckpointSharePath(checkpoint.id)}`);
  }, [checkpoint.id]);

  const share = useMemo(
    () =>
      pageUrl ? buildCheckpointShareContent(checkpoint, pageUrl) : null,
    [checkpoint, pageUrl],
  );

  const handleShare = useCallback(async () => {
    if (!share) return;

    if (isSystemShareAvailable()) {
      const shared = await shareViaSystemSheet({
        title: share.title,
        summary: share.summary,
        text: share.text,
        url: share.url,
      });
      if (shared) return;
    }

    try {
      await navigator.clipboard.writeText(share.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this message:", share.text);
    }
  }, [share]);

  const handleWhatsAppWeb = useCallback(() => {
    if (!share) return;
    openShareInNewTab(whatsAppWebShareUrl(share.text));
  }, [share]);

  const handleFacebookWeb = useCallback(() => {
    if (!share) return;
    openShareInNewTab(facebookWebShareUrl(share.url));
  }, [share]);

  const triggerClass =
    variant === "compact"
      ? "font-montserrat inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#F57E3A]/40 hover:text-[#F57E3A]"
      : "font-montserrat inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#F57E3A]/40 hover:bg-white/[0.08]";

  const iconSize = variant === "compact" ? "size-3.5" : "size-4";
  const webIconSize = variant === "compact" ? "size-3.5" : "size-4";
  const webBtnPad = variant === "compact" ? "p-1.5" : "p-2.5";

  if (!share) {
    return (
      <button type="button" disabled className={cn(triggerClass, className)}>
        <Share2 className={iconSize} aria-hidden />
        Share
      </button>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <button
        type="button"
        className={triggerClass}
        aria-label="Share checkpoint"
        onClick={() => void handleShare()}
      >
        {copied ? (
          <Check className={cn(iconSize, "text-emerald-400")} aria-hidden />
        ) : (
          <Share2 className={iconSize} aria-hidden />
        )}
        {copied ? "Copied!" : "Share"}
      </button>

      <button
        type="button"
        className={cn(webBtnClass, webBtnPad)}
        aria-label="Share on WhatsApp Web (opens new tab)"
        title="WhatsApp Web — new tab"
        onClick={handleWhatsAppWeb}
      >
        <WhatsAppIcon className={cn(webIconSize, "text-[#25D366]")} />
      </button>

      <button
        type="button"
        className={cn(webBtnClass, webBtnPad)}
        aria-label="Share on Facebook (opens new tab)"
        title="Facebook — new tab"
        onClick={handleFacebookWeb}
      >
        <FacebookIcon className={cn(webIconSize, "text-[#1877F2]")} />
      </button>
    </div>
  );
}
