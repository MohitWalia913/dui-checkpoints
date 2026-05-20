import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function LoginPageContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}

export default function Page() {
  return (
    <Suspense fallback={<LoginForm />}>
      <LoginPageContent />
    </Suspense>
  );
}
