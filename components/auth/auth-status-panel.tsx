import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { AuthFooterText, AuthInlineLink } from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";

export function AuthStatusPanel({
  title,
  description,
  children,
  footerHref = "/auth/login",
  footerLabel = "Back to log in",
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  footerHref?: string;
  footerLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <AuthPageHeader title={title} description={description} />
      {children ? (
        <div className="font-montserrat text-[15px] font-medium leading-relaxed text-[#5C6573]">
          {children}
        </div>
      ) : null}
      <AuthFooterText className="mt-8">
        <AuthInlineLink href={footerHref}>{footerLabel}</AuthInlineLink>
      </AuthFooterText>
    </div>
  );
}
