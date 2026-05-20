"use client";

import {
  MAP_TILE_LAYERS,
  type MapLayerStyle,
} from "@/lib/map/tile-layers";
import type { MapCheckpoint } from "@/lib/checkpoints/map-checkpoint";
import type { LatLng } from "@/lib/checkpoints/coordinates";
import type { Feature, FeatureCollection, Point, Polygon } from "geojson";
import type { MapLayerMouseEvent, StyleSpecification } from "maplibre-gl";
import type { CircleLayerSpecification } from "react-map-gl/maplibre";
import { useEffect, useMemo, useRef } from "react";
import Map, { Layer, Popup, Source, type MapRef } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

const CALIFORNIA_BOUNDS: [[number, number], [number, number]] = [
  [-124.6, 32.3],
  [-114.1, 42.1],
];

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
    "circle-radius": ["step", ["get", "point_count"], 16, 25, 20, 75, 24],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#FFFFFF",
  },
};

const CLUSTER_COUNT_LAYER = {
  id: "cluster-count",
  type: "symbol",
  source: "checkpoints",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
  paint: {
    "text-color": "#FFFFFF",
  },
} as const;

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
    "circle-radius": 8,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#FFFFFF",
  },
};

const SELECTED_LAYER: CircleLayerSpecification = {
  id: "selected-point",
  type: "circle",
  source: "checkpoints",
  filter: ["==", ["get", "id"], -1],
  paint: {
    "circle-color": "#F57E3A",
    "circle-radius": 12,
    "circle-stroke-width": 3,
    "circle-stroke-color": "#FFFFFF",
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
  const mapRef = useRef<MapRef | null>(null);
  const hasFittedRef = useRef(false);

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

  const selectedFilter = useMemo(
    () => ["==", ["get", "id"], selectedCheckpoint?.id ?? -1],
    [selectedCheckpoint?.id],
  );
  const hoveredFilter = useMemo(
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
          maxzoom: tile.maxZoom ?? 20,
        },
      },
      layers: [{ id: "basemap", type: "raster", source: "basemap" }],
    };
  }, [mapLayer]);

  useEffect(() => {
    if (!flyTarget || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyTarget.center.lng, flyTarget.center.lat],
      zoom: flyTarget.zoom,
      duration: 1150,
      essential: true,
    });
  }, [flyTarget]);

  useEffect(() => {
    if (!selectedCheckpoint || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [selectedCheckpoint.coordinates.lng, selectedCheckpoint.coordinates.lat],
      zoom: 16,
      duration: 1500,
      essential: true,
    });
  }, [selectedCheckpoint, focusToken]);

  const handleMapLoad = () => {
    if (hasFittedRef.current || !mapRef.current) return;
    mapRef.current.fitBounds(CALIFORNIA_BOUNDS, {
      padding: 24,
      duration: 0,
    });
    hasFittedRef.current = true;
  };

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const feature = event.features?.[0];
    if (!feature) return;

    if (feature.layer.id === "clusters") {
      const [lng, lat] = (feature.geometry as Point).coordinates;
      map.easeTo({
        center: [lng, lat],
        zoom: Math.min(map.getZoom() + 2, 14),
        duration: 350,
      });
      return;
    }

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
    <Map
      ref={mapRef}
      className="checkpoint-locator-map h-full w-full"
      mapStyle={mapStyle}
      initialViewState={{ longitude: -119.4179, latitude: 36.7783, zoom: 5.6 }}
      interactiveLayerIds={["clusters", "unclustered-point"]}
      onLoad={handleMapLoad}
      onClick={handleMapClick}
      onMouseMove={handleMapMouseMove}
      onMouseLeave={() => onHover(null)}
      style={{ background: "#e2e8f0" }}
    >
      <Source id="checkpoints" type="geojson" data={checkpointsGeoJson} cluster clusterRadius={50}>
        <Layer {...CLUSTER_LAYER} />
        <Layer {...CLUSTER_COUNT_LAYER} />
        <Layer {...UNCLUSTERED_LAYER} />
        <Layer {...HOVERED_LAYER} filter={hoveredFilter} />
        <Layer {...SELECTED_LAYER} filter={selectedFilter} />
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
  );
}
