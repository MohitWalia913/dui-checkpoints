"use client";

import {
  MAP_LAYER_LABELS,
  type MapLayerStyle,
} from "@/lib/map/tile-layers";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

export function MapLayerControl({
  value,
  onChange,
}: {
  value: MapLayerStyle;
  onChange: (layer: MapLayerStyle) => void;
}) {
  const layers = Object.keys(MAP_LAYER_LABELS) as MapLayerStyle[];

  return (
    <div
      className="rounded-xl border border-white/15 bg-[#040F20]/75 p-2 shadow-lg backdrop-blur-md"
      role="group"
      aria-label="Map style"
    >
      <p className="font-montserrat mb-2 flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
        <Layers className="size-3.5 text-[#F57E3A]" aria-hidden />
        Map view
      </p>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-1">
        {layers.map((layer) => (
          <button
            key={layer}
            type="button"
            onClick={() => onChange(layer)}
            aria-pressed={value === layer}
            className={cn(
              "font-montserrat rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors",
              value === layer
                ? "bg-[#F57E3A] text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white",
            )}
          >
            {MAP_LAYER_LABELS[layer]}
          </button>
        ))}
      </div>
    </div>
  );
}
