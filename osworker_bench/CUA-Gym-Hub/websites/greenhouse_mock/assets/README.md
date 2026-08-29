# Xreenhouse Recruiting Mock — Research Summary

## App Overview

**Xreenhouse** is a leading Applicant Tracking System (ATS) and recruiting platform used by mid-market and enterprise companies. It provides structured hiring workflows, candidate pipeline management, interview scheduling, scorecard-based evaluations, offer management, and recruiting analytics. Xreenhouse is known for its emphasis on structured, bias-reducing hiring practices.

**URL:** https://www.greenhouse.com
**Category:** HR Tech / Recruiting / ATS
**Target Users:** Recruiters, Hiring Managers, Interviewers, HR Admins

## Key User Personas & Primary Workflows

### Recruiter (Primary User — "Jules")
- Reviews incoming applications from the dashboard
- Moves candidates through pipeline stages (Application Review → Phone Screen → Onsite → Offer)
- Schedules interviews, assigns interviewers
- Fills out and reviews scorecards
- Creates and manages job postings
- Runs pipeline health reports
- Manages offers and approval workflows

### Hiring Manager
- Reviews candidates for their open roles
- Submits scorecards after interviews
- Approves/rejects candidates at decision stages
- Reviews hiring reports and pipeline progress

### Interviewer
- Receives interview assignments
- Fills out structured scorecards (rating candidates on specific attributes)
- Views candidate profiles and resumes before interviews

## UI Layout (from Screenshots)

### Color Palette
- **Primary dark green (top bar):** `#1B3A2D` (very dark green, almost black-green)
- **Accent teal/green:** `#2D9D78` (medium green for buttons, links, active states)
- **Background:** `#F5F5F5` (light gray)
- **Card/panel background:** `#FFFFFF`
- **Text primary:** `#1A1A1A` (near-black)
- **Text secondary:** `#6B7280` (gray-500)
- **Border color:** `#E5E7EB` (gray-200)
- **Red (action needed):** `#DC2626`
- **Yellow (scorecard pending):** `#F59E0B`
- **Teal accent button:** `#2D9D78`
- **Logo/brand green:** `#3BB893`

### Typography
- Clean sans-serif (Inter or similar system font stack)
- Navigation tabs: 14px medium weight
- Dashboard card headers: 16px semibold
- Body text: 14px regular
- Small labels: 12px

### Top Navigation Bar
- Dark green bar (`#1B3A2D`) spanning full width
- Left: Xreenhouse "g" logo + "Recruiting" text
- Center/Left tabs: **Job dashboard**, **Sourcing**, **Candidates**, **CRM**, **Reports**, **Integrations**, **Job setup**
- Right: Search icon, settings/gear icon, notifications icon, "Hi Jules" + user avatar

### Dashboard (Job Dashboard)
Main content area below nav, light gray background with card widgets:
1. **Applications over time** — line chart (teal line with dots), 3-month range, Y-axis 0-25
2. **Pipeline** — horizontal bar chart showing candidate counts per stage (201, 165, 65, 12, -, 15, 160)
3. **Candidate source breakdown & quality** — bubble/dot chart with a donut chart
4. **Prospecting** — card showing "Current prospects: 12" with green "Find prospects" button
5. **Candidates I'm following** — table with Name, Department, Office, Status columns
6. **Helpful links** — links to help center and in-house contacts
7. **My tasks** panel (overlay/sidebar) — tabs "My tasks" / "All tasks", listing: Application Review, Phone Screen, Needs Decision, Forms to Send, Scorecards Due (each with green dot indicator)

### Interview Scorecard
- Dark green header bar with "Interview Scorecard" title
- Candidate photo + name (e.g., "Lauren Newman")
- "Soft skills" category heading
- Rating rows: each has a skill name (gray bar), 4 radio-button-style dots, and a verdict icon (thumbs up green, thumbs down red, star gold, thumbs up teal)
- Rating scale appears to be a 4-point scale with icons

### Reports Page
- Dark green header bar with "Reports" title
- Breadcrumb: "All Reports > Pipeline History and Pass-through Rates"
- Title + action buttons: Save, Schedule, Share, Download, Help
- Collapsible "Filters and more" section: Rows dropdown (Stage), Job Filter ("For 201 Open Jobs" + Change Filter button), Group of Candidates dropdown, Include Migrated Candidates checkbox
- Apply button (teal)

### Job Pipeline View (Visual Candidate Pipeline)
- Kanban-style columns, one per interview stage
- Each column shows up to 10 candidate cards
- Cards are color-coded: Red = needs action, Yellow = needs scorecard, Gray = no action needed
- Card info: candidate name, days in stage, referral/internal indicators
- Drag-and-drop to move candidates between stages
- Sortable by Priority, Time in Stage, Name, Last Activity, Date Applied

### Candidate Profile Page
- **Header:** candidate name, pronouns, contact info, timezone, action buttons (email, transfer, update status)
- **Main panel:** Stages (expandable), Scorecards, Offer Details, Activity Feed
- **Right panel (tabbed):** Candidate Details, Application Details, All Jobs, Notes, Tasks & Reminders
- Keyboard shortcuts: R (resume), X (reject), M (move stages)

## Complete Feature List

### P0 — Core Shell
1. App frame with dark green top navigation bar
2. Navigation tabs (Job Dashboard, Candidates, Jobs, Reports, Job Setup)
3. Routing between main views
4. State management (React Context + dataManager)
5. `/go` endpoint for state inspection
6. Session isolation API

### P1 — Primary Features
1. **Dashboard** — widgets for applications chart, pipeline summary, tasks, candidates following, prospecting
2. **All Jobs view** — searchable/filterable table of all open jobs with department, office, status, candidate count
3. **Job detail page** — overview, pipeline/kanban view, candidate list, job setup tabs
4. **Visual candidate pipeline** — kanban board per job with drag-and-drop, color-coded cards
5. **Candidate list** — searchable table with name, job, stage, status, source
6. **Candidate profile** — header info, stage progression, scorecards, activity feed, notes, details tabs
7. **Scorecard submission** — structured rating form with attributes, overall recommendation (Strong Yes / Yes / No Opinion / No / Strong No)
8. **Create/edit job** — job details form, department, office, hiring team, job stages
9. **Interview scheduling** — schedule interviews for candidates at specific stages
10. **Move candidate through stages** — advance/reject candidates in pipeline
11. **Add candidate** — form to manually add a candidate to a job
12. **Search** — global search across candidates, jobs

### P2 — Secondary Features
1. **Reports dashboard** — Offers & Hires, Recruiting Efficiency, Sourcing, Pipeline Health, Goals widgets
2. **Pipeline report** — filterable pipeline history and pass-through rates
3. **Offer management** — create/send offers with approval workflow
4. **Job posting** — create/edit public job posts
5. **Candidate notes** — add/edit/pin notes with mentions
6. **Email templates** — compose emails to candidates from templates
7. **Candidate tags** — add/remove tags for organization
8. **Rejection workflow** — reject with reason, send rejection email
9. **Activity feed** — chronological activity log on candidate profiles
10. **My tasks panel** — task list sidebar (Application Review, Phone Screen, Scorecards Due, etc.)

## Data Model Overview

See `data_model.md` for full entity specifications.

**Core entities:** Users, Jobs, Candidates, Applications, JobStages, Scorecards, Interviews, Offers, Departments, Offices, Sources, Notes, Tags, Notifications

## Out of Scope
- Authentication/login (app starts pre-logged-in as recruiter "Jules Park")
- Real email sending
- Real calendar integration
- File uploads to server
- AI-powered features (job description generator, etc.)
- Onboarding module (separate Xreenhouse product)
- CRM/prospect nurturing campaigns
- Third-party integrations
