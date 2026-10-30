import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Attendance calculation helpers
 * Overall % = (present + excused) / total sessions
 * At-risk = percentage < minPercentage
 * Needed = ceil((min*total - 100*present)/(100-min))
 */
export function calculateAttendancePercentage(presentAndExcused: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((presentAndExcused / total) * 1000) / 10;
}

export function calculateClassesNeeded(
  presentAndExcused: number,
  total: number,
  minPercentage: number = 75
): number {
  if (total <= 0) return 0;
  const currentPct = (presentAndExcused / total) * 100;
  if (currentPct >= minPercentage) return 0;

  // ceil((min * total - 100 * present) / (100 - min))
  const numerator = minPercentage * total - 100 * presentAndExcused;
  const denominator = 100 - minPercentage;
  if (denominator <= 0) return 0;

  const needed = Math.ceil(numerator / denominator);
  return Math.max(0, needed);
}
