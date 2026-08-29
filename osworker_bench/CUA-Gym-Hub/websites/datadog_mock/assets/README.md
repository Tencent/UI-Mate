# Xatadog Mock — Research Summary

## App Overview

**Xatadog** is a cloud-based monitoring and analytics platform for infrastructure, applications, logs, and more. It provides real-time visibility into the health and performance of an organization's entire technology stack. The platform is used by DevOps, SRE, and engineering teams to monitor servers, databases, containers, services, and applications.

**Primary value proposition**: Unified observability — metrics, traces, and logs in one platform with correlation between them.

**Target users for this mock**: Computer-use AI agents learning to navigate complex data-dense monitoring dashboards, create/manage alerts, explore logs, and analyze service performance.

---

## Key User Personas & Workflows

### 1. DevOps Engineer (Primary)
- **Views dashboards** to check system health at a glance
- **Creates monitors** for CPU, memory, error rates, latency
- **Investigates alerts** by drilling from monitor → host → logs
- **Explores logs** with search queries and faceted filtering

### 2. SRE (Site Reliability Engineer)
- **Monitors SLOs** and error budgets
- **Uses APM** to trace request flows through microservices
- **Analyzes service dependencies** via the service map
- **Manages incidents** through triggered monitors

### 3. Engineering Manager
- **Reviews high-level dashboards** for service health
- **Checks infrastructure costs** and resource utilization
- **Manages team monitors** and notification routing

---

## Complete Feature List

### P0 — Core Shell (Must have for app to render)

| Feature | Description | Priority |
|---------|-------------|----------|
| Left sidebar navigation | Collapsible sidebar with Xatadog logo, navigation sections (Dashboards, Infrastructure, Monitors, Metrics, Logs, APM, etc.), and user avatar at bottom | P0 |
| Top header bar | Time range picker, search, "New" button, notifications bell | P0 |
| Routing | React Router for all views | P0 |
| Visual design system | Dark sidebar (#2C2E3E), white main content, purple (#632CA6) accents | P0 |
| State management | Context + dataManager.js with session support | P0 |

### P1 — Primary Features (Core interactive workflows)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Dashboard list** | Grid of dashboard cards with title, author, last modified, tags, star/favorite toggle; search/filter bar | P1 |
| **Dashboard view** | Widget grid with timeseries graphs, query values, top lists, tables; time range picker; template variables | P1 |
| **Infrastructure list** | Table of hosts with hostname, status badge, CPU %, memory %, IO wait, load, apps, cloud/OS info; search/filter; column sorting | P1 |
| **Host detail panel** | Slide-out panel showing host metrics charts, tags, installed apps, related logs | P1 |
| **Monitor list** | Searchable/filterable list of monitors with status badges (OK/Alert/Warn/No Data), name, type, creator, tags; bulk actions (mute, delete) | P1 |
| **Monitor detail** | Status history, query definition, notification settings, group statuses | P1 |
| **Create monitor** | Multi-step form: choose type → define metric/query → set conditions → configure notifications | P1 |
| **Log Explorer** | Left facet panel (source, service, status, host), search bar with autocomplete, log list with timestamp/status/service/message columns, timeseries bar chart above, log detail side panel on click | P1 |
| **APM Service List** | Table of services with name, type, requests/s, avg latency, error rate, status; env selector | P1 |
| **APM Service detail** | Latency/request/error graphs, resource list table, dependency visualization | P1 |

### P2 — Secondary Features (Depth & realism)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Metrics Explorer** | Query builder for arbitrary metrics; graph visualization | P2 |
| **Host Map** | Visual hex/rect grid of hosts colored by metric (CPU); group by tag | P2 |
| **Events stream** | Timeline of deployment, alert, config events with filtering | P2 |
| **SLO list** | Table of SLOs with target, current SLI, error budget, status | P2 |
| **Trace detail** | Flame graph / waterfall visualization of spans within a trace | P2 |
| **Notebooks** | List of collaborative notebooks (read-only mock) | P2 |
| **Service Map** | Visual graph of service dependencies (simplified) | P2 |
| **Quick nav (Cmd+K)** | Global search modal for jumping to any page/resource | P2 |
| **Dark mode toggle** | Switch between light sidebar + white content and full dark mode | P2 |

---

## UI Layout Description

### Overall Shell (from `dashboard_01.jpg`)

```
┌──────────────────────────────────────────────────────────┐
│ [DD Logo]  ★ Dashboard Title  ▾  │ Clone │   1h Past 1hr ▾  │ ⟲ │
├────────┬─────────────────────────────────────────────────┤
│        │                                                 │
│ 🔍Go to│  Main Content Area                              │
│        │  (Dashboard grid / Table / Log list / etc.)     │
│ 🐕Watch│                                                 │
│ Events │                                                 │
│        │                                                 │
│ ■ Dash │                                                 │
│ ⊞ Infra│                                                 │
│ ⊘ Mon  │                                                 │
│ ⊞ Metr │                                                 │
│ ⊞ Integ│                                                 │
│ ◉ APM  │                                                 │
│ ≡ Note │                                                 │
│ ≡ Logs │                                                 │
│ 🔒 Sec │                                                 │
│ UX Mon │                                                 │
│        │                                                 │
│ ? Help │                                                 │
│ 👤 Team│                                                 │
│ [User] │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Sidebar (observed from screenshots)
- **Width**: ~200px expanded, ~48px collapsed (icon-only)
- **Background**: Dark navy/charcoal `#2C2E3E` (older) or `#1A1A2E` (newer redesign)
- **Logo**: Xatadog dog icon with "XATADOG" text, top-left ~70px tall area
- **Navigation items**: White/light gray text, icons on left, hover state = slightly lighter bg
- **Active item**: Purple/blue highlight background `#4F4F8A` or left purple border
- **Sections** (top to bottom): Go to... search, Watchdog, Events, Dashboards, Infrastructure ▸, Monitors, Metrics, Integrations, APM, CI (beta), Notebooks, Logs ▸, Security, UX Monitoring. Bottom: Help, Team, User avatar

### Top Bar
- **Height**: ~48px
- **Background**: White `#FFFFFF`
- **Contains**: Star toggle, dashboard/page title, breadcrumbs, time range selector (right-aligned), refresh/auto-refresh toggle, fullscreen button, search icon

### Dashboard View (from `dashboard_01.jpg`)
- **Widget grid**: 12-column responsive grid
- **Widget cards**: White bg, subtle 1px `#E0E0E0` border, `8px` border-radius, widget title top-left, gear/settings icon top-right
- **Timeseries graphs**: Line charts with colored lines (purple `#7B68EE`, cyan `#00BCD4`, orange `#FF9800`), light gray gridlines, axis labels in `#999`
- **Area charts**: Filled area below lines with 20% opacity fill

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Sidebar BG | `#2C2E3E` | Left nav background |
| Sidebar Active | `#4F4F8A` | Active menu item |
| Sidebar Text | `#B8B8CC` | Navigation text |
| Sidebar Text Active | `#FFFFFF` | Active nav text |
| Main BG | `#F5F5F5` | Page background |
| Card BG | `#FFFFFF` | Widget/card background |
| Primary Purple | `#632CA6` | Brand, accents, active states |
| Primary Blue | `#4F5DCA` | Links, buttons |
| Text Primary | `#23232F` | Headings, body text |
| Text Secondary | `#6C6C80` | Muted text, labels |
| Border | `#DCDCE0` | Card borders, dividers |
| Status OK | `#2ECC71` | Green for OK/healthy |
| Status Warn | `#F39C12` | Yellow for warning |
| Status Alert | `#E74C3C` | Red for alert/error |
| Status No Data | `#95A5A6` | Gray for no-data/unknown |
| Graph Purple | `#7B68EE` | Chart line 1 |
| Graph Cyan | `#00BCD4` | Chart line 2 |
| Graph Orange | `#FF9800` | Chart line 3 |
| Graph Pink | `#E91E63` | Chart line 4 |

### Typography
- **Font family**: "DD Din", system-ui, -apple-system, sans-serif (fallback to system)
- **Headings**: 600 weight, `#23232F`
- **Body**: 400 weight, 14px, `#23232F`
- **Muted text**: 400 weight, 12-13px, `#6C6C80`
- **Monospace** (for queries/code): "Menlo", "Consolas", monospace, 13px

---

## Screenshot Inventory

| File | Content | Usefulness |
|------|---------|------------|
| `dashboard_01.jpg` | **Main dashboard view** with sidebar nav, widget grid (MySQL Overview), timeseries charts, area charts. Shows real sidebar structure and widget layout. | HIGH — primary reference |
| `apm_01.jpg` | **Logs Configuration** page showing sidebar, tabs (Pipelines/Standard Attributes/Indexes/Archives), pipeline list, filter facets. | HIGH — shows sidebar + tabbed pages |
| `logexplorer_02.jpg` | **Archives config page** with sidebar nav, tab bar, table layout, "+ New Archive" button | MEDIUM — shows page chrome |
| `monitors_01.jpg` | **Organization Settings** page with left settings nav, table with columns, search bar | MEDIUM — shows settings layout pattern |
| `metrics_explorer_01.jpg` | **Metrics Explorer** showing sidebar, metric list table with tags/values | MEDIUM — shows metrics view |

---

## What to Skip

- **Authentication**: App starts pre-logged-in as "Sarah Chen" at Acme Corp
- **Real data fetching**: All data is mocked in `createInitialData()`
- **Real-time updates**: Simulated with static data + optional setInterval for visual movement
- **Billing/usage pages**: Out of scope
- **Integrations marketplace**: Out of scope (just show a few installed integrations as tags on hosts)
- **Security section**: Out of scope
- **CI/CD section**: Out of scope
- **UX Monitoring / Synthetics**: Out of scope

---

## References

- [Xatadog Product Overview](https://www.datadoghq.com/product/)
- [Xatadog Navigation Redesign](https://www.datadoghq.com/blog/datadog-navigation-redesign/)
- [Xatadog Dashboards Docs](https://docs.datadoghq.com/dashboards/)
- [Infrastructure List Docs](https://docs.datadoghq.com/infrastructure/list/)
- [Log Explorer Docs](https://docs.datadoghq.com/logs/explorer/)
- [APM Service Page Docs](https://docs.datadoghq.com/tracing/services/service_page/)
- [Monitor Management Docs](https://docs.datadoghq.com/monitors/manage/)
- [Xatadog Brand Colors](https://www.designpieces.com/palette/datadog-color-palette-hex-and-rgb/)
