"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Download,
  AlertTriangle,
  FileSpreadsheet,
  Filter,
  Users,
  Calendar,
} from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";

export function ReportsManager() {
  const [activeTab, setActiveTab] = useState<"STUDENTS" | "DAILY">("STUDENTS");
  const [data, setData] = useState<any>({
    studentReports: [],
    dailySummary: [],
    policy: { minPercentage: 75 },
    sections: [],
    subjects: [],
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [sectionFilter, setSectionFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AT_RISK">("ALL");

  useEffect(() => {
    fetchReports();
  }, [sectionFilter, subjectFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sectionFilter) params.append("sectionId", sectionFilter);
      if (subjectFilter) params.append("subjectId", subjectFilter);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const list = data.studentReports || [];
    if (statusFilter === "AT_RISK") {
      return list.filter((s: any) => s.isAtRisk);
    }
    return list;
  }, [data.studentReports, statusFilter]);

  const exportStudentsCsv = (atRiskOnly: boolean = false) => {
    const list = atRiskOnly
      ? data.studentReports.filter((s: any) => s.isAtRisk)
      : data.studentReports;

    if (list.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const exportRows = list.map((s: any) => ({
      RollNo: s.rollNo,
      Name: s.name,
      Email: s.email,
      Section: s.sectionName,
      Present: s.presentCount,
      Absent: s.absentCount,
      Late: s.lateCount,
      Excused: s.excusedCount,
      TotalSessions: s.totalSessions,
      AttendancePercentage: `${s.percentage}%`,
      AtRiskStatus: s.isAtRisk ? "AT RISK (<75%)" : "SAFE",
      ClassesNeededFor75: s.classesNeeded,
    }));

    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = atRiskOnly ? "at_risk_students_report.csv" : "college_attendance_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${list.length} records successfully!`);
  };

  const studentColumns: Column<any>[] = [
    { header: "Roll No", accessorKey: "rollNo" },
    {
      header: "Student Name",
      cell: (row) => (
        <div>
          <div className="font-semibold text-xs text-[#1E293B] dark:text-[#F1F5F9]">
            {row.name}
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            {row.email}
          </div>
        </div>
      ),
    },
    { header: "Section", accessorKey: "sectionName" },
    {
      header: "Attended / Total",
      isNumeric: true,
      cell: (row) => (
        <span className="font-medium text-xs">
          {row.presentCount + row.excusedCount} / {row.totalSessions}
        </span>
      ),
    },
    {
      header: "Attendance %",
      isNumeric: true,
      accessorKey: "percentage",
      cell: (row) => (
        <span
          className={`font-bold text-xs ${
            row.percentage >= 75 ? "text-[#4CAF83]" : "text-[#E05C5C]"
          }`}
        >
          {row.percentage}%
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.isAtRisk ? "AT_RISK" : "PRESENT"} />,
    },
    {
      header: "Deficit to 75%",
      isNumeric: true,
      cell: (row) =>
        row.isAtRisk ? (
          <span className="text-[#E05C5C] font-semibold text-xs">
            +{row.classesNeeded} classes
          </span>
        ) : (
          <span className="text-[#64748B] text-xs">Met</span>
        ),
    },
  ];

  const dailyColumns: Column<any>[] = [
    { header: "Date", accessorKey: "date" },
    { header: "Time Slot", cell: (r) => `${r.startTime} - ${r.endTime}` },
    { header: "Section", accessorKey: "sectionName" },
    { header: "Subject", cell: (r) => `${r.subjectCode} (${r.subjectName})` },
    { header: "Faculty", accessorKey: "facultyName" },
    { header: "Present", isNumeric: true, accessorKey: "presentCount" },
    { header: "Absent", isNumeric: true, accessorKey: "absentCount" },
    { header: "Late", isNumeric: true, accessorKey: "lateCount" },
    {
      header: "Attendance Rate",
      isNumeric: true,
      cell: (r) => (
        <span
          className={`font-bold text-xs ${
            r.attendanceRate >= 75 ? "text-[#4CAF83]" : "text-[#E05C5C]"
          }`}
        >
          {r.attendanceRate}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Reports & Compliance"
        description="Detailed analytics, threshold compliance tracking, and institutional export records"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => exportStudentsCsv(true)}
              className="neu-button rounded-xl px-3 py-2 text-xs font-medium text-[#E05C5C] flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Export At-Risk List</span>
            </button>
            <button
              onClick={() => exportStudentsCsv(false)}
              className="neu-button-primary rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl neu-inset w-fit">
        <button
          onClick={() => setActiveTab("STUDENTS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "STUDENTS"
              ? "neu-raised text-[#4F6AE8] font-semibold bg-white dark:bg-slate-900"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Compliance</span>
        </button>

        <button
          onClick={() => setActiveTab("DAILY")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "DAILY"
              ? "neu-raised text-[#4F6AE8] font-semibold bg-white dark:bg-slate-900"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Sessions Summary</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="neu-raised rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
          <Filter className="w-4 h-4 text-[#4F6AE8]" />
          <span>Filter:</span>
        </div>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="neu-input rounded-xl px-3 py-1.5 text-xs font-medium"
        >
          <option value="">All Class Sections</option>
          {data.sections?.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="neu-input rounded-xl px-3 py-1.5 text-xs font-medium"
        >
          <option value="">All Subjects</option>
          {data.subjects?.map((sub: any) => (
            <option key={sub.id} value={sub.id}>
              {sub.code} - {sub.name}
            </option>
          ))}
        </select>

        {activeTab === "STUDENTS" && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                statusFilter === "ALL" ? "neu-inset text-[#4F6AE8] font-semibold" : "neu-button text-[#64748B]"
              }`}
            >
              All Students ({data.studentReports?.length || 0})
            </button>
            <button
              onClick={() => setStatusFilter("AT_RISK")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                statusFilter === "AT_RISK"
                  ? "neu-inset text-[#E05C5C] font-semibold"
                  : "neu-button text-[#E05C5C]"
              }`}
            >
              At Risk (&lt;75%) ({data.studentReports?.filter((s: any) => s.isAtRisk).length || 0})
            </button>
          </div>
        )}
      </div>

      {/* Tables */}
      {activeTab === "STUDENTS" ? (
        <DataTable
          columns={studentColumns}
          data={filteredStudents}
          pageSize={10}
          emptyMessage="No student records match the active filter criteria"
        />
      ) : (
        <DataTable
          columns={dailyColumns}
          data={data.dailySummary || []}
          pageSize={10}
          emptyMessage="No ended session records found"
        />
      )}
    </div>
  );
}
