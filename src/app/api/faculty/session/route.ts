import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateAttendancePercentage } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const attSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      classSection: {
        include: {
          enrollments: {
            include: {
              student: { include: { user: true } },
            },
            orderBy: { student: { rollNo: "asc" } },
          },
        },
      },
      subject: true,
      records: true,
    },
  });

  if (!attSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const policy = (await prisma.attendancePolicy.findFirst()) || {
    minPercentage: 75,
    editWindowMinutes: 30,
  };

  // Check edit window:
  // If session status is ENDED, check if (now - endedAt) > editWindowMinutes
  let isReadOnly = false;
  if (attSession.status === "ENDED" && attSession.endedAt) {
    const elapsedMinutes = (Date.now() - new Date(attSession.endedAt).getTime()) / (1000 * 60);
    if (elapsedMinutes > policy.editWindowMinutes) {
      isReadOnly = true;
    }
  }

  // Map existing records by studentId
  const recordMap = new Map(attSession.records.map((r) => [r.studentId, r.status]));

  // Build roster list
  const roster = attSession.classSection.enrollments.map((e) => ({
    studentId: e.student.id,
    userId: e.student.userId,
    name: e.student.user.name,
    rollNo: e.student.rollNo,
    currentStatus: recordMap.get(e.student.id) || "PRESENT",
  }));

  return NextResponse.json({
    session: {
      id: attSession.id,
      date: attSession.date.toISOString().split("T")[0],
      startTime: attSession.startTime,
      endTime: attSession.endTime,
      status: attSession.status,
      remarks: attSession.remarks,
      subjectCode: attSession.subject.code,
      subjectName: attSession.subject.name,
      sectionName: attSession.classSection.name,
      isReadOnly,
      editWindowMinutes: policy.editWindowMinutes,
    },
    roster,
  });
}

export async function POST(req: Request) {
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

  try {
    const body = await req.json();
    const { classSectionId, subjectId, date, startTime, endTime, remarks } = body;

    if (!classSectionId || !subjectId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    // Duplicate check for exact slot
    const existing = await prisma.attendanceSession.findFirst({
      where: {
        classSectionId,
        subjectId,
        date: sessionDate,
        startTime,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "An attendance session already exists for this exact class and time slot today",
          existingSessionId: existing.id,
        },
        { status: 409 }
      );
    }

    const newSession = await prisma.attendanceSession.create({
      data: {
        classSectionId,
        subjectId,
        facultyId: facultyProfile.id,
        date: sessionDate,
        startTime,
        endTime,
        status: "ACTIVE",
        remarks: remarks || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: "START_ATTENDANCE_SESSION",
        entity: "ATTENDANCE_SESSION",
        entityId: newSession.id,
        after: JSON.stringify({ startTime, endTime, date }),
      },
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to start session" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { sessionId, records, remarks, endSession } = body;

    if (!sessionId || !Array.isArray(records)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const currentSession = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        classSection: {
          include: {
            enrollments: true,
          },
        },
        subject: true,
      },
    });

    if (!currentSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const policy = (await prisma.attendancePolicy.findFirst()) || {
      minPercentage: 75,
      editWindowMinutes: 30,
    };

    // Check edit window if already ended
    if (currentSession.status === "ENDED" && currentSession.endedAt) {
      const elapsedMinutes = (Date.now() - new Date(currentSession.endedAt).getTime()) / (1000 * 60);
      if (elapsedMinutes > policy.editWindowMinutes) {
        return NextResponse.json(
          { error: "Edit window has expired for this session. Request an override from admin." },
          { status: 403 }
        );
      }
    }

    // Upsert attendance records
    for (const r of records) {
      await prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: r.studentId,
          },
        },
        update: {
          status: r.status,
          markedBy: session.user.id as string,
          markedAt: new Date(),
        },
        create: {
          sessionId,
          studentId: r.studentId,
          status: r.status,
          markedBy: session.user.id as string,
          markedAt: new Date(),
        },
      });
    }

    // Auto-mark missing students as ABSENT if ending session
    if (endSession) {
      const markedIds = new Set(records.map((r) => r.studentId));
      for (const enr of currentSession.classSection.enrollments) {
        if (!markedIds.has(enr.studentId)) {
          await prisma.attendanceRecord.upsert({
            where: {
              sessionId_studentId: {
                sessionId,
                studentId: enr.studentId,
              },
            },
            update: {
              status: "ABSENT",
              markedBy: session.user.id as string,
            },
            create: {
              sessionId,
              studentId: enr.studentId,
              status: "ABSENT",
              markedBy: session.user.id as string,
            },
          });
        }
      }

      // Mark session status as ENDED
      await prisma.attendanceSession.update({
        where: { id: sessionId },
        data: {
          status: "ENDED",
          endedAt: new Date(),
          remarks: remarks !== undefined ? remarks : currentSession.remarks,
        },
      });

      // Calculate at-risk students and trigger notifications
      for (const enr of currentSession.classSection.enrollments) {
        const studentSessions = await prisma.attendanceSession.findMany({
          where: {
            classSectionId: currentSession.classSectionId,
            status: "ENDED",
          },
          include: { records: true },
        });

        let present = 0;
        let total = studentSessions.length;
        for (const s of studentSessions) {
          const rec = s.records.find((rec) => rec.studentId === enr.studentId);
          if (rec && (rec.status === "PRESENT" || rec.status === "EXCUSED")) {
            present++;
          }
        }

        const pct = calculateAttendancePercentage(present, total);
        if (pct < policy.minPercentage) {
          const studentProfile = await prisma.studentProfile.findUnique({
            where: { id: enr.studentId },
          });

          if (studentProfile) {
            await prisma.notification.create({
              data: {
                userId: studentProfile.userId,
                title: "Attendance Alert: At-Risk Status",
                body: `Your overall attendance is currently ${pct}%, which is below the mandatory ${policy.minPercentage}% threshold. Please attend upcoming lectures to avoid debarment.`,
                type: "WARNING",
              },
            });
          }
        }
      }

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id as string,
          action: "END_ATTENDANCE_SESSION",
          entity: "ATTENDANCE_SESSION",
          entityId: sessionId,
          after: JSON.stringify({ endedAt: new Date(), recordsCount: records.length }),
        },
      });
    }

    return NextResponse.json({ success: true, ended: !!endSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save attendance" }, { status: 500 });
  }
}
