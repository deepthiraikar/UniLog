"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  CalendarDays,
  Clock,
  PlayCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function FacultyDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>({ timeline: [], recentSessions: [], dayName: "Today" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/faculty/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleTakeAttendance = async (item: any) => {
    if (item.existingSession) {
      router.push(`/faculty/session/${item.existingSession.id}`);
      return;
    }

    // Start a new session directly for this slot
    try {
      const now = new Date();
      const res = await fetch("/api/faculty/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classSectionId: item.classSectionId,
          subjectId: item.subjectId,
          date: now.toISOString(),
          startTime: item.startTime,
          endTime: item.endTime,
          remarks: `Scheduled lecture for ${item.subjectCode}`,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Attendance session started!");
        router.push(`/faculty/session/${json.session.id}`);
      } else {
        if (json.existingSessionId) {
          router.push(`/faculty/session/${json.existingSessionId}`);
        } else {
          toast.error(json.error || "Failed to start session");
        }
      }
    } catch (e) {
      toast.error("An error occurred starting session");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 rounded-xl neu-raised bg-black/5 dark:bg-white/5 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl neu-raised bg-black/5 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const timeline = data.timeline || [];
  const recentSessions = data.recentSessions || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Faculty Teaching Dashboard"
        description={`Today's schedule (${data.dayName}) and recent attendance records`}
        actions={
          <Link
            href="/faculty/session/new"
            className="neu-button-primary rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Ad-Hoc Session</span>
          </Link>
        }
      />

      {/* Today's Teaching Timeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#4F6AE8]" />
            <h2 className="text-sm font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
              Today's Teaching Timeline
            </h2>
          </div>
          <span className="text-xs text-[#64748B]">
            {timeline.length} classes scheduled today
          </span>
        </div>

        {timeline.length === 0 ? (
          <div className="neu-raised rounded-2xl p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-[#64748B]">
              No classes scheduled on your timetable for today.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeline.map((item: any, i: number) => {
              const hasExisting = Boolean(item.existingSession);
              const isEnded = item.existingSession?.status === "ENDED";

              return (
                <div
                  key={i}
                  className="neu-raised rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full neu-pressed text-[#4F6AE8] text-[11px] font-bold">
                        {item.sectionName}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.startTime} - {item.endTime}</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-[#1E293B] dark:text-[#F1F5F9]">
                      {item.subjectCode}: {item.subjectName}
                    </h3>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                      Venue: {item.room}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-black/5 dark:border-slate-800 flex items-center justify-between">
                    {hasExisting ? (
                      <span className="text-[11px] font-semibold text-[#4CAF83] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isEnded ? "Attendance Recorded" : "Session Active"}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#64748B]">
                        Pending attendance
                      </span>
                    )}

                    <button
                      onClick={() => handleTakeAttendance(item)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer ${
                        isEnded
                          ? "neu-button text-[#64748B]"
                          : "neu-button-primary"
                      }`}
                    >
                      {isEnded
                        ? "View Summary"
                        : hasExisting
                        ? "Resume Marking"
                        : "Take Attendance"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Sessions List */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#4F6AE8]" />
          <h2 className="text-sm font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
            Recent Attendance Sessions
          </h2>
        </div>

        <div className="neu-raised rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {recentSessions.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#64748B]">
              No past sessions recorded yet
            </p>
          ) : (
            recentSessions.map((s: any) => (
              <div
                key={s.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                      {s.subjectCode} ({s.sectionName})
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      {s.subjectName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] mt-0.5">
                    <span>{s.date}</span>
                    <span>•</span>
                    <span>{s.startTime} - {s.endTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-xs text-[#4CAF83]">
                      {s.presentCount} / {s.totalCount} Present
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      {s.totalCount > 0
                        ? `${Math.round((s.presentCount / s.totalCount) * 100)}% compliance`
                        : "No students"}
                    </div>
                  </div>

                  <Link
                    href={`/faculty/session/${s.id}`}
                    className="neu-button px-3 py-1.5 rounded-xl text-xs font-medium text-[#4F6AE8] flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
