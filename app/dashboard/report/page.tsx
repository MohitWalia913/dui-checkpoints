import { ReportCheckpointPageContent } from "@/components/dashboard/report-checkpoint-page";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ReportCheckpointPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return <ReportCheckpointPageContent />;
}
