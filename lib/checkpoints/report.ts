import type { User } from "@supabase/supabase-js";

export type ReportCheckpointBody = {
  State: string;
  County: string;
  City: string;
  Location: string;
  Description: string;
  Date: string;
  Time: string;
  Source: string;
};

export const REPORT_CHECKPOINT_REQUIRED: (keyof ReportCheckpointBody)[] = [
  "State",
  "County",
  "Source",
];

export const REPORT_CHECKPOINT_INITIAL: ReportCheckpointBody = {
  State: "California",
  County: "",
  City: "",
  Location: "",
  Description: "",
  Date: "",
  Time: "",
  Source: "",
};

export const REPORT_FIELD_LABELS: Record<keyof ReportCheckpointBody, string> = {
  State: "State",
  County: "County",
  City: "City",
  Location: "Checkpoint location",
  Description: "Description",
  Date: "Date",
  Time: "Time",
  Source: "Source URL",
};

const ANONYMOUS_REPORTER_EMAIL = "noreply@californiaduicheckpoints.com";

export function optionalReportField(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function reporterFromAuthUser(user: User | null): {
  name: string;
  email: string;
} {
  if (!user) {
    return { name: "Anonymous", email: ANONYMOUS_REPORTER_EMAIL };
  }

  const meta =
    user.user_metadata &&
    typeof user.user_metadata === "object" &&
    !Array.isArray(user.user_metadata)
      ? (user.user_metadata as Record<string, unknown>)
      : {};

  const email = user.email?.trim() || ANONYMOUS_REPORTER_EMAIL;
  const fromMeta =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim());

  const name = fromMeta || email.split("@")[0] || "User";

  return { name, email };
}

export function isAnonymousReporterEmail(email: string): boolean {
  return email.trim().toLowerCase() === ANONYMOUS_REPORTER_EMAIL;
}
