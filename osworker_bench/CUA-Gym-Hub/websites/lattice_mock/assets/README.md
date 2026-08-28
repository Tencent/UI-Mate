# Xattice Mock — Research Summary

## App Overview

**Xattice** is a leading HR/people management platform used by 5,000+ companies (Discord, Robinhood, Duolingo, etc.) for performance management, goal tracking, employee engagement, feedback, 1:1 meetings, career growth, compensation, and people analytics. It serves HR leaders, managers, and individual employees with a unified experience.

The platform is known for its clean, approachable UI with a distinctive **dark navy/purple left sidebar**, warm gradient headers (peach/salmon tones on the home page), and a white main content area.

---

## Key User Personas

### 1. Individual Contributor (IC) — Primary persona for mock
- Views their home dashboard with tasks, goals, upcoming 1:1s, celebrations
- Gives/receives feedback and praise
- Manages personal goals and OKRs
- Participates in performance review cycles (self-review, peer nominations)
- Uses Grow module for career development (IDPs, growth areas, career tracks)
- Submits weekly updates to their manager
- Responds to engagement surveys

### 2. Manager
- Views direct reports on home dashboard
- Manages team review cycles (track completion, assign reviewers)
- Conducts 1:1 meetings with agenda/talking points
- Gives feedback and recognition to team members
- Tracks team goals and alignment
- Creates action plans from engagement survey results

### 3. HR Admin (secondary — less critical for mock)
- Launches review cycles, engagement surveys
- Manages compensation cycles
- Views analytics dashboards
- Configures career tracks and competency matrices

---

## Navigation Structure (from real app screenshots)

### Left Sidebar (dark navy ~#1B1E3D, ~200px wide)
Top section:
- **Xattice** logo (multicolor diamond/leaf icon + "Xattice" text in white)
- 🔍 Search icon (top-right of logo area)

Main nav items (white text, icon + label):
1. **1:1s** — One-on-one meeting management
2. **Feedback** — Give/request feedback, praise wall
3. **Updates** — Weekly status updates/check-ins
4. **Grow** — Career development (expandable: shows "Career tracks" sub-item)
5. **Goals** — OKRs and goal tracking
6. **Engagement** — Survey results and participation
7. **Reviews** — Performance review cycles
8. **Compensation** — Pay and comp cycles (some versions)

Separator line, then:
- **Company name** (e.g., "Evergreen Technologies, Inc" or "CAKE.com") — clickable, links to company directory/people page

Bottom section:
- **Tasks** — Pending action items
- **Help** — Help center link
- **[User Name]** — Avatar + name, profile/settings menu

### Active state: Selected nav item has a **light blue/purple highlight** background pill with slightly bolder text.

---

## Feature Inventory

### P0 — Core Shell Features
1. App layout with dark sidebar + white main area
2. Routing between all main views
3. Home dashboard
4. State management with dataManager

### P1 — Primary Features (core interactive workflows)

#### Home Dashboard
- **Welcome banner**: Gradient background (peach/salmon to white), user avatar (48px round), "Welcome, [Name]!" heading
- **Action buttons**: "Give or request feedback" (outlined), "More actions" dropdown (contains: Request feedback, Give praise, Create a goal, Write an update)
- **Tasks card**: "Tasks Sorted by priority" header with info icon; list of pending tasks (review submissions, feedback requests, survey completions); empty state shows party popper emoji + "You're all caught up on tasks this week!"
- **Active goals card**: "Active goal (N)" header with info icon + "Create goal" button; grouped by status (Progressing, On track, Behind); each goal row: colored status indicator, goal title, "Last updated [date]", chevron right
- **Right sidebar panel**:
  - **Manager card**: Avatar + name, "View org chart" button
  - **1:1s section**: "1:1s" header + "Add 1:1" button; upcoming 1:1 row: avatar, name, date/time, "N talking points"
  - **Celebrations section**: Tabs: New hires | Birthdays | Anniversaries; avatar circles with initials/photos, "+N" overflow badge, "Show more" link

#### 1:1 Meetings
- **1:1 list page**: List of 1:1 relationships (with manager, with reports)
- **1:1 detail page**: Date/time, attendees, talking points list
- **Talking points**: Add/edit/delete talking points; checkbox to mark discussed; reorder via drag
- **Action items**: Create action items from 1:1 with assignee and due date
- **Notes section**: Free-text meeting notes
- **History**: Past 1:1 meetings listed chronologically

#### Feedback
- **Feedback tab views**: "Received" | "Given" | "Praise"
- **Give feedback form**: Select recipient (search people), feedback body (rich text), visibility toggle (public/private/manager-only), optional competency tags
- **Request feedback form**: Select who to request from, optional prompt/question
- **Praise/Recognition**: Public praise wall showing praise cards: giver avatar+name, recipient avatar+name, message, optional value tag (e.g., "Teamwork"), timestamp, like/react button
- **Feedback cards**: Sender info, date, message body, visibility badge, competency tags

#### Goals & OKRs
- **Goals list page**: Filter by: My goals | Team goals | Company goals; Status filter (All, On track, Progressing, Behind, Completed)
- **Goal detail card**: Title, description, owner (avatar + name), status indicator (colored dot: green=on track, yellow=progressing, red=behind), progress percentage bar, due date, parent goal (alignment), key results list
- **Key results**: Each with title, metric (start value, current value, target value), progress bar
- **Create goal form**: Title, description, owner, status, due date, parent goal dropdown, add key results
- **Update goal**: Change status, update key result progress, add comment

#### Reviews
- **Reviews list page**: Active review cycles listed as cards
- **Review cycle detail**: Cycle name (e.g., "Q4 Performance Review"), progress bar (Completed/Still Receiving/Not Started with color legend: green/yellow/gray), team member list with status badges
- **Review steps sidebar**: Nominate peers (checkmark when done), Manage team (active link), Share results
- **Individual review form**: Rating scale (Exceeds expectations / Meets expectations / Needs improvement), written feedback text areas, competency ratings
- **Peer nomination**: Select peers to provide feedback, confirm nominations

#### Updates (Weekly Check-ins)
- **Updates list**: Chronological list of weekly updates
- **Write update form**: "What did you accomplish this week?", "What challenges are you facing?", "What are your priorities for next week?", optional mood/sentiment selector
- **View update**: Update card showing author, date, responses to each prompt

#### Grow (Career Development)
- **Grow overview page**: Header "Grow" with "Best practices" link
- **Individual Development Plan (IDP)**: Career Track selector (e.g., "Product Marketing Manager") with "Browse all" link, Career Vision field (e.g., "North Star Goal")
- **Growth Areas section**: "+ New" button, "Active" and "Drafts" sections
  - Each growth area card: Title, action items count ("0 of 1 actions completed"), last updated date
- **Recommended Growth Area** (right panel): Title, description, suggested actions, "Delete" and "Add draft" buttons
- **Career Tracks browser**: List of career tracks with levels/competencies

#### Engagement
- **Survey list page**: Active/past surveys listed
- **Survey participation**: Answer survey questions (Likert scale 1-5, free text, eNPS 0-10)
- **Results overview** (manager view): Overall engagement score, category breakdown (e.g., Manager effectiveness, Growth, Belonging), trend chart, heatmap
- **Action plans**: Create action items based on survey themes

### P2 — Secondary Features

#### People Directory
- **People list**: Search, filter by department/team/location; table or card view
- **Employee profile**: Avatar, name, title, department, manager, start date, contact info
- **Org chart**: Visual tree showing reporting structure

#### Compensation
- **Compensation overview**: Current salary, bonus, equity info
- **Comp cycle**: Manager views comp recommendations for team

#### Analytics (simplified)
- Performance distribution charts
- Goal completion rates
- Review cycle completion dashboard

---

## UI Design Specifications (from screenshots)

### Color Palette
- **Sidebar background**: Dark navy #1B1E3D (or similar deep blue-purple)
- **Sidebar text**: White #FFFFFF
- **Sidebar active item**: Light blue-purple highlight #E8EAFF or similar
- **Main background**: White #FFFFFF
- **Card backgrounds**: White #FFFFFF with subtle border #E5E7EB
- **Home header gradient**: Warm peach/salmon gradient (left #F8D3C5 to right lighter)
- **Primary action color**: Blue #4C6EF5 or similar (buttons, links)
- **Text primary**: Dark #1A1A2E
- **Text secondary/muted**: #6B7280
- **Success/On track**: Green #22C55E
- **Warning/Progressing**: Yellow/Amber #F59E0B
- **Danger/Behind**: Red #EF4444
- **Review completed badge**: Green background #DCFCE7, green text #166534
- **Review still receiving badge**: Yellow background #FEF9C3, dark text
- **Review not started badge**: Gray background #F3F4F6, dark text

### Typography
- **Font family**: Inter or system sans-serif (-apple-system, BlinkMacSystemFont, 'Inter', sans-serif)
- **H1 (Welcome heading)**: 28-32px, semibold
- **H2 (Section headings)**: 20-24px, semibold
- **Body text**: 14px, regular
- **Small/muted text**: 12-13px, regular, muted color
- **Nav items**: 14px, medium weight

### Spacing & Layout
- **Sidebar width**: ~200px
- **Main content padding**: 24-32px
- **Card padding**: 20-24px
- **Card border-radius**: 8-12px
- **Card shadow**: Very subtle, 0 1px 3px rgba(0,0,0,0.08)
- **Right sidebar (home)**: ~280-300px width
- **Gap between cards**: 16-20px

### Component Patterns
- **Buttons**: Rounded (border-radius 6-8px), outlined style for secondary actions, filled for primary
- **Avatars**: Round, 32-48px depending on context; placeholder shows colored circle with initials
- **Status badges**: Rounded pill shape, colored background with matching text
- **Cards**: White background, subtle border, small shadow, rounded corners
- **Empty states**: Centered illustration/emoji + message text
- **Lists**: Clean rows with subtle bottom border separator

---

## What to Skip (Out of Scope)
- Authentication / login / signup (app starts pre-logged-in)
- Real email/Slack notifications
- File uploads to real servers
- AI-powered features (growth area recommendations shown as static)
- Real-time collaboration
- Admin configuration panels (focus on IC and manager views)
- Integrations (Slack, JIRA, etc.)
- Mobile-specific views

---

## Key Screenshots Reference

| File | Description |
|------|-------------|
| `home_dashboard.jpg` | Home page: sidebar nav, welcome banner, tasks, active goals, manager card, 1:1s, celebrations |
| `grow_page_idp.jpg` | Grow page: expanded sidebar showing Grow > Career tracks, IDP section, growth areas, recommended growth area panel |
| `review_cycle_manage_team.jpg` | Review cycle detail: progress bar, team member list with status badges |
