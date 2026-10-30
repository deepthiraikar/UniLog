import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get("sectionId");

  const sections = await prisma.classSection.findMany({
    orderBy: { name: "asc" },
  });

  let targetSectionId = sectionId;

  // If student role, automatically default to their enrolled section
  if (!targetSectionId && (session.user as any)?.role === "STUDENT") {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: { enrollments: true },
    });
    if (student?.enrollments?.[0]) {
      targetSectionId = student.enrollments[0].classSectionId;
    }
  }

  // If still no target, prefer CSE-3A (primary demo section with entries), then first section
  if (!targetSectionId) {
    const preferredSection = sections.find((s) => s.name === "CSE-3A") || sections[0];
    targetSectionId = preferredSection?.id ?? "";
  }

  const currentSection = sections.find((s) => s.id === targetSectionId);

  const entries = targetSectionId
    ? await prisma.timetableEntry.findMany({
        where: {
          classSectionId: targetSectionId,
          upload: { status: "PUBLISHED" },
        },
        include: {
          subject: true,
          faculty: { include: { user: true } },
          classSection: true,
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      })
    : [];

  return NextResponse.json({
    sections,
    entries,
    currentSectionId: targetSectionId,
    currentSectionName: currentSection?.name || "CSE-3A",
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, rawRows, fileName, validEntries } = body;

    // Action 1: Validate and conflict detection
    if (action === "VALIDATE") {
      const allSubjects = await prisma.subject.findMany();
      const allFaculty = await prisma.facultyProfile.findMany({ include: { user: true } });
      const allSections = await prisma.classSection.findMany();

      const subjectMap = new Map(allSubjects.map((s) => [s.code.toUpperCase(), s]));
      const facultyMap = new Map(allFaculty.map((f) => [f.user.email.toLowerCase(), f]));
      const sectionMap = new Map(allSections.map((sec) => [sec.name.toUpperCase(), sec]));

      const validRows: any[] = [];
      const errorRows: any[] = [];
      const conflictRows: any[] = [];

      // Check each row
      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];
        const day = Number(row.dayOfWeek);
        const start = row.startTime?.trim();
        const end = row.endTime?.trim();
        const subCode = row.subjectCode?.trim().toUpperCase();
        const facEmail = row.facultyEmail?.trim().toLowerCase();
        const secName = row.sectionName?.trim().toUpperCase();
        const room = row.room?.trim() || "Room 101";

        const errors: string[] = [];

        if (!day || day < 1 || day > 6) errors.push("Invalid dayOfWeek (must be 1-6)");
        if (!start || !end) errors.push("Missing time slot");

        const sub = subjectMap.get(subCode);
        if (!sub) errors.push(`Unknown subject code: ${subCode}`);

        const fac = facultyMap.get(facEmail);
        if (!fac) errors.push(`Unknown faculty email: ${facEmail}`);

        const sec = sectionMap.get(secName);
        if (!sec) errors.push(`Unknown section name: ${secName}`);

        if (errors.length > 0) {
          errorRows.push({ ...row, index: i, errors });
          continue;
        }

        // Check for conflicts against already parsed valid rows in this batch
        const clashes: string[] = [];
        for (const existing of validRows) {
          if (existing.dayOfWeek === day) {
            // Overlapping time condition: (start < existing.end) and (end > existing.start)
            const overlap = start < existing.endTime && end > existing.startTime;
            if (overlap) {
              if (existing.facultyId === fac!.id) {
                clashes.push(`Faculty ${fac!.user.name} double-booked at ${start}-${end}`);
              }
              if (existing.classSectionId === sec!.id) {
                clashes.push(`Section ${sec!.name} already has a class scheduled at ${start}-${end}`);
              }
              if (existing.room === room && room) {
                clashes.push(`Room clash: ${room} is already booked at ${start}-${end}`);
              }
            }
          }
        }

        if (clashes.length > 0) {
          conflictRows.push({
            ...row,
            index: i,
            conflicts: clashes,
            subjectId: sub!.id,
            facultyId: fac!.id,
            classSectionId: sec!.id,
          });
        } else {
          validRows.push({
            dayOfWeek: day,
            startTime: start,
            endTime: end,
            subjectCode: subCode,
            subjectName: sub!.name,
            subjectId: sub!.id,
            facultyEmail: facEmail,
            facultyName: fac!.user.name,
            facultyId: fac!.id,
            sectionName: secName,
            classSectionId: sec!.id,
            room,
            index: i,
          });
        }
      }

      return NextResponse.json({
        validRows,
        errorRows,
        conflictRows,
        canPublish: errorRows.length === 0 && conflictRows.length === 0 && validRows.length > 0,
      });
    }

    // Action 2: Publish timetable
    if (action === "PUBLISH") {
      if (!Array.isArray(validEntries) || validEntries.length === 0) {
        return NextResponse.json({ error: "No entries to publish" }, { status: 400 });
      }

      const upload = await prisma.timetableUpload.create({
        data: {
          fileName: fileName || "Timetable_Upload.csv",
          uploadedBy: session.user.id as string,
          status: "PUBLISHED",
        },
      });

      for (const entry of validEntries) {
        await prisma.timetableEntry.create({
          data: {
            uploadId: upload.id,
            classSectionId: entry.classSectionId,
            subjectId: entry.subjectId,
            facultyId: entry.facultyId,
            dayOfWeek: Number(entry.dayOfWeek),
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: entry.room || null,
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id as string,
          action: "PUBLISH_TIMETABLE",
          entity: "TIMETABLE",
          entityId: upload.id,
          after: JSON.stringify({ entriesCount: validEntries.length, fileName }),
        },
      });

      return NextResponse.json({ success: true, uploadId: upload.id });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process timetable" }, { status: 500 });
  }
}
