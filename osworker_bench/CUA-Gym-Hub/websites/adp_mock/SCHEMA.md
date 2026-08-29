# adp_mock Schema

**Deploy order**: 1 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8001)
**Base URL**: `http://localhost:<port>/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → not implemented (use /go instead)

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `employee` | object | Current user's employment record: `{id, firstName, lastName, email, phone, employeeId, hireDate, jobTitle, department, division, manager, managerId, workLocation, employmentStatus, payRate, payFrequency, avatar, dateOfBirth}` |
| `address` | object | Home address: `{street1, street2, city, state, zip, country}` |
| `emergencyContacts` | array | Each: `{id, name, relationship, phone, email, isPrimary}` |
| `payStatements` | array | Each: `{id, payDate, periodStart, periodEnd, grossPay, netPay, earnings[], deductions[], taxes[], ytdGross, ytdNet}` — `earnings[]` items: `{type, hours, rate, current, ytd}`; `deductions[]`/`taxes[]` items: `{type, current, ytd}` |
| `taxDocuments` | array | Each: `{id, year, type, employerName, availableDate, downloaded, wages, federalTaxWithheld, stateTaxWithheld, socialSecurityWages, medicareWages}` |
| `directDeposits` | array | Each: `{id, bankName, accountType, routingNumber, accountNumber, depositType, amount, isPrimary}` — `depositType` is `"Percentage"` or `"Flat Amount"` |
| `timeEntries` | array | Each: `{id, date, clockIn, clockOut, breakMinutes, totalHours, status, note}` — `status`: `"Approved"`, `"Submitted"`, `"Not Submitted"` |
| `timeOffBalances` | array | Each: `{type, totalDays, usedDays, pendingDays, availableDays, accrualRate}` — `type`: `"Vacation"`, `"Sick"`, `"Personal"` |
| `timeOffRequests` | array | Each: `{id, type, startDate, endDate, totalHours, status, notes, submittedDate, reviewedBy, reviewedDate}` — `status`: `"Pending"`, `"Approved"`, `"Denied"`, `"Cancelled"` |
| `holidays` | array | Each: `{id, name, date, dayOfWeek}` |
| `benefitPlans` | array | Each: `{id, category, planName, coverageLevel, employeeCostPerPeriod, employerContribution, effectiveDate, status, dependentsCovered[], details}` — category: `"Medical"`, `"Dental"`, `"Vision"`, `"Life Insurance"`, `"401(k)"` |
| `dependents` | array | Each: `{id, firstName, lastName, relationship, dateOfBirth, ssn, coveredPlans[]}` |
| `directReports` | array | Manager's direct reports, each: `{id, firstName, lastName, jobTitle, department, email, phone, avatar, status}` |
| `announcements` | array | Each: `{id, title, content, date, category, isRead, priority}` — category: `"Benefits"`, `"Company"`, `"Policy"`, `"Events"` |
| `todoItems` | array | Dashboard to-do items, each: `{id, title, description, dueDate, type, isCompleted, link}` |
| `notifications` | array | Each: `{id, title, message, date, isRead, type, actionUrl}` |
| `companyInfo` | object | `{name, ein, address, industry}` |
| `clockStatus` | object | `{isClockedIn, lastClockIn, lastClockOut}` — `lastClockIn`/`lastClockOut` are ISO datetime strings or null |
| `pendingApprovals` | array | Manager's pending items, each: `{id, type, employeeId, employeeName, employeeAvatar, request, status, submittedDate, reviewedDate?}` — `type`: `"timeoff"` or `"timecard"`; timeoff items also have `startDate, endDate, totalHours`; timecard items also have `weekStart, weekEnd, totalHours` |

### Default employee
- `employeeId`: `EMP-2847`, Sarah Johnson, Senior Software Engineer, Engineering

### Default IDs
- Pay statements: `pay-001` through `pay-006` (biweekly, Jan 17 – Mar 28, 2026)
- Tax documents: `tax-001` (W-2 2025), `tax-002` (W-2 2024)
- Direct deposit: `dd-001` (Chase Bank, Checking, 100%)
- Time entries: `te-001` through `te-009` (Apr 1–10, 2026)
- Time off requests: `tor-001` (Pending vacation), `tor-002` (Approved vacation), `tor-003` (Approved sick), `tor-004` (Denied personal)
- Holidays: `hol-001` through `hol-010` (2026 company holidays)
- Benefit plans: `ben-001` (Medical), `ben-002` (Dental), `ben-003` (Vision), `ben-004` (Life Insurance), `ben-005` (401k)
- Dependents: `dep-001` (David Johnson, Spouse)
- Direct reports: `emp-002` (Alex Rivera), `emp-003` (Emily Zhang), `emp-004` (Marcus Williams), `emp-005` (Priya Patel)
- Announcements: `ann-001` through `ann-004`
- To-do items: `todo-001` through `todo-003`
- Notifications: `notif-001` through `notif-005`
- Emergency contacts: `ec-001` (David Johnson, Spouse), `ec-002` (Margaret Johnson, Parent)
- Pending approvals: `approval-001` (Alex Rivera time off), `approval-002` (Marcus Williams timecard)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "employee": {
      "id": "emp-001",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "sarah.johnson@acmecorp.com",
      "phone": "(555) 234-5678",
      "employeeId": "EMP-2847",
      "hireDate": "2021-03-15",
      "jobTitle": "Senior Software Engineer",
      "department": "Engineering",
      "division": "Product Development",
      "manager": "Michael Chen",
      "managerId": "emp-010",
      "workLocation": "San Francisco, CA",
      "employmentStatus": "Full-Time",
      "payRate": 95000,
      "payFrequency": "Bi-Weekly",
      "avatar": "SJ",
      "dateOfBirth": "1990-05-14"
    },
    "address": {
      "street1": "456 Oak Avenue",
      "street2": "Apt 12B",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94102",
      "country": "United States"
    },
    "clockStatus": { "isClockedIn": false, "lastClockIn": null, "lastClockOut": null },
    "timeOffBalances": [
      { "type": "Vacation", "totalDays": 20, "usedDays": 6, "pendingDays": 2, "availableDays": 12, "accrualRate": "1.54 hrs/pay period" },
      { "type": "Sick", "totalDays": 10, "usedDays": 2, "pendingDays": 0, "availableDays": 8, "accrualRate": "0.77 hrs/pay period" },
      { "type": "Personal", "totalDays": 3, "usedDays": 1, "pendingDays": 0, "availableDays": 2, "accrualRate": "N/A" }
    ],
    "timeOffRequests": [],
    "timeEntries": [],
    "payStatements": [],
    "taxDocuments": [],
    "directDeposits": [],
    "benefitPlans": [],
    "dependents": [],
    "emergencyContacts": [],
    "directReports": [],
    "announcements": [],
    "todoItems": [],
    "notifications": [],
    "pendingApprovals": [],
    "holidays": [],
    "companyInfo": { "name": "Acme Corporation", "ein": "94-1234567", "address": "100 Market Street, San Francisco, CA 94105", "industry": "Technology" }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Clock In | `clockStatus.isClockedIn` → `true`; `clockStatus.lastClockIn` set to ISO timestamp; `timeEntries` gains or updates entry for today with `clockIn` time |
| Clock Out | `clockStatus.isClockedIn` → `false`; `clockStatus.lastClockOut` set; today's `timeEntries[i].clockOut` + `totalHours` updated |
| Submit timecard | `timeEntries[i].status` → `"Submitted"` for all "Not Submitted" entries in the week |
| Edit timecard cell (clockIn/clockOut) | `timeEntries[i].clockIn` or `clockOut` updated; `totalHours` recalculated |
| Submit time off request | `timeOffRequests` array grows by 1 (status `"Pending"`); `timeOffBalances[type].pendingDays` increases |
| Cancel time off request (own) | `timeOffRequests[i].status` → `"Cancelled"`; `timeOffBalances[type].pendingDays` decreases |
| Approve pending approval (manager) | `pendingApprovals[i].status` → `"Approved"`; `pendingApprovals[i].reviewedDate` set |
| Deny pending approval (manager) | `pendingApprovals[i].status` → `"Denied"`; `pendingApprovals[i].denyReason` + `reviewedDate` set |
| Mark notification read | `notifications[i].isRead` → `true` |
| Mark all notifications read | all `notifications[i].isRead` → `true` |
| Click announcement | `announcements[i].isRead` → `true` |
| Toggle todo item | `todoItems[i].isCompleted` toggled |
| Edit employee field (job title, dept, phone, email) | `employee.jobTitle`, `.department`, `.phone`, or `.email` updated |
| Edit home address | `address.street1`, `.street2`, `.city`, `.state`, `.zip`, `.country` updated |
| Add emergency contact | `emergencyContacts` array grows by 1 |
| Edit emergency contact | `emergencyContacts[i]` fields updated |
| Remove emergency contact | `emergencyContacts` array shrinks by 1 |
| Add dependent | `dependents` array grows by 1 |
| Edit dependent | `dependents[i]` fields updated |
| Remove dependent | `dependents` array shrinks by 1 |
| Edit direct deposit | `directDeposits[i]` fields updated |
| Add direct deposit account | `directDeposits` array grows by 1 |
| Download W-2 | `taxDocuments[i].downloaded` → `true` |
