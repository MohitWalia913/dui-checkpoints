import { sendCheckpointReportAdminEmail } from "@/lib/email/checkpoint-report-admin";
import { createCheckpointReport } from "@/lib/checkpoints/repository";
import {
  optionalReportField,
  REPORT_CHECKPOINT_REQUIRED,
  REPORT_FIELD_LABELS,
  reporterFromAuthUser,
  type ReportCheckpointBody,
} from "@/lib/checkpoints/report";
import type { CheckpointReportInsert } from "@/lib/checkpoints/types";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function toReportInsert(
  body: ReportCheckpointBody,
  reporter: { name: string; email: string },
): CheckpointReportInsert {
  return {
    reporter_name: reporter.name,
    reporter_email: reporter.email,
    State: optionalReportField(body.State) || "California",
    County: String(body.County).trim(),
    City: optionalReportField(body.City),
    Location: optionalReportField(body.Location),
    Description: optionalReportField(body.Description),
    Date: optionalReportField(body.Date),
    Time: optionalReportField(body.Time),
    Source: String(body.Source).trim(),
    mapurl: null,
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
        {
          error: `Missing required field: ${REPORT_FIELD_LABELS[field]}`,
        },
        { status: 400 },
      );
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const reporter = reporterFromAuthUser(user);

  const result = await createCheckpointReport(toReportInsert(body, reporter));

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
