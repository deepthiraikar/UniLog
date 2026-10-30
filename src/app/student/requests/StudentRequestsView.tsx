"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  ExternalLink,
  X,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function StudentRequestsView() {
  const [requests, setRequests] = useState<any[]>([]);
  const [eligibleSessions, setEligibleSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/requests");
      if (res.ok) {
        const json = await res.json();
        setRequests(json.requests || []);
        setEligibleSessions(json.eligibleSessions || []);
        if (json.eligibleSessions?.[0]) {
          setSelectedSessionId(json.eligibleSessions[0].sessionId);
        }
      }
    } catch (e) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !reason.trim()) {
      toast.error("Please select a session and provide a reason");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("sessionId", selectedSessionId);
      formData.append("reason", reason);
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/student/requests", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Correction request submitted for faculty review!");
        setDialogOpen(false);
        setReason("");
        setFile(null);
        fetchRequests();
      } else {
        toast.error("Failed to submit request");
      }
    } catch (e) {
      toast.error("An error occurred submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Correction Appeals"
        description="Submit official rectification requests with documentary evidence for disputed absences"
        actions={
          <button
            onClick={() => setDialogOpen(true)}
            className="neu-button-primary rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Correction Request</span>
          </button>
        }
      />

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="neu-raised rounded-2xl p-10 text-center text-xs text-[#64748B]">
            No correction requests submitted yet
          </div>
        ) : (
          requests.map((r) => {
            const isApproved = r.status === "APPROVED";
            const isRejected = r.status === "REJECTED";

            return (
              <div
                key={r.id}
                className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/5 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1E293B] dark:text-[#F1F5F9]">
                        {r.session?.subject?.code} - {r.session?.subject?.name}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Session Date: {r.session?.date ? new Date(r.session.date).toLocaleDateString() : "N/A"} ({r.session?.startTime} - {r.session?.endTime})
                    </p>
                  </div>

                  <span className="text-[11px] text-[#94A3B8]">
                    Submitted: {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Stated Reason */}
                <div>
                  <h4 className="text-xs font-semibold text-[#64748B] mb-1">
                    Appeal Reason
                  </h4>
                  <p className="text-xs text-[#1E293B] dark:text-[#F1F5F9] leading-relaxed p-3 rounded-2xl neu-inset">
                    {r.reason}
                  </p>
                </div>

                {/* Reviewer Note if available */}
                {r.reviewNote && (
                  <div className="p-3.5 rounded-2xl neu-inset bg-black/5 dark:bg-white/5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#4F6AE8] mb-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reviewer Feedback:</span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      "{r.reviewNote}"
                    </p>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-[#4CAF83]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submitted</span>
                    </div>
                    <span className="text-[#94A3B8]">→</span>
                    <div className={`flex items-center gap-1.5 ${r.status !== "SUBMITTED" ? "text-[#4CAF83]" : "text-[#E8A93C]"}`}>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{r.status === "SUBMITTED" ? "Under Review" : "Reviewed"}</span>
                    </div>
                    <span className="text-[#94A3B8]">→</span>
                    <div className={`flex items-center gap-1.5 ${isApproved ? "text-[#4CAF83]" : isRejected ? "text-[#E05C5C]" : "text-[#94A3B8]"}`}>
                      {isApproved ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isRejected ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      <span>{isApproved ? "Approved" : isRejected ? "Rejected" : "Decision"}</span>
                    </div>
                  </div>

                  {r.evidenceUrl && (
                    <a
                      href={r.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neu-button px-3 py-1.5 rounded-xl text-xs text-[#4F6AE8] flex items-center gap-1"
                    >
                      <span>Evidence</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Request Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="neu-raised rounded-2xl p-6 sm:p-7 max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800 mb-4">
              <h3 className="text-base font-semibold">New Correction Appeal</h3>
              <button
                onClick={() => setDialogOpen(false)}
                className="neu-button p-1.5 rounded-lg text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Select Disputed Session (Marked Absent/Late) *
                </label>
                {eligibleSessions.length === 0 ? (
                  <p className="text-xs text-[#E8A93C] p-2 rounded-xl neu-inset">
                    No absent or late records found to appeal
                  </p>
                ) : (
                  <select
                    required
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="w-full neu-input rounded-xl px-3 py-2 text-xs font-medium cursor-pointer"
                  >
                    {eligibleSessions.map((s) => (
                      <option key={s.sessionId} value={s.sessionId}>
                        {s.subjectCode} - {s.date} ({s.status} at {s.time})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Detailed Justification *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this record was erroneous (e.g. medical reason, on-duty permission, biometric issue)..."
                  className="w-full neu-input rounded-2xl p-3 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Upload Evidence Document (PDF or Image)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="neu-button px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || eligibleSessions.length === 0}
                  className="neu-button-primary px-5 py-2 rounded-xl text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Appeal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
