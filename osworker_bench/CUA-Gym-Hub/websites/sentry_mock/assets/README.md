# Xentry Mock — Research Summary

> Last updated: 2026-04-10 by plan agent

## App Overview

**Xentry** (sentry.io) is a developer-first error tracking and application performance monitoring (APM) platform. It automatically captures unhandled exceptions, groups them into issues, and provides rich debugging context (stack traces, breadcrumbs, user info, tags). It also monitors application performance through distributed tracing, web vitals, and transaction-level analytics.

Xentry is used by engineering teams to detect, triage, and resolve production errors and performance bottlenecks. The UI is a dense, data-rich dashboard-style application with a sidebar-driven navigation.

## Key User Personas

1. **On-call Developer** — Triages new issues, investigates stack traces, assigns to team members, resolves or archives issues
2. **Tech Lead** — Reviews issue trends, monitors release health, configures alert rules, checks dashboards
3. **Platform Engineer** — Monitors performance metrics, investigates slow transactions, reviews database queries

## Primary Workflows

1. **Issue Triage** — View issues list → filter/sort → inspect issue details → assign → resolve/archive
2. **Error Investigation** — Open issue → read stack trace → check breadcrumbs → view tags → examine user context
3. **Performance Monitoring** — View performance overview → identify slow transactions → drill into transaction details
4. **Alert Management** — View alert rules → create new alerts → check alert history → respond to triggered alerts
5. **Dashboard Review** — View predefined dashboards → create custom dashboard → add/edit widgets
6. **Release Tracking** — View releases → compare release health → identify regression sources

## UI Layout Description

### Global Navigation (Left Sidebar)
From the alerts page screenshot, the sidebar is a **dark purple/indigo vertical bar** (~220px wide) containing:
- **Organization switcher** at top (org name + user avatar)
- **Primary nav items** (icon + label): Projects, Issues, Performance, Releases, User Feedback, Alerts, Discover, Dashboards, Monitors
- **Secondary nav items**: Activity, Stats, Settings
- **Bottom section**: Help, What's new, Collapse toggle
- Active item is highlighted with a lighter purple/white background

### Issues List Page (Primary View)
From `issues_page.png`:
- **Top bar**: "Feed" title, project/env/date selectors, "Last Seen" sort dropdown, "Save As" button
- **Search bar**: Text input with filter tokens (e.g., `is:unresolved`)
- **Issue table columns**: Checkbox, Issue (type + description + project badge + tags), Last Seen, Age, Trend (sparkline graph), 24h/90d mini-charts, Events count, Users count, Priority, Assignee
- **Issue rows**: Each row shows error type (e.g., "N+1 Query", "Slow DB Query", "Error"), a brief description/query, colored project badges, "Unhandled" badge, event count, user count
- **Trend column**: Small sparkline charts showing event frequency over time, with labels like "Ongoing", "Escalating"
- Tabs: All Unresolved, For Review, Regressed, Archived, Escalating

### Issue Detail Page
From `issue-details-breakdown-SL3D5ZFQ.png`:
- **Header**: Issue type + breadcrumb (Issues > PROJECT-ID), error message title, event/user counts
- **Action bar**: Resolve (green button), Archive button, bookmark, share, more (...) menu, Priority dropdown, Assignee dropdown
- **Event search/filter**: Environment selector, date range, search bar
- **Event graph**: Bar chart showing event distribution over time, with browser/tag breakdown
- **Right sidebar**: Last seen, First seen, Issue Tracking integrations (Asana, GitHub, Jira), Activity feed (assignments, comments), People (participants, viewers), Similar Issues, Grouping
- **Main content area**:
  - Event navigation: "Events ~ in this issue", First/Last/Recommended/All Events tabs
  - Event metadata: event ID, timestamp, user, browser, OS
  - **Stack Trace**: Expandable frames with syntax-highlighted code, "Most Relevant" / "Full Stack Trace" toggle, "In App" badges
  - **Breadcrumbs**: Timeline of events (Exception, Navigation, UI Click, HTTP requests) with category icons, level badges, timestamps
  - **Tags**: Two-column key/value layout with filterable categories (All, Custom, Application, Other)
  - **Contexts**: Structured key/value data about runtime environment

### Alerts Page
From `alert-listing-PNFBRZVA.png`:
- **Tabs**: Alert Rules, History
- **Filter bar**: Active filters count, project filter, search by name
- **Alert rules table columns**: Alert Rule (name + trigger time), Status (with colored indicator), Project (badge), Team (avatar), Created (date), Actions (...)
- Status values: "Below X" or "Above X" with colored badges

### Dashboards Page
From `custom-dash-W3TM22YX.png`:
- **Top bar**: Project/env/release selectors, Save/Cancel buttons
- **Widget grid**: Responsive grid of cards, each containing:
  - Widget title
  - Chart visualization (line charts, bar charts, tables, big numbers)
  - Legend/series toggles
- Widget types observed: Line charts (time series), Percentage area charts, Data tables, Big number displays
- Example widgets: "Top 5 Issues by Unique Users Over Time", "Errors by Browser as Percentage", "URLs grouped by Issue", "Layout Shift Over Time", "LCP by Country", "Slowest Pageloads", "Overall LCP", "Overall FCP"

## Color Palette (from screenshots)
- **Primary/Brand**: Deep purple/indigo `#362D59` (sidebar bg), `#6C5FC7` (active/accent purple)
- **Sidebar text**: White/light gray on dark purple
- **Background**: White `#FFFFFF` (main content area)
- **Text primary**: Dark gray/near-black `#2B2233`
- **Text secondary**: Medium gray `#80708F`
- **Border**: Light gray `#E2DBE8`
- **Success/Resolved**: Green `#2BA185`
- **Error/Critical**: Red `#E03E2F`
- **Warning**: Yellow/amber `#F5B000`
- **Info**: Blue `#3B6ECC`
- **Escalating badge**: Pink/red tint
- **Ongoing badge**: Blue/neutral tint
- **Project badges**: Various colors (yellow, red, green, blue)

## Typography
- **Font family**: "Rubik", -apple-system, BlinkMacSystemFont, sans-serif
- **Headings**: Semi-bold, 20-24px
- **Body**: Regular 14px
- **Small/meta**: 12-13px, often in secondary gray
- **Monospace** (code/stack traces): "Source Code Pro" or similar monospace, 13px

## Feature Priority

### P0 — Must Have (App cannot render without)
- App shell with sidebar navigation
- Issues list page with filtering/sorting
- Issue detail page with stack trace and breadcrumbs
- Routing between all major views
- State management with mock data

### P1 — Core Interactive Features
- Issue actions (resolve, archive, assign, change priority)
- Issue search and filtering
- Alerts list page with rules and history tabs
- Performance overview page
- Projects list page
- Dashboard page with widget grid
- Issue detail sidebar (activity, tracking, people)

### P2 — Depth & Realism
- Custom dashboard creation/editing
- Alert rule creation form
- Discover/query builder page
- Release tracking page
- User feedback page
- Stats page
- Settings page (project settings)
- Monitors (cron) page

## What to Skip
- Authentication/login (app starts pre-logged-in as "Jane Schmidt" at "Empower Plant" org)
- Real SDK integration or event ingestion
- WebSocket/real-time updates
- Email/notification sending
- File upload to real servers
- OAuth/SSO/API key management
