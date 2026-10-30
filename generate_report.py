import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_table_borders(table):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>\n'
        f'  <w:bottom w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>\n'
        f'  <w:left w:val="none"/>\n'
        f'  <w:right w:val="none"/>\n'
        f'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>\n'
        f'  <w:insideV w:val="none"/>\n'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_word_report(output_path):
    doc = docx.Document()

    # Page Margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Base Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)

    # ---------------------------------------------------------
    # COVER / TITLE BLOCK
    # ---------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(36)
    title_p.paragraph_format.space_after = Pt(8)
    title_run = title_p.add_run("PROJECT REPORT\nUNILOG — College Attendance Management System")
    title_run.font.name = 'Arial'
    title_run.font.size = Pt(22)
    title_run.bold = True
    title_run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    subtitle_p = doc.add_paragraph()
    subtitle_p.paragraph_format.space_after = Pt(24)
    sub_run = subtitle_p.add_run("A Full-Stack Role-Based Academic Attendance Tracking and Evaluation Platform")
    sub_run.font.size = Pt(13)
    sub_run.font.italic = True
    sub_run.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    # Metadata Table
    meta_table = doc.add_table(rows=8, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    add_table_borders(meta_table)

    meta_data = [
        ("Student Name", "Deepthi N Raikar"),
        ("University Seat Number (USN)", "NNM23IS042"),
        ("Degree & Department", "B.Tech in Information Science and Engineering"),
        ("Institution", "NMAM Institute of Technology, Nitte"),
        ("Faculty Evaluator", "Dr. Jason Elroy Martis"),
        ("Live Application URL", "https://uni-log.vercel.app/login"),
        ("GitHub Repository", "https://github.com/deepthiraikar/UniLog"),
        ("Date of Submission", "30/10/2026"),
    ]

    for i, (k, v) in enumerate(meta_data):
        row = meta_table.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.5)
        c1.width = Inches(4.0)
        set_cell_margins(c0, 80, 80, 100, 100)
        set_cell_margins(c1, 80, 80, 100, 100)
        set_cell_background(c0, "F1F5F9")
        set_cell_background(c1, "FFFFFF")

        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.bold = True
        r0.font.size = Pt(10)
        r0.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    doc.add_page_break()

    # Helper functions for sections
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = 'Arial'
        r.font.size = Pt(15)
        r.bold = True
        r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = 'Arial'
        r.font.size = Pt(12.5)
        r.bold = True
        r.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
        return p

    def add_p(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(text)
        return p

    # ---------------------------------------------------------
    # 1. INTRODUCTION & PROBLEM CONTEXT
    # ---------------------------------------------------------
    add_h1("1. Introduction and Context")

    add_h2("1.1 Background")
    add_p(
        "College attendance records in engineering colleges are frequently maintained through paper logbooks or isolated departmental desktop spreadsheets. "
        "Faculty members mark attendance physically on register slips, which department clerical staff transcribe into software weeks later. "
        "Students only discover their cumulative shortfall at the end of the term when examination hall tickets are withheld. "
        "This latency prevents timely academic intervention. "
        "By integrating attendance tracking directly with Continuous Internal Evaluation marks and automated timetable rosters, "
        "an institution can maintain a single live record accessible to college administration, course instructors, and undergraduate students."
    )

    add_h2("1.2 Problem Statement")
    add_p(
        "I built this system to address four specific operational bottlenecks in academic management:"
    )
    add_p(
        "First, delayed deficit identification. When attendance calculations occur manually at the end of the semester, students with attendance falling below the mandatory 75% threshold cannot recover in time. "
        "Second, absence of formal correction workflows. If an instructor marks a student absent incorrectly, or if a student represents the college in sports or hackathons, the student has no auditable mechanism to submit evidence. "
        "Third, fragmented academic metrics. Internal assessment test scores sit in grading sheets completely detached from attendance patterns, preventing mentors from correlating low attendance with declining subject test marks. "
        "Fourth, timetable clash risks. Department coordinators assigning teaching periods manually face unintentional room and faculty double-booking conflicts across overlapping branch sections."
    )

    add_h2("1.3 Proposed Solution")
    add_p(
        "I developed UNILOG as a full-stack web application built on Next.js 15 App Router, React 19, TypeScript, and Prisma ORM backed by SQLite. "
        "The system enforces strict role-based access for three distinct personas: College Administrators, Faculty Members, and Enrolled Students. "
        "The interface uses a custom Neumorphic surface design system using Tailwind CSS v4, providing tactile visual feedback without flat default shadow utilities. "
        "Faculty members conduct live attendance marking sessions with one-click status toggles. "
        "Students track their live attendance status through an interactive SVG attendance ring, inspect Continuous Internal Evaluation marks, view weekly class timetables, and submit formal attendance correction appeals backed by uploaded documentation."
    )

    # ---------------------------------------------------------
    # 2. OBJECTIVES & SCOPE
    # ---------------------------------------------------------
    add_h1("2. Objectives and Scope")

    add_h2("2.1 Objectives")
    add_p(
        "The primary engineering objectives of this project are:"
    )
    add_p(
        "1. To implement role-based authentication using NextAuth v5 credentials provider, maintaining user identities, profile associations, and role claims inside JSON Web Tokens.\n"
        "2. To build an academic administrative engine capable of managing departments, programs, class sections, subjects, faculty course allocations, and timetable schedules.\n"
        "3. To implement conflict-detection logic that prevents double-booking rooms or assigning faculty members to overlapping time slots during timetable creation.\n"
        "4. To construct an attendance marking module for faculty featuring session timers, one-click bulk status toggling, and an editable grace window governed by policy.\n"
        "5. To compute cumulative attendance percentages and minimum consecutive classes needed to restore academic standing using deterministic mathematical formulas.\n"
        "6. To provide an auditable correction appeal pipeline allowing students to upload evidence files that faculty and administrators can review, approve, or reject."
    )

    add_h2("2.2 Scope")
    add_p(
        "The application scope covers student enrollment, faculty course assignments, timetable scheduling, live lecture marking, internal test evaluation recording, and administrative audit logging. "
        "The system intentionally excludes biometric fingerprint hardware, facial recognition cameras, GPS geofencing, and student self-check-in to maintain administrative authority and prevent proxy manipulation. "
        "External SMS or email gateways are omitted in favor of an internal database-backed notification system. "
        "Data persistence is handled through SQLite via Prisma ORM for self-contained institutional deployments."
    )

    # ---------------------------------------------------------
    # 3. SYSTEM ARCHITECTURE & TECH STACK
    # ---------------------------------------------------------
    add_h1("3. System Architecture and Technology Decisions")

    add_h2("3.1 System Architecture")
    add_p(
        "The application follows a modular three-tier architecture utilizing Next.js App Router. "
        "The presentation layer consists of React Server Components and interactive client components styled with Neumorphic CSS variables. "
        "The server layer contains Next.js route handlers that execute business logic, enforce session authorization via auth(), and record audit entries. "
        "The persistence layer utilizes Prisma Client to execute type-safe SQL queries against an embedded SQLite database."
    )
    add_p(
        "[Architecture Overview: Browser Client (React 19 / Neumorphism) -> Next.js Middleware (JWT Role Routing) -> Route Handlers (src/app/api/*) & Server Components -> Prisma ORM Layer -> SQLite Database (dev.db)]"
    )

    add_h2("3.2 Technology Stack and Rationale")
    
    tech_table = doc.add_table(rows=9, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    add_table_borders(tech_table)

    tech_headers = ["Layer / Package", "Exact Version", "Design Rationale"]
    for j, h in enumerate(tech_headers):
        cell = tech_table.rows[0].cells[j]
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, 100, 100, 100, 100)
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        run.font.size = Pt(9.5)

    tech_rows = [
        ("Next.js App Router", "15.5.28", "Hybrid rendering with React Server Components, server actions, and type-safe API routing."),
        ("React & React DOM", "19.1.0", "Core view library providing concurrent transitions, hooks, and clean UI state orchestration."),
        ("Prisma ORM", "6.4.1", "Schema definition, automated migrations, and fully type-safe database queries against SQLite."),
        ("NextAuth (Auth.js)", "5.0.0-beta.32", "Lightweight JWT session management with credentials authentication and middleware route protection."),
        ("Tailwind CSS", "4.0", "Custom CSS variables and utility classes implementing Neumorphic raised, inset, and pressed surfaces."),
        ("Recharts", "3.10.1", "Responsive SVG data visualization for attendance analytics, subject comparisons, and CIE mark charts."),
        ("PapaParse", "5.7.0", "Client-side and server-side parsing of institutional CSV files for student roster and timetable imports."),
        ("bcryptjs", "3.0.3", "Salt generation and salted hashing of user passwords with 10 hashing rounds for secure storage.")
    ]

    for i, row in enumerate(tech_rows):
        cells = tech_table.rows[i+1].cells
        cells[0].width = Inches(1.8)
        cells[1].width = Inches(1.2)
        cells[2].width = Inches(3.5)
        for j, val in enumerate(row):
            set_cell_margins(cells[j], 70, 70, 90, 90)
            if (i % 2 == 1):
                set_cell_background(cells[j], "F8FAFC")
            p = cells[j].paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9)
            if j == 0:
                r.bold = True

    # ---------------------------------------------------------
    # 4. DATABASE DESIGN
    # ---------------------------------------------------------
    add_h1("4. Database Design and Data Modeling")

    add_h2("4.1 Prisma Model Summary")
    add_p(
        "I designed the relational schema in prisma/schema.prisma to support college academic structures, course allocations, and daily attendance sessions. "
        "The schema contains 19 interconnected models:"
    )

    model_table = doc.add_table(rows=11, cols=3)
    model_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    add_table_borders(model_table)

    m_headers = ["Model Name", "Primary Identifier", "Key Functional Attributes"]
    for j, h in enumerate(m_headers):
        cell = model_table.rows[0].cells[j]
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, 100, 100, 100, 100)
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        run.font.size = Pt(9.5)

    m_data = [
        ("User", "id (cuid)", "email, passwordHash, name, role (ADMIN/FACULTY/STUDENT), isActive, createdAt"),
        ("StudentProfile", "id (cuid)", "userId (FK, unique), rollNo (unique), branch, semester, section"),
        ("FacultyProfile", "id (cuid)", "userId (FK, unique), employeeId (unique), branch, qualification, joiningDate"),
        ("ClassSection", "id (cuid)", "name (unique e.g. 'CSE-3A'), semester, section, programId (FK)"),
        ("Subject", "id (cuid)", "code (unique e.g. 'CS301'), name, departmentId (FK)"),
        ("FacultyAssignment", "id (cuid)", "facultyId (FK), subjectId (FK), classSectionId (FK) [Unique on all 3]"),
        ("AttendanceSession", "id (cuid)", "classSectionId (FK), subjectId (FK), facultyId (FK), date, startTime, endTime, status"),
        ("AttendanceRecord", "id (cuid)", "sessionId (FK), studentId (FK), status (PRESENT/ABSENT/LATE/EXCUSED), markedBy"),
        ("CorrectionRequest", "id (cuid)", "studentId (FK), sessionId (FK), reason, evidenceUrl, status, reviewedBy, reviewNote"),
        ("CieMark", "id (cuid)", "studentId (FK), subjectId (FK), examType (CIE-1/CIE-2), marks, maxMarks, uploadedBy")
    ]

    for i, row in enumerate(m_data):
        cells = model_table.rows[i+1].cells
        cells[0].width = Inches(1.5)
        cells[1].width = Inches(1.5)
        cells[2].width = Inches(3.5)
        for j, val in enumerate(row):
            set_cell_margins(cells[j], 70, 70, 90, 90)
            if (i % 2 == 1):
                set_cell_background(cells[j], "F8FAFC")
            p = cells[j].paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9)
            if j == 0:
                r.bold = True

    add_h2("4.2 Relationships and Constraints")
    add_p(
        "I established cascading delete constraints on profiles and enrollment records so that removing an academic user cleans up associated records. "
        "A composite unique constraint on Enrollment prevents duplicate student registrations within the same section. "
        "A composite unique constraint on FacultyAssignment prevents assigning duplicate instructors to the same subject and class section. "
        "In AttendanceRecord, the composite unique key @@unique([sessionId, studentId]) ensures that each student has exactly one recorded status per session, "
        "allowing the application to execute upsert operations safely during live attendance marking."
    )

    # ---------------------------------------------------------
    # 5. AUTHENTICATION & ACCESS CONTROL
    # ---------------------------------------------------------
    add_h1("5. Authentication and Access Control")

    add_h2("5.1 Authentication Flow")
    add_p(
        "User authentication operates through credentials verification configured in src/auth.ts:"
    )
    add_p(
        "1. The user enters their institutional email and password on the login screen or clicks an instant demo login button.\n"
        "2. The client invokes NextAuth signIn('credentials', { email, password, redirect: false }).\n"
        "3. The authorize() handler queries the User table via Prisma and compares the supplied password against passwordHash using bcrypt.compare().\n"
        "4. Upon matching, NextAuth encodes the user id, role, studentProfileId, and facultyProfileId into a cryptographically signed JWT token.\n"
        "5. The client triggers a browser navigation using window.location.href = '/dashboard' to ensure fresh cookies pass to server components.\n"
        "6. src/middleware.ts inspects the JWT token, validating role permissions against route path prefixes and redirecting unauthorized requests."
    )

    add_h2("5.2 Role-Based Access Control")
    add_p(
        "Access permissions are strictly segmented across roles to ensure institutional data integrity:"
    )

    rbac_table = doc.add_table(rows=8, cols=4)
    rbac_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    add_table_borders(rbac_table)

    r_headers = ["System Capability", "Admin", "Faculty", "Student"]
    for j, h in enumerate(r_headers):
        cell = rbac_table.rows[0].cells[j]
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, 80, 80, 80, 80)
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        run.font.size = Pt(9.5)

    r_data = [
        ("Manage Users & CSV Import", "Full Access", "No Access", "No Access"),
        ("Manage Academics & Timetable", "Full Access", "Read Only", "Read Own Section"),
        ("Start & Mark Attendance Sessions", "Read / Override", "Own Assigned Classes", "No Access"),
        ("View Cumulative Attendance Stats", "Institution-Wide", "Assigned Cohorts", "Personal Record Only"),
        ("Submit Correction Appeals", "No Access", "No Access", "Own Absences Only"),
        ("Review & Approve Corrections", "Full Authority", "Own Sessions", "No Access"),
        ("View Continuous Evaluation Marks", "Read All", "Upload / View Own", "Personal Record Only")
    ]

    for i, row in enumerate(r_data):
        cells = rbac_table.rows[i+1].cells
        cells[0].width = Inches(2.5)
        cells[1].width = Inches(1.3)
        cells[2].width = Inches(1.5)
        cells[3].width = Inches(1.2)
        for j, val in enumerate(row):
            set_cell_margins(cells[j], 60, 60, 80, 80)
            if (i % 2 == 1):
                set_cell_background(cells[j], "F8FAFC")
            p = cells[j].paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9)
            if j == 0:
                r.bold = True

    add_h2("5.3 Attendance Calculation Rules")
    add_p(
        "I implemented exact deterministic calculation formulas in src/lib/utils.ts to eliminate rounding ambiguities across portals:"
    )
    add_p(
        "Formula 1: Cumulative Percentage\n"
        "Percentage = Round(((Present + Excused) / Total Sessions) * 100, 1 decimal place)\n"
        "Late records are counted as present for aggregate threshold compliance unless policy flags them. If total sessions equal zero, percentage returns 100.0%."
    )
    add_p(
        "Formula 2: Deficit Classes Needed (Recovery Formula)\n"
        "When current percentage falls below minimum threshold P (75%), the consecutive attended classes C required to reach P is:\n"
        "C = Math.ceil((P * TotalSessions - 100 * Attended) / (100 - P))\n"
        "This formula guarantees that a student receiving a deficit notification knows precisely how many consecutive lectures they must attend to regain examination eligibility."
    )

    # ---------------------------------------------------------
    # 6. CORE MODULES
    # ---------------------------------------------------------
    add_h1("6. Core Modules Implementation")

    add_h2("6.1 Administrator Module")
    add_p(
        "The Administrator module provides institutional oversight across academic structures and user directories. "
        "The Users manager supports creating individual accounts and bulk-importing student rosters using PapaParse. "
        "The Academics panel manages hierarchical dependencies across departments, degree programs, class sections, and subjects. "
        "The Timetable engine includes conflict-detection logic that identifies double-booked classrooms or overlapping faculty assignments before schedule publication. "
        "The Audit log viewer provides formatted JSON before-and-after snapshots of critical system events."
    )

    add_h2("6.2 Faculty Module")
    add_p(
        "The Faculty portal streamlines attendance capture for assigned course offerings. "
        "The dashboard presents today's teaching timeline populated directly from published timetable entries. "
        "Faculty initiate attendance sessions with slot validation that prevents duplicate entries for the same section. "
        "The live attendance interface displays student roster cards with one-click status toggles between Present, Absent, Late, and Excused. "
        "An autosave engine submits attendance arrays asynchronously, while a policy-governed 30-minute grace window permits edits before records become read-only."
    )

    add_h2("6.3 Student Module")
    add_p(
        "The Student portal delivers personalized academic tracking designed around transparency and rapid recovery. "
        "The dashboard features a Neumorphic AttendanceRing showing overall compliance alongside color-coded percentage cards for every enrolled subject. "
        "If attendance drops below 75%, an At-Risk Warning Banner displays the exact number of consecutive lectures needed to restore safe standing. "
        "The CIE section provides Recharts bar charts showing test score progression. "
        "The Correction Requests interface allows students to appeal incorrect absences by submitting written justifications and uploading supporting evidence documents."
    )

    # ---------------------------------------------------------
    # 7. DATA ACCESS REFERENCE
    # ---------------------------------------------------------
    add_h1("7. Data Access Reference")
    add_p("The table below details the application programming interface routes implemented in src/app/api/:")

    api_table = doc.add_table(rows=11, cols=4)
    api_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    add_table_borders(api_table)

    a_headers = ["Endpoint Route", "Method", "Guarded Role", "Functional Purpose"]
    for j, h in enumerate(a_headers):
        cell = api_table.rows[0].cells[j]
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, 80, 80, 80, 80)
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        run.font.size = Pt(9.5)

    a_data = [
        ("/api/admin/users", "GET, POST, PUT, DELETE", "ADMIN", "User management, CSV roster parsing, and account status toggling."),
        ("/api/admin/academics", "GET, POST, PUT, DELETE", "ADMIN", "CRUD operations for departments, programs, sections, and subjects."),
        ("/api/admin/timetable", "GET, POST", "AUTH / ADMIN", "Timetable validation, conflict checking, and schedule retrieval."),
        ("/api/admin/corrections", "GET, POST", "ADMIN / FACULTY", "Reviewing, approving, or rejecting attendance correction appeals."),
        ("/api/admin/settings", "GET, PUT, POST", "ADMIN", "Updating attendance threshold policy and holiday calendar management."),
        ("/api/admin/announcements", "GET, POST, DELETE", "AUTH / ADMIN", "Publishing circulars with automated notification broadcasting."),
        ("/api/faculty/session", "GET, POST, PUT", "FACULTY", "Starting lecture sessions, marking live rosters, and closing sessions."),
        ("/api/student/dashboard", "GET", "STUDENT", "Computing student attendance ring metrics, subject cards, and CIE preview."),
        ("/api/student/cie", "GET", "STUDENT", "Retrieving internal assessment test marks and Recharts chart data."),
        ("/api/student/requests", "GET, POST", "STUDENT", "Fetching eligible absence sessions and uploading correction appeals.")
    ]

    for i, row in enumerate(a_data):
        cells = api_table.rows[i+1].cells
        cells[0].width = Inches(1.8)
        cells[1].width = Inches(1.2)
        cells[2].width = Inches(1.2)
        cells[3].width = Inches(2.3)
        for j, val in enumerate(row):
            set_cell_margins(cells[j], 60, 60, 80, 80)
            if (i % 2 == 1):
                set_cell_background(cells[j], "F8FAFC")
            p = cells[j].paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if j == 0:
                r.bold = True

    # ---------------------------------------------------------
    # 8. APPLICATION WALKTHROUGH
    # ---------------------------------------------------------
    add_h1("8. Application Walkthrough")
    add_p("The figures and placeholders below represent the primary operational interfaces of the system:")

    walkthrough_items = [
        ("[Screenshot 1: Institutional Sign-in Screen]", "The login portal featuring institutional credentials authentication, password security toggling, and 1-Click Instant Demo login buttons for Admin, Faculty, and Student roles."),
        ("[Screenshot 2: Administrator Executive Dashboard]", "The administrative dashboard showing overall attendance health, total active students, faculty counts, attendance rings, and system audit log feeds."),
        ("[Screenshot 3: Academic Structure Management]", "The academic catalog interface showing configured engineering departments, degree programs, class sections, and course allocations."),
        ("[Screenshot 4: Timetable Scheduling and Conflict Detection]", "The timetable scheduling workspace showing weekly class distribution across lecture halls, highlighting automated conflict resolution for room and faculty overlap."),
        ("[Screenshot 5: Administrator User Management Directory]", "The user administration table displaying student and faculty accounts, status toggles, and the bulk CSV roster validation modal."),
        ("[Screenshot 6: Faculty Dashboard and Teaching Timeline]", "The instructor view displaying today's scheduled lectures, assigned class cohorts, and the live lecture initiation banner."),
        ("[Screenshot 7: Faculty Live Attendance Marking Interface]", "The interactive roster marking screen featuring individual student cards with toggle buttons for Present, Absent, Late, and Excused statuses."),
        ("[Screenshot 8: Student Dashboard and Attendance Ring]", "The student portal showing the central Neumorphic AttendanceRing, At-Risk alert banner, and individual subject attendance progress bars."),
        ("[Screenshot 9: Student Weekly Class Timetable]", "The weekly timetable grid displaying scheduled class periods, room numbers, subject codes, and faculty instructors for section CSE-3A."),
        ("[Screenshot 10: Student Continuous Internal Evaluation (CIE) Marks]", "The internal test examination analytics page displaying Recharts bar charts and tabular score breakdowns across CIE-1, CIE-2, and CIE-3.")
    ]

    for tag, desc in walkthrough_items:
        p_tag = doc.add_paragraph()
        p_tag.paragraph_format.space_before = Pt(10)
        p_tag.paragraph_format.space_after = Pt(2)
        p_tag.paragraph_format.keep_with_next = True
        r_tag = p_tag.add_run(tag)
        r_tag.bold = True
        r_tag.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
        
        p_desc = doc.add_paragraph()
        p_desc.paragraph_format.space_after = Pt(8)
        r_desc = p_desc.add_run(desc)
        r_desc.font.size = Pt(10)
        r_desc.font.italic = True
        r_desc.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    # ---------------------------------------------------------
    # 9. ROLE PERMISSIONS MATRIX
    # ---------------------------------------------------------
    add_h1("9. Role Permissions Matrix")
    add_p("A comparative breakdown of functional authority across the three system roles:")

    perm_table = doc.add_table(rows=10, cols=4)
    perm_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    add_table_borders(perm_table)

    p_headers = ["Functional Action", "Administrator", "Faculty", "Student"]
    for j, h in enumerate(p_headers):
        cell = perm_table.rows[0].cells[j]
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, 80, 80, 80, 80)
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        run.font.size = Pt(9.5)

    p_data = [
        ("Create & Deactivate User Accounts", "Permitted", "Denied", "Denied"),
        ("Define Departments & Subjects", "Permitted", "Denied", "Denied"),
        ("Publish Class Timetables", "Permitted", "Denied", "Denied"),
        ("Initiate Attendance Marking", "Override Only", "Permitted", "Denied"),
        ("Edit Marked Attendance Sessions", "Permitted (Audit)", "Permitted (Grace Period)", "Denied"),
        ("Upload Continuous Evaluation Marks", "Permitted", "Permitted", "Denied"),
        ("Submit Absence Correction Appeals", "Denied", "Denied", "Permitted"),
        ("Approve Correction Evidence", "Permitted", "Permitted (Own Class)", "Denied"),
        ("Inspect Institutional Audit Logs", "Permitted", "Denied", "Denied")
    ]

    for i, row in enumerate(p_data):
        cells = perm_table.rows[i+1].cells
        cells[0].width = Inches(2.8)
        cells[1].width = Inches(1.3)
        cells[2].width = Inches(1.3)
        cells[3].width = Inches(1.1)
        for j, val in enumerate(row):
            set_cell_margins(cells[j], 60, 60, 80, 80)
            if (i % 2 == 1):
                set_cell_background(cells[j], "F8FAFC")
            p = cells[j].paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9)
            if j == 0:
                r.bold = True

    # ---------------------------------------------------------
    # 10. SETUP & PROJECT STRUCTURE
    # ---------------------------------------------------------
    add_h1("10. Deployment, Setup, and Demonstration Data")

    add_h2("10.1 Running the Application")
    add_p(
        "To execute the system on a development workstation, run the exact scripts defined in package.json:"
    )
    add_p(
        "1. Install project dependencies: npm install\n"
        "2. Initialize SQLite schema: npx prisma db push\n"
        "3. Seed institutional demonstration data: npx tsx prisma/seed.ts\n"
        "4. Start development web server: npm run dev (or run .\\dev.bat on Windows)\n"
        "5. Compile production build: npm run build\n"
        "6. Launch production server: npm run start (or run .\\start.bat on Windows)"
    )

    add_h2("10.2 Seeded Demonstration Accounts")
    add_p("The database seed script in prisma/seed.ts populates the following accounts (all use password: password123):")

    demo_table = doc.add_table(rows=7, cols=4)
    demo_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    add_table_borders(demo_table)

    d_headers = ["Assigned Role", "Account Name", "Email Credential", "Designation / Roll No"]
    for j, h in enumerate(d_headers):
        cell = demo_table.rows[0].cells[j]
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, 80, 80, 80, 80)
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        run.font.size = Pt(9.5)

    d_data = [
        ("Admin", "Dr. Meera Iyer", "admin@college.edu", "Dean of Academic Affairs"),
        ("Faculty", "Prof. Sharma", "faculty@college.edu", "Assistant Professor (FAC001)"),
        ("Faculty", "Prof. Nair", "faculty2@college.edu", "Associate Professor (FAC002)"),
        ("Faculty", "Prof. Rao", "faculty3@college.edu", "Professor (FAC003)"),
        ("Student", "Aarav Patel", "aarav@college.edu", "CSE-3A (Roll No: CSE001)"),
        ("Student (At-Risk)", "Rohan Verma", "rohan@college.edu", "CSE-3A (Roll No: CSE003)")
    ]

    for i, row in enumerate(d_data):
        cells = demo_table.rows[i+1].cells
        cells[0].width = Inches(1.2)
        cells[1].width = Inches(1.6)
        cells[2].width = Inches(2.0)
        cells[3].width = Inches(1.7)
        for j, val in enumerate(row):
            set_cell_margins(cells[j], 60, 60, 80, 80)
            if (i % 2 == 1):
                set_cell_background(cells[j], "F8FAFC")
            p = cells[j].paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9)
            if j == 0:
                r.bold = True

    add_h2("10.3 Project Directory Structure")
    add_p("The actual repository directory layout reflects modular Next.js App Router conventions:")

    tree_table = doc.add_table(rows=8, cols=2)
    tree_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    add_table_borders(tree_table)

    tr_headers = ["Directory Path", "Contents and Functional Purpose"]
    for j, h in enumerate(tr_headers):
        cell = tree_table.rows[0].cells[j]
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, 80, 80, 80, 80)
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        run.font.size = Pt(9.5)

    tr_data = [
        ("prisma/", "schema.prisma model definitions and seed.ts institutional database generator."),
        ("public/uploads/", "Static storage directory for student medical certificates and hackathon permission PDFs."),
        ("src/app/(portal routes)/", "Role-guarded page routes for /admin, /faculty, /student, and /profile."),
        ("src/app/api/", "Next.js backend route handlers for users, academics, sessions, timetables, and CIE."),
        ("src/components/shared/", "Neumorphic widgets: AppShell, AttendanceRing, DataTable, StatCard, and StatusBadge."),
        ("src/lib/", "prisma.ts connection singleton and utils.ts attendance calculation helpers."),
        ("src/middleware.ts", "Edge-level route protection and role-based redirect enforcement.")
    ]

    for i, row in enumerate(tr_data):
        cells = tree_table.rows[i+1].cells
        cells[0].width = Inches(2.2)
        cells[1].width = Inches(4.3)
        for j, val in enumerate(row):
            set_cell_margins(cells[j], 60, 60, 80, 80)
            if (i % 2 == 1):
                set_cell_background(cells[j], "F8FAFC")
            p = cells[j].paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9)
            if j == 0:
                r.bold = True

    # ---------------------------------------------------------
    # 11. TESTING & SHORTCOMINGS
    # ---------------------------------------------------------
    add_h1("11. Verification and Shortcomings")

    add_h2("11.1 Testing Performed")
    add_p(
        "I conducted systematic programmatic and compilation tests to verify system stability. "
        "The automated test script test-crud.ts executed against the local database, confirming full CRUD lifecycles across all three roles. "
        "For the administrator role, user creation, academic department insertion, and circular deletion succeeded without database deadlocks. "
        "For faculty, starting a lecture, marking student records as Present, updating status to Late, and concluding the session verified state transitions. "
        "For students, submitting an absence correction request with an evidence attachment and having it approved verified attendance cascade updates. "
        "Finally, npm run build verified that all 49 routes statically generated and compiled with zero TypeScript errors."
    )

    add_h2("11.2 Shortcomings and Future Work")
    add_p(
        "I acknowledge several technical trade-offs in the current build that an examiner will notice in the code. "
        "First, I stored user roles and attendance statuses as strings in prisma/schema.prisma instead of native Prisma enums. "
        "SQLite does not support enum types; while TypeScript interfaces validate roles at compile time, the database engine does not enforce type boundaries natively. "
        "Second, the reports query executes unpaginated joins across sessions and student records. At department scale with thousands of records, this endpoint will slow down. "
        "The fix is to implement database-level cursor pagination and cache analytical results for 60 seconds. "
        "Third, evidence files upload directly into public/uploads/. In a containerized cloud deployment, local file writes do not persist across instance restarts, necessitating a migration to S3 or Google Cloud Storage. "
        "Fourth, notification updates use client-side polling rather than WebSockets. While this keeps the backend simple, it causes periodic background network requests."
    )

    # ---------------------------------------------------------
    # 12. CONCLUSION
    # ---------------------------------------------------------
    add_h1("12. Conclusion")
    add_p(
        "UNILOG replaces fragmented register books with a centralized attendance tracking architecture. "
        "I integrated faculty lecture marking, automated timetable rosters, and continuous internal assessment marks into a single platform. "
        "The implementation proved that deterministic attendance recovery formulas provide students with actionable guidance rather than passive end-of-term failure notices. "
        "Enforcing role guards at both Next.js middleware and route handler levels prevented privilege escalation across administrative boundaries. "
        "Future enhancements will focus on replacing local file storage with object buckets, adding background job queues for batch reports, and deploying the application into a containerized cloud environment."
    )

    # ---------------------------------------------------------
    # 13. DISCLOSURE OF AI ASSISTANCE
    # ---------------------------------------------------------
    add_h1("13. Disclosure of AI Assistance")
    add_p(
        "I utilized AI coding assistance during the development of this project in accordance with institutional academic guidelines. "
        "The AI tool assisted in generating TypeScript boilerplate for Prisma queries, formulating Tailwind CSS neumorphic shadow utilities, and scaffolding the test-crud.ts verification script. "
        "I conducted the core system requirements gathering, designed the database relational schema in prisma/schema.prisma, resolved TypeScript build errors, and verified the authentication flow. "
        "I reviewed, tested, and validated all generated code to ensure compliance with project specifications."
    )

    # ---------------------------------------------------------
    # 14. REFERENCES
    # ---------------------------------------------------------
    add_h1("14. References")
    add_p("1. Next.js Documentation. Vercel. https://nextjs.org/docs\n"
          "2. Prisma ORM Reference Manual. Prisma Data Inc. https://www.prisma.io/docs\n"
          "3. NextAuth.js / Auth.js v5 Documentation. https://authjs.dev\n"
          "4. Sandhu, R. S., Coyne, E. J., Feinstein, H. L., and Youman, C. E. 'Role-Based Access Control Models.' IEEE Computer, Vol. 29, No. 2, pp. 38–47, 1996.\n"
          "5. Tailwind CSS Documentation. Tailwind Labs Inc. https://tailwindcss.com/docs\n"
          "6. Recharts Documentation. https://recharts.org")

    # ---------------------------------------------------------
    # 15. ACADEMIC INTEGRITY STATEMENT
    # ---------------------------------------------------------
    add_h1("15. Academic Integrity Statement")
    add_p(
        "\"I declare that I have personally implemented, tested, and understood the submitted UNILOG College Attendance Management System project. "
        "I have disclosed all AI tools and external technical libraries used during development. "
        "I can explain the system architecture, role-based access control guards, mathematical calculation rules, and database schema modifications. "
        "I have not submitted another student's work as my own.\""
    )
    
    sig_p = doc.add_paragraph()
    sig_p.paragraph_format.space_before = Pt(20)
    sig_p.add_run(
        "Student Name: Deepthi N Raikar\n"
        "University Seat Number (USN): NNM23IS042\n"
        "Department: Information Science and Engineering\n"
        "Institution: NMAM Institute of Technology, Nitte\n"
        "Signature: ___________________________\n"
        "Date: 30/10/2026"
    )

    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    out_file = r"C:\Users\deeps\.gemini\antigravity\scratch\unilog\PROJECT_REPORT_UNILOG_Deepthi_N_Raikar.docx"
    build_word_report(out_file)
