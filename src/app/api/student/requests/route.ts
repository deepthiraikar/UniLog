import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
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

  // 1. Get existing requests
  const requests = await prisma.correctionRequest.findMany({
    where: { studentId: studentProfile.id },
    orderBy: { createdAt: "desc" },
    include: {
      session: {
        include: {
          subject: true,
          classSection: true,
        },
      },
    },
  });

  // 2. Get eligible sessions for appeal: where student was marked ABSENT or LATE
  const absentOrLateRecords = await prisma.attendanceRecord.findMany({
    where: {
      studentId: studentProfile.id,
      status: { in: ["ABSENT", "LATE"] },
    },
    include: {
      session: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: { markedAt: "desc" },
    take: 20,
  });

  const eligibleSessions = absentOrLateRecords.map((r) => ({
    sessionId: r.sessionId,
    status: r.status,
    subjectCode: r.session.subject.code,
    subjectName: r.session.subject.name,
    date: r.session.date.toISOString().split("T")[0],
    time: `${r.session.startTime} - ${r.session.endTime}`,
  }));

  return NextResponse.json({ requests, eligibleSessions });
}

export async function POST(req: Request) {
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

  try {
    const formData = await req.formData();
    const sessionId = formData.get("sessionId") as string;
    const reason = formData.get("reason") as string;
    const file = formData.get("file") as File | null;

    if (!sessionId || !reason) {
      return NextResponse.json({ error: "Missing session or reason" }, { status: 400 });
    }

    let evidenceUrl: string | null = null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadsDir, safeName);
      await writeFile(filePath, buffer);

      evidenceUrl = `/uploads/${safeName}`;
    }

    const newRequest = await prisma.correctionRequest.create({
      data: {
        studentId: studentProfile.id,
        sessionId,
        reason: reason.trim(),
        evidenceUrl,
        status: "SUBMITTED",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: "SUBMIT_CORRECTION_REQUEST",
        entity: "CORRECTION_REQUEST",
        entityId: newRequest.id,
        after: JSON.stringify({ sessionId, reason, evidenceUrl }),
      },
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error: any) {
    console.error("Submit request error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit request" }, { status: 500 });
  }
}
