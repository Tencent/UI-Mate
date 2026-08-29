# XubSpot CRM Mock — Research Summary

## Application Overview

**XubSpot CRM** is a comprehensive Customer Relationship Management platform by XubSpot, Inc. It serves as the central hub for managing contacts, companies, deals, tickets, tasks, and marketing activities. The free CRM tier is widely used by small-to-medium businesses and includes contact management, deal pipelines, ticketing, email templates, meeting scheduling, and reporting dashboards.

**Category:** CRM / Sales & Marketing Platform
**Target Users:** Sales reps, marketing managers, customer service agents, business owners
**Distinctive Traits:** Orange-themed UI (#FF7A59), Kanban-style deal pipeline, deep relationship linking between contacts/companies/deals/tickets, activity timeline on every record

---

## Key User Personas & Workflows

### 1. Sales Representative (Primary)
- Views deal pipeline board, drags deals between stages
- Creates new contacts and associates them with companies
- Logs calls/emails/meetings against contact records
- Creates and manages tasks (follow-ups, calls)
- Uses email templates for outreach
- Tracks deal amounts and close dates

### 2. Sales Manager
- Views dashboard with KPI cards (revenue, pipeline, contacts)
- Filters deals by owner, stage, date range
- Reviews reports and charts
- Creates deals and assigns them

### 3. Customer Service Agent
- Creates and manages service tickets
- Updates ticket status through pipeline stages
- Associates tickets with contacts and companies
- Tracks ticket priority and resolution

### 4. Marketing Manager
- Manages email templates
- Reviews form submissions
- Schedules meetings
- Views marketing performance on dashboard

---

## Complete Feature Inventory

### P0 — Core Shell (Must exist for app to render)
1. **App Layout**: Left sidebar (dark navy #2D3E50, 256px) + top header bar (64px, white) + main content area (#F5F8FA background)
2. **Sidebar Navigation**: XubSpot logo/branding at top, grouped nav items (CRM: Dashboard, Contacts, Companies, Deals, Tickets; Marketing & Sales: Email Templates, Meetings, Forms; System: State Inspector), user profile at bottom
3. **Top Header**: Page title on left, search bar in center-right, notification/settings/help icons on far right
4. **Routing**: BrowserRouter with routes for each page + /go state inspector
5. **State Management**: React Context with useReducer, localStorage persistence, session-aware storage
6. **Session Isolation**: vite.config.js mock-api plugin with /post, /state, /go, /upload endpoints

### P1 — Primary Features (Core interactive workflows)

#### Contacts (CRM > Contacts)
1. **Contacts Table View**: Table with columns: checkbox, Name (with avatar), Email, Phone, Job Title, Company, Actions. Header row with column sort indicators
2. **Create Contact Modal**: Slide-in panel or modal with fields: Email (required), First Name, Last Name, Job Title, Phone, Lifecycle Stage (dropdown: Lead/MQL/SQL/Opportunity/Customer), Lead Status, Company (association dropdown). Form validation
3. **Edit Contact**: Click contact name to open edit modal, modify any field
4. **Delete Contact**: Delete button with confirmation dialog
5. **Contact Search**: Search by name, email, phone in the search bar above table
6. **Contact Filters**: Filter dropdown chips for Contact Owner, Create Date, Last Activity Date, Lead Status, Lifecycle Stage. "All filters" button shows full filter panel
7. **Bulk Select**: Select-all checkbox, individual row checkboxes, bulk actions bar (Delete, Assign Owner)
8. **Contact Detail View**: Click contact name → detail page with: Left sidebar (About this contact: properties), Center (Activity Timeline: notes, emails, calls, meetings in reverse-chronological), Right sidebar (Associated companies, deals, tickets)

#### Companies (CRM > Companies)
9. **Companies Table View**: Table with checkbox, Company Name (with building icon), Domain, Industry, City/State, Phone, Associated Contacts (avatar stack)
10. **Create Company Modal**: Fields: Company Name (required), Domain, Industry (dropdown), Phone, City, State, Country, Number of Employees, Annual Revenue, Lifecycle Stage, Owner
11. **Edit/Delete Company**: Same CRUD pattern as contacts
12. **Company Search & Filter**: Search + filter chips (Industry, Create Date, etc.)

#### Deals (CRM > Deals / Sales Pipeline)
13. **Deals Board View (Kanban)**: Columns for each pipeline stage. Each card shows: Deal Name, Amount ($), Close Date, Company name. Column header shows stage name, deal count, and total amount. Drag-and-drop between columns
14. **Deals Table View**: Toggle between Board and Table view (list/grid icons). Table columns: Deal Name, Stage, Amount, Close Date, Deal Owner, Company
15. **Create Deal Modal**: Fields: Deal Name (required), Pipeline (dropdown), Deal Stage (dropdown based on pipeline), Amount, Close Date (date picker), Deal Owner, Deal Type (New Business/Existing Business), Associate with Contact, Associate with Company
16. **Edit Deal**: Click deal card → deal detail panel or inline editing
17. **Delete Deal**: With confirmation
18. **Pipeline Stage Totals**: Each column shows total $ amount and weighted amount at the bottom

#### Tickets (Service > Tickets)
19. **Tickets Table View**: Table with Subject, Status (with color icon), Priority (badge), Pipeline, Category, Source, Contact, Owner, Create Date
20. **Create Ticket Modal**: Fields: Ticket Name (required), Pipeline, Status, Priority (Low/Medium/High), Category, Description, Contact (association), Owner
21. **Edit/Delete Ticket**: CRUD operations
22. **Ticket Status Pipeline**: Visual progression indicator (New → Waiting → In Progress → Closed)

#### Tasks
23. **Tasks Page**: Table/list view with columns: Task Title, Type (To-do/Call/Email), Due Date, Priority, Associated Contact, Status (Not Started/In Progress/Completed)
24. **Create Task Modal**: Title, Type, Due Date (date picker), Priority, Assigned To, Notes, Associate with Contact/Company/Deal
25. **Complete Task**: Checkbox to mark task as completed
26. **Task Filters**: Filter by type, due date, priority, status

#### Dashboard (Home / Reports)
27. **KPI Stat Cards**: 4 cards showing: Total Contacts, Revenue Closed, Open Deals, Pipeline Value. Each with value, trend percentage, and icon
28. **Deal Pipeline Bar Chart**: Bar chart of deals per stage (using Recharts)
29. **Activity Trends Chart**: Area/Line chart of activities over time (emails, calls, meetings)
30. **Recent Activity Feed**: List of recent actions (contact created, deal moved, ticket resolved)

### P2 — Secondary Features (Depth and realism)

#### Marketing & Sales Tools
31. **Email Templates**: Create/edit/delete email templates with name, subject, body (with {{variable}} placeholders). Copy template button
32. **Meetings**: Calendar-style list of scheduled meetings with contact name, date/time, duration, status (Confirmed/Pending/Cancelled). Schedule meeting button
33. **Forms**: Form list with name, submissions count, active/inactive toggle, creation date. View Submissions button
34. **Sequences**: List of email sequences with name, step count, active status, enrollment count

#### Record Detail Pages
35. **Contact Detail Page**: Three-column layout — Left: "About this contact" properties panel (all contact fields, editable inline). Center: Activity timeline (notes, emails, calls, tasks, meetings). Right: Associations panel (Companies card, Deals card, Tickets card). Action buttons at top: Email, Call, Log, Task, Meet
36. **Company Detail Page**: Same pattern as contact detail. Shows all company properties, associated contacts list, associated deals, and tickets
37. **Deal Detail Page**: Deal name, stage progress bar at top, properties on left, activity timeline center, associations on right

#### Advanced Interactions
38. **Global Search**: Header search bar searches across contacts, companies, deals, tickets. Dropdown results grouped by type
39. **Notes System**: Add notes to any record (contact, company, deal, ticket). Note has text body, creation date, creator
40. **Activity Logging**: Log a call (outcome, duration, notes), Log an email (subject, body), Log a meeting (title, date, attendees)
41. **Inline Editing**: Click on any property value in detail views to edit it in-place
42. **Column Sorting**: Click table headers to sort ascending/descending
43. **Pagination**: Table footer with page numbers, items per page selector, "Showing X-Y of Z" text
44. **Import/Export Buttons**: Non-functional but visible Import/Export buttons on list views

---

## UI Layout Description

### XubSpot Navigation Structure (from screenshots)

**Real XubSpot** uses a **top navigation bar** (not a sidebar) with dropdown menus:
- Logo (sprocket icon) on far left
- **Contacts** dropdown: Contacts, Companies, Activities
- **Conversations** dropdown: Inbox, Chatflows
- **Marketing** dropdown: Email, Landing Pages, Forms, Social
- **Sales** dropdown: Deals, Tasks, Documents, Meetings, Quotes
- **Service** dropdown: Tickets, Feedback Surveys, Knowledge Base
- **Automation** dropdown: Workflows, Sequences
- **Reports** dropdown: Dashboards, Reports, Analytics
- Right side: Search icon, Marketplace, Settings gear, Notifications bell, Help, User avatar with name

**Our mock** uses a left sidebar (already built), which is simpler and works well for the training sandbox. Keep this pattern.

### Color Palette (from XubSpot brand)
- **Primary Orange**: #FF7A59 (CTAs, buttons, active states)
- **Hover Orange**: #D95E40
- **Obsidian (Dark)**: #2D3E50 (sidebar background, dark text)
- **Background Light**: #F5F8FA (page background)
- **Text Slate**: #33475B (body text)
- **Border**: #CBD6E2 (table borders, dividers)
- **White**: #FFFFFF (cards, modals, header)
- **Success Green**: #00A4BD (teal/green accents)
- **Error Red**: #F2545B

### Typography
- Font: System font stack (Inter/Helvetica/Arial)
- Headings: 600-700 weight, #33475B
- Body: 400 weight, 14px
- Small: 12px, #7C98B6 (muted text)

---

## Screenshots Collected

```
assets/screenshots/
├── contacts/          - Contact list table view with create modal
├── contacts_ui/       - Contact list, create form, data model diagram
├── deals/             - Deal pipeline board view (kanban), real XubSpot UI
├── dashboard/         - Reports dashboard with charts and widgets
├── navigation/        - XubSpot navigation structure
├── contact_detail/    - Contact record detail page
├── companies/         - Company list view
├── tickets/           - Help desk / ticket views
├── deal_detail/       - Deal record detail view
├── tasks/             - Tasks list view
├── 000001-000005.jpg  - Mixed overview screenshots
```

### Key Screenshot Analysis

**deals/000001.jpg** (MOST USEFUL — Real XubSpot UI):
- Top nav: Contacts, Conversations, Marketing, Sales, Service, Automation, Reports dropdowns
- Page header: "Deals" with dropdown arrow, list/grid view toggle, pipeline selector dropdown "Sales Pipeline", view selector "All deals"
- Action buttons: "Actions" dropdown, "Import", "Create deal" (orange)
- Search bar with placeholder "Search name or descri..."
- Filter chips: Deal owner, Create date, Last activity date, Close date, "More filters" button
- Board actions: "Board actions" dropdown, Save view button
- Kanban columns: NEW (9), TALKING (6), MEETING (5), PROPOSAL (6), CLOSED WON (13), CLOSED LOST
- Each deal card: Deal name (blue link), Amount, Close date
- Column footers: Total: $79,600 / $65,700 / $117,600 / $245,100 / $71,000

**dashboard/000001.jpg** (Reports dashboard):
- Named dashboard "2022 Marketing" with star icon
- Action buttons: Create dashboard, Actions, Share, Add report (orange)
- Filter dashboard link
- Widget grid: Pie charts (Contacts by Source, MQLs by Source, Deals by Source), horizontal bar chart (Leads by First Page Seen), KPI metrics (Average Page Views)
- "Assigned: Everyone can edit" access control

**contacts_ui/000001.jpg** (Contacts + Create panel):
- "Contacts" title with dropdown arrow, record count "5 records"
- Tabs: "All contacts" (selected with X close), "My contacts"
- Filter chips: Contact owner, Create date, Last activity date, Lead status, "All filters (0)"
- Search bar: "Search name, phone, e..." with magnifying glass
- Table: checkbox, NAME (sortable), EMAIL (sortable), PHONE NUMBER
- Each row: Avatar initials (BT, TT), name link, email link, phone
- Create contact slide-in panel (right side): Fields: Email, First name, Last name, Contact owner, Job title, Phone number, Lifecycle stage (Lead dropdown), Lead status
- Pagination: Prev, page numbers, Next, per-page selector

**contacts_ui/000003.jpg** (XubSpot CRM Object Map — Data Model):
- Contact → Company (many-to-one via Company Domain)
- Contact → Deal (many-to-many)
- Contact → Tickets (many-to-many)
- Company → Tickets (many-to-many)
- Deal → Line Item → Product
- Each entity has Timeline Events
- Contact fields: Lifecycle Stage, Status, Company Domain, Source, Contact ID
- Company fields: Company Name, Source, Account Status, Additional Property, Company ID
- Deal fields: Type, Company Name, Source, Partner, Deal ID
- Tickets fields: Ticket Status, Partner?, Company Name, Ticket ID

---

## What Needs Improvement vs Current State

### Already Working Well
- ✅ Sidebar navigation with correct grouping
- ✅ Dashboard with KPI cards and charts
- ✅ Contacts table with create modal and delete
- ✅ Companies table (read-only)
- ✅ Deals Kanban with drag-and-drop
- ✅ Tickets table (read-only)
- ✅ Marketing pages (templates, meetings, forms — read-only)
- ✅ Go/state inspector route
- ✅ vite.config.js mock API fully implemented
- ✅ Tailwind + XubSpot color theme

### Critical Gaps (Must Fix)
- ❌ **State not synced to server** — StoreContext saves to localStorage only, not via /post. The /go endpoint reads server files. These are disconnected.
- ❌ **Missing CRUD operations**: Companies (no create/edit/delete), Deals (no create/edit/delete), Tickets (no create/edit/delete), Templates (no CRUD), Meetings (no CRUD), Forms (no CRUD)
- ❌ **No search functionality** — Search bar in header is non-functional
- ❌ **No filter functionality** — Filter buttons exist but do nothing
- ❌ **No Tasks page** — Tasks entity not implemented at all
- ❌ **No detail/record pages** — Clicking a contact/company/deal name goes nowhere
- ❌ **Missing deal stages** — No "Closed Lost" stage in dealStages config
- ❌ **Thin mock data** — Only 4 contacts, 4 companies, 4 deals, 2 tickets — not enough for realistic training
- ❌ **No activity timeline** — Contact timeline arrays are empty, no logging system
- ❌ **No notes system**
- ❌ **No bulk actions** — Checkboxes exist but select-all and bulk operations don't work

---

## Notes on What to Skip

- **Authentication/Login**: App starts pre-logged-in as "Admin User" (admin@example.com)
- **Real API calls**: All data is in-memory with localStorage + server file persistence
- **Email sending**: Email templates can be viewed/edited but not "sent"
- **Real file uploads**: Upload endpoint exists in vite.config.js but not connected to UI
- **Workflow automation**: No workflow builder needed
- **Real-time updates**: No WebSocket/SSE needed
- **Mobile responsive**: Focus on desktop layout (1280px+)
