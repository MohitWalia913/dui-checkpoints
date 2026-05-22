import { requireApiUser } from "@/lib/api/auth";
import {
  deleteCheckpoint,
  getCheckpointById,
  updateCheckpoint,
} from "@/lib/checkpoints/repository";
import type { CheckpointUpdate } from "@/lib/checkpoints/types";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid checkpoint id" }, { status: 400 });
  }

  const result = await getCheckpointById(id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  if (!result.data) {
    return NextResponse.json({ error: "Checkpoint not found" }, { status: 404 });
  }

  return NextResponse.json({ data: result.data });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid checkpoint id" }, { status: 400 });
  }

  let body: CheckpointUpdate;
  try {
    body = (await request.json()) as CheckpointUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await updateCheckpoint(id, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  if (!result.data) {
    return NextResponse.json({ error: "Checkpoint not found" }, { status: 404 });
  }

  return NextResponse.json({ data: result.data });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid checkpoint id" }, { status: 400 });
  }

  const result = await deleteCheckpoint(id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
