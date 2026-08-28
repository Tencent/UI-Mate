# Xpensify Mock — Data Model

## Overview

This document defines all entity types, their fields, relationships, and realistic example values for the `dataManager.js` `createInitialData()` function.

---

## §Users

The current user and other workspace members.

```js
{
  id: "usr_001",
  email: "sarah.chen@acmecorp.com",
  firstName: "Sarah",
  lastName: "Chen",
  displayName: "Sarah Chen",
  avatar: null, // uses placeholder (pink circle with first letter)
  role: "admin", // "admin" | "employee" | "auditor"
  managerId: null, // user ID of direct manager
  employeeId: "EMP-2847",
  department: "Engineering",
  defaultPolicy: "pol_001",
  reimbursementMethod: "ach", // "ach" | "venmo" | "paypal" | "check"
  createdAt: "2023-01-15T09:00:00Z"
}
```

**Seed**: 6 users
| id | name | email | role | department |
|---|---|---|---|---|
| usr_001 | Sarah Chen | sarah.chen@acmecorp.com | admin | Engineering |
| usr_002 | James Wilson | james.wilson@acmecorp.com | employee | Sales |
| usr_003 | Emily Rodriguez | emily.rodriguez@acmecorp.com | employee | Marketing |
| usr_004 | Michael Park | michael.park@acmecorp.com | employee | Engineering |
| usr_005 | Lisa Thompson | lisa.thompson@acmecorp.com | employee | Finance |
| usr_006 | David Kim | david.kim@acmecorp.com | employee | Sales |

**Current user**: `usr_001` (Sarah Chen) — admin with full access.

---

## §Policies (Workspaces)

Workspace/policy configuration that governs expense rules.

```js
{
  id: "pol_001",
  name: "Acme Corp Expenses",
  type: "corporate", // "corporate" | "team" | "personal"
  outputCurrency: "USD",
  owner: "usr_001",
  autoReporting: true,
  autoReportingFrequency: "weekly", // "daily" | "weekly" | "monthly" | "trip" | "manual"
  autoReportingOffset: 1, // day of week (1=Monday) or day of month
  requiresCategory: true,
  requiresTag: false,
  requiresComment: false,
  maxExpenseAge: 90, // days
  maxExpenseAmount: 5000, // in dollars
  preventSelfApproval: true,
  approvalMode: "basic", // "basic" | "advanced"
  reimbursementChoice: "reimburseManual", // "reimburseManual" | "reimburseACH" | "noReimbursement"
  createdAt: "2023-01-10T09:00:00Z"
}
```

**Seed**: 2 policies
| id | name | type | currency |
|---|---|---|---|
| pol_001 | Acme Corp Expenses | corporate | USD |
| pol_002 | Sarah's Personal Expenses | personal | USD |

---

## §Categories

Expense categories within a policy.

```js
{
  id: "cat_001",
  policyId: "pol_001",
  name: "Travel: Airfare",
  enabled: true,
  glCode: "6010",
  payrollCode: "",
  maxExpenseAmount: 3000, // 0 = no limit
  requiresComment: false,
  commentHint: "",
  externalId: ""
}
```

**Seed categories for pol_001** (15 categories):
| id | name | glCode | enabled |
|---|---|---|---|
| cat_001 | Travel: Airfare | 6010 | true |
| cat_002 | Travel: Hotel | 6020 | true |
| cat_003 | Travel: Car Rental | 6030 | true |
| cat_004 | Travel: Ground Transport | 6040 | true |
| cat_005 | Meals & Entertainment | 6100 | true |
| cat_006 | Office Supplies | 6200 | true |
| cat_007 | Software & Subscriptions | 6300 | true |
| cat_008 | Professional Services | 6400 | true |
| cat_009 | Communication | 6500 | true |
| cat_010 | Mileage | 6600 | true |
| cat_011 | Equipment | 6700 | true |
| cat_012 | Training & Education | 6800 | true |
| cat_013 | Utilities | 6900 | true |
| cat_014 | Dues & Subscriptions | 7000 | true |
| cat_015 | Miscellaneous | 9999 | true |

---

## §Tags

Tags for additional classification (projects, departments, etc.).

```js
{
  id: "tag_001",
  policyId: "pol_001",
  name: "Project Alpha",
  enabled: true,
  glCode: "PA-001",
  required: false
}
```

**Seed tags** (6 tags):
| id | name | glCode |
|---|---|---|
| tag_001 | Project Alpha | PA-001 |
| tag_002 | Project Beta | PB-002 |
| tag_003 | Client: Globex | CG-003 |
| tag_004 | Client: Initech | CI-004 |
| tag_005 | Internal | INT-005 |
| tag_006 | Conference | CONF-006 |

---

## §Expenses

Individual expense items.

```js
{
  id: "exp_001",
  type: "expense", // "expense" | "distance" | "time"
  policyId: "pol_001",
  reportId: "rpt_001", // null if unreported
  createdBy: "usr_002",
  merchant: "United Airlines",
  amount: 45600, // in cents ($456.00)
  currency: "USD",
  date: "2024-11-15",
  categoryId: "cat_001",
  category: "Travel: Airfare", // denormalized for display
  tagId: "tag_001",
  tag: "Project Alpha",
  description: "Flight SFO → NYC for client meeting",
  comment: "",
  receiptUrl: null, // placeholder URL or null
  hasReceipt: true,
  billable: true,
  reimbursable: true,
  taxAmount: 0, // in cents
  taxRate: "",
  // Distance-specific
  distance: null, // in km or miles
  distanceUnit: null, // "km" | "mi"
  distanceRate: null, // cents per unit
  // Time-specific
  hours: null,
  hourlyRate: null, // in cents
  // State
  status: "open", // "unreported" | "open" | "processing" | "approved" | "reimbursed" | "closed" | "deleted"
  violations: [], // policy violation strings
  createdAt: "2024-11-15T14:30:00Z",
  modifiedAt: "2024-11-15T14:30:00Z"
}
```

**Seed**: 15 expenses across multiple reports and users

| id | merchant | amount | category | status | reportId | createdBy | date |
|---|---|---|---|---|---|---|---|
| exp_001 | United Airlines | $456.00 | Travel: Airfare | open | rpt_001 | usr_002 | 2024-11-15 |
| exp_002 | Hilton Hotels | $289.50 | Travel: Hotel | open | rpt_001 | usr_002 | 2024-11-15 |
| exp_003 | Yellow Cab | $42.00 | Travel: Ground Transport | open | rpt_001 | usr_002 | 2024-11-16 |
| exp_004 | Olive Garden | $67.85 | Meals & Entertainment | open | rpt_001 | usr_002 | 2024-11-16 |
| exp_005 | Uber | $28.50 | Travel: Ground Transport | approved | rpt_002 | usr_003 | 2024-11-10 |
| exp_006 | Marriott Downtown | $195.00 | Travel: Hotel | approved | rpt_002 | usr_003 | 2024-11-10 |
| exp_007 | Delta Airlines | $523.00 | Travel: Airfare | approved | rpt_002 | usr_003 | 2024-11-09 |
| exp_008 | Staples | $124.30 | Office Supplies | reimbursed | rpt_003 | usr_004 | 2024-10-28 |
| exp_009 | Adobe Creative Cloud | $54.99 | Software & Subscriptions | reimbursed | rpt_003 | usr_004 | 2024-10-25 |
| exp_010 | 14.6 km mileage | $11.68 | Mileage | closed | rpt_004 | usr_006 | 2024-10-15 |
| exp_011 | AWS Monthly | $342.18 | Software & Subscriptions | open | rpt_005 | usr_004 | 2024-12-01 |
| exp_012 | Starbucks | $12.45 | Meals & Entertainment | unreported | null | usr_002 | 2024-12-05 |
| exp_013 | Office Depot | $89.99 | Office Supplies | unreported | null | usr_003 | 2024-12-03 |
| exp_014 | Lyft | $19.75 | Travel: Ground Transport | unreported | null | usr_005 | 2024-12-04 |
| exp_015 | 8 hours consulting | $960.00 | Professional Services | open | rpt_005 | usr_004 | 2024-12-02 |

---

## §Reports

Expense reports grouping expenses for submission/approval.

```js
{
  id: "rpt_001",
  title: "NYC Client Visit - November 2024",
  reportNumber: 77324820, // auto-generated ID
  policyId: "pol_001",
  policyName: "Acme Corp Expenses", // denormalized
  createdBy: "usr_002",
  createdByName: "James Wilson",
  createdByEmail: "james.wilson@acmecorp.com",
  status: "open", // "open" | "submitted" | "approved" | "reimbursed" | "closed" | "archived" | "retracted"
  total: 85535, // in cents (sum of expenses), $855.35
  currency: "USD",
  submittedTo: "usr_001", // approver user ID
  submittedToEmail: "sarah.chen@acmecorp.com",
  submittedDate: null, // ISO string when submitted
  approvedDate: null,
  reimbursedDate: null,
  startDate: "2024-11-15", // earliest expense date
  endDate: "2024-11-16", // latest expense date
  expenseCount: 4,
  starred: true, // favorited by current user
  exported: false,
  exportedDate: null,
  isRetracted: false,
  comments: [],
  createdAt: "2024-11-16T10:00:00Z",
  modifiedAt: "2024-11-16T10:00:00Z"
}
```

**Seed**: 5 reports

| id | title | reportNumber | total | status | createdBy | starred |
|---|---|---|---|---|---|---|
| rpt_001 | NYC Client Visit - November 2024 | 77324820 | $855.35 | open | usr_002 (James Wilson) | true |
| rpt_002 | Marketing Conference - Chicago | 77321220 | $746.50 | approved | usr_003 (Emily Rodriguez) | true |
| rpt_003 | Office Supplies Q4 | 77324769 | $179.29 | reimbursed | usr_004 (Michael Park) | false |
| rpt_004 | Mileage Expenses - October | 77265596 | $11.68 | closed | usr_006 (David Kim) | false |
| rpt_005 | Engineering Tools - December | 77265599 | $1,302.18 | open | usr_004 (Michael Park) | false |

---

## §Comments

Comments and history entries on reports.

```js
{
  id: "cmt_001",
  reportId: "rpt_001",
  authorId: "usr_002",
  authorName: "James Wilson",
  authorEmail: "james.wilson@acmecorp.com",
  type: "comment", // "comment" | "system" | "status_change"
  text: "Submitted for Q4 review",
  timestamp: "2024-11-16T10:05:00Z"
}
```

**Seed**: 8 comments across reports

| id | reportId | text | type | author |
|---|---|---|---|---|
| cmt_001 | rpt_001 | You created this report | system | usr_002 |
| cmt_002 | rpt_001 | Please review before month-end | comment | usr_002 |
| cmt_003 | rpt_002 | You created this report | system | usr_003 |
| cmt_004 | rpt_002 | Report submitted | status_change | usr_003 |
| cmt_005 | rpt_002 | Report approved | status_change | usr_001 |
| cmt_006 | rpt_003 | You created this report | system | usr_004 |
| cmt_007 | rpt_003 | Report approved | status_change | usr_001 |
| cmt_008 | rpt_003 | Reimbursement processed via ACH | system | system |

---

## §InboxItems

Inbox notifications and tasks.

```js
{
  id: "inb_001",
  type: "report_submitted", // "report_submitted" | "report_approved" | "report_rejected" | "expense_violation" | "task" | "concierge"
  title: "Expense Report Submitted",
  description: "James Wilson submitted 'NYC Client Visit - November 2024' ($855.35) for your approval",
  relatedId: "rpt_001", // reference to report/expense
  fromUserId: "usr_002",
  fromUserName: "James Wilson",
  read: false,
  hidden: false,
  actionRequired: true, // needs user action
  actionType: "approve_report", // "approve_report" | "review_violation" | "setup_task" | null
  createdAt: "2024-11-16T10:05:00Z"
}
```

**Seed**: 6 inbox items

| id | type | title | actionRequired | read |
|---|---|---|---|---|
| inb_001 | report_submitted | Report submitted for approval | true | false |
| inb_002 | report_submitted | Engineering Tools report submitted | true | false |
| inb_003 | expense_violation | Policy violation flagged | true | false |
| inb_004 | report_approved | Your report was approved | false | true |
| inb_005 | concierge | Welcome to Xpensify! | false | true |
| inb_006 | task | Set up direct reimbursement | false | false |

---

## §Members

Workspace members (denormalized from Users for policy context).

```js
{
  id: "mem_001",
  userId: "usr_001",
  policyId: "pol_001",
  email: "sarah.chen@acmecorp.com",
  name: "Sarah Chen",
  role: "admin", // "admin" | "member" | "auditor"
  managerId: null,
  managerEmail: null,
  employeeId: "EMP-2847",
  submitsTo: null,
  approvesTo: null, // forward-approval chain
  isApprover: true,
  addedAt: "2023-01-15T09:00:00Z"
}
```

**Seed**: 6 members (matching users)

---

## §ReportFields

Custom report fields configured per policy.

```js
{
  id: "rf_001",
  policyId: "pol_001",
  name: "Department",
  type: "dropdown", // "text" | "dropdown" | "date"
  values: ["Engineering", "Sales", "Marketing", "Finance", "Operations"],
  required: true,
  defaultValue: ""
}
```

**Seed**: 3 report fields

| id | name | type | values |
|---|---|---|---|
| rf_001 | Department | dropdown | Engineering, Sales, Marketing, Finance, Operations |
| rf_002 | Project Code | text | — |
| rf_003 | Trip End Date | date | — |

---

## §DistanceRates

Mileage/distance rates per policy.

```js
{
  id: "dr_001",
  policyId: "pol_001",
  unit: "mi", // "mi" | "km"
  rate: 67, // cents per unit ($0.67/mile)
  currency: "USD",
  enabled: true
}
```

**Seed**: 1 distance rate (IRS standard mileage rate)

---

## §TaxRates

Tax rate configuration per policy.

```js
{
  id: "tax_001",
  policyId: "pol_001",
  name: "No Tax",
  rate: 0, // percentage
  isDefault: true,
  enabled: true
}
```

**Seed**: 3 tax rates

| id | name | rate | isDefault |
|---|---|---|---|
| tax_001 | No Tax | 0% | true |
| tax_002 | Sales Tax | 8.25% | false |
| tax_003 | VAT | 20% | false |

---

## Relationships

```
Policy (1) ——< Category (many)
Policy (1) ——< Tag (many)
Policy (1) ——< Member (many)
Policy (1) ——< ReportField (many)
Policy (1) ——< DistanceRate (many)
Policy (1) ——< TaxRate (many)
Policy (1) ——< Report (many)
Report (1) ——< Expense (many)
Report (1) ——< Comment (many)
User (1) ——< Expense (many) [createdBy]
User (1) ——< Report (many) [createdBy]
User (1) ——< InboxItem (many) [target user]
Member ——> User (foreign key)
Member ——> Policy (foreign key)
```

---

## createInitialData() Structure

```js
function createInitialData() {
  return {
    currentUser: { /* usr_001 Sarah Chen */ },
    users: [ /* 6 users */ ],
    policies: [ /* 2 policies */ ],
    categories: [ /* 15 categories for pol_001 */ ],
    tags: [ /* 6 tags */ ],
    expenses: [ /* 15 expenses */ ],
    reports: [ /* 5 reports */ ],
    comments: [ /* 8 comments */ ],
    inboxItems: [ /* 6 inbox items */ ],
    members: [ /* 6 members */ ],
    reportFields: [ /* 3 report fields */ ],
    distanceRates: [ /* 1 rate */ ],
    taxRates: [ /* 3 tax rates */ ],
    // UI state
    ui: {
      activeView: "inbox",
      expenseViewMode: "list", // "list" | "compact" | "grid" | "receipt"
      expenseFiltersVisible: false,
      reportFiltersVisible: false,
      selectedExpenseIds: [],
      selectedReportIds: [],
      activeSettingsTab: "basics",
      modalOpen: null, // null | "newExpense" | "newReport" | "expenseDetail" | "reportDetail"
      modalData: null,
      expenseFilters: {
        merchant: "",
        dateFrom: "",
        dateTo: "",
        categories: [],
        tags: [],
        policies: [],
        statuses: [],
        billableFilter: "all", // "all" | "billable" | "reimbursable"
      },
      reportFilters: {
        dateFrom: "",
        dateTo: "",
        policies: [],
        statuses: [],
      },
      expenseSortBy: "date",
      expenseSortDir: "desc",
      reportSortBy: "name",
      reportSortDir: "desc",
    }
  };
}
```
