import type { User } from "@supabase/supabase-js";

export type AlertContactFields = {
  email: string | null;
  zip_code: string | null;
  display_name: string | null;
};

export function alertContactFromUser(user: User): AlertContactFields {
  const meta =
    user.user_metadata &&
    typeof user.user_metadata === "object" &&
    !Array.isArray(user.user_metadata)
      ? (user.user_metadata as Record<string, unknown>)
      : {};

  const email = user.email?.trim() || null;
  const zip =
    typeof meta.zip_code === "string" ? meta.zip_code.trim() || null : null;
  const display =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    (email ? email.split("@")[0] : null);

  return {
    email,
    zip_code: zip,
    display_name: display,
  };
}
