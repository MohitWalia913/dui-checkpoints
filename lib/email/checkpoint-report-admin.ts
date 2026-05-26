import { isAnonymousReporterEmail } from "@/lib/checkpoints/report";
import type { CheckpointReport } from "@/lib/checkpoints/types";
import { getSiteUrl } from "@/lib/email/brand";
import {
  buildBrandedEmailHtml,
  buildBrandedEmailText,
  escapeHtml,
} from "@/lib/email/email-layout";
import { parseAdminEmails, sendResendEmail } from "@/lib/email/resend-client";

export async function sendCheckpointReportAdminEmail(
  report: CheckpointReport,
): Promise<{ sent: boolean; error: string | null }> {
  const headline = "New checkpoint report";
  const subject = `New checkpoint report #${report.id} — ${report.City}, ${report.County}`;
  const reviewUrl = `${getSiteUrl()}/dashboard/report`;

  const introHtml = `<p style="margin:0;">A user submitted a checkpoint for review. Reply to this email goes to the reporter.</p>`;

  const html = buildBrandedEmailHtml({
    preheader: `${report.City}, ${report.County} — pending review`,
    headline,
    introHtml,
    detailRows: [
      { label: "Report ID", value: String(report.id) },
      {
        label: "Reporter",
        value: `${report.reporter_name} (${report.reporter_email})`,
      },
      { label: "State", value: report.State },
      { label: "County", value: report.County },
      { label: "City", value: report.City },
      { label: "Location", value: report.Location },
      { label: "Date", value: report.Date },
      { label: "Time", value: report.Time },
      { label: "Description", value: report.Description },
      { label: "Source", value: report.Source ?? "—" },
      { label: "Map URL", value: report.mapurl ?? "—" },
      { label: "Status", value: report.status },
    ],
    cta: { label: "Review in dashboard", href: reviewUrl },
    footerNote: "Admin notification — pending reports queue.",
  });

  const text = buildBrandedEmailText({
    headline,
    lines: [
      `Report ID: ${report.id}`,
      `Reporter: ${report.reporter_name} (${report.reporter_email})`,
      `State: ${report.State}`,
      `County: ${report.County}`,
      `City: ${report.City}`,
      `Location: ${report.Location}`,
      `Date: ${report.Date}`,
      `Time: ${report.Time}`,
      `Description: ${report.Description}`,
      `Source: ${report.Source ?? "—"}`,
      `Map URL: ${report.mapurl ?? "—"}`,
      `Status: ${report.status}`,
    ],
    cta: { label: "Review in dashboard", href: reviewUrl },
  });

  const result = await sendResendEmail({
    to: parseAdminEmails(),
    subject,
    html,
    text,
    replyTo: isAnonymousReporterEmail(report.reporter_email)
      ? undefined
      : report.reporter_email,
  });

  if (!result.sent) {
    console.warn(
      "[checkpoint-report] Admin notification skipped:",
      result.error ?? "unknown",
    );
  }

  return result;
}
