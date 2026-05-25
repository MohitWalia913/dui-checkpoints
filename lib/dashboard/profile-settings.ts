import type { User } from "@supabase/supabase-js";
import type { ProfileSettingsData } from "@/lib/dashboard/settings-types";

function formatAccountTimestamp(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type UserMetadata = {
  full_name?: string;
  name?: string;
};

function resolveDisplayName(meta: UserMetadata, email: string): string {
  const fromMeta = meta.full_name ?? meta.name;
  if (fromMeta && String(fromMeta).trim()) return String(fromMeta).trim();
  return email.split("@")[0] || "User";
}

function resolveSignInMethod(user: User): string {
  const provider = user.app_metadata?.provider as string | undefined;
  if (provider === "google") return "Google";
  if (provider === "email") return "Email";
  if (provider) return provider.charAt(0).toUpperCase() + provider.slice(1);
  return user.identities?.[0]?.provider
    ? String(user.identities[0].provider).charAt(0).toUpperCase() +
        String(user.identities[0].provider).slice(1)
    : "—";
}

export function buildProfileSettingsData(user: User): ProfileSettingsData {
  const meta = (user.user_metadata ?? {}) as UserMetadata;
  const email = user.email ?? "";

  return {
    displayName: resolveDisplayName(meta, email),
    email,
    signInMethod: resolveSignInMethod(user),
    accountCreated: formatAccountTimestamp(user.created_at),
    lastSignIn: formatAccountTimestamp(user.last_sign_in_at),
  };
}
