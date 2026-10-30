"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AttendanceRing } from "@/components/shared/AttendanceRing";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  GraduationCap,
  ArrowRight,
  Clock,
  Layers,
  Award,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      toast.error("Failed to load attendance metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 rounded-xl neu-raised bg-black/5 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-72 rounded-2xl neu-raised bg-black/5 animate-pulse" />
          <div className="md:col-span-2 h-72 rounded-2xl neu-raised bg-black/5 animate-pulse" />
        </div>
      </div>
    );
  }

  const {
    overallPercentage = 0,
    totalAttended = 0,
    totalSessions = 0,
    isAtRisk = false,
    classesNeeded = 0,
    minPercentage = 75,
    subjectCards = [],
    recentCieMarks = [],
    student,
  } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${student?.name || "Student"}`}
        description={`${student?.branch} Semester ${student?.semester} (${student?.section}) • Roll No: ${student?.rollNo}`}
        actions={
          <Link
            href="/student/requests"
            className="neu-button-primary rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <span>Correction Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* At-Risk Warning Banner (Only rendered if below threshold) */}
      {isAtRisk && (
        <div className="p-5 rounded-2xl neu-inset bg-[#E05C5C]/10 border border-[#E05C5C]/30 flex items-center gap-4 text-xs text-[#E05C5C] animate-in fade-in duration-200">
          <div className="p-3 rounded-2xl neu-raised bg-[#E05C5C] text-white shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#E05C5C]">
              Attendance Warning: Critical Status
            </h3>
            <p className="mt-0.5 text-xs text-[#1E293B] dark:text-[#F1F5F9] leading-relaxed">
              Your overall attendance is {overallPercentage}%, falling below the mandatory {minPercentage}% institutional threshold. You need to attend the next <span className="font-extrabold text-[#E05C5C]">{classesNeeded} consecutive classes</span> without absence to restore safe standing.
            </p>
          </div>
        </div>
      )}

      {/* Hero Row: Attendance Ring + Summary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large AttendanceRing */}
        <div className="md:col-span-1">
          <AttendanceRing
            percentage={overallPercentage}
            minThreshold={minPercentage}
            subtitle={`${totalAttended} of ${totalSessions} classes attended`}
          />
        </div>

        {/* Quick Highlights / Subject Summary List */}
        <div className="md:col-span-2 neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#4F6AE8]" />
                <h3 className="text-sm font-semibold">Curriculum Attendance Health</h3>
              </div>
              <span className="text-xs text-[#64748B]">
                {subjectCards.length} Enrolled Subjects
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-2xl neu-inset">
                <span className="text-[11px] text-[#64748B]">Institutional Target</span>
                <div className="text-xl font-extrabold text-[#4F6AE8] mt-0.5">{minPercentage}% Minimum</div>
                <p className="text-[10px] text-[#94A3B8] mt-1">Required for semester exam hall ticket</p>
              </div>

              <div className="p-4 rounded-2xl neu-inset">
                <span className="text-[11px] text-[#64748B]">Compliance Status</span>
                <div className={`text-xl font-extrabold mt-0.5 ${isAtRisk ? "text-[#E05C5C]" : "text-[#4CAF83]"}`}>
                  {isAtRisk ? "Action Required" : "Good Standing"}
                </div>
                <p className="text-[10px] text-[#94A3B8] mt-1">
                  {isAtRisk ? `Deficit of ${classesNeeded} lectures` : "Above minimum threshold"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-black/5 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-[#64748B]">
              Updated live upon faculty submission
            </span>
            <Link
              href="/student/attendance"
              className="text-xs font-semibold text-[#4F6AE8] hover:underline flex items-center gap-1"
            >
              <span>Full Subject Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
            Subject-Wise Attendance Overview
          </h2>
          <span className="text-xs text-[#64748B]">
            Target: ≥{minPercentage}% per subject
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectCards.map((sub: any) => {
            const isSubAtRisk = sub.percentage < minPercentage;

            return (
              <div
                key={sub.subjectId}
                className="neu-raised rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full neu-pressed text-[#4F6AE8] text-[11px] font-bold">
                      {sub.code}
                    </span>
                    <span
                      className={`text-xs font-extrabold ${
                        isSubAtRisk ? "text-[#E05C5C]" : "text-[#4CAF83]"
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#1E293B] dark:text-[#F1F5F9] line-clamp-1">
                    {sub.name}
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                    {sub.attended} of {sub.total} classes attended
                  </p>
                </div>

                {/* Neumorphic progress bar */}
                <div className="mt-4 pt-3 border-t border-black/5 dark:border-slate-800">
                  <div className="w-full h-2 rounded-full neu-inset overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSubAtRisk ? "bg-[#E05C5C]" : "bg-[#4CAF83]"
                      }`}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-[#64748B]">
                    <span>{isSubAtRisk ? "At Risk" : "Safe"}</span>
                    {isSubAtRisk && (
                      <span className="text-[#E05C5C] font-semibold">
                        +{sub.classesNeeded} needed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CIE Assessment Highlights */}
      {recentCieMarks && recentCieMarks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#4F6AE8]" />
              <h2 className="text-sm font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                Continuous Internal Evaluation (CIE) Highlights
              </h2>
            </div>
            <Link
              href="/student/cie"
              className="text-xs font-semibold text-[#4F6AE8] hover:underline flex items-center gap-1"
            >
              <span>View All CIE Marks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentCieMarks.map((cie: any) => (
              <div
                key={cie.id}
                className="neu-raised rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#4F6AE8]">{cie.code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full neu-pressed text-[#64748B] font-semibold">
                    {cie.examType}
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate mb-2">
                  {cie.name}
                </div>
                <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-black/5 dark:border-slate-800">
                  <span className="text-base font-extrabold text-[#1E293B] dark:text-[#F1F5F9]">
                    {cie.marks}
                    <span className="text-[11px] font-normal text-[#94A3B8]"> / {cie.maxMarks}</span>
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      cie.percentage >= 75 ? "text-[#4CAF83]" : "text-[#E8A93C]"
                    }`}
                  >
                    {cie.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
