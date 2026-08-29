# XerviceNow Mock — Research Summary

## App Overview

**XerviceNow** is a cloud-based enterprise IT Service Management (ITSM) platform built on ITIL standards. It enables organizations to automate IT business management through digital workflows. The platform's core use case is IT service desk operations—managing incidents, problems, changes, and service requests—but it extends to HR, customer service, and more.

XerviceNow is distinguished by its:
- **Single data model** across all applications
- **Configurable workflow engine** for process automation
- **Multi-instance architecture** with 99.8% availability
- **Table-driven everything**: every entity (incident, user, CI) is a "table" with records

For our mock, we focus on the **ITSM modules** (Incident, Problem, Change, Service Catalog, Knowledge Base, CMDB) as these represent the core user workflows.

---

## Key User Personas

### 1. IT Service Desk Agent (Primary)
- **Daily workflows**: Triage incoming incidents, update work notes, reassign tickets, resolve/close incidents, fulfill service requests
- **Key screens**: Incident list, Incident form, My Work dashboard, Knowledge Base search

### 2. IT Manager / Team Lead
- **Daily workflows**: Review team workload, check SLA compliance, run reports, approve changes
- **Key screens**: Dashboard, Reports, Change approval queue

### 3. End User (Self-Service)
- **Daily workflows**: Submit incidents, browse service catalog, check request status, search knowledge base
- **Key screens**: Self-Service portal, Service Catalog, My Requests

### 4. Change Manager
- **Daily workflows**: Review change requests, approve/reject changes, schedule changes, post-implementation review
- **Key screens**: Change list, Change form, Change calendar

---

## Complete Feature List

### P0 — Core Infrastructure (App cannot render without these)
1. **App shell & navigation** — Banner frame, application navigator sidebar, content frame
2. **Application Navigator** — Collapsible left sidebar with filter search, module tree (Incident, Problem, Change, Service Catalog, Knowledge, Configuration), favorites/history tabs
3. **Banner/Header bar** — XerviceNow logo, "All" menu, Favorites, History, search bar, globe icon, help, notifications bell, user avatar
4. **List view component** — Generic table/list view with columns, sorting, filtering, pagination (used for incidents, changes, problems, etc.)
5. **Form view component** — Generic record form with field types (text, dropdown, reference/lookup, date, textarea), sections, related lists, tabs
6. **Routing** — BrowserRouter with routes for each module and view
7. **State management** — React Context + dataManager with session isolation

### P1 — Primary Features (Core interactive workflows)
1. **Incident Management**
   - Incident list view (columns: Number, Caller, Opened, Short description, Priority, State, Assignment group, Assigned to, Updated)
   - Incident form view (all fields: Number, Caller, Category, Subcategory, Contact type, State, Impact, Urgency, Priority, Assignment group, Assigned to, Short description, Description, opened/opened_by/closed_at/resolved_by, etc.)
   - Create New Incident
   - Notes tab (Additional comments, Work notes)
   - Related Records tab
   - Resolution Information tab
   - State transitions: New → In Progress → On Hold → Resolved → Closed (+ Cancelled)
   - Priority auto-calculation from Impact × Urgency matrix
   - Sidebar filters: Assigned to me, Open, Open - Unassigned, Resolved, Closed, All

2. **Change Management**
   - Change request list view
   - Change request form (type: Normal/Standard/Emergency)
   - Change states: New → Assess → Authorize → Scheduled → Implement → Review → Closed
   - Sidebar filters: Create New, Open, Closed, All

3. **Problem Management**
   - Problem list view
   - Problem form (similar structure to incidents)
   - Problem states: New → Assess → Root Cause Analysis → Fix in Progress → Resolved → Closed
   - Sidebar: Create New, Open, All

4. **Service Catalog**
   - Catalog homepage with category cards (Hardware, Software, Services, Office, Peripherals)
   - Category browsing with item listings
   - Service catalog item detail/order form
   - Shopping cart
   - Top Requests sidebar

5. **Knowledge Base**
   - KB Categories tree (Applications, Devices, Email, IT, Operating Systems, Suppliers) with article counts
   - Article list within category (title link, excerpt, author, date)
   - Article detail view (full content, rating, attachments)
   - Search within knowledge base
   - Breadcrumb navigation

6. **Dashboard / Homepage**
   - "Your Work" section: list of assigned items (incidents, requests, tasks)
   - Quick stats: Open incidents count, Overdue count, etc.
   - Welcome banner with date

### P2 — Secondary Features (Depth and realism)
1. **CMDB (Configuration Management Database)**
   - CI (Configuration Item) list view
   - CI detail form (name, class, status, assigned to, department, location)
   - CI classes: Server, Application, Network Gear, Database
   - Simple relationship display

2. **Reporting**
   - Basic report view for incidents (bar chart by priority, pie chart by state)
   - Table-based report output

3. **Notifications**
   - Notification bell with unread count badge
   - Dropdown panel with recent notifications
   - Mark as read

4. **Global Search**
   - Search bar in header
   - Search results page showing matches across tables (incidents, changes, knowledge articles, etc.)

5. **User Profile Menu**
   - Profile dropdown showing current user name/role
   - Impersonate user option (visual only)

6. **Activity Stream / Work Notes**
   - Chronological activity log on incident/change forms
   - Shows state changes, assignments, comments with timestamps

7. **Favorites & History**
   - Favorites tab in navigator: pinned modules/records
   - History tab: recently visited records

8. **SLA Indicators**
   - Visual SLA timer/badge on incident list and form
   - Color coding: green (on track), yellow (warning), red (breached)

---

## UI Layout Description

### Overall Shell (Next Experience UI)
```
┌────────────────────────────────────────────────────────────┐
│ [XerviceNow Logo] [All] [Favorites] [History] [...] │
│ [Tab: Current View ★] [🔍 Search ▾] [🌐] [?] [🔔] [👤]│
├──────────────┬─────────────────────────────────────────────┤
│ Application │ Content Frame │
│ Navigator │ │
│ │ ┌─────────────────────────────────┐ │
│ [🔍 Filter] │ │ Record/List/Dashboard │ │
│ │ │ │ │
│ ▼ Self-Service│ │ │ │
│ Incidents │ │ │ │
│ Watched │ │ │ │
│ ▼ Service Desk│ │ │ │
│ Incidents │ │ │ │
│ ▼ Incident │ │ │ │
│ Create New │ │ │ │
│ Assigned to me│ │ │ │
│ Open │ │ │ │
│ Open-Unassign│ │ │ │
│ Resolved │ │ │ │
│ Closed │ │ │ │
│ All │ │ │ │
│ Overview │ │ │ │
│ ▼ Problem │ └─────────────────────────────────┘ │
│ ▼ Change │ │
│ ▼ Configuration│ │
│ ▼ Service Cat │ │
│ ▼ Knowledge │ │
└──────────────┴─────────────────────────────────────────────┘
```

### Color Palette (from screenshots)
- **Primary brand**: `#293e40` (dark teal/navy — banner background)
- **Navigator bg**: `#1f2937` (dark slate sidebar) or `#f5f5f5` (light theme)
- **Content bg**: `#ffffff` (white)
- **Accent/links**: `#007a5a` (XerviceNow green) or `#2e7d32`
- **Text primary**: `#333333`
- **Text secondary/muted**: `#666666`
- **Border**: `#e0e0e0`
- **Priority Critical**: `#d32f2f` (red badge)
- **Priority High**: `#f57c00` (orange badge)
- **Priority Moderate**: `#fbc02d` (yellow badge)
- **Priority Low**: `#388e3c` (green badge)
- **Priority Planning**: `#90a4ae` (grey badge)
- **Work notes bg**: `#fffde7` (pale yellow)
- **Selected nav item**: highlighted with left green border
- **Mandatory field marker**: red asterisk `*`

### Typography
- **Font family**: SourceSansPro, "Helvetica Neue", Arial, sans-serif (XerviceNow default)
- **Header size**: 18-20px, weight 600
- **Body size**: 13-14px, weight 400
- **Form labels**: 12-13px, weight 400, right-aligned
- **Navigation items**: 13px, weight 400

### Key Measurements
- **Header/banner height**: ~48px
- **Application navigator width**: ~260px (collapsible)
- **Content frame**: fills remaining space
- **Form label column**: ~160px right-aligned
- **Form field column**: ~300-400px
- **List view row height**: ~32px

---

## Screenshots Reference

### Main Views
- `screenshots/000001.jpg` — Incident lifecycle diagram (New → In Progress → Resolved → Closed, with On Hold and Cancelled)
- `screenshots/000004.jpg` — XerviceNow branding (ITSM tools)

### Navigation & Shell
- `screenshots/navigation/000001.jpg` — Next Experience UI home dashboard with "Your work" list (Number, Created, Priority, State, Short Description columns)
- `screenshots/navigation/000004.jpg` — Classic UI with full Application Navigator showing Incident, Problem, Change, Configuration, Service Catalog sections + System Administration dashboard
- `screenshots/navigation/000003.jpg` — Next Experience branding

### Incident Management
- `screenshots/incident_form/000003.jpg` — Classic incident form fields: Building, District, Template, Incident state, Opened, Opened by, Assignment Group, Assigned To, Impact, Urgency, Priority (3 - Moderate), Contact type
- `screenshots/incident_form/000004.jpg` — Next Experience incident creation: Description field, tabs (Notes, Related Records, Resolution Information), Additional comments, Work notes (yellow bg), Submit/Resolve buttons, sidebar nav
- `screenshots/incident_form/000005.jpg` — Incident form detail: Opened date, Opened by (Sparky ITIL), Contact Method (Phone), State (New), Assignment group (Deskside Support), Assigned to, Reassignment count, Work notes list, Watch list, Group list

### Change Management
- `screenshots/change_mgmt/000001.jpg` — New Change Request wizard: Normal/Standard/Emergency type selection, Change sidebar (Create New, Open, Closed, All, Overview, Standard Change)

### Service Catalog
- `screenshots/service_catalog/000001.jpg` — Service Catalog with categories (Services, Hardware, Can We Help You?, Office, Peripherals), category dropdown, Top Requests sidebar, Shopping Cart, left nav (Catalogs, Catalog, Requests, Items, Tasks)

### Knowledge Base
- `screenshots/knowledge_base/000001.jpg` — Knowledge Base portal: KB Categories tree with article counts, article list (title, excerpt, author, date), breadcrumb, search, top nav (Knowledge, Catalog, Requests, System Status, Cart)

### CMDB
- `screenshots/cmdb/` — CMDB configuration items and topology views

---

## Data Model Overview

See `data_model.md` for complete field definitions.

**Core Tables (Entities):**
1. `sys_user` — Users (agents, admins, end users)
2. `sys_user_group` — Assignment groups (Service Desk, Network, Database, etc.)
3. `incident` — Incidents (extends task)
4. `problem` — Problems (extends task)
5. `change_request` — Change Requests (extends task)
6. `sc_catalog` — Service Catalogs
7. `sc_category` — Catalog Categories
8. `sc_cat_item` — Catalog Items
9. `sc_request` — Requests
10. `sc_req_item` — Requested Items
11. `kb_knowledge` — Knowledge Articles
12. `kb_category` — Knowledge Categories
13. `cmdb_ci` — Configuration Items
14. `sys_journal_field` — Activity log / Work notes / Comments
15. `task_sla` — SLA records

**Key Relationships:**
- Incidents → assigned to users, assigned to groups
- Incidents → related to CIs (CMDB)
- Incidents → have comments/work notes (journal)
- Changes → have approval records
- Service Catalog → categories → items
- Knowledge → categories → articles
- All task-based records extend a common "task" pattern

---

## What to Skip

- **Authentication / Login**: App starts pre-logged-in as "System Administrator" (admin)
- **Real API calls**: All data is in-memory / localStorage
- **Email/SMS notifications**: Visual notification bell only
- **LDAP/SSO**: No identity provider integration
- **Orchestration / Workflow engine**: No actual automation execution
- **Access Control Lists**: No permission enforcement
- **Import Sets / Data loading**: No external data import
- **App Engine Studio**: No app development features
