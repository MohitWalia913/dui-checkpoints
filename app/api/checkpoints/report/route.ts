import { sendCheckpointReportAdminEmail } from "@/lib/email/checkpoint-report-admin";
import { createCheckpointReport } from "@/lib/checkpoints/repository";
import {
  REPORT_CHECKPOINT_REQUIRED,
  type ReportCheckpointBody,
} from "@/lib/checkpoints/report";
import type { CheckpointReportInsert } from "@/lib/checkpoints/types";
import { NextRequest, NextResponse } from "next/server";

function toReportInsert(body: ReportCheckpointBody): CheckpointReportInsert {
  const sourceUrl = body.Source?.trim() ?? "";
  const reporterEmail = String(body.reporterEmail).trim();

  return {
    reporter_name: String(body.reporterName).trim(),
    reporter_email: reporterEmail,
    State: String(body.State).trim(),
    County: String(body.County).trim(),
    City: String(body.City).trim(),
    Location: String(body.Location).trim(),
    Description: String(body.Description).trim(),
    Date: String(body.Date).trim(),
    Time: String(body.Time).trim(),
    Source: sourceUrl || `User report — ${reporterEmail}`,
    mapurl: body.mapurl?.trim() || null,
  };
}

export async function POST(request: NextRequest) {
  let body: ReportCheckpointBody;
  try {
    body = (await request.json()) as ReportCheckpointBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  for (const field of REPORT_CHECKPOINT_REQUIRED) {
    if (!body[field] || String(body[field]).trim() === "") {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 },
      );
    }
  }

  const result = await createCheckpointReport(toReportInsert(body));

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  if (result.data) {
    const emailResult = await sendCheckpointReportAdminEmail(result.data);
    if (!emailResult.sent) {
      console.warn(
        "[checkpoint-report] Report saved but admin email was not sent:",
        emailResult.error,
      );
    }
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}
