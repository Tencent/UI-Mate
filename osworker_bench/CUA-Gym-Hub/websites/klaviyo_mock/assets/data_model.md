# Xlaviyo Mock — Data Model

## Entity Types

---

### 1. Profile (Contact/Subscriber)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"prof_001"` |
| email | string | `"sarah.johnson@example.com"` |
| firstName | string | `"Sarah"` |
| lastName | string | `"Johnson"` |
| phone | string | `"+1-555-0123"` |
| location | object | `{ city: "Boston", region: "MA", country: "US", zip: "02101" }` |
| title | string | `"Marketing Manager"` |
| organization | string | `"Acme Corp"` |
| createdAt | string (ISO) | `"2024-06-15T10:30:00Z"` |
| lastActive | string (ISO) | `"2025-03-20T14:22:00Z"` |
| customProperties | object | `{ lifetime_value: 523.50, total_orders: 8, avg_order_value: 65.44 }` |
| predictedGender | string | `"female"` |
| predictedLTV | number | `850.00` |
| listIds | string[] | `["list_001", "list_002"]` |
| segmentIds | string[] | `["seg_001", "seg_003"]` |
| consent | object | `{ email: "subscribed", sms: "subscribed" }` |
| tags | string[] | `["vip", "repeat-buyer"]` |

---

### 2. Campaign

| Field | Type | Example |
|-------|------|---------|
| id | string | `"camp_001"` |
| name | string | `"Spring Sale 2025 - 20% Off"` |
| status | string | `"sent"` — one of: `draft`, `scheduled`, `sending`, `sent` |
| channel | string | `"email"` — one of: `email`, `sms` |
| subject | string | `"Spring into savings! 20% off everything"` |
| previewText | string | `"Limited time offer for our best customers"` |
| senderName | string | `"Acme Store"` |
| senderEmail | string | `"hello@acmestore.com"` |
| templateId | string | `"tmpl_003"` |
| audienceInclude | string[] | `["list_001", "seg_002"]` (list/segment IDs) |
| audienceExclude | string[] | `["seg_005"]` |
| sendStrategy | string | `"immediate"` — one of: `immediate`, `scheduled`, `smart_send_time` |
| scheduledAt | string (ISO) / null | `"2025-03-15T09:00:00Z"` |
| sentAt | string (ISO) / null | `"2025-03-15T09:02:34Z"` |
| createdAt | string (ISO) | `"2025-03-10T14:00:00Z"` |
| updatedAt | string (ISO) | `"2025-03-15T09:02:34Z"` |
| tags | string[] | `["spring-sale", "promotional"]` |
| trackingOptions | object | `{ isTrackingOpens: true, isTrackingClicks: true, addUtm: true }` |
| stats | object | see Campaign Stats below |

#### Campaign Stats (embedded object)

| Field | Type | Example |
|-------|------|---------|
| recipients | number | `8483` |
| delivered | number | `8350` |
| opens | number | `4073` |
| uniqueOpens | number | `3680` |
| clicks | number | `214` |
| uniqueClicks | number | `198` |
| bounced | number | `133` |
| unsubscribed | number | `42` |
| spamComplaints | number | `3` |
| revenue | number | `15230.50` |
| ordersPlaced | number | `87` |
| openRate | number | `0.4869` |
| clickRate | number | `0.0252` |
| conversionRate | number | `0.0018` |

---

### 3. Flow

| Field | Type | Example |
|-------|------|---------|
| id | string | `"flow_001"` |
| name | string | `"Welcome Series"` |
| status | string | `"live"` — one of: `draft`, `manual`, `live` |
| triggerType | string | `"list"` — one of: `metric`, `list`, `segment`, `date`, `price_drop` |
| triggerDetails | object | `{ type: "added_to_list", listId: "list_001" }` |
| createdAt | string (ISO) | `"2024-08-01T10:00:00Z"` |
| updatedAt | string (ISO) | `"2025-02-20T16:45:00Z"` |
| tags | string[] | `["onboarding"]` |
| actions | FlowAction[] | Array of flow action objects (see below) |
| stats | object | `{ delivered: 12450, opens: 5890, clicks: 876, revenue: 34500, conversions: 245 }` |

---

### 4. FlowAction (nodes within a flow)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"fa_001"` |
| flowId | string | `"flow_001"` |
| type | string | `"send_email"` — one of: `send_email`, `send_sms`, `time_delay`, `conditional_split`, `webhook` |
| position | object | `{ x: 0, y: 100 }` |
| parentId | string / null | `null` (first action) or `"fa_001"` |
| branchType | string / null | `null`, `"yes"`, `"no"` (for conditional split children) |
| config | object | Type-dependent config, see below |
| stats | object | `{ delivered: 12450, openRate: 0.47, clickRate: 0.07 }` |

**Config by type:**
- `send_email`: `{ subject: "Welcome!", senderName: "Acme", templateId: "tmpl_001" }`
- `send_sms`: `{ body: "Welcome to Acme! Reply STOP to opt out." }`
- `time_delay`: `{ value: 3, unit: "days" }`
- `conditional_split`: `{ conditions: [{ property: "total_orders", operator: "greater_than", value: 0 }] }`
- `webhook`: `{ url: "https://example.com/webhook" }`

---

### 5. List

| Field | Type | Example |
|-------|------|---------|
| id | string | `"list_001"` |
| name | string | `"Newsletter Subscribers"` |
| type | string | `"manual"` — one of: `manual`, `single_opt_in`, `double_opt_in` |
| memberCount | number | `15234` |
| createdAt | string (ISO) | `"2024-01-15T08:00:00Z"` |
| updatedAt | string (ISO) | `"2025-03-20T12:00:00Z"` |
| tags | string[] | `["active"]` |

---

### 6. Segment

| Field | Type | Example |
|-------|------|---------|
| id | string | `"seg_001"` |
| name | string | `"VIP Customers - High LTV"` |
| isStarred | boolean | `true` |
| isActive | boolean | `true` |
| memberCount | number | `2341` |
| conditionGroups | array | See segment condition structure below |
| createdAt | string (ISO) | `"2024-05-01T09:00:00Z"` |
| lastCalculated | string (ISO) | `"2025-03-20T06:00:00Z"` |

**Segment Condition Group Example:**
```json
[
  {
    "conditions": [
      { "type": "profile-property", "property": "location.country", "operator": "equals", "value": "US" },
      { "type": "profile-metric", "metricId": "met_placed_order", "measurement": "count", "operator": "greater_than", "value": 3, "timeframe": "all_time" }
    ]
  }
]
```

---

### 7. Template

| Field | Type | Example |
|-------|------|---------|
| id | string | `"tmpl_001"` |
| name | string | `"Welcome Email - Modern"` |
| category | string | `"outreach"` — one of: `outreach`, `reminders`, `confirmation`, `seasonal`, `promotional`, `custom` |
| channel | string | `"email"` |
| htmlContent | string | `"<html>..."` (simplified for mock) |
| previewImageUrl | string | `"/templates/welcome-modern.png"` |
| createdAt | string (ISO) | `"2024-03-01T10:00:00Z"` |
| updatedAt | string (ISO) | `"2025-01-15T14:30:00Z"` |
| tags | string[] | `["welcome", "onboarding"]` |

---

### 8. Metric

| Field | Type | Example |
|-------|------|---------|
| id | string | `"met_001"` |
| name | string | `"Placed Order"` |
| integration | string | `"Shopify"` |
| eventCount | number | `45230` |
| lastEventAt | string (ISO) | `"2025-03-20T15:45:00Z"` |

---

### 9. SignupForm

| Field | Type | Example |
|-------|------|---------|
| id | string | `"form_001"` |
| name | string | `"Homepage Newsletter Popup"` |
| type | string | `"popup"` — one of: `popup`, `embedded`, `flyout`, `full_page` |
| status | string | `"live"` — one of: `live`, `draft` |
| targetListId | string | `"list_001"` |
| views | number | `54230` |
| submissions | number | `3245` |
| conversionRate | number | `0.0598` |
| createdAt | string (ISO) | `"2024-06-01T10:00:00Z"` |
| updatedAt | string (ISO) | `"2025-02-15T11:00:00Z"` |

---

### 10. Tag

| Field | Type | Example |
|-------|------|---------|
| id | string | `"tag_001"` |
| name | string | `"spring-sale"` |

---

### 11. Account (Current User / Default User)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"acct_001"` |
| companyName | string | `"Acme Store"` |
| industry | string | `"E-commerce"` |
| website | string | `"https://acmestore.com"` |
| defaultSenderName | string | `"Acme Store"` |
| defaultSenderEmail | string | `"hello@acmestore.com"` |
| timezone | string | `"America/New_York"` |
| plan | string | `"growth"` |
| contactCount | number | `15234` |
| user | object | `{ name: "Sarah Johnson", email: "sarah@acmestore.com", role: "owner" }` |

---

## Entity Relationships

```
Account (1) ──── (*) Campaigns
Account (1) ──── (*) Flows
Account (1) ──── (*) Lists
Account (1) ──── (*) Segments
Account (1) ──── (*) Templates
Account (1) ──── (*) Metrics
Account (1) ──── (*) SignupForms

Campaigns (*) ──── (*) Lists/Segments (audience include/exclude)
Campaigns (*) ──── (1) Template
Flows (1) ──── (*) FlowActions
FlowActions (*) ──── (0..1) Template (for send_email actions)
Lists (*) ──── (*) Profiles (via profile.listIds)
Segments (*) ──── (*) Profiles (via profile.segmentIds)
SignupForms (*) ──── (1) List (target list)
Tags (*) ──── (*) Campaigns/Flows/Lists/Segments (many-to-many)
```

---

## `createInitialData()` Structure

```javascript
function createInitialData() {
  return {
    account: { /* single Account object */ },
    profiles: [ /* ~25 Profile objects */ ],
    campaigns: [ /* ~12 Campaign objects across statuses */ ],
    flows: [ /* ~8 Flow objects with nested actions */ ],
    lists: [ /* ~5 List objects */ ],
    segments: [ /* ~8 Segment objects */ ],
    templates: [ /* ~10 Template objects across categories */ ],
    metrics: [ /* ~10 Metric objects */ ],
    signupForms: [ /* ~4 SignupForm objects */ ],
    tags: [ /* ~10 Tag objects */ ],
    // UI state
    ui: {
      activePage: 'home',
      campaignFilters: { status: 'all', channel: 'all' },
      flowFilters: { status: 'all' },
      audienceTab: 'lists',
      analyticsDateRange: { start: '2025-02-20', end: '2025-03-20', comparison: true },
      selectedConversionMetric: 'revenue'
    }
  };
}
```

---

## Seed Data Scenarios (for agent training)

### Campaigns (12 total)
- 4 `sent` campaigns (mix of email + SMS, varying performance: one high-performer, one low)
- 3 `draft` campaigns (partially filled, one with audience set but no content)
- 3 `scheduled` campaigns (future dates, one for tomorrow)
- 2 `sent` SMS campaigns

### Flows (8 total)
- Welcome Series (live, 4 actions: email → delay → email → conditional split)
- Abandoned Cart (live, 3 actions: delay → email → delay → email)
- Post-Purchase Thank You (live, 2 actions: email → delay → email)
- Browse Abandonment (manual, 3 actions)
- Win-Back (draft, 2 actions)
- Birthday Flow (live, date-triggered, 1 action)
- VIP Loyalty (live, segment-triggered, 3 actions)
- Price Drop Alert (draft, price_drop triggered, 2 actions)

### Lists (5 total)
- Newsletter Subscribers (15,234 members)
- VIP Customers (2,341 members)
- SMS Subscribers (8,567 members)
- New Customers (Last 30 days) (1,234 members)
- Wholesale Contacts (456 members)

### Segments (8 total)
- VIP Customers - High LTV (starred)
- Engaged Last 30 Days
- Abandoned Cart - No Purchase
- Repeat Buyers (3+ orders)
- At-Risk Customers
- SMS Opt-Ins
- New Subscribers (Last 7 days)
- Lapsed Customers (90+ days inactive)

### Profiles (25 total)
- Mix of active/inactive, various locations, different purchase histories
- Some in multiple lists/segments, some in only one
- Varying consent states (email only, email+sms, unsubscribed)

### Templates (10 total)
- 3 Outreach (welcome, announcement, newsletter)
- 2 Reminders (abandoned cart, restock)
- 2 Confirmation (order, shipping)
- 2 Seasonal (spring sale, holiday)
- 1 Custom (blank template)

### Metrics (10 total)
- Placed Order, Viewed Product, Added to Cart, Started Checkout
- Received Email, Opened Email, Clicked Email
- Received SMS, Clicked SMS
- Active on Site
