import {
  hasAlertNotificationBeenSent,
  recordAlertNotificationSent,
} from "@/lib/alerts/alert-notification-log";
import {
  getCheckpointCoords,
  resetCheckpointCoordsCache,
  resolveSubscriberLocationMatch,
  subscriberHasLocationConfig,
} from "@/lib/alerts/location-match";
import { sendCheckpointAlertEmail } from "@/lib/email/checkpoint-alert-email";
import { listAlertSubscribers } from "@/lib/dashboard/alert-settings-repository";
import { getTodayDateString } from "@/lib/checkpoints/date";
import type { Checkpoint } from "@/lib/checkpoints/types";

export async function notifyNearbyUsersOfNewCheckpoint(
  checkpoint: Checkpoint,
): Promise<{ notified: number; skipped: number; errors: string[] }> {
  resetCheckpointCoordsCache();

  const errors: string[] = [];
  let notified = 0;
  let skipped = 0;

  if (checkpoint.Date < getTodayDateString()) {
    return {
      notified: 0,
      skipped: 0,
      errors: ["Checkpoint date is in the past; alerts skipped"],
    };
  }

  const subscribers = await listAlertSubscribers();
  if (subscribers.error) {
    return { notified: 0, skipped: 0, errors: [subscribers.error] };
  }

  const needsZipGeocode = subscribers.data.some((s) => s.zip_code?.trim());
  const checkpointCoords = needsZipGeocode
    ? await getCheckpointCoords(checkpoint)
    : null;

  if (needsZipGeocode && !checkpointCoords) {
    const onlyLocationSelect = subscribers.data.every(
      (s) => subscriberHasLocationConfig(s) && !s.zip_code?.trim(),
    );
    if (!onlyLocationSelect) {
      errors.push(
        "Could not resolve checkpoint map location for zip-based alerts",
      );
    }
  }

  for (const subscriber of subscribers.data) {
    if (
      !subscriber.alerts_enabled ||
      !subscriber.email_notifications ||
      !subscriber.email?.trim()
    ) {
      skipped += 1;
      continue;
    }

    if (subscriber.notify_new_checkpoints === false) {
      skipped += 1;
      continue;
    }

    if (!subscriberHasLocationConfig(subscriber)) {
      skipped += 1;
      continue;
    }

    const alreadySent = await hasAlertNotificationBeenSent({
      userId: subscriber.user_id,
      checkpointId: checkpoint.id,
      alertType: "new_checkpoint",
    });

    if (alreadySent) {
      skipped += 1;
      continue;
    }

    const match = await resolveSubscriberLocationMatch(
      subscriber,
      checkpoint,
      checkpointCoords,
    );

    if (!match.matched || !match.matchType) {
      skipped += 1;
      continue;
    }

    const result = await sendCheckpointAlertEmail({
      to: subscriber.email.trim(),
      userName: subscriber.display_name?.trim() || "there",
      checkpoint,
      leadTimeHours: subscriber.alert_lead_time_hours,
      matchType: match.matchType,
      distanceMiles: match.distanceMiles,
      kind: "new_checkpoint",
    });

    if (result.sent) {
      await recordAlertNotificationSent({
        userId: subscriber.user_id,
        checkpointId: checkpoint.id,
        alertType: "new_checkpoint",
      });
      notified += 1;
    } else {
      errors.push(
        `${subscriber.email}: ${result.error ?? "send failed"}`,
      );
    }
  }

  return { notified, skipped, errors };
}
