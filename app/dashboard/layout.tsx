import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  DashboardShell,
  type DashboardUser,
} from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

async function AuthenticatedDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const email =
    (typeof data.claims.email === "string" && data.claims.email) || "";
  const metadataName =
    typeof data.claims.user_metadata === "object" &&
    data.claims.user_metadata !== null &&
    "full_name" in data.claims.user_metadata &&
    typeof data.claims.user_metadata.full_name === "string"
      ? data.claims.user_metadata.full_name
      : null;

  const user: DashboardUser = {
    email,
    name: metadataName || email.split("@")[0] || "User",
  };

  return <DashboardShell user={user}>{children}</DashboardShell>;
}

function DashboardLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#F5F6F8]">
      <p className="font-montserrat text-sm font-medium text-[#5C6573]">
        Loading dashboard…
      </p>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}
