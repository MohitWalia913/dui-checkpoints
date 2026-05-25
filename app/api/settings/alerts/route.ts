import { requireApiUser } from "@/lib/api/auth";
import { alertContactFromUser } from "@/lib/dashboard/alert-contact";
import {
  getUserAlertSettings,
  upsertUserAlertSettings,
} from "@/lib/dashboard/alert-settings-repository";
import {
  parseAlertLeadTimeHours,
  type UserAlertSettingsInput,
} from "@/lib/dashboard/alert-settings-types";
import { NextRequest, NextResponse } from "next/server";

function parseBody(body: unknown): UserAlertSettingsInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const leadTime = parseAlertLeadTimeHours(b.alert_lead_time_hours);
  if (leadTime === null) return null;

  return {
    alerts_enabled: Boolean(b.alerts_enabled),
    email_notifications: Boolean(b.email_notifications),
    preferred_counties:
      typeof b.preferred_counties === "string" ? b.preferred_counties : "",
    alert_lead_time_hours: leadTime,
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

  const result = await upsertUserAlertSettings(
    auth.user.id,
    input,
    alertContactFromUser(auth.user),
  );

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
