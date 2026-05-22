"use client";

import { ReportCheckpointForm } from "@/components/checkpoints/report-checkpoint-form";
import type { DashboardUser } from "@/components/dashboard/dashboard-shell";
import { Megaphone } from "lucide-react";

export function ReportCheckpointPageContent({ user }: { user: DashboardUser }) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#F57E3A]/15 text-[#F57E3A]">
            <Megaphone className="size-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-montserrat text-2xl font-bold text-white md:text-3xl">
              Report a checkpoint
            </h1>
            <p className="font-inter mt-2 text-sm text-white/65 md:text-base">
              Submit a new DUI checkpoint for review. All fields marked with * are
              required and match our submission API.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <ReportCheckpointForm
            variant="dashboard"
            defaultReporterName={user.name}
            defaultReporterEmail={user.email}
          />
        </div>
      </div>
    </div>
  );
}
