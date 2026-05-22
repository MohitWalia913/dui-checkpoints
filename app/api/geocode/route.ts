import { NextRequest, NextResponse } from "next/server";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length > 280) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const url = `${NOMINATIM}?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "DUICheckpointsLocator/1.0 (https://github.com/dui-checkpoints; geocode-on-select)",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Geocoder unavailable" },
      { status: 502 },
    );
  }

  const rows = (await res.json()) as { lat: string; lon: string }[];
  const first = rows[0];
  if (!first) {
    return NextResponse.json({ data: null });
  }

  const lat = parseFloat(first.lat);
  const lng = parseFloat(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({ data: { lat, lng } });
}
