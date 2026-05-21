"use client";

import {
  buildCheckpointShareContent,
  getCheckpointSharePath,
  isSystemShareAvailable,
  shareViaSystemSheet,
} from "@/lib/checkpoints/share";
import type { Checkpoint } from "@/lib/checkpoints/types";
import { cn } from "@/lib/utils";
import { Check, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type ShareCheckpoint = Pick<
  Checkpoint,
  "id" | "Location" | "City" | "County" | "State" | "Date" | "Time"
>;

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

  const triggerClass =
    variant === "compact"
      ? "font-montserrat inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#F57E3A]/40 hover:text-[#F57E3A]"
      : "font-montserrat inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#F57E3A]/40 hover:bg-white/[0.08]";

  const iconSize = variant === "compact" ? "size-3.5" : "size-4";

  return (
    <button
      type="button"
      disabled={!share}
      className={cn(triggerClass, className)}
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
  );
}
