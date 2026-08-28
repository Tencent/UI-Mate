# hubspot_marketing_mock Schema

**Base URL**: `http://localhost:5174/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Active user: `{id, firstName, lastName, email, avatar, role, company, timezone}` |
| `users` | array | All team members; each: `{id, firstName, lastName, email, role}` |
| `contacts` | array | CRM contacts; each: `{id, firstName, lastName, email, phone, company, companyId, jobTitle, lifecycleStage, leadStatus, contactOwner, createDate, lastActivityDate, source, marketingStatus, city, state, country, tags[], notes}` |
| `activities` | object | Keyed by contactId → array of `{id, type, title, body, timestamp, createdBy}`; `type` one of `email`, `call`, `note`, `form_submission`, `task` |
| `companies` | array | Each: `{id, name, domain, industry, employeeCount, annualRevenue, city, state, country, phone, owner, createDate, contactCount}` |
| `deals` | array | Each: `{id, name, stage, amount, closeDate, contactId, companyId, owner, pipeline, createDate}` |
| `emails` | array | Marketing emails; each: `{id, name, subject, previewText, status, type, fromName, fromEmail, replyTo, listIds[], campaignId, scheduledDate, sentDate, createdDate, updatedDate, createdBy, stats, content: {blocks[]}}` — `status`: `draft`, `scheduled`, `sent`, `archived`, `automated`; `stats`: `{sent, delivered, opened, clicked, bounced, unsubscribed, openRate, clickRate, ...}` or `null` |
| `campaigns` | array | Each: `{id, name, status, goal, startDate, endDate, owner, createdDate, budget, assets: {emails[], landingPages[], forms[], socialPosts[], workflows[], ctas[]}, metrics: {sessions, newContacts, influencedContacts, closedDeals, revenue}}` — `status`: `active`, `draft`, `completed`, `paused` |
| `forms` | array | Each: `{id, name, type, status, views, submissions, submissionRate, createdDate, updatedDate, campaignId, fields[], settings: {submitButtonText, redirectUrl, thankYouMessage, notifyEmails[], lifecycleStage}}` — `type`: `embedded`, `popup`, `standalone`, `slide_in`; each field: `{id, type, label, required, placeholder, options[]}` |
| `workflows` | array | Each: `{id, name, type, status, enrolledCount, enrolledCurrently, createdDate, updatedDate, createdBy, trigger: {type, description, filterGroups[]}, nodes[]}` — each node: `{id, type, actionType, config, nextNodeId}`; node types: `email`, `delay`, `branch`, `action` |
| `lists` | array | Each: `{id, name, type, size, createdDate, updatedDate, filters[], createdBy}` — `type`: `active`, `static` |
| `landingPages` | array | Each: `{id, name, slug, status, publishDate, views, submissions, conversionRate, newContacts, campaignId, createdDate, updatedDate}` |
| `ctas` | array | Each: `{id, name, type, text, url, color, views, clicks, clickRate, status, createdDate, campaignId}` — `type`: `button`, `popup`, `slide_in`, `banner` |
| `dashboards` | array | Each: `{id, name, isDefault, reports[]}` (reports is an array of report IDs) |
| `reports` | array | Each: `{id, name, type, dashboardId, dateRange, metric, data, position}` — `type`: `number`, `line_chart`, `bar_chart`, `donut_chart`, `table` |
| `socialPosts` | array | Each: `{id, platform, content, status, scheduledDate, publishedDate, campaignId, metrics: {likes, shares, comments, clicks, impressions}}` — `platform`: `facebook`, `twitter`, `linkedin`, `instagram`; `status`: `draft`, `scheduled`, `published` |
| `notifications` | array | Each: `{id, type, message, timestamp, read}` |
| `settings` | object | `{general: {accountName, timezone, dateFormat, currency}, email: {defaultFromName, defaultFromEmail, footerInfo}, marketing: {utmTracking, utmSource, utmMedium}, forms: {thankYouMessage, notificationEmails, gdprConsent}, social: {autoPublish}, integrations: {salesforce, "google-analytics", zapier, wordpress, mailchimp, hubdb}}` |
| `selectedDashboardId` | string | Currently displayed dashboard ID |
| `sidebarCollapsed` | boolean | Whether sidebar is in icon-only mode |
| `activeSection` | string | Currently active sidebar section |

### Default IDs

**Users**: `user-1` (Sarah Johnson, currentUser), `user-2` (Michael Chen), `user-3` (Emily Rivera), `user-4` (David Park)

**Contacts**: `contact-1` through `contact-18`

**Companies**: `company-1` (TechFlow Solutions) through `company-8` (Pacific Rim Consulting)

**Deals**: `deal-1` through `deal-7`

**Emails**: `email-1` through `email-10`

**Campaigns**: `campaign-1` (Q2 Product Launch) through `campaign-5` (Holiday Promotion 2024)

**Forms**: `form-1` (Newsletter Signup) through `form-6` (Gated Content Download)

**Workflows**: `workflow-1` (Welcome Email Series) through `workflow-5` (Webinar Follow-up)

**Lists**: `list-1` (All Marketing Contacts) through `list-7` (VIP Accounts)

**Landing Pages**: `lp-1` through `lp-5`

**CTAs**: `cta-1` through `cta-4`

**Dashboards**: `dashboard-1` (Marketing Performance), `dashboard-2` (Email Analytics)

**Reports**: `report-1` through `report-12`

**Social Posts**: `social-1` through `social-10`

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user-1",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "sarah.johnson@acmecorp.com",
      "role": "Marketing Manager",
      "company": "Acme Corp",
      "timezone": "America/New_York"
    },
    "users": [
      { "id": "user-1", "firstName": "Sarah", "lastName": "Johnson", "email": "sarah.johnson@acmecorp.com", "role": "Marketing Manager" }
    ],
    "contacts": [
      { "id": "contact-1", "firstName": "Brian", "lastName": "Halligan", "email": "brian.halligan@techflow.com", "phone": "+1 (617) 555-0123", "company": "TechFlow Solutions", "companyId": "company-1", "jobTitle": "VP of Marketing", "lifecycleStage": "customer", "leadStatus": "open_deal", "contactOwner": "user-1", "createDate": "2024-01-15T10:30:00Z", "lastActivityDate": "2025-03-20T14:22:00Z", "source": "organic_search", "marketingStatus": "marketing", "tags": [], "notes": "" }
    ],
    "activities": {},
    "companies": [],
    "deals": [],
    "emails": [],
    "campaigns": [],
    "forms": [],
    "workflows": [],
    "lists": [],
    "landingPages": [],
    "ctas": [],
    "dashboards": [{ "id": "dashboard-1", "name": "Marketing Performance", "isDefault": true, "reports": [] }],
    "reports": [],
    "socialPosts": [],
    "notifications": [],
    "settings": {
      "general": { "accountName": "Acme Corp", "timezone": "America/New_York", "dateFormat": "MM/DD/YYYY", "currency": "USD" },
      "email": { "defaultFromName": "Acme Corp Marketing", "defaultFromEmail": "marketing@acmecorp.com", "footerInfo": "" },
      "marketing": { "utmTracking": true, "defaultLifecycleStage": "lead" }
    },
    "selectedDashboardId": "dashboard-1"
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Create contact | `contacts` array grows by 1 |
| Edit contact property (inline edit) | `contacts[i].<field>` updated |
| Delete contact(s) | `contacts` array shrinks |
| Add note to contact | `activities[contactId]` array grows by 1 with `type: "note"` |
| Mark notifications as read | `notifications[i].read` → `true` |
| Create email | `emails` array grows by 1 |
| Save email changes | `emails[i]` updated (`name`, `subject`, `content`, `fromName`, `fromEmail`, etc.) |
| Create campaign | `campaigns` array grows by 1 |
| Create form | `forms` array grows by 1 |
| Save form changes | `forms[i]` updated (fields, settings, name) |
| Publish form | `forms[i].status` → `"published"` |
| Create workflow | `workflows` array grows by 1 |
| Delete workflow | `workflows` array shrinks |
| Activate workflow (Turn on) | `workflows[i].status` → `"active"` |
| Create list | `lists` array grows by 1 |
| Create social post | `socialPosts` array grows by 1 |
| Switch active dashboard | `selectedDashboardId` changes |
| Save settings (General) | `settings.general` fields updated |
| Save settings (Email) | `settings.email` fields updated |
| Save settings (Marketing) | `settings.marketing` fields updated (`utmTracking`, `utmSource`, `utmMedium`) |
| Save settings (Forms) | `settings.forms` fields updated (`thankYouMessage`, `notificationEmails`, `gdprConsent`) |
| Save settings (Social) | `settings.social.autoPublish` toggled |
| Toggle integration | `settings.integrations.<key>` boolean toggled |
