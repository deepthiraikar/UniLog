# UNILOG — Complete API Contract Documentation

All endpoints require active session authentication unless explicitly public. Requests from unauthorized roles return HTTP `403 Forbidden`.

---

## 1. Authentication & Identity

### `POST /api/auth/[...nextauth]`
- **Purpose**: Authenticates credentials via NextAuth v5.
- **Role**: Public
- **Request Body**:
  ```json
  {
    "email": "faculty@college.edu",
    "password": "password123"
  }
  ```
- **Response**: JWT session cookie set, returns user profile.

### `GET /api/profile`
- **Purpose**: Retrieves full profile for the authenticated user.
- **Role**: `ADMIN`, `FACULTY`, `STUDENT`
- **Response**:
  ```json
  {
    "user": {
      "id": "cuid...",
      "name": "Prof. Sharma",
      "email": "faculty@college.edu",
      "role": "FACULTY",
      "facultyProfile": { "employeeId": "FAC001", "branch": "CSE", "qualification": "Ph.D." }
    }
  }
  ```

### `PUT /api/profile`
- **Purpose**: Updates editable profile details (name, phone, qualification, branch).
- **Role**: `ADMIN`, `FACULTY`, `STUDENT`
- **Request Body**:
  ```json
  {
    "name": "Prof. Sharma",
    "phone": "+91 98765 00001",
    "qualification": "Ph.D. in Computer Science"
  }
  ```
- **Response**: `{ "success": true, "message": "Profile updated successfully" }`

---

## 2. Notification Endpoints

### `GET /api/notifications`
- **Purpose**: Fetches recent in-app notifications and unread count for current user.
- **Role**: All authenticated users
- **Response**:
  ```json
  {
    "notifications": [
      {
        "id": "cuid...",
        "title": "Attendance Alert",
        "body": "Your attendance dropped below 75%",
        "type": "WARNING",
        "readAt": null,
        "createdAt": "2026-10-29T10:00:00Z"
      }
    ],
    "unreadCount": 1
  }
  ```

### `POST /api/notifications`
- **Purpose**: Marks notification as read or bulk marks all as read.
- **Role**: All authenticated users
- **Request Body**: `{ "notificationId": "cuid..." }` or `{ "markAll": true }`
- **Response**: `{ "success": true }`

---

## 3. Administrator Endpoints

### `GET /api/admin/stats`
- **Purpose**: Aggregates KPI cards, section attendance bar chart, and 14-day heatmap.
- **Role**: `ADMIN`
- **Response**:
  ```json
  {
    "kpis": {
      "totalStudents": 12,
      "totalFaculty": 3,
      "todayAttendancePct": 88.5,
      "pendingCorrections": 2
    },
    "classAttendanceBar": [{ "className": "CSE-3A", "percentage": 88 }],
    "heatmapData": [{ "date": "2026-10-25", "dayOfMonth": 25, "percentage": 91, "hasClasses": true }],
    "recentAuditLogs": []
  }
  ```

### `GET /api/admin/users?role=STUDENT`
- **Purpose**: Lists users filtered optionally by role.
- **Role**: `ADMIN`

### `POST /api/admin/users`
- **Purpose**: Creates a single user or performs bulk CSV import.
- **Role**: `ADMIN`
- **Single User Body**:
  ```json
  {
    "email": "newstudent@college.edu",
    "name": "Kavya Patel",
    "role": "STUDENT",
    "rollNo": "CSE013",
    "branch": "CSE",
    "semester": 3,
    "section": "A"
  }
  ```
- **Bulk Import Body**:
  ```json
  {
    "action": "BULK_IMPORT",
    "users": [
      { "name": "Kavya", "email": "kavya@college.edu", "rollNo": "CSE013", "branch": "CSE", "semester": 3, "section": "A" }
    ]
  }
  ```

### `PUT /api/admin/users`
- **Purpose**: Updates user details or toggles active status.
- **Role**: `ADMIN`
- **Request Body**: `{ "id": "cuid...", "isActive": false }`

### `DELETE /api/admin/users?id=...`
- **Purpose**: Deletes a user and cascades profile enrollments. Protected from self-deletion.
- **Role**: `ADMIN`

### `GET /api/admin/academics`
- **Purpose**: Returns complete lists of Departments, Programs, Sections, Subjects, and Assignments.
- **Role**: `ADMIN`

### `POST /api/admin/academics`
- **Purpose**: Creates an academic entity (`DEPARTMENT`, `PROGRAM`, `SECTION`, `SUBJECT`, `ASSIGNMENT`).
- **Role**: `ADMIN`

### `POST /api/admin/timetable`
- **Purpose**: Validates CSV timetable data for room/faculty/section clashes, or publishes.
- **Role**: `ADMIN`
- **Validate Body**:
  ```json
  {
    "action": "VALIDATE",
    "rawRows": [
      { "dayOfWeek": 1, "startTime": "09:00", "endTime": "10:00", "subjectCode": "CS301", "facultyEmail": "faculty@college.edu", "sectionName": "CSE-3A", "room": "Lab 201" }
    ]
  }
  ```
- **Publish Body**: `{ "action": "PUBLISH", "validEntries": [...] }`

### `GET /api/admin/reports`
- **Purpose**: Computes attendance percentages, at-risk flags, and daily session breakdown.
- **Role**: `ADMIN`, `FACULTY`

### `GET /api/admin/corrections`
- **Purpose**: Fetches all submitted correction appeals.
- **Role**: `ADMIN`, `FACULTY`

### `POST /api/admin/corrections`
- **Purpose**: Approves or rejects a correction request. When approved, marks the attendance record as `PRESENT`.
- **Role**: `ADMIN`, `FACULTY`
- **Request Body**:
  ```json
  {
    "requestId": "cuid...",
    "status": "APPROVED",
    "reviewNote": "Verified medical documentation"
  }
  ```

### `POST /api/admin/announcements`
- **Purpose**: Broadcasts an announcement and pushes notifications to target audience.
- **Role**: `ADMIN`
- **Request Body**:
  ```json
  {
    "title": "Semester Exam Announcement",
    "body": "Exam dates announced...",
    "audience": "ALL"
  }
  ```

### `GET /api/admin/audit`
- **Purpose**: Returns audit trail log with full before/after JSON diffs.
- **Role**: `ADMIN`

### `PUT /api/admin/settings`
- **Purpose**: Updates minimum percentage threshold, edit windows, and grace periods.
- **Role**: `ADMIN`
- **Request Body**:
  ```json
  {
    "minPercentage": 75.0,
    "lateAfterMinutes": 10,
    "editWindowMinutes": 30,
    "gracePeriodDays": 0
  }
  ```

---

## 4. Faculty Endpoints

### `GET /api/faculty/dashboard`
- **Purpose**: Returns today's scheduled classes from published timetable, status, and recent sessions.
- **Role**: `FACULTY`

### `GET /api/faculty/classes`
- **Purpose**: Returns assigned classes, or full roster with attendance % if queried with `classSectionId` & `subjectId`.
- **Role**: `FACULTY`

### `POST /api/faculty/session`
- **Purpose**: Starts an active attendance session for a class section. Checks for duplicates.
- **Role**: `FACULTY`
- **Request Body**:
  ```json
  {
    "classSectionId": "cuid...",
    "subjectId": "cuid...",
    "date": "2026-10-29",
    "startTime": "09:00",
    "endTime": "10:00",
    "remarks": "Lecture on Relational Algebra"
  }
  ```

### `PUT /api/faculty/session`
- **Purpose**: Saves draft or ends session (marking absent students and triggering at-risk alerts).
- **Role**: `FACULTY`
- **Request Body**:
  ```json
  {
    "sessionId": "cuid...",
    "endSession": true,
    "records": [
      { "studentId": "cuid...", "status": "PRESENT" },
      { "studentId": "cuid...", "status": "ABSENT" }
    ]
  }
  ```

---

## 5. Student Endpoints

### `GET /api/student/dashboard`
- **Purpose**: Calculates overall attendance %, required classes to reach 75%, and subject cards.
- **Role**: `STUDENT`

### `GET /api/student/calendar?year=2026&month=9`
- **Purpose**: Returns day-by-day attendance status (`ALL_PRESENT`, `PARTIAL`, `ALL_ABSENT`, `HOLIDAY`, `NO_CLASS`) for the monthly view.
- **Role**: `STUDENT`

### `GET /api/student/cie`
- **Purpose**: Returns CIE-1 and CIE-2 assessment scores per subject.
- **Role**: `STUDENT`

### `GET /api/student/requests`
- **Purpose**: Lists submitted correction appeals and eligible absent/late sessions for appeal.
- **Role**: `STUDENT`

### `POST /api/student/requests`
- **Purpose**: Submits a new correction appeal with optional uploaded evidence file (`multipart/form-data`).
- **Role**: `STUDENT`
