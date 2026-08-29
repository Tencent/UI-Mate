# Xicrosoft Teams Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-11
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Reference screenshots: `assets/screenshots/` (34 images — view with Read tool for visual ground truth)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest microsoft_teams_mock -- --template react` (if not already created), install deps: `react-router-dom`, `date-fns`. NO external UI libraries — all components built from scratch. Use plain CSS files (not Tailwind). Match the slack_mock dependency pattern exactly.

- [x] **Visual design system**: Study `assets/screenshots/teams-web-view-react.png`, `teams-desktop-app.png`, `teams-welcome-tab.png`, `teams-hero-card.png`, and `teams-tab-in-channel.png`. Replicate the **exact** Xicrosoft Teams visual identity:
  - **Primary brand color**: `#6264A7` (Teams purple/indigo)
  - **Left rail dark bg**: `#292929` (charcoal/dark gray, NOT bright purple)
  - **Left rail active icon**: white icon on `#6264A7` rounded pill/highlight
  - **Selected item bg**: `#E8EBFA` (light purple tint)
  - **Notification badge**: `#C4314B` (red) with white text
  - **Main background**: `#FFFFFF`
  - **Sidebar background**: `#F5F5F5`
  - **Text primary**: `#242424`
  - **Text secondary**: `#616161`
  - **Border/divider**: `#E0E0E0`
  - **Hover bg**: `#F0F0F0`
  - **Link color**: `#5B5FC7`
  - **Online presence**: `#92C353` (green dot)
  - **Away**: `#FCD116` (yellow clock)
  - **Busy/DND**: `#C4314B` (red filled)
  - **Offline**: `#B4B4B4` (gray empty)
  - **Font family**: `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`
  - **Font sizes**: Header 20px/600, Subheader 16px/600, Body 14px/400, Caption 12px/400
  - **Border radius**: 4px for cards/containers, 50% for avatars, 16px for large rounded buttons
  - **Spacing scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px

- [x] **App layout** (see `assets/screenshots/teams-web-view-react.png` and `teams-desktop-app.png`): Three-panel layout:
  - **Left Icon Rail**: Fixed, 68px wide, `#292929` dark background. Contains vertical navigation icons with text labels beneath each: Activity (bell), Chat (chat bubble), Teams (people/grid), Calendar (calendar), Calls (phone), Files (folder), Apps (grid). Each icon is 20px, label is 10px. Active item has a left-side 3px blue bar indicator + icon highlighted on a `#6264A7` pill. Notification badge count (red circle, 16px diameter) on Activity and Chat icons.
  - **Secondary Sidebar**: 300px wide, `#F5F5F5` background, with a header area (title + action icons) and scrollable content list. Content changes based on active left rail icon.
  - **Main Content Area**: Remaining width, `#FFFFFF` background. Has a channel/chat header (48px), optional tab bar (40px), scrollable message area, and composer at bottom.
  - **Top Header Bar**: Full width, 48px tall, `#FFFFFF` background with bottom border. Contains: back/forward arrow buttons (left), centered search input (rounded, `#F5F5F5` background, placeholder "Search (Ctrl+E)"), right side has three-dot settings menu and user avatar (32px circle) with presence dot.

- [x] **Routing**: `App.jsx` with `BrowserRouter`, define routes:
  ```
  /                          → Redirect to /chat (default view)
  /activity                  → ActivityFeed page
  /chat                      → ChatList sidebar + ChatView main area
  /chat/:chatId              → ChatList sidebar + specific ChatView
  /teams                     → TeamList sidebar + ChannelView main area
  /teams/:teamId             → TeamList with expanded team
  /teams/:teamId/channels/:channelId → TeamList sidebar + ChannelView
  /calendar                  → CalendarView
  /calls                     → CallHistory
  /files                     → FilesBrowser
  /go                        → StateInspector (JSON debug)
  ```
  All routes except `/go` render inside a `MainLayout` wrapper that provides the left icon rail + top header. The secondary sidebar and main content change per route.

- [x] **State management**: `src/context/AppContext.jsx` + `src/utils/dataManager.js`. Follow the exact slack_mock pattern:
  - `AppContext` provides global state + action methods via React Context
  - `dataManager.js` exports: `getSessionId()`, `fetchCustomState(sid)`, `initializeData(sid, customState)`, `saveState(state, sid)`, `createInitialData()`
  - State structure defined in `data_model.md` § createInitialData() Structure
  - Persist to localStorage with key `teamsState_${sid}` and `teamsInitialState_${sid}`
  - Action methods: `sendMessage()`, `editMessage()`, `deleteMessage()`, `addReaction()`, `removeReaction()`, `createChannel()`, `createTeam()`, `createChat()`, `pinMessage()`, `unpinMessage()`, `markAsRead()`, `updatePresence()`, `updateStatus()`, `updateSettings()`, etc.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Returns JSON with `{ initial_state, current_state, state_diff }`. Render as formatted JSON in a `<pre>` tag. Calculate `state_diff` by deep-comparing initial vs current state objects.

- [x] **Session isolation**: `vite.config.js` mock-api plugin implementing:
  - `POST /post?sid=<sid>` with `{ action: "set" | "set_current" | "reset", state: {...} }`
  - `GET /state?sid=<sid>` → `{ stored_state, has_custom_state, sid }`
  - `GET /go?sid=<sid>` → `{ initial_state, current_state, state_diff }`
  - `POST /upload?sid=<sid>` (multipart/form-data) → `{ files: [{url, original_name, stored_name, size}] }`
  - `GET /files/<sid>/<filename>` → file content with Content-Type
  - Store state files in `.mock-states/` directory, uploads in `.mock-files/`

---

## P1 — Primary Features

Core features a user interacts with in the first 5 minutes. These are the interactive workflows needed for agent training.

### Chat System (Primary View)

- [x] **Chat list sidebar** (see `assets/screenshots/teams-hero-card.png` and `teams-web-view-react.png`): When "Chat" is active in left rail, the secondary sidebar shows:
  - Header: Bold "Chat" title (16px/600), three action icons top-right: filter (funnel), video (camera), compose new chat (pencil+square).
  - Filter row: Horizontal filter chips below header: "All", "Unread", "Muted" — clicking filters the list.
  - "Pinned" section (collapsible with arrow): pinned chats displayed first.
  - "Recent" section: remaining chats sorted by `lastMessageTimestamp` descending.
  - Each chat item (64px height): Left 40px circular avatar (with presence dot at bottom-right; for group chats show overlapping mini-avatars), center has name (14px/600 primary color) on top line, last message preview (12px/400 secondary color, single line truncated with ellipsis) on bottom line, right side shows timestamp (12px secondary) and unread count badge (if > 0, red `#C4314B` circle with white count).
  - Hover on chat item: light gray background `#F0F0F0`, three-dot menu icon appears on right.
  - Active/selected chat: `#E8EBFA` background with left 3px `#6264A7` border.
  - "Invite to Teams" button at the bottom of the sidebar (purple `#6264A7` filled button, full width).

- [x] **Chat view (message area)** (see `assets/screenshots/teams-web-view-react.png`): When a chat is selected:
  - **Chat header** (48px): Displays chat name (other person's name for 1:1, topic/group name for group), with a small pencil icon to rename (group chats only). Right side: video call icon, audio call icon, screen share icon, participants count icon, three-dot menu.
  - **Tab bar** (40px, below header): Horizontal tabs: "Chat" (default, active with blue `#6264A7` 2px bottom border), "Files", "Organization" (for 1:1), "Activity". Each tab 14px/400, active tab 14px/600 with blue underline. "+" button at end to add tab.
  - **Message list** (scrollable, reverse chronological, most recent at bottom): Messages grouped by date with date divider ("Today", "Yesterday", "March 10, 2025"). Each message: 32px circular avatar on left, sender display name (14px/600) and relative timestamp ("2:30 PM", "Yesterday 4:15 PM") on same line to right of name, message body (14px/400) below name. For consecutive messages from same sender within 1 minute, collapse avatar and name (show only the body text with slight indent). Edited messages show "(Edited)" in gray italics after content.
  - **Message hover actions**: On hover over any message, show a floating action bar above-right of message: emoji reaction button (smiley face), reply button (curved arrow), more options (three dots). Bar has white background with subtle shadow, rounded corners.
  - **Reactions display**: Below message body, show reaction badges: each is a pill with emoji + count (e.g., "👍 2"), gray border, 24px height. Current user's reactions have blue `#6264A7` border. Clicking toggles the current user's reaction. Hovering shows tooltip with reactor names. "+" button at end opens emoji picker.
  - **Read receipts**: For the last message sent by current user, show small avatar circles (16px) of readers below the message aligned right (seen by avatars).

- [x] **Message composer** (see `assets/screenshots/teams-web-view-react.png` bottom): Fixed at bottom of chat/channel view:
  - **Compose box**: Multi-line text input, min height 40px, expands up to 200px. Placeholder: "Type a new message". Border: 1px solid `#E0E0E0`, focus border: 2px solid `#6264A7`.
  - **Formatting toolbar** (below input when focused or via format button): Row of formatting icons: Bold (B), Italic (I), Underline (U), Strikethrough (S), bullet list, numbered list, indent decrease, indent increase, quote block, code snippet, clear formatting. Each icon 28px button with gray icon, hover shows tooltip.
  - **Action toolbar** (below compose box): Left side icons: Format text (A with underline), Insert image, Attach file (paperclip), Emoji (smiley face), GIF, Stickers, Schedule send. Right side: Send button (arrow icon, `#6264A7` purple background, white icon, enabled only when text is non-empty; disabled state: gray background). Also an "expand" button to toggle full compose mode.
  - **@mention support**: Typing "@" in composer opens an autocomplete dropdown above the cursor showing matching users from the team/chat participants. Each item shows avatar, display name, and title. Clicking inserts a mention token (styled as blue text with hover card). Mentions are tracked in the message's `mentions` array.
  - **Enter to send**: Pressing Enter sends the message (when not in format mode). Shift+Enter creates a new line. In expanded format mode, a "Send" button must be clicked.

- [x] **Send message action**: When message is sent:
  1. Create message object with new ID, current user as sender, current timestamp, content, mentions, attachments
  2. Append to `messages[containerId]` array
  3. Update chat/channel's `lastMessagePreview`, `lastMessageTimestamp`
  4. Clear composer
  5. Scroll message list to bottom
  6. Save state to localStorage
  7. If chat was hidden, unhide it and move to top of chat list

- [x] **Edit message**: Clicking "Edit" from message hover menu (three dots → Edit) replaces the message body with an inline editor (same as composer but smaller). Show "Save" and "Cancel" buttons below. Save updates `content`, sets `lastEditedDateTime`, adds "(Edited)" indicator.

- [x] **Delete message**: Clicking "Delete" from message hover menu shows a confirmation dialog ("Are you sure you want to delete this message?") with "Delete" (red) and "Cancel" buttons. Delete sets `deletedDateTime` and replaces content with "This message has been deleted." in italic gray text.

- [x] **React to message**: Clicking the smiley face on message hover shows the emoji quick-reaction bar (6 common emojis: 👍 ❤️ 😂 😮 😢 😡) plus a "+" button that opens the full emoji picker grid. Clicking an emoji toggles the current user in that reaction's users array. Full emoji picker: modal overlay, grid of emojis organized by category tabs (Smileys, People, Animals, Food, Travel, Activities, Objects, Symbols), with search bar at top.

- [x] **New chat / compose**: Clicking the compose icon in chat sidebar header opens a new chat view. "To:" field at top with user search autocomplete (type to filter users, click to add). Multiple users creates a group chat. "Add a group name" field appears for group chats. Message composer below.

### Teams & Channels

- [x] **Team list sidebar** (see `assets/screenshots/teams-desktop-app.png` and `teams-live-share-chat.png`): When "Teams" is active in left rail, secondary sidebar shows:
  - Header: Bold "Teams" title, action icons: settings gear, filter, create team (+).
  - "Pinned" section (if any pinned teams).
  - "Your teams" section: Expandable tree list. Each team row: team avatar (colored circle with 2-letter initials, or image), team name (14px/600), three-dot menu (hover), expand/collapse chevron.
  - Expanded team shows its channels indented below: channel icon (# for standard, lock for private, link for shared), channel name (14px/400). Unread channels are bold with unread count badge.
  - "See all channels" link at bottom of each team's channel list if more than 5 channels.
  - Bottom: "Create a team" and "Join or create a team" links.
  - Selected channel: `#E8EBFA` background.
  - Channel right-click context menu: "Notifications" (sub-menu), "Pin", "Hide", "Manage channel", "Get link to channel".

- [x] **Channel view (Posts tab)** (see `assets/screenshots/teams-desktop-app.png`): When a channel is selected:
  - **Channel header** (48px): Channel icon (# or lock) + channel display name (16px/600) + description text (12px/400 secondary, truncated). Right side: video meet now button, channel info (i) button that opens details panel.
  - **Tab bar**: "Posts" (default active), "Files", plus any custom tabs. Active tab has blue 2px bottom border. "+" button to add tab (opens tab picker modal).
  - **Posts content**: Similar to chat messages BUT with threading model — each message is a "conversation" that can have replies. Messages show "Reply" link below (with reply count if has replies: "5 replies from Alex, Megan..."). New conversation starts with a separator.
  - **"New conversation" button**: At bottom of message area (above composer), a prominent card with "Start a new conversation. Type @ to mention someone." Clicking focuses the composer.
  - **Channel message composer**: Same as chat composer but with additional "Subject" field (optional, small text input above main content field). "Post" button instead of "Send".

- [x] **Thread panel** (see `assets/screenshots/teams-desktop-app.png` right side): Clicking "Reply" or a thread reply count on a channel message opens a 400px right-side panel:
  - Header: "Thread" text + X close button.
  - Parent message displayed at top (full message with avatar, name, timestamp, content, reactions).
  - Horizontal divider with "N replies" count.
  - Reply messages below (same layout as regular messages).
  - Thread composer at bottom (smaller version of main composer).
  - Panel slides in from right with smooth animation.

- [x] **Create team modal**: Triggered from team list sidebar. Modal overlay with:
  - Step 1: "Create a team" title. Team name input (required, max 50 chars), description textarea (optional). Privacy radio: Public / Private. "Create" and "Cancel" buttons.
  - Step 2 (after create): "Add members" — search input to find and add users. Each added member shows as a chip with X to remove. Role dropdown per member (Owner/Member). "Add" and "Skip" buttons.

- [x] **Create channel modal**: Triggered from team three-dot menu → "Add channel". Modal with: Channel name input (required), description textarea, privacy toggle (Standard/Private). "Add" and "Cancel" buttons.

### Activity Feed

- [x] **Activity feed view** (when "Activity" is active in left rail): Secondary sidebar shows activity list:
  - Header: "Activity" title, filter dropdown (All, Unread, Mentions).
  - Feed items sorted by timestamp desc. Each item (72px height): Left icon indicating type (@ for mention, curved arrow for reply, emoji for reaction, calendar for meeting), sender avatar (32px), sender name (14px/600), action description ("mentioned you in General", "replied to your message", "reacted 👍 to your message") in 12px secondary, preview text (12px, 1-line truncated), timestamp (12px, "2h ago", "Yesterday").
  - Unread items have a blue left border (3px `#6264A7`) and slightly bolder text.
  - Clicking navigates to the source message in its channel/chat.
  - Hover shows three-dot menu with "Mark as read/unread", "Turn off notifications".
  - "Mark all as read" action in header.

### Search

- [x] **Global search**: Clicking the search bar in top header expands it. Typing shows a dropdown with:
  - Recent searches section.
  - Suggested results grouped by: People, Messages, Files.
  - Each result: relevant icon, title, context (channel/chat name), preview snippet with highlighted match text.
  - Pressing Enter navigates to a full search results page with tabs: "All", "Messages", "People", "Files".
  - Message results show: sender, channel/chat context, message preview with match highlighted, timestamp.
  - People results show: avatar, name, title, department, presence.
  - File results show: file icon, name, location, modified date.

### User Presence & Profile

- [x] **User presence indicators**: 12px colored dot overlaid on bottom-right of avatar circles throughout the app:
  - Available: green filled circle (#92C353)
  - Away: yellow half-filled circle (#FCD116)
  - Busy: red filled circle (#C4314B)
  - Do Not Disturb: red circle with white dash (#C4314B)
  - Be Right Back: yellow half-filled (#FCD116)
  - Offline: gray empty circle with gray border (#B4B4B4)
  - In a Meeting: red filled circle (#C4314B)
  Show presence on: sidebar chat items, message avatars, team member lists, search results, user profile cards.

- [x] **User profile card (hover popover)**: Hovering over any user's avatar or name shows a popover card (320px wide, white background, shadow):
  - Top section: Large avatar (64px), display name (16px/600), job title (14px/400), department (12px/400 secondary).
  - Presence status with dot + text ("Available", "In a meeting").
  - Custom status message with emoji (if set).
  - Action buttons row: Chat (message bubble), Video call (camera), Audio call (phone), Email (envelope), More (three dots).
  - Contact info: email, phone number.
  - "View full profile" link at bottom.

- [x] **Set own status/presence**: Clicking own avatar in top-right header opens a dropdown:
  - Current user avatar (large 64px), display name, email.
  - Presence selector: list of presence options with colored dots — Available, Busy, Do not disturb, Be right back, Appear away, Appear offline. Clicking sets `currentUser.presence`.
  - "Set status message" link → opens inline input for custom status text + emoji picker. Duration dropdown (Don't clear, 1 hour, 4 hours, Today, This week, Custom). "Done" and "Clear" buttons.
  - "Settings" link → navigates to settings page.
  - Sign out (non-functional in mock, or just shows toast "Sign out disabled in mock").

---

## P2 — Secondary Features

Depth and realism. Implement after P1 is solid.

### Calendar View

- [x] **Calendar page**: When "Calendar" is active in left rail, main area shows a calendar:
  - **Header**: "Calendar" title, date navigation (< Today >), view switcher buttons: "Day" | "Work week" | "Week". Current date displayed (e.g., "March 11, 2025").
  - **Day view** (default): Time column on left (7 AM → 7 PM in 1-hour slots, 60px per hour), meeting cards positioned at correct times spanning their duration. Each meeting card: colored left border (2px, based on category), title (14px/600), time range, participant count icon, "Join" button (appears on hover, purple). Current time indicator: red horizontal line across full width.
  - **"+ New meeting" button**: Top-right corner, purple primary button.
  - Click on meeting card: opens meeting detail panel on right side (360px) showing full meeting info: title, date/time, organizer, participant list with RSVP status and presence, description, "Join" button, "Chat with participants" link.

- [x] **New meeting modal**: Triggered from "+ New meeting" button. Modal with fields:
  - Title input (required)
  - Date picker (calendar dropdown)
  - Start time / End time (time dropdowns, 30-min intervals)
  - "Add required attendees" — user search with autocomplete
  - "Add optional attendees" — user search
  - Location input (defaults to "Xicrosoft Teams Meeting")
  - Description textarea (rich text)
  - "Send" and "Discard" buttons
  - Creating a meeting adds to `meetings` array and creates a system notification for participants.

### Calls Page

- [x] **Call history list**: When "Calls" is active in left rail:
  - **Header**: "Calls" title.
  - **Sidebar tabs**: "History", "Speed dial", "Voicemail".
  - **History tab**: List of call records sorted by date desc. Each item (56px): caller/callee avatar (32px), name (14px/600), call type icon (incoming green arrow, outgoing blue arrow, missed red arrow), duration or "Missed" text (12px secondary), timestamp (12px).
  - **Speed dial tab**: Grid of favorite contacts (avatar + name), click to start call.
  - **"Make a call" button**: Opens a dialpad overlay with number pad and contact search.

### Files Page

- [x] **Files browser**: When "Files" is active in left rail:
  - **Header**: "Files" title.
  - **Sidebar sections**: "Recent", "Xicrosoft Teams", "Downloads".
  - **Recent view** (default): Table with columns: File icon + Name (sortable), Date Modified (sortable), Modified By, Location (channel/chat name). Each row: file type icon (PDF red, Word blue, Excel green, PowerPoint orange, image thumbnail), name as link, date, user name, location link.
  - **Sort/filter**: Click column headers to sort. Filter by file type.
  - **File actions**: Hover shows three-dot menu → Open, Download, Copy link, Move to, Delete.

### Channel Details Panel

- [x] **Channel info side panel**: Clicking (i) icon in channel header opens a 360px right panel:
  - Header: Channel name + X close button.
  - Tabs: "About", "Members", "Analytics".
  - **About tab**: Channel description (editable by owners), creation date, channel type (Standard/Private).
  - **Members tab**: List of channel members with avatar, name, role badge (Owner/Member), presence dot. "Add member" button for private channels. Search filter at top.
  - Actions: "Edit channel", "Get link", "Manage notifications", "Hide channel", "Leave channel" (if not owner), "Delete channel" (owner only, with confirmation).

### Additional Interactions

- [x] **Pin/Unpin message**: From message three-dot menu → "Pin". Pinned messages show a 📌 indicator. Channel/chat has a "Pinned messages" section accessible via a pin icon in the header.

- [ ] **Forward message**: From message three-dot menu → "Forward". Opens a "Forward to" modal with chat/channel search. Select destination, optional additional message, click "Send".

- [ ] **Bookmark/Save message**: From message three-dot menu → "Save this message". Saved messages accessible from user profile menu → "Saved". Each saved message shows context (source channel/chat), preview, timestamp.

- [ ] **Mute/Unmute channel or chat**: Right-click context menu or three-dot menu → "Mute" / "Unmute". Muted items show a muted icon (speaker with slash) and don't increment notification badge count.

- [ ] **Channel notifications settings**: Right-click channel → "Channel notifications" → modal with options: "All activity", "Off", "Custom" (with checkboxes: new posts, all replies, mentions, channel @mentions).

- [x] **Keyboard shortcuts**: Implement key handlers:
  - `Ctrl+E` or `Ctrl+F`: Focus search bar
  - `Ctrl+N`: New chat
  - `Ctrl+,`: Open settings
  - `Ctrl+Shift+M`: Toggle mute (in meeting context)
  - `Ctrl+1` through `Ctrl+5`: Navigate to Activity, Chat, Teams, Calendar, Calls
  - `Ctrl+.`: Show keyboard shortcuts dialog
  - `Escape`: Close current panel/modal

- [ ] **Settings page**: Accessible from user avatar menu → Settings or Ctrl+,. Modal overlay with sidebar navigation:
  - **General**: Theme toggle (Light/Dark/High contrast), Language, Auto-start, Notifications preview.
  - **Privacy**: Read receipts toggle, Priority access, Blocked contacts.
  - **Notifications**: Banner, sound, and badge settings per notification type (Messages, Mentions, Reactions, Meetings).
  - Each setting has toggle switches, radio buttons, or dropdowns as appropriate.

- [ ] **Dark theme support**: When `settings.theme === "dark"`:
  - Main bg: `#1F1F1F`, Sidebar bg: `#292929`, Text primary: `#FFFFFF`, Text secondary: `#ADADAD`, Border: `#3D3D3D`, Hover bg: `#333333`, Selected bg: `#383854`, Cards bg: `#292929`. Keep `#6264A7` as accent. Apply via CSS variables on `<body>` data attribute.

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs. See `data_model.md` for field definitions.

- [x] **Users**: 10 users with Microsoft demo-style names: Adele Vance (current user — Senior Marketing Manager, Seattle), Alex Wilber (Software Engineer), Megan Bowen (HR Manager), Nestor Wilke (IT Admin), Joni Sherman (Legal Counsel), Lee Gu (UX Designer), Lynne Robbins (VP of Sales), Diego Siciliani (Finance Analyst), Pradeep Gupta (Data Scientist), Henrietta Mueller (Project Manager). Varied presence statuses (3 available, 2 away, 2 busy, 1 offline, 1 in a meeting, 1 dnd). Use `https://i.pravatar.cc/150?u=<userId>` for avatar URLs.

- [x] **Teams**: 4 teams:
  1. "Contoso Engineering" (visibility: private, members: Alex, Adele, Lee, Nestor, Pradeep, Diego, Henrietta — 7 members, owners: Alex)
  2. "Marketing" (visibility: private, members: Adele, Lynne, Megan, Joni, Lee — 5 members, owners: Adele)
  3. "Product Design" (visibility: private, members: Lee, Adele, Alex, Megan, Henrietta — 5 members, owners: Lee)
  4. "All Company" (visibility: public, members: all 10 users, owners: Nestor)

- [x] **Channels**: ~14 channels:
  - Contoso Engineering: "General" (20 messages), "Backend" (15 messages), "Frontend" (12 messages), "DevOps" (8 messages), "Code Reviews" (10 messages)
  - Marketing: "General" (15 messages), "Campaigns" (10 messages), "Social Media" (8 messages), "Brand Guidelines" (5 messages, private)
  - Product Design: "General" (12 messages), "UI/UX Research" (10 messages), "Design Reviews" (8 messages)
  - All Company: "General" (10 messages), "Announcements" (5 messages)

- [x] **Chats**: 8 conversations:
  - 4 × oneOnOne: Adele↔Alex (15 messages), Adele↔Megan (10 messages), Adele↔Lynne (8 messages), Adele↔Lee (12 messages)
  - 3 × group: "Project Kickoff" (Adele, Alex, Lee, Henrietta — 10 messages), "Lunch Plans" (Adele, Megan, Joni, Diego — 8 messages), "Design Sprint" (Lee, Adele, Alex — 6 messages)
  - 1 × meeting chat: linked to "Sprint Planning" meeting

- [x] **Messages**: ~150 total messages with realistic content:
  - Mix of short messages ("Sounds good!", "Thanks!"), medium messages (2-3 sentences about work topics), and longer messages (code snippets, bulleted lists, meeting notes).
  - ~20% of messages have reactions (1-3 reactions each, mostly 👍 ❤️ 😂).
  - ~10% are threaded (parent message + 2-5 replies).
  - ~5% have @mentions.
  - ~3% have file attachments.
  - Messages should reference realistic work topics: sprint planning, design reviews, deployment status, bug reports, marketing campaigns, quarterly results.
  - Include a few system event messages ("Alex Wilber added Pradeep Gupta to the team").

- [x] **Meetings**: 8 events for today and tomorrow:
  - Today 9:00-9:30: "Daily Standup" (recurring, organizer: Alex, 6 attendees)
  - Today 10:00-11:00: "Sprint Planning" (organizer: Henrietta, 5 attendees)
  - Today 13:00-13:30: "1:1 with Lynne" (organizer: Adele, 2 attendees)
  - Today 14:00-15:00: "Design Review" (organizer: Lee, 4 attendees)
  - Today 16:00-17:00: "All Hands" (organizer: Nestor, 10 attendees)
  - Tomorrow 9:00-9:30: "Daily Standup" (recurring)
  - Tomorrow 11:00-12:00: "Marketing Strategy" (organizer: Adele, 4 attendees)
  - Tomorrow 15:00-15:30: "Budget Review" (organizer: Diego, 3 attendees)

- [x] **Notifications**: 15 activity feed items for the current user (Adele):
  - 3 × mention notifications (unread)
  - 3 × reply notifications (1 unread, 2 read)
  - 3 × reaction notifications (read)
  - 2 × meeting reminder notifications (unread)
  - 2 × system notifications (channel created, member added)
  - 2 × assignment notifications (read)

- [x] **Files**: 12 shared files:
  - Q3_Roadmap.pdf (shared in Engineering/General)
  - Brand_Guidelines_v2.docx (Marketing/Brand Guidelines)
  - Sprint_Backlog.xlsx (Engineering/General)
  - Design_Mockups.fig (Product Design/Design Reviews)
  - Meeting_Notes_Mar10.docx (chat: Project Kickoff)
  - Logo_Final.png (Marketing/Social Media)
  - API_Documentation.md (Engineering/Backend)
  - Budget_2025.xlsx (chat: Adele↔Diego)
  - Team_Photo.jpg (All Company/General)
  - Release_Notes_v3.1.md (Engineering/DevOps)
  - Competitor_Analysis.pptx (Marketing/Campaigns)
  - UX_Research_Report.pdf (Product Design/UI/UX Research)

- [x] **Calls**: 5 call history entries:
  - Incoming from Alex, completed, 12 min, video, yesterday
  - Outgoing to Lynne, completed, 8 min, audio, yesterday
  - Incoming from Megan, missed, 2 days ago
  - Outgoing to Diego, completed, 3 min, audio, 3 days ago
  - Incoming from Nestor, completed, 25 min, video, 4 days ago

---

## Out of Scope

Dev must NOT implement these:

- **Authentication / login** — app starts pre-logged-in as Adele Vance (user_1)
- **Real video/audio calling** — call page shows history only, no WebRTC
- **Real file upload/download** — files are mock data with placeholder thumbnails
- **Real-time messaging** — no WebSocket, state updates are local only
- **Microsoft 365 integration** — no real SharePoint, OneDrive, Outlook
- **External app integrations** — tabs show placeholder content
- **AI/Copilot features** — no Copilot integration
- **Mobile responsive layout** — desktop-only (min-width: 1024px)
- **Admin/tenant management** — no IT admin features
- **Email notifications** — no real email sending
- **SSO/OAuth** — no identity providers
