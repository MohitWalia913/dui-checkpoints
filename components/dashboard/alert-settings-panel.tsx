"use client";

import {
  ALERT_LEAD_TIME_OPTIONS,
  alertSettingsToInput,
  formatAlertSettingsForDisplay,
  type UserAlertSettings,
  type UserAlertSettingsInput,
} from "@/lib/dashboard/alert-settings-types";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";

const inputClass =
  "font-inter w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#F57E3A]/50 focus:outline-none focus:ring-1 focus:ring-[#F57E3A]/40";

const labelClass =
  "font-montserrat mb-1.5 block text-xs font-semibold text-white/80";

const SETTINGS_PANEL_CLASS =
  "w-full rounded-xl border border-white/10 bg-white/5 p-6 md:p-8";

export function AlertSettingsPanel({
  initialSettings,
}: {
  initialSettings: UserAlertSettings | null;
}) {
  const [saved, setSaved] = useState<UserAlertSettingsInput>(() =>
    alertSettingsToInput(initialSettings),
  );
  const [draft, setDraft] = useState<UserAlertSettingsInput>(saved);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayRows = useMemo(
    () => formatAlertSettingsForDisplay(saved),
    [saved],
  );

  function updateField<K extends keyof UserAlertSettingsInput>(
    key: K,
    value: UserAlertSettingsInput[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit() {
    setDraft(saved);
    setErrorMessage(null);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(saved);
    setErrorMessage(null);
    setEditing(false);
  }

  async function saveSettings() {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/settings/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? `Save failed (${response.status})`);
      }

      setSaved(draft);
      setEditing(false);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Could not save alert settings",
      );
    }
  }

  return (
    <section
      role="tabpanel"
      aria-labelledby="alert-settings-heading"
      className={SETTINGS_PANEL_CLASS}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="alert-settings-heading"
            className="font-montserrat text-lg font-semibold text-white"
          >
            Alert settings
          </h2>
          <p className="font-inter mt-1 text-sm text-white/60">
            Email alerts for upcoming checkpoints near your zip code. Set your
            zip in Profile settings.
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
          className="mt-6 grid gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            void saveSettings();
          }}
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={draft.alerts_enabled}
              onChange={(e) => updateField("alerts_enabled", e.target.checked)}
              className="size-4 rounded border-white/20 bg-white/5 text-[#F57E3A] focus:ring-[#F57E3A]/40"
            />
            <span className="font-inter text-sm text-white">
              Enable checkpoint alerts
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={draft.email_notifications}
              onChange={(e) =>
                updateField("email_notifications", e.target.checked)
              }
              disabled={!draft.alerts_enabled}
              className="size-4 rounded border-white/20 bg-white/5 text-[#F57E3A] focus:ring-[#F57E3A]/40 disabled:opacity-50"
            />
            <span className="font-inter text-sm text-white">
              Send email notifications
            </span>
          </label>

          <div>
            <label htmlFor="alert-lead-time" className={labelClass}>
              Alert window (hours before checkpoint)
            </label>
            <select
              id="alert-lead-time"
              value={draft.alert_lead_time_hours}
              onChange={(e) =>
                updateField(
                  "alert_lead_time_hours",
                  Number(e.target.value),
                )
              }
              disabled={!draft.alerts_enabled}
              className={inputClass}
            >
              {ALERT_LEAD_TIME_OPTIONS.map((hours) => (
                <option key={hours} value={hours}>
                  {hours} hours
                </option>
              ))}
            </select>
            <p className="font-inter mt-1.5 text-xs text-white/50">
              You will get an email when a new upcoming checkpoint is added
              within this many hours of its scheduled date and near your zip.
            </p>
          </div>

          <div>
            <label htmlFor="preferred-counties" className={labelClass}>
              Preferred counties
            </label>
            <input
              id="preferred-counties"
              type="text"
              value={draft.preferred_counties}
              onChange={(e) =>
                updateField("preferred_counties", e.target.value)
              }
              placeholder="e.g. Los Angeles, Riverside (leave empty for all)"
              className={inputClass}
              disabled={!draft.alerts_enabled}
            />
          </div>

          <div className="flex flex-wrap gap-3">
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
      ) : (
        <dl className="font-inter mt-6 divide-y divide-white/10 text-sm">
          {Object.entries(displayRows).map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <dt className="font-montserrat text-xs font-semibold uppercase tracking-wider text-white/50">
                {label}
              </dt>
              <dd className="font-medium text-white/90 sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
