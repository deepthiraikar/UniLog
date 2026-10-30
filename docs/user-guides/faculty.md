# UNILOG — Faculty User Guide

As a faculty member (`Prof. Sharma`), UNILOG provides an intuitive workflow to conduct attendance roll calls, monitor assigned classes, review student appeals, and track attendance health.

---

## Task 1: Conducting a Live Lecture Attendance Session
1. Navigate to `/faculty` (Faculty Dashboard).
2. Look at **Today's Teaching Timeline**:
   - Scheduled lectures for today appear as cards with subject codes, class section, time slot, and room.
3. Click **Take Attendance** on today's lecture card:
   - This instantiates an active session and redirects to the **Live Attendance Marking** screen (`/faculty/session/[id]`).
4. On the Live Roll Call roster:
   - Use the **Present**, **Absent**, **Late**, and **Excused** toggle buttons for each student.
   - Click **Mark All Present** to quickly mark all attendees, then toggle only absent or late students.
   - Status updates are autosaved locally and immediately preserved.
5. Click **End Session** in the bottom action bar when the lecture concludes.
   - Any unmarked students are automatically recorded as `ABSENT`.
   - The session status updates to `ENDED` and an audit log event is recorded.

---

## Task 2: Starting an Ad-Hoc Lecture Session
1. In the sidebar or top header, click **Start Session** (`/faculty/session/new`).
2. Choose a quick-pick lecture from today's timetable, or manually select your assigned class section and subject.
3. Verify the lecture date, start time, end time, and enter optional lecture remarks (e.g. topic covered).
4. Click **Start Live Attendance** to proceed directly to marking.

---

## Task 3: Viewing Class Rosters & Student Standing
1. Navigate to `/faculty/classes` in the sidebar.
2. Review cards for each assigned subject and section (e.g. `CS301 - Database Systems` on `CSE-3A`).
3. Click **View Roster**:
   - Opens the roster table showing every enrolled student, their roll number, attended classes out of total sessions, percentage, and compliance status (`PRESENT` vs `AT_RISK`).

---

## Task 4: Exporting Attendance Reports
1. Navigate to `/faculty/reports`.
2. Filter by subject or class section.
3. Review total lectures, attended count, attendance rate, and classes needed to reach 75%.
4. Click **Export CSV** to download a spreadsheet copy of the class attendance report.

---

## Task 5: Reviewing Student Absence Appeals
1. Navigate to `/faculty/corrections`.
2. Review pending correction requests submitted by students in your classes.
3. Click any row to view the appeal details, justification note, and supporting evidence document.
4. Provide review remarks and click **Approve & Correct** or **Reject Appeal**. The student receives an instant notification.
