import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.correctionRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        include: {
          user: true,
          enrollments: { include: { classSection: true } },
        },
      },
      session: {
        include: {
          subject: true,
          classSection: true,
          faculty: { include: { user: true } },
        },
      },
    },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { requestId, status, reviewNote } = body;

    if (!requestId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status or request ID" }, { status: 400 });
    }

    const request = await prisma.correctionRequest.findUnique({
      where: { id: requestId },
      include: {
        student: { include: { user: true } },
        session: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const previousStatus = request.status;

    // Update correction request
    const updatedRequest = await prisma.correctionRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewedBy: session.user.id as string,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null,
      },
    });

    // If APPROVED, update AttendanceRecord to PRESENT
    let beforeRecord: any = null;
    let afterRecord: any = null;

    if (status === "APPROVED" && request.sessionId) {
      const record = await prisma.attendanceRecord.findUnique({
        where: {
          sessionId_studentId: {
            sessionId: request.sessionId,
            studentId: request.studentId,
          },
        },
      });

      if (record) {
        beforeRecord = { status: record.status };
        const updatedRecord = await prisma.attendanceRecord.update({
          where: { id: record.id },
          data: {
            status: "PRESENT",
            remarks: `Corrected via request #${requestId.slice(-5)}: ${reviewNote || "Approved"}`,
          },
        });
        afterRecord = { status: updatedRecord.status };
      } else {
        // Create if missing
        const newRec = await prisma.attendanceRecord.create({
          data: {
            sessionId: request.sessionId,
            studentId: request.studentId,
            status: "PRESENT",
            markedBy: session.user.id as string,
            remarks: `Corrected via request #${requestId.slice(-5)}: ${reviewNote || "Approved"}`,
          },
        });
        afterRecord = { status: newRec.status };
      }
    }

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: `CORRECTION_${status}`,
        entity: "CORRECTION_REQUEST",
        entityId: requestId,
        before: JSON.stringify({ status: previousStatus, attendanceRecord: beforeRecord }),
        after: JSON.stringify({ status, reviewNote, attendanceRecord: afterRecord }),
      },
    });

    // Create Notification for the student
    await prisma.notification.create({
      data: {
        userId: request.student.userId,
        title: `Attendance Correction ${status === "APPROVED" ? "Approved" : "Rejected"}`,
        body: `Your correction request was ${status.toLowerCase()}.${
          reviewNote ? ` Note: "${reviewNote}"` : ""
        }`,
        type: status === "APPROVED" ? "SUCCESS" : "WARNING",
      },
    });

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error: any) {
    console.error("Correction update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update correction" }, { status: 500 });
  }
}
