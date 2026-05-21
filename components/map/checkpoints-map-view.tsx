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
  LngLatBoundsLike,
  MapLayerMouseEvent,
} from "maplibre-gl";
import type { CircleLayerSpecification } from "react-map-gl/maplibre";
import { useCallback, useEffect, useMemo, useRef } from "react";
import Map, { Layer, Popup, Source, type MapRef } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

const CALIFORNIA_CENTER: [number, number] = [-119.4179, 36.7783];
const DEFAULT_MAP_ZOOM = 5.6;
const FOCUS_ZOOM = 15;

/** Stable style — basemap tiles are added as a Source child so filter/layer changes do not wipe markers. */
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

const UNCLUSTERED_LAYER: CircleLayerSpecification = {
  id: "unclustered-point",
  type: "circle",
  source: "checkpoints",
  paint: {
    "circle-color": [
      "match",
      ["get", "status"],
      "upcoming",
      "#10B981",
      "past",
      "#CBD5E1",
      "#F57E3A",
    ],
    "circle-radius": 10,
    "circle-stroke-width": 2.5,
    "circle-stroke-color": "#FFFFFF",
    "circle-opacity": 1,
  },
};

function isUndisclosedLocation(location: string): boolean {
  return /undisclosed|unknown|tbd/i.test(location);
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

const SELECTED_LAYER: CircleLayerSpecification = {
  id: "selected-point",
  type: "circle",
  source: "checkpoints",
  filter: ["==", ["get", "id"], -1],
  paint: {
    "circle-color": "#F57E3A",
    "circle-radius": 16,
    "circle-stroke-width": 3,
    "circle-stroke-color": "#FFFFFF",
    "circle-opacity": 1,
  },
};

const HOVERED_LAYER: CircleLayerSpecification = {
  id: "hovered-point",
  type: "circle",
  source: "checkpoints",
  filter: ["==", ["get", "id"], -1],
  paint: {
    "circle-color": "#F57E3A",
    "circle-radius": 12,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#FFFFFF",
    "circle-opacity": 0.95,
  },
};

function boundsFromCheckpoints(
  checkpoints: MapCheckpoint[],
): LngLatBoundsLike | null {
  if (checkpoints.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const c of checkpoints) {
    const { lat, lng } = c.coordinates;
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
  const mapRef = useRef<MapRef | null>(null);
  const mapReadyRef = useRef(false);
  const lastFlownCoordsRef = useRef<string | null>(null);

  const tileConfig = MAP_TILE_LAYERS[mapLayer];

  const flyToCheckpoint = useCallback((coords: LatLng, zoom = FOCUS_ZOOM) => {
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance || !mapReadyRef.current) return;

    const lat = Number.parseFloat(String(coords.lat));
    const lng = Number.parseFloat(String(coords.lng));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180 || lat === 0 || lng === 0) return;

    const key = `${lat.toFixed(6)},${lng.toFixed(6)}@${zoom}`;
    if (lastFlownCoordsRef.current === key) return;
    lastFlownCoordsRef.current = key;

    const center: [number, number] = [lng, lat];
    mapInstance.stop();
    mapInstance.resize();
    mapInstance.flyTo({
      center,
      zoom,
      duration: 1600,
      essential: true,
      curve: 1.42,
    });
    mapInstance.once("moveend", () => {
      mapInstance.resize();
    });
  }, []);

  const fitCheckpointsInView = useCallback(
    (list: MapCheckpoint[], animate = true) => {
      const mapInstance = mapRef.current?.getMap();
      if (!mapInstance || !mapReadyRef.current) return;

      const bounds = boundsFromCheckpoints(list);
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
        padding: { top: 48, bottom: 48, left: 48, right: 48 },
        duration: animate ? 900 : 0,
        maxZoom: 11,
      });
    },
    [],
  );

  const checkpointsGeoJson = useMemo<FeatureCollection<Point>>(
    () => ({
      type: "FeatureCollection",
      features: checkpoints.map((checkpoint) => ({
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
          coordinates: [checkpoint.coordinates.lng, checkpoint.coordinates.lat],
        },
      })),
    }),
    [checkpoints],
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
    if (!flyTarget) return;
    lastFlownCoordsRef.current = null;
    flyToCheckpoint(flyTarget.center, flyTarget.zoom);
  }, [flyTarget, focusToken, flyToCheckpoint]);

  useEffect(() => {
    if (flyTarget || selectedCheckpoint) return;
    fitCheckpointsInView(checkpoints, true);
  }, [checkpoints, resetViewToken, flyTarget, selectedCheckpoint, fitCheckpointsInView]);

  const handleMapLoad = () => {
    mapReadyRef.current = true;
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) return;
    mapInstance.resize();
    fitCheckpointsInView(checkpoints, false);
  };

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature || feature.layer.id !== "unclustered-point") return;

    const checkpointId = Number(feature.properties?.id);
    if (!Number.isFinite(checkpointId)) return;

    const match = checkpoints.find((c) => c.id === checkpointId);
    if (match) onMarkerClick(match);
  };

  const handleMapMouseMove = (event: MapLayerMouseEvent) => {
    const feature = event.features?.find((f) => f.layer.id === "unclustered-point");
    if (!feature) {
      onHover(null);
      return;
    }
    const checkpointId = Number(feature.properties?.id);
    onHover(Number.isFinite(checkpointId) ? checkpointId : null);
  };

  return (
    <div className="checkpoint-locator-map h-full min-h-[320px] w-full">
      <Map
        ref={mapRef}
        mapStyle={BASE_MAP_STYLE}
        initialViewState={{
          longitude: CALIFORNIA_CENTER[0],
          latitude: CALIFORNIA_CENTER[1],
          zoom: DEFAULT_MAP_ZOOM,
        }}
        interactiveLayerIds={["unclustered-point"]}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        onMouseMove={handleMapMouseMove}
        onMouseLeave={() => onHover(null)}
        scrollZoom
        attributionControl={false}
        style={{
          width: "100%",
          height: "100%",
          minHeight: 320,
          background: mapLayer === "dark" ? "#0a1628" : "#e2e8f0",
        }}
      >
        <Source
          key={mapLayer}
          id="basemap"
          type="raster"
          tiles={[tileConfig.url]}
          tileSize={256}
          attribution={tileConfig.attribution}
          minzoom={0}
          maxzoom={tileConfig.maxZoom ?? 20}
        >
          <Layer
            id="basemap-layer"
            type="raster"
            source="basemap"
            minzoom={0}
            maxzoom={tileConfig.maxZoom ?? 20}
          />
        </Source>

        <Source id="checkpoints" type="geojson" data={checkpointsGeoJson}>
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

        {selectedCheckpoint ? (
          <Popup
            longitude={selectedCheckpoint.coordinates.lng}
            latitude={selectedCheckpoint.coordinates.lat}
            closeButton={false}
            closeOnClick={false}
            anchor="top"
            offset={12}
          >
            <div className="font-sans text-sm">
              <p className="font-semibold text-[#040F20]">{selectedCheckpoint.Location}</p>
              <p className="text-[#5C6573]">
                {selectedCheckpoint.City}, {selectedCheckpoint.County}
              </p>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}
