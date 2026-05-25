export const ALERT_LEAD_TIME_OPTIONS = [6, 12, 24, 48, 72, 168] as const;

export type UserAlertSettings = {
  user_id: string;
  alerts_enabled: boolean;
  email_notifications: boolean;
  preferred_counties: string | null;
  alert_lead_time_hours: number;
  zip_code: string | null;
  email: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
};

export type UserAlertSettingsInput = {
  alerts_enabled: boolean;
  email_notifications: boolean;
  preferred_counties: string;
  alert_lead_time_hours: number;
};

export const DEFAULT_ALERT_LEAD_TIME_HOURS = 24;

export const DEFAULT_ALERT_SETTINGS_INPUT: UserAlertSettingsInput = {
  alerts_enabled: true,
  email_notifications: true,
  preferred_counties: "",
  alert_lead_time_hours: DEFAULT_ALERT_LEAD_TIME_HOURS,
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
  };
}

export function formatAlertSettingsForDisplay(
  input: UserAlertSettingsInput,
): Record<string, string> {
  return {
    "Checkpoint alerts": input.alerts_enabled ? "On" : "Off",
    "Email notifications": input.email_notifications ? "On" : "Off",
    "Alert window": `${input.alert_lead_time_hours} hours before upcoming checkpoints`,
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
