import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [departments, programs, sections, subjects, assignments, facultyList] = await Promise.all([
    prisma.department.findMany({ orderBy: { code: "asc" } }),
    prisma.program.findMany({ include: { department: true }, orderBy: { name: "asc" } }),
    prisma.classSection.findMany({
      include: { program: true, enrollments: true },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({ include: { department: true }, orderBy: { code: "asc" } }),
    prisma.facultyAssignment.findMany({
      include: {
        faculty: { include: { user: true } },
        subject: true,
        classSection: true,
      },
      orderBy: { classSection: { name: "asc" } },
    }),
    prisma.facultyProfile.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return NextResponse.json({
    departments,
    programs,
    sections,
    subjects,
    assignments,
    facultyList,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { entity, ...data } = body;

    let created: any = null;

    if (entity === "DEPARTMENT") {
      created = await prisma.department.create({
        data: { name: data.name, code: data.code.toUpperCase() },
      });
    } else if (entity === "PROGRAM") {
      created = await prisma.program.create({
        data: { name: data.name, departmentId: data.departmentId },
      });
    } else if (entity === "SECTION") {
      created = await prisma.classSection.create({
        data: {
          name: data.name,
          semester: Number(data.semester),
          section: data.section.toUpperCase(),
          programId: data.programId,
        },
      });
    } else if (entity === "SUBJECT") {
      created = await prisma.subject.create({
        data: {
          name: data.name,
          code: data.code.toUpperCase(),
          departmentId: data.departmentId,
        },
      });
    } else if (entity === "ASSIGNMENT") {
      created = await prisma.facultyAssignment.create({
        data: {
          facultyId: data.facultyId,
          subjectId: data.subjectId,
          classSectionId: data.classSectionId,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: `CREATE_${entity}`,
        entity,
        entityId: created.id,
        after: JSON.stringify(created),
      },
    });

    return NextResponse.json({ success: true, created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create record" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { entity, id, ...data } = body;

    let updated: any = null;

    if (entity === "DEPARTMENT") {
      updated = await prisma.department.update({
        where: { id },
        data: { name: data.name, code: data.code.toUpperCase() },
      });
    } else if (entity === "PROGRAM") {
      updated = await prisma.program.update({
        where: { id },
        data: { name: data.name, departmentId: data.departmentId },
      });
    } else if (entity === "SECTION") {
      updated = await prisma.classSection.update({
        where: { id },
        data: {
          name: data.name,
          semester: Number(data.semester),
          section: data.section.toUpperCase(),
          programId: data.programId,
        },
      });
    } else if (entity === "SUBJECT") {
      updated = await prisma.subject.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code.toUpperCase(),
          departmentId: data.departmentId,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: `UPDATE_${entity}`,
        entity,
        entityId: id,
        after: JSON.stringify(updated),
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update record" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get("entity");
    const id = searchParams.get("id");

    if (!entity || !id) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (entity === "DEPARTMENT") {
      await prisma.department.delete({ where: { id } });
    } else if (entity === "PROGRAM") {
      await prisma.program.delete({ where: { id } });
    } else if (entity === "SECTION") {
      await prisma.classSection.delete({ where: { id } });
    } else if (entity === "SUBJECT") {
      await prisma.subject.delete({ where: { id } });
    } else if (entity === "ASSIGNMENT") {
      await prisma.facultyAssignment.delete({ where: { id } });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: `DELETE_${entity}`,
        entity,
        entityId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete record" }, { status: 500 });
  }
}
