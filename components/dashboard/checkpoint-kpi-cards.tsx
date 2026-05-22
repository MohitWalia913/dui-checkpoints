import { CalendarClock, CalendarRange, MapPin, Shield } from "lucide-react";
import type { CheckpointStats } from "@/lib/checkpoints/types";

const KPI_CONFIG = [
  {
    key: "upcoming" as const,
    label: "Upcoming checkpoints",
    description: "Scheduled from today onward",
    icon: CalendarClock,
    accent: "text-[#F57E3A]",
    glow: "from-[#F57E3A]/20",
  },
  {
    key: "thisWeek" as const,
    label: "This week",
    description: "Checkpoints in the current week",
    icon: CalendarRange,
    accent: "text-sky-300",
    glow: "from-sky-400/15",
  },
  {
    key: "counties" as const,
    label: "Counties covered",
    description: "Active counties in database",
    icon: MapPin,
    accent: "text-emerald-300",
    glow: "from-emerald-400/15",
  },
  {
    key: "total" as const,
    label: "Total records",
    description: "Checkpoints in the last 365 days",
    icon: Shield,
    accent: "text-violet-300",
    glow: "from-violet-400/15",
  },
];

export function CheckpointKpiCards({ stats }: { stats: CheckpointStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_CONFIG.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key];

        return (
          <article
            key={item.key}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5"
          >
            <div
              className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${item.glow} to-transparent blur-2xl`}
              aria-hidden
            />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="font-montserrat text-xs font-semibold uppercase tracking-wider text-white/50">
                  {item.label}
                </p>
                <p className="font-montserrat mt-2 text-3xl font-bold tabular-nums text-white">
                  {value.toLocaleString()}
                </p>
                <p className="font-inter mt-1 text-xs text-white/55">
                  {item.description}
                </p>
              </div>
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/5 ${item.accent}`}
              >
                <Icon className="size-5" aria-hidden />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
