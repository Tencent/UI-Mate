# Xalesforce CRM Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-02-28
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell (Already Complete)

These items are already implemented and working:

- [x] Project scaffold: Vite + React + TypeScript with react-router-dom, date-fns, lucide-react
- [x] App layout: TopNav (56px) + Sidebar (240px collapsible) + Main content area with 24px padding
- [x] Routing: App.tsx with BrowserRouter — 17 routes defined (/, /leads, /leads/:id, /accounts, /accounts/:id, /contacts, /contacts/:id, /opportunities, /opportunities/:id, /cases, /cases/:id, /chatter, /files, /dashboards, /reports, /calendar, /go)
- [x] State management: AppContext + initialData.ts with createInitialData(), deepMergeWithDefaults(), normalization
- [x] `/go` endpoint: StateInspector page returning {initial_state, current_state, state_diff}
- [x] Session isolation: vite.config.js mock-api plugin (POST /post?sid=, GET /state?sid=) + sessionStorage sid
- [x] Toast notification system
- [x] Global search (SearchBox component)
- [x] Generic CreateModal component
- [x] CSS design system with Xalesforce variables (--primary: #0176D3, --success: #04844B, etc.)

---

## P1 — Primary Features (Gaps to Fix)

These are the most critical improvements for agent training. Each makes existing pages more interactive and realistic.

### 1. Opportunity Kanban/Pipeline Board View
- [x] Add a toggle on the Opportunities page between "Table" and "Kanban" view modes (two buttons in the header area, styled like Xalesforce toggle tabs: icon + text, active state has bottom blue border)
- [x] **Kanban board layout**: Render columns for each stage (Prospecting, Qualification, Needs Analysis, Value Proposition, Proposal, Negotiation, Closed Won, Closed Lost). Each column has: a header showing stage name + count of deals + sum of amounts (formatted as "$XXK"), then a vertical stack of opportunity cards below
- [x] **Opportunity cards in Kanban**: Each card (white background, 1px border, 8px border-radius, 12px padding) shows: opportunity name (bold, linked to detail page), account name (smaller, gray), amount (green text, formatted "$XXK"), close date, small colored circle for owner avatar. On hover: subtle shadow elevation
- [x] **Drag-and-drop stage change**: Use native HTML5 drag/drop (no external library needed). When user drags a card from one column to another, update the opportunity's `stage` field in state and update the `probability` field to match the new stage's default probability (see data_model.md §Opportunity Stages). Show a toast "Opportunity moved to {stage}"
- [x] **Column styling**: Columns should have a light gray background (#F3F3F3), max-height with scroll if many cards, and a subtle top border color matching Xalesforce stage colors (use primary blue for active stages, green for Closed Won, red for Closed Lost)

### 2. Record Detail Page — Activity Timeline Tab
- [x] On LeadDetail, AccountDetail, ContactDetail, OpportunityDetail, and CaseDetail pages: replace the placeholder "No activities yet" in the Activity tab with a working **Activity Timeline** component
- [x] **Activity Timeline component** (`src/components/ActivityTimeline.tsx`): Takes `relatedToType` and `relatedToId` props. Filters `state.activities` to find matching activities. Renders them as a vertical timeline with a blue line on the left, circular nodes (blue for tasks, orange for events), each item showing: icon (CheckSquare for tasks, CalendarIcon for events) + subject (bold) + due date or start/end time + status badge + assignee name. Sort by date descending (most recent first)
- [x] **Add Activity button**: At the top of the timeline, show a "Log a Call" / "New Task" / "New Event" button group. Each opens the CreateModal with appropriate fields. The new activity should have `relatedToType` and `relatedToId` pre-filled
- [x] **Task completion toggle**: Each task item has a checkbox. Clicking it toggles the task status between "Not Started" and "Completed". Completed tasks show strikethrough subject text and a green checkmark node instead of blue

### 3. Record Detail Page — Related Lists Tab
- [x] On **AccountDetail**: Related tab shows three related list tables: (1) **Contacts** — all contacts where `accountId` matches, showing Name, Title, Email, Phone with "New Contact" button; (2) **Opportunities** — all opportunities where `accountId` matches, showing Name, Amount, Stage, Close Date with "New Opportunity" button; (3) **Cases** — all cases where `accountId` matches, showing Case Number, Subject, Status, Priority with "New Case" button
- [x] On **ContactDetail**: Related tab shows: (1) **Opportunities** — opportunities associated with the contact's account; (2) **Cases** — cases where `contactId` matches; (3) **Activities** — activities related to this contact
- [x] On **OpportunityDetail**: Related tab shows: (1) **Activities** — activities related to this opportunity; (2) **Contact Roles** — contacts associated with the opportunity's account (display as simple table)
- [x] On **LeadDetail**: Related tab shows: (1) **Activities** — activities related to this lead; (2) **Files** — any files (static placeholder list is fine)
- [x] Each related list table: card container with header (entity name + count badge + "New" button on the right), table with 3-5 columns, max 5 rows with "View All" link if more exist. Clicking a name navigates to that record's detail page

### 4. Xalesforce Path — Interactive Stage Advancement
- [x] On **OpportunityDetail**: Make the stage progress bar interactive. Each stage segment is clickable. Clicking a stage opens a small popover/dropdown below it showing: stage name, "Mark as Current Stage" button, and key fields for that stage (e.g., for "Qualification" show "Budget Confirmed?" checkbox; for "Proposal" show "Proposal Sent Date" text)
- [x] Clicking "Mark as Current Stage" updates the opportunity's `stage` and `probability` fields, recalculates the progress bar fill, and shows a toast confirmation
- [x] If clicking "Closed Won" stage: show a celebration effect — a brief confetti-style CSS animation (use a simple keyframe animation with colored dots that scatter and fade, no external library) and green success toast "Congratulations! Deal closed!"
- [x] Add similar Path component to **LeadDetail** page showing lead status path: New → Working → Qualified → Converted (excluding Unqualified). Clicking advances lead status

### 5. Inline Field Editing on Detail Pages
- [x] On all detail pages (Lead, Account, Contact, Opportunity, Case): each field value in the Details tab should be editable inline. When user hovers over a field value, show a subtle pencil icon on the right side
- [x] Clicking the field value or pencil icon transforms it into an input field (text input, select, or textarea depending on field type). Show Save (checkmark) and Cancel (X) buttons inline
- [x] On Save: update the field in state, update `modifiedDate`, show toast "{Field Name} updated". On Cancel: revert to original value
- [x] Implement as a reusable `InlineEdit` component that accepts: `value`, `fieldName`, `fieldType` ("text" | "select" | "textarea" | "number" | "date" | "email"), `options` (for select), `onSave` callback
- [x] For select fields (Status, Stage, Rating, Priority, etc.): render a dropdown with the valid options. For textarea fields: render a multi-line expandable input

### 6. Bulk Actions on List Pages
- [x] On Leads, Accounts, Contacts, Opportunities, and Cases list pages: when one or more checkboxes are selected, show a **bulk action bar** that slides down from below the header. The bar shows: "{N} items selected" text on the left, and action buttons on the right
- [x] **Bulk action buttons**: "Change Owner" (opens a dropdown to select a user from state.users), "Change Status" (opens dropdown with valid statuses for that entity), "Delete" (shows confirmation modal listing selected record names), "Export Selected" (CSV export of just selected records)
- [x] After bulk action completes: deselect all, show toast "{N} records updated" or "{N} records deleted", refresh the list
- [x] The bulk action bar has a distinct style: background `#F3F3F3`, 1px top/bottom border, 48px height, 16px padding, appears with a slide-down animation

### 7. Notification Panel
- [x] Replace the hardcoded "3" notification badge in TopNav with a dynamic count. Calculate from: overdue tasks (dueDate < today && status !== 'Completed') + cases with status 'Escalated' + opportunities closing within 7 days
- [x] Clicking the notification bell icon opens a dropdown panel (320px wide, max-height 400px, scrollable). Panel shows a list of notification items, each with: icon (warning triangle for overdue, bell for escalated, clock for closing soon), title text, description text, timestamp, and a dismiss (X) button
- [x] Notification types: (1) "Overdue Task: {subject}" with link to related record; (2) "Escalated Case: {caseNumber} - {subject}" with link to case; (3) "Opportunity closing soon: {name} - {closeDate}" with link to opportunity
- [x] Dismissing a notification removes it from the list and decrements the badge count. Store dismissed notification IDs in state (add `dismissedNotifications: string[]` to AppState)
- [x] Panel header shows "Notifications" title + "Mark All as Read" button

### 8. Dynamic Sidebar Recent Items
- [x] Replace the hardcoded `recentItems` array in Sidebar.tsx with dynamic tracking. When user navigates to any record detail page (leads/:id, accounts/:id, etc.), add that record to a "recently viewed" list in state
- [x] Add `recentlyViewed: Array<{ type: string; id: string; name: string; path: string; timestamp: string }>` to AppState
- [x] In each detail page component, add a `useEffect` that calls `updateState` to push the current record to `recentlyViewed` (max 10 items, deduplicate by id, most recent first)
- [x] Sidebar reads from `state.recentlyViewed` instead of hardcoded array. Each item shows a small icon matching its type (User icon for leads, Building for accounts, etc.) + the record name, truncated with ellipsis if too long

### 9. Expand Seed Data
- [x] Increase initial data volume for more realistic feel and better agent training scenarios. See `assets/data_model.md` §Suggested createInitialData() for target counts
- [x] **Leads (8 total)**: 3 New (diverse sources: Website, LinkedIn, Trade Show), 2 Working (one Hot, one Warm), 2 Qualified (both Hot), 1 Unqualified (Cold). Mix of industries: Technology, Healthcare, Finance, Manufacturing, Retail. Diverse geographic locations (SF, NYC, Chicago, Austin, Seattle, Boston, Denver, Miami)
- [x] **Accounts (5 total)**: Acme Corporation (Technology, Customer, $50M), Global Enterprises (Finance, Customer, $120M), Innovate Solutions (Healthcare, Prospect, $25M), Pacific Trading Co. (Manufacturing, Partner, $80M), Summit Digital (Retail, Prospect, $15M)
- [x] **Contacts (6 total)**: 2 for Acme (CTO Alice Williams, VP Sales Bob Chen), 2 for Global (CFO Diana Park, Director of IT Frank Rivera), 1 for Innovate (CEO Dr. Lisa Patel), 1 for Pacific (Procurement Manager Tom Nakamura). Set `reportsToId` where appropriate (Bob reports to Alice)
- [x] **Opportunities (6 total)**: Spread across stages — 1 Prospecting ($25K), 1 Qualification ($75K), 1 Needs Analysis ($150K), 1 Proposal ($200K), 1 Negotiation ($350K), 1 Closed Won ($500K). Different close dates spanning next 3 months. Different owners
- [x] **Cases (5 total)**: 2 New (1 High, 1 Medium), 1 Working (High), 1 Escalated (Critical), 1 Closed (Low). Different origins: Phone, Email, Web, Chat. Realistic subjects: "Dashboard access error", "Data export not working", "Integration API timeout", "Billing discrepancy", "Feature request: bulk import"
- [x] **Activities (8 total)**: 4 tasks (1 overdue/Not Started, 1 due today/In Progress, 1 due next week/Not Started, 1 completed yesterday). 4 events (1 past, 1 today, 2 future within the current month). Link to various records: 2 to opportunities, 2 to leads, 2 to accounts, 2 to cases
- [x] **Chatter posts (5 total)**: Mix of content types — deal announcement, team update, question, welcome message, quarterly review. 3 posts with 1-3 comments each. Likes from various users
- [x] **Files (5 total)**: Q4_Forecast.xlsx (245KB), Sales_Playbook.pdf (1.2MB), Acme_Proposal.docx (890KB), Pipeline_Review.pptx (3.5MB), Team_Photo.png (2.1MB)
- [x] Add `recentlyViewed: []` and `dismissedNotifications: []` to initial state

---

## P2 — Secondary Features (Depth & Realism)

Implement these after P1 is solid. They add depth for more advanced agent training scenarios.

### 10. Dashboards Page — Chart Visualizations
- [ ] Replace the hardcoded Dashboards page with a proper dashboard grid. Use CSS-only chart visualizations (no charting library needed — pure HTML/CSS bars and segments)
- [ ] **Pipeline by Stage chart**: Horizontal stacked bar chart. Each stage gets a segment proportional to the total opportunity amount in that stage. Segments colored by stage (use a blue gradient from light for early stages to dark for later). Hover on a segment shows tooltip with stage name, count, and total amount
- [ ] **Leads by Source chart**: Vertical bar chart (CSS flex with colored divs). Each bar represents a lead source, height proportional to count. Colors: Website=#0176D3, Referral=#04844B, Trade Show=#FFB75D, Cold Call=#706E6B, LinkedIn=#0077B5. Bar labels below, count labels above
- [ ] **Opportunity Win Rate donut**: CSS conic-gradient circle. Shows Closed Won / (Closed Won + Closed Lost) as a percentage. Center text shows the percentage. Green for won, red for lost, gray for remaining
- [ ] **Monthly Revenue trend**: Simple CSS line chart using positioned dots connected by SVG lines or CSS borders. Show last 6 months with mock data points. X-axis: month names, Y-axis: dollar amounts
- [ ] **KPI cards row**: Total Revenue (sum of Closed Won amounts), Pipeline Value (sum of open opportunity amounts), Avg Deal Size, Conversion Rate (Qualified leads / total leads %)
- [ ] Dashboard has a "Refresh" button (recalculates all from current state) and "Last Refreshed: {timestamp}" text

### 11. Reports Page — Report Builder
- [ ] Replace the basic Reports page with a report builder interface. Show a list of **pre-built reports** as cards in a grid: "Leads by Status", "Opportunities by Stage", "Cases by Priority", "Activities Due This Week", "Revenue by Account"
- [ ] Clicking a report card opens a **report detail view** showing: (1) report title, (2) filter bar with dropdowns to narrow data, (3) data table with sortable columns, (4) summary row at the bottom with totals/averages, (5) "Export to CSV" button
- [ ] **Leads by Status report**: Table columns: Name, Company, Status, Source, Rating, Owner, Created Date. Filters: Status dropdown, Rating dropdown, Source dropdown, Date range. Summary: "Total: {N} leads, {N} Hot, {N} Warm, {N} Cold"
- [ ] **Opportunities by Stage report**: Columns: Name, Account, Amount, Stage, Probability, Close Date, Owner. Filters: Stage dropdown, Min/Max Amount, Date range. Summary: "Total: {N} opportunities, ${total} pipeline"
- [ ] **Cases by Priority report**: Columns: Case #, Subject, Status, Priority, Origin, Account, Created Date. Filters: Status, Priority, Origin. Summary: "Total: {N} cases, {N} open, {N} closed"
- [ ] Add a "New Report" button that opens a simple wizard: (1) Choose object (Lead/Account/Contact/Opportunity/Case), (2) Select columns, (3) Set filters, (4) Preview

### 12. Owner Change / Reassignment
- [ ] On all detail pages: add an "Change Owner" button (or make the Owner field in inline edit open a user selector)
- [ ] Clicking opens a modal with a dropdown listing all users from `state.users`. Show each user's avatar + name + title
- [ ] Selecting a user and clicking "Save" updates the record's `ownerId`, updates `modifiedDate`, and shows toast "Owner changed to {name}"

### 13. Account Detail — Hierarchy & Map
- [ ] On AccountDetail: add a visual account hierarchy if `parentAccountId` is set. Show as a simple tree: parent account name (linked) → current account name → child accounts (linked)
- [ ] Add a static map placeholder (use a colored rectangle with "Map" text and a pin icon) showing the billing address

### 14. Calendar Improvements
- [ ] Fix calendar grid to properly align day cells with the correct day-of-week (currently `daysInMonth` starts from day 1 without padding for the starting weekday). Add empty cells at the start of the month to align Sunday=0
- [ ] Add **week view toggle**: a "Week" button next to "Month" that shows 7 columns for the current week, with time slots from 8am to 6pm in 1-hour rows. Events render as colored blocks spanning their time range
- [ ] Clicking on a day cell (in month view) or a time slot (in week view) should pre-fill the "New Event" modal with that date/time
- [ ] Add **Today button**: returns to current month/week view. Add visual indicator for current day (already has blue border, but also add subtle blue background tint)
- [ ] Show task due dates on the calendar alongside events (use a different color: orange for tasks vs blue for events)

### 15. Search Enhancement
- [ ] Expand SearchBox to also search Cases (by subject, caseNumber) and Activities (by subject)
- [ ] Add search result grouping: show results grouped under headers ("Leads", "Accounts", "Contacts", "Opportunities", "Cases") with a count for each group
- [ ] Add keyboard navigation: Up/Down arrows to navigate results, Enter to select, Tab to cycle through groups
- [ ] Show "No results found" message with suggestion: "Try searching for a name, company, or email"
- [ ] Add recent searches: remember last 5 search queries in state, show them when search box is focused but empty

### 16. List View Column Customization
- [ ] On each list page (Leads, Accounts, Contacts, Opportunities, Cases): add a gear icon button that opens a "Customize Columns" popover
- [ ] The popover shows all available fields as checkboxes. User can check/uncheck to show/hide columns
- [ ] Store column preferences in state per entity type
- [ ] Also allow column reordering via drag-and-drop within the popover list

### 17. Record Clone on All Detail Pages
- [ ] LeadDetail already has a Clone button. Add the same Clone functionality to AccountDetail, ContactDetail, OpportunityDetail, and CaseDetail
- [ ] Clone creates a copy with "(Clone)" appended to the name, new ID, current timestamps, same owner
- [ ] Navigate to the cloned record after creation, show toast "Record cloned successfully"

---

## Data Seed (implement in createInitialData())
- [x] Users: 5 records — John Smith (Manager), Emma Wilson (Senior Rep), Michael Chen (Rep), Sarah Davis (Rep), David Brown (Junior Rep)
- [x] Leads: 8 records covering all statuses (3 New, 2 Working, 2 Qualified, 1 Unqualified), diverse sources, ratings, and industries
- [x] Accounts: 5 records — Acme Corp (Tech/$50M), Global Enterprises (Finance/$120M), Innovate Solutions (Healthcare/$25M), Pacific Trading (Manufacturing/$80M), Summit Digital (Retail/$15M)
- [x] Contacts: 6 records, 1-2 per account with reporting relationships
- [x] Opportunities: 6 records across all stages, $25K to $500K amounts, different owners
- [x] Cases: 5 records with mix of statuses, priorities, and origins
- [x] Activities: 8 records — 4 tasks (1 overdue, 1 today, 1 next week, 1 completed) + 4 events (1 past, 1 today, 2 future)
- [x] Chatter: 5 posts with varied content, 3 with comments, diverse likes
- [x] Files: 5 files of different types (.xlsx, .pdf, .docx, .pptx, .png)
- [x] Add `recentlyViewed: []` and `dismissedNotifications: []` to AppState type and initial data

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login / logout (app starts pre-logged-in as John Smith, userId "user-1")
- Real API calls or network communication
- Database persistence beyond localStorage
- File uploads to real servers
- Email/SMS sending
- OAuth/SSO/security
- Setup/admin pages
- AppExchange/marketplace
- Einstein AI features
- Mobile-specific layouts (desktop only)
- Real-time collaboration (Chatter is single-user mock)
