# microsoft_teams_mock Schema

**Deploy order**: 28 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8028)
**Base URL**: `http://172.17.46.46:8028/`
**Go Endpoint (browser route)**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}` (rendered by React `Go` page)
**Go Endpoint (server)**: `GET /go?sid=<sid>` → same JSON served directly by Vite plugin middleware

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/post?sid=<sid>` | Inject or reset state (see actions below) |
| `GET` | `/go?sid=<sid>` | Inspect state: returns `{initial_state, current_state, state_diff}` |
| `GET` | `/state?sid=<sid>` | Raw state file: returns `{stored_state, has_custom_state, sid}` |
| `POST` | `/upload?sid=<sid>` | Upload files (multipart/form-data); returns `{success, files:[{original_name, stored_name, size, content_type, url}]}` |
| `GET` | `/files/<sid>/<filename>` | Serve uploaded or default mock files with correct Content-Type |

### POST /post Actions

| Body `action` | Behavior |
|---------------|----------|
| `"set"` | Replace entire stored state with `data.state`; also writes `.initial.json`. Add `"merge": true` to deep-merge instead of replace. |
| `"set_current"` | Update **only** current state (`<sid>.json`); never touches `.initial.json`. Used by golden-patch scripts to simulate correct completion. Add `"merge": true` for deep-merge. |
| `"reset"` | Delete stored state file; browser reverts to built-in default on next load. |

### State Diff Logic (server-side `/go`)

The server reads `<sid>.json` (current) and `<sid>.initial.json` (initial). If `.initial.json` does not exist, current is treated as both initial and current, producing an empty diff. The diff object reports top-level keys that changed, with `{ added: ... }` or `{ modified: ... }` per key.

### Default Served Files

Three mock files are auto-created in `.mock-files/_default/` on first server start:
- `Q3_Roadmap.pdf` — minimal valid PDF
- `Design_System_v2.fig` — placeholder Figma file
- `Screenshot_Error.png` — minimal 1×1 PNG

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Redirect | Redirects to `/chat` (query params preserved) |
| `/activity` | `ActivityPage` | Notification feed with All / Unread / Mentions filter |
| `/chat` | `ChatPage` | Chat list; new chat compose view when no chat selected |
| `/chat/:chatId` | `ChatPage` | Specific chat selected and open |
| `/teams` | `TeamsPage` | Teams list in sidebar; no channel selected |
| `/teams/:teamId` | `TeamsPage` | Specific team expanded |
| `/teams/:teamId/channels/:channelId` | `TeamsPage` | Specific channel open |
| `/calendar` | `CalendarPage` | Work-week / day calendar with meeting cards |
| `/calls` | `CallsPage` | Call history and speed-dial contacts |
| `/files` | `FilesPage` | File browser (Recent / Xicrosoft Teams / Downloads tabs) |
| `/settings` | `SettingsPage` | Settings page with 7 sections (see below) |
| `/go` | `Go` | State inspection: renders JSON of `{initial_state, current_state, state_diff}` |

---

## Settings Page Sections

The `/settings` route renders a two-pane layout. The left nav has two groups:

**Personal group:**
| Section ID | Label | Editable State Fields |
|------------|-------|----------------------|
| `general` | General | `currentUser.displayName`, `currentUser.jobTitle`, `currentUser.statusMessage`, `settings.language` |
| `privacy` | Privacy | `settings.privacy.readReceipts`, `settings.privacy.showPresence` |
| `notifications` | Notifications | `settings.notifications.*` (all 7 fields) |
| `appearance` | Appearance | `settings.theme` (`"light"`\|`"dark"`), `settings.display.density`, `settings.display.showChannelPreview` |
| `accessibility` | Accessibility | Read-only keyboard shortcut reference |

**App group:**
| Section ID | Label | Description |
|------------|-------|-------------|
| `permissions` | App permissions | Static placeholder (no apps installed) |
| `about` | About | Displays `currentUser.email`, `currentUser.userId`, app version |

Switching theme to `"dark"` adds CSS class `theme-dark` to `document.body`; switching to `"light"` removes it.

---

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | The logged-in user (same shape as `users[]` entries) |
| `users` | array | All organization members (10 users by default) |
| `teams` | array | Teams the current user belongs to |
| `channels` | array | All channels across all teams |
| `chats` | array | 1:1, group, and meeting chats |
| `messages` | object | Keyed by containerId (channelId or chatId) → array of message objects |
| `meetings` | array | Calendar meetings/events |
| `calls` | array | Call history records |
| `files` | array | Shared files across channels and chats |
| `notifications` | array | Activity feed notifications |
| `settings` | object | User preferences (theme, language, notifications, privacy, display) |
| `ui` | object | Transient UI state (not persisted across hard refresh in some implementations) |

---

## Detailed Object Schemas

### `currentUser` / `users[]` — User Object

```jsonc
{
  "userId": "user_1",                          // string, unique ID
  "displayName": "Adele Vance",                // string, full display name
  "firstName": "Adele",                        // string
  "lastName": "Vance",                         // string
  "email": "adele.vance@contoso.com",          // string
  "avatar": "https://i.pravatar.cc/150?u=user_1", // string, avatar URL
  "jobTitle": "Senior Marketing Manager",      // string
  "department": "Marketing",                   // string
  "location": "Seattle, WA",                   // string
  "phone": "+1 (206) 555-0110",               // string
  "presence": "available",                     // "available"|"busy"|"dnd"|"brb"|"away"|"inAMeeting"|"offline"
  "statusMessage": "",                         // string, custom status text
  "statusEmoji": "",                           // string, custom status emoji
  "outOfOffice": false,                        // boolean
  "timezone": "America/Los_Angeles"            // string, IANA timezone
}
```

### `teams[]` — Team Object

```jsonc
{
  "teamId": "team_1",                         // string, unique ID
  "displayName": "Contoso Engineering",        // string
  "description": "Engineering team collaboration space", // string
  "avatar": "",                                // string, team avatar URL (empty = use initials)
  "avatarColor": "#4A90D9",                    // string, hex color for avatar background
  "avatarInitials": "CE",                      // string, 1-2 char initials
  "visibility": "private",                     // "private"|"public"
  "isArchived": false,                         // boolean
  "isFavorite": true,                          // boolean
  "createdDateTime": "2024-06-15T10:00:00Z",  // string, ISO datetime
  "members": ["user_1", "user_2"],             // array of userId strings
  "owners": ["user_2"],                        // array of userId strings (subset of members)
  "channels": ["ch_1", "ch_2"],               // array of channelId strings
  "settings": {                                // team-level settings
    "allowMemberCreateChannels": true,
    "allowMemberDeleteMessages": true,
    "allowGiphy": true,
    "allowStickers": true,
    "allowMemes": true
  }
}
```

### `channels[]` — Channel Object

```jsonc
{
  "channelId": "ch_1",                        // string, unique ID
  "teamId": "team_1",                         // string, parent team ID
  "displayName": "General",                   // string
  "description": "General engineering discussions", // string
  "membershipType": "standard",               // "standard"|"private"
  "isFavoriteByDefault": true,                // boolean
  "isPinned": false,                          // boolean
  "isMuted": false,                           // boolean
  "unreadCount": 3,                           // number
  "lastMessagePreview": "Alex: The deployment went smoothly", // string
  "lastMessageTimestamp": "2025-03-13T14:30:00.000Z", // string, ISO datetime
  "createdDateTime": "2024-06-15T10:00:00Z",  // string, ISO datetime
  "members": [],                              // array of userId strings (for private channels)
  "tabs": [                                   // array of tab objects
    {
      "tabId": "tab_posts_1",
      "displayName": "Posts",
      "type": "posts",                        // "posts"|"files"
      "isDefault": true
    }
  ],
  "pinnedMessages": []                        // array of messageId strings
}
```

### `chats[]` — Chat Object

```jsonc
{
  "chatId": "chat_1",                         // string, unique ID
  "chatType": "oneOnOne",                     // "oneOnOne"|"group"|"meeting"
  "topic": "",                                // string, group/meeting chat topic (empty for 1:1)
  "participants": ["user_1", "user_2"],       // array of userId strings
  "isPinned": true,                           // boolean
  "isMuted": false,                           // boolean
  "isHidden": false,                          // boolean (hidden from list; sendMessage sets it false)
  "unreadCount": 2,                           // number
  "lastMessagePreview": "Sounds good, I'll push the fix now.", // string
  "lastMessageSenderId": "user_2",            // string, userId of last sender
  "lastMessageTimestamp": "2025-03-13T14:45:00.000Z", // string, ISO datetime
  "createdDateTime": "2024-12-01T09:00:00Z",  // string, ISO datetime
  "pinnedMessages": [],                       // array of messageId strings
  "tabs": [
    { "tabId": "tab_chat_1", "displayName": "Chat", "type": "chat", "isDefault": true },
    { "tabId": "tab_files_c1", "displayName": "Files", "type": "files" }
  ]
}
```

### `messages[containerId][]` — Message Object

```jsonc
{
  "messageId": "msg_1",                       // string, unique ID
  "containerId": "ch_1",                      // string, channelId or chatId
  "containerType": "channel",                 // "channel"|"chat"
  "senderId": "user_2",                       // string, userId (or "system" for system events)
  "content": "Good morning team!",            // string; becomes "This message has been deleted." when deleted
  "contentType": "text",                      // string, always "text"
  "messageType": "message",                   // "message"|"systemEvent"
  "createdDateTime": "2025-03-12T09:00:00.000Z", // string, ISO datetime
  "lastEditedDateTime": null,                 // string|null, ISO datetime when last edited
  "deletedDateTime": null,                    // string|null, ISO datetime when deleted
  "importance": "normal",                     // "normal"|"high"
  "subject": "API Refactor Update",           // string, optional message subject/title
  "replyToId": null,                          // string|null, messageId of parent (for threaded replies)
  "reactions": [                              // array of reaction objects
    {
      "emoji": "👍",                          // string, emoji character
      "users": ["user_1", "user_9"]           // array of userId strings
    }
  ],
  "mentions": [                               // array of mention objects
    {
      "userId": "user_2",
      "displayName": "Alex Wilber",
      "mentionText": "@Alex Wilber"
    }
  ],
  "attachments": [                            // array of attachment objects
    {
      "attachmentId": "att_1",               // string
      "name": "Sprint_Backlog.xlsx",         // string, filename
      "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // string, MIME
      "contentUrl": "#",                     // string
      "thumbnailUrl": "",                    // string
      "size": 184320                         // number, bytes
    }
  ],
  "isBookmarked": false                       // boolean
}
```

**Thread replies**: A reply has `replyToId` set to the parent `messageId` and the same `containerId`. The `MessageList` component skips replies in the main view (only shows root messages); reply counts are computed from `messages[containerId]` by counting entries with matching `replyToId`.

### `meetings[]` — Meeting Object

```jsonc
{
  "meetingId": "meeting_1",                   // string, unique ID
  "subject": "Daily Standup",                 // string
  "startDateTime": "2025-03-13T09:00:00.000Z", // string, ISO datetime
  "endDateTime": "2025-03-13T09:30:00.000Z",  // string, ISO datetime
  "isAllDay": false,                          // boolean (optional)
  "location": "Xicrosoft Teams Meeting",       // string (optional)
  "organizer": "user_2",                      // string, userId
  "participants": [
    {
      "userId": "user_2",
      "role": "organizer",                    // "organizer"|"attendee"
      "rsvp": "accepted"                      // "accepted"|"tentative"|"pending"|"declined"
    }
  ],
  "isRecurring": true,                        // boolean (optional)
  "recurrencePattern": "daily",               // string|null
  "isOnline": true,                           // boolean (set by createMeeting action)
  "chatId": null,                             // string|null, linked chat
  "channelId": null,                          // string|null, linked channel (optional)
  "teamId": null,                             // string|null, linked team (optional)
  "bodyPreview": "Daily sync to discuss progress and blockers.", // string
  "joinUrl": "#",                             // string (auto-generated URL in createMeeting)
  "status": "scheduled"                       // string (optional)
}
```

### `calls[]` — Call Object

```jsonc
{
  "callId": "call_1",                         // string, unique ID
  "callType": "oneOnOne",                     // string
  "direction": "incoming",                    // "incoming"|"outgoing"
  "participants": ["user_1", "user_2"],       // array of userId strings
  "startDateTime": "2025-03-12T16:00:00.000Z", // string, ISO datetime
  "endDateTime": "2025-03-12T16:12:00.000Z",  // string|null, ISO datetime
  "duration": 720,                            // number|null, seconds
  "status": "completed",                      // "completed"|"missed"
  "isVideoCall": true                         // boolean
}
```

### `files[]` — File Object

```jsonc
{
  "fileId": "file_1",                         // string, unique ID
  "name": "Q3_Roadmap.pdf",                   // string
  "contentType": "application/pdf",            // string, MIME type
  "size": 245760,                             // number, bytes
  "containerId": "ch_1",                      // string, channelId or chatId
  "containerType": "channel",                 // "channel"|"chat"
  "sharedBy": "user_2",                       // string, userId
  "sharedDateTime": "2025-03-10T10:00:00.000Z", // string, ISO datetime
  "lastModifiedDateTime": "2025-03-10T10:00:00.000Z", // string, ISO datetime
  "lastModifiedBy": "user_2",                 // string, userId
  "thumbnailUrl": "",                         // string
  "downloadUrl": "#"                          // string; if not "#", opened via window.open
}
```

### `notifications[]` — Notification Object

```jsonc
{
  "notificationId": "notif_1",                // string, unique ID
  "type": "mention",                          // "mention"|"reply"|"reaction"|"meeting"|"system"|"assignment"
  "actorId": "user_2",                        // string, userId who triggered the notification
  "targetMessageId": "msg_8",                 // string|null, related message ID
  "containerId": "ch_1",                      // string|null, channel/chat ID for navigation
  "containerType": "channel",                 // "channel"|"chat"|null
  "containerName": "General",                 // string, human-readable container name
  "teamName": "Contoso Engineering",          // string|null, team name if containerType is "channel"
  "previewText": "Alex Wilber mentioned you: @Adele the data pipeline job failed...", // string
  "timestamp": "2025-03-13T08:30:00.000Z",   // string, ISO datetime
  "isRead": false,                            // boolean
  "isActionable": false                       // boolean (e.g. meeting join buttons — currently unused)
}
```

### `settings` — Settings Object

```jsonc
{
  "theme": "light",                           // "light"|"dark"
  "language": "en-US",                        // string, BCP-47 locale code
  "notifications": {
    "showMessagePreviews": true,              // boolean
    "playSound": true,                        // boolean
    "showBadgeCount": true,                   // boolean
    "muteAll": false,                         // boolean
    "quietHoursEnabled": false,               // boolean
    "quietHoursStart": "22:00",               // string, HH:MM
    "quietHoursEnd": "07:00"                  // string, HH:MM
  },
  "privacy": {
    "readReceipts": true,                     // boolean
    "showPresence": true                      // boolean
  },
  "display": {
    "density": "comfortable",                 // "comfortable"|"compact"
    "showChannelPreview": true                // boolean
  }
}
```

### `ui` — UI State Object

```jsonc
{
  "activeView": "chat",                       // "chat"|"teams"|"activity"|"calendar"|"calls"|"files"|"settings"
  "activeTeamId": null,                       // string|null
  "activeChannelId": null,                    // string|null
  "activeChatId": null,                       // string|null
  "activeThreadMessageId": null,              // string|null
  "isThreadPanelOpen": false,                 // boolean
  "isDetailsPanelOpen": false,                // boolean
  "searchQuery": "",                          // string
  "searchResults": null                       // object|null
}
```

---

## Default IDs

### Users (10 total, `currentUser` = `user_1`)

| ID | Name | Job Title | Department |
|----|------|-----------|------------|
| `user_1` | Adele Vance (currentUser) | Senior Marketing Manager | Marketing |
| `user_2` | Alex Wilber | Software Engineer | Engineering |
| `user_3` | Megan Bowen | HR Manager | Human Resources |
| `user_4` | Nestor Wilke | IT Admin | IT |
| `user_5` | Joni Sherman | Legal Counsel | Legal |
| `user_6` | Lee Gu | UX Designer | Design |
| `user_7` | Lynne Robbins | VP of Sales | Sales |
| `user_8` | Diego Siciliani | Finance Analyst | Finance |
| `user_9` | Pradeep Gupta | Data Scientist | Engineering |
| `user_10` | Henrietta Mueller | Project Manager | PMO |

### Teams (4 total)

| ID | Name | Visibility | Channels |
|----|------|------------|----------|
| `team_1` | Contoso Engineering | private | `ch_1` (General), `ch_2` (Backend), `ch_3` (Frontend), `ch_4` (DevOps), `ch_5` (Code Reviews) |
| `team_2` | Marketing | private | `ch_6` (General), `ch_7` (Campaigns), `ch_8` (Social Media), `ch_9` (Brand Guidelines, private) |
| `team_3` | Product Design | private | `ch_10` (General), `ch_11` (UI/UX Research), `ch_12` (Design Reviews) |
| `team_4` | All Company | public | `ch_13` (General), `ch_14` (Announcements) |

### Channels (14 total): `ch_1` through `ch_14`

### Chats (8 total)

| ID | Type | Participants / Topic |
|----|------|---------------------|
| `chat_1` | oneOnOne | user_1 ↔ user_2 (Alex Wilber) |
| `chat_2` | oneOnOne | user_1 ↔ user_3 (Megan Bowen) |
| `chat_3` | oneOnOne | user_1 ↔ user_7 (Lynne Robbins) |
| `chat_4` | oneOnOne | user_1 ↔ user_6 (Lee Gu) |
| `chat_5` | group | user_1, user_2, user_6, user_10 — "Project Kickoff" |
| `chat_6` | group | user_1, user_3, user_5, user_8 — "Lunch Plans" |
| `chat_7` | group | user_6, user_1, user_2 — "Design Sprint" |
| `chat_meeting_1` | meeting | user_1, user_2, user_10, user_9, user_6 — "Sprint Planning" |

### Meetings (8 total): `meeting_1` through `meeting_8`

### Calls (5 total): `call_1` through `call_5`

### Files (12 total): `file_1` through `file_12`

### Notifications (15 total): `notif_1` through `notif_15`

---

## All Context Actions

All actions are exposed via `useApp().actions` in the React app. They update state in localStorage and trigger re-renders.

| Action | Signature | State Change |
|--------|-----------|-------------|
| `sendMessage` | `(containerId, content, mentions?, attachments?)` | `messages[containerId]` grows by 1; updates `chats[i].lastMessagePreview / lastMessageSenderId / lastMessageTimestamp / isHidden=false` or `channels[i].lastMessagePreview / lastMessageTimestamp` |
| `sendReply` | `(containerId, replyToId, content)` | `messages[containerId]` grows by 1 with `replyToId` set to parent messageId |
| `editMessage` | `(containerId, messageId, newContent)` | `messages[containerId][i].content` updated; `lastEditedDateTime` set to current ISO timestamp |
| `deleteMessage` | `(containerId, messageId)` | `messages[containerId][i].deletedDateTime` set; `content` → `"This message has been deleted."` |
| `addReaction` | `(containerId, messageId, emoji)` | Finds or creates reaction entry in `messages[containerId][i].reactions`; adds `currentUser.userId` to `users` list if not present |
| `removeReaction` | `(containerId, messageId, emoji)` | Removes `currentUser.userId` from reaction's `users`; removes reaction object if `users` becomes empty |
| `createChannel` | `(teamId, displayName, description?, membershipType?)` | `channels` array grows by 1; `teams[i].channels` gains new channelId; `messages[newChannelId]` = `[]` |
| `createTeam` | `(displayName, description, visibility, members)` | `teams` grows by 1 (with auto-created General channel); `channels` grows by 1; `messages[generalChannelId]` = `[]`; new team's `avatarColor` = `"#6264A7"` |
| `createChat` | `(participants, topic?, _chatId?)` | `chats` gains new entry prepended at index 0; `messages[chatId]` = `[]`; chatType is `"oneOnOne"` if 1 participant, `"group"` if >1 |
| `pinMessage` | `(containerId, messageId)` | `chats[i].pinnedMessages` or `channels[i].pinnedMessages` gains messageId |
| `unpinMessage` | `(containerId, messageId)` | `chats[i].pinnedMessages` or `channels[i].pinnedMessages` loses messageId |
| `markAsRead` | `(containerId)` | `chats[i].unreadCount` → 0 or `channels[i].unreadCount` → 0 |
| `updatePresence` | `(presence)` | `currentUser.presence` updated |
| `updateStatus` | `(statusMessage, statusEmoji)` | `currentUser.statusMessage` and `currentUser.statusEmoji` updated |
| `updateSettings` | `(settingsUpdate)` | Deep-merges `settingsUpdate` into `settings`; object sub-keys are merged, scalar values are replaced |
| `markAllNotificationsRead` | `()` | All `notifications[i].isRead` → `true` |
| `markNotificationRead` | `(notificationId)` | `notifications[i].isRead` → `true` for the matching notification only |
| `createMeeting` | `(subject, startDateTime, endDateTime, participantIds, bodyPreview?)` | `meetings` grows by 1; organizer = `currentUser.userId`; all participantIds get `rsvp: "pending"`; `isOnline: true`; `joinUrl` auto-generated |
| `bookmarkMessage` | `(containerId, messageId)` | Toggles `messages[containerId][i].isBookmarked` |

---

## Observable State Changes (for RL evaluation)

| User Action | Observable State Change |
|-------------|------------------------|
| Send message in channel | `messages[channelId]` length +1; `channels[i].lastMessagePreview` and `lastMessageTimestamp` updated |
| Send message in chat | `messages[chatId]` length +1; `chats[i].lastMessagePreview`, `lastMessageSenderId`, `lastMessageTimestamp` updated; `chats[i].isHidden` → `false` |
| Reply in thread (channel) | `messages[channelId]` length +1; new message has `replyToId` set to parent `messageId` |
| Edit message | `messages[containerId][i].content` changed; `lastEditedDateTime` set |
| Delete message | `messages[containerId][i].deletedDateTime` set; `content` → `"This message has been deleted."` |
| Add emoji reaction | `messages[containerId][i].reactions` — matching emoji's `users` gains userId, or new reaction object added |
| Remove emoji reaction | `messages[containerId][i].reactions[j].users` loses userId; reaction removed if `users` empty |
| Create channel | `channels` length +1; parent `teams[i].channels` gains new channelId; `messages[newChannelId]` = `[]` |
| Create team | `teams` length +1; `channels` length +1; `messages[newGeneralChannelId]` = `[]` |
| Create chat | `chats` length +1 (prepended); `messages[newChatId]` = `[]` |
| Pin message | `channels[i].pinnedMessages` or `chats[i].pinnedMessages` gains messageId |
| Unpin message | `channels[i].pinnedMessages` or `chats[i].pinnedMessages` loses messageId |
| Mark container as read | `chats[i].unreadCount` → 0 or `channels[i].unreadCount` → 0 |
| Change presence status | `currentUser.presence` changed (e.g. `"available"` → `"busy"`) |
| Set status message | `currentUser.statusMessage` and/or `currentUser.statusEmoji` changed |
| Save profile (Settings > General) | `currentUser.displayName`, `currentUser.jobTitle`, `currentUser.statusMessage` updated |
| Change language (Settings > General) | `settings.language` updated |
| Toggle notification setting | `settings.notifications.<key>` toggled |
| Change quiet hours times | `settings.notifications.quietHoursStart` or `quietHoursEnd` updated |
| Toggle privacy setting | `settings.privacy.readReceipts` or `settings.privacy.showPresence` toggled |
| Change theme (Settings > Appearance) | `settings.theme` → `"light"` or `"dark"`; CSS class `theme-dark` added/removed from `document.body` |
| Change density (Settings > Appearance) | `settings.display.density` → `"comfortable"` or `"compact"` |
| Toggle sidebar preview (Settings > Appearance) | `settings.display.showChannelPreview` toggled |
| Mark single notification read | `notifications[i].isRead` → `true` for the clicked notification |
| Mark all notifications read | All `notifications[i].isRead` → `true` |
| Create meeting | `meetings` length +1 |
| Bookmark message | `messages[containerId][i].isBookmarked` toggled |

---

## UI Behaviors (not persisted to state)

| Feature | Component | Description |
|---------|-----------|-------------|
| @mention autocomplete | `MessageComposer` | Typing `@` in composer shows dropdown of matching users; selecting inserts `@DisplayName ` |
| Attachment preview modal | `MessageList` | Clicking an attachment card opens a modal with file metadata + Download / Close buttons |
| File preview modal | `FilesPage` | Double-clicking a file row or clicking the preview button opens a modal with Download / Copy link / Close buttons |
| User profile card | `UserProfileCard` | Hovering over a username shows a card with presence, contact info, and Chat / Video / Audio / Email action buttons |
| Presence change | `Header` | Clicking user avatar opens a menu to change `currentUser.presence` or navigate to `/settings` |
| Search dropdown | `Header` | Ctrl+E focuses the search bar; typing searches people, messages, and files across state |
| Keyboard navigation | `App` (MainLayout) | Ctrl+1–5 navigates between views; Ctrl+N navigates to `/chat` |
| Thread panel | `TeamsPage` / `ChatPage` | Clicking reply count opens a side panel showing threaded replies |
| Dark theme | `body.theme-dark` CSS class | Applied/removed by `Settings.jsx` `useEffect` and `handleThemeChange`; CSS overrides all `--var` tokens |

---

## Left Rail Navigation

The `LeftRail` component shows six primary nav items (Activity, Chat, Teams, Calendar, Calls, Files) with badges for unread counts, plus a **Settings** gear icon pinned at the bottom.

| Rail Item | Route | Badge Source |
|-----------|-------|--------------|
| Activity | `/activity` | `notifications.filter(n => !n.isRead).length` |
| Chat | `/chat` | `chats.reduce((sum, c) => sum + c.unreadCount, 0)` |
| Teams | `/teams` | none |
| Calendar | `/calendar` | none |
| Calls | `/calls` | none |
| Files | `/files` | none |
| Settings (bottom) | `/settings` | none |

The Header also has a settings gear button (top-right) and a user-avatar menu that includes a "Settings" option — both navigate to `/settings`.

---

## Storage Keys

- **Current state**: `teamsState` (no sid) or `teamsState_<sid>` (with sid)
- **Initial state**: `teamsInitialState` (no sid) or `teamsInitialState_<sid>` (with sid)
- **Server-side state files**: `.mock-states/<sid>.json` (current), `.mock-states/<sid>.initial.json` (initial)

---

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "userId": "user_1",
      "displayName": "Adele Vance",
      "firstName": "Adele",
      "lastName": "Vance",
      "email": "adele.vance@contoso.com",
      "avatar": "https://i.pravatar.cc/150?u=user_1",
      "jobTitle": "Senior Marketing Manager",
      "department": "Marketing",
      "location": "Seattle, WA",
      "phone": "+1 (206) 555-0110",
      "presence": "available",
      "statusMessage": "",
      "statusEmoji": "",
      "outOfOffice": false,
      "timezone": "America/Los_Angeles"
    },
    "users": [
      {
        "userId": "user_1", "displayName": "Adele Vance", "firstName": "Adele", "lastName": "Vance",
        "email": "adele.vance@contoso.com", "avatar": "https://i.pravatar.cc/150?u=user_1",
        "jobTitle": "Senior Marketing Manager", "department": "Marketing", "location": "Seattle, WA",
        "phone": "+1 (206) 555-0110", "presence": "available", "statusMessage": "", "statusEmoji": "",
        "outOfOffice": false, "timezone": "America/Los_Angeles"
      },
      {
        "userId": "user_2", "displayName": "Alex Wilber", "firstName": "Alex", "lastName": "Wilber",
        "email": "alex.wilber@contoso.com", "avatar": "https://i.pravatar.cc/150?u=user_2",
        "jobTitle": "Software Engineer", "department": "Engineering", "location": "Seattle, WA",
        "phone": "+1 (206) 555-0120", "presence": "available", "statusMessage": "", "statusEmoji": "",
        "outOfOffice": false, "timezone": "America/Los_Angeles"
      }
    ],
    "teams": [
      {
        "teamId": "team_1", "displayName": "Contoso Engineering",
        "description": "Engineering team collaboration space",
        "avatar": "", "avatarColor": "#4A90D9", "avatarInitials": "CE",
        "visibility": "private", "isArchived": false, "isFavorite": true,
        "createdDateTime": "2024-06-15T10:00:00Z",
        "members": ["user_1", "user_2"], "owners": ["user_2"], "channels": ["ch_1"],
        "settings": {
          "allowMemberCreateChannels": true, "allowMemberDeleteMessages": true,
          "allowGiphy": true, "allowStickers": true, "allowMemes": true
        }
      }
    ],
    "channels": [
      {
        "channelId": "ch_1", "teamId": "team_1", "displayName": "General",
        "description": "General discussions", "membershipType": "standard",
        "isFavoriteByDefault": true, "isPinned": false, "isMuted": false,
        "unreadCount": 0, "lastMessagePreview": "", "lastMessageTimestamp": "2025-03-13T10:00:00Z",
        "createdDateTime": "2024-06-15T10:00:00Z", "members": [],
        "tabs": [
          {"tabId": "tab_posts_1", "displayName": "Posts", "type": "posts", "isDefault": true},
          {"tabId": "tab_files_1", "displayName": "Files", "type": "files"}
        ],
        "pinnedMessages": []
      }
    ],
    "chats": [
      {
        "chatId": "chat_1", "chatType": "oneOnOne", "topic": "",
        "participants": ["user_1", "user_2"],
        "isPinned": false, "isMuted": false, "isHidden": false, "unreadCount": 0,
        "lastMessagePreview": "Hello!", "lastMessageSenderId": "user_2",
        "lastMessageTimestamp": "2025-03-13T10:00:00Z",
        "createdDateTime": "2025-01-01T09:00:00Z", "pinnedMessages": [],
        "tabs": [
          {"tabId": "tab_chat_1", "displayName": "Chat", "type": "chat", "isDefault": true},
          {"tabId": "tab_files_c1", "displayName": "Files", "type": "files"}
        ]
      }
    ],
    "messages": {
      "ch_1": [
        {
          "messageId": "msg_1", "containerId": "ch_1", "containerType": "channel",
          "senderId": "user_2", "content": "Welcome to the team!", "contentType": "text",
          "messageType": "message", "createdDateTime": "2025-03-13T10:00:00Z",
          "lastEditedDateTime": null, "deletedDateTime": null, "importance": "normal",
          "subject": "", "replyToId": null, "reactions": [], "mentions": [],
          "attachments": [], "isBookmarked": false
        }
      ],
      "chat_1": [
        {
          "messageId": "cm_1", "containerId": "chat_1", "containerType": "chat",
          "senderId": "user_2", "content": "Hello!", "contentType": "text",
          "messageType": "message", "createdDateTime": "2025-03-13T10:00:00Z",
          "lastEditedDateTime": null, "deletedDateTime": null, "importance": "normal",
          "subject": "", "replyToId": null, "reactions": [], "mentions": [],
          "attachments": [], "isBookmarked": false
        }
      ]
    },
    "meetings": [],
    "calls": [],
    "files": [],
    "notifications": [],
    "settings": {
      "theme": "light",
      "language": "en-US",
      "notifications": {
        "showMessagePreviews": true,
        "playSound": true,
        "showBadgeCount": true,
        "muteAll": false,
        "quietHoursEnabled": false,
        "quietHoursStart": "22:00",
        "quietHoursEnd": "07:00"
      },
      "privacy": {
        "readReceipts": true,
        "showPresence": true
      },
      "display": {
        "density": "comfortable",
        "showChannelPreview": true
      }
    },
    "ui": {
      "activeView": "chat",
      "activeTeamId": null,
      "activeChannelId": null,
      "activeChatId": null,
      "activeThreadMessageId": null,
      "isThreadPanelOpen": false,
      "isDetailsPanelOpen": false,
      "searchQuery": "",
      "searchResults": null
    }
  }
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | Navigate to `/activity` |
| `Ctrl+2` | Navigate to `/chat` |
| `Ctrl+3` | Navigate to `/teams` |
| `Ctrl+4` | Navigate to `/calendar` |
| `Ctrl+5` | Navigate to `/calls` |
| `Ctrl+N` | Navigate to `/chat` (new chat compose) |
| `Ctrl+E` | Focus the search bar in the header |
| `Enter` | Send message (in message composer) |
| `Shift+Enter` | Insert newline in message composer |
| `Escape` | Close @mention autocomplete dropdown |
