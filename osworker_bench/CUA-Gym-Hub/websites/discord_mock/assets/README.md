# Xiscord Mock — Research Summary

> Last updated: 2026-02-28
> Application: [Xiscord](https://discord.com) — Real-time voice, video, and text communication platform
> Category: Communication / Community platform

---

## 1. Application Overview

Xiscord is a free communication platform originally designed for gamers, now widely used by communities, teams, and friend groups. It combines persistent chat rooms (text channels), voice channels, video calling, screen sharing, and direct messaging into a single application organized around "servers" (guilds).

### What Makes Xiscord Distinct
- **Server-centric model**: Users join multiple servers, each with its own channels, roles, and community
- **Voice-first design**: Voice channels are always-on — users join/leave freely (no ringing)
- **Rich text chat**: Markdown support, embeds, reactions, threads, pins, attachments
- **Role-based permissions**: Granular per-channel and per-role permission system
- **Dark-theme native**: UI designed dark-first with high contrast colors

### Key User Personas
1. **Server Admin/Owner**: Creates servers, manages roles/permissions, configures channels
2. **Moderator**: Manages messages, kicks/bans users, enforces rules
3. **Active Member**: Sends messages, joins voice, reacts, uses threads
4. **Casual User**: Primarily uses DMs and a few servers, browses messages

### Primary Daily Workflows
1. Check unread messages across servers → read and respond
2. Join a voice channel to hang out / collaborate
3. Send DMs to friends
4. Browse server channels, read pinned messages
5. React to messages, participate in threads
6. Manage notifications and server settings
7. Search for past messages/files
8. Update profile and status

---

## 2. UI Layout Description

### Desktop Layout (4-panel structure, left to right)

```
┌──────┬──────────────┬─────────────────────────────────────────┬───────────────┐
│Server│  Channel     │           Main Chat Area                │   Member      │
│ List │   List       │                                         │   Sidebar     │
│      │              │  ┌─────────────────────────────────┐    │               │
│  72px│   240px      │  │  Header: # channel-name | topic │    │    240px      │
│      │              │  ├─────────────────────────────────┤    │               │
│ [DM] │ Server Name  │  │                                 │    │  ONLINE — 5   │
│ ───  │ ───────────  │  │  Messages (scroll, newest at    │    │   @user1      │
│ [S1] │ ▼ CATEGORY   │  │  bottom)                        │    │   @user2      │
│ [S2] │   # general  │  │                                 │    │               │
│ [S3] │   # random   │  │  Each message:                  │    │  OFFLINE — 3  │
│      │   # help     │  │  [avatar] Username  timestamp   │    │   @user3      │
│ ───  │ ▼ VOICE      │  │  message content                │    │               │
│ [+]  │   🔊 General │  │  [reactions row]                │    │               │
│      │     @user1   │  │                                 │    │               │
│      │              │  ├─────────────────────────────────┤    │               │
│      │ ────────────  │  │  [+] Message #channel-name     │    │               │
│      │ [avatar] User│  │  [B I ~ ] [emoji] [gif] [stick] │    │               │
│      │ [🎤][🎧][⚙]│  └─────────────────────────────────┘    │               │
└──────┴──────────────┴─────────────────────────────────────────┴───────────────┘
```

### Panel Breakdown

**Panel 1: Server List (far left, ~72px)**
- Vertical strip of circular server icons (48px diameter)
- Top: Xiscord logo / Home button (DMs) — white Xiscord icon on dark bg
- Active server: pill-shaped white indicator on left edge, icon becomes rounded-square (16px radius)
- Hover: icon animates from circle to rounded-square
- Separator line between Home and servers
- Bottom: "Add Server" (+) and "Explore" (compass) buttons
- Unread indicator: white dot on left side of server icon
- Mention badge: red circle with count on bottom-right of icon

**Panel 2: Channel List (~240px)**
- Server name at top with dropdown chevron
- Channels grouped under collapsible CATEGORIES (uppercase, small text)
- Text channels: `# channel-name` prefix
- Voice channels: speaker icon, shows connected users beneath
- Active channel: lighter background highlight
- Hover: lighter bg, settings/invite icons appear
- Bottom: User panel showing avatar, username#discriminator, mic/deafen/settings buttons
- Voice connection banner: "Voice Connected" green text, channel name, disconnect button

**Panel 3: Main Chat Area (flexible width)**
- Top header bar: `# channel-name` | channel topic | notification/pin/member/search/inbox icons
- Message area: chronological scroll, newest at bottom, date dividers between days
- Each message: 40px avatar | Username (role-colored) timestamp | content | reactions
- Message hover: action bar appears (emoji, thread, more menu)
- Typing indicator at bottom: "User is typing..."
- Input area: attachment (+) button, text input, formatting toolbar, emoji/gif/sticker buttons
- Welcome section at top of channel: channel name + description + creation date

**Panel 4: Member Sidebar (~240px, toggleable)**
- Members grouped by role or online status
- Each: avatar + status dot + username (role-colored) + custom status
- Section headers: "ONLINE — N", "OFFLINE — N", or role names with count
- Toggleable via member list icon in header

### DM Mode Layout
When user clicks Home/DM icon:
- Panel 2 becomes: Search bar, Friends button, DM list
- Panel 3 becomes: Friends dashboard (tabs: Online, All, Pending, Blocked, Add Friend) or DM chat
- Panel 4: hidden or shows user info

---

## 3. Color Palette (Dark Theme — Default)

### Core Colors
| Element | Hex | Usage |
|---------|-----|-------|
| Primary Background | `#313338` | Main chat area bg (updated 2025) |
| Secondary Background | `#2b2d31` | Channel list/sidebar bg |
| Tertiary Background | `#1e1f22` | Server list bg, darkest areas |
| Quaternary Background | `#232428` | Member sidebar bg |
| Message Hover | `#2e3035` | Message row hover |
| Input Background | `#383a40` | Text input fields |
| Hover/Active | `#35373c` | Channel hover, button hover |
| Selected Channel | `#404249` | Active/selected channel bg |

### Brand Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Blurple | `#5865F2` | Primary brand, links, buttons, mentions |
| Green | `#23a55a` | Online status, success, Add Friend button |
| Yellow | `#f0b232` | Idle status, warnings |
| Red | `#f23f42` | DND status, errors, destructive actions |
| Fuchsia | `#eb459e` | Boost, special features |

### Text Colors
| Element | Hex | Usage |
|---------|-----|-------|
| Primary Text | `#f2f3f5` | Main content, usernames |
| Secondary Text | `#b5bac1` | Timestamps, descriptions |
| Muted Text | `#949ba4` | Channel names, inactive |
| Link Text | `#00a8fc` | Hyperlinks |
| Interactive Hover | `#dbdee1` | Hovered channel text |

### Status Indicator Colors
| Status | Hex | Shape |
|--------|-----|-------|
| Online | `#23a55a` | Filled circle |
| Idle | `#f0b232` | Moon/quarter circle |
| DND | `#f23f42` | Circle with horizontal line |
| Offline/Invisible | `#80848e` | Empty circle outline |

---

## 4. Complete Feature List

### P0 — Core Shell (Must Have)
1. **App Layout**: 4-panel responsive layout (server list + channel list + chat + members)
2. **Server List Navigation**: Click servers to switch, visual indicators for active/unread
3. **Channel List**: Categories, text channels, voice channels, collapsible groups
4. **Message Display**: Avatar, username, timestamp, content, reactions
5. **Message Input**: Text input with Enter to send, Shift+Enter for newline
6. **Routing**: Server/channel/DM URL routing
7. **State Management**: Zustand store with session isolation
8. **`/go` Endpoint**: State inspection for RL training

### P1 — Primary Features
9. **Markdown Rendering**: Bold, italic, underline, strikethrough, code, code blocks, spoilers, blockquotes, headers
10. **Emoji Reactions**: Add/remove reactions, reaction counts, emoji picker
11. **Thread System**: Create threads from messages, reply in threads, thread panel
12. **Direct Messages**: DM list, send/receive DM messages, DM chat area
13. **Friends Dashboard**: Online/All/Pending/Blocked tabs, friend list with status
14. **User Profile Popup**: Click avatar to see profile card (banner, avatar, roles, about me)
15. **Member Sidebar**: Online/offline grouping, role colors, status indicators
16. **Voice Channel UI**: Join/leave voice, connected users display, voice status bar
17. **Channel Management**: Create channels, edit channel topic/description
18. **Server Management**: Create servers, server name display
19. **Message Actions**: Edit, delete, pin messages
20. **Pinned Messages**: View pinned messages panel
21. **Search**: Search messages across channels
22. **Unread Indicators**: Unread badges on servers and channels
23. **@Mentions**: Mention users in messages, highlight mentioned messages
24. **Typing Indicator**: "User is typing..." display
25. **Message Embeds**: Auto-detect URLs, render link previews, image embeds

### P2 — Secondary Features
26. **Notification Settings**: Per-channel and per-server notification preferences
27. **User Settings Modal**: Appearance, notifications, keybinds sections
28. **Server Settings Panel**: Server name, roles, channels overview
29. **Role Management**: Create/edit roles with colors, assign to members
30. **Channel Permissions**: View/edit per-channel permission overrides (visual only)
31. **Message Formatting Toolbar**: Bold/italic/code buttons in input area
32. **File Attachment UI**: Attachment button, file preview display
33. **Custom Status**: Set custom status with emoji
34. **Quick Switcher**: Ctrl+K search for channels/servers/DMs
35. **Keyboard Shortcuts**: Common shortcuts (Esc to mark read, Ctrl+K, etc.)
36. **Context Menus**: Right-click menus on messages, users, channels
37. **Drag-and-drop**: Reorder channels within categories
38. **Bulk Message Actions**: Select and delete multiple messages

---

## 5. Screenshots Inventory

Screenshots downloaded to `assets/screenshots/`:

| File | Description |
|------|-------------|
| `000001.jpg` | Xiscord desktop with voice channel active, channel list sidebar, video call participants, context menu showing View Profile/Send Message/User Volume/Mute options |
| `000002.jpg` | Xiscord User Settings > Appearance page showing Default Themes (Light, Ash, Dark, Onyx) and Color Themes grid, sidebar with settings categories |
| `000003.jpg` | Xiscord desktop showing new server welcome page with "Invite your friends", "Personalize your server", "Send your first message" prompts, screen share dialog, channel list with TEXT CHANNELS and VOICE CHANNELS categories |
| `000004.jpg` | Xiscord logo with screen share icon (branding image) |
| `000005.jpg` | Xiscord channel list close-up showing channel names with emoji decorations, text and voice channels under categories |

### Key Visual Observations from Screenshots
- **Server sidebar**: Very narrow (~72px), icons are circular, active = rounded square
- **Channel list**: Categories in uppercase (e.g., "TEXT CHANNELS", "VOICE CHANNELS"), channels prefixed with # or speaker icon
- **User panel at bottom**: Shows avatar, username, status, mic/headphones/settings icons
- **Voice Connected bar**: Green text "Voice Connected" with channel name, disconnect/settings icons
- **Settings page**: Two-column layout — left sidebar with categories, right area with settings content
- **Welcome page**: Large welcome text, action cards with icons for onboarding steps
- **Dark theme**: Very dark backgrounds (#1e1f22 to #313338 range), high contrast text

---

## 6. Data Model Overview

See `data_model.md` for full entity definitions.

**Core Entities:**
- **Server** (Guild): Container for channels, roles, and members
- **Channel**: Text or voice channel within a server, organized by categories
- **Message**: Text content sent to a channel or DM, with reactions and thread support
- **User**: Platform user with profile, status, and roles
- **Role**: Permission group within a server with name and color
- **Thread**: Sub-conversation spawned from a message
- **DM Conversation**: Direct message channel between users
- **Reaction**: Emoji response to a message with user tracking

---

## 7. Out of Scope

The following are explicitly NOT implemented in this mock:
- **Authentication/Login**: App starts pre-logged-in as default user
- **Real voice/video**: Voice channels are visual-only (join/leave state tracked)
- **File uploads to server**: Attachment UI exists but no actual upload
- **Real-time communication**: No WebSocket or real networking
- **Database persistence**: LocalStorage only (+ session file system via Vite plugin)
- **Bot integration**: No bot commands or webhook handling
- **Nitro/Premium features**: No subscription features
- **Screen sharing**: No actual screen capture
- **2FA/Security**: No two-factor authentication
