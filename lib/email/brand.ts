/** Brand tokens aligned with the DUI Checkpoints Locator site (#040F20 / #F57E3A). */
export const EMAIL_BRAND = {
  name: "DUI Checkpoints Locator",
  tagline: "California DUI checkpoint map & alerts",
  primary: "#F57E3A",
  primaryDark: "#d96a2e",
  navy: "#040F20",
  navyMuted: "#0a1628",
  text: "#040f20",
  muted: "#5c6573",
  faint: "#97979d",
  border: "#e5e7eb",
  surface: "#ffffff",
  background: "#eef1f5",
} as const;

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/\/$/, "")}`;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "https://californiaduicheckpoints.com";
}

/** Public asset used in the site header and transactional emails. */
export function getEmailLogoUrl(): string {
  return `${getSiteUrl()}/browser.png`;
}

export function getDashboardMapUrl(): string {
  return `${getSiteUrl()}/dashboard/map`;
}

export function getAlertSettingsUrl(): string {
  return `${getSiteUrl()}/dashboard/settings`;
}
