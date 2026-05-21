import { CheckpointMapPanel } from "@/components/dashboard/checkpoint-map-panel";
import { CheckpointShareButton } from "@/components/dashboard/checkpoint-share-button";
import {
  formatCheckpointDate,
  isCheckpointUpcoming,
} from "@/lib/checkpoints/date";
import type { LatLng } from "@/lib/checkpoints/coordinates";
import type { Checkpoint } from "@/lib/checkpoints/types";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export function CheckpointDetailView({
  checkpoint,
  coordinates,
}: {
  checkpoint: Checkpoint;
  coordinates: LatLng;
}) {
  const upcoming = isCheckpointUpcoming(checkpoint.Date);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <Link
        href="/dashboard"
        className="font-montserrat inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-[#F57E3A]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-montserrat inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                upcoming
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-white/10 text-white/60"
              }`}
            >
              {upcoming ? "Upcoming" : "Past"}
            </span>
            <span className="font-montserrat rounded-full bg-[#F57E3A]/15 px-2.5 py-0.5 text-xs font-semibold text-[#F57E3A]">
              {checkpoint.State}
            </span>
            <span className="font-inter text-sm text-white/70">
              {checkpoint.County} · {checkpoint.City}
            </span>
          </div>

          <h1 className="font-montserrat text-2xl font-bold leading-tight text-white md:text-3xl">
            {checkpoint.Location}
          </h1>

          <div className="font-inter flex flex-wrap gap-4 text-sm text-white/65">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4 text-[#F57E3A]" aria-hidden />
              {formatCheckpointDate(checkpoint.Date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-[#F57E3A]" aria-hidden />
              {checkpoint.Time}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <CheckpointShareButton checkpoint={checkpoint} />
          {checkpoint.mapurl ? (
            <a
              href={checkpoint.mapurl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-montserrat inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:border-[#F57E3A]/40"
            >
              Google Maps
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ) : null}
          {checkpoint.Source ? (
            <a
              href={checkpoint.Source}
              target="_blank"
              rel="noopener noreferrer"
              className="font-montserrat inline-flex items-center gap-1.5 rounded-lg bg-[#F57E3A] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Source
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ) : null}
        </div>
      </div>

      <CheckpointMapPanel
        coordinates={coordinates}
        label={checkpoint.Location}
        city={`${checkpoint.City}, ${checkpoint.State}`}
      />

      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-montserrat flex items-center gap-2 text-lg font-semibold text-white">
          <MapPin className="size-5 text-[#F57E3A]" aria-hidden />
          Checkpoint details
        </h2>
        <p className="font-inter mt-4 whitespace-pre-wrap text-base leading-relaxed text-white/75">
          {checkpoint.Description}
        </p>
      </section>
    </div>
  );
}
