# Xmplitude Analytics Mock -- Research Summary

## App Overview

Xmplitude is a leading product analytics platform used by over 4,500 companies (Atlassian, Burger King, NBCUniversal, Square, Under Armour) to understand user behavior, optimize conversion funnels, measure retention, and drive data-informed product decisions. It is the centerpiece tool for product managers, data analysts, and growth teams.

The core value proposition: track events users fire in your product, then slice, dice, and visualize that data through various chart types to answer questions like "Who are my active users?", "Where do they drop off?", and "Are they coming back?"

## Key User Personas

1. **Product Manager (Primary)**: Creates dashboards, builds event segmentation charts, monitors KPIs, shares insights with stakeholders. Daily user.
2. **Data Analyst**: Builds complex funnel analyses, cohort definitions, retention charts. Uses advanced features like formulas, group-by, custom metrics.
3. **Growth Engineer**: Sets up tracking plans in the Data section, defines events and properties, manages integrations.
4. **Executive**: Views shared dashboards, reads high-level metrics on the home page.

## Complete Feature List

### P0 -- Core Shell (must render)
- Top navigation bar with Create button, Recent/Favorites/Spaces dropdowns, search bar, utility icons
- Left icon sidebar rail (collapsed state) with navigation icons
- Expanded left sidebar with section hierarchy (Home, All Content, Product Analytics, Web Analytics, Users, Session Replay, Experiment, Data, Releases)
- Routing between major views
- State management with dataManager.js
- /go endpoint for state inspection

### P1 -- Primary Features (core interactive workflows)
- **Home Dashboard**: Web Engagement card with metric tabs (Visitors, Page Views, Bounce Rate, Page Views/Session), line chart with tooltip, delta percentages; Current Live Users gauge; Templates carousel; Top Pages table; Breakdown by Country table; Realtime Users by Location map placeholder
- **Chart Builder (Event Segmentation)**: Left panel with Events module (add/remove events, event picker dropdown with search), Measured As module (Uniques/Event Totals/Active%/Average/Frequency/Properties toggle pills), Segment By module (All Users segment, filter/cohort/performed links); Right panel with chart area (line chart, bar chart, pie chart rendering), chart type switcher, time range controls (Daily/Weekly/Monthly, 7d/30d/60d/90d), Anomaly+Forecast toggle, Compare dropdown; Breakdown table below chart with Export CSV
- **Chart Builder (Funnel)**: Same left panel structure but with ordered funnel steps, conversion percentage bars, step-by-step drop-off visualization
- **Chart Builder (Retention)**: Return event configuration, retention curve line chart, Day 0 through Day 30 columns, cohort-based retention grid
- **Chart Builder (Data Table)**: Tabular data view with columns for events/metrics, group-by rows with inline bar charts, column menu (filter, duplicate, rename, sort, remove)
- **Dashboard View**: Grid of saved chart cards, each showing title + mini chart; drag-to-reorder; "+ Add Content" button; dashboard title editing; More menu (refresh, download, export, copy, archive)
- **User Profiles**: Table of users with columns (User ID, Xmplitude ID, First Seen, Last Seen, Country, Platform); search bar; cohort builder inline; population-over-time chart
- **User Profile Detail**: Left sidebar with user avatar, name, pinned properties, property search; Center Event Stream with timestamped events grouped by date; Right panel with event detail (Info/Raw tabs, properties list); Tabs: Activity, Insights, Session Replays, Cohorts, Experiments, Flags
- **Cohorts**: Behavioral cohort builder with "The Users who ...did perform [Select event] with count >= N time during [Last 30 days]" query builder; cohort list table
- **All Content**: List/grid of saved charts, dashboards, notebooks, cohorts with name, owner, last modified, type columns; search and filter
- **Data Management (Events)**: Events/Custom Events/Labeled Events tabs; event list with name, status, created date; event detail panel with description, created date, occurrences sparkline, definition rules

### P2 -- Secondary Features (depth and realism)
- **Notebooks**: Document view with embedded chart cards, text blocks, drag handles; "Copy as dashboard" and "Chart View" buttons
- **Ask Xmplitude (AI Assistant)**: Chat interface with natural language query input, generated chart responses, follow-up suggestions, thread history sidebar
- **Live Events**: Real-time event stream showing events as they fire
- **Experiment Setup**: Multi-step form (Variants, Goals, Pages, Targeting, Advanced) with left sidebar navigation; variant A/B configuration; rollout percentage
- **Search / Cmd+K**: Global search overlay with results grouped by type (charts, dashboards, cohorts, events)
- **Favorites and Spaces**: Saved items organization, space management
- **Settings (stub)**: Organization settings page placeholder
- **Chart Save/Share**: Save modal, "Add to" dashboard picker, Share link generation

## UI Layout Description

### Top Bar (52px)
Left: hamburger menu icon | blue "Create" button | "Recent" dropdown | "Favorites" dropdown | "Spaces" dropdown
Center: search input with magnifying glass, "Search or ask a question" placeholder, Cmd+K shortcut badge
Right: "Invite Members" dismissible badge | bell notification icon | help (?) icon | gear settings icon | "Upgrade" text with sparkle icon

### Left Sidebar (two modes)
**Icon Rail (48px)**: Vertical column of 20px icons -- Home, Analytics, AI/Spark, Pathfinder, Dashboards, Chat, Users, History, Experiment, Notes, Data Flow
**Expanded (200px)**: Full text navigation -- Home (highlighted blue when active), All Content, Live Events, Ask Xmplitude, Product Analytics (expandable: shows sub-items), Web Analytics (expandable), Users (expandable: User Profiles, Group Profiles, Cohorts, Predictions, Computations, Syncs, User Profile API), Session Replay, Experiment (expandable), Data, Releases. Bottom: MTU counter ("MTUs 4/50k") with progress bar and "Manage Plan" link.

### Main Content Area
Fills remaining space. Padding 24px. Background varies: white for chart builder, slight gray (#F7F8FA) for home dashboard card grid.

### Chart Builder Layout
Left control panel (~400px) | Right chart area (fills remaining). The left panel has a row of chart-type tabs at top (Segmentation, Funnel, Data Table, Retention, Journeys, more). Below tabs: collapsible sections for Events, Measured As, Segment By, Group Segment By.

## Notes on What to Skip

- **Authentication/Login**: App starts pre-logged-in as "Sam Lee" (samlee@example.com). No login flow.
- **Real-time data ingestion**: All data is mock/seed data. No actual event tracking SDK.
- **Session Replay**: Visual placeholder only (no actual session recording playback).
- **Experiment execution**: Setup form is interactive but no actual A/B test execution.
- **AI/Ask Xmplitude**: Static mock responses, no real AI inference.
- **Billing/Pricing**: MTU counter is display-only.
- **Integrations/Connections/Sources/Destinations**: Data management shows event catalog only, no real integrations.
