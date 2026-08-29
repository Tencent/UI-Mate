# Xlack Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-02-28
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Screenshots: `assets/screenshots/` (30+ reference images)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

These items ensure the app can render and function. Most are **already implemented** — verify and mark done.

- [x] Project scaffold: Vite + React, react-router-dom, date-fns
- [x] App layout: Sidebar (left) + Content area (center) + Thread panel (right, conditional) + Status bar (bottom)
- [x] Routing: `/channel/:channelId`, `/dm/:dmId`, `/all-dms`, `/threads`, `/mentions`, `/search`, `/profile`, `/go`
- [x] State management: AppContext + dataManager.js with createInitialData()
- [x] `/go` endpoint: StateInspector component + vite.config.js middleware returning `{initial_state, current_state, state_diff}`
- [x] Session isolation: vite.config.js mock-api plugin (`POST /post?sid=`, `GET /state?sid=`) + dataManager session helpers
- [x] **Visual design system audit**: The current mock uses generic colors and emoji icons. Study `assets/screenshots/` closely and update the CSS to match Xlack's real visual design:
  - Sidebar background: `#3F0E40` (deep aubergine purple), NOT generic dark gray
  - Sidebar text: `#BCABBC` (muted lavender), active item bg: `#1164A3` (blue)
  - Top bar / workspace header: `#350D36` (dark purple), matching sidebar
  - Main content background: `#FFFFFF`
  - Message text: `#1D1C1D`, timestamps: `#616061`
  - Links / mentions: `#1264A3` (blue)
  - Online indicator: `#2BAC76` (green dot)
  - Primary button color: `#007A5A` (green), hover `#148567`
  - Unread badge: `#E01E5A` (red/pink)
  - Font family: `"Lato", "Xlack-Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  - Message text: 15px/22px regular; sender name: 15px bold; timestamp: 12px #616061
  - Avatar: 36px with border-radius 4px (rounded square, NOT circle)
  - Sidebar item height: ~32px; message vertical padding: ~8px
  - Replace ALL emoji-based icons (💬, ✉️, @, 🔍, 👥, 📌, ⭐, ☆, etc.) with proper SVG icons or Unicode characters that match Xlack's clean icon style. Use simple inline SVGs or CSS-drawn icons.

---

## P1 — Primary Features

Core interactive workflows an agent needs to practice. Most have basic implementations that need polish and bug fixes.

### Messaging

- [x] Send messages in channels via MessageComposer
- [x] Send messages in DMs via MessageComposer
- [x] Display messages in reverse-chronological order with avatar, sender name, timestamp
- [x] **Date separators in message list**: Insert visual dividers between messages from different days. Show "Today", "Yesterday", or formatted date (e.g., "Monday, January 15th") as a horizontal rule with centered text, matching Xlack's style: thin gray line (#DDDDDD) spanning full width with date text centered on white background. Implement in MessageList.jsx by grouping messages by date.
- [x] **Message hover action bar**: Currently shows on hover but uses emoji characters. Replace with a clean floating toolbar that appears on the right side of the message row on hover (position: absolute, right: 8px, top: -16px, overlapping the message slightly). Toolbar should have 4-5 icon buttons in a row with light gray background (#FFFFFF), border (1px solid #DDDDDD), border-radius 6px, subtle shadow: emoji reaction (😊 +), reply in thread (💬), bookmark (🔖), more options (⋯). Each button ~28px with hover background #F0F0F0. Match `assets/screenshots/000001.jpg` reference.
- [x] **Unread message tracking**: Add `unreadCount` field to channels in dataManager (see data_model.md §Channels). When a message is sent to a channel the user is NOT currently viewing, increment that channel's unreadCount. When the user navigates to a channel, reset its unreadCount to 0. Display unread count as a red badge (#E01E5A, white text, pill shape) next to channel name in sidebar. Bold the channel name when unreadCount > 0.

### Threading

- [x] Reply in thread opens ThreadPanel on right side
- [x] Thread panel shows parent message + replies + compose area
- [x] Thread follow/unfollow
- [x] **Thread reply count indicator on parent message**: Below the parent message, when it has thread replies, show a clickable row: small stacked avatars of last 2-3 repliers (16px each, overlapping by 4px) + "N replies" in blue link text (#1264A3) + "Last reply X minutes ago" in gray text. Clicking opens the thread panel. Currently shows reply count but visual style doesn't match Xlack. Update Message.jsx thread indicator section.
- [x] **Thread panel header improvements**: Thread panel header should show: "Thread" title on left, "# channel-name" subtitle below it (or DM name), and an X close button on top-right. Below header show the parent message in a highlighted card style with left-border accent. Then a "N replies" divider line, then the replies list. Match `assets/screenshots/threads/` reference images.

### Reactions

- [x] Add emoji reactions via EmojiPicker
- [x] Toggle own reaction by clicking existing reaction badge
- [x] Reaction badges show emoji + count
- [x] **Reaction badge visual polish**: Reaction badges should match Xlack's style: rounded pill shape (border-radius: 12px), light background (#F0F0F0 or #E8E8E8), 1px border #DDDDDD, padding 2px 8px, font-size 12px. When the current user has reacted, the badge should have a blue border (#1264A3) and light blue background (#E8F5FE). Show tooltip on hover listing user names who reacted. Emoji on left, count on right.
- [x] **Quick reaction shortcut**: On message hover action bar, show the 3 most recently/frequently used emoji as quick-reaction buttons (e.g., 👍, ❤️, 😂) before the emoji picker button. Clicking one immediately adds that reaction without opening the picker.

### Message Editing & Deletion

- [x] Edit own messages with inline editing
- [x] Delete own messages with confirmation dialog
- [x] "(edited)" indicator on edited messages
- [x] **Edit mode visual polish**: When editing, the message content should transform into a bordered text input (matching the original message width), with "Save" (green) and "Cancel" (gray) buttons below. Show helper text: "Escape to cancel · Enter to save". Match Xlack's inline editing UX.

### @Mentions

- [x] @mention autocomplete in MessageComposer
- [x] Highlight @mentions in message display
- [x] **Mention rendering in messages**: @mentions should render as a blue highlighted inline chip: background #E8F5FE, color #1264A3, border-radius 3px, padding 0 2px, font-weight 600. Clicking a mention should show that user's profile popover (see P2). The markdownParser.js should detect `@[userId:displayName]` patterns and render them as styled `<span>` elements.

### Search

- [x] Global search page with tabs (All, Messages, Channels, People)
- [x] **Search filters**: Below the search input, add filter chips matching Xlack's design (see `assets/screenshots/search/000005.jpg`): "From" (people dropdown), "In" (channels/DMs dropdown), "Date" (date range picker), "Has" (reactions, files, links). Each filter is a pill-shaped button (#F0F0F0 bg, border-radius 16px) with a dropdown chevron. Active filters show as blue pills.
- [x] **Search result highlighting**: In search results, highlight the matching search term within each message snippet with yellow background (#FFF3CD) and bold text. Show the channel/DM name and timestamp as metadata above each result.
- [x] **Quick Switcher (Ctrl+K)**: Add a modal overlay (centered, ~520px wide, white bg with shadow) that appears on Ctrl+K / Cmd+K keypress. Contains a text input "Search for channels, people, or DMs" with auto-focus. As user types, show a dropdown list of matching channels (# icon) and DMs (avatar) filtered by name. Pressing Enter or clicking navigates to that channel/DM. Escape closes. The modal should appear above all content with a semi-transparent backdrop.

### Sidebar Navigation

- [x] Sidebar shows Starred, Channels, Direct Messages sections
- [x] Active channel/DM highlighted
- [x] Channel starring/unstarring
- [x] **Collapsible sidebar sections**: Each section header ("⭐ Starred", "Channels", "Direct messages") should be collapsible via a disclosure triangle (▶/▼) on the left of the section label. Clicking the triangle or header text toggles visibility of that section's items. Collapsed state should persist per section using component state. Add a subtle + button on the right of "Channels" and "Direct messages" headers (shows on hover only) for creating new channels or starting new DMs.
- [x] **Sidebar "All unreads" quick link**: Add a top nav item "All unreads" with a badge showing total unread count across all channels. Clicking navigates to an "Unreads" view that shows all messages from channels with unreadCount > 0, grouped by channel name. Currently no "All unreads" route exists — add `/unreads` route with a new UnreadsPage component.
- [x] **Sidebar unread bold + badge**: Channel names in sidebar should render in **bold** white text when they have unread messages, and show a numeric badge (red pill) on the right side. Channels with no unreads should use the default muted text color (#BCABBC).

### Channel & DM Views

- [x] Channel header with name, star, members count, pin, search, settings buttons
- [x] DM header with user info and action buttons
- [x] **Channel description/topic in header**: Below the channel name row, show the channel's topic (or description if no topic) as a single line of gray text (#616061, 13px, truncated with ellipsis if too long). Clicking it opens an inline editor to update the topic. Add a "Edit topic" hover text. This requires adding `topic` field to channels in dataManager — see data_model.md §Channels.
- [x] **Channel details right panel**: When clicking the (i) info button or channel name in the header, open a right-side panel (same position as thread panel, ~340px wide) showing tabs: "About" (description, topic, created by, created date), "Members" (list with avatars, names, and online status), "Pinned" (list of pinned messages with previews), "Files" (list of shared files). Panel has X close button. Implement as ChannelDetailsPanel.jsx.
- [x] **Pinned messages panel**: Clicking the pin icon in channel header should open the channel details panel to the "Pinned" tab (or a standalone popover). Show each pinned message with sender avatar, name, preview text, and timestamp. Clicking a pinned message scrolls to it in the message list (or shows it in full). Currently the pin button just shows a toast count.

### User Profile

- [x] Profile page with edit form (name, title, status, timezone)
- [x] **Status emoji picker in profile**: Add a status emoji selector when editing profile. Show a row of popular emoji (🏠, 📅, 🤒, 🏖️, 🚌, etc.) and option to open full emoji picker. Selected status emoji displays next to the user's display name everywhere in the app (sidebar, messages, DMs list).
- [x] **User profile popover on name click**: Clicking any username in a message (sender name) should show a floating popover card (~300px wide) with: large avatar (72px), full name (bold 18px), display name + status emoji, title, "Local time: 2:45 PM" (calculated from timezone), status message, and a "Message" button (green, navigates to DM). Popover should close on click outside or Escape. Implement as UserProfilePopover.jsx.

### Message Composer

- [x] Rich text area with formatting toolbar (B, I, S, code, link, lists, blockquote)
- [x] Emoji picker integration
- [x] File attachment support
- [x] @mention autocomplete
- [x] **Composer visual refinement**: The composer should match Xlack's design: rounded-rectangle border (1px solid #DDDDDD, border-radius: 8px) around the entire composer area. Placeholder text "Message #channel-name" in gray. Formatting toolbar below the text area (inside the border), with small icon buttons for: B, I, S, `<>`, link (🔗), ordered list, bulleted list, block quote, code block. To the right of text area: Aa formatting toggle, @ mentions, emoji, and send arrow button (green #007A5A when text is present, gray when empty). Left side: + button for attachments. See `assets/screenshots/000001.jpg` and `assets/screenshots/000002.jpg` for exact layout.

### DMs List

- [x] All DMs page with search
- [x] **DMs list visual refinement**: Each DM entry should show: 40px avatar (rounded square), online status dot (overlaid on avatar bottom-right), user display name (bold), last message preview (gray, truncated, single line), timestamp on top-right (gray, relative). Unread DMs should have bold name + unread count badge. Match `assets/screenshots/sidebar/000001.jpg` DMs tab layout.

### Threads Page

- [x] Threads page with filter (All/Following)
- [x] **Threads page content improvement**: Each thread entry should show: channel name prefix ("in #general" or "DM with Sarah"), parent message preview (1-2 lines), "N replies" count, last reply preview with avatar and timestamp, unread reply indicator (blue dot). Clicking opens the thread in context (navigates to channel + opens thread panel).

### Mentions & Reactions Page

- [x] Mentions page with filters
- [x] **Mentions feed improvement**: Each mention entry should show: the full message that mentions you with the @mention highlighted (blue chip), channel/DM context ("in #general"), sender avatar + name, timestamp, and "View in conversation" link. Reactions tab should show messages where someone reacted to your message: "Sarah reacted with 👍 to your message in #engineering" format.

---

## P2 — Secondary Features

Depth and realism features. Implement after P1 is solid.

- [ ] **Typing indicators**: When the current user starts typing in composer, show "John is typing..." below the message list (above composer), with animated dots (•••). For realism, simulate other users typing: 2 seconds after the current user sends a message, randomly show "[OtherUser] is typing..." then clear after 3 seconds (simulates response thinking). Implement as TypingIndicator.jsx component.

- [ ] **Draft message auto-save**: When the user types in the composer and navigates away without sending, save the draft text per channel/DM key in `state.drafts` (see data_model.md). When the user returns to that channel/DM, restore the draft text in the composer. Show "Draft" indicator next to channel name in sidebar if draft exists. Add `drafts: {}` to createInitialData().

- [ ] **Markdown rendering polish**: Ensure the markdownParser.js handles all Xlack formatting: `*bold*`, `_italic_`, `~strikethrough~`, `` `inline code` ``, ` ```code blocks``` `, `> block quotes` (with left blue/gray border), `[link text](url)`, and auto-linked URLs. Code blocks should have gray background (#F4F4F4), border-radius 4px, monospace font. Block quotes should have 4px left border (#DDDDDD) with left padding 12px.

- [ ] **Online/offline status indicators**: Show colored status dots on all avatars: green (#2BAC76) for online, hollow circle for offline, orange clock icon for away, red (#E01E5A) for busy/DND. Dots should be 10px, positioned at bottom-right of avatar with a 2px white border. Update Sidebar DM items, Message avatars, and DM header. Status should come from each user's `status` field.

- [ ] **Channel bookmarks bar**: Below the channel header, add a horizontal scrollable row for channel bookmarks. Each bookmark shows: optional emoji icon + title text, as a clickable chip/link. Add "+" button at the end to add new bookmarks (opens small form: title, URL, optional emoji). Requires adding `bookmarks: []` field to channels — see data_model.md §Channels. Implement as ChannelBookmarks.jsx.

- [ ] **Notification preferences modal**: In channel settings or via bell icon, show notification preferences modal with options: "All new messages", "Mentions only", "Nothing" (radio buttons). Per-channel override of global notification setting. Also show global notification settings in Settings/Profile page with same options plus "Do Not Disturb" schedule. Store in `settings.channelNotifications: { [channelId]: "all" | "mentions" | "none" }`.

- [ ] **Huddle/call button in channel header**: Add a headphones icon (🎧) button in the channel/DM header. Clicking it shows a small "Huddle" panel at the bottom of the content area with: user avatars of "participants" (just current user), elapsed time "0:00", microphone toggle, leave button. This is UI-only — no actual audio. State tracked in `state.activeHuddle: { channelId, startTime, participants: [] }`.

- [ ] **Compose new message button**: Add a pencil-in-square icon button (Xlack's compose button) near the top of the sidebar (above "All unreads" or in workspace header area). Clicking opens a composer modal or new view where the user can select a recipient (channel or person) from a dropdown, then compose and send the message. This is Xlack's "Create" → "Message" flow.

- [ ] **"Later" / Saved items view**: Add a `/later` route with a SavedItemsPage component. Shows all bookmarked messages (from `state.bookmarkedMessages`) with tabs: "In progress", "Completed", "Archived". Each saved item shows the message content, channel context, and timestamp. User can mark items as complete or archive them. Add a "Later" link in sidebar nav (bookmark icon 🔖).

- [ ] **Message link/URL preview (unfurl)**: When a message contains a URL, render a preview card below the message text: title (bold), description (gray), and optional thumbnail image, all in a bordered card (1px solid #DDDDDD, border-radius 8px, padding 12px). Since we can't fetch real URLs, generate mock unfurl data for common patterns (e.g., "docs.example.com" → "Project Documentation", "github.com" → "GitHub Repository"). Implement in markdownParser.js or as a MessageLinkPreview.jsx component.

- [ ] **Invite members to channel**: In channel details panel "Members" tab, add an "Add people" button. Clicking opens a popover with a searchable user list (all workspace users not already in channel). Selecting a user adds them to `channel.members[]`. Show a system message in the channel: "[User] was added to #channel by [CurrentUser]". Use `joinChannel` context method or add `addMemberToChannel` method.

- [ ] **Leave channel**: In channel details panel or channel header kebab menu, add "Leave channel" option. Confirmation dialog "Are you sure you want to leave #channel-name?". Removing current user from `channel.members[]`, navigating to #general, and showing toast "You have left #channel-name". Use existing `leaveChannel` context method.

- [ ] **Workspace header dropdown improvements**: The workspace dropdown menu should show: workspace name and icon at top, then menu items: "Preferences" (→ settings), "Profile" (→ profile edit), status quick-set (emoji + text inline), "Invite people to Acme Corp", divider, "Sign out" (non-functional). Currently only shows Preferences and Sign out.

---

## Data Seed Enhancements

Implement these in `createInitialData()` to make the mock feel more alive:

- [x] **Add more thread examples**: Currently only 1 thread. Add 2-3 more threads in different channels (#engineering, #design) with 2-5 replies each. Include a thread in a DM too. This gives the Threads page meaningful content.

- [x] **Add unread counts**: Set `unreadCount: 3` on #random, `unreadCount: 1` on #marketing, and `unreadCount: 2` on dm_2. This makes the sidebar show unread badges immediately.

- [x] **Add bookmarked messages**: Pre-populate `bookmarkedMessages: ['msg_eng_3', 'msg_alpha_1']` so the Later/Saved items view has content.

- [x] **Add notifications**: Pre-populate 3-5 notifications: a mention in #general, a reaction to your message in #engineering, a thread reply in #general thread_1. This gives the Mentions & Reactions page meaningful content.

- [x] **Add user status emojis**: Set `statusEmoji: '📅'` for user_3 (Mike, "Out for lunch"), `statusEmoji: '🔴'` for user_5 (Alex, "Do not disturb"), `statusEmoji: '🏠'` for user_8 (Rachel, "Working from home"). Add the `statusEmoji` field to all users in normalizeUser() and createInitialData().

- [x] **Add channel topics**: Set topic strings: general → "Company-wide announcements", engineering → "Ship it 🚀", random → "Non-work banter", design → "Pixels matter", project-alpha → "Launch date: March 15". Add `topic` field to normalizeChannel() and createInitialData().

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login (app starts pre-logged-in as John Smith, userId: `user_1`)
- Real file uploads to a server (use base64 localStorage)
- Real WebSocket/push notifications (simulate with immediate state updates)
- Real voice/video calls (button exists, tracks state only)
- Workspace admin dashboard
- Xlack Connect (cross-organization channels)
- Real bot/app integrations (only mock bot messages in seed data)
- Real email sending for invitations
- Multi-workspace switching (only show single workspace)
