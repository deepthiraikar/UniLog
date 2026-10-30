"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Award, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { toast } from "sonner";

export function StudentCieView() {
  const [marks, setMarks] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCie();
  }, []);

  const fetchCie = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/cie");
      if (res.ok) {
        const json = await res.json();
        setMarks(json.marks || []);
        setChartData(json.chartData || []);
      }
    } catch (e) {
      toast.error("Failed to load CIE marks");
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<any>[] = [
    { header: "Subject Code", accessorKey: "subjectCode" },
    { header: "Subject Title", accessorKey: "subjectName" },
    {
      header: "Assessment",
      cell: (r) => (
        <span className="font-semibold text-xs px-2.5 py-0.5 rounded-full neu-pressed text-[#4F6AE8]">
          {r.examType}
        </span>
      ),
    },
    {
      header: "Score / Max",
      isNumeric: true,
      cell: (r) => (
        <span className="font-bold text-xs">
          {r.marks} / {r.maxMarks}
        </span>
      ),
    },
    {
      header: "Percentage",
      isNumeric: true,
      cell: (r) => (
        <span
          className={`font-extrabold text-xs ${
            r.percentage >= 75 ? "text-[#4CAF83]" : "text-[#E8A93C]"
          }`}
        >
          {r.percentage}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Continuous Internal Evaluation (CIE)"
        description="Internal assessment examination performance across all registered subjects"
      />

      {/* CIE Performance Bar Chart */}
      <div className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#4F6AE8]" />
            <h3 className="text-sm font-semibold">CIE Marks Distribution</h3>
          </div>
          <span className="text-xs text-[#64748B]">Max 25 Marks per Assessment</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(197, 203, 216, 0.4)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 25]}
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E2E8F0",
                  borderRadius: "1rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
                  fontSize: "12px",
                }}
                formatter={(val: any) => [`${val} / 25 Marks`, "Score"]}
              />
              <Bar dataKey="marks" radius={[8, 8, 0, 0]}>
                {chartData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.percentage >= 75 ? "#4CAF83" : "#4F6AE8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={marks}
        pageSize={8}
        emptyMessage="No CIE marks uploaded yet"
      />
    </div>
  );
}
