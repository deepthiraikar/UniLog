import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let policy = await prisma.attendancePolicy.findFirst();
  if (!policy) {
    policy = await prisma.attendancePolicy.create({
      data: {
        id: 1,
        minPercentage: 75.0,
        lateAfterMinutes: 10,
        editWindowMinutes: 30,
        gracePeriodDays: 0,
      },
    });
  }

  const holidays = await prisma.holiday.findMany({
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ policy, holidays });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { minPercentage, lateAfterMinutes, editWindowMinutes, gracePeriodDays } = body;

    const previousPolicy = await prisma.attendancePolicy.findFirst();

    const updated = await prisma.attendancePolicy.upsert({
      where: { id: 1 },
      update: {
        minPercentage: Number(minPercentage),
        lateAfterMinutes: Number(lateAfterMinutes),
        editWindowMinutes: Number(editWindowMinutes),
        gracePeriodDays: Number(gracePeriodDays),
      },
      create: {
        id: 1,
        minPercentage: Number(minPercentage),
        lateAfterMinutes: Number(lateAfterMinutes),
        editWindowMinutes: Number(editWindowMinutes),
        gracePeriodDays: Number(gracePeriodDays),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: "UPDATE_ATTENDANCE_POLICY",
        entity: "POLICY",
        entityId: "1",
        before: JSON.stringify(previousPolicy),
        after: JSON.stringify(updated),
      },
    });

    return NextResponse.json({ success: true, policy: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update policy" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, holidayId, date, name } = body;

    if (action === "ADD_HOLIDAY") {
      if (!date || !name) {
        return NextResponse.json({ error: "Missing date or name" }, { status: 400 });
      }

      const holiday = await prisma.holiday.create({
        data: {
          date: new Date(date),
          name: name.trim(),
        },
      });

      return NextResponse.json({ success: true, holiday });
    }

    if (action === "DELETE_HOLIDAY") {
      if (!holidayId) {
        return NextResponse.json({ error: "Missing holiday ID" }, { status: 400 });
      }

      await prisma.holiday.delete({ where: { id: holidayId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process holiday" }, { status: 500 });
  }
}
