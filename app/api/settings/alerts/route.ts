import { requireApiUser } from "@/lib/api/auth";
import { alertContactFromUser } from "@/lib/dashboard/alert-contact";
import {
  getUserAlertSettings,
  upsertUserAlertSettings,
} from "@/lib/dashboard/alert-settings-repository";
import {
  parseAlertLeadTimeHours,
  parseCitySelectionsInput,
  serializeSelectedCities,
  validateAlertSettingsInput,
  type UserAlertSettingsInput,
} from "@/lib/dashboard/alert-settings-types";
import { NextRequest, NextResponse } from "next/server";

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBody(body: unknown): UserAlertSettingsInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const leadTime = parseAlertLeadTimeHours(b.alert_lead_time_hours);
  if (leadTime === null) return null;

  return {
    alerts_enabled: Boolean(b.alerts_enabled),
    email_notifications: Boolean(b.email_notifications),
    alert_lead_time_hours: leadTime,
    zip_code: typeof b.zip_code === "string" ? b.zip_code : "",
    selected_counties: parseStringArray(b.selected_counties),
    selected_cities: serializeSelectedCities(
      parseCitySelectionsInput(b.selected_cities),
    ),
    notify_new_checkpoints: b.notify_new_checkpoints !== false,
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

  const validationError = validateAlertSettingsInput(input);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const contact = alertContactFromUser(auth.user);
  const zipFromInput = input.zip_code.trim();
  const contactWithZip = {
    ...contact,
    zip_code: zipFromInput || contact.zip_code,
  };

  const result = await upsertUserAlertSettings(
    auth.user.id,
    input,
    contactWithZip,
  );

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  if (zipFromInput) {
    const existingMeta =
      auth.user.user_metadata &&
      typeof auth.user.user_metadata === "object" &&
      !Array.isArray(auth.user.user_metadata)
        ? auth.user.user_metadata
        : {};
    await auth.supabase.auth.updateUser({
      data: { ...existingMeta, zip_code: zipFromInput },
    });
  }

  return NextResponse.json({ data: result.data });
}
