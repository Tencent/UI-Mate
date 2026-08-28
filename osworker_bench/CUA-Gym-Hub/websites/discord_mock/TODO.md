# Xiscord Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-02-28
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing code: Already has a working scaffold (Vite+React+Zustand+Tailwind, routing, basic chat)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Current State Summary

The app already has a functional skeleton with:
- ✅ 4-panel layout (server list, channel list, chat, member sidebar)
- ✅ React Router with server/channel/DM routing
- ✅ Zustand store with basic actions (sendMessage, addReaction, createThread, etc.)
- ✅ Session isolation (vite.config.js mock-api plugin, localStorage persistence)
- ✅ `/go` endpoint (Go.jsx)
- ✅ Basic message display with markdown (bold, italic, code)
- ✅ Basic emoji reactions (toggle)
- ✅ Server/channel creation
- ✅ Voice channel join/leave UI
- ✅ User profile modal
- ✅ Member sidebar with online/offline grouping

**What needs improvement:** Many features are visual-only with no functional handlers, thread replies don't work, DM messages don't persist, no message edit/delete, search is non-functional, no pinned messages panel, no typing indicators, no @mentions, no unread tracking, data model is too minimal (only 3 users, 4 messages, 1 thread).

---

## P0 — Core Fixes & Data Foundation

<!-- Fix critical gaps that prevent the app from being a realistic training sandbox. -->

- [x] **Visual design system update**: Study `assets/screenshots/` and update the color palette in `tailwind.config.js` to match Xiscord's current 2025 dark theme. Replace old color values: primary bg `#313338` (was `#36393f`), secondary bg `#2b2d31` (was `#2f3136`), tertiary bg `#1e1f22` (was `#202225`), input bg `#383a40` (was `#40444b`), hover `#2e3035`, selected `#404249`. Update text colors: primary `#f2f3f5`, secondary `#b5bac1`, muted `#949ba4`. Keep brand colors: blurple `#5865F2`, green `#23a55a`, red `#f23f42`, yellow `#f0b232`. Status colors: online `#23a55a`, idle `#f0b232`, dnd `#f23f42`, offline `#80848e`.

- [x] **Expand seed data in initialState.js**: Replace the current minimal seed data with rich, realistic data per `data_model.md §Suggested createInitialData()`. Must include: 2 servers (7 + 5 channels), 6 users with diverse statuses/roles/aboutMe, 3 roles per server-1 + 2 per server-2, 20+ messages across channels with varied timestamps spanning 3+ days (for date dividers), 2 messages with reactions (multiple emoji types, multiple users), 2 messages with link/image embeds, 1 pinned message per populated channel, 1-2 threads with 2-3 thread replies each, 2 DM conversations with 3-4 messages each, messages with markdown formatting (code blocks, bold, headers), at least 1 @mention message, 1 bot message. Each message must have proper `channelId`, `userId`, `timestamp`. Timestamps should be relative to "now" (use `new Date(Date.now() - X)` pattern) so messages always appear recent.

- [x] **DM message sending and persistence**: Currently `DMChatArea` in App.jsx has a message input but messages are not stored or displayed. Fix: (a) Add `dmConversations` to the store state (keyed by DM ID, each containing a `messages` array — see `data_model.md §DM Conversation`). (b) Add `sendDMMessage(dmId, content)` action to useStore.js that creates a message object and appends to the DM conversation's messages array. (c) Update DMChatArea to display messages from `dmConversations[dmId].messages` with proper avatars, usernames, timestamps. (d) The DM chat UI should match the server chat UI style (same message component). (e) Add mock auto-reply: 2 seconds after sending a DM, the recipient "types" for 1 second then sends a canned reply.

- [x] **Thread reply input and sending**: Currently threads display but have no input field for replying. In the thread panel (currently inline in ChatArea.jsx or a dedicated component): (a) Add a message input at the bottom of the thread panel identical in style to the main chat input. (b) Add `sendThreadMessage(threadId, content)` action to useStore.js that creates a message and appends to `threads[threadId].messages`. (c) Thread messages should display with the same Message component used in the main chat. (d) Update the thread panel header to show thread name, message count, and a close button (X).

- [x] **Data normalization for POST API**: Add `deepMergeWithDefaults()` normalization in `initialState.js` (or a separate `dataManager.js` utility). When custom state arrives via POST `/post`, normalize all array fields: users (ensure avatar, status, roles, discriminator defaults), servers (ensure channels array, roles, members), channels (ensure type, category, pinnedMessageIds defaults), messages (ensure reactions is {}, attachments/embeds are [], mentions is []), threads (ensure messages is [], archived is false), dmConversations (ensure messages is []). Pattern: `if (key === 'users' && typeof custom[key] === 'object') result[key] = Object.fromEntries(Object.entries(custom[key]).map(([k,v]) => [k, normalizeUser(v)]))`.

---

## P1 — Primary Interactive Features

<!-- Core features a user interacts with in the first 5 minutes. Agent training essentials. -->

- [x] **Message editing**: On hover over your own message, show a pencil (Edit) icon in the action bar. Clicking it transforms the message content into an editable textarea pre-filled with the current content. Show "escape to cancel • enter to save" hint below. Enter saves (calls `editMessage(messageId, newContent)` in store, sets `isEdited: true` and `editedTimestamp`). Esc cancels. Display "(edited)" text in muted color next to timestamp for edited messages.

- [x] **Message deletion**: On hover over your own message, show a trash (Delete) icon in the action bar. Clicking shows a confirmation modal: "Are you sure you want to delete this message? This cannot be undone." with dark bg (#2b2d31), message preview, red "Delete" button and gray "Cancel" button. Confirming calls `deleteMessage(messageId)` in store which removes message from `messages` object. If message had a thread, keep the thread but mark `messageId` as deleted.

- [x] **Message reply**: On hover, show a Reply icon in the message action bar. Clicking sets a reply state in the chat area: a thin bar appears above the input showing "Replying to @Username" with the first 50 chars of the message and an X to cancel. Sending the message includes `referencedMessageId` field. Display replied messages above the actual message content with: left blue bar, small avatar (16px), muted username, truncated content (1 line), click jumps to original message.

- [x] **Pinned messages panel**: Clicking the pin icon (📌) in the channel header opens a right-side panel (or dropdown popover, 420px wide) showing all pinned messages for the current channel. Each pinned message shows: avatar, username, timestamp, full message content, "Jump" link that scrolls to the message in chat. Show "This channel doesn't have any pinned messages yet." empty state. Add `togglePinMessage(messageId)` action to useStore that toggles `pinned` field on the message and adds/removes from channel's `pinnedMessageIds`.

- [x] **@Mentions in messages**: (a) When typing `@` in the message input, show a popup autocomplete list of server members (avatar + username + discriminator) filtered by typing. Arrow keys to navigate, Enter/click to select. Insert `@Username` into the message content. (b) When rendering messages, detect `@Username` patterns and render them as highlighted inline spans (bg `#5865f233`, text `#dee0fc`, hover: underline, cursor pointer). (c) When the current user is mentioned, highlight the entire message row with a subtle blurple left border (3px, `#5865f2`) and tinted background (`#5865f20a`). (d) Store mentioned user IDs in message's `mentions` array.

- [x] **Typing indicator**: Show "Username is typing..." animated indicator at the bottom of the chat area (above the input, below messages). Trigger: when the user types in the input, show "You are typing..." for 3 seconds after the last keystroke. For mock realism: after sending a message in a channel, randomly show "OtherUser is typing..." for 2-4 seconds. Animation: three bouncing dots (CSS animation, dots are 4px circles, bounce 0.4s each with 0.1s delay).

- [x] **Unread message indicators**: (a) Server list: white dot on left side of server icon when any channel in that server has unread messages. Red badge with count when @mentioned. (b) Channel list: bold white channel name when unread, show unread count badge (small rounded pill) on the right side. (c) Track `lastReadMessageId` per channel for the current user. (d) When switching channels, mark current channel as read (update `unreadCount: 0`). (e) Category label shows combined unread count.

- [x] **Search messages**: (a) Clicking the search icon in the header opens a search input in the top bar (replaces or overlays header buttons). Input has placeholder "Search" with magnifying glass icon. (b) As user types (debounce 300ms), filter all messages in the current server by content (case-insensitive substring match). (c) Results appear in a dropdown panel (right side, 420px wide) showing matching messages with: channel name, avatar, username, timestamp, content with search term highlighted in yellow. (d) Clicking a result navigates to that channel and scrolls to the message. (e) Add "N results found" counter. (f) Add `searchMessages(query)` action to useStore.

- [x] **Enhanced markdown rendering**: Extend the current MarkdownText component to support Xiscord's full markdown spec: (a) `~~strikethrough~~` → `<s>`, (b) `__underline__` → `<u>`, (c) `||spoiler text||` → blurred text (filter: blur(4px)) that reveals on click, (d) ` ```language\ncode\n``` ` → syntax-highlighted code blocks with language label and copy button, (e) `> blockquote` → left border (#4e5058, 4px) + indented text, (f) `# Header`, `## Header`, `### Header` → scaled headings, (g) `-# subtext` → small muted text, (h) `- item` or `* item` → bulleted lists, (i) timestamp rendering: `<t:1234567890:R>` style → relative timestamps. Render order matters: process code blocks first, then spoilers, then other inline formatting.

- [x] **Emoji picker enhancement**: Replace the current small 28-emoji grid with a proper emoji picker popup: (a) Popup appears above the emoji button (Smile icon), 352px wide × 400px tall, dark bg (#2b2d31). (b) Category tabs at top: 😀 Smileys, 👋 People, 🐱 Animals, 🍕 Food, ⚽ Activities, 🌍 Travel, 💡 Objects, ❤️ Symbols. (c) Search bar at top: "Search emoji" with magnifying glass icon. (d) Scrollable emoji grid (8 columns, 32px per emoji). (e) At least 80 commonly-used emojis across categories. (f) Recently used section at top. (g) Click emoji to insert into message input (or add as reaction if opened from reaction button). (h) Category sticky headers while scrolling.

- [x] **Message action bar (hover toolbar)**: On message hover, show a floating action bar (positioned at top-right of message, overlapping slightly): 4 icon buttons in a row on dark bg (#2b2d31, rounded-md, border #3f4147): (1) emoji reaction (Smile icon) — opens reaction picker, (2) reply (↩ icon) — triggers reply mode, (3) thread (💬 icon) — creates/opens thread, (4) more (...) — opens dropdown menu. Dropdown menu items: "Edit Message" (own messages only), "Pin Message", "Delete Message" (own messages only, red text), "Copy Message Link", "Copy Text". Each menu item: icon + text, hover bg #35373c.

- [x] **Context menus (right-click)**: (a) Right-click on a message shows context menu with: Reply, Create Thread, Pin/Unpin Message, Copy Text, Copy Message Link, separator, Edit Message (own only), Delete Message (own only, red). (b) Right-click on a user in member list: Mention, Message, View Profile, separator, Mute, Deafen. (c) Right-click on a channel: Mark as Read, Edit Channel, Mute Channel, Copy Channel Link. Each context menu: dark bg (#111214), rounded-lg, min-width 188px, items with icon + label, hover bg blurple (#5865f2), dividers are thin lines (#2e2f34).

- [x] **User settings modal**: Clicking the settings gear icon at bottom of channel list opens a full-screen modal overlay with: (a) Left sidebar showing settings categories: MY ACCOUNT section (My Account), APP SETTINGS section (Appearance, Accessibility, Voice & Video, Chat, Notifications, Keybinds, Language). (b) Main content area with current settings. (c) Close button (X circle) at top-right with ESC label. (d) Appearance section: Theme selector (Dark/Light/Onyx/Ash radio buttons — visual only, always stays dark), Message Display (Cozy/Compact radio), Chat font scaling slider (12-24px). (e) My Account section: Shows username, email (mock), avatar preview, "Edit User Profile" button. (f) Each section: white heading, description text, toggle switches (rounded, green when active). All settings are visual-only state changes stored in the Zustand store.

- [x] **Server settings panel**: Right-clicking server name or clicking dropdown chevron in channel list header shows dropdown menu: "Server Settings", "Create Channel", "Create Category", "Invite People", "Notification Settings". Clicking "Server Settings" opens full-screen modal similar to User Settings with sidebar: (a) OVERVIEW: Server name (editable text input), server icon (display only). (b) ROLES: List of roles with colored dots, clicking shows role name/color/permissions. (c) MEMBERS: List of all members with role badges, search box. Close button same as user settings.

---

## P2 — Secondary Features

<!-- Depth and realism, implement after P1 is solid. -->

- [x] **Custom status**: Clicking current user's avatar in the bottom panel opens a dropdown menu with status options: Online (green circle), Idle (yellow moon), Do Not Disturb (red circle with line), Invisible (gray empty circle). Below statuses: "Set Custom Status" option opens a small modal with emoji selector + text input (128 char limit) + "Clear after" dropdown (Don't clear, 30 min, 1 hour, 4 hours, Today). Updates `currentUser.status` and `currentUser.customStatus` in store.

- [x] **Quick Switcher (Ctrl+K)**: Pressing Ctrl+K (or Cmd+K on Mac) opens a centered modal search overlay: dark bg (#2b2d31), 560px wide, rounded-lg. Large search input at top "Where would you like to go?" with magnifying glass icon. As user types, show filtered results: servers (icon + name), channels (# + name + server name), DMs (avatar + username). Arrow keys to navigate, Enter to go. Esc closes. Show "RECENT" section when empty.

- [x] **Channel topic editing**: Clicking the topic text in the channel header makes it editable (inline edit). Show a save/cancel button pair. Save calls `updateChannelTopic(channelId, newTopic)` in store. Empty topic shows "Click to add a topic" placeholder.

- [x] **Notification settings per channel**: Right-click channel → "Notification Settings" opens a small popover with radio options: Use server default, All messages, Only @mentions, Nothing. Muted channels show with strikethrough text and bell-off icon in the channel list.

- [x] **File attachment display**: When messages have `attachments` array entries (from seed data), render them inline: (a) Images: embedded preview with max-width 400px, max-height 300px, rounded corners, click to view fullsize in overlay modal. (b) Other files: dark bordered card showing file icon (📄), filename, file size (formatted: "245 KB"), and download button. Add attachment button (+) in message input that shows alert "File uploads not supported in mock" on click.

- [x] **Message date dividers**: Between messages from different calendar days, render a horizontal divider with the date centered: thin line (#3f4147) with text in the middle ("January 15, 2024" or "Today" / "Yesterday"). The text sits on a background-colored pill to break the line visually.

- [x] **Channel creation modal**: Replace current `window.prompt` for channel creation with a proper modal: dark bg (#313338), title "Create Channel", radio buttons for channel type (Text / Voice with icons), channel name input (auto-lowercase, auto-hyphenate spaces, prefix shows # or 🔊), optional "Private Channel" toggle with lock icon, "Create Channel" (blurple) and "Cancel" (text) buttons. Category dropdown for placement.

- [x] **Server creation modal**: Replace current `window.prompt` for server creation with modal: "Create a server" title, "Create My Own" button with arrow icon, or "Join a Server" option (non-functional). On Create My Own: server name input (pre-filled "Alex_Dev's server"), icon upload area (just shows default colored initials), "Back" and "Create" buttons.

- [x] **Keyboard shortcuts**: Implement: (a) `Esc` — mark current channel as read, (b) `Ctrl+K`/`Cmd+K` — Quick Switcher, (c) `Ctrl+Shift+M` — toggle mute, (d) `Up arrow` when input empty — edit last message, (e) `Ctrl+/` — show keyboard shortcuts help modal (list all shortcuts in a grid layout).

- [x] **Drag-and-drop channel reorder**: Allow dragging channels within a category to reorder them. On drag: ghost preview of channel name, drop target shows blue line indicator between channels. Update `position` field and `server.categories[].channelIds` order on drop. Use HTML5 drag-and-drop API (no additional library needed for simple reorder).

- [x] **Role badge display**: In member sidebar and user profile modal, show role badges as small colored pills (role name text + colored dot) beneath the username. Roles sorted by position (highest first). In member sidebar, group members by their highest hoist role (show role name as section header with count).

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. -->

- [x] **Users**: 6 records — 1 current user (online, admin), 1 moderator (online), 1 active member (idle, gaming status), 1 developer (dnd), 1 artist (offline), 1 bot user. Each with unique avatars (picsum.photos/seed/{username}/128/128), discriminators, aboutMe text, bannerColor.

- [x] **Servers**: 2 records — "Gaming Community" (server-1) with 7 channels across 3 categories + voice, "Dev Hub" (server-2) with 4 channels across 2 categories + voice. Each with icon, ownerId, description, member lists.

- [x] **Channels**: 12 records total — Each with proper serverId, category, type, topic. At least 1 channel per server has pinned messages. One announcement channel. Two voice channels.

- [x] **Messages**: 25+ records — Spread across 4-5 channels, spanning 3+ days of timestamps. Include: plain text, markdown-formatted (code blocks, bold, lists), messages with 2-3 emoji reactions from multiple users, messages with link embeds (GitHub, YouTube URLs), 1-2 messages with image attachment data, 2 pinned messages, 1 @mention, 1 reply (with referencedMessageId), 1 bot message. Timestamps should use `new Date(Date.now() - msOffset)` pattern for always-fresh dates.

- [x] **Threads**: 2 records — One in #help (3 replies about bot permissions), one in #code-review (2 replies about an API design). Each thread message has proper userId, timestamp, content.

- [x] **DM Conversations**: 2 records — DM with Sarah_Mod (4 messages, casual chat), DM with CodeNinja (3 messages, project discussion). Each with proper message objects and lastMessageTimestamp.

- [x] **Roles**: 5 records — Admin (red), Moderator (blue), Member (gray) for server-1; Lead Dev (green), Developer (teal) for server-2. Each with color hex, hoist flag, position.

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login (app starts pre-logged-in as `Alex_Dev#9201`)
- Real voice/video calling (voice channels track join/leave state only)
- File uploads to real servers (attachment button shows disabled message)
- Real-time WebSocket communication (all actions are local state changes)
- Nitro/premium subscription features
- Screen sharing functionality
- Bot command processing
- 2FA / security settings
- Server discovery / Explore feature
- Mobile responsive layout (desktop-only is fine)
- Actual notification sounds/push notifications
