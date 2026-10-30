# UNILOG — Administrator User Guide

As an institutional administrator (`Dr. Meera Iyer`), you hold full operational control over students, faculty, academic structures, timetable scheduling, policies, and attendance compliance auditing.

---

## Task 1: Monitoring Command Center Metrics
1. Navigate to `/admin` in the sidebar.
2. Review the 4 primary KPI cards:
   - **Total Enrolled Students** across active sections.
   - **Faculty Members** assigned to teaching workloads.
   - **Today's Attendance Rate** reflecting aggregate institutional attendance.
   - **Pending Corrections** needing administrative/faculty review.
3. Inspect the **Class Attendance Bar Chart** to quickly identify sections falling below the 75% threshold.
4. Review the **14-Day Attendance Heatmap** for day-by-day attendance trends.
5. Inspect the **Recent Activity Feed** for immediate visibility into recent system modifications.

---

## Task 2: Managing Users & CSV Import
1. Navigate to `/admin/users`.
2. Toggle between **Students**, **Faculty**, and **Admins** tabs.
3. To add a single user, click **Add Student/Faculty**, fill out the required credentials, and click **Create User**.
4. To bulk import students from CSV:
   - Click **Template** to download the pre-formatted CSV template.
   - Click **Import CSV**, select your `.csv` file.
   - Review the live validation preview: valid records highlight green, and rows with errors highlight red.
   - Click **Confirm Import** to save valid records.
5. Use row actions to edit user details, toggle account activation status, or permanently delete an account.

---

## Task 3: Configuring Academic Cohorts & Course Assignments
1. Navigate to `/admin/academics`.
2. Use the tabs to configure:
   - **Departments**: Add or edit departments (e.g. CSE).
   - **Programs**: Link degrees (e.g. B.Tech CSE) to departments.
   - **Class Sections**: Establish cohorts (e.g. `CSE-3A` with Semester 3 and Section A).
   - **Subjects**: Register course codes and names (e.g. `CS301 Database Systems`).
   - **Faculty Assignments**: Bind faculty instructors to specific subjects and sections.

---

## Task 4: Uploading & Publishing Timetables
1. Navigate to `/admin/timetable`.
2. Click **Upload CSV Schedule** to submit the semester schedule.
3. UNILOG automatically parses the file and performs comprehensive clash analysis:
   - **Valid Rows**: Displayed with green badges.
   - **Conflicts**: Highlighted amber for double-booked faculty, occupied lecture halls, or section clashes.
   - **Validation Errors**: Flagged red for invalid times or unknown course codes.
4. Once all conflicts are resolved, click **Publish Timetable**. The weekly schedule immediately updates across faculty timelines and student portals.

---

## Task 5: Adjusting Policy & Adjudicating Appeals
1. Navigate to `/admin/settings` to adjust the minimum attendance percentage (e.g. 75%), late thresholds, or faculty edit windows.
2. Navigate to `/admin/corrections` to inspect student correction requests.
3. Click any row to review stated reasons and uploaded proof.
4. Click **Approve & Correct** to change the record to `PRESENT` and create an audit log event.
