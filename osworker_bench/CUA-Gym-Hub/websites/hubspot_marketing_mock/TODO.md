# XubSpot Marketing Hub Mock — TODO

> Status: COMPLETE (P0 + P1 + most P2)
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

- [x] **Project scaffold**: `npm create vite@latest hubspot_marketing_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`. No TypeScript — use plain JSX.

- [x] **Visual design system**: The dev agent MUST study `assets/screenshots/` to replicate HubSpot's exact look. Key design tokens:
  - **Sidebar**: Dark navy background `#2D3E50`, white text `#FFFFFF`, hover state `#3B5167`, active item has `#425B76` bg + 3px left border in orange `#FF7A59`. Width: 240px. Collapsed: 56px (icon only).
  - **Top bar**: White `#FFFFFF` bg, 56px height, bottom border `1px solid #CBD6E2`. Right side: search (magnifying glass), settings (gear), notifications (bell with badge), user avatar circle with initials.
  - **Page background**: `#F5F8FA`. Cards/panels: white `#FFFFFF`, border-radius 4px, shadow `0 1px 4px rgba(0,0,0,0.1)`.
  - **Typography**: Font `"Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif`. Body 14px `#33475B`. H1 32px bold. H2 24px semi-bold. Small/caption 12px `#7C98B6`. Table headers: 11px uppercase `#516F90` letter-spacing 0.5px.
  - **Buttons**: Primary — `#FF7A59` bg, white text, border-radius 3px, padding 8px 16px, hover `#FF8F73`. Secondary — white bg, `#FF7A59` border and text. Tertiary — transparent bg, `#0091AE` text.
  - **Links/accent**: Teal `#00A4BD`. Success `#00BDA5`. Warning `#DBAE17`. Danger `#F2545B`.
  - **Inputs**: 1px border `#CBD6E2`, border-radius 3px, padding 8px 12px, focus border `#00A4BD`.
  - **Table rows**: Hover bg `#EAF0F6`. Selected row bg `#E5F5F8`. Header row bg `#F5F8FA`.

- [x] **App layout**: Three-zone layout filling 100vh:
  1. **Left sidebar** (240px fixed width): Dark navy `#2D3E50` bg. Top: HubSpot sprocket logo (use an orange `#FF7A59` SVG sprocket or stylized "H" icon, 32px, centered in 56px top area). Below: navigation sections as collapsible groups. Each section: icon (20px, `lucide-react`) + label (14px). Clicking section expands a **flyout sub-menu panel** (220px wide, white bg, appearing to the right of the sidebar) listing sub-items. Active section has orange left border.
  2. **Top bar** (56px height, full width minus sidebar): Left side shows current page breadcrumb (e.g., "Marketing > Email"). Right side: search icon (opens search overlay on click), settings gear icon, notifications bell icon (with red badge count "3"), user avatar circle (40px, initials "SJ" on `#FF7A59` bg) + dropdown on click.
  3. **Main content area** (fills remaining space): `#F5F8FA` bg, padding 24px, scrollable.

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes:
  - `/` → Dashboard (Marketing Performance dashboard)
  - `/contacts` → Contacts list
  - `/contacts/:id` → Contact detail
  - `/companies` → Companies list
  - `/deals` → Deals list (simple pipeline board)
  - `/lists` → Lists/Segments
  - `/marketing/email` → Email list view
  - `/marketing/email/new` → Email editor (new)
  - `/marketing/email/:id` → Email editor (existing)
  - `/marketing/campaigns` → Campaigns list
  - `/marketing/campaigns/:id` → Campaign detail
  - `/marketing/forms` → Forms list
  - `/marketing/forms/new` → Form builder
  - `/marketing/forms/:id` → Form builder (existing)
  - `/marketing/social` → Social posts list
  - `/marketing/ads` → Ads dashboard (placeholder)
  - `/marketing/ctas` → CTAs list
  - `/marketing/landing-pages` → Landing pages list
  - `/automations/workflows` → Workflows list
  - `/automations/workflows/new` → Workflow builder
  - `/automations/workflows/:id` → Workflow builder (existing)
  - `/reports/dashboards` → Dashboards
  - `/reports/dashboards/:id` → Dashboard detail with widgets
  - `/reports/analytics` → Analytics overview
  - `/settings` → Settings page
  - `/go` → State inspection endpoint

- [x] **State management**: React Context (`AppContext.jsx`) wrapping the entire app. `dataManager.js` exports `createInitialData()` (see `data_model.md` for complete structure), `loadState()`, `saveState()`. All mutations go through context dispatch or setter functions. State persisted to localStorage under key `"hubspot_marketing_mock_state"`. Provide helper: `getStateDiff(initialState, currentState)` that deep-diffs the two objects.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` — renders a JSON view (monospace font, white bg) of `{ initial_state, current_state, state_diff }`. Route it at `/go`. The state diff should capture all user-initiated mutations (contact edits, email creation, form changes, etc.).

- [x] **Session isolation**: In `vite.config.js`, add a mock-API plugin that intercepts:
  - `POST /post?sid=<sid>` — accepts `{ action: "set" | "set_current" | "reset", state: {...} }`. `"set"` replaces both initial and current state. `"set_current"` updates only current state. `"reset"` reverts current to initial.
  - `GET /go?sid=<sid>` — returns `{ initial_state, current_state, state_diff }` as JSON.
  - `POST /upload?sid=<sid>` — multipart/form-data file upload, stores in memory, returns `{ files: [{ url, original_name, stored_name, size }] }`.
  - `GET /files/:sid/:filename` — serves uploaded file.
  Use `sid` param to namespace localStorage keys: `"hubspot_marketing_mock_state_<sid>"`. When no `sid`, use default key.

---

## P1 — Primary Features

### Contacts

- [x] **Contacts list page** (`/contacts`): Page title "Contacts" with record count (e.g., "15 records"). Top right: "Create contact" button (primary orange), "Import" button (secondary), "Actions" dropdown (Export, Edit columns). Below title: tab row — "All contacts" (active) | "My contacts". Below tabs: **filter bar** with dropdown buttons: "Contact owner ▾", "Create date ▾", "Lead status ▾", "Last activity date ▾", plus "+ More filters" link. Each dropdown opens a popover with filter options (checkboxes for enum values, date range picker for dates). **Search bar** (left-aligned, icon prefix, placeholder "Search name, phone, email"). **Data table**: columns — checkbox (bulk select), Name (avatar circle with initials + full name as teal link), Email (teal link), Phone Number, Contact Owner, Create Date (formatted "MMM DD, YYYY"), Lead Status (colored badge). Sortable columns (click header to toggle asc/desc, show ▲/▼ arrow). Pagination at bottom: "Prev | 1 | 2 | Next" + "25 per page" dropdown. Row hover highlights `#EAF0F6`. Clicking checkbox enables bulk action bar at top (Delete, Edit, Enroll in workflow).

- [x] **Contact detail page** (`/contacts/:id`): Three-column layout. **Left panel** (320px): Contact name (H2), job title, company link. Below: property card with rows — Email, Phone, Contact Owner (user avatar + name), Lifecycle Stage (dropdown), Lead Status (dropdown), Source. Each property row: label (12px gray) + value (14px dark), click value to inline-edit (transforms to input field, Save/Cancel buttons appear). **Center panel**: Tabs — "Activity" | "Notes" | "Emails" | "Calls" | "Tasks". Activity tab: reverse-chronological timeline. Each activity item: icon (email ✉, note 📝, call 📞, meeting 📅), title bold, timestamp muted, body text. "Log activity" dropdown button (Log note, Log call, Log email, Create task). Notes tab: list of notes with add note form (textarea + Save button). **Right panel** (280px): Associated records cards — "Companies" card (list linked companies, "+ Add" button), "Deals" card (list deals with amount + stage badge), "Tickets" card. Each card: header with count badge + expand/collapse toggle.

- [x] **Create contact drawer**: Clicking "Create contact" opens a **right-side slide-in drawer** (480px wide, white bg, gray overlay on rest of page). Header: "Create contact" + X close button. Form fields (vertical stack, 16px gap): Email* (required), First name*, Last name, Contact owner (dropdown of users), Job title, Phone number, Lifecycle stage (dropdown: Subscriber, Lead, MQL, SQL, Opportunity, Customer, Evangelist), Lead status (dropdown: New, Open, In Progress, etc.). Footer: "Create" button (primary) + "Create and add another" link + Cancel button. On submit: adds contact to state, closes drawer, shows success toast "Contact created" at top-right.

### Email Marketing

- [x] **Email list page** (`/marketing/email`): Page title "Marketing Email". Top right: "Create email" button (primary). **Tabs**: "Manage" (active) | "Analyze". **Manage tab** has two views toggled by icons: List view (default) | Folders view. Left sidebar filter panel (180px): "All emails" (bold, active), collapsible groups — "Draft" (count badge), "Scheduled" (count badge), "Sent" (count badge), "Archived" (count badge). Top controls: search bar, "Type: All emails ▾" dropdown filter, "Manage columns" link, "Export" button. **Data table**: columns — checkbox, Title (email name bold, below: status badge + "Updated MM/DD/YYYY by User Name" in gray), Last Updated (date), Open Rate (percentage or "—" if draft), Click Rate (percentage or "—"). Sortable columns. Row click navigates to email editor. Status badges: Draft = gray bg, Scheduled = blue bg, Sent = green bg, Archived = muted gray bg.

- [x] **Email editor page** (`/marketing/email/:id` or `/marketing/email/new`): Full-screen editor (hides sidebar). **Top bar** (56px, white bg): Left — "← Exit" link (returns to email list), email name (editable inline, click to rename). Center — status pill ("Draft" / "No unsaved changes"). Right — "Actions" dropdown, "Preview" button, "Send or schedule" button (primary). **Sub-tabs** below top bar: "Edit" (active) | "Settings" | "Send or schedule". **Edit tab** — three panels:
  - **Left panel** (260px, `#F5F8FA` bg): "Content" tab (active) | "Design" tab. Content tab shows draggable module blocks grouped by category: **Layout** (1 column, 2 column), **Text** (Heading, Text block, Rich text), **Media** (Image, Video), **Actions** (Button, Divider, Social follow, Social share). Each block: icon + label, draggable.
  - **Center panel**: Email canvas preview on white bg with max-width 600px centered. Shows the email rendered from `content.blocks`. Each block selectable on click (shows blue border + drag handle + delete X). Blocks can be reordered by drag-and-drop (visual placeholder line appears).
  - **Right panel** (300px, slides in when block selected): Block property editor. For text blocks: rich text toolbar (bold, italic, underline, link, alignment, font size, color). For button blocks: button text, URL, button color picker, border radius, alignment. For image blocks: image URL input, alt text, width slider. Close with X.
  **Settings tab**: Form with fields — "From name" input, "From address" input, "Reply-to address" input, "Subject line" input (with character count and "Preview" eye icon that shows subject with personalization tokens replaced), "Preview text" input. "Internal email name" input at bottom.
  **Send tab**: "Send to" — select lists (multi-select dropdown of lists), estimated recipients count. "Don't send to" — exclude lists. "Send options" — radio: "Send now" / "Schedule for later" (shows date+time picker). "Send" button (primary orange, prominent).

- [x] **Email analytics view** (`/marketing/email` → Analyze tab): Summary stats at top: Total Sent, Average Open Rate, Average Click Rate, Average Unsubscribe Rate — each in a metric card (large number + trend arrow up/down in green/red). Below: line chart showing email performance over time (x-axis: dates, y-axis: open rate). Below: table of all sent emails sorted by send date with performance columns.

### Campaigns

- [x] **Campaigns list page** (`/marketing/campaigns`): Page title "Campaigns". Top right: "Create campaign" button (primary). Below: date range filter, search bar, status filter tabs: "All" | "Active" | "Draft" | "Completed". **Table view**: columns — Campaign Name (bold, teal link), Status (badge: Active=green, Draft=gray, Completed=blue, Paused=yellow), Owner, Start Date, Assets (count number), Influenced Contacts (number), Sessions (number). Row click → campaign detail.

- [x] **Campaign detail page** (`/marketing/campaigns/:id`): Header: campaign name (H1), status badge, owner, date range. Below header: metric summary cards in a row — Sessions, New Contacts, Influenced Contacts, Closed Deals, Revenue. Each card: label (12px gray), value (24px bold), trend indicator. **Tabs**: "Assets" | "Performance". **Assets tab**: grouped sections — "Marketing emails" (list of associated emails with name + status), "Landing pages", "Blog posts", "Forms", "Social posts", "Workflows", "CTAs". Each section: header with count, list items as rows, "+ Add [asset type]" button at bottom (opens a modal search picker to associate existing items). **Performance tab**: charts — Sessions over time (line), Contacts by source (donut), Email performance table.

### Forms

- [x] **Forms list page** (`/marketing/forms`): Page title "Forms". Top right: "Create form" button (primary). Filter tabs: "All forms" | "Published" | "Draft". Search bar. **Table**: columns — Form Name (teal link), Form Type (badge: Embedded, Pop-up, Standalone), Status, Views, Submissions, Submission Rate (%), Created Date. Sortable. Row click → form builder.

- [x] **Form builder page** (`/marketing/forms/:id` or `/marketing/forms/new`): Full-screen editor. **Top bar**: "← Back to forms" link, form name (editable), status. Right: "Preview" button, "Update" / "Publish" button (primary). **Two-column layout**: Left panel (280px): "Add form field" section with draggable field types grouped: **Common** (Email, First name, Last name, Phone, Company), **Advanced** (Dropdown, Multi-checkbox, Radio select, Date picker, Number, Single-line text, Multi-line text). Right main area: form preview canvas showing fields stacked vertically. Each field: label, input preview, required asterisk if required. Click field to select → shows property editor below the field list (label, placeholder, required toggle, help text, options for select/radio/checkbox). Drag to reorder fields. Submit button at bottom (editable text + color). **Options tab** (accessible via top sub-tabs: "Build" | "Options" | "Style"): Thank you message, redirect URL, notification emails, lifecycle stage setting. **Style tab**: Form width, font, colors, button styling.

### Workflows

- [x] **Workflows list page** (`/automations/workflows`): Page title "Workflows". Top right: "Create workflow" button (primary). Filter tabs: "All" | "Active" | "Inactive" | "Draft". Search bar. **Table**: columns — Workflow Name (teal link), Type (Contact/Company/Deal/Ticket as small label), Status (badge: Active=green, Inactive=gray, Draft=yellow), Enrolled (total number), Currently Enrolled, Last Updated. "Actions" column with ⋯ menu (Edit, Clone, Delete, Activate/Deactivate). Sortable.

- [x] **Workflow builder page** (`/automations/workflows/:id` or `/automations/workflows/new`): Full-screen visual editor. **Top bar**: "← Back" link, workflow name (editable), status badge. Right: "Review and publish" / "Turn on" button (primary), "Settings" button. **Main canvas**: Vertical flowchart layout on light gray bg. **Trigger node** at top: rounded rectangle with icon, text description of enrollment trigger (e.g., "Contact submits form: Newsletter Signup"). Below: connecting vertical line with **"+"** circle button (clicking opens action picker panel). **Action nodes**: rounded rectangles (white bg, subtle shadow). Each node shows: action icon (left), action type label bold + config summary below (e.g., "Send email: Welcome Email"). Nodes connected by vertical lines. **Branch nodes**: diamond shape or special rectangle with "If/then" label, YES path going left, NO path going right, each with their own continuation chains. **Action picker** (panel slides in from right, 350px): categorized action list — **Communication** (Send email, Send internal notification), **CRM** (Set property, Create record, Copy property), **Timing** (Delay, Delay until date), **Logic** (If/then branch, Go to action), **Lists** (Add to list, Remove from list). Click action → it's added as next node. Nodes can be clicked to edit config in right panel. Delete node via X button on hover.

### Dashboards & Reporting

- [x] **Dashboard page** (`/` and `/reports/dashboards/:id`): Top: dashboard name with dropdown to switch dashboards (clicking name opens dropdown list of all dashboards). Right: "Create dashboard" button, "Actions ▾" dropdown (Clone, Delete, Set as default), "Add report" button. **Dashboard grid**: 2-column or 3-column responsive grid of report widgets. Each widget: white card with title bar (report name + ⋯ menu with Edit, Remove, Clone), date range label ("Last 30 days"), and chart body. Chart types to implement:
  - **Number card**: Large metric value (32px bold), label below, trend percentage with ▲/▼ arrow in green/red, comparison period text.
  - **Line chart**: X-axis dates, Y-axis values, one or two series with legend. Simple SVG or CSS-based chart (no external chart library needed — use inline SVG paths or simple div-based bar rendering).
  - **Bar chart**: Vertical bars with labels.
  - **Donut chart**: Colored segments with center total, legend on right.
  - **Table widget**: Mini data table within the card.
  "Add report" opens modal with report type picker (select metric + chart type + date range).

### Lists / Segments

- [x] **Lists page** (`/lists`): Page title "Lists". Top right: "Create list" button (primary). Tabs: "All lists" | "Active lists" | "Static lists". Search bar. **Table**: columns — List Name (teal link), Type (badge: Active=blue, Static=gray), Size (contact count), Created Date, Last Updated. Row click could show list detail (modal or inline expand showing the filter criteria). "Create list" button opens modal: Name input, Type radio (Active/Static), for Active lists: filter builder with property + operator + value rows ("+ Add filter" button). Save creates list and computes matching contacts count.

---

## P2 — Secondary Features

### Landing Pages

- [x] **Landing pages list** (`/marketing/landing-pages`): Page title "Landing Pages". Top right: "Create landing page" button. Table: Name, Status (Published/Draft badge), URL slug, Publish Date, Views, Submissions, Conversion Rate. Sortable columns.

- [ ] **Landing page editor** (simplified): Similar to email editor but for web pages. Left panel: draggable modules (Heading, Text, Image, Form embed, Button, Divider, Columns). Center: page preview. Top bar: page name, Exit, Preview, Publish. Right panel: module properties editor. Keep this simpler than the email editor — focus on module add/remove/reorder and basic property editing.

### Social Media

- [x] **Social posts page** (`/marketing/social`): Page title "Social". Tabs: "Publishing" | "Monitoring". Publishing tab: "Create social post" button. View toggles: List view | Calendar view. List view table: Platform icon + Post content (truncated), Status (Published/Scheduled/Draft), Date, Engagement (likes + comments + shares). "Create social post" modal: platform selector (multi-checkbox: Facebook, Twitter, LinkedIn, Instagram), content textarea (character counter for Twitter), schedule date+time picker, campaign association dropdown.

### Ads

- [x] **Ads page** (`/marketing/ads`): Placeholder page with title "Ads", subtitle "Connect your ad accounts to manage campaigns". Show 3 ad platform cards (Google Ads, Facebook Ads, LinkedIn Ads) each with platform logo, "Connect" button (disabled/placeholder), and mock summary stats (Impressions, Clicks, Spend, CTR) if "connected".

### CTAs

- [x] **CTAs list page** (`/marketing/ctas`): Page title "CTAs". "Create CTA" button. Table: CTA Name, Type (Button/Banner/Popup/Slide-in), Views, Clicks, Click Rate, Status. Row click opens CTA editor modal: text input, URL input, color picker, type selector, preview panel showing rendered CTA.

### Analytics

- [x] **Analytics page** (`/reports/analytics`): Marketing analytics overview. Top metric cards: Total Sessions, New Contacts, Customers, Bounce Rate — each with trend. Below: "Traffic by Source" bar chart (Organic Search, Direct, Social, Email, Referral, Paid Search). "Top Pages" table (Page URL, Views, Submissions, New Contacts). Date range filter at top.

### Settings

- [x] **Settings page** (`/settings`): Left sidebar with setting categories: General, Marketing, Email, Forms, Social, Users & Teams, Integrations, Domain & URLs. Each category shows a form-based settings panel. **General**: Account name, timezone dropdown, date format, currency. **Email**: Default from name, from email, footer info, subscription types list. **Marketing**: UTM tracking toggle, default lifecycle stage settings. Most settings are simple input/toggle forms that save to state.

### Global UI Components

- [x] **Notification bell**: Click bell icon → dropdown panel (350px wide, max-height 400px scrollable): list of notifications. Each: icon, message text, timestamp. Unread items have blue left border. "Mark all read" link at top. Badge count on bell = unread count.

- [x] **Global search**: Click search icon in top bar → overlay modal with large search input. Type to search across contacts, emails, campaigns, forms (client-side filter). Results grouped by type with icon. Click result → navigate to detail page. "Press ⌘K to search" hint text.

- [x] **User menu dropdown**: Click avatar → dropdown: "Sarah Johnson" (name), "sarah.johnson@acmecorp.com" (email, muted), divider, "Profile & Preferences" link, "Account & Billing" link, divider, "Sign out" link (non-functional). Dropdown appears below avatar, right-aligned.

- [x] **Toast notifications**: After create/update/delete actions, show a toast notification at top-right. Auto-dismiss after 5 seconds. Green bg for success, red for error. Text + optional undo link.

- [x] **Confirmation modals**: For delete actions, show a centered modal with semi-transparent overlay. "Are you sure?" title, description text, "Delete" button (red) + "Cancel" button.

- [x] **Empty states**: When a list/table has no items, show an illustration placeholder + helpful message + CTA button. E.g., Forms page with no forms: "You haven't created any forms yet. Forms help you collect leads." + "Create your first form" button.

---

## Data Seed (implement in createInitialData())

- [x] **Contacts**: 18 contacts spanning all lifecycle stages (3 subscribers, 4 leads, 3 MQLs, 3 SQLs, 2 opportunities, 3 customers). Use realistic names, company associations. Include diverse sources (organic, social, email, direct). 3 contacts owned by current user, rest by other mock users.

- [x] **Companies**: 8 companies with realistic names (TechFlow Solutions, Greenleaf Analytics, Beacon Digital, Stellar Dynamics, CloudPeak Systems, NovaBridge Inc, UrbanEdge Media, Pacific Rim Consulting). Different industries, employee counts, revenue ranges.

- [x] **Deals**: 7 deals at various pipeline stages. Amounts from $5,000 to $85,000. Close dates spanning next 3 months.

- [x] **Emails**: 10 marketing emails — 3 sent (with realistic stats: open rates 30–55%, click rates 8–20%), 2 scheduled (future dates), 3 drafts, 1 archived, 1 automated. Each with content blocks (header, text, image, button, footer at minimum).

- [x] **Campaigns**: 5 campaigns — "Q2 Product Launch" (active), "Summer Webinar Series" (active), "Annual Customer Survey" (completed), "Brand Awareness 2024" (draft), "Holiday Promotion" (paused). Each with 3–6 associated assets and realistic metrics.

- [x] **Forms**: 6 forms — "Newsletter Signup" (embedded, published), "Contact Us" (embedded, published), "Webinar Registration" (standalone, published), "Free Trial Request" (popup, published), "Feedback Survey" (embedded, draft), "Gated Content Download" (embedded, published). Each with 3–6 fields and realistic view/submission stats.

- [x] **Workflows**: 5 workflows — "Welcome Email Series" (active, contact-based), "Lead Nurturing" (active, contact-based), "Deal Stage Notifications" (active, deal-based), "Re-engagement Campaign" (inactive), "Webinar Follow-up" (draft). Each with 3–6 nodes including at least one branch.

- [x] **Lists**: 7 lists — "All Marketing Contacts" (active, 2450), "Newsletter Subscribers" (active, 1823), "Webinar Registrants" (static, 342), "MQLs This Quarter" (active, 156), "Customers" (active, 89), "Churned Contacts" (static, 23), "VIP Accounts" (static, 45).

- [x] **Landing Pages**: 5 pages — "Q2 Product Launch" (published, high views), "Webinar Registration" (published), "Free Trial" (published), "Case Study Download" (draft), "Holiday Promo" (draft).

- [x] **CTAs**: 4 CTAs — "Try Free Demo" button (active), "Download Ebook" popup (active), "Subscribe Newsletter" slide-in (active), "Request Pricing" banner (draft).

- [x] **Dashboards & Reports**: 2 dashboards: "Marketing Performance" (default, 6 reports: Email Open Rate trend line, New Contacts number card, Traffic Sources bar chart, Top Landing Pages table, Campaign Performance donut, Conversion Rate trend line) and "Email Analytics" (6 reports: Emails Sent number, Avg Open Rate number, Click Rate trend line, Bounce Rate number, Top Performing Emails table, Unsubscribe Rate trend line). Each report with pre-computed data arrays suitable for rendering.

- [x] **Social Posts**: 10 posts across Facebook (3), Twitter (3), LinkedIn (3), Instagram (1). Mix of published (6), scheduled (3), draft (1). Realistic engagement metrics.

- [x] **Activities**: Seed 3–5 activity entries per contact (for the first 8 contacts at minimum). Types: email_sent, email_opened, form_submission, note, call. Each with timestamp and description.

---

## Out of Scope

- **Authentication / login** — app starts pre-logged-in as `Sarah Johnson` (Marketing Manager at Acme Corp)
- Real email sending, SMTP configuration
- Real social media API connections (Facebook, Twitter, LinkedIn, Instagram)
- Real ad platform integrations (Google Ads, Facebook Ads)
- Actual form hosting or embed code generation
- Real-time analytics / live data feeds
- Billing, subscription management, plan upgrades
- File uploads to external storage (mock in-memory only)
- Mobile responsive design (desktop only, min-width 1200px)
- Dark mode (HubSpot is light-mode only in its CRM interface)
- Real drag-and-drop between workflow nodes (simplified: click "+" to add, visual-only flowchart)
- Chart rendering library — use simple inline SVG/CSS-based charts or very lightweight rendering (no need for Chart.js/D3/Recharts)
