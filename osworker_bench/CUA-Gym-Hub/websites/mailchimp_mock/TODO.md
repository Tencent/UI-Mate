# Xailchimp Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] **Project scaffold**: `npm create vite@latest mailchimp_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`. No TypeScript.

- [x] **Visual design system**: Study `assets/screenshots/000003.jpg` (full dashboard with sidebar) carefully. Xailchimp uses:
  - **Font**: `"Graphik", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif` — headings are bold 600-700 weight, body is 400
  - **Primary yellow**: `#FFE01B` (Create button, primary CTAs)
  - **Sidebar dark**: `#241C15` (near-black, sidebar background)
  - **Sidebar text**: `#FFFFFF` with `rgba(255,255,255,0.7)` for inactive items
  - **Main background**: `#F6F6F4` (warm off-white/coconut)
  - **Card background**: `#FFFFFF`
  - **Text primary**: `#241C15`
  - **Text secondary**: `#707070`
  - **Teal accent**: `#007C89` (links, success states, action buttons)
  - **Orange warning**: `#E87040`
  - **Red error**: `#D5432F`
  - **Border**: `#E5E5E5`
  - **Hover bg**: `rgba(0,0,0,0.04)` on white cards, `rgba(255,255,255,0.1)` on sidebar
  - **Border radius**: 4px for inputs/buttons, 8px for cards, 12px for modals
  - **Spacing scale**: 4px base (4, 8, 12, 16, 24, 32, 48)
  - **Shadow**: cards use `0 1px 3px rgba(0,0,0,0.08)`

- [x] **App layout**: Fixed left sidebar (220px wide, dark `#241C15` bg, full viewport height) + main content area (flex-grow, `#F6F6F4` bg). Main content has a top header bar (56px height, white bg, bottom border `#E5E5E5`) showing page title on left, search input center, notification bell + user avatar on right. Content area below header has 24px padding. See `assets/screenshots/000003.jpg`.

- [x] **Left sidebar navigation**: Xailchimp logo (Freddie chimp icon — use a simple SVG chimp silhouette or text "xailchimp" in white) at top (16px padding). Below logo: "Marketing" label with "..." menu. Then a full-width **yellow `#FFE01B` "Create" button** (bold text, rounded 20px, 40px height, centered). Below Create button, nav items with 20px left-aligned icons (use lucide-react icons) + label text + right chevron for expandable sub-menus:
  - **Campaigns** (icon: Send/Mail) → sub-items: All Campaigns, Email
  - **Automations** (icon: Zap/Workflow) → sub-items: All Automations, Pre-built
  - **Audience** (icon: Users) → sub-items: All Contacts, Segments, Tags
  - **Analytics** (icon: BarChart3) → sub-items: Reports, Audience
  - **Website** (icon: Globe) → sub-items: Landing Pages
  - **Content** (icon: FolderOpen) → sub-items: Content Studio
  - **Integrations** (icon: Puzzle) — no sub-items
  Each nav item: 40px height, 16px left padding, white text, `rgba(255,255,255,0.7)` when not active, `#FFFFFF` when active with left 3px yellow `#FFE01B` border indicator. Clicking expands/collapses sub-items with smooth animation. Sub-items indented 40px, slightly smaller font (13px vs 14px).

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes:
  - `/` → Dashboard (Home)
  - `/campaigns` → All Campaigns list
  - `/campaigns/new` → Campaign creation wizard
  - `/campaigns/:id` → Campaign detail/setup
  - `/campaigns/:id/report` → Campaign report
  - `/campaigns/:id/edit` → Email editor
  - `/automations` → All Automations list
  - `/automations/prebuilt` → Pre-built automation templates
  - `/automations/:id` → Automation detail/builder
  - `/audience` → All Contacts list
  - `/audience/segments` → Segments list
  - `/audience/tags` → Tags management
  - `/audience/import` → Import contacts
  - `/audience/:id` → Contact detail profile
  - `/analytics` → Reports overview
  - `/analytics/:id` → Individual campaign report
  - `/content` → Content Studio
  - `/landing-pages` → Landing Pages list
  - `/settings` → Account settings
  - `/go` → State inspection endpoint

- [x] **State management**: `AppContext.jsx` wrapping the app with React Context. State shape matches `createInitialData()` from `assets/data_model.md`. Provide `state` and `dispatch` (or setter functions) for: `user`, `audiences`, `contacts`, `tags`, `segments`, `campaigns`, `templates`, `automations`, `contentFiles`, `landingPages`, `notifications`. Persist to `localStorage` key `"mailchimp_mock_state"`. Load from localStorage on mount, falling back to `createInitialData()`.

- [x] **dataManager.js**: Implement `createInitialData()` with all seed data per `assets/data_model.md` §Seed Data Guidelines. Generate 25 contacts, 9 campaigns, 12 templates, 5 automations, 10 content files, 3 landing pages, 7 notifications. All dates should be relative (within last 90 days) and realistic.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route at `/go`. On mount, reads `initialState` (from `createInitialData()`) and `currentState` (from context), computes `state_diff` (deep diff of all changed fields), and renders JSON: `{ initial_state, current_state, state_diff }`. Include all entity arrays in the diff.

- [x] **Session isolation**: In `vite.config.js`, add a mock-api plugin that intercepts:
  - `POST /post?sid=<sid>` — accepts `{ action: "set" | "set_current" | "reset", state: {...} }`. `"set"` overwrites both initial and current state. `"set_current"` updates only current state. `"reset"` restores current to initial.
  - `GET /go?sid=<sid>` — returns `{ initial_state, current_state, state_diff }`
  - `GET /state?sid=<sid>` — alias for `/go`
  Use a Map of session states keyed by `sid`. Default session (no sid) uses the main app context state.

---

## P1 — Primary Features

<!-- Core interactive workflows for agent training. -->

### Dashboard (Home)

- [x] **Dashboard page** (`/`): White welcome banner card at top with greeting "Good morning, Rakesh" (time-aware), subtitle "Here's what's happening with your audience." Below, 3 stat summary cards in a row:
  - **Audience** card: total contacts count, "+12 this week" growth indicator (green arrow up), small sparkline placeholder
  - **Campaigns** card: campaigns sent count (this month), average open rate percentage
  - **Automations** card: active automations count, total emails sent by automations
  Below stat cards, a "Recent Campaigns" section: table showing last 5 campaigns with columns (Name, Status badge, Sent date, Open Rate, Click Rate). Each row clickable → navigates to `/campaigns/:id/report` for sent campaigns or `/campaigns/:id` for drafts. Below that, a "Quick Actions" row of 3 buttons: "Create Campaign", "View Audience", "Check Reports" — each links to respective route.

### Campaigns

- [x] **All Campaigns list** (`/campaigns`): Page title "Campaigns" with "Create Campaign" button (teal `#007C89` bg, white text, top right). Filter bar below with: tab-style status filters (All | Draft | Sent | Scheduled), search input (magnifying glass icon, placeholder "Search campaigns"), and sort dropdown ("Last updated" / "Name A-Z" / "Send date"). Below, a table with columns:
  - **Checkbox** (for bulk select)
  - **Campaign name** (bold, clickable link)
  - **Type** (badge: "Regular" teal, "A/B Test" purple, "Plain Text" gray)
  - **Status** (badge: "Draft" gray bg, "Sent" green bg, "Scheduled" blue bg, "Paused" orange bg)
  - **Audience** (audience/segment name, muted text)
  - **Delivered** (number or "—" for drafts)
  - **Open rate** (percentage with colored bar: green >25%, yellow 15-25%, red <15%, or "—")
  - **Click rate** (same color coding)
  - **Last edited** (relative date: "2 hours ago", "Dec 20")
  - **Actions** (3-dot menu: Edit, Duplicate, Delete, View Report)
  Table rows have hover bg `#F9F9F7`. Clicking campaign name → `/campaigns/:id`. Bulk select header checkbox selects all; when any selected, show bulk action bar (Archive, Delete). Empty state: illustration + "Create your first campaign" text + CTA button.

- [x] **Campaign creation wizard** (`/campaigns/new`): Full-width page (no sidebar visible — or sidebar collapses). Top bar: back arrow "← Back to all campaigns", campaign name (editable inline, placeholder "Untitled Campaign"), right side: "Finish Later" link + "Schedule" button (outlined) + "Send" button (teal filled). Below, 4 step cards stacked vertically, each expandable:
  1. **To** (Recipients): Shows selected audience name + segment. Click "Edit Recipients" → inline expand showing audience dropdown, optional segment dropdown, estimated recipient count. Default: primary audience, all contacts.
  2. **From**: Shows from name + email. Click "Edit From" → inline fields for From Name and From Email.
  3. **Subject**: Shows subject + preview text. Click "Edit Subject" → inline fields for Subject Line (with character count) and Preview Text.
  4. **Content**: Shows "Design Email" button → navigates to `/campaigns/:id/edit`. If template selected, shows template thumbnail preview.
  Each section shows green checkmark when completed, yellow exclamation when incomplete. "Send" button disabled until all 4 sections complete. Clicking "Send" shows confirmation modal: "Send to X contacts now?" with "Send Now" and "Cancel" buttons. Clicking "Schedule" opens schedule modal with date picker and time input.

- [x] **Email template selector** (shown when entering Content step or `/campaigns/:id/edit` before editor): Full-page overlay. Title "Select a starting point for your template". Tab row: **Layouts** | **Themes** | **Saved templates** | **Code your own**. Under Layouts tab: "Featured" section header, then a grid of 5-6 template cards (180px wide, ~280px tall) each showing:
  - Template preview (placeholder showing layout wireframe: header area, text block, image placeholder, button, footer)
  - Template name below: "Sell Products", "Make an Announcement", "Share a Story", "Follow Up", "Educate"
  - Hover: slight scale-up + shadow increase + "Select" button overlay
  Under "Basic" section: simpler templates (1 column, 2 column, etc.). Clicking a template → loads its content blocks into the editor and navigates to the editor view. See `assets/screenshots/000005.jpg` and `assets/screenshots/editor/000004.jpg`.

- [x] **Email editor** (`/campaigns/:id/edit`): Two-panel layout. **Left panel** (~280px): tab bar "Content | Design". Under Content tab, list of draggable content block types with icons:
  - Text (Aa icon)
  - Image (Image icon)
  - Button (Rectangle icon)
  - Divider (Minus icon)
  - Social (Share icon)
  - Header (Layout icon)
  - Footer (AlignBottom icon)
  Each block type is a draggable card (60px tall, icon + label). **Right panel** (flex-grow): Live email preview rendered from the campaign's `content[]` blocks. Shows a centered email frame (max-width 600px, white bg, subtle shadow) rendering each content block in order. Clicking a block in the preview selects it (blue outline border) and shows inline editing controls:
  - For text: contentEditable rich text with toolbar (Bold, Italic, Link, Alignment, Font size, Color)
  - For image: click to change image (opens placeholder selector), alt text field, link URL field
  - For button: edit button text, URL, bg color picker, text color picker
  Selected block also shows drag handle (top-center, ⋮⋮ icon), duplicate button, and delete (trash) button.
  To add blocks: drag from left panel into the preview at insertion point indicators (blue horizontal line between blocks). Top header bar: "← Build" back button (returns to campaign wizard), auto-save indicator "Changes saved" (right side), "Preview" button (opens preview modal showing mobile/desktop toggle), "Continue" button → returns to campaign wizard. See `assets/screenshots/editor/000003.jpg`.

- [x] **Campaign scheduling modal**: Triggered by "Schedule" button in campaign wizard. Modal (480px wide) with title "Schedule Your Campaign". Fields:
  - **Delivery date**: Date input with calendar picker icon
  - **Delivery time**: Time input (hour:minute selector + AM/PM)
  - **Timezone**: Dropdown showing current timezone
  Bottom: "Schedule Campaign" button (teal) + "Cancel" link. On submit: sets campaign status to "scheduled", sets `scheduledAt`, redirects to campaigns list with success toast "Campaign scheduled!". See `assets/screenshots/000002.jpg`.

- [x] **Send campaign action**: When clicking "Send" and confirming in the wizard, update campaign status to "sent", set `sentAt` to current time, auto-generate a `report` object with realistic random metrics (open rate 20-45%, click rate 5-15%, bounce rate 1-3%, delivered = recipients - bounces). Show success toast "Campaign sent to X contacts!" and redirect to `/campaigns/:id/report`.

### Campaign Reports

- [x] **Campaign report page** (`/campaigns/:id/report`): Top section: campaign name as page title, "Sent on Dec 25, 2025 to Acme Audience" subtitle. 4 metric cards in a row:
  - **Delivered** (number / percentage): e.g., "1,230 / 98.4%" with mail icon
  - **Opened** (unique opens / open rate): e.g., "410 / 33.3%" with eye icon
  - **Clicked** (unique clicks / click rate): e.g., "130 / 10.6%" with cursor icon
  - **Bounced** (count / rate): e.g., "20 / 1.6%" with alert icon
  Below metrics, two columns:
  - **Left column** (60%): "Click Performance" section — horizontal bar chart showing top 5 clicked links (URL truncated, click count as bar width + number). Below that, "24-Hour Performance" — simple line/area chart showing opens over 24 hours (x-axis: hours 0-23, y-axis: open count).
  - **Right column** (40%): "Subscriber Activity" summary cards: Successful Deliveries, Total Opens, Unique Opens, Forwarded, Unsubscribed, Spam Complaints — each as a label + number pair. Below, "Campaign Details" card showing: Subject, Preview Text, From Name, From Email, Sent Date, Audience.

### Audience / Contacts

- [x] **All Contacts list** (`/audience`): Page title "All Contacts" with action buttons top-right: "Add Contact" (teal btn) + "Import" (outlined btn). Sub-header showing audience name and total count: "Acme Marketing Audience · 2,847 contacts". Filter bar: search input ("Search contacts by name or email"), status filter dropdown (All Contacts / Subscribed / Unsubscribed / Non-subscribed / Cleaned), tags filter dropdown (multi-select from available tags). Table columns:
  - **Checkbox** (bulk select)
  - **Email** (bold, clickable → `/audience/:id`)
  - **First Name**
  - **Last Name**
  - **Tags** (rendered as small rounded tag chips, max 3 shown + "+N more" overflow)
  - **Status** (badge: "Subscribed" green, "Unsubscribed" red, "Cleaned" gray, "Non-subscribed" gray-outlined)
  - **Rating** (1-5 star rating, filled stars yellow)
  - **Last Activity** (relative date)
  Table supports: sort by clicking column headers (Email, First Name, Last Name, Rating), pagination (25 per page with "Showing 1-25 of 2,847" + page navigation). When contacts selected via checkbox, show bulk action bar: "Add Tag" (dropdown), "Remove Tag" (dropdown), "Delete" (red), "Export" buttons.

- [x] **Contact detail profile** (`/audience/:id`): Top section: large avatar (initials circle, 64px, colored based on name), "Sarah Johnson" name (h2), email below, status badge. Two-column layout:
  - **Left column** (65%): "Activity" section showing reverse-chronological timeline: each entry shows icon + description + date (e.g., mail icon "Opened 'December Newsletter'" "Dec 25, 2025", click icon "Clicked link in 'Holiday Sale'" "Dec 20, 2025", subscribe icon "Subscribed via Signup Form" "Jan 20, 2024"). Generate 5-8 realistic activity entries per contact.
  - **Right column** (35%): "Contact Info" card (First Name, Last Name, Email, Phone, Birthday, Location — each field editable on click, save button). Below, "Tags" card showing tag chips with X remove button + "Add Tag" input. Below, "Notes" card with textarea for free-text notes (auto-saves on blur). Below, "Engagement" card showing: Email Marketing Rating (stars), Open Rate (percentage), Click Rate, Member Since date.
  Top-right "Edit" button (outlined) and 3-dot menu with: Archive Contact, Delete Contact, Export.

- [x] **Add Contact modal**: Triggered by "Add Contact" button on contacts list. Modal (520px) with title "Add New Contact". Fields: Email (required, validate email format), First Name, Last Name, Phone, Birthday (MM/DD), Tags (multi-select dropdown from existing tags). Status radio: Subscribed (default) / Non-subscribed. Bottom: "Add Contact" button (teal) + "Cancel". On submit: adds to contacts array, shows success toast, closes modal.

- [x] **Edit contact inline**: On the contact detail page, each info field (First Name, Last Name, Phone, Birthday, Location, Notes) is editable. Clicking the field or the pencil icon → field becomes an input. Blur or Enter → saves. Shows brief "Saved" confirmation.

- [x] **Segments page** (`/audience/segments`): Page title "Segments" with "Create Segment" button. Table: Name, Type (Saved / Pre-built badge), Members count, Created date, Actions (Edit, Delete). Pre-built segments (non-deletable): "New Subscribers", "Active", "Inactive". Saved segments from seed data. Clicking "Create Segment" → inline or modal segment builder.

- [x] **Segment builder**: Modal or inline panel. Title "Create Segment". Match condition: "Contacts match [all/any] of the following conditions:". Condition rows, each with 3 dropdowns:
  - **Field**: Email Activity, Tags, Location, Source, Rating, Subscribed Date
  - **Operator** (changes based on field): for Email Activity → "opened" / "did not open" / "clicked" / "was sent"; for Tags → "is" / "is not"; for Rating → "is greater than" / "is less than"; for Date → "is after" / "is before"
  - **Value**: varies — last campaign name (for activity), tag name dropdown (for tags), number input (for rating), date picker (for date)
  "Add condition" link below last condition (+ icon). "Remove" (X icon) on each condition row. Preview count: "Estimated: 342 contacts" (computed by filtering contacts client-side). "Save Segment" (name input + teal button) + "Cancel".

- [x] **Tags management page** (`/audience/tags`): Page title "Tags" with "Create Tag" button (teal). Grid or list of tag cards, each showing: tag name (bold), contact count ("156 contacts"), created date, and actions (Edit name, Delete). "Create Tag" opens inline input or small modal: tag name field + "Create" button. Clicking a tag → filters the All Contacts list to that tag (`/audience?tag=VIP`). Delete tag shows confirmation dialog "Delete tag 'VIP'? This will remove the tag from 156 contacts." Edit tag allows inline rename.

- [x] **Import contacts page** (`/audience/import`): Page title "Import Contacts". Two options presented as cards:
  1. **Copy/paste** card: Opens textarea where user can paste emails (one per line or comma-separated). Parse and validate emails, show count. "Import X contacts" button.
  2. **Upload CSV** card: Drag-and-drop zone (dashed border, "Drop your CSV here or click to browse" text). In mock: clicking opens a simulated file-selected state showing "contacts.csv — 50 contacts found". Map columns step (simplified): auto-detect Email, First Name, Last Name columns.
  Both paths: tag selector ("Add tags to imported contacts"), status selector (Subscribed/Non-subscribed). "Import" button → simulates adding contacts, shows success toast "X contacts imported successfully!".

### Automations

- [x] **All Automations list** (`/automations`): Page title "Automations" with "Create Automation" button (teal, top-right). Filter tabs: All | Active | Paused | Draft. Table columns:
  - **Name** (bold, clickable → `/automations/:id`)
  - **Type** (badge: "Welcome" blue, "Cart" orange, "Birthday" pink, "Win-back" purple, "Custom" gray)
  - **Status** (badge: "Active" green dot + text, "Paused" yellow dot, "Draft" gray dot)
  - **Emails Sent** (total count)
  - **Open Rate** (percentage)
  - **Last Updated** (relative date)
  - **Actions** (3-dot: Edit, Pause/Resume, Duplicate, Delete)
  "Pause/Resume" toggles the automation status.

- [x] **Pre-built automation templates** (`/automations/prebuilt` or shown when creating): Grid of 6 template cards (each ~300px wide, 200px tall):
  - **Welcome New Subscribers**: "Automatically send a welcome email when someone joins your audience" — Zap icon, blue accent
  - **Abandoned Cart**: "Remind customers about items left in their cart" — ShoppingCart icon, orange accent
  - **Birthday Greetings**: "Send a special offer on subscriber birthdays" — Gift icon, pink accent
  - **Re-engagement**: "Win back subscribers who haven't opened emails recently" — RefreshCw icon, purple accent
  - **Post-Purchase Follow-up**: "Thank customers and ask for a review after purchase" — Package icon, green accent
  - **Custom Automation**: "Start from scratch with a blank workflow" — Plus icon, gray accent
  Clicking a template → creates new automation of that type (pre-fills trigger and first step), navigates to `/automations/:id`.

- [x] **Automation builder** (`/automations/:id`): Top bar: back arrow + automation name (editable inline) + status badge + "Activate" / "Pause" toggle button (right side). Below, visual workflow rendered vertically (centered, 600px max-width):
  - **Trigger node** (top): rounded rectangle, icon + "When someone subscribes to Acme Audience" (or other trigger). Click → sidebar panel to edit trigger type and audience.
  - **Arrow connector** (vertical line with arrow, between each node)
  - **Step nodes**: each is a card showing step type icon + summary. Types:
    - **Send Email** (mail icon): shows subject line preview, click → expands to show/edit subject, preview text, "Edit Email" button (opens email editor)
    - **Wait** (clock icon): shows "Wait 3 days", click → inline edit duration (number + unit dropdown: minutes/hours/days/weeks)
    - **If/Else** (GitBranch icon): shows condition summary, splits into Yes/No branches
  - **"Add Step" button** (+ circle) between each step and at the bottom: click → dropdown menu: "Send Email", "Wait", "If/Else condition"
  - Each step has: drag handle (left), 3-dot menu (right: Delete step, Duplicate, Move up/down)
  Workflow is purely visual (not a full node-graph editor — just a vertical ordered list with connectors).

### Analytics

- [x] **Reports overview** (`/analytics`): Page title "Reports". Time range selector (top-right): "Last 7 days" / "Last 30 days" / "Last 90 days" / "All Time" as segmented button group. 4 summary stat cards:
  - **Emails Sent** (total, with trend arrow: +12% from previous period)
  - **Average Open Rate** (percentage, with trend)
  - **Average Click Rate** (percentage, with trend)
  - **Audience Growth** (net new contacts this period)
  Below, "Campaign Performance" table: all sent campaigns sorted by most recent, columns: Campaign Name (link to report), Sent Date, Delivered, Open Rate (with horizontal mini-bar), Click Rate (with mini-bar), Revenue ($0 placeholder). Below table, "Audience Growth" section: simple area chart placeholder showing subscriber count over time (can be an SVG-based or CSS-based simple chart; no need for a charting library — use div-based bar chart or hardcoded SVG path).

---

## P2 — Secondary Features

<!-- Depth and realism, implement after P1 is solid. -->

- [x] **Content Studio** (`/content`): Page title "Content" with "Upload" button (teal). View toggle: Grid / List. Grid shows file cards (thumbnail preview — use colored placeholder rectangles for images, document icon for docs — filename, size, date). List shows table (Thumbnail small, Name, Type, Size, Dimensions, Uploaded date, Actions). Clicking a file → detail modal showing preview, metadata, "Copy URL" button, "Delete" button. "Upload" button → mock upload: shows a file-picker placeholder that immediately adds a new mock file entry.

- [x] **Landing Pages list** (`/landing-pages`): Page title "Landing Pages" with "Create Landing Page" button. Table: Name, Status badge (Published green / Draft gray / Unpublished red), URL (truncated, clickable external link icon), Views count, Signups count, Published date, Actions (Edit, Unpublish/Publish, Delete).

- [x] **Account Settings** (`/settings`): Page title "Settings". Card-based sections:
  - **Company Info**: Company name (editable), Address fields, Phone, Website URL
  - **Default Sending**: From Name, From Email, Reply-To Email — each editable with save button
  - **Timezone**: Dropdown selector of common timezones
  - **Notification Preferences**: Toggle switches for Email notifications (campaign sent, report ready, import complete)
  "Save Changes" button at bottom of each section.

- [x] **Notification bell dropdown**: Bell icon in top header with unread count badge (red circle with number). Clicking opens a dropdown (320px wide, max 400px tall, scrollable). Each notification: icon based on type + title (bold) + message + relative timestamp. Unread items have left blue accent border. "Mark all as read" link at top. Clicking a notification → marks it read + navigates to `notification.link`.

- [x] **Global search**: Search input in top header (expandable on focus to 400px). As user types, show dropdown with categorized results:
  - **Campaigns**: matching campaign names (max 3 results, link to campaign)
  - **Contacts**: matching email/name (max 3 results, link to contact profile)
  - **Automations**: matching automation names (max 2 results)
  Each result shows icon + name + type label. "See all results" link at bottom. Filter across `campaigns`, `contacts`, `automations` by name/email containing search query.

- [x] **Create button modal**: Clicking the yellow "Create" button in the sidebar opens a centered modal (600px wide). Title "Create". Search input "Search our available campaign types". List of creation options (each with icon, title bold, description):
  - **Email** (Mail icon): "Design and send automated or regular emails to your contacts." → navigates to `/campaigns/new`
  - **Customer Journey** (Workflow icon): "Map out a marketing journey that delivers a unique experience to each of your contacts." → navigates to `/automations/prebuilt`
  - **Email Template** (Layout icon): "Design your own template or tailor a pre-designed one to fit your brand." → navigates to `/content`
  - **Landing Page** (Globe icon): "Create a landing page to collect new contacts, promote a product, or offer a discount." → navigates to `/landing-pages`
  - **Survey** (ClipboardList icon): "Collect feedback from your audience." → shows "Coming soon" toast
  Right side of modal shows a hero image/illustration area (use a placeholder with styled bg). See `assets/screenshots/000001.jpg`.

- [x] **Duplicate campaign action**: In campaign list 3-dot menu → "Duplicate" creates a copy with name "Copy of [original name]", status "draft", clears scheduling/send/report data, adds to campaigns list. Show toast "Campaign duplicated".

- [x] **Delete confirmations**: All delete actions (campaign, contact, tag, segment, automation, landing page) show a confirmation modal: "Are you sure you want to delete '[name]'? This action cannot be undone." with "Delete" (red) and "Cancel" buttons.

- [x] **Toast notifications**: Global toast notification system. Toasts appear top-right, auto-dismiss after 4 seconds, show success (green left border) or error (red left border) with message text and X close button. Stack up to 3 toasts.

- [ ] **A/B test campaign type**: In campaign creation, option to create A/B test. Shows two subject line inputs ("Subject A" / "Subject B") and split percentage slider (50/50 default, adjustable). Winner criteria dropdown: "Open rate" / "Click rate". Everything else same as regular campaign. On "send", generates two report variants.

- [ ] **Campaign preview modal**: In email editor, "Preview" button opens modal showing the email rendered. Toggle at top: "Desktop" (600px centered preview) / "Mobile" (320px centered preview, scaled content). "Send Test Email" button at bottom (simulated — shows toast "Test email sent to rakesh@acmemarketing.com").

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. See data_model.md for complete field definitions. -->

- [x] **User**: Pre-logged-in as Rakesh Mondal, rakesh@acmemarketing.com, company "Acme Marketing Co.", Standard plan, timezone America/New_York

- [x] **Audience**: 1 audience "Acme Marketing Audience" with stats: 2847 total, 2340 subscribed, 312 unsubscribed, 95 cleaned, 100 non-subscribed

- [x] **Contacts**: 25 records with diverse names (Sarah Johnson, Michael Chen, Emma Williams, James Rodriguez, Aisha Patel, etc.), mix of statuses (18 subscribed, 4 unsubscribed, 2 cleaned, 1 non-subscribed), varied engagement ratings (1-5), tags distributed across VIP/Newsletter/Leads/Customers/Event Attendees, realistic email addresses, US + international locations. Each contact needs 3-6 activity entries for the timeline.

- [x] **Tags**: 8 tags: VIP (5 contacts), Newsletter (15), Leads (8), Customers (10), Event Attendees (3), New (6), Inactive (4), Wholesale (2)

- [x] **Segments**: 6 segments: "Active Subscribers" (opened last 30 days, 1250 members), "New This Month" (subscribed after date, 45 members), "VIP Customers" (tag is VIP, 156 members), "Inactive 90 Days" (not opened 90 days, 320 members), "Newsletter Only" (tag is Newsletter AND NOT Customers, 180 members), "High Engagement" (rating > 3, 410 members)

- [x] **Campaigns**: 9 campaigns covering variety: 4 sent (with generated reports), 3 drafts (varying completeness), 1 scheduled, 1 paused. Each sent campaign has realistic report data with topLinks and hourly performance data.

- [x] **Templates**: 12 templates: 6 prebuilt (Sell Products, Announcement, Story, Follow Up, Educate, Basic) with placeholder content blocks + 6 custom saved by user

- [x] **Automations**: 5 automations: Welcome Series (active, 3 steps: email→wait 2 days→email→wait 5 days→email), Abandoned Cart (active, 2 steps), Birthday (paused, 1 step), Re-engagement (draft, empty), Post-Purchase (active, 2 steps). Each active automation has realistic stats.

- [x] **Content Files**: 10 files with names like "hero-banner.jpg", "product-photo-1.jpg", "logo.png", "sale-graphic.png", etc. Varied sizes and dimensions.

- [x] **Landing Pages**: 3 pages: "Holiday Sale" (published, 2340 views), "Newsletter Signup" (published, 890 views), "Product Launch" (draft, 0 views)

- [x] **Notifications**: 7 notifications spanning last 7 days: "Campaign Sent: December Newsletter" (unread), "Import Complete: 50 contacts added" (read), "Report Ready: Holiday Sale Announcement" (unread), "Automation triggered: Welcome Series" (read), "New subscriber: emma@example.com" (read), "Campaign Scheduled: Year in Review" (unread), "Weekly summary available" (read)

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login / logout (app starts pre-logged-in as Rakesh Mondal)
- Real email sending or SMTP integration
- Payment, billing, or plan upgrade flows
- Real file uploads (simulate in Content Studio)
- Third-party integrations (Integrations page can show list but no real connections)
- Real-time collaboration or multi-user
- Mobile-responsive breakpoints (desktop-only is fine)
- Advanced email editor (full WYSIWYG with all formatting options — keep it simplified)
- Customer Journey visual graph editor (use simplified vertical step list instead)
- Website builder feature (just list landing pages)
