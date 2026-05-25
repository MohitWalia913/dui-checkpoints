import {
  hasAlertNotificationBeenSent,
  recordAlertNotificationSent,
} from "@/lib/alerts/alert-notification-log";
import { isUpcomingWithinLeadTime } from "@/lib/alerts/checkpoint-timing";
import {
  getCheckpointCoords,
  resetCheckpointCoordsCache,
  resolveSubscriberLocationMatch,
  subscriberHasLocationConfig,
} from "@/lib/alerts/location-match";
import { listAlertSubscribers } from "@/lib/dashboard/alert-settings-repository";
import { getTodayDateString } from "@/lib/checkpoints/date";
import { CHECKPOINTS_TABLE, type Checkpoint } from "@/lib/checkpoints/types";
import { sendCheckpointAlertEmail } from "@/lib/email/checkpoint-alert-email";
import { createAdminClient } from "@/lib/supabase/admin";

async function loadUpcomingCheckpoints(): Promise<{
  data: Checkpoint[];
  error: string | null;
}> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      data: [],
      error: "SUPABASE_SERVICE_ROLE_KEY is not set",
    };
  }

  const today = getTodayDateString();
  const { data, error } = await admin
    .from(CHECKPOINTS_TABLE)
    .select(
      "id, State, County, City, Location, Description, Date, Time, Source, created_at, mapurl, location_id",
    )
    .eq("State", "California")
    .gte("Date", today)
    .order("Date", { ascending: true })
    .limit(5000);

  return {
    data: (data as Checkpoint[]) ?? [],
    error: error?.message ?? null,
  };
}

export async function notifyUpcomingCheckpointReminders(): Promise<{
  checkpoints: number;
  notified: number;
  skipped: number;
  errors: string[];
}> {
  resetCheckpointCoordsCache();

  const errors: string[] = [];
  let notified = 0;
  let skipped = 0;

  const [checkpointsResult, subscribersResult] = await Promise.all([
    loadUpcomingCheckpoints(),
    listAlertSubscribers(),
  ]);

  if (checkpointsResult.error) {
    return {
      checkpoints: 0,
      notified: 0,
      skipped: 0,
      errors: [checkpointsResult.error],
    };
  }

  if (subscribersResult.error) {
    return {
      checkpoints: checkpointsResult.data.length,
      notified: 0,
      skipped: 0,
      errors: [subscribersResult.error],
    };
  }

  const checkpoints = checkpointsResult.data;
  const subscribers = subscribersResult.data;

  const needsZipGeocode = subscribers.some((s) => s.zip_code?.trim());
  const coordsByCheckpointId = new Map<number, Awaited<ReturnType<typeof getCheckpointCoords>>>();

  if (needsZipGeocode) {
    for (const checkpoint of checkpoints) {
      resetCheckpointCoordsCache();
      coordsByCheckpointId.set(
        checkpoint.id,
        await getCheckpointCoords(checkpoint),
      );
    }
  }

  for (const subscriber of subscribers) {
    if (
      !subscriber.alerts_enabled ||
      !subscriber.email_notifications ||
      !subscriber.email?.trim()
    ) {
      skipped += 1;
      continue;
    }

    if (!subscriberHasLocationConfig(subscriber)) {
      skipped += 1;
      continue;
    }

    for (const checkpoint of checkpoints) {
      if (
        !isUpcomingWithinLeadTime(
          checkpoint.Date,
          subscriber.alert_lead_time_hours,
        )
      ) {
        continue;
      }

      const alreadySent = await hasAlertNotificationBeenSent({
        userId: subscriber.user_id,
        checkpointId: checkpoint.id,
        alertType: "upcoming_reminder",
      });

      if (alreadySent) {
        skipped += 1;
        continue;
      }

      const checkpointCoords = subscriber.zip_code?.trim()
        ? (coordsByCheckpointId.get(checkpoint.id) ?? null)
        : null;

      const match = await resolveSubscriberLocationMatch(
        subscriber,
        checkpoint,
        checkpointCoords,
      );

      if (!match.matched || !match.matchType) {
        continue;
      }

      const result = await sendCheckpointAlertEmail({
        to: subscriber.email.trim(),
        userName: subscriber.display_name?.trim() || "there",
        checkpoint,
        leadTimeHours: subscriber.alert_lead_time_hours,
        matchType: match.matchType,
        distanceMiles: match.distanceMiles,
        kind: "upcoming_reminder",
      });

      if (result.sent) {
        await recordAlertNotificationSent({
          userId: subscriber.user_id,
          checkpointId: checkpoint.id,
          alertType: "upcoming_reminder",
        });
        notified += 1;
      } else {
        errors.push(
          `${subscriber.email} / checkpoint ${checkpoint.id}: ${result.error ?? "send failed"}`,
        );
      }
    }
  }

  return {
    checkpoints: checkpoints.length,
    notified,
    skipped,
    errors,
  };
}
