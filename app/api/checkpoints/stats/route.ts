import { requireApiUser } from "@/lib/api/auth";
import { getCheckpointStats } from "@/lib/checkpoints/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const result = await getCheckpointStats();

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
