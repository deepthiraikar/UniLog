import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
  className,
}: StatCardProps) {
  let toneClasses = "text-slate-900 dark:text-slate-100";
  let iconBgClasses = "text-blue-600 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40";

  switch (tone) {
    case "good":
      toneClasses = "text-emerald-600 dark:text-emerald-400";
      iconBgClasses = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40";
      break;
    case "warn":
      toneClasses = "text-amber-600 dark:text-amber-400";
      iconBgClasses = "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40";
      break;
    case "bad":
      toneClasses = "text-rose-600 dark:text-rose-400";
      iconBgClasses = "text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40";
      break;
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {Icon && (
          <div className={cn("p-2 rounded-xl", iconBgClasses)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <div className={cn("text-2xl font-bold tracking-tight", toneClasses)}>
          {value}
        </div>
        {hint && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
