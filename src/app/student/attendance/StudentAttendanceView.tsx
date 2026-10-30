"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Filter, BookOpen } from "lucide-react";
import { toast } from "sonner";

export function StudentAttendanceView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      toast.error("Failed to load attendance breakdown");
    } finally {
      setLoading(false);
    }
  };

  const subjectCards = data?.subjectCards || [];
  const minPercentage = data?.minPercentage || 75;

  const filteredCards = subjectFilter
    ? subjectCards.filter((s: any) => s.code === subjectFilter)
    : subjectCards;

  const columns: Column<any>[] = [
    { header: "Subject Code", accessorKey: "code" },
    {
      header: "Subject Title",
      cell: (r) => (
        <span className="font-semibold text-xs text-[#1E293B] dark:text-[#F1F5F9]">
          {r.name}
        </span>
      ),
    },
    {
      header: "Attended",
      isNumeric: true,
      accessorKey: "attended",
    },
    {
      header: "Total Sessions",
      isNumeric: true,
      accessorKey: "total",
    },
    {
      header: "Attendance %",
      isNumeric: true,
      cell: (r) => (
        <span
          className={`font-bold text-xs ${
            r.percentage >= minPercentage ? "text-[#4CAF83]" : "text-[#E05C5C]"
          }`}
        >
          {r.percentage}%
        </span>
      ),
    },
    {
      header: "Threshold Status",
      cell: (r) => <StatusBadge status={r.isAtRisk ? "AT_RISK" : "PRESENT"} />,
    },
    {
      header: `Required to reach ${minPercentage}%`,
      isNumeric: true,
      cell: (r) =>
        r.isAtRisk ? (
          <span className="text-[#E05C5C] font-bold text-xs">
            +{r.classesNeeded} classes
          </span>
        ) : (
          <span className="text-[#4CAF83] font-semibold text-xs">Target Met</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subject Attendance Breakdown"
        description="Comprehensive audit of lecture attendance, excused absences, and compliance per subject"
      />

      {/* Filter Bar */}
      <div className="neu-raised rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
          <Filter className="w-4 h-4 text-[#4F6AE8]" />
          <span>Filter Subject:</span>
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="neu-input rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer"
        >
          <option value="">All Registered Subjects</option>
          {subjectCards.map((sub: any) => (
            <option key={sub.code} value={sub.code}>
              {sub.code} - {sub.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredCards}
        pageSize={10}
        emptyMessage="No subject attendance records found"
      />
    </div>
  );
}
