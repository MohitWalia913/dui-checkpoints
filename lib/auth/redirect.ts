const DEFAULT_POST_AUTH_PATH = "/dashboard";

/** OAuth callback path — add this URL in Supabase Auth → Redirect URLs for each environment. */
export function getAuthCallbackPath(next = DEFAULT_POST_AUTH_PATH): string {
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : DEFAULT_POST_AUTH_PATH;
  return `/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

/** Full redirect URL for signInWithOAuth (uses current origin: localhost, staging, or production). */
export function getOAuthRedirectTo(next = DEFAULT_POST_AUTH_PATH): string {
  if (typeof window === "undefined") {
    return getAuthCallbackPath(next);
  }
  return `${window.location.origin}${getAuthCallbackPath(next)}`;
}
