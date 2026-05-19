import { formatCheckpointDate } from "@/lib/checkpoints/date";
import type { CheckpointListItem } from "@/lib/checkpoints/types";
import { Calendar, Clock, ExternalLink, MapPin } from "lucide-react";
export function UpcomingCheckpoints({
  checkpoints,
}: {
  checkpoints: CheckpointListItem[];
}) {
  if (checkpoints.length === 0) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="font-montserrat text-lg font-semibold text-white">
          No upcoming checkpoints
        </p>
        <p className="font-inter mt-2 text-sm text-white/60">
          New DUI checkpoints will appear here when they are added to the
          database.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5">
      <div className="border-b border-white/10 px-5 py-4 md:px-6">
        <h2 className="font-montserrat text-lg font-semibold text-white">
          Upcoming checkpoints
        </h2>
        <p className="font-inter mt-1 text-sm text-white/60">
          Sorted by date — next scheduled DUI checkpoints in California
        </p>
      </div>

      <ul className="divide-y divide-white/10">
        {checkpoints.map((checkpoint) => (
          <li
            key={checkpoint.id}
            className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-white/[0.03] md:flex-row md:items-start md:justify-between md:px-6"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-montserrat inline-flex items-center rounded-full bg-[#F57E3A]/15 px-2.5 py-0.5 text-xs font-semibold text-[#F57E3A]">
                  {checkpoint.State}
                </span>
                <span className="font-inter text-sm font-medium text-white/80">
                  {checkpoint.County} · {checkpoint.City}
                </span>
              </div>

              <p className="font-montserrat flex items-start gap-2 text-base font-semibold text-white">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-[#F57E3A]"
                  aria-hidden
                />
                <span>{checkpoint.Location}</span>
              </p>

              <div className="font-inter flex flex-wrap gap-4 text-sm text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-[#F57E3A]" aria-hidden />
                  {formatCheckpointDate(checkpoint.Date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-[#F57E3A]" aria-hidden />
                  {checkpoint.Time}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {checkpoint.mapurl ? (
                <a
                  href={checkpoint.mapurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-montserrat inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-[#F57E3A]/40 hover:text-[#F57E3A]"
                >
                  <MapPin className="size-3.5" aria-hidden />
                  Map
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              ) : null}
              {checkpoint.Source ? (
                <a
                  href={checkpoint.Source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-montserrat inline-flex items-center gap-1.5 rounded-lg bg-[#F57E3A] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Source
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
