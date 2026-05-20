/**
 * Optional `.env.local`:
 *   NEXT_PUBLIC_LEGAL_HELP_PHONE=+1 (555) 123-4567
 *   NEXT_PUBLIC_LEGAL_FIRM_NAME=Meehan Law Firm
 */

const rawPhone = process.env.NEXT_PUBLIC_LEGAL_HELP_PHONE?.trim() ?? "";

export const LEGAL_HELP_PHONE_DISPLAY =
  rawPhone || "";

export const LEGAL_FIRM_NAME =
  process.env.NEXT_PUBLIC_LEGAL_FIRM_NAME?.trim() || "Meehan Law Firm";

export function legalHelpTelHref(): string | null {
  if (!rawPhone) return null;
  if (rawPhone.startsWith("tel:")) return rawPhone;
  const digits = rawPhone.replace(/[^\d+]/g, "");
  if (!digits) return null;
  if (digits.startsWith("+")) return `tel:${digits}`;
  return `tel:+${digits}`;
}
