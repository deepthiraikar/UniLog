"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  CalendarDays,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  Check,
} from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TimetableManager() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload preview state
  const [previewData, setPreviewData] = useState<{
    validRows: any[];
    errorRows: any[];
    conflictRows: any[];
    canPublish: boolean;
  } | null>(null);

  const [fileName, setFileName] = useState("");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, [selectedSectionId]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const url = selectedSectionId
        ? `/api/admin/timetable?sectionId=${selectedSectionId}`
        : "/api/admin/timetable";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setSections(json.sections || []);
        setEntries(json.entries || []);
        if (!selectedSectionId && json.currentSectionId) {
          setSelectedSectionId(json.currentSectionId);
        }
      }
    } catch (e) {
      toast.error("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/admin/timetable", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "VALIDATE",
              rawRows: results.data,
              fileName: file.name,
            }),
          });
          const json = await res.json();
          if (res.ok) {
            setPreviewData(json);
            if (json.canPublish) {
              toast.success("Timetable validated successfully! Ready to publish.");
            } else if (json.conflictRows.length > 0) {
              toast.warning("Scheduling conflicts detected!");
            } else if (json.errorRows.length > 0) {
              toast.error("Validation errors found in CSV rows.");
            }
          } else {
            toast.error(json.error || "Failed to validate timetable");
          }
        } catch (err) {
          toast.error("Error processing timetable file");
        }
      },
    });
  };

  const handlePublish = async () => {
    if (!previewData?.validRows || !previewData.canPublish) return;
    try {
      setPublishing(true);
      const res = await fetch("/api/admin/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PUBLISH",
          validEntries: previewData.validRows,
          fileName,
        }),
      });

      if (res.ok) {
        toast.success("Timetable published successfully!");
        setPreviewData(null);
        fetchTimetable();
      } else {
        toast.error("Failed to publish timetable");
      }
    } catch (e) {
      toast.error("An error occurred during publishing");
    } finally {
      setPublishing(false);
    }
  };

  const downloadTemplate = () => {
    const csv =
      "dayOfWeek,startTime,endTime,subjectCode,facultyEmail,sectionName,room\n1,09:00,10:00,CS301,faculty@college.edu,CSE-3A,Lab 201\n1,10:00,11:00,CS302,faculty@college.edu,CSE-3A,Room 304\n2,09:00,10:00,CS303,faculty2@college.edu,CSE-3A,Room 304";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "timetable_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable & Class Schedules"
        description="Upload CSV schedule files, detect room/faculty conflicts, and publish weekly grids"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={downloadTemplate}
              className="neu-button rounded-xl px-3 py-2 text-xs font-medium text-[#64748B] flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Template</span>
            </button>
            <label className="neu-button-primary rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload CSV Schedule</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        }
      />

      {/* Validation & Conflict Preview Section (if file uploaded) */}
      {previewData && (
        <div className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-semibold">Upload Preview: {fileName}</h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Conflict detection and validation results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewData(null)}
                className="neu-button px-3 py-1.5 rounded-xl text-xs text-[#64748B]"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={!previewData.canPublish || publishing}
                className="neu-button-primary px-4 py-1.5 rounded-xl text-xs font-medium disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{publishing ? "Publishing..." : "Publish Timetable"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Valid Rows */}
            <div className="p-4 rounded-2xl neu-inset bg-[#4CAF83]/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#4CAF83] mb-2">
                <CheckCircle className="w-4 h-4" />
                <span>Valid Rows ({previewData.validRows.length})</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 text-[11px]">
                {previewData.validRows.map((r, i) => (
                  <div key={i} className="p-2 rounded-xl neu-flat bg-white dark:bg-slate-900">
                    <div className="font-semibold">{r.subjectCode} - Day {r.dayOfWeek}</div>
                    <div className="text-[#64748B]">{r.startTime}-{r.endTime} | {r.sectionName} | {r.room}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conflicts */}
            <div className="p-4 rounded-2xl neu-inset bg-[#E8A93C]/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E8A93C] mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Scheduling Conflicts ({previewData.conflictRows.length})</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 text-[11px]">
                {previewData.conflictRows.length === 0 ? (
                  <div className="text-xs text-[#64748B] py-4 text-center">No scheduling conflicts</div>
                ) : (
                  previewData.conflictRows.map((r, i) => (
                    <div key={i} className="p-2 rounded-xl neu-flat bg-white dark:bg-slate-900 border border-[#E8A93C]/30">
                      <div className="font-semibold text-[#E8A93C]">{r.subjectCode} - Day {r.dayOfWeek}</div>
                      <div className="text-xs text-[#E8A93C]">{r.conflicts.join("; ")}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Errors */}
            <div className="p-4 rounded-2xl neu-inset bg-[#E05C5C]/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E05C5C] mb-2">
                <XCircle className="w-4 h-4" />
                <span>Validation Errors ({previewData.errorRows.length})</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 text-[11px]">
                {previewData.errorRows.length === 0 ? (
                  <div className="text-xs text-[#64748B] py-4 text-center">No missing fields or errors</div>
                ) : (
                  previewData.errorRows.map((r, i) => (
                    <div key={i} className="p-2 rounded-xl neu-flat bg-white dark:bg-slate-900 border border-[#E05C5C]/30">
                      <div className="font-semibold text-[#E05C5C]">Row {r.index + 1}</div>
                      <div className="text-xs text-[#E05C5C]">{r.errors.join("; ")}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Selector for Weekly Grid */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#4F6AE8]" />
          <span className="text-xs font-semibold">Active Section View:</span>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="neu-input rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer"
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name} (Semester {sec.semester}-{sec.section})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-[#64748B]">
          {entries.length} weekly classes scheduled
        </span>
      </div>

      {/* Weekly Grid (Columns = Mon-Sat) */}
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
                            <span className="text-[10px] text-[#94A3B8] font-medium">
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
