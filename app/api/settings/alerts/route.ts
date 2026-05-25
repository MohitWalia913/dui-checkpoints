import { requireApiUser } from "@/lib/api/auth";
import {
  getUserAlertSettings,
  upsertUserAlertSettings,
} from "@/lib/dashboard/alert-settings-repository";
import type { UserAlertSettingsInput } from "@/lib/dashboard/alert-settings-types";
import { NextRequest, NextResponse } from "next/server";

function parseBody(body: unknown): UserAlertSettingsInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const lead = Number(b.alert_lead_time_hours);
  if (!Number.isFinite(lead) || lead < 1 || lead > 168) return null;

  return {
    alerts_enabled: Boolean(b.alerts_enabled),
    email_notifications: Boolean(b.email_notifications),
    preferred_counties:
      typeof b.preferred_counties === "string" ? b.preferred_counties : "",
    alert_lead_time_hours: Math.round(lead),
    additional_notes:
      typeof b.additional_notes === "string" ? b.additional_notes : "",
  };
}

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const result = await getUserAlertSettings(auth.user.id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = parseBody(body);
  if (!input) {
    return NextResponse.json(
      { error: "Invalid alert settings payload" },
      { status: 400 },
    );
  }

  const result = await upsertUserAlertSettings(auth.user.id, input);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
