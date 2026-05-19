import { AuthStatusPanel } from "@/components/auth/auth-status-panel";

export default function Page() {
  return (
    <AuthStatusPanel
      title="Thank you for signing up!"
      description="Check your email to confirm"
    >
      <p>
        You&apos;ve successfully signed up. Please check your email to confirm
        your account before signing in.
      </p>
    </AuthStatusPanel>
  );
}
