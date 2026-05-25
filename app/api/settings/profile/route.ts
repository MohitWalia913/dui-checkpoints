import { requireApiUser } from "@/lib/api/auth";
import { buildProfileSettingsData } from "@/lib/dashboard/profile-settings";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  return NextResponse.json({
    data: buildProfileSettingsData(auth.user),
  });
}
