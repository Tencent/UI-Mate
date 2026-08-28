# discord_mock — Schema Reference

**Deploy URL**: `https://cua-gym-xiscord.xlang.ai`
**Go Endpoint**: `GET /go?sid=<sid>` → `{ initial_state, current_state, state_diff }`
**Inject**: `POST /post?sid=<sid>` with body `{ "action": "set", "state": { ... } }`
**Update current only**: `POST /post?sid=<sid>` with body `{ "action": "set_current", "state": { ... } }`
**Reset**: `POST /post?sid=<sid>` with body `{ "action": "reset" }`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{ files: [{ url, original_name, stored_name, size, content_type }] }`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Redirect | Redirects to `/channels/@me` (preserves `?sid=` query param) |
| `/channels/@me` | DMLayout + FriendsDashboard | Friends dashboard (Online/All/Pending/Blocked/Add Friend tabs) |
| `/channels/@me/:channelId` | DMLayout + DMChatArea | DM chat with a specific user (`:channelId` = user ID) |
| `/channels/:serverId` | ChannelList + placeholder | Server selected, no channel; shows "Select a channel" |
| `/channels/:serverId/:channelId` | ServerLayout | Full channel view: ChannelList + ChatArea + MemberSidebar |
| `/go` | Go (server-side intercepted) | State inspection JSON endpoint |

Query parameter `?sid=<session_id>` is supported on all routes and scopes state to that session.

---

## API Endpoints

All endpoints accept and return JSON unless noted.

### `GET /go?sid=<sid>`

Returns the state inspection object. The Vite middleware intercepts this before React rendering.

```json
{
  "initial_state": { ... },
  "current_state": { ... },
  "state_diff": {
    "<key>": { "added": <value> },
    "<key>": { "modified": <value> }
  }
}
```

`state_diff` contains only top-level keys that differ from `initial_state`.

### `GET /state?sid=<sid>`

Returns raw stored state.

```json
{ "stored_state": { ... } | null, "has_custom_state": true|false, "sid": "..." }
```

### `POST /post?sid=<sid>`

Body: `{ "action": "set" | "set_current" | "reset", "state": { ... }, "merge": true|false }`

- `set`: Replaces both current and initial state. First call for a session also writes `.initial.json`.
- `set_current`: Replaces only current state; never touches initial state (used by golden patch evaluation).
- `reset`: Deletes all state files for this session; app reverts to `INITIAL_STATE`.
- `merge: true`: Deep-merges `state` into existing stored state instead of replacing.

### `POST /upload?sid=<sid>`

Multipart/form-data file upload. Returns:
```json
{ "success": true, "files": [{ "original_name": "...", "stored_name": "...", "size": 1234, "content_type": "image/png", "url": "/files/<sid>/<stored_name>" }] }
```

### `GET /files/<sid>/<filename>`

Serves an uploaded file with appropriate Content-Type.

---

## Complete State Schema

### Top-Level Shape

```
{
  currentUser:       <User object>
  servers:           { [serverId]: <Server> }
  channels:          { [channelId]: <Channel> }
  messages:          { [messageId]: <Message> }
  threads:           { [threadId]: <Thread> }
  users:             { [userId]: <User> }
  roles:             { [roleId]: <Role> }
  dmConversations:   { [dmId]: <DMConversation> }
  activeVoiceChannel: string | null
  dms:               string[]          (array of user IDs with active DM conversations)
  blockedUsers:      string[]          (array of blocked user IDs)
  pendingFriends:    <PendingFriend>[] (array of pending friend request objects)
  userSettings:      <UserSettings object>
  ui:                <UI object>
}
```

---

### User Object

```
{
  id:              string     e.g. "user-current", "user-2"
  username:        string
  discriminator:   string     4-digit tag e.g. "9201"
  avatar:          string     URL
  status:          "online" | "idle" | "dnd" | "offline"
  customStatus:    string | null
  aboutMe:         string
  roles:           string[]   role IDs
  badges:          string[]   e.g. ["server_owner", "nitro", "early_supporter"]
  bannerColor:     string     CSS hex color
  joinedAt:        string     ISO 8601 timestamp
  isBot:           boolean
  isMuted:         boolean    (runtime field set by toggleMute; not in initial JSON)
  isDeafened:      boolean    (runtime field set by toggleDeafen; not in initial JSON)
}
```

`currentUser` is the logged-in user. The same shape appears in `users`.

#### Default Users

| ID | username | status | isBot |
|----|----------|--------|-------|
| `user-current` | Alex_Dev | online | false |
| `user-2` | Sarah_Mod | online | false |
| `user-3` | GameMaster42 | idle | false |
| `user-4` | CodeNinja | dnd | false |
| `user-5` | PixelArtist | offline | false |
| `user-6` | BotHelper | online | true |

---

### Server Object

```
{
  id:          string
  name:        string
  icon:        string     URL
  ownerId:     string     user ID
  channels:    string[]   channel IDs
  roles:       string[]   role IDs
  members:     string[]   user IDs
  categories:  { id: string, name: string, channelIds: string[] }[]
  description: string
  boostCount:  number
  boostTier:   number     0 | 1 | 2 | 3
  inviteCode:  string     (optional; set on server creation or join)
}
```

#### Default Servers

| ID | name | members | channels |
|----|------|---------|----------|
| `server-1` | Gaming Community | 6 users | 6 text/announce + 1 voice (3 categories) |
| `server-2` | Dev Hub | 4 users | 3 text + 1 voice (2 categories) |

---

### Channel Object

```
{
  id:                  string
  serverId:            string
  name:                string     lowercase, hyphens (e.g. "general")
  type:                "text" | "announcement" | "voice"
  category:            string     e.g. "TEXT CHANNELS"
  topic:               string | null
  position:            number     0-indexed within category
  isNsfw:              boolean
  slowMode:            number     seconds; 0 = off
  pinnedMessageIds:    string[]
  lastMessageId:       string | null
  unreadCount:         number
  permissions:         object
  notificationSetting: "default" | "all" | "mentions" | "nothing"
  muted:               boolean    true when notificationSetting === "nothing"
}
```

#### Default Channels (server-1: Gaming Community)

| ID | name | type | category |
|----|------|------|----------|
| `ch-1` | general | text | TEXT CHANNELS |
| `ch-2` | announcements | announcement | TEXT CHANNELS |
| `ch-3` | off-topic | text | TEXT CHANNELS |
| `ch-4` | help | text | TEXT CHANNELS |
| `ch-5` | memes | text | FUN |
| `ch-6` | clips | text | FUN |
| `ch-v1` | General Voice | voice | VOICE CHANNELS |

#### Default Channels (server-2: Dev Hub)

| ID | name | type | category |
|----|------|------|----------|
| `ch-s2-1` | general | text | TEXT CHANNELS |
| `ch-s2-2` | code-review | text | TEXT CHANNELS |
| `ch-s2-3` | resources | text | TEXT CHANNELS |
| `ch-s2-v1` | Pair Programming | voice | VOICE CHANNELS |

---

### Message Object

```
{
  id:                  string
  channelId:           string    channel ID (or thread ID for thread messages)
  userId:              string    author user ID
  content:             string
  timestamp:           string    ISO 8601
  editedTimestamp:     string | null
  reactions:           { [emoji]: string[] }   emoji → array of user IDs who reacted
  attachments:         <Attachment>[]
  embeds:              <Embed>[]
  mentions:            string[]  user IDs mentioned
  mentionEveryone:     boolean
  pinned:              boolean
  type:                "default" | "reply" | "thread_starter"
  referencedMessageId: string | null   set when type === "reply"
  threadId:            string | null   set when type === "thread_starter"
  isEdited:            boolean
}
```

#### Attachment Object

```
{
  id:          string
  filename:    string
  url:         string    e.g. "/files/_default/pixel_castle.png"
  contentType: string    MIME type
  size:        number    bytes
  width:       number    pixels (images only)
  height:      number    pixels (images only)
}
```

#### Embed Object

```
{
  type:        "rich" | "video"
  title:       string
  description: string
  url:         string
  color:       string    CSS hex
  thumbnail:   { url, width, height } | null
  image:       { url, width, height } | null
  author:      { name, url, iconUrl } | null
  footer:      { text, iconUrl } | null
}
```

#### Pre-loaded Messages

- **ch-1** (general): `msg-1` through `msg-8` (8 messages spanning 3 days; `msg-3` pinned; `msg-8` is a reply to `msg-7`)
- **ch-2** (announcements): `msg-ann-1` (pinned, mentions everyone), `msg-ann-2`
- **ch-3** (off-topic): `msg-ot-1`, `msg-ot-2`, `msg-ot-3` (unreadCount: 2)
- **ch-4** (help): `msg-help-1` (thread_starter → `thread-1`), `msg-help-2`, `msg-help-3`
- **ch-5** (memes): `msg-meme-1`, `msg-meme-2` (both have image attachments)
- **ch-s2-1**: `msg-s2-1`, `msg-s2-2`, `msg-s2-3`
- **ch-s2-2**: `msg-cr-1` (pinned), `msg-cr-2` (thread_starter → `thread-2`), `msg-cr-3`
- **ch-s2-3**: `msg-res-1` (video embed)

---

### Thread Object

```
{
  id:           string
  channelId:    string    parent channel ID
  messageId:    string    ID of the thread_starter message
  name:         string
  ownerId:      string    user ID
  messages:     <Message>[]   inline message objects (no separate map entry)
  messageCount: number
  memberCount:  number
  archived:     boolean
  locked:       boolean
  createdAt:    string    ISO 8601
}
```

#### Default Threads

| ID | name | channel | messageCount |
|----|------|---------|-------------|
| `thread-1` | How to set up bot permissions | `ch-4` | 3 |
| `thread-2` | Review: API refactor to tRPC | `ch-s2-2` | 2 |

---

### Role Object

```
{
  id:          string
  serverId:    string
  name:        string
  color:       string    CSS hex
  position:    number    higher = higher rank
  permissions: string[]  e.g. ["ADMINISTRATOR"], ["KICK_MEMBERS", "MANAGE_MESSAGES"]
  hoist:       boolean   show separately in member list
  mentionable: boolean
}
```

#### Default Roles

| ID | name | server | color |
|----|------|--------|-------|
| `role-admin` | Admin | server-1 | #e74c3c |
| `role-mod` | Moderator | server-1 | #3498db |
| `role-member` | Member | server-1 | #95a5a6 |
| `role-lead-dev` | Lead Dev | server-2 | #2ecc71 |
| `role-developer` | Developer | server-2 | #1abc9c |

---

### DMConversation Object

```
{
  id:                   string    e.g. "dm-1"
  recipientId:          string    user ID of the other person
  messages:             <Message>[]   inline message objects
  lastMessageTimestamp: string    ISO 8601
  unreadCount:          number
}
```

#### Default DM Conversations

| ID | recipientId | messages |
|----|-------------|---------|
| `dm-1` | `user-2` (Sarah_Mod) | 4 messages (spam/moderation discussion) |
| `dm-2` | `user-4` (CodeNinja) | 3 messages (pair programming plans; unreadCount: 1) |

`dms` array (the sidebar list): `["user-2", "user-4"]`

---

### PendingFriend Object

```
{
  id:        string    generated ID
  username:  string    the username the request was sent to/from
  type:      "outgoing" | "incoming"
  timestamp: string    ISO 8601
}
```

---

### UserSettings Object

All keys live at `state.userSettings`.

```
{
  theme:                   "dark" | "light"
  messageDisplay:          "cozy" | "compact"
  fontSize:                number    pixels (default: 16)
  desktopNotifications:    boolean
  unreadBadge:             boolean
  notificationSound:       boolean
  showEmbeds:              boolean
  showReactions:           boolean
  renderAttachments:       boolean
  animatedEmoji:           boolean
  reducedMotion:           boolean
  highContrast:            boolean
  alwaysShowLinkPreviews:  boolean
  echoCancellation:        boolean
  noiseSuppression:        boolean
  automaticGainControl:    boolean
  inputVolume:             number    0-200 (default: 100)
  outputVolume:            number    0-200 (default: 100)
  language:                string    e.g. "en-US"
  email:                   string | null
  phone:                   string | null
  serverNotif_<serverId>:  "all" | "mentions" | "nothing"   (per-server notification setting; dynamic key)
}
```

---

### UI Object

```
{
  memberSidebarVisible:    boolean   (default: true)
  threadPanelOpen:         boolean
  activeThreadId:          string | null
  searchQuery:             string
  searchResults:           any[]
  pinnedPanelOpen:         boolean
  channelCreationServerId: string | null   (set when channel creation modal is open)
  serverCreationModalOpen: boolean         (true when server creation modal is open)
}
```

---

## All Store Actions

### Core Lifecycle

| Action | Signature | Effect |
|--------|-----------|--------|
| `_hydrate` | `() => Promise<void>` | Called on App mount. Loads state from localStorage or fetches custom state from `/state` API. Sets `_loading: false`. |
| `resetStore` | `() => void` | Resets entire store to `INITIAL_STATE`. |

### Messages

| Action | Signature | Effect |
|--------|-----------|--------|
| `sendMessage` | `(channelId, content, options?) → messageId` | Creates new message in `messages`. `options`: `{ attachments?, mentions?, referencedMessageId? }`. Sets `type: "reply"` if `referencedMessageId` present. Does NOT update `channels[id].lastMessageId` in store (channel reads from messages map). Returns new message ID. |
| `editMessage` | `(messageId, newContent) → void` | Updates `messages[id].content`, sets `isEdited: true`, `editedTimestamp`. |
| `deleteMessage` | `(messageId) → void` | Removes `messages[id]` entirely. |
| `addReaction` | `(messageId, emoji) → void` | Toggles emoji reaction: if current user already reacted, removes them; otherwise adds. Deletes emoji key when reaction count reaches 0. |
| `togglePinMessage` | `(messageId) → void` | Toggles `messages[id].pinned`. Adds/removes `messageId` from `channels[channelId].pinnedMessageIds`. |

### Threads

| Action | Signature | Effect |
|--------|-----------|--------|
| `createThread` | `(messageId, name) → threadId` | Creates `threads[id]` with `channelId`, `messageId`, `name`, `ownerId`. Updates `messages[messageId].threadId` and `.type = "thread_starter"`. Returns new thread ID. |
| `sendThreadMessage` | `(threadId, content) → void` | Appends message to `threads[id].messages[]`, increments `messageCount`. |

### Direct Messages

| Action | Signature | Effect |
|--------|-----------|--------|
| `sendDMMessage` | `(dmId, content) → void` | Appends message to `dmConversations[dmId].messages[]`, updates `lastMessageTimestamp`. After 3 seconds, triggers an auto-reply from the recipient (if not a bot). |
| `removeDM` | `(userId) → void` | Removes `userId` from `dms` array (closes DM in sidebar). Does not delete `dmConversations`. |

### Servers

| Action | Signature | Effect |
|--------|-----------|--------|
| `createServer` | `(name) → serverId` | Creates `servers[id]` with a default `general` text channel, one "TEXT CHANNELS" category, and the current user as owner and member. Creates `channels[generalChannelId]`. Returns server ID. |
| `renameServer` | `(serverId, name) → void` | Updates `servers[serverId].name`. |
| `deleteServer` | `(serverId) → void` | Deletes `servers[serverId]`. Also deletes all associated `channels` and all `messages` whose `channelId` was in that server. |

### Channels

| Action | Signature | Effect |
|--------|-----------|--------|
| `createChannel` | `(serverId, name, type?, category?) → void` | Creates `channels[id]`. Name is auto-lowercased with spaces → hyphens. Updates `servers[serverId].channels[]` and the relevant `categories[].channelIds[]`. Creates new category entry if `category` doesn't exist. Default type: `"text"`, default category: `"TEXT CHANNELS"`. |
| `updateChannelTopic` | `(channelId, topic) → void` | Sets `channels[channelId].topic`. |
| `markChannelAsRead` | `(channelId) → void` | Sets `channels[channelId].unreadCount = 0`. |
| `setChannelNotification` | `(channelId, setting) → void` | Sets `channels[channelId].notificationSetting` and `muted = (setting === "nothing")`. |
| `reorderChannel` | `(serverId, categoryName, fromIndex, toIndex) → void` | Reorders channel within its category by splicing `categories[].channelIds`. Updates `channels[id].position` to reflect new index. |

### Voice

| Action | Signature | Effect |
|--------|-----------|--------|
| `joinVoice` | `(channelId) → void` | Sets `activeVoiceChannel = channelId`. |
| `leaveVoice` | `() → void` | Sets `activeVoiceChannel = null`. |

### User Profile & Status

| Action | Signature | Effect |
|--------|-----------|--------|
| `updateUserStatus` | `(status) → void` | Sets `currentUser.status` and `users["user-current"].status`. Status: `"online" \| "idle" \| "dnd" \| "offline"`. |
| `updateCustomStatus` | `(customStatus) → void` | Sets `currentUser.customStatus` and `users["user-current"].customStatus`. |
| `updateUserProfile` | `(fields) → void` | Merges `fields` into `currentUser` and `users["user-current"]`. Fields can include `username`, `aboutMe`, `bannerColor`, `avatar`, etc. |
| `toggleMute` | `() → void` | Toggles `currentUser.isMuted`. |
| `toggleDeafen` | `() → void` | Toggles `currentUser.isDeafened`. When turning deafen ON, also sets `isMuted = true`. When turning deafen OFF, `isMuted` remains as-is. |

### Friends & Blocking

| Action | Signature | Effect |
|--------|-----------|--------|
| `addFriendRequest` | `(username) → void` | Appends `{ id, username, type: "outgoing", timestamp }` to `pendingFriends`. |
| `removeFriend` | `(userId) → void` | Removes `userId` from `dms` array. |
| `blockUser` | `(userId) → void` | Adds `userId` to `blockedUsers[]`. Also removes from `dms[]`. |
| `unblockUser` | `(userId) → void` | Removes `userId` from `blockedUsers[]`. |

### User Settings

| Action | Signature | Effect |
|--------|-----------|--------|
| `updateUserSettings` | `(settings) → void` | Shallow-merges `settings` into `userSettings`. Accepts any subset of the UserSettings fields, including dynamic keys like `serverNotif_<serverId>`. |

### UI / Modal State

| Action | Signature | Effect |
|--------|-----------|--------|
| `setThreadPanel` | `(open, threadId?) → void` | Sets `ui.threadPanelOpen` and `ui.activeThreadId`. |
| `setPinnedPanel` | `(open) → void` | Sets `ui.pinnedPanelOpen`. |
| `toggleMemberSidebar` | `() → void` | Toggles `ui.memberSidebarVisible`. |
| `showChannelCreationModal` | `(serverId) → void` | Sets `ui.channelCreationServerId = serverId`. |
| `hideChannelCreationModal` | `() → void` | Sets `ui.channelCreationServerId = null`. |
| `showServerCreationModal` | `() → void` | Sets `ui.serverCreationModalOpen = true`. |
| `hideServerCreationModal` | `() → void` | Sets `ui.serverCreationModalOpen = false`. |

---

## Observable State Changes (for RL evaluation)

| User Action | State Fields Changed |
|-------------|---------------------|
| Send message in channel | `messages` gains new entry with unique ID |
| Send reply (reply to message) | `messages` gains new entry with `type: "reply"`, `referencedMessageId` set |
| Edit message | `messages[id].content`, `messages[id].isEdited = true`, `messages[id].editedTimestamp` |
| Delete message | `messages[id]` removed from map |
| Add/remove reaction | `messages[id].reactions[emoji]` array updated (added or removed user ID; key deleted at 0 count) |
| Pin/unpin message | `messages[id].pinned`, `channels[id].pinnedMessageIds[]` |
| Create thread | `threads` gains new entry; `messages[id].threadId`, `messages[id].type = "thread_starter"` |
| Send thread message | `threads[id].messages[]`, `threads[id].messageCount` incremented |
| Send DM | `dmConversations[id].messages[]`, `dmConversations[id].lastMessageTimestamp` |
| DM auto-reply | Same DM conversation gets a second message 3 seconds later (recipient's reply) |
| Upload file attachment | `messages` or `dmConversations[id].messages[]` gains entry with `attachments` array populated |
| Update user status | `currentUser.status`, `users["user-current"].status` |
| Update custom status | `currentUser.customStatus`, `users["user-current"].customStatus` |
| Update user profile fields | `currentUser.<field>`, `users["user-current"].<field>` |
| Toggle mute | `currentUser.isMuted` toggled |
| Toggle deafen | `currentUser.isDeafened` toggled; `isMuted` also set true when deafening |
| Toggle member sidebar | `ui.memberSidebarVisible` toggled |
| Open/close thread panel | `ui.threadPanelOpen`, `ui.activeThreadId` |
| Toggle pinned panel | `ui.pinnedPanelOpen` |
| Join voice channel | `activeVoiceChannel` set to channel ID |
| Leave voice channel | `activeVoiceChannel = null` |
| Create server | `servers` gains new entry; `channels` gains default "general" channel |
| Rename server | `servers[id].name` |
| Delete server | `servers[id]` removed; all associated `channels` removed; all their `messages` removed |
| Create channel | `channels` gains new entry; `servers[id].channels[]` and `servers[id].categories[].channelIds[]` updated |
| Reorder channel (drag-drop) | `servers[id].categories[].channelIds[]` reordered; `channels[id].position` updated |
| Update channel topic | `channels[id].topic` |
| Mark channel as read | `channels[id].unreadCount = 0` |
| Set channel notification | `channels[id].notificationSetting`, `channels[id].muted` |
| Set server notification | `userSettings.serverNotif_<serverId>` |
| Remove DM | `dms[]` loses the user ID |
| Block user | `blockedUsers[]` gains user ID; `dms[]` loses that user ID |
| Unblock user | `blockedUsers[]` loses user ID |
| Send friend request | `pendingFriends[]` gains new `{ id, username, type: "outgoing", timestamp }` |
| Cancel pending request | `pendingFriends[]` loses that entry |
| Remove friend | `dms[]` loses the user ID |
| Update user settings | `userSettings.<field>` for any setting toggled/changed |
| Create role (Server Settings) | `roles` gains new entry; `servers[id].roles[]` updated |
| Delete role (Server Settings) | `roles[id]` removed; `servers[id].roles[]` updated |
| Update server description | `servers[id].description` |

---

## Modals and UI Interactions

The following interactive modals are available:

| Modal / Panel | Trigger | State Persisted |
|---------------|---------|-----------------|
| UserSettings | Settings gear icon in user controls area (bottom of channel list or DM list) | `userSettings.*` via `updateUserSettings` |
| ServerSettings | Server header dropdown → "Server Settings" | `servers[id].name`, `servers[id].description`, `roles.*` |
| Channel Creation Modal | Server header dropdown → "Create Channel" or "+" next to category | `channels`, `servers[id].channels`, `servers[id].categories` |
| Server Creation Modal | "+" button in server list | `servers`, `channels` |
| Thread Creation Modal | Message context menu → "Create Thread" | `threads`, `messages[id].threadId` |
| Quick Switcher | Ctrl+K / Cmd+K | No state change; navigates to selected item |
| Keyboard Shortcuts | Ctrl+/ | No state change; informational only |
| Invite People Modal | Server header dropdown → "Invite People" | No state change; shows invite link |
| Server Notification Settings | Server header dropdown → "Notification Settings" | `userSettings.serverNotif_<serverId>` |
| Channel Notification Settings | Right-click channel → "Notification Settings" | `channels[id].notificationSetting`, `channels[id].muted` |
| Status Picker | Click avatar in user controls (DM list) | `currentUser.status`, `users["user-current"].status` |
| Status Menu (rich) | Click avatar in server user controls | Same as Status Picker; also offers "Set Custom Status" |
| Custom Status Modal | Status menu → "Set Custom Status" | `currentUser.customStatus` |
| New DM Modal | "+" button next to "Direct Messages" header | `dms[]` gains new user ID |
| Delete Server Confirmation | Server Settings sidebar → "Delete Server" | `servers`, `channels`, `messages` (cascade delete) |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+K / Cmd+K | Open/close Quick Switcher |
| Ctrl+/ / Cmd+/ | Open Keyboard Shortcuts reference |
| Ctrl+Shift+M / Cmd+Shift+M | Toggle mute |
| Escape | Close open modal, or mark current channel as read |
| Arrow Up (when input is empty) | Edit last own message in current channel (fires custom event `xiscord-edit-last-message`) |

---

## State Persistence Architecture

1. State is auto-saved to `localStorage` on every change (key: `discord_mock_state[_<sid>]`).
2. On first load with a `?sid=` param, state is fetched from Vite server-side `/state?sid=` endpoint.
3. On page refresh with `?sid=`, state is loaded from localStorage (no re-fetch).
4. `initial_state` is saved separately under `discord_mock_initialState[_<sid>]` and is never overwritten by subsequent user interactions.
5. `state_diff` at `/go` compares the current localStorage state against `initial_state` at the top level of each key.

---

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user-current",
      "username": "Alex_Dev",
      "discriminator": "9201",
      "avatar": "https://picsum.photos/seed/alexdev/128/128",
      "status": "online",
      "customStatus": null,
      "aboutMe": "Full-stack dev & gamer.",
      "roles": ["role-admin"],
      "badges": ["server_owner"],
      "bannerColor": "#5865F2",
      "joinedAt": "2023-01-15T10:00:00Z",
      "isBot": false
    },
    "servers": {
      "server-1": {
        "id": "server-1",
        "name": "Gaming Community",
        "icon": "https://picsum.photos/seed/gaming-server/64/64",
        "ownerId": "user-current",
        "channels": ["ch-1"],
        "roles": ["role-admin"],
        "members": ["user-current"],
        "categories": [{ "id": "cat-1", "name": "TEXT CHANNELS", "channelIds": ["ch-1"] }],
        "description": "A gaming community",
        "boostCount": 0,
        "boostTier": 0
      }
    },
    "channels": {
      "ch-1": {
        "id": "ch-1",
        "serverId": "server-1",
        "name": "general",
        "type": "text",
        "category": "TEXT CHANNELS",
        "topic": "General discussion",
        "position": 0,
        "isNsfw": false,
        "slowMode": 0,
        "pinnedMessageIds": [],
        "lastMessageId": null,
        "unreadCount": 0,
        "permissions": {}
      }
    },
    "messages": {},
    "threads": {},
    "users": {
      "user-current": {
        "id": "user-current",
        "username": "Alex_Dev",
        "discriminator": "9201",
        "avatar": "https://picsum.photos/seed/alexdev/128/128",
        "status": "online",
        "customStatus": null,
        "aboutMe": "Full-stack dev & gamer.",
        "roles": ["role-admin"],
        "badges": ["server_owner"],
        "bannerColor": "#5865F2",
        "joinedAt": "2023-01-15T10:00:00Z",
        "isBot": false
      }
    },
    "roles": {
      "role-admin": {
        "id": "role-admin",
        "serverId": "server-1",
        "name": "Admin",
        "color": "#e74c3c",
        "position": 3,
        "permissions": ["ADMINISTRATOR"],
        "hoist": true,
        "mentionable": true
      }
    },
    "dmConversations": {},
    "activeVoiceChannel": null,
    "dms": [],
    "blockedUsers": [],
    "pendingFriends": [],
    "userSettings": {
      "theme": "dark",
      "messageDisplay": "cozy",
      "fontSize": 16,
      "desktopNotifications": true,
      "unreadBadge": true,
      "notificationSound": true,
      "showEmbeds": true,
      "showReactions": true,
      "renderAttachments": true,
      "animatedEmoji": true,
      "reducedMotion": false,
      "highContrast": false,
      "alwaysShowLinkPreviews": true,
      "echoCancellation": true,
      "noiseSuppression": true,
      "automaticGainControl": true,
      "inputVolume": 100,
      "outputVolume": 100,
      "language": "en-US",
      "email": "alex.dev@example.com",
      "phone": null
    },
    "ui": {
      "memberSidebarVisible": true,
      "threadPanelOpen": false,
      "activeThreadId": null,
      "searchQuery": "",
      "searchResults": [],
      "pinnedPanelOpen": false
    }
  }
}
```
