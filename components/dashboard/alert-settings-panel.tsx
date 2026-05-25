"use client";

import {
  ALERT_LEAD_TIME_OPTIONS,
  alertSettingsToInput,
  formatAlertSettingsForDisplay,
  type UserAlertSettings,
  type UserAlertSettingsInput,
} from "@/lib/dashboard/alert-settings-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Pencil } from "lucide-react";
import { useMemo, useState } from "react";

const inputClass =
  "font-inter w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#F57E3A]/50 focus:outline-none focus:ring-1 focus:ring-[#F57E3A]/40";

const labelClass =
  "font-montserrat mb-1.5 block text-xs font-semibold text-white/80";

const SETTINGS_PANEL_CLASS =
  "w-full rounded-xl border border-white/10 bg-white/5 p-6 md:p-8";

const alertMenuItemClass =
  "cursor-pointer rounded-md px-3 py-2 text-sm text-white/90 focus:bg-[#F57E3A]/25 focus:text-white data-[highlighted]:bg-[#F57E3A]/25 data-[highlighted]:text-white";

function formatLeadTimeLabel(hours: number): string {
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

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
    if (
      draft.use_city_county_alerts &&
      (!draft.alert_city.trim() || !draft.alert_county.trim())
    ) {
      setErrorMessage(
        "Enter both city and county when city & county alerts are enabled.",
      );
      return;
    }

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
            Get email when a new upcoming checkpoint matches your zip (Profile)
            and/or your city &amp; county below.
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
            <DropdownMenu>
              <DropdownMenuTrigger
                id="alert-lead-time"
                disabled={!draft.alerts_enabled}
                className={`${inputClass} flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span>{formatLeadTimeLabel(draft.alert_lead_time_hours)}</span>
                <ChevronDown
                  className="size-4 shrink-0 text-white/50"
                  aria-hidden
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg border border-white/10 bg-[#0a1628] p-1 font-inter text-white shadow-lg"
              >
                {ALERT_LEAD_TIME_OPTIONS.map((hours) => (
                  <DropdownMenuItem
                    key={hours}
                    className={alertMenuItemClass}
                    onSelect={() =>
                      updateField("alert_lead_time_hours", hours)
                    }
                  >
                    {formatLeadTimeLabel(hours)}
                    {draft.alert_lead_time_hours === hours ? (
                      <span className="ml-auto text-xs font-semibold text-[#F57E3A]">
                        Selected
                      </span>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="font-inter mt-1.5 text-xs text-white/50">
              Email when a new upcoming checkpoint is added within this window
              (e.g. 1 hour = same-day alerts).
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={draft.use_city_county_alerts}
                onChange={(e) =>
                  updateField("use_city_county_alerts", e.target.checked)
                }
                disabled={!draft.alerts_enabled}
                className="size-4 rounded border-white/20 bg-white/5 text-[#F57E3A] focus:ring-[#F57E3A]/40 disabled:opacity-50"
              />
              <span className="font-inter text-sm font-medium text-white">
                Match by city &amp; county
              </span>
            </label>
            <p className="font-inter mt-2 text-xs text-white/50">
              Use when checkpoints lack zip codes. Alerts when a new entry is in
              your city and county (zip matching still applies if set in
              Profile).
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="alert-city" className={labelClass}>
                  Your city
                </label>
                <input
                  id="alert-city"
                  type="text"
                  value={draft.alert_city}
                  onChange={(e) => updateField("alert_city", e.target.value)}
                  placeholder="e.g. Los Angeles"
                  className={inputClass}
                  disabled={
                    !draft.alerts_enabled || !draft.use_city_county_alerts
                  }
                />
              </div>
              <div>
                <label htmlFor="alert-county" className={labelClass}>
                  Your county
                </label>
                <input
                  id="alert-county"
                  type="text"
                  value={draft.alert_county}
                  onChange={(e) => updateField("alert_county", e.target.value)}
                  placeholder="e.g. Los Angeles"
                  className={inputClass}
                  disabled={
                    !draft.alerts_enabled || !draft.use_city_county_alerts
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="preferred-counties" className={labelClass}>
              Preferred counties (optional filter)
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
