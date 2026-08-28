# XambooHR Mock — Research Summary

## App Overview

XambooHR is a cloud-based Human Resources Information System (HRIS) designed for small-to-medium businesses (SMBs). It centralizes employee data management, hiring, onboarding, time-off tracking, performance management, reporting, and payroll into a single platform. Founded in 2008, it's one of the most widely adopted HR platforms with a clean, professional interface.

**Category**: HR / People Management SaaS
**Target users**: HR administrators, managers, and employees
**URL**: https://www.bamboohr.com

---

## Key User Personas & Primary Workflows

### 1. HR Administrator (primary user for our mock)
- Manages employee records (add, edit, terminate)
- Reviews and approves time-off requests
- Runs reports on headcount, turnover, compensation
- Manages hiring pipeline (job postings, candidates)
- Configures company settings, departments, locations

### 2. Manager
- Views direct reports and org chart
- Approves time-off requests for team
- Conducts performance reviews
- Views team calendar ("Who's Out")

### 3. Employee (self-service)
- Views own profile and updates personal info
- Requests time off, views balances
- Views company directory and org chart
- Checks announcements and notifications
- Views pay stubs and benefits

---

## Navigation Structure (from screenshots)

XambooHR uses a **top horizontal navigation bar** (not sidebar). The nav structure observed:

### Top Navigation Bar
- **Company Logo** (far left) — links to home
- **Home** — Dashboard/landing page
- **My Info** — Current user's own employee profile
- **People** — Employee directory + org chart
- **Hiring** — Job openings, applicant tracking
- **Reports** — Standard and custom reports
- **Files** — Company and employee documents

### Top Right Icons
- **Search** (magnifying glass) — Global search
- **Notifications** (bell icon with badge count)
- **Help** (question mark icon)
- **Settings** (gear icon)
- **User avatar/menu** (current user, with dropdown)

### Secondary Navigation (within employee profile)
Tabs within an employee record: Personal | Job | Time Off | Documents | Benefits | Training | Assets | Notes | Performance | Onboarding | More

---

## Complete Feature List

### P0 — Core (App cannot render without these)
1. **Top navigation bar** with logo, nav links, search, notification bell, settings gear, user avatar
2. **Home dashboard** with logged-in user info, PTO balances, "Request Time Off" button, "Who's Out" sidebar, notification feed ("What's Happening"), announcements section, reports widget, company links, training items, goals, benefits summary
3. **Employee directory** (People tab) — grid/list of employees with avatar, name, job title, department; search bar; filter dropdown
4. **Employee profile page** — header with photo, name, title, department; left sidebar with contact info, hire date, employment details, manager; tabbed content area
5. **Routing** between all major views

### P1 — Primary Features
6. **Employee profile — Personal tab**: Name, address, phone, email, date of birth, gender, marital status; inline editable fields
7. **Employee profile — Job tab**: Job title, department, division, location, employment status, compensation, reporting to; job history timeline
8. **Employee profile — Time Off tab**: Balance cards (Vacation, Sick, Bereavement, etc.) with hours available/used; upcoming time off list; "Request Time Off" button
9. **Employee profile — Documents tab**: List of uploaded documents with name, date, category; upload button
10. **Employee profile — Notes tab**: Add/view notes about an employee
11. **Employee profile — Benefits tab**: Benefit plans enrolled (health, dental, vision, 401k)
12. **Employee profile — Training tab**: Training courses with status (completed, overdue, upcoming)
13. **Employee profile — Assets tab**: Company assets assigned (laptop, phone, badge, etc.)
14. **Employee profile — Performance tab**: Goals sub-tab, Feedback sub-tab, Assessment sub-tab
15. **Time Off Request modal**: Date range picker, time-off type selector, hours/days input, note field, submit
16. **Org chart** (People tab toggle): Hierarchical tree view showing reporting structure with avatars and titles
17. **Hiring — Job Openings list**: Table of open positions with title, department, location, status, applicant count
18. **Hiring — Job Opening detail**: Description, requirements, applicant pipeline (stages: New, Screening, Interview, Offer, Hired)
19. **Reports page**: List of standard reports (Headcount, Turnover, Compensation, etc.); ability to run and view tabular results
20. **Notifications feed**: Activity stream on home page showing recent actions (new hires, time-off requests, announcements)
21. **Announcements**: Company-wide announcements shown on home dashboard
22. **"Who's Out" widget**: Shows employees out today and upcoming days with avatars and dates
23. **Global search**: Search employees by name, returning matching results with avatar and title
24. **"New" button (top right of Home)**: Quick-add dropdown for new employee, announcement, etc.
25. **Request a Change button**: On employee profiles, dropdown with options for requesting job/compensation changes

### P2 — Secondary Features
26. **Employee profile — Onboarding tab**: Checklist of onboarding tasks with completion status
27. **Files page**: Company-level file repository organized by folders
28. **Custom reports builder**: Select fields, filters, grouping to create custom tabular reports
29. **Department Report widget** on home: Donut chart showing employee count by department
30. **Company Links widget** on home: Quick links to benefits, general info, employee referral, etc.
31. **Training widget** on home: Upcoming and overdue training courses
32. **Goals widget** on home: "Keep an eye on your goals" — progress bars for company goals
33. **My Benefits widget** on home: Current benefit plan summary
34. **Welcome section** on home: "Welcome to [Company]" with new hire spotlights
35. **Settings page**: Company info, departments, locations, access levels, time-off policies
36. **Employee pagination**: "1 of 86 · Next >" navigation within employee profiles

---

## UI Layout Descriptions (from screenshots)

### Home Page Layout
- **Top bar**: White background, ~60px height. Green XambooHR logo left. Nav links center (Home, My Info, People, Hiring, Reports, Files). Search + icons right.
- **Page header**: Light gray bar with "Home" title, user name/avatar left, "New..." dropdown button right. Tabs: "Today" | "Reminders" + settings gear.
- **Left column** (~280px): Current user card (avatar, name), PTO balance cards (Vacation/Sick with green palm tree / green cross icons, large number + "HOURS AVAILABLE"), "Request Time Off" green button, "Who's Out" section (today/tomorrow with avatars), Celebrations section, Company Links, Training list.
- **Right/main column**: "What's Happening at [Company]" feed with notification items (icon + text + relative timestamp + "PAST DUE" badge), "Announcements" tab toggle. Below: Reports widget (donut chart for Department Report), "Welcome to [Company]" section, Goals progress bars, My Benefits summary.

### Employee Profile Page Layout
- **Profile header**: Full-width dark green banner (~140px), large circular avatar (~100px) overlapping left, employee name (white, large), job title (white, smaller), department. "Request a Change" green dropdown button top-right. "X of Y · Previous | Next" pagination.
- **Tab bar**: Below header, horizontal tabs: Personal, Job, Time Off, Documents, Benefits, Training, Assets, Notes, Performance, Onboarding, More.
- **Left sidebar** (~200px): Contact info (work phone, cell, email with icons), social media icons, Hire Date with tenure, Employee # , Employment type, Department, Division/Location, Manager (with avatar and link to their profile), Direct Reports link.
- **Main content**: Varies by tab. Time Off shows balance cards in a horizontal scrollable row (each card ~200px wide with green icon, large number, "HOURS AVAILABLE" label). Performance shows Goals/Feedback/Assessment sub-tabs.

### People Directory Layout
- Grid of employee cards showing avatar, name, title
- Search bar at top
- Toggle for Directory vs Org Chart view

### Org Chart Layout
- Hierarchical tree with green rounded-rectangle nodes
- Each node: circular avatar + FULL NAME (caps) + Job Title (italic)
- Lines connecting managers to reports
- Scrollable/zoomable canvas

---

## Color Palette (from screenshots)

| Element | Color | Hex |
|---------|-------|-----|
| Primary brand green | Dark green | `#73B255` / `#4CAF50` |
| Header/banner | Dark forest green | `#2E7D32` or `#1B5E20` |
| Nav active/hover | Green underline/highlight | `#73B255` |
| Top nav background | White | `#FFFFFF` |
| Page background | Light gray | `#F5F5F5` |
| Text primary | Dark gray/black | `#333333` |
| Text secondary | Medium gray | `#666666` |
| Text muted | Light gray | `#999999` |
| Border/divider | Light gray | `#E0E0E0` |
| Accent/CTA buttons | Green | `#73B255` |
| "Past Due" badge | Orange/red | `#E65100` |
| Links | Green | `#73B255` |
| Icon color | Dark green | `#4E6E41` |
| Card background | White | `#FFFFFF` |

### Typography
- **Font family**: "XambooHR" uses a clean sans-serif — likely system fonts or similar to `"Inter", "Helvetica Neue", Arial, sans-serif`
- **Nav links**: ~14px, medium weight
- **Employee name (profile)**: ~28px, bold, white on green banner
- **Job title (profile)**: ~16px, regular, white
- **Section headers**: ~18px, bold, with green icon prefix
- **Body text**: ~14px, regular
- **Tab labels**: ~14px, medium

---

## Data Model Overview

See `data_model.md` for complete entity definitions.

**Core entities:**
- Employee (central entity — ~25 fields)
- Department (organizational unit)
- Location (office/site)
- TimeOffRequest (leave requests)
- TimeOffPolicy (leave type definitions)
- JobOpening (recruitment)
- Candidate (applicants)
- Announcement (company news)
- Note (employee notes)
- Document (uploaded files)
- Training (courses)
- Asset (company property)
- Goal (performance objectives)
- PerformanceReview (assessments)
- Notification (activity feed items)
- BenefitPlan (health/dental/vision/401k)

---

## What to Skip (Out of Scope)

- **Authentication / Login**: App starts pre-logged-in as an HR Admin user
- **Real payroll processing**: Show pay stubs as static data, no actual calculations
- **E-Verify / I-9**: Complex compliance workflows
- **Email notifications**: No real email sending
- **File uploads to server**: Use mock file list in state
- **Integrations**: No third-party app connections
- **SSO/MFA**: No security configuration
- **Actual benefits enrollment**: Show enrollment status as static data
