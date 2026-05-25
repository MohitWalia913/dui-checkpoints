"use client";

import {
  ALERT_LEAD_TIME_OPTIONS,
  alertSettingsToInput,
  formatAlertSettingsForDisplay,
  type UserAlertSettings,
  type UserAlertSettingsInput,
} from "@/lib/dashboard/alert-settings-types";
import { CALIFORNIA_COUNTIES } from "@/lib/alerts/california-counties";
import { cityKey, type AlertCityOption } from "@/lib/alerts/location-catalog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const inputClass =
  "font-inter w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#F57E3A]/50 focus:outline-none focus:ring-1 focus:ring-[#F57E3A]/40";

const labelClass =
  "font-montserrat mb-1.5 block text-xs font-semibold text-white/80";

const SETTINGS_PANEL_CLASS =
  "w-full rounded-xl border border-white/10 bg-white/5 p-6 md:p-8";

const alertMenuItemClass =
  "cursor-pointer rounded-md px-3 py-2 text-sm text-white/90 focus:bg-[#F57E3A]/25 focus:text-white data-[highlighted]:bg-[#F57E3A]/25 data-[highlighted]:text-white";

const listBoxClass =
  "max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1628]/80 p-2";

function formatLeadTimeLabel(hours: number): string {
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

function normalizeCounty(value: string): string {
  return value.trim().toLowerCase();
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
  const [catalogCities, setCatalogCities] = useState<AlertCityOption[]>([]);
  const [countyFilter, setCountyFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const displayRows = useMemo(
    () => formatAlertSettingsForDisplay(saved),
    [saved],
  );

  const loadCatalog = useCallback(async () => {
    try {
      const response = await fetch("/api/settings/alerts/locations");
      if (!response.ok) return;
      const json = (await response.json()) as {
        data?: { cities?: AlertCityOption[] };
      };
      if (json.data?.cities) {
        setCatalogCities(json.data.cities);
      }
    } catch {
      /* catalog is optional for editing */
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const allCounties = useMemo(() => [...CALIFORNIA_COUNTIES], []);

  const filteredCounties = useMemo(() => {
    const q = countyFilter.trim().toLowerCase();
    if (!q) return allCounties;
    return allCounties.filter((c) => c.toLowerCase().includes(q));
  }, [allCounties, countyFilter]);

  const selectedCountySet = useMemo(
    () => new Set(draft.selected_counties.map(normalizeCounty)),
    [draft.selected_counties],
  );

  const visibleCities = useMemo(() => {
    const countyNorm = selectedCountySet;
    const q = cityFilter.trim().toLowerCase();
    return catalogCities.filter((entry) => {
      if (countyNorm.size > 0 && !countyNorm.has(normalizeCounty(entry.county))) {
        return false;
      }
      if (!q) return true;
      return (
        entry.city.toLowerCase().includes(q) ||
        entry.county.toLowerCase().includes(q)
      );
    });
  }, [catalogCities, cityFilter, selectedCountySet]);

  const selectedCityKeys = useMemo(
    () => new Set(draft.selected_cities.map((c) => cityKey(c.city, c.county))),
    [draft.selected_cities],
  );

  function updateField<K extends keyof UserAlertSettingsInput>(
    key: K,
    value: UserAlertSettingsInput[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCounty(county: string, checked: boolean) {
    setDraft((prev) => {
      const set = new Set(prev.selected_counties);
      if (checked) {
        set.add(county);
      } else {
        set.delete(county);
      }
      return { ...prev, selected_counties: Array.from(set).sort() };
    });
  }

  function setAllCounties(selected: boolean) {
    updateField(
      "selected_counties",
      selected ? [...CALIFORNIA_COUNTIES] : [],
    );
  }

  function toggleCity(entry: AlertCityOption, checked: boolean) {
    setDraft((prev) => {
      const key = entry.key;
      const next = new Map(
        prev.selected_cities.map((c) => [cityKey(c.city, c.county), c]),
      );
      if (checked) {
        next.set(key, { city: entry.city, county: entry.county });
      } else {
        next.delete(key);
      }
      return {
        ...prev,
        selected_cities: Array.from(next.values()),
      };
    });
  }

  function setAllVisibleCities(selected: boolean) {
    setDraft((prev) => {
      const next = new Map(
        prev.selected_cities.map((c) => [cityKey(c.city, c.county), c]),
      );
      for (const entry of visibleCities) {
        if (selected) {
          next.set(entry.key, { city: entry.city, county: entry.county });
        } else {
          next.delete(entry.key);
        }
      }
      return { ...prev, selected_cities: Array.from(next.values()) };
    });
  }

  function startEdit() {
    setDraft(saved);
    setErrorMessage(null);
    setEditing(true);
    void loadCatalog();
  }

  function cancelEdit() {
    setDraft(saved);
    setErrorMessage(null);
    setCountyFilter("");
    setCityFilter("");
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
      setCountyFilter("");
      setCityFilter("");
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
            Email when a new upcoming checkpoint is added in your selected
            California counties or cities. Optional zip code adds proximity
            alerts.
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

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={draft.notify_new_checkpoints}
              onChange={(e) =>
                updateField("notify_new_checkpoints", e.target.checked)
              }
              disabled={!draft.alerts_enabled}
              className="size-4 rounded border-white/20 bg-white/5 text-[#F57E3A] focus:ring-[#F57E3A]/40 disabled:opacity-50"
            />
            <span className="font-inter text-sm text-white">
              Email immediately when a new checkpoint is added
            </span>
          </label>

          <div>
            <label htmlFor="alert-zip" className={labelClass}>
              Zip code (optional proximity alerts)
            </label>
            <input
              id="alert-zip"
              type="text"
              inputMode="numeric"
              value={draft.zip_code}
              onChange={(e) => updateField("zip_code", e.target.value)}
              placeholder="e.g. 90210"
              className={inputClass}
              disabled={!draft.alerts_enabled}
            />
          </div>

          <div>
            <label htmlFor="alert-lead-time" className={labelClass}>
              Upcoming alert window
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
              Used for labeling upcoming checkpoints; new checkpoints trigger
              email right away when they match your areas.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className={labelClass}>California counties</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!draft.alerts_enabled}
                  onClick={() => setAllCounties(true)}
                  className="font-inter text-xs text-[#F57E3A] hover:underline disabled:opacity-50"
                >
                  Select all
                </button>
                <button
                  type="button"
                  disabled={!draft.alerts_enabled}
                  onClick={() => setAllCounties(false)}
                  className="font-inter text-xs text-white/60 hover:underline disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>
            <input
              type="search"
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              placeholder="Filter counties…"
              className={`${inputClass} mt-2`}
              disabled={!draft.alerts_enabled}
            />
            <div className={`${listBoxClass} mt-2 grid gap-1 sm:grid-cols-2`}>
              {filteredCounties.map((county) => (
                <label
                  key={county}
                  className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm text-white/90 hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={selectedCountySet.has(normalizeCounty(county))}
                    onChange={(e) => toggleCounty(county, e.target.checked)}
                    disabled={!draft.alerts_enabled}
                    className="size-3.5 shrink-0 rounded border-white/20 text-[#F57E3A]"
                  />
                  <span className="truncate">{county}</span>
                </label>
              ))}
            </div>
            <p className="font-inter mt-2 text-xs text-white/50">
              {draft.selected_counties.length} of {allCounties.length} counties
              selected. Leave cities empty to alert for any city in selected
              counties.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className={labelClass}>
                Cities (optional — from checkpoint data)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!draft.alerts_enabled || visibleCities.length === 0}
                  onClick={() => setAllVisibleCities(true)}
                  className="font-inter text-xs text-[#F57E3A] hover:underline disabled:opacity-50"
                >
                  Select visible
                </button>
                <button
                  type="button"
                  disabled={!draft.alerts_enabled || visibleCities.length === 0}
                  onClick={() => setAllVisibleCities(false)}
                  className="font-inter text-xs text-white/60 hover:underline disabled:opacity-50"
                >
                  Clear visible
                </button>
              </div>
            </div>
            <input
              type="search"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filter cities…"
              className={`${inputClass} mt-2`}
              disabled={!draft.alerts_enabled}
            />
            <div className={`${listBoxClass} mt-2`}>
              {visibleCities.length === 0 ? (
                <p className="px-2 py-3 text-xs text-white/50">
                  {catalogCities.length === 0
                    ? "Loading cities from checkpoint data…"
                    : "No cities match your filter or county selection."}
                </p>
              ) : (
                visibleCities.map((entry) => (
                  <label
                    key={entry.key}
                    className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-white/90 hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCityKeys.has(entry.key)}
                      onChange={(e) => toggleCity(entry, e.target.checked)}
                      disabled={!draft.alerts_enabled}
                      className="size-3.5 shrink-0 rounded border-white/20 text-[#F57E3A]"
                    />
                    <span>
                      {entry.city}
                      <span className="text-white/45"> · {entry.county}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="font-inter mt-2 text-xs text-white/50">
              {draft.selected_cities.length === 0
                ? "No specific cities — county selection applies."
                : `${draft.selected_cities.length} cities selected.`}
            </p>
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
