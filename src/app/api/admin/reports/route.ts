import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateAttendancePercentage, calculateClassesNeeded } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get("sectionId");
  const subjectId = searchParams.get("subjectId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // Fetch policy
  const policy = (await prisma.attendancePolicy.findFirst()) || {
    minPercentage: 75.0,
    lateAfterMinutes: 10,
    editWindowMinutes: 30,
    gracePeriodDays: 0,
  };

  // Build session where query
  const sessionWhere: any = { status: "ENDED" };
  if (sectionId) sessionWhere.classSectionId = sectionId;
  if (subjectId) sessionWhere.subjectId = subjectId;
  if (startDate || endDate) {
    sessionWhere.date = {};
    if (startDate) sessionWhere.date.gte = new Date(startDate);
    if (endDate) sessionWhere.date.lte = new Date(endDate);
  }

  const sessions = await prisma.attendanceSession.findMany({
    where: sessionWhere,
    include: {
      classSection: true,
      subject: true,
      faculty: { include: { user: true } },
      records: {
        include: {
          student: { include: { user: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  // Calculate Daily Summary
  const dailySummary = sessions.map((s) => {
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    for (const r of s.records) {
      if (r.status === "PRESENT") presentCount++;
      else if (r.status === "ABSENT") absentCount++;
      else if (r.status === "LATE") lateCount++;
      else if (r.status === "EXCUSED") excusedCount++;
    }

    const total = s.records.length;
    const rate = total > 0 ? Math.round(((presentCount + excusedCount) / total) * 1000) / 10 : 0;

    return {
      sessionId: s.id,
      date: s.date.toISOString().split("T")[0],
      startTime: s.startTime,
      endTime: s.endTime,
      sectionName: s.classSection.name,
      subjectCode: s.subject.code,
      subjectName: s.subject.name,
      facultyName: s.faculty.user.name,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      totalCount: total,
      attendanceRate: rate,
    };
  });

  // Calculate Student Attendance aggregates
  // Find all enrolled students for the queried section (or all enrolled students)
  const enrollmentWhere: any = {};
  if (sectionId) enrollmentWhere.classSectionId = sectionId;

  const enrollments = await prisma.enrollment.findMany({
    where: enrollmentWhere,
    include: {
      student: { include: { user: true } },
      classSection: true,
    },
  });

  // Unique students map
  const studentMap = new Map<string, any>();
  for (const e of enrollments) {
    if (!studentMap.has(e.student.id)) {
      studentMap.set(e.student.id, {
        studentId: e.student.id,
        name: e.student.user.name,
        email: e.student.user.email,
        rollNo: e.student.rollNo,
        sectionName: e.classSection.name,
        branch: e.student.branch,
        semester: e.student.semester,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        totalSessions: 0,
      });
    }
  }

  // Count attendance from matching sessions
  for (const s of sessions) {
    for (const r of s.records) {
      if (studentMap.has(r.studentId)) {
        const item = studentMap.get(r.studentId);
        item.totalSessions++;
        if (r.status === "PRESENT") item.presentCount++;
        else if (r.status === "ABSENT") item.absentCount++;
        else if (r.status === "LATE") item.lateCount++;
        else if (r.status === "EXCUSED") item.excusedCount++;
      }
    }
  }

  const studentReports = Array.from(studentMap.values()).map((st) => {
    const presentAndExcused = st.presentCount + st.excusedCount;
    const percentage = calculateAttendancePercentage(presentAndExcused, st.totalSessions);
    const isAtRisk = percentage < policy.minPercentage;
    const needed = calculateClassesNeeded(presentAndExcused, st.totalSessions, policy.minPercentage);

    return {
      ...st,
      percentage,
      isAtRisk,
      classesNeeded: needed,
      status: isAtRisk ? "AT_RISK" : "SAFE",
    };
  });

  // Options for filter dropdowns
  const [sectionsList, subjectsList] = await Promise.all([
    prisma.classSection.findMany({ orderBy: { name: "asc" } }),
    prisma.subject.findMany({ orderBy: { code: "asc" } }),
  ]);

  return NextResponse.json({
    studentReports,
    dailySummary,
    policy,
    sections: sectionsList,
    subjects: subjectsList,
  });
}
