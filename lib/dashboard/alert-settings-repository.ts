import type { AlertContactFields } from "@/lib/dashboard/alert-contact";
import type {
  UserAlertSettings,
  UserAlertSettingsInput,
} from "@/lib/dashboard/alert-settings-types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const TABLE = "user_alert_settings" as const;

const SELECT_COLUMNS =
  "user_id, alerts_enabled, email_notifications, preferred_counties, alert_lead_time_hours, zip_code, email, display_name, created_at, updated_at";

export type AlertSubscriber = Pick<
  UserAlertSettings,
  | "user_id"
  | "alerts_enabled"
  | "email_notifications"
  | "preferred_counties"
  | "alert_lead_time_hours"
  | "zip_code"
  | "email"
  | "display_name"
>;

export async function getUserAlertSettings(
  userId: string,
): Promise<{ data: UserAlertSettings | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data as UserAlertSettings | null) ?? null, error: null };
}

export async function syncAlertContactFields(
  userId: string,
  contact: AlertContactFields,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from(TABLE)
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    return { error: null };
  }

  const { error } = await supabase
    .from(TABLE)
    .update({
      email: contact.email,
      zip_code: contact.zip_code,
      display_name: contact.display_name,
    })
    .eq("user_id", userId);

  return { error: error?.message ?? null };
}

export async function upsertUserAlertSettings(
  userId: string,
  input: UserAlertSettingsInput,
  contact?: AlertContactFields,
): Promise<{ data: UserAlertSettings | null; error: string | null }> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    user_id: userId,
    alerts_enabled: input.alerts_enabled,
    email_notifications: input.email_notifications,
    preferred_counties: input.preferred_counties.trim() || null,
    alert_lead_time_hours: input.alert_lead_time_hours,
  };

  if (contact) {
    payload.email = contact.email;
    payload.zip_code = contact.zip_code;
    payload.display_name = contact.display_name;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select(SELECT_COLUMNS)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as UserAlertSettings, error: null };
}

export async function listAlertSubscribers(): Promise<{
  data: AlertSubscriber[];
  error: string | null;
}> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      data: [],
      error:
        "SUPABASE_SERVICE_ROLE_KEY is not set; cannot load alert subscribers",
    };
  }

  const { data, error } = await admin
    .from(TABLE)
    .select(
      "user_id, alerts_enabled, email_notifications, preferred_counties, alert_lead_time_hours, zip_code, email, display_name",
    )
    .eq("alerts_enabled", true)
    .eq("email_notifications", true);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data as AlertSubscriber[]) ?? [], error: null };
}
