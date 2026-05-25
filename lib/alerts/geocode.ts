import {
  buildGeocodeQuery,
  parseCoordinatesFromMapUrl,
  type LatLng,
} from "@/lib/checkpoints/coordinates";
import { normalizeUsZip } from "@/lib/alerts/distance";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const USER_AGENT =
  "DUICheckpointsLocator/1.0 (https://californiaduicheckpoints.com; proximity-alerts)";

export async function geocodeUsZip(zip: string): Promise<LatLng | null> {
  const normalized = normalizeUsZip(zip);
  if (!normalized) return null;

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${normalized}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      places?: { latitude: string; longitude: string }[];
    };
    const place = json.places?.[0];
    if (!place) return null;

    const lat = Number(place.latitude);
    const lng = Number(place.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

export async function geocodeCheckpoint(checkpoint: {
  Location: string;
  City: string;
  County: string;
  State: string;
  mapurl: string | null;
}): Promise<LatLng | null> {
  const fromMap = parseCoordinatesFromMapUrl(checkpoint.mapurl);
  if (fromMap) return fromMap;

  const query = buildGeocodeQuery(checkpoint);
  if (!query.trim()) return null;

  try {
    const url = `${NOMINATIM}?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const rows = (await res.json()) as { lat: string; lon: string }[];
    const first = rows[0];
    if (!first) return null;

    const lat = Number.parseFloat(first.lat);
    const lng = Number.parseFloat(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}
