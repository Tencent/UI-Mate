# Xiscord Mock — Data Model

> This document defines the data structures for `dataManager.js` / `initialState.js`.
> The dev agent should use this as the canonical reference for `createInitialData()`.

---

## Entity Definitions

### 1. User

```javascript
{
  id: 'user-1',                    // String, unique ID
  username: 'TechAdmin',           // String, display name (no spaces in Xiscord)
  discriminator: '0001',           // String, 4-digit tag (legacy, still used for display)
  avatar: 'https://picsum.photos/seed/user1/128/128', // String, avatar URL
  status: 'online',               // 'online' | 'idle' | 'dnd' | 'offline'
  customStatus: '🎮 Playing Valorant', // String | null, custom status text with optional emoji
  aboutMe: 'Server admin and community manager. Love gaming and coding!', // String, profile bio
  roles: ['role-admin'],           // String[], role IDs this user has in current server context
  badges: ['server_owner'],        // String[], profile badges: 'nitro', 'boost', 'server_owner', 'early_supporter'
  bannerColor: '#5865F2',          // String, profile banner color (hex)
  joinedAt: '2023-01-15T10:00:00Z', // ISO 8601 timestamp
  isBot: false                     // Boolean
}
```

### 2. Server (Guild)

```javascript
{
  id: 'server-1',                  // String, unique ID
  name: 'Gaming Community',       // String, server display name
  icon: 'https://picsum.photos/seed/server1/64/64', // String, server icon URL
  ownerId: 'user-1',              // String, user ID of server owner
  channels: ['ch-1', 'ch-2'],     // String[], ordered channel IDs
  roles: ['role-admin', 'role-mod'], // String[], role IDs
  members: ['user-1', 'user-2'],  // String[], member user IDs
  categories: [                    // Category[], channel category groupings
    { id: 'cat-1', name: 'TEXT CHANNELS', channelIds: ['ch-1', 'ch-2', 'ch-3'] },
    { id: 'cat-2', name: 'VOICE CHANNELS', channelIds: ['ch-v1'] }
  ],
  description: 'A community for gamers and tech enthusiasts', // String
  boostCount: 3,                   // Number, server boost count
  boostTier: 1                     // Number, 0-3
}
```

### 3. Channel

```javascript
{
  id: 'ch-1',                      // String, unique ID
  serverId: 'server-1',           // String, parent server ID
  name: 'general',                // String, channel name (lowercase, hyphens)
  type: 'text',                   // 'text' | 'voice' | 'announcement'
  category: 'TEXT CHANNELS',      // String, category name
  topic: 'General discussion and community chat', // String | null, channel topic
  position: 0,                    // Number, sort order within category
  isNsfw: false,                  // Boolean
  slowMode: 0,                    // Number, seconds between messages (0 = off)
  pinnedMessageIds: ['msg-3'],    // String[], pinned message IDs
  lastMessageId: 'msg-5',         // String | null, most recent message ID
  unreadCount: 0,                 // Number, unread message count for current user
  permissions: {}                 // Object, permission overrides (visual only)
}
```

### 4. Message

```javascript
{
  id: 'msg-1',                    // String, unique ID
  channelId: 'ch-1',             // String, channel this message belongs to
  userId: 'user-2',              // String, author user ID
  content: 'Hey everyone! Check out this new feature.', // String, message text (supports markdown)
  timestamp: '2024-01-15T14:30:00Z', // ISO 8601 timestamp
  editedTimestamp: null,           // ISO 8601 | null, when message was last edited
  reactions: {                     // Object, emoji → user IDs who reacted
    '👍': ['user-1', 'user-3'],
    '🎉': ['user-2']
  },
  attachments: [],                 // Attachment[], file attachments
  embeds: [],                      // Embed[], auto-generated link embeds
  mentions: ['user-1'],           // String[], mentioned user IDs
  mentionEveryone: false,          // Boolean, @everyone mention
  pinned: false,                   // Boolean
  type: 'default',                // 'default' | 'reply' | 'thread_starter' | 'system'
  referencedMessageId: null,       // String | null, replied-to message ID
  threadId: null,                  // String | null, thread spawned from this message
  isEdited: false                  // Boolean, whether message has been edited
}
```

### 5. Attachment (embedded in Message)

```javascript
{
  id: 'att-1',                    // String, unique ID
  filename: 'screenshot.png',     // String
  url: 'https://picsum.photos/seed/att1/800/600', // String, file URL
  contentType: 'image/png',       // String, MIME type
  size: 245000,                    // Number, file size in bytes
  width: 800,                     // Number | null, image width
  height: 600                     // Number | null, image height
}
```

### 6. Embed (embedded in Message)

```javascript
{
  type: 'rich',                   // 'rich' | 'image' | 'video' | 'link'
  title: 'Article Title',        // String | null
  description: 'Article description text...', // String | null
  url: 'https://example.com',    // String | null
  color: '#5865F2',               // String | null, left border color
  thumbnail: {                     // Object | null
    url: 'https://picsum.photos/seed/thumb1/120/120',
    width: 120,
    height: 120
  },
  image: null,                    // { url, width, height } | null
  author: null,                   // { name, url, iconUrl } | null
  footer: null                    // { text, iconUrl } | null
}
```

### 7. Thread

```javascript
{
  id: 'thread-1',                 // String, unique ID
  channelId: 'ch-1',             // String, parent channel ID
  messageId: 'msg-1',            // String, message that started the thread
  name: 'Discussion about new feature', // String, thread name
  ownerId: 'user-2',             // String, thread creator user ID
  messages: [                      // Message[], thread messages (same structure as Message)
    {
      id: 'tmsg-1',
      channelId: 'thread-1',
      userId: 'user-1',
      content: 'This looks great! How does it work?',
      timestamp: '2024-01-15T14:35:00Z',
      reactions: {},
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    }
  ],
  messageCount: 1,                // Number, total thread messages
  memberCount: 2,                 // Number, thread participants
  archived: false,                // Boolean
  locked: false,                  // Boolean
  createdAt: '2024-01-15T14:32:00Z' // ISO 8601
}
```

### 8. Role

```javascript
{
  id: 'role-admin',               // String, unique ID
  serverId: 'server-1',          // String, parent server ID
  name: 'Admin',                  // String, role display name
  color: '#e74c3c',               // String, hex color for username
  position: 2,                    // Number, hierarchy position (higher = more power)
  permissions: ['ADMINISTRATOR'], // String[], permission flags (visual only)
  hoist: true,                    // Boolean, show separately in member list
  mentionable: true               // Boolean, can be @mentioned
}
```

### 9. DM Conversation

```javascript
{
  id: 'dm-1',                     // String, unique ID (often 'dm-{recipientId}')
  recipientId: 'user-2',          // String, the other user in the DM
  messages: [                      // Message[], same structure as channel messages
    {
      id: 'dm-msg-1',
      channelId: 'dm-1',
      userId: 'user-2',
      content: 'Hey! Want to play some games later?',
      timestamp: '2024-01-15T16:00:00Z',
      reactions: {},
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    }
  ],
  lastMessageTimestamp: '2024-01-15T16:00:00Z', // ISO 8601
  unreadCount: 1                   // Number
}
```

---

## Relationships

```
Server (Guild)
├── has many → Channels (organized by Categories)
├── has many → Roles
├── has many → Members (Users)
│
Channel
├── belongs to → Server
├── has many → Messages
├── has many → Pinned Messages (subset of Messages)
│
Message
├── belongs to → Channel (or DM)
├── belongs to → User (author)
├── has many → Reactions (emoji → user IDs)
├── may have → Thread (spawned thread)
├── may have → Attachments
├── may have → Embeds
├── may reference → Message (reply)
│
Thread
├── belongs to → Channel
├── spawned from → Message
├── has many → Messages (thread replies)
│
User
├── has many → Roles (per server)
├── has many → DM Conversations
│
DM Conversation
├── between → 2 Users
├── has many → Messages
```

---

## App State Shape

```javascript
{
  // Current logged-in user
  currentUser: User,

  // All servers the user is in (keyed by server ID)
  servers: {
    'server-1': Server,
    'server-2': Server
  },

  // All channels across all servers (keyed by channel ID)
  channels: {
    'ch-1': Channel,
    'ch-2': Channel,
    'ch-v1': Channel
  },

  // All messages keyed by message ID
  messages: {
    'msg-1': Message,
    'msg-2': Message
  },

  // All threads keyed by thread ID
  threads: {
    'thread-1': Thread
  },

  // All users (including current user) keyed by user ID
  users: {
    'user-1': User,
    'user-2': User,
    'user-3': User
  },

  // All roles across all servers keyed by role ID
  roles: {
    'role-admin': Role,
    'role-mod': Role
  },

  // DM conversations keyed by DM ID
  dmConversations: {
    'dm-1': DMConversation,
    'dm-2': DMConversation
  },

  // Active DM user IDs (shown in DM list sidebar)
  dms: ['user-2', 'user-3'],

  // Currently active voice channel (null if not connected)
  activeVoiceChannel: null,

  // UI state
  ui: {
    memberSidebarVisible: true,
    threadPanelOpen: false,
    activeThreadId: null,
    searchQuery: '',
    searchResults: [],
    pinnedPanelOpen: false
  }
}
```

---

## Suggested `createInitialData()` Seed Data

### Servers (2)
1. **"Gaming Community"** (server-1): 7 channels, 6 members, 3 roles — rich server with lots of content
2. **"Dev Hub"** (server-2): 5 channels, 4 members, 2 roles — smaller tech-focused server

### Users (6)
1. **currentUser** (user-current): "Alex_Dev" #9201, online, "Full-stack dev & gamer", Admin in server-1
2. **user-2**: "Sarah_Mod" #4521, online, "Community moderator", Moderator role
3. **user-3**: "GameMaster42" #7734, idle, "🎮 Playing Elden Ring", Member
4. **user-4**: "CodeNinja" #1337, dnd, "In a meeting", Member in both servers
5. **user-5**: "PixelArtist" #8899, offline, "Creating pixel art", Member
6. **user-6**: "BotHelper" #0000, online, isBot: true, "Moderation Bot"

### Channels for Server-1 "Gaming Community"
**TEXT CHANNELS:**
- `#general` (ch-1) — Main chat, 8+ messages, active discussions
- `#announcements` (ch-2) — Important news, pinned messages, type: announcement
- `#off-topic` (ch-3) — Random chat
- `#help` (ch-4) — Support questions, has a thread

**FUN:**
- `#memes` (ch-5) — Image embeds, lots of reactions
- `#clips` (ch-6) — Video embeds

**VOICE CHANNELS:**
- `General Voice` (ch-v1) — type: voice

### Channels for Server-2 "Dev Hub"
**TEXT CHANNELS:**
- `#general` (ch-s2-1) — General dev chat
- `#code-review` (ch-s2-2) — Code discussion with code blocks
- `#resources` (ch-s2-3) — Pinned links and resources

**VOICE CHANNELS:**
- `Pair Programming` (ch-s2-v1) — type: voice

### Messages (~20 total across channels)
Mix of:
- Regular text messages with varying timestamps
- Messages with markdown (bold, italic, code blocks, headers)
- Messages with reactions (multiple emoji types)
- Messages with link embeds (YouTube, GitHub)
- Messages with image attachments
- A pinned message
- A message with a thread (2-3 thread replies)
- A reply message (referencing another message)
- An @mention message
- A bot message
- Messages spanning multiple days (for date dividers)

### DM Conversations (2)
1. DM with Sarah_Mod — 4 messages, casual chat about server moderation
2. DM with CodeNinja — 3 messages, discussing a coding project

### Roles
**Server-1:**
- Admin (red #e74c3c, position 3, hoist)
- Moderator (blue #3498db, position 2, hoist)
- Member (gray #95a5a6, position 1, not hoisted)

**Server-2:**
- Lead Dev (green #2ecc71, position 2, hoist)
- Developer (teal #1abc9c, position 1, hoist)

### Threads (1-2)
- Thread on a help message in #help: "How to set up bot permissions" — 3 replies
- Thread on a code review message in #code-review: "Review: API refactor" — 2 replies
