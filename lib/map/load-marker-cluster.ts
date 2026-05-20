import { createClusterIcon } from "@/lib/map/marker-icons";
import type { Layer, LayerGroup } from "leaflet";

type MarkerClusterGroupInstance = LayerGroup & {
  clearLayers: () => MarkerClusterGroupInstance;
  addLayer: (layer: Layer) => MarkerClusterGroupInstance;
};

/** Load leaflet.markercluster on the client; returns null if unavailable. */
export async function createMarkerClusterGroup(): Promise<MarkerClusterGroupInstance | null> {
  if (typeof window === "undefined") return null;

  const L = (await import("leaflet")).default;
  await import("leaflet.markercluster");

  const markerClusterGroup = (
    L as typeof L & {
      markerClusterGroup?: (opts: object) => MarkerClusterGroupInstance;
    }
  ).markerClusterGroup;

  if (typeof markerClusterGroup !== "function") {
    return null;
  }

  return markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 52,
    spiderfyOnMaxZoom: true,
    animate: true,
    iconCreateFunction: (cluster: { getChildCount: () => number }) =>
      createClusterIcon(L, cluster),
  });
}
