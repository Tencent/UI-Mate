# Xendesk Support Mock — Research Summary

## App Overview

**Xendesk Support** is the world's leading cloud-based customer service and help desk platform, used by 100,000+ companies. It provides a centralized ticketing system where support agents manage customer requests (tickets) across email, chat, phone, social media, and web forms. The core agent experience revolves around the **Agent Workspace** — a unified interface for viewing, triaging, and resolving support tickets.

**Category:** Customer service / Help desk / Ticketing system

**What makes Xendesk distinct:**
- Unified Agent Workspace with tabbed ticket handling
- Views system for organizing tickets into filtered lists
- Macros for one-click batch ticket updates
- Rich conversation threading with public replies and internal notes
- Customer context panel showing requester history
- SLA tracking with visual breach indicators
- Extensive automation (triggers and automations)

---

## Key User Personas

### 1. Support Agent (Primary — our mock's default user)
- **Primary workflows:** View ticket queue → Open ticket → Read conversation → Reply/Add internal note → Update status/priority → Apply macro → Move to next ticket
- **Time spent:** 80% in ticket views and ticket detail pages
- **Key actions:** Reply to tickets, add internal notes, change status/priority/assignee, apply macros, search tickets, use keyboard shortcuts

### 2. Team Lead / Supervisor
- **Primary workflows:** Monitor team queue → Reassign tickets → Check SLA compliance → Review reporting dashboard
- **Time spent:** Split between views, dashboard, and reporting

### 3. Administrator
- **Primary workflows:** Configure views, macros, triggers → Manage agents and groups → Set up SLA policies → Customize ticket forms
- **Time spent:** Mostly in Admin Center (out of scope for mock)

**Our mock focuses on the Support Agent persona.**

---

## Complete Feature List

### P0 — Core Shell (Must have to render)
1. **Left sidebar navigation** — Narrow ~56px dark sidebar with icon buttons: Home, Views, Reporting, Admin (gear), product switcher at bottom
2. **Top header bar** — Contains: search bar (center), "+ Add" new ticket button, conversation/notification bell, help (?), user avatar/menu; also tab bar for open tickets
3. **Main content area** — Flexible content that changes based on route (views list, ticket detail, dashboard, etc.)
4. **Routing** — Routes for: /, /views, /views/:id, /tickets/:id, /tickets/new, /search, /reporting, /customers, /organizations, /go
5. **State management** — AppContext + dataManager with session isolation

### P1 — Primary Features (Core interactive workflows)
6. **Views panel** — Left panel (~260px) listing views as a tree: "Your unsolved tickets", "Unassigned tickets", "All unsolved tickets", "Recently updated tickets", "Recently solved tickets", "Pending tickets", etc. Each view shows ticket count badge
7. **Ticket list table** — Table with columns: checkbox, Status (icon), Subject, Requester, Requester updated, Group, Assignee; sortable columns; row hover highlights; clicking row opens ticket
8. **Ticket detail page** — Three-panel layout:
   - LEFT (~260px): Ticket properties panel — Assignee dropdown, Status dropdown (with custom statuses), Type dropdown (question/incident/problem/task), Priority dropdown (low/normal/high/urgent), Tags input, Group dropdown, Brand
   - CENTER: Conversation panel — Chronological list of comments (public replies + internal notes differentiated by background color: white for public, yellow/amber for internal notes); each comment shows avatar, author name, timestamp, and body; at bottom is the reply composer
   - RIGHT (~300px): Context panel — Requester info card (name, email, org, local time), interaction history, related tickets
9. **Reply composer** — At bottom of conversation; toggle between "Public reply" and "Internal note" (tab-like buttons); rich text editor with formatting toolbar (bold, italic, lists, code, link, attachment); "To:" field with CC; "Submit as [Status]" button (split button with dropdown: Submit as Open, Submit as Pending, Submit as Solved, etc.)
10. **Create new ticket** — Form/modal: Requester field (autocomplete), Subject, Description (rich text), Type, Priority, Assignee, Group, Tags, Brand, custom fields; "Submit as [Status]" button
11. **Ticket status system** — Visual status indicators: New (blue), Open (red/coral), Pending (blue/teal), Hold (dark gray), Solved (gray), Closed (gray strikethrough)
12. **Search** — Global search bar; results show tickets matching subject/description/requester; filters for status, assignee, priority, type, tags, date range
13. **Macro application** — "Apply macro" button at bottom-left of ticket detail; dropdown list of macros; applying a macro auto-fills fields and/or adds a comment
14. **Bulk ticket actions** — Select multiple tickets via checkboxes in views; bulk action toolbar appears: "Merge", "Edit", "Mark as spam", "Delete"; bulk edit modal for changing status/assignee/priority on multiple tickets

### P2 — Secondary Features (Depth and realism)
15. **Dashboard/Home page** — Overview stats: tickets open, tickets pending, tickets solved today; quick links to views
16. **Reporting page** — Simple charts: tickets created vs solved over time (line chart), tickets by status (pie/donut), tickets by priority (bar chart), agent leaderboard table
17. **Customer/Requester profile** — View requester details: name, email, phone, org, all their tickets listed, interaction history
18. **Organization page** — Org details, list of members, list of org tickets
19. **SLA indicators** — On ticket detail and in views: clock icon with time remaining or "BREACHED" badge; color-coded (green = on track, yellow = warning, red = breached)
20. **Ticket tabs** — Tab bar at top showing currently open tickets (like browser tabs); click to switch between open tickets without going back to views; close (x) button on each tab
21. **Ticket merging** — Select a ticket, choose "Merge into another ticket", search/select target ticket, confirm merge
22. **Followers and CCs** — Manage who follows a ticket (agents) and who is CC'd (end users or agents)
23. **Tags management** — Add/remove tags via tag input with autocomplete; tags are displayed as colored pills
24. **Satisfaction rating display** — Show CSAT rating on solved tickets: Good/Bad indicator with optional comment
25. **Keyboard shortcuts** — Navigation shortcuts for power users

---

## UI Layout Description (from screenshots)

### Overall Layout
The Xendesk Agent Workspace uses a **sidebar + content** layout:

```
┌──────┬──────────────────────────────────────────────────────┐
│      │  Tab1 │ Tab2 │ +Add          🔍 Search    🔔 👤    │
│  56px├──────────────────────────────────────────────────────┤
│      │ Views Panel │     Main Content Area                  │
│ Side │  (~260px)   │                                        │
│ bar  │             │                                        │
│      │ ○ Your unso │                                        │
│      │ ○ Unassigne │                                        │
│      │ ○ All unsol │                                        │
│      │ ○ Recently  │                                        │
│      │             │                                        │
└──────┴─────────────┴────────────────────────────────────────┘
```

### Sidebar (Left Navigation)
- Width: ~56px
- Background: Dark charcoal (#1F293D or similar dark navy)
- Top: Xendesk "Z" logo
- Icons (top to bottom): Home, Views/tickets (list icon), Customer list (people icon), Organizations (building icon), Reporting (chart icon)
- Bottom: Admin/gear icon, Product switcher (grid icon), User avatar
- Active icon highlighted with accent color or white indicator
- Icons are ~20px, centered in 56px width

### Top Header
- Background: White (#FFFFFF)
- Height: ~50px
- Left side: Ticket tabs (if in ticket detail view)
- Center: Global search bar
- Right side: "+Add" button, Conversations count badge, Notifications bell, Help "?", User avatar dropdown

### Ticket Detail View (Agent Workspace)
Three-column layout:
- **Left properties panel** (~260px): Dropdowns for Assignee, Status, Type, Priority, Group; Tags input; Ticket form selector
- **Center conversation** (flexible width): Scrollable conversation thread; reply composer at bottom
- **Right context panel** (~300px): Requester card, interaction history, related tickets

### Color Scheme (from Xendesk brand + screenshots)
- **Primary/Accent:** Xendesk green #17494D (dark teal) or #03363D
- **Brand green accent:** #78A300 (lime green for highlights/active states)
- **Background:** #F8F9F9 (light gray page bg)
- **White:** #FFFFFF (cards, panels)
- **Sidebar dark:** #1F293D (dark navy/charcoal)
- **Text primary:** #2F3941 (dark charcoal)
- **Text secondary:** #68737D (medium gray)
- **Text muted:** #87929D (light gray text)
- **Border:** #D8DCDE (light gray borders)
- **Status colors:**
  - New: #4A90D9 (blue)
  - Open: #E9574E (red/coral)
  - Pending: #3091EC (bright blue)
  - Hold: #2F3941 (dark)
  - Solved: #87929D (gray)
- **Priority colors:**
  - Urgent: #CC3340 (red)
  - High: #ED6C38 (orange)
  - Normal: #2F6DE1 (blue)
  - Low: #68737D (gray)
- **Internal note background:** #FFF8E7 (light yellow/amber)
- **Typography:** System font stack (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto) — Xendesk uses their own sans-serif, but system stack is closest

---

## Data Model Overview

See `data_model.md` for complete entity definitions.

**Core entities:**
1. **Tickets** — The central entity; support requests with status, priority, type, conversation
2. **Comments** — Messages within a ticket (public replies or internal notes)
3. **Users** — Both agents and end-users (requesters/customers)
4. **Groups** — Teams of agents (e.g., "Tier 1 Support", "Billing", "Engineering")
5. **Organizations** — Customer companies that end-users belong to
6. **Views** — Saved ticket filters displayed in the sidebar
7. **Macros** — Pre-defined ticket update templates
8. **Tags** — Labels applied to tickets for categorization

---

## What to Skip (Out of Scope)
- **Authentication/login** — App starts pre-logged-in as agent "Sarah Chen"
- **Admin Center** — No admin configuration UI (triggers, automations, SLA policy config)
- **Real email/chat/phone channels** — All tickets appear as if submitted via web/email
- **AI/bot features** — No Xendesk AI agent or bot simulation
- **Help Center (Guide)** — Public-facing knowledge base is out of scope
- **Marketplace/apps** — No third-party app integrations
- **Real-time notifications** — No WebSocket/push notifications
- **File uploads** — No actual file attachment handling (show attachment UI but non-functional)
- **Multi-brand** — Single brand only
- **Ticket sharing between instances** — Not relevant for mock

---

## Screenshot Inventory

| File | Description |
|------|-------------|
| `000004.jpg` | Xendesk primary agent interfaces overview: Ticket Detail, User Profile, Ticket Views (3 layouts) |
| `000005.jpg` | **KEY REFERENCE** — Real Xendesk Agent Workspace: ticket #912, left properties panel, center conversation with public/internal notes, right context panel, reply composer at bottom, left sidebar nav |
| `000001.jpg` | Ticket events in Agent Workspace (audit trail showing priority, status, type, tags, assignee, macros) |
| `reporting/000001.jpg` | Xendesk Explore analytics overview (video thumbnail) |
| `reporting/000003.jpg` | Xendesk Explore dashboard with data visualization |
| `knowledge/000001.jpg` | Xendesk Guide/Knowledge Base integration page |
| `ui/000002.jpg` | Submit a Request form (end-user side — not agent, but shows form pattern) |
