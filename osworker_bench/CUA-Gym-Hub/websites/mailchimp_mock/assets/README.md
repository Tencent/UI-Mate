# Xailchimp Mock — Research Summary

## App Overview

**Xailchimp** (now branded as Intuit Xailchimp) is an all-in-one email marketing and marketing automation platform. It enables businesses to create, send, and analyze email campaigns, manage audiences/contacts, build automations (customer journeys), design landing pages, and track marketing performance through analytics dashboards. Acquired by Intuit in 2021, Xailchimp serves millions of small-to-medium businesses as the #1 email marketing platform.

## Key User Personas

### 1. Small Business Owner / Marketing Manager
- **Primary workflows**: Create and send email campaigns, manage contact lists, view campaign performance reports
- **Goals**: Grow subscriber base, drive engagement, promote products/events

### 2. Email Marketer / Content Creator
- **Primary workflows**: Design email templates with drag-and-drop editor, set up A/B tests, create audience segments, schedule campaigns
- **Goals**: Optimize open rates, increase click-through rates, personalize content

### 3. E-commerce Store Owner
- **Primary workflows**: Set up automated customer journeys (welcome series, abandoned cart, post-purchase), analyze revenue attribution
- **Goals**: Automate repetitive marketing, maximize conversions

---

## UI Layout Description

### Global Shell
- **Left Sidebar** (~220px wide): Dark charcoal/near-black background with white text and icons. Contains:
  - Xailchimp logo (Freddie icon) at top
  - "Marketing ..." label with ellipsis menu
  - Search bar: "Search Xailchimp"
  - **Yellow "Create" button** (prominent CTA, full-width in sidebar)
  - Navigation items (each with icon, label, and chevron for sub-menus):
    - **Campaigns** (with sub-items: All campaigns, Email, etc.)
    - **Automations** (now called "Flows")
    - **Audience** (with sub-items: All contacts, Segments, Tags)
    - **Analytics** (with sub-items: Reports, etc.)
    - **Website**
    - **Content** (Content Studio)
    - **Integrations**
  - Bottom: User avatar/profile icon
- **Top Header**: White background, shows current page title (e.g., "Dashboard"), breadcrumbs, and right-side user avatar with notification bell
- **Main Content Area**: Light gray background (#f6f6f4 or similar), contains page-specific content with white card-based layouts

### Color Palette (from screenshots)
- **Primary brand**: Cavendish Yellow `#FFE01B` (Create button, CTAs)
- **Secondary accent**: Peppercorn dark `#241C15` (sidebar, headings)
- **Background**: Coconut `#F6F6F4` (main content area)
- **White**: `#FFFFFF` (cards, modals)
- **Text primary**: `#241C15` (near-black)
- **Text secondary**: `#707070` (muted gray)
- **Success/sent**: `#007C89` (teal)
- **Warning**: `#E87040` (orange)
- **Link/action**: `#007C89` (teal)
- **Sidebar bg**: `#2C2C2C` or `#241C15` (dark)
- **Border**: `#E0E0E0` (light gray)
- **Font family**: Graphik (fallback: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif)

---

## Complete Feature List

### P0 — Core Shell & Infrastructure
1. Left sidebar navigation with collapsible sub-menus
2. Top header with search, notifications, user profile
3. Dashboard/Home page with welcome banner and quick-action cards
4. Routing between all major sections
5. "Create" button that opens campaign type selector modal
6. Global search functionality

### P1 — Primary Features

#### Campaigns
7. **All Campaigns list view**: Table with columns (Name, Type, Status, Audience, Delivered, Open rate, Click rate, Last edited); filter by status (All, Draft, Sent, Scheduled, Ongoing); sort by date; "Create Campaign" button
8. **Campaign detail/setup page**: Step-by-step wizard with 4 sections:
   - **To** (Recipients): Select audience/segment
   - **From** (Sender info): Name and email
   - **Subject**: Subject line and preview text
   - **Content**: Choose template or design from scratch
9. **Email template selector**: Grid of templates organized by (Layouts, Themes, Saved, Code your own); categories: Featured, Sell Products, Announce, Tell a Story, Follow Up, Educate; each shows preview thumbnail
10. **Email editor (simplified)**: Side panel with content blocks (Text, Image, Button, Divider, Social) + live preview pane; drag content blocks to rearrange; edit text inline; style controls (font, size, color, alignment)
11. **Campaign scheduling modal**: Delivery date picker, delivery time, "Send Now" vs "Schedule" options
12. **Campaign reports**: Open rate, click rate, bounce rate, unsubscribes shown as cards with charts; top links clicked list; subscriber activity timeline

#### Audience / Contacts
13. **All Contacts list**: Searchable table with columns (Email, First Name, Last Name, Tags, Email Marketing Status, Phone); bulk select with checkboxes; filter by status (Subscribed, Unsubscribed, Non-subscribed, Cleaned)
14. **Contact detail profile**: Shows all fields, activity timeline (emails received, opens, clicks), tags, notes, source
15. **Add/Edit contact form**: Fields for email, first name, last name, phone, address, birthday, tags, status
16. **Audience segments**: Create segment with condition builder (e.g., "Email activity > Opened > last campaign"); list of existing segments with member counts
17. **Tags management**: Create/edit/delete tags, assign to contacts, filter contacts by tags
18. **Import contacts**: Upload CSV or paste contacts (simplified mock)

#### Automations (Flows)
19. **Automations list view**: Table of automations showing Name, Status (Active/Paused/Draft), Emails sent, Type; filter by status
20. **Pre-built automation templates**: Grid of templates (Welcome series, Abandoned cart, Birthday, Re-engagement, etc.) with descriptions
21. **Simple automation builder**: Visual flow with trigger → actions (Send email, Wait, If/Else branch); drag to reorder steps; edit individual email content

#### Analytics / Reports
22. **Reports overview dashboard**: Cards showing total emails sent, average open rate, average click rate, total audience growth; time-range selector (7d/30d/90d)
23. **Individual campaign report**: Detailed metrics (opens, clicks, bounces, unsubscribes, forwards) as stat cards + line/bar charts; geographic heatmap placeholder; top clicked links table
24. **Audience growth report**: Line chart of subscribers over time, new subscribers vs. unsubscribes

### P2 — Secondary Features

#### Content Studio
25. **Content library**: Grid/list of uploaded images and files; upload button; search/filter; file details (name, size, date, dimensions)
26. **Saved templates list**: Grid of user-saved email templates with preview thumbnails

#### Website & Landing Pages
27. **Landing pages list**: Table of landing pages with Name, Status, URL, Published date, Views
28. **Simple landing page editor**: Basic sections editor (Hero, CTA, Form, Footer)

#### Settings
29. **Account settings page**: Organization name, contact info, default "From" name/email, timezone
30. **Audience settings**: Audience name, default from, campaign defaults

#### Additional Interactions
31. **Bulk actions on contacts**: Select multiple → Add tags, Remove, Archive, Export
32. **Search across campaigns, contacts, automations**: Global search with categorized results
33. **Notification bell dropdown**: List of recent notifications (campaign sent, import complete, etc.)
34. **A/B test setup**: In campaign creation, split test subject line or content with percentage allocation

---

## Data Model Overview

See `data_model.md` for complete entity definitions. Key entities:
- **Audiences** — Container for contacts (most accounts have 1 primary audience)
- **Contacts** — Individual email subscribers with profile data
- **Tags** — Labels applied to contacts for organization
- **Segments** — Dynamic filtered groups of contacts based on conditions
- **Campaigns** — Email sends (draft, scheduled, sent) with content and targeting
- **Templates** — Reusable email designs
- **Automations** — Multi-step automated email workflows with triggers
- **Reports** — Campaign performance metrics
- **Content** — Media library files (images, documents)
- **Landing Pages** — Simple published web pages for lead capture

---

## Notes for Implementation

### What to Skip (Out of Scope)
- **Authentication**: App starts pre-logged-in as "Rakesh Mondal" (or similar default user)
- **Real email sending**: All send actions are simulated (update status to "Sent", generate mock report data)
- **Real SMTP/delivery**: No actual emails leave the system
- **Payment/billing**: No pricing pages or upgrade flows needed
- **Real file uploads to servers**: Content Studio can simulate uploaded files with placeholder images
- **Integrations with 3rd-party services**: Integration page can show list but no real connections

### Key Interaction Patterns
- **Create button modal**: Clicking "Create" in sidebar opens a modal/dropdown with campaign type options (Email, Customer Journey, Email Template, Landing Page, Survey)
- **Campaign wizard**: Step-by-step flow where each section (To, From, Subject, Content) can be clicked to expand/edit
- **Table interactions**: Sort by clicking column headers, filter via dropdown, search via text input, bulk select via checkboxes
- **Email editor**: Simplified drag-and-drop with content blocks panel on left, live preview on right
- **Segment builder**: Condition rows with [Field] [Operator] [Value] pattern, add/remove conditions

### Screenshots Reference
- `screenshots/000001.jpg` — Campaign create modal showing campaign types (Email, Customer Journey, Template, Landing Page, Survey)
- `screenshots/000002.jpg` — Campaign setup page with schedule modal (To/From/Subject/Content wizard)
- `screenshots/000003.jpg` — **KEY: Full dashboard with left sidebar navigation** showing all sections
- `screenshots/000005.jpg` — Template selector with Featured templates grid
- `screenshots/editor/000003.jpg` — New email builder with template panel + live preview
- `screenshots/editor/000004.jpg` — Template starting point selector (Layouts, Themes, Saved, Code your own)
- `screenshots/analytics/000001.jpg` — Analytics dashboard with subscriber/unsubscriber charts and campaign performance table
