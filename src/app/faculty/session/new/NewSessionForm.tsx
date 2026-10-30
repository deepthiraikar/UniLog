"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  CalendarDays,
  Clock,
  PlayCircle,
  BookOpen,
  Layers,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewSessionForm() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, classRes] = await Promise.all([
        fetch("/api/faculty/dashboard"),
        fetch("/api/faculty/classes"),
      ]);

      if (dashRes.ok) {
        const json = await dashRes.json();
        setDashboardData(json);
      }
      if (classRes.ok) {
        const json = await classRes.json();
        setClasses(json.classes || []);
        if (json.classes?.[0]) {
          setSelectedClassId(json.classes[0].classSectionId);
          setSelectedSubjectId(json.classes[0].subjectId);
        }
      }
    } catch (e) {
      toast.error("Failed to load session prerequisites");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTimetable = (t: any) => {
    setSelectedClassId(t.classSectionId);
    setSelectedSubjectId(t.subjectId);
    setStartTime(t.startTime);
    setEndTime(t.endTime);
    setRemarks(`Scheduled Lecture - ${t.subjectCode} (${t.room})`);
    toast.success(`Selected ${t.subjectCode} (${t.startTime}-${t.endTime})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSubjectId) {
      toast.error("Please select a class and subject");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/faculty/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classSectionId: selectedClassId,
          subjectId: selectedSubjectId,
          date,
          startTime,
          endTime,
          remarks,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Attendance session started!");
        router.push(`/faculty/session/${json.session.id}`);
      } else {
        toast.error(json.error || "Failed to start attendance session");
      }
    } catch (e) {
      toast.error("An error occurred starting session");
    } finally {
      setSubmitting(false);
    }
  };

  const timetable = dashboardData?.timeline || [];

  // Deduplicate sections so each class section appears exactly once with a unique key
  const uniqueSections = Array.from(
    new Map(classes.map((c) => [c.classSectionId, c])).values()
  );

  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    const matching = classes.filter((c) => c.classSectionId === newClassId);
    if (matching[0]) {
      setSelectedSubjectId(matching[0].subjectId);
    } else {
      setSelectedSubjectId("");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Start Attendance Session"
        description="Launch a live roll-call attendance session from timetable or custom lecture"
      />

      {/* Quick Pick: Today's Timetable Options */}
      {timetable.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#4F6AE8]" />
            <h3 className="text-sm font-semibold">
              Quick Pick: Today's Scheduled Lectures
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {timetable.map((t: any, idx: number) => (
              <div
                key={idx}
                onClick={() => handleSelectTimetable(t)}
                className="p-3.5 rounded-2xl neu-button cursor-pointer flex items-center justify-between transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#4F6AE8]">
                      {t.subjectCode}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      {t.sectionName}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">
                    {t.startTime} - {t.endTime} ({t.room})
                  </div>
                </div>
                <div className="p-2 rounded-xl neu-inset text-[#4F6AE8]">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Setup Form */}
      <div className="neu-raised rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                Class Section *
              </label>
              <select
                required
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full neu-input rounded-xl px-3 py-2 text-xs font-medium cursor-pointer"
              >
                <option value="">Select Section</option>
                {uniqueSections.map((c) => (
                  <option key={c.classSectionId} value={c.classSectionId}>
                    {c.sectionName} (Sem {c.semester})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                Assigned Subject *
              </label>
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full neu-input rounded-xl px-3 py-2 text-xs font-medium cursor-pointer"
              >
                <option value="">Select Subject</option>
                {classes
                  .filter((c) => !selectedClassId || c.classSectionId === selectedClassId)
                  .map((c) => (
                    <option key={c.assignmentId || `${c.classSectionId}-${c.subjectId}`} value={c.subjectId}>
                      {c.subjectCode} - {c.subjectName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                Date of Lecture *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full neu-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                Topic / Lecture Remarks (Optional)
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Chapter 4 - Normalization and BCNF"
                className="w-full neu-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-black/5 dark:border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="neu-button-primary rounded-xl px-6 py-2.5 text-xs font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{submitting ? "Starting Session..." : "Start Live Attendance"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
