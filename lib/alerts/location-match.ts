import { geocodeCheckpoint, geocodeUsZip } from "@/lib/alerts/geocode";
import { haversineMiles } from "@/lib/alerts/distance";
import type { AlertSubscriber } from "@/lib/dashboard/alert-settings-repository";
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

export function matchesCityAndCounty(
  userCity: string,
  userCounty: string,
  checkpoint: Pick<Checkpoint, "City" | "County">,
): boolean {
  const city = normalizePlace(userCity);
  const county = normalizePlace(userCounty);
  if (!city || !county) return false;

  const checkpointCity = normalizePlace(checkpoint.City ?? "");
  const checkpointCounty = normalizePlace(checkpoint.County ?? "");

  const cityMatch =
    checkpointCity === city ||
    checkpointCity.includes(city) ||
    city.includes(checkpointCity);

  const countyMatch =
    checkpointCounty === county ||
    checkpointCounty.includes(county) ||
    county.includes(checkpointCounty);

  return cityMatch && countyMatch;
}

export function matchesPreferredCounties(
  preferred: string | null | undefined,
  checkpointCounty: string,
): boolean {
  const raw = preferred?.trim();
  if (!raw) return true;

  const counties = raw
    .split(/[,;]/)
    .map((c) => normalizePlace(c))
    .filter(Boolean);

  const checkpointNorm = normalizePlace(checkpointCounty);
  return counties.some(
    (c) =>
      checkpointNorm.includes(c) ||
      c.includes(checkpointNorm),
  );
}

export function subscriberHasLocationConfig(
  subscriber: AlertSubscriber,
): boolean {
  const hasZip = Boolean(subscriber.zip_code?.trim());
  const hasCityCounty =
    subscriber.use_city_county_alerts &&
    Boolean(subscriber.alert_city?.trim()) &&
    Boolean(subscriber.alert_county?.trim());

  return hasZip || hasCityCounty;
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

export function matchesCityCountyAlert(
  subscriber: AlertSubscriber,
  checkpoint: Checkpoint,
): boolean {
  if (!subscriber.use_city_county_alerts) return false;
  const city = subscriber.alert_city?.trim() ?? "";
  const county = subscriber.alert_county?.trim() ?? "";
  if (!city || !county) return false;
  return matchesCityAndCounty(city, county, checkpoint);
}

export type LocationMatchResult = {
  matched: boolean;
  matchType: "zip" | "city_county" | null;
  distanceMiles: number | null;
};

export async function resolveSubscriberLocationMatch(
  subscriber: AlertSubscriber,
  checkpoint: Checkpoint,
  checkpointCoords: LatLng | null,
): Promise<LocationMatchResult> {
  if (!matchesPreferredCounties(subscriber.preferred_counties, checkpoint.County)) {
    return { matched: false, matchType: null, distanceMiles: null };
  }

  if (matchesCityCountyAlert(subscriber, checkpoint)) {
    return { matched: true, matchType: "city_county", distanceMiles: null };
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
