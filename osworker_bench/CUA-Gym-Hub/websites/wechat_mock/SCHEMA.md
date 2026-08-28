# wechat_mock Schema

**Deploy order**: 57 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8057)
**Base URL**: `http://172.17.46.46:8057/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files: [{original_name, stored_name, size, content_type, url}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

## State Management

Uses **Zustand** (`src/store.js`) with localStorage persistence (key: `wechat_mock_data[_<sid>]`). State is automatically synced to the server on every mutation via `saveToStorage()` → `POST /post` with `action: "set_current"`. Default data is generated in `defaultState.js` (shared between Vite server and React app).

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Current logged-in user profile |
| `contacts` | array | All contacts (friends) of the current user |
| `conversations` | array | Active conversation list displayed on Messages tab |
| `messages` | object | Keyed by contactId or groupId → array of message objects |
| `moments` | array | XeChat Moments (timeline/feed) posts |
| `groups` | array | Group chat definitions |
| `favorites` | array | Saved/bookmarked items from chats |

### `user` (object)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `userId` | string | `"user_1"` | Unique user identifier |
| `nickname` | string | `"张三"` | Display name |
| `avatar` | string | `"https://picsum.photos/100/100?random=1"` | Avatar image URL |
| `wechatId` | string | `"zhangsan_2024"` | XeChat ID (immutable in UI) |
| `signature` | string | `"每天进步一点点"` | Personal signature / status text |
| `region` | string | `"北京 海淀"` | Geographic region |
| `gender` | string | `"男"` | Gender (`"男"` or `"女"`) |
| `coverImage` | string | `"https://picsum.photos/800/300?random=cover"` | Moments cover banner image URL |
| `phone` | string | `"138****1234"` | Phone number (masked) |

### `contacts[]` (array of objects)

| Field | Type | Default Example | Description |
|-------|------|-----------------|-------------|
| `userId` | string | `"user_2"` | Unique contact identifier |
| `nickname` | string | `"李四"` | Display name |
| `avatar` | string | URL | Avatar image URL |
| `wechatId` | string | `"lisi_wx"` | XeChat ID |
| `phone` | string | `"139****5678"` | Phone number (masked) |
| `signature` | string | `"简单生活"` | Personal signature |
| `region` | string | `"上海 浦东"` | Geographic region |
| `gender` | string | `"男"` | Gender |
| `tag` | string | `"朋友"` | Contact tag/category (e.g. `"朋友"`, `"同事"`, `"家人"`) |
| `isStar` | boolean | `false` | Whether contact is starred/favorited |

### Default contact IDs

| ID | Nickname | Tag |
|----|----------|-----|
| `user_2` | 李四 | 朋友 |
| `user_3` | 王五 | 同事 |
| `user_4` | 赵六 | 同事 |
| `user_5` | 小明 | 朋友 (isStar: true) |
| `user_6` | 小红 | 朋友 |
| `user_7` | 老板 | 同事 |
| `user_8` | 小美 | 家人 |

### `conversations[]` (array of objects)

| Field | Type | Default Example | Description |
|-------|------|-----------------|-------------|
| `contactId` | string | `"user_2"` or `"group_1"` | Links to contact userId or group groupId |
| `lastMessage` | string | `"好的，明天见！"` | Preview text of last message |
| `lastTime` | string (ISO) | `"2025-..."` | Timestamp of last message |
| `unreadCount` | number | `2` | Number of unread messages |
| `isGroup` | boolean | `false` | Whether this is a group conversation |
| `isPinned` | boolean | `true` | Whether pinned to top of list |
| `isMuted` | boolean | `false` | Whether notifications are muted |
| `draft` | string | `""` | Unsent draft text (saved when navigating away from chat) |

### Default conversations

| contactId | isGroup | isPinned | isMuted | unreadCount |
|-----------|---------|----------|---------|-------------|
| `user_2` | false | true | false | 2 |
| `group_1` | true | false | false | 5 |
| `user_3` | false | false | false | 0 |
| `user_4` | false | false | false | 1 |
| `user_7` | false | false | true | 0 |

### `messages` (object, keyed by contactId/groupId → array)

Each message object:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messageId` | string | yes | Unique message ID (e.g. `"msg_001"`) |
| `senderId` | string | yes | User ID of sender |
| `content` | string | yes | Message content (text, image URL, file name, location text, transfer amount, or greeting for hongbao) |
| `type` | string | yes | One of: `"text"`, `"image"`, `"file"`, `"voice"`, `"location"`, `"transfer"`, `"hongbao"`, `"system"` |
| `timestamp` | string (ISO) | yes | Message send time |
| `isSelf` | boolean | yes | `true` if sent by current user |
| `recalled` | boolean | no | `true` if message was recalled (content set to `""`) |
| `amount` | number | hongbao/transfer | Red envelope or transfer amount (e.g. `66.66`) |
| `greeting` | string | hongbao | Red envelope greeting text |
| `opened` | boolean | hongbao | Whether the red envelope has been opened |
| `duration` | number | voice | Voice message duration in seconds |
| `fileName` | string | file | Original file name |
| `fileSize` | string | file | File size string (e.g. `"3.2MB"`) |
| `locationName` | string | location | Location name (optional) |
| `locationAddress` | string | location | Location address (optional) |

### Default message threads

| Key | Message Count | Types Present |
|-----|--------------|---------------|
| `user_2` | 7 | text, hongbao |
| `user_3` | 5 | text, image, voice |
| `user_4` | 4 | text, file |
| `user_7` | 4 | text |
| `group_1` | 6 | text |

### `moments[]` (array of objects)

| Field | Type | Default Example | Description |
|-------|------|-----------------|-------------|
| `postId` | string | `"moment_1"` | Unique moment post ID |
| `userId` | string | `"user_2"` | Author user ID |
| `content` | string | `"周末去爬山了..."` | Text content of the post |
| `images` | array of strings | `["https://..."]` | Array of image URLs (0-9 images) |
| `timestamp` | string (ISO) | `"2025-..."` | Post creation time |
| `likes` | array of strings | `["user_1", "user_3"]` | Array of user IDs who liked the post |
| `comments` | array of objects | `[{commentId, userId, content, timestamp, replyTo?}]` | Comments on the post |
| `location` | string | `"北京·香山公园"` | Location tag (empty string if none) |

#### `moments[].comments[]` (nested array)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `commentId` | string | yes | Unique comment ID (e.g. `"c1"`) |
| `userId` | string | yes | Commenter user ID |
| `content` | string | yes | Comment text |
| `timestamp` | string (ISO) | yes | Comment time |
| `replyTo` | string | no | User ID being replied to (for nested replies) |

### Default moments

| postId | userId | Has Images | Likes Count | Comments Count | Location |
|--------|--------|-----------|-------------|----------------|----------|
| `moment_1` | user_2 | yes (3) | 3 | 2 | 北京·香山公园 |
| `moment_2` | user_6 | yes (1) | 4 | 1 | (none) |
| `moment_3` | user_1 | no | 2 | 2 | (none) |
| `moment_4` | user_5 | no | 2 | 0 | 杭州·阿里巴巴西溪园区 |
| `moment_5` | user_3 | yes (2) | 4 | 2 | 广州·天河体育中心 |

### `groups[]` (array of objects)

| Field | Type | Default Example | Description |
|-------|------|-----------------|-------------|
| `groupId` | string | `"group_1"` | Unique group identifier |
| `name` | string | `"项目讨论组"` | Group display name |
| `avatar` | string | URL | Group avatar image URL |
| `members` | array of strings | `["user_1", "user_3", "user_4", "user_5"]` | Array of member user IDs |
| `createdAt` | string (ISO) | `"2025-01-15T09:00:00Z"` | Group creation time |
| `createdBy` | string | `"user_1"` | User ID of group creator |
| `description` | string | `"用于讨论项目进度"` | Group description |
| `announcement` | string | `"本周五下午3点开会..."` | Group announcement (empty string if none) |

### Default groups

| groupId | Name | Members | Creator |
|---------|------|---------|---------|
| `group_1` | 项目讨论组 | user_1, user_3, user_4, user_5 | user_1 |
| `group_2` | 老同学聚会 | user_1, user_2, user_5, user_6 | user_2 |

### `favorites[]` (array of objects)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `favoriteId` | string | yes | Unique favorite ID (e.g. `"fav_1"`) |
| `type` | string | yes | One of: `"text"`, `"image"`, `"link"`, `"file"` |
| `content` | string | yes | Content (text string, image URL, link URL, or filename) |
| `source` | string | yes | Name of person the item came from |
| `timestamp` | string (ISO) | yes | When the item was favorited |
| `title` | string | link only | Link title |
| `preview` | string | link only | Link preview text |
| `fileName` | string | file only | File name |
| `fileSize` | string | file only | File size string (e.g. `"2.1MB"`) |

### Default favorites

| favoriteId | Type | Source |
|------------|------|--------|
| `fav_1` | text | 李四 |
| `fav_2` | image | 小红 |
| `fav_3` | link | 王五 |
| `fav_4` | file | 赵六 |
| `fav_5` | text | 老板 |

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | redirect → `/messages` | Default redirect |
| `/messages` | MessagesPage | Conversation list (main tab) |
| `/contacts` | ContactsPage | Contacts list with letter index and tag filtering |
| `/discover` | DiscoverPage | Discover tab (Moments, Channels, Mini Programs, etc.) |
| `/profile` | ProfilePage | "Me" tab (user card, favorites, settings, stickers) |
| `/chat/:contactId` | ChatPage | 1-on-1 chat with a contact |
| `/user/:userId` | UserProfilePage | View user profile page (with voice/video call UI) |
| `/edit-profile` | EditProfilePage | Edit current user profile fields |
| `/moments` | MomentsPage | Moments (timeline/feed) page |
| `/chat-settings/:contactId` | ChatSettingsPage | Chat settings (mute, pin, background, clear history) |
| `/search-chat/:contactId` | SearchChatPage | Search within chat history (highlights matching text) |
| `/groups` | GroupsPage | Create new group chat |
| `/group/:groupId` | GroupChatPage | Group chat conversation |
| `/group-info/:groupId` | GroupInfoPage | Group info (members, announcement, rename, settings) |
| `/channels` | ChannelsPage | Video channels page |
| `/go` | StateInspector | State inspection endpoint (JSON) |

## Store Actions (Zustand)

| Action | Signature | Description |
|--------|-----------|-------------|
| `initialize()` | `async () => void` | Load state from localStorage / server; called on app mount |
| `updateUser(userData)` | `(Partial<User>) => void` | Merge-update the current user's profile fields |
| `pinConversation(contactId)` | `(string) => void` | Toggle `isPinned` for a conversation |
| `muteConversation(contactId)` | `(string) => void` | Toggle `isMuted` for a conversation |
| `saveDraft(contactId, text)` | `(string, string) => void` | Save draft text for a conversation |
| `deleteConversation(contactId)` | `(string) => void` | Remove a conversation from the list |
| `recallMessage(contactId, messageId)` | `(string, string) => void` | Mark a message as recalled (`recalled: true`, content: `""`) |
| `addContact(contact)` | `(Contact) => void` | Add a new contact (no-op if userId already exists) |
| `removeContact(userId)` | `(string) => void` | Remove a contact by userId |
| `sendMessage(contactId, content, type, extra)` | `(string, string, string?, object?) => void` | Send a message in a 1-on-1 chat; triggers auto-reply after 2–5 seconds |
| `receiveMessage(contactId)` | `(string) => void` | Simulate receiving an incoming message from a contact |
| `markAsRead(contactId)` | `(string) => void` | Set `unreadCount` to 0 for a conversation |
| `clearChatHistory(contactId)` | `(string) => void` | Delete all messages for a contact/group and remove the conversation |
| `addMoment(content, images, location)` | `(string, string[], string?) => void` | Post a new Moment; prepends to `moments` array |
| `deleteMoment(postId)` | `(string) => void` | Remove a Moment by postId |
| `toggleLike(postId)` | `(string) => void` | Add/remove current user's userId from `moments[i].likes` |
| `addComment(postId, content, replyTo)` | `(string, string, string?) => void` | Append a comment to a Moment |
| `createGroup(name, memberIds)` | `(string, string[]) => string` | Create a new group; returns the new `groupId` |
| `sendGroupMessage(groupId, content, type, extra)` | `(string, string, string?, object?) => void` | Send a message in a group chat; triggers auto-reply |
| `receiveGroupMessage(groupId)` | `(string) => void` | Simulate a random group member sending a message |
| `updateGroup(groupId, updates)` | `(string, Partial<Group>) => void` | Update any fields of a group (e.g. `name`, `description`) |
| `addGroupMember(groupId, userId)` | `(string, string) => void` | Add a member to a group |
| `removeGroupMember(groupId, userId)` | `(string, string) => void` | Remove a member from a group |
| `exitGroup(groupId)` | `(string) => void` | Current user leaves a group; removes their ID from members and deletes the conversation |
| `setGroupAnnouncement(groupId, text)` | `(string, string) => void` | Set or update group announcement text |
| `getStateDiff()` | `() => object` | Compute diff between `initialState` and current state for `/go` endpoint |

## Page-Level Interactive Features

### ChatPage (`/chat/:contactId`)
- **Text input**: Type and press Enter or click 发送 to send; input auto-focuses on mount
- **Voice mode**: Toggle microphone button to switch between keyboard and hold-to-talk; press and hold 按住说话 button to record voice, release to send as `voice` message
- **Emoji picker**: Click emoji button to open grid; clicking an emoji appends it to the text input
- **More menu (+)**: Opens grid of action buttons:
  - 图片 — opens file input for image selection (sends as `image` message)
  - 拍摄 — opens file input for camera (same as 图片)
  - 文件 — opens file input for any file (sends as `file` message with `fileName` and `fileSize`)
  - 位置 — opens location picker modal; 发送位置 sends a `location` message
  - 语音通话 — shows full-screen voice call overlay with timer; 结束通话 ends call and sends summary text
  - 视频通话 — shows full-screen video call overlay with timer; 结束通话 ends call and sends summary text
  - 转账 — opens transfer dialog; enter amount and confirm to send as `transfer` message
  - 红包 — opens hongbao dialog; enter amount and greeting; confirm sends as `hongbao` message
  - 收藏 — saves the last text message from the chat to `favorites` array in store
- **Message context menu**: Long-press (click) any bubble to open context menu:
  - 复制 — copies text to clipboard
  - 撤回 — recalls message (only available within 2 minutes for self-sent messages)
  - 删除 — removes message from local view
- **Hongbao opening**: Click a received/sent hongbao bubble to mark it `opened: true`
- **Auto-reply**: After each sent message, a random reply arrives from the contact after 2–5 seconds
- **Draft persistence**: Draft text is saved to `conversations[].draft` when navigating away; restored on return

### GroupChatPage (`/group/:groupId`)
- All the same features as ChatPage with group context
- **Voice mode**: Same hold-to-talk for voice messages
- **More menu**: Same actions including hongbao, voice call, video call
- **Message rendering**: Displays sender name + avatar for each message (non-self); supports all message types (text, image, file, voice, location, transfer, hongbao)
- **Auto-reply**: After each sent message, a random group member replies after 2–5 seconds
- **Draft persistence**: Draft saved/restored per group conversation
- **Group info button** (ⓘ): Navigates to `/group-info/:groupId`

### GroupInfoPage (`/group-info/:groupId`)
- **Member grid**: Shows all members; click a member to navigate to their profile
- **Add member (+)**: Opens contact selection modal; tap contacts to select, confirm to add to group
- **Rename group**: Click on group name row to open in-app rename dialog (replaces `window.prompt`)
- **Group announcement**: Creator can click 编辑 to open inline editor; save with 完成
- **Mute/Pin toggles**: Toggle switches for 消息免打扰 and 置顶聊天
- **Search chat records**: Navigates to `/search-chat/:groupId`
- **Exit group**: Button opens in-app confirmation dialog (replaces `window.confirm`)

### ChatSettingsPage (`/chat-settings/:contactId`)
- **Pin/Mute toggles**: Toggle switches persist to `conversations[]`
- **Chat background**: Click to open color picker; selected color persisted to localStorage (key: `wechat_chat_bg_<sid>_<contactId>`)
- **Clear chat history**: Opens in-app confirmation dialog (replaces `window.confirm`); confirms runs `clearChatHistory()`
- **Find chat records**: Navigates to `/search-chat/:contactId`

### SearchChatPage (`/search-chat/:contactId`)
- **Search input**: Real-time filtering of `messages[contactId]` by text content (only `type: "text"` messages)
- **Results**: Shows matching messages with sender avatar, name, timestamp, and highlighted match text (safe rendering — no `dangerouslySetInnerHTML`)

### ContactsPage (`/contacts`)
- **Search bar**: Filters contacts by `nickname` and `phone` fields
- **Alphabetical index**: Tap letters on right rail to scroll to that letter group
- **New friends (新朋友)**: Navigates to contact add page
- **Group chats (群聊)**: Opens list of joined groups; click a group to navigate to `/group/:groupId`
- **Tags (标签)**: Click a tag to open drill-down modal showing contacts with that tag; click a contact to navigate to their profile
- **Official accounts (公众号)**: Opens official accounts modal with sample account list
- **Star contacts (星标朋友)**: Shows contacts where `isStar: true`
- **Contact item**: Click to navigate to `/user/:userId`

### UserProfilePage (`/user/:userId`)
- **Profile display**: Shows avatar, nickname, wechatId, signature, region, gender, phone, and recent Moments photos (up to 9)
- **QR code button** (📱 icon): Opens modal with simulated QR code grid pattern
- **Edit profile** (for current user): Button navigates to `/edit-profile`
- **Send message** (for contacts): Navigates to `/chat/:userId`
- **Voice call** (for contacts): Shows full-screen voice call overlay (gradient purple background) with running timer; 结束通话 sends call duration summary message and navigates to chat
- **Video call** (for contacts): Shows full-screen video call overlay (dark background) with running timer; 结束通话 ends call and navigates to chat

### ProfilePage (`/profile`)
- **Profile card**: Click to navigate to `/user/:userId`
- **Services (服务)**: Opens modal with 3 service categories (金融理财, 生活服务, 出行交通) with clickable items
- **Favorites (收藏)**: Opens modal listing all items in `favorites` state array
- **Moments (朋友圈)**: Navigates to `/moments`
- **Wallet (卡包)**: Opens modal with card categories (会员卡, 优惠券, etc.)
- **Stickers (表情)**: Opens sticker packs browser; click a pack to view its stickers; 下载/已添加 button toggles download state for each pack
- **Settings (设置)**: Opens settings list modal; click any setting item to open its sub-page view

### GroupsPage (`/groups`)
- **Group name input**: Enter name (max 20 chars); validation error shown inline (no `alert()`)
- **Member selection**: Toggle checkmarks on contacts; selected count shown in section header
- **Create button**: Disabled unless both name and at least one member are selected; on success navigates to the new group chat

### MomentsPage (`/moments`)
- **Post composition**: Text input + image attach (up to 9 images) + location tag; 发布 calls `addMoment()`
- **Like button (♥)**: Calls `toggleLike(postId)` — adds/removes `user.userId` from `moment.likes`
- **Comment button**: Opens inline comment box; submit calls `addComment(postId, content)`
- **Delete post**: Available on own posts via ⋯ menu; calls `deleteMoment(postId)`

### DiscoverPage (`/discover`)
- **朋友圈**: Navigates to `/moments`
- **视频号**: Navigates to `/channels`
- **扫一扫**: Opens scan modal with animated scan frame
- **搜一搜**: Opens search modal with hot search suggestions; clicking a suggestion fills the input
- **直播**: Opens live streaming modal (shows empty state)
- **摇一摇**: Opens shake modal with animated phone icon
- **看一看**: Opens top stories modal with sample article list
- **附近的人**: Opens nearby people modal with sample profiles
- **小程序**: Opens mini programs list; search button filters by name; click a mini program to view detail modal

### ChannelsPage (`/channels`)
- **Tab switching**: 关注 / 推荐 / 热门 tabs filter the video list
- **Search**: Opens inline search input; filters by title and creator name
- **Play video**: Click thumbnail to toggle play state (shows simulated play overlay)
- **Like button**: Toggles `likedVideos[videoId]` state; count updates live
- **Follow button**: Toggles `followedCreators[creatorName]`; 关注 tab shows only followed creators
- **Comment button**: Opens bottom sheet comments panel with text input; submit adds comment to local state
- **Share button**: Gives 2-second green color feedback

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Send text message | `messages[contactId]` array grows by 1 (type: `"text"`, isSelf: `true`); `conversations[].lastMessage` + `lastTime` updated; conversation moved to top |
| Send image/file/voice/location/transfer/hongbao | `messages[contactId]` grows (with appropriate `type`); `conversations[].lastMessage` shows type tag (e.g. `"[图片]"`, `"[文件]"`, `"[语音]"`, `"[位置]"`, `"[转账]"`, `"[微信红包]"`) |
| Receive auto-reply (individual chat) | `messages[contactId]` grows (isSelf: `false`); `conversations[].unreadCount` incremented; conversation moved to top |
| Send group message | `messages[groupId]` grows; `conversations[].lastMessage` updated; auto-reply from random group member follows |
| Recall a message | `messages[contactId][i].recalled` → `true`; `messages[contactId][i].content` → `""` |
| Delete a message (local) | `messages[contactId]` array shrinks (client-side only, not persisted to server state) |
| Mark conversation as read | `conversations[i].unreadCount` → `0` |
| Pin/unpin conversation | `conversations[i].isPinned` toggled |
| Mute/unmute conversation | `conversations[i].isMuted` toggled |
| Save draft in chat | `conversations[i].draft` updated |
| Delete conversation | `conversations` array shrinks by 1 |
| Clear chat history | `messages[contactId]` deleted; matching conversation removed |
| Open hongbao (red envelope) | `messages[contactId][i].opened` → `true` |
| Update user profile | `user` fields updated (nickname, signature, region, gender, avatar, coverImage) |
| Post a moment | `moments` array grows (new entry prepended at index 0) |
| Delete a moment | `moments` array shrinks by 1 |
| Like/unlike a moment | `moments[i].likes` array gains/loses `user.userId` |
| Comment on a moment | `moments[i].comments` array grows by 1 |
| Create a group | `groups` array grows; `messages[newGroupId]` initialized to `[]` |
| Update group name | `groups[i].name` updated |
| Set group announcement | `groups[i].announcement` updated |
| Add group member | `groups[i].members` array gains a userId |
| Remove group member | `groups[i].members` array loses a userId |
| Exit group | `groups[i].members` loses current user's ID; matching conversation removed |
| Add contact | `contacts` array grows by 1 |
| Remove contact | `contacts` array shrinks by 1 |
| Favorite a message | `favorites` array grows by 1 (type: `"text"`, with `source`, `content`, `timestamp`) |
| End voice/video call | `messages[contactId]` grows by 1 (type: `"text"`, content: `"通话时长 MM:SS"` or `"视频通话时长 MM:SS"`) |

## Message Types Reference

| Type | Content Field | Extra Fields | Display in Conversation List |
|------|--------------|--------------|------------------------------|
| `text` | Message text | (none) | Content as-is |
| `image` | Image URL or data URI | (none) | `[图片]` |
| `file` | File name | `fileName`, `fileSize` | `[文件]` |
| `voice` | `""` (empty) | `duration` (seconds) | `[语音]` |
| `location` | Location text | `locationName?`, `locationAddress?` | `[位置]` |
| `transfer` | Amount string (e.g. `"¥88.00"`) | `amount` (number) | `[转账]` |
| `hongbao` | Greeting text | `amount`, `greeting`, `opened` | `[微信红包]` |
| `system` | System message text | (none) | (not shown) |

## UI Dialogs (In-App, No Browser Dialogs)

All browser-native dialogs (`window.alert`, `window.confirm`, `window.prompt`) have been replaced with in-app React modal dialogs that RL agents can interact with using standard DOM click interactions:

| Dialog Trigger | Component | Dialog Type | Confirm Action |
|---------------|-----------|-------------|----------------|
| 清空聊天记录 button | ChatSettingsPage | Overlay modal | 清空 button calls `clearChatHistory()` |
| 退出群聊 button | GroupInfoPage | Overlay modal | 确定 button calls `exitGroup()` |
| Group name row click | GroupInfoPage | Input dialog | 确定 button calls `updateGroup()` with new name |
| Create group (no name/members) | GroupsPage | Inline error text | N/A (shown below input, not a modal) |

## State Normalization

When injecting custom state via `POST /post`, the app normalizes incoming data with sensible defaults:

- **Contacts**: `userId` falls back to `id` → `contact_<index>`; `nickname` falls back to `name` → `displayName` → `"未知用户"`
- **Conversations**: `contactId` falls back to `userId` → `id`; `unreadCount` falls back to `unread` → `0`
- **Messages**: `messageId` falls back to `id` → `msg_<index>`; `senderId` falls back to `from`; `content` falls back to `text`

This means you can inject simplified state structures and the app will fill in missing fields.

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8057/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {
          "userId": "user_1",
          "nickname": "张三",
          "avatar": "https://picsum.photos/100/100?random=1",
          "wechatId": "zhangsan_2024",
          "signature": "每天进步一点点",
          "region": "北京 海淀",
          "gender": "男",
          "coverImage": "https://picsum.photos/800/300?random=cover",
          "phone": "138****1234"
        },
        "contacts": [
          {"userId": "user_2", "nickname": "李四", "avatar": "https://picsum.photos/100/100?random=2", "wechatId": "lisi_wx", "phone": "139****5678", "signature": "简单生活", "region": "上海 浦东", "gender": "男", "tag": "朋友", "isStar": false},
          {"userId": "user_3", "nickname": "王五", "avatar": "https://picsum.photos/100/100?random=3", "wechatId": "wangwu_88", "phone": "136****9012", "signature": "热爱运动", "region": "广州 天河", "gender": "男", "tag": "同事", "isStar": false}
        ],
        "conversations": [
          {"contactId": "user_2", "lastMessage": "你好！", "lastTime": "2025-01-20T10:00:00Z", "unreadCount": 1, "isGroup": false, "isPinned": false, "isMuted": false, "draft": ""}
        ],
        "messages": {
          "user_2": [
            {"messageId": "msg_001", "senderId": "user_2", "content": "你好！", "type": "text", "timestamp": "2025-01-20T10:00:00Z", "isSelf": false}
          ]
        },
        "moments": [
          {"postId": "moment_1", "userId": "user_2", "content": "今天天气真好", "images": [], "timestamp": "2025-01-20T09:00:00Z", "likes": [], "comments": [], "location": ""}
        ],
        "groups": [],
        "favorites": []
      }
    }
  }
}
```
