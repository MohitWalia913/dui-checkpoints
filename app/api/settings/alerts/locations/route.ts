import { requireApiUser } from "@/lib/api/auth";
import { fetchAlertLocationCatalog } from "@/lib/alerts/location-catalog";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const result = await fetchAlertLocationCatalog();

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
