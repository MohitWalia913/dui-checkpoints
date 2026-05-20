"use client";

import { getOAuthRedirectTo } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/client";
import { useCallback, useState } from "react";

export function useGoogleSignIn() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const signInWithGoogle = useCallback(async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getOAuthRedirectTo(),
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      setGoogleError(
        err instanceof Error
          ? err.message
          : "Could not start Google sign-in. Please try again.",
      );
      setIsGoogleLoading(false);
    }
  }, []);

  return { signInWithGoogle, isGoogleLoading, googleError, setGoogleError };
}
