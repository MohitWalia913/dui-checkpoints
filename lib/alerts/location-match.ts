import { geocodeCheckpoint, geocodeUsZip } from "@/lib/alerts/geocode";
import { haversineMiles } from "@/lib/alerts/distance";
import { cityKey } from "@/lib/alerts/location-catalog";
import type { AlertSubscriber } from "@/lib/dashboard/alert-settings-repository";
import type { AlertCitySelection } from "@/lib/dashboard/alert-settings-types";
import type { Checkpoint } from "@/lib/checkpoints/types";
import type { LatLng } from "@/lib/checkpoints/coordinates";

const DEFAULT_RADIUS_MILES = 40;

export function getAlertRadiusMiles(): number {
  const parsed = Number(process.env.CHECKPOINT_ALERT_RADIUS_MILES);
  if (Number.isFinite(parsed) && parsed > 0 && parsed <= 200) {
    return parsed;
  }
  return DEFAULT_RADIUS_MILES;
}

function normalizePlace(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+county$/i, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function placesMatch(a: string, b: string): boolean {
  const left = normalizePlace(a);
  const right = normalizePlace(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function parseSubscriberCounties(
  subscriber: AlertSubscriber,
): string[] {
  const raw = subscriber.selected_counties;
  if (Array.isArray(raw)) {
    return raw
      .filter((c): c is string => typeof c === "string")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  if (subscriber.preferred_counties?.trim()) {
    return subscriber.preferred_counties
      .split(/[,;]/)
      .map((c) => c.trim())
      .filter(Boolean);
  }
  return [];
}

function parseSubscriberCities(
  subscriber: AlertSubscriber,
): AlertCitySelection[] {
  const raw = subscriber.selected_cities;
  if (!Array.isArray(raw)) {
    if (
      subscriber.use_city_county_alerts &&
      subscriber.alert_city?.trim() &&
      subscriber.alert_county?.trim()
    ) {
      return [
        {
          city: subscriber.alert_city.trim(),
          county: subscriber.alert_county.trim(),
        },
      ];
    }
    return [];
  }

  const result: AlertCitySelection[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const city = typeof row.city === "string" ? row.city.trim() : "";
    const county = typeof row.county === "string" ? row.county.trim() : "";
    if (!city || !county) continue;
    result.push({ city, county });
  }
  return result;
}

export function matchesSelectedCounty(
  selectedCounties: string[],
  checkpointCounty: string,
): boolean {
  if (selectedCounties.length === 0) return false;
  const checkpointNorm = normalizePlace(checkpointCounty);
  return selectedCounties.some((county) =>
    placesMatch(county, checkpointNorm),
  );
}

export function matchesSelectedCity(
  selectedCities: AlertCitySelection[],
  checkpoint: Pick<Checkpoint, "City" | "County">,
): boolean {
  if (selectedCities.length === 0) return false;
  const checkpointKey = cityKey(checkpoint.City, checkpoint.County);
  return selectedCities.some(
    (entry) => cityKey(entry.city, entry.county) === checkpointKey,
  );
}

export function matchesSelectedLocations(
  subscriber: AlertSubscriber,
  checkpoint: Checkpoint,
): boolean {
  const counties = parseSubscriberCounties(subscriber);
  const cities = parseSubscriberCities(subscriber);

  if (matchesSelectedCity(cities, checkpoint)) {
    return true;
  }

  if (matchesSelectedCounty(counties, checkpoint.County)) {
    return true;
  }

  return false;
}

export function subscriberHasLocationConfig(
  subscriber: AlertSubscriber,
): boolean {
  const hasZip = Boolean(subscriber.zip_code?.trim());
  const counties = parseSubscriberCounties(subscriber);
  const cities = parseSubscriberCities(subscriber);
  return hasZip || counties.length > 0 || cities.length > 0;
}

export async function matchesZipProximity(
  subscriber: AlertSubscriber,
  checkpoint: Checkpoint,
  checkpointCoords: LatLng,
): Promise<{ matches: boolean; distanceMiles: number | null }> {
  const zip = subscriber.zip_code?.trim();
  if (!zip) {
    return { matches: false, distanceMiles: null };
  }

  const userCoords = await geocodeUsZip(zip);
  if (!userCoords) {
    return { matches: false, distanceMiles: null };
  }

  const distance = haversineMiles(userCoords, checkpointCoords);
  return {
    matches: distance <= getAlertRadiusMiles(),
    distanceMiles: distance,
  };
}

export type LocationMatchResult = {
  matched: boolean;
  matchType: "zip" | "county" | "city" | null;
  distanceMiles: number | null;
};

export async function resolveSubscriberLocationMatch(
  subscriber: AlertSubscriber,
  checkpoint: Checkpoint,
  checkpointCoords: LatLng | null,
): Promise<LocationMatchResult> {
  const cities = parseSubscriberCities(subscriber);
  if (matchesSelectedCity(cities, checkpoint)) {
    return { matched: true, matchType: "city", distanceMiles: null };
  }

  const counties = parseSubscriberCounties(subscriber);
  if (matchesSelectedCounty(counties, checkpoint.County)) {
    return { matched: true, matchType: "county", distanceMiles: null };
  }

  if (checkpointCoords && subscriber.zip_code?.trim()) {
    const zip = await matchesZipProximity(
      subscriber,
      checkpoint,
      checkpointCoords,
    );
    if (zip.matches) {
      return {
        matched: true,
        matchType: "zip",
        distanceMiles: zip.distanceMiles,
      };
    }
  }

  return { matched: false, matchType: null, distanceMiles: null };
}

let cachedCheckpointCoords: LatLng | null | undefined;

export async function getCheckpointCoords(
  checkpoint: Checkpoint,
): Promise<LatLng | null> {
  if (cachedCheckpointCoords !== undefined) {
    return cachedCheckpointCoords;
  }
  cachedCheckpointCoords = await geocodeCheckpoint(checkpoint);
  return cachedCheckpointCoords;
}

export function resetCheckpointCoordsCache(): void {
  cachedCheckpointCoords = undefined;
}
