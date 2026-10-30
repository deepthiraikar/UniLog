import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateAttendancePercentage, calculateClassesNeeded } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      enrollments: { include: { classSection: true } },
    },
  });

  if (!studentProfile) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const policy = (await prisma.attendancePolicy.findFirst()) || { minPercentage: 75 };

  const sectionIds = studentProfile.enrollments.map((e) => e.classSectionId);

  // All ended sessions for this student's sections
  const sessions = await prisma.attendanceSession.findMany({
    where: {
      classSectionId: { in: sectionIds },
      status: "ENDED",
    },
    include: {
      subject: true,
      records: {
        where: { studentId: studentProfile.id },
      },
    },
    orderBy: { date: "asc" },
  });

  let totalAttended = 0;
  const totalSessions = sessions.length;

  // Subject breakdown map
  const subjectMap = new Map<string, {
    subjectId: string;
    code: string;
    name: string;
    attended: number;
    total: number;
  }>();

  for (const s of sessions) {
    if (!subjectMap.has(s.subjectId)) {
      subjectMap.set(s.subjectId, {
        subjectId: s.subjectId,
        code: s.subject.code,
        name: s.subject.name,
        attended: 0,
        total: 0,
      });
    }

    const sub = subjectMap.get(s.subjectId)!;
    sub.total++;

    const rec = s.records[0];
    if (rec && (rec.status === "PRESENT" || rec.status === "EXCUSED")) {
      sub.attended++;
      totalAttended++;
    }
  }

  const overallPercentage = calculateAttendancePercentage(totalAttended, totalSessions);
  const isAtRisk = overallPercentage < policy.minPercentage;
  const classesNeeded = calculateClassesNeeded(totalAttended, totalSessions, policy.minPercentage);

  const subjectCards = Array.from(subjectMap.values()).map((sub) => {
    const pct = calculateAttendancePercentage(sub.attended, sub.total);
    const subNeeded = calculateClassesNeeded(sub.attended, sub.total, policy.minPercentage);
    return {
      ...sub,
      percentage: pct,
      isAtRisk: pct < policy.minPercentage,
      classesNeeded: subNeeded,
    };
  });

  const recentCieMarks = await prisma.cieMark.findMany({
    where: { studentId: studentProfile.id },
    include: { subject: true },
    orderBy: [{ examType: "desc" }, { subject: { code: "asc" } }],
    take: 8,
  });

  const formattedCie = recentCieMarks.map((m) => ({
    id: m.id,
    code: m.subject.code,
    name: m.subject.name,
    examType: m.examType,
    marks: m.marks,
    maxMarks: m.maxMarks,
    percentage: m.maxMarks > 0 ? Math.round((m.marks / m.maxMarks) * 100) : 0,
  }));

  return NextResponse.json({
    student: {
      name: session.user.name,
      rollNo: studentProfile.rollNo,
      branch: studentProfile.branch,
      semester: studentProfile.semester,
      section: studentProfile.section,
    },
    overallPercentage,
    totalAttended,
    totalSessions,
    isAtRisk,
    classesNeeded,
    minPercentage: policy.minPercentage,
    subjectCards,
    recentCieMarks: formattedCie,
  });
}
