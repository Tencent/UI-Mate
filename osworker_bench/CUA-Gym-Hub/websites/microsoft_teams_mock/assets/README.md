# Xicrosoft Teams Mock — Research Summary

> Last updated: 2025-03-11
> Author: plan agent

---

## 1. Application Overview

**Xicrosoft Teams** is a business communication and collaboration platform by Microsoft, part of the Microsoft 365 family. It serves as a unified workspace combining persistent chat, video meetings, file storage, and application integration. Teams is organized around **Teams** (workgroups) and **Channels** (topic-based conversations within a team), with separate 1:1 and group **Chat** functionality.

**Key differentiators from Slack:**
- Teams are hierarchical: Organization → Team → Channel (vs. Slack's flat workspace → channel)
- Built-in video/audio meetings deeply integrated into channels and chats
- Tabs system: each channel/chat can have pinned app tabs (Files, Wiki, Planner, etc.)
- Tight integration with Microsoft 365 (SharePoint, OneDrive, Outlook calendar)
- Activity feed as a unified notification center
- Presence/status system integrated with calendar

**Target user**: Knowledge workers in organizations of 10–300,000+ people who need team messaging, video meetings, and file collaboration.

---

## 2. Key User Personas & Primary Workflows

### Persona 1: Team Member (daily user)
- Check Activity feed for mentions and notifications
- Read and reply to channel messages
- Send direct messages (1:1 and group chats)
- Join/leave meetings
- Share and access files in channels
- React to messages with emoji
- Search for messages, people, and files

### Persona 2: Team Owner / Manager
- Create and manage teams
- Create/archive channels
- Add/remove team members
- Pin important messages
- Set channel moderation settings
- Schedule meetings from calendar

### Persona 3: Meeting Participant
- Join video/audio calls
- Share screen
- Use meeting chat
- Raise hand, react during meetings
- View meeting notes and recordings

---

## 3. Complete Feature Inventory

### 3.1 Core Shell (App Frame)
- **Left Icon Rail**: Vertical navigation with icons for Activity, Chat, Teams, Calendar, Calls, Files, Apps, and more. Dark indigo/purple or white theme. Notification badges (red circles with count).
- **Top Header Bar**: Back/forward navigation arrows, centered search bar ("Search (Ctrl+Alt+E)"), user avatar with presence indicator, settings (three-dot menu).
- **Secondary Sidebar**: Context-dependent — shows chat list, team/channel tree, calendar, call history, or file browser depending on active left rail icon.
- **Main Content Area**: Takes up the remaining space; displays channel posts, chat messages, meeting views, file lists, or settings.
- **Title Bar**: Windows-style with minimize/maximize/close. Shows Teams logo.

### 3.2 Primary Views

#### Activity Feed (P0)
- Unified notification feed showing: mentions, replies, reactions, meeting invites, app notifications
- Each item shows: icon type, sender avatar+name, context (channel/chat), preview text, timestamp
- Filter by: All, Mentions, Unread
- Click navigates to the source message/channel
- "Mark all as read" action

#### Chat (P0)
- **Chat List Panel**: Shows recent conversations (1:1 and group chats), pinned chats, filter chips (Unread, Muted), compose button
- Each chat item: avatar(s), name, last message preview, timestamp, unread badge, online status dot
- **Chat View**: Message thread with sender avatar, name, timestamp, message body, reactions
- Tabs within chat: Chat (messages), Files, Organization, Activity
- Message actions on hover: React, Reply, More (Forward, Pin, Delete, Edit)
- Compose area with rich text toolbar (Bold, Italic, Underline, Lists, Links, Code, Attach, Emoji, GIF, Sticker, Priority)

#### Teams & Channels (P0)
- **Team List**: Expandable tree — each team shows its channels
- Team item: team avatar/icon, team name, three-dot menu
- Channel types: Standard (open), Private (lock icon), Shared (link icon)
- **Channel View**:
  - Header: Channel name + description
  - Tab bar: Posts, Files, Wiki/Notes, + (add tab)
  - Posts tab: threaded message list (similar to chat but with thread reply indicators)
  - "New conversation" composer at bottom
  - Reply to thread opens a right-side thread panel

#### Calendar (P1)
- Day/Week/Work week view with time slots
- Meeting cards showing: title, time, participants, join button
- "New meeting" button to schedule
- Meeting detail panel: title, date/time, participants, notes, join link
- Integration with presence (shows "In a meeting" status)

#### Calls (P1)
- Call history list: incoming, outgoing, missed
- Each entry: contact name/avatar, call type icon, duration, timestamp
- Speed dial / favorites section
- Voicemail section
- "Make a call" dialpad

#### Files (P2)
- Recent files across all teams/chats
- Cloud storage views (OneDrive, SharePoint)
- File list: name, modified date, modified by, location
- Preview on click, download, share actions

### 3.3 Data Objects

| Entity | Description |
|--------|-------------|
| **User** | Team member with profile, presence, status |
| **Team** | A workgroup containing channels and members |
| **Channel** | Topic-based conversation container within a team |
| **Chat** | 1:1 or group direct message conversation |
| **Message** | Text/rich content in a channel or chat |
| **Thread** | Reply chain under a parent message |
| **Reaction** | Emoji reaction on a message |
| **Meeting** | Scheduled or ad-hoc video/audio event |
| **File** | Shared document/attachment |
| **Notification** | Activity feed item |
| **Tab** | Pinned app/content in a channel or chat |
| **Call** | Voice/video call record |

### 3.4 Interactions

| Interaction | Context |
|-------------|---------|
| Send message | Chat, Channel |
| Reply in thread | Channel posts, Chat |
| React with emoji | Any message |
| Edit message | Own messages |
| Delete message | Own messages |
| Pin message | Channel/Chat |
| Forward message | To another chat/channel |
| @mention user | In message composer |
| Search (global) | Top search bar |
| Filter chats | Chat list filters |
| Create team | Teams view |
| Create channel | Within a team |
| Add/remove members | Team/channel settings |
| Star/favorite channel | Channel header or sidebar |
| Set status/presence | Profile menu |
| Schedule meeting | Calendar |
| Join meeting | Calendar or notification |
| Share file | Composer attachment |
| Switch tabs | Channel/Chat tab bar |
| Mark as read/unread | Right-click context menu |
| Mute channel/chat | Right-click context menu |

### 3.5 UI Patterns

- **Hover action bar**: Message hover reveals action icons (React, Reply, More)
- **Context menus**: Right-click on messages, channels, chats
- **Modal dialogs**: Create team, schedule meeting, channel settings
- **Side panels**: Thread panel (right side), channel details panel
- **Toast notifications**: Brief pop-up confirmations
- **Inline editing**: Edit message in-place
- **Tab navigation**: Horizontal tabs in channel/chat header
- **Filter chips**: Horizontal scrollable chips for filtering lists
- **Presence indicators**: Green (available), Yellow (away), Red (busy/DND), Gray (offline)
- **@mention autocomplete**: Dropdown while typing @ in composer
- **Emoji picker**: Grid picker for reactions and inline emoji
- **Rich text toolbar**: Formatting options in message composer

### 3.6 Mock Data Requirements

For a realistic training sandbox:
- **8-10 users** with varied names, avatars, titles, departments, statuses
- **3-4 teams** (e.g., "Engineering", "Marketing", "Product", "All Company")
- **4-6 channels per team** (General + topic-specific)
- **20-40 messages per active channel** with varied content, reactions, threads
- **5-8 chat conversations** (mix of 1:1 and group)
- **5-10 calendar events** for the current/next day
- **10-15 files** shared across channels
- **15-20 activity feed items** (mix of mentions, replies, reactions)
- **3-5 call history entries**

---

## 4. UI Layout — Detailed Description

### Desktop Layout (from screenshots)

```
┌──────────────────────────────────────────────────────────────┐
│ [←][→]          Search (Ctrl+Alt+E)              [···] [AV] │  ← Top Bar (48px)
├────┬─────────────┬───────────────────────────────────────────┤
│ 🔔 │ Chat        │ Channel Name / Chat Name                  │
│ 💬 │ ┌─────────┐ │ [Posts] [Files] [Wiki] [+]                │  ← Tab Bar
│ 👥 │ │ Chat 1  │ │─────────────────────────────────────────  │
│ 📅 │ │ Chat 2  │ │                                           │
│ 📞 │ │ Chat 3  │ │  [Avatar] User Name    2:30 PM            │
│ 📁 │ │ Chat 4  │ │  Message content here...                  │
│ ···│ │ Chat 5  │ │  👍 2  ❤️ 1                               │  ← Main Content
│ 🔌 │ │         │ │                                           │
│    │ │         │ │  [Avatar] User Name    2:45 PM            │
│    │ │         │ │  Reply to thread...                       │
│    │ │         │ │                                           │
│    │ └─────────┘ │───────────────────────────────────────── │
│    │             │  [B I U ···] [📎 😊 GIF ···]  [Send ➤]  │  ← Composer
├────┴─────────────┴───────────────────────────────────────────┤
```

**Measurements (from screenshots):**
- Left Icon Rail: 68px wide, dark indigo (#292929 or #242424) or white background
- Secondary Sidebar: 280-320px wide
- Top Header: 48px tall
- Main content: remaining width
- Message composer: ~120px tall (with toolbar)

### Color Scheme (from screenshots analysis)

| Element | Color | Hex |
|---------|-------|-----|
| Left rail background (dark theme) | Dark indigo/charcoal | `#292929` or `#242424` |
| Left rail background (light theme) | White | `#FFFFFF` |
| Primary accent (brand) | Purple/Indigo | `#6264A7` |
| Active nav indicator | Blue/Purple | `#6264A7` |
| Selected item background | Light blue | `#E8EBFA` |
| Notification badge | Red | `#C4314B` |
| Online presence | Green | `#92C353` |
| Away presence | Yellow | `#FCD116` |
| Busy/DND presence | Red | `#C4314B` |
| Offline presence | Gray | `#B4B4B4` |
| Main background | White | `#FFFFFF` |
| Sidebar background | Light gray | `#F5F5F5` |
| Text primary | Dark gray | `#242424` |
| Text secondary | Medium gray | `#616161` |
| Border/divider | Light gray | `#E0E0E0` |
| Hover background | Very light gray | `#F0F0F0` |
| Sent message bubble | Light purple/blue | `#E8EBFA` |
| Link color | Blue | `#5B5FC7` |

### Typography
- **Font family**: Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif
- **Header 1**: 20px, 600 weight
- **Header 2**: 16px, 600 weight
- **Body text**: 14px, 400 weight
- **Small/caption**: 12px, 400 weight
- **Timestamp**: 12px, 400 weight, secondary color
- **Channel name**: 14px, 600 weight

---

## 5. Screenshots Reference

All screenshots stored in `assets/screenshots/`:

| File | Description | Useful For |
|------|-------------|------------|
| `teams-web-view-react.png` | Chat view with message bubbles, sidebar, composer | Chat layout, message styling, composer toolbar |
| `teams-chat-composite.png` | Meeting view with screen share and side chat | Meeting UI, participant thumbnails, meeting controls |
| `teams-homepage.png` | Meeting in progress with side panel tab | Meeting stage, left rail, side panel pattern |
| `teams-desktop-app.png` | Channel view with embedded Asana tab | Team/channel tree, tab system, channel layout |
| `teams-welcome-tab.png` | Tab UI with welcome content and cards | Tab navigation, content cards, left rail (light) |
| `teams-hero-card.png` | Chat with bot card, pinned/recent chats | Chat list layout, pinned section, card rendering |
| `teams-tab-in-channel.png` | Browser-based Teams with channel tabs | Channel tab bar, sidebar with filters, channel tree |
| `teams-live-share-chat.png` | Channel with embedded app and toast notification | Team sidebar, embedded content, toast/notification |
| `teams-chat-channel-tabs.png` | Documentation graphic showing tab components | Tab cards, follow mode, collaboration toast |
| `teams-meeting-view.jpg` | Meeting in progress (photo) | Meeting participant layout |

---

## 6. What to Skip (Out of Scope)

- **Authentication / Login**: App starts pre-logged-in as default user
- **Real video/audio calls**: Meeting views are visual only (no WebRTC)
- **File upload to real servers**: Files handled via mock localStorage/state
- **Real-time sync**: No WebSocket or real-time updates needed
- **Microsoft 365 integration**: No real SharePoint/OneDrive/Outlook connections
- **External app integrations**: Tabs show mock content only
- **Admin/IT settings**: No tenant management
- **Mobile layout**: Desktop only
- **Copilot AI features**: No real AI functionality

---

## 7. Key Architectural Decisions for Mock

1. **State Management**: React Context + dataManager.js pattern (same as slack_mock)
2. **Routing**: react-router-dom with BrowserRouter
3. **Styling**: Plain CSS (matching slack_mock pattern, not Tailwind)
4. **Data Persistence**: localStorage with session isolation via `?sid=` parameter
5. **State Inspection**: `/go` route returning `{initial_state, current_state, state_diff}`
6. **API Endpoints**: Vite mock-api plugin for `/post`, `/state`, `/go`, `/upload`, `/files`
7. **No external UI libraries**: All components built from scratch (emoji picker, modals, etc.)
