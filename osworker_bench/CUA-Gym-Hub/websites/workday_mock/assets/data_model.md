# Xorkday Mock — Data Model

> Last updated: 2026-03-02 by plan agent
> This document defines the entity types, fields, relationships, and seed data structure for `src/lib/mockData.js`.

---

## Entity Relationship Overview

```
Organization (departments)
  └── has many → Employees
       ├── has many → TimeEntries
       ├── has many → TimeOffRequests
       ├── has many → Paystubs (payroll)
       ├── has one  → Benefits (enrollment)
       ├── has many → Reviews (performance)
       ├── has many → Goals
       ├── has many → Tasks (inbox items)
       └── reports to → Employee (manager)

Announcements — standalone, org-wide
Notifications — per-employee alerts
```

---

## §CurrentUser

The logged-in employee. Always `emp001`.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"emp001"` | Primary key |
| name | string | `"Alex Morgan"` | Full name |
| email | string | `"alex.morgan@acmecorp.com"` | Work email |
| phone | string | `"+1 (415) 555-0142"` | Work phone |
| role | string | `"Manager"` | One of: Employee, Manager, Director, VP |
| department | string | `"Engineering"` | Department name |
| departmentId | string | `"dept001"` | FK to departments |
| avatar | string | URL | Photo URL (use picsum or ui-avatars.com) |
| managerId | string\|null | `"emp002"` | FK to employee (null = top-level) |
| title | string | `"Senior Software Engineer"` | Job title |
| location | string | `"San Francisco, CA"` | Office location |
| joinDate | string | `"2020-03-15"` | ISO date |
| employeeType | string | `"Full-Time"` | Full-Time, Part-Time, Contractor |
| compensationGrade | string | `"IC4"` | Pay grade |
| annualSalary | number | `145000` | Base annual salary |
| workSchedule | string | `"Mon-Fri 9:00-17:00"` | Standard schedule |

---

## §Employees

All employees in the organization. The `currentUser` is always included as the first element.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"emp003"` | Unique ID |
| name | string | `"John Smith"` | Full name |
| email | string | `"john.smith@acmecorp.com"` | |
| phone | string | `"+1 (415) 555-0198"` | |
| role | string | `"Employee"` | Employee/Manager/Director/VP |
| department | string | `"Engineering"` | |
| departmentId | string | `"dept001"` | |
| avatar | string | URL | |
| managerId | string\|null | `"emp001"` | Reports to currentUser |
| title | string | `"Junior Developer"` | |
| location | string | `"Remote"` | |
| joinDate | string | `"2022-01-10"` | |
| employeeType | string | `"Full-Time"` | |
| birthday | string | `"1995-06-15"` | For team highlights |
| workAnniversary | string | `"2022-01-10"` | Usually same as joinDate |

**Seed**: 8-10 employees across 3-4 departments (Engineering, Design, Marketing, Finance), forming a realistic org tree:
- emp002 (Director, no manager) → emp001 (Manager) → emp003, emp005, emp006 (reports)
- emp002 → emp004 (Design Manager) → emp007, emp008
- emp009 (Marketing Director) → emp010 (Marketing)

---

## §Departments

| Field | Type | Example |
|-------|------|---------|
| id | string | `"dept001"` |
| name | string | `"Engineering"` |
| headcount | number | `5` |
| managerId | string | `"emp002"` |

**Seed**: Engineering, Design, Marketing, Finance, Human Resources

---

## §TimeEntries

Weekly timesheet entries, one per employee per day per project.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| entryId | string | `"te1"` | Unique ID |
| employeeId | string | `"emp001"` | FK |
| date | string | `"2024-10-23"` | ISO date |
| hours | number | `8` | Hours worked |
| project | string | `"Project Alpha"` | Project name |
| status | string | `"Approved"` | Pending, Approved, Rejected |
| notes | string | `""` | Optional notes |

**Seed**: 10-15 entries for currentUser across last 2-3 weeks, mix of Approved and Pending.

---

## §TimeOffRequests

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| requestId | string | `"tr1"` | Unique ID |
| employeeId | string | `"emp001"` | FK |
| type | string | `"Vacation"` | Vacation, Sick, Personal, Jury Duty, Bereavement |
| startDate | string | `"2024-12-20"` | ISO date |
| endDate | string | `"2024-12-28"` | ISO date |
| status | string | `"Approved"` | Pending, Approved, Denied, Cancelled |
| reason | string | `"Holiday break"` | Employee note |
| totalHours | number | `56` | Calculated: business days * 8 |
| reviewedBy | string\|null | `"emp002"` | Manager who reviewed |
| reviewedDate | string\|null | `"2024-11-01"` | Date reviewed |

**Seed**: 4-5 requests covering different statuses and types.

---

## §TimeOffBalance

| Field | Type | Example |
|-------|------|---------|
| vacation | number | `120` | Hours remaining |
| sick | number | `40` | Hours remaining |
| personal | number | `16` | Hours remaining |

---

## §Payroll (Paystubs)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| paystubId | string | `"ps1"` | Unique ID |
| employeeId | string | `"emp001"` | FK |
| period | string | `"Oct 1 - Oct 15, 2024"` | Pay period description |
| payDate | string | `"2024-10-15"` | ISO date |
| grossPay | number | `5576.92` | Gross earnings |
| federalTax | number | `892.31` | Federal income tax |
| stateTax | number | `445.35` | State income tax |
| socialSecurity | number | `345.77` | FICA SS |
| medicare | number | `80.87` | FICA Medicare |
| healthInsurance | number | `120.00` | Pre-tax deduction |
| retirement401k | number | `278.85` | 401k contribution |
| otherDeductions | number | `15.00` | Other |
| totalDeductions | number | `2178.15` | Sum of all deductions |
| netPay | number | `3398.77` | Gross - Total Deductions |

**Seed**: 6 paystubs covering 3 months of biweekly pay. Year-to-date should be computable.

---

## §Benefits

| Field | Type | Notes |
|-------|------|-------|
| employeeId | string | FK |
| enrollmentStatus | string | "Complete" or "Open Enrollment" |
| plans | Plan[] | Array of benefit plans |
| dependents | Dependent[] | Covered dependents |

### Plan

| Field | Type | Example |
|-------|------|---------|
| id | string | `"b1"` |
| type | string | `"Medical"` | Medical, Dental, Vision, Life, Disability, FSA, HSA |
| name | string | `"Medical - PPO Plus"` |
| provider | string | `"BlueCross BlueShield"` |
| coverageLevel | string | `"Employee + Spouse"` | Employee Only, Employee + Spouse, Family |
| employeeCost | number | `240.00` | Per-month cost to employee |
| employerCost | number | `680.00` | Per-month employer contribution |
| status | string | `"Active"` |
| effectiveDate | string | `"2024-01-01"` |
| details | object | `{ deductible: 1500, outOfPocketMax: 5000, copay: 25 }` |

### Dependent

| Field | Type | Example |
|-------|------|---------|
| id | string | `"dep1"` |
| name | string | `"Jane Morgan"` |
| relationship | string | `"Spouse"` | Spouse, Child, Domestic Partner |
| dateOfBirth | string | `"1991-08-22"` |

**Seed**: 3-4 active plans (Medical, Dental, Vision, 401k), 1-2 dependents.

---

## §Reviews (Performance)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| reviewId | string | `"r1"` | Unique ID |
| employeeId | string | `"emp001"` | Employee being reviewed |
| managerId | string | `"emp002"` | Reviewer |
| period | string | `"2024 Annual Review"` | Review period name |
| rating | string | `"Exceeds Expectations"` | Rating text |
| ratingScore | number | `4` | 1-5 scale |
| status | string | `"Completed"` | Pending Self-Review, Pending Manager Review, Completed |
| selfReviewComments | string | `"I led the migration..."` | Employee self-assessment |
| managerComments | string | `"Great work..."` | Manager feedback |
| completedDate | string\|null | `"2024-03-15"` | |

**Seed**: 2-3 reviews (1 completed past review, 1 pending current review for self-assessment, 1 pending manager review the user needs to complete for a report).

---

## §Goals

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| goalId | string | `"g1"` | Unique ID |
| employeeId | string | `"emp001"` | FK |
| title | string | `"Complete AWS migration"` | |
| description | string | `"Migrate 3 services..."` | |
| category | string | `"Technical"` | Technical, Leadership, Business, Personal |
| status | string | `"On Track"` | Not Started, On Track, At Risk, Completed |
| progress | number | `75` | 0-100 |
| dueDate | string | `"2024-12-31"` | |
| createdDate | string | `"2024-01-15"` | |
| milestones | string[] | `["Phase 1 complete", "Phase 2 in progress"]` | |

**Seed**: 3-4 goals in different statuses.

---

## §Tasks (Inbox/My Tasks)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| taskId | string | `"t1"` | Unique ID |
| employeeId | string | `"emp001"` | Assigned to |
| type | string | `"Approval"` | Approval, Review, Compliance, Information, To-Do |
| subType | string | `"Time Off Request"` | More specific categorization |
| description | string | `"Approve Time Off for John Smith"` | |
| status | string | `"Pending"` | Pending, Completed, Denied |
| dueDate | string | `"2024-10-28"` | |
| createdDate | string | `"2024-10-20"` | |
| relatedId | string\|null | `"tr_john_1"` | FK to related entity |
| initiator | string | `"John Smith"` | Who initiated the task |
| businessProcess | string | `"Request Time Off"` | Xorkday business process name |
| comments | Comment[] | `[]` | Thread of comments |
| priority | string | `"Normal"` | High, Normal, Low |

### Comment (within task)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"c1"` |
| author | string | `"John Smith"` |
| text | string | `"Please approve..."` |
| timestamp | string | ISO datetime |

**Seed**: 5-6 tasks with varied types:
1. Approval: Time off request from John Smith (Pending)
2. Review: Performance review for John Smith (Pending)
3. Compliance: Complete Cyber Security Training (Pending)
4. Approval: Expense report from Emily Chen (Pending)
5. Information: Benefits enrollment reminder (Pending)
6. Completed: Previous approved time off (Completed)

---

## §Announcements

| Field | Type | Example |
|-------|------|---------|
| id | string | `"a1"` |
| title | string | `"Open Enrollment Begins Nov 1"` |
| date | string | `"2024-10-25"` |
| content | string | `"Benefits open enrollment..."` |
| category | string | `"Benefits"` | Benefits, Company, HR, IT, Events |
| priority | string | `"Normal"` | High, Normal |

**Seed**: 4-5 announcements covering different categories.

---

## §Notifications

| Field | Type | Example |
|-------|------|---------|
| id | string | `"n1"` |
| type | string | `"task"` | task, pay, timeoff, system |
| title | string | `"New task assigned"` |
| message | string | `"You have a time off request to approve"` |
| timestamp | string | ISO datetime |
| read | boolean | `false` |
| link | string | `"/inbox"` | Route to navigate to |

**Seed**: 5-6 notifications, 3 unread.

---

## §ClockStatus

| Field | Type | Notes |
|-------|------|-------|
| isClockedIn | boolean | Current clock state |
| startTime | string\|null | ISO datetime when clocked in |

---

## Suggested `generateInitialState()` Structure

```javascript
return {
  currentUser,          // §CurrentUser
  employees,            // §Employees (8-10 records)
  departments,          // §Departments (5 records) — NEW
  timeEntries,          // §TimeEntries (10-15 records)
  timeOffRequests,      // §TimeOffRequests (4-5 records)
  timeOffBalance,       // §TimeOffBalance
  payroll,              // §Payroll (6 records)
  benefits,             // §Benefits (with 3-4 plans, 1-2 dependents)
  reviews,              // §Reviews (2-3 records)
  goals,                // §Goals (3-4 records) — NEW
  tasks,                // §Tasks (5-6 records)
  announcements,        // §Announcements (4-5 records)
  notifications,        // §Notifications (5-6 records) — NEW
  clockStatus,          // §ClockStatus
};
```

### New entities to add (vs. current mock):
- `departments` — for directory filtering and org structure
- `goals` — for performance management CRUD
- `notifications` — for notification bell dropdown
- Expanded `benefits` with `dependents` array and richer `plans`
- Expanded `payroll` with line-item deductions
- Expanded `tasks` with `comments`, `initiator`, `businessProcess`, `priority`
- Expanded `currentUser` with `phone`, `employeeType`, `compensationGrade`, `annualSalary`
- Expanded `employees` with `birthday`, `phone`

### Normalizer updates needed:
Add normalizers for: `departments`, `goals`, `notifications`, `benefits.dependents`
Update existing normalizers: `normalizeEmployee` (add phone, birthday), `normalizePaystub` (add line items), `normalizeTask` (add comments, priority, businessProcess)
