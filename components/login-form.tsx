"use client";

import { AuthField } from "@/components/auth/auth-field";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useGoogleSignIn } from "@/components/auth/use-google-sign-in";
import {
  AuthDivider,
  AuthErrorMessage,
  AuthFooterText,
  AuthInlineLink,
  AuthSubmitButton,
  authLinkClassName,
} from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";
import { redirectToDashboard } from "@/lib/auth/redirect-after-sign-in";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    signInWithGoogle,
    isGoogleLoading,
    googleError,
    setGoogleError,
  } = useGoogleSignIn();

  const isBusy = isLoading || isGoogleLoading;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setGoogleError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      redirectToDashboard();
      return;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <AuthPageHeader
        title="Welcome back!"
        description="Sign in to access your DUI checkpoint alerts and saved preferences."
      />

      <GoogleSignInButton
        onClick={signInWithGoogle}
        isLoading={isGoogleLoading}
        disabled={isLoading}
      />

      {googleError ? (
        <div className="mt-3">
          <AuthErrorMessage message={googleError} />
        </div>
      ) : null}

      <AuthDivider />

      <form onSubmit={handleLogin} className="space-y-5">
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
          disabled={isBusy}
        />

        <AuthField
          id="password"
          label="Password"
          type="password"
          icon="password"
          showPasswordToggle
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={isBusy}
          labelAction={
            <Link
              href="/auth/forgot-password"
              className={cn(authLinkClassName, "text-sm")}
            >
              Forgot password?
            </Link>
          }
        />

        {error ? <AuthErrorMessage message={error} /> : null}

        <AuthSubmitButton disabled={isBusy}>
          {isLoading ? "Logging in..." : "Log in"}
        </AuthSubmitButton>
      </form>

      <AuthFooterText>
        Don&apos;t have an account?{" "}
        <AuthInlineLink href="/auth/sign-up">Sign up</AuthInlineLink>
      </AuthFooterText>
    </div>
  );
}
