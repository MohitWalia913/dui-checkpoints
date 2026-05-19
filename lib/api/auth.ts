import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function requireApiUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return {
      supabase,
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { supabase, user: data.claims, response: null };
}
