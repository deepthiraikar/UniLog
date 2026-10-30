"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Download, Filter, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";

export function FacultyReportsManager() {
  const [reports, setReports] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    fetchReports();
  }, [selectedSection, selectedSubject]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSection) params.append("classSectionId", selectedSection);
      if (selectedSubject) params.append("subjectId", selectedSubject);

      const res = await fetch(`/api/faculty/reports?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setReports(json.reports || []);
        setAssignments(json.assignments || []);
      }
    } catch (e) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (reports.length === 0) {
      toast.error("No records to export");
      return;
    }

    const rows = reports.map((r) => ({
      RollNo: r.rollNo,
      StudentName: r.name,
      Email: r.email,
      Section: r.sectionName,
      SubjectCode: r.subjectCode,
      Attended: r.presentCount + r.excusedCount,
      Absent: r.absentCount,
      Late: r.lateCount,
      TotalSessions: r.totalSessions,
      AttendancePercentage: `${r.percentage}%`,
      AtRisk: r.isAtRisk ? "YES" : "NO",
      ClassesNeededFor75: r.classesNeeded,
    }));

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "class_attendance_summary.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Class attendance report downloaded!");
  };

  const columns: Column<any>[] = [
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
    { header: "Section", accessorKey: "sectionName" },
    {
      header: "Attended / Total",
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
      header: "Status",
      cell: (r) => <StatusBadge status={r.isAtRisk ? "AT_RISK" : "PRESENT"} />,
    },
    {
      header: "Deficit to 75%",
      isNumeric: true,
      cell: (r) =>
        r.isAtRisk ? (
          <span className="text-[#E05C5C] font-semibold text-xs">
            +{r.classesNeeded} classes
          </span>
        ) : (
          <span className="text-[#64748B] text-xs">Compliant</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Attendance Reports"
        description="Monitor attendance compliance and identify at-risk students in your classes"
        actions={
          <button
            onClick={exportCsv}
            className="neu-button-primary rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="neu-raised rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
          <Filter className="w-4 h-4 text-[#4F6AE8]" />
          <span>Filter Class:</span>
        </div>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="neu-input rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer"
        >
          <option value="">All My Sections</option>
          {Array.from(new Map(assignments.map((a) => [a.classSection?.id, a.classSection])).values()).filter(Boolean).map((sec: any) => (
            <option key={sec.id} value={sec.id}>
              {sec.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="neu-input rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer"
        >
          <option value="">All My Subjects</option>
          {Array.from(new Map(assignments.map((a) => [a.subject?.id, a.subject])).values()).filter(Boolean).map((sub: any) => (
            <option key={sub.id} value={sub.id}>
              {sub.code} - {sub.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        pageSize={10}
        emptyMessage="No student attendance records found for selected filters"
      />
    </div>
  );
}
