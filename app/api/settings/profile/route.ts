import { requireApiUser } from "@/lib/api/auth";
import { buildProfileSettingsData } from "@/lib/dashboard/profile-settings";
import type { ProfileSettingsInput } from "@/lib/dashboard/settings-types";
import { NextRequest, NextResponse } from "next/server";

function parseBody(body: unknown): ProfileSettingsInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  if (typeof b.address !== "string" || typeof b.zipCode !== "string") {
    return null;
  }

  return {
    address: b.address,
    zipCode: b.zipCode,
  };
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
      { error: "Invalid profile settings payload" },
      { status: 400 },
    );
  }

  const existingMeta =
    auth.user.user_metadata &&
    typeof auth.user.user_metadata === "object" &&
    !Array.isArray(auth.user.user_metadata)
      ? auth.user.user_metadata
      : {};

  const { data, error } = await auth.supabase.auth.updateUser({
    data: {
      ...existingMeta,
      address: input.address.trim(),
      zip_code: input.zipCode.trim(),
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
  }

  return NextResponse.json({
    data: buildProfileSettingsData(data.user),
  });
}
