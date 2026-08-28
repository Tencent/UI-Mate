# clio_mock Schema

**Base URL**: `http://localhost:5173/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → stored state JSON
**Upload**: `POST /upload?sid=<sid>` (multipart) → `{files:[{url,original_name,stored_name,size}]}`
**Files**: `GET /files/<sid>/<filename>` → file content

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUserId` | string | ID of the active user (always `"user-1"` / Sarah Chen) |
| `users` | array | Firm staff; each: `{id, name, email, role, isAdmin, subscriberType, initials, avatarColor, hourlyRate, phone, jobTitle, groups[], permissions{administrator,accounts,reports,billing}}` |
| `contacts` | array | Clients and related parties; each: `{id, type("Person"\|"Company"), prefix, firstName, lastName, displayName, companyId, companyName, jobTitle, email, emailSecondary, phone, phoneType, website, address{street,city,state,zip,country}, dateOfBirth, maritalStatus, tags[], customFields{}, billingInfo{ledesClientId,paymentProfile}, createdAt, updatedAt}` |
| `matters` | array | Legal matters; each: `{id, matterNumber, description, status("Open"\|"Pending"\|"Closed"), clientId, clientName, practiceArea, responsibleAttorneyId, responsibleAttorneyName, originatingAttorneyId, billingMethod("Hourly"\|"Flat Fee"\|"Contingency"), hourlyRate, budget, openDate, closeDate, pendingDate, statuteOfLimitations, courtName, caseNumber, stage, tags[], relatedContacts[{contactId,role}], notes, createdAt, updatedAt}` |
| `activities` | array | Time entries and expenses; each: `{id, type("TimeEntry"\|"ExpenseEntry"), matterId, matterDescription, userId, userName, date, description, duration(hrs for time)\|quantity(for expense), rate, total, billable, billed, billId, category, createdAt}` |
| `tasks` | array | Tasks; each: `{id, name, description, matterId, matterDescription, assigneeId, assigneeName, assignerId, priority("High"\|"Normal"\|"Low"), status("Outstanding"\|"Completed"), dueDate, completedDate, taskListId, taskListName, isPrivate, createdAt, updatedAt}` |
| `calendarEvents` | array | Calendar events; each: `{id, title, description, matterId, matterDescription, location, startDate(ISO string or YYYY-MM-DD), endDate, allDay, attendees[userIds], reminderMinutes, color, recurrence, createdAt}` |
| `bills` | array | Invoices; each: `{id, billNumber, matterId, matterDescription, clientId, clientName, status("Draft"\|"Awaiting Approval"\|"Sent"\|"Paid"\|"Overdue"\|"Void"), issuedDate, dueDate, paidDate, subtotal, taxRate, taxAmount, totalDue, amountPaid, balance, lineItems[{activityId,description,hours\|quantity,rate,amount}], memo, createdAt, updatedAt}` |
| `documents` | array | Document metadata; each: `{id, name, matterId, matterDescription, folderId, folderName, category, description, type(MIME), size(bytes), uploadedBy, uploadedByName, version, createdAt, updatedAt}` |
| `notes` | array | Case notes; each: `{id, matterId, matterDescription, subject, body, authorId, authorName, isPrivate, createdAt, updatedAt}` |
| `communications` | array | Communication log; each: `{id, type("Email"\|"Phone"\|"Text"\|"Portal"), direction("Incoming"\|"Outgoing"), matterId, contactId, contactName, subject, body, from, to, date, read, attachments[], createdAt}` |
| `notifications` | array | System notifications; each: `{id, type("task_due"\|"bill_overdue"\|"event_reminder"\|"matter_update"\|"document_shared"), title, message, referenceType, referenceId, read, createdAt}` |
| `timer` | object | Persistent timer: `{isRunning, startTime(epoch ms)\|null, elapsed(ms), matterId\|null, description, billable}` |
| `firmSettings` | object | `{firmName, address{street,city,state,zip,country}, phone, website, defaultBillingRate, defaultPaymentTerms(days), currency, dateFormat, timezone, practiceAreas[], activityCategories[]}` |
| `folders` | array | Document folders; each: `{id, name}` |
| `recentMatters` | array | Array of matter IDs (strings), most recent first, max 10 |
| `recentContacts` | array | Array of contact IDs (strings), most recent first, max 10 |

### Default IDs

**Users**: `user-1` (Sarah Chen, Senior Partner, Admin), `user-2` (Marcus Rivera, Associate), `user-3` (Emily Park, Paralegal), `user-4` (David Okafor, Legal Assistant)

**Contacts**: `contact-1` (Jane Grey, Client), `contact-2` (Robert Hartmann, Client), `contact-3` (Patricia Nguyen, Client), `contact-4` (Daniel Kim, Client), `contact-5` (James Whitfield, Opposing Counsel), `contact-6` (Rebecca Torres, Opposing Counsel), `contact-7` (Hon. Margaret Sullivan, Judge), `contact-8` (Dr. Thomas Adeyemi, Expert/Witness), `contact-9` (Hartmann Industries, Company/Client), `contact-10` (Whitfield & Associates, Company/Opposing Counsel), `contact-11` (Pacific Insurance Group, Company/Other), `contact-12` (BC Ministry of Justice, Company/Other)

**Matters**: `matter-1` (Open, Grey - Assault & Battery), `matter-2` (Open, Nguyen - Divorce Proceedings), `matter-3` (Open, Hartmann - Corporate Merger), `matter-4` (Open, Kim - Employment Wrongful Termination), `matter-5` (Pending, Grey - Slip and Fall), `matter-6` (Pending, Hartmann - Commercial Lease Dispute), `matter-7` (Pending, Nguyen - Child Custody), `matter-8` (Closed, Kim - Immigration PR), `matter-9` (Closed, Hartmann - Trademark), `matter-10` (Closed, Grey - Restraining Order)

**Bills**: `bill-1` through `bill-8` (mix of Draft, Awaiting Approval, Sent, Paid, Overdue)

**Folders**: `folder-1` (Discovery), `folder-2` (Correspondence), `folder-3` (Pleadings), `folder-4` (Evidence), `folder-5` (Administrative)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUserId": "user-1",
    "users": [
      {
        "id": "user-1", "name": "Sarah Chen", "email": "sarah.chen@meadowlaw.com",
        "role": "Attorney", "isAdmin": true, "subscriberType": "Attorney",
        "initials": "SC", "avatarColor": "#1A73E8", "hourlyRate": 350,
        "permissions": { "administrator": true, "accounts": true, "reports": true, "billing": true }
      }
    ],
    "contacts": [
      {
        "id": "contact-1", "type": "Person", "firstName": "Jane", "lastName": "Grey",
        "displayName": "Jane Grey", "email": "jane.grey@gmail.com", "phone": "778-555-9988",
        "tags": ["Client"], "address": { "street": "2370 Ottawa Street", "city": "Port Coquitlam", "state": "BC", "zip": "V3B 7Z1", "country": "Canada" },
        "customFields": {}, "billingInfo": { "ledesClientId": "", "paymentProfile": "Default (30 days)" },
        "createdAt": "2024-03-15T10:00:00Z", "updatedAt": "2025-01-20T14:30:00Z"
      }
    ],
    "matters": [
      {
        "id": "matter-1", "matterNumber": "00071-Grey-07.2021", "description": "Assault & Battery",
        "status": "Open", "clientId": "contact-1", "clientName": "Jane Grey",
        "practiceArea": "Criminal Law", "responsibleAttorneyId": "user-1",
        "responsibleAttorneyName": "Sarah Chen", "billingMethod": "Hourly", "hourlyRate": 350,
        "budget": 15000, "openDate": "2021-07-12", "relatedContacts": [], "tags": [],
        "stage": "Discovery", "createdAt": "2021-07-12T09:00:00Z", "updatedAt": "2025-02-15T11:00:00Z"
      }
    ],
    "activities": [],
    "tasks": [],
    "calendarEvents": [],
    "bills": [],
    "documents": [],
    "notes": [],
    "communications": [],
    "notifications": [],
    "timer": { "isRunning": false, "startTime": null, "elapsed": 0, "matterId": null, "description": "", "billable": true },
    "firmSettings": {
      "firmName": "Meadow Law Group",
      "address": { "street": "1200 Main Street, Suite 400", "city": "Vancouver", "state": "BC", "zip": "V6B 1A1", "country": "Canada" },
      "phone": "604-555-0100", "defaultBillingRate": 350, "defaultPaymentTerms": 30,
      "practiceAreas": ["Criminal Law", "Family Law", "Corporate"],
      "activityCategories": ["Document Review", "Research", "Court Appearance", "Drafting"]
    },
    "folders": [
      { "id": "folder-1", "name": "Discovery" }, { "id": "folder-2", "name": "Correspondence" }
    ],
    "recentMatters": [],
    "recentContacts": []
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Create new matter | `matters[]` — new entry appended |
| Edit matter (status/stage/attorney) | `matters[id].status`, `matters[id].stage`, `matters[id].responsibleAttorneyId`, `matters[id].updatedAt` |
| Delete matter | `matters[]` — entry removed |
| Bulk change matter status | `matters[id].status` for each selected matter |
| Create new contact | `contacts[]` — new entry appended |
| Edit contact | `contacts[id].{firstName,lastName,email,phone,tags,...}`, `contacts[id].updatedAt` |
| Delete contact | `contacts[]` — entry removed |
| Add time entry | `activities[]` — new `{type:"TimeEntry",...}` entry appended |
| Add expense entry | `activities[]` — new `{type:"ExpenseEntry",...}` entry appended |
| Update activity (billable toggle) | `activities[id].billable` |
| Create task | `tasks[]` — new entry appended |
| Toggle task complete | `tasks[id].status` (`"Outstanding"` ↔ `"Completed"`), `tasks[id].completedDate` |
| Edit task | `tasks[id].{name,dueDate,priority,assigneeId,...}`, `tasks[id].updatedAt` |
| Delete task | `tasks[]` — entry removed |
| Create calendar event | `calendarEvents[]` — new entry appended |
| Edit calendar event | `calendarEvents[id].{title,startDate,endDate,...}` |
| Delete calendar event | `calendarEvents[]` — entry removed |
| Generate bill | `bills[]` — new Draft bill appended; `activities[selectedIds].billed = true`, `activities[selectedIds].billId = newBillId` |
| Send bill | `bills[id].status = "Sent"`, `bills[id].updatedAt` |
| Record payment (partial) | `bills[id].amountPaid`, `bills[id].balance`, `bills[id].status` remains `"Sent"` |
| Record payment (full) | `bills[id].amountPaid = totalDue`, `bills[id].balance = 0`, `bills[id].status = "Paid"`, `bills[id].paidDate` |
| Void bill | `bills[id].status = "Void"`, `bills[id].updatedAt` |
| Add note | `notes[]` — new entry appended |
| Edit note | `notes[id].{subject,body}`, `notes[id].updatedAt` |
| Delete note | `notes[]` — entry removed |
| Add document | `documents[]` — new entry appended |
| Delete document | `documents[]` — entry removed |
| Add communication | `communications[]` — new entry appended |
| Delete communication | `communications[]` — entry removed |
| Mark notification read | `notifications[id].read = true` |
| Mark all notifications read | `notifications[].read = true` for all |
| Start timer | `timer.isRunning = true`, `timer.startTime` (epoch ms) |
| Pause timer | `timer.isRunning = false`, `timer.elapsed` (accumulated ms) |
| Stop timer | `timer.isRunning = false`, `timer.elapsed = 0`, `timer.startTime = null` |
| Set timer matter | `timer.matterId` |
| Set timer description | `timer.description` |
| View matter detail (any navigation to `/matters/:id`) | `recentMatters[]` — matter ID prepended, max 10 |
| View contact detail (any navigation to `/contacts/:id`) | `recentContacts[]` — contact ID prepended, max 10 |
| Update firm settings | `firmSettings.{firmName,address,phone,...}` |
| Update billing defaults | `firmSettings.{defaultBillingRate,defaultPaymentTerms,currency,...}` |
| Change matter stage (inline) | `matters[id].stage`, `matters[id].updatedAt` |
