# Xailchimp Mock — Data Model

> This document defines all entity types, their fields, relationships, and the structure for `createInitialData()` in `dataManager.js`.

---

## Entity Types

### 1. User (Current User / Account)

The pre-logged-in user. Only one instance exists.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"user_1"` |
| `firstName` | string | `"Rakesh"` |
| `lastName` | string | `"Mondal"` |
| `email` | string | `"rakesh@acmemarketing.com"` |
| `company` | string | `"Acme Marketing Co."` |
| `timezone` | string | `"America/New_York"` |
| `avatar` | string (URL/initials) | `"/avatars/rakesh.jpg"` |
| `plan` | string | `"Standard"` |
| `defaultFromName` | string | `"Acme Marketing"` |
| `defaultFromEmail` | string | `"hello@acmemarketing.com"` |
| `defaultReplyTo` | string | `"hello@acmemarketing.com"` |

---

### 2. Audience

Container for contacts. Most Xailchimp accounts have 1 primary audience.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"aud_1"` |
| `name` | string | `"Acme Marketing Audience"` |
| `stats` | object | `{ totalContacts: 2847, subscribed: 2340, unsubscribed: 312, cleaned: 95, nonSubscribed: 100 }` |
| `defaultFromName` | string | `"Acme Marketing"` |
| `defaultFromEmail` | string | `"hello@acmemarketing.com"` |
| `createdAt` | string (ISO) | `"2023-06-15T10:00:00Z"` |

---

### 3. Contact (Audience Member)

Individual subscriber/contact within an audience.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"contact_1"` |
| `audienceId` | string (FK) | `"aud_1"` |
| `email` | string | `"sarah.johnson@example.com"` |
| `firstName` | string | `"Sarah"` |
| `lastName` | string | `"Johnson"` |
| `phone` | string | `"+1-555-0101"` |
| `status` | enum | `"subscribed"` / `"unsubscribed"` / `"cleaned"` / `"non-subscribed"` |
| `tags` | string[] | `["VIP", "Newsletter"]` |
| `source` | string | `"Import"` / `"Signup Form"` / `"API"` / `"Manual"` |
| `rating` | number (1-5) | `4` (engagement star rating) |
| `location` | object | `{ city: "New York", state: "NY", country: "US" }` |
| `birthday` | string | `"03/15"` (MM/DD) |
| `notes` | string | `"Key account contact"` |
| `openRate` | number | `0.42` (42%) |
| `clickRate` | number | `0.18` |
| `lastOpened` | string (ISO) | `"2025-12-10T14:30:00Z"` |
| `lastClicked` | string (ISO) | `"2025-12-08T09:15:00Z"` |
| `subscribedAt` | string (ISO) | `"2024-01-20T08:00:00Z"` |
| `createdAt` | string (ISO) | `"2024-01-20T08:00:00Z"` |

---

### 4. Tag

Labels for organizing contacts.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"tag_1"` |
| `name` | string | `"VIP"` |
| `contactCount` | number | `156` |
| `createdAt` | string (ISO) | `"2024-02-01T10:00:00Z"` |

---

### 5. Segment

Dynamic filtered groups of contacts based on conditions.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"seg_1"` |
| `audienceId` | string (FK) | `"aud_1"` |
| `name` | string | `"Active Subscribers"` |
| `conditions` | Condition[] | See below |
| `conditionMatch` | enum | `"all"` / `"any"` |
| `memberCount` | number | `1250` |
| `type` | enum | `"saved"` / `"pre-built"` |
| `createdAt` | string (ISO) | `"2024-03-10T12:00:00Z"` |
| `updatedAt` | string (ISO) | `"2025-11-20T08:00:00Z"` |

**Condition object:**
```json
{
  "field": "emailActivity",    // "emailActivity" | "tags" | "location" | "source" | "rating" | "subscribedDate"
  "operator": "opened",        // "opened" | "did_not_open" | "clicked" | "is" | "is_not" | "contains" | "greater_than" | "less_than" | "after" | "before"
  "value": "last_campaign"     // varies by field type
}
```

---

### 6. Campaign

An email campaign (draft, scheduled, sending, sent).

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"camp_1"` |
| `name` | string | `"December Newsletter"` |
| `type` | enum | `"regular"` / `"plaintext"` / `"ab_test"` |
| `status` | enum | `"draft"` / `"scheduled"` / `"sending"` / `"sent"` / `"paused"` |
| `audienceId` | string (FK) | `"aud_1"` |
| `segmentId` | string (FK, nullable) | `"seg_1"` or `null` |
| `recipients` | object | `{ listName: "Acme Audience", segmentName: "Active Subscribers", count: 1250 }` |
| `fromName` | string | `"Acme Marketing"` |
| `fromEmail` | string | `"hello@acmemarketing.com"` |
| `replyTo` | string | `"hello@acmemarketing.com"` |
| `subject` | string | `"Your December Digest is Here!"` |
| `previewText` | string | `"See what's new this month..."` |
| `templateId` | string (FK, nullable) | `"tmpl_1"` |
| `content` | ContentBlock[] | See §Content Blocks below |
| `scheduledAt` | string (ISO, nullable) | `"2025-12-25T09:00:00Z"` |
| `sentAt` | string (ISO, nullable) | `"2025-12-25T09:01:23Z"` |
| `report` | Report (nullable) | See §Report below |
| `createdAt` | string (ISO) | `"2025-12-20T14:00:00Z"` |
| `updatedAt` | string (ISO) | `"2025-12-24T16:30:00Z"` |

---

### 7. ContentBlock (embedded in Campaign)

Represents a block within the email editor.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"block_1"` |
| `type` | enum | `"text"` / `"image"` / `"button"` / `"divider"` / `"social"` / `"header"` / `"footer"` |
| `order` | number | `0` |
| `content` | object | Varies by type (see below) |

**Content by type:**
- **text**: `{ html: "<p>Hello {{firstName}},</p><p>Check out our latest updates...</p>" }`
- **image**: `{ src: "/placeholder-image.jpg", alt: "Product photo", width: "100%", link: "https://example.com" }`
- **button**: `{ text: "Shop Now", url: "https://example.com/shop", bgColor: "#007C89", textColor: "#FFFFFF", align: "center" }`
- **divider**: `{ style: "solid", color: "#E0E0E0", width: "100%" }`
- **social**: `{ networks: [{ name: "Facebook", url: "https://facebook.com/acme", icon: "facebook" }, ...] }`
- **header**: `{ logoSrc: "/logo.png", text: "Acme Marketing" }`
- **footer**: `{ text: "© 2025 Acme Marketing Co.", unsubscribeText: "Unsubscribe", address: "123 Main St, New York, NY" }`

---

### 8. Template

Reusable email templates.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"tmpl_1"` |
| `name` | string | `"Monthly Newsletter"` |
| `category` | enum | `"featured"` / `"sell_products"` / `"announcement"` / `"tell_a_story"` / `"follow_up"` / `"educate"` / `"basic"` / `"custom"` |
| `thumbnail` | string | `"/templates/newsletter-thumb.png"` |
| `content` | ContentBlock[] | Array of content blocks |
| `isPrebuilt` | boolean | `true` |
| `createdAt` | string (ISO) | `"2024-01-01T00:00:00Z"` |

---

### 9. Automation (Flow)

Multi-step automated email workflows.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"auto_1"` |
| `name` | string | `"Welcome Series"` |
| `type` | enum | `"welcome"` / `"abandoned_cart"` / `"birthday"` / `"re_engagement"` / `"post_purchase"` / `"custom"` |
| `status` | enum | `"active"` / `"paused"` / `"draft"` |
| `trigger` | object | `{ type: "signup", audienceId: "aud_1" }` |
| `steps` | AutomationStep[] | See below |
| `stats` | object | `{ emailsSent: 4521, opened: 2890, clicked: 1230 }` |
| `createdAt` | string (ISO) | `"2024-06-01T10:00:00Z"` |
| `updatedAt` | string (ISO) | `"2025-11-15T12:00:00Z"` |

**AutomationStep:**
```json
{
  "id": "step_1",
  "type": "send_email",       // "send_email" | "wait" | "if_else"
  "order": 0,
  "config": {
    // For send_email:
    "subject": "Welcome to Acme!",
    "previewText": "We're glad you're here",
    "content": [/* ContentBlock[] */]
    // For wait:
    // "duration": 3, "unit": "days"
    // For if_else:
    // "condition": { "field": "emailActivity", "operator": "opened", "value": "previous_email" }
  }
}
```

---

### 10. Report (embedded in Campaign or standalone)

Campaign performance metrics.

| Field | Type | Example |
|-------|------|---------|
| `campaignId` | string (FK) | `"camp_1"` |
| `sent` | number | `1250` |
| `delivered` | number | `1230` |
| `opens` | number | `492` |
| `uniqueOpens` | number | `410` |
| `openRate` | number | `0.3333` (33.33%) |
| `clicks` | number | `156` |
| `uniqueClicks` | number | `130` |
| `clickRate` | number | `0.1057` (10.57%) |
| `bounces` | number | `20` |
| `hardBounces` | number | `5` |
| `softBounces` | number | `15` |
| `unsubscribes` | number | `8` |
| `complaints` | number | `1` |
| `forwards` | number | `12` |
| `topLinks` | object[] | `[{ url: "https://example.com/sale", clicks: 89, uniqueClicks: 72 }, ...]` |
| `opensByHour` | number[] | 24-element array representing opens per hour |
| `clicksByDay` | object[] | `[{ date: "2025-12-25", clicks: 78 }, ...]` |

---

### 11. ContentFile (Content Studio)

Files in the media library.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"file_1"` |
| `name` | string | `"hero-banner.jpg"` |
| `type` | enum | `"image"` / `"document"` |
| `url` | string | `"/content/hero-banner.jpg"` |
| `size` | number (bytes) | `245000` |
| `dimensions` | object (nullable) | `{ width: 1200, height: 600 }` |
| `createdAt` | string (ISO) | `"2025-10-01T08:00:00Z"` |

---

### 12. LandingPage

Simple published web pages.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"lp_1"` |
| `name` | string | `"Holiday Sale Page"` |
| `status` | enum | `"published"` / `"draft"` / `"unpublished"` |
| `url` | string | `"https://mailchi.mp/acme/holiday-sale"` |
| `views` | number | `2340` |
| `signups` | number | `186` |
| `publishedAt` | string (ISO, nullable) | `"2025-11-28T10:00:00Z"` |
| `createdAt` | string (ISO) | `"2025-11-25T14:00:00Z"` |

---

### 13. Notification

In-app notification items.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"notif_1"` |
| `type` | enum | `"campaign_sent"` / `"import_complete"` / `"automation_triggered"` / `"report_ready"` / `"system"` |
| `title` | string | `"Campaign Sent Successfully"` |
| `message` | string | `"'December Newsletter' was sent to 1,250 contacts"` |
| `read` | boolean | `false` |
| `link` | string (nullable) | `"/campaigns/camp_1/report"` |
| `createdAt` | string (ISO) | `"2025-12-25T09:05:00Z"` |

---

## Entity Relationships

```
User (1) ─── owns ──→ Audience (1..n, typically 1)
Audience (1) ─── contains ──→ Contact (n)
Audience (1) ─── has ──→ Segment (n)
Contact (n) ←── tagged with ──→ Tag (n)  [many-to-many via contact.tags[]]
Campaign (1) ─── targets ──→ Audience (1)
Campaign (1) ─── optionally filters ──→ Segment (0..1)
Campaign (1) ─── uses ──→ Template (0..1)
Campaign (1) ─── has ──→ Report (0..1)
Campaign (1) ─── contains ──→ ContentBlock (n)
Automation (1) ─── targets ──→ Audience (1)
Automation (1) ─── contains ──→ AutomationStep (n)
ContentFile (n) ─── belongs to ──→ User (1)
LandingPage (n) ─── belongs to ──→ User (1)
```

---

## `createInitialData()` Structure

```javascript
function createInitialData() {
  return {
    user: { /* single User object */ },
    audiences: [ /* 1 audience */ ],
    contacts: [ /* ~25 contacts with varied statuses, tags, engagement levels */ ],
    tags: [ /* 8-10 tags: VIP, Newsletter, Leads, Customers, Event Attendees, etc. */ ],
    segments: [ /* 5-6 segments: Active Subscribers, New This Month, VIP Customers, etc. */ ],
    campaigns: [ /* 8-10 campaigns in various statuses: 3 sent, 2 draft, 1 scheduled, 1 sending, 1 paused */ ],
    templates: [ /* 10-12 templates: 6 prebuilt + 4-6 custom saved */ ],
    automations: [ /* 4-5 automations: Welcome Series (active), Abandoned Cart (active), Birthday (paused), Re-engagement (draft), Post-purchase (active) */ ],
    contentFiles: [ /* 8-10 placeholder images/files */ ],
    landingPages: [ /* 3 landing pages: 2 published, 1 draft */ ],
    notifications: [ /* 6-8 recent notifications, mix of read/unread */ ],
  };
}
```

### Seed Data Guidelines

**Contacts (25 records):**
- 18 subscribed, 4 unsubscribed, 2 cleaned, 1 non-subscribed
- Varied engagement: 5 high-engagement (rating 4-5), 10 medium (2-3), 10 low (1-2)
- Diverse names, realistic emails (use domains: example.com, gmail.com, company.com)
- Tags distributed: VIP (5), Newsletter (15), Leads (8), Customers (10), Event Attendees (3)
- Locations: mix of US cities + a few international

**Campaigns (8-10 records):**
- "December Newsletter" — sent, strong performance (33% open rate)
- "Holiday Sale Announcement" — sent, high clicks
- "Year in Review" — scheduled for Jan 1
- "Welcome Special Offer" — draft, incomplete
- "Product Launch Preview" — sent, moderate performance
- "Re-engagement: We Miss You" — sent, low open rate
- "Weekly Tips #47" — draft
- "Flash Sale Alert" — sent, highest click rate
- "New Year Promotions" — draft, content not started
- "Customer Feedback Survey" — paused

**Automations (4-5 records):**
- Welcome Series (active, 3 emails, 4521 sent)
- Abandoned Cart (active, 2 emails, 1890 sent)
- Birthday Greeting (paused, 1 email, 623 sent)
- Win-back / Re-engagement (draft, not yet started)
- Post-Purchase Follow-up (active, 2 emails, 2100 sent)
