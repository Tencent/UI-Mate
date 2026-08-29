# Xontractbook Mock -- Assets README

## App Overview

Xontractbook is a cloud-based contract lifecycle management (CLM) platform that enables businesses to create, negotiate, sign, and store contracts in one centralized location. It targets legal teams, contract managers, and business professionals who need to streamline their contract workflows. The platform is headquartered in Copenhagen, Denmark, and serves SMB to enterprise customers.

Key value propositions:
- Centralized contract repository with folder organization
- Rich text contract editor with formatting and data fields
- Built-in e-signature workflow (no need for external signing tools)
- Template library for standardized contract creation
- Task management for approvals, renewals, and reviews
- Activity audit trail for compliance and transparency
- Integration with 3,000+ business tools

## Key User Personas

### 1. Legal Counsel / Head of Legal (Primary)
- Reviews and creates contracts
- Sets up templates for the team
- Monitors contract statuses and deadlines
- Manages signing workflows

### 2. Contract Manager
- Sends contracts for signature
- Tracks pending signatures
- Manages renewals and expirations
- Organizes contracts into folders

### 3. Executive / Approver
- Reviews and approves contracts before sending
- Signs contracts on behalf of the company
- Views high-level contract status dashboard

### 4. External Signatory
- Receives contracts via email
- Reviews contract content
- Signs or rejects contracts (out of scope for this mock -- we simulate the internal side)

## Primary Workflows

1. **Browse contracts**: Navigate the contract list, filter by status/tags/folder, sort by date, search by name
2. **Create a contract**: From scratch or from template, fill in content, add parties and signees
3. **Edit a contract**: Open draft, modify rich text content, update parties, save changes
4. **Send for signature**: Set up signing order, write message to recipients, send
5. **Track signatures**: View pending contracts, see who has/hasn't signed, send reminders
6. **Manage templates**: Browse template library, preview templates, create from template
7. **Manage tasks**: View assigned tasks, complete tasks, create new tasks
8. **Organize**: Move contracts to folders, add/remove tags, create custom views
9. **Review activity**: View audit trail for a contract, see who did what and when
10. **Manage contacts**: Add/edit external contacts who are counterparties

## Complete Feature List

### P0 -- Core Shell (Must have for app to render)
1. App layout: sidebar + header + main content area
2. React Router with all routes
3. State management with AppContext + dataManager
4. Seed data with realistic contracts, templates, contacts
5. `/go` endpoint for state inspection
6. Session isolation via Vite plugin

### P1 -- Primary Features (Core interactive workflows)
1. Contract list view with table, tabs (All/Drafts/Pending/Signed/Rejected/Expired), search, sort
2. Contract detail view with content display, parties/signees panel, activity timeline
3. Contract editor with rich text formatting toolbar
4. Create new contract (from blank or from template)
5. Send for signature workflow (set up parties, signees, signing order, send)
6. Template library with grid view, category filter, preview
7. Create contract from template
8. Folder tree navigation in sidebar
9. Contact list with search and CRUD
10. Task dashboard with tabs (Assigned to me, Following, All)
11. Notification bell with dropdown and unread count
12. Status badge updates (draft -> pending -> signed/rejected)
13. Tag management (add/remove tags on contracts)
14. Search contracts by name

### P2 -- Secondary Features (Depth and polish)
1. Custom saved views with filter/sort configuration
2. Contract comments/internal discussion thread
3. Bulk actions (select multiple contracts, move to folder, add tag)
4. Contract value tracking and currency display
5. Renewal date tracking and reminders
6. Drag-and-drop signee reordering
7. Template categories and usage count
8. Contract download as PDF (simulated)
9. Settings page (company info, notification preferences, team management)
10. Activity timeline filtering by type
11. Keyboard shortcuts (Cmd+K for search, etc.)
12. Empty states for all views
13. Inline rename for contracts and folders
14. Duplicate contract
15. Archive/delete contracts with confirmation

## UI Layout Description

### Sidebar (Left, 240px)
- Xontractbook logo at top
- "New Contract" primary button
- Navigation items: Contracts, Templates, Tasks, Contacts
- Folder tree (collapsible, nested folders)
- Bottom: Settings, Help, User avatar with name

### Top Header (56px)
- Breadcrumb / page title on left
- Search bar (center or right-aligned)
- Notification bell with badge count
- User avatar dropdown (right)

### Contracts List View (Main Content)
- Tab bar: All Documents | Drafts (count) | Pending (count) | Signed (count) | Rejected (count) | Expired (count)
- Filter row: Search input, Sort dropdown, Filter button
- Table: Checkbox | Contract Title + Tags | Counterparty | Created Date | Signees (avatar stack) | Status Badge
- Row hover shows quick actions
- Pagination or infinite scroll at bottom

### Contract Detail View
- Header: Back button, contract title (editable), status badge, action buttons (Edit, Send, More)
- Two-column layout:
  - Left (main): Contract content (rendered rich text or editor)
  - Right (sidebar, 320px): Parties & Signees panel, Details panel (dates, value, folder), Tags, Activity timeline
- Activity entries show icon, description, user, timestamp

### Contract Editor
- Centered content area (max 800px)
- Floating toolbar on text selection (bold, italic, underline, strikethrough)
- Block toolbar on new line (headings, lists, checkbox, image, table, divider)
- Right panel: Document settings, parties setup

### Template Library
- Grid of template cards: title, description, category badge, usage count, "Use Template" button
- Category filter sidebar or tabs
- Template preview modal

### Task Dashboard
- Tabs: Assigned to me | Following | All
- Task list items: task title, type badge, contract link, assignee, due date, status
- Create task button

### Contacts View
- Table: Name | Email | Company | Phone | Created Date
- Search bar
- Add Contact button -> modal form

### Settings
- Tabbed layout: General | Notifications | Team | Integrations
- Form fields for company info, preferences

## Data Model Overview

See `data_model.md` for full specification. Key entities:
- **currentUser**: Pre-logged-in user (Sarah Chen, Head of Legal)
- **contracts** (12): Mix of draft/pending/signed/rejected/expired
- **templates** (8): Common contract types
- **contacts** (8): External counterparties
- **folders** (8): Nested folder tree
- **tags** (6): Color-coded labels
- **tasks** (6): Mix of pending/completed/overdue
- **notifications** (8): Mix of read/unread
- **activities** (~50): Audit trail entries across contracts
- **comments** (~10): Internal discussion on contracts
- **savedViews** (5): Custom filter presets

## Screenshots

### Reference Screenshots
- `reference/000004.jpg` -- Xontractbook marketing page showing Documents table view with tabs (All documents, Drafts, Pending, Signed, Rejected), contract rows with title, tags, counterparty company, date, avatar stack, and status badges. Shows a clean white interface with blue primary accent. Header shows Xontractbook logo and "Create new document" button.

Note: Most screenshots in the reference/ directory are from unrelated applications and should be ignored. The dev agent should rely on the DESIGN.md design tokens and the layout descriptions in this document for visual guidance.

### Key Visual Reference (from 000004.jpg)
- White background workspace
- Light gray table headers
- Status badges are pill-shaped: "Signed" (green), "Pending" (amber), "Draft" (gray)
- Tags appear as small colored pills next to contract titles, with "+ Add tag" link
- Counterparty column shows company name
- Date column shows formatted dates
- Signees shown as small avatar circles (overlap stack)
- "Create new document" button is a rounded pill, appears to be primary blue

## What to Skip

- **Authentication**: App starts pre-logged-in as Sarah Chen
- **Real file uploads**: No actual file processing
- **Real e-signatures**: Signing is simulated (clicking a button changes status)
- **Real email sending**: Send actions update state but don't actually email
- **Real API calls**: All data is local (localStorage + session)
- **Payment/billing**: No subscription management
- **Real integrations**: No actual third-party connections
- **PDF generation**: Download simulates but doesn't create real PDFs
