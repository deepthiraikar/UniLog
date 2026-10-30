"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  CheckCircle,
  XCircle,
  Clock,
  Save,
  Check,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Users,
  Award,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LiveSessionMarkingProps {
  sessionId: string;
}

export function LiveSessionMarking({ sessionId }: LiveSessionMarkingProps) {
  const router = useRouter();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ending, setEnding] = useState(false);
  const [sessionEndedView, setSessionEndedView] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/faculty/session?sessionId=${sessionId}`);
      if (res.ok) {
        const json = await res.json();
        setSessionInfo(json.session);

        // Check local storage for unsaved draft if session is still active
        const localKey = `attendance_draft_${sessionId}`;
        const localDraft = localStorage.getItem(localKey);

        if (json.session.status === "ACTIVE" && localDraft) {
          try {
            const parsed = JSON.parse(localDraft);
            setRoster(parsed);
            toast.info("Restored autosaved draft from browser storage");
          } catch (e) {
            setRoster(json.roster || []);
          }
        } else {
          setRoster(json.roster || []);
        }

        if (json.session.status === "ENDED") {
          setSessionEndedView(true);
        }
      } else {
        toast.error("Session not found or access denied");
      }
    } catch (e) {
      toast.error("Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, newStatus: string) => {
    if (sessionInfo?.isReadOnly) return;

    setRoster((prev) => {
      const updated = prev.map((s) =>
        s.studentId === studentId ? { ...s, currentStatus: newStatus } : s
      );
      // Autosave to localStorage
      localStorage.setItem(`attendance_draft_${sessionId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const markAllPresent = () => {
    if (sessionInfo?.isReadOnly) return;
    setRoster((prev) => {
      const updated = prev.map((s) => ({ ...s, currentStatus: "PRESENT" }));
      localStorage.setItem(`attendance_draft_${sessionId}`, JSON.stringify(updated));
      return updated;
    });
    toast.success("All students marked Present");
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const records = roster.map((r) => ({
        studentId: r.studentId,
        status: r.currentStatus,
      }));

      const res = await fetch("/api/faculty/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          records,
          endSession: false,
        }),
      });

      if (res.ok) {
        toast.success("Draft saved to server!");
      } else {
        toast.error("Failed to save draft");
      }
    } catch (e) {
      toast.error("Error saving draft");
    } finally {
      setSaving(false);
    }
  };

  const handleEndSession = async () => {
    try {
      setEnding(true);
      const records = roster.map((r) => ({
        studentId: r.studentId,
        status: r.currentStatus,
      }));

      const res = await fetch("/api/faculty/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          records,
          endSession: true,
        }),
      });

      if (res.ok) {
        localStorage.removeItem(`attendance_draft_${sessionId}`);
        toast.success("Session closed and attendance locked!");
        setSessionEndedView(true);
        fetchSession();
      } else {
        toast.error("Failed to finalize session");
      }
    } catch (e) {
      toast.error("Error ending session");
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 rounded-2xl neu-raised bg-black/5 animate-pulse" />
        <div className="h-96 rounded-2xl neu-raised bg-black/5 animate-pulse" />
      </div>
    );
  }

  if (!sessionInfo) {
    return (
      <div className="neu-raised rounded-2xl p-10 text-center">
        <p className="text-sm text-[#64748B]">Session not available.</p>
        <Link href="/faculty" className="text-xs text-[#4F6AE8] mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const presentCount = roster.filter((r) => r.currentStatus === "PRESENT").length;
  const absentCount = roster.filter((r) => r.currentStatus === "ABSENT").length;
  const lateCount = roster.filter((r) => r.currentStatus === "LATE").length;
  const excusedCount = roster.filter((r) => r.currentStatus === "EXCUSED").length;

  return (
    <div className="space-y-6 pb-20">
      {/* Back button & Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/faculty"
          className="neu-button p-2 rounded-xl text-[#64748B] hover:text-[#1E293B]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">
              {sessionInfo.subjectCode}: {sessionInfo.subjectName}
            </h1>
            <StatusBadge status={sessionInfo.status} />
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Section {sessionInfo.sectionName} • {sessionInfo.date} • {sessionInfo.startTime} - {sessionInfo.endTime}
          </p>
        </div>
      </div>

      {/* Edit window expired banner if applicable */}
      {sessionInfo.isReadOnly && (
        <div className="p-4 rounded-2xl neu-inset bg-[#E8A93C]/10 border border-[#E8A93C]/30 flex items-center justify-between text-xs text-[#E8A93C]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              The {sessionInfo.editWindowMinutes}-minute edit window has elapsed. This session record is locked.
            </span>
          </div>
          <span className="font-semibold text-[11px] underline cursor-pointer">
            Request override from admin
          </span>
        </div>
      )}

      {/* Post-session summary banner if ended */}
      {sessionInfo.status === "ENDED" && (
        <div className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#4CAF83]" />
              <h3 className="text-sm font-bold text-[#4CAF83]">
                Attendance Finalized & Recorded
              </h3>
            </div>
            <span className="text-xs text-[#64748B]">
              Total enrolled: {roster.length}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl neu-inset">
              <div className="text-lg font-bold text-[#4CAF83]">{presentCount}</div>
              <div className="text-[10px] text-[#64748B] font-medium">Present</div>
            </div>
            <div className="p-3 rounded-2xl neu-inset">
              <div className="text-lg font-bold text-[#E05C5C]">{absentCount}</div>
              <div className="text-[10px] text-[#64748B] font-medium">Absent</div>
            </div>
            <div className="p-3 rounded-2xl neu-inset">
              <div className="text-lg font-bold text-[#E8A93C]">{lateCount}</div>
              <div className="text-[10px] text-[#64748B] font-medium">Late</div>
            </div>
            <div className="p-3 rounded-2xl neu-inset">
              <div className="text-lg font-bold text-[#4F6AE8]">{excusedCount}</div>
              <div className="text-[10px] text-[#64748B] font-medium">Excused</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Quick Action Bar */}
      {sessionInfo.status === "ACTIVE" && !sessionInfo.isReadOnly && (
        <div className="flex items-center justify-between p-4 rounded-2xl neu-raised bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-[#64748B]">
            Mark individual status below or use quick actions:
          </div>
          <button
            onClick={markAllPresent}
            className="neu-button px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#4CAF83] flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>
        </div>
      )}

      {/* Roster Table with Neumorphic Toggle Buttons */}
      <div className="neu-raised rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-black/5 dark:border-slate-800 z-10">
              <tr>
                <th className="py-3 px-4 font-semibold text-[#64748B]">Roll No</th>
                <th className="py-3 px-4 font-semibold text-[#64748B]">Student</th>
                <th className="py-3 px-4 font-semibold text-[#64748B] text-right">
                  Attendance Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {roster.map((student) => {
                const s = student.currentStatus;

                return (
                  <tr
                    key={student.studentId}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  >
                    <td className="py-3 px-4 font-medium">{student.rollNo}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{student.name}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 p-1 rounded-2xl neu-inset">
                        <button
                          type="button"
                          disabled={sessionInfo.isReadOnly}
                          onClick={() => handleStatusChange(student.studentId, "PRESENT")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            s === "PRESENT"
                              ? "neu-raised text-[#4CAF83] bg-white dark:bg-slate-900"
                              : "text-[#64748B] hover:text-[#1E293B]"
                          }`}
                        >
                          Present
                        </button>

                        <button
                          type="button"
                          disabled={sessionInfo.isReadOnly}
                          onClick={() => handleStatusChange(student.studentId, "ABSENT")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            s === "ABSENT"
                              ? "neu-raised text-[#E05C5C] bg-white dark:bg-slate-900"
                              : "text-[#64748B] hover:text-[#1E293B]"
                          }`}
                        >
                          Absent
                        </button>

                        <button
                          type="button"
                          disabled={sessionInfo.isReadOnly}
                          onClick={() => handleStatusChange(student.studentId, "LATE")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            s === "LATE"
                              ? "neu-raised text-[#E8A93C] bg-white dark:bg-slate-900"
                              : "text-[#64748B] hover:text-[#1E293B]"
                          }`}
                        >
                          Late
                        </button>

                        <button
                          type="button"
                          disabled={sessionInfo.isReadOnly}
                          onClick={() => handleStatusChange(student.studentId, "EXCUSED")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            s === "EXCUSED"
                              ? "neu-raised text-[#4F6AE8] bg-white dark:bg-slate-900"
                              : "text-[#64748B] hover:text-[#1E293B]"
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Bottom Bar for Saving & Ending Session */}
      {!sessionInfo.isReadOnly && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-black/5 dark:border-slate-800 py-3 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-xs text-[#64748B]">
              <span className="font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                {presentCount} Present
              </span>{" "}
              • {absentCount} Absent • {lateCount} Late
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={saving || ending}
                onClick={handleSaveDraft}
                className="neu-button px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Save Draft"}</span>
              </button>

              <button
                type="button"
                disabled={saving || ending}
                onClick={handleEndSession}
                className="neu-button-primary px-5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{ending ? "Finalizing..." : "End Session"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
