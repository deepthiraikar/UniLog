"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Clock, BookOpen, Layers } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function StudentTimetableView() {
  const [entries, setEntries] = useState<any[]>([]);
  const [sectionName, setSectionName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/timetable");
      if (res.ok) {
        const json = await res.json();
        setEntries(json.entries || []);
        if (json.currentSectionName) {
          setSectionName(json.currentSectionName);
        } else if (json.sections?.[0]) {
          setSectionName(json.sections[0].name);
        }
      }
    } catch (e) {
      toast.error("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Timetable"
        description={`Weekly academic schedule for ${sectionName || "Section CSE-3A"}`}
      />

      <div className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="grid grid-cols-6 gap-3 min-w-[700px]">
          {DAYS.map((dayName, dayIndex) => {
            const dayNum = dayIndex + 1;
            const dayEntries = entries.filter((e) => e.dayOfWeek === dayNum);

            return (
              <div key={dayNum} className="flex flex-col space-y-2">
                <div className="p-2.5 rounded-xl neu-pressed text-center text-xs font-bold text-[#4F6AE8]">
                  {dayName}
                </div>

                <div className="space-y-2 min-h-[300px]">
                  {dayEntries.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-4 rounded-2xl neu-inset text-[11px] text-[#94A3B8]">
                      No classes
                    </div>
                  ) : (
                    dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="neu-raised rounded-2xl p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-[#4F6AE8]">
                              {entry.subject?.code}
                            </span>
                            <span className="text-[10px] text-[#94A3B8]">
                              {entry.room || "Room 101"}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold leading-tight line-clamp-2">
                            {entry.subject?.name}
                          </h4>
                        </div>

                        <div className="mt-3 pt-2 border-t border-black/5 dark:border-slate-800">
                          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                            {entry.faculty?.user?.name}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-[#94A3B8] mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {entry.startTime} - {entry.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
