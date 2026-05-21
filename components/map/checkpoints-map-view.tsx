"use client";

import {
  MAP_TILE_LAYERS,
  type MapLayerStyle,
} from "@/lib/map/tile-layers";
import type { MapCheckpoint } from "@/lib/checkpoints/map-checkpoint";
import {
  isApproximateCoordinates,
  type LatLng,
} from "@/lib/checkpoints/coordinates";
import type { Feature, FeatureCollection, Point, Polygon } from "geojson";
import type {
  FilterSpecification,
  MapLayerMouseEvent,
  StyleSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl";
import type { CircleLayerSpecification } from "react-map-gl/maplibre";
import { useCallback, useEffect, useMemo, useRef } from "react";
import Map, { Layer, Popup, Source, type MapRef } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

const CALIFORNIA_CENTER: [number, number] = [-119.4179, 36.7783];
const DEFAULT_MAP_ZOOM = 5.6;
const FOCUS_ZOOM = 15;

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
      "#94A3B8",
      "#F57E3A",
    ],
    "circle-radius": 9,
    "circle-stroke-width": 2.5,
    "circle-stroke-color": "#FFFFFF",
    "circle-opacity": 0.95,
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
    "circle-radius": 14,
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
    "circle-radius": 10,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#FFFFFF",
    "circle-opacity": 0.9,
  },
};

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
  const hasFittedRef = useRef(false);
  const lastFlownCoordsRef = useRef<string | null>(null);

  const flyToCheckpoint = useCallback((coords: LatLng, zoom = FOCUS_ZOOM) => {
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) return;

    const lat = Number.parseFloat(String(coords.lat));
    const lng = Number.parseFloat(String(coords.lng));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180 || lat === 0 || lng === 0) return;
    if (isApproximateCoordinates({ lat, lng })) return;

    const key = `${lat.toFixed(6)},${lng.toFixed(6)}@${zoom}`;
    if (lastFlownCoordsRef.current === key) return;
    lastFlownCoordsRef.current = key;

    const center: [number, number] = [lng, lat];

    const runFocusAnimation = () => {
      mapInstance.resize();
      mapInstance.stop();

      mapInstance.flyTo({
        center,
        zoom: Math.max(zoom - 2, 8),
        duration: 900,
        essential: true,
        curve: 1.35,
      });

      mapInstance.once("moveend", () => {
        mapInstance.easeTo({
          center,
          zoom,
          duration: 1100,
          essential: true,
        });
        mapInstance.once("idle", () => {
          mapInstance.resize();
          mapInstance.triggerRepaint();
        });
      });
    };

    if (mapInstance.isStyleLoaded()) {
      runFocusAnimation();
      return;
    }

    mapInstance.once("load", runFocusAnimation);
  }, []);

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

  const mapStyle = useMemo<StyleSpecification>(() => {
    const tile = MAP_TILE_LAYERS[mapLayer];
    return {
      version: 8,
      sources: {
        basemap: {
          type: "raster",
          tiles: [tile.url],
          tileSize: 256,
          attribution: tile.attribution,
          minzoom: 0,
          maxzoom: tile.maxZoom ?? 20,
        },
      },
      layers: [
        {
          id: "basemap",
          type: "raster",
          source: "basemap",
          minzoom: 0,
          maxzoom: tile.maxZoom ?? 20,
        },
      ],
    };
  }, [mapLayer]);

  useEffect(() => {
    if (!flyTarget) return;
    lastFlownCoordsRef.current = null;
    flyToCheckpoint(flyTarget.center, flyTarget.zoom);
  }, [flyTarget, focusToken, flyToCheckpoint]);

  useEffect(() => {
    if (!flyTarget) return;
    lastFlownCoordsRef.current = null;
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) return;

    const refly = () => flyToCheckpoint(flyTarget.center, flyTarget.zoom);
    if (mapInstance.isStyleLoaded()) {
      refly();
      return;
    }
    mapInstance.once("styledata", refly);
  }, [mapLayer, flyTarget, flyToCheckpoint]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      center: CALIFORNIA_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: 350,
      essential: true,
    });
  }, [resetViewToken]);

  const handleMapLoad = () => {
    if (hasFittedRef.current || !mapRef.current) return;
    mapRef.current.jumpTo({
      center: CALIFORNIA_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      pitch: 0,
      bearing: 0,
    });
    hasFittedRef.current = true;
  };

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const feature = event.features?.[0];
    if (!feature) return;

    if (feature.layer.id !== "unclustered-point") return;

    const checkpointId = Number(feature.properties?.id);
    if (!Number.isFinite(checkpointId)) return;

    const match = checkpoints.find((c) => c.id === checkpointId);
    if (match) {
      onMarkerClick(match);
    }
  };

  const handleMapMouseMove = (event: MapLayerMouseEvent) => {
    const feature = event.features?.find((f) => f.layer.id === "unclustered-point");
    if (!feature) {
      onHover(null);
      return;
    }

    const checkpointId = Number(feature.properties?.id);
    if (!Number.isFinite(checkpointId)) {
      onHover(null);
      return;
    }

    onHover(checkpointId);
  };

  return (
    <div className="checkpoint-locator-map h-full w-full">
      <Map
        ref={mapRef}
        mapStyle={mapStyle}
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
        style={{
          width: "100%",
          height: "100%",
          minHeight: 320,
          background: mapLayer === "dark" ? "#0a1628" : "#e2e8f0",
        }}
      >
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

        {selectedCheckpoint &&
        !isApproximateCoordinates(selectedCheckpoint.coordinates) ? (
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
