"use client";

import { createCheckpointMarkerIcon } from "@/lib/map/marker-icons";
import { createMarkerClusterGroup } from "@/lib/map/load-marker-cluster";
import {
  MAP_TILE_LAYERS,
  type MapLayerStyle,
} from "@/lib/map/tile-layers";
import { createZonePolygon } from "@/lib/map/zone-polygon";
import type { MapCheckpoint } from "@/lib/checkpoints/map-checkpoint";
import type { LatLng } from "@/lib/checkpoints/coordinates";
import type {
  LayerGroup,
  Map as LeafletMap,
  Marker as LeafletMarker,
  TileLayer as LeafletTileLayer,
} from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Polygon,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const CALIFORNIA_CENTER: [number, number] = [36.7783, -119.4179];
const DEFAULT_ZOOM = 6;

function MapBaseTileLayer({ mapLayer }: { mapLayer: MapLayerStyle }) {
  const map = useMap();
  const activeLayerRef = useRef<LeafletTileLayer | null>(null);

  useEffect(() => {
    const tile = MAP_TILE_LAYERS[mapLayer];

    void import("leaflet").then(({ default: L }) => {
      if (activeLayerRef.current) {
        map.removeLayer(activeLayerRef.current);
        activeLayerRef.current = null;
      }

      const layer = L.tileLayer(tile.url, {
        attribution: tile.attribution,
        maxZoom: tile.maxZoom,
        maxNativeZoom: tile.maxNativeZoom ?? tile.maxZoom,
        crossOrigin: true,
      });

      layer.addTo(map);
      activeLayerRef.current = layer;
      map.invalidateSize();
    });

    return () => {
      if (activeLayerRef.current) {
        map.removeLayer(activeLayerRef.current);
        activeLayerRef.current = null;
      }
    };
  }, [map, mapLayer]);

  return null;
}

function MapViewportController({
  flyTarget,
}: {
  flyTarget: { center: LatLng; zoom: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!flyTarget) return;
    map.flyTo(
      [flyTarget.center.lat, flyTarget.center.lng],
      flyTarget.zoom,
      { duration: 1.15, easeLinearity: 0.25 },
    );
  }, [flyTarget, map]);

  return null;
}

function FitBoundsOnLoad({ checkpoints }: { checkpoints: MapCheckpoint[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || checkpoints.length === 0) return;

    void import("leaflet").then(({ default: L }) => {
      const bounds = L.latLngBounds(
        checkpoints.map((c) => [c.coordinates.lat, c.coordinates.lng]),
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.12), { animate: false, maxZoom: 10 });
        fitted.current = true;
      }
    });
  }, [checkpoints, map]);

  return null;
}

function MarkerClusterLayer({
  checkpoints,
  selectedId,
  hoveredId,
  focusMarkerId,
  focusToken,
  onMarkerClick,
  onHover,
}: {
  checkpoints: MapCheckpoint[];
  selectedId: number | null;
  hoveredId: number | null;
  focusMarkerId: number | null;
  focusToken: number;
  onMarkerClick: (checkpoint: MapCheckpoint) => void;
  onHover: (id: number | null) => void;
}) {
  const map = useMap();
  const groupRef = useRef<LayerGroup | null>(null);
  const markerByIdRef = useRef<Record<number, LeafletMarker>>({});
  const handlersRef = useRef({ onMarkerClick, onHover });
  handlersRef.current = { onMarkerClick, onHover };
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let group: LayerGroup | null = null;

    async function initClusterLayer(leafletMap: LeafletMap) {
      const cluster = await createMarkerClusterGroup();

      if (cancelled) return;

      if (cluster) {
        group = cluster;
      } else {
        const L = (await import("leaflet")).default;
        group = L.layerGroup();
      }

      groupRef.current = group;
      leafletMap.addLayer(group);
      setReady(true);
    }

    void initClusterLayer(map);

    return () => {
      cancelled = true;
      if (group) {
        map.removeLayer(group);
      }
      groupRef.current = null;
      setReady(false);
    };
  }, [map]);

  useEffect(() => {
    if (!ready) return;
    const group = groupRef.current;
    if (!group) return;

    let cancelled = false;

    void import("leaflet").then(({ default: L }) => {
      if (cancelled) return;

      group.clearLayers();
      markerByIdRef.current = {};

      checkpoints.forEach((checkpoint) => {
        const isActive = selectedId === checkpoint.id;
        const isHovered = hoveredId === checkpoint.id;
        const marker = L.marker(
          [checkpoint.coordinates.lat, checkpoint.coordinates.lng],
          {
            icon: createCheckpointMarkerIcon(L, checkpoint.status, {
              active: isActive,
              hovered: isHovered,
            }),
          },
        );

        marker.on("click", () => handlersRef.current.onMarkerClick(checkpoint));
        marker.on("mouseover", () =>
          handlersRef.current.onHover(checkpoint.id),
        );
        marker.on("mouseout", () => handlersRef.current.onHover(null));

        group.addLayer(marker);
        markerByIdRef.current[checkpoint.id] = marker;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [checkpoints, selectedId, hoveredId, ready]);

  useEffect(() => {
    if (!ready || focusMarkerId == null) return;
    const group = groupRef.current;
    const marker = markerByIdRef.current[focusMarkerId];
    if (!group || !marker) return;

    const groupWithZoomToShow = group as LayerGroup & {
      zoomToShowLayer?: (layer: LayerGroup | LeafletMarker, cb?: () => void) => void;
    };

    if (typeof groupWithZoomToShow.zoomToShowLayer === "function") {
      groupWithZoomToShow.zoomToShowLayer(marker, () => {
        const latLng = marker.getLatLng();
        map.setView(latLng, Math.max(map.getZoom(), 17), {
          animate: true,
        });
      });
      return;
    }

    const latLng = marker.getLatLng();
    map.setView(latLng, Math.max(map.getZoom(), 17), {
      animate: true,
    });
  }, [focusMarkerId, focusToken, map, ready]);

  return null;
}

export function CheckpointsMapView({
  checkpoints,
  selectedCheckpoint,
  hoveredId,
  focusToken,
  mapLayer,
  flyTarget,
  onMarkerClick,
  onHover,
}: {
  checkpoints: MapCheckpoint[];
  selectedCheckpoint: MapCheckpoint | null;
  hoveredId: number | null;
  focusToken: number;
  mapLayer: MapLayerStyle;
  flyTarget: { center: LatLng; zoom: number } | null;
  onMarkerClick: (checkpoint: MapCheckpoint) => void;
  onHover: (id: number | null) => void;
}) {
  const zonePositions = useMemo(() => {
    if (!selectedCheckpoint) return null;
    return createZonePolygon(selectedCheckpoint.coordinates);
  }, [selectedCheckpoint]);

  return (
    <MapContainer
      center={CALIFORNIA_CENTER}
      zoom={DEFAULT_ZOOM}
      className="checkpoint-locator-map h-full w-full"
      scrollWheelZoom
      style={{ background: "#0a1628" }}
    >
      <MapBaseTileLayer mapLayer={mapLayer} />
      <MapViewportController flyTarget={flyTarget} />
      <FitBoundsOnLoad checkpoints={checkpoints} />
      <MarkerClusterLayer
        checkpoints={checkpoints}
        selectedId={selectedCheckpoint?.id ?? null}
        hoveredId={hoveredId}
        focusMarkerId={selectedCheckpoint?.id ?? null}
        focusToken={focusToken}
        onMarkerClick={onMarkerClick}
        onHover={onHover}
      />
      {zonePositions ? (
        <Polygon
          positions={zonePositions}
          pathOptions={{
            color: "#F57E3A",
            weight: 2,
            opacity: 0.9,
            fillColor: "#F57E3A",
            fillOpacity: 0.18,
            dashArray: "6 4",
          }}
        />
      ) : null}
    </MapContainer>
  );
}
