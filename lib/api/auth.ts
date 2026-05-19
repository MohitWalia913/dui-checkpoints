import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function requireApiUser() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  const hasClaims = !claimsError && claimsData?.claims;
  const hasSession = !sessionError && sessionData?.session;

  if (!hasClaims && !hasSession) {
    return {
      supabase,
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    supabase,
    user: claimsData?.claims ?? sessionData?.session?.user ?? null,
    response: null,
  };
}
