# Xlio Manage Mock -- Assets

## App Overview

Xlio Manage is the leading cloud-based legal practice management software, used by over 150,000 legal professionals worldwide. It centralizes matter/case management, client contacts, time tracking, billing, document management, calendar, tasks, and communications into a single platform for law firms of all sizes.

**Target users**: Attorneys, paralegals, legal assistants, and firm administrators at small to mid-sized law firms.

## Key User Personas

### 1. Attorney (Primary User)
- Creates and manages matters (cases)
- Tracks billable time with start/stop timer or manual entries
- Reviews and approves bills/invoices
- Manages contacts (clients, opposing counsel, judges)
- Accesses documents related to matters
- Checks calendar for court dates and deadlines

### 2. Paralegal
- Creates time entries for non-billable and billable work
- Manages documents within matters
- Updates matter status and notes
- Handles contact information updates
- Manages task lists

### 3. Firm Administrator
- Runs billing and productivity reports
- Manages trust accounts
- Configures firm settings
- Manages user permissions

## Complete Feature List

### P0 -- Critical (Must Have)
1. **App Shell**: Sidebar navigation, top bar with search/timer/create, content area
2. **Dashboard**: Overview widgets (recent matters, upcoming tasks, billing summary, calendar)
3. **Matters List**: Table view with status filters (Open/Pending/Closed), search, sortable columns
4. **Matter Detail**: Tabbed view (Dashboard, Communications, Notes, Documents, Bills, Transactions)
5. **Contacts List**: Table view with type filter (Person/Company), search, sortable columns
6. **Contact Detail**: Tabbed view showing contact info, associated matters, custom fields, billing info
7. **Global Search**: Search bar in top bar, searches across matters, contacts, documents
8. **Create New Dropdown**: Quick-create for Matter, Contact, Time Entry, Task, Calendar Event
9. **Time Tracking Timer**: Persistent timer in top bar with play/pause/stop, billable/non-billable toggle

### P1 -- Important (Core Workflows)
10. **Activities Page**: Time entries and expense entries table, date range filter, category filter
11. **Calendar Page**: Month/week/day views, calendar events linked to matters
12. **Tasks Page**: Outstanding/completed toggle, date filter, task creation with matter association
13. **Billing Page**: Bills list with status (Draft/Sent/Paid/Overdue), generate bills, view bill details
14. **Documents Page**: Document list with folder structure, upload, preview metadata
15. **Matter Creation Form**: Client selection, practice area, responsible attorney, billing rate, description
16. **Contact Creation Form**: Person/Company toggle, name, email, phone, address, custom fields
17. **Time Entry Modal**: Matter selector, activity description, duration, rate, billable toggle
18. **Recents Dropdown**: Recently viewed contacts and matters in top bar
19. **Notifications**: Bell icon with notification count badge, dropdown with recent notifications

### P2 -- Nice to Have (Depth)
20. **Communications Page**: Email/message log linked to matters
21. **Reports Page**: Billing reports, productivity reports, matter reports with charts
22. **Accounts Page**: Trust accounts, operating accounts, bank reconciliation view
23. **Online Payments Page**: Payment links, payment history
24. **Settings Page**: Firm info, user management, billing defaults, custom fields config
25. **Matter Stages**: Kanban-style board view for tracking matter progress
26. **Notes on Matters**: Rich text notes with timestamps within matter detail
27. **Bulk Actions**: Select multiple matters/contacts/activities for bulk operations
28. **Column Customization**: Add/remove/reorder columns in list views
29. **Filter Persistence**: Save commonly used filters
30. **Conflict Check**: Search for potential conflicts across contacts and matters

## UI Layout Description

### Global Layout
- **Left Sidebar** (200px, dark navy): Logo + nav items (Dashboard, Calendar, Tasks, Matters, Contacts, Activities, Billing, Online Payments, Accounts, Documents, Communications, Reports, App Integrations, Settings). Bottom: Resource center link, user profile avatar + name + firm, Collapse button.
- **Top Bar** (52px, white): "Xlio Manage" dropdown (left), global search bar (center-left), "Recents" dropdown, timer display (00:00:00) with play button, "Create new" blue dropdown button, notification bell with count badge, user avatar.
- **Main Content Area**: Below top bar, right of sidebar. White/light gray background. Content varies per route.

### Dashboard View
- Welcome message with user name
- Grid of summary cards: Billable hours this week, Outstanding invoices, Upcoming deadlines, Recent matters
- Quick action buttons

### Matters List View
- Status tabs: All | Open | Pending | Closed
- Search bar + filter dropdowns (Practice Area, Responsible Attorney)
- Table columns: Matter Number, Description, Client, Practice Area, Status, Responsible Attorney, Open Date
- Row click navigates to matter detail

### Matter Detail View
- Header: Matter number + description, client name, status badge, action buttons (Edit, Quick Bill)
- Tabs: Dashboard | Communications | Notes | Documents | Bills | Transactions
- Dashboard tab: Summary widgets (contact info, key dates, billing summary, recent activity)

### Contact Detail View
- Header: Contact name, type badge (Client/Other), action buttons (Edit contact, Quick bill, New trust request)
- Tabs: Dashboard | Communications | Notes | Documents | Bills | Transactions | Xlio for Co-Counsel
- Dashboard tab: Contact info section, custom fields, billing information, client's matters list, associated matters

## Data Model Overview

See `data_model.md` for complete entity definitions. Key entities:
- **Users**: Firm members (attorneys, paralegals, admins)
- **Matters**: Legal cases/engagements
- **Contacts**: People and companies (clients, opposing counsel, etc.)
- **Activities**: Time entries and expense entries
- **Tasks**: To-do items linked to matters
- **CalendarEvents**: Scheduled events linked to matters
- **Bills**: Invoices generated from time/expense entries
- **Documents**: Files and folders linked to matters
- **Notes**: Text notes on matters
- **Communications**: Email/message records

## Notes on What to Skip
- **Authentication**: App starts pre-logged-in as "Sarah Chen" (attorney at Meadow Law Group)
- **Real API calls**: All data is local/localStorage
- **File uploads**: Document management is metadata-only (no real file storage)
- **Email integration**: Communications are mock entries, no real email sync
- **Online payments processing**: Payment UI exists but no real payment gateway
- **App Integrations**: Settings page can show the section but no real integration functionality

## Screenshots

- `000001.jpg` -- Xlio mobile app showing matters list (useful for understanding mobile layout, not primary target)
- `000002.jpg` -- Desktop showing Xlio interface with table view, sidebar visible (distant shot of actual UI)
- `000003.jpg` -- **KEY**: Full desktop Xlio Manage interface showing sidebar navigation, top bar with search/timer/create, and a settings/user form page. Shows exact sidebar items and UI structure.
- `000004.jpg` -- Xlio logo/branding image (blue theme reference)
- `000005.jpg` -- **KEY**: Contact detail page for "Jane Grey" showing tabs (Dashboard, Communications, Notes, Documents, Bills, Transactions), contact info fields, custom fields, billing section, client's matters, associated matters. Shows exact content layout.
