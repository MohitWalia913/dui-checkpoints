import { isCheckpointReportModerator } from "@/lib/auth/admin";
import { requireApiUser } from "@/lib/api/auth";
import {
  approveCheckpointReport,
  rejectCheckpointReport,
} from "@/lib/checkpoints/repository";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  if (!isCheckpointReportModerator(auth.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  }

  let body: { action?: string; admin_notes?: string };
  try {
    body = (await request.json()) as { action?: string; admin_notes?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action?.trim();

  if (action === "approve") {
    const result = await approveCheckpointReport(id, auth.user.id);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data) {
      return NextResponse.json(
        { error: "Report could not be approved" },
        { status: 409 },
      );
    }

    return NextResponse.json({
      data: result.data,
      checkpoint: result.checkpoint,
    });
  }

  if (action === "reject") {
    const result = await rejectCheckpointReport(
      id,
      auth.user.id,
      body.admin_notes,
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data) {
      return NextResponse.json(
        { error: "Report could not be rejected" },
        { status: 409 },
      );
    }

    return NextResponse.json({ data: result.data });
  }

  return NextResponse.json(
    { error: 'Invalid action. Use "approve" or "reject".' },
    { status: 400 },
  );
}
