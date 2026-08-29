# Xlack Mock — Research Summary

> Last updated: 2026-02-28 by plan agent

## App Overview

**Xlack** is a team messaging and collaboration platform. It organizes communication into **channels** (public/private topic-based groups), **direct messages** (1-on-1 or group DMs), and **threads** (in-context replies to any message). Xlack is the dominant workplace messaging tool with 40M+ daily active users.

**Category:** Team communication / workplace messaging
**Platform:** Web, Desktop (Electron), Mobile (iOS/Android)

## Key User Personas

1. **Team Member (primary)** — Sends/receives messages in channels and DMs. Reads threads, reacts to messages, mentions colleagues, shares files. This is the persona our mock simulates.
2. **Team Lead** — Creates channels, manages members, pins important messages, sets channel topics/descriptions, uses bookmarks to organize resources.
3. **Workspace Admin** — Manages workspace settings, user groups, permissions (out of scope for mock).

## Primary Workflows (Daily Actions)

1. **Read and send messages** in channels and DMs
2. **Reply in threads** to maintain context
3. **React with emoji** to acknowledge messages
4. **Search** for messages, people, channels, files
5. **Switch between channels/DMs** via sidebar navigation
6. **@mention** colleagues to get their attention
7. **Pin/bookmark** important messages and links
8. **Edit/delete** own messages
9. **Share files/images** in messages
10. **Update status** and profile information

## Xlack's Design (2024 Redesign)

### Navigation Structure

Xlack's 2024 redesign introduced a **two-tier navigation**:

**Primary sidebar (far left, ~48px wide, dark aubergine):**
- Workspace icon(s) at top
- Compose button (pencil-in-square icon)
- **Home** tab icon (house) — traditional channel list view
- **DMs** tab icon (chat bubble) — dedicated DM list
- **Activity** tab icon (bell) — mentions, reactions, threads combined
- **Later** tab icon (bookmark/flag) — saved items and reminders
- **More** tab icon (three dots) — apps, workflows, canvases, files, channels browser, people
- User avatar at bottom (opens profile/status menu)
- **+** button to add workspaces

**Secondary sidebar (~260px, slightly lighter dark):**
Content changes based on selected primary tab:

- **Home tab**: Shows "All unreads", "Threads", "Mentions & reactions", "Drafts", "Show more" quick-links at top, then collapsible sections: "Starred", "Channels" (+), "Direct messages" (+)
- **DMs tab**: Shows search bar "Find a DM", then chronological DM list with avatar, name, online indicator, last message preview, timestamp
- **Activity tab**: Shows tabs for "All", "Mentions", "Reactions", "Threads" with chronological feed
- **Later tab**: Shows saved items with "In progress", "Completed", "Archived" tabs

### Main Content Area

**Channel View Header:**
- Channel name (with # prefix) + star toggle + dropdown chevron
- Member count icon + settings/gear icon (opens channel details panel)
- Below header: "Add a bookmark" bar (bookmarks row)
- Channel topic/description shown on hover or in details

**Message Area:**
- Reverse-chronological scroll (newest at bottom)
- Date separators between day groups ("Monday, January 15th")
- Each message: 36px avatar (rounded square), bold sender name, muted timestamp (relative or absolute), message body
- Hover toolbar on messages: emoji reaction (+), reply in thread, forward, bookmark, more (...) menu
- Reactions below message: emoji + count badges, clicking toggles your reaction
- Thread indicator: "N replies" link + last replier avatars

**Message Composer (bottom):**
- Rich text area with placeholder "Message #channel-name"
- Below text: formatting toolbar — Bold (B), Italic (I), Strikethrough (S), Code (`<>`), Link, Ordered list, Bulleted list, Block quote, Code block
- Left of text area: + button (attachments menu), clip icon
- Right side: @ mentions, emoji picker (smiley), formatting toggle (Aa), send button (arrow)
- Above text area (optional): file attachment previews

### Color Palette (from screenshots + brand guidelines)

| Role | Color | Hex |
|------|-------|-----|
| Primary (Aubergine/sidebar bg) | Dark purple | `#4A154B` |
| Sidebar bg (deeper) | Very dark purple | `#3F0E40` / `#1A1D21` |
| Sidebar text | Light gray | `#BCABBC` |
| Sidebar active item bg | Teal/blue highlight | `#1164A3` |
| Sidebar active item text | White | `#FFFFFF` |
| Top bar bg | Dark (matches sidebar) | `#350D36` |
| Main content bg | White | `#FFFFFF` |
| Main text | Near black | `#1D1C1D` |
| Secondary text / timestamps | Gray | `#616061` |
| Border/divider | Light gray | `#DDDDDD` |
| Link / mention | Blue | `#1264A3` |
| Online indicator | Green | `#2BAC76` |
| Brand green (buttons) | Green | `#007A5A` |
| Brand blue | Blue | `#36C5F0` |
| Brand yellow | Yellow | `#ECB22E` |
| Brand red | Red/pink | `#E01E5A` |
| Hover bg (messages) | Very light gray | `#F8F8F8` |
| Thread panel bg | Off-white | `#F8F8F8` |
| Unread badge | Red | `#E01E5A` |

### Typography

- **Font family:** `Xlack-Lato, Lato, appleLogo, sans-serif` (Lato is Xlack's primary font)
- **Message text:** 15px, regular weight, line-height ~22px
- **Sender name:** 15px, bold (700)
- **Timestamp:** 12px, color #616061
- **Sidebar items:** 15px, regular, color #BCABBC
- **Channel header name:** 18px, bold
- **Section headers in sidebar:** 15px, semi-bold, uppercase-ish

### Spacing

- Sidebar item height: ~32px
- Message vertical padding: ~8px
- Avatar size: 36px (messages), 28px (sidebar DMs)
- Avatar border-radius: 4px (rounded square, not circle)
- Message left padding (for avatar): 52px (36px avatar + 16px gap)
- General horizontal padding: 16-20px

## Complete Feature List

### P0 — Core Shell (Required to render)
1. Two-tier sidebar layout (primary icon bar + secondary channel list)
2. Top bar with back/forward nav, search bar, help icon
3. Main content area with message list and composer
4. React Router navigation between channels, DMs, and special views
5. State management with Context + dataManager
6. Session isolation (vite.config.js mock API)
7. `/go` state inspection endpoint

### P1 — Primary Features (Core interactive workflows)
1. **Channel messaging** — Send, receive, display messages in channels
2. **Direct messaging** — Send, receive messages in DMs (1-on-1)
3. **Thread replies** — Click "Reply in thread" to open thread panel, send replies
4. **Emoji reactions** — Add/remove reactions via picker or clicking existing reaction badges
5. **Message editing** — Edit own messages (with "edited" indicator)
6. **Message deletion** — Delete own messages (with confirmation)
7. **@mentions** — Type @ to trigger autocomplete, highlight mentions in messages
8. **Search** — Global search across messages, channels, people with filter tabs
9. **Channel starring** — Star/unstar channels, show in "Starred" sidebar section
10. **Message pinning** — Pin/unpin messages to channel, viewable in channel details
11. **File attachments** — Attach images/files to messages, display inline previews
12. **User profile** — View/edit display name, title, status emoji+text, timezone
13. **Channel creation** — Create new public/private channels with name + description
14. **Unread indicators** — Bold channel names + unread count badges in sidebar
15. **All Unreads view** — Aggregated unread messages across all channels
16. **Threads view** — List all active threads the user is participating in
17. **Mentions & Reactions view** — Feed of messages mentioning the user + reactions received
18. **DMs list view** — Dedicated DM tab showing all DMs with last message preview
19. **Message hover actions** — Toolbar appears on hover: react, reply, bookmark, more menu
20. **Message bookmarking** — Save messages to "Later" / bookmarks list

### P2 — Secondary Features (Depth and realism)
1. **Channel details panel** — Right panel showing: About, Members list, Pinned messages, Files, Settings
2. **Channel topic/description** — Display and edit channel topic in header
3. **Typing indicators** — Show "User is typing..." in message area
4. **User status display** — Show status emoji next to username across UI
5. **Online/offline indicators** — Green/gray dots on avatars in sidebar and DMs
6. **Quick switcher** — Ctrl+K modal to jump to any channel/DM by typing name
7. **Message formatting** — Bold, italic, strikethrough, inline code, code blocks, block quotes, links
8. **Markdown rendering** — Parse and render markdown in message display
9. **Date separators** — "Today", "Yesterday", or date headers between day groups in message list
10. **Channel bookmarks bar** — Row below channel header for saving links/files
11. **Notification preferences** — Per-channel and global notification settings
12. **Draft messages** — Auto-save unsent message text per channel
13. **Message link previews** — URL unfurling with title/description/image preview
14. **Huddle/call UI** — Start/end huddle button in channel header (state tracking only)
15. **Workspace switcher** — Multiple workspace icons in primary sidebar
16. **Custom emoji** — Support custom emoji names in reactions
17. **Invite to channel** — Add/remove members from channels
18. **"Later" / Saved items view** — Dedicated view for bookmarked messages with tabs
19. **Compose button** — Top-left compose icon opens new message composer
20. **User profile popover** — Click username in message to see mini profile card with name, title, status, timezone, "Message" button

## Screenshots Reference

| Directory | Content |
|-----------|---------|
| `screenshots/` | Main channel view with sidebar, messages, mobile comparison |
| `screenshots/sidebar/` | Sidebar navigation with Home/DMs/Activity tabs, channel lists |
| `screenshots/threads/` | Thread panel, desktop + mobile layouts |
| `screenshots/composer/` | Message composer toolbar, formatting, emoji |
| `screenshots/activity/` | Activity feed, notification preferences |
| `screenshots/search/` | Search results with Messages/People/Files/Channels tabs and filters |

### Key Visual Details from Screenshots

**Screenshot 000001.jpg (Main view):**
- Dark aubergine sidebar (~260px) with workspace name "Acme Inc" + user "Sara Parras" at top
- Quick links: All unreads, Threads, Mentions & reactions, Drafts, Show more
- Collapsible sections: Projects (starred), Channels (+), Direct messages (+)
- Active channel highlighted with blue/teal background
- Channel header: "#marketing-team ★" with member count "21" + settings icon
- Messages with 36px round-square avatars, bold names, gray timestamps
- Emoji reactions as colored badges below messages (🎉 7, ✨ 5, 👏 4, 😍 1)
- File attachment card with title + file size
- App messages (Acme Team APP) with blue left-border quote block
- Composer at bottom: "Message #marketing-team" with B I S <> formatting toolbar

**Screenshot 000002.jpg (Create channel modal):**
- New design sidebar: primary icon bar (workspace icon, Home, DMs, Activity, Later, +, avatar)
- Secondary sidebar with Channels, Direct messages sections
- Modal: "Create a channel" with Name field showing "#god-project" (69 char limit)
- "Invite external people" checkbox + "Next" green button
- Bottom bar: channel name dropdown, toggle switches

**Screenshot sidebar/000001.jpg (DMs tab):**
- Primary sidebar showing Home, DMs (active, highlighted), Activity, Later icons
- DMs view: "Find a DM" search bar at top
- DM entries: large avatar, name, online indicator dot, last message preview, timestamp
- Alternating read/unread visual treatment

**Screenshot search (search results):**
- Search results page with tabs: Messages (36), People (1), Files (0), Channels (0)
- Filter chips: People, Channels & DMs, Date, Reactions, More filters
- "Did you mean" suggestion row

## Data Model Overview

See `data_model.md` for complete entity definitions. Key entities:
- **User** — userId, fullName, displayName, avatar, status, statusEmoji, title, timezone
- **Channel** — channelId, name, description, topic, isPrivate, isStarred, members[], pinnedMessages[], unreadCount
- **Message** — messageId, senderId, content, timestamp, threadId, reactions[], attachments[], isEdited, isPinned
- **Thread** — threadId, parentMessageId, channelId, replies[], followers[], replyCount, lastReplyAt
- **DM** — dmId, participants[], lastMessage, lastTime, unreadCount
- **Notification** — notificationId, type, messageId, channelId, userId, timestamp, read
- **Bookmark** — bookmarkId, channelId, title, url, emoji, addedBy

## What to Skip

- **Authentication/login** — App starts pre-logged-in as "John Smith" (userId: "u1")
- **Real file uploads** — Use base64 encoding to localStorage
- **Real-time communication** — No WebSocket/RTM; simulate with immediate state updates
- **Real notifications** — No browser push notifications; just in-app notification list
- **Voice/video calls** — Button exists but only tracks state (no actual media)
- **Workspace admin** — No admin dashboard, user management beyond basic invite
- **Xlack Connect** — No cross-org channels
- **Apps/integrations** — No real bot framework; just mock bot messages in seed data
