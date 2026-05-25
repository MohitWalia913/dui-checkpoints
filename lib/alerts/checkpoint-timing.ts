import { getTodayDateString } from "@/lib/checkpoints/date";

/** Hours from now until checkpoint date (noon local) — positive = future. */
export function hoursUntilCheckpointDate(dateStr: string): number | null {
  const parts = dateStr.trim().split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return null;
  }

  const [year, month, day] = parts;
  const event = new Date(year, month - 1, day, 12, 0, 0, 0);
  const diffMs = event.getTime() - Date.now();
  return diffMs / (1000 * 60 * 60);
}

export function isUpcomingWithinLeadTime(
  dateStr: string,
  leadTimeHours: number,
): boolean {
  if (dateStr < getTodayDateString()) return false;
  const hours = hoursUntilCheckpointDate(dateStr);
  if (hours === null) return false;
  return hours > 0 && hours <= leadTimeHours;
}
