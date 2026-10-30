import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      enrollments: true,
    },
  });

  if (!studentProfile) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month"); // 0-indexed (0 = Jan)

  const now = new Date();
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const month = monthParam !== null ? parseInt(monthParam, 10) : now.getMonth();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const sectionIds = studentProfile.enrollments.map((e) => e.classSectionId);

  // Fetch ended sessions in this date range
  const sessions = await prisma.attendanceSession.findMany({
    where: {
      classSectionId: { in: sectionIds },
      status: "ENDED",
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      subject: true,
      records: {
        where: { studentId: studentProfile.id },
      },
    },
    orderBy: { date: "asc" },
  });

  // Fetch holidays in this month
  const holidays = await prisma.holiday.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Map by day of month (YYYY-MM-DD)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: Record<string, any> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateKey = d.toISOString().split("T")[0];

    // Check holiday
    const hol = holidays.find((h) => h.date.toISOString().split("T")[0] === dateKey);

    const daySessions = sessions.filter(
      (s) => s.date.toISOString().split("T")[0] === dateKey
    );

    if (hol) {
      calendarDays[dateKey] = {
        date: dateKey,
        day,
        type: "HOLIDAY",
        holidayName: hol.name,
        sessions: [],
      };
    } else if (daySessions.length === 0) {
      calendarDays[dateKey] = {
        date: dateKey,
        day,
        type: "NO_CLASS",
        sessions: [],
      };
    } else {
      let present = 0;
      let late = 0;
      let absent = 0;

      const sessionDetails = daySessions.map((s) => {
        const rec = s.records[0];
        const status = rec?.status || "ABSENT";
        if (status === "PRESENT" || status === "EXCUSED") present++;
        else if (status === "LATE") late++;
        else absent++;

        return {
          subjectCode: s.subject.code,
          subjectName: s.subject.name,
          time: `${s.startTime}-${s.endTime}`,
          status,
        };
      });

      let statusType = "ALL_PRESENT";
      if (absent > 0 && present === 0 && late === 0) {
        statusType = "ALL_ABSENT";
      } else if (absent > 0 || late > 0) {
        statusType = "PARTIAL";
      }

      calendarDays[dateKey] = {
        date: dateKey,
        day,
        type: statusType,
        sessions: sessionDetails,
      };
    }
  }

  return NextResponse.json({
    year,
    month,
    calendarDays,
  });
}
