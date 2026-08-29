# Xlaviyo Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

- [x] Project scaffold: `npm create vite@latest klaviyo_mock -- --template react`, install deps (`react-router-dom`). No Tailwind — use plain CSS to match Xlaviyo's clean SaaS aesthetic.

- [x] **Visual design system**: Study `assets/screenshots/dashboard_overview.jpg` and `assets/screenshots/campaigns_dashboard.jpg`. The design uses a clean, minimal SaaS style. Exact values:
  - **Primary background:** `#FFFFFF` (cards, sidebar)
  - **Page background:** `#F7F7F8` (light gray behind cards)
  - **Primary text:** `#1A1A1A`
  - **Secondary text:** `#6B6B6B`
  - **Xlaviyo brand:** `#000000` (logo/wordmark)
  - **Active nav text/indicator:** `#0066FF` (blue, with light blue-tinted left border bar on active sidebar item)
  - **Success/Good badge:** `#28A745` text on `#E8F5E9` background
  - **Danger/negative %:** `#DC3545`
  - **Positive %:** `#28A745`
  - **Borders:** `#E5E5E5`
  - **Card shadow:** `0 1px 3px rgba(0,0,0,0.08)`
  - **Font family:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - **Font sizes:** Page title 24px bold, card title 16px semibold, body 14px, small/label 12px
  - **Sidebar width:** 220px
  - **Border radius:** 8px for cards, 4px for inputs/buttons

- [x] **App layout** (see `assets/screenshots/dashboard_overview.jpg`): Fixed left sidebar (220px wide, full viewport height, white background, left-aligned). Top area of sidebar: "xlaviyo" wordmark logo (~28px font, black, with trademark superscript dot). Below logo: search input (full sidebar width minus padding, gray border, magnifying glass icon, placeholder "Search", hint "Cmd+K"). Below search: vertical nav items. Main content area fills remaining width with `#F7F7F8` background, 32px padding. No separate top bar — Xlaviyo uses the sidebar as primary navigation with only a subtle top-right area for notifications/support on some pages.

- [x] **Sidebar navigation items** (from screenshots, top to bottom):
  1. **Home** — house icon, route `/`
  2. **Campaigns** — play-triangle icon, route `/campaigns`
  3. **Flows** — branch/fork icon, route `/flows`
  4. **Sign-up forms** — clipboard/form icon, route `/signup-forms`
  5. **Audience** — people/group icon, expandable section:
     - Lists & segments → `/audience/lists-segments`
     - Profiles → `/audience/profiles`
  6. **Content** — pencil/edit icon, expandable section:
     - Templates → `/content/templates`
     - Images & Brand → `/content/brand`
  7. **Analytics** — chart-bar icon, expandable section:
     - Dashboards → `/analytics/dashboards`
     - Metrics → `/analytics/metrics`
     - Benchmarks → `/analytics/benchmarks`
  - **Bottom of sidebar:** Account section — small avatar circle (initials), account name "Acme Store", user email below. Clicking opens account dropdown.
  - Active item: blue text + blue 3px left border bar + light blue-tinted background
  - Hover: light gray background `#F5F5F5`
  - Expandable sections: chevron icon rotates on expand, sub-items indented ~16px

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes: `/` (Home), `/campaigns` (CampaignList), `/campaigns/new` (CampaignCreate), `/campaigns/:id` (CampaignDetail), `/flows` (FlowList), `/flows/:id` (FlowBuilder), `/signup-forms` (SignupFormList), `/audience/lists-segments` (AudienceLists), `/audience/profiles` (ProfileList), `/audience/profiles/:id` (ProfileDetail), `/content/templates` (TemplateList), `/content/brand` (BrandSettings), `/analytics/dashboards` (AnalyticsDashboard), `/analytics/metrics` (MetricsList), `/analytics/benchmarks` (Benchmarks), `/go` (StateInspector)

- [x] **State management**: `AppContext.jsx` + `utils/dataManager.js`. `dataManager.js` exports `createInitialData()` returning all entities as defined in `assets/data_model.md`. Context provides `state`, `dispatch`, and helper functions for CRUD on each entity. Persist to `localStorage` under key `"klaviyo_mock_state"`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Returns JSON with `{ initial_state, current_state, state_diff }`. Computes diff by deep-comparing initial vs current state, showing added/modified/removed items per entity type.

- [x] **Session isolation**: `vite.config.js` mock-api plugin. `POST /post?sid=<sid>` accepts `{ action: "set"|"set_current"|"reset", state: {...} }`. `GET /go?sid=<sid>` returns `{ initial_state, current_state, state_diff }`. `GET /state?sid=<sid>` returns current state. Session state stored in memory on dev server, keyed by `sid`.

---

## P1 — Primary Features

### Home Dashboard (`/`)

- [x] **Home page layout**: Page title "Home" at top. Three white cards stacked vertically. Date range selector dropdown in top-right (options: "Last 7 days", "Last 30 days", "Last 90 days", "Last 180 days") with comparison toggle. Conversion metric dropdown ("Revenue" / "Conversions").

- [x] **Business Performance Summary card**: Large total revenue number (e.g., "$450,455") in 32px bold with green percentage change badge next to it. Label "Total Xlaviyo attributed revenue". Below: donut or horizontal bar showing Campaigns vs Flows split with dollar amounts and percentages (e.g., "Campaigns $342,346 (76%)" with yellow dot, "Flows $108,109 (24%)" with green dot).

- [x] **Top Performing Flows card**: Title "Top performing flows". Table with up to 6 rows. Columns: Flow name (link), Status badge (green "Live" / yellow "Manual" / gray "Draft"), channel icons (email/SMS), Delivered count, Conversions count, % change from previous period. "View all flows" link at bottom.

- [x] **Recent Campaigns card**: Title "Recent campaigns". Table showing last 5-8 sent campaigns. Columns: Campaign name (link), Send date/time, channel icon, Open rate %, Click rate %, Revenue. "View all campaigns" link at bottom.

### Campaigns (`/campaigns`)

- [x] **Campaign list page**: Page title "Campaigns". Top-right: "Create campaign" button (black background, white text, rounded). Below title: tab bar with "All", "Draft", "Scheduled", "Sent" — count badge on each tab. Below tabs: search input + filter dropdowns (Channel: All/Email/SMS, Tag filter).

- [x] **Campaign list table**: Columns: checkbox, Campaign name (bold, clickable link), Status badge (gray "Draft", blue "Scheduled" with date, green "Sent"), Channel icon (envelope for email, phone for SMS), Send date, Recipients count, Open rate % (with colored bar indicator), Click rate %, Revenue. Hover row: light gray background. Bulk actions bar appears when checkboxes selected (Archive, Tag, Delete).

- [x] **Campaign detail page** (`/campaigns/:id`): For sent campaigns — page title = campaign name, status badge. Summary cards at top: Recipients, Delivered, Open Rate (with "Good"/"Excellent" badge), Click Rate (with badge), Revenue, Orders Placed. Below: line chart showing opens/clicks over time since send. Below chart: "Recipient Activity" table showing individual profile opens/clicks.

- [x] **Campaign creation wizard** (`/campaigns/new`): Multi-step flow:
  - **Step 1 — Type**: Choose "Email" or "SMS" (two large cards to click)
  - **Step 2 — Audience**: "Send to" section with dropdown to select lists/segments to include. "Don't send to" section with dropdown to exclude lists/segments. Smart sending toggle checkbox.
  - **Step 3 — Content** (see `assets/screenshots/000003.jpg`): Subject line input, preview text input, sender name input, sender email input (with "Use this as your reply-to address" checkbox). Right side: template type selection — three cards: "Drag and drop" (marked "Popular"), "Text only", "HTML". For mock: clicking any card shows a simple template preview/editor placeholder.
  - **Step 4 — Review**: Summary of all settings. "Schedule" button (opens datetime picker) or "Send now" button. "Back" button to return to previous step.
  - Stepper/progress indicator at top showing current step (1-4).

### Flows (`/flows`)

- [x] **Flow list page**: Page title "Flows". Top-right: "Create flow" button (black). Tab bar: "All", "Live", "Manual", "Draft" with count badges. Search input + tag filter. Table columns: checkbox, Flow name (bold, clickable), Status badge (green "Live" / yellow "Manual" / gray "Draft"), Trigger type description (e.g., "When someone is added to Newsletter Subscribers"), # of messages/actions, Last updated date. Hover row highlight. Bulk actions on checkbox select.

- [x] **Flow builder page** (`/flows/:id`) (see `assets/screenshots/campaigns_features.jpg`): Top bar with flow name (editable inline), status dropdown, "Show Analytics" toggle button, "Manage Flow" dropdown (Rename, Archive, Delete), "Save & Exit" button. Main area: vertical flowchart canvas. Trigger node at top (rounded rectangle with lightning bolt icon, e.g., "When someone Placed Order" in bold). Below trigger: "Trigger Filters (N)" expandable link. Connected by vertical line to action nodes below. Each action node is a white card with icon (envelope for email, phone for SMS, clock for delay, fork for split), action label, status badge (Draft/Live). On hover: small action icons appear below node (edit, preview, delete, reorder). Clicking a node: left side panel slides in showing node details.

- [x] **Flow builder — Left detail panel** (see `assets/screenshots/campaigns_features.jpg`): When an email node is selected, panel shows: Node name (editable, e.g., "Email #1"), "CONTENT" section (Subject line, From address, "Edit" and "Preview" buttons, "+ Add Variation" link), "ANALYTICS (30 DAYS)" section (Delivered, Open Rate, Click Rate, Cancelled Order Rate — each as label + value), "SETTINGS" section (gear icon, send options). Panel width ~280px.

- [x] **Flow builder — Add action**: "+" button between nodes. Clicking shows dropdown: "Send Email", "Send SMS", "Time Delay" (configure hours/days), "Conditional Split" (configure conditions), "Webhook". Adding inserts a new node in the chain.

### Audience — Lists & Segments (`/audience/lists-segments`)

- [x] **Lists & Segments page**: Page title "Lists & segments". Two tab buttons: "Lists" and "Segments" (underlined active tab). "Create List" / "Create Segment" button (changes based on active tab).

- [x] **Lists tab**: Table columns: checkbox, List name (bold, clickable), Member count, Type (Single opt-in / Double opt-in / Manual), Created date, Last updated. Click list name → list detail showing member table with profile rows.

- [x] **Segments tab**: Table columns: checkbox, Star icon (toggle favorite, filled yellow when starred), Segment name (bold, clickable), Member count, Conditions summary (truncated text, e.g., "Location = US AND Orders > 3"), Last calculated timestamp. Click segment name → segment detail page.

- [x] **Create Segment modal/page**: Segment name input at top. "Definition" section: Condition group builder. Each group is a card with "Add condition" button inside. Conditions within a group joined by "OR" label. Groups joined by "AND" label between cards. Each condition row: type dropdown (Profile property / Has done metric / List membership / Location / Predictive analytics), property selector, operator dropdown (equals, greater than, contains, etc.), value input. "Add condition group" button below. "Create Segment" primary button. Live member count preview on right side.

### Audience — Profiles (`/audience/profiles`)

- [x] **Profile list page**: Page title "Profiles". Search bar (search by email or name). Table columns: Email (bold, link), First Name, Last Name, Location (city, state), Last Active (relative time, e.g., "3 days ago"), Lists count, Consent status icons (email check / SMS check). Pagination at bottom (showing "1-25 of 15,234").

- [x] **Profile detail page** (`/audience/profiles/:id`): Left column (~60%): Profile header (large name, email below, location). Tabs: "Activity", "Properties", "Lists & Segments". Activity tab: reverse-chronological event timeline (event name, timestamp, details — e.g., "Placed Order — $65.44 — 2 items"). Properties tab: table of all custom properties (key-value pairs, editable). Lists & Segments tab: two sections showing list memberships and segment memberships. Right column (~40%): "Predictive Analytics" card (Predicted LTV, Predicted Gender, Churn Risk), "Consent" card (Email status, SMS status).

### Analytics — Dashboards (`/analytics/dashboards`)

- [x] **Overview Dashboard page** (see `assets/screenshots/dashboard_overview.jpg`): Page title "Overview dashboard". Top controls: date range selector, conversion metric dropdown, comparison period toggle. Cards arranged vertically:

- [x] **Campaign Performance card**: Title "Campaign Performance". Dropdown "All campaigns" filter. Large number = total campaign recipients (e.g., "8,483" in 32px bold) with green percentage change. Label "Total campaign recipients". Below: three metric rows, each with colored dot (blue/green/yellow), metric name ("Open rate", "Click rate", "Placed Order rate"), quality badge ("Good" green / "Excellent" green with checkmark), percentage value, and percentage change (red if negative). Right side: small line chart showing trend over date range.

- [x] **Campaign Performance Detail card**: Title "Campaign Performance Detail". Table with columns: Campaign Name, Delivered, Opens, Clicks, Orders, Revenue. Sortable by clicking column headers. Rows for each sent campaign.

- [x] **Flows Performance card**: Similar to Campaign Performance but for flows. Title "Flows Performance". Large number for total flow recipients. Same three metric rows (Open rate, Click rate, Conversion rate). Channel filter tabs (Email / SMS). Line chart on right.

- [x] **Flows Performance Detail card**: Table: Flow Name, Delivered, Opens, Clicks, Orders, Revenue.

- [x] **Email Deliverability card**: Title "Email Deliverability". Line chart showing bounce rate, spam complaint rate, unsubscribe rate over time. Summary numbers below chart.

### Analytics — Metrics (`/analytics/metrics`)

- [x] **Metrics list page**: Page title "Metrics". Search bar. Table: Metric name (bold), Integration source (e.g., "Shopify", "Xlaviyo"), Total event count, Last event timestamp, mini sparkline chart (last 30 days trend). Click metric name → metric detail.

- [x] **Metric detail page**: Metric name as title. Large time-series chart (configurable date range). Below chart: "Events" table showing recent individual events with timestamp, profile email, and event properties.

### Sign-up Forms (`/signup-forms`)

- [x] **Sign-up Forms list page**: Page title "Sign-up forms". "Create sign-up form" button (black). Table: Form name (bold, clickable), Type badge (Popup / Embedded / Flyout / Full Page), Status badge (Live green / Draft gray), Target List name, Views count, Submissions count, Conversion rate %. Click name → form detail.

- [x] **Sign-up Form detail page**: Form name, status toggle (Live/Draft), stats summary cards (Views, Submissions, Conversion Rate). Below: form preview placeholder (shows a simple rendered version of the form with fields). Edit button that shows a simple form field configuration panel (title, description, fields to collect, submit button text, target list selector).

---

## P2 — Secondary Features

### Content — Templates (`/content/templates`)

- [x] **Template library page**: Page title "Templates". "Create template" button. Filter tabs by category: All, Outreach, Reminders, Confirmation, Seasonal, Promotional, Custom. Grid layout (3-4 columns) of template cards. Each card: preview thumbnail image (colored placeholder rectangle), template name, category tag, last updated date. Click → template detail.

- [x] **Template detail page**: Template name (editable), category selector dropdown, large preview area (render HTML content or show placeholder), "Edit" button, "Duplicate" button, "Delete" button. Editing shows a simplified rich text area (not full drag-and-drop builder — that's out of scope).

### Content — Images & Brand (`/content/brand`)

- [x] **Brand settings page**: Two sections. "Brand Colors" section: primary color picker, secondary color picker, accent color picker (simple hex input + color swatch preview). "Brand Assets" section: Logo upload area (placeholder image), font family selector dropdown. "Save" button.

### Analytics — Benchmarks (`/analytics/benchmarks`)

- [x] **Benchmarks page**: Page title "Benchmarks". Industry selector dropdown. Comparison table: Metric name (Open Rate, Click Rate, Unsubscribe Rate, Revenue per Email), Your Performance, Industry Average, Rating badge (Good/Excellent/Needs Improvement). Visual bar comparison for each metric.

### Campaign A/B Testing

- [ ] **A/B test option in campaign creation**: In Step 3 (Content), add "Create A/B test" toggle. When enabled: shows two subject line inputs (Variation A / Variation B), split percentage slider (default 50/50), winning criteria dropdown (Open rate / Click rate), test duration input. Campaign detail shows A/B results with winner highlighted.

### Bulk Actions

- [ ] **Campaign bulk actions**: When checkboxes selected in campaign list, show floating action bar at bottom: "Archive selected", "Add tag", "Delete" (with confirmation modal). Same pattern for flow list and profile list.

### Search (Global)

- [ ] **Global search overlay**: Clicking sidebar search input or pressing Cmd+K opens a centered modal overlay with large search input. As user types, show categorized results: Campaigns (name matches), Flows (name matches), Profiles (email/name matches), Segments (name matches). Each result shows icon + name + type badge. Click result navigates to detail page. Escape or clicking outside closes.

### Settings

- [ ] **Settings page** (`/settings`): Add "Settings" gear icon at bottom of sidebar above account section. Page with tabs: "Account" (company name, website, timezone, industry inputs), "Email" (default sender name, default sender email, reply-to), "Tracking" (UTM parameter toggles, click/open tracking toggles). "Save changes" button per section.

---

## Data Seed (implement in `createInitialData()`)

- [x] **Account**: 1 record — "Acme Store", e-commerce, Growth plan, US/Eastern timezone, 15,234 total contacts. Default user: Sarah Johnson (sarah@acmestore.com, owner role).

- [x] **Profiles**: 25 records — diverse names/emails/locations (US cities: Boston, NYC, LA, Chicago, Austin, Seattle, Miami, Denver). Mix of: 5 VIP high-LTV customers with 10+ orders, 8 regular customers with 2-5 orders, 5 new customers with 1 order in last 30 days, 4 lapsed customers (last active 90+ days ago), 3 SMS-only subscribers. Realistic custom properties (lifetime_value ranging $50-$2000, total_orders 1-25).

- [x] **Campaigns**: 12 records — "Spring Sale 2025 - 20% Off" (sent, email, high performer: 48% open, $15K revenue), "New Arrivals Alert" (sent, email), "Flash Sale Weekend" (sent, SMS), "Monthly Newsletter March" (sent, email, average performer), "Customer Appreciation Week" (scheduled, email, tomorrow), "Summer Preview" (scheduled, email, next week), "Re-engagement: We Miss You" (draft, email, audience set), "Product Launch Teaser" (draft, email, no content yet), "VIP Early Access" (draft, SMS), "Easter Collection" (sent, email), "Shipping Update SMS" (sent, SMS), "Loyalty Rewards Reminder" (scheduled, email).

- [x] **Flows**: 8 records with nested FlowActions — Welcome Series (live, 4 actions: welcome email → 3-day delay → follow-up email → conditional split on first purchase → thank you email / reminder email), Abandoned Cart (live, 4 actions: 1-hour delay → reminder email → 24-hour delay → final reminder email), Post-Purchase Thank You (live, 2 actions: thank you email → 14-day delay → review request email), Browse Abandonment (manual, 3 actions), Win-Back Series (draft, 2 actions), Birthday Flow (live, date-triggered), VIP Loyalty Rewards (live, segment-triggered), Price Drop Alert (draft, price_drop triggered).

- [x] **Lists**: 5 records — Newsletter Subscribers (15,234), VIP Customers (2,341), SMS Subscribers (8,567), New Customers Last 30 Days (1,234), Wholesale Contacts (456).

- [x] **Segments**: 8 records — VIP Customers High LTV (starred, 2,341 members, condition: orders > 5 AND LTV > $500), Engaged Last 30 Days (4,567 members), Abandoned Cart No Purchase (892 members), Repeat Buyers 3+ Orders (3,456 members), At-Risk Customers (1,234 members), SMS Opt-Ins (8,567 members), New Subscribers Last 7 Days (234 members), Lapsed Customers 90+ Days (2,100 members).

- [x] **Templates**: 10 records — Welcome Email Modern (outreach), Brand Announcement (outreach), Monthly Newsletter (outreach), Cart Reminder (reminders), Back in Stock (reminders), Order Confirmation (confirmation), Shipping Notification (confirmation), Spring Sale (seasonal), Holiday Gift Guide (seasonal), Blank Custom (custom).

- [x] **Metrics**: 10 records — Placed Order (45,230 events), Viewed Product (234,567), Added to Cart (89,432), Started Checkout (56,234), Received Email (125,000), Opened Email (58,750), Clicked Email (12,500), Received SMS (34,000), Clicked SMS (6,800), Active on Site (178,900).

- [x] **SignupForms**: 4 records — Homepage Newsletter Popup (live, popup, 54K views, 3.2K submissions), Footer Email Signup (live, embedded, 120K views, 8.9K submissions), Exit Intent Offer (draft, popup), SMS Signup Flyout (live, flyout, 28K views, 1.8K submissions).

- [x] **Tags**: 10 records — spring-sale, promotional, welcome, onboarding, abandoned-cart, vip, seasonal, newsletter, sms, transactional.

---

## Out of Scope

- Authentication / login (app starts pre-logged-in as Sarah Johnson, owner of Acme Store)
- Real email/SMS sending or delivery
- Shopify or other real integrations (show integration names but no actual connection)
- Full drag-and-drop email template editor (show simplified placeholder)
- AI features (AI-generated content, smart send time prediction)
- Billing, plan upgrades, payment processing
- Real-time flow execution engine
- File uploads to real servers
- Webhook delivery
- Mobile/responsive layout (desktop only)
