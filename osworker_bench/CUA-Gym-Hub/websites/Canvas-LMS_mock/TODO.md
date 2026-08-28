# Xanvas LMS Mock — TODO

> Status: COMPLETE
> Last updated by: dev agent, 2026-03-13
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest Canvas-LMS_mock -- --template react`, install deps: `react-router-dom`, `lucide-react` (icons). Create standard directory structure: `src/{components,pages,context,utils,styles}`.

- [x] **Visual design system**: Study `assets/screenshots/000001.jpg`, `000002.jpg`, `gradebook/000003.jpg` closely. Create `src/styles/variables.css` with the exact Canvas color palette:
  - Global Nav BG: `#394B58` (dark slate sidebar)
  - Primary: `#0374B5` (links, active states, primary buttons)
  - Primary Hover: `#0B6CA3`
  - Background: `#F5F5F5` (light gray page background)
  - Content BG: `#FFFFFF` (cards, panels)
  - Text Primary: `#2D3B45` (main body text)
  - Text Secondary: `#6B7780` (muted text, timestamps)
  - Border: `#C7CDD1` (card borders, dividers)
  - Success/Published: `#0B874B` (green circles)
  - Warning: `#FC5E13` (orange, due date warnings)
  - Danger: `#EE0612` (red, overdue, badges)
  - Font family: `"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif`
  - Import Lato from Google Fonts (weights: 300, 400, 700)
  - Page title: 28px light (300), Section headers: 20px normal, Body: 14px, Small: 12px, Nav labels: 10px bold uppercase

- [x] **Global Navigation sidebar**: Fixed left sidebar, 80px wide, full viewport height, background `#394B58`. Contains vertically stacked icon buttons (centered, 48px tall each):
  1. Canvas "C" logo (top, links to Dashboard) — use a simple red circle with white "C" or the Canvas dot-pattern logo
  2. Account — user avatar circle (32px), label "Account" below, opens dropdown flyout on click with: Profile, Settings, Notifications
  3. Dashboard — home icon (`lucide-react` `LayoutDashboard`), label "Dashboard"
  4. Courses — book icon (`BookOpen`), label "Courses", click opens flyout listing enrolled courses + "All Courses" link
  5. Groups — users icon (`Users`), label "Groups"
  6. Calendar — calendar icon (`Calendar`), label "Calendar"
  7. Inbox — message icon (`MessageSquare`), label "Inbox", red badge circle showing unread count (from conversations with workflow_state "unread")
  8. Help — help circle icon (`HelpCircle`), label "Help", bottom of sidebar
  - Active item: left blue border strip (3px wide `#0374B5`), icon turns white
  - Hover: icon area background lightens slightly
  - Labels: 10px, white, uppercase, centered below icon
  - See `assets/screenshots/000001.jpg` and `000002.jpg` for exact layout reference

- [x] **App layout**: In `App.jsx`, render the global nav sidebar fixed-left (80px), and a main content area that fills the remaining width. The main content area has no max-width constraint at the shell level (individual pages handle their own max-width). No persistent top header bar — Canvas uses breadcrumbs within each page's content area instead.

- [x] **Routing**: `App.jsx` with `BrowserRouter`, define routes:
  - `/` → Dashboard (redirect)
  - `/dashboard` → Dashboard page
  - `/courses` → All Courses list page
  - `/courses/:courseId` → Course Home (redirects based on course.default_view)
  - `/courses/:courseId/modules` → Modules page
  - `/courses/:courseId/assignments` → Assignments list
  - `/courses/:courseId/assignments/:assignmentId` → Assignment detail
  - `/courses/:courseId/announcements` → Announcements list
  - `/courses/:courseId/announcements/:announcementId` → Announcement detail
  - `/courses/:courseId/discussion_topics` → Discussions list
  - `/courses/:courseId/discussion_topics/:topicId` → Discussion detail
  - `/courses/:courseId/grades` → Gradebook (instructor) / Grades (student)
  - `/courses/:courseId/users` → People page
  - `/courses/:courseId/pages` → Pages list
  - `/courses/:courseId/pages/:pageUrl` → Page detail
  - `/courses/:courseId/files` → Files page
  - `/courses/:courseId/syllabus` → Syllabus page
  - `/courses/:courseId/settings` → Course Settings
  - `/calendar` → Calendar page
  - `/conversations` → Inbox page
  - `/go` → State inspector (Go.jsx)

- [x] **State management**: `src/context/AppContext.jsx` wrapping the entire app, providing `state` and `dispatch` (or `setState`). On mount, loads from `localStorage` key `"canvas_lms_state"` or falls back to `createInitialData()`. Every state mutation persists to localStorage. Also store `initialState` ref for diff computation.

- [x] **Data manager**: `src/utils/dataManager.js` — exports `createInitialData()` returning the full initial state object (see `data_model.md`). Must include all seed data: 10 users, 5 courses, enrollments, ~13 assignments across 2 courses with assignment groups, ~40 submissions with varied states (graded/ungraded/late/missing/excused), 9 modules with ~13+ module items, 6 announcements, 3+ discussion topics with replies, 5 conversations with messages, 5 calendar events, 5 pages, files/folders, and 4-5 todo items. See `data_model.md` for exact field definitions and example data.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route at `/go`. Computes and renders JSON: `{ initial_state, current_state, state_diff }`. `state_diff` should be a deep diff showing which fields changed. Display as a `<pre>` block with formatted JSON.

- [x] **Session isolation**: In `vite.config.js`, add a mock API middleware plugin handling:
  - `POST /post?sid=<sid>` — accepts `{ action: "set" | "set_current" | "reset", state: {...} }`. "set" overwrites both initial and current. "set_current" updates only current state. "reset" restores current state to initial.
  - `GET /go?sid=<sid>` — returns `{ initial_state, current_state, state_diff }`.
  - `POST /upload?sid=<sid>` — multipart form upload, stores files in memory keyed by sid, returns `{ files: [{ url, original_name, stored_name, size }] }`.
  - `GET /files/<sid>/<filename>` — serves uploaded files.
  - Each `sid` isolates state independently. No sid = default session using localStorage.

---

## P1 — Primary Features

Core features a user interacts with in the first 5 minutes. These are the key interactive workflows for agent training.

### Dashboard

- [x] **Dashboard page** (`src/pages/Dashboard.jsx`): Header area shows "Dashboard" title (28px, font-weight 300). To the right of title: view toggle — a pill toggle with grid icon (Card View) and list icon (List View), defaulting to Card View. Below header: main content area (left ~70%) + right sidebar (~280px). See `assets/screenshots/000001.jpg` and `000002.jpg` for exact layout.

- [x] **Course cards (Card View)**: CSS grid, min 250px per card, 16px gap. Each card is a white rounded rectangle (4px radius, 1px `#C7CDD1` border) with:
  - Colored top band (50px tall, uses `course.color`)
  - Top-right gear icon (settings, on hover of card) — clicking opens nickname/color picker modal
  - Top-right pencil/edit icon on the color band
  - Course name (16px, bold, `#0374B5` link color, truncated with ellipsis if too long)
  - Course code below name (12px, `#6B7780`)
  - Term below code (12px, `#6B7780`)
  - Card footer: 4 small icon buttons (left-aligned, 20px icons, gray `#6B7780`):
    - Announcements (megaphone icon) — with unread badge if unread announcements exist
    - Assignments (clipboard icon) — with count badge if needs_grading_count > 0
    - Discussions (message-circle icon)
    - Files (folder icon)
  - Clicking card navigates to `/courses/:courseId`
  - Only show cards for courses with `workflow_state === "available"`

- [x] **Dashboard right sidebar**: Fixed-width right column (280px) containing:
  1. **"To Do" section**: Header "To Do" with item count. Each to-do item shows:
     - Icon indicating type (grading icon for instructor, assignment icon for student)
     - Linked assignment title (`#0374B5`)
     - Course name (12px, gray)
     - Points + due date (12px, gray): e.g., "5 points - Oct 6 at 11:59pm"
     - "X" dismiss button (right side)
     - Show max 5 items, then "N more..." link
  2. **"Coming Up" section**: Header "Coming Up" with "View Calendar" link. Shows upcoming calendar events and assignment due dates (next 7 days), each with:
     - Calendar or assignment icon (color-coded by course)
     - Title link
     - Course name
     - Date/time
     - Show max 5 items

- [x] **Course nickname/color picker modal**: When clicking the gear icon on a dashboard card, show a modal with:
  - "Nickname:" label + text input pre-filled with course name
  - Color grid: 15 color swatches (4 per row) in the Canvas palette (red, pink, purple, navy, blue, teal, cyan, green, lime, yellow, gold, orange, brown, dark pink, charcoal) + hex input field
  - "Cancel" and "Apply" buttons
  - Applying updates the course's color and optionally sets a nickname
  - See `assets/screenshots/000002.jpg` for exact reference

### Course Shell (Layout + Navigation)

- [x] **Course layout component** (`src/components/CourseLayout.jsx`): When any `/courses/:courseId/*` route is active, render:
  - **Breadcrumb bar** at top: `Course Name > Page Name` (e.g., "CS 101 > Modules")
  - **Course navigation sidebar** (left, 200px wide, white background, 1px right border `#C7CDD1`):
    - Vertical list of nav items, each 36px tall, 14px text, `#0374B5` text color, left border highlight (3px `#0374B5`) when active
    - Items: Home, Announcements, Assignments, Discussions, Grades, People, Pages, Files, Syllabus, Outcomes, Quizzes, Modules, Settings
    - Each item is a `<NavLink>` to the corresponding course sub-route
    - Some items may have a "disabled/hidden" style (eye-slash icon) indicating they're hidden from students
  - **Content area**: Right of course nav, fills remaining width, max-width ~1100px, 24px padding
  - See `assets/screenshots/discussions/000002.jpg` for course nav reference (left sidebar showing Pages, Files, Syllabus, Quizzes, Modules, Conferences, Google Drive, Outcomes, Collaborations, Settings)

### Modules

- [x] **Modules page** (`src/pages/course/Modules.jsx`): Shows all modules for the current course as a vertical list of collapsible sections. At top: "+ Module" button (green, instructor only). Each module section:
  - **Module header bar**: Gray background (`#F5F5F5`), 1px bottom border. Contains:
    - Drag handle (⋮⋮ dots, left side) for reordering
    - Expand/collapse caret (▶/▼)
    - Module name (16px, bold)
    - Right side: published status toggle (green checkmark if published, gray circle if unpublished), kebab menu (⋮) with Edit, Delete options
  - **Module items list** (when expanded): Each item is a row with:
    - Drag handle (⋮⋮)
    - Type icon: page (📄), assignment (📋), quiz (❓), discussion (💬), external URL (🔗), file (📁), sub-header (bold text with no icon)
    - Item title (clickable link, `#0374B5`)
    - Right side: due date (if assignment/quiz), points (if graded), published toggle (green/gray circle)
    - Indent level: 0-3 levels, each adding 20px left padding
  - "Add Item" button at bottom of each module's item list (+ icon)
  - Clicking an item navigates to the appropriate detail page (assignment detail, page view, etc.)
  - See `assets/screenshots/gradebook/000001.jpg` (background shows modules list with items)

- [x] **Add Module modal**: Clicking "+ Module" opens a modal with: Module Name text input, "Lock until" date picker (optional), "Add Module" / "Cancel" buttons. Creating a module adds it to state at the end of the modules list.

- [x] **Add Module Item modal**: Clicking "+ item" within a module opens a modal with: Type dropdown (Assignment, Page, Discussion, External URL, Text Header), then a content selector (existing items or create new), Indent level dropdown (0-3). "Add Item" / "Cancel" buttons.

### Assignments

- [x] **Assignments list page** (`src/pages/course/Assignments.jsx`): Organized by assignment groups. At top: "+ Assignment" button, "+ Group" button, assignment weights toggle. For each assignment group:
  - Group header: Name, weight %, kebab menu (Edit, Delete)
  - Sorted list of assignments within the group:
    - Left: type icon (green circle = published, gray = unpublished), assignment name (link)
    - Right: due date (formatted: "Sep 8 at 11:59pm"), points display (e.g., "100 pts"), kebab menu
  - Each assignment row is clickable → navigates to assignment detail
  - Search/filter bar at top of assignment list

- [x] **Assignment detail page** (`src/pages/course/AssignmentDetail.jsx`): Shows full assignment info:
  - Title (24px, bold)
  - Publish status pill (green "Published" or gray "Unpublished")
  - Due date, Available from/until dates
  - Points possible
  - Submission types (listed as text: "Text Entry, File Upload")
  - Description (rendered HTML)
  - "Edit" button (top right, navigates to edit form)
  - "Submit Assignment" button (bottom, for student view — opens submission form)
  - Right sidebar: Related items, assignment group info

- [x] **Assignment edit/create form**: Full-page form with fields:
  - Name (text input)
  - Description (textarea, simple rich text or plain textarea)
  - Points (number input)
  - Assignment Group (dropdown select)
  - Display Grade As (dropdown: Points, Percentage, Letter Grade, GPA Scale, Pass/Fail, Not Graded)
  - Submission Type (dropdown: Online, On Paper, No Submission) — if Online, show checkboxes: Text Entry, Website URL, File Uploads
  - If File Uploads selected: "Restrict Upload File Types" checkbox + allowed extensions input
  - Group Assignment checkbox
  - Peer Reviews checkbox
  - Due Date, Available From, Until date inputs
  - "Save" and "Cancel" buttons
  - See `assets/screenshots/assignments/000002.jpg` for form layout reference

### Announcements

- [x] **Announcements list page** (`src/pages/course/Announcements.jsx`): Reverse-chronological list. "+ Announcement" button at top. Each announcement card:
  - Author avatar (32px circle) + name (bold) + posted date (relative: "2 days ago")
  - Title (18px, bold, link)
  - Message preview (first 100 chars, truncated)
  - Unread indicator (blue dot left side if unread)
  - Reply count indicator
  - Click title or card → expands full message / navigates to detail

- [x] **Announcement detail page**: Full message rendered as HTML, author info, posted date. Reply section at bottom with textarea and "Post Reply" button.

- [x] **New Announcement form**: Title input, rich text body (textarea), "Post to" section dropdown (All Sections or specific section), Options: "Allow user comments" checkbox, "Delay posting" date/time picker, "Save" / "Cancel" buttons.

### Discussions

- [x] **Discussions list page** (`src/pages/course/Discussions.jsx`): Two sections: "Pinned Discussions" (if any) and "Discussions". "+ Discussion" button at top. Each discussion entry:
  - Unread count badge (blue pill, right side): "3 unread"
  - Title (link, bold)
  - Author name, posted date
  - Reply count, "Last post at" timestamp
  - Published toggle (green/gray) — instructor only
  - Pin icon if pinned
  - Kebab menu: Edit, Delete, Pin/Unpin, Close for comments

- [x] **Discussion detail page** (`src/pages/course/DiscussionDetail.jsx`): Shows the original post at top (title, author avatar+name, date, full message HTML). Below: threaded replies. Each reply:
  - Author avatar (32px) + name (bold) + date (relative)
  - Message body (HTML)
  - "Reply" link (opens inline reply textarea beneath the reply)
  - "Like" button with count (if allow_rating is true)
  - Nested replies indented 24px per level
  - "Reply" box at bottom of thread for new top-level replies
  - Textarea + "Post Reply" button

- [x] **New Discussion form**: Title input, Message textarea (rich text), Options checkboxes: "Allow threaded replies", "Users must post before seeing replies", "Graded" (if checked, shows Points input and Due Date), "Allow liking", Attachment upload area, "Save" / "Cancel" buttons. See `assets/screenshots/discussions/000002.jpg` for reference.

### Gradebook

- [x] **Gradebook page** (`src/pages/course/Gradebook.jsx`): Full-width spreadsheet/table view (instructor view). Reference: `assets/screenshots/gradebook/000003.jpg`.
  - **Top bar**: "Gradebook" dropdown (switchable to other views), "View" dropdown, "Actions" dropdown, search "Search Students" input
  - **Table structure**:
    - Sticky first column: Student Name (sortable), Section info
    - Second column: Total grade (percentage + letter grade, e.g., "85.51% B")
    - Remaining columns: One per assignment, header shows assignment name (truncated) + "Out of X" points + "(MANUAL)" if manually posted
    - Cell values: numeric score or "–" for no submission
    - Color coding: pink/salmon background for late submissions, green tint for excused
  - **Cell interaction**: Click a cell to enter/edit a grade (inline input), Tab to move to next cell
  - **Column header click**: Opens assignment detail/options
  - Generate the gradebook data by cross-referencing students enrolled in the course with their submissions for each assignment

- [x] **Gradebook Settings modal**: Accessible via gear icon or "Settings" in Actions dropdown. Tabs: "Late Policies", "Grade Posting Policy", "Advanced". Late Policies tab shows:
  - "Automatically apply grade for missing submissions" checkbox + percentage input
  - "Automatically apply deduction to late submissions" checkbox + deduction % + interval dropdown (Day/Hour)
  - "Lowest possible grade" percentage input
  - See `assets/screenshots/gradebook/000003.jpg` for exact reference

### People

- [x] **People page** (`src/pages/course/People.jsx`): Roster table showing all enrolled users for the course.
  - Search input at top
  - Table columns: Name (avatar + full name), Login ID (email), Section, Role (Student/Teacher/TA), Last Activity, Total Activity
  - Filter by role dropdown
  - Each row clickable (no-op or shows user profile card)

### Inbox (Conversations)

- [x] **Inbox page** (`src/pages/Inbox.jsx`): Three-panel layout. Reference: `assets/screenshots/inbox/000001.jpg` and `inbox/000002.jpg`.
  - **Top toolbar**: Compose button (pencil icon, blue), Reply/Reply All/Archive/Delete/Star action buttons, "Course" filter dropdown (All Courses + each course), "Type" filter dropdown (Inbox/Unread/Starred/Sent/Archived)
  - **Left panel** (~350px): Scrollable conversation list. Each item:
    - Checkbox (left)
    - Participant avatar(s) (32px circle, stacked if multiple)
    - Subject line (bold if unread)
    - Last message preview (1 line, truncated, gray)
    - Timestamp (right side, relative: "Oct 5")
    - Star toggle (outline/filled star)
    - Unread = bold subject + blue left border strip
  - **Right panel**: Selected conversation detail:
    - Subject header (18px, bold)
    - Course context label (12px, gray)
    - Message thread: each message shows author avatar + name + date, message body
    - Reply box at bottom: textarea, attachment button, "Reply" / "Reply All" buttons
  - Empty state: "No conversations selected" when nothing is selected

- [x] **Compose message modal**: Opened by clicking Compose button. Modal with:
  - Course dropdown: "Select course" → list of enrolled courses
  - "To" field: tokenized text input — type name to search users within selected course, add as tokens/chips
  - Address book icon button (right of To field) — opens a user picker flyout
  - "Subject" text input
  - "Send individual messages" checkbox with help tooltip
  - Message body textarea (large, ~200px tall)
  - Bottom bar: Attach file icon (paperclip), Media icon, "Cancel" button, "Send" button (blue)
  - Sending a message creates a new Conversation in state (or adds to existing if same participants + subject)
  - See `assets/screenshots/inbox/000001.jpg` for exact layout

### Calendar

- [x] **Calendar page** (`src/pages/Calendar.jsx`): Full-page calendar with view tabs. Reference: `assets/screenshots/calendar/000003.jpg`.
  - **Header**: "Calendar" title + navigation: "< Back" "Today" "Next >" buttons + current month/year label
  - **View tabs**: Month | Week | Day (underlined active tab)
  - **Month view** (default): 7-column grid (Sun-Sat), 5-6 rows. Each day cell:
    - Day number (top-left)
    - Events as colored pill bars (background color = course color, text = event title, truncated)
    - Assignment due dates shown as pills too (with assignment icon)
    - Today's date highlighted (blue circle on day number)
    - Click empty day area → opens "Add Event" panel
    - Click event pill → opens event detail popover
  - **Right sidebar** (~280px): Mini calendar (small month grid), "Calendars" section showing course name + checkbox + color swatch for each course (toggle visibility), "Undated" section listing assignments with no due date

- [x] **Add Event side panel**: Slides in from the right (or modal). Contains:
  - Title input
  - Location input
  - Description textarea
  - Date picker (start date + end date)
  - Time picker (start time + end time) — hidden if "All Day Event" checked
  - "All Day Event" checkbox
  - Calendar dropdown (which course or Personal)
  - "Add Event" button + "Cancel"/"X" close
  - See `assets/screenshots/calendar/000003.jpg` for exact reference

---

## P2 — Secondary Features

Depth and realism. Implement after P1 is solid.

### Pages

- [x] **Pages list page** (`src/pages/course/Pages.jsx`): Table of all pages in the course. Columns: Title (link), Created, Last Edited, "Front Page" indicator star. "+ Page" button at top. Sort by title or date.

- [x] **Page detail view**: Renders page body as HTML. "Edit" button (top right). Shows title, last edited by, last edited date.

- [x] **Page editor**: Simple form with title input and body textarea. "Save" / "Cancel" buttons. "Set as Front Page" toggle.

### Files

- [x] **Files page** (`src/pages/course/Files.jsx`): Two-panel layout:
  - Left panel (~200px): Folder tree (expandable/collapsible)
  - Right panel: File list table — columns: Name, Date Created, Date Modified, Modified By, Size
  - "+ Folder" button, "Upload" button (simulated — adds a mock file to state)
  - File row click shows file detail (name, type, size, download link — no-op)

### Syllabus

- [x] **Syllabus page** (`src/pages/course/Syllabus.jsx`): Two sections:
  1. Syllabus body: rendered from `course.syllabus_body` HTML
  2. Assignment schedule table: auto-generated from all assignments in the course, sorted by due date. Columns: Date, Details (assignment name link + course name), Due (time)

### Course Settings

- [x] **Settings page** (`src/pages/course/Settings.jsx`): Tabbed interface:
  - "Course Details" tab: Form with course name, course code, time zone dropdown, start/end dates, default view dropdown (Modules/Assignments/Syllabus/Feed), more options section. "Update Course Details" button.
  - "Navigation" tab: Drag-and-drop reorderable list of nav items. Items can be dragged between "Shown" and "Hidden" sections. "Save" button.
  - "Feature Options" tab: List of feature flags with toggles (mock data, non-functional)

### Dashboard List View

- [x] **List View toggle**: When user clicks the list icon on the Dashboard header, switch from Card View to List View. List View shows a chronological feed of recent activity across all courses:
  - Each item: icon (announcement/assignment/grade), course color dot, title (link), course name, timestamp
  - Grouped by day ("Today", "Yesterday", "Oct 5", etc.)

### Quizzes (Basic)

- [x] **Quizzes list page**: Similar to Assignments list but only quiz-type assignments. "+ Quiz" button. Each quiz shows: name, due date, points, availability, published status.
- [x] **Quiz preview**: Simple question display: question text, answer options (radio buttons for multiple choice, checkbox for multiple answer, text input for short answer). "Submit" button (mock only — records answer but no actual grading).

### Notification Preferences

- [x] **Account > Notifications page**: Table of notification types (rows) vs. delivery methods (columns: Email, Push). Notification types: Announcements, Grading, Submission Comments, Discussion Posts, Conversation Messages. Each cell has a frequency dropdown: Immediately, Daily Summary, Weekly Summary, Off.

### Course Color Coding Consistency

- [x] Ensure course colors are consistently applied across all views: Dashboard cards, Calendar events, Gradebook, Inbox course filter, breadcrumbs.

### Global Courses Dropdown Flyout

- [x] **Courses flyout**: When clicking "Courses" in global nav, show a flyout/dropdown overlay listing:
  - All current courses with colored dot + name (max 7, then "All Courses" link)
  - Each course name is a link to `/courses/:courseId`
  - "All Courses" link at bottom navigates to `/courses`

### All Courses Page

- [x] **All Courses page** (`src/pages/Courses.jsx`): Shows a table of all courses (current + past). Columns: Course, Nickname, Term, Enrolled as, Published (indicator). Search bar at top. Tabs: "Current Courses" | "Past Courses" | "Future Courses".

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs. See `data_model.md` for complete field definitions and example values.

- [x] **Users**: 10 users — 1 instructor (Sarah Johnson, id:1), 1 TA (Lisa Nguyen, id:9), 8 students (James Chen, Maria Garcia, Alex Kim, Emily Watson, David Brown, Sophia Patel, Ryan O'Brien, Michael Torres, ids 2-8,10). Each with name, email, avatar_url (use null for placeholder generation), role, pronouns.

- [x] **Courses**: 5 courses — CS 101 (Intro to CS, blue), CS 201 (Data Structures, red), CS 150 (Web Dev, green), CS 480 (Machine Learning, orange), CS 350 (Software Engineering, purple, completed/past term). Each with unique color, term "Fall 2025" (CS 350 = "Spring 2025"), default_view "modules".

- [x] **Enrollments**: Current user (id:1) as TeacherEnrollment in all courses. Students 2-8 in CS 101 (StudentEnrollment). Students 2,3,4,5,10 in CS 201. User 9 (Lisa) as TaEnrollment in CS 101 and CS 201. Additional students in CS 150 and CS 480.

- [x] **Assignments & Groups**: CS 101: 5 groups (Homework 30%, Quizzes 20%, Midterm 20%, Final Project 20%, Participation 10%) with 10 assignments. CS 201: 3 groups with 3+ assignments. At least 2 unpublished assignments to test publish toggle. Varied submission types (online_upload, online_text_entry, on_paper, online_quiz).

- [x] **Submissions**: ~40-50 submissions for CS 101 assignments across students 2-8. Include: fully graded (score + grade), submitted but ungraded (workflow_state "submitted"), late submissions (late: true, submitted_at > due_at), missing submissions (missing: true), 1-2 excused (excused: true). This data powers the Gradebook view. For CS 201: ~15 submissions.

- [x] **Modules**: CS 101: 6 modules (Weeks 1-6), first 3 published. CS 201: 3 modules (Units 1-3). Module items reference assignments, pages, discussions, quizzes, and external URLs from the seed data using correct content_ids.

- [x] **Announcements**: 6 announcements across 3 courses (3 for CS 101, 2 for CS 201, 1 for CS 150). Mix of read/unread states. Realistic content about course logistics, deadlines, grading updates.

- [x] **Discussions**: 3-4 discussion topics for CS 101 ("Share Your First Program", "Best Practices for Code Comments", "Midterm Study Group"). Each with 3-5 threaded replies from different students. Include pinned discussion and graded discussion examples.

- [x] **Conversations**: 5 conversations showing realistic student-instructor messaging: questions about assignments, office hours scheduling, project ideas, grading concerns, TA coordination. Include unread, starred, and read states. 2 unread for badge count.

- [x] **Calendar Events**: 5 events spanning the next 2 weeks. Mix of course-specific (Office Hours for CS 101, Guest Lecture for CS 480) and personal (Department Meeting, Fall Break). Include all-day and timed events.

- [x] **Pages**: 5 pages for CS 101 (Course Introduction as front page, Python Setup, Lecture Notes x2, Practice Exercises). Include HTML content with headings, lists, code blocks, links.

- [x] **Files & Folders**: Root folder for CS 101 with 2 subfolders (Lecture Slides, Lab Materials). 5-8 files: syllabus.pdf, lecture slides (pptx), code examples (py), etc. with realistic sizes.

- [x] **Todo Items**: 4-5 items for the instructor: "Grade HW 3" (5 submissions), "Grade HW 4" (7 submissions), "Grade Final Project Proposal" (3 submissions), "Review PA 2" (4 submissions in CS 201). Each with assignment reference, course, points, due date.

---

## Out of Scope

Dev must NOT implement these:

- Authentication / login (app starts pre-logged-in as `Prof. Sarah Johnson`, id: 1, role: "teacher")
- Password management or account creation
- Real file uploads (simulate with mock data additions to state)
- Real network communication or API calls
- LTI / External Tool integrations
- SIS Import/Export
- Blueprint Courses
- Conferences / Video calling
- Collaborations (Google Docs)
- Mobile responsive views (desktop only)
- Full TinyMCE rich text editor (use basic textarea or simple contenteditable)
- Rubric builder (complex nested form)
- Analytics / Canvas Data reports
- Outcomes mastery tracking (can show placeholder)
- SpeedGrader (complex tool — omit or show simplified version)
- Email/SMS notifications (can show preferences page but no actual sending)
