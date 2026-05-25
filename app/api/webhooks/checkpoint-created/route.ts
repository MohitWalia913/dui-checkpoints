import { notifyNearbyUsersOfNewCheckpoint } from "@/lib/alerts/notify-nearby-users";
import type { Checkpoint } from "@/lib/checkpoints/types";
import { NextRequest, NextResponse } from "next/server";

function parseCheckpointRecord(body: unknown): Checkpoint | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const record =
    b.record && typeof b.record === "object"
      ? (b.record as Record<string, unknown>)
      : b;

  const required = [
    "id",
    "Location",
    "City",
    "County",
    "State",
    "Date",
    "Time",
  ] as const;

  for (const key of required) {
    if (record[key] === undefined || record[key] === null) return null;
  }

  return record as unknown as Checkpoint;
}

export async function POST(request: NextRequest) {
  const secret = process.env.CHECKPOINT_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook is not configured" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const checkpoint = parseCheckpointRecord(body);
  if (!checkpoint) {
    return NextResponse.json(
      { error: "Missing checkpoint record in body" },
      { status: 400 },
    );
  }

  const result = await notifyNearbyUsersOfNewCheckpoint(checkpoint);

  return NextResponse.json({
    ok: true,
    notified: result.notified,
    skipped: result.skipped,
    errors: result.errors,
  });
}
