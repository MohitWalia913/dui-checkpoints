"use client";

import { AlertSettingsPanel } from "@/components/dashboard/alert-settings-panel";
import { ProfileSettingsPanel } from "@/components/dashboard/profile-settings-panel";
import type { ProfileSettingsData } from "@/lib/dashboard/settings-types";
import type { UserAlertSettings } from "@/lib/dashboard/alert-settings-types";
import { cn } from "@/lib/utils";
import { Bell, User } from "lucide-react";
import { useState } from "react";

type SettingsTab = "profile" | "alerts";

export function SettingsPageContent({
  profile,
  alertSettings,
}: {
  profile: ProfileSettingsData;
  alertSettings: UserAlertSettings | null;
}) {
  const [tab, setTab] = useState<SettingsTab>("profile");

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <div>
        <p className="font-montserrat text-sm font-semibold uppercase tracking-wider text-[#F57E3A]">
          Account
        </p>
        <h1 className="font-montserrat mt-2 text-3xl font-bold text-white md:text-4xl">
          Settings
        </h1>
        <p className="font-inter mt-3 max-w-2xl text-base leading-relaxed text-white/70">
          Manage your profile and notification preferences.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Settings sections"
        className="inline-flex w-fit rounded-lg border border-white/10 bg-white/5 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profile"}
          onClick={() => setTab("profile")}
          className={cn(
            "font-montserrat inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
            tab === "profile"
              ? "bg-[#F57E3A] text-white"
              : "text-white/70 hover:text-white",
          )}
        >
          <User className="size-4" aria-hidden />
          Profile settings
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "alerts"}
          onClick={() => setTab("alerts")}
          className={cn(
            "font-montserrat inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
            tab === "alerts"
              ? "bg-[#F57E3A] text-white"
              : "text-white/70 hover:text-white",
          )}
        >
          <Bell className="size-4" aria-hidden />
          Alert settings
        </button>
      </div>

      {tab === "profile" ? (
        <ProfileSettingsPanel initialProfile={profile} />
      ) : (
        <AlertSettingsPanel initialSettings={alertSettings} />
      )}
    </div>
  );
}
