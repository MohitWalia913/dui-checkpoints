"use client";

import { CheckpointsTable } from "@/components/dashboard/checkpoints-table";
import type { CheckpointListItem } from "@/lib/checkpoints/types";
import { useRouter, useSearchParams } from "next/navigation";

type Tab = "upcoming" | "past";

export function CheckpointsTabs({
  upcoming,
  past,
  error,
  isUnauthorized,
}: {
  upcoming: CheckpointListItem[];
  past: CheckpointListItem[];
  error: string | null;
  isUnauthorized: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab: Tab = searchParams.get("tab") === "past" ? "past" : "upcoming";

  function setTab(next: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "upcoming") {
      params.delete("tab");
    } else {
      params.set("tab", "past");
    }
    const query = params.toString();
    router.replace(
      query ? `/dashboard/checkpoints?${query}` : "/dashboard/checkpoints",
      { scroll: false },
    );
  }

  const emptyMessage =
    tab === "upcoming"
      ? "No upcoming checkpoints scheduled."
      : "No past checkpoints found.";

  return (
    <>
      <div
        role="tablist"
        aria-label="Checkpoint filters"
        className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1"
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
          {upcoming.length > 0 ? (
            <span className="ml-1.5 text-xs opacity-80">({upcoming.length})</span>
          ) : null}
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
          {past.length > 0 ? (
            <span className="ml-1.5 text-xs opacity-80">({past.length})</span>
          ) : null}
        </button>
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

      <CheckpointsTable
        checkpoints={tab === "upcoming" ? upcoming : past}
        emptyMessage={emptyMessage}
      />
    </>
  );
}
