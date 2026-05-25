"use client";

import type { ProfileSettingsData } from "@/lib/dashboard/settings-types";
import Link from "next/link";

const SETTINGS_PANEL_CLASS =
  "w-full rounded-xl border border-white/10 bg-white/5 p-6 md:p-8";

export function ProfileSettingsPanel({
  initialProfile,
}: {
  initialProfile: ProfileSettingsData;
}) {
  const displayValue = (value: string) => value.trim() || "—";

  return (
    <section
      role="tabpanel"
      aria-labelledby="profile-settings-heading"
      className={SETTINGS_PANEL_CLASS}
    >
      <div>
        <h2
          id="profile-settings-heading"
          className="font-montserrat text-lg font-semibold text-white"
        >
          Profile settings
        </h2>
        <p className="font-inter mt-1 text-sm text-white/60">
          Account information from your sign-in. Set zip code and alert areas in
          Alert settings.
        </p>
      </div>

      <dl className="font-inter mt-6 divide-y divide-white/10 text-sm">
        <ProfileRow
          label="Display name"
          value={displayValue(initialProfile.displayName)}
        />
        <ProfileRow label="Email" value={displayValue(initialProfile.email)} />
        <ProfileRow
          label="Sign-in method"
          value={displayValue(initialProfile.signInMethod)}
        />
        <ProfileRow
          label="Account created"
          value={initialProfile.accountCreated}
        />
        <ProfileRow label="Last sign-in" value={initialProfile.lastSignIn} />
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
