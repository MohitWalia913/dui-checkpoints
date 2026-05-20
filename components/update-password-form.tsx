"use client";

import { AuthField } from "@/components/auth/auth-field";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import {
  AuthErrorMessage,
  AuthSubmitButton,
} from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";
import { redirectToDashboard } from "@/lib/auth/redirect-after-sign-in";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
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
        title="Set a new password"
        description="Please enter your new password below."
      />

      <form onSubmit={handleForgotPassword} className="space-y-5">
        <AuthField
          id="password"
          label="New password"
          type="password"
          icon="password"
          showPasswordToggle
          placeholder="New password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        {error ? <AuthErrorMessage message={error} /> : null}

        <AuthSubmitButton disabled={isLoading}>
          {isLoading ? "Saving..." : "Save new password"}
        </AuthSubmitButton>
      </form>
    </div>
  );
}
