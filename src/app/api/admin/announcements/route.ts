import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ announcements });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, body: announcementBody, audience } = body;

    if (!title || !announcementBody || !audience) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        body: announcementBody.trim(),
        audience,
        createdBy: session.user.id as string,
      },
    });

    // Query target users for notifications
    const userWhere: any = { isActive: true };
    if (audience === "FACULTY") {
      userWhere.role = "FACULTY";
    } else if (audience === "STUDENTS") {
      userWhere.role = "STUDENT";
    }

    const targetUsers = await prisma.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    // Broadcast notifications
    for (const u of targetUsers) {
      await prisma.notification.create({
        data: {
          userId: u.id,
          title: announcement.title,
          body: announcement.body,
          type: "INFO",
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: "CREATE_ANNOUNCEMENT",
        entity: "ANNOUNCEMENT",
        entityId: announcement.id,
        after: JSON.stringify({ title, audience, targetUserCount: targetUsers.length }),
      },
    });

    return NextResponse.json({ success: true, announcement, notifiedCount: targetUsers.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create announcement" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing announcement ID" }, { status: 400 });
    }

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    await prisma.announcement.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: "DELETE_ANNOUNCEMENT",
        entity: "ANNOUNCEMENT",
        entityId: id,
        before: JSON.stringify({ title: existing.title, audience: existing.audience }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete announcement" }, { status: 500 });
  }
}
