"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AttendanceRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  minThreshold?: number;
  subtitle?: string;
  className?: string;
}

export function AttendanceRing({
  percentage,
  size = 200,
  strokeWidth = 14,
  minThreshold = 75,
  subtitle = "Overall Attendance",
  className,
}: AttendanceRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clampedPct / 100) * circumference;

  let strokeColor = "#10B981"; // emerald
  let textColor = "text-emerald-600 dark:text-emerald-400";

  if (clampedPct < minThreshold - 15) {
    strokeColor = "#EF4444"; // rose
    textColor = "text-rose-600 dark:text-rose-400";
  } else if (clampedPct < minThreshold) {
    strokeColor = "#F59E0B"; // amber
    textColor = "text-amber-600 dark:text-amber-400";
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs",
        className
      )}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={cn("text-3xl sm:text-4xl font-extrabold tracking-tight", textColor)}>
            {clampedPct.toFixed(1)}%
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {clampedPct >= minThreshold ? "Safe Zone" : "At Risk"}
          </span>
        </div>
      </div>

      {subtitle && (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-4 text-center">
          {subtitle}
        </p>
      )}
    </div>
  );
}
