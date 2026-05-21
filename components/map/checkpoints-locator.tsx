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
      <div className="flex h-full min-h-[280px] items-center justify-center bg-slate-100">
        <p className="font-montserrat text-sm text-slate-600">Loading map…</p>
      </div>
    ),
  },
);
import type { MapCheckpoint } from "@/lib/checkpoints/map-checkpoint";
import { toMapCheckpoints } from "@/lib/checkpoints/map-checkpoint";
import {
  buildGeocodeQuery,
  hasPreciseMapCoordinates,
  isApproximateCoordinates,
  needsGeocodeForMap,
  type LatLng,
} from "@/lib/checkpoints/coordinates";
import type { CheckpointListItem } from "@/lib/checkpoints/types";
import type { Checkpoint } from "@/lib/checkpoints/types";
import type { MapLayerStyle } from "@/lib/map/tile-layers";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function normalizeLatLng(input: LatLng): LatLng | null {
  const lat = Number.parseFloat(String(input.lat));
  const lng = Number.parseFloat(String(input.lng));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  if (lat === 0 || lng === 0) return null;
  return { lat, lng };
}

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
    "upcoming",
  );
  const [countyFilter, setCountyFilter] = useState("");
  const [mapLayer, setMapLayer] = useState<MapLayerStyle>("standard");
  const [mapFocusing, setMapFocusing] = useState(false);
  const [selected, setSelected] = useState<MapCheckpoint | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detail, setDetail] = useState<Checkpoint | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [focusToken, setFocusToken] = useState(0);
  const [resetViewToken, setResetViewToken] = useState(0);
  const [flyTarget, setFlyTarget] = useState<{
    center: MapCheckpoint["coordinates"];
    zoom: number;
  } | null>(null);
  const selectionRequestRef = useRef(0);
  const mapSectionRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    setSelected(null);
    setHoveredId(null);
    setFlyTarget(null);
    setMapFocusing(false);
    setResetViewToken((prev) => prev + 1);
  }, [statusFilter, countyFilter, searchQuery]);

  const [coordOverrides, setCoordOverrides] = useState<
    Partial<Record<number, LatLng>>
  >({});

  const checkpointDataKey = useMemo(
    () => initialCheckpoints.map((c) => c.id).join(","),
    [initialCheckpoints],
  );

  useEffect(() => {
    setCoordOverrides({});
  }, [checkpointDataKey]);

  const checkpointsForMap = useMemo(
    () =>
      filteredCheckpoints.map((c) => ({
        ...c,
        coordinates: coordOverrides[c.id] ?? c.coordinates,
      })),
    [filteredCheckpoints, coordOverrides],
  );

  const selectedForMap = useMemo((): MapCheckpoint | null => {
    if (!selected) return null;
    const o = coordOverrides[selected.id];
    if (!o) return selected;
    return { ...selected, coordinates: o };
  }, [selected, coordOverrides]);

  useEffect(() => {
    if (!selected) return;

    const stillVisible = filteredCheckpoints.some((c) => c.id === selected.id);
    if (stillVisible) return;

    setSelected(null);
    setHoveredId(null);
    setDialogOpen(false);
    setDetail(null);
    setDetailError(null);
    setFlyTarget(null);
  }, [filteredCheckpoints, selected]);

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

  const applyGeocodeIfNeeded = useCallback(
    async (checkpoint: MapCheckpoint): Promise<LatLng | null> => {
      if (
        hasPreciseMapCoordinates(checkpoint.mapurl) &&
        !isApproximateCoordinates(checkpoint.coordinates)
      ) {
        return checkpoint.coordinates;
      }

      const cached = coordOverrides[checkpoint.id];
      if (cached) {
        return cached;
      }

      const q = buildGeocodeQuery(checkpoint);
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const json = (await response.json().catch(() => ({}))) as {
          data?: { lat: number; lng: number } | null;
        };
        const lat = json?.data?.lat;
        const lng = json?.data?.lng;
        if (
          lat != null &&
          lng != null &&
          Number.isFinite(lat) &&
          Number.isFinite(lng)
        ) {
          const resolved = { lat, lng };
          setCoordOverrides((prev) => ({
            ...prev,
            [checkpoint.id]: resolved,
          }));
          return resolved;
        }
      } catch {
        // keep graceful fallback
      }

      return null;
    },
    [coordOverrides],
  );

  /** Resolve approximate Past/all pins in the background so markers match real locations. */
  useEffect(() => {
    let cancelled = false;
    const pending = filteredCheckpoints
      .filter((c) => needsGeocodeForMap(c, c.coordinates))
      .slice(0, statusFilter === "past" ? 25 : 12);

    void (async () => {
      for (const checkpoint of pending) {
        if (cancelled) break;
        await applyGeocodeIfNeeded(checkpoint);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filteredCheckpoints, applyGeocodeIfNeeded]);

  const focusMapOnCheckpoint = useCallback((coords: LatLng) => {
    const normalized = normalizeLatLng(coords);
    if (!normalized) return;
    setMapFocusing(false);
    setFlyTarget({ center: normalized, zoom: 15 });
    setFocusToken((prev) => prev + 1);
  }, []);

  const handleListItemSelect = useCallback(
    (checkpoint: MapCheckpoint) => {
      const requestId = ++selectionRequestRef.current;
      const mapCheckpoint =
        checkpointsForMap.find((c) => c.id === checkpoint.id) ?? checkpoint;

      setSelected(mapCheckpoint);
      setHoveredId(mapCheckpoint.id);
      setDialogOpen(false);
      setDetail(null);
      setDetailError(null);

      const mustGeocode = needsGeocodeForMap(
        mapCheckpoint,
        mapCheckpoint.coordinates,
      );

      const flyNow = normalizeLatLng(mapCheckpoint.coordinates);
      if (flyNow) {
        focusMapOnCheckpoint(flyNow);
      }

      if (mustGeocode) {
        setMapFocusing(true);
        void (async () => {
          const resolved = await applyGeocodeIfNeeded(mapCheckpoint);
          if (selectionRequestRef.current !== requestId) return;
          const safeResolved = resolved
            ? normalizeLatLng(resolved)
            : flyNow;
          setMapFocusing(false);
          if (!safeResolved) return;

          setSelected((prev) =>
            prev?.id === mapCheckpoint.id
              ? { ...mapCheckpoint, coordinates: safeResolved }
              : prev,
          );
          focusMapOnCheckpoint(safeResolved);
        })();
      }

      if (
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 1023px)").matches
      ) {
        mapSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    },
    [applyGeocodeIfNeeded, checkpointsForMap, focusMapOnCheckpoint],
  );

  const handleMarkerClick = useCallback(
    (checkpoint: MapCheckpoint) => {
      const requestId = ++selectionRequestRef.current;
      const mapCheckpoint =
        checkpointsForMap.find((c) => c.id === checkpoint.id) ?? checkpoint;

      setSelected(mapCheckpoint);
      setHoveredId(mapCheckpoint.id);
      setDialogOpen(true);

      const mustGeocode = needsGeocodeForMap(
        mapCheckpoint,
        mapCheckpoint.coordinates,
      );

      const flyNow = normalizeLatLng(mapCheckpoint.coordinates);
      if (flyNow) {
        focusMapOnCheckpoint(flyNow);
      }

      if (mustGeocode) {
        setMapFocusing(true);
        void (async () => {
          const resolved = await applyGeocodeIfNeeded(mapCheckpoint);
          if (selectionRequestRef.current !== requestId) return;
          const safeResolved = resolved
            ? normalizeLatLng(resolved)
            : flyNow;
          setMapFocusing(false);
          if (!safeResolved) return;

          setSelected((prev) =>
            prev?.id === mapCheckpoint.id
              ? { ...mapCheckpoint, coordinates: safeResolved }
              : prev,
          );
          focusMapOnCheckpoint(safeResolved);
        })();
      }

      void loadDetail(mapCheckpoint.id);
    },
    [loadDetail, applyGeocodeIfNeeded, checkpointsForMap, focusMapOnCheckpoint],
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
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="h-[44vh] min-h-0 shrink-0 overflow-hidden lg:h-full lg:max-h-none lg:min-h-0 lg:flex-none">
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
            onSelect={handleListItemSelect}
            onHover={setHoveredId}
          />
        </div>

        <div
          ref={mapSectionRef}
          className="relative min-h-[56vh] min-w-0 flex-1 overflow-hidden lg:h-full lg:min-h-0"
        >
          <CheckpointsMapView
            checkpoints={checkpointsForMap}
            selectedCheckpoint={selectedForMap}
            hoveredId={hoveredId}
            focusToken={focusToken}
            resetViewToken={resetViewToken}
            mapLayer={mapLayer}
            flyTarget={flyTarget}
            onMarkerClick={handleMarkerClick}
            onHover={setHoveredId}
          />

          {mapFocusing ? (
            <div className="pointer-events-none absolute inset-x-0 top-3 z-[600] flex justify-center px-3">
              <p className="font-montserrat rounded-full border border-white/15 bg-[#040F20]/85 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md">
                Finding exact location…
              </p>
            </div>
          ) : null}

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
