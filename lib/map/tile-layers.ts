export type MapLayerStyle = "standard" | "satellite" | "dark" | "terrain";

export type MapTileConfig = {
  url: string;
  attribution: string;
  maxZoom?: number;
  maxNativeZoom?: number;
};

export const MAP_TILE_LAYERS: Record<MapLayerStyle, MapTileConfig> = {
  standard: {
    url: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    maxNativeZoom: 19,
  },
  satellite: {
    // Esri World Imagery (XYZ) — reliable global satellite tiles for Leaflet
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    maxZoom: 19,
    maxNativeZoom: 19,
  },
  dark: {
    url: "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    maxNativeZoom: 20,
  },
  terrain: {
    url: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
    maxNativeZoom: 17,
  },
};

export const MAP_LAYER_LABELS: Record<MapLayerStyle, string> = {
  standard: "Standard",
  satellite: "Satellite",
  dark: "Dark",
  terrain: "Terrain",
};
