"use client";

import type {
  ProfileSettingsData,
  ProfileSettingsInput,
} from "@/lib/dashboard/settings-types";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const inputClass =
  "font-inter w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#F57E3A]/50 focus:outline-none focus:ring-1 focus:ring-[#F57E3A]/40";

const labelClass =
  "font-montserrat mb-1.5 block text-xs font-semibold text-white/80";

const SETTINGS_PANEL_CLASS =
  "w-full rounded-xl border border-white/10 bg-white/5 p-6 md:p-8";

export function ProfileSettingsPanel({
  initialProfile,
}: {
  initialProfile: ProfileSettingsData;
}) {
  const [saved, setSaved] = useState(initialProfile);
  const [draft, setDraft] = useState<ProfileSettingsInput>({
    address: initialProfile.address,
    zipCode: initialProfile.zipCode,
  });
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function startEdit() {
    setDraft({ address: saved.address, zipCode: saved.zipCode });
    setErrorMessage(null);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft({ address: saved.address, zipCode: saved.zipCode });
    setErrorMessage(null);
    setEditing(false);
  }

  async function saveProfile() {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await response.json().catch(() => ({}))) as {
        data?: ProfileSettingsData;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? `Save failed (${response.status})`);
      }

      if (json.data) {
        setSaved(json.data);
      } else {
        setSaved((prev) => ({
          ...prev,
          address: draft.address.trim(),
          zipCode: draft.zipCode.trim(),
        }));
      }
      setEditing(false);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Could not save profile",
      );
    }
  }

  const displayValue = (value: string) => value.trim() || "—";

  return (
    <section
      role="tabpanel"
      aria-labelledby="profile-settings-heading"
      className={SETTINGS_PANEL_CLASS}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="profile-settings-heading"
            className="font-montserrat text-lg font-semibold text-white"
          >
            Profile settings
          </h2>
          <p className="font-inter mt-1 text-sm text-white/60">
            Information from your signed-in account.
          </p>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={startEdit}
            className="font-montserrat inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#F57E3A]/40 hover:text-[#F57E3A]"
          >
            <Pencil className="size-4" aria-hidden />
            Edit
          </button>
        ) : null}
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="font-inter mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        >
          {errorMessage}
        </p>
      ) : null}

      {editing ? (
        <form
          className="mt-6 grid gap-6 lg:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void saveProfile();
          }}
        >
          <div className="lg:col-span-2">
            <label htmlFor="profile-address" className={labelClass}>
              Address
            </label>
            <input
              id="profile-address"
              type="text"
              value={draft.address}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Street address"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-zip" className={labelClass}>
              Zip code
            </label>
            <input
              id="profile-zip"
              type="text"
              inputMode="numeric"
              value={draft.zipCode}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, zipCode: e.target.value }))
              }
              placeholder="e.g. 90210"
              className={inputClass}
            />
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="font-montserrat inline-flex items-center justify-center rounded-xl bg-[#F57E3A] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "loading" ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={status === "loading"}
              className="font-montserrat inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:text-white disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <dl className="font-inter mt-6 divide-y divide-white/10 text-sm">
        <ProfileRow label="Display name" value={displayValue(saved.displayName)} />
        <ProfileRow label="Email" value={displayValue(saved.email)} />
        <ProfileRow label="Address" value={displayValue(saved.address)} />
        <ProfileRow label="Zip code" value={displayValue(saved.zipCode)} />
        <ProfileRow label="Sign-in method" value={displayValue(saved.signInMethod)} />
        <ProfileRow label="Account created" value={saved.accountCreated} />
        <ProfileRow label="Last sign-in" value={saved.lastSignIn} />
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
