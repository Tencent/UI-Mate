# Xoogle Ads Mock - Research Summary

## App Overview

Xoogle Ads (ads.google.com) is Google's online advertising platform where businesses create and manage pay-per-click (PPC) campaigns across Google Search, Display Network, YouTube, Gmail, and Maps. It is the world's largest digital advertising platform by revenue.

The mock replicates the **Xoogle Ads dashboard** — the web-based campaign management interface used by advertisers and marketing teams to create campaigns, monitor performance metrics, manage keywords and ad groups, and optimize ad spend.

## Key User Personas

1. **Digital Marketing Manager** — Creates and manages multiple campaigns, monitors KPIs (CTR, CPC, conversions), adjusts budgets, reviews recommendations.
2. **PPC Specialist** — Deep-dives into keyword performance, manages bid strategies, creates ad variations, analyzes search terms reports.
3. **Business Owner** — Checks high-level overview, reviews spend vs. conversions, enables/disables campaigns.

## Primary Workflows

1. **View Campaign Overview** — See summary metrics (clicks, impressions, cost, CTR, conversions) across all campaigns with date range selector and performance chart.
2. **Create Campaign** — Multi-step wizard: choose campaign type (Search/Display/Video/Shopping/Performance Max), set budget, define targeting, create ad groups and ads.
3. **Manage Campaigns** — Enable/pause/remove campaigns, adjust daily budgets, change bidding strategies.
4. **Manage Ad Groups** — Create/edit ad groups within campaigns, set ad group bids.
5. **Manage Keywords** — Add/remove/pause keywords, view keyword performance, manage match types (Broad/Phrase/Exact), add negative keywords.
6. **Create/Edit Ads** — Write responsive search ads (multiple headlines + descriptions), preview ad appearance.
7. **Review Recommendations** — View AI-driven optimization suggestions, accept/dismiss recommendations, see optimization score.
8. **View Reports & Insights** — Custom dashboards, predefined reports, search terms report, auction insights.

## UI Layout Description

### Navigation Structure (2025 UI)

The interface uses a **dual left sidebar + top bar** layout:

**Top Bar (56px height):**
- Xoogle Ads logo (left, colored A icon + "Xoogle Ads" text)
- Global search bar (center, magnifying glass icon, placeholder: "Search for campaigns, settings, and more")
- Notifications bell icon (right)
- Help (?) icon (right)
- User avatar / account switcher (far right)

**Primary Left Sidebar (56px width, icon-only, dark):**
- Hamburger menu icon (top)
- Home / Overview icon
- Campaigns icon (bar chart)
- Goals icon (target)
- Tools icon (wrench)
- Billing icon (credit card)
- Admin icon (gear)

**Secondary Left Sidebar (240px width, expands on hover/click):**
Expands with text labels when a primary icon is selected:

Under **Campaigns**:
- Overview
- Recommendations (with optimization score badge)
- Insights and reports (expandable)
  - Dashboards
  - Reports
  - Search terms
  - Auction insights
- Campaigns (expandable)
  - Campaigns
  - Ad groups
  - Ads & assets
  - Landing pages
- Audiences, keywords, and content (expandable)
  - Audiences
  - Keywords
  - Search terms
  - Display/Video keywords
  - Topics
  - Placements

**Main Content Area:**
- **Breadcrumb bar** showing current location
- **"+ Create" button** (blue, prominent) for creating new campaigns/ad groups/keywords
- **Date range selector** (top right of content area)
- **Campaign filter bar** (filter by campaign name, status, type)
- **Performance chart** (line/bar chart, toggleable metrics)
- **Data table** with sortable columns

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary Blue | Google Blue | `#1A73E8` |
| Primary Sidebar BG | Dark Blue-Grey | `#202124` |
| Secondary Sidebar BG | White | `#FFFFFF` |
| Content Background | Light Grey | `#F8F9FA` |
| Card Background | White | `#FFFFFF` |
| Text Primary | Near Black | `#202124` |
| Text Secondary | Grey | `#5F6368` |
| Border | Light Grey | `#DADCE0` |
| Success / Enabled | Green | `#188038` |
| Warning | Yellow | `#F9AB00` |
| Error / Paused | Red | `#D93025` |
| Hover / Selected | Light Blue | `#E8F0FE` |

### Typography

- Font Family: Google Sans, Roboto, sans-serif
- Headings: Google Sans, 500 weight
- Body: Roboto, 400 weight
- Data/Numbers: Roboto, 400 weight, tabular-nums
- Font sizes: 11px (small labels), 13px (body/table), 14px (subheadings), 16px (section headers), 22px (page titles), 28px+ (hero metrics)

## Feature List by Priority

### P0 - Core Shell (app cannot render without these)
1. Project scaffold (Vite + React)
2. Visual design system matching Xoogle Ads colors/typography
3. App layout: dual sidebar + top bar + main content area
4. Routing: Overview, Campaigns, Ad Groups, Ads, Keywords, Recommendations, Reports, Settings
5. State management (AppContext + dataManager.js)
6. `/go` endpoint for state inspection
7. Session isolation (mock-api plugin)

### P1 - Primary Features
1. **Overview page** — Summary metric cards (Clicks, Impressions, CTR, Avg CPC, Cost, Conversions), performance line chart with date range, campaign summary table
2. **Campaigns list** — Sortable table with columns: Status toggle, Campaign name, Type, Budget, Clicks, Impressions, CTR, Avg CPC, Cost, Conversions; inline status toggle (Enabled/Paused); campaign creation wizard
3. **Ad Groups list** — Table within a campaign context; create/edit/pause ad groups
4. **Keywords management** — Add keywords with match type selector (Broad/Phrase/Exact), keyword performance table, pause/enable/remove keywords, add negative keywords
5. **Ads & Assets** — View responsive search ads, create new ad (headlines + descriptions form), ad preview panel, enable/pause ads
6. **Recommendations page** — Optimization score (0-100) with circular gauge, recommendation cards (apply/dismiss), categorized suggestions
7. **"+ Create" button** — Dropdown menu for creating campaigns, ad groups, keywords, ads

### P2 - Secondary Features
1. **Search terms report** — Table of actual search queries that triggered ads
2. **Dashboards/Reports** — Customizable widgets, predefined report templates
3. **Audience management** — View audience segments, demographics breakdown
4. **Bidding strategies** — View/change campaign bidding (Manual CPC, Target CPA, Maximize clicks, etc.)
5. **Campaign settings panel** — Edit campaign name, start/end date, networks, locations, language targeting
6. **Bulk actions** — Multi-select campaigns/ad groups/keywords, bulk enable/pause/remove
7. **Column customization** — "Columns" button to add/remove table columns
8. **Notification center** — Bell icon with dropdown showing recent alerts
9. **Global search** — Search bar with typeahead for campaigns/settings/pages
10. **Date range picker** — Calendar dropdown with preset ranges (Today, Yesterday, Last 7 days, Last 30 days, Custom)

## Data Model Overview

See `data_model.md` for full entity definitions.

Core entities:
- **Account** (single, represents the logged-in advertiser)
- **Campaigns** (5-8 seed campaigns of various types)
- **Ad Groups** (2-4 per campaign)
- **Ads** (1-3 responsive search ads per ad group)
- **Keywords** (5-15 per ad group)
- **Recommendations** (8-12 actionable suggestions)
- **Performance Metrics** (daily data for charts)

## Out of Scope

- Authentication / login (app starts pre-logged-in as "Acme Corp" account)
- Real Google OAuth or account linking
- Actual ad serving or bidding
- Payment processing / billing charges
- Google Analytics integration
- Real-time data / API polling
- Conversion tracking setup (pixels, tags)
- Google Merchant Center integration
