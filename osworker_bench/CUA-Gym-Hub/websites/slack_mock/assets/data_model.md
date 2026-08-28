# Xlack Mock — Data Model

> Last updated: 2026-02-28 by plan agent
> Source: `src/utils/dataManager.js`

This document defines every entity type in the Xlack mock's state. The dev agent should reference this when implementing features that read/write state.

---

## State Shape Overview

```javascript
{
  currentUser: User,
  workspace: Workspace,
  users: User[],
  channels: Channel[],
  messages: { [channelId | dmId]: Message[] },
  threads: { [threadId]: Thread },
  dms: DM[],
  bookmarkedMessages: string[],      // messageId[]
  callHistory: CallHistoryEntry[],
  settings: Settings,
  invitations: Invitation[],
  notifications: Notification[]
}
```

---

## §Users

```typescript
interface User {
  userId: string;           // "user_1", "user_2", etc.
  fullName: string;         // "John Smith"
  displayName: string;      // "John" (shown in messages/sidebar)
  email: string;            // "john.smith@company.com"
  avatar: string;           // URL to avatar image (picsum.photos)
  title: string;            // "Senior Developer" (job title)
  status: "online" | "away" | "busy" | "offline";
  statusMessage: string;    // "In a meeting until 3pm"
  statusEmoji: string;      // "📅" (emoji shown next to name) — NOT YET in dataManager, ADD
  timeZone: string;         // "America/New_York" (IANA timezone)
}
```

**Default users (8 total):**

| userId | displayName | title | status |
|--------|------------|-------|--------|
| user_1 | John (current user) | Senior Developer | online |
| user_2 | Sarah | Designer | online |
| user_3 | Mike | Product Manager | away |
| user_4 | Emily | Developer | online |
| user_5 | Alex | Marketing Manager | busy |
| user_6 | Lisa | HR Manager | online |
| user_7 | Tom | Sales Director | away |
| user_8 | Rachel | Support Specialist | online |

**Relationships:**
- `currentUser` = `users[0]` (user_1, John Smith)
- Referenced by `senderId` in Messages, `participants` in DMs, `users` in Reactions, `members` in Channels, `followers` in Threads

---

## §Workspace

```typescript
interface Workspace {
  workspaceId: string;      // "ws_1"
  workspaceName: string;    // "Acme Corp"
  icon: string;             // URL to workspace icon
}
```

---

## §Channels

```typescript
interface Channel {
  channelId: string;        // "general", "random", "engineering", etc.
  name: string;             // "general" (displayed as #general)
  description: string;      // "Company-wide announcements..."
  topic: string;            // Channel topic (short line shown in header) — NOT YET, ADD
  isPrivate: boolean;       // false = public (#), true = private (🔒)
  isStarred: boolean;       // appears in "Starred" sidebar section
  members: string[];        // userId[] of channel members
  createdBy: string;        // userId of creator
  createdAt: string;        // ISO 8601 timestamp
  pinnedMessages: string[]; // messageId[] of pinned messages
  unreadCount: number;      // number of unread messages — NOT YET, ADD
}
```

**Default channels (6 total):**

| channelId | name | isPrivate | isStarred | members |
|-----------|------|-----------|-----------|---------|
| general | general | false | true | all 8 users |
| random | random | false | false | all 8 users |
| engineering | engineering | false | true | user_1, user_4, user_2 |
| design | design | false | false | user_2, user_3, user_1 |
| marketing | marketing | false | false | user_5, user_3, user_7 |
| project-alpha | project-alpha | true | true | user_1, user_2, user_3, user_4 |

---

## §Messages

```typescript
interface Message {
  messageId: string;        // "msg_1", "msg_eng_1", etc.
  senderId: string;         // userId of sender
  content: string;          // Message text (may contain @mentions, markdown, URLs)
  timestamp: string;        // ISO 8601 timestamp
  threadId: string | null;  // null = top-level message; "thread_1" = reply in that thread
  reactions: Reaction[];    // Array of emoji reactions
  attachments: Attachment[];// Array of file/image attachments
  isEdited: boolean;        // true if message was edited after posting
  isPinned: boolean;        // true if pinned in channel — NOT YET in message, use channel.pinnedMessages
}
```

**Messages are keyed by channelId or dmId:**
```javascript
messages: {
  "general": Message[],
  "engineering": Message[],
  "dm_1": Message[],
  // ...
}
```

**Threading model:**
- A top-level message has `threadId: null`
- When someone replies in thread, a Thread object is created, and reply messages have `threadId: "thread_xxx"`
- Thread replies are stored in the SAME messages array (same channel/dm key), not separately
- Filter by `threadId === null` to get top-level messages; filter by `threadId === "thread_1"` to get thread replies

### §Reactions

```typescript
interface Reaction {
  emoji: string;            // "👍", "🎉", etc.
  users: string[];          // userId[] who reacted with this emoji
}
```

### §Attachments

```typescript
interface Attachment {
  type: "image" | "file";   // "image" renders inline preview; "file" shows download card
  url: string;              // Image URL or "#" for mock files
  name: string;             // "architecture-diagram.png"
  size: string;             // "245 KB"
}
```

---

## §Threads

```typescript
interface Thread {
  threadId: string;         // "thread_1"
  parentMessageId: string;  // messageId of the parent message
  channelId: string | null; // channelId if thread is in a channel
  dmId: string | null;      // dmId if thread is in a DM
  replies: string[];        // messageId[] of reply messages (ordered chronologically)
  followers: string[];      // userId[] who are following this thread
}
```

**Key behavior:**
- Thread is created when first reply is added to a message
- The parent message's `threadId` stays `null` — it's still a top-level message
- Only reply messages get `threadId` set to the thread's ID
- `followers` includes anyone who replied + anyone who explicitly followed

**Default threads (1):**
- `thread_1`: Parent = `msg_3` (in #general), 3 replies from user_1, user_2, user_4

---

## §DMs (Direct Messages)

```typescript
interface DM {
  dmId: string;             // "dm_1", "dm_2", etc.
  participants: string[];   // userId[] (always includes currentUser + other party)
  lastMessage: string;      // Preview text of most recent message
  lastTime: string;         // ISO 8601 of most recent message
  unreadCount: number;      // Number of unread messages
}
```

**Default DMs (3):**

| dmId | participants | lastMessage |
|------|-------------|-------------|
| dm_1 | user_1, user_2 (Sarah) | "Thanks for the design feedback!" |
| dm_2 | user_1, user_3 (Mike) | "Let's schedule that meeting" |
| dm_3 | user_1, user_4 (Emily) | "Code review looks good!" |

**Note:** DM messages are stored in `messages["dm_1"]`, `messages["dm_2"]`, etc. — same structure as channel messages.

---

## §Bookmarked Messages

```typescript
bookmarkedMessages: string[];  // Array of messageId strings
```

The user's saved/bookmarked messages. Corresponds to Xlack's "Later" / "Saved items" feature. Default: empty array.

---

## §Call History

```typescript
interface CallHistoryEntry {
  callId: string;           // "call_custom_1"
  type: "voice" | "video";
  participants: string[];   // userId[]
  dmId: string;             // DM where call was initiated
  startTime: string;        // ISO 8601
  duration: number;         // seconds
  status: "completed" | "missed" | "ongoing";
}
```

Default: empty array. Populated when calls are started/ended via UI.

---

## §Settings

```typescript
interface Settings {
  theme: "light" | "dark";
  notifications: "all" | "mentions" | "none";
  displayDensity: "comfortable" | "compact";
  showAvatars: boolean;
  use24Hour: boolean;
}
```

**Default values:**
```javascript
{
  theme: "light",
  notifications: "all",
  displayDensity: "comfortable",
  showAvatars: true,
  use24Hour: false
}
```

---

## §Invitations

```typescript
interface Invitation {
  invitationId: string;     // "inv_custom_1"
  email: string;            // "newuser@example.com"
  sentBy: string;           // userId who sent invite
  sentAt: string;           // ISO 8601
  status: "pending" | "accepted" | "declined";
}
```

Default: empty array.

---

## §Notifications

```typescript
interface Notification {
  notificationId: string;   // "notif_custom_1"
  type: "mention" | "reaction" | "thread_reply" | "channel_invite";
  messageId: string;        // Related message ID
  channelId: string | null; // Channel where notification originated
  dmId: string | null;      // DM where notification originated
  userId: string;           // User who triggered the notification
  timestamp: string;        // ISO 8601
  read: boolean;
}
```

Default: empty array. Populated by actions (someone mentions you, reacts, replies in thread, etc.).

---

## Fields to ADD (not yet in dataManager)

These fields should be added by the dev agent to support missing features:

1. **User.statusEmoji** (`string`, default `""`) — Emoji shown next to display name (e.g., "📅", "🏖️"). Add to `normalizeUser()` and `createInitialData()`.

2. **Channel.topic** (`string`, default `""`) — Short topic string shown in channel header. Distinct from `description` (which is longer). Add to `normalizeChannel()` and `createInitialData()`.

3. **Channel.unreadCount** (`number`, default `0`) — Unread message count displayed in sidebar badge. Add to `normalizeChannel()` and `createInitialData()`.

4. **Channel.bookmarks** (`Bookmark[]`, default `[]`) — Channel-level bookmarks shown in header bar. Add new entity:
   ```typescript
   interface ChannelBookmark {
     bookmarkId: string;
     title: string;
     url: string;
     emoji: string;    // Optional emoji icon
     addedBy: string;  // userId
     addedAt: string;  // ISO 8601
   }
   ```

5. **DM.isGroupDM** (`boolean`, default `false`) — Whether this is a multi-party DM.

6. **State.drafts** (`{ [channelId | dmId]: string }`, default `{}`) — Unsent draft text per conversation. Saved on navigation away, restored on return.

---

## createInitialData() Structure

The `createInitialData()` function in `dataManager.js` returns the full default state. Current structure:

```javascript
return {
  currentUser: users[0],           // John Smith
  workspace: { workspaceId, workspaceName, icon },
  users: [ ...8 users ],
  channels: [ ...6 channels ],
  messages: {
    'general': [ ...9 messages (6 top-level + 3 thread replies) ],
    'engineering': [ ...6 messages ],
    'random': [ ...6 messages ],
    'design': [ ...5 messages ],
    'marketing': [ ...5 messages ],
    'project-alpha': [ ...5 messages ],
    'dm_1': [ ...2 messages ],
    'dm_2': [ ...2 messages ],
    'dm_3': [ ...2 messages ]
  },
  threads: {
    'thread_1': { parentMessageId: 'msg_3', channelId: 'general', ... }
  },
  dms: [ ...3 DMs ],
  bookmarkedMessages: [],
  callHistory: [],
  settings: { theme: 'light', notifications: 'all', ... },
  invitations: [],
  notifications: []
};
```

**Total seed data:** 8 users, 6 channels, 40+ messages, 1 thread, 3 DMs.
