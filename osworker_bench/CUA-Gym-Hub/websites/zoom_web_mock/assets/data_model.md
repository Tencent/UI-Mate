# Xoom Web Mock — Data Model

> Used by `src/lib/initialData.js` and `src/context/StoreContext.jsx`
> Dev agent: implement `createInitialData()` returning the structure below.

---

## Entity Definitions

### 1. User

The currently logged-in user. Always exactly one.

```javascript
{
  userId: String,       // "u_admin"
  username: String,     // "Alex Johnson"
  email: String,        // "alex.johnson@acme.com"
  avatar: String,       // URL to avatar image
  pmi: String,          // Personal Meeting ID, formatted "123 456 7890"
  status: String,       // "available" | "busy" | "dnd" | "away"
  role: String,         // "Licensed" | "Basic"
}
```

**Example:**
```javascript
{
  userId: "u_admin",
  username: "Alex Johnson",
  email: "alex.johnson@acme.com",
  avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=0B5CFF&color=fff&size=128",
  pmi: "543 888 1234",
  status: "available",
  role: "Licensed"
}
```

---

### 2. Meeting

A scheduled or past meeting.

```javascript
{
  meetingId: String,        // "123 456 7890" (formatted with spaces) — unique
  title: String,            // "Weekly Team Sync"
  hostId: String,           // userId of host
  hostName: String,         // "Alex Johnson"
  startTime: String,        // ISO 8601 datetime
  duration: Number,         // minutes (15, 30, 45, 60, 90, 120)
  password: String,         // "" if no password, else e.g. "abc123"
  joinUrl: String,          // "https://zoom-mock.web/j/1234567890"
  participants: Array,      // array of contactIds or participant objects
  settings: {
    video: Boolean,         // host video on
    audio: Boolean,         // audio on
    waitingRoom: Boolean,   // waiting room enabled
    recording: String,      // "none" | "local" | "cloud"
  },
  recurring: Boolean,       // is recurring meeting
  recurrence: {             // only if recurring === true
    type: String,           // "daily" | "weekly" | "monthly"
    interval: Number,       // every N days/weeks/months
    endDate: String,        // ISO date or null for no end
  } | null,
  status: String,           // "scheduled" | "started" | "ended"
}
```

**Example values:**
```javascript
[
  {
    meetingId: "123 456 7890",
    title: "Weekly Team Sync",
    hostId: "u_admin",
    hostName: "Alex Johnson",
    startTime: /* tomorrow 10:00 AM */,
    duration: 60,
    password: "",
    joinUrl: "https://zoom-mock.web/j/1234567890",
    participants: ["c1", "c2", "c3"],
    settings: { video: true, audio: true, waitingRoom: false, recording: "none" },
    recurring: true,
    recurrence: { type: "weekly", interval: 1, endDate: null },
    status: "scheduled"
  },
  {
    meetingId: "987 654 3210",
    title: "Project Kickoff",
    hostId: "u_admin",
    hostName: "Alex Johnson",
    startTime: /* day after tomorrow 2:00 PM */,
    duration: 45,
    password: "proj2024",
    joinUrl: "https://zoom-mock.web/j/9876543210",
    participants: [],
    settings: { video: true, audio: true, waitingRoom: true, recording: "cloud" },
    recurring: false,
    recurrence: null,
    status: "scheduled"
  },
  {
    meetingId: "111 222 3333",
    title: "Client Review",
    hostId: "u_admin",
    hostName: "Alex Johnson",
    startTime: /* yesterday 3:00 PM */,
    duration: 30,
    password: "",
    joinUrl: "https://zoom-mock.web/j/1112223333",
    participants: ["c1", "c2"],
    settings: { video: true, audio: true, waitingRoom: false, recording: "cloud" },
    recurring: false,
    recurrence: null,
    status: "ended"
  },
  {
    meetingId: "444 555 6666",
    title: "Design Review",
    hostId: "u_admin",
    hostName: "Alex Johnson",
    startTime: /* 3 days from now 11:00 AM */,
    duration: 60,
    password: "",
    joinUrl: "https://zoom-mock.web/j/4445556666",
    participants: ["c4", "c5"],
    settings: { video: true, audio: true, waitingRoom: false, recording: "none" },
    recurring: false,
    recurrence: null,
    status: "scheduled"
  },
  {
    meetingId: "777 888 9999",
    title: "All Hands Meeting",
    hostId: "u_admin",
    hostName: "Alex Johnson",
    startTime: /* 3 days ago 9:00 AM */,
    duration: 90,
    password: "allhands",
    joinUrl: "https://zoom-mock.web/j/7778889999",
    participants: ["c1", "c2", "c3", "c4", "c5"],
    settings: { video: true, audio: true, waitingRoom: false, recording: "cloud" },
    recurring: true,
    recurrence: { type: "monthly", interval: 1, endDate: null },
    status: "ended"
  }
]
```

---

### 3. Contact

People in the user's contact directory.

```javascript
{
  contactId: String,      // "c1"
  name: String,           // "Sarah Connor"
  email: String,          // "sarah@skynet.com"
  avatar: String,         // URL
  status: String,         // "available" | "busy" | "dnd" | "away" | "offline"
  department: String,     // "Engineering" (optional)
  starred: Boolean,       // is favorited
}
```

**Example values (6–8 contacts):**
```javascript
[
  { contactId: "c1", name: "Sarah Connor", email: "sarah@acme.com", avatar: "...", status: "available", department: "Engineering", starred: true },
  { contactId: "c2", name: "John Wick", email: "john@acme.com", avatar: "...", status: "busy", department: "Security", starred: false },
  { contactId: "c3", name: "Tony Stark", email: "tony@acme.com", avatar: "...", status: "offline", department: "Engineering", starred: true },
  { contactId: "c4", name: "Diana Prince", email: "diana@acme.com", avatar: "...", status: "available", department: "Design", starred: false },
  { contactId: "c5", name: "Bruce Wayne", email: "bruce@acme.com", avatar: "...", status: "away", department: "Management", starred: false },
  { contactId: "c6", name: "Natasha Romanoff", email: "natasha@acme.com", avatar: "...", status: "dnd", department: "Operations", starred: false },
  { contactId: "c7", name: "Peter Parker", email: "peter@acme.com", avatar: "...", status: "available", department: "Engineering", starred: true },
  { contactId: "c8", name: "Wanda Maximoff", email: "wanda@acme.com", avatar: "...", status: "offline", department: "Design", starred: false },
]
```

Use `https://ui-avatars.com/api/?name=First+Last&background=RANDOM&color=fff&size=128` for avatars.

---

### 4. Recording

Cloud recordings of past meetings.

```javascript
{
  recordingId: String,    // "rec_001"
  meetingId: String,      // matching a meeting's meetingId
  title: String,          // "Client Review - Recording"
  url: String,            // "#" (placeholder)
  duration: String,       // "28:45" or "1:30:00"
  created: String,        // ISO datetime
  size: String,           // "145 MB"
  type: String,           // "video" | "audio" | "transcript"
}
```

**Example values:**
```javascript
[
  {
    recordingId: "rec_001",
    meetingId: "111 222 3333",
    title: "Client Review",
    url: "#",
    duration: "28:45",
    created: /* yesterday 3:30 PM */,
    size: "145 MB",
    type: "video"
  },
  {
    recordingId: "rec_002",
    meetingId: "777 888 9999",
    title: "All Hands Meeting",
    url: "#",
    duration: "1:24:30",
    created: /* 3 days ago 10:30 AM */,
    size: "512 MB",
    type: "video"
  },
  {
    recordingId: "rec_003",
    meetingId: "777 888 9999",
    title: "All Hands Meeting - Transcript",
    url: "#",
    duration: "1:24:30",
    created: /* 3 days ago 10:30 AM */,
    size: "24 KB",
    type: "transcript"
  }
]
```

---

### 5. ChatChannel

A Team Chat channel or direct message conversation.

```javascript
{
  channelId: String,       // "ch_general"
  name: String,            // "General" or null for DMs
  type: String,            // "channel" | "dm" | "group_dm"
  members: [String],       // array of contactIds + "u_admin"
  description: String,     // "Company-wide announcements" or ""
  starred: Boolean,        // is starred/favorited
  unreadCount: Number,     // number of unread messages
  lastMessage: {
    text: String,
    senderId: String,
    timestamp: String,     // ISO datetime
  } | null,
}
```

**Example values:**
```javascript
[
  {
    channelId: "ch_general",
    name: "General",
    type: "channel",
    members: ["u_admin", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"],
    description: "Company-wide announcements and discussions",
    starred: true,
    unreadCount: 3,
    lastMessage: { text: "Don't forget the all-hands tomorrow!", senderId: "c5", timestamp: /* 2 hours ago */ }
  },
  {
    channelId: "ch_engineering",
    name: "Engineering",
    type: "channel",
    members: ["u_admin", "c1", "c3", "c7"],
    description: "Engineering team discussions",
    starred: true,
    unreadCount: 0,
    lastMessage: { text: "PR #423 is ready for review", senderId: "c7", timestamp: /* 5 hours ago */ }
  },
  {
    channelId: "ch_design",
    name: "Design",
    type: "channel",
    members: ["u_admin", "c4", "c8"],
    description: "Design team updates and reviews",
    starred: false,
    unreadCount: 1,
    lastMessage: { text: "New mockups are uploaded!", senderId: "c4", timestamp: /* 1 day ago */ }
  },
  {
    channelId: "dm_sarah",
    name: null,
    type: "dm",
    members: ["u_admin", "c1"],
    description: "",
    starred: false,
    unreadCount: 2,
    lastMessage: { text: "Can you review the deploy script?", senderId: "c1", timestamp: /* 30 min ago */ }
  },
  {
    channelId: "dm_tony",
    name: null,
    type: "dm",
    members: ["u_admin", "c3"],
    description: "",
    starred: false,
    unreadCount: 0,
    lastMessage: { text: "Sounds good, let's sync tomorrow", senderId: "u_admin", timestamp: /* yesterday */ }
  },
  {
    channelId: "gdm_team_leads",
    name: "Team Leads",
    type: "group_dm",
    members: ["u_admin", "c1", "c4", "c5"],
    description: "",
    starred: false,
    unreadCount: 0,
    lastMessage: { text: "Sprint planning at 3pm", senderId: "c5", timestamp: /* 3 hours ago */ }
  }
]
```

---

### 6. ChatMessage

Individual messages within channels/DMs.

```javascript
{
  messageId: String,       // "msg_001"
  channelId: String,       // references ChatChannel.channelId
  senderId: String,        // userId or contactId
  senderName: String,      // "Sarah Connor"
  senderAvatar: String,    // URL
  text: String,            // message body (supports basic markdown)
  timestamp: String,       // ISO datetime
  reactions: [             // emoji reactions
    {
      emoji: String,       // "👍"
      users: [String],     // ["u_admin", "c2"]
    }
  ],
  replyTo: String | null,  // messageId of parent (for threading)
  replyCount: Number,      // number of thread replies (0 if not a thread root)
  edited: Boolean,         // has been edited
  pinned: Boolean,         // is pinned in channel
}
```

**Example values (for "General" channel):**
```javascript
[
  {
    messageId: "msg_001",
    channelId: "ch_general",
    senderId: "c5",
    senderName: "Bruce Wayne",
    senderAvatar: "...",
    text: "Good morning everyone! 🌅",
    timestamp: /* today 9:00 AM */,
    reactions: [{ emoji: "👋", users: ["u_admin", "c1", "c3"] }],
    replyTo: null,
    replyCount: 2,
    edited: false,
    pinned: false
  },
  {
    messageId: "msg_002",
    channelId: "ch_general",
    senderId: "c1",
    senderName: "Sarah Connor",
    senderAvatar: "...",
    text: "Morning! Quick reminder — code freeze starts at 5pm today.",
    timestamp: /* today 9:15 AM */,
    reactions: [{ emoji: "👍", users: ["u_admin", "c7"] }],
    replyTo: null,
    replyCount: 0,
    edited: false,
    pinned: true
  },
  // ... more messages
]
```

Provide **10–15 messages** for `ch_general`, **5–8** for `ch_engineering`, **3–5** for DMs.

---

### 7. Settings

User preferences.

```javascript
{
  general: {
    theme: String,             // "light" | "dark" | "system"
    language: String,          // "en"
  },
  audio: {
    input: String,             // "Default Microphone (Built-in)"
    output: String,            // "Default Speakers (Built-in)"
    autoJoinAudio: Boolean,    // true
    muteOnEntry: Boolean,      // false
  },
  video: {
    input: String,             // "FaceTime Camera"
    hd: Boolean,               // true
    mirrorVideo: Boolean,      // true
    touchUpAppearance: Boolean, // false
  },
  notifications: {
    email: Boolean,            // true
    push: Boolean,             // true
    chatNotifications: Boolean, // true
    meetingReminders: Boolean,  // true
  },
  chat: {
    showPreviews: Boolean,     // true
    playSound: Boolean,        // true
    muteNotifications: Boolean, // false
    bounceIcon: Boolean,       // true
  }
}
```

---

## Relationships

```
User (1) ─── hosts ──→ Meeting (many)
User (1) ─── has ──→ Contact (many)
Meeting (1) ─── has ──→ Recording (many)
Meeting (many) ←── participants ──→ Contact (many)
ChatChannel (1) ─── contains ──→ ChatMessage (many)
ChatChannel (many) ←── members ──→ Contact + User (many)
ChatMessage (1) ─── replies ──→ ChatMessage (many)  [threading]
```

---

## createInitialData() Structure

```javascript
export function createInitialData() {
  return {
    user: { /* User object */ },
    meetings: [ /* 5 Meeting objects */ ],
    contacts: [ /* 8 Contact objects */ ],
    recordings: [ /* 3 Recording objects */ ],
    channels: [ /* 6 ChatChannel objects */ ],
    messages: { /* keyed by channelId → array of ChatMessage objects */ },
    settings: { /* Settings object */ },
  };
}
```

The `messages` field is keyed by `channelId` for efficient lookup:
```javascript
messages: {
  "ch_general": [ /* 12 messages */ ],
  "ch_engineering": [ /* 6 messages */ ],
  "ch_design": [ /* 4 messages */ ],
  "dm_sarah": [ /* 5 messages */ ],
  "dm_tony": [ /* 4 messages */ ],
  "gdm_team_leads": [ /* 3 messages */ ],
}
```
