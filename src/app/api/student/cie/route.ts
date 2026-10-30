import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!studentProfile) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const cieMarks = await prisma.cieMark.findMany({
    where: { studentId: studentProfile.id },
    include: {
      subject: true,
    },
    orderBy: [{ subject: { code: "asc" } }, { examType: "asc" }],
  });

  const formattedMarks = cieMarks.map((m) => {
    const pct = m.maxMarks > 0 ? Math.round((m.marks / m.maxMarks) * 1000) / 10 : 0;
    return {
      id: m.id,
      subjectCode: m.subject.code,
      subjectName: m.subject.name,
      examType: m.examType,
      marks: m.marks,
      maxMarks: m.maxMarks,
      percentage: pct,
    };
  });

  // Chart data: marks per exam grouped by subject
  const chartData = formattedMarks.map((m) => ({
    name: `${m.subjectCode} ${m.examType}`,
    marks: m.marks,
    maxMarks: m.maxMarks,
    percentage: m.percentage,
  }));

  return NextResponse.json({ marks: formattedMarks, chartData });
}
