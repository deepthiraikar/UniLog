import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateAttendancePercentage, calculateClassesNeeded } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const facultyProfile = await prisma.facultyProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!facultyProfile) {
    return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const classSectionId = searchParams.get("classSectionId");
  const subjectId = searchParams.get("subjectId");

  const policy = (await prisma.attendancePolicy.findFirst()) || { minPercentage: 75 };

  // Fetch faculty assignments to filter authorized classes
  const assignments = await prisma.facultyAssignment.findMany({
    where: { facultyId: facultyProfile.id },
    include: {
      subject: true,
      classSection: true,
    },
  });

  const authorizedSectionIds = Array.from(new Set(assignments.map((a) => a.classSectionId)));
  const authorizedSubjectIds = Array.from(new Set(assignments.map((a) => a.subjectId)));

  const sessionWhere: any = {
    facultyId: facultyProfile.id,
    status: "ENDED",
  };

  if (classSectionId && authorizedSectionIds.includes(classSectionId)) {
    sessionWhere.classSectionId = classSectionId;
  }
  if (subjectId && authorizedSubjectIds.includes(subjectId)) {
    sessionWhere.subjectId = subjectId;
  }

  const sessions = await prisma.attendanceSession.findMany({
    where: sessionWhere,
    include: {
      records: true,
      classSection: true,
      subject: true,
    },
  });

  // Calculate per student
  const studentMap = new Map<string, any>();

  for (const s of sessions) {
    for (const r of s.records) {
      if (!studentMap.has(r.studentId)) {
        const sp = await prisma.studentProfile.findUnique({
          where: { id: r.studentId },
          include: { user: true },
        });

        if (sp) {
          studentMap.set(r.studentId, {
            studentId: r.studentId,
            name: sp.user.name,
            email: sp.user.email,
            rollNo: sp.rollNo,
            sectionName: s.classSection.name,
            subjectCode: s.subject.code,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            excusedCount: 0,
            totalSessions: 0,
          });
        }
      }

      const item = studentMap.get(r.studentId);
      if (item) {
        item.totalSessions++;
        if (r.status === "PRESENT") item.presentCount++;
        else if (r.status === "ABSENT") item.absentCount++;
        else if (r.status === "LATE") item.lateCount++;
        else if (r.status === "EXCUSED") item.excusedCount++;
      }
    }
  }

  const reports = Array.from(studentMap.values()).map((st) => {
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

  return NextResponse.json({
    reports,
    assignments,
    policy,
  });
}
