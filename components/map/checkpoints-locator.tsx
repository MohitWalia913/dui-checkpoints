"use client";

import { CheckpointDetailDialog } from "@/components/map/checkpoint-detail-dialog";
import { CheckpointListPanel } from "@/components/map/checkpoint-list-panel";
import { MapLayerControl } from "@/components/map/map-layer-control";
import dynamic from "next/dynamic";

const CheckpointsMapView = dynamic(
  () =>
    import("@/components/map/checkpoints-map-view").then(
      (m) => m.CheckpointsMapView,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[280px] items-center justify-center bg-[#0a1628]">
        <p className="font-montserrat text-sm text-white/50">Loading map…</p>
      </div>
    ),
  },
);
import type { MapCheckpoint } from "@/lib/checkpoints/map-checkpoint";
import { toMapCheckpoints } from "@/lib/checkpoints/map-checkpoint";
import type { CheckpointListItem } from "@/lib/checkpoints/types";
import type { Checkpoint } from "@/lib/checkpoints/types";
import type { MapLayerStyle } from "@/lib/map/tile-layers";
import { cn } from "@/lib/utils";
import { useCallback, useMemo, useState } from "react";

async function fetchCheckpointDetail(id: number): Promise<{
  data: Checkpoint | null;
  error: string | null;
}> {
  const response = await fetch(`/api/checkpoints/${id}`);
  const json = (await response.json().catch(() => ({}))) as {
    data?: Checkpoint;
    error?: string;
  };

  if (!response.ok) {
    return {
      data: null,
      error: json.error ?? `Failed to load details (${response.status})`,
    };
  }

  return { data: json.data ?? null, error: null };
}

export function CheckpointsLocator({
  initialCheckpoints,
  loadError,
}: {
  initialCheckpoints: CheckpointListItem[];
  loadError: string | null;
}) {
  const allCheckpoints = useMemo(
    () => toMapCheckpoints(initialCheckpoints),
    [initialCheckpoints],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "past">(
    "all",
  );
  const [countyFilter, setCountyFilter] = useState("");
  const [mapLayer, setMapLayer] = useState<MapLayerStyle>("dark");
  const [selected, setSelected] = useState<MapCheckpoint | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detail, setDetail] = useState<Checkpoint | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<{
    center: MapCheckpoint["coordinates"];
    zoom: number;
  } | null>(null);

  const counties = useMemo(() => {
    const set = new Set<string>();
    allCheckpoints.forEach((c) => {
      if (c.County) set.add(c.County);
    });
    return Array.from(set).sort();
  }, [allCheckpoints]);

  const filteredCheckpoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allCheckpoints.filter((checkpoint) => {
      if (statusFilter !== "all" && checkpoint.status !== statusFilter) {
        return false;
      }
      if (countyFilter && checkpoint.County !== countyFilter) {
        return false;
      }
      if (!q) return true;

      const haystack = [
        checkpoint.Location,
        checkpoint.City,
        checkpoint.County,
        checkpoint.State,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [allCheckpoints, searchQuery, statusFilter, countyFilter]);

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);

    const result = await fetchCheckpointDetail(id);
    setDetailLoading(false);

    if (result.error) {
      setDetailError(result.error);
      return;
    }

    setDetail(result.data);
  }, []);

  const handleSelect = useCallback(
    (checkpoint: MapCheckpoint) => {
      setSelected(checkpoint);
      setHoveredId(checkpoint.id);
      setDialogOpen(true);
      setFlyTarget({
        center: checkpoint.coordinates,
        zoom: 15,
      });
      void loadDetail(checkpoint.id);
    },
    [loadDetail],
  );

  if (loadError) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div
          role="alert"
          className="max-w-md rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-center"
        >
          <p className="font-montserrat font-semibold text-red-200">
            Could not load checkpoints
          </p>
          <p className="font-inter mt-2 text-sm text-red-200/80">{loadError}</p>
        </div>
      </div>
    );
  }

  if (allCheckpoints.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="font-montserrat text-xl font-bold text-white">
          No checkpoints on the map yet
        </p>
        <p className="font-inter max-w-md text-sm text-white/60">
          When checkpoint data is added to your database, markers will appear
          here automatically.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="h-[44vh] shrink-0 lg:h-auto lg:max-h-none lg:min-h-0 lg:flex-none">
          <CheckpointListPanel
            checkpoints={filteredCheckpoints}
            selectedId={selected?.id ?? null}
            hoveredId={hoveredId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            countyFilter={countyFilter}
            onCountyFilterChange={setCountyFilter}
            counties={counties}
            onSelect={handleSelect}
            onHover={setHoveredId}
          />
        </div>

        <div className="relative min-h-[56vh] min-w-0 flex-1 lg:min-h-0">
          <CheckpointsMapView
            checkpoints={filteredCheckpoints}
            selectedCheckpoint={selected}
            hoveredId={hoveredId}
            mapLayer={mapLayer}
            flyTarget={flyTarget}
            onSelect={handleSelect}
            onHover={setHoveredId}
          />

          <div className="pointer-events-none absolute inset-0 z-[500] flex flex-col justify-between p-3 sm:p-4">
            <div className="pointer-events-auto ml-auto max-w-[160px]">
              <MapLayerControl value={mapLayer} onChange={setMapLayer} />
            </div>
            <div
              className={cn(
                "pointer-events-none flex flex-wrap gap-3 self-start rounded-xl border border-white/10 bg-[#040F20]/70 px-3 py-2 backdrop-blur-md",
              )}
              aria-hidden
            >
              <span className="font-montserrat flex items-center gap-1.5 text-[10px] font-semibold text-white/70">
                <span className="inline-block size-2.5 rotate-[-45deg] rounded-sm rounded-br-none bg-emerald-500" />
                Upcoming
              </span>
              <span className="font-montserrat flex items-center gap-1.5 text-[10px] font-semibold text-white/70">
                <span className="inline-block size-2.5 rotate-[-45deg] rounded-sm rounded-br-none bg-slate-500" />
                Past
              </span>
            </div>
          </div>
        </div>
      </div>

      <CheckpointDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        checkpoint={selected}
        detail={detail}
        detailLoading={detailLoading}
        detailError={detailError}
      />
    </>
  );
}
