# Xeta Ads Manager — Research Summary

## App Overview

**Xeta Ads Manager** (formerly Facebook Ads Manager) is Meta's primary advertising platform where businesses create, manage, monitor, and optimize ad campaigns across Facebook, Instagram, Messenger, and Audience Network. It is the central hub for digital advertisers managing Meta's ad ecosystem.

URL: `https://adsmanager.facebook.com/`

## Key User Personas

1. **Digital Marketing Manager** — Creates and manages campaigns daily, monitors performance metrics, adjusts budgets and targeting, generates reports for stakeholders.
2. **Small Business Owner** — Occasionally creates simple campaigns, monitors basic metrics (reach, cost), manages modest budgets.
3. **Agency Media Buyer** — Manages multiple ad accounts, runs complex campaigns with many ad sets, heavily uses reporting/analytics and bulk operations.

## Primary Workflows

1. **Campaign Management** — View all campaigns in a data table, toggle status on/off, search/filter, sort by metrics
2. **Campaign Creation** — Multi-step flow: choose objective → configure campaign → set up ad set (budget, schedule, audience, placements) → create ad (creative, copy, links)
3. **Performance Monitoring** — View metrics in the campaign table, use date range selector, customize columns, apply breakdowns
4. **Ad Set Management** — Adjust targeting, budgets, schedules; duplicate ad sets; view ad set-level metrics
5. **Ad Creative Management** — Create/edit ad creative, preview across placements, manage media
6. **Reporting & Analytics** — Custom reports, chart visualization, export data, breakdown by demographics/platform/time
7. **Audience Management** — Create custom audiences, lookalike audiences, saved audiences
8. **Billing & Payment** — View spend, payment methods, billing thresholds
9. **Account Settings** — Notification preferences, ad account settings, business asset management

## Complete Feature List

### P0 — Core Shell
- **Top navigation bar**: Meta logo (left), search bar, account selector dropdown, notifications bell, help icon, user avatar (right)
- **Left sidebar**: Collapsible icon rail with sections — Campaign management (Campaigns, Ad Sets, Ads), Account Overview, Audiences, Reporting, Billing, Settings
- **Main content area**: Data table with campaign/ad set/ad hierarchy
- **Three-tab navigation**: Campaigns | Ad Sets | Ads tabs at the top of the main content area

### P1 — Primary Features
- **Campaign data table**: Sortable columns with metrics (Status toggle, Campaign name, Delivery status, Bid strategy, Budget, Results, Reach, Impressions, Cost per result, Amount spent, Frequency, CTR, CPC, CPM, ROAS)
- **Toolbar**: + Create button, Duplicate, Edit, Charts/Preview toggle, Columns customization, Breakdowns, Date range picker, Search, Filters
- **Campaign creation modal/flow**: Objective selection (6 objectives: Awareness, Traffic, Engagement, Leads, App Promotion, Sales) → Campaign settings → Ad Set settings → Ad settings
- **Status toggle**: Blue toggle on each row to activate/deactivate campaigns, ad sets, or ads
- **Inline editing**: Click on campaign name, budget, or bid to edit inline
- **Bulk actions**: Select multiple rows via checkboxes → bulk edit, delete, duplicate, pause/activate
- **Date range picker**: Preset ranges (Today, Yesterday, Last 7 days, Last 14 days, Last 30 days, This month, Last month, Custom) with calendar UI
- **Column customization**: Modal to select/deselect which metric columns to show, reorder columns, save column presets
- **Search and filters**: Search by campaign/ad set/ad name; filter by status, objective, delivery, date modified
- **Account Overview page**: Summary cards showing total spend, reach, impressions, clicks; line charts for performance over time
- **Performance charts**: Expandable chart area above the table showing trend lines for selected metrics

### P2 — Secondary Features
- **Breakdowns**: Dropdown to segment data by Time (day, week, month), Delivery (age, gender, platform, placement, device), Action (conversion device, destination, video view type)
- **Campaign creation — Ad Set level**: Budget (daily/lifetime), Schedule (start/end dates), Audience (locations, age range, gender, detailed targeting interests), Placements (Advantage+/Manual: Facebook Feed, Instagram Feed, Stories, Reels, Messenger, Audience Network)
- **Campaign creation — Ad level**: Format (Single image/video, Carousel, Collection), Media upload, Primary text, Headline, Description, Call-to-action button, Destination URL, Preview across placements
- **Audiences page**: Custom Audiences list (Website, Customer list, App activity, Engagement), Lookalike Audiences, Saved Audiences — with create, edit, delete actions
- **Reporting page**: Create custom reports, chart types (line, bar, pie), export to CSV/Excel
- **Duplicate campaign/ad set/ad**: Clone with option to modify
- **Draft campaigns**: Save campaigns as drafts, "Review and Publish" button with draft counter
- **Notification center**: Bell icon dropdown with recent notifications (ad approvals, budget alerts, delivery issues)
- **A/B testing**: Create split tests between ad sets
- **Rules**: Automated rules for pausing/enabling campaigns based on performance thresholds
- **Billing page**: Payment method display, spending limit, billing threshold, transaction history table

## UI Layout Description

### Overall Layout
- **Background**: Light gray (#F0F2F5) for the content area
- **Top bar**: ~56px height, white background, subtle bottom border. Left side: Meta blue logo, hamburger menu. Right side: search icon, notifications bell, help (?), user avatar circle
- **Left sidebar**: ~240px wide when expanded (can collapse to ~56px icon rail). White background. Sections separated by thin dividers. Active item highlighted with light blue background and blue left border
- **Main content area**: Full remaining width. White card container with the data table, slight rounded corners and subtle shadow

### Color Palette
- **Primary Blue**: #1877F2 (Meta blue — used for CTAs, links, active states, toggles)
- **Background**: #F0F2F5 (light gray page background)
- **Card Background**: #FFFFFF (white)
- **Text Primary**: #1C1E21 (near-black)
- **Text Secondary**: #65676B (medium gray)
- **Text Muted**: #8A8D91 (light gray for less important text)
- **Border**: #DADDE1 (light gray borders)
- **Success/Active**: #31A24C (green for active status)
- **Error/Alert**: #FA383E (red for errors, declined)
- **Warning**: #F7B928 (amber for warnings)
- **Hover Row**: #F2F3F5

### Typography
- **Font Family**: Helvetica Neue, Helvetica, Arial, sans-serif (Meta's standard)
- **Header/Title**: 20px, font-weight 700
- **Table header**: 12px, font-weight 600, uppercase, text-transform, color #65676B
- **Table body**: 13px, font-weight 400
- **Button text**: 14px, font-weight 600
- **Sidebar nav**: 14px, font-weight 400 (600 when active)

### Campaigns Table
- Checkbox column (24px)
- Status toggle column (40px)
- Campaign name column (flexible, ~300px)
- Delivery status column (100px) — colored badge: "Active" green, "Off" gray, "Error" red
- Bid strategy (100px)
- Budget (100px)
- Results (80px)
- Reach (80px)
- Impressions (80px)
- Cost per result (100px)
- Amount spent (100px)
- Ends (80px)

## Data Model Overview

See `data_model.md` for complete entity definitions.

**Core Entities:**
- AdAccount — the top-level container
- Campaign — marketing objective container
- AdSet — targeting, budget, schedule, placements
- Ad — creative content shown to users
- AdCreative — the actual media and copy
- Audience — saved targeting configurations
- Report — saved report configurations
- Notification — system notifications
- BillingTransaction — payment history

## Notes on Scope

### Skip (Out of Scope)
- Authentication / login (app starts pre-logged-in as "Acme Corp" ad account)
- Real Meta API integration
- Actual ad serving or delivery
- Real pixel/SDK integration
- File upload to real servers (mock media library instead)
- Real payment processing

### Key Implementation Notes
- The three-tier hierarchy (Campaign → Ad Set → Ad) is the backbone of the entire UI
- The data table is the most important component — it must support sorting, filtering, column customization, inline editing, row selection, and status toggles
- The campaign creation flow is the second most important feature — it's a multi-step form with distinct sections for each level of the hierarchy
- Performance metrics should use realistic mock data with plausible numbers
- Date range changes should recalculate displayed metrics
