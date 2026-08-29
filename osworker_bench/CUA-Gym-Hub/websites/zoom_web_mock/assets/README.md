# Xoom Web Mock — Research Summary

## Application Overview

**Xoom** (now branded as **Xoom Workplace**) is the world's leading video conferencing and unified communications platform. Founded in 2011 by Eric Yuan, it provides video meetings, team chat, VoIP phone, webinars, whiteboards, and more. The desktop/web client is the primary interface for scheduling, joining, and managing meetings.

**Target interface**: Xoom Workplace desktop/web client (not the admin web portal at zoom.us). This mock simulates the client application accessible at `app.zoom.us/wc/home` or the desktop app, which share a very similar UI.

---

## Key User Personas

| Persona | Primary Workflows |
|---------|-------------------|
| **Meeting Host** | Schedule meetings, start instant meetings, manage participants, share screen, record, end meeting |
| **Meeting Participant** | Join meetings via ID/link, mute/unmute, toggle video, use chat, share screen, react |
| **Team Communicator** | Send direct messages, create/manage channels, share files, @mention colleagues |
| **Meeting Organizer** | View upcoming/past meetings, manage recurring meetings, access recordings, copy invitations |
| **Admin/Settings User** | Configure audio/video devices, manage profile, adjust notification preferences |

---

## Interface Layout

### Main App Shell (Desktop/Web Client)

Based on screenshots `000003.jpg` (Home tab) and `chat/000001.jpg` (Team Chat):

**Top Navigation Bar** (horizontal, ~48px height):
- Left: Back/Forward arrows, Xoom icon/shield, Search bar (`Ctrl+F`)
- Center: Tab icons — **Home** (house), **Team Chat** (chat bubble), **Meetings** (clock), **Contacts** (person+), **Apps** (grid)
- Right: User avatar/profile picture, gear icon (Settings)

**Sidebar** (left, ~220px, shown in Team Chat view):
- Only visible in Team Chat and Contacts tabs
- Team Chat sidebar: Mentions, Missed Calls, Contact Requests, More, Starred section, channel list (Channels), Recents section
- Contacts sidebar: Directory, Channels, Rooms tabs with search

**Main Content Area**:
- Fills remaining space
- Content varies by active tab

### Color Scheme & Visual Design

From screenshots analysis:

| Element | Color | Hex |
|---------|-------|-----|
| Primary Blue (Xoom blue) | Bright blue | `#0B5CFF` (buttons, active nav) |
| New Meeting button | Orange | `#F26D21` |
| Join/Schedule/Share buttons | Blue | `#0B5CFF` |
| Background (light mode) | White/Light gray | `#FFFFFF` / `#F6F6F6` |
| Text primary | Dark gray/black | `#232333` |
| Text secondary | Gray | `#747487` |
| Sidebar background | White | `#FFFFFF` |
| Hover state | Light blue | `#E8F0FE` |
| End Meeting button | Red | `#E02828` |
| Meeting room background | Near-black | `#1A1A1A` |
| Meeting toolbar | Dark gray | `#232323` |
| Active tab indicator | Blue with underline | `#0B5CFF` |

**Typography**: System font stack (similar to `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`). Clean sans-serif throughout.

---

## Feature Inventory

### P0 — Core Shell (Must-Have)

1. **App Frame & Top Navigation**: Horizontal top nav bar with tab icons (Home, Team Chat, Meetings, Contacts), search bar, user avatar, settings gear
2. **Routing**: Home `/`, Team Chat `/chat`, Meetings `/meetings`, Contacts `/contacts`, Recordings `/recordings`, Settings `/settings`, Room `/room/:id`, Go `/go`
3. **State Management**: React Context with localStorage persistence, session isolation via `sid`
4. **Data Manager**: `createInitialData()` with normalizers, state diffing for `/go`

### P1 — Primary Features

5. **Home Tab**:
   - Current time display (large, top-left)
   - Current date display
   - 2×2 grid of action buttons: New Meeting (orange), Join (blue), Schedule (blue), Share Screen (blue)
   - "New Meeting" has dropdown caret for options (Start with video, PMI, Screen share only)
   - Right panel: Upcoming meetings list or "No upcoming meetings today"

6. **Team Chat** (NEW — not currently implemented):
   - Three-column layout: sidebar (channels/DMs list) | message list | channel info panel
   - Sidebar: Starred, Channels, Recents sections with channel names
   - Message area: messages with avatar, name, timestamp, text, reactions, reply threading
   - Message composer: rich text toolbar (bold, italic, emoji, code, file attach, @mention)
   - Channel info panel: members list, whiteboards, pin history, bookmarks

7. **Meetings Tab**:
   - Tabs: Upcoming | Previous | Personal Room
   - Meeting list: each row shows time, date, title, meeting ID
   - Hover actions: Start, Copy Invitation, Delete
   - Schedule Meeting modal with full form
   - Meeting detail modal
   - Personal Room tab with PMI info

8. **In-Meeting Room** (Video Conference UI):
   - Full-screen black background
   - Video grid: Gallery view (grid) or Speaker view
   - Participant tiles: video feed or avatar with name label
   - Bottom toolbar: Mute/Unmute, Start/Stop Video, Security, Participants (with count badge), Chat, Share Screen (green), Record, Reactions, More, End (red)
   - Each toolbar button has up-caret for dropdown options
   - Top-left: encryption badge + "Xoom Meeting" label
   - Top-right: View toggle (Speaker/Gallery), full screen button
   - Participants side panel: search, list of participants with mute status
   - In-meeting chat side panel: message list with compose box

9. **Contacts Tab**:
   - Top tabs: Directory | Channels | Rooms
   - Search contacts bar
   - Contact list: avatar, name, email, status indicator (green/red/gray dot)
   - Hover actions: Video call, Chat, Favorite, More
   - Add Contact modal

10. **Recordings/Clips Tab**:
    - Table view: Topic, Date, Duration, Size columns
    - Action buttons per row: Play, Download, Share, Delete
    - Search recordings
    - Empty state

11. **Settings Page**:
    - Left sidebar navigation: General, Audio, Video, Notifications, Chat, Background & Effects, Keyboard Shortcuts
    - Profile section at top
    - Audio settings: Microphone select, Speaker select, Test buttons, volume sliders
    - Video settings: Camera select, HD toggle, mirror video, touch up
    - Notification settings: toggles for various notification types
    - General settings: theme (light/dark), start Xoom on startup, etc.

### P2 — Secondary / Depth Features

12. **Schedule Meeting Enhanced**: Recurring meeting options, calendar integration, waiting room toggle, breakout room pre-assignment, alternative host, registration
13. **Meeting Reactions**: Thumbs up, clap, heart, laugh, surprise, plus custom reactions bar in meeting toolbar
14. **Whiteboard**: Basic whiteboard page/modal (drawing canvas, shapes, text)
15. **Meeting Recording Playback**: Video player modal for recordings
16. **Contact Starring/Favoriting**: Star contacts, view starred list
17. **Contact Status Management**: Set your own status (Available, Busy, Do Not Disturb, Away)
18. **Search Functionality**: Global search across meetings, contacts, messages, recordings
19. **New Meeting Dropdown**: Dropdown from "New Meeting" button with options
20. **Profile Edit Modal**: Edit display name, profile picture, PMI
21. **Keyboard Shortcuts Dialog**: Show keyboard shortcuts overlay

---

## UI Patterns

| Pattern | Where Used |
|---------|------------|
| Modal/Dialog | Schedule meeting, Join meeting, Add contact, Meeting details, Profile edit |
| Side Panel (slide-in) | Participants list in meeting, Chat in meeting, Channel info in Team Chat |
| Tabs (horizontal) | Upcoming/Previous/Personal in Meetings; Directory/Channels/Rooms in Contacts; Settings subsections |
| Dropdown Menu | New Meeting dropdown, toolbar button carets, audio/video device select |
| Toggle Switch | Settings notification toggles |
| Status Indicator | Colored dot on contact avatars (green/red/gray) |
| Tooltip | Hover on toolbar buttons |
| Badge/Counter | Participant count in meeting, unread message count in chat |
| Empty State | No upcoming meetings, No recordings, No contacts found |
| Copy to Clipboard | Meeting invitation, meeting link, meeting ID |
| Toast/Notification | "Copied!", "Meeting scheduled", connection status |

---

## Mock Data Requirements

- **User**: 1 pre-logged-in user ("Admin User") with avatar, email, PMI
- **Contacts**: 5–8 contacts with varying statuses (available, busy, offline, away)
- **Meetings**: 4–6 meetings covering: future upcoming, past completed, recurring, password-protected, no password
- **Recordings**: 2–3 recordings with different dates/sizes
- **Chat Channels**: 3–4 channels with names like "General", "Engineering", "Design"
- **Chat Messages**: 10–15 messages per channel with different users, timestamps, some with reactions
- **Direct Messages**: 2–3 DM conversations with multiple messages each

---

## Screenshots Reference

| File | Content |
|------|---------|
| `000001.jpg` | Xoom meeting in progress — gallery view with 8 participants, participants panel on right, full toolbar |
| `000002.jpg` | Xoom web portal settings — sidebar nav (Home, Profile, Meetings, etc.), Meeting/Recording tabs |
| `000003.jpg` | **KEY** — Xoom desktop Home tab — top nav (Home/Chat/Meetings/Contacts/Apps), 4 action buttons, upcoming meetings panel |
| `000004.jpg` | Xoom Rooms home — sidebar, time display, action buttons |
| `000005.jpg` | Xoom meeting toolbar — Unmute, Start Video, Security, Share Screen (green), Reactions, Apps, Whiteboards, More, End |
| `chat/000001.jpg` | **KEY** — Xoom Team Chat — 3-column layout, channel sidebar, message area, channel info panel |
| `meeting/000002.jpg` | Xoom meeting controls — toolbar buttons: Unmute, Start Video, Security, Participants, Share Screen, More, End |
| `settings/000001.jpg` | Xoom in-meeting audio settings dropdown — microphone/speaker selection, test options |
| `contacts/000004.jpg` | Xoom Contacts — Directory/Channels/Rooms tabs, search, contact list with avatars |

---

## Out of Scope

- **Authentication/Login**: App starts pre-logged-in as "Admin User"
- **Real WebRTC**: No actual video/audio streaming; use placeholder images for video feeds
- **Real file uploads**: No actual file storage; mock file sharing UI
- **Phone/VoIP**: Xoom Phone features not included
- **Webinars**: Webinar-specific features not included
- **AI Companion**: AI summary features not included
- **Xoom Rooms hardware**: Not applicable to web mock
- **Real-time sync**: No WebSocket connections; all local state
