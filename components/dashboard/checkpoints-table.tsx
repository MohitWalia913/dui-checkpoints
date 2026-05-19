import {
  formatCheckpointDate,
  isCheckpointUpcoming,
} from "@/lib/checkpoints/date";
import type { CheckpointListItem } from "@/lib/checkpoints/types";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

function StatusBadge({ date }: { date: string }) {
  const upcoming = isCheckpointUpcoming(date);

  return (
    <span
      className={`font-montserrat inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        upcoming
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-white/10 text-white/60"
      }`}
    >
      {upcoming ? "Upcoming" : "Past"}
    </span>
  );
}

export function CheckpointsTable({
  checkpoints,
  emptyMessage,
}: {
  checkpoints: CheckpointListItem[];
  emptyMessage: string;
}) {
  if (checkpoints.length === 0) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="font-montserrat text-lg font-semibold text-white">
          {emptyMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="font-montserrat px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/50 md:px-6">
                Status
              </th>
              <th className="font-montserrat px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                Location
              </th>
              <th className="font-montserrat px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                City
              </th>
              <th className="font-montserrat px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                County
              </th>
              <th className="font-montserrat px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                Date
              </th>
              <th className="font-montserrat px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                Time
              </th>
              <th className="font-montserrat px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/50 md:px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {checkpoints.map((checkpoint) => (
              <tr
                key={checkpoint.id}
                className="transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-4 md:px-6">
                  <StatusBadge date={checkpoint.Date} />
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/dashboard/checkpoints/${checkpoint.id}`}
                    className="font-montserrat text-sm font-semibold text-white hover:text-[#F57E3A]"
                  >
                    {checkpoint.Location}
                  </Link>
                  <p className="font-inter mt-0.5 text-xs text-white/50">
                    {checkpoint.State}
                  </p>
                </td>
                <td className="font-inter px-4 py-4 text-sm text-white/80">
                  {checkpoint.City}
                </td>
                <td className="font-inter px-4 py-4 text-sm text-white/80">
                  {checkpoint.County}
                </td>
                <td className="font-inter whitespace-nowrap px-4 py-4 text-sm text-white/80">
                  {formatCheckpointDate(checkpoint.Date)}
                </td>
                <td className="font-inter px-4 py-4 text-sm text-white/70">
                  {checkpoint.Time}
                </td>
                <td className="px-4 py-4 text-right md:px-6">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/dashboard/checkpoints/${checkpoint.id}`}
                      className="font-montserrat text-xs font-semibold text-[#F57E3A] hover:underline"
                    >
                      Details
                    </Link>
                    {checkpoint.mapurl ? (
                      <a
                        href={checkpoint.mapurl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-montserrat inline-flex items-center gap-0.5 text-xs font-semibold text-white/70 hover:text-white"
                      >
                        Map
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
