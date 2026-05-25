import type { CheckpointAlertEmailKind } from "@/lib/email/checkpoint-alert-email";
import { createAdminClient } from "@/lib/supabase/admin";

const TABLE = "checkpoint_alert_notifications" as const;

export async function hasAlertNotificationBeenSent(params: {
  userId: string;
  checkpointId: number;
  alertType: CheckpointAlertEmailKind;
}): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { data, error } = await admin
    .from(TABLE)
    .select("id")
    .eq("user_id", params.userId)
    .eq("checkpoint_id", params.checkpointId)
    .eq("alert_type", params.alertType)
    .maybeSingle();

  if (error) {
    console.warn("[alert-notification-log] lookup failed:", error.message);
    return false;
  }

  return Boolean(data);
}

export async function recordAlertNotificationSent(params: {
  userId: string;
  checkpointId: number;
  alertType: CheckpointAlertEmailKind;
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { error } = await admin.from(TABLE).upsert(
    {
      user_id: params.userId,
      checkpoint_id: params.checkpointId,
      alert_type: params.alertType,
      sent_at: new Date().toISOString(),
    },
    { onConflict: "user_id,checkpoint_id,alert_type", ignoreDuplicates: true },
  );

  if (error) {
    console.warn("[alert-notification-log] record failed:", error.message);
  }
}
