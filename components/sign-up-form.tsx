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
} from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    signInWithGoogle,
    isGoogleLoading,
    googleError,
    setGoogleError,
  } = useGoogleSignIn();

  const isBusy = isLoading || isGoogleLoading;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setGoogleError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <AuthPageHeader
        title="Create your account"
        description="Get real-time DUI checkpoint alerts and tools built for California drivers."
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

      <form onSubmit={handleSignUp} className="space-y-5">
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
          placeholder="Create a password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          disabled={isBusy}
        />

        <AuthField
          id="repeat-password"
          label="Confirm password"
          type="password"
          icon="password"
          showPasswordToggle
          placeholder="Re-enter your password"
          required
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          autoComplete="new-password"
          disabled={isBusy}
        />

        {error ? <AuthErrorMessage message={error} /> : null}

        <AuthSubmitButton disabled={isBusy}>
          {isLoading ? "Creating an account..." : "Sign up"}
        </AuthSubmitButton>
      </form>

      <AuthFooterText>
        Already have an account?{" "}
        <AuthInlineLink href="/auth/login">Log in</AuthInlineLink>
      </AuthFooterText>
    </div>
  );
}
