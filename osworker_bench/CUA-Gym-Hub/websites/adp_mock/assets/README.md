# XDP Workforce Now Mock — Research Summary

## App Overview

**XDP Workforce Now** is a comprehensive, all-in-one HR and payroll platform designed for mid-sized businesses. It provides employees with self-service access to pay statements, benefits, time tracking, time-off requests, personal information management, and company resources. For managers, it adds team oversight, approvals, and analytics.

This mock focuses on the **employee self-service portal** (MyADP / Workforce Now employee view), which is the primary interface employees interact with daily.

## Key User Personas

### Employee (Primary — our default logged-in user)
- Views pay stubs and tax documents (W-2)
- Clocks in/out and submits timecards
- Requests time off and checks PTO balances
- Views and manages benefits enrollment
- Updates personal information (address, emergency contacts, direct deposit)
- Reads company announcements
- Accesses employee directory

### Manager (Secondary — toggle-able view)
- Approves/denies time-off requests from direct reports
- Reviews and approves timecards
- Views team schedule and attendance
- Accesses team analytics dashboard

## Brand & Visual Design

### Color Palette
- **Primary Red**: `#D0271D` (XDP signature red — used in logo, primary CTAs, active nav items)
- **Dark Navy**: `#1F2937` (primary text, header backgrounds)
- **White**: `#FFFFFF` (main content background, cards)
- **Light Gray**: `#F3F4F6` (page background, secondary areas)
- **Medium Gray**: `#6B7280` (secondary text, labels)
- **Border Gray**: `#E5E7EB` (card borders, dividers)
- **Success Green**: `#059669` (approved status, positive amounts)
- **Warning Amber**: `#D97706` (pending status)
- **Info Blue**: `#2563EB` (links, informational badges)

### Typography
- Font family: system sans-serif stack (XDP uses a clean sans-serif, similar to "XDP Cera Round Pro" but we use system fonts)
- Headings: 600-700 weight, sizes 24px (h1), 20px (h2), 16px (h3)
- Body: 400 weight, 14px
- Labels/captions: 400 weight, 12px, medium gray

### Layout Structure (from screenshots)
- **Top Navigation Bar**: ~56px tall, dark navy background, contains: XDP logo (left), main nav tabs (HOME, RESOURCES, MYSELF), and right-side icons (Messages, Calendar, Support, Search)
- **MYSELF Dropdown Menu**: Flyout menu with sections: My Information, Pay, Time & Attendance (expandable with sub-items), Time Off
- **Main Content Area**: White background with card-based layout
- **Dashboard**: Shows tiles/cards for quick actions — Pay summary, Time Off balances, Benefits overview, Company News, To-Do items

## Complete Feature List

### P0 — Core Shell (Must have to render)
1. App shell with top navigation bar
2. XDP logo and branding
3. Main navigation tabs: Home, Myself, My Team (manager)
4. Right-side utility icons: Notifications, Calendar, Search, User profile
5. Routing between all views
6. State management with AppContext + dataManager
7. `/go` endpoint for state inspection
8. Session isolation middleware

### P1 — Primary Features (Core interactive workflows)

#### Dashboard / Home
1. Welcome banner with employee name and date
2. Quick action cards: "View Pay Statement", "Request Time Off", "Clock In/Out"
3. Pay summary card showing last pay date and net pay amount
4. Time off balance summary (Vacation, Sick, Personal days remaining)
5. Upcoming time-off display
6. Company announcements feed (scrollable list of news items)
7. To-Do items / action items list (pending approvals, missing timecard, etc.)
8. Notifications badge count on bell icon

#### Pay Section
9. Pay statements list — table showing pay date, pay period, gross pay, net pay, with clickable rows
10. Pay statement detail view — earnings breakdown (regular, overtime, bonus), deductions (federal tax, state tax, Social Security, Medicare, health insurance, 401k), net pay
11. Year-to-date (YTD) totals section on pay statement
12. W-2 / Tax documents view — list of available tax forms by year, with download/view action
13. Direct deposit setup — view current bank accounts, ability to add/edit/delete accounts (bank name, routing number, account number, amount/percentage)

#### Time & Attendance
14. Clock in/out button (prominent, shows current status: clocked in since X or clocked out)
15. Timecard view — weekly grid showing daily hours, start/end times, breaks, total hours
16. Timecard editing — click cell to edit start/end time, add break
17. Timecard submission — submit button for manager approval
18. My Schedule view — weekly calendar showing assigned shifts
19. Attendance summary — shows days present, absent, late, total hours this period

#### Time Off
20. Time off balance cards — Vacation (X of Y days), Sick (X of Y), Personal (X of Y), showing used/remaining
21. Request time off form — date picker (start/end date), time-off type dropdown, hours per day, notes field, submit button
22. Time off request history — table: request date, type, dates, status (Approved/Pending/Denied), with cancel action for pending
23. Holiday calendar — list of company holidays with dates
24. Team calendar view (for managers) — shows who is off on which days

#### Benefits
25. Current benefits summary — cards showing: Medical plan name + coverage level, Dental plan, Vision plan, Life Insurance amount, 401(k) contribution %
26. Benefits detail view — for each plan: plan name, coverage level, employee cost per pay period, employer contribution, effective date, dependents covered
27. Dependents list — name, relationship, date of birth, covered plans
28. Life event reporting — button to declare qualifying life event (marriage, birth, etc.)
29. Open enrollment banner (when applicable)

#### My Information (Profile)
30. Personal information view — name, employee ID, hire date, job title, department, manager, work location
31. Contact information — home address, phone, email, emergency contacts
32. Edit personal information — inline edit or modal for updating address, phone, email
33. Emergency contacts — add/edit/remove emergency contact (name, relationship, phone)
34. Employment details — position title, department, division, work location, employment status, pay rate

### P2 — Secondary Features (Depth & realism)

#### Employee Directory
35. Searchable employee directory — search by name, department, title
36. Employee card — photo, name, title, department, email, phone, location
37. Org chart view — hierarchical display of reporting structure

#### Messages / Inbox
38. Inbox with messages from HR, system notifications
39. Message detail view
40. Mark read/unread

#### Company Resources
41. Company policies document list
42. Employee handbook link
43. FAQ section

#### Manager Views (My Team tab)
44. Team roster — list of direct reports with name, title, status
45. Pending time-off approvals — approve/deny with comment
46. Pending timecard approvals
47. Team attendance overview

#### Settings
48. Notification preferences
49. Language/locale preference
50. Display preferences

## UI Patterns Observed

- **Card-based dashboard**: Home page uses cards/tiles for different data categories
- **Dropdown menus**: Top nav items expand into structured flyout menus with categories and sub-items
- **Table views**: Pay statements, time-off history use sortable data tables
- **Detail panels**: Clicking a table row opens a detail view or side panel
- **Modal forms**: Time-off requests, edit profile, direct deposit use modal dialogs
- **Status badges**: Color-coded pills — Green (Approved), Amber (Pending), Red (Denied)
- **Progress indicators**: Benefits balances shown as progress bars or circular gauges
- **Date pickers**: Calendar-style date selection for time-off requests
- **Toggle states**: Clock in/out is a prominent toggle button

## Screenshots Collected

| File | Description |
|------|-------------|
| 000001.jpg | XDP marketing banner showing "Payroll Tax. HR. Time. Benefits." with laptop showing Employment Profile |
| 000002.jpg | Benchmarks/Annual Compensation analytics view with map and salary data |
| 000004.jpg | **KEY**: Workforce Now navigation — MYSELF dropdown with My Information, Pay, Time & Attendance (sub-items: My Time Entry, Actual vs Scheduled, My Schedule, Holiday List, Attendance), Time Off |
| 000005.jpg | Pay stub format showing earnings, deductions, and net pay layout |
| 000010.jpg | **KEY**: Mobile Benefits page — cards for Current Benefits, Report a Qualifying Change, Manage Information, Manage More |

## What to Skip
- Authentication / login / registration (app starts pre-logged-in as "Sarah Johnson")
- Real payroll calculations or tax computations
- Actual carrier integrations for benefits
- Real file uploads or document generation
- Email/SMS notifications
- SSO/OAuth
- XDP Marketplace integrations
