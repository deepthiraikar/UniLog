"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  CheckSquare,
  FileText,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  X,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

export function CorrectionsManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/corrections");
      if (res.ok) {
        const json = await res.json();
        setRequests(json.requests || []);
      }
    } catch (e) {
      toast.error("Failed to load correction requests");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedRequest) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status,
          reviewNote,
        }),
      });

      if (res.ok) {
        toast.success(`Request ${status === "APPROVED" ? "approved" : "rejected"} successfully`);
        setSelectedRequest(null);
        setReviewNote("");
        fetchRequests();
      } else {
        toast.error("Failed to update request");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<any>[] = [
    {
      header: "Student",
      cell: (r) => (
        <div>
          <div className="font-semibold text-xs text-[#1E293B] dark:text-[#F1F5F9]">
            {r.student?.user?.name}
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            {r.student?.rollNo} ({r.student?.branch})
          </div>
        </div>
      ),
    },
    {
      header: "Class Session",
      cell: (r) => (
        <div>
          <div className="font-medium text-xs">
            {r.session?.subject?.code} - {r.session?.subject?.name}
          </div>
          <div className="text-[11px] text-[#64748B]">
            {r.session?.date ? new Date(r.session.date).toLocaleDateString() : "General"} ({r.session?.startTime}-{r.session?.endTime})
          </div>
        </div>
      ),
    },
    {
      header: "Reason Summary",
      cell: (r) => (
        <span className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-1 max-w-xs">
          {r.reason}
        </span>
      ),
    },
    {
      header: "Submitted At",
      cell: (r) => (
        <span className="text-xs text-[#64748B]">
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Correction Requests"
        description="Review student appeals, verify uploaded evidence, and update attendance records"
      />

      <DataTable
        columns={columns}
        data={requests}
        pageSize={10}
        emptyMessage="No correction requests submitted"
        onRowClick={(row) => {
          setSelectedRequest(row);
          setReviewNote(row.reviewNote || "");
        }}
      />

      {/* Side Sheet Modal for Details and Decision */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full neu-raised bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#4F6AE8]" />
                  <h3 className="text-base font-semibold">Review Correction Appeal</h3>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="neu-button p-1.5 rounded-lg text-[#64748B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student & Session Info Card */}
              <div className="p-4 rounded-2xl neu-inset space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Student:</span>
                  <span className="font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                    {selectedRequest.student?.user?.name} ({selectedRequest.student?.rollNo})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Subject:</span>
                  <span className="font-semibold">
                    {selectedRequest.session?.subject?.code} - {selectedRequest.session?.subject?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Session Date:</span>
                  <span>
                    {selectedRequest.session?.date
                      ? new Date(selectedRequest.session.date).toLocaleDateString()
                      : "N/A"}{" "}
                    ({selectedRequest.session?.startTime} - {selectedRequest.session?.endTime})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Current Status:</span>
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>

              {/* Appeal Reason */}
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                  Student's Stated Reason
                </label>
                <div className="p-3.5 rounded-2xl neu-inset text-xs text-[#1E293B] dark:text-[#F1F5F9] leading-relaxed">
                  {selectedRequest.reason}
                </div>
              </div>

              {/* Uploaded Evidence Link */}
              {selectedRequest.evidenceUrl && (
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    Supporting Document / Evidence
                  </label>
                  <a
                    href={selectedRequest.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neu-button p-3 rounded-2xl flex items-center justify-between text-xs text-[#4F6AE8] hover:underline"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>View Uploaded File</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Review Note Input */}
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                  Reviewer Note / Remarks
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Enter remarks explaining the decision (visible to student)..."
                  className="w-full neu-input rounded-2xl p-3 text-xs"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-6 border-t border-black/5 dark:border-slate-800 flex items-center gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleReview("REJECTED")}
                className="flex-1 neu-button py-2.5 rounded-xl text-xs font-medium text-[#E05C5C] hover:bg-[#E05C5C]/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Appeal</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleReview("APPROVED")}
                className="flex-1 neu-button-primary py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve & Correct</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
