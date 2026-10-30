"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  BookOpen,
  Users,
  Layers,
  ArrowRight,
  X,
  GraduationCap,
  Percent,
} from "lucide-react";
import { toast } from "sonner";

export function FacultyClassesManager() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected class for roster view
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [rosterData, setRosterData] = useState<any | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/faculty/classes");
      if (res.ok) {
        const json = await res.json();
        setClasses(json.classes || []);
      }
    } catch (e) {
      toast.error("Failed to load assigned classes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoster = async (cls: any) => {
    setSelectedClass(cls);
    try {
      setRosterLoading(true);
      const res = await fetch(
        `/api/faculty/classes?classSectionId=${cls.classSectionId}&subjectId=${cls.subjectId}`
      );
      if (res.ok) {
        const json = await res.json();
        setRosterData(json);
      }
    } catch (e) {
      toast.error("Failed to load class roster");
    } finally {
      setRosterLoading(false);
    }
  };

  const rosterColumns: Column<any>[] = [
    { header: "Roll No", accessorKey: "rollNo" },
    {
      header: "Student",
      cell: (r) => (
        <div>
          <div className="font-semibold text-xs text-[#1E293B] dark:text-[#F1F5F9]">
            {r.name}
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            {r.email}
          </div>
        </div>
      ),
    },
    {
      header: "Classes Attended",
      isNumeric: true,
      cell: (r) => (
        <span className="font-medium text-xs">
          {r.presentCount + r.excusedCount} / {r.totalSessions}
        </span>
      ),
    },
    {
      header: "Attendance %",
      isNumeric: true,
      cell: (r) => (
        <span
          className={`font-bold text-xs ${
            r.percentage >= 75 ? "text-[#4CAF83]" : "text-[#E05C5C]"
          }`}
        >
          {r.percentage}%
        </span>
      ),
    },
    {
      header: "Compliance",
      cell: (r) => (
        <StatusBadge status={r.isAtRisk ? "AT_RISK" : "PRESENT"} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assigned Classes"
        description="Course sections assigned to your teaching workload for this semester"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.length === 0 ? (
          <div className="col-span-full neu-raised rounded-2xl p-10 text-center text-xs text-[#64748B]">
            No teaching classes currently assigned
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.assignmentId}
              className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full neu-pressed text-[#4F6AE8] text-[11px] font-bold">
                    {cls.sectionName}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    Semester {cls.semester}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F1F5F9] mb-1">
                  {cls.subjectCode}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {cls.subjectName}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-black/5 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <Users className="w-4 h-4 text-[#4F6AE8]" />
                  <span>{cls.studentCount} Students</span>
                </div>

                <button
                  onClick={() => handleOpenRoster(cls)}
                  className="neu-button-primary rounded-xl px-3 py-1.5 text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>View Roster</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Roster Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="neu-raised rounded-2xl p-6 sm:p-7 max-w-3xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-semibold">
                  Class Roster: {selectedClass.subjectCode} ({selectedClass.sectionName})
                </h3>
                <p className="text-xs text-[#64748B]">
                  {selectedClass.subjectName} • {rosterData?.totalSessions || 0} total sessions conducted
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedClass(null);
                  setRosterData(null);
                }}
                className="neu-button p-1.5 rounded-lg text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {rosterLoading ? (
                <div className="py-12 text-center text-xs text-[#64748B]">
                  Loading student roster...
                </div>
              ) : (
                <DataTable
                  columns={rosterColumns}
                  data={rosterData?.roster || []}
                  pageSize={8}
                  emptyMessage="No students enrolled in this section"
                />
              )}
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedClass(null);
                  setRosterData(null);
                }}
                className="neu-button px-4 py-2 rounded-xl text-xs font-medium"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
