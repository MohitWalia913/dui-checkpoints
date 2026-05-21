import { createCheckpoint } from "@/lib/checkpoints/repository";
import type { CheckpointInsert } from "@/lib/checkpoints/types";
import { NextRequest, NextResponse } from "next/server";

type ReportCheckpointBody = {
  reporterName?: string;
  reporterEmail?: string;
  State?: string;
  County?: string;
  City?: string;
  Location?: string;
  Description?: string;
  Date?: string;
  Time?: string;
  Source?: string;
  mapurl?: string;
};

const REQUIRED: (keyof ReportCheckpointBody)[] = [
  "reporterName",
  "reporterEmail",
  "State",
  "County",
  "City",
  "Location",
  "Description",
  "Date",
  "Time",
];

export async function POST(request: NextRequest) {
  let body: ReportCheckpointBody;
  try {
    body = (await request.json()) as ReportCheckpointBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  for (const field of REQUIRED) {
    if (!body[field] || String(body[field]).trim() === "") {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 },
      );
    }
  }

  const reporterName = String(body.reporterName).trim();
  const reporterEmail = String(body.reporterEmail).trim();
  const description = String(body.Description).trim();
  const sourceUrl = body.Source?.trim() ?? "";

  const payload: CheckpointInsert = {
    State: String(body.State).trim(),
    County: String(body.County).trim(),
    City: String(body.City).trim(),
    Location: String(body.Location).trim(),
    Description: `${description}\n\nReported by: ${reporterName} (${reporterEmail})`,
    Date: String(body.Date).trim(),
    Time: String(body.Time).trim(),
    Source: sourceUrl || `User report — ${reporterEmail}`,
    mapurl: body.mapurl?.trim() || null,
    location_id: null,
  };

  const result = await createCheckpoint(payload);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}
