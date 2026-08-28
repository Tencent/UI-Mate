# XambooHR Mock — Data Model

This document defines all entity types, their fields, relationships, and the `createInitialData()` structure for `dataManager.js`.

---

## Entity Definitions

### 1. Employee (central entity)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | number | 1 | Auto-increment |
| firstName | string | "Charlotte" | |
| middleName | string | "Danielle" | Optional |
| lastName | string | "Abbott" | |
| preferredName | string | "Charlie" | Optional, falls back to firstName |
| displayName | string | "Charlotte Danielle Abbott" | Computed: first + middle + last |
| avatar | string | "/avatars/charlotte.jpg" | URL or initials fallback |
| email | string | "cabbott@efficientoffice.com" | Work email |
| homeEmail | string | "charlotte@gmail.com" | Personal email |
| workPhone | string | "415-555-1237" | |
| workPhoneExt | string | "1273" | |
| mobilePhone | string | "415-555-8965" | |
| homePhone | string | "" | Optional |
| dateOfBirth | string | "1985-06-15" | ISO date |
| gender | string | "Female" | "Male" / "Female" / "Non-binary" |
| maritalStatus | string | "Married" | "Single" / "Married" / "Domestic Partnership" |
| address1 | string | "123 Main St" | |
| address2 | string | "Apt 4B" | Optional |
| city | string | "San Francisco" | |
| state | string | "California" | |
| zipcode | string | "94102" | |
| country | string | "United States" | |
| hireDate | string | "2011-08-08" | ISO date |
| terminationDate | string | null | ISO date or null if active |
| status | string | "Active" | "Active" / "Inactive" |
| employmentStatus | string | "Full-Time" | "Full-Time" / "Part-Time" / "Contractor" / "Intern" |
| jobTitle | string | "Sr. HR Administrator" | |
| departmentId | number | 1 | FK → Department |
| locationId | number | 1 | FK → Location |
| divisionId | number | 1 | FK → Division |
| reportsToId | number | 5 | FK → Employee (manager) |
| employeeNumber | string | "1" | Company-assigned ID |
| payRate | number | 85000 | Annual salary or hourly rate |
| payType | string | "Salary" | "Salary" / "Hourly" |
| payFrequency | string | "Twice a Month" | |
| standardHoursPerWeek | number | 40 | |
| socialMediaLinks | object | `{linkedin:"...",twitter:"..."}` | Optional social URLs |
| emergencyContactName | string | "John Abbott" | |
| emergencyContactPhone | string | "415-555-0000" | |
| emergencyContactRelation | string | "Spouse" | |

### 2. Department

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| name | string | "Human Resources" |
| headId | number | 5 | FK → Employee (dept head) |

### 3. Location

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| name | string | "San Francisco HQ" |
| address | string | "100 Market St, San Francisco, CA 94105" |
| timezone | string | "America/Los_Angeles" |

### 4. Division

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| name | string | "Western States" |

### 5. TimeOffPolicy

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| name | string | "Vacation Full-Time" |
| type | string | "Vacation" | "Vacation" / "Sick" / "Bereavement" / "FMLA" / "Personal" |
| icon | string | "palm-tree" | Icon identifier |
| unit | string | "hours" | "hours" / "days" |
| accrualRate | number | 6.67 | Hours per pay period |
| maxBalance | number | 240 | Max carryover |

### 6. TimeOffBalance

| Field | Type | Example |
|-------|------|---------|
| employeeId | number | 1 |
| policyId | number | 1 |
| available | number | 27.4 | Current available balance |
| scheduled | number | 72 | Hours scheduled |
| used | number | 40 | YTD used |

### 7. TimeOffRequest

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| employeeId | number | 1 | FK → Employee |
| policyId | number | 1 | FK → TimeOffPolicy |
| startDate | string | "2026-04-12" | ISO date |
| endDate | string | "2026-04-13" | ISO date |
| hours | number | 16 | Total hours requested |
| status | string | "approved" | "pending" / "approved" / "denied" / "cancelled" |
| note | string | "Family vacation" | Optional employee note |
| reviewedBy | number | 5 | FK → Employee (approver) |
| reviewedAt | string | "2026-03-20T10:00:00Z" | |
| createdAt | string | "2026-03-15T09:00:00Z" | |

### 8. JobOpening

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| title | string | "Software Engineer" |
| departmentId | number | 3 | FK → Department |
| locationId | number | 1 | FK → Location |
| status | string | "Open" | "Draft" / "Open" / "On Hold" / "Closed" / "Filled" |
| employmentType | string | "Full-Time" | |
| description | string | "We are looking for..." | Rich text |
| requirements | string | "5+ years experience..." | |
| salaryMin | number | 120000 | |
| salaryMax | number | 160000 | |
| hiringManagerId | number | 8 | FK → Employee |
| createdAt | string | "2026-02-01" | |
| applicantCount | number | 12 | Computed from candidates |

### 9. Candidate

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| jobOpeningId | number | 1 | FK → JobOpening |
| firstName | string | "Janet" | |
| lastName | string | "Lewis" | |
| email | string | "janet.lewis@email.com" | |
| phone | string | "555-123-4567" | |
| resumeUrl | string | "/files/resume_jlewis.pdf" | Mock URL |
| stage | string | "Screening" | "New" / "Screening" / "Phone Interview" / "On-site Interview" / "Offer" / "Hired" / "Rejected" |
| rating | number | 4 | 1-5 stars |
| appliedAt | string | "2026-03-01" | |
| notes | string | "Strong technical background" | |

### 10. Announcement

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| title | string | "Save the Date - Movie Night" |
| body | string | "Join us for a company movie night..." | |
| authorId | number | 3 | FK → Employee |
| createdAt | string | "2026-04-05T14:00:00Z" | |
| isPinned | boolean | false | |

### 11. Notification

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| type | string | "time_off_request" | "time_off_request" / "new_hire" / "announcement" / "task_due" / "feedback_request" / "application" / "compensation_request" / "asset_request" |
| message | string | "Charlotte Abbott made a request: Compensation request for Amy Granger." |
| timestamp | string | "2026-04-08T10:30:00Z" | |
| isRead | boolean | false | |
| icon | string | "calendar" | Icon type |
| linkTo | string | "/people/1" | Route to navigate on click |
| isPastDue | boolean | false | Shows orange "PAST DUE" badge |
| dueDate | string | "2026-04-03" | Optional |

### 12. Note (employee notes)

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| employeeId | number | 1 | FK → Employee |
| authorId | number | 5 | FK → Employee (who wrote it) |
| content | string | "Discussed career development goals" |
| createdAt | string | "2026-03-10T14:30:00Z" | |

### 13. Document

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| employeeId | number | 1 | FK → Employee (null for company docs) |
| name | string | "Employee_Handbook_2026.pdf" |
| category | string | "Policies" | "Policies" / "Tax Forms" / "Contracts" / "Certifications" / "Other" |
| uploadedAt | string | "2026-01-15" | |
| uploadedById | number | 5 | FK → Employee |
| size | string | "2.4 MB" | Display string |

### 14. Training

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| employeeId | number | 1 | FK → Employee |
| title | string | "Professional Certification Training" |
| status | string | "completed" | "completed" / "in_progress" / "overdue" / "upcoming" |
| dueDate | string | "2026-05-15" | |
| completedDate | string | "2026-03-20" | Null if not completed |
| category | string | "Compliance" | |

### 15. Asset

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| employeeId | number | 1 | FK → Employee |
| type | string | "Laptop" | "Laptop" / "Monitor" / "Phone" / "Badge" / "Key" / "Parking Pass" |
| description | string | 'MacBook Pro 16" M3' |
| serialNumber | string | "SN-2024-001234" |
| assignedDate | string | "2022-01-15" | |
| status | string | "assigned" | "assigned" / "returned" / "lost" |

### 16. Goal

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| employeeId | number | 1 | FK → Employee (null for company goal) |
| title | string | "Increase reward and recognition spending 10%" |
| description | string | "Track and increase..." |
| progress | number | 65 | 0-100 percentage |
| status | string | "on_track" | "on_track" / "behind" / "completed" / "not_started" |
| dueDate | string | "2026-12-31" | |
| createdAt | string | "2026-01-01" | |

### 17. PerformanceReview

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| employeeId | number | 1 | FK → Employee |
| reviewerId | number | 5 | FK → Employee |
| type | string | "annual" | "annual" / "mid_year" / "peer" / "self" |
| period | string | "2025" | |
| rating | number | 4 | 1-5 scale |
| comments | string | "Exceeds expectations in..." |
| status | string | "completed" | "draft" / "submitted" / "completed" |
| createdAt | string | "2026-01-15" | |

### 18. BenefitPlan

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| name | string | "Preferred Provider Organization" |
| type | string | "Medical" | "Medical" / "Dental" / "Vision" / "Life" / "401k" |
| provider | string | "Blue Cross Blue Shield" |
| employeeCost | number | 150 | Per month |
| employerCost | number | 450 | Per month |

### 19. BenefitEnrollment

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| employeeId | number | 1 | FK → Employee |
| planId | number | 1 | FK → BenefitPlan |
| coverageLevel | string | "Employee + Family" |
| startDate | string | "2026-01-01" | |
| status | string | "active" | "active" / "terminated" / "pending" |

### 20. Report (saved report definitions)

| Field | Type | Example |
|-------|------|---------|
| id | number | 1 |
| name | string | "Headcount by Department" |
| category | string | "standard" | "standard" / "custom" |
| type | string | "headcount" | "headcount" / "turnover" / "compensation" / "time_off" / "benefits" |
| description | string | "Shows current headcount..." |
| lastRunAt | string | "2026-04-01" | |

---

## Entity Relationships

```
Employee ──┬──> Department (departmentId)
           ├──> Location (locationId)
           ├──> Division (divisionId)
           ├──> Employee (reportsToId → manager)
           │
           ├──< TimeOffBalance (employeeId) ──> TimeOffPolicy
           ├──< TimeOffRequest (employeeId) ──> TimeOffPolicy
           ├──< Note (employeeId)
           ├──< Document (employeeId)
           ├──< Training (employeeId)
           ├──< Asset (employeeId)
           ├──< Goal (employeeId)
           ├──< PerformanceReview (employeeId)
           └──< BenefitEnrollment (employeeId) ──> BenefitPlan

JobOpening ──> Department, Location, Employee (hiringManagerId)
           ├──< Candidate (jobOpeningId)

Announcement ──> Employee (authorId)
Notification (standalone activity feed)
Report (standalone saved queries)
```

---

## Suggested `createInitialData()` Structure

```javascript
export function createInitialData() {
  return {
    // Current logged-in user
    currentUser: {
      employeeId: 1,  // Charlotte Abbott
      role: 'admin',  // 'admin' | 'manager' | 'employee'
      companyName: 'Efficient Office Solutions',
      companyLogo: null  // Shows "COMPANY LOGO HERE" placeholder
    },

    // Organizational units
    departments: [
      { id: 1, name: 'Human Resources', headId: 5 },
      { id: 2, name: 'Engineering', headId: 8 },
      { id: 3, name: 'Sales', headId: 12 },
      { id: 4, name: 'Marketing', headId: 15 },
      { id: 5, name: 'Customer Support', headId: 18 },
      { id: 6, name: 'Finance', headId: 20 },
      { id: 7, name: 'Operations', headId: 22 },
      { id: 8, name: 'IT', headId: 24 },
      { id: 9, name: 'Legal', headId: 26 },
      { id: 10, name: 'Leadership', headId: 28 }
    ],

    locations: [
      { id: 1, name: 'San Francisco HQ', address: '100 Market St, San Francisco, CA 94105', timezone: 'America/Los_Angeles' },
      { id: 2, name: 'New York Office', address: '200 Park Ave, New York, NY 10166', timezone: 'America/New_York' },
      { id: 3, name: 'Remote', address: '', timezone: '' }
    ],

    divisions: [
      { id: 1, name: 'Western States' },
      { id: 2, name: 'Eastern States' },
      { id: 3, name: 'North America' }
    ],

    // Employees: ~30 employees across departments for realistic feel
    employees: [
      // See detailed seed below
    ],

    // Time Off
    timeOffPolicies: [
      { id: 1, name: 'Vacation Full-Time', type: 'Vacation', icon: 'palm-tree', unit: 'hours', accrualRate: 6.67, maxBalance: 240 },
      { id: 2, name: 'Sick Full-Time', type: 'Sick', icon: 'medkit', unit: 'hours', accrualRate: 4.0, maxBalance: 120 },
      { id: 3, name: 'Bereavement', type: 'Bereavement', icon: 'heart', unit: 'days', accrualRate: 0, maxBalance: 5 },
      { id: 4, name: 'FMLA', type: 'FMLA', icon: 'shield', unit: 'days', accrualRate: 0, maxBalance: 60 },
      { id: 5, name: 'Personal', type: 'Personal', icon: 'user', unit: 'hours', accrualRate: 2.0, maxBalance: 40 }
    ],

    timeOffBalances: [/* per-employee balances */],
    timeOffRequests: [/* mix of pending, approved, denied */],

    // Hiring
    jobOpenings: [/* 3-5 open positions */],
    candidates: [/* 10-15 candidates across openings */],

    // Content
    announcements: [/* 3-4 company announcements */],
    notifications: [/* 10-15 recent activity items */],

    // Employee sub-records
    notes: [/* employee notes */],
    documents: [/* employee and company documents */],
    trainings: [/* training assignments */],
    assets: [/* company property assignments */],
    goals: [/* individual and company goals */],
    performanceReviews: [/* recent reviews */],

    // Benefits
    benefitPlans: [
      { id: 1, name: 'PPO Medical', type: 'Medical', provider: 'Blue Cross Blue Shield', employeeCost: 150, employerCost: 450 },
      { id: 2, name: 'Dental Basic', type: 'Dental', provider: 'Delta Dental', employeeCost: 25, employerCost: 75 },
      { id: 3, name: 'Vision Standard', type: 'Vision', provider: 'VSP', employeeCost: 10, employerCost: 30 },
      { id: 4, name: '401(k) Plan', type: '401k', provider: 'Fidelity', employeeCost: 0, employerCost: 0 },
      { id: 5, name: 'Life Insurance', type: 'Life', provider: 'MetLife', employeeCost: 15, employerCost: 50 }
    ],
    benefitEnrollments: [/* per-employee enrollments */],

    // Reports
    reports: [
      { id: 1, name: 'Headcount', category: 'standard', type: 'headcount', description: 'Current headcount by department', lastRunAt: '2026-04-01' },
      { id: 2, name: 'Employee Turnover', category: 'standard', type: 'turnover', description: 'Turnover rates over time', lastRunAt: '2026-03-15' },
      { id: 3, name: 'Compensation Summary', category: 'standard', type: 'compensation', description: 'Salary distribution and ranges', lastRunAt: '2026-04-05' },
      { id: 4, name: 'Time Off Usage', category: 'standard', type: 'time_off', description: 'PTO usage by department', lastRunAt: '2026-03-20' },
      { id: 5, name: 'Benefits Enrollment', category: 'standard', type: 'benefits', description: 'Current benefits enrollment status', lastRunAt: '2026-02-28' },
      { id: 6, name: 'Department Report', category: 'standard', type: 'headcount', description: 'Employee count by department with chart', lastRunAt: '2026-04-08' },
      { id: 7, name: 'New Hires', category: 'standard', type: 'headcount', description: 'Recent hires in the last 90 days', lastRunAt: '2026-04-02' },
      { id: 8, name: 'Employee Satisfaction', category: 'custom', type: 'custom', description: 'Custom eNPS survey results', lastRunAt: '2026-03-01' }
    ]
  };
}
```

---

## Seed Data Requirements

### Employees (~30 records)
Create a realistic org structure:
- **CEO** (1): Daniel John — reports to nobody
- **VP HR** (1): Jennifer Caldwell — reports to CEO
- **HR team** (3): Charlotte Abbott (current user, SR HR Admin), Brandon Bell (HR Specialist), Amy Granger (HR Coordinator) — report to VP HR
- **VP Engineering** (1): Marcus Chen — reports to CEO
- **Engineering team** (5): mix of Sr/Jr Engineers, QA — report to VP Eng
- **VP Sales** (1): Sarah Mitchell — reports to CEO
- **Sales team** (4): Account Executives, SDRs — report to VP Sales
- **Marketing** (3): Director + 2 team members
- **Customer Support** (3): Manager + 2 reps
- **Finance** (3): Controller (Dorothy Chou) + Accountant + Analyst
- **Other** (4-5): Operations, IT, Legal

Mix of:
- Active (28) and recently terminated (2) employees
- Different locations (SF HQ majority, NY, Remote)
- Hire dates ranging from 2015 to 2026 (new hire)
- Diverse names representing various backgrounds
- Some on leave / scheduled time off

### Time Off Requests (~8 records)
- 2 pending (awaiting approval)
- 4 approved (upcoming)
- 1 denied
- 1 past/completed

### Job Openings (4 records)
- Software Engineer (Engineering, Open, 12 applicants)
- Sales Development Rep (Sales, Open, 8 applicants)
- Marketing Manager (Marketing, Open, 5 applicants)
- Office Manager (Operations, Draft, 0 applicants)

### Candidates (12 records)
- Spread across the 3 open positions
- Various stages: New, Screening, Phone Interview, On-site, Offer
- 1-2 at Offer stage, several at Screening

### Notifications (12 records)
- Time off request submitted
- New application received
- Compensation change request
- Asset request
- Announcement posted
- Upcoming training overdue
- Performance review due
- Employee handbook waiting for signature
- Schedule exit interview

### Goals (5 records)
- 2 company-wide goals (partially complete)
- 3 individual goals for current user
