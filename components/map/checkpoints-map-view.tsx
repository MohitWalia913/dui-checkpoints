"use client";

import {
  MAP_TILE_LAYERS,
  type MapLayerStyle,
} from "@/lib/map/tile-layers";
import type { MapCheckpoint } from "@/lib/checkpoints/map-checkpoint";
import type { LatLng } from "@/lib/checkpoints/coordinates";
import type { Feature, FeatureCollection, Point, Polygon } from "geojson";
import type {
  FilterSpecification,
  GeoJSONSource,
  LngLatBoundsLike,
  MapLayerMouseEvent,
} from "maplibre-gl";
import type { CircleLayerSpecification } from "react-map-gl/maplibre";
import { useCallback, useEffect, useMemo, useRef } from "react";
import MapGL, { Layer, Popup, Source, type MapRef } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

const CALIFORNIA_CENTER: [number, number] = [-119.4179, 36.7783];
const DEFAULT_MAP_ZOOM = 6;
const FOCUS_ZOOM = 14;

const BASE_MAP_STYLE = {
  version: 8 as const,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background" as const,
      paint: { "background-color": "#e2e8f0" },
    },
  ],
};

const CALIFORNIA_BOUNDARY: Feature<Polygon> = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-124.41, 42.0],
        [-120.0, 42.0],
        [-120.0, 39.0],
        [-114.13, 34.96],
        [-114.48, 32.72],
        [-117.12, 32.53],
        [-118.62, 33.56],
        [-120.2, 34.45],
        [-121.9, 36.6],
        [-123.2, 38.3],
        [-124.41, 40.0],
        [-124.41, 42.0],
      ],
    ],
  },
};

const CLUSTER_LAYER: CircleLayerSpecification = {
  id: "clusters",
  type: "circle",
  source: "checkpoints",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#F57E3A",
    "circle-radius": [
      "step",
      ["get", "point_count"],
      16,
      10,
      20,
      50,
      26,
    ],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#FFFFFF",
    "circle-opacity": 0.92,
  },
};

const UNCLUSTERED_LAYER: CircleLayerSpecification = {
  id: "unclustered-point",
  type: "circle",
  source: "checkpoints",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": [
      "match",
      ["get", "status"],
      "upcoming",
      "#10B981",
      "past",
      "#64748B",
      "#F57E3A",
    ],
    "circle-radius": 11,
    "circle-stroke-width": 3,
    "circle-stroke-color": "#FFFFFF",
    "circle-opacity": 1,
  },
};

const SELECTED_LAYER: CircleLayerSpecification = {
  id: "selected-point",
  type: "circle",
  source: "checkpoints",
  filter: [
    "all",
    ["!", ["has", "point_count"]],
    ["==", ["get", "id"], -1],
  ],
  paint: {
    "circle-color": "#F57E3A",
    "circle-radius": 18,
    "circle-stroke-width": 3,
    "circle-stroke-color": "#FFFFFF",
  },
};

const HOVERED_LAYER: CircleLayerSpecification = {
  id: "hovered-point",
  type: "circle",
  source: "checkpoints",
  filter: [
    "all",
    ["!", ["has", "point_count"]],
    ["==", ["get", "id"], -1],
  ],
  paint: {
    "circle-color": "#FDBA74",
    "circle-radius": 14,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#FFFFFF",
  },
};

function isUndisclosedLocation(location: string): boolean {
  return /undisclosed|unknown|tbd/i.test(location);
}

/** Spread markers that share the same fallback coordinate so clusters remain visible. */
function spreadMarkerCoordinates(
  checkpoints: MapCheckpoint[],
): Map<string, [number, number]> {
  const groups = new Map<string, MapCheckpoint[]>();

  for (const c of checkpoints) {
    const key = `${c.coordinates.lat.toFixed(3)}|${c.coordinates.lng.toFixed(3)}`;
    const list = groups.get(key) ?? [];
    list.push(c);
    groups.set(key, list);
  }

  const result = new Map<string, [number, number]>();

  for (const [, group] of groups) {
    if (group.length === 1) {
      const c = group[0];
      result.set(String(c.id), [c.coordinates.lng, c.coordinates.lat]);
      continue;
    }

    group.forEach((c, index) => {
      const angle = (index / group.length) * 2 * Math.PI;
      const radius = 0.012 + index * 0.0015;
      result.set(String(c.id), [
        c.coordinates.lng + Math.cos(angle) * radius,
        c.coordinates.lat + Math.sin(angle) * radius,
      ]);
    });
  }

  return result;
}

function createCirclePolygon(
  center: LatLng,
  radiusMeters = 4800,
  points = 28,
): [number, number][][] {
  const ring: [number, number][] = [];
  const latRad = (center.lat * Math.PI) / 180;
  const meterToLat = 1 / 111_320;
  const meterToLng = 1 / (111_320 * Math.cos(latRad));

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const lat = center.lat + Math.sin(angle) * radiusMeters * meterToLat;
    const lng = center.lng + Math.cos(angle) * radiusMeters * meterToLng;
    ring.push([lng, lat]);
  }
  ring.push(ring[0]);
  return [ring];
}

function boundsFromCheckpoints(
  checkpoints: MapCheckpoint[],
  coordById: Map<string, [number, number]>,
): LngLatBoundsLike | null {
  if (checkpoints.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const c of checkpoints) {
    const pair = coordById.get(String(c.id)) ?? [
      c.coordinates.lng,
      c.coordinates.lat,
    ];
    const [lng, lat] = pair;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  if (!Number.isFinite(minLng)) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function CheckpointsMapView({
  checkpoints,
  selectedCheckpoint,
  hoveredId,
  focusToken,
  resetViewToken,
  mapLayer,
  flyTarget,
  onMarkerClick,
  onHover,
}: {
  checkpoints: MapCheckpoint[];
  selectedCheckpoint: MapCheckpoint | null;
  hoveredId: number | null;
  focusToken: number;
  resetViewToken: number;
  mapLayer: MapLayerStyle;
  flyTarget: { center: LatLng; zoom: number } | null;
  onMarkerClick: (checkpoint: MapCheckpoint) => void;
  onHover: (id: number | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const mapReadyRef = useRef(false);
  const lastFlownCoordsRef = useRef<string | null>(null);

  const tileConfig = MAP_TILE_LAYERS[mapLayer];
  const markerCoordsById = useMemo(
    () => spreadMarkerCoordinates(checkpoints),
    [checkpoints],
  );

  const snapToSharpTiles = useCallback(() => {
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) return;
    const z = mapInstance.getZoom();
    const rounded = Math.round(z * 10) / 10;
    if (Math.abs(z - rounded) > 0.05) {
      mapInstance.setZoom(rounded);
    }
    mapInstance.resize();
  }, []);

  const flyToCheckpoint = useCallback(
    (coords: LatLng, zoom = FOCUS_ZOOM) => {
      const mapInstance = mapRef.current?.getMap();
      if (!mapInstance || !mapReadyRef.current) return;

      const lat = Number.parseFloat(String(coords.lat));
      const lng = Number.parseFloat(String(coords.lng));
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180 || lat === 0 || lng === 0)
        return;

      const key = `${lat.toFixed(6)},${lng.toFixed(6)}@${zoom}`;
      if (lastFlownCoordsRef.current === key) return;
      lastFlownCoordsRef.current = key;

      mapInstance.stop();
      mapInstance.resize();
      mapInstance.easeTo({
        center: [lng, lat],
        zoom,
        duration: 1200,
        essential: true,
      });
      mapInstance.once("moveend", snapToSharpTiles);
    },
    [snapToSharpTiles],
  );

  const fitCheckpointsInView = useCallback(
    (list: MapCheckpoint[], animate = true) => {
      const mapInstance = mapRef.current?.getMap();
      if (!mapInstance || !mapReadyRef.current) return;

      const bounds = boundsFromCheckpoints(list, markerCoordsById);
      if (!bounds) {
        mapInstance.jumpTo({
          center: CALIFORNIA_CENTER,
          zoom: DEFAULT_MAP_ZOOM,
        });
        return;
      }

      lastFlownCoordsRef.current = null;
      mapInstance.resize();
      mapInstance.fitBounds(bounds, {
        padding: { top: 56, bottom: 56, left: 56, right: 56 },
        duration: animate ? 700 : 0,
        maxZoom: 10,
      });
      mapInstance.once("moveend", snapToSharpTiles);
    },
    [markerCoordsById, snapToSharpTiles],
  );

  const checkpointsGeoJson = useMemo<FeatureCollection<Point>>(
    () => ({
      type: "FeatureCollection",
      features: checkpoints.map((checkpoint) => {
        const coordinates = markerCoordsById.get(String(checkpoint.id)) ?? [
          checkpoint.coordinates.lng,
          checkpoint.coordinates.lat,
        ];
        return {
          type: "Feature",
          properties: {
            id: checkpoint.id,
            status: checkpoint.status,
            location: checkpoint.Location,
            city: checkpoint.City,
            county: checkpoint.County,
          },
          geometry: {
            type: "Point",
            coordinates,
          },
        };
      }),
    }),
    [checkpoints, markerCoordsById],
  );

  const undisclosedAreasGeoJson = useMemo<FeatureCollection<Polygon>>(
    () => ({
      type: "FeatureCollection",
      features: checkpoints
        .filter((checkpoint) => isUndisclosedLocation(checkpoint.Location))
        .map((checkpoint) => ({
          type: "Feature" as const,
          properties: { id: checkpoint.id },
          geometry: {
            type: "Polygon" as const,
            coordinates: createCirclePolygon(checkpoint.coordinates),
          },
        })),
    }),
    [checkpoints],
  );

  const selectedFilter = useMemo<FilterSpecification>(
    () => ["==", ["get", "id"], selectedCheckpoint?.id ?? -1],
    [selectedCheckpoint?.id],
  );
  const hoveredFilter = useMemo<FilterSpecification>(
    () => ["==", ["get", "id"], hoveredId ?? -1],
    [hoveredId],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      mapRef.current?.getMap()?.resize();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance || !mapReadyRef.current) return;

    const source = mapInstance.getSource("basemap") as
      | { setTiles?: (tiles: string[]) => void }
      | undefined;
    if (source?.setTiles) {
      source.setTiles([tileConfig.url]);
      mapInstance.triggerRepaint();
    }
  }, [mapLayer, tileConfig.url]);

  useEffect(() => {
    if (!flyTarget) return;
    lastFlownCoordsRef.current = null;
    flyToCheckpoint(flyTarget.center, flyTarget.zoom);
  }, [flyTarget, focusToken, flyToCheckpoint]);

  useEffect(() => {
    if (flyTarget || selectedCheckpoint) return;
    fitCheckpointsInView(checkpoints, true);
  }, [
    checkpoints,
    resetViewToken,
    flyTarget,
    selectedCheckpoint,
    fitCheckpointsInView,
  ]);

  const handleMapLoad = () => {
    mapReadyRef.current = true;
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) return;
    mapInstance.resize();
    fitCheckpointsInView(checkpoints, false);
  };

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) return;

    const feature = event.features?.[0];
    if (!feature) return;

    if (feature.layer.id === "clusters") {
      const clusterId = feature.properties?.cluster_id;
      if (clusterId == null) return;

      const source = mapInstance.getSource("checkpoints") as GeoJSONSource;
      void source.getClusterExpansionZoom(clusterId).then((zoom) => {
        const [lng, lat] = (feature.geometry as Point).coordinates;
        mapInstance.easeTo({
          center: [lng, lat],
          zoom: Math.min(zoom + 0.5, 14),
          duration: 600,
        });
      });
      return;
    }

    if (feature.layer.id !== "unclustered-point") return;

    const checkpointId = Number(feature.properties?.id);
    if (!Number.isFinite(checkpointId)) return;

    const match = checkpoints.find((c) => c.id === checkpointId);
    if (match) onMarkerClick(match);
  };

  const handleMapMouseMove = (event: MapLayerMouseEvent) => {
    const feature = event.features?.find(
      (f) => f.layer.id === "unclustered-point" || f.layer.id === "clusters",
    );
    if (!feature || feature.layer.id === "clusters") {
      onHover(null);
      return;
    }
    const checkpointId = Number(feature.properties?.id);
    onHover(Number.isFinite(checkpointId) ? checkpointId : null);
  };

  const selectedCoords = selectedCheckpoint
    ? (markerCoordsById.get(String(selectedCheckpoint.id)) ?? [
        selectedCheckpoint.coordinates.lng,
        selectedCheckpoint.coordinates.lat,
      ])
    : null;

  return (
    <div
      ref={containerRef}
      className="checkpoint-locator-map relative h-full min-h-[360px] w-full"
    >
      <MapGL
        ref={mapRef}
        mapStyle={BASE_MAP_STYLE}
        initialViewState={{
          longitude: CALIFORNIA_CENTER[0],
          latitude: CALIFORNIA_CENTER[1],
          zoom: DEFAULT_MAP_ZOOM,
        }}
        interactiveLayerIds={["unclustered-point", "clusters"]}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        onMouseMove={handleMapMouseMove}
        onMouseLeave={() => onHover(null)}
        scrollZoom
        attributionControl={false}
        pixelRatio={
          typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio || 1, 2)
            : 2
        }
        style={{
          width: "100%",
          height: "100%",
          minHeight: 360,
          background: mapLayer === "dark" ? "#0a1628" : "#e2e8f0",
        }}
      >
        <Source
          id="basemap"
          type="raster"
          tiles={[tileConfig.url]}
          tileSize={256}
          attribution={tileConfig.attribution}
          minzoom={0}
          maxzoom={tileConfig.maxZoom ?? 19}
        >
          <Layer
            id="basemap-layer"
            type="raster"
            source="basemap"
            minzoom={0}
            maxzoom={tileConfig.maxZoom ?? 19}
          />
        </Source>

        <Source
          id="checkpoints"
          type="geojson"
          data={checkpointsGeoJson}
          cluster
          clusterMaxZoom={13}
          clusterRadius={48}
        >
          <Layer {...CLUSTER_LAYER} />
          <Layer {...UNCLUSTERED_LAYER} />
          <Layer {...HOVERED_LAYER} filter={hoveredFilter} />
          <Layer {...SELECTED_LAYER} filter={selectedFilter} />
        </Source>

        <Source id="undisclosed-areas" type="geojson" data={undisclosedAreasGeoJson}>
          <Layer
            id="undisclosed-areas-fill"
            type="fill"
            paint={{ "fill-color": "#F57E3A", "fill-opacity": 0.14 }}
          />
          <Layer
            id="undisclosed-areas-line"
            type="line"
            paint={{ "line-color": "#F57E3A", "line-width": 2, "line-opacity": 0.75 }}
          />
        </Source>

        <Source id="california-boundary" type="geojson" data={CALIFORNIA_BOUNDARY}>
          <Layer
            id="california-boundary-line"
            type="line"
            paint={{ "line-color": "#F57E3A", "line-width": 3, "line-opacity": 0.95 }}
          />
        </Source>

        {selectedCheckpoint && selectedCoords ? (
          <Popup
            longitude={selectedCoords[0]}
            latitude={selectedCoords[1]}
            closeButton={false}
            closeOnClick={false}
            anchor="top"
            offset={12}
          >
            <div className="font-sans text-sm">
              <p className="font-semibold text-[#040F20]">
                {selectedCheckpoint.Location}
              </p>
              <p className="text-[#5C6573]">
                {selectedCheckpoint.City}, {selectedCheckpoint.County}
              </p>
            </div>
          </Popup>
        ) : null}
      </MapGL>
    </div>
  );
}
