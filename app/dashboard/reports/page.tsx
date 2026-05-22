import { CheckpointReportsPanel } from "@/components/dashboard/checkpoint-reports-panel";
import { ClipboardList } from "lucide-react";

export default function DashboardReportsPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#F57E3A]/15 text-[#F57E3A]">
          <ClipboardList className="size-6" aria-hidden />
        </span>
        <div>
          <p className="font-montserrat text-sm font-semibold uppercase tracking-wider text-[#F57E3A]">
            Moderation
          </p>
          <h1 className="font-montserrat mt-2 text-3xl font-bold text-white md:text-4xl">
            Review reports
          </h1>
          <p className="font-inter mt-3 max-w-2xl text-base leading-relaxed text-white/70">
            Approve user-submitted checkpoints to publish them on the live map and
            dashboard. Rejected reports stay out of the public database.
          </p>
        </div>
      </div>

      <CheckpointReportsPanel />
    </div>
  );
}
