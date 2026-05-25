export const ALERT_LEAD_TIME_OPTIONS = [1, 6, 12, 24, 48, 72, 168] as const;

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
  created_at: string;
  updated_at: string;
};

export type UserAlertSettingsInput = {
  alerts_enabled: boolean;
  email_notifications: boolean;
  preferred_counties: string;
  alert_lead_time_hours: number;
  alert_city: string;
  alert_county: string;
  use_city_county_alerts: boolean;
};

export const DEFAULT_ALERT_LEAD_TIME_HOURS = 24;

export const DEFAULT_ALERT_SETTINGS_INPUT: UserAlertSettingsInput = {
  alerts_enabled: true,
  email_notifications: true,
  preferred_counties: "",
  alert_lead_time_hours: DEFAULT_ALERT_LEAD_TIME_HOURS,
  alert_city: "",
  alert_county: "",
  use_city_county_alerts: false,
};

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

  return {
    alerts_enabled: row.alerts_enabled,
    email_notifications: row.email_notifications,
    preferred_counties: row.preferred_counties ?? "",
    alert_lead_time_hours: leadHours,
    alert_city: row.alert_city ?? "",
    alert_county: row.alert_county ?? "",
    use_city_county_alerts: row.use_city_county_alerts ?? false,
  };
}

export function formatAlertSettingsForDisplay(
  input: UserAlertSettingsInput,
): Record<string, string> {
  return {
    "Checkpoint alerts": input.alerts_enabled ? "On" : "Off",
    "Email notifications": input.email_notifications ? "On" : "Off",
    "Alert window": `${input.alert_lead_time_hours} hour${input.alert_lead_time_hours === 1 ? "" : "s"} before upcoming checkpoints`,
    "City & county alerts": input.use_city_county_alerts ? "On" : "Off",
    "Alert city": input.alert_city.trim() || "—",
    "Alert county": input.alert_county.trim() || "—",
    "Zip code (profile)": "Set in Profile settings",
    "Preferred counties": input.preferred_counties.trim() || "All counties",
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

export function validateAlertSettingsInput(
  input: UserAlertSettingsInput,
): string | null {
  if (
    input.use_city_county_alerts &&
    (!input.alert_city.trim() || !input.alert_county.trim())
  ) {
    return "City and county are required when city & county alerts are enabled.";
  }
  return null;
}
