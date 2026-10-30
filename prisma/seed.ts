import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting comprehensive UNILOG database seed...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // Clean existing dynamic data to avoid conflicts on re-seeding
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.correctionRequest.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.attendanceSession.deleteMany({});
  await prisma.cieMark.deleteMany({});
  await prisma.timetableEntry.deleteMany({});
  await prisma.timetableUpload.deleteMany({});
  await prisma.facultyAssignment.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.holiday.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.classSection.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.facultyProfile.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // =========================================================================
  // 1. Attendance Policy (Admin Settings)
  // =========================================================================
  await prisma.attendancePolicy.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      minPercentage: 75.0,
      lateAfterMinutes: 10,
      editWindowMinutes: 30,
      gracePeriodDays: 2,
    },
  });

  // =========================================================================
  // 2. Departments (6 departments - within 6 to 15)
  // =========================================================================
  const departmentsData = [
    { code: "CSE", name: "Computer Science and Engineering" },
    { code: "ECE", name: "Electronics and Communication Engineering" },
    { code: "AIML", name: "Artificial Intelligence and Machine Learning" },
    { code: "ISE", name: "Information Science and Engineering" },
    { code: "MECH", name: "Mechanical Engineering" },
    { code: "CIVIL", name: "Civil Engineering" },
  ];

  const departments: Record<string, any> = {};
  for (const dept of departmentsData) {
    departments[dept.code] = await prisma.department.create({
      data: dept,
    });
  }

  // =========================================================================
  // 3. Academic Programs (6 programs - within 6 to 15)
  // =========================================================================
  const programsData = [
    { name: "B.Tech Computer Science and Engineering", deptCode: "CSE" },
    { name: "B.Tech Artificial Intelligence and Data Science", deptCode: "AIML" },
    { name: "B.Tech Electronics and Communication", deptCode: "ECE" },
    { name: "B.Tech Information Science and Engineering", deptCode: "ISE" },
    { name: "B.Tech Mechanical Engineering", deptCode: "MECH" },
    { name: "M.Tech Software Engineering", deptCode: "CSE" },
  ];

  const programs: Record<string, any> = {};
  for (const p of programsData) {
    programs[p.name] = await prisma.program.create({
      data: {
        name: p.name,
        departmentId: departments[p.deptCode].id,
      },
    });
  }

  // =========================================================================
  // 4. Class Sections (6 sections - within 6 to 15)
  // =========================================================================
  const sectionsData = [
    { name: "CSE-3A", semester: 3, section: "A", programName: "B.Tech Computer Science and Engineering" },
    { name: "CSE-3B", semester: 3, section: "B", programName: "B.Tech Computer Science and Engineering" },
    { name: "CSE-5A", semester: 5, section: "A", programName: "B.Tech Computer Science and Engineering" },
    { name: "AIML-3A", semester: 3, section: "A", programName: "B.Tech Artificial Intelligence and Data Science" },
    { name: "ECE-3A", semester: 3, section: "A", programName: "B.Tech Electronics and Communication" },
    { name: "ISE-3A", semester: 3, section: "A", programName: "B.Tech Information Science and Engineering" },
  ];

  const sections: Record<string, any> = {};
  for (const s of sectionsData) {
    sections[s.name] = await prisma.classSection.create({
      data: {
        name: s.name,
        semester: s.semester,
        section: s.section,
        programId: programs[s.programName].id,
      },
    });
  }

  // =========================================================================
  // 5. Academic Subjects (8 subjects - within 6 to 15)
  // =========================================================================
  const subjectsData = [
    { code: "CS301", name: "Database Management Systems", deptCode: "CSE" },
    { code: "CS302", name: "Operating Systems", deptCode: "CSE" },
    { code: "CS303", name: "Computer Networks", deptCode: "CSE" },
    { code: "CS304", name: "Software Engineering & Architecture", deptCode: "CSE" },
    { code: "AI301", name: "Machine Learning Foundations", deptCode: "AIML" },
    { code: "EC301", name: "Signals & Linear Systems", deptCode: "ECE" },
    { code: "IS301", name: "Web Technologies & Cloud Services", deptCode: "ISE" },
    { code: "MA301", name: "Discrete Mathematical Structures", deptCode: "CSE" },
  ];

  const subjects: Record<string, any> = {};
  for (const s of subjectsData) {
    subjects[s.code] = await prisma.subject.create({
      data: {
        code: s.code,
        name: s.name,
        departmentId: departments[s.deptCode].id,
      },
    });
  }

  // =========================================================================
  // 6. Users: Admin
  // =========================================================================
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@college.edu",
      name: "Dr. Meera Iyer",
      role: "ADMIN",
      passwordHash,
      phone: "+91 98765 43210",
      isActive: true,
    },
  });

  // =========================================================================
  // 7. Users: Faculty Members (6 faculty members - within 6 to 15)
  // =========================================================================
  const facultyData = [
    {
      email: "faculty@college.edu",
      name: "Prof. Sharma",
      employeeId: "FAC001",
      branch: "CSE",
      qualification: "Ph.D. in Computer Science",
      joiningDate: new Date("2019-07-15"),
      phone: "+91 98765 00001",
    },
    {
      email: "faculty2@college.edu",
      name: "Prof. Nair",
      employeeId: "FAC002",
      branch: "CSE",
      qualification: "M.Tech in Computer Networks",
      joiningDate: new Date("2020-08-01"),
      phone: "+91 98765 00002",
    },
    {
      email: "faculty3@college.edu",
      name: "Prof. Rao",
      employeeId: "FAC003",
      branch: "CSE",
      qualification: "Ph.D. in Software Engineering",
      joiningDate: new Date("2018-01-10"),
      phone: "+91 98765 00003",
    },
    {
      email: "faculty4@college.edu",
      name: "Dr. Deepa Kulkarni",
      employeeId: "FAC004",
      branch: "AIML",
      qualification: "Ph.D. in Machine Learning",
      joiningDate: new Date("2021-03-20"),
      phone: "+91 98765 00004",
    },
    {
      email: "faculty5@college.edu",
      name: "Prof. Rajesh Verma",
      employeeId: "FAC005",
      branch: "ECE",
      qualification: "M.Tech in Digital Signal Processing",
      joiningDate: new Date("2021-11-05"),
      phone: "+91 98765 00005",
    },
    {
      email: "faculty6@college.edu",
      name: "Dr. Sunita Deshmukh",
      employeeId: "FAC006",
      branch: "CSE",
      qualification: "Ph.D. in Applied Mathematics",
      joiningDate: new Date("2017-09-12"),
      phone: "+91 98765 00006",
    },
  ];

  const facultyProfiles: Record<string, any> = {};
  for (const f of facultyData) {
    const user = await prisma.user.create({
      data: {
        email: f.email,
        name: f.name,
        role: "FACULTY",
        passwordHash,
        phone: f.phone,
        isActive: true,
      },
    });

    const prof = await prisma.facultyProfile.create({
      data: {
        userId: user.id,
        employeeId: f.employeeId,
        branch: f.branch,
        qualification: f.qualification,
        joiningDate: f.joiningDate,
      },
    });
    facultyProfiles[f.email] = { ...prof, user };
  }

  // =========================================================================
  // 8. Faculty Assignments (8 assignments - within 6 to 15)
  // =========================================================================
  const assignmentsData = [
    { facEmail: "faculty@college.edu", subCode: "CS301", secName: "CSE-3A" },
    { facEmail: "faculty@college.edu", subCode: "CS302", secName: "CSE-3A" },
    { facEmail: "faculty2@college.edu", subCode: "CS303", secName: "CSE-3A" },
    { facEmail: "faculty3@college.edu", subCode: "CS304", secName: "CSE-3A" },
    { facEmail: "faculty6@college.edu", subCode: "MA301", secName: "CSE-3A" },
    { facEmail: "faculty4@college.edu", subCode: "AI301", secName: "AIML-3A" },
    { facEmail: "faculty5@college.edu", subCode: "EC301", secName: "ECE-3A" },
    { facEmail: "faculty3@college.edu", subCode: "IS301", secName: "ISE-3A" },
  ];

  for (const a of assignmentsData) {
    await prisma.facultyAssignment.create({
      data: {
        facultyId: facultyProfiles[a.facEmail].id,
        subjectId: subjects[a.subCode].id,
        classSectionId: sections[a.secName].id,
      },
    });
  }

  // =========================================================================
  // 9. Users: Students (12 enrolled students - within 6 to 15)
  // =========================================================================
  const studentsList = [
    { name: "Aarav Patel", email: "aarav@college.edu", rollNo: "CSE001", phone: "+91 98001 00001" },
    { name: "Priya Sharma", email: "priya@college.edu", rollNo: "CSE002", phone: "+91 98001 00002" },
    { name: "Rohan Verma", email: "rohan@college.edu", rollNo: "CSE003", phone: "+91 98001 00003" },
    { name: "Ananya Iyer", email: "ananya@college.edu", rollNo: "CSE004", phone: "+91 98001 00004" },
    { name: "Vikram Malhotra", email: "vikram@college.edu", rollNo: "CSE005", phone: "+91 98001 00005" },
    { name: "Sneha Reddy", email: "sneha@college.edu", rollNo: "CSE006", phone: "+91 98001 00006" },
    { name: "Aditya Joshi", email: "aditya@college.edu", rollNo: "CSE007", phone: "+91 98001 00007" },
    { name: "Tanvi Deshmukh", email: "tanvi@college.edu", rollNo: "CSE008", phone: "+91 98001 00008" },
    { name: "Kunal Bansal", email: "kunal@college.edu", rollNo: "CSE009", phone: "+91 98001 00009" },
    { name: "Meera Menon", email: "meera@college.edu", rollNo: "CSE010", phone: "+91 98001 00010" },
    { name: "Siddharth Sen", email: "siddharth@college.edu", rollNo: "CSE011", phone: "+91 98001 00011" },
    { name: "Ishita Gupta", email: "ishita@college.edu", rollNo: "CSE012", phone: "+91 98001 00012" },
  ];

  const studentProfiles: any[] = [];
  const primarySection = sections["CSE-3A"];

  for (const s of studentsList) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        name: s.name,
        role: "STUDENT",
        passwordHash,
        phone: s.phone,
        isActive: true,
      },
    });

    const sp = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        rollNo: s.rollNo,
        branch: "CSE",
        semester: 3,
        section: "A",
      },
    });

    studentProfiles.push({ ...sp, user });

    // Enroll in primary classSection CSE-3A
    await prisma.enrollment.create({
      data: {
        studentId: sp.id,
        classSectionId: primarySection.id,
      },
    });
  }

  // =========================================================================
  // 10. Timetable Entries (Comprehensive multi-section schedule)
  // =========================================================================
  const timetableUpload = await prisma.timetableUpload.create({
    data: {
      fileName: "Institutional_Master_Timetable.csv",
      uploadedBy: adminUser.id,
      status: "PUBLISHED",
    },
  });

  // 1. CSE-3A Schedule (15 slots)
  const cse3aData = [
    // Monday
    { day: 1, start: "09:00", end: "10:00", sub: "CS301", fac: "faculty@college.edu", room: "Lab 201" },
    { day: 1, start: "10:00", end: "11:00", sub: "CS302", fac: "faculty@college.edu", room: "Room 304" },
    { day: 1, start: "11:15", end: "12:15", sub: "CS303", fac: "faculty2@college.edu", room: "Room 304" },
    // Tuesday
    { day: 2, start: "09:00", end: "10:00", sub: "CS303", fac: "faculty2@college.edu", room: "Room 304" },
    { day: 2, start: "10:00", end: "11:00", sub: "CS304", fac: "faculty3@college.edu", room: "Room 305" },
    { day: 2, start: "11:15", end: "12:15", sub: "MA301", fac: "faculty6@college.edu", room: "Room 304" },
    // Wednesday
    { day: 3, start: "09:00", end: "10:00", sub: "CS302", fac: "faculty@college.edu", room: "Room 304" },
    { day: 3, start: "10:00", end: "11:00", sub: "CS304", fac: "faculty3@college.edu", room: "Room 305" },
    { day: 3, start: "11:15", end: "12:15", sub: "CS301", fac: "faculty@college.edu", room: "Lab 201" },
    // Thursday
    { day: 4, start: "09:00", end: "10:00", sub: "CS301", fac: "faculty@college.edu", room: "Room 304" },
    { day: 4, start: "10:00", end: "11:00", sub: "CS302", fac: "faculty@college.edu", room: "Room 304" },
    { day: 4, start: "11:15", end: "12:15", sub: "MA301", fac: "faculty6@college.edu", room: "Room 304" },
    // Friday
    { day: 5, start: "09:00", end: "10:00", sub: "CS303", fac: "faculty2@college.edu", room: "Lab 202" },
    { day: 5, start: "10:00", end: "11:00", sub: "CS304", fac: "faculty3@college.edu", room: "Lab 203" },
    { day: 5, start: "11:15", end: "12:15", sub: "CS301", fac: "faculty@college.edu", room: "Room 304" },
  ];

  for (const t of cse3aData) {
    await prisma.timetableEntry.create({
      data: {
        uploadId: timetableUpload.id,
        classSectionId: primarySection.id,
        subjectId: subjects[t.sub].id,
        facultyId: facultyProfiles[t.fac].id,
        dayOfWeek: t.day,
        startTime: t.start,
        endTime: t.end,
        room: t.room,
      },
    });
  }

  // 2. AIML-3A Schedule (12 slots)
  const aimlSection = sections["AIML-3A"];
  const aiml3aData = [
    { day: 1, start: "09:00", end: "10:00", sub: "AI301", fac: "faculty4@college.edu", room: "AI Lab 1" },
    { day: 1, start: "10:00", end: "11:00", sub: "CS301", fac: "faculty@college.edu", room: "Room 205" },
    { day: 1, start: "11:15", end: "12:15", sub: "MA301", fac: "faculty6@college.edu", room: "Room 205" },
    { day: 2, start: "09:00", end: "10:00", sub: "CS302", fac: "faculty@college.edu", room: "Room 205" },
    { day: 2, start: "10:00", end: "11:00", sub: "AI301", fac: "faculty4@college.edu", room: "AI Lab 1" },
    { day: 3, start: "09:00", end: "10:00", sub: "CS303", fac: "faculty2@college.edu", room: "Room 205" },
    { day: 3, start: "10:00", end: "11:00", sub: "AI301", fac: "faculty4@college.edu", room: "AI Lab 1" },
    { day: 4, start: "09:00", end: "10:00", sub: "CS301", fac: "faculty@college.edu", room: "Room 205" },
    { day: 4, start: "10:00", end: "11:00", sub: "MA301", fac: "faculty6@college.edu", room: "Room 205" },
    { day: 5, start: "09:00", end: "10:00", sub: "AI301", fac: "faculty4@college.edu", room: "AI Lab 1" },
    { day: 5, start: "10:00", end: "11:00", sub: "CS304", fac: "faculty3@college.edu", room: "Room 205" },
    { day: 5, start: "11:15", end: "12:15", sub: "CS302", fac: "faculty@college.edu", room: "Room 205" },
  ];

  for (const t of aiml3aData) {
    await prisma.timetableEntry.create({
      data: {
        uploadId: timetableUpload.id,
        classSectionId: aimlSection.id,
        subjectId: subjects[t.sub].id,
        facultyId: facultyProfiles[t.fac].id,
        dayOfWeek: t.day,
        startTime: t.start,
        endTime: t.end,
        room: t.room,
      },
    });
  }

  // 3. ECE-3A Schedule (10 slots)
  const eceSection = sections["ECE-3A"];
  const ece3aData = [
    { day: 1, start: "09:00", end: "10:00", sub: "EC301", fac: "faculty5@college.edu", room: "VLSI Lab" },
    { day: 1, start: "10:00", end: "11:00", sub: "MA301", fac: "faculty6@college.edu", room: "Room 102" },
    { day: 2, start: "09:00", end: "10:00", sub: "EC301", fac: "faculty5@college.edu", room: "VLSI Lab" },
    { day: 2, start: "10:00", end: "11:00", sub: "CS302", fac: "faculty@college.edu", room: "Room 102" },
    { day: 3, start: "09:00", end: "10:00", sub: "CS303", fac: "faculty2@college.edu", room: "Room 102" },
    { day: 3, start: "10:00", end: "11:00", sub: "EC301", fac: "faculty5@college.edu", room: "VLSI Lab" },
    { day: 4, start: "09:00", end: "10:00", sub: "EC301", fac: "faculty5@college.edu", room: "Room 102" },
    { day: 4, start: "10:00", end: "11:00", sub: "MA301", fac: "faculty6@college.edu", room: "Room 102" },
    { day: 5, start: "09:00", end: "10:00", sub: "EC301", fac: "faculty5@college.edu", room: "VLSI Lab" },
    { day: 5, start: "10:00", end: "11:00", sub: "CS302", fac: "faculty@college.edu", room: "Room 102" },
  ];

  for (const t of ece3aData) {
    await prisma.timetableEntry.create({
      data: {
        uploadId: timetableUpload.id,
        classSectionId: eceSection.id,
        subjectId: subjects[t.sub].id,
        facultyId: facultyProfiles[t.fac].id,
        dayOfWeek: t.day,
        startTime: t.start,
        endTime: t.end,
        room: t.room,
      },
    });
  }

  // 4. CSE-3B Schedule (10 slots)
  const cse3bSection = sections["CSE-3B"];
  const cse3bData = [
    { day: 1, start: "09:00", end: "10:00", sub: "CS302", fac: "faculty@college.edu", room: "Room 306" },
    { day: 1, start: "10:00", end: "11:00", sub: "CS301", fac: "faculty@college.edu", room: "Lab 202" },
    { day: 2, start: "09:00", end: "10:00", sub: "CS304", fac: "faculty3@college.edu", room: "Room 306" },
    { day: 2, start: "10:00", end: "11:00", sub: "CS303", fac: "faculty2@college.edu", room: "Room 306" },
    { day: 3, start: "09:00", end: "10:00", sub: "CS301", fac: "faculty@college.edu", room: "Lab 202" },
    { day: 3, start: "10:00", end: "11:00", sub: "MA301", fac: "faculty6@college.edu", room: "Room 306" },
    { day: 4, start: "09:00", end: "10:00", sub: "CS303", fac: "faculty2@college.edu", room: "Room 306" },
    { day: 4, start: "10:00", end: "11:00", sub: "CS304", fac: "faculty3@college.edu", room: "Room 306" },
    { day: 5, start: "09:00", end: "10:00", sub: "CS302", fac: "faculty@college.edu", room: "Room 306" },
    { day: 5, start: "10:00", end: "11:00", sub: "MA301", fac: "faculty6@college.edu", room: "Room 306" },
  ];

  for (const t of cse3bData) {
    await prisma.timetableEntry.create({
      data: {
        uploadId: timetableUpload.id,
        classSectionId: cse3bSection.id,
        subjectId: subjects[t.sub].id,
        facultyId: facultyProfiles[t.fac].id,
        dayOfWeek: t.day,
        startTime: t.start,
        endTime: t.end,
        room: t.room,
      },
    });
  }

  // =========================================================================
  // 11. Attendance Sessions (10 sessions total: 9 ended + 1 active - within 6 to 15)
  // =========================================================================
  const sessionTemplates = [
    { daysAgo: 14, start: "09:00", end: "10:00", sub: "CS301", facEmail: "faculty@college.edu", status: "ENDED" },
    { daysAgo: 13, start: "10:00", end: "11:00", sub: "CS302", facEmail: "faculty@college.edu", status: "ENDED" },
    { daysAgo: 11, start: "11:15", end: "12:15", sub: "CS303", facEmail: "faculty2@college.edu", status: "ENDED" },
    { daysAgo: 10, start: "10:00", end: "11:00", sub: "CS304", facEmail: "faculty3@college.edu", status: "ENDED" },
    { daysAgo: 8,  start: "11:15", end: "12:15", sub: "MA301", facEmail: "faculty6@college.edu", status: "ENDED" },
    { daysAgo: 7,  start: "09:00", end: "10:00", sub: "CS301", facEmail: "faculty@college.edu", status: "ENDED" },
    { daysAgo: 6,  start: "10:00", end: "11:00", sub: "CS302", facEmail: "faculty@college.edu", status: "ENDED" },
    { daysAgo: 4,  start: "09:00", end: "10:00", sub: "CS303", facEmail: "faculty2@college.edu", status: "ENDED" },
    { daysAgo: 2,  start: "10:00", end: "11:00", sub: "CS304", facEmail: "faculty3@college.edu", status: "ENDED" },
    // 10th session: LIVE ACTIVE SESSION for today
    { daysAgo: 0,  start: "10:00", end: "11:00", sub: "CS301", facEmail: "faculty@college.edu", status: "ACTIVE" },
  ];

  const createdSessions: any[] = [];

  for (let i = 0; i < sessionTemplates.length; i++) {
    const st = sessionTemplates[i];
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() - st.daysAgo);
    sessionDate.setHours(0, 0, 0, 0);

    const endedAt = st.status === "ENDED" ? new Date(sessionDate.getTime() + 60 * 60 * 1000) : null;

    const session = await prisma.attendanceSession.create({
      data: {
        classSectionId: primarySection.id,
        subjectId: subjects[st.sub].id,
        facultyId: facultyProfiles[st.facEmail].id,
        date: sessionDate,
        startTime: st.start,
        endTime: st.end,
        status: st.status,
        remarks: st.status === "ACTIVE" ? "Live session currently in progress" : `Lecture ${i + 1} completed`,
        createdAt: sessionDate,
        endedAt: endedAt,
      },
    });
    createdSessions.push(session);

    // Create attendance records for all 12 students
    for (const sp of studentProfiles) {
      let status = "PRESENT";
      const rollNum = parseInt(sp.rollNo.replace("CSE", ""), 10);

      if (st.status === "ACTIVE") {
        // Active session: mark 10 present, 2 absent as default draft
        status = (rollNum === 3 || rollNum === 8) ? "ABSENT" : "PRESENT";
      } else {
        // Realistic distribution
        if (rollNum === 3) {
          // Rohan (CSE003): at risk (~55% attendance)
          status = (i % 2 === 0) ? "ABSENT" : "PRESENT";
        } else if (rollNum === 8) {
          // Tanvi (CSE008): at risk (~66% attendance)
          status = (i % 3 === 0) ? "ABSENT" : (i === 4 ? "LATE" : "PRESENT");
        } else if (rollNum === 5) {
          // Vikram (CSE005): borderline (77%)
          status = (i === 2 || i === 7) ? "ABSENT" : "PRESENT";
        } else {
          // Most students (Aarav, Priya, Ananya, etc.): 90%+ attendance
          if (i === 6 && rollNum % 4 === 0) status = "LATE";
          else if (i === 8 && rollNum === 7) status = "EXCUSED";
          else status = "PRESENT";
        }
      }

      await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: sp.id,
          status,
          markedBy: facultyProfiles[st.facEmail].userId,
          markedAt: endedAt || new Date(),
        },
      });
    }
  }

  // =========================================================================
  // 12. CIE Internal Marks (8 subjects evaluations per student - within 6 to 15)
  // =========================================================================
  const cieSubjectCodes = ["CS301", "CS302", "CS303", "CS304", "MA301"];
  for (const sp of studentProfiles) {
    const rollNum = parseInt(sp.rollNo.replace("CSE", ""), 10);
    for (const subCode of cieSubjectCodes) {
      const sub = subjects[subCode];

      // CIE-1 (out of 25)
      const cie1Score = Math.min(25, 18 + ((rollNum * 3 + subCode.charCodeAt(3)) % 8));
      await prisma.cieMark.create({
        data: {
          studentId: sp.id,
          subjectId: sub.id,
          examType: "CIE-1",
          marks: cie1Score,
          maxMarks: 25.0,
          uploadedBy: adminUser.id,
        },
      });

      // CIE-2 (out of 25)
      const cie2Score = Math.min(25, 19 + ((rollNum * 2 + subCode.charCodeAt(4)) % 7));
      await prisma.cieMark.create({
        data: {
          studentId: sp.id,
          subjectId: sub.id,
          examType: "CIE-2",
          marks: cie2Score,
          maxMarks: 25.0,
          uploadedBy: adminUser.id,
        },
      });

      // CIE-3 (out of 25)
      const cie3Score = Math.min(25, 20 + ((rollNum * 4 + subCode.charCodeAt(2)) % 6));
      await prisma.cieMark.create({
        data: {
          studentId: sp.id,
          subjectId: sub.id,
          examType: "CIE-3",
          marks: cie3Score,
          maxMarks: 25.0,
          uploadedBy: adminUser.id,
        },
      });
    }
  }

  // =========================================================================
  // 13. Correction Requests (8 requests with diverse statuses - within 6 to 15)
  // =========================================================================
  const correctionData = [
    {
      studentIndex: 2, // Rohan (CSE003)
      sessionIndex: 0,
      reason: "I was present in the lab and submitted my assignment, but was marked absent mistakenly.",
      evidenceUrl: "/uploads/evidence-sample.pdf",
      status: "SUBMITTED",
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
    },
    {
      studentIndex: 7, // Tanvi (CSE008)
      sessionIndex: 1,
      reason: "Participated in inter-college Smart India Hackathon with formal college approval.",
      evidenceUrl: "/uploads/hackathon-permission.pdf",
      status: "SUBMITTED",
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
    },
    {
      studentIndex: 0, // Aarav (CSE001)
      sessionIndex: 2,
      reason: "Bio-metric scanner sync issue during morning session. Was present in second row.",
      evidenceUrl: "/uploads/evidence-sample.pdf",
      status: "UNDER_REVIEW",
      reviewedBy: facultyProfiles["faculty@college.edu"].userId,
      reviewedAt: new Date(),
      reviewNote: "Cross-checking with lab sign-in register.",
    },
    {
      studentIndex: 4, // Vikram (CSE005)
      sessionIndex: 3,
      reason: "Medical emergency leave due to acute viral infection with hospital discharge summary.",
      evidenceUrl: "/uploads/medical-certificate.pdf",
      status: "UNDER_REVIEW",
      reviewedBy: adminUser.id,
      reviewedAt: new Date(),
      reviewNote: "Medical certificate under verification with college health center.",
    },
    {
      studentIndex: 1, // Priya (CSE002)
      sessionIndex: 4,
      reason: "Attended placement training and mock technical interview arranged by placement cell.",
      evidenceUrl: "/uploads/evidence-sample.pdf",
      status: "APPROVED",
      reviewedBy: adminUser.id,
      reviewedAt: new Date(),
      reviewNote: "Verified with Placement Director Dr. Kulkarni. Attendance granted.",
    },
    {
      studentIndex: 3, // Ananya (CSE004)
      sessionIndex: 5,
      reason: "Represented university in Inter-Zonal Basketball Tournament.",
      evidenceUrl: "/uploads/hackathon-permission.pdf",
      status: "APPROVED",
      reviewedBy: facultyProfiles["faculty@college.edu"].userId,
      reviewedAt: new Date(),
      reviewNote: "Sports Council Certificate verified. Approved.",
    },
    {
      studentIndex: 8, // Kunal (CSE009)
      sessionIndex: 6,
      reason: "Traffic congestion on outer ring road due to metro construction.",
      evidenceUrl: null,
      status: "REJECTED",
      reviewedBy: adminUser.id,
      reviewedAt: new Date(),
      reviewNote: "Personal commute delay does not qualify for attendance waiver under policy rule 4.2.",
    },
    {
      studentIndex: 10, // Siddharth (CSE011)
      sessionIndex: 7,
      reason: "Forgot to notify instructor after arriving 20 minutes late.",
      evidenceUrl: null,
      status: "REJECTED",
      reviewedBy: facultyProfiles["faculty2@college.edu"].userId,
      reviewedAt: new Date(),
      reviewNote: "Student arrived after late cutoff window (>15 mins). Request denied.",
    },
  ];

  for (const cr of correctionData) {
    const student = studentProfiles[cr.studentIndex];
    const session = createdSessions[cr.sessionIndex];

    await prisma.correctionRequest.create({
      data: {
        studentId: student.id,
        sessionId: session.id,
        reason: cr.reason,
        evidenceUrl: cr.evidenceUrl,
        status: cr.status,
        reviewedBy: cr.reviewedBy,
        reviewedAt: cr.reviewedAt,
        reviewNote: cr.reviewNote,
      },
    });

    // If approved, update attendance record to PRESENT
    if (cr.status === "APPROVED") {
      await prisma.attendanceRecord.updateMany({
        where: {
          sessionId: session.id,
          studentId: student.id,
        },
        data: {
          status: "PRESENT",
          remarks: `Approved correction: ${cr.reviewNote}`,
        },
      });
    }
  }

  // =========================================================================
  // 14. College Announcements (7 announcements - within 6 to 15)
  // =========================================================================
  const announcementsData = [
    {
      title: "Mid-Term Examination Schedule & Guidelines",
      body: "Mid-term CIE-2 assessments for 3rd semester CSE, ECE, and AIML will commence from next Monday. Please review the timetable published on notice boards and prepare accordingly.",
      audience: "ALL",
    },
    {
      title: "Strict 75% Attendance Compliance Notice",
      body: "Students with aggregate attendance below 75% in any registered subject risk being debarred from semester examinations as per University Ordinance clause 12.1. Submit correction appeals promptly.",
      audience: "STUDENTS",
    },
    {
      title: "Faculty Academic Audit & Syllabus Review Meeting",
      body: "All department heads and faculty members are invited to the monthly syllabus progress review meeting on Friday at 03:00 PM in the Main Conference Hall.",
      audience: "FACULTY",
    },
    {
      title: "Annual Tech Fest 'Innovate 2026' Hackathon Registrations Open",
      body: "Registrations are now open for the 36-hour National Hackathon. Interdisciplinary teams of 3-4 students can register with cash prizes up to INR 2,00,000.",
      audience: "ALL",
    },
    {
      title: "Guest Lecture on Generative AI & Cloud Architecture",
      body: "Google Cloud architect session on modern transformer architectures and high-throughput vector indexing this Wednesday at 11:30 AM in Auditorium-2.",
      audience: "STUDENTS",
    },
    {
      title: "Deadline for Internal Assessment & CIE Marks Upload",
      body: "Faculty members are requested to complete evaluation and upload CIE-1 and CIE-2 marks to the UNILOG portal by this Saturday 5:00 PM.",
      audience: "FACULTY",
    },
    {
      title: "Library Extended Hours & Overnight Reading Room Access",
      body: "The central library reading room will remain open until midnight throughout the examination revision month. Students must show digital college ID cards at security.",
      audience: "ALL",
    },
  ];

  for (const ann of announcementsData) {
    const createdAnn = await prisma.announcement.create({
      data: {
        title: ann.title,
        body: ann.body,
        audience: ann.audience,
        createdBy: adminUser.id,
      },
    });

    // Create notifications for targeted users
    if (ann.audience === "ALL" || ann.audience === "STUDENTS") {
      // Notify sample students
      for (const sp of studentProfiles.slice(0, 6)) {
        await prisma.notification.create({
          data: {
            userId: sp.userId,
            title: createdAnn.title,
            body: createdAnn.body.slice(0, 120) + "...",
            type: ann.title.includes("75%") ? "WARNING" : "INFO",
            readAt: Math.random() > 0.5 ? new Date() : null,
          },
        });
      }
    }

    if (ann.audience === "ALL" || ann.audience === "FACULTY") {
      // Notify sample faculty
      for (const email of ["faculty@college.edu", "faculty2@college.edu", "faculty3@college.edu"]) {
        await prisma.notification.create({
          data: {
            userId: facultyProfiles[email].userId,
            title: createdAnn.title,
            body: createdAnn.body.slice(0, 120) + "...",
            type: "INFO",
            readAt: Math.random() > 0.4 ? new Date() : null,
          },
        });
      }
    }
  }

  // =========================================================================
  // 15. College Holidays (8 holidays - within 6 to 15)
  // =========================================================================
  const holidaysData = [
    { date: new Date("2026-11-01"), name: "Karnataka Rajyotsava" },
    { date: new Date("2026-11-14"), name: "Deepavali (Diwali)" },
    { date: new Date("2026-11-15"), name: "Balipadyami Holiday" },
    { date: new Date("2026-12-25"), name: "Christmas Day" },
    { date: new Date("2027-01-01"), name: "New Year's Day" },
    { date: new Date("2027-01-15"), name: "Makara Sankranti / Pongal" },
    { date: new Date("2027-01-26"), name: "Republic Day" },
    { date: new Date("2027-03-08"), name: "Maha Shivaratri" },
  ];

  for (const h of holidaysData) {
    await prisma.holiday.create({
      data: h,
    });
  }

  // =========================================================================
  // 16. Audit Logs (10 comprehensive audit logs - within 6 to 15)
  // =========================================================================
  const auditLogsData = [
    {
      actorId: adminUser.id,
      action: "SYSTEM_INITIALIZE",
      entity: "SYSTEM",
      entityId: "SYSTEM_INIT",
      before: null,
      after: JSON.stringify({ version: "1.0.0", environment: "production" }),
    },
    {
      actorId: adminUser.id,
      action: "CREATE_ACADEMIC_DEPARTMENTS",
      entity: "DEPARTMENT",
      entityId: "MULTIPLE",
      before: null,
      after: JSON.stringify({ count: 6, departments: ["CSE", "ECE", "AIML", "ISE", "MECH", "CIVIL"] }),
    },
    {
      actorId: adminUser.id,
      action: "CREATE_CLASS_SECTION",
      entity: "SECTION",
      entityId: primarySection.id,
      before: null,
      after: JSON.stringify({ name: "CSE-3A", semester: 3, section: "A" }),
    },
    {
      actorId: adminUser.id,
      action: "BULK_IMPORT_STUDENTS",
      entity: "USER",
      entityId: "STUDENT_ROSTER",
      before: null,
      after: JSON.stringify({ count: 12, section: "CSE-3A", status: "ENROLLED" }),
    },
    {
      actorId: adminUser.id,
      action: "ALLOCATE_FACULTY_ASSIGNMENT",
      entity: "ASSIGNMENT",
      entityId: "FAC_CS301_CSE3A",
      before: null,
      after: JSON.stringify({ faculty: "Prof. Sharma", subject: "CS301", section: "CSE-3A" }),
    },
    {
      actorId: adminUser.id,
      action: "PUBLISH_TIMETABLE",
      entity: "TIMETABLE",
      entityId: timetableUpload.id,
      before: JSON.stringify({ status: "DRAFT" }),
      after: JSON.stringify({ status: "PUBLISHED", entriesCount: 15 }),
    },
    {
      actorId: facultyProfiles["faculty@college.edu"].userId,
      action: "START_ATTENDANCE_SESSION",
      entity: "ATTENDANCE_SESSION",
      entityId: createdSessions[0].id,
      before: null,
      after: JSON.stringify({ subject: "CS301", date: "2026-10-15", time: "09:00 - 10:00" }),
    },
    {
      actorId: facultyProfiles["faculty@college.edu"].userId,
      action: "END_ATTENDANCE_SESSION",
      entity: "ATTENDANCE_SESSION",
      entityId: createdSessions[0].id,
      before: JSON.stringify({ status: "ACTIVE" }),
      after: JSON.stringify({ status: "ENDED", presentCount: 11, absentCount: 1 }),
    },
    {
      actorId: adminUser.id,
      action: "APPROVE_CORRECTION_REQUEST",
      entity: "CORRECTION_REQUEST",
      entityId: "REQ_CSE002_01",
      before: JSON.stringify({ status: "SUBMITTED" }),
      after: JSON.stringify({ status: "APPROVED", student: "Priya Sharma", reason: "Placement Drive" }),
    },
    {
      actorId: adminUser.id,
      action: "UPDATE_ATTENDANCE_POLICY",
      entity: "POLICY",
      entityId: "1",
      before: JSON.stringify({ minPercentage: 75.0, gracePeriodDays: 0 }),
      after: JSON.stringify({ minPercentage: 75.0, gracePeriodDays: 2 }),
    },
  ];

  for (const log of auditLogsData) {
    await prisma.auditLog.create({
      data: log,
    });
  }

  // Admin Notification
  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: "System Seeding & Verification Completed",
      body: "Institutional database initialized with 6 departments, 6 programs, 6 sections, 8 subjects, 6 faculty, 12 students, 15 timetable slots, 10 sessions, 8 correction requests, and 8 holidays.",
      type: "SUCCESS",
    },
  });

  console.log("Database seeded successfully with all required demo counts (6-15)!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });