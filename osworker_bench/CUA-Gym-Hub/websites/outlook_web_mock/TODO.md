# Xutlook Web Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest outlook_web_mock -- --template react`, install deps: `react-router-dom`, `lucide-react` (for icons). Clean out boilerplate.

- [x] **Visual design system**: Study `assets/screenshots/` — replicate the **New Xutlook (2024)** design. Exact specs:
  - Primary: `#0078D4` (Microsoft Blue)
  - Background: `#FFFFFF` (white main), `#F3F3F3` (sidebar/folder pane bg), `#F5F5F5` (top bar bg)
  - Text: `#323130` (primary), `#605E5C` (secondary/meta), `#A19F9D` (muted)
  - Borders: `#EDEBE9`
  - Selected row: `#EBF3FC`, Hover row: `#F3F2F1`
  - Danger: `#D13438`, Success: `#107C10`
  - Category colors: Blue `#0078D4`, Green `#107C10`, Orange `#FF8C00`, Purple `#8764B8`, Red `#D13438`, Yellow `#FFB900`
  - Font: `"Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", sans-serif`
  - Sizes: 14px body, 12px meta/secondary, 16px section headings, 20px page titles
  - Weights: 400 regular, 600 semibold (unread senders/subjects, active nav items)
  - Border-radius: 4px buttons/inputs, 50% avatars
  - Spacing: 4px base grid (4, 8, 12, 16, 20, 24, 32, 48)

- [x] **App layout** (see `assets/screenshots/inbox_01.jpg` and `inbox_05.jpg`): Three-zone horizontal layout:
  - **Top bar**: Full width, 48px height, `#F5F5F5` bg. Left: hamburger menu icon (☰, toggles folder pane) + "Xutlook" text logo. Center: search input bar (~400px, rounded corners, magnifying glass icon, placeholder "Search"). Right: bell/notification icon, settings gear icon ⚙️, help "?" icon, user avatar circle (36px, initials on colored bg).
  - **Left navigation rail**: 48px wide, full height below top bar, `#F3F3F3` bg. Vertical icon column: Mail (envelope), Calendar (calendar grid), People (person silhouette) icons, stacked vertically with 8px gaps, each 40x40px clickable area with hover highlight. Active icon has blue `#0078D4` accent (left border or filled icon).
  - **Main content area**: Remaining space right of nav rail, below top bar. Contents change per module (Mail, Calendar, People).

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes:
  - `/` → redirect to `/mail/inbox`
  - `/mail` → redirect to `/mail/inbox`
  - `/mail/:folderId` → Mail module, selected folder
  - `/mail/:folderId/:messageId` → Mail module, selected message
  - `/calendar` → Calendar module (default month view)
  - `/calendar/:view` → Calendar module with specific view (day/workweek/week/month)
  - `/people` → People/Contacts module
  - `/people/:contactId` → People module, selected contact
  - `/go` → State inspection endpoint (JSON view)

- [x] **State management**: `AppContext.jsx` + `dataManager.js`. AppContext wraps entire app, provides:
  - `state` — full application state object
  - `dispatch` or setter functions for all state mutations
  - `dataManager.js` exports `createInitialData()` (see `assets/data_model.md` for full structure) and all CRUD helpers
  - State persisted to localStorage under key `"outlook_web_mock_state"`
  - On mount: load from localStorage or call `createInitialData()`

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Renders JSON with `{ initial_state, current_state, state_diff }`. Must track initial state snapshot at first load and compute diff on each render.

- [x] **Session isolation**: `vite.config.js` mock-api plugin:
  - `POST /post?sid=<sid>` with `{ action: "set", state: {...} }` — sets both initial + current state
  - `POST /post?sid=<sid>` with `{ action: "set_current", state: {...} }` — updates current state only
  - `POST /post?sid=<sid>` with `{ action: "reset" }` — resets to initial state
  - `GET /go?sid=<sid>` → returns `{ initial_state, current_state, state_diff }`
  - Session state stored in-memory on server side, keyed by `sid`

---

## P1 — Mail Module (Primary Feature Set)

### Folder Pane

- [x] **Folder pane** (~220px wide, left of message list, right of nav rail, collapsible via hamburger icon in top bar):
  - Top: "New Mail" button — blue primary button (`#0078D4`, white text, 36px height, full width minus padding, mail+ icon left of text). Clicking opens compose modal.
  - **Favorites section** (collapsible with chevron ▸/▾): Shows folders with `isFavorite: true`. Each row: 32px height, 12px left indent, folder icon (16px) + name + unread badge (right-aligned, blue pill with count if > 0). Hover: `#F3F2F1` bg. Click: navigate to that folder, highlight row with `#EBF3FC`.
  - **Account section** (collapsible, header = user email address with chevron): All folders in hierarchy. Same row styling. System folders in order: Inbox, Drafts, Sent Items, Deleted Items, Junk Email, Archive. Custom folders after.
  - Right-click on folder → context menu: "New subfolder", "Rename", "Delete" (not for system folders), "Mark all as read", "Move to Favorites" / "Remove from Favorites".
  - Bottom of pane: "Add account" link (non-functional, just visual).

### Message List

- [x] **Message list** (~350px wide, between folder pane and reading pane):
  - **Focused / Other tabs** at top of message list (only visible for Inbox folder): Two tabs, "Focused" and "Other", horizontal. Active tab: bold text + blue underline (2px, `#0078D4`). Inactive tab: regular text, no underline. Clicking tab filters messages by `inferenceClassification` field.
  - **Filter bar** below tabs: "All ▾" dropdown on right — options: All, Unread, Flagged, To me, Mentions me, Has attachments. Shows "Filter" icon + selected filter name.
  - **Date group headers**: Messages grouped by date: "Pinned" (if any pinned), "Today", "Yesterday", "This Week", "Last Week", "Older". Group header: 12px uppercase text, `#605E5C` color, 8px vertical padding, light bottom border.
  - **Message row** (each ~72px height):
    - Left edge: 3px blue bar for unread messages (full height of row)
    - Checkbox (appears on hover, left side, 16px, toggles multi-select)
    - Sender avatar: 40px circle, colored bg with initials (first letter of first+last name), or profile picture
    - Sender name: bold (`600`) if unread, regular (`400`) if read, `#323130`, 14px, truncate with ellipsis
    - Subject: same line or below sender, bold if unread, truncate
    - Body preview: below subject, `#605E5C`, 12px, truncate to 1 line
    - Right side top: timestamp — relative for today ("8:31 AM"), date for older ("3/7/2025"), `#605E5C`, 12px
    - Right side: attachment icon (📎) if `hasAttachments`, flag icon if flagged, importance indicator (⬆️ high = red, ⬇️ low = blue arrow)
    - Hover: show action icons overlay — delete (trash), archive, flag toggle, pin toggle, mark read/unread
    - Selected: `#EBF3FC` background
    - Click: select message, show in reading pane, mark as read after 1s delay

- [x] **Message list sorting**: Messages sorted by `receivedDateTime` descending (newest first). Pinned messages float to top in their own "Pinned" group regardless of date.

### Reading Pane

- [x] **Reading pane** (right side, remaining width after folder pane + message list):
  - **Empty state**: When no message selected, show centered illustration with "Select an item to read" text, `#605E5C` color.
  - **Message header area** (when message selected):
    - Subject line: 20px, semibold `600`, `#323130`, top of pane with 16px padding
    - Category chips: colored pill badges below subject (if message has categories)
    - Sender row: 40px avatar circle + sender name (14px semibold) + sender email (12px `#605E5C`) + timestamp (12px `#605E5C`, right-aligned). Entire row ~48px.
    - "To:" line: "To: Katy Reid" (12px, `#605E5C`), expandable to show all recipients
  - **Action bar** (below sender row, 40px height, subtle top/bottom border):
    - Reply button (with icon), Reply All button, Forward button, Delete (trash icon), Archive, Move to folder (dropdown), More actions "..." dropdown (Mark unread, Flag, Categorize, Print)
  - **Message body** (scrollable area below action bar): Rendered HTML content with standard email styling. 16px padding all sides. Links rendered blue and clickable (open in new tab or no-op).
  - **Attachment bar** (above body, if `hasAttachments`): Horizontal list of attachment chips — each shows file icon + filename + size. Click does nothing (mock).

### Compose Email

- [x] **Compose modal/overlay**: Triggered by "New Mail" button or keyboard "N". Appears as a panel in the reading pane area (replaces reading pane content) OR as a floating overlay in bottom-right corner (~500px wide, ~400px tall, with drag handle):
  - **Header bar**: "New Message" title on left, minimize (—), pop-out (⧉), and close (✕) buttons on right, 40px height.
  - **From field**: Current user email, shown as chip/tag. (Single account, so just display.)
  - **To field**: Text input with autocomplete. Typing shows dropdown of matching contacts (from contacts list). Selected recipients shown as removable chips/pills with name + ✕ close.
  - **Cc/Bcc toggle**: "Cc" and "Bcc" links on the right side of "To" line — clicking reveals Cc and/or Bcc input fields (same autocomplete chip behavior).
  - **Subject field**: Plain text input, placeholder "Add a subject", full width.
  - **Formatting toolbar** (between subject and body): Bold (B), Italic (I), Underline (U), Strikethrough, Font color, Highlight color, Bullet list, Numbered list, Decrease indent, Increase indent, Link, Insert image, Alignment (left/center/right). Each is a small icon button 32x32px, subtle border on hover.
  - **Body editor**: Rich text area (contentEditable div), min-height 200px. Placeholder: "Type your message here". Auto-appends signature from settings if configured.
  - **Bottom action bar**: "Send" button (blue primary, `#0078D4` bg, white text), "Attach" button (paperclip icon), "Discard" button (trash icon, subtle/secondary style).
  - **Send behavior**: On send → move compose draft to `sentitems` folder as a new sent message, clear compose state, return to reading pane. Show brief "Message sent" toast notification at bottom.
  - **Discard behavior**: Show confirmation dialog "Discard this message?", on confirm → close compose, on cancel → return to compose.
  - **Draft auto-save**: When compose is open and user navigates away, auto-save to Drafts folder.

- [x] **Reply / Reply All / Forward**: Triggered from reading pane action buttons:
  - **Reply**: Opens compose in reading pane below original message. Pre-fills "To" with original sender. Subject prefixed with "Re: ". Body starts empty above a quoted block: horizontal line + "From: [sender] Sent: [date] To: [you] Subject: [subject]" header + original body.
  - **Reply All**: Same as Reply but pre-fills "To" with original sender AND all other toRecipients/ccRecipients (excluding current user).
  - **Forward**: Opens compose with empty "To". Subject prefixed with "Fw: ". Body starts with quoted original message. Attachments from original message listed.

### Message Actions

- [x] **Delete message**: Move message to Deleted Items folder. Update `parentFolderId`. If already in Deleted Items, show confirmation "Permanently delete?" (then remove from data). Show brief undo toast for 5 seconds "Message deleted — Undo".

- [x] **Archive message**: Move message to Archive folder. Update `parentFolderId`. Show undo toast.

- [x] **Move to folder**: Dropdown/flyout listing all folders. Click folder → move message (update `parentFolderId`). Update source and destination folder counts.

- [x] **Mark read / unread**: Toggle `isRead`. Update unread count on parent folder. Visual change: unread → blue left bar + bold text; read → no bar + regular text.

- [x] **Flag / unflag**: Toggle `flag.flagStatus` between `"notFlagged"` and `"flagged"`. Flagged messages show flag icon in message list row. Flagged filter shows only flagged messages.

- [x] **Pin / unpin**: Toggle `isPinned`. Pinned messages appear in "Pinned" group at top of message list.

- [x] **Categorize message**: Dropdown showing all categories (colored dot + name). Click to toggle category on/off for message. Selected categories appear as colored chips in reading pane below subject.

- [x] **Importance**: Display importance indicators in message list (red ⬆ for high, blue ⬇ for low). In compose, allow setting importance via dropdown or toolbar button.

### Search

- [x] **Global search bar** (in top bar, ~400px wide):
  - Click → expands/focuses with subtle blue border
  - Type query → filters current view. For mail: searches `subject`, `bodyPreview`, `from.name`, `from.email` fields (case-insensitive substring match)
  - Show results in message list area replacing normal folder view, with "Search results for '[query]'" header
  - Clear button (✕) in search bar → return to normal folder view
  - Keyboard shortcut: `Alt+Q` or `/` to focus search

---

## P1 — Calendar Module

- [x] **Calendar layout** (see `assets/screenshots/calendar_01.jpg`, `calendar_02.jpg`):
  - **Calendar toolbar** (top, 48px): "New" button (blue, "+ New event" style, clicking opens event form) | View toggles on right: "Day" | "Work week" | "Week" | "Month" buttons (toggle group, active has blue underline/bg) | "Today" button (returns view to today's date)
  - **Navigation**: Left/right arrows (◀ ▶) + current month/year label ("March 2025"), clicking arrows navigates backward/forward by one period (day/week/month depending on view)
  - **Left sidebar** (~250px):
    - **Mini calendar**: Small month grid (date picker style). Highlight today with blue circle. Click a date → navigate calendar main view to that date. Navigate months with ◀ ▶ arrows.
    - **"Your calendars" section**: Checkboxes + colored circles + calendar names. Toggle visibility of each calendar. Default calendars: Calendar (blue), US holidays (green), Birthdays (orange).

- [x] **Month view** (default): Grid of 5-6 rows × 7 columns (Sun-Sat). Each cell = one day. Date number in top-left of cell. Events shown as colored bars/chips — show start time + truncated title. Max 2-3 visible events per cell; if more, show "+N more" link. Click on empty area of a day → open new event form pre-filled with that date. Click on event chip → popover with event details.

- [x] **Week view**: 7-column time grid. Column headers: day name + date number. Left axis: hour labels from 12 AM to 11 PM (or working hours 8 AM-6 PM initially visible). Events as colored blocks positioned by start/end time. Block shows title, time, location (if room). All-day events in a strip above the time grid. Click on time slot → new event at that time.

- [x] **Day view**: Single column time grid. Same as week view but for one day only. Shows full detail for each event block.

- [x] **Work week view**: Same as week view but only Mon-Fri columns (5 columns).

- [x] **Event popover** (on click of event in any calendar view): Small card overlay near the event:
  - Colored top bar (calendar color)
  - Title (16px semibold)
  - Date and time (14px, e.g., "Mon, Mar 10, 2025, 9:00 AM - 9:30 AM")
  - Location (if set, with pin icon)
  - Organizer (with avatar)
  - Attendees list (avatars/initials, showing accepted/declined/tentative status icons)
  - "Edit" and "Delete" buttons at bottom
  - Close ✕ in top-right corner

- [x] **New/Edit event form** (modal or panel):
  - Title input (text, placeholder "Add a title")
  - Date/time pickers: Start date, Start time, End date, End time (dropdowns or inputs). "All day" toggle switch.
  - Location input (text, placeholder "Add a location")
  - Description/body (rich text area)
  - Attendees: text input with autocomplete from contacts, chips for added attendees
  - Calendar dropdown (which calendar to add to)
  - Reminder dropdown (None, 0 min, 5 min, 15 min, 30 min, 1 hour, 1 day)
  - Show as dropdown (Free, Tentative, Busy, Out of office)
  - "Save" button (blue primary) and "Cancel" / "Discard" button
  - For edit: pre-fill all fields; additional "Delete" button

- [x] **Delete calendar event**: Confirmation dialog "Delete this event?", on confirm → remove from events array, remove from calendar view.

---

## P1 — People / Contacts Module

- [x] **People layout** (see `assets/README.md` §People/Contacts Module Layout):
  - **Toolbar**: "New contact" button (blue primary, + icon) | Search contacts input
  - **Left sidebar** (~220px): Sections: "All contacts", "Your contacts" (collapsible). Contact count next to each section label.
  - **Contact list** (center, ~300px): Alphabetical list grouped by first letter (A, B, C... headers). Each row: avatar circle (36px, initials+color) + display name + email (truncated), ~56px height. Click → show detail in right pane. Selected row highlighted `#EBF3FC`.
  - **Contact detail pane** (right, remaining width):
    - Large avatar (64px circle) + display name (20px semibold) + job title (14px gray) + company (14px gray)
    - Sections: "Contact information" — email (clickable, opens compose), phone numbers, address; "Notes" — personal notes text
    - Action buttons: "Edit" (pencil icon), "Delete" (trash icon), "Email" (compose to this contact)
  - **Empty state**: When no contact selected, show "Select a contact to view details" placeholder.

- [x] **New/Edit contact form** (modal or panel):
  - Fields: First name, Last name, Email, Phone (mobile), Phone (business), Company, Job title, Department, Address, Birthday (date picker), Notes (textarea)
  - "Save" and "Cancel" buttons
  - For edit: pre-fill all fields from existing contact

- [x] **Delete contact**: Confirmation dialog, on confirm → remove from contacts array.

- [x] **Contact search**: Filter contact list by typing in search input. Match against `displayName`, `emailAddresses[].address`, `companyName` (case-insensitive substring).

---

## P1 — Settings Panel

- [x] **Settings modal** (triggered by gear ⚙️ icon in top bar): Overlay modal, ~900px wide × ~600px tall, centered, with semi-transparent dark backdrop. Close ✕ button in top-right.
  - **Left sidebar** (~200px): Search box at top. Section items:
    - **Accounts**: Email accounts, Automatic replies, Signatures, Categories
    - **General**: Appearance
    - **Mail**: Layout, Compose and reply
    - **Calendar**: Events and invitations
    - **People**: (placeholder)
  - Active section: `#EBF3FC` background, `#0078D4` left border (3px)
  - **Content area** (right, remaining width): Form/settings for selected section

- [x] **Settings — Appearance** (under General):
  - Theme toggle: Light / Dark radio buttons (Dark mode just sets `data-theme="dark"` on body, dev adds dark CSS overrides if time allows)
  - Density: Full / Medium / Compact radio buttons — changes message row height (88px / 72px / 56px) and overall spacing

- [x] **Settings — Layout** (under Mail):
  - Reading pane position: Right (default) / Bottom / Off — radio buttons with visual preview icons
  - Conversation view: Toggle switch on/off
  - Focused inbox: Toggle switch on/off (hides/shows Focused/Other tabs)
  - Message preview text: Toggle switch on/off

- [x] **Settings — Signatures** (under Accounts):
  - List of signatures (initially one: "Default Signature")
  - Rich text editor for signature HTML
  - Checkboxes: "Automatically include my signature on new messages I compose" / "Automatically include my signature on messages I forward or reply to"
  - "Save" button

- [x] **Settings — Automatic replies** (under Accounts):
  - Toggle: "Turn on automatic replies"
  - When on: Text area for internal reply message, text area for external reply message
  - "Save" button

- [x] **Settings — Categories** (under Accounts):
  - List of all categories with color dot + name
  - Rename category (inline edit)
  - Delete category (with confirmation)
  - Add new category: color picker + name input

---

## P2 — Secondary Features

Implement these after P1 is solid, for depth and realism.

- [ ] **Drag & drop messages to folders**: Dragging a message from message list onto a folder in folder pane → moves message to that folder. Folder highlights on drag-over.

- [x] **Right-click context menu** on messages: Context menu popup with items: Open, Reply, Reply All, Forward, Delete, Archive, Move to → (submenu with folders), Mark as read/unread, Flag, Categorize → (submenu with categories), Pin/Unpin.

- [ ] **Multi-select messages**: Clicking checkbox on message row toggles selection without opening reading pane. When multiple selected, reading pane shows "N messages selected" with bulk action buttons: Delete, Move, Mark read, Mark unread, Flag, Categorize, Archive.

- [ ] **Keyboard shortcuts** (subset):
  - `N` → New message compose
  - `R` → Reply to selected message
  - `Shift+R` → Reply All
  - `Shift+F` → Forward
  - `Delete` → Delete selected message
  - `E` → Archive
  - `Ctrl+Shift+1` → Go to Mail
  - `Ctrl+Shift+2` → Go to Calendar
  - `Ctrl+Shift+4` → Go to People
  - `Escape` → Close compose / close settings / deselect

- [ ] **Undo toast**: After delete/archive/move actions, show a toast notification at bottom-center: "[action] — Undo" (clickable "Undo" link). Toast auto-dismisses after 5 seconds. Undo reverses the action.

- [ ] **Notification bell**: Clicking bell icon in top bar → dropdown showing recent activity/notifications (can be a static mock list: "3 new messages in Inbox", "Meeting in 15 minutes: Team Standup"). Badge with count on bell icon.

- [ ] **Quick settings panel**: Alternative to full settings modal. Clicking settings gear → small flyout panel from right side (~300px wide) with quick toggles: Theme, Density, Reading pane position. "View all Xutlook settings" link at bottom → opens full settings modal.

- [ ] **Dark mode**: CSS custom properties / data-theme approach. When `settings.theme === "dark"`:
  - Background: `#1F1F1F`, Surface: `#2D2D2D`, Text: `#E0E0E0`
  - Sidebar: `#292929`, Selected: `#0078D4` with opacity, Borders: `#404040`
  - Apply to all components globally via CSS variables

- [ ] **Calendar event drag to resize/move**: In week/day views, drag event block to change its time. Drag bottom edge to resize duration. (Complex; implement if time allows.)

- [ ] **Contact favorites**: Star/favorite toggle on contacts. "Frequent contacts" filter in People sidebar.

- [ ] **Email conversation threading**: When `conversationView` setting is on, group messages with same `conversationId` together in message list. Show as expandable thread — click to expand/collapse individual messages within thread.

- [ ] **Folder pane collapse/expand animation**: Smooth width transition when toggling folder pane via hamburger menu.

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs. See `assets/data_model.md` for detailed field definitions and example values.

- [x] **User**: 1 record — "Katy Reid", katyreid@outlook.com, Product Manager at Contoso Ltd

- [x] **Folders**: 9 folders — Inbox, Drafts, Sent Items, Deleted Items, Junk Email, Archive, Expenses (subfolder of Inbox, favorite), Invoices (subfolder of Inbox, favorite), Projects (custom)

- [x] **Messages**: 30 messages distributed across folders:
  - Inbox Focused (12): Mix of personal emails, work communications, meeting requests — from Elvia Atkins (birthday planning, pinned), Contoso Airlines (flight confirmation, with RSVP), Lydia Bauer (team pictures sharing, has attachment), Daisy Phillips (yoga workshop), Margie's Travel (booking confirmation), Amanda Brady, Kevin Thompson (project update, high importance), Alex Wilber (quarterly review), Megan Bowen (lunch plan), Pradeep Gupta (code review request), Nestor Wilke (budget approval), Johanna Lorenz (design feedback). Mix: 5 unread, 7 read. 2 flagged, 1 pinned. 3 with attachments. Spanning last 5 days.
  - Inbox Other (5): Newsletters and promotions — "Contoso Newsletter" (newsletter@contoso.com), "LinkedIn Jobs" (jobs@linkedin.com), "GitHub Notifications" (noreply@github.com), "Microsoft 365 Tips" (tips@microsoft.com), "Office Space Weekly" (digest@officespace.com). All read except 2.
  - Drafts (2): Partially composed messages — one reply to Kevin about project, one new message to team about meeting.
  - Sent Items (5): Recent sent messages to various contacts.
  - Deleted Items (2): Old messages.
  - Junk Email (2): Spam-style messages.
  - Expenses folder (1): Expense report email.
  - Invoices folder (1): Invoice from vendor.

- [x] **Calendars**: 3 calendars — default "Calendar" (blue), "United States holidays" (green), "Birthdays" (orange)

- [x] **Events**: 18 events over current + next 2 weeks:
  - Recurring daily: "Team Standup" (Mon-Fri 9:00-9:30 AM, Conference Room A, 5 attendees)
  - Recurring weekly: "1:1 with Marcus" (Tuesdays 2:00-2:30 PM)
  - Recurring weekly: "Sprint Planning" (Mondays 10:00-11:00 AM, 8 attendees)
  - One-time this week: "Product Demo" (Wednesday 3:00-4:00 PM), "Design Review" (Thursday 1:00-2:00 PM), "Client Call" (Friday 11:00-11:30 AM, online meeting)
  - All-day: "Company Offsite" (next Friday), "Marcus Birthday" (next Tuesday, from Birthdays calendar)
  - Past events: "Quarterly Review" (last Monday 2:00-3:00), "Team Lunch" (last Wednesday 12:00-1:00)
  - Holiday: "Spring Break" (from holidays calendar, all-day)
  - Mix of organizer/attendee, accepted/tentative statuses

- [x] **Contacts**: 18 contacts matching senders/attendees across messages and events:
  - Contoso colleagues: Elvia Atkins (UX Designer), Marcus Chen (Engineering Lead), Lydia Bauer (Marketing Manager), Kevin Thompson (Senior Developer), Alex Wilber (VP Product), Megan Bowen (HR Director), Pradeep Gupta (Software Engineer), Nestor Wilke (Finance Director), Johanna Lorenz (Design Lead), Isaiah Langer (DevOps), Lee Gu (Data Analyst), Miriam Graham (CEO)
  - External: Daisy Phillips (Yoga instructor, personal), Amanda Brady (Real estate agent, personal), Shannon Trine (Consultant, Fabrikam Inc), Kristin Patterson (Account Manager, Woodgrove Bank)
  - Service accounts (minimal contact entry): Contoso Airlines, Margie's Travel
  - Variety of: with/without phone, with/without company, some favorites

- [x] **Categories**: 6 default categories — Blue, Green, Orange, Purple, Red, Yellow (with option to rename)

- [x] **Settings**: Default settings object: reading pane right, medium density, conversation view on, focused inbox on, auto-reply off, light theme, signature set to "Best regards, Katy Reid"

---

## Out of Scope

Dev must NOT implement these:

- Authentication / login / logout (app starts pre-logged-in as `Katy Reid`)
- Real email send/receive over network
- OAuth, SSO, or identity verification
- File uploads to real servers (attachments are mock metadata only)
- Multiple account switching
- Real-time notifications / WebSocket push
- Database persistence (beyond localStorage)
- Email encryption / S/MIME
- Advanced mail rules engine (just UI for viewing)
- Microsoft Teams integration (just show "Online meeting" label)
- OneNote / To-Do deep integration (just nav icons)
