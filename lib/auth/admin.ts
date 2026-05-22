/** Comma-separated emails allowed to moderate reports; empty = any logged-in user. */
export function isCheckpointReportModerator(email: string | undefined): boolean {
  const allowlist = process.env.CHECKPOINT_REPORT_ADMIN_EMAILS?.trim();
  if (!allowlist) return Boolean(email);
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return allowlist
    .split(",")
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean)
    .includes(normalized);
}
