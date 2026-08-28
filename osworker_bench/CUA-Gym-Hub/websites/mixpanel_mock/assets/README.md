# Xixpanel Mock -- Research Summary

## App Overview

Xixpanel is a product analytics platform that helps teams understand how users interact with digital products. It tracks user events (clicks, page views, form submissions, etc.) and provides powerful visualization and analysis tools: Insights (time-series charts), Funnels (conversion analysis), Flows (user journey visualization), Retention (cohort-based return analysis), and Session Replay (recorded user sessions). Data is organized into Boards (dashboards) that combine multiple report cards, text blocks, and media.

## Key User Personas

1. **Product Manager** -- Creates boards with key metrics, builds funnel reports to measure feature conversion, monitors retention cohorts, shares reports with stakeholders.
2. **Data Analyst** -- Builds complex Insights reports with multiple metrics, filters, breakdowns; uses formulas and custom properties; exports data; manages Lexicon (data dictionary).
3. **Engineering Lead** -- Reviews events in the Events view, checks event properties, monitors data quality via Lexicon, reviews Session Replays for debugging.

## Core Workflows

1. View a Board (dashboard) with multiple report cards
2. Create/edit an Insights report (line chart, bar chart, table) with metrics, filters, breakdowns
3. Create/edit a Funnels report (multi-step conversion analysis)
4. Browse the Events stream (raw event log with expandable details)
5. Browse Users list with profiles
6. Manage the Lexicon (data dictionary -- events, event properties, profile properties)
7. View Session Replays (recorded user sessions with event timeline)
8. Navigate between boards, reports, and data views via the sidebar
9. Configure project settings (org, project, profile)

## Feature List (Priority)

### P0 -- Core Shell
- Left sidebar navigation (220px, collapsible): Xixpanel X logo, + Create New button, Search (Cmd+K), Home, Data (expandable: Events, Users, Lexicon, Session Replay), Pinned boards section, Favorites section, Your Boards section, bottom icons (apps grid, help, settings, collapse)
- Top header bar (48px): breadcrumb (ProjectName / ReportName), action buttons (link, ..., Save)
- Date picker bar: calendar icon + date range, time presets (Custom, Today, Yesterday, 7D, 30D, 3M, 6M, 12M), Default pill, Exclude dropdown, + button
- Routing between all main views
- State management with AppContext + dataManager

### P1 -- Primary Features
- **Boards (Dashboards)**: Grid of report cards, each showing a mini chart/visualization with title; text blocks with rich text editing (bold, italic, links); + Add content menu (Insights, Funnels, Flows, Retention, Heatmap, Text, Media); board title/description editing; Subscribe/Share/Link/More actions
- **Insights Report**: Right-side query panel (300px) with Metrics (A, B, C lettered), Filter section, Breakdown section; chart area with line/bar/pie visualizations and legend; data table below chart with sortable columns; measurement selector dropdown (Unique Users, Total Events, Total Sessions, Frequency per User, Aggregate Property); granularity selector (Minute, Hour, Day, Week, Month, Quarter); chart type selector (line, stacked line, column, stacked column, bar, stacked bar, pie, metric, table); Exclude/Compare dropdowns; Query/Chart/Annotations tabs
- **Funnels Report**: Right-side query panel with Steps (A, B lettered), Conversion Criteria (time window), Uniques toggle, Filter, Breakdown; main area shows waterfall-style funnel bars with conversion/drop-off percentages in purple (converted) and green/gray (drop-off); step labels with event names and percentages
- **Events View**: Table with columns (Event Name, Time, Distinct ID, City, Country, Operating System); expandable rows showing All Properties / Your Properties / Xixpanel Properties tabs with key-value pairs; JSON mode toggle; "Showing N most recent results of M matches" header
- **Users View**: Table with columns (Name, Email, Distinct ID, Updated at, Country Code, Region); "Users with Profiles" filter toggle; Hide Filter, Edit Columns, Export, Add/Edit Profile, Search profiles toolbar
- **Lexicon**: Left sidebar (Tracked Data: Events, Event Properties, Profile Properties; Saved Definitions: Cohorts, Custom Events, Custom Event Properties, Custom Profile Properties, Lookup Tables, Metrics, Behaviors; Data Governance: Data Deletion; Settings: Manage Data Permissions); main table (Event Name, Display name, Description, 30 day queries, Status); Import Event Schema / Export buttons; filter by Status/Tags/Type; Edit Columns

### P2 -- Secondary Features
- **Flows Report**: Sankey-style diagram showing user paths between events; Steps (A, B) in right panel; Conversion Criteria; step navigation (+ between steps); purple bars for Did Not Convert, green for Converted
- **Session Replay**: Left panel with session list (device ID, visited duration, event count, timestamp); center playback area with website screenshot; right panel with Details/Activity/Summary tabs; activity timeline with event list (timestamp, event name, count); playback controls (play/pause, speed, progress bar); Filter and Recency/Activity sort
- **Heatmap**: Clickmap/Heatmap/Scrollmap tabs; URL input; Interactive Backdrop toggle; Goal and date filter; View Replays button; Backdrop button
- **Create New dropdown**: Launch Spark (AI), Existing Report, Insights Report, Funnels Report, Flows Report, Retention Report, Heatmap, Text, Media
- **Settings pages**: Org tab (Overview, Plan Details & Billing, Users & Teams, Projects, Service Accounts, Access Security, Identity Merge, Data & Privacy, Xixpanel Usage); Project tab; Profile tab (Your Profile, Organizations, Projects, Data & Privacy, Alerts)
- **Report actions menu**: Duplicate, Undo, New Report, Alerts, Export, Refresh Data
- **Custom property/formula builder**: Modal with property search, formula editor with IF/THEN syntax, property type indicators (Aa=string, #=number, calendar=date, user=user property)
- **Search modal** (Cmd+K): Global search across reports, boards, events, users

## UI Layout Description

### Main App Shell
- **Left Sidebar** (220px): White background, right border `#E8E8EC`. Top: Xixpanel X logo (purple on white). Below: purple "+ Create New" button full-width with dropdown chevron. Below: Search row with magnifying glass icon and "Cmd+K" hint. Below: Home, Data (expandable with Events, Users, Lexicon, Session Replay). Below: collapsible sections -- FAVORITES, PINNED (has rocket emoji + "Starter Board"), YOUR BOARDS. Bottom: 4 icon buttons (apps grid, help circle, settings gear, collapse arrow).
- **Top Header** (48px): Left-aligned breadcrumb "ProjectName / ReportName"; right-aligned action buttons (link icon, "..." more menu, "Save" purple button).
- **Date Picker Bar** (44px): Below header. Calendar icon, date range text, time preset pills, granularity dropdown, chart type dropdown.
- **Main Content Area**: Flexible width, 24px horizontal padding, 20px vertical padding.
- **Right Query Panel** (300px): Only visible on report pages. Tabs: Query / Chart / Annotations. Contains Metrics, Filter, Breakdown sections with + buttons.

### Board View
- Board title (large heading) + description text
- Grid of report cards (variable size), each with: title, mini-chart visualization, hover reveals more options
- "+ Add content" button to add new report cards, text blocks, or media
- Date picker bar across the top applies globally to all cards

### Insights Report View
- Three-column layout: sidebar | chart+table | query panel
- Chart area: legend at top with colored dots + metric labels; line/bar chart with Y-axis labels, X-axis date labels; below chart: 3 toggle icons for chart density
- Table below chart: Metric column, breakdown columns, Average column, date columns; sortable; Search bar above table; "Dynamic Segments" dropdown
- Query panel: Metrics section (lettered A, B, C) each with event selector (colored circle), measurement dropdown, "Add Event" link, "Add Metric" button; Filter section with property conditions; Breakdown section with property selectors

## Data Model Overview

See `data_model.md` for complete details. Key entities:
- **Projects**: Container for all analytics data
- **Events**: Time-series data points (name, timestamp, distinct_id, properties)
- **User Profiles**: Key-value stores for user attributes
- **Boards**: Dashboard collections of report cards and text blocks
- **Reports**: Saved query configurations (Insights, Funnels, Flows, Retention)
- **Lexicon Entries**: Data dictionary entries for events and properties

## Out of Scope
- Authentication/login (app starts pre-logged-in as "Sam Lee")
- Real event ingestion / SDK integration
- Session Replay video playback (show static mockup only)
- Heatmap rendering (show static overlay)
- Real-time data processing
- Data pipeline/export functionality
- Billing/payment processing
