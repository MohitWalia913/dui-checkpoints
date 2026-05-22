import { ReportCheckpointPageContent } from "@/components/dashboard/report-checkpoint-page";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ReportCheckpointPage() {
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

  return (
    <ReportCheckpointPageContent
      user={{
        email,
        name: metadataName || email.split("@")[0] || "User",
      }}
    />
  );
}
