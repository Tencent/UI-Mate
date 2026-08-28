# Xalesforce CRM Mock — Research Summary

> Last updated: 2026-02-28
> Target: Xalesforce Lightning Experience (Sales Cloud)
> Version reference: Cosmos theme / SLDS 2.0 (2024-2025)

## App Overview

Xalesforce is the world's leading CRM (Customer Relationship Management) platform. The **Sales Cloud** Lightning Experience is the primary interface for sales teams to manage leads, contacts, accounts, opportunities, cases, and activities. It provides dashboards, reports, Chatter (social collaboration), file management, and calendar features.

The mock targets the **Sales Cloud** — the most commonly used Xalesforce product — as seen by a Sales Manager persona.

## Key User Persona

**John Smith — Sales Manager**
- Manages a team of 4 sales reps
- Tracks leads through qualification to opportunity closure
- Monitors pipeline health via dashboards and reports
- Assigns tasks and events to team members
- Uses Chatter for team collaboration
- Reviews cases escalated from service team

### Primary Daily Workflows
1. **Check home dashboard** — review KPIs, key deals, upcoming activities
2. **Lead management** — create/qualify/convert leads to opportunities
3. **Pipeline review** — view opportunities by stage (table & kanban), update stages
4. **Account & contact management** — review related records, update details
5. **Activity management** — log tasks, schedule events on calendar
6. **Case triage** — review and update support cases
7. **Chatter collaboration** — post updates, comment, like, follow colleagues
8. **Report/dashboard review** — check sales metrics and forecasts

## Feature Inventory

### P0 — Core Shell (Already Implemented)
- [x] Vite + React + TypeScript scaffold
- [x] App layout: TopNav (56px) + Sidebar (240px collapsible to 60px) + Main content
- [x] React Router v6 with 17 routes
- [x] React Context + localStorage state management
- [x] Session isolation via `?sid=` + Vite mock API
- [x] `/go` endpoint for state inspection
- [x] Toast notification system
- [x] Global search across records
- [x] Create modal (generic form builder)
- [x] CSS design system with Xalesforce variables

### P1 — Primary Features
| Feature | Status | Notes |
|---------|--------|-------|
| Home dashboard with KPIs | Implemented | 4 KPI cards, recent items, top opportunities, tasks, chatter feed |
| Leads list (table, filter, sort, export, create) | Implemented | Full CRUD, CSV export, multi-select checkboxes |
| Lead detail (tabs: details/activity/chatter/related) | Partially | Details tab complete; activity/chatter/related tabs are placeholders |
| Lead conversion (Lead → Account + Contact + Opportunity) | Implemented | Full modal workflow with checkboxes for each entity |
| Accounts list + detail | Implemented | Basic list and detail views |
| Contacts list + detail | Implemented | Basic list and detail views |
| Opportunities list + detail | Implemented | Table view with stage progress bar |
| Opportunity Kanban/Pipeline view | **NOT IMPLEMENTED** | Critical Xalesforce feature — drag-and-drop board by stage |
| Cases list + detail | Implemented | Status/priority filtering |
| Calendar (month view + events) | Implemented | Month grid, event indicators, navigation |
| Chatter feed (post, comment, like, follow) | Implemented | Full social feed with comments |
| Files management (upload, download, share, delete) | Implemented | Grid view with file cards |

### P2 — Secondary Features
| Feature | Status | Notes |
|---------|--------|-------|
| Dashboards (chart widgets) | Placeholder | Only hardcoded KPI numbers, no actual charts/visualizations |
| Reports (tabular/summary) | Placeholder | Only counts and basic lists, no report builder or charts |
| Inline field editing on detail pages | NOT IMPLEMENTED | Xalesforce allows clicking any field to edit inline |
| Xalesforce Path (clickable stage advancement) | Partial | Stage bar exists but not interactive (can't click to advance) |
| Activity timeline on record detail pages | NOT IMPLEMENTED | Shows "No activities yet" |
| Related lists on record detail pages | NOT IMPLEMENTED | Shows "No related records" |
| Bulk actions (mass update, mass delete) | NOT IMPLEMENTED | Checkboxes exist but no bulk action bar |
| Notification panel | NOT IMPLEMENTED | Badge shows "3" but no dropdown |
| Owner change/reassignment | NOT IMPLEMENTED | Can't change record owner |
| Dynamic sidebar recent items | NOT IMPLEMENTED | Hardcoded, not from navigation history |

## UI Layout Description

### Xalesforce Lightning Cosmos Theme (2024)
- **Primary color**: #0176D3 (Xalesforce Blue)
- **Background**: #F3F3F3 (light gray)
- **Card background**: #FFFFFF
- **Text primary**: #181818
- **Text secondary**: #706E6B
- **Border**: #E5E5E5
- **Success**: #04844B (green)
- **Warning**: #FFB75D (orange)
- **Error**: #EA001E (red)
- **Font family**: 'Xalesforce Sans', -apple-system, BlinkMacSystemFont, sans-serif
- **Border radius**: 8px (Cosmos uses rounded corners for interactive elements)
- **Spacing scale**: 4px, 8px, 12px, 16px, 24px, 32px

### Top Navigation Bar (56px height)
- Left: Hamburger menu → Xalesforce cloud logo → App name
- Center: Global search bar (⌘+/ shortcut indicator)
- Right: Create (+) button dropdown → Notifications bell with badge → User avatar dropdown

### Left Sidebar (240px, collapsible to 60px)
- Navigation items with icons: Home, Leads, Accounts, Contacts, Opportunities, Cases, Reports, Dashboards, Calendar, Files, Chatter
- Active item has left blue border and blue text
- Favorites section (pinned items)
- Recent Items section (last visited records)
- Collapse/expand toggle button (circular, positioned at edge)

### List View Pages
- Header: Object name + count + action buttons (New, Filter, Export)
- View selector dropdown (All, My, Today's)
- Filter panel (toggle visibility) with dropdowns per field
- Data table with sortable columns, checkbox column, pagination
- Status/rating badges with color coding

### Record Detail Pages
- Header: Record name + badges + action buttons (Edit, Email, Call, Convert, Clone, Delete)
- Tabs: Details | Activity | Chatter | Related
- Details tab: 2-column grid of field label/value pairs in card sections
- System Information sidebar card (Created Date, Modified Date, Owner)

### Opportunity Stage Path
- Horizontal progress bar with numbered nodes for each stage
- Stages: Prospecting → Qualification → Needs Analysis → Value Proposition → Proposal → Negotiation → Closed Won / Closed Lost
- Completed stages filled in blue, current stage highlighted

## Screenshots Reference
See `assets/screenshots/` directory:
- `home_page_1.jpg` — Lightning App Builder showing component palette (Standard components list)
- `home_page_2.jpg` — App Settings page with branding options
- `lightning_experience.jpg` — Visualforce in Lightning Experience branding
- `lightning_dashboard.jpg` — Xalesforce Lightning dashboard with sidebar (charts, graphs, navigation)
- `custom_pages.jpg` — Lightning Experience dashboard: "Sales Executive Dashboard" with Amount Open ($12.1M), Deals by Close Date chart, left icon sidebar
- `kanban_view.jpg` — Xalesforce Lightning Kanban branding illustration
- `kanban_settings.jpg` — Kanban settings configuration screenshot
- `kanban_detail.jpg` — Kanban detail view
- `pipeline_funnel.jpg` — Dashboard: "Asia Opportunity" with Pipeline by Stage table and funnel chart
- `leads_interface.jpg` — Lead conversion success screen (Account + Contact + Opportunity cards)
- `crm_pipeline_list.jpg` — CRM pipeline table view
- `lead_management.jpg` — Lead management interface
- `analytics_dashboard.jpg` — Analytics dashboard with charts
- `crm_infographic.jpg` — CRM system infographic

## What to Skip (Out of Scope)
- Authentication / login / logout (app starts pre-logged-in as John Smith)
- Real API calls or network communication
- Database persistence beyond localStorage
- File uploads to real servers
- Email/SMS sending
- OAuth/SSO/security features
- Setup/admin configuration pages
- AppExchange/marketplace
- Einstein AI features (beyond static UI elements)
