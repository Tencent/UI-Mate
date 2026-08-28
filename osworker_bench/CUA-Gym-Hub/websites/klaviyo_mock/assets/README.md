# Xlaviyo Mock — Research Summary

## App Overview

Xlaviyo is a B2C CRM and marketing automation platform focused on e-commerce. It enables businesses to create and manage email campaigns, SMS messages, and automated marketing flows. The platform emphasizes data-driven segmentation, personalized messaging, and revenue attribution analytics.

**Category:** Marketing Automation / Email Marketing SaaS
**Primary Users:** E-commerce marketers, marketing managers, growth teams
**Distinguishing Features:** Deep e-commerce integration (Shopify), flow-based automation builder, predictive analytics, revenue attribution

---

## Key User Personas & Primary Workflows

### Email Marketing Manager
1. Create and send email campaigns to segmented audiences
2. Build automated flows (welcome series, abandoned cart, post-purchase)
3. Monitor campaign performance (open rates, click rates, revenue)
4. Manage audience lists and segments
5. Design email templates with drag-and-drop editor

### Growth Marketer
1. Analyze marketing performance dashboards
2. Create and refine audience segments based on behavior
3. Set up A/B tests for campaigns
4. Review revenue attribution (campaigns vs flows)
5. Manage sign-up forms for lead capture

---

## Complete Feature List

### P0 — Core Shell (Must have for app to render)
- **Left sidebar navigation** with Xlaviyo logo, search bar, and nav items
- **Top bar** with search, notifications bell, account menu, "Support" link
- **Routing** between all major views
- **Home dashboard** with business performance summary

### P1 — Primary Features (Core interactive workflows)

1. **Home Dashboard**
   - Business Performance Summary card (total revenue, attributed revenue, campaigns vs flows split)
   - Top Performing Flows card (up to 6 flows with status, delivery count, conversions)
   - Recent Campaigns card (campaign name, send date, open rate, click rate, revenue)
   - Date range selector (up to 180 days)
   - Conversion metric dropdown

2. **Campaigns**
   - Campaign list view with tabs: All, Draft, Scheduled, Sent
   - 30-day email performance summary at top
   - Each campaign row: name, status badge, channel icon (email/SMS), send date, recipients, open rate, click rate, revenue
   - "Create campaign" button → campaign creation wizard
   - Campaign creation: choose channel (Email/SMS) → set audience (include/exclude lists/segments) → content step (subject line, preview text, sender name, sender email, template choice: drag-and-drop / text-only / HTML) → review & schedule/send
   - Campaign detail/analytics view with delivery stats

3. **Flows (Automation Builder)**
   - Flow list view with tabs: All, Live, Manual, Draft
   - Each flow row: name, status badge, trigger type, # of actions, last edited
   - "Create flow" button → choose trigger → visual flow builder
   - Flow builder: vertical node-based canvas with trigger at top, connected actions below
   - Node types: Trigger (event-based), Email action, SMS action, Time Delay, Conditional Split, Webhook
   - Left panel showing selected node details (content, analytics for 30 days: delivered, open rate, click rate)
   - Flow statuses: Draft, Manual, Live
   - "Save & Exit", "Manage Flow" dropdown, "Show Analytics" toggle in top bar

4. **Audience > Lists & Segments**
   - Combined view with tabs: Lists, Segments
   - Lists tab: list name, member count, created date, opt-in process type
   - Segments tab: segment name, member count, last calculated, conditions summary
   - "Create List" / "Create Segment" buttons
   - Segment builder: condition groups (AND between groups, OR within group), condition types (profile property, metric/event, list membership, location, predictive analytics)
   - Star/favorite segments

5. **Audience > Profiles**
   - Profile list with search/filter
   - Each profile: email, name, location, last active date
   - Profile detail view: contact info, activity timeline, list/segment membership, predictive analytics, custom properties

6. **Analytics > Dashboards**
   - Overview dashboard (pre-built) with 7 cards:
     - Conversion Summary (stacked bar: flows vs campaigns revenue)
     - Campaign Performance (line chart: opens, clicks, conversions + benchmark badges like "Good", "Excellent")
     - Campaign Performance Detail (table: campaign name, delivered, opens, clicks, orders, revenue)
     - Flows Performance (line chart with channel filter)
     - Flows Performance Detail (table: flow name, delivered, opens, clicks, orders, revenue)
     - Performance Highlights (top/bottom performing)
     - Email Deliverability (bounce, spam, unsubscribe rates)
   - Date range selector, conversion metric selector, comparison period toggle
   - "Create Report" button for custom dashboards

7. **Analytics > Metrics**
   - List of all tracked metrics/events
   - Each metric: name, event count, trend sparkline
   - Metric detail: time-series chart, breakdown by property

8. **Sign-up Forms**
   - Form list: name, type (popup/embedded/flyout), status (Live/Draft), views, submissions, conversion rate
   - "Create sign-up form" button
   - Form builder with template selection

### P2 — Secondary Features (Depth and realism)

9. **Content > Templates**
   - Email template library with thumbnail previews
   - Template categories: Outreach, Reminders, Confirmation, Seasonal
   - "Create template" button
   - Template detail with preview

10. **Content > Images & Brand**
    - Image library/gallery with upload
    - Brand settings: colors, fonts, logo

11. **Analytics > Benchmarks**
    - Industry benchmark comparisons
    - Performance rating badges (Good, Excellent, Needs Improvement)

12. **Reviews** (Product reviews section)
    - Review list with ratings
    - Review moderation

13. **Settings page**
    - Account settings, sender defaults, tracking options
    - Integrations list

---

## UI Layout Description (from screenshots)

### Color Palette
- **Background:** #FFFFFF (white main content), #F7F7F7 (light gray page background)
- **Sidebar:** #FFFFFF with #F7F7F7 hover, left border
- **Primary text:** #1A1A1A (near black)
- **Secondary text:** #6B6B6B (gray)
- **Primary accent:** #000000 (black for Xlaviyo logo/branding)
- **Link/active color:** #0D6EFD (blue) for active nav items
- **Active nav highlight:** Light blue/teal left border + blue text on active sidebar item
- **Success green:** #28A745 (for "Good"/"Excellent" badges)
- **Warning red:** #DC3545 (for negative percentage changes)
- **Positive green:** #28A745 (for positive percentage changes)
- **Badge backgrounds:** Light green (#E8F5E9), light yellow (#FFF8E1)
- **Borders:** #E0E0E0 (light gray)
- **Card shadows:** subtle drop shadow on white cards

### Sidebar Layout (from screenshots)
- **Width:** ~220px
- **Logo:** "xlaviyo" wordmark with trademark symbol, top-left, black text on white, ~16px height
- **Search bar:** directly below logo area, with magnifying glass icon, placeholder "Search", keyboard shortcut hint (Cmd+K)
- **Nav items (top to bottom):**
  - Home (house icon)
  - Campaigns (play/send icon)
  - Flows (branch/flow icon)
  - Sign-up forms (document icon)
  - **Audience** (people icon, expandable ▾)
    - Lists & segments (indented sub-item)
    - Profiles (indented sub-item)
  - **Content** (pencil/edit icon, expandable ▾)
    - Templates (indented)
    - Images & Brand (indented)
  - **Analytics** (chart icon, expandable ▾)
    - Dashboards (indented, highlighted blue when active)
    - Metrics (indented)
    - Benchmarks (indented)
- **Bottom of sidebar:**
  - Upgrade prompt (for free tier) with feature bullets
  - Account avatar + account name + email

### Top Bar
- Right side: notification bell, "Account Plans" button, "Support" link, "Close" button (context-dependent)

### Main Content Area
- Left padding: ~32px from sidebar edge
- Page title: large bold text (~24px), e.g., "Overview dashboard"
- Cards: white background, rounded corners (~8px), subtle shadow, padding ~24px
- Tables: clean rows with subtle borders, header row in bold

---

## Data Model Overview
See `data_model.md` for full entity definitions and `createInitialData()` structure.

**Entity types:** Campaigns, Flows, FlowActions, Lists, Segments, Profiles, Templates, Metrics, Events, SignupForms, Tags

---

## Out of Scope
- Authentication / login / signup (app starts pre-logged-in)
- Real email/SMS sending
- Shopify or other real integrations
- Drag-and-drop email template editor (simplified version only)
- Real-time flow execution
- Billing / plan management
- AI features (AI-generated content, smart send time)

---

## Screenshot Inventory

| File | Description |
|------|-------------|
| `dashboard_overview.jpg` | Analytics > Dashboards showing "Overview dashboard" with Campaign Performance card, sidebar fully visible |
| `campaigns_dashboard.jpg` | Same as above, larger resolution showing sidebar nav structure clearly |
| `api_sidebar_nav.jpg` | Full sidebar visible with expanded Audience section (Growth tools, Lists & segments, Profiles) and notification bar |
| `000003.jpg` | Campaign content creation step: subject line, preview text, sender name, sender email fields + template type selection (Drag and drop / Text only / HTML) |
| `campaigns_features.jpg` | Flow builder: visual node canvas with Trigger ("Placed Order") → Email action → Trigger Split; left panel shows email content details and 30-day analytics |
| `000002.jpg` | Xlaviyo marketing homepage showing segments panel and revenue summary card |
