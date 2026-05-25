export type UserAlertSettings = {
  user_id: string;
  alerts_enabled: boolean;
  email_notifications: boolean;
  preferred_counties: string | null;
  created_at: string;
  updated_at: string;
};

export type UserAlertSettingsInput = {
  alerts_enabled: boolean;
  email_notifications: boolean;
  preferred_counties: string;
};

export const DEFAULT_ALERT_SETTINGS_INPUT: UserAlertSettingsInput = {
  alerts_enabled: true,
  email_notifications: true,
  preferred_counties: "",
};

export function alertSettingsToInput(
  row: UserAlertSettings | null,
): UserAlertSettingsInput {
  if (!row) return { ...DEFAULT_ALERT_SETTINGS_INPUT };
  return {
    alerts_enabled: row.alerts_enabled,
    email_notifications: row.email_notifications,
    preferred_counties: row.preferred_counties ?? "",
  };
}

export function formatAlertSettingsForDisplay(
  input: UserAlertSettingsInput,
): Record<string, string> {
  return {
    "Checkpoint alerts": input.alerts_enabled ? "On" : "Off",
    "Email notifications": input.email_notifications ? "On" : "Off",
    "Preferred counties": input.preferred_counties.trim() || "All counties",
  };
}
