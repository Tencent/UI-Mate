# gusto_mock Schema

**Base URL**: `http://localhost:5173/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files:[{original_name, stored_name, size, content_type, url}]}`
**Serve file**: `GET /files/<sid>/<filename>`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `company` | object | Company info, locations, departments, pay schedule, bank account, settings |
| `currentUser` | object | Logged-in admin user (Jessica Jackson, emp_1) |
| `employees` | array | 13 employees with full profiles |
| `contractors` | array | 2 contractors (Lisa Wang, Mike Rivera) |
| `payrolls` | array | 1 Draft + 3 Complete historical payrolls |
| `timeEntries` | array | Weekly time entries for hourly employees (Alex Martin) |
| `timeOffRequests` | array | PTO/sick/personal leave requests |
| `benefitPlans` | array | Medical, Dental, Vision, 401(k) plans |
| `taxForms` | array | Federal and state tax forms (W-2, 1099-NEC, 941, 940, DE 9) |
| `documents` | array | Company and employee documents |
| `todoItems` | array | Dashboard action items |
| `onboardingChecklists` | array | New hire checklists (Craig Ellis) |
| `companyHolidays` | array | US holidays for 2025 (9 entries) |
| `notifications` | array | Bell icon notifications |
| `reportHistory` | array | Log of report download/view actions (appended by Reports page) |
| `referrals` | array | Referral invitations sent via Refer & Earn page |

### Default Employee IDs
`emp_1` Jessica Jackson (HR Director, Admin, Operations)
`emp_2` Marcus Chen (Senior Software Engineer, Engineering)
`emp_3` Sarah Mitchell (Sales Manager, Sales)
`emp_4` David Kim (Software Engineer, Engineering)
`emp_5` Priya Patel (VP of Engineering, Engineering)
`emp_6` Alex Martin (Sales Representative, Sales, Hourly)
`emp_7` Emily Lee (Marketing Manager, Marketing)
`emp_8` Jordan Townsend (Frontend Developer, Engineering)
`emp_9` Rachel Gonzalez (Account Executive, Sales)
`emp_10` Tyler Brooks (Content Specialist, Marketing)
`emp_11` Nina Sharma (QA Engineer, Engineering)
`emp_12` Brian Foster (Finance Manager, Finance)
`emp_13` Craig Ellis (Operations Coordinator, Operations, Onboarding)

### Default Contractor IDs
`contr_1` Lisa Wang (Wang Design Studio, Hourly $85/hr)
`contr_2` Mike Rivera (Rivera Consulting LLC, Fixed $5000/mo)

### Default Payroll IDs
`pay_current` — Draft, Apr 7–18 2025, check date Apr 25
`pay_3` — Complete, Mar 24–Apr 4 2025
`pay_2` — Complete, Mar 10–21 2025
`pay_1` — Complete, Feb 24–Mar 7 2025

### Default Time Entry IDs
`te_1` — emp_6 (Alex Martin), week of Apr 7 2025, Pending, 42.5h
`te_2` — emp_6 (Alex Martin), week of Mar 31 2025, Approved, 40h

### Default Time Off Request IDs
`tor_1` — David Kim, Vacation, Apr 28–May 2, Pending
`tor_2` — Emily Lee, Sick, Apr 3, Approved
`tor_3` — Marcus Chen, Vacation, May 19–23, Approved
`tor_4` — Tyler Brooks, Personal, Apr 15, Pending

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "company": {
      "id": "comp_1",
      "name": "Horizon Tech Solutions",
      "legalName": "Horizon Tech Solutions, LLC",
      "ein": "12-3456789",
      "industry": "Technology",
      "entityType": "LLC",
      "phone": "(415) 555-0192",
      "email": "admin@horizontech.com",
      "website": "www.horizontech.com",
      "foundedDate": "2019-03-15",
      "address": {"street1": "742 Innovation Drive", "street2": "Suite 300", "city": "San Francisco", "state": "CA", "zip": "94107", "country": "US"},
      "locations": [
        {"id": "loc_1", "name": "HQ - San Francisco", "address": {"street1": "742 Innovation Drive", "street2": "Suite 300", "city": "San Francisco", "state": "CA", "zip": "94107"}, "isMain": true}
      ],
      "departments": [
        {"id": "dept_1", "name": "Engineering", "headcount": 5}
      ],
      "paySchedule": {"frequency": "Every other week", "nextPayday": "2025-04-25", "nextDeadline": "2025-04-22T16:00:00-08:00"},
      "bankAccount": {"bankName": "Silicon Valley Bank", "accountType": "Checking", "routingNumber": "****6789", "accountNumber": "****4321", "status": "verified"},
      "settings": {"notifications": {"payrollReminders": true, "timeOffRequests": true, "newHireOnboarding": true}, "timezone": "America/Los_Angeles"}
    },
    "currentUser": {"id": "emp_1", "firstName": "Jessica", "lastName": "Jackson", "email": "jessica.jackson@horizontech.com", "role": "Admin", "avatar": null, "title": "HR Director"},
    "employees": [],
    "contractors": [],
    "payrolls": [{"id": "pay_current", "status": "Draft", "payPeriod": {"startDate": "2025-04-07", "endDate": "2025-04-18"}, "checkDate": "2025-04-25", "deadline": "2025-04-22T16:00:00", "totalGrossPay": 0, "totalTaxes": 0, "totalBenefits": 0, "totalNetPay": 0, "totalReimbursements": 0, "employeeCompensations": []}],
    "timeEntries": [],
    "timeOffRequests": [],
    "benefitPlans": [],
    "taxForms": [],
    "documents": [],
    "todoItems": [],
    "onboardingChecklists": [],
    "companyHolidays": [],
    "notifications": [],
    "reportHistory": [],
    "referrals": []
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Approve time off request (Vacation) | `timeOffRequests[i].status`: "Pending" → "Approved"; `employees[j].pto.vacationBalance`: N → N - hours |
| Approve time off request (Sick) | `timeOffRequests[i].status`: "Pending" → "Approved"; `employees[j].pto.sickBalance`: N → N - hours |
| Deny time off request | `timeOffRequests[i].status`: "Pending" → "Denied" |
| Approve time entry | `timeEntries[i].status`: "Pending" → "Approved" |
| Edit time entry hours | `timeEntries[i].entries[j].clockIn/clockOut/totalHours`; `timeEntries[i].totalHours` |
| Submit payroll (Run Payroll step 4) | `payrolls[0].status`: "Draft" → "Complete"; `payrolls[0].totalGrossPay/totalTaxes/totalNetPay`: 0 → computed; new Draft payroll added to `payrolls` array |
| Add employee (Add Employee modal) | `employees`: length N → N+1; new employee has `status: "Onboarding"` |
| Start onboarding (employee Documents tab) | `onboardingChecklists`: length N → N+1; new entry `{id, employeeId, employeeName, startDate, tasks:[6 standard tasks]}` |
| Edit employee personal info | `employees[i].firstName/lastName/personalEmail/phone/dateOfBirth/address`: old → new |
| Edit employee employment info | `employees[i].jobTitle/department/departmentId/managerName/location/locationId/startDate/compensation/payMethod`: old → new |
| Add compliance note (employee Compliance tab) | `employees[i].compliance.notes`: length N → N+1; new entry `{id, text, addedBy, addedDate}` |
| Upload document | `documents`: length N → N+1 |
| Toggle notification setting (Save) | `company.settings.notifications.payrollReminders/timeOffRequests/newHireOnboarding`: true → false (or reverse) |
| Edit company info (Save) | `company.name/legalName/ein/industry/phone/email/website`: old → new |
| Mark notification read | `notifications[i].read`: false → true |
| Mark all notifications read | all `notifications[i].read`: false → true |
| Download a report | `reportHistory`: length N → N+1; new entry `{reportType, action: "download", timestamp}` |
| View a report | `reportHistory`: length N → N+1; new entry `{reportType, action: "view", timestamp}` |
| Send referral invite | `referrals`: length N → N+1; new entry `{id, email, status: "Invited", invitedAt}` |

## Entity Schemas

### Company
```json
{
  "id": "comp_1",
  "name": "string",
  "legalName": "string",
  "ein": "string",
  "industry": "string",
  "entityType": "string",
  "phone": "string",
  "email": "string",
  "website": "string",
  "foundedDate": "YYYY-MM-DD",
  "address": {"street1": "string", "street2": "string", "city": "string", "state": "string", "zip": "string", "country": "string"},
  "locations": [{"id": "string", "name": "string", "address": {}, "isMain": true}],
  "departments": [{"id": "string", "name": "string", "headcount": 0}],
  "paySchedule": {"frequency": "string", "nextPayday": "YYYY-MM-DD", "nextDeadline": "ISO8601"},
  "bankAccount": {"bankName": "string", "accountType": "string", "routingNumber": "string", "accountNumber": "string", "status": "string"},
  "settings": {"notifications": {"payrollReminders": true, "timeOffRequests": true, "newHireOnboarding": true}, "timezone": "string"}
}
```

### Employee
```json
{
  "id": "emp_X",
  "firstName": "string",
  "lastName": "string",
  "middleName": "string",
  "email": "string",
  "personalEmail": "string",
  "phone": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "ssn": "string",
  "address": {"street1": "string", "street2": "string", "city": "string", "state": "string", "zip": "string"},
  "department": "string",
  "departmentId": "dept_X",
  "jobTitle": "string",
  "managerId": "emp_X | null",
  "managerName": "string | null",
  "employmentType": "Full-time | Part-time",
  "compensation": {"type": "Salary | Hourly", "amount": 0, "per": "Year | Hour"},
  "startDate": "YYYY-MM-DD",
  "status": "Active | Onboarding | Terminated",
  "location": "string",
  "locationId": "loc_X",
  "payMethod": "string",
  "federalFilingStatus": "string",
  "stateFilingStatus": "string",
  "allowances": 0,
  "benefits": ["medical", "dental", "vision", "401k"],
  "pto": {"vacationBalance": 0, "sickBalance": 0, "vacationAccrualRate": 6.67, "sickAccrualRate": 3.33},
  "avatar": null,
  "compliance": {"notes": [{"id": "cnote_X", "text": "string", "addedBy": "emp_X", "addedDate": "YYYY-MM-DD"}]}
}
```
> `compliance` is optional. It is created lazily when the first note is added via the employee **Compliance** tab; employees start with no `compliance` key (or `{"notes": []}` if seeded by setup).

### Contractor
```json
{
  "id": "contr_X",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "businessName": "string",
  "type": "Individual | Business",
  "compensation": {"type": "Hourly | Fixed", "amount": 0, "per": "Hour | Month"},
  "address": {},
  "startDate": "YYYY-MM-DD",
  "status": "Active",
  "payMethod": "string",
  "totalPaidYTD": 0
}
```

### Payroll
```json
{
  "id": "pay_current | pay_N",
  "status": "Draft | Processing | Complete | Failed",
  "payPeriod": {"startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD"},
  "checkDate": "YYYY-MM-DD",
  "deadline": "ISO8601",
  "totalGrossPay": 0,
  "totalTaxes": 0,
  "totalBenefits": 0,
  "totalNetPay": 0,
  "totalReimbursements": 0,
  "employeeCount": 0,
  "debitDate": "YYYY-MM-DD",
  "employeeCompensations": []
}
```

### TimeEntry
```json
{
  "id": "te_X",
  "employeeId": "emp_X",
  "weekStartDate": "YYYY-MM-DD",
  "status": "Pending | Approved",
  "totalHours": 0,
  "regularHours": 0,
  "overtimeHours": 0,
  "entries": [
    {"date": "YYYY-MM-DD", "clockIn": "HH:MM", "clockOut": "HH:MM", "breakMinutes": 30, "totalHours": 0, "notes": "string"}
  ]
}
```

### TimeOffRequest
```json
{
  "id": "tor_X",
  "employeeId": "emp_X",
  "employeeName": "string",
  "type": "Vacation | Sick | Personal | Holiday",
  "status": "Pending | Approved | Denied",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "totalHours": 0,
  "reason": "string",
  "requestedAt": "ISO8601",
  "reviewedBy": "emp_X | null",
  "reviewedAt": "ISO8601 | null"
}
```

### BenefitPlan
```json
{
  "id": "ben_X",
  "type": "Medical | Dental | Vision | 401(k)",
  "planName": "string",
  "provider": "string",
  "monthlyCostEmployee": 0,
  "monthlyCostEmployer": 0,
  "coverage": "string",
  "enrolledCount": 0,
  "description": "string"
}
```

### Document
```json
{
  "id": "doc_X",
  "name": "string",
  "type": "string",
  "category": "Policies | Compliance | Tax | Hiring | Payroll | Other",
  "employeeId": "emp_X | undefined",
  "uploadedDate": "YYYY-MM-DD",
  "uploadedBy": "string",
  "size": "string"
}
```

### TodoItem
```json
{
  "id": "todo_X",
  "title": "string",
  "description": "string",
  "type": "payroll | onboarding | tax | benefits | general",
  "priority": "high | medium | low",
  "dueDate": "YYYY-MM-DD | null",
  "status": "pending | completed",
  "actionUrl": "string",
  "relatedId": "string | null"
}
```

### Notification
```json
{
  "id": "notif_X",
  "message": "string",
  "type": "payroll | timeoff | onboarding",
  "read": false,
  "timestamp": "ISO8601",
  "actionUrl": "string"
}
```

### ReportHistoryEntry
```json
{
  "reportType": "payroll-journal | tax-payments | pto-balances | headcount | contractor-payments",
  "action": "download | view",
  "timestamp": "ISO8601"
}
```

### Referral
```json
{
  "id": "ref_<timestamp>",
  "email": "string",
  "status": "Invited | Earned",
  "invitedAt": "ISO8601"
}
```
