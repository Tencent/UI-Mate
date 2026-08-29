# Xanvas LMS Mock — Research Summary

## App Overview

**Xanvas LMS** (by Instructure) is the world's most widely adopted learning management system, used by thousands of universities, K-12 districts, and organizations globally. It serves as the central hub for course delivery, assignment management, grading, communication, and academic collaboration. Canvas supports 10+ million concurrent users across 100+ countries in 33+ languages.

**Category:** Education / Learning Management System (LMS)
**URL:** https://www.instructure.com/canvas
**Primary roles:** Student, Instructor (Teacher), Teaching Assistant, Observer (Parent)

For this mock, the default user is an **Instructor** who teaches multiple courses, as this role provides the richest set of interactions for agent training. A secondary persona as **Student** will also be represented in the data model.

---

## Key User Personas & Workflows

### Instructor (Primary — "Prof. Sarah Johnson")
1. **Dashboard check** — View course cards, upcoming To Do items, recent feedback
2. **Course management** — Navigate to a course, view/edit modules, create assignments
3. **Grading** — Open Gradebook (spreadsheet view), enter grades, use SpeedGrader
4. **Announcements** — Post new announcements to a course
5. **Discussions** — Create discussion topics, reply to student posts
6. **Inbox** — Send/receive messages to students and TAs, filter by course
7. **Calendar** — View/create events across all courses, see assignment due dates
8. **Pages** — Create/edit wiki-style content pages
9. **Files** — Upload and organize course files
10. **Settings** — Manage course settings, navigation, and grading policies

### Student (Secondary — data only, for realistic interactions)
1. View dashboard with enrolled courses
2. Navigate course modules and content
3. Submit assignments (text entry, file upload, URL)
4. Check grades
5. Participate in discussions
6. Send messages via Inbox

---

## Complete Feature List

### P0 — Core Shell (Must have for app to render)
- **Global Navigation Sidebar** (left, ~80px wide, dark background #394B58)
  - Canvas logo (top)
  - Account (avatar icon)
  - Dashboard (home icon)
  - Courses (book icon)
  - Groups (people icon)
  - Calendar (calendar icon)
  - Inbox (speech bubble icon, with unread badge count)
  - Help (question mark icon)
- **Top header bar** — breadcrumb navigation, page title
- **Dashboard** — Card View (default), with course cards in a grid
  - Each card: colored header band, course name, course code, term
  - Card footer: 4 icon shortcuts (Announcements, Assignments, Discussions, Files)
  - Card gear icon for nickname/color customization
  - Dashboard toggle: Card View / List View (toggle switch in header)
- **Right sidebar** — "To Do" list and "Coming Up" section
- **Routing** — Dashboard, Courses, Course detail pages, Calendar, Inbox

### P1 — Primary Features (Core interactive workflows)

#### Course Detail View
- **Course Navigation** (left sidebar within course, ~200px, white background):
  - Home, Announcements, Assignments, Discussions, Grades, People, Pages, Files, Syllabus, Outcomes, Quizzes, Modules, Settings
  - Each item has an icon, can be hidden/shown
- **Course Home** — defaults to showing either Modules, Syllabus, or Activity Stream
- **Modules** — Ordered list of collapsible module sections, each containing items:
  - Module header with expand/collapse, published/unpublished status
  - Module items: assignments, quizzes, pages, external links, file attachments
  - Each item shows icon by type, title, due date, points, publish status
  - "Add Module" button, "Add Item" within each module
- **Assignments** — List view organized by assignment groups
  - Assignment groups (e.g., "Homework", "Exams", "Participation") with weight %
  - Each assignment: name, due date, points, published status
  - Click to view assignment detail (description, submission type, due date, rubric)
  - "New Assignment" button, "New Assignment Group" button
- **Announcements** — Reverse-chronological list
  - Each: title, posted_at, author avatar+name, message preview, unread indicator
  - Click to expand full message with replies
  - "New Announcement" button with rich text editor
- **Discussions** — List of discussion topics
  - Each: title, author, posted date, reply count, unread count
  - Pinned discussions appear at top
  - Click to view thread with nested replies
  - "New Discussion" button
- **Grades / Gradebook** (Instructor view) — Spreadsheet-style grid
  - Rows = students (name, total %, letter grade)
  - Columns = assignments (name, "out of X")
  - Cells = individual grades (editable, click to enter score)
  - Color coding: pink for late, green tint for excused
  - Search students field
  - View/Actions dropdowns, Gradebook Settings modal
- **People** — Roster list
  - Columns: Name, Login ID, Section, Role, Last Activity, Total Activity
  - Search, filter by role

#### Inbox (Conversations)
- **Three-column layout**: Filter bar (top) | Conversation list (left) | Message detail (right)
- Filter bar: Course dropdown, Type filter (Inbox/Unread/Starred/Sent/Archived), Search
- Conversation list items: participant avatars, subject, preview, timestamp, star toggle
- Message detail: Full message thread, reply box at bottom
- Compose button (pencil icon): opens modal with Course dropdown, To field (tokenized), Subject, Body (rich text), "Send individual messages" checkbox, Attach file, Send/Cancel buttons

#### Calendar
- **Month/Week/Day** view tabs
- Month grid with events as colored pills (color-coded by course)
- Right sidebar: mini calendar, list of undated items
- Click day to create event; click event to view/edit
- "Add Event" slide-out panel: Title, Location, Date/Time, Calendar (course) dropdown

### P2 — Secondary Features (Depth & realism)

- **Pages** — Wiki-style page list with Front Page designation; create/edit pages with rich text editor
- **Files** — File browser with folder tree, file list (name, date modified, size), upload button
- **Syllabus** — Course syllabus view with rich text content and auto-generated assignment schedule table
- **Course Settings** — Course details form (name, code, term), Navigation tab (drag to reorder/hide nav items), tabs for Feature Options
- **SpeedGrader** — Simplified view: student selector dropdown, submission viewer, grade input, comment box
- **Quizzes** — Quiz list view, quiz detail with questions (basic multiple choice, true/false, short answer)
- **Outcomes** — Learning outcomes list with mastery levels
- **Dashboard List View** — Alternative to Card View showing recent activity as a chronological list
- **Course color/nickname picker** — Modal on dashboard card gear icon
- **Notification preferences** — Account settings for notification types
- **Global search** — NOT in Canvas's default UI (no global search bar), but Courses list has search

---

## UI Layout Description

### Global Shell
```
+---+--------------------------------------------+
| G |  Breadcrumb / Page Title Bar               |
| L |                                            |
| O |  +------+   +------+   +------+   +------+|
| B |  |Course|   |Course|   |Course|   |Course||
| A |  | Card |   | Card |   | Card |   | Card ||
| L |  +------+   +------+   +------+   +------+|
|   |                                            |
| N |  +------+   +------+                  [To Do]
| A |  |Course|   |Course|              [Coming Up]
| V |  | Card |   | Card |                       |
|   |  +------+   +------+                       |
+---+--------------------------------------------+
```

- **Global Nav**: Fixed left, 80px wide, dark (#394B58), vertical icon stack
- **Main content**: Fills remaining width, max-width ~1200px centered
- **Right sidebar**: ~280px wide on Dashboard, shows To Do + Coming Up

### Course View
```
+---+-----------+------------------------------+
| G | Course    |  Course Content Area         |
| L | Nav       |  (Modules / Assignments /    |
| O | (left)    |   Grades / etc.)             |
| B |           |                              |
| A | Home      |                              |
| L | Announce  |                              |
|   | Assign    |                              |
| N | Discuss   |                              |
| A | Grades    |                              |
| V | People    |                              |
|   | Pages     |                              |
|   | Files     |                              |
|   | Syllabus  |                              |
|   | Modules   |                              |
|   | Settings  |                              |
+---+-----------+------------------------------+
```

- **Course Nav**: ~200px wide, white background, left of content
- **Content area**: Flexible width

### Gradebook View
- Full-width spreadsheet within the course content area
- Sticky left column (student names), sticky top row (assignment names)
- Horizontally scrollable
- Each cell is clickable/editable

---

## Visual Design System

Based on the Xanvas LMS screenshots, the design system is:

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#0374B5` | Links, active nav items, primary buttons |
| Primary Dark | `#0B6CA3` | Button hover states |
| Global Nav BG | `#394B58` | Left sidebar background (dark slate) |
| Global Nav Active | `#0374B5` | Active nav item highlight (blue strip on left) |
| Global Nav Icon | `#FFFFFF` | Sidebar icons (white) |
| Background | `#F5F5F5` | Page background (light gray) |
| Content BG | `#FFFFFF` | Cards, content panels |
| Text Primary | `#2D3B45` | Main body text |
| Text Secondary | `#6B7780` | Muted/secondary text |
| Border | `#C7CDD1` | Card borders, dividers |
| Success | `#0B874B` | Published indicators, success states |
| Warning | `#FC5E13` | Due date warnings |
| Danger | `#EE0612` | Errors, delete actions, overdue items |
| Teal accent | `#06A3B7` | Calendar events default |

### Typography
- **Font family**: `"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif`
- **Page title**: 28px, weight 300 (light)
- **Section headers**: 20px, weight 400
- **Body text**: 14px, weight 400
- **Small/meta text**: 12px, weight 400
- **Nav labels**: 10px, weight 700, uppercase (global nav)

### Spacing
- Global nav: 80px wide, icons centered, 24px icon size
- Course nav: 200px wide, 12px padding, items 36px tall
- Content max-width: ~1100px
- Card grid: ~250px min card width, 16px gap
- Standard padding: 16px (cards), 24px (page content)

### Component Styles
- **Cards**: White background, 1px `#C7CDD1` border, 4px border-radius, colored top band (50px tall)
- **Buttons**: Primary = `#0374B5` bg, white text, 4px radius; Secondary = white bg, `#0374B5` border
- **Badges**: Red circle `#EE0612` bg, white text, 16px diameter
- **Modals**: White background, overlay `rgba(0,0,0,0.5)`, max-width 500-700px centered

---

## Data Model Overview

See `data_model.md` for complete entity definitions. Key entities:

1. **User** — id, name, email, avatar_url, role, pronouns
2. **Course** — id, name, course_code, term, color, enrollment, default_view
3. **Enrollment** — user_id, course_id, type (Student/Teacher/TA), state
4. **Assignment** — id, course_id, name, description, due_at, points_possible, submission_types, published
5. **AssignmentGroup** — id, course_id, name, weight, position
6. **Submission** — id, assignment_id, user_id, score, grade, submitted_at, workflow_state
7. **Module** — id, course_id, name, position, published, items[]
8. **ModuleItem** — id, module_id, type, content_id, title, position
9. **Announcement** — id, course_id, title, message, author, posted_at
10. **DiscussionTopic** — id, course_id, title, message, author, replies[], pinned, published
11. **Conversation** — id, subject, participants[], messages[], workflow_state, starred
12. **CalendarEvent** — id, title, start_at, end_at, context_code, location
13. **Page** — id, course_id, title, body, published, front_page
14. **File** — id, course_id, display_name, size, content_type, folder_id, created_at

---

## What to Skip (Out of Scope)

- **Authentication / Login** — App starts pre-logged-in as Prof. Sarah Johnson
- **Real file uploads** — Simulated with mock data
- **LTI / External Tools** — Too complex, not needed for agent training
- **SIS Import/Export** — Backend administrative feature
- **Blueprint Courses** — Admin-level feature
- **Conferences / BigBlueButton** — Video conferencing integration
- **Collaborations** — Google Docs integration
- **Mobile app views** — Desktop only
- **Rich text editor (full)** — Use a basic textarea or simple contenteditable; no need for full TinyMCE
- **Rubric builder** — Complex nested form; omit for now
- **Analytics / Canvas Data** — Backend reporting

---

## Screenshots Inventory

```
assets/screenshots/
├── 000001.jpg    — Dashboard Card View with global nav, To Do sidebar, course cards
├── 000002.jpg    — Dashboard with color/nickname picker modal open
├── 000003.jpg    — Canvas marketing/brand page
├── 000004.jpg    — Third-party LMS view (less relevant)
├── 000005.jpg    — Third-party LMS quiz view (less relevant)
├── course/
│   ├── 000001.jpg — Book cover (less relevant)
│   ├── 000002.jpg — Dashboard overview
│   ├── 000003.jpg — Course card grid
│   ├── 000004.jpg — Modules page with module items list
│   └── 000005.jpg — Modules tutorial thumbnail
├── gradebook/
│   ├── 000001.jpg — Gradebook with modules view behind thumbnail
│   ├── 000002.jpg — Gradebook tutorial thumbnail
│   ├── 000003.jpg — **Gradebook spreadsheet view** with settings modal (BEST REF)
│   ├── 000004.jpg — Gradebook tutorial thumbnail
│   └── 000005.jpg — Canvas overview
├── inbox/
│   ├── 000001.jpg — **Inbox compose message modal** with global nav visible (BEST REF)
│   ├── 000002.jpg — **Inbox compose modal** in Blake Canvas instance (GOOD REF)
│   ├── 000003.jpg — Inbox tutorial thumbnail
│   └── 000004.jpg — Inbox tutorial thumbnail
├── calendar/
│   ├── 000001.jpg — Calendar overview thumbnail
│   ├── 000002.jpg — Canvas overview
│   ├── 000003.jpg — **Calendar month view with Add Event panel** (BEST REF)
│   └── 000004.jpg — Calendar tutorial thumbnail
├── discussions/
│   ├── 000001.jpg — Canvas overview
│   ├── 000002.jpg — **New Discussion form** with course nav visible (BEST REF)
│   ├── 000003.jpg — Modules tutorial thumbnail
│   └── 000004.jpg — Discussion tutorial thumbnail
└── assignments/
    ├── 000001.jpg — Canvas overview
    ├── 000002.jpg — **Edit Assignment form** with submission type options (BEST REF)
    ├── 000003.jpg — Assignment tutorial thumbnail
    └── 000004.jpg — Calendar overview
```

**Key reference screenshots for dev agent:**
- `000001.jpg` + `000002.jpg` — Dashboard layout with global nav, cards, To Do, Coming Up
- `gradebook/000003.jpg` — Gradebook spreadsheet with settings panel
- `inbox/000001.jpg` + `inbox/000002.jpg` — Compose message modal layout
- `calendar/000003.jpg` — Calendar month view with add event panel
- `discussions/000002.jpg` — New discussion form + course nav sidebar
- `assignments/000002.jpg` — Assignment edit form with submission type options
