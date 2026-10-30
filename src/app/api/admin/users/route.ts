import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const whereClause: any = {};
  if (role && ["ADMIN", "FACULTY", "STUDENT"].includes(role)) {
    whereClause.role = role;
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, users, ...singleUser } = body;

    // Bulk Import Action
    if (action === "BULK_IMPORT" && Array.isArray(users)) {
      const defaultPasswordHash = await bcrypt.hash("password123", 10);
      let importedCount = 0;

      for (const row of users) {
        if (!row.email || !row.name) continue;
        const normalizedEmail = row.email.toLowerCase().trim();

        // Check if exists
        const existing = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (existing) continue;

        const role = (row.role || "STUDENT").toUpperCase();

        const user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: row.name.trim(),
            passwordHash: defaultPasswordHash,
            role,
            phone: row.phone || null,
            isActive: true,
          },
        });

        if (role === "STUDENT") {
          const sp = await prisma.studentProfile.create({
            data: {
              userId: user.id,
              rollNo: row.rollNo ? row.rollNo.trim().toUpperCase() : `ROLL${Date.now()}`,
              branch: row.branch || "CSE",
              semester: Number(row.semester) || 1,
              section: row.section || "A",
            },
          });

          // Check if section exists, and auto-enroll
          if (row.sectionName) {
            const sec = await prisma.classSection.findUnique({
              where: { name: row.sectionName.trim() },
            });
            if (sec) {
              await prisma.enrollment.create({
                data: {
                  studentId: sp.id,
                  classSectionId: sec.id,
                },
              });
            }
          }
        } else if (role === "FACULTY") {
          await prisma.facultyProfile.create({
            data: {
              userId: user.id,
              employeeId: row.employeeId ? row.employeeId.trim().toUpperCase() : `FAC${Date.now()}`,
              branch: row.branch || "CSE",
              qualification: row.qualification || "M.Tech",
              joiningDate: new Date(),
            },
          });
        }

        importedCount++;
      }

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id as string,
          action: "BULK_IMPORT_USERS",
          entity: "USER",
          entityId: "MULTIPLE",
          after: JSON.stringify({ count: importedCount }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Imported ${importedCount} users successfully`,
      });
    }

    // Single User Creation
    const { email, name, password, role, phone, rollNo, branch, semester, section, employeeId, qualification } = singleUser;

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password || "password123", 10);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        role: role.toUpperCase(),
        passwordHash,
        phone: phone || null,
        isActive: true,
      },
    });

    if (newUser.role === "STUDENT") {
      const sp = await prisma.studentProfile.create({
        data: {
          userId: newUser.id,
          rollNo: rollNo ? rollNo.trim().toUpperCase() : `CSE${Date.now().toString().slice(-4)}`,
          branch: branch || "CSE",
          semester: Number(semester) || 1,
          section: section || "A",
        },
      });

      // Find section if matching
      const targetSecName = `${branch || "CSE"}-${semester || 1}${section || "A"}`;
      const sec = await prisma.classSection.findFirst({
        where: {
          semester: Number(semester) || 1,
          section: section || "A",
        },
      });
      if (sec) {
        await prisma.enrollment.create({
          data: {
            studentId: sp.id,
            classSectionId: sec.id,
          },
        });
      }
    } else if (newUser.role === "FACULTY") {
      await prisma.facultyProfile.create({
        data: {
          userId: newUser.id,
          employeeId: employeeId ? employeeId.trim().toUpperCase() : `FAC${Date.now().toString().slice(-4)}`,
          branch: branch || "CSE",
          qualification: qualification || "Ph.D.",
          joiningDate: new Date(),
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: "CREATE_USER",
        entity: "USER",
        entityId: newUser.id,
        after: JSON.stringify({ email: newUser.email, role: newUser.role, name: newUser.name }),
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, isActive, name, phone, branch, semester, section, qualification } = body;

    const existing = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true, facultyProfile: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        phone: phone !== undefined ? phone : existing.phone,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    if (existing.role === "STUDENT" && existing.studentProfile) {
      await prisma.studentProfile.update({
        where: { id: existing.studentProfile.id },
        data: {
          branch: branch !== undefined ? branch : existing.studentProfile.branch,
          semester: semester !== undefined ? Number(semester) : existing.studentProfile.semester,
          section: section !== undefined ? section : existing.studentProfile.section,
        },
      });
    } else if (existing.role === "FACULTY" && existing.facultyProfile) {
      await prisma.facultyProfile.update({
        where: { id: existing.facultyProfile.id },
        data: {
          branch: branch !== undefined ? branch : existing.facultyProfile.branch,
          qualification: qualification !== undefined ? qualification : existing.facultyProfile.qualification,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: isActive !== undefined && isActive !== existing.isActive ? "TOGGLE_USER_STATUS" : "UPDATE_USER",
        entity: "USER",
        entityId: id,
        before: JSON.stringify({ name: existing.name, isActive: existing.isActive }),
        after: JSON.stringify({ name: updated.name, isActive: updated.isActive }),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Protect current admin from deleting themselves
    if (existing.id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: "DELETE_USER",
        entity: "USER",
        entityId: id,
        before: JSON.stringify({ email: existing.email, role: existing.role, name: existing.name }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
