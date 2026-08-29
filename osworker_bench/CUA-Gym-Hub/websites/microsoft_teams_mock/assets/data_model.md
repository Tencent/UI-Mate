# Xicrosoft Teams Mock — Data Model

> Last updated: 2025-03-11
> Used by: `src/utils/dataManager.js` → `createInitialData()`

---

## Entity Relationship Overview

```
Organization (implicit)
  └── Team (1:N)
        ├── Channel (1:N)
        │     ├── Message (1:N)
        │     │     ├── Reply/Thread (1:N)
        │     │     └── Reaction (1:N)
        │     ├── Tab (1:N)
        │     └── PinnedMessage (1:N)
        └── Member (N:M with User)

User (standalone)
  ├── Chat (N:M)
  │     ├── Message (1:N)
  │     └── PinnedMessage (1:N)
  ├── Call (1:N)
  └── Notification (1:N)

Meeting (standalone, linked to Calendar)
  ├── Participant (N:M with User)
  └── Chat (1:1)
```

---

## §Users

```javascript
{
  userId: "user_1",                          // String, unique ID
  displayName: "Adele Vance",               // String, full display name
  firstName: "Adele",                        // String
  lastName: "Vance",                         // String
  email: "adele.vance@contoso.com",         // String, email address
  avatar: "https://i.pravatar.cc/150?u=user_1", // String, avatar URL
  jobTitle: "Senior Marketing Manager",     // String
  department: "Marketing",                   // String
  location: "Seattle, WA",                   // String, office location
  phone: "+1 (206) 555-0110",              // String, phone number
  presence: "available",                     // Enum: "available" | "away" | "busy" | "dnd" | "brb" | "offline" | "inAMeeting"
  statusMessage: "",                         // String, custom status text
  statusEmoji: "",                           // String, custom status emoji
  outOfOffice: false,                        // Boolean
  timezone: "America/Los_Angeles"            // String, IANA timezone
}
```

**Presence indicator colors:**
- `available` → Green circle (#92C353)
- `away` → Yellow clock (#FCD116)
- `busy` → Red filled (#C4314B)
- `dnd` → Red with dash (#C4314B)
- `brb` → Yellow clock (#FCD116)
- `offline` → Gray empty circle (#B4B4B4)
- `inAMeeting` → Red filled (#C4314B)

**Seed data**: 10 users with realistic Microsoft demo names (Adele Vance, Alex Wilber, Megan Bowen, etc.)

---

## §Teams

```javascript
{
  teamId: "team_1",                          // String, unique ID
  displayName: "Engineering",                // String, team name
  description: "Engineering team collaboration space", // String
  avatar: "",                                // String, team avatar URL or empty for generated icon
  avatarColor: "#6264A7",                    // String, hex color for auto-generated team icon
  avatarInitials: "EN",                      // String, 2-letter initials for icon
  visibility: "public",                      // Enum: "public" | "private"
  isArchived: false,                         // Boolean
  isFavorite: true,                          // Boolean, pinned to top
  createdDateTime: "2024-06-15T10:00:00Z",  // ISO timestamp
  members: ["user_1", "user_2", "user_3"],  // String[], user IDs
  owners: ["user_1"],                        // String[], user IDs with owner role
  channels: ["ch_1", "ch_2", "ch_3"],       // String[], channel IDs
  settings: {
    allowMemberCreateChannels: true,         // Boolean
    allowMemberDeleteMessages: true,         // Boolean
    allowGiphy: true,                        // Boolean
    allowStickers: true,                     // Boolean
    allowMemes: true                         // Boolean
  }
}
```

**Seed data**: 4 teams:
1. "Contoso Engineering" (8 members, 5 channels)
2. "Marketing" (6 members, 4 channels)
3. "Product Design" (5 members, 3 channels)
4. "All Company" (10 members, 2 channels)

---

## §Channels

```javascript
{
  channelId: "ch_1",                         // String, unique ID
  teamId: "team_1",                          // String, parent team ID
  displayName: "General",                    // String, channel name (max 50 chars)
  description: "General discussion for the team", // String, optional
  membershipType: "standard",                // Enum: "standard" | "private" | "shared"
  isFavoriteByDefault: true,                 // Boolean, auto-show in sidebar
  isPinned: false,                           // Boolean, user-pinned
  isMuted: false,                            // Boolean, user-muted notifications
  unreadCount: 0,                            // Number, unread messages
  lastMessagePreview: "Alex: Sounds good!",  // String, preview of last message
  lastMessageTimestamp: "2025-03-11T14:30:00Z", // ISO timestamp
  createdDateTime: "2024-06-15T10:00:00Z",  // ISO timestamp
  members: [],                               // String[], only for private/shared channels (standard inherits team)
  tabs: [                                    // Tab[], pinned tabs
    {
      tabId: "tab_posts",
      displayName: "Posts",
      type: "posts",                         // Built-in type
      isDefault: true
    },
    {
      tabId: "tab_files",
      displayName: "Files",
      type: "files"                          // Built-in type
    }
  ],
  pinnedMessages: []                         // String[], pinned message IDs
}
```

**Standard tabs per channel:**
- Posts (always first, default)
- Files (always second)
- Additional custom tabs (Wiki, Planner, etc.)

**Seed data**: ~14 channels across 4 teams, each with General + topic channels

---

## §Chats

```javascript
{
  chatId: "chat_1",                          // String, unique ID
  chatType: "oneOnOne",                      // Enum: "oneOnOne" | "group" | "meeting"
  topic: "",                                 // String, only for group chats (display name)
  participants: ["user_1", "user_2"],        // String[], user IDs
  isPinned: false,                           // Boolean, user-pinned
  isMuted: false,                            // Boolean
  isHidden: false,                           // Boolean, user-hidden
  unreadCount: 0,                            // Number
  lastMessagePreview: "Thanks for the update!", // String
  lastMessageSenderId: "user_2",             // String
  lastMessageTimestamp: "2025-03-11T15:00:00Z", // ISO timestamp
  createdDateTime: "2024-12-01T09:00:00Z",  // ISO timestamp
  pinnedMessages: [],                        // String[], pinned message IDs
  tabs: [                                    // Tab[], similar to channel tabs
    {
      tabId: "tab_chat",
      displayName: "Chat",
      type: "chat",
      isDefault: true
    },
    {
      tabId: "tab_files",
      displayName: "Files",
      type: "files"
    }
  ]
}
```

**Seed data**: 8 chats:
- 4 × oneOnOne chats with different users
- 3 × group chats (3-5 participants each)
- 1 × meeting chat

---

## §Messages

```javascript
{
  messageId: "msg_1",                        // String, unique ID
  containerId: "ch_1",                       // String, channel ID or chat ID this message belongs to
  containerType: "channel",                  // Enum: "channel" | "chat"
  senderId: "user_1",                        // String, sender user ID
  content: "Hey team, let's discuss the Q3 roadmap.", // String, message text (supports markdown-like formatting)
  contentType: "text",                       // Enum: "text" | "html"
  messageType: "message",                    // Enum: "message" | "systemEvent"
  createdDateTime: "2025-03-11T10:00:00Z",  // ISO timestamp
  lastEditedDateTime: null,                  // ISO timestamp or null
  deletedDateTime: null,                     // ISO timestamp or null
  importance: "normal",                      // Enum: "normal" | "high" | "urgent"
  subject: "",                               // String, optional subject line (channels only)
  replyToId: null,                           // String or null, parent message ID for thread replies
  reactions: [                               // Array of reaction objects
    {
      emoji: "👍",
      users: ["user_2", "user_3"]            // String[], user IDs who reacted
    },
    {
      emoji: "❤️",
      users: ["user_4"]
    }
  ],
  mentions: [                                // Array of mention objects
    {
      userId: "user_2",                      // String, mentioned user ID
      displayName: "Alex Wilber",            // String
      mentionText: "@Alex Wilber"            // String, as it appears in content
    }
  ],
  attachments: [                             // Array of attachment objects
    {
      attachmentId: "att_1",
      name: "Q3_Roadmap.pdf",               // String, file name
      contentType: "application/pdf",        // String, MIME type
      contentUrl: "",                        // String, download URL
      thumbnailUrl: "",                      // String, preview thumbnail
      size: 245760                           // Number, bytes
    }
  ],
  isBookmarked: false                        // Boolean, user bookmarked
}
```

**System event messages** (messageType: "systemEvent"):
- User joined/left team/channel
- Channel renamed
- Meeting started/ended
- Tab added/removed

**Seed data**: ~150 messages total:
- 20-30 per active channel
- 10-20 per active chat
- Mix of plain text, formatted text, messages with reactions, threaded replies, mentions, attachments

---

## §Threads

Threads are represented as messages with `replyToId` pointing to the parent message. A parent message's thread metadata is tracked:

```javascript
// Threads are derived from messages where replyToId != null
// Thread metadata stored alongside messages or as computed property:
{
  parentMessageId: "msg_3",                  // String, the root message
  containerId: "ch_1",                       // String, channel or chat ID
  containerType: "channel",                  // Enum
  replyCount: 5,                             // Number, computed from messages with matching replyToId
  lastReplyDateTime: "2025-03-11T14:00:00Z", // ISO timestamp
  lastReplySenderId: "user_3",               // String
  participants: ["user_1", "user_2", "user_3"] // String[], users who replied
}
```

**Note**: Threads don't need a separate data structure — they're derived from the messages array by filtering on `replyToId`. The dev should compute thread metadata on the fly.

---

## §Meetings / Calendar Events

```javascript
{
  meetingId: "meeting_1",                    // String, unique ID
  subject: "Sprint Planning",               // String, meeting title
  startDateTime: "2025-03-11T14:00:00Z",    // ISO timestamp
  endDateTime: "2025-03-11T15:00:00Z",      // ISO timestamp
  isAllDay: false,                           // Boolean
  location: "Xicrosoft Teams Meeting",       // String
  organizer: "user_1",                       // String, user ID
  participants: [                            // Array of participant objects
    {
      userId: "user_1",
      role: "organizer",                     // Enum: "organizer" | "presenter" | "attendee"
      rsvp: "accepted"                       // Enum: "accepted" | "declined" | "tentative" | "none"
    },
    {
      userId: "user_2",
      role: "attendee",
      rsvp: "accepted"
    }
  ],
  isRecurring: false,                        // Boolean
  recurrencePattern: null,                   // String or null
  chatId: "chat_meeting_1",                  // String, associated meeting chat
  channelId: null,                           // String or null, if channel meeting
  teamId: null,                              // String or null
  bodyPreview: "Let's review the sprint backlog and plan for the next iteration.", // String
  joinUrl: "#",                              // String (mock, non-functional)
  status: "scheduled"                        // Enum: "scheduled" | "inProgress" | "ended" | "cancelled"
}
```

**Seed data**: 8 calendar events across 2 days:
- 2 recurring daily standups
- 1 sprint planning
- 1 design review
- 1 all-hands (large meeting)
- 1 1:1 meeting
- 2 external meetings

---

## §Calls

```javascript
{
  callId: "call_1",                          // String, unique ID
  callType: "oneOnOne",                      // Enum: "oneOnOne" | "group"
  direction: "incoming",                     // Enum: "incoming" | "outgoing"
  participants: ["user_1", "user_2"],        // String[], user IDs
  startDateTime: "2025-03-10T16:00:00Z",    // ISO timestamp
  endDateTime: "2025-03-10T16:15:00Z",      // ISO timestamp or null
  duration: 900,                             // Number, seconds (or null if missed)
  status: "completed",                       // Enum: "completed" | "missed" | "declined"
  isVideoCall: false                         // Boolean
}
```

**Seed data**: 5 call history entries (mix of completed, missed, incoming/outgoing)

---

## §Files

```javascript
{
  fileId: "file_1",                          // String, unique ID
  name: "Q3_Roadmap.pdf",                   // String, file name
  contentType: "application/pdf",            // String, MIME type
  size: 245760,                              // Number, bytes
  containerId: "ch_1",                       // String, channel/chat where shared
  containerType: "channel",                  // Enum: "channel" | "chat"
  sharedBy: "user_1",                        // String, user ID
  sharedDateTime: "2025-03-10T10:00:00Z",   // ISO timestamp
  lastModifiedDateTime: "2025-03-10T10:00:00Z", // ISO timestamp
  lastModifiedBy: "user_1",                  // String
  thumbnailUrl: "",                          // String, preview image
  downloadUrl: "#"                           // String (mock)
}
```

**Seed data**: 12 files across channels and chats (PDFs, images, spreadsheets, presentations)

---

## §Notifications (Activity Feed)

```javascript
{
  notificationId: "notif_1",                 // String, unique ID
  type: "mention",                           // Enum: "mention" | "reply" | "reaction" | "meeting" | "system" | "assignment"
  actorId: "user_2",                         // String, who triggered it
  targetMessageId: "msg_5",                  // String or null, the message referenced
  containerId: "ch_1",                       // String, channel/chat ID
  containerType: "channel",                  // Enum: "channel" | "chat"
  containerName: "General",                  // String, display name for context
  teamName: "Engineering",                   // String or null
  previewText: "Alex Wilber mentioned you: Hey @Adele, can you review this?", // String
  timestamp: "2025-03-11T10:30:00Z",        // ISO timestamp
  isRead: false,                             // Boolean
  isActionable: false                        // Boolean, has action buttons
}
```

**Seed data**: 15 notifications (mix of unread mentions, replies, reactions, meeting reminders)

---

## §App Settings

```javascript
{
  theme: "light",                            // Enum: "light" | "dark" | "highContrast"
  language: "en-US",                         // String
  notifications: {
    showMessagePreviews: true,               // Boolean
    playSound: true,                         // Boolean
    showBadgeCount: true,                    // Boolean
    muteAll: false,                          // Boolean
    quietHoursEnabled: false,                // Boolean
    quietHoursStart: "22:00",               // String
    quietHoursEnd: "07:00"                  // String
  },
  privacy: {
    readReceipts: true,                      // Boolean
    showPresence: true                       // Boolean
  },
  display: {
    density: "comfortable",                  // Enum: "comfortable" | "compact"
    showChannelPreview: true                 // Boolean
  }
}
```

---

## createInitialData() Structure

The `dataManager.js` `createInitialData()` function should return:

```javascript
{
  currentUser: { /* §Users — default logged-in user (Adele Vance) */ },
  users: [ /* §Users — 10 user objects */ ],
  teams: [ /* §Teams — 4 team objects */ ],
  channels: [ /* §Channels — ~14 channel objects */ ],
  chats: [ /* §Chats — 8 chat objects */ ],
  messages: {
    // Keyed by containerId (channelId or chatId)
    "ch_1": [ /* §Messages — array of messages */ ],
    "ch_2": [ /* ... */ ],
    "chat_1": [ /* ... */ ],
    // ...
  },
  meetings: [ /* §Meetings — 8 meeting objects */ ],
  calls: [ /* §Calls — 5 call objects */ ],
  files: [ /* §Files — 12 file objects */ ],
  notifications: [ /* §Notifications — 15 notification objects */ ],
  settings: { /* §App Settings */ },

  // UI state (not persisted in initial state, but tracked)
  ui: {
    activeView: "chat",                      // Current left rail selection
    activeTeamId: null,                      // Currently selected team
    activeChannelId: null,                   // Currently selected channel
    activeChatId: null,                      // Currently selected chat
    activeThreadMessageId: null,             // Currently open thread
    isThreadPanelOpen: false,                // Thread panel visibility
    isDetailsPanelOpen: false,               // Details panel visibility
    searchQuery: "",                         // Current search text
    searchResults: null                      // Search results
  }
}
```

---

## Key Relationships & Lookups

| Lookup | How |
|--------|-----|
| Get channels for a team | Filter `channels` where `teamId === team.teamId` |
| Get messages for a channel/chat | Access `messages[containerId]` |
| Get thread replies | Filter messages where `replyToId === parentMessage.messageId` |
| Get user by ID | Find in `users` array by `userId` |
| Get chat participants' info | Map `chat.participants` through user lookup |
| Get team members' info | Map `team.members` through user lookup |
| Get unread count for channel | `channel.unreadCount` field |
| Get files for a channel/chat | Filter `files` where `containerId` matches |
| Get meetings for a date | Filter `meetings` by `startDateTime` date portion |
| Get notifications | Filter `notifications` array, sort by timestamp desc |
