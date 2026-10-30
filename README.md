# UNILOG — College Attendance Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Website-2563EB?style=for-the-badge&logo=vercel)](https://uni-log.vercel.app/login)
[![GitHub Repository](https://img.shields.io/badge/GitHub-deepthiraikar%2FUniLog-181717?style=for-the-badge&logo=github)](https://github.com/deepthiraikar/UniLog)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.28-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4.1-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

**UNILOG** is a production-grade, institutional attendance management web application engineered with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **SQLite via Prisma ORM**.

Designed under a **flat minimalist light theme design**, UNILOG delivers an ultra-clean, modern interface with crisp 1px borders, subtle neutral slate palettes, refined typography, and Lucide SVG icons.

---

## 🌐 Live Website & Professor Evaluation Link

- **Live URL**: [https://uni-log.vercel.app/login](https://uni-log.vercel.app/login)
- **GitHub Repository**: [https://github.com/deepthiraikar/UniLog](https://github.com/deepthiraikar/UniLog)
- **Demo Credentials**: Preloaded with 1-Click Instant Login buttons on the `/login` page for all three roles (**Admin**, **Faculty**, and **Student**).
- **Project Report**: Included as [`PROJECT_REPORT_UNILOG_Deepthi_N_Raikar.docx`](./PROJECT_REPORT_UNILOG_Deepthi_N_Raikar.docx) in the repository.

---

## 1. Role-Based Features

### 🛡️ Administrator Portal (`/admin`)
- **Command Center Dashboard**: Live KPIs (Total Students, Faculty, Today's Attendance %, Pending Corrections), class attendance bar chart, 14-day attendance heatmap, and recent system audit feed.
- **User Directory**: Unified tabs for Students, Faculty, and Admins with search, pagination, status toggling, single-user creation, and bulk CSV import with live validation feedback.
- **Academic Structure Management**: Full CRUD for Departments, Programs, Class Sections, Subjects, and Faculty Course Assignments.
- **Timetable Scheduling & Conflict Engine**: Upload schedule CSV files with automatic detection of faculty double-booking, room clashes, and section overlaps. Renders published weekly timetables in clean cards.
- **Reports & Compliance Engine**: Section/subject/date filters, real-time threshold calculations, and CSV export for both full class reports and at-risk student lists.
- **Correction Appeals Adjudication**: Side-sheet inspection of student appeals with supporting evidence preview, review notes, and automatic attendance record updates upon approval.
- **Broadcast Announcements**: Campus circular publishing with automatic notification dispatch to targeted audiences (`ALL`, `FACULTY`, `STUDENTS`).
- **Audit Trail**: Complete log with before/after JSON diffs for administrative actions.
- **Settings & Academic Calendar**: Adjust attendance percentage thresholds (e.g. 75%), late thresholds, faculty edit windows, holidays, and visual themes.

### 👨‍🏫 Faculty Portal (`/faculty`)
- **Teaching Dashboard**: Today's lecture timeline generated from the published timetable with one-click **Take Attendance**, session resumption, and recent session audit summaries.
- **Assigned Classes & Rosters**: Cards for assigned course sections with expandable student rosters displaying individual attendance percentages and at-risk indicators.
- **Live Attendance Roll Call**: Clean status buttons (Present / Absent / Late / Excused), "Mark All Present" quick action, localStorage draft autosave, and session finalization.
- **Edit Window Enforcement**: Automatic lockdown of ended sessions once the policy edit window expires.
- **Class Reports**: Filterable attendance compliance tables with CSV export.
- **Corrections Management**: Review and adjudicate student correction requests with audit logging and student notifications.

### 🎓 Student Portal (`/student`)
- **Personal Dashboard**: SVG `AttendanceRing` donut chart with dynamic threshold color coding (Green ≥75%, Amber 60–74%, Red <60%).
- **At-Risk Warning Banner**: Dynamic banner computing the exact number of consecutive classes required to reach safe standing.
- **Subject Attendance Cards**: Course cards with large percentages, attendance ratios, and progress bars.
- **Subject Breakdown Table**: In-depth attendance ledger with deficit calculation.
- **Monthly Attendance Calendar**: Month-by-month calendar view where days are color-coded by attendance status (Green = all present, Amber = partial/late, Red = absent, Dashed = holiday). Click any cell to inspect scheduled lectures.
- **Weekly Class Timetable**: Section-specific schedule grid with timings, rooms, and faculty.
- **CIE Internal Marks**: Continuous internal evaluation marks table and performance bar chart.
- **Correction Appeals**: Submit rectification requests for disputed absences with supporting evidence document upload (PDF/images) and visual status timeline tracking.

---

## 2. Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + Flat Minimalist Design System
- **Components**: Radix UI Primitives + Flat Minimalist UI components
- **Icons**: Lucide React (SVG icons only — no emojis anywhere in UI)
- **Database**: SQLite via Prisma ORM
- **Auth**: NextAuth v5 (`@auth/core` + Credentials provider + JWT session) with bcryptjs
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Dates**: date-fns
- **CSV Engine**: PapaParse
- **Toasts**: Sonner
- **Theme**: next-themes (Light mode default with dark support)

---

## 3. Demo Credentials

Password for **ALL** demo accounts: `password123`

| Role | Email | Name / Identity | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | Dr. Meera Iyer | System Administrator & Academic Dean |
| **Faculty** | `faculty@college.edu` | Prof. Sharma | CSE Dept (DBMS & OS Instructor) |
| **Faculty** | `faculty2@college.edu` | Prof. Nair | CSE Dept (Computer Networks Instructor) |
| **Faculty** | `faculty3@college.edu` | Prof. Rao | CSE Dept (Software Engineering Instructor) |
| **Student** | `aarav@college.edu` | Aarav Patel | Roll `CSE001`, Sem 3, Sec A (High Attendance) |
| **Student** | `rohan@college.edu` | Rohan Verma | Roll `CSE003`, Sem 3, Sec A (At-Risk Attendance) |
| **Student** | `priya@college.edu` | Priya Sharma | Roll `CSE002`, Sem 3, Sec A |
| **Student** | `tanvi@college.edu` | Tanvi Deshmukh | Roll `CSE008`, Sem 3, Sec A (At-Risk) |

*Tip: The login page at `/login` includes 1-click quick-fill buttons for demo credentials.*

---

## 4. Setup & Installation

### Step 1: Clone and Install Dependencies
```bash
git clone <repository_url> unilog
cd unilog
npm install
```

### Step 2: Configure Environment Variables
Verify `.env` exists in the project root:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="unilog-college-attendance-management-super-secret-key-32chars"
```

### Step 3: Initialize Database & Seed Demo Data
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### Step 4: Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. 3-Minute Demo Flow

### 1. Faculty Attendance Flow (1 minute)
1. Go to [http://localhost:3000/login](http://localhost:3000/login) and click the quick-fill button for **Faculty: Prof. Sharma** (`faculty@college.edu`), then click **Sign In**.
2. On the Faculty Dashboard, look at **Today's Teaching Timeline** and click **Take Attendance** on today's lecture.
3. On the live marking table, click **Mark All Present**, toggle one student to **Absent**, and click **End Session** in the bottom action bar.
4. Notice the post-session summary displays the finalized counts and locks the records.

### 2. Student Dashboard & Appeal Flow (1 minute)
1. In the header user chip, click **Sign Out** and log in as **Student: Rohan Verma** (`rohan@college.edu`).
2. Rohan has attendance below 75%:
   - Notice the large amber/red **AttendanceRing** donut chart and the **Critical Attendance Warning Banner** calculating the exact number of consecutive classes needed.
3. In the sidebar, navigate to **Calendar** (`/student/calendar`) to view days color-coded by attendance. Click on a day to see roll call records.
4. Navigate to **Requests** (`/student/requests`), click **New Correction Request**, pick an absent session, provide a justification, and submit the appeal. Notice the visual progress timeline update to `Submitted`.

### 3. Administrator Operations Flow (1 minute)
1. Sign out and log in as **Admin: Dr. Meera Iyer** (`admin@college.edu`).
2. On `/admin`, review the live KPI cards, weekly class attendance chart, and 14-day heatmap.
3. In the sidebar, click **Corrections** (`/admin/corrections`). Click Rohan's newly submitted appeal.
4. Review the reason and click **Approve & Correct**. Notice the status updates to `APPROVED` and the attendance record is corrected to `PRESENT`.
5. Navigate to **Audit Logs** (`/admin/audit`) and click the top event to inspect the full before/after JSON diff.
6. Toggle **Dark Mode** via the sun/moon icon in the header to view the dark neumorphic palette.
