import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_NEXT = "/dashboard";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_NEXT;
  }
  return next;
}

function redirectTo(request: NextRequest, path: string) {
  const { origin } = request.nextUrl;
  return NextResponse.redirect(`${origin}${path}`);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  const oauthError =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (oauthError) {
    return redirectTo(
      request,
      `/auth/error?error=${encodeURIComponent(oauthError)}`,
    );
  }

  if (!code) {
    return redirectTo(
      request,
      `/auth/error?error=${encodeURIComponent("Missing authorization code")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectTo(
      request,
      `/auth/error?error=${encodeURIComponent(error.message)}`,
    );
  }

  return redirectTo(request, next);
}
