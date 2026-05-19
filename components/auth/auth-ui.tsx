import { cn } from "@/lib/utils";
import Link from "next/link";

export const authInputClassName =
  "font-montserrat h-12 w-full rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] text-[15px] font-medium text-[#040F20] placeholder:font-normal placeholder:text-[#9AA3AF] transition-colors focus:border-[#F57E3A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F57E3A]/20 disabled:cursor-not-allowed disabled:opacity-50";

export const authLabelClassName =
  "font-montserrat text-sm font-semibold text-[#040F20]";

export const authLinkClassName =
  "font-montserrat font-semibold text-[#F57E3A] transition-colors hover:text-[#d96f32]";

export function AuthSubmitButton({
  children,
  disabled,
  className,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        "font-montserrat h-12 w-full rounded-xl bg-[#F57E3A] text-base font-semibold text-white shadow-[0_8px_24px_rgba(245,126,58,0.35)] transition-all hover:bg-[#e06d2a] hover:shadow-[0_10px_28px_rgba(245,126,58,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F57E3A] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AuthFooterText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-montserrat mt-6 text-center text-sm font-medium text-[#5C6573]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function AuthInlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={authLinkClassName}>
      {children}
    </Link>
  );
}

export function AuthErrorMessage({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="font-montserrat rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
    >
      {message}
    </p>
  );
}

export function AuthSuccessMessage({ message }: { message: string }) {
  return (
    <p className="font-montserrat rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
      {message}
    </p>
  );
}
