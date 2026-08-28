# Xendesk Mock — Data Model

> This document defines all entity types, their fields, relationships, and realistic example values.
> The dev agent should implement these in `src/utils/dataManager.js` as the `createInitialData()` function.

---

## 1. Users

Users represent both **agents** (support staff) and **end-users** (customers/requesters).

```javascript
{
  id: 1,                          // integer, unique
  name: "Sarah Chen",             // string, display name
  email: "sarah.chen@company.com",// string
  role: "agent",                  // "agent" | "admin" | "end-user"
  phone: "+1-555-0101",           // string, optional
  photo: null,                    // string URL or null (use initials avatar)
  organization_id: null,          // integer, null for agents; org ID for end-users
  group_id: 1,                    // integer, primary group (agents only)
  time_zone: "America/New_York",  // string
  locale: "en-US",                // string
  signature: "Best regards,\nSarah Chen\nCustomer Support", // string, agents only
  notes: "",                      // string, admin notes about user
  suspended: false,               // boolean
  verified: true,                 // boolean
  active: true,                   // boolean
  created_at: "2023-06-15T10:00:00Z",
  updated_at: "2025-01-10T14:30:00Z",
  last_login_at: "2025-01-15T09:00:00Z",
  // Computed/derived
  ticket_count: 12,               // number of tickets as requester
  initials: "SC"                  // computed from name
}
```

**Current user (pre-logged-in agent):** `id: 1, name: "Sarah Chen", role: "agent"`

### Seed Users

**Agents (5):**
| ID | Name | Email | Group |
|----|------|-------|-------|
| 1 | Sarah Chen | sarah.chen@company.com | Tier 1 Support |
| 2 | Marcus Johnson | marcus.j@company.com | Tier 1 Support |
| 3 | Emily Rodriguez | emily.r@company.com | Tier 2 Support |
| 4 | David Kim | david.kim@company.com | Billing |
| 5 | Priya Patel | priya.p@company.com | Engineering |

**End Users / Customers (10):**
| ID | Name | Email | Organization |
|----|------|-------|-------------|
| 101 | Alex Thompson | alex.t@acmecorp.com | Acme Corp |
| 102 | Jordan Lee | jordan.lee@techstart.io | TechStart Inc |
| 103 | Maria Garcia | maria.g@globalretail.com | Global Retail |
| 104 | Sam Wilson | sam.wilson@acmecorp.com | Acme Corp |
| 105 | Nina Patel | nina.p@techstart.io | TechStart Inc |
| 106 | Chris Brown | chris.b@designhub.co | DesignHub Co |
| 107 | Lisa Wang | lisa.wang@globalretail.com | Global Retail |
| 108 | Tom Anderson | tom.a@freelance.com | (none) |
| 109 | Rachel Kim | rachel.k@edutech.org | EduTech Foundation |
| 110 | Mike Davis | mike.d@acmecorp.com | Acme Corp |

---

## 2. Organizations

Customer companies that end-users belong to.

```javascript
{
  id: 1,                          // integer, unique
  name: "Acme Corp",              // string, required, unique
  domain_names: ["acmecorp.com"], // array of strings
  details: "Enterprise customer, 500+ employees",  // string
  notes: "Key account — escalate P1 tickets immediately", // string
  group_id: 1,                    // integer, default group for new tickets
  shared_tickets: false,          // boolean
  shared_comments: false,         // boolean
  tags: ["enterprise", "key-account"], // array of strings
  created_at: "2023-01-15T00:00:00Z",
  updated_at: "2025-01-10T00:00:00Z"
}
```

### Seed Organizations (4)

| ID | Name | Domains | Tags |
|----|------|---------|------|
| 1 | Acme Corp | acmecorp.com | enterprise, key-account |
| 2 | TechStart Inc | techstart.io | startup, growth |
| 3 | Global Retail | globalretail.com | enterprise, retail |
| 4 | DesignHub Co | designhub.co | smb |
| 5 | EduTech Foundation | edutech.org | nonprofit, education |

---

## 3. Groups

Agent teams for ticket routing and assignment.

```javascript
{
  id: 1,                    // integer, unique
  name: "Tier 1 Support",   // string, required
  description: "Front-line customer support team", // string
  default: true,            // boolean, is this the default group?
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2024-06-01T00:00:00Z"
}
```

### Seed Groups (4)

| ID | Name | Description | Default |
|----|------|-------------|---------|
| 1 | Tier 1 Support | Front-line customer support | true |
| 2 | Tier 2 Support | Escalated technical issues | false |
| 3 | Billing | Payment and subscription issues | false |
| 4 | Engineering | Bug reports and feature requests | false |

---

## 4. Tickets

The central entity — support requests with full lifecycle tracking.

```javascript
{
  id: 1001,                        // integer, unique (start at 1001 for realism)
  subject: "Cannot login to dashboard after password reset", // string
  description: "I reset my password yesterday but now I can't login...", // string (first comment body)
  status: "open",                  // "new" | "open" | "pending" | "hold" | "solved" | "closed"
  type: "problem",                 // "question" | "incident" | "problem" | "task" | null
  priority: "high",                // "urgent" | "high" | "normal" | "low" | null
  requester_id: 101,              // integer, end-user who submitted
  submitter_id: 101,              // integer, user who created (may differ from requester)
  assignee_id: 1,                 // integer, agent assigned (null = unassigned)
  group_id: 1,                    // integer, agent group
  organization_id: 1,             // integer, requester's org
  collaborator_ids: [],           // array of user IDs (CCs)
  follower_ids: [2],              // array of agent IDs following ticket
  tags: ["login", "password", "urgent-fix"], // array of strings
  via: { channel: "email" },      // object: { channel: "email" | "web" | "chat" | "phone" | "api" }
  satisfaction_rating: null,       // null | { score: "good"|"bad", comment: "..." }
  due_at: null,                   // ISO string or null (for task-type tickets)
  is_public: true,                // boolean
  custom_fields: [],              // array of { id, value } objects
  created_at: "2025-01-14T09:30:00Z",
  updated_at: "2025-01-15T11:45:00Z",
  // Derived / computed
  comment_count: 4,               // number of comments
  sla: {                          // SLA tracking (simplified)
    first_reply_at: "2025-01-14T10:15:00Z",
    next_reply_due: "2025-01-15T17:00:00Z",
    breached: false
  }
}
```

### Seed Tickets (15)

Tickets should cover a variety of statuses, priorities, types, assignees, and organizations:

| ID | Subject | Status | Priority | Type | Requester | Assignee | Group |
|----|---------|--------|----------|------|-----------|----------|-------|
| 1001 | Cannot login to dashboard after password reset | open | high | problem | Alex Thompson (101) | Sarah Chen (1) | Tier 1 |
| 1002 | Billing discrepancy on January invoice | pending | normal | question | Jordan Lee (102) | David Kim (4) | Billing |
| 1003 | App crashes when uploading files > 10MB | open | urgent | problem | Maria Garcia (103) | Emily Rodriguez (3) | Tier 2 |
| 1004 | How to export data to CSV? | solved | low | question | Sam Wilson (104) | Sarah Chen (1) | Tier 1 |
| 1005 | Feature request: Dark mode support | open | normal | task | Nina Patel (105) | Priya Patel (5) | Engineering |
| 1006 | Cannot access API documentation | new | normal | question | Chris Brown (106) | (unassigned) | Tier 1 |
| 1007 | Integration with Slack not sending notifications | open | high | incident | Alex Thompson (101) | Marcus Johnson (2) | Tier 1 |
| 1008 | Subscription upgrade not reflected | pending | high | problem | Tom Anderson (108) | David Kim (4) | Billing |
| 1009 | Mobile app performance issues on Android | open | normal | problem | Lisa Wang (107) | Emily Rodriguez (3) | Tier 2 |
| 1010 | Need to change organization admin | new | low | question | Rachel Kim (109) | (unassigned) | Tier 1 |
| 1011 | Two-factor authentication setup failing | open | urgent | incident | Mike Davis (110) | Sarah Chen (1) | Tier 1 |
| 1012 | Data import from legacy system | hold | normal | task | Jordan Lee (102) | Priya Patel (5) | Engineering |
| 1013 | Custom report builder not loading | solved | normal | problem | Maria Garcia (103) | Emily Rodriguez (3) | Tier 2 |
| 1014 | Request for team training session | pending | low | task | Sam Wilson (104) | Marcus Johnson (2) | Tier 1 |
| 1015 | SSO configuration errors after domain change | new | high | incident | Nina Patel (105) | (unassigned) | Tier 2 |

---

## 5. Comments

Messages within a ticket conversation — either public replies or internal/private notes.

```javascript
{
  id: 5001,                        // integer, unique
  ticket_id: 1001,                // integer, parent ticket
  author_id: 101,                 // integer, user who wrote it
  body: "I reset my password yesterday using the 'Forgot Password' link, but now when I try to login with the new password, it says 'Invalid credentials'.", // string (plain text or HTML)
  html_body: "<p>I reset my password yesterday...</p>", // string, HTML formatted
  public: true,                   // boolean: true=public reply, false=internal note
  type: "Comment",                // "Comment" | "VoiceComment"
  attachments: [],                // array of { id, file_name, content_type, size, url }
  created_at: "2025-01-14T09:30:00Z",
  // Derived
  author_name: "Alex Thompson",   // resolved from users
  author_role: "end-user",        // resolved from users
  author_photo: null               // resolved from users
}
```

### Seed Comments

Each ticket should have 2-5 comments creating a realistic conversation flow. Example for ticket 1001:

1. **(Public, end-user)** — Initial request describing the problem
2. **(Internal note, agent)** — Agent's private note: "Checked auth logs, seeing multiple failed attempts from this IP. Looks like a caching issue."
3. **(Public, agent)** — Agent's reply asking for more info or providing a solution
4. **(Public, end-user)** — Customer's follow-up

Total seed comments: ~50 across all 15 tickets.

---

## 6. Views

Saved ticket filters shown in the left panel sidebar.

```javascript
{
  id: 1,                            // integer, unique
  title: "Your unsolved tickets",   // string
  description: "Tickets assigned to you that are not yet solved", // string
  active: true,                     // boolean
  position: 0,                      // integer, display order
  type: "standard",                 // "standard" | "shared" | "personal"
  conditions: {                     // filter conditions (simplified)
    all: [
      { field: "assignee_id", operator: "is", value: "current_user" },
      { field: "status", operator: "less_than", value: "solved" }
    ],
    any: []
  },
  // Derived at runtime
  count: 5                          // number of matching tickets
}
```

### Seed Views (8)

| ID | Title | Type | Conditions (simplified) |
|----|-------|------|------------------------|
| 1 | Your unsolved tickets | standard | assignee=current_user AND status<solved |
| 2 | Unassigned tickets | standard | assignee=null AND status<solved |
| 3 | All unsolved tickets | standard | status<solved |
| 4 | Recently updated tickets | standard | updated_at within 7 days |
| 5 | Recently solved tickets | standard | status=solved AND solved_at within 7 days |
| 6 | Pending tickets | standard | status=pending |
| 7 | New tickets | shared | status=new |
| 8 | Urgent & High priority | personal | priority in [urgent, high] AND status<solved |

---

## 7. Macros

Pre-defined ticket update templates that agents can apply with one click.

```javascript
{
  id: 1,                            // integer, unique
  title: "Close and redirect to FAQ",// string
  description: "Closes ticket and sends FAQ link", // string
  active: true,                     // boolean
  position: 0,                      // integer, display order
  actions: [                        // array of actions to apply
    { field: "status", value: "solved" },
    { field: "comment_mode", value: "public" },
    { field: "comment_value", value: "Thank you for reaching out! This question is covered in our FAQ: https://help.company.com/faq. If you need further assistance, please don't hesitate to reply." }
  ],
  restriction: null                 // null = available to all agents
}
```

### Seed Macros (6)

| ID | Title | Actions |
|----|-------|---------|
| 1 | Close and redirect to FAQ | status→solved, public comment with FAQ link |
| 2 | Escalate to Tier 2 | group→Tier 2 Support, priority→high, internal note "Escalated" |
| 3 | Request more information | status→pending, public comment asking for details |
| 4 | Assign to me | assignee→current_user, status→open |
| 5 | Downgrade priority — resolved | priority→low, status→solved, public comment "Glad we resolved this" |
| 6 | Transfer to Billing | group→Billing, internal note "Transferred to billing team" |

---

## 8. Tags (Global list)

Tags are simple strings applied to tickets. For autocomplete, maintain a list of known tags.

```javascript
// Global tag list for autocomplete
tags: [
  "login", "password", "billing", "invoice", "api", "integration",
  "bug", "feature-request", "urgent-fix", "mobile", "performance",
  "sso", "2fa", "export", "import", "slack", "android", "ios",
  "enterprise", "training", "documentation", "csv", "dark-mode",
  "crash", "upload", "notification", "subscription", "upgrade",
  "key-account", "startup", "retail", "smb", "nonprofit"
]
```

---

## Entity Relationships

```
Organization 1──* User (end-users belong to organizations)
Group 1──* User (agents belong to groups)
User 1──* Ticket (as requester)
User 1──* Ticket (as assignee)
Group 1──* Ticket (tickets are assigned to groups)
Organization 1──* Ticket (tickets belong to requester's org)
Ticket 1──* Comment (a ticket has many comments)
User 1──* Comment (as author)
Ticket *──* Tag (tickets have many tags)
Ticket *──* User (as collaborators/CCs)
Ticket *──* User (as followers)
View filters→ Ticket (views dynamically filter tickets)
Macro actions→ Ticket (macros modify tickets when applied)
```

---

## createInitialData() Structure

```javascript
function createInitialData() {
  return {
    // Current user (pre-logged-in agent)
    currentUser: { id: 1, name: "Sarah Chen", ... },

    // All users (agents + end-users)
    users: [ /* 15 users: 5 agents + 10 end-users */ ],

    // Organizations
    organizations: [ /* 5 orgs */ ],

    // Groups
    groups: [ /* 4 groups */ ],

    // Tickets
    tickets: [ /* 15 tickets with varied statuses/priorities */ ],

    // Comments (keyed by ticket_id for fast lookup)
    comments: {
      1001: [ /* 4 comments */ ],
      1002: [ /* 3 comments */ ],
      // ... etc
    },

    // Views
    views: [ /* 8 views */ ],

    // Macros
    macros: [ /* 6 macros */ ],

    // Global tag list
    tags: [ /* ~30 tags */ ],

    // UI state
    ui: {
      activeView: 1,             // currently selected view ID
      openTicketTabs: [1001],    // ticket IDs open as tabs
      activeTicketId: null,      // currently viewed ticket ID
      searchQuery: "",           // current search query
      selectedTicketIds: [],     // multi-select in views
      replyMode: "public",       // "public" | "internal"
      sidebarCollapsed: false    // left views panel collapsed?
    }
  };
}
```

---

## ID Ranges Convention

| Entity | ID Range | Notes |
|--------|----------|-------|
| Agents | 1–99 | Support staff |
| End Users | 100–999 | Customers |
| Organizations | 1–99 | Companies |
| Groups | 1–99 | Agent teams |
| Tickets | 1001+ | Support requests |
| Comments | 5001+ | Ticket messages |
| Views | 1–99 | Ticket filters |
| Macros | 1–99 | Quick actions |
