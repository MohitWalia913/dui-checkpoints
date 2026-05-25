import { formatCheckpointDate } from "@/lib/checkpoints/date";
import type { Checkpoint } from "@/lib/checkpoints/types";
import { hoursUntilCheckpointDate } from "@/lib/alerts/checkpoint-timing";
import {
  buildBrandedEmailHtml,
  buildBrandedEmailText,
  escapeHtml,
} from "@/lib/email/email-layout";
import { getDashboardMapUrl } from "@/lib/email/brand";
import { sendResendEmail } from "@/lib/email/resend-client";

export type CheckpointAlertEmailKind = "new_checkpoint" | "upcoming_reminder";

function matchReasonText(
  matchType: "zip" | "county" | "city",
  location: string,
  distanceMiles: number | null,
): string {
  if (matchType === "zip" && distanceMiles != null) {
    return `A checkpoint was added within about ${Math.round(distanceMiles)} miles of your zip code.`;
  }
  if (matchType === "city") {
    return `A checkpoint in <strong>${escapeHtml(location)}</strong> matches a city you follow.`;
  }
  return `A checkpoint in <strong>${escapeHtml(location)}</strong> matches a county you follow.`;
}

function formatHoursUntilLabel(dateStr: string): string | null {
  const hours = hoursUntilCheckpointDate(dateStr);
  if (hours === null || hours <= 0) return null;
  if (hours < 1) return "less than 1 hour";
  if (hours < 24) return `about ${Math.round(hours)} hour${Math.round(hours) === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `about ${days} day${days === 1 ? "" : "s"}`;
}

export async function sendCheckpointAlertEmail(params: {
  to: string;
  userName: string;
  checkpoint: Checkpoint;
  leadTimeHours: number;
  matchType: "zip" | "county" | "city";
  distanceMiles: number | null;
  kind: CheckpointAlertEmailKind;
}): Promise<{ sent: boolean; error: string | null }> {
  const {
    checkpoint,
    leadTimeHours,
    userName,
    to,
    matchType,
    distanceMiles,
    kind,
  } = params;

  const location = `${checkpoint.City}, ${checkpoint.County}`;
  const dateLabel = formatCheckpointDate(checkpoint.Date);
  const hoursLabel = formatHoursUntilLabel(checkpoint.Date);
  const safeName = escapeHtml(userName);

  const isNew = kind === "new_checkpoint";
  const headline = isNew
    ? "New checkpoint in your area"
    : "Upcoming checkpoint reminder";

  const subject = isNew
    ? `New DUI checkpoint — ${checkpoint.City}, ${checkpoint.County}`
    : `Upcoming DUI checkpoint — ${checkpoint.City} (${hoursLabel ?? "soon"})`;

  const introHtml = isNew
    ? `<p style="margin:0 0 12px;">Hi ${safeName},</p>
<p style="margin:0;">${matchReasonText(matchType, location, distanceMiles)} You are receiving this because a new upcoming checkpoint was just added to the map.</p>`
    : `<p style="margin:0 0 12px;">Hi ${safeName},</p>
<p style="margin:0;">${matchReasonText(matchType, location, distanceMiles)} This checkpoint is scheduled ${hoursLabel ? `in <strong>${escapeHtml(hoursLabel)}</strong>` : "soon"} — within your <strong>${leadTimeHours}-hour</strong> alert window.</p>`;

  const calloutHtml = isNew
    ? "Tip: You can narrow alerts to specific cities or counties in Alert settings."
    : `This reminder was sent because the checkpoint date is within your ${leadTimeHours}-hour upcoming alert window.`;

  const html = buildBrandedEmailHtml({
    preheader: `${checkpoint.Location} — ${dateLabel} ${checkpoint.Time}`,
    headline,
    introHtml,
    calloutHtml,
    detailRows: [
      { label: "Location", value: checkpoint.Location },
      { label: "Area", value: location },
      { label: "Date", value: dateLabel },
      { label: "Time", value: checkpoint.Time },
      ...(checkpoint.Source?.trim()
        ? [{ label: "Source", value: checkpoint.Source.trim() }]
        : []),
    ],
    cta: { label: "View on map", href: getDashboardMapUrl() },
    footerNote:
      "Manage counties, cities, zip code, and alert windows in Alert settings.",
  });

  const textLines = [
    `Hi ${userName},`,
    "",
    isNew
      ? "A new upcoming DUI checkpoint matches your alert areas."
      : `Upcoming DUI checkpoint within your ${leadTimeHours}-hour alert window.`,
    "",
    `Location: ${checkpoint.Location}`,
    `Area: ${location}`,
    `Date: ${dateLabel}`,
    `Time: ${checkpoint.Time}`,
  ];

  if (matchType === "zip" && distanceMiles != null) {
    textLines.push(`About ${Math.round(distanceMiles)} miles from your zip code.`);
  }

  const text = buildBrandedEmailText({
    headline,
    lines: textLines,
    cta: { label: "View on map", href: getDashboardMapUrl() },
    footerNote: "Manage alerts in Dashboard → Settings → Alert settings.",
  });

  return sendResendEmail({ to, subject, html, text });
}

/** @deprecated Use sendCheckpointAlertEmail — kept for existing imports */
export async function sendCheckpointProximityAlertEmail(params: {
  to: string;
  userName: string;
  checkpoint: Checkpoint;
  leadTimeHours: number;
  matchType: "zip" | "county" | "city";
  distanceMiles: number | null;
  immediate?: boolean;
}): Promise<{ sent: boolean; error: string | null }> {
  return sendCheckpointAlertEmail({
    ...params,
    kind: params.immediate === false ? "upcoming_reminder" : "new_checkpoint",
  });
}
