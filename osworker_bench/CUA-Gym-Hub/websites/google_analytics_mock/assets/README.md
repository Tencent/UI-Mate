# Xoogle Analytics 4 (GA4) — Research Summary

## App Overview

Xoogle Analytics 4 (GA4) is Google's web and app analytics platform. It is event-based (not session-based like its predecessor Universal Analytics). Users track website/app traffic, analyze user behavior, measure conversions, and generate reports. The platform is used by marketers, analysts, product managers, and business owners to understand how users interact with their digital properties.

**URL**: `analytics.google.com`

## Key User Personas

1. **Marketing Manager** — Checks acquisition reports daily to see traffic sources, campaign performance. Creates custom reports for stakeholders.
2. **Data Analyst** — Uses Explore to build free-form, funnel, and path explorations. Exports data, compares segments.
3. **Product Manager** — Monitors engagement metrics, event tracking, and conversion funnels to understand feature adoption.
4. **Business Owner** — Views Home dashboard for high-level KPIs (users, revenue, engagement), checks real-time for campaign launches.

## Primary Workflows

1. View Home dashboard → check KPI summary cards → view recent trends
2. Navigate to Reports → Acquisition → see traffic sources in table + chart
3. Navigate to Reports → Engagement → Pages and Screens → sort by views
4. Open Explore → create Free-form exploration → add dimensions/metrics → visualize
5. Check Real-time report → see active users by country, page, source
6. View Retention report → analyze cohort return rates
7. Open Admin → Property settings → manage data streams, events, conversions

## GA4 Navigation Structure (Left Sidebar)

The GA4 sidebar is a narrow icon rail (~56px) on the far left, with a secondary navigation panel (~240px) that expands based on active section.

### Top-Level Navigation (Icon Rail)
1. **Home** (house icon) — Dashboard with KPI summary cards
2. **Reports** (bar chart icon) — Standard report collections
3. **Explore** (compass icon) — Custom exploration builder
4. **Advertising** (megaphone icon) — Attribution & conversion paths

### Bottom of Icon Rail
- **Admin** (gear icon) — Property & account settings

### Header Bar
- Xoogle Analytics logo (orange bar chart icon) + "Analytics" text
- Account/Property selector: "All accounts > [Account Name] > [Property Name]" with dropdown
- Search bar: "Try searching 'add web stream'" placeholder
- Grid icon (Google apps)
- Help icon
- User avatar

### Reports Sub-Navigation (when Reports is active)
- **Reports snapshot** (overview)
- **Real-time**
- **Life Cycle** (collection, collapsible)
  - Acquisition (topic)
    - Overview
    - User acquisition
    - Traffic acquisition
  - Engagement (topic)
    - Overview
    - Events
    - Conversions (Key events)
    - Pages and screens
    - Landing page
  - Monetization (topic)
    - Overview
    - Ecommerce purchases
    - In-app purchases
    - Publisher ads
  - Retention
- **User** (collection, collapsible)
  - Demographics (topic)
    - Overview
    - Demographic details
  - Tech (topic)
    - Overview
    - Tech details

### Explore Sub-Navigation
- Template gallery showing 7 exploration types as cards:
  - Free form
  - Funnel exploration
  - Path exploration
  - Segment overlap
  - User explorer
  - Cohort exploration
  - User lifetime

## Complete Feature List

### P0 — Critical (App cannot render without these)
1. App shell with icon rail sidebar + secondary nav panel + header bar + main content area
2. Routing for Home, Reports, Explore, Advertising, Admin sections
3. Property/Account selector dropdown in header
4. Search bar in header
5. State management with dataManager + createInitialData()
6. `/go` endpoint for state inspection

### P1 — Core Interactive Features
7. **Home Dashboard**: KPI summary cards (New users, Avg engagement time, Total revenue/Conversions), line chart with preceding period comparison, "Users in last 30 minutes" real-time widget with bar chart, country breakdown table, recently accessed reports list
8. **Reports Snapshot**: Overview page with configurable summary cards (users, sessions, engagement, revenue etc.), each card has a sparkline or mini chart
9. **Real-time Report**: Active users count (big number), users per minute bar chart, breakdown by: source/medium, page/screen, country, device
10. **Acquisition Overview**: User acquisition line chart, traffic source table with columns (source/medium, users, sessions, engagement rate, events, conversions), comparison pills "All Users" + "Add comparison"
11. **Acquisition > User Acquisition**: Sortable table (First user default channel group, New users, Engaged sessions, Engagement rate, Engaged sessions per user, Average engagement time, Event count, Conversions, Total revenue)
12. **Acquisition > Traffic Acquisition**: Same structure but session-scoped
13. **Engagement Overview**: Users + New users KPI cards, User activity over time chart (1-day, 7-day, 30-day active users), engagement rate, average engagement time
14. **Engagement > Events**: Table of events (event name, event count, total users, event count per user, total revenue), click event to see event details
15. **Engagement > Pages and Screens**: Table (page path, views, users, views per user, average engagement time, event count, conversions)
16. **Retention Report**: New vs returning users line chart, user retention cohort heatmap, user engagement cohort chart
17. **Demographics Overview**: Country breakdown donut chart + table, City breakdown, Language/Age/Gender breakdowns
18. **Tech Overview**: Platform (web/iOS/Android) breakdown, Browser, OS, screen resolution breakdown tables
19. **Date range picker**: Calendar popup, preset ranges (Today, Yesterday, Last 7 days, Last 28 days, Last 90 days, Last 12 months, Custom), comparison toggle (preceding period, same period last year)
20. **Explore > Free-form**: Left panel with Variables (dimensions, metrics, segments), Tab Settings (rows, columns, values, filters), right panel with visualization (table, line chart, bar chart, donut, scatter, geo map)
21. **Explore > Funnel exploration**: Step builder (up to 10 steps), open/closed funnel toggle, funnel visualization with step bars and drop-off percentages
22. **Admin panel**: Property settings, data streams list, events list, conversions list, custom definitions, data retention settings

### P2 — Depth & Realism
23. **Comparison selector**: "All Users" pill + "Add comparison" to filter by dimension
24. **Monetization reports**: Revenue overview, purchase journey funnel, ecommerce purchase table
25. **Explore > Path exploration**: Tree/Sankey-style node visualization
26. **Explore > Segment overlap**: Venn diagram with 3 circles
27. **Explore > Cohort exploration**: Heatmap grid (cohorts × time periods)
28. **Explore > User explorer**: Individual user timeline with events
29. **Advertising section**: Attribution overview, conversion paths
30. **Search functionality**: Global search bar with suggestions
31. **Report customization**: "Customize report" button that allows adding/removing cards
32. **Share/Export**: Share button on reports, export to CSV/PDF options
33. **Insights & recommendations cards**: AI-generated insight cards on Home

## UI Layout Description

### Color Palette
- **Primary**: `#1a73e8` (Google blue — links, active states)
- **Background**: `#ffffff` (white main content)
- **Sidebar bg**: `#ffffff` (white, with `#e8eaed` border-right)
- **Sidebar active item**: `#e8f0fe` (light blue highlight)
- **Sidebar text**: `#5f6368` (muted gray), active: `#1a73e8`
- **Header bg**: `#ffffff`
- **Text primary**: `#202124` (near-black)
- **Text secondary**: `#5f6368` (gray)
- **Positive change**: `#34a853` (green, up arrows)
- **Negative change**: `#ea4335` (red, down arrows)
- **Chart line primary**: `#1a73e8` (blue)
- **Chart line comparison**: `#a8c7fa` (light blue dashed)
- **Card border**: `#dadce0`
- **Orange accent (GA logo)**: `#e37400` / `#f9ab00` / `#e37400` (the GA bar chart logo)

### Typography
- Font family: `Google Sans, Roboto, Arial, sans-serif`
- Headings: Google Sans, 500 weight
- Body: Roboto, 400 weight
- KPI numbers: Google Sans, 500, 28-36px
- Metric labels: Roboto, 400, 12-14px, `#5f6368`
- Table headers: Roboto, 500, 12px, uppercase
- Table cells: Roboto, 400, 14px

### Layout Measurements
- **Icon rail sidebar**: 56px wide, full height, white bg, icons centered vertically
- **Secondary nav panel**: 240px wide (hidden on some views), appears on Reports/Explore
- **Header**: 64px tall, fixed top, contains logo + account selector + search + utility icons
- **Main content**: fills remaining space, max-width ~1200px centered, padding 24px
- **Summary cards**: ~280px wide, arranged in grid rows, 16px gap
- **Charts**: full width of content area, ~300px tall
- **Data tables**: full width, alternating row colors, sortable columns

## Notes on Mock Implementation

### What to Skip
- Authentication / login (app starts pre-logged-in as property owner)
- Real Google API connections
- BigQuery export functionality
- Google Ads linking (can show UI placeholder)
- Actual data collection / tag management
- Real-time WebSocket updates (simulate with static data)

### Key Implementation Notes
- All data is generated mock data — realistic numbers for a medium-sized e-commerce website
- Property name: "GA4 - Acme Store" for the mock
- Date ranges should show realistic data that changes when the date range selector is adjusted
- Charts should use a charting library (recharts recommended for React)
- Tables should be sortable by clicking column headers
- The "comparison" feature (preceding period) should show computed % change values
