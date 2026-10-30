"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function StudentCalendarView() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [calendarData, setCalendarData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedDayInfo, setSelectedDayInfo] = useState<any | null>(null);

  useEffect(() => {
    fetchCalendar();
  }, [currentYear, currentMonth]);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/student/calendar?year=${currentYear}&month=${currentMonth}`
      );
      if (res.ok) {
        const json = await res.json();
        setCalendarData(json.calendarDays || {});
      }
    } catch (e) {
      toast.error("Failed to load attendance calendar");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar math
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Calendar"
        description="Daily lecture attendance tracking and institutional holidays calendar"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="neu-button p-2 rounded-xl text-[#64748B] hover:text-[#1E293B]"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-xs px-3 py-1.5 rounded-xl neu-inset min-w-[130px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="neu-button p-2 rounded-xl text-[#64748B] hover:text-[#1E293B]"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#64748B]">
            {WEEK_DAYS.map((wd) => (
              <div key={wd} className="py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {cells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="h-16" />;
              }

              const d = new Date(currentYear, currentMonth, dayNum);
              const dateKey = d.toISOString().split("T")[0];
              const dayData = calendarData[dateKey];

              let cellClasses = "neu-inset bg-black/5 dark:bg-white/5 text-[#94A3B8]";
              let indicator = null;

              if (dayData) {
                if (dayData.type === "ALL_PRESENT") {
                  cellClasses = "neu-raised bg-[#4CAF83]/15 text-[#4CAF83] border border-[#4CAF83]/40";
                  indicator = <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF83] mt-1" />;
                } else if (dayData.type === "PARTIAL") {
                  cellClasses = "neu-raised bg-[#E8A93C]/15 text-[#E8A93C] border border-[#E8A93C]/40";
                  indicator = <div className="w-1.5 h-1.5 rounded-full bg-[#E8A93C] mt-1" />;
                } else if (dayData.type === "ALL_ABSENT") {
                  cellClasses = "neu-raised bg-[#E05C5C]/15 text-[#E05C5C] border border-[#E05C5C]/40";
                  indicator = <div className="w-1.5 h-1.5 rounded-full bg-[#E05C5C] mt-1" />;
                } else if (dayData.type === "HOLIDAY") {
                  cellClasses = "neu-inset bg-[#4F6AE8]/10 text-[#4F6AE8] border border-dashed border-[#4F6AE8]/40";
                  indicator = <span className="text-[9px] font-bold text-[#4F6AE8]">HOL</span>;
                }
              }

              const isSelected = selectedDayInfo?.date === dateKey;

              return (
                <div
                  key={dateKey}
                  onClick={() => setSelectedDayInfo(dayData || { date: dateKey, day: dayNum, type: "NO_CLASS", sessions: [] })}
                  className={`h-16 p-2 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer ${cellClasses} ${
                    isSelected ? "ring-2 ring-[#4F6AE8]" : ""
                  }`}
                >
                  <span className="text-xs font-bold">{dayNum}</span>
                  {indicator}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-black/5 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF83]" />
              <span>Attended All</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8A93C]" />
              <span>Partial / Late</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E05C5C]" />
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F6AE8]" />
              <span>Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-black/20 dark:bg-white/20" />
              <span>No Class</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-black/5 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-semibold">
                {selectedDayInfo
                  ? `Activity on ${selectedDayInfo.date}`
                  : "Select a day to inspect"}
              </h3>
              <p className="text-xs text-[#64748B]">
                Lectures conducted and recorded attendance
              </p>
            </div>

            {!selectedDayInfo || selectedDayInfo.type === "NO_CLASS" ? (
              <div className="py-12 text-center text-xs text-[#64748B]">
                No lectures recorded for this date
              </div>
            ) : selectedDayInfo.type === "HOLIDAY" ? (
              <div className="p-4 rounded-2xl neu-inset text-center space-y-1">
                <span className="text-xs font-bold text-[#4F6AE8]">Official Holiday</span>
                <p className="text-sm font-semibold">{selectedDayInfo.holidayName}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDayInfo.sessions.map((sess: any, i: number) => {
                  let statusBg = "text-[#4CAF83] bg-[#4CAF83]/10";
                  if (sess.status === "ABSENT") statusBg = "text-[#E05C5C] bg-[#E05C5C]/10";
                  else if (sess.status === "LATE") statusBg = "text-[#E8A93C] bg-[#E8A93C]/10";

                  return (
                    <div
                      key={i}
                      className="p-3 rounded-2xl neu-flat bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold">{sess.subjectCode}</div>
                        <div className="text-[11px] text-[#64748B]">{sess.subjectName}</div>
                        <div className="text-[10px] text-[#94A3B8] mt-0.5">{sess.time}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full neu-pressed text-[10px] font-bold ${statusBg}`}>
                        {sess.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-black/5 dark:border-slate-800 text-[11px] text-[#94A3B8] text-center">
            Click on any day in the calendar to view subject-wise roll call
          </div>
        </div>
      </div>
    </div>
  );
}
