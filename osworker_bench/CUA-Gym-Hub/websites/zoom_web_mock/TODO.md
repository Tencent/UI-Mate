# Xoom Web Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing codebase: Already scaffolded with Vite+React, has basic Home/Meetings/Contacts/Recordings/Settings/Room pages

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell Improvements

> The project is already scaffolded. These items fix/upgrade the existing shell to match the real Xoom Workplace client.

- [x] **Visual design system overhaul**: Study `assets/screenshots/000003.jpg` (Home tab) and `assets/screenshots/chat/000001.jpg` (Team Chat). The real Xoom Workplace uses a **horizontal top navigation bar** (not a left sidebar). Current implementation has a vertical left sidebar which is incorrect. Redesign to match:
  - **Top navigation bar** (~48px tall, white background, bottom border `#E0E0E0`):
    - Left section: Xoom logo icon (blue `#0B5CFF` circle with white "Z"), back/forward nav arrows (gray), search bar with `Ctrl+F` hint (gray bg `#F1F1F1`, rounded-full, ~240px wide)
    - Center section: Tab icons in a row — Home (house icon), Team Chat (chat bubble), Meetings (clock icon), Contacts (person+), with text labels below each icon. Active tab is blue `#0B5CFF` with text, inactive is gray `#747487`
    - Right section: Settings gear icon, user avatar (32px circle)
  - **Color palette update** in `tailwind.config.js`:
    - `xoom-blue: '#0B5CFF'` (primary — was `#2D8CFF`, needs update to match real Xoom)
    - `xoom-orange: '#F26D21'` (New Meeting button)
    - `xoom-bg: '#F6F6F6'` (page background)
    - `xoom-dark: '#232333'` (text)
    - `xoom-gray: '#747487'` (secondary text)
    - `xoom-border: '#E0E0E0'` (borders)
    - `xoom-hover: '#E8F0FE'` (hover states)
    - `xoom-meeting-bg: '#242424'` (meeting room dark bg)
    - `xoom-toolbar-bg: '#1A1A1A'` (meeting toolbar)
  - Typography: Use `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
  - Remove the 96px left sidebar entirely. Replace with top nav bar.
  - The header below the nav bar is no longer needed (page title was in header); each page handles its own header.

- [x] **Layout.jsx complete rewrite**: Replace the current sidebar layout with:
  - `<div className="flex flex-col h-screen">` → top nav bar + main content area
  - Top nav: 48px fixed, full width, flex row with left/center/right sections as described above
  - Active tab highlight: icon + text turn blue, small blue dot or underline indicator
  - Main content: `flex-1 overflow-auto bg-[#F6F6F6]` below the nav
  - For Team Chat route: main content has its own 3-column layout (sidebar + messages + info panel) — handled by the TeamChat component itself
  - Hide top nav bar when on `/room/:id` and `/go` routes (full-screen modes)

- [x] **Routing update** in `App.jsx`: Add new routes:
  - `/chat` → TeamChat page (NEW)
  - `/chat/:channelId` → TeamChat page with specific channel selected
  - Keep existing: `/` (Home), `/meetings` (Meetings), `/contacts` (Contacts), `/recordings` (Recordings), `/settings` (Settings), `/room/:id` (Room), `/go` (StateInspector)

- [x] **State management expansion** in `StoreContext.jsx`: Add new state slices and actions for Team Chat. See `data_model.md` for full structure. Add:
  - `channels` state (array of ChatChannel objects)
  - `messages` state (object keyed by channelId → array of ChatMessage objects)
  - `addChannel(channel)` action
  - `deleteChannel(channelId)` action
  - `sendMessage(channelId, message)` action
  - `editMessage(channelId, messageId, newText)` action
  - `deleteMessage(channelId, messageId)` action
  - `addReaction(channelId, messageId, emoji)` action — toggles reaction for current user
  - `toggleContactStar(contactId)` action
  - `updateContactStatus(contactId, status)` action
  - `deleteContact(contactId)` action
  - `updateUser(updates)` action (for profile editing)
  - `addRecording(recording)` action
  - Update `getStateSnapshot()` to include `channels` and `messages` in both initial and current state, and add `channels_changed` and `messages_changed` to state_diff

- [x] **Data initialization expansion** in `initialData.js`: Update `createDefaultData()` to include:
  - `channels`: 6 ChatChannel objects (3 channels + 2 DMs + 1 group DM) — see `data_model.md §ChatChannel`
  - `messages`: Object with message arrays for each channel — see `data_model.md §ChatMessage`. Include 10-15 messages for General, 5-8 for Engineering, 3-5 for DMs
  - Expand `contacts` to 8 contacts with `department`, `starred` fields — see `data_model.md §Contact`
  - Expand `meetings` to 5 meetings — see `data_model.md §Meeting`
  - Expand `recordings` to 3 recordings — see `data_model.md §Recording`
  - Add `general` and `chat` settings sections — see `data_model.md §Settings`
  - Add normalizers: `normalizeChannel()`, `normalizeMessage()` following the existing pattern
  - Use `https://ui-avatars.com/api/?name=First+Last&background=RANDOM&color=fff&size=128` for avatars instead of `picsum.photos` (more deterministic)

- [x] **`/go` endpoint enhancement**: Update `StateInspector.jsx` and vite mock-api to include `channels` and `messages` in state output. The `state_diff` should compute granular diffs: count of added/removed/modified meetings, contacts, channels, messages.

- [x] **Session isolation update**: Ensure `channels` and `messages` are saved/loaded from localStorage with `sid` scoping, same as existing entities.

---

## P1 — Primary Features

### Team Chat (NEW — highest priority new feature)

- [x] **TeamChat page** (`src/pages/TeamChat.jsx`): Three-column layout matching `assets/screenshots/chat/000001.jpg`:
  - **Left sidebar** (~240px, white bg, `#E0E0E0` right border):
    - Top: "Team Chat" header with dropdown caret + compose new message button (pencil icon, blue)
    - Quick access links: "Mentions", "Missed Calls", "Contact Requests", "More" (each with icon)
    - "Starred" collapsible section: list of starred channels/DMs
    - "Channels" collapsible section header with `+` button to create channel; list of `#channel-name` items
    - "Recents" collapsible section: recent DMs/group DMs showing avatar + name + last message preview + time + unread badge (blue circle with count)
    - Clicking a channel/DM sets it as active (highlighted with light blue bg `#E8F0FE`)
  - **Center message area** (flex-1, white bg):
    - Top bar: channel name (bold, `#` prefix for channels), member count, search in channel icon, phone icon, video icon, info (i) icon to toggle right panel
    - Message list: scrollable, reverse-chronological (newest at bottom), each message shows:
      - Avatar (36px circle) on left
      - Sender name (bold, `#232333`) + timestamp (gray, `#747487`, relative like "10:30 AM" or "Yesterday")
      - Message text (supports basic markdown: **bold**, *italic*, `code`, ```code blocks```)
      - Hover: show action icons — reply (arrow), react (smiley), bookmark (flag), more (⋯)
      - Reactions bar below message if reactions exist: each reaction is a pill (emoji + count), clicking toggles user's reaction
      - Thread indicator: if `replyCount > 0`, show "N replies" link that opens thread
    - Pinned messages banner: if channel has pinned messages, show "N pinned messages" at top
    - Message composer at bottom (~60px):
      - Formatting toolbar: bold, italic, strikethrough, code, bulleted list, numbered list, blockquote
      - Text input area (auto-expanding textarea)
      - Below toolbar: emoji picker button, `@` mention button, file attach button, GIF button, code snippet button, audio clip button, more (`...`) button
      - Send button (blue arrow, right side) — disabled when empty
  - **Right info panel** (~280px, white bg, `#E0E0E0` left border, toggleable via `(i)` icon):
    - "Explore This Channel" header
    - Search in channel
    - Members section (collapsible): list of members with avatar, name, role badge (Owner/Admin/Member)
    - "View All N Members" link
    - Mention Groups section
    - Channel Meetings section
    - Whiteboards section
    - Pin History section
    - Bookmark Messages section
    - Notifications section
    - More Options section
    - "Leave Channel" link (red text) at bottom

- [x] **Create Channel modal**: Button in sidebar "Channels" header opens modal:
  - Channel name input (required)
  - Channel description input (optional)
  - Private/Public toggle
  - Add members multi-select (search contacts)
  - Create / Cancel buttons

- [x] **Message sending**: Type in composer, press Enter or click Send. Message appears immediately at bottom of message list. Updates `messages` state in context. Auto-scroll to bottom on new message.

- [x] **Message reactions**: Hover message → click smiley → show emoji picker (simple grid of ~20 common emojis: 👍 ❤️ 😂 😮 😢 🎉 🔥 👀 ✅ ❌ 🙏 💯 🚀 👏 💪 🤔 😊 🫡 ⭐ 🎯). Clicking adds/removes user's reaction. Clicking existing reaction pill toggles.

- [x] **Message editing & deletion**: Hover own message → click `⋯` → dropdown with "Edit Message" and "Delete Message". Edit: replaces composer with edit mode showing original text + Save/Cancel. Delete: confirmation dialog then removes message. Edited messages show "(edited)" label.

- [x] **Channel switching**: Click channel/DM in sidebar → updates URL to `/chat/:channelId`, loads messages for that channel, scrolls to bottom.

- [x] **DM conversations**: In sidebar "Recents" section, clicking a DM shows 1-on-1 messages. DM header shows contact's avatar + name + status indicator. Compose works the same as channels.

### Home Tab Improvements

- [x] **New Meeting dropdown**: The "New Meeting" button (orange) should have a small dropdown caret (▾). Clicking the caret shows a dropdown menu with options:
  - "Start with Video" (default)
  - "Start without Video"
  - "Use My Personal Meeting ID (PMI)" — shows PMI number
  - "Screen Share Only"
  Clicking the main button area starts a meeting with video (default behavior, already works).

- [x] **Home tab time display improvement**: Move the time/date display to the **top-left** of the content area (not inside the right panel). Large bold time (e.g., "2:30 PM") + date below ("Monday, March 10"). Match `assets/screenshots/000004.jpg` layout. Currently time is inside the right panel with a background image — should be cleaner, just text on the page background.

- [x] **Upcoming meetings panel improvement**: Right side panel should be cleaner — white card, no background image. Show upcoming meetings as a simple list with: blue left border accent, meeting title, time, "Start" button. If no meetings: illustration + "No upcoming meetings today" text.

### Meetings Tab Improvements

- [x] **Edit meeting**: Clicking a meeting row opens the detail modal (already works). Add an "Edit" button in the detail modal that transforms the view into an editable form (same fields as Schedule modal) pre-filled with current values. Save updates the meeting via `updateMeeting()`.

- [x] **Recurring meeting indicator**: In the meeting list, recurring meetings should show a "recurring" icon (🔁 or circular arrows icon) next to the title. The detail modal should display recurrence info: "Repeats: Weekly, every Monday".

- [x] **Meeting search**: Add a search input above the meeting list that filters meetings by title or meeting ID as the user types.

### In-Meeting Room Improvements

- [x] **Participants side panel**: Clicking "Participants" toolbar button toggles a slide-in panel on the right (~300px):
  - Header: "Participants (N)" with close (×) button
  - Search participants input
  - List of participants: avatar (32px), name, host badge, mute status icon
  - For each participant on hover: Mute/Ask to unmute, Pin, Spotlight, Make host, Remove buttons
  - Bottom: "Invite" button, "Mute All" / "Unmute All" buttons
  - Add mock participants to the Room state: when room opens, start with "You" + 1-2 others joining after 2-3 seconds. Add 1-2 more after 5 seconds.

- [x] **In-meeting chat side panel**: Clicking "Chat" toolbar button toggles a slide-in panel on the right (~300px):
  - Header: "Meeting Chat" with close (×) button
  - Message list: simple chat messages (name: message format, with timestamp)
  - Compose box at bottom: text input + send button
  - "To:" dropdown: "Everyone", or specific participant names
  - Pre-populate with a few mock chat messages (e.g., "Hi everyone!", "Can you share your screen?")
  - Sending adds to the local chat list

- [x] **Meeting toolbar: Reactions button**: Clicking "Reactions" in toolbar shows a floating panel above with reaction options:
  - Row of emoji reactions: 👏 👍 ❤️ 😂 🎉 😮
  - "Raise Hand" button (hand icon) — toggles a raised-hand icon overlay on user's video tile
  - Selecting a reaction shows a floating emoji animation on the user's video tile for 3 seconds, then disappears

- [x] **Meeting toolbar: Record button**: Add "Record" button to toolbar (between Share Screen and Reactions, matching `assets/screenshots/settings/000001.jpg`). Clicking toggles recording state:
  - Not recording: gray "Record" icon + label
  - Recording: red pulsing dot + "Recording" label, red indicator in top-left corner of meeting
  - Clicking again shows "Stop Recording" confirmation

- [x] **Gallery/Speaker view toggle**: Top-right corner button (`assets/screenshots/000005.jpg` shows "View" button) toggles between:
  - Gallery view (grid layout, current implementation) — equal-sized tiles
  - Speaker view: large main tile for "active speaker" + strip of small tiles on top or right for other participants

- [x] **Meeting info overlay improvement**: Top-left overlay should show:
  - Green shield icon ✅ + "Xoom Meeting"
  - Meeting ID on hover or click

- [x] **End meeting options**: "End" button (red) when clicked should show a small popover:
  - "End Meeting for All" (host option)
  - "Leave Meeting" (participant option)

### Contacts Tab Improvements

- [x] **Contacts tabs**: Add tab bar at top: "Directory" | "Channels" | "Rooms" — matching `assets/screenshots/contacts/000004.jpg`
  - **Directory** (default): Shows all contacts in an alphabetical list grouped by first letter. Each contact row: avatar (40px), name (bold), email (gray), status dot, department badge. Hover: Video call, Chat, Star, More buttons.
  - **Channels**: Lists all Team Chat channels the user belongs to with name, member count, description. Click opens that channel in Team Chat.
  - **Rooms**: Placeholder "No Xoom Rooms configured" empty state (Xoom Rooms is a hardware product).

- [x] **Contact search**: Add search input at top of contacts list that filters by name or email as user types.

- [x] **Star/favorite contact**: Clicking star icon on a contact toggles the `starred` field. Starred contacts appear in a "Starred" section at the top of the Directory list.

- [x] **Delete contact**: In the "More" (⋯) dropdown on contact hover, add "Remove Contact" option with confirmation dialog.

- [x] **Contact detail panel**: Clicking a contact name opens a side panel or modal showing full contact info: large avatar, name, email, department, status, action buttons (Video Call, Chat, Schedule Meeting).

### Recordings/Clips Improvements

- [x] **Recording search**: Add search input above the recordings table that filters by title.

- [x] **Recording playback modal**: Clicking "Play" button opens a modal with a mock video player:
  - Dark background modal, large area showing placeholder image
  - Play/pause button, timeline scrubber, volume, full-screen
  - Meeting title, date, duration shown below player
  - No real video — just static UI that looks like a player

- [x] **Recording share modal**: Clicking "Share" opens a modal:
  - "Copy Link" button (copies a mock URL)
  - "Share with" input to type contact names
  - Permissions: "Viewer" / "Editor" dropdown

### Settings Page Improvements

- [x] **Settings sidebar navigation**: Replace current stacked cards with a proper settings layout matching `assets/screenshots/000002.jpg`:
  - Left sidebar (~200px): navigation links — General, Profile, Audio, Video, Chat, Notifications, Keyboard Shortcuts, Background & Effects
  - Right content area: shows the selected settings section
  - Currently selected section highlighted in sidebar with blue text + blue left border

- [x] **Profile section enhancement**: Under "Profile" settings:
  - Large avatar (80px) with "Change" hover overlay
  - Editable fields: Display Name (text input), Email (readonly), Personal Meeting ID (readonly, shown)
  - "Edit Profile" link → makes fields editable with Save/Cancel buttons
  - User type badge: "Licensed"

- [x] **General settings section** (NEW): Add:
  - Theme: "Light" / "Dark" / "System" radio buttons (light is default, only switches a CSS class — actual dark mode implementation optional)
  - Language: dropdown with "English" selected
  - "Start Xoom when I start my computer" toggle (non-functional, just UI)

- [x] **Audio settings enhancement**: Match `assets/screenshots/settings/000001.jpg`:
  - Microphone: dropdown selector showing device names
  - "Test Mic" button → shows an animated volume level bar for 3 seconds
  - Speaker: dropdown selector showing device names
  - "Test Speaker" button → shows a pulsing indicator for 3 seconds
  - Volume sliders for both input and output (range inputs)
  - "Automatically join audio by computer when joining a meeting" toggle
  - "Mute my microphone when joining a meeting" toggle

- [x] **Video settings enhancement**:
  - Camera: dropdown selector
  - Preview area: shows camera placeholder image (gray box with camera icon)
  - "HD" checkbox toggle
  - "Mirror my video" checkbox
  - "Touch up my appearance" checkbox with slider (intensity)
  - "Always show video preview dialog when joining" toggle

- [x] **Chat settings section** (NEW): Add:
  - "Show message preview" toggle
  - "Play sound for incoming messages" toggle
  - "Mute notifications" toggle
  - "Bounce application icon" toggle

- [x] **Keyboard shortcuts section** (NEW): Display a read-only table of keyboard shortcuts:
  - Mute/Unmute: Alt+A
  - Start/Stop Video: Alt+V
  - Start/Stop Share Screen: Alt+S
  - Pause/Resume Share: Alt+T
  - Open Chat: Alt+H
  - Show/Hide Participants: Alt+U
  - Enter/Exit Full Screen: Alt+F
  - (Just display as reference — actual keyboard shortcuts optional)

---

## P2 — Secondary / Depth Features

- [ ] **Thread/reply view in Team Chat**: Clicking "N replies" on a message opens a thread panel on the right side (replaces channel info panel), showing the parent message at top and reply chain below, with a reply composer at bottom.

- [ ] **@mention autocomplete in chat**: Typing `@` in the message composer shows a dropdown of channel members to mention. Selecting inserts `@Name` styled as a blue highlighted text.

- [ ] **File attachment UI in chat**: Clicking the paperclip/attach button in composer shows a file picker dialog (no real upload — just updates UI to show "file attached" indicator with a mock filename and icon).

- [ ] **Pin/unpin messages**: In the message hover actions, "Pin" option pins message. Pinned messages appear in the "Pin History" section of the channel info panel and show a pinned banner in the chat area.

- [ ] **Bookmark messages**: In the message hover actions, "Bookmark" option bookmarks the message. Bookmarked messages appear in a "Bookmarks" section accessible from sidebar.

- [ ] **Whiteboard placeholder page**: Add `/whiteboard` route with a basic canvas area (just a white rectangle with drawing tools in a toolbar — pencil, rectangle, circle, text, eraser). No need for full implementation — just the visual shell.

- [x] **New Meeting dropdown with PMI option**: When "Use My Personal Meeting ID" is selected from the New Meeting dropdown, start the meeting using the PMI as the room ID.

- [ ] **Meeting waiting room UI**: When waiting room is enabled for a meeting, show a "Waiting Room" view before joining the meeting room: centered card with meeting title, "Please wait, the meeting host will let you in soon", with a Xoom-branded animation.

- [x] **Meeting recording indicator**: When recording is active in Room, show a red pulsing dot in top-left with "Recording" text. Also show in participant's view.

- [ ] **Dark mode toggle**: In Settings → General, when "Dark" is selected, apply a dark theme CSS class to the root element. Dark mode colors: bg `#1A1A2E`, sidebar `#16213E`, text `#E0E0E0`, cards `#0F3460`.

- [ ] **Global search**: The search bar in the top nav should open a search overlay/dropdown. Typing filters across: meetings (by title), contacts (by name/email), channels (by name), messages (by text). Results grouped by category with icons.

- [ ] **Status selector**: Clicking user avatar in top nav → dropdown with status options: "Available" (green), "Busy" (red), "Do Not Disturb" (red with line), "Away" (yellow). Selecting updates user status in state and shows colored dot on avatar.

---

## Data Seed (implement in createInitialData())

- [x] **User**: 1 record — "Alex Johnson", Licensed, available status, PMI "543 888 1234". Use `ui-avatars.com` URL for avatar.

- [x] **Contacts**: 8 records — Sarah Connor (available, Engineering, starred), John Wick (busy, Security), Tony Stark (offline, Engineering, starred), Diana Prince (available, Design), Bruce Wayne (away, Management), Natasha Romanoff (dnd, Operations), Peter Parker (available, Engineering, starred), Wanda Maximoff (offline, Design). All with `ui-avatars.com` avatars. See `data_model.md §Contact`.

- [x] **Meetings**: 5 records — "Weekly Team Sync" (tomorrow 10am, recurring weekly), "Project Kickoff" (2 days from now 2pm, password protected, waiting room), "Client Review" (yesterday 3pm, ended), "Design Review" (3 days from now 11am), "All Hands Meeting" (3 days ago, ended, recurring monthly). See `data_model.md §Meeting`.

- [x] **Recordings**: 3 records — "Client Review" (video, 28:45, 145 MB), "All Hands Meeting" (video, 1:24:30, 512 MB), "All Hands Meeting - Transcript" (transcript, 24 KB). See `data_model.md §Recording`.

- [x] **Channels**: 6 records — "General" (channel, starred, 3 unread), "Engineering" (channel, starred), "Design" (channel, 1 unread), DM with Sarah Connor (2 unread), DM with Tony Stark, Group DM "Team Leads". See `data_model.md §ChatChannel`.

- [x] **Messages**: 34+ messages total — ch_general: 12 messages with variety (reactions, pinned, threading), ch_engineering: 6 messages about code/PRs, ch_design: 4 messages about mockups, dm_sarah: 5 messages, dm_tony: 4 messages, gdm_team_leads: 3 messages. Include realistic timestamps spanning last 3 days. See `data_model.md §ChatMessage`.

---

## Out of Scope

- Authentication / login (app starts pre-logged-in as `Alex Johnson`)
- Real WebRTC video/audio streaming
- Real file upload/storage
- Xoom Phone (VoIP)
- Xoom Webinars
- AI Companion features
- Xoom Rooms hardware integration
- Email/SMS sending
- Real-time sync / WebSocket connections
- End-to-end encryption
- OAuth / SSO integration
