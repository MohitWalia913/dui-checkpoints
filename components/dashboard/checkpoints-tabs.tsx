"use client";

import { CheckpointsTable } from "@/components/dashboard/checkpoints-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  filterCheckpointsBySearch,
  formatCheckpointFilterLabel,
  formatYearButtonLabel,
  getCheckpointMonthOptions,
  getCheckpointYearOptions,
  getDefaultFilterYear,
  hasActiveCheckpointFilters,
} from "@/lib/checkpoints/list-filters";
import type { CheckpointListItem } from "@/lib/checkpoints/types";
import { ChevronDown, RotateCcw, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type Tab = "upcoming" | "past";

const controlClassName =
  "font-montserrat h-10 shrink-0 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:border-[#F57E3A]/50 focus:outline-none focus:ring-2 focus:ring-[#F57E3A]/25 disabled:cursor-not-allowed disabled:opacity-50";

const filterPillActive =
  "bg-[#F57E3A] text-white";
const filterPillInactive =
  "text-white/70 hover:text-white";

const menuItemClass =
  "cursor-pointer rounded-md px-3 py-2 text-sm text-white/90 focus:bg-[#F57E3A]/25 focus:text-white data-[highlighted]:bg-[#F57E3A]/25 data-[highlighted]:text-white";

function FilterButtonGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="inline-flex shrink-0 flex-col gap-1"
      role="group"
      aria-label={label}
    >
      <span className="font-montserrat px-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
        {label}
      </span>
      <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
        {children}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-montserrat whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
        active ? filterPillActive : filterPillInactive
      }`}
    >
      {children}
    </button>
  );
}

export function CheckpointsTabs({
  upcoming,
  past,
  upcomingTotal,
  pastTotal,
  totalInWindow,
  filterYear,
  filterMonth,
  error,
  isUnauthorized,
}: {
  upcoming: CheckpointListItem[];
  past: CheckpointListItem[];
  upcomingTotal: number;
  pastTotal: number;
  totalInWindow: number;
  filterYear: number;
  filterMonth: number | null;
  error: string | null;
  isUnauthorized: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab: Tab = searchParams.get("tab") === "past" ? "past" : "upcoming";
  const [searchQuery, setSearchQuery] = useState("");

  const yearOptions = getCheckpointYearOptions();
  const monthOptions = getCheckpointMonthOptions();
  const defaultYear = getDefaultFilterYear();

  const monthLabel = filterMonth
    ? (monthOptions.find((m) => m.value === filterMonth)?.label ?? "Month")
    : "All months";

  const baseList = tab === "upcoming" ? upcoming : past;
  const countsAligned = pastTotal + upcomingTotal === totalInWindow;
  const dateFilterLabel = formatCheckpointFilterLabel(filterYear, filterMonth);

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

  function setYear(year: number) {
    replaceParams((params) => {
      params.set("year", String(year));
    });
  }

  function setMonth(month: number | null) {
    replaceParams((params) => {
      if (month === null) {
        params.delete("month");
      } else {
        params.set("month", String(month));
      }
    });
  }

  function resetFilters() {
    setSearchQuery("");
    const params = new URLSearchParams();
    params.set("year", String(defaultYear));
    router.replace(`/dashboard/checkpoints?${params.toString()}`, {
      scroll: false,
    });
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
      ? `No upcoming checkpoints for ${dateFilterLabel}.`
      : `No past checkpoints for ${dateFilterLabel}.`;

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-2">
          <div
            role="tablist"
            aria-label="Checkpoint schedule"
            className="inline-flex shrink-0 flex-col gap-1"
          >
            <span className="font-montserrat px-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
              Schedule
            </span>
            <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "upcoming"}
                onClick={() => setTab("upcoming")}
                className={`font-montserrat whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  tab === "upcoming" ? filterPillActive : filterPillInactive
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
                  tab === "past" ? filterPillActive : filterPillInactive
                }`}
              >
                Past
                <span className="ml-1 text-xs opacity-80">({pastTotal})</span>
              </button>
            </div>
          </div>

          <FilterButtonGroup label="Year">
            {yearOptions.map((y) => (
              <FilterPill
                key={y}
                active={filterYear === y}
                onClick={() => setYear(y)}
              >
                {formatYearButtonLabel(y)}
              </FilterPill>
            ))}
          </FilterButtonGroup>

          <FilterButtonGroup label="Month">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`font-montserrat inline-flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#F57E3A]/40 ${
                  filterMonth ? filterPillActive : filterPillInactive
                }`}
              >
                {monthLabel}
                <ChevronDown className="size-3.5 opacity-70" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="max-h-64 min-w-[10rem] overflow-y-auto rounded-lg border border-white/10 bg-[#0a1628] p-1 font-inter text-white shadow-lg"
              >
                <DropdownMenuItem
                  className={menuItemClass}
                  onSelect={() => setMonth(null)}
                >
                  All months
                  {!filterMonth ? (
                    <span className="ml-auto text-xs font-semibold text-[#F57E3A]">
                      ✓
                    </span>
                  ) : null}
                </DropdownMenuItem>
                {monthOptions.map((m) => (
                  <DropdownMenuItem
                    key={m.value}
                    className={menuItemClass}
                    onSelect={() => setMonth(m.value)}
                  >
                    {m.label}
                    {filterMonth === m.value ? (
                      <span className="ml-auto text-xs font-semibold text-[#F57E3A]">
                        ✓
                      </span>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </FilterButtonGroup>

          <label className="relative min-w-[140px] flex-1">
            <span className="font-montserrat mb-1 block px-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
              Search
            </span>
            <div className="relative">
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
            </div>
          </label>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!canReset}
            className="font-montserrat mb-0.5 inline-flex h-10 shrink-0 items-center gap-1.5 self-end whitespace-nowrap rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white/80 transition-colors hover:border-[#F57E3A]/40 hover:text-[#F57E3A] disabled:cursor-not-allowed disabled:opacity-40"
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
              {baseList.length === 1 ? "" : "s"} for{" "}
              <span className="font-medium text-white/80">{dateFilterLabel}</span>
              {" "}
              matching &ldquo;
              <span className="font-medium text-white/80">
                {searchQuery.trim()}
              </span>
              &rdquo;.
            </>
          ) : (
            <>
              Showing {filteredList.length} of{" "}
              {tab === "upcoming" ? upcomingTotal : pastTotal}{" "}
              {tab === "upcoming" ? "upcoming" : "past"} checkpoint
              {tab === "upcoming"
                ? upcomingTotal === 1
                  ? ""
                  : "s"
                : pastTotal === 1
                  ? ""
                  : "s"}{" "}
              for{" "}
              <span className="font-medium text-white/80">{dateFilterLabel}</span>
              .{" "}
              {countsAligned ? (
                <>
                  Total in range:{" "}
                  <span className="font-medium text-white/80">
                    {totalInWindow}
                  </span>{" "}
                  (Past {pastTotal} + Upcoming {upcomingTotal}).
                </>
              ) : null}
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
