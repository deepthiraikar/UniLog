"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Users, GraduationCap, Percent, CheckSquare, Clock, ArrowUpRight, Activity } from "lucide-react";
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
import Link from "next/link";

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl neu-raised bg-black/5 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl neu-raised bg-black/5 dark:bg-white/5 animate-pulse" />
          <div className="h-72 rounded-2xl neu-raised bg-black/5 dark:bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalStudents: 0,
    totalFaculty: 0,
    todayAttendancePct: 0,
    pendingCorrections: 0,
  };

  const barData = data?.classAttendanceBar || [];
  const heatmapData = data?.heatmapData || [];
  const recentLogs = data?.recentAuditLogs || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Command Center"
        description="Institutional metrics, attendance records, and system-wide audit activity"
      />

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Enrolled Students"
          value={kpis.totalStudents}
          hint="Active across all sections"
          icon={GraduationCap}
        />
        <StatCard
          label="Faculty Members"
          value={kpis.totalFaculty}
          hint="Teaching faculty assigned"
          icon={Users}
        />
        <StatCard
          label="Attendance Rate"
          value={`${kpis.todayAttendancePct}%`}
          hint="Aggregate sessions average"
          tone={kpis.todayAttendancePct >= 75 ? "good" : "bad"}
          icon={Percent}
        />
        <StatCard
          label="Pending Corrections"
          value={kpis.pendingCorrections}
          hint="Awaiting admin/faculty review"
          tone={kpis.pendingCorrections > 0 ? "warn" : "default"}
          icon={CheckSquare}
        />
      </div>

      {/* Charts & Heatmap Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance by Section Bar Chart */}
        <div className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                Class Attendance Overview
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Attendance compliance by academic section
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full neu-pressed text-[#4F6AE8] font-bold">
              Min. 75%
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(197, 203, 216, 0.4)" />
                <XAxis
                  dataKey="className"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "1rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val}%`, "Attendance Rate"]}
                />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {barData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.percentage >= 75 ? "#4CAF83" : "#E05C5C"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap-Lite: Attendance by Day */}
        <div className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                Attendance Heatmap (Recent 14 Days)
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Daily attendance performance across class sessions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2.5 pt-2">
            {heatmapData.map((d: any) => {
              let bg = "bg-black/5 dark:bg-white/5 text-[#94A3B8]";
              let label = "No Class";
              if (d.hasClasses) {
                if (d.percentage >= 85) {
                  bg = "bg-[#4CAF83] text-white";
                  label = `${d.percentage}%`;
                } else if (d.percentage >= 70) {
                  bg = "bg-[#E8A93C] text-white";
                  label = `${d.percentage}%`;
                } else {
                  bg = "bg-[#E05C5C] text-white";
                  label = `${d.percentage}%`;
                }
              }

              return (
                <div
                  key={d.date}
                  className="flex flex-col items-center justify-center p-2 rounded-2xl neu-inset text-center"
                >
                  <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Day {d.dayOfMonth}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center mt-1 text-[10px] font-bold ${bg}`}
                    title={`${d.date}: ${label}`}
                  >
                    {d.hasClasses ? `${d.percentage}%` : "—"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/5 dark:border-slate-800 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF83]" />
              <span>Safe (≥85%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8A93C]" />
              <span>Moderate (70-84%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E05C5C]" />
              <span>Critical (&lt;70%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl neu-inset text-[#4F6AE8]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                Recent System Activity
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Last 10 administrative and system events recorded
              </p>
            </div>
          </div>

          <Link
            href="/admin/audit"
            className="neu-button px-3 py-1.5 rounded-xl text-xs font-medium text-[#4F6AE8] flex items-center gap-1"
          >
            <span>View All Logs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentLogs.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
              No audit records found
            </p>
          ) : (
            recentLogs.map((log: any) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold px-2 py-0.5 rounded-full neu-pressed text-[#4F6AE8] text-[10px]">
                    {log.action}
                  </span>
                  <span className="text-[#1E293B] dark:text-[#F1F5F9] font-medium">
                    {log.actor?.name || "System"}
                  </span>
                  <span className="text-[#64748B] dark:text-[#94A3B8]">
                    ({log.entity}: {log.entityId})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#94A3B8] text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
