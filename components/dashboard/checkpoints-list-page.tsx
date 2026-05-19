import { CheckpointsTable } from "@/components/dashboard/checkpoints-table";
import type { CheckpointListItem } from "@/lib/checkpoints/types";
import Link from "next/link";

type CheckpointsListPageProps = {
  title: string;
  description: string;
  checkpoints: CheckpointListItem[];
  emptyMessage: string;
  error: string | null;
  isUnauthorized: boolean;
  alternateLink?: { href: string; label: string };
};

export function CheckpointsListPage({
  title,
  description,
  checkpoints,
  emptyMessage,
  error,
  isUnauthorized,
  alternateLink,
}: CheckpointsListPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-montserrat text-sm font-semibold uppercase tracking-wider text-[#F57E3A]">
            Checkpoints
          </p>
          <h1 className="font-montserrat mt-2 text-3xl font-bold text-white md:text-4xl">
            {title}
          </h1>
          <p className="font-inter mt-3 max-w-2xl text-base leading-relaxed text-white/70">
            {description}
          </p>
        </div>
        {alternateLink ? (
          <Link
            href={alternateLink.href}
            className="font-montserrat shrink-0 text-sm font-semibold text-[#F57E3A] hover:underline"
          >
            {alternateLink.label}
          </Link>
        ) : null}
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

      <CheckpointsTable checkpoints={checkpoints} emptyMessage={emptyMessage} />
    </div>
  );
}
