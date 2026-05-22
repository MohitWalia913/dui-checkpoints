import type { CheckpointReport } from "@/lib/checkpoints/types";

const RESEND_API_URL = "https://api.resend.com/emails";

export const CHECKPOINT_REPORT_ADMIN_EMAIL =
  process.env.CHECKPOINT_REPORT_ADMIN_EMAIL?.trim() || "mohit@webds.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailHtml(report: CheckpointReport): string {
  const rows: [string, string][] = [
    ["Report ID", String(report.id)],
    ["Reporter", `${report.reporter_name} (${report.reporter_email})`],
    ["State", report.State],
    ["County", report.County],
    ["City", report.City],
    ["Location", report.Location],
    ["Date", report.Date],
    ["Time", report.Time],
    ["Description", report.Description],
    ["Source", report.Source ?? "—"],
    ["Map URL", report.mapurl ?? "—"],
    ["Status", report.status],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#040f20;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;font-family:Inter,Arial,sans-serif;background:#f5f6f8;color:#040f20;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:24px;border:1px solid #e5e7eb;">
      <h1 style="margin:0 0 8px;font-size:20px;color:#040f20;">New checkpoint report</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#5c6573;">A user submitted a checkpoint for review. Details are below.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${tableRows}</table>
      <p style="margin:20px 0 0;font-size:12px;color:#97979d;">DUI Checkpoints Locator — pending reports queue</p>
    </div>
  </body>
</html>`;
}

function buildEmailText(report: CheckpointReport): string {
  return [
    "New checkpoint report — pending review",
    "",
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
  ].join("\n");
}

export async function sendCheckpointReportAdminEmail(
  report: CheckpointReport,
): Promise<{ sent: boolean; error: string | null }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[checkpoint-report] RESEND_API_KEY is not set; admin notification email skipped.",
    );
    return { sent: false, error: "Email not configured" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "DUI Checkpoints Locator <onboarding@resend.dev>";

  const subject = `New checkpoint report #${report.id} — ${report.City}, ${report.County}`;

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [CHECKPOINT_REPORT_ADMIN_EMAIL],
        subject,
        html: buildEmailHtml(report),
        text: buildEmailText(report),
        reply_to: report.reporter_email,
      }),
    });

    const json = (await response.json().catch(() => ({}))) as {
      message?: string;
      id?: string;
    };

    if (!response.ok) {
      const message =
        json.message ?? `Resend API error (${response.status})`;
      console.error("[checkpoint-report] Admin email failed:", message);
      return { sent: false, error: message };
    }

    return { sent: true, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send admin email";
    console.error("[checkpoint-report] Admin email failed:", message);
    return { sent: false, error: message };
  }
}
