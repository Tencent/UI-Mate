# XDP Mock — Data Model

This document defines all entity types, their fields, relationships, and seed data specifications for `dataManager.js`.

---

## Entity Types

### 1. Employee (Current User)

The logged-in employee. Only one record — the "current user."

| Field | Type | Example |
|-------|------|---------|
| id | string | `"emp-001"` |
| firstName | string | `"Sarah"` |
| lastName | string | `"Johnson"` |
| email | string | `"sarah.johnson@acmecorp.com"` |
| phone | string | `"(555) 234-5678"` |
| employeeId | string | `"EMP-2847"` |
| hireDate | string (ISO) | `"2021-03-15"` |
| jobTitle | string | `"Senior Software Engineer"` |
| department | string | `"Engineering"` |
| division | string | `"Product Development"` |
| manager | string | `"Michael Chen"` |
| managerId | string | `"emp-010"` |
| workLocation | string | `"San Francisco, CA"` |
| employmentStatus | string | `"Full-Time"` |
| payRate | number | `95000` |
| payFrequency | string | `"Bi-Weekly"` |
| avatar | string (URL/initials) | `"SJ"` |

### 2. Address

| Field | Type | Example |
|-------|------|---------|
| street1 | string | `"456 Oak Avenue"` |
| street2 | string | `"Apt 12B"` |
| city | string | `"San Francisco"` |
| state | string | `"CA"` |
| zip | string | `"94102"` |
| country | string | `"United States"` |

### 3. EmergencyContact

| Field | Type | Example |
|-------|------|---------|
| id | string | `"ec-001"` |
| name | string | `"David Johnson"` |
| relationship | string | `"Spouse"` |
| phone | string | `"(555) 345-6789"` |
| email | string | `"david.johnson@email.com"` |
| isPrimary | boolean | `true` |

### 4. PayStatement

| Field | Type | Example |
|-------|------|---------|
| id | string | `"pay-001"` |
| payDate | string (ISO) | `"2026-03-28"` |
| periodStart | string (ISO) | `"2026-03-15"` |
| periodEnd | string (ISO) | `"2026-03-28"` |
| grossPay | number | `3653.85` |
| netPay | number | `2487.32` |
| earnings | Earning[] | (see below) |
| deductions | Deduction[] | (see below) |
| taxes | Tax[] | (see below) |
| ytdGross | number | `21923.10` |
| ytdNet | number | `14923.92` |

#### Earning (sub-object)
| Field | Type | Example |
|-------|------|---------|
| type | string | `"Regular"` |
| hours | number | `80` |
| rate | number | `45.67` |
| current | number | `3653.85` |
| ytd | number | `21923.10` |

#### Deduction (sub-object)
| Field | Type | Example |
|-------|------|---------|
| type | string | `"Medical - Employee"` |
| current | number | `187.50` |
| ytd | number | `1125.00` |

#### Tax (sub-object)
| Field | Type | Example |
|-------|------|---------|
| type | string | `"Federal Income Tax"` |
| current | number | `548.08` |
| ytd | number | `3288.47` |

### 5. TaxDocument

| Field | Type | Example |
|-------|------|---------|
| id | string | `"tax-001"` |
| year | number | `2025` |
| type | string | `"W-2"` |
| employerName | string | `"Acme Corporation"` |
| availableDate | string (ISO) | `"2026-01-31"` |
| downloaded | boolean | `false` |

### 6. DirectDeposit

| Field | Type | Example |
|-------|------|---------|
| id | string | `"dd-001"` |
| bankName | string | `"Chase Bank"` |
| accountType | string | `"Checking"` |
| routingNumber | string | `"****1234"` |
| accountNumber | string | `"****5678"` |
| depositType | string | `"Percentage"` |
| amount | number | `100` |
| isPrimary | boolean | `true` |

### 7. TimeEntry

| Field | Type | Example |
|-------|------|---------|
| id | string | `"te-001"` |
| date | string (ISO) | `"2026-04-07"` |
| clockIn | string (time) | `"08:02"` |
| clockOut | string (time) | `"17:15"` |
| breakMinutes | number | `60` |
| totalHours | number | `8.22` |
| status | string | `"Approved"` |
| note | string | `""` |

### 8. TimeOffBalance

| Field | Type | Example |
|-------|------|---------|
| type | string | `"Vacation"` |
| totalDays | number | `20` |
| usedDays | number | `6` |
| pendingDays | number | `2` |
| availableDays | number | `12` |
| accrualRate | string | `"1.54 hrs/pay period"` |

### 9. TimeOffRequest

| Field | Type | Example |
|-------|------|---------|
| id | string | `"tor-001"` |
| type | string | `"Vacation"` |
| startDate | string (ISO) | `"2026-04-21"` |
| endDate | string (ISO) | `"2026-04-25"` |
| totalHours | number | `40` |
| status | string | `"Pending"` |
| notes | string | `"Family vacation"` |
| submittedDate | string (ISO) | `"2026-04-01"` |
| reviewedBy | string | `""` |
| reviewedDate | string | `""` |

### 10. Holiday

| Field | Type | Example |
|-------|------|---------|
| id | string | `"hol-001"` |
| name | string | `"New Year's Day"` |
| date | string (ISO) | `"2026-01-01"` |
| dayOfWeek | string | `"Thursday"` |

### 11. BenefitPlan

| Field | Type | Example |
|-------|------|---------|
| id | string | `"ben-001"` |
| category | string | `"Medical"` |
| planName | string | `"Blue Cross PPO Gold"` |
| coverageLevel | string | `"Employee + Spouse"` |
| employeeCostPerPeriod | number | `187.50` |
| employerContribution | number | `562.50` |
| effectiveDate | string (ISO) | `"2026-01-01"` |
| status | string | `"Active"` |
| dependentsCovered | string[] | `["David Johnson"]` |

### 12. Dependent

| Field | Type | Example |
|-------|------|---------|
| id | string | `"dep-001"` |
| firstName | string | `"David"` |
| lastName | string | `"Johnson"` |
| relationship | string | `"Spouse"` |
| dateOfBirth | string (ISO) | `"1988-07-22"` |
| ssn | string | `"***-**-4321"` |
| coveredPlans | string[] | `["Medical", "Dental", "Vision"]` |

### 13. DirectReport (for manager view)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"emp-002"` |
| firstName | string | `"Alex"` |
| lastName | string | `"Rivera"` |
| jobTitle | string | `"Software Engineer"` |
| department | string | `"Engineering"` |
| email | string | `"alex.rivera@acmecorp.com"` |
| phone | string | `"(555) 456-7890"` |
| avatar | string | `"AR"` |
| status | string | `"Active"` |

### 14. Announcement

| Field | Type | Example |
|-------|------|---------|
| id | string | `"ann-001"` |
| title | string | `"Open Enrollment Starts May 1"` |
| content | string | `"Please review your benefits..."` |
| date | string (ISO) | `"2026-04-08"` |
| category | string | `"Benefits"` |
| isRead | boolean | `false` |
| priority | string | `"high"` |

### 15. TodoItem

| Field | Type | Example |
|-------|------|---------|
| id | string | `"todo-001"` |
| title | string | `"Submit timecard for week of 4/7"` |
| description | string | `"Your timecard is due by Friday"` |
| dueDate | string (ISO) | `"2026-04-11"` |
| type | string | `"timecard"` |
| isCompleted | boolean | `false` |
| link | string | `"/myself/time"` |

### 16. Notification

| Field | Type | Example |
|-------|------|---------|
| id | string | `"notif-001"` |
| title | string | `"Time-off request approved"` |
| message | string | `"Your vacation request for Apr 21-25 was approved"` |
| date | string (ISO) | `"2026-04-09"` |
| isRead | boolean | `false` |
| type | string | `"timeoff"` |
| actionUrl | string | `"/myself/timeoff"` |

### 17. CompanyInfo

| Field | Type | Example |
|-------|------|---------|
| name | string | `"Acme Corporation"` |
| ein | string | `"XX-XXXXXXX"` |
| address | string | `"100 Market Street, San Francisco, CA 94105"` |
| industry | string | `"Technology"` |

---

## Relationships

```
Employee
  ├── Address (1:1)
  ├── EmergencyContact[] (1:many, typically 1-2)
  ├── PayStatement[] (1:many, biweekly)
  ├── TaxDocument[] (1:many, yearly)
  ├── DirectDeposit[] (1:many, typically 1-2)
  ├── TimeEntry[] (1:many, daily)
  ├── TimeOffBalance[] (1:many, one per type)
  ├── TimeOffRequest[] (1:many)
  ├── BenefitPlan[] (1:many)
  ├── Dependent[] (1:many)
  ├── DirectReport[] (1:many, manager view)
  ├── Notification[] (1:many)
  └── TodoItem[] (1:many)

Company
  ├── Holiday[] (1:many)
  ├── Announcement[] (1:many)
  └── CompanyInfo (1:1)
```

---

## Seed Data Specifications for `createInitialData()`

```javascript
function createInitialData() {
  return {
    // Current user
    employee: { /* Sarah Johnson — see Employee fields above */ },
    address: { /* San Francisco address */ },
    emergencyContacts: [
      // 2 contacts: spouse (primary) + parent
    ],

    // Pay — 6 biweekly statements (3 months of history)
    payStatements: [
      // pay-001 through pay-006
      // Most recent: 2026-03-28, oldest: 2026-01-17
      // Each with: Regular earnings (80hrs), varying overtime
      // Standard deductions: Medical ($187.50), Dental ($42.00), Vision ($18.00), 401k ($182.69)
      // Standard taxes: Federal ($548.08), State CA ($219.23), Social Security ($226.54), Medicare ($52.98)
    ],

    // Tax documents — W-2 for 2024 and 2025
    taxDocuments: [
      { year: 2025, type: "W-2" },
      { year: 2024, type: "W-2" }
    ],

    // Direct deposit — checking (100%)
    directDeposits: [
      { bankName: "Chase Bank", accountType: "Checking", depositType: "Percentage", amount: 100 }
    ],

    // Time entries — current week (Mon-Thu filled, Fri empty) + last week (complete)
    timeEntries: [
      // 9 entries: 5 for last week (approved), 4 for this week (submitted)
      // Typical: 8:00-17:00 with 60min break = 8.0 hrs
    ],

    // Time off balances
    timeOffBalances: [
      { type: "Vacation", totalDays: 20, usedDays: 6, pendingDays: 2, availableDays: 12 },
      { type: "Sick", totalDays: 10, usedDays: 2, pendingDays: 0, availableDays: 8 },
      { type: "Personal", totalDays: 3, usedDays: 1, pendingDays: 0, availableDays: 2 }
    ],

    // Time off requests — mix of statuses
    timeOffRequests: [
      { type: "Vacation", status: "Pending", startDate: "2026-04-21", endDate: "2026-04-25" },
      { type: "Vacation", status: "Approved", startDate: "2026-02-16", endDate: "2026-02-20" },
      { type: "Sick", status: "Approved", startDate: "2026-01-13", endDate: "2026-01-13" },
      { type: "Personal", status: "Denied", startDate: "2026-03-31", endDate: "2026-03-31" }
    ],

    // Holidays — 2026 company holidays
    holidays: [
      // 10 holidays: New Year's Day, MLK Day, Presidents' Day, Memorial Day,
      // Independence Day, Labor Day, Thanksgiving, Day After Thanksgiving,
      // Christmas Eve, Christmas Day
    ],

    // Benefits — Medical, Dental, Vision, Life, 401k
    benefitPlans: [
      { category: "Medical", planName: "Blue Cross PPO Gold", coverageLevel: "Employee + Spouse", employeeCost: 187.50 },
      { category: "Dental", planName: "Delta Dental PPO", coverageLevel: "Employee + Spouse", employeeCost: 42.00 },
      { category: "Vision", planName: "VSP Choice Plan", coverageLevel: "Employee + Spouse", employeeCost: 18.00 },
      { category: "Life Insurance", planName: "Basic Life - 1x Salary", coverageLevel: "Employee", employeeCost: 0 },
      { category: "401(k)", planName: "Acme 401(k) Plan", contribution: "8%", employerMatch: "4%" }
    ],

    // Dependents
    dependents: [
      { firstName: "David", lastName: "Johnson", relationship: "Spouse", dateOfBirth: "1988-07-22" }
    ],

    // Direct reports (manager view) — 4 team members
    directReports: [
      { firstName: "Alex", lastName: "Rivera", jobTitle: "Software Engineer" },
      { firstName: "Emily", lastName: "Zhang", jobTitle: "Software Engineer" },
      { firstName: "Marcus", lastName: "Williams", jobTitle: "Junior Developer" },
      { firstName: "Priya", lastName: "Patel", jobTitle: "QA Engineer" }
    ],

    // Announcements — 4 recent company news items
    announcements: [
      { title: "Open Enrollment Begins May 1", category: "Benefits", priority: "high" },
      { title: "Q1 All-Hands Meeting Recording Available", category: "Company", priority: "normal" },
      { title: "Updated Remote Work Policy", category: "Policy", priority: "normal" },
      { title: "Summer Team Building Event - Register Now", category: "Events", priority: "normal" }
    ],

    // To-do items — 3 pending actions
    todoItems: [
      { title: "Submit timecard for week of 4/7", type: "timecard", dueDate: "2026-04-11" },
      { title: "Review updated remote work policy", type: "policy", dueDate: "2026-04-15" },
      { title: "Complete annual compliance training", type: "training", dueDate: "2026-04-30" }
    ],

    // Notifications — 5 recent
    notifications: [
      { title: "Timecard reminder", message: "Submit your timecard by Friday", isRead: false },
      { title: "Pay statement available", message: "Your 3/28 pay statement is ready", isRead: false },
      { title: "Time-off approved", message: "Your Feb 16-20 vacation was approved", isRead: true },
      { title: "Benefits update", message: "Open enrollment starts May 1", isRead: true },
      { title: "Policy update", message: "Remote work policy has been updated", isRead: true }
    ],

    // Company info
    companyInfo: {
      name: "Acme Corporation",
      address: "100 Market Street, San Francisco, CA 94105",
      industry: "Technology"
    },

    // Clock status
    clockStatus: {
      isClockedIn: true,
      lastClockIn: "2026-04-10T08:02:00",
      lastClockOut: null
    },

    // Manager pending approvals (for My Team view)
    pendingApprovals: [
      { type: "timeoff", employee: "Alex Rivera", request: "Vacation Apr 14-15", id: "approval-001" },
      { type: "timecard", employee: "Marcus Williams", request: "Week of 4/7", id: "approval-002" }
    ]
  };
}
```
