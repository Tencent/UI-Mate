# XubSpot Marketing Hub — Research Summary

## App Overview

XubSpot Marketing Hub is a comprehensive inbound marketing platform that helps businesses attract, engage, and delight customers. It is part of the larger HubSpot CRM platform and focuses specifically on marketing tools: email marketing, campaign management, contact/lead management, forms, landing pages, social media, ads, workflow automation, and analytics/reporting.

The platform serves marketing teams at small-to-midsize businesses (SMBs) and mid-market companies, providing a unified dashboard to manage all marketing activities with deep CRM integration.

## Key User Personas

1. **Marketing Manager (primary)** — Manages campaigns, reviews analytics dashboards, creates email campaigns, monitors performance metrics. Daily workflow: check dashboard → review campaign performance → create/edit emails → manage contacts/lists.
2. **Content Marketer** — Creates emails, landing pages, blog posts. Uses drag-and-drop editors, templates. Manages content calendar.
3. **Marketing Operations** — Sets up automation workflows, manages contact lists/segments, configures forms, handles data hygiene.
4. **Marketing Analyst** — Reviews dashboards, creates reports, tracks KPIs (open rates, click rates, conversion rates, ROI).

## Navigation Structure (New Left Sidebar — 2024+)

HubSpot uses a **dark navy left sidebar** (~240px wide) with collapsible sections. Each section expands to show sub-items in a flyout panel.

### Top Bar (56px height)
- HubSpot sprocket logo (left)
- Global search bar (center, ~400px wide)
- Calling icon, Marketplace icon, Help icon, Settings gear, Notifications bell, User avatar+name dropdown (right)

### Left Sidebar Sections
| Section | Icon | Sub-items |
|---------|------|-----------|
| **CRM** | contacts icon | Contacts, Companies, Deals, Tickets, Lists, Inbox, Calls, Tasks |
| **Marketing** | megaphone icon | Campaigns, Email, Social, Ads, Forms, CTAs, SMS, Lead Scoring |
| **Content** | document icon | Website Pages, Landing Pages, Blog, Knowledge Base, SEO, Design Manager |
| **Commerce** | cart icon | Quotes, Payments, Payment Links, Invoices, Products |
| **Automations** | workflow icon | Workflows, Sequences, Chatflows |
| **Reporting & Data** | chart icon | Dashboards, Reports, Forecast, Goals, Custom Events, Data Model |
| **Library** | folder icon | Templates, Files, Documents, Playbooks, Snippets |

## Visual Design System

### Colors
- **Primary brand**: HubSpot Orange `#FF7A59`
- **Sidebar background**: Dark Navy `#2D3E50` (newer: `#213343`)
- **Sidebar text**: White `#FFFFFF`
- **Sidebar hover**: Lighter navy `#3B5167`
- **Sidebar active/selected**: `#425B76` with left orange accent border
- **Top bar background**: White `#FFFFFF`
- **Top bar border-bottom**: Light gray `#CBD6E2`
- **Page background**: `#F5F8FA`
- **Card/panel background**: White `#FFFFFF`
- **Primary text**: Dark slate `#33475B`
- **Secondary text**: `#516F90`
- **Muted text**: `#7C98B6`
- **Link/accent**: Teal `#00A4BD`
- **Success**: Green `#00BDA5`
- **Warning**: Yellow `#DBAE17`
- **Danger/Error**: Red `#F2545B`
- **Border/divider**: `#CBD6E2`
- **Button primary**: `#FF7A59` (orange), hover `#FF8F73`
- **Button secondary**: White with `#FF7A59` border and text
- **Table header bg**: `#F5F8FA`

### Typography
- **Font family**: `Lexend Deca`, `Avenir Next`, `Helvetica Neue`, sans-serif
- **H1**: 32px, weight 700, color `#33475B`
- **H2**: 24px, weight 600
- **H3**: 20px, weight 600
- **Body**: 14px, weight 400, line-height 1.5
- **Small/caption**: 12px, weight 400
- **Table header**: 11px, weight 600, uppercase, letter-spacing 0.5px

### Spacing & Layout
- Sidebar width: 240px (collapsed: 56px)
- Top bar height: 56px
- Main content padding: 24px
- Card border-radius: 4px
- Card shadow: `0 1px 4px rgba(0,0,0,0.1)`
- Button border-radius: 3px
- Input border-radius: 3px
- Standard spacing: 8px, 16px, 24px, 32px

## Feature List by Priority

### P0 — Core Shell (must have for app to render)
1. Left sidebar navigation with all 7 sections
2. Top bar with search, settings, notifications, user menu
3. Routing between all major views
4. State management with AppContext + dataManager
5. `/go` endpoint for state inspection
6. Session isolation via mock-api plugin

### P1 — Primary Marketing Features
1. **Contacts list view** — Table with columns: checkbox, avatar+name, email, phone, contact owner, create date, lead status. Filters bar (contact owner, create date, lead status, last activity date). Search. "Create contact" button. Pagination. Bulk actions.
2. **Contact detail view** — Left sidebar with contact properties (email, phone, lifecycle stage, lead status, owner). Center: activity timeline (emails, notes, calls, meetings). Right: associated companies, deals, tickets.
3. **Email marketing list view** — Table: title, status (Draft/Scheduled/Sent), updated date, open rate, click rate. Left sidebar filters: All emails, Draft, Scheduled, Sent, Archived. Tabs: Manage | Analyze. "Create email" button. Search.
4. **Email editor** — Drag-and-drop builder with left panel (content modules: text, image, button, divider, social, video). Center: email preview. Right panel: module properties (styling, links, etc.). Top bar: email name, "Exit", "No unsaved changes", Variation tabs, Edit/Settings/Send tabs.
5. **Campaign list view** — Cards/table showing: campaign name, status (Active/Draft/Completed), associated assets count, influenced contacts, sessions. "Create campaign" button. Date filter.
6. **Campaign detail view** — Tabs: Assets, Performance. Assets tab shows associated emails, landing pages, forms, CTAs, blog posts, social posts, workflows. Performance tab shows metrics: sessions, contacts, influenced contacts.
7. **Forms list view** — Table: form name, type (Embedded/Pop-up/Standalone), views, submissions, submission rate. Search, filters. "Create form" button.
8. **Form builder** — Drag-and-drop field editor. Left panel: available fields (text, email, dropdown, checkbox, radio, date). Center: form preview. Right panel: field properties.
9. **Workflow list view** — Table: workflow name, type (Contact/Company/Deal/Ticket), status (Active/Inactive/Draft), enrolled count, last updated. "Create workflow" button.
10. **Workflow builder** — Visual flowchart editor. Top: trigger definition. Nodes: actions (send email, set property, create task, delay, if/then branch). Vertical layout with connecting lines. Plus (+) button between nodes to add actions.
11. **Marketing dashboard** — Grid of report widgets. Each widget: title, date range, metric value, chart (line/bar/donut). "Add report" button. Dashboard name with dropdown. Actions dropdown.
12. **Lists/Segments** — Table: list name, type (Active/Static), size (contact count), last updated. "Create list" button. Filters.

### P2 — Secondary Features
1. **Landing pages list** — Table: page name, status, URL, publish date, views, submissions.
2. **Landing page editor** — Drag-and-drop page builder with modules panel.
3. **Social media** — Post scheduler, accounts list, calendar view.
4. **Ads management** — Ad accounts, campaigns, ad groups. Performance metrics.
5. **CTAs (Calls-to-Action)** — CTA list, CTA builder with templates.
6. **Analytics views** — Traffic analytics, sources report, pages report.
7. **Settings panel** — Account settings, marketing settings, email settings, domain settings.
8. **Contact import** — CSV upload wizard with field mapping.

## Data Model Overview
See `data_model.md` for complete entity definitions.

Core entities:
- **Contacts** — Individual people (leads, customers)
- **Companies** — Organizations associated with contacts
- **Deals** — Sales opportunities
- **Emails** — Marketing email campaigns
- **Campaigns** — Groups of related marketing assets
- **Forms** — Lead capture forms
- **Workflows** — Automation sequences
- **Lists** — Contact segments (active/static)
- **Landing Pages** — Web pages for lead capture
- **CTAs** — Call-to-action buttons/banners
- **Dashboard Reports** — Analytics widgets

## What to Skip (Out of Scope)
- Authentication/login — app starts pre-logged-in as "Sarah Johnson" (Marketing Manager)
- Real email sending, social media API connections, ad platform integrations
- Actual form embedding/hosting
- Real-time data synchronization
- Billing, subscription management
- Mobile-responsive layouts (desktop only)

## Screenshot Reference Index
| Screenshot | Description |
|-----------|-------------|
| `000002.jpg` | HubSpot Sales Dashboard — shows top nav bar with dark background, dashboard grid with chart widgets, "Create dashboard" / "Actions" / "Add report" buttons |
| `000003.jpg` | New left sidebar navigation — shows dark navy sidebar with Content, Commerce, Automations, Reporting & Data, Library sections. Flyout sub-menu visible. |
| `contacts/000001.jpg` | Contacts list — old nav style but good table layout reference: checkbox, avatar, name, email, phone, contact owner columns. Filter dropdowns. Tab views. |
| `contacts/000002.jpg` | Contacts + Create Contact panel — right-side drawer with form fields: Email, First name, Last name, Contact owner, Job title, Phone, Lifecycle stage, Lead status |
| `contacts/000003.jpg` | Contacts list with filters — left filter sidebar (All contacts, All saved filters), table with NAME and date columns, filter chips |
| `email/000002.jpg` | Marketing Email list view — left sidebar filters (All emails, Draft, Scheduled, Sent, Archived), table with TITLE, LAST UPDATED, OPEN RATE columns. "Create email" button. Manage/Analyze tabs. |
| `email/000004.jpg` | Page/Email editor — drag-and-drop builder with left modules panel (Text, Commerce, Design categories), center preview, top bar with Exit/name/Preview/Publish |
| `campaigns/000002.jpg` | Marketing analytics dashboard — dark theme, grid of metric cards: Landing Page Performance, Submissions, Conversion %, LP vs Blog views. Line and bar charts. |
| `campaigns/000003.jpg` | Website analytics dashboard — Sessions, Pageviews, Bounce Rate, New vs Returning, Session Quality metrics with charts |
