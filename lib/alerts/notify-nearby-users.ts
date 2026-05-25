import { geocodeCheckpoint, geocodeUsZip } from "@/lib/alerts/geocode";
import { haversineMiles } from "@/lib/alerts/distance";
import { isUpcomingWithinLeadTime } from "@/lib/alerts/checkpoint-timing";
import { sendCheckpointProximityAlertEmail } from "@/lib/email/checkpoint-proximity-alert";
import { listAlertSubscribers } from "@/lib/dashboard/alert-settings-repository";
import { getTodayDateString } from "@/lib/checkpoints/date";
import type { Checkpoint } from "@/lib/checkpoints/types";

const DEFAULT_RADIUS_MILES = 40;

function getAlertRadiusMiles(): number {
  const parsed = Number(process.env.CHECKPOINT_ALERT_RADIUS_MILES);
  if (Number.isFinite(parsed) && parsed > 0 && parsed <= 200) {
    return parsed;
  }
  return DEFAULT_RADIUS_MILES;
}

export async function notifyNearbyUsersOfNewCheckpoint(
  checkpoint: Checkpoint,
): Promise<{ notified: number; skipped: number; errors: string[] }> {
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

  const checkpointCoords = await geocodeCheckpoint(checkpoint);
  if (!checkpointCoords) {
    return {
      notified: 0,
      skipped: 0,
      errors: ["Could not resolve checkpoint location for proximity matching"],
    };
  }

  const radiusMiles = getAlertRadiusMiles();
  const subscribers = await listAlertSubscribers();

  if (subscribers.error) {
    return { notified: 0, skipped: 0, errors: [subscribers.error] };
  }

  for (const subscriber of subscribers.data) {
    if (
      !subscriber.alerts_enabled ||
      !subscriber.email_notifications ||
      !subscriber.email?.trim() ||
      !subscriber.zip_code?.trim()
    ) {
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

    const userCoords = await geocodeUsZip(subscriber.zip_code);
    if (!userCoords) {
      skipped += 1;
      continue;
    }

    const preferred = subscriber.preferred_counties?.trim();
    if (preferred) {
      const counties = preferred
        .split(/[,;]/)
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);
      const checkpointCounty = checkpoint.County.trim().toLowerCase();
      const matches = counties.some(
        (c) =>
          checkpointCounty.includes(c) ||
          c.includes(checkpointCounty.replace(/\s+county$/i, "")),
      );
      if (!matches) {
        skipped += 1;
        continue;
      }
    }

    const distance = haversineMiles(userCoords, checkpointCoords);
    if (distance > radiusMiles) {
      skipped += 1;
      continue;
    }

    const result = await sendCheckpointProximityAlertEmail({
      to: subscriber.email.trim(),
      userName: subscriber.display_name?.trim() || "there",
      checkpoint,
      distanceMiles: distance,
      leadTimeHours: subscriber.alert_lead_time_hours,
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
