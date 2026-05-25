import {
  EMAIL_BRAND,
  getAlertSettingsUrl,
  getDashboardMapUrl,
  getEmailLogoUrl,
  getSiteUrl,
} from "@/lib/email/brand";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type EmailDetailRow = {
  label: string;
  value: string;
};

export type BrandedEmailParams = {
  preheader?: string;
  headline: string;
  introHtml: string;
  detailRows?: EmailDetailRow[];
  calloutHtml?: string;
  cta?: { label: string; href: string };
  footerNote?: string;
};

export function buildBrandedEmailHtml(params: BrandedEmailParams): string {
  const {
    preheader = "",
    headline,
    introHtml,
    detailRows = [],
    calloutHtml,
    cta,
    footerNote,
  } = params;

  const logoUrl = escapeHtml(getEmailLogoUrl());
  const siteUrl = escapeHtml(getSiteUrl());
  const mapUrl = escapeHtml(getDashboardMapUrl());
  const settingsUrl = escapeHtml(getAlertSettingsUrl());

  const detailTable =
    detailRows.length > 0
      ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0 0;border-collapse:collapse;font-family:Inter,Arial,Helvetica,sans-serif;font-size:14px;">
${detailRows
  .map(
    (row) =>
      `<tr>
  <td style="padding:10px 0;border-bottom:1px solid ${EMAIL_BRAND.border};color:${EMAIL_BRAND.muted};width:32%;vertical-align:top;">${escapeHtml(row.label)}</td>
  <td style="padding:10px 0;border-bottom:1px solid ${EMAIL_BRAND.border};color:${EMAIL_BRAND.text};font-weight:600;">${escapeHtml(row.value)}</td>
</tr>`,
  )
  .join("")}
</table>`
      : "";

  const callout = calloutHtml
    ? `<div style="margin:16px 0 0;padding:14px 16px;background:#fff7f2;border-left:4px solid ${EMAIL_BRAND.primary};border-radius:0 8px 8px 0;font-family:Inter,Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.muted};">${calloutHtml}</div>`
    : "";

  const ctaBlock = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
<tr>
<td style="border-radius:10px;background:${EMAIL_BRAND.primary};">
<a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:14px 28px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(cta.label)}</a>
</td>
</tr>
</table>`
    : "";

  const footerExtra = footerNote
    ? `<p style="margin:12px 0 0;font-family:Inter,Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${EMAIL_BRAND.faint};">${footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(headline)}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.background};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${EMAIL_BRAND.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
          <tr>
            <td style="background:${EMAIL_BRAND.navy};border-radius:12px 12px 0 0;padding:24px 28px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;">
                    <a href="${siteUrl}" style="text-decoration:none;">
                      <img src="${logoUrl}" width="48" height="48" alt="${escapeHtml(EMAIL_BRAND.name)}" style="display:block;border:0;border-radius:8px;" />
                    </a>
                  </td>
                  <td style="vertical-align:middle;padding-left:14px;">
                    <p style="margin:0;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${EMAIL_BRAND.primary};">California</p>
                    <p style="margin:4px 0 0;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#ffffff;line-height:1.2;">${escapeHtml(EMAIL_BRAND.name)}</p>
                  </td>
                </tr>
              </table>
              <div style="margin-top:16px;height:3px;width:64px;background:${EMAIL_BRAND.primary};border-radius:2px;"></div>
            </td>
          </tr>
          <tr>
            <td style="background:${EMAIL_BRAND.surface};padding:28px;border-left:1px solid ${EMAIL_BRAND.border};border-right:1px solid ${EMAIL_BRAND.border};">
              <h1 style="margin:0 0 12px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:${EMAIL_BRAND.text};line-height:1.3;">${escapeHtml(headline)}</h1>
              <div style="font-family:Inter,Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.muted};">${introHtml}</div>
              ${callout}
              ${detailTable}
              ${ctaBlock}
            </td>
          </tr>
          <tr>
            <td style="background:${EMAIL_BRAND.navyMuted};border-radius:0 0 12px 12px;padding:20px 28px;border:1px solid ${EMAIL_BRAND.border};border-top:0;">
              <p style="margin:0;font-family:Inter,Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.65);">
                <a href="${mapUrl}" style="color:${EMAIL_BRAND.primary};text-decoration:none;font-weight:600;">View map</a>
                &nbsp;·&nbsp;
                <a href="${settingsUrl}" style="color:${EMAIL_BRAND.primary};text-decoration:none;font-weight:600;">Alert settings</a>
                &nbsp;·&nbsp;
                <a href="${siteUrl}" style="color:rgba(255,255,255,0.75);text-decoration:none;">${siteUrl.replace(/^https:\/\//, "")}</a>
              </p>
              ${footerExtra}
              <p style="margin:14px 0 0;font-family:Inter,Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.45);">${escapeHtml(EMAIL_BRAND.tagline)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildBrandedEmailText(params: {
  headline: string;
  lines: string[];
  cta?: { label: string; href: string };
  footerNote?: string;
}): string {
  const parts = [params.headline, "", ...params.lines];
  if (params.cta) {
    parts.push("", `${params.cta.label}: ${params.cta.href}`);
  }
  if (params.footerNote) {
    parts.push("", params.footerNote);
  }
  parts.push(
    "",
    EMAIL_BRAND.name,
    getSiteUrl(),
    `Map: ${getDashboardMapUrl()}`,
    `Alerts: ${getAlertSettingsUrl()}`,
  );
  return parts.join("\n");
}
