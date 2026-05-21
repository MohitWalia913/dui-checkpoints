export type MapLayerStyle = "standard" | "satellite" | "dark" | "terrain";

export type MapTileConfig = {
  url: string;
  attribution: string;
  maxZoom?: number;
  maxNativeZoom?: number;
};

/** Sharp vector GL styles (preferred — no blurry raster upscale). */
export const MAP_STYLE_URLS: Partial<Record<MapLayerStyle, string>> = {
  standard: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

/** Raster fallback for satellite / terrain only. */
export const MAP_TILE_LAYERS: Record<MapLayerStyle, MapTileConfig> = {
  standard: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    maxNativeZoom: 19,
  },
  satellite: {
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Tiles &copy; <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 19,
    maxNativeZoom: 19,
  },
  dark: {
    url: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    maxNativeZoom: 20,
  },
  terrain: {
    url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
    maxNativeZoom: 17,
  },
};

export function usesVectorMapStyle(layer: MapLayerStyle): boolean {
  return Boolean(MAP_STYLE_URLS[layer]);
}

export const MAP_LAYER_LABELS: Record<MapLayerStyle, string> = {
  standard: "Standard",
  satellite: "Satellite",
  dark: "Dark",
  terrain: "Terrain",
};
