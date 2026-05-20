"use client";

import {
  formatCheckpointDate,
} from "@/lib/checkpoints/date";
import type { MapCheckpoint } from "@/lib/checkpoints/map-checkpoint";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import { useEffect, useRef } from "react";

function StatusPill({ status }: { status: MapCheckpoint["status"] }) {
  return (
    <span
      className={cn(
        "font-montserrat shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        status === "upcoming"
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-white/10 text-white/55",
      )}
    >
      {status === "upcoming" ? "Upcoming" : "Past"}
    </span>
  );
}

export function CheckpointListPanel({
  checkpoints,
  selectedId,
  hoveredId,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  countyFilter,
  onCountyFilterChange,
  counties,
  onSelect,
  onHover,
}: {
  checkpoints: MapCheckpoint[];
  selectedId: number | null;
  hoveredId: number | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "upcoming" | "past";
  onStatusFilterChange: (value: "all" | "upcoming" | "past") => void;
  countyFilter: string;
  onCountyFilterChange: (value: string) => void;
  counties: string[];
  onSelect: (checkpoint: MapCheckpoint) => void;
  onHover: (id: number | null) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedId]);

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-white/10 bg-[#040F20]/80 backdrop-blur-xl lg:max-w-[400px] lg:min-w-[320px]">
      <div className="shrink-0 space-y-3 border-b border-white/10 p-4">
        <div>
          <h1 className="font-montserrat text-lg font-bold text-white">
            Checkpoint locator
          </h1>
          <p className="font-inter mt-1 text-xs text-white/55">
            {checkpoints.length} location{checkpoints.length === 1 ? "" : "s"}{" "}
            on map
          </p>
        </div>

        <label className="relative block">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search city, county, location…"
            className="font-montserrat h-11 w-full rounded-xl border border-white/10 bg-white/5 pr-3 pl-10 text-sm text-white placeholder:text-white/40 focus:border-[#F57E3A]/50 focus:outline-none focus:ring-2 focus:ring-[#F57E3A]/25"
            aria-label="Search checkpoints"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {(["all", "upcoming", "past"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onStatusFilterChange(value)}
              className={cn(
                "font-montserrat rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                statusFilter === value
                  ? "bg-[#F57E3A] text-white"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {value}
            </button>
          ))}
        </div>

        {counties.length > 0 ? (
          <select
            value={countyFilter}
            onChange={(e) => onCountyFilterChange(e.target.value)}
            className="font-montserrat h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[#F57E3A]/50 focus:outline-none focus:ring-2 focus:ring-[#F57E3A]/25"
            aria-label="Filter by county"
          >
            <option value="">All counties</option>
            {counties.map((county) => (
              <option key={county} value={county} className="bg-[#040F20]">
                {county}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <ul
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
        role="listbox"
        aria-label="Checkpoint list"
      >
        {checkpoints.length === 0 ? (
          <li className="px-3 py-12 text-center">
            <p className="font-montserrat text-sm font-semibold text-white/80">
              No checkpoints match your filters
            </p>
            <p className="font-inter mt-2 text-xs text-white/50">
              Try clearing search or changing the status filter.
            </p>
          </li>
        ) : (
          checkpoints.map((checkpoint) => {
            const isSelected = selectedId === checkpoint.id;
            const isHovered = hoveredId === checkpoint.id;

            return (
              <li
                key={checkpoint.id}
                ref={isSelected ? activeItemRef : undefined}
                role="option"
                aria-selected={isSelected}
              >
                <button
                  type="button"
                  onClick={() => onSelect(checkpoint)}
                  onMouseEnter={() => onHover(checkpoint.id)}
                  onMouseLeave={() => onHover(null)}
                  onFocus={() => onHover(checkpoint.id)}
                  onBlur={() => onHover(null)}
                  className={cn(
                    "mb-2 w-full rounded-xl border p-3 text-left transition-all duration-200",
                    isSelected
                      ? "border-[#F57E3A]/60 bg-[#F57E3A]/10 shadow-[0_0_0_1px_rgba(245,126,58,0.25)]"
                      : isHovered
                        ? "border-white/20 bg-white/[0.07]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-montserrat line-clamp-2 text-sm font-semibold text-white">
                      {checkpoint.Location}
                    </p>
                    <StatusPill status={checkpoint.status} />
                  </div>
                  <p className="font-inter mt-1 flex items-center gap-1 text-xs text-white/55">
                    <MapPin className="size-3 shrink-0 text-[#F57E3A]" aria-hidden />
                    {checkpoint.City}, {checkpoint.County}
                  </p>
                  <div className="font-inter mt-2 flex flex-wrap gap-3 text-xs text-white/50">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3 text-[#F57E3A]" aria-hidden />
                      {formatCheckpointDate(checkpoint.Date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3 text-[#F57E3A]" aria-hidden />
                      {checkpoint.Time}
                    </span>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
