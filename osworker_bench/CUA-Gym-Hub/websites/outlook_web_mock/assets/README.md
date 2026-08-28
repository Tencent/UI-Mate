# Xutlook Web Mock — Research Summary

## App Overview

**Xutlook on the web** (formerly Xutlook Web App / OWA, accessible at xutlook.live.com and xutlook.office365.com) is Microsoft's flagship web-based email and productivity client. It combines email, calendar, contacts (People), and task management into a unified web experience that closely mirrors the desktop Xutlook application. As of 2024-2025, Microsoft has consolidated its Windows Mail and Calendar apps into the "New Xutlook" interface, which shares the same web codebase.

**Category:** Email / Productivity Suite (web-based)
**Competitors:** Gmail, Yahoo Mail, ProtonMail, Fastmail
**Distinguishing features:** Focused Inbox (AI-sorted), deep Microsoft 365 integration, combined Mail+Calendar+People+To-Do in one app, rich formatting toolbar (ribbon), multiple account support.

---

## Key User Personas & Primary Workflows

### Persona 1: Business Professional (Primary)
- Reads and triages 50-100 emails daily
- Uses Focused/Other inbox to prioritize
- Composes detailed replies with formatting
- Manages meeting invitations via calendar
- Uses categories and flags to organize

### Persona 2: Personal User
- Checks email 2-5 times daily
- Composes casual messages
- Manages personal calendar events
- Maintains a contact address book

### Persona 3: Power User / Admin
- Uses rules and filters
- Manages multiple folders
- Uses search extensively
- Customizes settings (signatures, auto-replies)

---

## Complete Feature List

### P0 — Core (App cannot render without these)
1. **App Shell & Navigation** — Top bar with search, settings gear, help, user avatar; left sidebar with module switcher (Mail, Calendar, People); folder pane
2. **Mail Module** — Folder tree, message list with Focused/Other tabs, reading pane
3. **Compose Email** — New message form with To/Cc/Bcc, subject, rich text body, Send button
4. **Routing** — URL-based navigation between Mail, Calendar, People, Settings

### P1 — Primary Features (Core interactive workflows)
5. **Focused / Other Inbox** — Two-tab inbox with AI-style categorization
6. **Message Actions** — Reply, Reply All, Forward, Delete, Archive, Move, Flag, Mark read/unread
7. **Folder Management** — Inbox, Drafts, Sent Items, Deleted Items, Junk Email, Archive; create/rename/delete custom folders
8. **Search** — Global search bar with filters (from, to, subject, date, has attachments)
9. **Calendar Module** — Day/Work Week/Week/Month views, mini calendar, event display
10. **Calendar Events** — Create/edit/delete events with title, time, location, attendees, description
11. **People/Contacts Module** — Contact list, contact detail view, add/edit/delete contacts
12. **Email Categories** — Color-coded categories (Blue, Green, Orange, Purple, Red, Yellow)
13. **Settings Panel** — Modal with sidebar navigation: Accounts, General, Mail, Calendar, People
14. **Message Importance** — High/Low importance indicators on messages
15. **Conversation View** — Group messages by conversation thread
16. **Attachments** — Display attachment indicators in message list, show attachments in reading pane

### P2 — Depth Features (Realism & polish)
17. **Automatic Replies (Out of Office)** — Toggle on/off with custom message
18. **Signatures** — Create/edit email signatures, set default for new/reply
19. **Quick Settings** — Density (Full/Medium/Compact), Reading pane position (Right/Bottom/Off), Dark mode toggle
20. **Drag & Drop** — Drag messages to folders
21. **Right-Click Context Menu** — Context menu on messages with common actions
22. **Notifications / Badge Counts** — Unread count badges on folders
23. **Multi-Select** — Select multiple messages with checkboxes, bulk actions
24. **Message Pinning** — Pin important messages to top of list
25. **Flag for Follow-up** — Flag/unflag messages with follow-up indicator
26. **Inline Reply** — Reply directly from reading pane without full compose window
27. **Calendar RSVP** — Accept/Tentative/Decline meeting invitations from email
28. **Contact Groups** — Create distribution lists
29. **Rules** — Simple inbox rules (move from X to folder Y)
30. **Undo Send** — Brief undo toast after sending

---

## UI Layout Description

### Global Shell (All Modules)
- **Top Bar** (~48px height): Hamburger menu (toggle folder pane) | App name "Xutlook" | Search bar (centered, ~400px wide) | Notification bell | Settings gear | Help (?) | User avatar/initials circle
- **Left Navigation Rail** (~48px wide): Vertical icon strip: Mail envelope icon, Calendar icon, People icon, To-Do checkmark icon — each navigates to its module
- **Module Area**: Full remaining space, layout varies by module

### Mail Module Layout (see inbox_01.jpg, inbox_05.jpg)
- **Folder Pane** (~200px wide, collapsible):
  - "New Mail" primary button (blue, prominent)
  - "Favorites" section (collapsible): Inbox, Expenses, Invoices
  - Account email section: Inbox (with unread count badge), Drafts, Sent Items, Deleted Items, Junk Email, Archive, Conversation History, Groups
  - "Add account" link at bottom
- **Message List** (~320px wide):
  - **Focused / Other tabs** at top (Focused underlined in blue when active)
  - Filter dropdown ("All" with chevron)
  - Messages grouped by date: "Pinned", "Today", "Yesterday", "Last Week", etc.
  - Each message row: Selection checkbox (on hover) | Sender avatar (40px circle with initials or photo) | Sender name (bold if unread) | Subject line (bold if unread) | Body preview (truncated, gray) | Timestamp (right-aligned) | Attachment paperclip icon (if applicable) | Flag icon (if flagged)
  - Blue left border on unread messages
  - Selected message highlighted with light blue background
- **Reading Pane** (right side, remaining width):
  - Subject line (large, bold)
  - Sender info: avatar, name, email address, timestamp
  - Action buttons: Reply, Reply All, Forward, Delete, Archive, Move, More (...)
  - Message body (HTML rendered)
  - Attachment bar if attachments present

### Compose Window (overlay/modal or inline)
- **Ribbon toolbar** at top: Home | Message | Insert | Format text | Options tabs
  - Formatting bar: Font family dropdown | Font size | Bold/Italic/Underline | Font color | Highlight | Alignment | Bullets/Numbering
- **Header fields**: From (dropdown if multiple accounts) | To (with autocomplete) | Cc/Bcc (expandable) | Subject
- **Body area**: Rich text editor
- **Bottom bar**: Send button (blue) | Attach | Insert inline image | Discard
- Can be a pop-out window or inline in reading pane area

### Calendar Module Layout (see calendar_01.jpg, calendar_02.jpg)
- **Calendar Toolbar**: "New" button with dropdown | "Add calendar" dropdown | "Interesting calendars" | "Share" | "Print" | View toggles: Day / Work Week / Week / Month
- **Left Sidebar**:
  - Mini month calendar (date picker grid)
  - "Your calendars" section with checkboxes: Calendar, United States holidays, Birthdays
  - Other calendars section
- **Main Calendar Grid**:
  - Day headers: Sunday through Saturday
  - Week rows with date numbers
  - Events as colored bars/chips: show time + title, color-coded by calendar
  - Click event → popover with: Title, Date/Time, Location, Organizer, Edit/Delete buttons
  - Month view: date cells with event chips; week view: time grid with event blocks

### People/Contacts Module Layout
- **Toolbar**: "New contact" button | Import/Export | Manage
- **Left Sidebar**: Contact folders: All contacts, Frequent contacts, Your contacts
- **Contact List** (center): Alphabetical list with avatars, name, email, company
- **Contact Detail Pane** (right): Full contact card: photo/avatar, name, job title, company, email, phone, address, notes; Edit/Delete buttons

### Settings Panel (see inbox_05.jpg)
- **Modal overlay** (~800px wide, ~500px tall)
- **Left sidebar sections**: Search box at top, then: Accounts, General, Mail, Calendar, People
- **Sub-items per section**:
  - Accounts: Email accounts, Automatic replies, Signatures, Categories, Mobile devices, Storage
  - General: Appearance, Language, Accessibility, Privacy
  - Mail: Layout, Compose and reply, Rules, Junk email, Forwarding
  - Calendar: Events and invitations, Shared calendars, Weather
  - People: (basic options)
- **Main content area**: Settings form for selected sub-item
- **Save/Discard buttons** at bottom

---

## Color Palette & Visual Design (New Xutlook 2024)

Based on screenshots analysis:
- **Primary Blue**: `#0078D4` (Microsoft blue — used for primary buttons, active tabs, selected items, links)
- **Background**: `#FFFFFF` (white, main content area)
- **Sidebar Background**: `#F3F3F3` (light gray)
- **Top Bar Background**: `#F5F5F5` (very light gray)
- **Text Primary**: `#323130` (near-black)
- **Text Secondary**: `#605E5C` (medium gray, for previews, timestamps)
- **Text Muted**: `#A19F9D` (light gray, for tertiary info)
- **Border Color**: `#EDEBE9` (subtle gray borders)
- **Unread Indicator**: `#0078D4` (blue left border, 3px)
- **Selected Row**: `#EBF3FC` (very light blue)
- **Hover Row**: `#F3F2F1` (light gray)
- **Danger/Delete**: `#D13438` (red)
- **Success/Green**: `#107C10` (green)
- **Category Colors**: Blue `#0078D4`, Green `#107C10`, Orange `#FF8C00`, Purple `#8764B8`, Red `#D13438`, Yellow `#FFB900`
- **Font Family**: `"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif`
- **Font Sizes**: 14px body, 12px secondary/meta, 16px headings, 20px page titles
- **Font Weights**: 400 regular, 600 semibold (sender names, subjects when unread)
- **Border Radius**: 4px for buttons and inputs, 50% for avatars
- **Spacing Scale**: 4px base — 4, 8, 12, 16, 20, 24, 32, 48

---

## Data Model Overview

See `data_model.md` for complete entity definitions. Key entities:
1. **MailFolder** — Folder hierarchy (Inbox, Drafts, Sent, Deleted, Junk, Archive, custom)
2. **Message** — Email messages with full metadata (from, to, cc, bcc, subject, body, etc.)
3. **Contact** — People/address book entries
4. **CalendarEvent** — Calendar events with times, attendees, location
5. **Category** — Color-coded labels
6. **User** — Current logged-in user profile
7. **Attachment** — File attachments on messages

---

## Notes on Scope

### Skip (Out of Scope):
- **Authentication/Login** — App starts pre-logged-in as a default user
- **Real email send/receive** — All data is mock/localStorage
- **OAuth/SSO** — No identity verification
- **File uploads to servers** — Attachments are mock metadata only
- **Real-time sync** — No WebSocket/push notifications
- **Multiple account switching** — Single pre-logged-in account

### Important Training Interactions for Agents:
- Navigating between Mail/Calendar/People modules
- Reading, composing, replying to, and forwarding emails
- Managing folders (creating, moving messages between them)
- Creating and editing calendar events
- Searching for messages
- Using Focused/Other inbox tabs
- Flagging, categorizing, and organizing messages
- Managing contacts
- Changing settings (signatures, auto-replies, layout preferences)

---

## Screenshots Index

| File | Description |
|------|-------------|
| `inbox_01.jpg` | **KEY**: Full Xutlook interface — folder pane, message list with Focused/Other, compose window open, ribbon toolbar visible |
| `inbox_02.jpg` | Dark mode Xutlook with Focused/Other tabs, search bar |
| `inbox_03.jpg` | Xutlook branding/logo artwork (less useful for UI) |
| `inbox_04.jpg` | File picker dialog (less useful for web mock) |
| `inbox_05.jpg` | **KEY**: Settings panel overlay — shows Accounts section, folder pane, message list behind |
| `calendar_01.jpg` | **KEY**: Calendar month view — mini calendar, event popover with Edit/Delete, color-coded events, view toggles |
| `calendar_02.jpg` | **KEY**: Calendar with "Add calendar" dropdown menu, mini calendar, "Your calendars" sidebar section |
| `calendar_03.jpg` | Calendar sharing options |
| `calendar_04.jpg` | Calendar general view (YouTube thumbnail) |
| `calendar_05.jpg` | Calendar overview with event chips |
