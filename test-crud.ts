import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function verifyAll() {
  console.log("=== UNILOG COMPREHENSIVE DATA & CRUD VERIFICATION ===");

  // 1. VERIFY DEMO DATA COUNTS (all between 6 and 15)
  console.log("\n[1] Checking Demo Data Counts:");

  const counts = {
    departments: await prisma.department.count(),
    programs: await prisma.program.count(),
    classSections: await prisma.classSection.count(),
    subjects: await prisma.subject.count(),
    facultyProfiles: await prisma.facultyProfile.count(),
    studentProfiles: await prisma.studentProfile.count(),
    facultyAssignments: await prisma.facultyAssignment.count(),
    timetableEntries: await prisma.timetableEntry.count(),
    attendanceSessions: await prisma.attendanceSession.count(),
    attendanceRecords: await prisma.attendanceRecord.count(),
    cieMarks: await prisma.cieMark.count(),
    correctionRequests: await prisma.correctionRequest.count(),
    announcements: await prisma.announcement.count(),
    holidays: await prisma.holiday.count(),
    auditLogs: await prisma.auditLog.count(),
    notifications: await prisma.notification.count(),
  };

  console.table(counts);

  const entitiesToCheck = [
    { name: "Departments", val: counts.departments, min: 6, max: 15 },
    { name: "Programs", val: counts.programs, min: 6, max: 15 },
    { name: "Class Sections", val: counts.classSections, min: 6, max: 15 },
    { name: "Subjects", val: counts.subjects, min: 6, max: 15 },
    { name: "Faculty Members", val: counts.facultyProfiles, min: 6, max: 15 },
    { name: "Students", val: counts.studentProfiles, min: 6, max: 15 },
    { name: "Faculty Assignments", val: counts.facultyAssignments, min: 6, max: 15 },
    { name: "Timetable Entries", val: counts.timetableEntries, min: 6, max: 15 },
    { name: "Attendance Sessions", val: counts.attendanceSessions, min: 6, max: 15 },
    { name: "Correction Requests", val: counts.correctionRequests, min: 6, max: 15 },
    { name: "Announcements", val: counts.announcements, min: 6, max: 15 },
    { name: "Holidays", val: counts.holidays, min: 6, max: 15 },
    { name: "Audit Logs", val: counts.auditLogs, min: 6, max: 15 },
  ];

  for (const item of entitiesToCheck) {
    if (item.val >= item.min && item.val <= item.max) {
      console.log(`  ✓ ${item.name}: ${item.val} items (PASS: between ${item.min} and ${item.max})`);
    } else {
      console.error(`  ✗ ${item.name}: ${item.val} items (FAIL: not between ${item.min} and ${item.max})`);
      process.exit(1);
    }
  }

  // 2. VERIFY CRUD OPERATIONS FOR ADMIN
  console.log("\n[2] Testing ADMIN CRUD Operations:");

  // Create User
  const testUserPass = await bcrypt.hash("temp123", 10);
  const testUser = await prisma.user.create({
    data: {
      email: "test_crud_user@college.edu",
      name: "Temporary Test User",
      role: "STUDENT",
      passwordHash: testUserPass,
    },
  });
  console.log(`  ✓ ADMIN CREATE User: ${testUser.id}`);

  // Read User
  const readUser = await prisma.user.findUnique({ where: { id: testUser.id } });
  if (!readUser || readUser.name !== "Temporary Test User") throw new Error("Read User failed");
  console.log(`  ✓ ADMIN READ User: ${readUser.email}`);

  // Update User
  const updatedUser = await prisma.user.update({
    where: { id: testUser.id },
    data: { name: "Updated Test User", phone: "+91 99999 11111" },
  });
  if (updatedUser.name !== "Updated Test User") throw new Error("Update User failed");
  console.log(`  ✓ ADMIN UPDATE User: ${updatedUser.name}`);

  // Delete User
  await prisma.user.delete({ where: { id: testUser.id } });
  const deletedCheck = await prisma.user.findUnique({ where: { id: testUser.id } });
  if (deletedCheck !== null) throw new Error("Delete User failed");
  console.log("  ✓ ADMIN DELETE User: Successful");

  // Academics CRUD (Department)
  const tempDept = await prisma.department.create({
    data: { code: "TMPDEPT", name: "Temporary Test Department" },
  });
  console.log(`  ✓ ADMIN CREATE Department: ${tempDept.code}`);

  const updatedDept = await prisma.department.update({
    where: { id: tempDept.id },
    data: { name: "Updated Test Department" },
  });
  console.log(`  ✓ ADMIN UPDATE Department: ${updatedDept.name}`);

  await prisma.department.delete({ where: { id: tempDept.id } });
  console.log("  ✓ ADMIN DELETE Department: Successful");

  // Announcements CRUD
  const admin = await prisma.user.findUnique({ where: { email: "admin@college.edu" } });
  const tempAnn = await prisma.announcement.create({
    data: {
      title: "Test CRUD Announcement",
      body: "Testing administrative announcement broadcast lifecycle",
      audience: "ALL",
      createdBy: admin!.id,
    },
  });
  console.log(`  ✓ ADMIN CREATE Announcement: ${tempAnn.title}`);
  await prisma.announcement.delete({ where: { id: tempAnn.id } });
  console.log("  ✓ ADMIN DELETE Announcement: Successful");

  // 3. VERIFY CRUD OPERATIONS FOR FACULTY
  console.log("\n[3] Testing FACULTY CRUD Operations:");

  const faculty = await prisma.facultyProfile.findFirst({
    include: { user: true, assignments: { include: { classSection: true, subject: true } } },
  });
  if (!faculty || faculty.assignments.length === 0) throw new Error("No faculty assignments found");

  const assign = faculty.assignments[0];

  // Start Session (CREATE)
  const testSessionDate = new Date();
  testSessionDate.setHours(0, 0, 0, 0);

  const testSession = await prisma.attendanceSession.create({
    data: {
      classSectionId: assign.classSectionId,
      subjectId: assign.subjectId,
      facultyId: faculty.id,
      date: testSessionDate,
      startTime: "16:00",
      endTime: "17:00",
      status: "ACTIVE",
      remarks: "Test Session for CRUD verification",
    },
  });
  console.log(`  ✓ FACULTY START Session: ID ${testSession.id} (Status: ACTIVE)`);

  // Mark Records (CREATE / UPSERT)
  const sampleStudent = await prisma.studentProfile.findFirst();
  const testRecord = await prisma.attendanceRecord.create({
    data: {
      sessionId: testSession.id,
      studentId: sampleStudent!.id,
      status: "PRESENT",
      markedBy: faculty.userId,
    },
  });
  console.log(`  ✓ FACULTY MARK Attendance: Student ${sampleStudent!.rollNo} marked PRESENT`);

  // Update Record (UPDATE)
  const updatedRecord = await prisma.attendanceRecord.update({
    where: { id: testRecord.id },
    data: { status: "LATE", remarks: "Arrived after 10 mins" },
  });
  console.log(`  ✓ FACULTY UPDATE Attendance: Student ${sampleStudent!.rollNo} updated to ${updatedRecord.status}`);

  // End Session (UPDATE)
  const endedSession = await prisma.attendanceSession.update({
    where: { id: testSession.id },
    data: { status: "ENDED", endedAt: new Date() },
  });
  console.log(`  ✓ FACULTY END Session: Status is now ${endedSession.status}`);

  // Clean up test session
  await prisma.attendanceRecord.delete({ where: { id: testRecord.id } });
  await prisma.attendanceSession.delete({ where: { id: testSession.id } });
  console.log("  ✓ FACULTY Session & Record Cleaned Up: Successful");

  // 4. VERIFY CRUD OPERATIONS FOR STUDENT
  console.log("\n[4] Testing STUDENT CRUD Operations:");

  // Create Correction Request
  const student = await prisma.studentProfile.findFirst({ include: { user: true } });
  const anySession = await prisma.attendanceSession.findFirst();

  const testReq = await prisma.correctionRequest.create({
    data: {
      studentId: student!.id,
      sessionId: anySession!.id,
      reason: "CRUD Verification Correction Request",
      status: "SUBMITTED",
      evidenceUrl: "/uploads/evidence-sample.pdf",
    },
  });
  console.log(`  ✓ STUDENT CREATE Correction Request: ID ${testReq.id}`);

  // Admin / Faculty Review & Update Request
  const reviewedReq = await prisma.correctionRequest.update({
    where: { id: testReq.id },
    data: {
      status: "APPROVED",
      reviewedBy: admin!.id,
      reviewedAt: new Date(),
      reviewNote: "Verified and approved in CRUD test",
    },
  });
  console.log(`  ✓ ADMIN/FACULTY REVIEW & UPDATE Request: Status is ${reviewedReq.status}`);

  // Delete test request
  await prisma.correctionRequest.delete({ where: { id: testReq.id } });
  console.log("  ✓ STUDENT Correction Request Cleaned Up: Successful");

  // 5. NOTIFICATIONS TEST
  const testNotif = await prisma.notification.create({
    data: {
      userId: student!.userId,
      title: "Test Alert",
      body: "Testing notification delivery",
      type: "INFO",
    },
  });
  console.log(`  ✓ NOTIFICATION CREATE: ${testNotif.title}`);

  const readNotif = await prisma.notification.update({
    where: { id: testNotif.id },
    data: { readAt: new Date() },
  });
  console.log(`  ✓ NOTIFICATION MARK AS READ: Read at ${readNotif.readAt?.toISOString()}`);

  await prisma.notification.delete({ where: { id: testNotif.id } });
  console.log("  ✓ NOTIFICATION DELETE: Successful");

  console.log("\n========================================================");
  console.log(">>> ALL DEMO DATA COUNTS & CRUD OPERATIONS VERIFIED 100%! <<<");
  console.log("========================================================\n");
}

verifyAll()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });