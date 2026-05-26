/** Footer disclaimer — override with NEXT_PUBLIC_FOOTER_DISCLAIMER in .env */
const DEFAULT_FOOTER_DISCLAIMER =
  "The information on this website and app is for general informational and advertising purposes only. It is not legal advice and does not create an attorney-client relationship. Checkpoint locations, dates, and times are compiled from public sources and user reports and may be inaccurate or outdated. Choosing an attorney is an important decision and should not be based on advertising alone. Contact a qualified attorney for advice about your situation.";

export function getFooterDisclaimer(): string {
  const fromEnv = process.env.NEXT_PUBLIC_FOOTER_DISCLAIMER?.trim();
  return fromEnv || DEFAULT_FOOTER_DISCLAIMER;
}
