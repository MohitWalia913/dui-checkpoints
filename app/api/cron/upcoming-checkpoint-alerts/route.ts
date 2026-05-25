import { notifyUpcomingCheckpointReminders } from "@/lib/alerts/notify-upcoming-checkpoints";
import {
  cronNotConfiguredResponse,
  cronUnauthorizedResponse,
  verifyCronRequest,
} from "@/lib/api/cron-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET?.trim()) {
    return cronNotConfiguredResponse();
  }

  if (!verifyCronRequest(request)) {
    return cronUnauthorizedResponse();
  }

  const result = await notifyUpcomingCheckpointReminders();

  return NextResponse.json({
    ok: true,
    checkpointsScanned: result.checkpoints,
    notified: result.notified,
    skipped: result.skipped,
    errors: result.errors,
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
