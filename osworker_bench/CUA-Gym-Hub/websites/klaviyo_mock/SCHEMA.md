# klaviyo_mock Schema

**Base URL**: `https://cua-gym-xlaviyo.xlang.ai/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `account` | object | `{id, companyName, industry, website, defaultSenderName, defaultSenderEmail, timezone, plan, contactCount, user}` — `user`: `{name, email, role}` |
| `profiles` | array | ~25 records. Each: `{id, email, firstName, lastName, phone, location, title, organization, createdAt, lastActive, customProperties, predictedGender, predictedLTV, listIds[], segmentIds[], consent, tags[]}` — `consent`: `{email, sms}` where values are `"subscribed"`, `"not_subscribed"`, `"unsubscribed"` |
| `campaigns` | array | ~12 records. Each: `{id, name, status, channel, subject, previewText, senderName, senderEmail, templateId, audienceInclude[], audienceExclude[], sendStrategy, scheduledAt, sentAt, createdAt, updatedAt, tags[], trackingOptions, stats}` — `status`: `"draft"|"scheduled"|"sending"|"sent"` — `channel`: `"email"|"sms"` |
| `flows` | array | ~8 records. Each: `{id, name, status, triggerType, triggerDetails, createdAt, updatedAt, tags[], actions[], stats}` — `status`: `"draft"|"manual"|"live"` — `triggerType`: `"metric"|"list"|"segment"|"date"|"price_drop"` |
| `lists` | array | ~5 records. Each: `{id, name, type, memberCount, createdAt, updatedAt, tags[]}` — `type`: `"manual"|"single_opt_in"|"double_opt_in"` |
| `segments` | array | ~8 records. Each: `{id, name, isStarred, isActive, memberCount, conditionGroups[], createdAt, lastCalculated}` |
| `templates` | array | ~10 records. Each: `{id, name, category, channel, htmlContent, previewImageUrl, createdAt, updatedAt, tags[]}` — `category`: `"outreach"|"reminders"|"confirmation"|"seasonal"|"promotional"|"custom"` |
| `metrics` | array | ~10 records. Each: `{id, name, integration, eventCount, lastEventAt}` |
| `signupForms` | array | ~4 records. Each: `{id, name, type, status, targetListId, views, submissions, conversionRate, createdAt, updatedAt, config}` — `type`: `"popup"|"embedded"|"flyout"|"full_page"` — `status`: `"live"|"draft"` |
| `tags` | array | ~10 records. Each: `{id, name}` |
| `ui` | object | `{activePage, campaignFilters, flowFilters, audienceTab, analyticsDateRange, selectedConversionMetric}` |

### Campaign Stats (embedded in campaign.stats)

`{recipients, delivered, opens, uniqueOpens, clicks, uniqueClicks, bounced, unsubscribed, spamComplaints, revenue, ordersPlaced, openRate, clickRate, conversionRate}`

### Flow Actions (embedded in flow.actions[])

Each: `{id, flowId, type, position, parentId, branchType, config, stats}` — `type`: `"send_email"|"send_sms"|"time_delay"|"conditional_split"|"webhook"`

### Default IDs

- **Account**: `acct_001`
- **Profiles**: `prof_001` through `prof_025`
- **Campaigns**: `camp_001` through `camp_012`
- **Flows**: `flow_001` through `flow_008`
- **Lists**: `list_001` through `list_005`
- **Segments**: `seg_001` through `seg_008`
- **Templates**: `tmpl_001` through `tmpl_010`
- **Metrics**: `met_001` through `met_010`
- **Signup Forms**: `form_001` through `form_004`
- **Tags**: `tag_001` through `tag_010`

## Observable State Changes

| User Action | State Change | Path |
|-------------|-------------|------|
| Change date range selector | `ui.analyticsDateRange.label` updated | `ui.analyticsDateRange` |
| Change conversion metric | `ui.selectedConversionMetric` updated | `ui.selectedConversionMetric` |
| Filter campaigns by status | `ui.campaignFilters.status` updated | `ui.campaignFilters` |
| Filter campaigns by channel | `ui.campaignFilters.channel` updated | `ui.campaignFilters` |
| Search campaigns | `ui.campaignFilters.search` updated | `ui.campaignFilters` |
| Filter flows by status | `ui.flowFilters.status` updated | `ui.flowFilters` |
| Search flows | `ui.flowFilters.search` updated | `ui.flowFilters` |
| Switch audience tab | `ui.audienceTab` updated | `ui.audienceTab` |
| Create campaign (wizard) | New campaign added to `campaigns[]` | `campaigns` |
| Delete campaign | Campaign removed from `campaigns[]` | `campaigns` |
| Create segment | New segment added to `segments[]` | `segments` |
| Toggle segment star | `segments[].isStarred` toggled | `segments` |
| Change flow status | `flows[].status` updated | `flows` |
| Add flow action | New action added to `flows[].actions[]` | `flows` |
| Toggle signup form status | `signupForms[].status` toggled | `signupForms` |

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "account": {
      "id": "acct_001",
      "companyName": "Test Store",
      "user": { "name": "Test User", "email": "test@example.com", "role": "owner" }
    },
    "campaigns": [
      {
        "id": "camp_001",
        "name": "Test Campaign",
        "status": "draft",
        "channel": "email",
        "subject": "Test Subject",
        "senderName": "Test Store",
        "senderEmail": "hello@test.com",
        "audienceInclude": [],
        "audienceExclude": [],
        "sendStrategy": "immediate",
        "scheduledAt": null,
        "sentAt": null,
        "createdAt": "2025-03-20T10:00:00Z",
        "updatedAt": "2025-03-20T10:00:00Z",
        "tags": [],
        "trackingOptions": { "isTrackingOpens": true, "isTrackingClicks": true, "addUtm": true },
        "stats": { "recipients": 0, "delivered": 0, "opens": 0, "uniqueOpens": 0, "clicks": 0, "uniqueClicks": 0, "bounced": 0, "unsubscribed": 0, "spamComplaints": 0, "revenue": 0, "ordersPlaced": 0, "openRate": 0, "clickRate": 0, "conversionRate": 0 }
      }
    ]
  }
}
```

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Dashboard with revenue summary, top flows, recent campaigns |
| `/campaigns` | CampaignList | Campaign list with filters and tabs |
| `/campaigns/new` | CampaignCreate | Multi-step campaign creation wizard |
| `/campaigns/:id` | CampaignDetail | Campaign details and stats |
| `/flows` | FlowList | Flow list with filters and tabs |
| `/flows/:id` | FlowBuilder | Visual flow builder with node editing |
| `/signup-forms` | SignupFormList | Sign-up form list and detail view |
| `/audience/lists-segments` | AudienceLists | Lists and segments with tabs |
| `/audience/profiles` | ProfileList | Searchable profile list with pagination |
| `/audience/profiles/:id` | ProfileDetail | Profile detail with activity, properties, consent |
| `/content/templates` | TemplateList | Template library with category filters |
| `/content/brand` | BrandSettings | Brand colors and assets configuration |
| `/analytics/dashboards` | AnalyticsDashboard | Overview dashboard with performance cards |
| `/analytics/metrics` | MetricsList | Metrics list and detail view |
| `/analytics/benchmarks` | Benchmarks | Industry benchmark comparisons |
| `/go` | Go | State inspection endpoint (JSON output) |
