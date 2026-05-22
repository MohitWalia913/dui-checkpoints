"use client";

import { CheckpointsTable } from "@/components/dashboard/checkpoints-table";
import {
  filterCheckpointsBySearch,
  formatCheckpointFilterLabel,
  getCheckpointMonthOptions,
  getCheckpointYearOptions,
  hasActiveCheckpointFilters,
} from "@/lib/checkpoints/list-filters";
import type { CheckpointListItem } from "@/lib/checkpoints/types";
import { RotateCcw, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type Tab = "upcoming" | "past";

const controlClassName =
  "font-montserrat h-10 shrink-0 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:border-[#F57E3A]/50 focus:outline-none focus:ring-2 focus:ring-[#F57E3A]/25 disabled:cursor-not-allowed disabled:opacity-50";

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
  const [searchQuery, setSearchQuery] = useState("");

  const baseList = tab === "upcoming" ? upcoming : past;
  const activeTotal = tab === "upcoming" ? upcomingTotal : pastTotal;

  const filteredList = useMemo(
    () => filterCheckpointsBySearch(baseList, searchQuery),
    [baseList, searchQuery],
  );

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

  function resetFilters() {
    setSearchQuery("");
    router.replace("/dashboard/checkpoints", { scroll: false });
  }

  const searchActive = searchQuery.trim().length > 0;
  const canReset = hasActiveCheckpointFilters(
    filterYear,
    filterMonth,
    searchQuery,
    tab,
  );

  const emptyMessage = searchActive
    ? "No checkpoints match your search."
    : tab === "upcoming"
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
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <select
            id="checkpoint-filter-year"
            value={filterYear ?? ""}
            onChange={(e) => setYear(e.target.value)}
            className={`${controlClassName} w-[108px] px-2.5`}
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

          <select
            id="checkpoint-filter-month"
            value={filterMonth ?? ""}
            onChange={(e) => setMonth(e.target.value)}
            disabled={!filterYear}
            className={`${controlClassName} w-[118px] px-2.5`}
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

          <div
            role="tablist"
            aria-label="Checkpoint schedule"
            className="inline-flex shrink-0 rounded-lg border border-white/10 bg-white/5 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "upcoming"}
              onClick={() => setTab("upcoming")}
              className={`font-montserrat whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                tab === "upcoming"
                  ? "bg-[#F57E3A] text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Upcoming
              <span className="ml-1 text-xs opacity-80">({upcomingTotal})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "past"}
              onClick={() => setTab("past")}
              className={`font-montserrat whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                tab === "past"
                  ? "bg-[#F57E3A] text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Past
              <span className="ml-1 text-xs opacity-80">({pastTotal})</span>
            </button>
          </div>

          <label className="relative min-w-[140px] flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, city, county…"
              className={`${controlClassName} w-full min-w-[140px] pl-9 pr-3 placeholder:text-white/40`}
              aria-label="Search checkpoints"
            />
          </label>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!canReset}
            className="font-montserrat inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white/80 transition-colors hover:border-[#F57E3A]/40 hover:text-[#F57E3A] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Reset all filters"
          >
            <RotateCcw className="size-3.5 shrink-0" aria-hidden />
            Reset
          </button>
        </div>

        <p className="font-inter text-sm text-white/55">
          {searchActive ? (
            <>
              Showing {filteredList.length} of {baseList.length}{" "}
              {tab === "upcoming" ? "upcoming" : "past"} checkpoint
              {baseList.length === 1 ? "" : "s"}
              {filterYear ? (
                <>
                  {" "}
                  for{" "}
                  <span className="font-medium text-white/80">
                    {formatCheckpointFilterLabel(filterYear, filterMonth)}
                  </span>
                </>
              ) : null}
              {searchQuery.trim() ? (
                <>
                  {" "}
                  matching &ldquo;
                  <span className="font-medium text-white/80">
                    {searchQuery.trim()}
                  </span>
                  &rdquo;.
                </>
              ) : (
                "."
              )}
            </>
          ) : filterYear ? (
            <>
              Showing {filteredList.length} of {activeTotal}{" "}
              {tab === "upcoming" ? "upcoming" : "past"} checkpoint
              {activeTotal === 1 ? "" : "s"} for{" "}
              <span className="font-medium text-white/80">
                {formatCheckpointFilterLabel(filterYear, filterMonth)}
              </span>
              .
            </>
          ) : (
            <>
              Showing all {filteredList.length}{" "}
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

      <CheckpointsTable checkpoints={filteredList} emptyMessage={emptyMessage} />
    </>
  );
}
