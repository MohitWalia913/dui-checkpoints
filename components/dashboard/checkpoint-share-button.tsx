"use client";

import { CheckpointShareDialog } from "@/components/dashboard/checkpoint-share-dialog";
import { buildCheckpointShareContent, getCheckpointSharePath } from "@/lib/checkpoints/share";
import type { Checkpoint } from "@/lib/checkpoints/types";
import { cn } from "@/lib/utils";
import { Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    const origin = window.location.origin;
    setPageUrl(`${origin}${getCheckpointSharePath(checkpoint.id)}`);
  }, [checkpoint.id]);

  const share = useMemo(
    () =>
      pageUrl ? buildCheckpointShareContent(checkpoint, pageUrl) : null,
    [checkpoint, pageUrl],
  );

  const triggerClass =
    variant === "compact"
      ? "font-montserrat inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#F57E3A]/40 hover:text-[#F57E3A]"
      : "font-montserrat inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#F57E3A]/40 hover:bg-white/[0.08]";

  const iconSize = variant === "compact" ? "size-3.5" : "size-4";

  if (!share) {
    return (
      <button type="button" disabled className={cn(triggerClass, className)}>
        <Share2 className={iconSize} aria-hidden />
        Share
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className={cn(triggerClass, className)}
        aria-label="Share checkpoint"
        onClick={() => setOpen(true)}
      >
        <Share2 className={iconSize} aria-hidden />
        Share
      </button>
      <CheckpointShareDialog
        open={open}
        onOpenChange={setOpen}
        share={share}
      />
    </>
  );
}
