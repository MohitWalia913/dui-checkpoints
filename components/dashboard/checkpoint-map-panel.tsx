"use client";

import type { LatLng } from "@/lib/checkpoints/coordinates";
import dynamic from "next/dynamic";

const CheckpointMap = dynamic(
  () =>
    import("@/components/dashboard/checkpoint-map").then((m) => m.CheckpointMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <p className="font-inter text-sm text-white/50">Loading map…</p>
      </div>
    ),
  },
);

export function CheckpointMapPanel({
  coordinates,
  label,
  city,
}: {
  coordinates: LatLng;
  label: string;
  city: string;
}) {
  return (
    <div className="h-[min(420px,55vh)] min-h-[320px] w-full overflow-hidden rounded-xl border border-white/10">
      <CheckpointMap coordinates={coordinates} label={label} city={city} />
    </div>
  );
}
