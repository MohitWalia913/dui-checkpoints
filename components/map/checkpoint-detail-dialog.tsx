"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatCheckpointDate,
  isCheckpointUpcoming,
} from "@/lib/checkpoints/date";
import type { MapCheckpoint } from "@/lib/checkpoints/map-checkpoint";
import type { Checkpoint } from "@/lib/checkpoints/types";
import { cn } from "@/lib/utils";
import { Calendar, Clock, ExternalLink, Loader2, MapPin } from "lucide-react";
import Link from "next/link";

function StatusBadge({ date }: { date: string }) {
  const upcoming = isCheckpointUpcoming(date);
  return (
    <span
      className={cn(
        "font-montserrat inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        upcoming
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-white/10 text-white/60",
      )}
    >
      {upcoming ? "Upcoming" : "Past"}
    </span>
  );
}

export function CheckpointDetailDialog({
  open,
  onOpenChange,
  checkpoint,
  detail,
  detailLoading,
  detailError,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkpoint: MapCheckpoint | null;
  detail: Checkpoint | null;
  detailLoading: boolean;
  detailError: string | null;
}) {
  if (!checkpoint) return null;

  const description =
    detail?.Description?.trim() ||
    "No additional details are available for this checkpoint.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[20001] max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge date={checkpoint.Date} />
            <span className="font-montserrat rounded-full bg-[#F57E3A]/15 px-2.5 py-0.5 text-xs font-semibold text-[#F57E3A]">
              {checkpoint.State}
            </span>
          </div>
          <DialogTitle className="text-2xl leading-snug">
            {checkpoint.Location}
          </DialogTitle>
          <DialogDescription className="flex items-start gap-2 text-base">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#F57E3A]" aria-hidden />
            <span>
              {checkpoint.City}, {checkpoint.County} County
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="font-inter space-y-4 text-sm text-white/80">
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4 text-[#F57E3A]" aria-hidden />
              {formatCheckpointDate(checkpoint.Date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-[#F57E3A]" aria-hidden />
              {checkpoint.Time || "—"}
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="font-montserrat mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
              Details
            </p>
            {detailLoading ? (
              <div className="flex items-center gap-2 text-white/60">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading checkpoint details…
              </div>
            ) : detailError ? (
              <p className="text-red-300">{detailError}</p>
            ) : (
              <p className="leading-relaxed">{description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {checkpoint.Source ? (
              <a
                href={checkpoint.Source}
                target="_blank"
                rel="noopener noreferrer"
                className="font-montserrat inline-flex items-center gap-2 rounded-xl bg-[#F57E3A] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                View Source
                <ExternalLink className="size-4" aria-hidden />
              </a>
            ) : null}
            <Link
              href={`/dashboard/checkpoints/${checkpoint.id}`}
              className="font-montserrat inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#F57E3A]/40 hover:text-[#F57E3A]"
            >
              Full page view
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
