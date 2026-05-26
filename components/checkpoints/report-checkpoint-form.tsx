"use client";

import {
  REPORT_CHECKPOINT_INITIAL,
  type ReportCheckpointBody,
} from "@/lib/checkpoints/report";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const homepageInputClass =
  "w-full rounded-[0px] border border-[#97979D] bg-white px-[10px] py-[11px] font-open-sans text-[14px] font-normal leading-[19px] text-[#242E4E] placeholder:text-[#97979D] focus:border-[#F57E3A] focus:outline-none focus:ring-1 focus:ring-[#F57E3A]";

const dashboardInputClass =
  "font-inter w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#F57E3A]/50 focus:outline-none focus:ring-1 focus:ring-[#F57E3A]/40";

type ReportCheckpointFormProps = {
  variant?: "homepage" | "dashboard";
};


function ReportFormField({
  id,
  label,
  required,
  isDashboard,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  isDashboard: boolean;
  children: React.ReactNode;
}) {
  const labelClass = isDashboard
    ? "font-montserrat mb-1.5 block text-xs font-semibold text-white/80"
    : "sr-only";

  return (
    <div className={isDashboard ? "space-y-0" : "w-full"}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && isDashboard ? " *" : null}
        {!required && isDashboard ? " (optional)" : null}
      </label>
      {children}
    </div>
  );
}

export function ReportCheckpointForm({
  variant = "homepage",
}: ReportCheckpointFormProps) {
  const isDashboard = variant === "dashboard";

  const [form, setForm] = useState<ReportCheckpointBody>(
    () => REPORT_CHECKPOINT_INITIAL,
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputClass = isDashboard ? dashboardInputClass : homepageInputClass;

  function updateField<K extends keyof ReportCheckpointBody>(
    key: K,
    value: ReportCheckpointBody[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/checkpoints/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(json.error ?? "Could not submit your report. Try again.");
        return;
      }

      setStatus("success");
      setForm({ ...REPORT_CHECKPOINT_INITIAL });
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  const rowClass = isDashboard
    ? "grid gap-4 sm:grid-cols-2"
    : "form-flex mb-[20px] flex justify-between gap-5";

  return (
    <form
      className={cn(isDashboard ? "space-y-6" : "mt-[20px] space-y-4 md:mt-[30px]")}
      onSubmit={handleSubmit}
    >
      <div className={isDashboard ? "space-y-4" : undefined}>
        {isDashboard ? (
          <h3 className="font-montserrat text-sm font-semibold uppercase tracking-wide text-[#F57E3A]">
            Location
          </h3>
        ) : null}
        <div className={rowClass}>
          <ReportFormField
            id="state"
            label="State"
            required
            isDashboard={isDashboard}
          >
            <input
              id="state"
              name="State"
              type="text"
              placeholder="State"
              className={inputClass}
              value={form.State}
              onChange={(e) => updateField("State", e.target.value)}
              required
            />
          </ReportFormField>
          <ReportFormField
            id="county"
            label="County"
            required
            isDashboard={isDashboard}
          >
            <input
              id="county"
              name="County"
              type="text"
              placeholder="County"
              className={inputClass}
              value={form.County}
              onChange={(e) => updateField("County", e.target.value)}
              required
            />
          </ReportFormField>
        </div>
        <div className={rowClass}>
          <ReportFormField id="city" label="City" isDashboard={isDashboard}>
            <input
              id="city"
              name="City"
              type="text"
              placeholder="City"
              className={inputClass}
              value={form.City}
              onChange={(e) => updateField("City", e.target.value)}
            />
          </ReportFormField>
          <ReportFormField
            id="location"
            label="Checkpoint location"
            isDashboard={isDashboard}
          >
            <input
              id="location"
              name="Location"
              type="text"
              placeholder="Street / cross streets / area"
              className={inputClass}
              value={form.Location}
              onChange={(e) => updateField("Location", e.target.value)}
            />
          </ReportFormField>
        </div>
      </div>

      <div className={isDashboard ? "space-y-4" : undefined}>
        {isDashboard ? (
          <h3 className="font-montserrat text-sm font-semibold uppercase tracking-wide text-[#F57E3A]">
            Checkpoint details
          </h3>
        ) : null}
        <div className={rowClass}>
          <ReportFormField id="date" label="Date" isDashboard={isDashboard}>
            <input
              id="date"
              name="Date"
              type="date"
              className={inputClass}
              value={form.Date}
              onChange={(e) => updateField("Date", e.target.value)}
            />
          </ReportFormField>
          <ReportFormField id="time" label="Time" isDashboard={isDashboard}>
            <input
              id="time"
              name="Time"
              type="text"
              placeholder="e.g. 8pm–12am"
              className={inputClass}
              value={form.Time}
              onChange={(e) => updateField("Time", e.target.value)}
            />
          </ReportFormField>
        </div>
        <ReportFormField
          id="description"
          label="Description"
          isDashboard={isDashboard}
        >
          <textarea
            id="description"
            name="Description"
            rows={isDashboard ? 4 : 1}
            placeholder="Details about the checkpoint"
            className={cn(inputClass, "resize-y")}
            value={form.Description}
            onChange={(e) => updateField("Description", e.target.value)}
          />
        </ReportFormField>
      </div>

      <div className={isDashboard ? "space-y-4" : undefined}>
        {isDashboard ? (
          <h3 className="font-montserrat text-sm font-semibold uppercase tracking-wide text-[#F57E3A]">
            Source
          </h3>
        ) : null}
        <ReportFormField
          id="source"
          label="Source"
          required
          isDashboard={isDashboard}
        >
          <input
            id="source"
            name="Source"
            type="url"
            placeholder="Source URL"
            className={inputClass}
            value={form.Source}
            onChange={(e) => updateField("Source", e.target.value)}
            required
          />
        </ReportFormField>
      </div>

      {status === "success" ? (
        <p
          role="status"
          className={cn(
            "font-inter text-sm font-medium",
            isDashboard ? "text-emerald-400" : "text-emerald-700",
          )}
        >
          Thank you — your checkpoint report was submitted and will be reviewed.
        </p>
      ) : null}

      {status === "error" && errorMessage ? (
        <p
          role="alert"
          className={cn(
            "font-inter text-sm font-medium",
            isDashboard ? "text-red-400" : "text-red-600",
          )}
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "font-inter flex w-full items-center justify-center gap-2 font-medium text-white transition-opacity focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          isDashboard
            ? "rounded-lg bg-[#F57E3A] px-6 py-3 text-sm hover:bg-[#e06d2a]"
            : "!mt-[20px] rounded-[0px] bg-[#F57E3A] p-[16px] text-lg hover:bg-[#000] hover:opacity-90 md:p-[21px]",
        )}
      >
        {status === "loading" ? "Submitting…" : "Submit checkpoint report"}
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
    </form>
  );
}
