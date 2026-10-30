"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { History, Clock, FileCode, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function AuditManager() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit");
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
      }
    } catch (e) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      header: "Action",
      cell: (r) => (
        <span className="font-bold text-xs px-2.5 py-1 rounded-full neu-pressed text-[#4F6AE8]">
          {r.action}
        </span>
      ),
    },
    {
      header: "Actor",
      cell: (r) => (
        <div>
          <div className="font-semibold text-xs text-[#1E293B] dark:text-[#F1F5F9]">
            {r.actor?.name || "System"}
          </div>
          <div className="text-[11px] text-[#64748B]">
            {r.actor?.email} ({r.actor?.role})
          </div>
        </div>
      ),
    },
    {
      header: "Target Entity",
      cell: (r) => (
        <span className="text-xs font-medium text-[#1E293B] dark:text-[#F1F5F9]">
          {r.entity} <span className="text-[#64748B]">({r.entityId})</span>
        </span>
      ),
    },
    {
      header: "Timestamp",
      cell: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date(r.createdAt).toLocaleString()}</span>
        </div>
      ),
    },
  ];

  const formatJson = (str: string | null) => {
    if (!str) return "None";
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch (e) {
      return str;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Audit Trail"
        description="Immutable record of administrative operations, policy changes, and attendance adjustments"
      />

      <DataTable
        columns={columns}
        data={logs}
        pageSize={12}
        emptyMessage="No audit log entries recorded"
        onRowClick={(row) => setSelectedLog(row)}
      />

      {/* Side sheet with Before / After JSON diff */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg h-full neu-raised bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#4F6AE8]" />
                  <h3 className="text-base font-semibold">Audit Event Details</h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="neu-button p-1.5 rounded-lg text-[#64748B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Event metadata card */}
              <div className="p-4 rounded-2xl neu-inset space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Event ID:</span>
                  <span className="font-mono text-[11px]">{selectedLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Action:</span>
                  <span className="font-semibold text-[#4F6AE8]">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Actor:</span>
                  <span>{selectedLog.actor?.name} ({selectedLog.actor?.email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Entity:</span>
                  <span>{selectedLog.entity} #{selectedLog.entityId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Timestamp:</span>
                  <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Before Snapshot */}
              <div>
                <h4 className="text-xs font-semibold text-[#64748B] mb-1.5 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  <span>State Before Modification</span>
                </h4>
                <pre className="p-3.5 rounded-2xl neu-inset font-mono text-[11px] text-[#1E293B] dark:text-[#F1F5F9] overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {formatJson(selectedLog.before)}
                </pre>
              </div>

              {/* After Snapshot */}
              <div>
                <h4 className="text-xs font-semibold text-[#4CAF83] mb-1.5 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  <span>State After Modification</span>
                </h4>
                <pre className="p-3.5 rounded-2xl neu-inset font-mono text-[11px] text-[#1E293B] dark:text-[#F1F5F9] overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {formatJson(selectedLog.after)}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-full neu-button py-2.5 rounded-xl text-xs font-medium cursor-pointer"
              >
                Close Audit Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
