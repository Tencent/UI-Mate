# bamboohr_mock Schema

**Base URL**: `http://localhost:5173/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**State read**: `GET /state?sid=<sid>` → `{initial_state, current_state, state_diff}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | `{employeeId, role, companyName, companyLogo}` — logged-in user; `employeeId` points into `employees[]` |
| `departments` | array | Each: `{id, name, headId}` — 10 departments |
| `locations` | array | Each: `{id, name, address, timezone}` — 3 locations |
| `divisions` | array | Each: `{id, name}` — 3 divisions |
| `employees` | array | Each: `{id, firstName, middleName, lastName, preferredName, displayName, avatar, email, homeEmail, workPhone, workPhoneExt, mobilePhone, homePhone, dateOfBirth, gender, maritalStatus, address1, address2, city, state, zipcode, country, hireDate, terminationDate, terminationType, terminationReason, regrettable, rehireEligible, status, employmentStatus, jobTitle, departmentId, locationId, divisionId, reportsToId, employeeNumber, payRate, payType, payFrequency, standardHoursPerWeek, socialMediaLinks, emergencyContactName, emergencyContactPhone, emergencyContactRelation, ssn, payChangeHistory}` — `terminationType`: `"Resignation"`, `"Involuntary"`, `"Death"`; `regrettable` and `rehireEligible` are booleans set on termination; `payChangeHistory`: array of `{date, description, amount, payType}` entries appended by CompensationChangeModal and PromotionModal |
| `timeOffPolicies` | array | Each: `{id, type, name, accrualRate, maxBalance, carryOver}` — 5 policies (Vacation, Sick, Bereavement, FMLA, Personal) |
| `timeOffBalances` | array | Each: `{id, employeeId, policyId, available, scheduled, used}` |
| `timeOffRequests` | array | Each: `{id, employeeId, policyId, startDate, endDate, hours, status, note, reviewedBy, reviewedAt, createdAt}` — `status`: `"pending"`, `"approved"`, `"denied"`, `"cancelled"` |
| `jobOpenings` | array | Each: `{id, title, departmentId, locationId, status, employmentType, description, requirements, salaryMin, salaryMax, hiringManagerId, createdAt, applicantCount}` — `status`: `"Open"`, `"Draft"`, `"On Hold"`, `"Closed"` |
| `candidates` | array | Each: `{id, jobOpeningId, firstName, lastName, email, phone, resumeUrl, stage, rating, appliedAt, notes}` — `stage`: one of `"New"`, `"Screening"`, `"Phone Interview"`, `"On-site Interview"`, `"Offer"`, `"Hired"`, `"Rejected"` |
| `announcements` | array | Each: `{id, title, body, authorId, createdAt, isPinned}` |
| `notifications` | array | Each: `{id, type, message, timestamp, isRead, icon, linkTo, isPastDue, dueDate}` — `type` values: `"time_off_request"`, `"application"`, `"compensation_request"`, `"asset_request"`, `"feedback_request"`, `"announcement"`, `"task_due"`, `"new_hire"`, `"new_employee"`, `"new_job_opening"`, `"compensation_change"`, `"job_info_change"`, `"promotion"`, `"termination"` |
| `notes` | array | Each: `{id, employeeId, authorId, content, createdAt}` |
| `documents` | array | Each: `{id, employeeId, name, category, uploadedAt, uploadedById, size}` |
| `trainings` | array | Each: `{id, employeeId, title, status, dueDate, completedDate, category}` — `status`: `"completed"`, `"overdue"`, `"in_progress"`, `"upcoming"` |
| `assets` | array | Each: `{id, employeeId, type, description, serialNumber, assignedDate, status}` |
| `goals` | array | Each: `{id, employeeId\|null, title, description, progress, status, dueDate, createdAt}` — `employeeId: null` = company-wide goal |
| `performanceReviews` | array | Each: `{id, employeeId, reviewerId, type, period, rating, comments, status, createdAt}` |
| `benefitPlans` | array | Each: `{id, name, type, provider, employeeCost, employerCost}` |
| `benefitEnrollments` | array | Each: `{id, employeeId, planId, coverageLevel, startDate, status}` |
| `reports` | array | Each: `{id, name, category, type, description, lastRunAt}` — `category`: `"standard"` or `"custom"` |
| `ui` | object | `{notificationsPanelOpen, searchOpen, searchQuery}` — ephemeral UI state |

### Default Employee IDs
- `1` — Charlotte Abbott (current user, Sr. HR Administrator)
- `2` — Brandon Bell (HR Specialist)
- `3` — Amy Granger (HR Coordinator)
- `4` — Daniel John (CEO)
- `5` — Jennifer Caldwell (VP of Human Resources)
- `6` — Marcus Chen (VP of Engineering)
- `7` — Sarah Mitchell (VP of Sales)
- `8` — David Park (Sr. Software Engineer)
- IDs 9–30 — remaining employees across departments

### Default Job Opening IDs
- `1` — Software Engineer (Open, 12 candidates)
- `2` — Sales Development Representative (Open, 8 candidates)
- `3` — Marketing Manager (Open, 5 candidates)
- `4` — Office Manager (Draft, 0 candidates)

### Default Report IDs
- `1` — Headcount (standard, type: `"headcount"`)
- `2` — Employee Turnover (standard, type: `"turnover"`)
- `3` — Compensation Summary (standard, type: `"compensation"`)
- `4` — Time Off Usage (standard, type: `"time_off"`)
- `5` — Benefits Enrollment (standard, type: `"benefits"`)
- `6` — Department Report (standard, type: `"headcount"`)
- `7` — New Hires (standard, type: `"new_hires"`)
- IDs 8+ — User-created custom reports (category: `"custom"`)

### Default Notification IDs
- `1`–`6` — unread; `7`–`12` — read; IDs `6`, `7`, `11`, `12` have `isPastDue: true`

### Default Time Off Policy IDs
- `1` — Vacation, `2` — Sick, `3` — Bereavement, `4` — FMLA, `5` — Personal

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": { "employeeId": 1, "role": "admin", "companyName": "Efficient Office Solutions", "companyLogo": null },
    "departments": [
      { "id": 1, "name": "Human Resources", "headId": 5 },
      { "id": 2, "name": "Engineering", "headId": 6 }
    ],
    "locations": [
      { "id": 1, "name": "San Francisco HQ", "address": "100 Market St, San Francisco, CA 94105", "timezone": "America/Los_Angeles" }
    ],
    "divisions": [{ "id": 1, "name": "Western States" }],
    "employees": [
      {
        "id": 1, "firstName": "Charlotte", "lastName": "Abbott", "displayName": "Charlotte Danielle Abbott",
        "email": "cabbott@efficientoffice.com", "jobTitle": "Sr. HR Administrator",
        "departmentId": 1, "locationId": 1, "divisionId": 1, "reportsToId": null,
        "hireDate": "2011-08-08", "status": "Active", "employmentStatus": "Full-Time",
        "payRate": 85000, "payType": "Salary", "employeeNumber": "1"
      }
    ],
    "timeOffPolicies": [
      { "id": 1, "type": "Vacation", "name": "Standard Vacation", "accrualRate": 1.54, "maxBalance": 200, "carryOver": 40 }
    ],
    "timeOffBalances": [
      { "id": 1, "employeeId": 1, "policyId": 1, "available": 54.6, "scheduled": 48, "used": 40 }
    ],
    "timeOffRequests": [],
    "jobOpenings": [],
    "candidates": [],
    "announcements": [],
    "notifications": [],
    "notes": [],
    "documents": [],
    "trainings": [],
    "assets": [],
    "goals": [],
    "performanceReviews": [],
    "benefitPlans": [],
    "benefitEnrollments": [],
    "reports": [],
    "ui": { "notificationsPanelOpen": false, "searchOpen": false, "searchQuery": "" }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Submit time off request (Home or Time Off tab) | `timeOffRequests` array grows by 1 (status `"pending"`); `notifications` array grows by 1 |
| Edit employee personal field (inline edit + save checkmark) | `employees[i].<field>` updated (e.g., `email`, `workPhone`, `address1`) |
| Mark notification as read (bell panel click) | `notifications[i].isRead` → `true` |
| Mark all notifications read | all `notifications[].isRead` → `true` |
| Dismiss notification on Home feed (X button) | `notifications[i].isRead` → `true` |
| Add note to employee profile (Notes tab) | `notes` array grows by 1 |
| Edit note content | `notes[i].content` updated |
| Delete note | `notes` array shrinks by 1 |
| Upload document (Documents tab) | `documents` array grows by 1 |
| Delete document | `documents` array shrinks by 1 |
| Drag candidate to new stage (Hiring kanban) | `candidates[i].stage` updated to new stage name |
| Rate candidate (star rating click) | `candidates[i].rating` updated (1–5) |
| Advance candidate via "Advance" button | `candidates[i].stage` updated to next stage (works through Offer→Hired; blocked after Hired) |
| Reject candidate | `candidates[i].stage` → `"Rejected"` |
| Add candidate (Add Candidate modal) | `candidates` array grows by 1 |
| Add goal (Performance tab) | `goals` array grows by 1 |
| Send feedback request (Performance → Feedback sub-tab) | `notifications` array grows by 1 (type: `"feedback_request"`) |
| Request Compensation Change (employee banner) | `employees[i].payRate` updated; `employees[i].payChangeHistory` grows by 1 entry; `notifications` grows by 1 |
| Request Job Information Change (employee banner) | `employees[i].jobTitle` and/or `departmentId` updated; `notifications` grows by 1 |
| Request Promotion (employee banner) | `employees[i].jobTitle` and `payRate` updated; `employees[i].payChangeHistory` grows by 1 entry; `notifications` grows by 1 |
| Terminate Employee (gear menu) | `employees[i].status` → `"Inactive"`, `terminationDate`, `terminationType`, `terminationReason`, `regrettable`, `rehireEligible` set; `notifications` grows by 1 |
| Add New Employee (New... dropdown) | `employees` array grows by 1; `notifications` grows by 1 |
| New Announcement (New... dropdown) | `announcements` array grows by 1; `notifications` grows by 1 |
| New Job Opening (Hiring page) | `jobOpenings` array grows by 1; `notifications` grows by 1 |
| Create Custom Report (Reports page) | `reports` array grows by 1 (category: `"custom"`) |
| Navigate employee profile tabs | URL changes (e.g., `/people/1/notes`) — no state change |
| Navigate to org chart | URL changes to `/people/org-chart` — no state change |
| Search employees (global search) | no state change — display-only |
| Filter people directory | no state change — display-only |
| Toggle Announcements/All Activity (Home feed) | no state change — display-only |
| Export CSV (Report Detail) | file download + `reports[i].lastRunAt` updated to today's date |
| Run Report (Report Detail) | `reports[i].lastRunAt` updated to today's date |
