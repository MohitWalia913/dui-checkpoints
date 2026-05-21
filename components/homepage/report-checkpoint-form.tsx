"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

const inputClassName =
  "w-full rounded-[0px] border border-[#97979D] bg-white px-[10px] py-[11px] font-open-sans text-[14px] font-normal leading-[19px] text-[#242E4E] placeholder:text-[#97979D] focus:border-[#F57E3A] focus:outline-none focus:ring-1 focus:ring-[#F57E3A]";

type FormState = {
  reporterName: string;
  reporterEmail: string;
  State: string;
  County: string;
  City: string;
  Location: string;
  Description: string;
  Date: string;
  Time: string;
  Source: string;
  mapurl: string;
};

const initialState: FormState = {
  reporterName: "",
  reporterEmail: "",
  State: "California",
  County: "",
  City: "",
  Location: "",
  Description: "",
  Date: "",
  Time: "",
  Source: "",
  mapurl: "",
};

export function ReportCheckpointForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
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
      setForm(initialState);
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  return (
    <form className="mt-[20px] space-y-4 md:mt-[30px]" onSubmit={handleSubmit}>
      <div className="form-flex mb-[20px] flex justify-between gap-5">
        <div className="w-full">
          <label htmlFor="reporter-name" className="sr-only">
            Full Name
          </label>
          <input
            id="reporter-name"
            name="reporterName"
            type="text"
            placeholder="Full Name"
            className={inputClassName}
            value={form.reporterName}
            onChange={(e) => updateField("reporterName", e.target.value)}
            required
          />
        </div>
        <div className="w-full">
          <label htmlFor="reporter-email" className="sr-only">
            Email Address
          </label>
          <input
            id="reporter-email"
            name="reporterEmail"
            type="email"
            placeholder="Email Address"
            className={inputClassName}
            value={form.reporterEmail}
            onChange={(e) => updateField("reporterEmail", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-flex mb-[20px] flex justify-between gap-5">
        <div className="w-full">
          <label htmlFor="county" className="sr-only">
            County
          </label>
          <input
            id="county"
            name="County"
            type="text"
            placeholder="County"
            className={inputClassName}
            value={form.County}
            onChange={(e) => updateField("County", e.target.value)}
            required
          />
        </div>
        <div className="w-full">
          <label htmlFor="city" className="sr-only">
            City
          </label>
          <input
            id="city"
            name="City"
            type="text"
            placeholder="City"
            className={inputClassName}
            value={form.City}
            onChange={(e) => updateField("City", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-flex mb-[20px] flex justify-between gap-5">
        <div className="w-full">
          <label htmlFor="state" className="sr-only">
            State
          </label>
          <input
            id="state"
            name="State"
            type="text"
            placeholder="State"
            className={inputClassName}
            value={form.State}
            onChange={(e) => updateField("State", e.target.value)}
            required
          />
        </div>
        <div className="w-full">
          <label htmlFor="location" className="sr-only">
            Location
          </label>
          <input
            id="location"
            name="Location"
            type="text"
            placeholder="Checkpoint location (street / area)"
            className={inputClassName}
            value={form.Location}
            onChange={(e) => updateField("Location", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-flex mb-[20px] flex justify-between gap-5">
        <div className="w-full">
          <label htmlFor="date" className="sr-only">
            Date
          </label>
          <input
            id="date"
            name="Date"
            type="date"
            placeholder="Date"
            className={inputClassName}
            value={form.Date}
            onChange={(e) => updateField("Date", e.target.value)}
            required
          />
        </div>
        <div className="w-full">
          <label htmlFor="time" className="sr-only">
            Time
          </label>
          <input
            id="time"
            name="Time"
            type="text"
            placeholder="Time (e.g. 8pm–12am)"
            className={inputClassName}
            value={form.Time}
            onChange={(e) => updateField("Time", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mb-[20px] w-full">
        <label htmlFor="description" className="sr-only">
          Description
        </label>
        <textarea
          id="description"
          name="Description"
          rows={1}
          placeholder="Description (details about the checkpoint)"
          className={`${inputClassName} resize-y`}
          value={form.Description}
          onChange={(e) => updateField("Description", e.target.value)}
          required
        />
      </div>

      <div className="form-flex mb-[20px] flex justify-between gap-5">
        <div className="w-full">
          <label htmlFor="source" className="sr-only">
            Source URL
          </label>
          <input
            id="source"
            name="Source"
            type="url"
            placeholder="Source URL (optional)"
            className={inputClassName}
            value={form.Source}
            onChange={(e) => updateField("Source", e.target.value)}
          />
        </div>
        <div className="w-full">
          <label htmlFor="mapurl" className="sr-only">
            Google Maps URL
          </label>
          <input
            id="mapurl"
            name="mapurl"
            type="url"
            placeholder="Google Maps URL (optional)"
            className={inputClassName}
            value={form.mapurl}
            onChange={(e) => updateField("mapurl", e.target.value)}
          />
        </div>
      </div>

      {status === "success" ? (
        <p
          role="status"
          className="font-inter text-sm font-medium text-emerald-700"
        >
          Thank you — your checkpoint report was submitted and will be reviewed.
        </p>
      ) : null}

      {status === "error" && errorMessage ? (
        <p role="alert" className="font-inter text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="font-inter !mt-[20px] flex w-full items-center justify-center gap-2 rounded-[0px] bg-[#F57E3A] p-[16px] text-lg font-medium text-white transition-opacity hover:bg-[#000] hover:opacity-90 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 md:p-[21px]"
      >
        {status === "loading" ? "Submitting…" : "Submit Checkpoint Report"}
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
    </form>
  );
}
