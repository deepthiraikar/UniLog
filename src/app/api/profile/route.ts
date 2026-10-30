import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      studentProfile: {
        include: {
          enrollments: {
            include: { classSection: true },
          },
        },
      },
      facultyProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, branch, qualification } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { facultyProfile: true, studentProfile: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name !== undefined ? name : existingUser.name,
        phone: phone !== undefined ? phone : existingUser.phone,
      },
    });

    // If Faculty, update faculty fields
    if (existingUser.role === "FACULTY" && existingUser.facultyProfile) {
      await prisma.facultyProfile.update({
        where: { id: existingUser.facultyProfile.id },
        data: {
          branch: branch !== undefined ? branch : existingUser.facultyProfile.branch,
          qualification: qualification !== undefined ? qualification : existingUser.facultyProfile.qualification,
        },
      });
    }

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "UPDATE_PROFILE",
        entity: "USER",
        entityId: session.user.id,
        before: JSON.stringify({ name: existingUser.name, phone: existingUser.phone }),
        after: JSON.stringify({ name: updatedUser.name, phone: updatedUser.phone, branch, qualification }),
      },
    });

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
