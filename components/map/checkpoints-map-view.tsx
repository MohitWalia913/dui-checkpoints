"use client";

import {
  createCheckpointMarkerIcon,
  createClusterIcon,
} from "@/lib/map/marker-icons";
import {
  MAP_TILE_LAYERS,
  type MapLayerStyle,
} from "@/lib/map/tile-layers";
import { createZonePolygon } from "@/lib/map/zone-polygon";
import type { MapCheckpoint } from "@/lib/checkpoints/map-checkpoint";
import type { LatLng } from "@/lib/checkpoints/coordinates";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  Polygon,
  TileLayer,
  useMap,
} from "react-leaflet";

const CALIFORNIA_CENTER: [number, number] = [36.7783, -119.4179];
const DEFAULT_ZOOM = 6;

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
    const bounds = L.latLngBounds(
      checkpoints.map((c) => [c.coordinates.lat, c.coordinates.lng]),
    );
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.12), { animate: false, maxZoom: 10 });
      fitted.current = true;
    }
  }, [checkpoints, map]);

  return null;
}

function MarkerClusterLayer({
  checkpoints,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: {
  checkpoints: MapCheckpoint[];
  selectedId: number | null;
  hoveredId: number | null;
  onSelect: (checkpoint: MapCheckpoint) => void;
  onHover: (id: number | null) => void;
}) {
  const map = useMap();
  const groupRef = useRef<L.LayerGroup | null>(null);
  const handlersRef = useRef({ onSelect, onHover });
  handlersRef.current = { onSelect, onHover };

  useEffect(() => {
    const group = (
      L as typeof L & {
        markerClusterGroup: (options?: object) => L.LayerGroup & {
          clearLayers: () => void;
          addLayer: (layer: L.Layer) => void;
        };
      }
    ).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 52,
      spiderfyOnMaxZoom: true,
      animate: true,
      iconCreateFunction: createClusterIcon,
    });

    groupRef.current = group;
    map.addLayer(group);

    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    group.clearLayers();

    checkpoints.forEach((checkpoint) => {
      const isActive = selectedId === checkpoint.id;
      const isHovered = hoveredId === checkpoint.id;
      const marker = L.marker(
        [checkpoint.coordinates.lat, checkpoint.coordinates.lng],
        {
          icon: createCheckpointMarkerIcon(checkpoint.status, {
            active: isActive,
            hovered: isHovered,
          }),
        },
      );

      marker.on("click", () => handlersRef.current.onSelect(checkpoint));
      marker.on("mouseover", () => handlersRef.current.onHover(checkpoint.id));
      marker.on("mouseout", () => handlersRef.current.onHover(null));

      group.addLayer(marker);
    });
  }, [checkpoints, selectedId, hoveredId]);

  return null;
}

export function CheckpointsMapView({
  checkpoints,
  selectedCheckpoint,
  hoveredId,
  mapLayer,
  flyTarget,
  onSelect,
  onHover,
}: {
  checkpoints: MapCheckpoint[];
  selectedCheckpoint: MapCheckpoint | null;
  hoveredId: number | null;
  mapLayer: MapLayerStyle;
  flyTarget: { center: LatLng; zoom: number } | null;
  onSelect: (checkpoint: MapCheckpoint) => void;
  onHover: (id: number | null) => void;
}) {
  const tile = MAP_TILE_LAYERS[mapLayer];

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
      <TileLayer
        key={mapLayer}
        attribution={tile.attribution}
        url={tile.url}
        maxZoom={tile.maxZoom}
      />
      <MapViewportController flyTarget={flyTarget} />
      <FitBoundsOnLoad checkpoints={checkpoints} />
      <MarkerClusterLayer
        checkpoints={checkpoints}
        selectedId={selectedCheckpoint?.id ?? null}
        hoveredId={hoveredId}
        onSelect={onSelect}
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
