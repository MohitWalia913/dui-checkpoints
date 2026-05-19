import type { Checkpoint } from "@/lib/checkpoints/types";

export type LatLng = {
  lat: number;
  lng: number;
};

/** Parse coordinates from Google Maps URLs in mapurl field. */
export function parseCoordinatesFromMapUrl(mapurl: string | null): LatLng | null {
  if (!mapurl) return null;

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

const CITY_FALLBACKS: Record<string, LatLng> = {
  "el centro|imperial": { lat: 32.792, lng: -115.563 },
  "glendora|los angeles": { lat: 34.1361, lng: -117.8653 },
  "los angeles|los angeles": { lat: 34.0522, lng: -118.2437 },
  "san diego|san diego": { lat: 32.7157, lng: -117.1611 },
  "riverside|riverside": { lat: 33.9533, lng: -117.3962 },
};

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

  // California center — last resort
  return { lat: 36.7783, lng: -119.4179 };
}
