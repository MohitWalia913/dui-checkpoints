import { isUpcomingWithinLeadTime } from "@/lib/alerts/checkpoint-timing";
import {
  getCheckpointCoords,
  resetCheckpointCoordsCache,
  resolveSubscriberLocationMatch,
  subscriberHasLocationConfig,
} from "@/lib/alerts/location-match";
import { sendCheckpointProximityAlertEmail } from "@/lib/email/checkpoint-proximity-alert";
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
      errors: ["Checkpoint date is in the past; proximity alerts skipped"],
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
    const onlyCityCounty = subscribers.data.every(
      (s) =>
        s.use_city_county_alerts &&
        s.alert_city?.trim() &&
        s.alert_county?.trim() &&
        !s.zip_code?.trim(),
    );
    if (!onlyCityCounty) {
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

    if (!subscriberHasLocationConfig(subscriber)) {
      skipped += 1;
      continue;
    }

    if (
      !isUpcomingWithinLeadTime(
        checkpoint.Date,
        subscriber.alert_lead_time_hours,
      )
    ) {
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

    const result = await sendCheckpointProximityAlertEmail({
      to: subscriber.email.trim(),
      userName: subscriber.display_name?.trim() || "there",
      checkpoint,
      leadTimeHours: subscriber.alert_lead_time_hours,
      matchType: match.matchType,
      distanceMiles: match.distanceMiles,
    });

    if (result.sent) {
      notified += 1;
    } else {
      errors.push(
        `${subscriber.email}: ${result.error ?? "send failed"}`,
      );
    }
  }

  return { notified, skipped, errors };
}
