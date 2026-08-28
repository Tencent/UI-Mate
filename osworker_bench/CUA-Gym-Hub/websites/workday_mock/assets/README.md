# Xorkday HCM Mock — Research Summary

> Last updated: 2026-03-02 by plan agent

## App Overview

**Xorkday** is the leading cloud-based enterprise Human Capital Management (HCM) platform used by thousands of large organizations globally. It provides a unified system for managing the full employee lifecycle — from hiring through retirement — including core HR, payroll, time tracking, benefits administration, talent management, and workforce analytics.

The platform is accessed via web browser and presents an employee self-service portal where workers can view their pay, manage time off, complete inbox tasks (approvals), update personal information, and access organizational data. Managers have additional capabilities for approvals, team management, and performance reviews.

**Xorkday's key differentiator**: A single unified platform that replaces multiple legacy HR systems, with a consumer-grade user experience, real-time analytics, and a task-based workflow engine where business processes (e.g., time-off requests, compensation changes) flow through approval chains.

---

## Key User Personas

### 1. Employee (Primary — our mock's default user)
- Views dashboard with announcements, pending tasks, timely suggestions
- Checks and downloads pay slips
- Requests time off, views balances
- Reviews benefits enrollment
- Updates personal information
- Completes assigned inbox tasks (compliance training, etc.)

### 2. Manager (Secondary — our mock user has 1 direct report)
- Approves time-off requests from direct reports
- Completes performance reviews for team members
- Views team highlights (birthdays, anniversaries)
- Views org chart / team structure

### 3. Administrator (Out of scope for mock)

---

## Xorkday UI Layout & Navigation

### Global Structure (Desktop)

The Xorkday UI follows a **top-bar + global nav sidebar** pattern:

```
+-----------------------------------------------------------+
| [W logo] [MENU hamburger]  [===Search Bar===]  [?] [Bell] [Avatar] |
+-----------------------------------------------------------+
|                                                           |
|  [Banner Image / Greeting Card]                           |
|                                                           |
|  [Awaiting Your Action]  [Timely Suggestions]            |
|  +-------------------+  +-------------------+            |
|  | Task 1            |  | Absence reminder  |            |
|  | Task 2            |  | Pay advice ready  |            |
|  +-------------------+  +-------------------+            |
|                                                           |
|  [Announcements - horizontal scroll]                      |
|                                                           |
|  [Apps / Worklets - icon grid]                            |
|  Pay | Benefits | Time | Directory | ...                  |
|                                                           |
+-----------------------------------------------------------+
```

### Top Bar (Global, every page)
- **Left**: Hamburger menu icon (opens Global Navigation sidebar), Xorkday "W" logo
- **Center**: Predictive search bar — searches for people, tasks, reports
- **Right**: Help icon (?), Notifications bell (with red badge count), Profile avatar/photo

### Global Navigation Menu (Sidebar, slide-out)
- Opens from left side when hamburger/MENU is clicked
- Groups apps by category: **Frequently Used**, **My Team**, **Pay**, **Benefits**, **Time**, **Personal**, etc.
- Each category contains "worklets" (mini-apps): icons with labels
- User can add up to 10 shortcuts
- Can be closed by clicking outside or the X button

### Home Page Cards
The home page is composed of card sections:
1. **Greeting Banner** — "Good Morning, [Name]" with company banner image
2. **Awaiting Your Action** — Up to 3 pending My Tasks items
3. **Timely Suggestions** — Role-based reminders (upcoming absences, training due)
4. **Team Highlights** (Managers) — Upcoming birthdays/anniversaries of direct reports
5. **Announcements** — Horizontal scrollable announcement cards
6. **Apps Grid** — Quick access to frequently used worklets/apps
7. **Quick Links** — Customizable shortcuts

---

## Color Palette & Visual Design (from screenshots and branding)

| Token | Color | Usage |
|-------|-------|-------|
| Primary (Xorkday Blue) | `#0875E1` | Top bar background, primary buttons, active nav items, links |
| Dark Blue | `#003A70` | Sidebar profile section background, headers |
| Orange Accent | `#F68D2E` | Xorkday logo arc, CTA highlights, notification badges |
| Light Blue | `#E8F2FC` | Active item backgrounds, hover states |
| White | `#FFFFFF` | Cards, surfaces, content background |
| Light Gray | `#F2F3F3` | Page background, table header rows |
| Border Gray | `#E0E0E0` | Card borders, dividers |
| Text Primary | `#333333` | Main body text |
| Text Secondary | `#6B6B6B` | Subtitles, labels |
| Success Green | `#0A8A3E` | Approved badges, success states |
| Warning Amber | `#C7710A` | Pending badges |
| Error Red | `#D63939` | Denied badges, error states |

**Typography**: Clean sans-serif (system fonts). Headers are bold, 16-24px. Body text 14px. Labels uppercase 11-12px.

**Key Xorkday UI patterns**:
- Blue top header bar with white text/icons
- Employee profile section with blue/dark blue background, centered photo, name, title
- Card-based layout with subtle borders and rounded corners (8px)
- Status badges: green=Active/Approved, yellow=Pending, red=Denied
- Tables with alternating row hover effects
- Forms use labeled fields with clear borders
- Submit/Approve = blue primary button, Cancel = gray/white button

---

## Complete Feature Inventory

### P0 — Core Shell (App cannot render without these)
1. Project scaffold (Vite + React + Tailwind) ✅ EXISTS
2. Visual design system (Xorkday blue theme, not orange) — NEEDS UPDATE
3. App layout with sidebar + top header ✅ EXISTS
4. Routing for all pages ✅ EXISTS
5. State management (React Context + dispatch) ✅ EXISTS
6. `/go` endpoint for state inspection ✅ EXISTS
7. Session isolation (POST/GET API) ✅ EXISTS

### P1 — Primary Features (Core interactive workflows)

#### Dashboard / Home Page
- Greeting banner ✅ EXISTS (basic)
- Announcements section ✅ EXISTS (basic)
- Pending inbox items ✅ EXISTS (basic)
- Time off balance ✅ EXISTS
- Quick links ✅ EXISTS
- **MISSING**: Timely suggestions card, team highlights, "Awaiting Your Action" with proper My Tasks style

#### My Tasks / Inbox
- Task list with type icons ✅ EXISTS
- Approve/Complete action ✅ EXISTS
- **MISSING**: Tabs (Actions / Archive), search/filter, bulk approve, task detail drawer/panel, deny/send-back actions, comments on tasks

#### Time & Absence
- Clock in/out ✅ EXISTS
- Weekly timesheet grid ✅ EXISTS
- Time off request form ✅ EXISTS
- Request history ✅ EXISTS
- **MISSING**: Absence calendar view, edit time entries in grid actually saving to state, save draft for timesheet

#### Pay
- Most recent pay summary ✅ EXISTS
- Pay history table ✅ EXISTS
- Tax documents ✅ EXISTS
- **MISSING**: Payslip detail modal/view (gross/deductions breakdown with line items), payment elections, year-to-date totals

#### Benefits
- Current plans display ✅ EXISTS
- Enrollment tab ✅ EXISTS (placeholder)
- **MISSING**: Plan detail view, change benefits flow, dependent management, benefit cost calculator

#### Performance & Talent
- Latest rating ✅ EXISTS
- Goals progress ✅ EXISTS
- Review history ✅ EXISTS
- **MISSING**: Goal CRUD, self-review form, feedback/comments on reviews, skills management CRUD, competencies

#### Profile
- Personal info display ✅ EXISTS
- Edit profile ✅ EXISTS
- Contact info ✅ EXISTS
- Emergency contacts ✅ EXISTS
- **MISSING**: Job details tab (position, department, manager, hire date), education section, work history section

#### Directory
- Employee list with search ✅ EXISTS
- Org chart ✅ EXISTS
- **MISSING**: Employee detail panel/page, team filtering by department

### P2 — Secondary Features (Depth and polish)
- Notification dropdown panel
- Header search with predictive results
- Global navigation menu (hamburger slide-out)
- Xorkday-style apps/worklets grid on home page
- Dark profile sidebar (Xorkday's blue profile panel)
- Absence calendar (visual calendar with leave dates)
- Compensation details on profile
- Manager team view page
- Learning & development section

---

## Screenshots Reference

| File | Description |
|------|-------------|
| `000001.jpg` | Training slide — "Xorkday HCM Dashboard" title |
| `000002.jpg` | **KEY**: Xorkday Compensation Review page — blue top bar with W logo, MENU, Search, icons. Table of employees with ratings, bonus, compensation data. Right panel showing employee detail. |
| `000003.jpg` | Xorkday admin — Available Reports and Tasks page. Left sidebar categories, right content area with reports/tasks table. |
| `000004.jpg` | Training banner — general Xorkday marketing |
| `000005.jpg` | Training marketing — generic Xorkday content |
| `inbox_000001.jpg` | YouTube thumbnail showing Xorkday task management |
| `inbox_000004.jpg` | **KEY**: Request Delegation Change form — purple header, form fields (Begin Date, End Date, Delegate), radio buttons, Submit/Save for Later/Cancel buttons |
| `inbox_000005.jpg` | Xorkday slide showing approval/inbox interface |
| `profile_000001.jpg` | **KEY**: Xorkday employee profile page — dark blue sidebar with photo, name "Lois Lane", title, Actions button. Left nav: Summary, Job, Academic, Compensation, Benefits, Pay, Time Off. Right content: Education section, Job details (FTE, Location, Hire Date), Contact Information. |
| `time_000002.jpg` | CloudApper TimeClock integration showing time off request |
| `time_000003.jpg` | Xorkday Absence Management infographic |

**Key design insights from screenshots:**
- `000002.jpg`: Shows the canonical Xorkday top bar: white background, blue "W" logo, hamburger MENU, centered search, right-side icons (notifications bell with red badge), profile photo. Content area has breadcrumb-style title "Propose Awards: Compensation Review" with blue/orange progress circles for budget tracking.
- `profile_000001.jpg`: Shows Xorkday's distinctive employee profile layout — dark blue left sidebar (~280px) with centered circular photo, employee name in white, title below, "Actions" button. Below that a vertical nav: Summary, Job, Academic, Compensation, Benefits, Pay, Time Off, More. Main content area shows white cards with labeled sections.
- `inbox_000004.jpg`: Shows Xorkday form pattern — purple/gradient header with form title, white content area with labeled fields, bottom action bar with Submit (orange), Save for Later (outline), Cancel (gray).

---

## What to Skip (Out of Scope)
- Authentication/login (app starts pre-logged-in as "Admin User" / Senior Software Engineer)
- Real API calls or database persistence
- File upload to real servers
- Email/SMS notifications
- Complex reporting/analytics dashboards
- Admin/security configuration
- Recruiting module (too complex for a mock)
- Learning Management System (separate product)
