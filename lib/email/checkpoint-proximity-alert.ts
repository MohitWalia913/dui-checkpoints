import { sendResendEmail } from "@/lib/email/resend-client";
import { formatCheckpointDate } from "@/lib/checkpoints/date";
import type { Checkpoint } from "@/lib/checkpoints/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendCheckpointProximityAlertEmail(params: {
  to: string;
  userName: string;
  checkpoint: Checkpoint;
  distanceMiles: number;
  leadTimeHours: number;
}): Promise<{ sent: boolean; error: string | null }> {
  const { checkpoint, distanceMiles, leadTimeHours, userName, to } = params;
  const location = `${checkpoint.City}, ${checkpoint.County}`;
  const dateLabel = formatCheckpointDate(checkpoint.Date);

  const subject = `Upcoming DUI checkpoint near you — ${checkpoint.City}`;

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;font-family:Inter,Arial,sans-serif;background:#f5f6f8;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:24px;border:1px solid #e5e7eb;">
      <h1 style="margin:0 0 8px;font-size:20px;color:#040f20;">Checkpoint alert</h1>
      <p style="margin:0 0 16px;font-size:14px;color:#5c6573;">Hi ${escapeHtml(userName)}, a DUI checkpoint was added within about ${Math.round(distanceMiles)} miles of your zip code and is scheduled within your ${leadTimeHours}-hour alert window.</p>
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#5c6573;">Location</td><td style="padding:6px 0;font-weight:600;color:#040f20;">${escapeHtml(checkpoint.Location)}</td></tr>
        <tr><td style="padding:6px 0;color:#5c6573;">Area</td><td style="padding:6px 0;color:#040f20;">${escapeHtml(location)}</td></tr>
        <tr><td style="padding:6px 0;color:#5c6573;">Date</td><td style="padding:6px 0;color:#040f20;">${escapeHtml(dateLabel)}</td></tr>
        <tr><td style="padding:6px 0;color:#5c6573;">Time</td><td style="padding:6px 0;color:#040f20;">${escapeHtml(checkpoint.Time)}</td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:#97979d;">Manage alerts in Settings → Alert settings on DUI Checkpoints Locator.</p>
    </div>
  </body>
</html>`;

  const text = [
    `Hi ${userName},`,
    "",
    `A DUI checkpoint was added near your area (about ${Math.round(distanceMiles)} miles).`,
    "",
    `Location: ${checkpoint.Location}`,
    `Area: ${location}`,
    `Date: ${dateLabel}`,
    `Time: ${checkpoint.Time}`,
    "",
    `You received this because your alert window is set to ${leadTimeHours} hours before upcoming checkpoints.`,
  ].join("\n");

  return sendResendEmail({ to, subject, html, text });
}
