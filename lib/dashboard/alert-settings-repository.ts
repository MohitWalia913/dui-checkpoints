import type {
  UserAlertSettings,
  UserAlertSettingsInput,
} from "@/lib/dashboard/alert-settings-types";
import { createClient } from "@/lib/supabase/server";

const TABLE = "user_alert_settings" as const;

export async function getUserAlertSettings(
  userId: string,
): Promise<{ data: UserAlertSettings | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "user_id, alerts_enabled, email_notifications, preferred_counties, created_at, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data as UserAlertSettings | null) ?? null, error: null };
}

export async function upsertUserAlertSettings(
  userId: string,
  input: UserAlertSettingsInput,
): Promise<{ data: UserAlertSettings | null; error: string | null }> {
  const supabase = await createClient();

  const payload = {
    user_id: userId,
    alerts_enabled: input.alerts_enabled,
    email_notifications: input.email_notifications,
    preferred_counties: input.preferred_counties.trim() || null,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select(
      "user_id, alerts_enabled, email_notifications, preferred_counties, created_at, updated_at",
    )
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as UserAlertSettings, error: null };
}
