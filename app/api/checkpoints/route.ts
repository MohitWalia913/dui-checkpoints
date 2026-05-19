import { requireApiUser } from "@/lib/api/auth";
import {
  createCheckpoint,
  listCheckpoints,
} from "@/lib/checkpoints/repository";
import type { CheckpointInsert } from "@/lib/checkpoints/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { searchParams } = request.nextUrl;

  const upcoming =
    searchParams.get("upcoming") === "true" ||
    searchParams.get("upcoming") === "1";
  const limit = Number(searchParams.get("limit") ?? "50");
  const offset = Number(searchParams.get("offset") ?? "0");

  const result = await listCheckpoints({
    upcoming: upcoming || undefined,
    state: searchParams.get("state") ?? undefined,
    county: searchParams.get("county") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    fromDate: searchParams.get("fromDate") ?? undefined,
    toDate: searchParams.get("toDate") ?? undefined,
    limit: Number.isFinite(limit) ? limit : 50,
    offset: Number.isFinite(offset) ? offset : 0,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    data: result.data,
    meta: { count: result.count, limit, offset },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  let body: CheckpointInsert;
  try {
    body = (await request.json()) as CheckpointInsert;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const required = [
    "State",
    "County",
    "City",
    "Location",
    "Description",
    "Date",
    "Time",
    "Source",
  ] as const;

  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === "") {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 },
      );
    }
  }

  const result = await createCheckpoint(body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}
