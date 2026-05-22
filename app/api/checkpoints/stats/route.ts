import { requireApiUser } from "@/lib/api/auth";
import { getCheckpointStats } from "@/lib/checkpoints/repository";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireApiUser();
    if (auth.response) return auth.response;

    const result = await getCheckpointStats();

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load checkpoint stats";
    console.error("[api/checkpoints/stats]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
