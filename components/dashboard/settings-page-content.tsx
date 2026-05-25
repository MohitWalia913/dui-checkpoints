"use client";

import { AlertSettingsPanel } from "@/components/dashboard/alert-settings-panel";
import type { ProfileSettingsData } from "@/lib/dashboard/settings-types";
import type { UserAlertSettings } from "@/lib/dashboard/alert-settings-types";
import { cn } from "@/lib/utils";
import { Bell, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type SettingsTab = "profile" | "alerts";

const SETTINGS_PANEL_CLASS =
  "w-full rounded-xl border border-white/10 bg-white/5 p-6 md:p-8";

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
        <section
          role="tabpanel"
          aria-labelledby="profile-settings-heading"
          className={SETTINGS_PANEL_CLASS}
        >
          <h2
            id="profile-settings-heading"
            className="font-montserrat text-lg font-semibold text-white"
          >
            Profile settings
          </h2>
          <p className="font-inter mt-1 text-sm text-white/60">
            Information from your signed-in account.
          </p>

          <dl className="font-inter mt-6 divide-y divide-white/10 text-sm">
            <ProfileRow label="Display name" value={profile.displayName} />
            <ProfileRow label="Email" value={profile.email || "—"} />
            <ProfileRow
              label="Sign-in method"
              value={profile.signInMethod || "—"}
            />
            <ProfileRow label="Account created" value={profile.accountCreated} />
            <ProfileRow label="Last sign-in" value={profile.lastSignIn} />
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/update-password"
              className="font-montserrat inline-flex items-center justify-center rounded-xl bg-[#F57E3A] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Update password
            </Link>
          </div>
        </section>
      ) : (
        <AlertSettingsPanel initialSettings={alertSettings} />
      )}
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="font-montserrat text-xs font-semibold uppercase tracking-wider text-white/50">
        {label}
      </dt>
      <dd className="font-medium text-white/90 sm:text-right">{value}</dd>
    </div>
  );
}
