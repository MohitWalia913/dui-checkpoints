import { SettingsPageContent } from "@/components/dashboard/settings-page-content";
import { getUserAlertSettings } from "@/lib/dashboard/alert-settings-repository";
import { buildProfileSettingsData } from "@/lib/dashboard/profile-settings";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth/login");
  }

  const profile = buildProfileSettingsData(data.user);
  const alertResult = await getUserAlertSettings(data.user.id);

  return (
    <SettingsPageContent
      profile={profile}
      alertSettings={alertResult.data}
    />
  );
}
