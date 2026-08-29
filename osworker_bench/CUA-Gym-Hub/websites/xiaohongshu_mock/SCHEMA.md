# xiaohongshu_mock Schema

**Base URL**: `http://localhost:<port>/` (port assigned dynamically; see vite.config.js `server.port: 0`)
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUserId` | string | ID of the logged-in user (default: `"u1"`) |
| `isDarkMode` | boolean | Whether dark mode is active (default: `false`). Observable in `/go` — toggling via the avatar dropdown updates this field. |
| `users` | object | Keyed by userId → user record: `{id, nickname, redId, avatar, banner, bio, gender, location, verified, followingIds[], followerIds[], likesAndBookmarksReceived}` — `gender` is `"female"`, `"male"`, or `"other"` |
| `notes` | object | Keyed by noteId → note record: `{id, authorId, type, title, content, images[], videoUrl, hashtags[], location, likedByIds[], bookmarkedByIds[], commentCount, shareCount, isPinned, createdAt, category}` — `type` is `"image"` or `"video"`, `category` is one of `"food"`, `"travel"`, `"beauty"`, `"fashion"`, `"fitness"`, `"home"`, `"digital"`, `"study"`, `"pets"` |
| `comments` | object | Keyed by commentId → comment record: `{id, noteId, authorId, content, likedByIds[], parentCommentId, createdAt}` — `parentCommentId` is `null` for top-level comments |
| `notifications` | object | Keyed by notifId → notification record: `{id, recipientId, actorId, type, noteId, commentId, isRead, createdAt}` — `type` is `"like"`, `"bookmark"`, `"follow"`, `"comment"`, or `"reply"` |
| `conversations` | object | Keyed by convId → conversation record: `{id, participantIds[], lastMessagePreview, lastMessageAt, unreadCount}` |
| `messages` | object | Keyed by msgId → message record: `{id, conversationId, senderId, content, type, imageUrl, sharedNoteId, createdAt}` — `type` is `"text"` |
| `topics` | object | Keyed by topicId → topic record: `{id, name, noteCount, viewCount}` |

### Default User IDs
`u1` (生活美学家, currentUser), `u2` (美食达人小林), `u3` (旅行摄影师Leo), `u4` (穿搭日记本), `u5` (健身教练Amy), `u6` (咖啡与书), `u7` (家居设计师Mia), `u8` (数码测评君), `u9` (护肤研究所), `u10` (萌宠日记), `u11` (考研上岸指南), `u12` (户外探险家)

### Default Note IDs
`n1`–`n32` (32 notes across food, travel, fashion, home, fitness, beauty, digital, study, pets categories)

### Default Comment IDs
`c1`–`c52` (52 comments, including reply chains)

### Default Notification IDs
`notif1`–`notif18` (18 notifications for u1; notif1–notif6 unread)

### Default Conversation IDs
`conv1` (u1↔u2), `conv2` (u1↔u3), `conv3` (u1↔u5)

### Default Message IDs
`msg1`–`msg15` (5–7 messages per conversation)

### Default Topic IDs
`t1`–`t16` (16 topics: 咖啡探店, 旅行攻略, 穿搭分享, 健身打卡, 家居改造, 美食探店, 减脂, ootd, 数码测评, 北欧风装修, 阅读, 上海美食, 敏感肌, 萌宠, 考研, 露营)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUserId": "u1",
    "isDarkMode": false,
    "users": {
      "u1": {
        "id": "u1",
        "nickname": "生活美学家",
        "redId": "lifestyle_guru",
        "avatar": "https://i.pravatar.cc/150?u=u1",
        "banner": "https://picsum.photos/seed/u1banner/800/300",
        "bio": "分享日常美好生活",
        "gender": "female",
        "location": "上海",
        "verified": true,
        "followingIds": ["u2"],
        "followerIds": ["u2"],
        "likesAndBookmarksReceived": 100
      },
      "u2": {
        "id": "u2",
        "nickname": "美食达人小林",
        "redId": "foodie_lin",
        "avatar": "https://i.pravatar.cc/150?u=u2",
        "banner": "https://picsum.photos/seed/u2banner/800/300",
        "bio": "美食探店",
        "gender": "female",
        "location": "北京",
        "verified": false,
        "followingIds": ["u1"],
        "followerIds": ["u1"],
        "likesAndBookmarksReceived": 500
      }
    },
    "notes": {
      "n1": {
        "id": "n1",
        "authorId": "u1",
        "type": "image",
        "title": "测试笔记",
        "content": "内容 #测试话题",
        "images": ["https://picsum.photos/seed/test/600/800"],
        "videoUrl": null,
        "hashtags": ["测试话题"],
        "location": "上海",
        "likedByIds": [],
        "bookmarkedByIds": [],
        "commentCount": 0,
        "shareCount": 0,
        "isPinned": false,
        "createdAt": 1712700000000,
        "category": "food"
      }
    },
    "comments": {},
    "notifications": {},
    "conversations": {
      "conv1": {
        "id": "conv1",
        "participantIds": ["u1", "u2"],
        "lastMessagePreview": "你好！",
        "lastMessageAt": 1712700000000,
        "unreadCount": 0
      }
    },
    "messages": {
      "msg1": {
        "id": "msg1",
        "conversationId": "conv1",
        "senderId": "u2",
        "content": "你好！",
        "type": "text",
        "imageUrl": null,
        "sharedNoteId": null,
        "createdAt": 1712700000000
      }
    },
    "topics": {}
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Like a note | `notes[noteId].likedByIds` array toggled (userId added or removed) |
| Bookmark a note | `notes[noteId].bookmarkedByIds` array toggled (userId added or removed) |
| Comment on a note | `comments` object grows by 1 entry; `notes[noteId].commentCount` incremented |
| Reply to a comment | `comments` object grows by 1 entry with `parentCommentId` set; `notes[noteId].commentCount` incremented |
| Like a comment | `comments[commentId].likedByIds` array toggled |
| Follow a user | `users[currentUserId].followingIds` gains targetUserId; `users[targetUserId].followerIds` gains currentUserId; `notifications` object grows by 1 follow notification |
| Unfollow a user | `users[currentUserId].followingIds` loses targetUserId; `users[targetUserId].followerIds` loses currentUserId |
| Send DM message | `messages` object grows by 1 entry; `conversations[convId].lastMessagePreview` and `lastMessageAt` updated; `unreadCount` reset to 0 |
| Publish a new note | `notes` object grows by 1 entry |
| Edit a note | `notes[noteId].title`, `.content`, `.images`, `.category`, `.location`, `.hashtags` updated |
| Delete a note | `notes[noteId]` key removed from `notes` object |
| Pin/unpin a note | `notes[noteId].isPinned` toggled |
| Edit profile | `users[currentUserId]` fields updated (nickname, redId, bio, gender, location, avatar) |
| Mark notification read | `notifications[notifId].isRead` → `true` |
| Mark all notifications read | all `notifications[*].isRead` → `true` |
| Toggle dark mode | `isDarkMode` toggled in app state (observable in `/go` `state_diff`) |
| Open conversation | `conversations[convId].unreadCount` → `0` |
