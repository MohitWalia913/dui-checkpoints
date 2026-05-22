import { isCheckpointReportModerator } from "@/lib/auth/admin";
import { requireApiUser } from "@/lib/api/auth";
import { listCheckpointReports } from "@/lib/checkpoints/repository";
import type { CheckpointReportStatus } from "@/lib/checkpoints/types";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES: CheckpointReportStatus[] = [
  "pending",
  "approved",
  "rejected",
];

export async function GET(request: NextRequest) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  if (!isCheckpointReportModerator(auth.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const statusParam = request.nextUrl.searchParams.get("status");
  const status =
    statusParam && VALID_STATUSES.includes(statusParam as CheckpointReportStatus)
      ? (statusParam as CheckpointReportStatus)
      : undefined;

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "100");
  const result = await listCheckpointReports({
    status,
    limit: Number.isFinite(limit) ? limit : 100,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
