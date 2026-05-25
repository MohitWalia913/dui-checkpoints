export type UserAlertSettings = {
  user_id: string;
  alerts_enabled: boolean;
  email_notifications: boolean;
  preferred_counties: string | null;
  alert_lead_time_hours: number;
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type UserAlertSettingsInput = {
  alerts_enabled: boolean;
  email_notifications: boolean;
  preferred_counties: string;
  alert_lead_time_hours: number;
  additional_notes: string;
};

export const DEFAULT_ALERT_SETTINGS_INPUT: UserAlertSettingsInput = {
  alerts_enabled: true,
  email_notifications: true,
  preferred_counties: "",
  alert_lead_time_hours: 24,
  additional_notes: "",
};

export function alertSettingsToInput(
  row: UserAlertSettings | null,
): UserAlertSettingsInput {
  if (!row) return { ...DEFAULT_ALERT_SETTINGS_INPUT };
  return {
    alerts_enabled: row.alerts_enabled,
    email_notifications: row.email_notifications,
    preferred_counties: row.preferred_counties ?? "",
    alert_lead_time_hours: row.alert_lead_time_hours,
    additional_notes: row.additional_notes ?? "",
  };
}

export function formatAlertSettingsForDisplay(
  input: UserAlertSettingsInput,
): Record<string, string> {
  return {
    "Checkpoint alerts": input.alerts_enabled ? "On" : "Off",
    "Email notifications": input.email_notifications ? "On" : "Off",
    "Preferred counties": input.preferred_counties.trim() || "All counties",
    "Alert lead time": `${input.alert_lead_time_hours} hour${
      input.alert_lead_time_hours === 1 ? "" : "s"
    } before checkpoint`,
    Notes: input.additional_notes.trim() || "—",
  };
}
