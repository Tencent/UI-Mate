# mailchimp_mock Schema

**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Active account user: `{id, firstName, lastName, email, company, timezone, avatar, plan, monthlyEmailLimit, emailsSentThisMonth, defaultFromName, defaultFromEmail, defaultReplyTo, billingCycle, nextBillDate, monthlyPrice}` |
| `audiences` | array | Audiences/lists. Each: `{id, name, stats, defaultFromName, defaultFromEmail, createdAt, growthHistory[]}` -- `stats`: `{totalContacts, subscribed, unsubscribed, cleaned, nonSubscribed}` |
| `contacts` | array | ~520 contacts. Each: `{id, email, firstName, lastName, phone, address, tags[], status, audienceId, signupSource, signupDate, lastChanged, emailActivity, rating}` -- `status`: `"subscribed"`, `"unsubscribed"`, `"cleaned"`, `"non-subscribed"` |
| `tags` | array | Contact tags. Each: `{id, name, contactCount, createdAt}` |
| `segments` | array | Saved segments. Each: `{id, audienceId, name, conditions[], conditionMatch, memberCount, type, createdAt, updatedAt}` |
| `campaigns` | array | Email campaigns. Each: `{id, audienceId, name, subject, previewText, type, status, fromName, fromEmail, replyTo, templateId, content, settings, recipientCount, schedule, stats, createdAt, updatedAt, sentAt}` -- `status`: `"draft"`, `"scheduled"`, `"sending"`, `"sent"`, `"paused"` -- `stats`: `{sent, delivered, opened, clicked, bounced, unsubscribed, openRate, clickRate}` |
| `templates` | array | Email templates. Each: `{id, name, category, thumbnail, html, createdAt, updatedAt}` |
| `automations` | array | Marketing automations. Each: `{id, name, trigger, steps[], status, audienceId, stats, createdAt, updatedAt}` -- `status`: `"active"`, `"paused"`, `"draft"` |
| `contentFiles` | array | Content studio files. Each: `{id, name, url, type, size, createdAt}` |
| `landingPages` | array | Landing pages. Each: `{id, name, url, status, template, audienceId, visits, signups, conversionRate, createdAt, updatedAt, publishedAt}` |
| `signupForms` | array | Signup/embed forms. Each: `{id, name, type, audienceId, fields[], subscribers, status, createdAt}` |
| `surveys` | array | Surveys. Each: `{id, name, description, status, questions[], responses, completionRate, audienceId, createdAt, updatedAt}` |
| `notifications` | array | In-app notifications. Each: `{id, type, title, message, read, createdAt, link, actionLabel}` |
| `ecommerce` | object | E-commerce stats: `{connected, platform, storeName, totalRevenue, totalOrders, averageOrderValue, topProducts[]}` |

### Default user ID
`user_1` (Rakesh Mondal)

### Default audience ID
`aud_1` (Acme Marketing Audience)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "user": {
      "id": "user_1",
      "firstName": "Rakesh",
      "lastName": "Mondal",
      "email": "rakesh@acmemarketing.com",
      "company": "Acme Marketing Co.",
      "timezone": "America/New_York",
      "plan": "Standard",
      "monthlyEmailLimit": 50000,
      "emailsSentThisMonth": 8521,
      "defaultFromName": "Acme Marketing",
      "defaultFromEmail": "hello@acmemarketing.com"
    },
    "audiences": [
      { "id": "aud_1", "name": "Acme Marketing Audience", "stats": { "totalContacts": 2847, "subscribed": 2340, "unsubscribed": 312, "cleaned": 95, "nonSubscribed": 100 } }
    ],
    "contacts": [],
    "tags": [],
    "segments": [],
    "campaigns": [],
    "templates": [],
    "automations": [],
    "contentFiles": [],
    "landingPages": [],
    "signupForms": [],
    "surveys": [],
    "notifications": [],
    "ecommerce": { "connected": false }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Create campaign | `campaigns` array grows by 1 |
| Send campaign | `campaigns[i].status` → `"sent"`; `campaigns[i].sentAt` set; `user.emailsSentThisMonth` increases |
| Schedule campaign | `campaigns[i].status` → `"scheduled"`; `campaigns[i].schedule` set |
| Pause campaign | `campaigns[i].status` → `"paused"` |
| Delete campaign | `campaigns` array shrinks |
| Edit campaign subject | `campaigns[i].subject` updated |
| Add contact | `contacts` array grows; `audiences[i].stats.totalContacts` increases |
| Delete contact | `contacts` array shrinks; audience stats updated |
| Update contact | `contacts[i]` fields modified |
| Subscribe/unsubscribe contact | `contacts[i].status` toggled |
| Add tag to contact | `contacts[i].tags[]` updated; `tags[i].contactCount` increases |
| Create tag | `tags` array grows |
| Create segment | `segments` array grows |
| Create template | `templates` array grows |
| Create automation | `automations` array grows |
| Activate/pause automation | `automations[i].status` toggled |
| Create landing page | `landingPages` array grows |
| Publish landing page | `landingPages[i].status` → `"published"`; `publishedAt` set |
| Mark notification read | `notifications[i].read` → `true` |
| Create signup form | `signupForms` array grows |
| Upload content file | `contentFiles` array grows |
