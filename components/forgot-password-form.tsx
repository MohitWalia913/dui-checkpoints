"use client";

import { AuthField } from "@/components/auth/auth-field";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import {
  AuthErrorMessage,
  AuthFooterText,
  AuthInlineLink,
  AuthSubmitButton,
} from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={cn("w-full", className)} {...props}>
        <AuthPageHeader
          title="Check your email"
          description="Password reset instructions sent"
        />
        <p className="font-montserrat text-[15px] font-medium leading-relaxed text-[#5C6573]">
          If you registered using your email and password, you will receive a
          password reset email.
        </p>
        <AuthFooterText className="mt-8">
          <AuthInlineLink href="/auth/login">Back to log in</AuthInlineLink>
        </AuthFooterText>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <AuthPageHeader
        title="Reset your password"
        description="Enter your email and we'll send you a link to reset your password."
      />

      <form onSubmit={handleForgotPassword} className="space-y-5">
        <AuthField
          id="email"
          label="Email"
          type="email"
          icon="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        {error ? <AuthErrorMessage message={error} /> : null}

        <AuthSubmitButton disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset email"}
        </AuthSubmitButton>
      </form>

      <AuthFooterText>
        Already have an account?{" "}
        <AuthInlineLink href="/auth/login">Log in</AuthInlineLink>
      </AuthFooterText>
    </div>
  );
}
