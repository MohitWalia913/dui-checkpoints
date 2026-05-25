import { NextResponse } from "next/server";

export function verifyCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export function cronUnauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function cronNotConfiguredResponse() {
  return NextResponse.json(
    { error: "CRON_SECRET is not configured" },
    { status: 503 },
  );
}
