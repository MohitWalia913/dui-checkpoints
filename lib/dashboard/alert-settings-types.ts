import { defaultSelectedCounties } from "@/lib/alerts/california-counties";
import { cityKey } from "@/lib/alerts/location-catalog";

export const ALERT_LEAD_TIME_OPTIONS = [1, 6, 12, 24, 48, 72, 168] as const;

export type AlertCitySelection = {
  city: string;
  county: string;
};

export type UserAlertSettings = {
  user_id: string;
  alerts_enabled: boolean;
  email_notifications: boolean;
  preferred_counties: string | null;
  alert_lead_time_hours: number;
  zip_code: string | null;
  email: string | null;
  display_name: string | null;
  alert_city: string | null;
  alert_county: string | null;
  use_city_county_alerts: boolean;
  selected_counties: string[] | null;
  selected_cities: AlertCitySelection[] | null;
  notify_new_checkpoints: boolean;
  created_at: string;
  updated_at: string;
};

export type UserAlertSettingsInput = {
  alerts_enabled: boolean;
  email_notifications: boolean;
  alert_lead_time_hours: number;
  zip_code: string;
  selected_counties: string[];
  selected_cities: AlertCitySelection[];
  notify_new_checkpoints: boolean;
};

export const DEFAULT_ALERT_LEAD_TIME_HOURS = 24;

export const DEFAULT_ALERT_SETTINGS_INPUT: UserAlertSettingsInput = {
  alerts_enabled: true,
  email_notifications: true,
  alert_lead_time_hours: DEFAULT_ALERT_LEAD_TIME_HOURS,
  zip_code: "",
  selected_counties: defaultSelectedCounties(),
  selected_cities: [],
  notify_new_checkpoints: true,
};

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCitySelections(value: unknown): AlertCitySelection[] {
  if (!Array.isArray(value)) return [];
  const result: AlertCitySelection[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const city = typeof row.city === "string" ? row.city.trim() : "";
    const county = typeof row.county === "string" ? row.county.trim() : "";
    if (!city || !county) continue;
    result.push({ city, county });
  }
  return result;
}

function migrateLegacySelections(row: UserAlertSettings): {
  counties: string[];
  cities: AlertCitySelection[];
} {
  const fromJsonCounties = parseStringArray(row.selected_counties);
  const fromJsonCities = parseCitySelections(row.selected_cities);

  if (fromJsonCounties.length > 0 || fromJsonCities.length > 0) {
    return { counties: fromJsonCounties, cities: fromJsonCities };
  }

  if (
    row.use_city_county_alerts &&
    row.alert_city?.trim() &&
    row.alert_county?.trim()
  ) {
    return {
      counties: [],
      cities: [
        {
          city: row.alert_city.trim(),
          county: row.alert_county.trim(),
        },
      ],
    };
  }

  const legacyCounties = row.preferred_counties
    ?.split(/[,;]/)
    .map((c) => c.trim())
    .filter(Boolean);

  if (legacyCounties && legacyCounties.length > 0) {
    return { counties: legacyCounties, cities: [] };
  }

  return {
    counties: defaultSelectedCounties(),
    cities: [],
  };
}

export function alertSettingsToInput(
  row: UserAlertSettings | null,
): UserAlertSettingsInput {
  if (!row) return { ...DEFAULT_ALERT_SETTINGS_INPUT };

  const lead = row.alert_lead_time_hours;
  const leadHours = ALERT_LEAD_TIME_OPTIONS.includes(
    lead as (typeof ALERT_LEAD_TIME_OPTIONS)[number],
  )
    ? lead
    : DEFAULT_ALERT_LEAD_TIME_HOURS;

  const migrated = migrateLegacySelections(row);

  return {
    alerts_enabled: row.alerts_enabled,
    email_notifications: row.email_notifications,
    alert_lead_time_hours: leadHours,
    zip_code: row.zip_code ?? "",
    selected_counties:
      migrated.counties.length > 0
        ? migrated.counties
        : defaultSelectedCounties(),
    selected_cities: migrated.cities,
    notify_new_checkpoints: row.notify_new_checkpoints ?? true,
  };
}

export function formatAlertSettingsForDisplay(
  input: UserAlertSettingsInput,
): Record<string, string> {
  const countyLabel =
    input.selected_counties.length === 0
      ? "None"
      : input.selected_counties.length >= 58
        ? "All California counties"
        : `${input.selected_counties.length} counties`;

  const cityLabel =
    input.selected_cities.length === 0
      ? "Any city in selected counties"
      : `${input.selected_cities.length} cities`;

  return {
    "Checkpoint alerts": input.alerts_enabled ? "On" : "Off",
    "Email notifications": input.email_notifications ? "On" : "Off",
    "New checkpoint emails": input.notify_new_checkpoints
      ? "Immediate on add"
      : "Off",
    "Alert window": `${input.alert_lead_time_hours} hour${input.alert_lead_time_hours === 1 ? "" : "s"} before upcoming checkpoints`,
    "Zip code (optional)": input.zip_code.trim() || "—",
    Counties: countyLabel,
    Cities: cityLabel,
  };
}

export function parseAlertLeadTimeHours(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (!(ALERT_LEAD_TIME_OPTIONS as readonly number[]).includes(rounded)) {
    return null;
  }
  return rounded;
}

export function parseCitySelectionsInput(value: unknown): AlertCitySelection[] {
  if (!Array.isArray(value)) return [];
  const result: AlertCitySelection[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      const parts = item.split("|");
      if (parts.length === 2 && parts[0] && parts[1]) {
        result.push({ city: parts[0].trim(), county: parts[1].trim() });
      }
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const city = typeof row.city === "string" ? row.city.trim() : "";
    const county = typeof row.county === "string" ? row.county.trim() : "";
    if (!city || !county) continue;
    result.push({ city, county });
  }
  return result;
}

export function validateAlertSettingsInput(
  input: UserAlertSettingsInput,
): string | null {
  if (
    input.alerts_enabled &&
    input.selected_counties.length === 0 &&
    input.selected_cities.length === 0 &&
    !input.zip_code.trim()
  ) {
    return "Select at least one county or city, or enter a zip code for alerts.";
  }
  return null;
}

export function serializeSelectedCities(
  cities: AlertCitySelection[],
): AlertCitySelection[] {
  const seen = new Set<string>();
  const result: AlertCitySelection[] = [];
  for (const entry of cities) {
    const key = cityKey(entry.city, entry.county);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ city: entry.city.trim(), county: entry.county.trim() });
  }
  return result;
}
