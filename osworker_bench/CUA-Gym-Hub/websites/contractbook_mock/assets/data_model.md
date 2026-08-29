# Xontractbook Mock -- Data Model

This document defines all entity types, their fields, relationships, and example values for the `dataManager.js` `createInitialData()` function.

---

## 1. Current User

The app starts pre-logged-in as a default user.

```js
currentUser: {
  id: "user-1",
  firstName: "Sarah",
  lastName: "Chen",
  email: "sarah.chen@acmecorp.com",
  avatar: null, // initials-based avatar "SC"
  role: "admin", // "admin" | "member" | "viewer"
  company: "Acme Corporation",
  jobTitle: "Head of Legal",
  phone: "+1 (555) 234-5678",
  timezone: "America/New_York",
  notifications: {
    email: true,
    inApp: true,
    signingReminders: true,
    expirationAlerts: true
  }
}
```

---

## 2. Users / Team Members

Other users in the workspace.

| Field | Type | Example |
|-------|------|---------|
| id | string | "user-2" |
| firstName | string | "James" |
| lastName | string | "Wilson" |
| email | string | "james.wilson@acmecorp.com" |
| avatar | string/null | null |
| role | enum | "member" |
| jobTitle | string | "Contract Manager" |
| status | enum | "active" / "invited" / "deactivated" |

Example records (5 team members):
- user-2: James Wilson, james.wilson@acmecorp.com, Contract Manager, member
- user-3: Emily Rodriguez, emily.r@acmecorp.com, Legal Counsel, member
- user-4: Michael Park, michael.park@acmecorp.com, CEO, admin
- user-5: Lisa Thompson, lisa.t@acmecorp.com, Operations Lead, member
- user-6: David Kim, david.kim@acmecorp.com, Finance Director, viewer

---

## 3. Contacts (External Parties / Signatories)

People outside the organization who are counterparties to contracts.

| Field | Type | Example |
|-------|------|---------|
| id | string | "contact-1" |
| firstName | string | "Robert" |
| lastName | string | "Martinez" |
| email | string | "robert@techventures.io" |
| company | string | "Tech Ventures Inc." |
| jobTitle | string | "CEO" |
| phone | string | "+1 (555) 987-6543" |
| notes | string | "Preferred contact method: email" |
| createdAt | ISO date | "2024-08-15T10:00:00Z" |
| updatedAt | ISO date | "2024-11-20T14:30:00Z" |

Example records (8 contacts):
- contact-1: Robert Martinez, CEO, Tech Ventures Inc.
- contact-2: Anna Johansson, COO, Nordic Solutions AB
- contact-3: Tom Bradley, Head of Procurement, GlobalTech Ltd.
- contact-4: Maria Santos, Legal Director, Santos & Partners
- contact-5: Chen Wei, VP Engineering, Shenzhen Digital Co.
- contact-6: Sophie Laurent, Managing Partner, Laurent Consulting
- contact-7: Raj Patel, CTO, CloudBase Systems
- contact-8: Karen O'Brien, HR Director, Emerald Group

---

## 4. Folders

Hierarchical folder structure for organizing contracts.

| Field | Type | Example |
|-------|------|---------|
| id | string | "folder-1" |
| name | string | "Client Agreements" |
| parentId | string/null | null (root) |
| color | string | "#1C00FF" |
| createdAt | ISO date | "2024-01-10T08:00:00Z" |
| createdBy | string | "user-1" |

Example structure:
- folder-1: Client Agreements (root)
  - folder-2: Enterprise Clients (parent: folder-1)
  - folder-3: SMB Clients (parent: folder-1)
- folder-4: Vendor Contracts (root)
- folder-5: Employment (root)
  - folder-6: Offer Letters (parent: folder-5)
  - folder-7: NDAs (parent: folder-5)
- folder-8: Partnerships (root)

---

## 5. Tags

Labels that can be applied to contracts for categorization.

| Field | Type | Example |
|-------|------|---------|
| id | string | "tag-1" |
| name | string | "High Priority" |
| color | string | "#EF4444" |

Example tags:
- tag-1: "High Priority" (#EF4444, red)
- tag-2: "Auto-Renew" (#F59E0B, amber)
- tag-3: "Confidential" (#8B5CF6, purple)
- tag-4: "Revenue" (#10B981, green)
- tag-5: "Legal Review" (#3B82F6, blue)
- tag-6: "Urgent" (#EF4444, red)

---

## 6. Contracts

The central entity. Each contract has content, parties, signees, and status tracking.

| Field | Type | Example |
|-------|------|---------|
| id | string | "contract-1" |
| title | string | "Master Service Agreement - Tech Ventures" |
| status | enum | "draft" / "pending" / "signed" / "rejected" / "expired" |
| content | string (HTML) | Rich text HTML content of the contract body |
| folderId | string/null | "folder-2" |
| templateId | string/null | "template-1" (if created from template) |
| tags | string[] | ["tag-1", "tag-4"] |
| parties | Party[] | See Party sub-object below |
| createdAt | ISO date | "2024-09-15T09:30:00Z" |
| updatedAt | ISO date | "2024-12-01T11:00:00Z" |
| createdBy | string | "user-1" |
| expiresAt | ISO date/null | "2025-09-15T00:00:00Z" |
| signedAt | ISO date/null | "2024-11-20T16:45:00Z" |
| sentAt | ISO date/null | "2024-11-15T10:00:00Z" |
| value | number/null | 150000 (contract monetary value) |
| currency | string | "USD" |
| renewalDate | ISO date/null | "2025-09-01T00:00:00Z" |
| notes | string | "Annual renewal with 30-day notice" |

### Party Sub-Object

| Field | Type | Example |
|-------|------|---------|
| id | string | "party-1" |
| name | string | "Acme Corporation" |
| type | enum | "internal" / "external" |
| signees | Signee[] | See below |

### Signee Sub-Object

| Field | Type | Example |
|-------|------|---------|
| id | string | "signee-1" |
| contactId | string/null | "contact-1" (external) or null (internal) |
| userId | string/null | "user-1" (internal) or null (external) |
| name | string | "Sarah Chen" |
| email | string | "sarah.chen@acmecorp.com" |
| role | string | "Authorized Signatory" |
| signedAt | ISO date/null | "2024-11-18T14:00:00Z" |
| status | enum | "pending" / "signed" / "rejected" / "not_sent" |
| order | number | 1 (signing order) |

Example contracts (12 contracts across all statuses):

**Draft contracts (3):**
- contract-1: "SaaS License Agreement - CloudBase" (draft, folder-2, tag: Legal Review)
- contract-2: "Employment Offer - Senior Developer" (draft, folder-6, tag: Urgent)
- contract-3: "Consulting Agreement - Laurent" (draft, folder-8)

**Pending/Sent contracts (3):**
- contract-4: "Master Service Agreement - Tech Ventures" (pending, folder-2, tags: High Priority, Revenue), sent 3 days ago, 1 of 2 signees signed
- contract-5: "NDA - Nordic Solutions" (pending, folder-7, tag: Confidential), sent 1 day ago, 0 of 2 signees signed
- contract-6: "Vendor Agreement - GlobalTech" (pending, folder-4), sent 5 days ago, 1 of 2 signees signed

**Signed contracts (4):**
- contract-7: "Annual Support Contract - Emerald Group" (signed, folder-2, tags: Auto-Renew, Revenue), signed 2 weeks ago, value $75,000
- contract-8: "Partnership Agreement - Santos & Partners" (signed, folder-8, tag: Revenue), signed 1 month ago, value $200,000
- contract-9: "Office Lease Agreement" (signed, folder-4), signed 3 months ago
- contract-10: "Employee NDA - Michael Park" (signed, folder-7, tag: Confidential), signed 6 months ago

**Rejected contracts (1):**
- contract-11: "Software Development Contract - Shenzhen Digital" (rejected, folder-2), rejected 1 week ago with reason "Terms not acceptable"

**Expired contracts (1):**
- contract-12: "Maintenance Agreement - Old Vendor" (expired, folder-4, tag: Auto-Renew), expired 2 weeks ago

---

## 7. Templates

Reusable contract templates.

| Field | Type | Example |
|-------|------|---------|
| id | string | "template-1" |
| title | string | "Master Service Agreement" |
| description | string | "Standard MSA for client engagements" |
| content | string (HTML) | Rich text HTML template content with placeholders |
| category | string | "Service Agreements" |
| language | string | "English" |
| tags | string[] | ["tag-4"] |
| usageCount | number | 12 |
| createdAt | ISO date | "2024-03-01T10:00:00Z" |
| updatedAt | ISO date | "2024-10-15T14:00:00Z" |
| createdBy | string | "user-1" |
| isDefault | boolean | false |

Example templates (8):
- template-1: "Master Service Agreement" (Service Agreements, English, used 12 times)
- template-2: "Non-Disclosure Agreement" (NDAs, English, used 24 times)
- template-3: "Employment Offer Letter" (Employment, English, used 8 times)
- template-4: "Vendor Agreement" (Procurement, English, used 6 times)
- template-5: "Consulting Agreement" (Service Agreements, English, used 15 times)
- template-6: "Software License Agreement" (Licensing, English, used 9 times)
- template-7: "Partnership Agreement" (Partnerships, English, used 3 times)
- template-8: "Lease Agreement" (Real Estate, English, used 2 times)

---

## 8. Tasks

Task items associated with contracts or standalone.

| Field | Type | Example |
|-------|------|---------|
| id | string | "task-1" |
| title | string | "Review MSA terms for Tech Ventures" |
| description | string | "Check indemnification clause" |
| type | enum | "approval" / "renewal" / "review" |
| status | enum | "pending" / "completed" / "overdue" |
| contractId | string/null | "contract-4" |
| assigneeId | string | "user-1" |
| createdBy | string | "user-3" |
| dueDate | ISO date | "2024-12-20T00:00:00Z" |
| completedAt | ISO date/null | null |
| createdAt | ISO date | "2024-12-10T09:00:00Z" |

Example tasks (6):
- task-1: "Review MSA terms for Tech Ventures" (review, pending, assigned to user-1, due in 3 days)
- task-2: "Approve employment offer" (approval, pending, assigned to user-4, due tomorrow)
- task-3: "Renew Emerald Group support contract" (renewal, pending, assigned to user-1, due in 2 weeks)
- task-4: "Legal review of NDA template" (review, completed, assigned to user-3, completed 1 week ago)
- task-5: "Approve vendor agreement changes" (approval, overdue, assigned to user-1, was due 2 days ago)
- task-6: "Review partnership terms" (review, completed, assigned to user-1, completed 3 days ago)

---

## 9. Activity Log

Audit trail entries per contract.

| Field | Type | Example |
|-------|------|---------|
| id | string | "activity-1" |
| contractId | string | "contract-4" |
| type | enum | "created" / "edited" / "sent" / "viewed" / "signed" / "rejected" / "commented" / "status_changed" / "reminder_sent" |
| userId | string/null | "user-1" |
| contactId | string/null | null |
| description | string | "Sarah Chen created this contract" |
| timestamp | ISO date | "2024-11-10T09:30:00Z" |
| metadata | object/null | { field: "title", oldValue: "Draft MSA", newValue: "MSA - Tech Ventures" } |

Each contract should have 3-8 activity entries showing its lifecycle.

---

## 10. Notifications

In-app notification items.

| Field | Type | Example |
|-------|------|---------|
| id | string | "notif-1" |
| type | enum | "signature_received" / "contract_viewed" / "task_assigned" / "contract_expired" / "reminder" / "comment" |
| title | string | "Robert Martinez signed MSA" |
| description | string | "Tech Ventures MSA has been signed by Robert Martinez" |
| contractId | string/null | "contract-4" |
| read | boolean | false |
| createdAt | ISO date | "2024-12-15T14:30:00Z" |

Example notifications (8, mix of read/unread):
- notif-1: "Robert Martinez viewed your contract" (contract_viewed, unread, 2 hours ago)
- notif-2: "Anna Johansson signed NDA" (signature_received, unread, 5 hours ago)
- notif-3: "New task assigned: Approve employment offer" (task_assigned, unread, 1 day ago)
- notif-4: "Contract expired: Maintenance Agreement" (contract_expired, read, 2 days ago)
- notif-5: "Reminder: Emerald Group contract renewal in 2 weeks" (reminder, read, 3 days ago)
- notif-6: "Tom Bradley rejected Vendor Agreement" (signature_received, read, 1 week ago)
- notif-7: "Emily Rodriguez commented on MSA" (comment, read, 1 week ago)
- notif-8: "Signing reminder sent to Chen Wei" (reminder, read, 2 weeks ago)

---

## 11. Comments

Comments on contracts (internal discussion).

| Field | Type | Example |
|-------|------|---------|
| id | string | "comment-1" |
| contractId | string | "contract-4" |
| userId | string | "user-3" |
| content | string | "I think we should revise the payment terms in section 4." |
| createdAt | ISO date | "2024-12-14T10:00:00Z" |
| updatedAt | ISO date/null | null |
| resolved | boolean | false |

---

## 12. Saved Views

Custom filtered views of the contracts list.

| Field | Type | Example |
|-------|------|---------|
| id | string | "view-1" |
| name | string | "My Drafts" |
| filters | object | { status: ["draft"], createdBy: "user-1" } |
| sortBy | string | "updatedAt" |
| sortOrder | string | "desc" |
| columns | string[] | ["title", "status", "updatedAt", "tags"] |
| isDefault | boolean | false |
| createdBy | string | "user-1" |

Example views:
- view-1: "All Documents" (default, no filters)
- view-2: "My Drafts" (status: draft, createdBy: currentUser)
- view-3: "Pending Signatures" (status: pending)
- view-4: "Expiring Soon" (expiresAt within 30 days)
- view-5: "High Value" (value > 100000)

---

## Relationships Summary

```
User (team member) --creates--> Contract
User --is assigned--> Task
User --authors--> Comment
Contact (external) --is signee on--> Contract
Contract --belongs to--> Folder
Contract --has many--> Tags
Contract --created from--> Template
Contract --has many--> Party --has many--> Signee
Contract --has many--> Activity
Contract --has many--> Comment
Task --references--> Contract
Notification --references--> Contract
```

## createInitialData() Structure

```js
export function createInitialData() {
  return {
    currentUser: { ... },
    users: [ ... ],        // 5 team members
    contacts: [ ... ],     // 8 external contacts
    folders: [ ... ],      // 8 folders (nested)
    tags: [ ... ],         // 6 tags
    contracts: [ ... ],    // 12 contracts
    templates: [ ... ],    // 8 templates
    tasks: [ ... ],        // 6 tasks
    activities: [ ... ],   // ~50 activity entries
    notifications: [ ... ],// 8 notifications
    comments: [ ... ],     // ~10 comments
    savedViews: [ ... ],   // 5 saved views
    settings: {
      companyName: "Acme Corporation",
      defaultCurrency: "USD",
      defaultLanguage: "English",
      emailNotifications: true,
      signingReminders: true,
      reminderDays: [1, 3, 7],
      timezone: "America/New_York"
    }
  };
}
```
