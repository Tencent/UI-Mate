# Xeta Ads Manager Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest meta_ads_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`, `date-fns`. No Tailwind — use plain CSS to match Meta's style.

- [x] **Visual design system**: Meta's advertising interface uses a clean, corporate design. Study `assets/screenshots/` (especially `000003.jpg` showing campaign creation). Key design tokens:
  - Primary blue: `#1877F2` (Meta blue — buttons, links, active states, toggles)
  - Background: `#F0F2F5` (light gray page bg)
  - Card/Surface: `#FFFFFF`
  - Text primary: `#1C1E21`
  - Text secondary: `#65676B`
  - Text muted: `#8A8D91`
  - Border: `#DADDE1`
  - Success green: `#31A24C` (active delivery status)
  - Error red: `#FA383E` (rejected, errors)
  - Warning amber: `#F7B928`
  - Hover row: `#F2F3F5`
  - Active sidebar item bg: `#E7F3FF` with left blue border
  - Toggle on: `#1877F2` pill, toggle off: `#CED0D4` pill
  - Font family: `"Helvetica Neue", Helvetica, Arial, sans-serif`
  - Font sizes: 20px titles (700), 15px section headers (600), 13px body text (400), 12px table headers (600 uppercase #65676B), 14px buttons (600), 12px badge text
  - Border radius: 8px cards, 6px buttons, 4px inputs, 20px full-round pills/toggles

- [x] **App layout**: Three-zone layout:
  - **Top bar**: 56px height, white bg (`#FFFFFF`), bottom border `1px solid #DADDE1`. Left: Meta "M" logo (blue gradient icon, 28px) + "Ads Manager" text (15px bold). Center: nothing. Right group (gap 8px): Search icon button, Notifications bell (with red badge if unread count > 0), Help "?" circle, User avatar (32px circle).
  - **Left sidebar**: 240px width (collapses to 56px icon rail). White bg, right border `1px solid #E4E6EB`. Top: Ad account selector dropdown (shows account name + ID). Nav sections with 14px text, 20px icons, 8px padding. Active item: blue left 3px border + `#E7F3FF` bg + blue text. Items: "Account overview" (BarChart3), "Campaigns" (Layers), "Ad sets" (LayoutGrid), "Ads" (FileImage), divider, "Audiences" (Users), "Reporting" (PieChart), divider, "Billing" (CreditCard), "Settings" (Settings).
  - **Main content area**: Remaining width, `#F0F2F5` background, 16px padding. Content rendered in white cards with `border-radius: 8px` and `box-shadow: 0 1px 2px rgba(0,0,0,0.1)`.

- [x] **Routing**: App.jsx with BrowserRouter. Routes:
  - `/` → redirect to `/campaigns`
  - `/campaigns` → CampaignsPage (default tab: campaigns)
  - `/campaigns/:campaignId` → CampaignDetailPage
  - `/ad-sets` → CampaignsPage (tab: ad sets)
  - `/ads` → CampaignsPage (tab: ads)
  - `/account-overview` → AccountOverviewPage
  - `/audiences` → AudiencesPage
  - `/reporting` → ReportingPage
  - `/billing` → BillingPage
  - `/settings` → SettingsPage
  - `/go` → Go.jsx (state inspector)
  All routes share the same shell (top bar + sidebar). The Campaigns/Ad Sets/Ads tabs are sub-navigation within the same main view.

- [x] **State management**: AppContext + `dataManager.js`. The context provides:
  - All entity arrays (campaigns, adSets, ads, creatives, audiences, notifications, etc.)
  - CRUD operations: `createCampaign()`, `updateCampaign()`, `deleteCampaign()`, and same for adSets, ads, audiences
  - `toggleStatus(entityType, id)` — toggle active/paused
  - `duplicateEntity(entityType, id)` — deep clone with new ID and "(Copy)" appended to name
  - `bulkAction(entityType, ids, action)` — bulk pause/activate/delete
  - `setSelectedTab(tab)`, `setDateRange(range)`, `setVisibleColumns(cols)`, `setFilters(filters)`, `setSearchQuery(query)`
  - `markNotificationRead(id)`, `markAllNotificationsRead()`
  - State persisted to localStorage under key `meta_ads_state`
  - `createInitialData()` returns full seed data (see `data_model.md`)

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Returns JSON with `{ initial_state, current_state, state_diff }`. The state_diff should track: created/updated/deleted campaigns, ad sets, ads, audiences; status changes; budget changes; new notifications read.

- [x] **Session isolation**: `vite.config.js` mock-api plugin with:
  - `POST /post?sid=<sid>` — accepts `{ action: "set" | "set_current" | "reset", state: {...} }`
  - `GET /state?sid=<sid>` — returns current state
  - `GET /go?sid=<sid>` — returns `{ initial_state, current_state, state_diff }`
  - Session data stored in-memory on the Vite dev server (Map keyed by sid)
  - Without sid, app uses localStorage as usual

---

## P1 — Primary Features

Core interactive workflows. These are what agents will practice with.

### P1.1 — Campaigns Data Table (Main View)

- [x] **Three-tab navigation bar**: Horizontal tabs at top of the main content card: "Campaigns" | "Ad Sets" | "Ads". Active tab: bold text + blue underline (3px). Clicking a tab changes the table content to show the corresponding entity type. Each tab shows a count badge: e.g., "Campaigns (6)".

- [x] **Toolbar row** above the table: Left side: green `+ Create` button (solid `#1877F2` blue bg, white text, 36px height, 8px 16px padding, `border-radius: 6px`; on hover darken to `#166FE5`), "Duplicate" button (outline), "Edit" button (outline — disabled unless exactly 1 row selected). Right side: "Columns" dropdown button, "Breakdown" dropdown button, Date range picker button (shows current range text like "Last 7 days" + calendar icon).

- [x] **Search bar**: Below toolbar, left-aligned. Input field with search icon, placeholder "Search campaigns". Filters the visible table rows by name (case-insensitive substring match). 280px wide, 36px height, `#F0F2F5` background, `border: 1px solid #DADDE1`, rounded 6px.

- [x] **Filter chips row**: Below search. Active filters shown as removable chips (pills with X button). Filter button opens a dropdown to add filters: by Status (Active, Paused, Draft, Deleted), by Objective (Awareness, Traffic, etc.), by Delivery (Delivering, Not delivering, Scheduled, Error). Each filter is additive.

- [x] **Data table**: Full-width table with columns (see `data_model.md` for field definitions). Default visible columns:
  - Checkbox (24px) — row-level selection checkbox; header checkbox selects all
  - On/Off toggle (50px) — blue pill toggle; clicking toggles campaign status between active/paused; calls `toggleStatus('campaigns', id)`
  - Campaign name (flexible, min 200px) — bold text, clickable (navigates to campaign detail); shows "Draft" gray badge if status is draft
  - Delivery (100px) — colored dot + text: green "Active", gray "Off", yellow "Scheduled", red "Error", blue "In Review"
  - Bid strategy (100px) — "Lowest cost" / "Cost cap" / "Bid cap"
  - Budget (100px) — "$X.XX/day" or "$X.XX lifetime"
  - Results (80px, right-aligned) — number formatted with commas
  - Reach (80px, right-aligned) — number with K/M suffix
  - Impressions (80px, right-aligned) — number with K/M suffix
  - Cost per result (100px, right-aligned) — "$X.XX"
  - Amount spent (100px, right-aligned) — "$X,XXX.XX"
  - Table rows: 48px height, `border-bottom: 1px solid #E4E6EB`, hover: `bg #F2F3F5`
  - Table header: 40px height, `bg #FAFBFC`, sticky top, `font-size: 12px`, `font-weight: 600`, `color: #65676B`, `text-transform: uppercase`
  - Summary row at bottom: shows totals for numeric columns across all visible rows. Bold, slightly different bg `#FAFBFC`.

- [x] **Row hover actions**: When hovering a campaign row, show 3 icon buttons overlaid on the right side of the row (above the metric columns): "View charts" (BarChart2 icon), "Edit" (Pencil icon), "Duplicate" (Copy icon). Each 28px circle, `#FFFFFF` bg with subtle shadow. Clicking Edit opens the edit side panel; Duplicate calls `duplicateEntity`; View charts toggles the performance chart panel.

- [x] **Row selection and bulk actions**: Clicking row checkbox selects that row (blue highlight bg `#E7F3FF`). Header checkbox selects/deselects all. When ≥1 row selected, show a blue bulk action bar above the table: "[N] selected" text, then action buttons: "Pause" / "Activate" (toggles based on selection), "Duplicate", "Delete" (red text). Each calls `bulkAction()`.

- [x] **Column sorting**: Clicking a column header sorts the table by that column (ascending → descending → unsorted). Show a small arrow indicator (▲/▼) next to the sorted column name. Numeric columns sort numerically; text columns sort alphabetically.

- [x] **Date range picker**: Dropdown from the date range button. Left side: preset options list ("Today", "Yesterday", "Last 7 days", "Last 14 days", "Last 30 days", "This month", "Last month", "Maximum"). Right side: two-month calendar view for custom date selection. Blue "Apply" button at bottom. Selecting a range recalculates all displayed metrics by applying a random multiplier (0.7x-1.3x) to simulate different date windows. Show selected range as button label text.

### P1.2 — Campaign Creation Flow

- [x] **Create button opens modal**: Clicking `+ Create` opens a large modal (centered, 680px wide, max-height 90vh, scrollable body). Top bar: "New campaign" (active tab, blue text) | "New ad set or ad" (inactive tab, gray text) | X close button. Modal has white bg, `border-radius: 12px`, overlay bg `rgba(0,0,0,0.4)`.

- [x] **Step 1 — Objective selection**: Below the tabs, section "Buying type" dropdown (default "Auction"). Then "Choose a campaign objective" heading. Six radio-button options stacked vertically, each with: radio circle (left), colored icon (center-left), objective name (bold), brief description on hover/selection (right panel shows illustration + "Good for:" list). Options:
  - Awareness (megaphone icon, purple)
  - Traffic (cursor-click icon, blue)
  - Engagement (speech-bubble icon, teal)
  - Leads (funnel icon, orange)
  - App promotion (smartphone icon, green)
  - Sales (shopping-bag icon, blue)
  Selecting an objective highlights the row with `#E7F3FF` bg and shows the description panel on the right (like screenshot `000003.jpg`). "Continue" button at bottom (disabled until objective selected).

- [x] **Step 2 — Campaign settings**: After Continue, modal content updates to show campaign-level settings form:
  - Campaign name text input (default: "[Objective] campaign - [date]")
  - Special ad categories multi-select (Housing, Credit, Employment, Social Issues — checkboxes)
  - Campaign budget optimization toggle (on/off; when on: show daily/lifetime budget radio + amount input)
  - Bid strategy dropdown: Lowest cost (default), Cost cap, Bid cap, Target cost
  - A/B test toggle (on/off, decorative)
  - "Back" and "Next" buttons at bottom

- [x] **Step 3 — Ad Set settings**: Form sections in a scrollable panel:
  - **Ad set name** text input
  - **Budget & Schedule** section:
    - Budget type radio: "Daily budget" / "Lifetime budget"
    - Budget amount input (number, with $ prefix)
    - Start date picker (date + time)
    - End date toggle + picker (optional)
  - **Audience** section:
    - Location input (type-ahead, shows suggestions: countries/cities, add as chips)
    - Age range: two dropdowns (min 18-65, max 18-65+)
    - Gender: radio buttons (All, Men, Women)
    - Detailed targeting: text input with tag chips for interests/behaviors/demographics
    - Custom audiences: dropdown multi-select from existing audiences list
    - Audience size indicator: right side shows a gauge/dial with "Audience definition" label — "Specific" to "Broad" scale, with estimated reach number
  - **Placements** section:
    - Radio: "Advantage+ placements (recommended)" / "Manual placements"
    - If manual: checkboxes for each platform (Facebook, Instagram, Messenger, Audience Network) with expandable position checkboxes under each
  - "Back" and "Next" buttons

- [x] **Step 4 — Ad settings**: Form sections:
  - **Ad name** text input
  - **Format** radio: "Single image or video" / "Carousel" / "Collection"
  - **Media** section: "Add Media" button (opens a mock media library modal with 6-8 placeholder images to select from). Shows selected media thumbnail (200x200).
  - **Ad copy**:
    - Primary text textarea (max 125 chars shown, truncated with "See more")
    - Headline input (40 chars)
    - Description input (optional, 30 chars)
  - **Destination**:
    - Website URL input
    - Display URL input (optional)
    - Call to action dropdown: Shop Now, Learn More, Sign Up, Book Now, Contact Us, Download, Get Offer, Get Quote
  - **Ad preview panel**: Right side of the modal shows a mock preview of how the ad looks in Facebook Feed format — card with image, headline, description, CTA button. Preview updates live as user types.
  - "Back" and "Publish" button (blue, creates the campaign + ad set + ad, closes modal, adds to table)

### P1.3 — Inline Editing & Status Management

- [x] **Inline name editing**: Double-clicking a campaign/ad set/ad name in the table converts it to a text input (same width, blue border). Press Enter or click away to save; Escape to cancel. Calls `updateCampaign(id, { name: newValue })`.

- [x] **Inline budget editing**: Clicking the budget cell opens a small popover with a number input, daily/lifetime toggle, and "Save" + "Cancel" buttons. On save: calls `updateCampaign(id, { dailyBudget: value })` or equivalent.

- [x] **Status toggle**: The on/off toggle in each row. Blue pill = active, gray pill = paused. Clicking toggles between the two. Smooth CSS transition (0.2s). After toggle, delivery status column updates accordingly (if toggling off → "Off"; if toggling on → "Active" or stays "In Review" for new ads).

### P1.4 — Account Overview Page

- [x] **Account Overview**: Accessible from sidebar "Account overview" link. Top section: 4 summary metric cards in a row (each white card, `border-radius: 8px`, padding 20px):
  - "Amount Spent" — large number "$XX,XXX.XX", small comparison "+12% vs last period"
  - "Reach" — "XXX,XXX" with trend indicator
  - "Impressions" — "X.XXM" with trend indicator
  - "Results" — "X,XXX" with trend indicator
  Each card shows a small sparkline (CSS-drawn simple line chart or use a simple bar chart).
  Below: a larger chart area (400px height) showing a line chart of daily spend over the selected date range (use CSS/SVG for a simple visualization — no charting library needed, just plot connected dots). X-axis: dates, Y-axis: dollar amounts. Below chart: table of top 5 campaigns by spend.

---

## P2 — Secondary Features

Depth and polish. Implement after P1 is solid.

### P2.1 — Column Customization

- [x] **Columns dropdown**: Clicking "Columns" button in toolbar opens a modal/dropdown. Left panel: list of all available columns grouped by category ("Performance", "Engagement", "Conversions", "Settings") with checkboxes. Right panel: ordered list of selected columns (drag to reorder — or just use up/down arrows). Preset column sets at top: "Performance", "Delivery", "Engagement", "Custom". "Apply" button saves selection to state (`visibleColumns`). Columns list:
  - Performance: Results, Reach, Impressions, Frequency, Cost per result, Amount spent
  - Engagement: Clicks (all), CTR, CPC, CPM
  - Conversions: ROAS, Purchases, Add to cart, Leads
  - Settings: Bid strategy, Budget, Attribution setting, Schedule

### P2.2 — Breakdowns

- [x] **Breakdown dropdown**: "Breakdown" button in toolbar opens dropdown with three sections:
  - By Time: Day, Week, 2 Weeks, Month
  - By Delivery: Age, Gender, Platform (Facebook/Instagram), Placement, Device
  - By Action: Conversion device, Destination
  Selecting a breakdown inserts sub-rows under each campaign row. E.g., breakdown by "Age" adds rows "18-24", "25-34", "35-44", "45-54", "55-64", "65+" under each campaign, each with its own metric values (generated by splitting the parent's metrics proportionally with some randomness). Clicking breakdown again or selecting "None" removes sub-rows.

### P2.3 — Audiences Page

- [x] **Audiences list page**: Table with columns: Checkbox, Name, Type (badge: "Custom" blue / "Lookalike" green / "Saved" gray), Source, Size, Availability (badge: "Ready" green / "Populating" yellow / "Too small" red), Date created. Toolbar: "+ Create Audience" dropdown (Custom audience, Lookalike audience, Saved audience), Search, Delete.

- [x] **Create Custom Audience modal**: Type selector: Website, Customer list, App activity, Engagement. For "Website": retention days input (1-180), URL rules (contains/equals + text input). For others: simplified placeholder forms. Name input. "Create Audience" button adds to audiences list.

- [x] **Create Lookalike Audience modal**: Source audience dropdown (select from existing custom audiences), Country/region selector, Audience size slider (1%-10% with reach estimate), Name input. "Create Audience" button.

### P2.4 — Reporting Page

- [x] **Reporting page**: Top: "Create Report" button + saved reports dropdown. Main area: a report builder with:
  - Date range selector (same as campaigns page)
  - Metrics multi-select: checkboxes for which metrics to include
  - Breakdown selector
  - A simple bar chart visualization showing selected metrics per campaign (use CSS bars — no library needed)
  - A data table below the chart with the same data
  - "Export" button (mock — shows toast "Report exported")
  - "Save Report" button — opens name input dialog, saves to savedReports state

### P2.5 — Billing Page

- [x] **Billing page**: Two sections:
  - **Payment methods card**: Shows current payment method (card icon + "Visa ending in 4242"), "Add payment method" button (mock — shows toast), "Set spending limit" with current limit display and "Edit" link
  - **Transaction history table**: Date, Description, Amount, Status (badge), Payment method columns. Shows last 30 days of mock transactions. Paginated (10 per page with Previous/Next).

### P2.6 — Settings Page

- [x] **Settings page**: Sections in a single-column layout:
  - **Account information**: Account name (editable input), Account ID (read-only), Business name, Timezone dropdown, Currency (read-only)
  - **Notification preferences**: Toggle switches for: Ad approvals, Budget alerts, Performance alerts, Delivery issues. Each has a label + toggle.
  - "Save changes" button at bottom (blue, saves to state, shows success toast)

### P2.7 — Notification Center

- [x] **Notification bell dropdown**: Clicking bell icon in top bar opens a dropdown (320px wide, max 400px tall, scrollable). Header: "Notifications" title + "Mark all as read" link. List of notifications: each shows icon (by type: CheckCircle green for approved, XCircle red for rejected, AlertTriangle amber for budget, Info blue for updates), title (bold if unread), message (truncated 2 lines), relative timestamp ("2h ago"). Clicking a notification marks it as read and navigates to related entity. Unread count badge on bell icon (red circle, white number, min-width 18px).

### P2.8 — Performance Charts Panel

- [x] **Charts toggle**: "View Charts" icon button in row hover or a toolbar toggle. When active, an expandable panel (300px height) appears between toolbar and table. Shows two side-by-side line charts:
  - Left: "Results" over the date range (blue line)
  - Right: "Amount Spent" over the date range (green line)
  Charts are simple SVG line charts with dots at data points, x-axis date labels, y-axis value labels. Data is per-day, generated from the selected campaign's total metrics divided across days with random variation.

### P2.9 — Duplicate & Draft Workflows

- [x] **Duplicate campaign flow**: Clicking "Duplicate" (from hover action or bulk bar) creates a deep copy of the campaign (+ its ad sets + ads). The copy has status "draft", name appended with " (Copy)", and new unique IDs. A toast shows "Campaign duplicated. Edit your draft to make changes." The draft appears in the table immediately.

- [x] **Review and Publish**: When draft campaigns exist, show a "Review and Publish" button in the top bar (to the left of the search icon) with a badge count of drafts. Clicking opens a side panel listing all drafts with their settings summary. Each draft has "Publish" and "Discard" buttons. Publishing changes status to "active" (or "in_review" for ads), discarding deletes the draft.

### P2.10 — Ad Set & Ad Sub-Tables

- [x] **Ad Sets tab**: When clicking the "Ad Sets" tab, the table shows all ad sets across all campaigns. Columns: Checkbox, Toggle, Ad set name, Campaign name (linked), Delivery, Budget, Optimization goal, Audience summary (truncated), Results, Reach, Impressions, Cost per result, Amount spent. Row click navigates to parent campaign detail.

- [x] **Ads tab**: When clicking "Ads" tab, table shows all ads. Columns: Checkbox, Toggle, Ad name, Ad set name, Campaign name, Delivery, Review status (badge: "Approved" green, "Pending" yellow, "Rejected" red), Creative thumbnail (40x40 rounded), Results, Reach, Impressions, Cost per result, Amount spent.

---

## Data Seed (implement in createInitialData())

- [x] **Campaigns**: 6 campaigns covering: (1) Active "Summer Sale 2025" Sales campaign with $100/day budget, strong ROAS 3.45; (2) Active "Brand Awareness Q3" Awareness campaign, $50/day; (3) Paused "Spring Collection Traffic" Traffic campaign; (4) Completed "Lead Gen Webinar" Leads campaign with past end date; (5) Draft "Holiday Promo 2025" Sales campaign, no metrics; (6) Active "App Install Push" App Promotion campaign with delivery error.

- [x] **Ad Sets**: 2-3 per campaign (~14 total). Each with distinct targeting (e.g., "US 25-44 Interest-Based", "US Retargeting 30d", "UK Broad 18-65"), different budgets, and realistic metric splits from parent campaign.

- [x] **Ads**: 2-3 per ad set (~35 total). Mix of formats: single_image (most common), carousel, single_video. Each with distinct creative (different headlines, images, CTAs). Varying review statuses (mostly approved, 2 pending, 1 rejected).

- [x] **Creatives**: One per ad. Include realistic ad copy for an e-commerce/retail brand. Primary text about product benefits, headlines like "Shop Now - 50% Off", CTAs like "shop_now" and "learn_more". Thumbnail URLs point to placeholder colored rectangles.

- [x] **Audiences**: 6 audiences: (1) "Website Visitors - 30 Days" custom/website/ready/45K; (2) "Email Subscribers" custom/customer_list/ready/12K; (3) "1% Lookalike - Purchasers" lookalike/ready/2.1M; (4) "Video Viewers 75%" custom/engagement/ready/28K; (5) "US 25-44 Shoppers" saved/ready/15M; (6) "New Prospect List" custom/customer_list/populating/0.

- [x] **Notifications**: 10 notifications spanning last 7 days. Mix: 3 ad_approved (read), 1 ad_rejected (unread), 2 budget_alert (1 unread), 2 performance_alert (1 unread), 2 account_update (read). Realistic messages referencing actual campaign/ad names from seed data.

- [x] **Billing**: 1 payment method (Visa 4242). 15 billing transactions over last 30 days with varying amounts ($80-$250/day), all completed except 1 pending.

- [x] **Saved Reports**: 3 reports: "Weekly Performance Summary" (last 7 days, performance columns), "Monthly Campaign Comparison" (last 30 days, all campaigns), "Audience Insights" (last 14 days, breakdown by age).

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login (app starts pre-logged-in as "Sarah Chen" managing "Acme Corp Ad Account")
- Real Meta API integration or ad serving
- Real file uploads (use mock media library with placeholder images)
- Real payment processing
- Real pixel/SDK tracking code
- Email/push notifications (only in-app notification center)
- Mobile-responsive design (desktop-only is fine)
- Actual ad preview rendering in different placements (simplified single preview is enough)
