import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get FacultyProfile
  const facultyProfile = await prisma.facultyProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!facultyProfile) {
    return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 });
  }

  // Day of week (1 = Mon ... 6 = Sat, 0 = Sun -> 7 or 1)
  const now = new Date();
  let dayOfWeek = now.getDay(); // 0 is Sunday
  if (dayOfWeek === 0) dayOfWeek = 7; // Map Sunday

  // Today's scheduled classes from published timetable
  const todayClasses = await prisma.timetableEntry.findMany({
    where: {
      facultyId: facultyProfile.id,
      dayOfWeek: dayOfWeek <= 6 ? dayOfWeek : 1, // Fallback to Monday if Sunday
      upload: { status: "PUBLISHED" },
    },
    include: {
      subject: true,
      classSection: true,
    },
    orderBy: { startTime: "asc" },
  });

  // Check if any attendance sessions already exist for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingTodaySessions = await prisma.attendanceSession.findMany({
    where: {
      facultyId: facultyProfile.id,
      date: { gte: today },
    },
    include: { records: true },
  });

  const timeline = todayClasses.map((entry) => {
    const existing = existingTodaySessions.find(
      (s) =>
        s.classSectionId === entry.classSectionId &&
        s.subjectId === entry.subjectId &&
        s.startTime === entry.startTime
    );

    return {
      timetableId: entry.id,
      classSectionId: entry.classSectionId,
      sectionName: entry.classSection.name,
      subjectId: entry.subjectId,
      subjectCode: entry.subject.code,
      subjectName: entry.subject.name,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room || "Room 101",
      existingSession: existing
        ? {
            id: existing.id,
            status: existing.status,
            recordsCount: existing.records.length,
          }
        : null,
    };
  });

  // Recent 5 sessions
  const recentSessions = await prisma.attendanceSession.findMany({
    where: { facultyId: facultyProfile.id },
    orderBy: { date: "desc" },
    take: 5,
    include: {
      subject: true,
      classSection: true,
      records: true,
    },
  });

  const formattedRecent = recentSessions.map((s) => {
    const present = s.records.filter((r) => r.status === "PRESENT" || r.status === "EXCUSED").length;
    return {
      id: s.id,
      date: s.date.toISOString().split("T")[0],
      startTime: s.startTime,
      endTime: s.endTime,
      subjectCode: s.subject.code,
      subjectName: s.subject.name,
      sectionName: s.classSection.name,
      presentCount: present,
      totalCount: s.records.length,
      status: s.status,
    };
  });

  return NextResponse.json({
    timeline,
    recentSessions: formattedRecent,
    dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()],
  });
}
