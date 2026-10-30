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

  // If specific roster is requested
  if (classSectionId && subjectId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { classSectionId },
      include: {
        student: { include: { user: true } },
        classSection: true,
      },
      orderBy: { student: { rollNo: "asc" } },
    });

    const sessions = await prisma.attendanceSession.findMany({
      where: {
        classSectionId,
        subjectId,
        status: "ENDED",
      },
      include: { records: true },
    });

    const totalSubjectSessions = sessions.length;

    const roster = enrollments.map((e) => {
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;

      for (const s of sessions) {
        const rec = s.records.find((r) => r.studentId === e.student.id);
        if (rec) {
          if (rec.status === "PRESENT") presentCount++;
          else if (rec.status === "ABSENT") absentCount++;
          else if (rec.status === "LATE") lateCount++;
          else if (rec.status === "EXCUSED") excusedCount++;
        }
      }

      const presentAndExcused = presentCount + excusedCount;
      const percentage = calculateAttendancePercentage(presentAndExcused, totalSubjectSessions);
      const isAtRisk = percentage < policy.minPercentage;
      const needed = calculateClassesNeeded(presentAndExcused, totalSubjectSessions, policy.minPercentage);

      return {
        studentId: e.student.id,
        name: e.student.user.name,
        email: e.student.user.email,
        rollNo: e.student.rollNo,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        totalSessions: totalSubjectSessions,
        percentage,
        isAtRisk,
        classesNeeded: needed,
      };
    });

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    const section = await prisma.classSection.findUnique({ where: { id: classSectionId } });

    return NextResponse.json({ roster, subject, section, totalSessions: totalSubjectSessions });
  }

  // Otherwise return all assigned classes
  const assignments = await prisma.facultyAssignment.findMany({
    where: { facultyId: facultyProfile.id },
    include: {
      subject: true,
      classSection: {
        include: {
          enrollments: true,
        },
      },
    },
    orderBy: { classSection: { name: "asc" } },
  });

  const classes = assignments.map((a) => ({
    assignmentId: a.id,
    subjectId: a.subjectId,
    subjectCode: a.subject.code,
    subjectName: a.subject.name,
    classSectionId: a.classSectionId,
    sectionName: a.classSection.name,
    semester: a.classSection.semester,
    studentCount: a.classSection.enrollments.length,
  }));

  return NextResponse.json({ classes });
}
