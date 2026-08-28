# XubSpot Marketing Hub — Data Model

This document defines all entity types, their fields, relationships, and example values for `dataManager.js`.

---

## 1. Current User

```js
currentUser: {
  id: "user-1",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@acmecorp.com",
  avatar: null, // initials "SJ" rendered as colored circle
  role: "Marketing Manager",
  company: "Acme Corp",
  timezone: "America/New_York"
}
```

---

## 2. Contacts

The core CRM object. Each contact represents an individual person.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"contact-1"` |
| firstName | string | `"Brian"` |
| lastName | string | `"Halligan"` |
| email | string | `"brian.halligan@hubspot.com"` |
| phone | string | `"+1 (617) 555-0123"` |
| company | string (ref to company name) | `"HubSpot"` |
| companyId | string | `"company-1"` |
| jobTitle | string | `"CEO"` |
| lifecycleStage | enum | `"lead"` / `"marketing_qualified_lead"` / `"sales_qualified_lead"` / `"opportunity"` / `"customer"` / `"evangelist"` / `"subscriber"` / `"other"` |
| leadStatus | enum | `"new"` / `"open"` / `"in_progress"` / `"open_deal"` / `"unqualified"` / `"attempted_to_contact"` / `"connected"` |
| contactOwner | string (user id) | `"user-1"` |
| createDate | ISO string | `"2024-03-15T10:30:00Z"` |
| lastActivityDate | ISO string | `"2024-06-20T14:22:00Z"` |
| lastContacted | ISO string | `"2024-06-18T09:00:00Z"` |
| source | enum | `"organic_search"` / `"paid_social"` / `"email_marketing"` / `"direct_traffic"` / `"referral"` / `"paid_search"` / `"social_media"` / `"offline"` |
| marketingStatus | enum | `"marketing"` / `"non_marketing"` |
| city | string | `"Cambridge"` |
| state | string | `"MA"` |
| country | string | `"United States"` |
| website | string | `"https://hubspot.com"` |
| avatar | string or null | `null` (rendered from initials) |
| tags | string[] | `["VIP", "Webinar Attendee"]` |
| notes | string | `""` |

### Activity Timeline (embedded in contact detail)
```js
activities: [
  {
    id: "activity-1",
    type: "email", // "email" | "note" | "call" | "meeting" | "task" | "form_submission"
    title: "Marketing email: Q2 Newsletter",
    body: "Opened email, clicked 2 links",
    timestamp: "2024-06-20T14:22:00Z",
    createdBy: "user-1"
  }
]
```

**Suggested seed**: 15–20 contacts across different lifecycle stages, sources, and companies.

---

## 3. Companies

| Field | Type | Example |
|-------|------|---------|
| id | string | `"company-1"` |
| name | string | `"HubSpot"` |
| domain | string | `"hubspot.com"` |
| industry | string | `"Software"` |
| employeeCount | number | `7000` |
| annualRevenue | string | `"$1.7B"` |
| city | string | `"Cambridge"` |
| state | string | `"MA"` |
| country | string | `"United States"` |
| phone | string | `"+1 (888) 482-7768"` |
| owner | string (user id) | `"user-1"` |
| createDate | ISO string | `"2024-01-10T08:00:00Z"` |
| contactCount | number | `5` |

**Suggested seed**: 8–10 companies.

---

## 4. Deals

| Field | Type | Example |
|-------|------|---------|
| id | string | `"deal-1"` |
| name | string | `"Acme Corp - Enterprise Plan"` |
| stage | enum | `"appointment_scheduled"` / `"qualified_to_buy"` / `"presentation_scheduled"` / `"decision_maker_bought_in"` / `"contract_sent"` / `"closed_won"` / `"closed_lost"` |
| amount | number | `45000` |
| closeDate | ISO string | `"2024-07-30T00:00:00Z"` |
| contactId | string | `"contact-1"` |
| companyId | string | `"company-1"` |
| owner | string (user id) | `"user-1"` |
| pipeline | string | `"default"` |
| createDate | ISO string | `"2024-05-01T10:00:00Z"` |

**Suggested seed**: 6–8 deals at various stages.

---

## 5. Marketing Emails

| Field | Type | Example |
|-------|------|---------|
| id | string | `"email-1"` |
| name | string | `"Q2 Product Newsletter"` |
| subject | string | `"Exciting updates from Acme Corp"` |
| previewText | string | `"Check out our latest features..."` |
| status | enum | `"draft"` / `"scheduled"` / `"sent"` / `"archived"` |
| type | enum | `"regular"` / `"automated"` / `"ab_test"` |
| fromName | string | `"Acme Corp Marketing"` |
| fromEmail | string | `"marketing@acmecorp.com"` |
| replyTo | string | `"reply@acmecorp.com"` |
| listIds | string[] | `["list-1", "list-3"]` |
| campaignId | string or null | `"campaign-1"` |
| scheduledDate | ISO string or null | `"2024-06-25T09:00:00Z"` |
| sentDate | ISO string or null | `"2024-06-15T09:00:00Z"` |
| createdDate | ISO string | `"2024-06-10T14:30:00Z"` |
| updatedDate | ISO string | `"2024-06-14T16:45:00Z"` |
| createdBy | string | `"user-1"` |
| stats | object | See below |
| content | object | See below |

### Email Stats
```js
stats: {
  sent: 2450,
  delivered: 2398,
  opened: 1127,
  clicked: 389,
  bounced: 52,
  unsubscribed: 12,
  openRate: 46.0,    // percentage
  clickRate: 15.9,
  clickThroughRate: 34.5,
  bounceRate: 2.1,
  unsubscribeRate: 0.5
}
```

### Email Content (simplified for drag-and-drop builder)
```js
content: {
  templateId: "template-1",
  blocks: [
    { id: "block-1", type: "header", data: { logoUrl: "", companyName: "Acme Corp" } },
    { id: "block-2", type: "text", data: { html: "<h2>Hello {{contact.firstName}}!</h2><p>...</p>" } },
    { id: "block-3", type: "image", data: { src: "", alt: "Product screenshot", width: "100%" } },
    { id: "block-4", type: "button", data: { text: "Learn More", url: "#", color: "#FF7A59", align: "center" } },
    { id: "block-5", type: "divider", data: { style: "solid", color: "#CBD6E2" } },
    { id: "block-6", type: "text", data: { html: "<p>Footer text</p>" } },
    { id: "block-7", type: "social", data: { links: { facebook: "#", twitter: "#", linkedin: "#" } } }
  ]
}
```

**Suggested seed**: 8–10 emails (3 sent, 2 scheduled, 2 drafts, 1 archived).

---

## 6. Campaigns

| Field | Type | Example |
|-------|------|---------|
| id | string | `"campaign-1"` |
| name | string | `"Q2 Product Launch"` |
| status | enum | `"active"` / `"draft"` / `"completed"` / `"paused"` |
| goal | string | `"Drive awareness for new feature release"` |
| startDate | ISO string | `"2024-06-01T00:00:00Z"` |
| endDate | ISO string or null | `"2024-06-30T23:59:59Z"` |
| owner | string (user id) | `"user-1"` |
| createdDate | ISO string | `"2024-05-20T10:00:00Z"` |
| budget | number | `15000` |
| assets | object | See below |
| metrics | object | See below |

### Campaign Assets (IDs of associated items)
```js
assets: {
  emails: ["email-1", "email-2"],
  landingPages: ["lp-1"],
  forms: ["form-1"],
  blogPosts: ["blog-1"],
  socialPosts: ["social-1", "social-2"],
  workflows: ["workflow-1"],
  ctas: ["cta-1"]
}
```

### Campaign Metrics
```js
metrics: {
  sessions: 12450,
  newContacts: 342,
  influencedContacts: 1580,
  closedDeals: 8,
  revenue: 125000
}
```

**Suggested seed**: 4–5 campaigns (2 active, 1 completed, 1 draft, 1 paused).

---

## 7. Forms

| Field | Type | Example |
|-------|------|---------|
| id | string | `"form-1"` |
| name | string | `"Newsletter Signup Form"` |
| type | enum | `"embedded"` / `"popup"` / `"standalone"` / `"dropdown_banner"` / `"slide_in"` |
| status | enum | `"published"` / `"draft"` |
| views | number | `8450` |
| submissions | number | `672` |
| submissionRate | number | `7.95` (percentage) |
| createdDate | ISO string | `"2024-02-15T09:00:00Z"` |
| updatedDate | ISO string | `"2024-06-01T11:30:00Z"` |
| campaignId | string or null | `"campaign-1"` |
| fields | array | See below |
| settings | object | See below |

### Form Fields
```js
fields: [
  { id: "field-1", type: "email", label: "Email", required: true, placeholder: "you@example.com" },
  { id: "field-2", type: "text", label: "First Name", required: true, placeholder: "John" },
  { id: "field-3", type: "text", label: "Last Name", required: false, placeholder: "Doe" },
  { id: "field-4", type: "select", label: "Company Size", required: false, options: ["1-10", "11-50", "51-200", "201-1000", "1000+"] },
  { id: "field-5", type: "checkbox", label: "I agree to receive marketing emails", required: true }
]
```

### Form Settings
```js
settings: {
  submitButtonText: "Subscribe",
  redirectUrl: "",
  thankYouMessage: "Thanks for subscribing!",
  notifyEmails: ["sarah.johnson@acmecorp.com"],
  lifecycleStage: "subscriber"
}
```

**Suggested seed**: 5–6 forms of different types.

---

## 8. Workflows

| Field | Type | Example |
|-------|------|---------|
| id | string | `"workflow-1"` |
| name | string | `"Welcome Email Series"` |
| type | enum | `"contact"` / `"company"` / `"deal"` / `"ticket"` |
| status | enum | `"active"` / `"inactive"` / `"draft"` |
| enrolledCount | number | `1245` |
| enrolledCurrently | number | `83` |
| createdDate | ISO string | `"2024-03-01T08:00:00Z"` |
| updatedDate | ISO string | `"2024-06-10T15:00:00Z"` |
| createdBy | string | `"user-1"` |
| trigger | object | See below |
| nodes | array | See below |

### Workflow Trigger
```js
trigger: {
  type: "filter", // "filter" | "event"
  description: "Contact fills out Newsletter Signup Form",
  filterGroups: [
    {
      filters: [
        { property: "form_submission", operator: "eq", value: "form-1" }
      ]
    }
  ]
}
```

### Workflow Nodes (visual flowchart)
```js
nodes: [
  {
    id: "node-1",
    type: "action", // "action" | "delay" | "branch" | "email"
    actionType: "send_email",
    config: { emailId: "email-3", subject: "Welcome to Acme Corp!" },
    position: { x: 0, y: 0 },
    nextNodeId: "node-2"
  },
  {
    id: "node-2",
    type: "delay",
    config: { duration: 3, unit: "days" },
    position: { x: 0, y: 1 },
    nextNodeId: "node-3"
  },
  {
    id: "node-3",
    type: "branch",
    config: {
      condition: "Contact opened Welcome Email",
      property: "email_open",
      operator: "eq",
      value: "email-3"
    },
    position: { x: 0, y: 2 },
    yesBranch: "node-4",
    noBranch: "node-5"
  },
  {
    id: "node-4",
    type: "action",
    actionType: "send_email",
    config: { emailId: "email-4", subject: "Here's your exclusive content" },
    position: { x: -1, y: 3 },
    nextNodeId: null
  },
  {
    id: "node-5",
    type: "action",
    actionType: "send_email",
    config: { emailId: "email-5", subject: "Did you miss our welcome email?" },
    position: { x: 1, y: 3 },
    nextNodeId: null
  }
]
```

**Suggested seed**: 4–5 workflows (2 active, 1 inactive, 2 drafts).

---

## 9. Lists (Segments)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"list-1"` |
| name | string | `"All Marketing Contacts"` |
| type | enum | `"active"` / `"static"` |
| size | number | `2450` |
| createdDate | ISO string | `"2024-01-05T08:00:00Z"` |
| updatedDate | ISO string | `"2024-06-20T00:00:00Z"` |
| filters | array | `[{ property: "marketingStatus", operator: "eq", value: "marketing" }]` |
| createdBy | string | `"user-1"` |

**Suggested seed**: 6–8 lists.

---

## 10. Landing Pages

| Field | Type | Example |
|-------|------|---------|
| id | string | `"lp-1"` |
| name | string | `"Q2 Product Launch Landing Page"` |
| slug | string | `"/q2-product-launch"` |
| status | enum | `"published"` / `"draft"` |
| publishDate | ISO string or null | `"2024-06-01T00:00:00Z"` |
| views | number | `6797` |
| submissions | number | `224` |
| conversionRate | number | `3.30` |
| newContacts | number | `109` |
| campaignId | string or null | `"campaign-1"` |
| createdDate | ISO string | `"2024-05-15T10:00:00Z"` |
| updatedDate | ISO string | `"2024-05-30T16:00:00Z"` |

**Suggested seed**: 4–5 landing pages.

---

## 11. CTAs (Calls-to-Action)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"cta-1"` |
| name | string | `"Try Free Demo CTA"` |
| type | enum | `"button"` / `"banner"` / `"popup"` / `"slide_in"` |
| text | string | `"Try Free Demo"` |
| url | string | `"/demo"` |
| color | string | `"#FF7A59"` |
| views | number | `15230` |
| clicks | number | `892` |
| clickRate | number | `5.86` |
| status | enum | `"active"` / `"draft"` |
| createdDate | ISO string | `"2024-04-01T09:00:00Z"` |
| campaignId | string or null | `"campaign-1"` |

**Suggested seed**: 4–5 CTAs.

---

## 12. Dashboard Reports (Widgets)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"report-1"` |
| name | string | `"Email Performance Overview"` |
| type | enum | `"line_chart"` / `"bar_chart"` / `"donut_chart"` / `"number"` / `"table"` / `"funnel"` |
| dashboardId | string | `"dashboard-1"` |
| dateRange | string | `"last_30_days"` / `"last_7_days"` / `"this_month"` / `"last_month"` / `"this_quarter"` / `"custom"` |
| metric | string | `"email_open_rate"` |
| data | object | Chart-type-specific data points |
| position | object | `{ row: 0, col: 0, width: 1, height: 1 }` |

### Dashboards
```js
dashboards: [
  {
    id: "dashboard-1",
    name: "Marketing Performance",
    isDefault: true,
    reports: ["report-1", "report-2", "report-3", "report-4", "report-5", "report-6"]
  }
]
```

**Suggested seed**: 2 dashboards with 6 reports each.

---

## 13. Social Posts (for social media management)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"social-1"` |
| platform | enum | `"facebook"` / `"twitter"` / `"linkedin"` / `"instagram"` |
| content | string | `"Excited to announce our Q2 product launch! 🚀"` |
| status | enum | `"published"` / `"scheduled"` / `"draft"` |
| scheduledDate | ISO string or null | `"2024-06-15T10:00:00Z"` |
| publishedDate | ISO string or null | `"2024-06-15T10:00:00Z"` |
| campaignId | string or null | `"campaign-1"` |
| metrics | object | `{ likes: 142, shares: 38, comments: 15, clicks: 267, impressions: 8900 }` |

**Suggested seed**: 8–10 social posts across platforms.

---

## Relationship Map

```
Contact ←→ Company (many-to-one via companyId)
Contact ←→ Deal (one-to-many via contactId on Deal)
Contact ←→ List (many-to-many, contacts matched by list filters)
Contact ←→ Activity (one-to-many, embedded)
Email → Campaign (many-to-one via campaignId)
Email → List (many-to-many via listIds)
Form → Campaign (many-to-one via campaignId)
Landing Page → Campaign (many-to-one via campaignId)
Workflow → Email (references emailIds in nodes)
CTA → Campaign (many-to-one via campaignId)
Social Post → Campaign (many-to-one via campaignId)
Dashboard → Reports (one-to-many)
```

---

## createInitialData() Structure

```js
export function createInitialData() {
  return {
    currentUser: { /* see §1 */ },
    contacts: [ /* 15-20 contacts */ ],
    companies: [ /* 8-10 companies */ ],
    deals: [ /* 6-8 deals */ ],
    emails: [ /* 8-10 marketing emails */ ],
    campaigns: [ /* 4-5 campaigns */ ],
    forms: [ /* 5-6 forms */ ],
    workflows: [ /* 4-5 workflows */ ],
    lists: [ /* 6-8 lists */ ],
    landingPages: [ /* 4-5 landing pages */ ],
    ctas: [ /* 4-5 CTAs */ ],
    dashboards: [ /* 2 dashboards */ ],
    reports: [ /* 12 reports across dashboards */ ],
    socialPosts: [ /* 8-10 social posts */ ],
    // UI state
    selectedDashboardId: "dashboard-1",
    sidebarCollapsed: false,
    activeSection: "marketing"
  };
}
```
