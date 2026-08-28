# Xlio Manage Mock -- Data Model

All entities stored in localStorage via `dataManager.js`. The `createInitialData()` function returns the complete seed state.

---

## 1. Users

Represents firm members. The current logged-in user is `user-1`.

```js
{
  id: "user-1",
  name: "Sarah Chen",
  email: "sarah.chen@meadowlaw.com",
  role: "Attorney",           // "Attorney" | "Paralegal" | "Admin" | "Non-Attorney"
  isAdmin: true,
  subscriberType: "Attorney", // "Attorney" | "Non-Attorney"
  initials: "SC",
  avatarColor: "#1A73E8",
  hourlyRate: 350,            // default billing rate in dollars
  phone: "555-0101",
  jobTitle: "Senior Partner",
  groups: ["Family Law", "Criminal Law"],
  permissions: {
    administrator: true,
    accounts: true,
    reports: true,
    billing: true
  }
}
```

**Seed**: 4 users
- `user-1`: Sarah Chen (Senior Partner, Attorney) -- current user
- `user-2`: Marcus Rivera (Associate Attorney)
- `user-3`: Emily Park (Paralegal)
- `user-4`: David Okafor (Legal Assistant, Non-Attorney)

---

## 2. Contacts

People and companies. Every matter must be linked to at least one contact.

```js
{
  id: "contact-1",
  type: "Person",              // "Person" | "Company"
  prefix: "Ms.",
  firstName: "Jane",
  lastName: "Grey",
  displayName: "Jane Grey",    // computed or overridden
  companyId: null,             // link to Company contact if employee
  companyName: "",
  jobTitle: "",
  email: "jane.grey@gmail.com",
  emailSecondary: "",
  phone: "778-555-9988",
  phoneType: "Work",           // "Work" | "Mobile" | "Home"
  website: "",
  address: {
    street: "2370 Ottawa Street",
    city: "Port Coquitlam",
    state: "BC",
    zip: "V3B 7Z1",
    country: "Canada"
  },
  dateOfBirth: null,
  maritalStatus: "Single",
  tags: ["Client"],            // ["Client", "Opposing Counsel", "Judge", "Witness", "Expert", "Other"]
  customFields: {
    "Employed?": "Yes",
    "Preferred Contact Method": "Text"
  },
  billingInfo: {
    ledesClientId: "",
    paymentProfile: "Default (30 days)"
  },
  createdAt: "2024-03-15T10:00:00Z",
  updatedAt: "2025-01-20T14:30:00Z"
}
```

**Seed**: 12 contacts
- 8 Person contacts (mix of clients, opposing counsel, a judge, a witness)
- 4 Company contacts (a law firm, an insurance company, a business client, a government agency)

---

## 3. Matters

Legal cases/engagements. Always linked to a primary contact (client).

```js
{
  id: "matter-1",
  matterNumber: "00071-Grey-07.2021",   // formatted: NNNNN-ClientLastName-MM.YYYY
  description: "Assault & Battery",
  status: "Open",                        // "Open" | "Pending" | "Closed"
  clientId: "contact-1",                 // primary contact
  clientName: "Jane Grey",
  practiceArea: "Criminal Law",          // "Criminal Law" | "Family Law" | "Personal Injury" | "Corporate" | "Immigration" | "Real Estate" | "Employment"
  responsibleAttorneyId: "user-1",
  responsibleAttorneyName: "Sarah Chen",
  originatingAttorneyId: "user-1",
  billingMethod: "Hourly",              // "Hourly" | "Flat Fee" | "Contingency"
  hourlyRate: 350,
  budget: 15000,
  openDate: "2021-07-12",
  closeDate: null,
  pendingDate: null,
  statuteOfLimitations: "2024-07-12",
  courtName: "Provincial Court of British Columbia",
  caseNumber: "CR-2021-4455",
  stage: "Discovery",                   // "Intake" | "Filing" | "Discovery" | "Negotiation" | "Trial" | "Appeal" | "Closed"
  relatedContacts: [
    { contactId: "contact-5", role: "Opposing Counsel" },
    { contactId: "contact-8", role: "Judge" }
  ],
  tags: ["Active Litigation"],
  notes: "",
  createdAt: "2021-07-12T09:00:00Z",
  updatedAt: "2025-02-15T11:00:00Z"
}
```

**Seed**: 10 matters
- 4 Open (various practice areas)
- 3 Pending
- 3 Closed

---

## 4. Activities (Time Entries & Expenses)

Tracks billable and non-billable work.

```js
// Time Entry
{
  id: "activity-1",
  type: "TimeEntry",           // "TimeEntry" | "ExpenseEntry"
  matterId: "matter-1",
  matterDescription: "Grey - Assault & Battery",
  userId: "user-1",
  userName: "Sarah Chen",
  date: "2025-03-10",
  description: "Review discovery documents and prepare interrogatories",
  duration: 2.5,              // hours (decimal)
  rate: 350,                  // dollars per hour
  total: 875,                 // computed: duration * rate
  billable: true,
  billed: false,              // true if included in a bill
  billId: null,
  category: "Document Review", // activity description/category
  createdAt: "2025-03-10T14:00:00Z"
}

// Expense Entry
{
  id: "activity-20",
  type: "ExpenseEntry",
  matterId: "matter-1",
  matterDescription: "Grey - Assault & Battery",
  userId: "user-1",
  userName: "Sarah Chen",
  date: "2025-03-08",
  description: "Court filing fee",
  quantity: 1,
  rate: 200,
  total: 200,
  billable: true,
  billed: false,
  billId: null,
  category: "Filing Fees",
  createdAt: "2025-03-08T09:00:00Z"
}
```

**Seed**: 30 time entries + 8 expense entries
- Spread across multiple matters and users
- Mix of billed and unbilled
- Various categories: Document Review, Research, Court Appearance, Client Communication, Drafting, Travel, Filing Fees, Copying, Expert Fees

---

## 5. Tasks

To-do items optionally linked to matters.

```js
{
  id: "task-1",
  name: "File motion for discovery extension",
  description: "Draft and file motion requesting 30-day extension for discovery deadline",
  matterId: "matter-1",
  matterDescription: "Grey - Assault & Battery",
  assigneeId: "user-1",
  assigneeName: "Sarah Chen",
  assignerId: "user-1",
  priority: "High",           // "High" | "Normal" | "Low"
  status: "Outstanding",      // "Outstanding" | "Completed"
  dueDate: "2025-04-15",
  completedDate: null,
  taskListId: "tasklist-1",
  taskListName: "Litigation Prep",
  isPrivate: false,
  createdAt: "2025-03-01T10:00:00Z",
  updatedAt: "2025-03-01T10:00:00Z"
}
```

**Seed**: 15 tasks
- 10 Outstanding (various priorities, some overdue)
- 5 Completed

---

## 6. Calendar Events

Scheduled events linked to matters.

```js
{
  id: "event-1",
  title: "Grey - Preliminary Hearing",
  description: "Preliminary hearing at Provincial Court",
  matterId: "matter-1",
  matterDescription: "Grey - Assault & Battery",
  location: "Provincial Court, Room 302",
  startDate: "2025-04-20T09:00:00",
  endDate: "2025-04-20T11:00:00",
  allDay: false,
  attendees: ["user-1", "user-3"],
  reminderMinutes: 60,        // reminder before event
  color: "#1A73E8",
  recurrence: null,            // null | "daily" | "weekly" | "monthly"
  createdAt: "2025-03-15T08:00:00Z"
}
```

**Seed**: 12 calendar events
- Spread across the next 2 months
- Mix of court dates, client meetings, deadlines, internal meetings
- Some all-day events, some timed

---

## 7. Bills

Invoices generated from time/expense entries.

```js
{
  id: "bill-1",
  billNumber: "INV-2025-001",
  matterId: "matter-1",
  matterDescription: "Grey - Assault & Battery",
  clientId: "contact-1",
  clientName: "Jane Grey",
  status: "Draft",            // "Draft" | "Awaiting Approval" | "Sent" | "Paid" | "Overdue" | "Void"
  issuedDate: "2025-03-01",
  dueDate: "2025-03-31",
  paidDate: null,
  subtotal: 4375,
  taxRate: 0,
  taxAmount: 0,
  totalDue: 4375,
  amountPaid: 0,
  balance: 4375,
  lineItems: [
    { activityId: "activity-1", description: "Review discovery documents...", hours: 2.5, rate: 350, amount: 875 },
    { activityId: "activity-2", description: "Prepare interrogatories", hours: 3.0, rate: 350, amount: 1050 },
    { activityId: "activity-3", description: "Client meeting re: case strategy", hours: 1.5, rate: 350, amount: 525 },
    { activityId: "activity-20", description: "Court filing fee", quantity: 1, rate: 200, amount: 200 }
  ],
  memo: "For legal services rendered in March 2025",
  createdAt: "2025-03-01T12:00:00Z",
  updatedAt: "2025-03-01T12:00:00Z"
}
```

**Seed**: 8 bills
- 2 Draft
- 1 Awaiting Approval
- 2 Sent
- 2 Paid
- 1 Overdue

---

## 8. Documents

File metadata (no real files stored).

```js
{
  id: "doc-1",
  name: "Grey_Discovery_Request.pdf",
  type: "application/pdf",     // MIME type
  size: 245000,                // bytes
  matterId: "matter-1",
  matterDescription: "Grey - Assault & Battery",
  folderId: "folder-1",
  folderName: "Discovery",
  uploadedBy: "user-1",
  uploadedByName: "Sarah Chen",
  category: "Court Filing",    // "Court Filing" | "Correspondence" | "Contract" | "Evidence" | "Memo" | "Template" | "Other"
  description: "Initial discovery request filed with court",
  version: 1,
  createdAt: "2025-02-10T14:00:00Z",
  updatedAt: "2025-02-10T14:00:00Z"
}
```

**Seed**: 15 documents across 5 matters, with folders: Discovery, Correspondence, Pleadings, Evidence, Administrative

---

## 9. Notes

Text notes on matters.

```js
{
  id: "note-1",
  matterId: "matter-1",
  matterDescription: "Grey - Assault & Battery",
  subject: "Initial case assessment",
  body: "Met with client Jane Grey to discuss assault charges. Client claims self-defense...",
  authorId: "user-1",
  authorName: "Sarah Chen",
  isPrivate: false,
  createdAt: "2021-07-12T15:00:00Z",
  updatedAt: "2021-07-12T15:00:00Z"
}
```

**Seed**: 10 notes across various matters

---

## 10. Communications

Email/message log entries linked to matters.

```js
{
  id: "comm-1",
  type: "Email",               // "Email" | "Phone" | "Text" | "Portal"
  direction: "Outgoing",       // "Incoming" | "Outgoing"
  matterId: "matter-1",
  contactId: "contact-1",
  contactName: "Jane Grey",
  subject: "Case Update - Discovery Phase",
  body: "Dear Ms. Grey, I wanted to update you on the progress of your case...",
  from: "sarah.chen@meadowlaw.com",
  to: "jane.grey@gmail.com",
  date: "2025-03-05T10:30:00Z",
  read: true,
  attachments: [],
  createdAt: "2025-03-05T10:30:00Z"
}
```

**Seed**: 12 communications across matters

---

## 11. Notifications

System notifications for the current user.

```js
{
  id: "notif-1",
  type: "task_due",            // "task_due" | "bill_overdue" | "event_reminder" | "matter_update" | "document_shared"
  title: "Task due tomorrow",
  message: "File motion for discovery extension is due tomorrow",
  referenceType: "task",       // "task" | "bill" | "matter" | "event" | "document"
  referenceId: "task-1",
  read: false,
  createdAt: "2025-04-10T08:00:00Z"
}
```

**Seed**: 8 notifications (4 unread)

---

## 12. Timer State

Persistent timer state for the top bar timer.

```js
{
  isRunning: false,
  startTime: null,
  elapsed: 0,                  // milliseconds
  matterId: null,
  description: "",
  billable: true
}
```

---

## 13. Firm Settings

```js
{
  firmName: "Meadow Law Group",
  address: {
    street: "1200 Main Street, Suite 400",
    city: "Vancouver",
    state: "BC",
    zip: "V6B 1A1",
    country: "Canada"
  },
  phone: "604-555-0100",
  website: "www.meadowlaw.com",
  defaultBillingRate: 350,
  defaultPaymentTerms: 30,      // days
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  timezone: "America/Vancouver",
  practiceAreas: ["Criminal Law", "Family Law", "Personal Injury", "Corporate", "Immigration", "Real Estate", "Employment"],
  activityCategories: ["Document Review", "Research", "Court Appearance", "Client Communication", "Drafting", "Travel", "Administrative", "Filing Fees", "Copying", "Expert Fees"]
}
```

---

## Relationships Summary

```
User (1) --> (N) Matters (as responsible attorney)
User (1) --> (N) Activities (as time/expense author)
User (1) --> (N) Tasks (as assignee)
Contact (1) --> (N) Matters (as client)
Matter (1) --> (N) Activities
Matter (1) --> (N) Tasks
Matter (1) --> (N) CalendarEvents
Matter (1) --> (N) Bills
Matter (1) --> (N) Documents
Matter (1) --> (N) Notes
Matter (1) --> (N) Communications
Matter (N) --> (N) Contacts (via relatedContacts)
Bill (1) --> (N) Activities (via lineItems)
Document (N) --> (1) Folder
```

---

## createInitialData() Structure

```js
export function createInitialData() {
  return {
    users: [...],
    currentUserId: "user-1",
    contacts: [...],
    matters: [...],
    activities: [...],
    tasks: [...],
    calendarEvents: [...],
    bills: [...],
    documents: [...],
    notes: [...],
    communications: [...],
    notifications: [...],
    timer: { isRunning: false, startTime: null, elapsed: 0, matterId: null, description: "", billable: true },
    firmSettings: {...},
    folders: [
      { id: "folder-1", name: "Discovery" },
      { id: "folder-2", name: "Correspondence" },
      { id: "folder-3", name: "Pleadings" },
      { id: "folder-4", name: "Evidence" },
      { id: "folder-5", name: "Administrative" }
    ]
  };
}
```
