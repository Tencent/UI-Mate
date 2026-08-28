# XocuSign Mock — Data Model

## Entity Overview

```
User (current logged-in user)
├── Envelopes[] (the core entity — contains documents sent for signing)
│   ├── Documents[] (files within the envelope)
│   ├── Recipients[] (people who receive the envelope)
│   └── Fields[] (signature, text, date fields placed on documents)
├── Templates[] (reusable envelope configurations)
│   ├── Roles[] (placeholder recipients)
│   └── Fields[] (pre-placed fields)
├── Folders[] (custom folders for organizing envelopes)
├── Contacts[] (address book of recipients)
└── AuditLog[] (activity history)
```

---

## Entity Definitions

### User
```js
{
  id: "user_1",                          // String, unique ID
  name: "Sarah Chen",                     // String, full name
  email: "sarah.chen@acmecorp.com",       // String, email
  title: "VP of Operations",              // String, job title
  company: "Acme Corporation",            // String, company name
  avatar: "/avatars/sarah.jpg",           // String, avatar URL (use picsum for mock)
  signatureDataUrl: null,                 // String|null, adopted signature as data URL
  initialsDataUrl: null,                  // String|null, adopted initials as data URL
  memberSince: "2021-03-15",             // String, ISO date
  settings: {
    defaultReminderDays: 3,              // Number, days before auto-reminder
    defaultExpirationDays: 120,          // Number, days until envelope expires
    timezone: "America/Los_Angeles"       // String
  }
}
```

### Envelope
The central entity in XocuSign. An envelope is a container for documents that get sent to recipients for signing.

```js
{
  id: "env_1",                            // String, UUID
  subject: "Acme Corp - NDA Agreement",   // String, envelope subject line
  message: "Please review and sign...",   // String, email message to recipients
  status: "sent",                         // String enum — see Status Codes below
  createdAt: "2025-01-15T10:30:00Z",     // String, ISO timestamp
  sentAt: "2025-01-15T10:35:00Z",        // String|null, when sent
  completedAt: null,                      // String|null, when all recipients finished
  voidedAt: null,                         // String|null, when voided
  declinedAt: null,                       // String|null, when declined by a recipient
  lastActivityAt: "2025-01-16T09:00:00Z",// String, most recent activity timestamp
  expiresAt: "2025-05-15T10:35:00Z",     // String|null, expiration date
  senderId: "user_1",                     // String, who sent this envelope
  folderId: null,                         // String|null, custom folder ID if moved
  documents: [/* Document[] */],          // Array of Document objects
  recipients: [/* Recipient[] */],        // Array of Recipient objects
  fields: [/* Field[] */],                // Array of Field objects
  history: [/* HistoryEvent[] */],        // Array of timeline events
  templateId: null,                       // String|null, if created from a template
  reminderEnabled: true,                  // Boolean
  reminderDays: 3,                        // Number, days between reminders
  reminderFrequency: 2                    // Number, total reminders to send
}
```

#### Envelope Status Codes
| Status | Description |
|--------|-------------|
| `"draft"` | Created but not yet sent |
| `"sent"` | Sent to recipients, not yet delivered |
| `"delivered"` | Delivered to at least one recipient |
| `"signed"` | At least one recipient has signed, but not all |
| `"completed"` | All recipients have completed their actions |
| `"voided"` | Sender canceled the envelope |
| `"declined"` | A recipient declined to sign |
| `"expired"` | Past its expiration date without completion |

### Document
A file within an envelope.

```js
{
  id: "doc_1",                            // String, UUID
  name: "NDA_Agreement.pdf",              // String, file name
  pageCount: 3,                           // Number, number of pages
  order: 1,                               // Number, display order
  fileUrl: "https://picsum.photos/...",   // String, mock document image URL
  fileType: "pdf"                         // String: "pdf" | "docx" | "png"
}
```

### Recipient
A person who receives the envelope to sign, review, or receive a copy.

```js
{
  id: "rec_1",                            // String, UUID
  name: "Bob Johnson",                    // String, full name
  email: "bob@partnercorp.com",           // String, email address
  role: "signer",                         // String enum — see Recipient Roles below
  routingOrder: 1,                        // Number, signing order (1 = first)
  status: "sent",                         // String enum — see Recipient Status below
  signedAt: null,                         // String|null, when they signed
  viewedAt: null,                         // String|null, when they first viewed
  deliveredAt: "2025-01-15T10:36:00Z",   // String|null, when delivered
  declinedAt: null,                       // String|null, when declined
  declineReason: null                     // String|null, reason for declining
}
```

#### Recipient Roles
| Role | Description |
|------|-------------|
| `"signer"` | Must sign the document (default) |
| `"cc"` | Receives a copy (carbon copy), no action needed |
| `"editor"` | Can edit the envelope before signing |
| `"inPersonSigner"` | Signs in person on sender's device |

#### Recipient Status Codes
| Status | Description |
|--------|-------------|
| `"created"` | Added to envelope but not yet sent |
| `"sent"` | Notification sent |
| `"delivered"` | Opened the email/notification |
| `"signed"` | Completed signing |
| `"declined"` | Declined to sign |
| `"faxPending"` | (For mock: not used) |

### Field
A form field placed on a document for a recipient to fill.

```js
{
  id: "field_1",                          // String, UUID
  type: "signature",                      // String enum — see Field Types below
  recipientId: "rec_1",                   // String, which recipient fills this
  documentId: "doc_1",                    // String, which document it's on
  pageNumber: 1,                          // Number, 1-based page number
  x: 350,                                // Number, x position (px from left)
  y: 680,                                // Number, y position (px from top)
  width: 200,                             // Number, field width in px
  height: 50,                             // Number, field height in px
  value: "",                              // String, filled value (data URL for signatures)
  required: true,                         // Boolean
  label: "",                              // String, optional label/tooltip
  readOnly: false,                        // Boolean, if recipient can edit
  fontSize: 14,                           // Number, for text fields
  fontColor: "#000000"                    // String, hex color
}
```

#### Field Types
| Type | Description | Default Size |
|------|-------------|-------------|
| `"signature"` | Full signature pad | 200x50 |
| `"initial"` | Initials pad | 80x40 |
| `"dateSigned"` | Auto-fills with signing date | 120x30 |
| `"name"` | Auto-fills with recipient's full name | 150x30 |
| `"email"` | Auto-fills with recipient's email | 180x30 |
| `"company"` | Auto-fills with recipient's company | 150x30 |
| `"title"` | Auto-fills with recipient's job title | 150x30 |
| `"text"` | Free text input | 150x30 |
| `"checkbox"` | Checkable box | 20x20 |
| `"dropdown"` | Select from predefined options | 150x30 |
| `"radioGroup"` | Radio button group | 20x20 each |

### Template
A reusable envelope configuration.

```js
{
  id: "tmpl_1",                           // String, UUID
  name: "Standard NDA",                   // String, template name
  description: "Non-disclosure agreement for new partners", // String
  createdAt: "2024-06-01T12:00:00Z",     // String, ISO timestamp
  lastUsedAt: "2025-01-10T14:00:00Z",    // String|null
  usageCount: 15,                         // Number, times used
  ownerId: "user_1",                      // String, who created it
  shared: true,                           // Boolean, shared with org
  documents: [/* Document[] */],          // Array of Document objects
  roles: [/* TemplateRole[] */],          // Placeholder recipients
  fields: [/* Field[] with roleId instead of recipientId */]
}
```

### TemplateRole
```js
{
  id: "role_1",                           // String, UUID
  name: "Signer 1",                       // String, role name (placeholder)
  role: "signer",                         // String, same enum as Recipient.role
  routingOrder: 1                         // Number
}
```

### Folder
Custom folder for organizing envelopes.

```js
{
  id: "folder_1",                         // String, UUID
  name: "Q1 Contracts",                   // String
  parentFolder: null,                     // String|null, for nesting (optional)
  createdAt: "2025-01-01T00:00:00Z"      // String
}
```

### Contact
Address book entry.

```js
{
  id: "contact_1",                        // String, UUID
  name: "Alice Williams",                 // String
  email: "alice@partnercorp.com",         // String
  company: "Partner Corp",               // String|null
  title: "Legal Counsel"                  // String|null
}
```

### HistoryEvent
Timeline event on an envelope.

```js
{
  id: "evt_1",                            // String, UUID
  timestamp: "2025-01-15T10:30:00Z",     // String, ISO
  action: "created",                      // String enum: "created"|"sent"|"delivered"|"viewed"|"signed"|"completed"|"voided"|"declined"|"corrected"|"resent"
  actorName: "Sarah Chen",               // String, who did it
  actorEmail: "sarah.chen@acmecorp.com", // String
  details: "Envelope created"            // String, human-readable description
}
```

### AuditLog (Global)
Application-wide activity log for /go endpoint.

```js
{
  id: "audit_1",                          // String, UUID
  timestamp: "2025-01-15T10:30:00Z",     // String
  action: "CREATE_ENVELOPE",              // String, action type
  details: "Created envelope env_1",      // String
  envelopeId: "env_1"                    // String|null
}
```

---

## createInitialData() Structure

```js
export function getDefaultState() {
  return {
    user: { /* User object for Sarah Chen */ },
    envelopes: [
      // 2 drafts, 3 sent/waiting, 2 completed, 1 voided, 1 declined = 9 envelopes
      // See Seed Data section below
    ],
    templates: [
      // 3-4 templates: NDA, Employment Agreement, Sales Contract, Lease Agreement
    ],
    folders: [
      // 2 custom folders: "Q1 Contracts", "HR Documents"
    ],
    contacts: [
      // 6-8 contacts representing common recipients
    ],
    auditLog: [
      // Pre-populated with ~15 events corresponding to envelope history
    ]
  };
}
```

---

## Seed Data Scenarios

The mock needs realistic envelopes at various stages to enable agent training:

### Envelopes (9 total)

1. **Draft — Sales Agreement** (`draft`): Has 1 document, 2 recipients added but no fields placed yet. Agent can practice placing fields.

2. **Draft — Consulting Contract** (`draft`): Has 1 document, 0 recipients. Agent can practice the full prepare flow.

3. **Sent — NDA Agreement** (`sent`): 1 document, 2 signers (sequential order), first signer has viewed but not signed. 6 fields placed.

4. **Delivered — Vendor Agreement** (`delivered`): 2 documents, 1 signer, delivered and viewed. 4 fields.

5. **Partially Signed — Partnership Agreement** (`signed`): 1 document, 3 signers, first has signed, second is pending. 8 fields (some filled).

6. **Completed — Employment Offer** (`completed`): 1 document, 1 signer, fully signed with all fields filled. Complete history timeline.

7. **Completed — Lease Agreement** (`completed`): 2 documents, 2 signers (both signed). All fields filled.

8. **Voided — Old Proposal** (`voided`): Was sent but voided by sender before completion.

9. **Declined — Service Agreement** (`declined`): Recipient declined with reason "Terms not acceptable".

### Templates (4 total)
1. Standard NDA (2 signers, 6 fields, shared)
2. Employment Agreement (1 signer + 1 CC, 8 fields, shared)
3. Sales Contract (2 signers, 10 fields, shared)
4. Lease Agreement (2 signers, 12 fields, private)

### Contacts (8 total)
Mix of names representing common business contacts across different companies.

### Folders (2 custom)
1. "Q1 2025 Contracts" — linked to 2 completed envelopes
2. "HR Documents" — linked to 1 completed envelope
