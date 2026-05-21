import type { Checkpoint } from "@/lib/checkpoints/types";

export type LatLng = {
  lat: number;
  lng: number;
};

/** Parse coordinates from Google Maps URLs in mapurl field. */
export function parseCoordinatesFromMapUrl(mapurl: string | null): LatLng | null {
  if (!mapurl) return null;

  try {
    if (/^https?:\/\//i.test(mapurl)) {
      const u = new URL(mapurl);
      const q = u.searchParams.get("q");
      if (q) {
        const trimmed = q.trim();
        const coordPair = trimmed.match(/^(-?\d+\.?\d*)[\s,]+(-?\d+\.?\d*)$/);
        if (coordPair) {
          const lat = Number(coordPair[1]);
          const lng = Number(coordPair[2]);
          if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90) {
            return { lat, lng };
          }
        }
      }
      const ll = u.searchParams.get("ll");
      if (ll) {
        const parts = ll.split(",");
        if (parts.length >= 2) {
          const lat = Number(parts[0]);
          const lng = Number(parts[1]);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            return { lat, lng };
          }
        }
      }
    }
  } catch {
    /* ignore invalid URLs */
  }

  const precise = mapurl.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/i);
  if (precise) {
    return { lat: Number(precise[1]), lng: Number(precise[2]) };
  }

  const atMatch = mapurl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) };
  }

  const placeMatch = mapurl.match(/3d(-?\d+\.?\d*)[^\d-]+(-?\d+\.?\d*)/i);
  if (placeMatch) {
    return { lat: Number(placeMatch[1]), lng: Number(placeMatch[2]) };
  }

  return null;
}

/** True when mapurl contains parseable lat/lng (not city / state fallback). */
export function hasPreciseMapCoordinates(mapurl: string | null): boolean {
  return parseCoordinatesFromMapUrl(mapurl) !== null;
}

/** Address string for geocoding when map URL has no coordinates. */
export function buildGeocodeQuery(checkpoint: {
  Location: string;
  City: string;
  County: string;
  State: string;
}): string {
  const location = checkpoint.Location?.trim() ?? "";
  const isUndisclosedLocation = /undisclosed|unknown|tbd/i.test(location);

  const county = checkpoint.County?.trim() ?? "";
  const countyLabel =
    county && !/county/i.test(county) ? `${county} County` : county;

  return [
    isUndisclosedLocation ? "" : location,
    checkpoint.City,
    countyLabel,
    checkpoint.State || "California",
    "USA",
  ]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(", ");
}

export const CALIFORNIA_CENTER_FALLBACK: LatLng = {
  lat: 36.7783,
  lng: -119.4179,
};

const CITY_FALLBACKS: Record<string, LatLng> = {
  "el centro|imperial": { lat: 32.792, lng: -115.563 },
  "glendora|los angeles": { lat: 34.1361, lng: -117.8653 },
  "los angeles|los angeles": { lat: 34.0522, lng: -118.2437 },
  "san diego|san diego": { lat: 32.7157, lng: -117.1611 },
  "riverside|riverside": { lat: 33.9533, lng: -117.3962 },
};

function coordsNearlyEqual(a: LatLng, b: LatLng, epsilon = 0.02): boolean {
  return Math.abs(a.lat - b.lat) < epsilon && Math.abs(a.lng - b.lng) < epsilon;
}

/** True when coordinates are a city/state fallback, not a precise pin. */
export function isApproximateCoordinates(coords: LatLng): boolean {
  if (coordsNearlyEqual(coords, CALIFORNIA_CENTER_FALLBACK)) return true;
  return Object.values(CITY_FALLBACKS).some((fallback) =>
    coordsNearlyEqual(coords, fallback),
  );
}

/** Whether card/marker selection should geocode for a better pin. */
export function needsGeocodeForMap(
  checkpoint: Pick<Checkpoint, "mapurl" | "City" | "County" | "State">,
  coords: LatLng,
): boolean {
  if (!hasPreciseMapCoordinates(checkpoint.mapurl)) return true;
  return isApproximateCoordinates(coords);
}

function cityFallback(city: string, county: string): LatLng | null {
  const key = `${city}|${county}`.toLowerCase();
  return CITY_FALLBACKS[key] ?? null;
}

export function resolveCheckpointCoordinates(
  checkpoint: Pick<Checkpoint, "mapurl" | "City" | "County" | "State">,
): LatLng {
  const fromUrl = parseCoordinatesFromMapUrl(checkpoint.mapurl);
  if (fromUrl) return fromUrl;

  const fromCity = cityFallback(checkpoint.City, checkpoint.County);
  if (fromCity) return fromCity;

  return CALIFORNIA_CENTER_FALLBACK;
}
