"use client";

import { CheckpointsTable } from "@/components/dashboard/checkpoints-table";
import {
  formatCheckpointFilterLabel,
  getCheckpointMonthOptions,
  getCheckpointYearOptions,
} from "@/lib/checkpoints/list-filters";
import type { CheckpointListItem } from "@/lib/checkpoints/types";
import { useRouter, useSearchParams } from "next/navigation";

type Tab = "upcoming" | "past";

const selectClassName =
  "font-montserrat h-10 min-w-[140px] rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[#F57E3A]/50 focus:outline-none focus:ring-2 focus:ring-[#F57E3A]/25 disabled:cursor-not-allowed disabled:opacity-50";

export function CheckpointsTabs({
  upcoming,
  past,
  upcomingTotal,
  pastTotal,
  filterYear,
  filterMonth,
  error,
  isUnauthorized,
}: {
  upcoming: CheckpointListItem[];
  past: CheckpointListItem[];
  upcomingTotal: number;
  pastTotal: number;
  filterYear: number | null;
  filterMonth: number | null;
  error: string | null;
  isUnauthorized: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab: Tab = searchParams.get("tab") === "past" ? "past" : "upcoming";
  const activeList = tab === "upcoming" ? upcoming : past;
  const activeTotal = tab === "upcoming" ? upcomingTotal : pastTotal;

  function replaceParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const query = params.toString();
    router.replace(
      query ? `/dashboard/checkpoints?${query}` : "/dashboard/checkpoints",
      { scroll: false },
    );
  }

  function setTab(next: Tab) {
    replaceParams((params) => {
      if (next === "upcoming") {
        params.delete("tab");
      } else {
        params.set("tab", "past");
      }
    });
  }

  function setYear(value: string) {
    replaceParams((params) => {
      if (!value) {
        params.delete("year");
        params.delete("month");
      } else {
        params.set("year", value);
      }
    });
  }

  function setMonth(value: string) {
    replaceParams((params) => {
      if (!value) {
        params.delete("month");
      } else {
        params.set("month", value);
      }
    });
  }

  const emptyMessage =
    tab === "upcoming"
      ? filterYear
        ? `No upcoming checkpoints for ${formatCheckpointFilterLabel(filterYear, filterMonth)}.`
        : "No upcoming checkpoints scheduled."
      : filterYear
        ? `No past checkpoints for ${formatCheckpointFilterLabel(filterYear, filterMonth)}.`
        : "No past checkpoints found.";

  const yearOptions = getCheckpointYearOptions();
  const monthOptions = getCheckpointMonthOptions();

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="checkpoint-filter-year"
              className="font-montserrat text-xs font-semibold uppercase tracking-wider text-white/50"
            >
              Year
            </label>
            <select
              id="checkpoint-filter-year"
              value={filterYear ?? ""}
              onChange={(e) => setYear(e.target.value)}
              className={selectClassName}
              aria-label="Filter by year"
            >
              <option value="" className="bg-[#040F20]">
                All years
              </option>
              {yearOptions.map((y) => (
                <option key={y} value={String(y)} className="bg-[#040F20]">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="checkpoint-filter-month"
              className="font-montserrat text-xs font-semibold uppercase tracking-wider text-white/50"
            >
              Month
            </label>
            <select
              id="checkpoint-filter-month"
              value={filterMonth ?? ""}
              onChange={(e) => setMonth(e.target.value)}
              disabled={!filterYear}
              className={selectClassName}
              aria-label="Filter by month"
            >
              <option value="" className="bg-[#040F20]">
                All months
              </option>
              {monthOptions.map((m) => (
                <option
                  key={m.value}
                  value={String(m.value)}
                  className="bg-[#040F20]"
                >
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {(filterYear || filterMonth) && (
            <button
              type="button"
              onClick={() =>
                replaceParams((params) => {
                  params.delete("year");
                  params.delete("month");
                })
              }
              className="font-montserrat mb-0.5 h-10 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white/70 transition-colors hover:border-[#F57E3A]/40 hover:text-[#F57E3A]"
            >
              Clear dates
            </button>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Checkpoint filters"
          className="inline-flex w-fit rounded-lg border border-white/10 bg-white/5 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "upcoming"}
            onClick={() => setTab("upcoming")}
            className={`font-montserrat rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "upcoming"
                ? "bg-[#F57E3A] text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            Upcoming
            <span className="ml-1.5 text-xs opacity-80">({upcomingTotal})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "past"}
            onClick={() => setTab("past")}
            className={`font-montserrat rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "past"
                ? "bg-[#F57E3A] text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            Past
            <span className="ml-1.5 text-xs opacity-80">({pastTotal})</span>
          </button>
        </div>

        <p className="font-inter text-sm text-white/55">
          {filterYear ? (
            <>
              Showing {activeList.length} of {activeTotal}{" "}
              {tab === "upcoming" ? "upcoming" : "past"} checkpoint
              {activeTotal === 1 ? "" : "s"} for{" "}
              <span className="font-medium text-white/80">
                {formatCheckpointFilterLabel(filterYear, filterMonth)}
              </span>
              .
            </>
          ) : (
            <>
              Showing all {activeList.length}{" "}
              {tab === "upcoming" ? "upcoming" : "past"} checkpoint
              {activeTotal === 1 ? "" : "s"}.
            </>
          )}
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-inter text-sm text-red-200"
        >
          {isUnauthorized
            ? "Session expired. Please log in again."
            : `Could not load checkpoints: ${error}`}
        </div>
      ) : null}

      <CheckpointsTable checkpoints={activeList} emptyMessage={emptyMessage} />
    </>
  );
}
