"use client";

import { formatCheckpointDate } from "@/lib/checkpoints/date";
import type { CheckpointReport, CheckpointReportStatus } from "@/lib/checkpoints/types";
import { cn } from "@/lib/utils";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Tab = CheckpointReportStatus | "all";

function StatusBadge({ status }: { status: CheckpointReportStatus }) {
  return (
    <span
      className={cn(
        "font-montserrat rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        status === "pending" && "bg-amber-500/15 text-amber-300",
        status === "approved" && "bg-emerald-500/15 text-emerald-300",
        status === "rejected" && "bg-red-500/15 text-red-300",
      )}
    >
      {status}
    </span>
  );
}

export function CheckpointReportsPanel() {
  const [tab, setTab] = useState<Tab>("pending");
  const [reports, setReports] = useState<CheckpointReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = tab === "all" ? "" : `?status=${tab}`;
    const response = await fetch(`/api/checkpoints/reports${query}`);
    const json = (await response.json().catch(() => ({}))) as {
      data?: CheckpointReport[];
      error?: string;
    };

    setLoading(false);

    if (!response.ok) {
      setError(json.error ?? `Failed to load reports (${response.status})`);
      setReports([]);
      return;
    }

    setReports(json.data ?? []);
  }, [tab]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  async function moderate(
    id: number,
    action: "approve" | "reject",
    adminNotes?: string,
  ) {
    setActingId(id);
    setError(null);

    const response = await fetch(`/api/checkpoints/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, admin_notes: adminNotes }),
    });

    const json = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    setActingId(null);

    if (!response.ok) {
      setError(json.error ?? `Could not ${action} report`);
      return;
    }

    await loadReports();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Report status"
        className="inline-flex flex-wrap gap-1 rounded-lg border border-white/10 bg-white/5 p-1"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "font-montserrat rounded-md px-4 py-2 text-sm font-semibold transition-colors",
              tab === item.id
                ? "bg-[#F57E3A] text-white"
                : "text-white/70 hover:text-white",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-inter text-sm text-red-200"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-white/50">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          <span className="font-inter text-sm">Loading reports…</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-12 text-center">
          <p className="font-montserrat text-lg font-semibold text-white">
            No {tab === "all" ? "" : `${tab} `}reports
          </p>
          <p className="font-inter mt-2 text-sm text-white/55">
            User submissions from the homepage or report form appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => {
            const busy = actingId === report.id;

            return (
              <li
                key={report.id}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-5 md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-montserrat text-xs font-semibold uppercase tracking-wider text-white/45">
                      Report #{report.id}
                    </p>
                    <p className="font-montserrat mt-1 text-lg font-semibold text-white">
                      {report.Location}
                    </p>
                    <p className="font-inter text-sm text-white/65">
                      {report.City}, {report.County} · {report.State}
                    </p>
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                <dl className="font-inter mt-4 grid gap-2 text-sm text-white/75 sm:grid-cols-2">
                  <div>
                    <dt className="text-white/45">Date / time</dt>
                    <dd>
                      {formatCheckpointDate(report.Date)} · {report.Time}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/45">Reporter</dt>
                    <dd>
                      {report.reporter_name} ({report.reporter_email})
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-white/45">Description</dt>
                    <dd className="whitespace-pre-wrap">{report.Description}</dd>
                  </div>
                  {report.Source ? (
                    <div className="sm:col-span-2">
                      <dt className="text-white/45">Source</dt>
                      <dd className="break-all">{report.Source}</dd>
                    </div>
                  ) : null}
                </dl>

                {report.status === "approved" && report.approved_checkpoint_id ? (
                  <p className="font-inter mt-4 text-sm">
                    <Link
                      href={`/dashboard/checkpoints/${report.approved_checkpoint_id}`}
                      className="inline-flex items-center gap-1 font-semibold text-[#F57E3A] hover:underline"
                    >
                      View live checkpoint #{report.approved_checkpoint_id}
                      <ExternalLink className="size-3.5" aria-hidden />
                    </Link>
                  </p>
                ) : null}

                {report.status === "pending" ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void moderate(report.id, "approve")}
                      className="font-montserrat inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <Check className="size-4" aria-hidden />
                      )}
                      Approve & publish to map
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void moderate(report.id, "reject")}
                      className="font-montserrat inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-red-400/50 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <X className="size-4" aria-hidden />
                      Reject
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
