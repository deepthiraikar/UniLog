import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const norm = (status || "").toUpperCase();

  let colorClasses = "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700";

  switch (norm) {
    case "PRESENT":
    case "APPROVED":
    case "PUBLISHED":
    case "SUCCESS":
      colorClasses = "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60";
      break;
    case "ABSENT":
    case "REJECTED":
    case "DANGER":
    case "AT_RISK":
    case "AT RISK":
      colorClasses = "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60";
      break;
    case "LATE":
    case "UNDER_REVIEW":
    case "WARNING":
    case "DRAFT":
      colorClasses = "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60";
      break;
    case "EXCUSED":
    case "SUBMITTED":
    case "ACTIVE":
    case "INFO":
      colorClasses = "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60";
      break;
    case "ENDED":
      colorClasses = "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700";
      break;
  }

  const label = norm.replace("_", " ");

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold select-none tracking-wide",
        colorClasses,
        className
      )}
    >
      {label}
    </span>
  );
}
