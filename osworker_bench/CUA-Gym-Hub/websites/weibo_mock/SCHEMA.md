# weibo_mock Schema

**Deploy order**: 89 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8089)
**Base URL**: `http://localhost:5173/` (local dev) or `https://cua-gym-xeibo.xlang.ai/` (production)
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files: [{original_name, stored_name, size, content_type, url}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Active user (same shape as `users["user_current"]`) |
| `users` | object | Keyed by userId → User object; includes `user_current` plus `user_1` through `user_11` |
| `posts` | object | Keyed by postId → Post object; `post_1` through `post_20` in seed data |
| `comments` | object | Keyed by commentId → Comment object; `comment_1` through `comment_30` in seed |
| `hotSearches` | array | 50 HotSearch items with rank, title, badge, category, searchCount |
| `topics` | object | Keyed by topicId → Topic object; `topic_1` through `topic_10` in seed |
| `conversations` | object | Keyed by convId → Conversation object; `conv_1` through `conv_4` in seed |
| `messages` | object | Keyed by msgId → Message object; `msg_1` through `msg_17` in seed |
| `notifications` | array | 15 Notification objects; 5 unread (`notif_1` through `notif_5`) |
| `ui` | object | `{feedTab, searchQuery, selectedPostId, notificationUnreadCount, messageUnreadCount}` |
| `settings` | object | `{receiveDMs, commentPermission, darkMode, emailNotifications, pushNotifications}` |
| `followedTopics` | array | Topic IDs (`string[]`) the current user follows; default `["topic_1","topic_3"]` |

### User shape
```
{
  id: string,
  screenName: string,              // Chinese display name (e.g. "李小明")
  handle: string,                  // @handle (e.g. "lixiaoming")
  avatar: string,                  // URL
  coverImage: string,              // URL or ""
  bio: string,
  location: string,
  verified: boolean,
  verifiedType: "blue_v" | "orange_v" | "gold_v" | "none",
  followingCount: number,
  followersCount: number,
  postsCount: number,
  isFollowing: boolean,            // whether currentUser follows this user
  createdAt: string,               // ISO 8601
}
```

### Post shape
```
{
  id: string,
  userId: string,
  text: string,
  images: string[],                // array of image URLs
  video: null,
  createdAt: string,               // ISO 8601
  source: string,                  // e.g. "微博网页版"
  repostCount: number,
  commentCount: number,
  likeCount: number,
  isLiked: boolean,
  isReposted: boolean,
  repostOf: string | null,         // postId of original if this is a repost
  repostText: string,
  isLongText: boolean,             // true if text > 140 chars
  topicIds: string[],
  isFavorited?: boolean,           // optional, defaults to false/undefined
}
```

### Comment shape
```
{
  id: string,
  postId: string,
  userId: string,
  text: string,
  createdAt: string,
  likeCount: number,
  isLiked: boolean,
  replyToId: string | null,        // parent commentId if a reply
  replyToUserId: string | null,
}
```

### HotSearch shape
```
{
  id: string,
  rank: number,                    // 1-50
  title: string,                   // Chinese topic text
  searchCount: number,
  category: string,                // "社会" | "娱乐" | "科技" | "体育" | "财经" | "生活"
  badge: "hot" | "new" | "boil" | "recommend" | "",
  url: string,                     // e.g. "/search?q=topic"
}
```

### Topic shape
```
{
  id: string,
  name: string,
  readCount: number,
  discussionCount: number,
  description: string,
  hostUserId: string | null,
  isSuperTopic: boolean,
}
```

### Conversation shape
```
{
  id: string,
  participantIds: string[],        // always includes "user_current"
  lastMessageId: string,
  lastMessageAt: string,           // ISO 8601
  unreadCount: number,
}
```

### Message shape
```
{
  id: string,
  conversationId: string,
  senderId: string,
  receiverId: string,
  text: string,
  createdAt: string,               // ISO 8601
  isRead: boolean,
}
```

### Notification shape
```
{
  id: string,
  type: "like" | "comment" | "repost" | "follow" | "mention" | "system",
  fromUserId: string | null,
  postId: string | null,
  commentId: string | null,
  text: string,                    // Chinese text, e.g. "赞了你的微博"
  createdAt: string,               // ISO 8601
  isRead: boolean,
}
```

### Default IDs

**Users**: `user_current` (李小明 @lixiaoming, currentUser), `user_1` (央视新闻, blue_v), `user_2` (张伟Tech, orange_v), `user_3` (美食小厨娘, orange_v), `user_4` (华为官方微博, gold_v), `user_5` (旅行的陈默, blue_v), `user_6` (林晓雨, regular), `user_7` (王子豪体育, blue_v), `user_8` (周音乐人, orange_v), `user_9` (赵小花, regular), `user_10` (刘大厨, regular), `user_11` (科技前沿报道, blue_v)

**currentUser follows**: `user_1`, `user_2`, `user_3`, `user_4`, `user_5`, `user_6`

**Posts**: `post_1` through `post_20`; `post_10` is by `user_current`; `post_11`, `post_12`, `post_13` are reposts; `post_14`/`post_15` have 9-image grids

**Comments**: `comment_1` through `comment_30`; most comments on `post_1` (8 comments)

**Topics**: `topic_1` (新能源汽车政策), `topic_2` (绿色出行), `topic_3` (AI大模型, superTopic), `topic_4` (国产AI崛起), `topic_5` (家常菜, superTopic), `topic_6` (旅行攻略), `topic_7` (北京生活), `topic_8` (体育), `topic_9` (音乐人), `topic_10` (减脂)

**Conversations**: `conv_1` (user_current ↔ user_6), `conv_2` (user_current ↔ user_2, 2 unread), `conv_3` (user_current ↔ user_3, 3 unread), `conv_4` (user_current ↔ user_9)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user_current",
      "screenName": "李小明",
      "handle": "lixiaoming",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=lixiaoming",
      "coverImage": "",
      "bio": "热爱生活，热爱分享",
      "location": "北京",
      "verified": false,
      "verifiedType": "none",
      "followingCount": 1,
      "followersCount": 512,
      "postsCount": 1,
      "isFollowing": false,
      "createdAt": "2019-06-01T00:00:00Z"
    },
    "users": {
      "user_current": {
        "id": "user_current",
        "screenName": "李小明",
        "handle": "lixiaoming",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=lixiaoming",
        "coverImage": "",
        "bio": "热爱生活，热爱分享",
        "location": "北京",
        "verified": false,
        "verifiedType": "none",
        "followingCount": 1,
        "followersCount": 512,
        "postsCount": 1,
        "isFollowing": false,
        "createdAt": "2019-06-01T00:00:00Z"
      },
      "user_1": {
        "id": "user_1",
        "screenName": "央视新闻",
        "handle": "cctvnews",
        "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=央视&backgroundColor=e63946",
        "coverImage": "",
        "bio": "中央广播电视总台新闻中心官方微博",
        "location": "北京",
        "verified": true,
        "verifiedType": "blue_v",
        "followingCount": 328,
        "followersCount": 15200000,
        "postsCount": 45230,
        "isFollowing": true,
        "createdAt": "2010-03-15T00:00:00Z"
      }
    },
    "posts": {
      "post_1": {
        "id": "post_1",
        "userId": "user_1",
        "text": "测试微博内容 #测试话题#",
        "images": [],
        "video": null,
        "createdAt": "2026-04-10T10:00:00Z",
        "source": "微博网页版",
        "repostCount": 0,
        "commentCount": 0,
        "likeCount": 0,
        "isLiked": false,
        "isReposted": false,
        "repostOf": null,
        "repostText": "",
        "isLongText": false,
        "topicIds": []
      }
    },
    "comments": {},
    "hotSearches": [],
    "topics": {},
    "conversations": {},
    "messages": {},
    "notifications": [],
    "ui": {
      "feedTab": "following",
      "searchQuery": "",
      "selectedPostId": null,
      "notificationUnreadCount": 0,
      "messageUnreadCount": 0
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Publish new post | `posts` gains new entry with generated id; `currentUser.postsCount` +1; `users["user_current"].postsCount` +1 |
| Like a post | `posts[postId].isLiked` toggled; `posts[postId].likeCount` +1 or -1 |
| Repost a post | `posts` gains new entry with `repostOf` set; original `posts[postId].repostCount` +1; `currentUser.postsCount` +1 |
| Delete own post | `posts[postId]` removed; `currentUser.postsCount` -1 |
| Favorite/unfavorite post | `posts[postId].isFavorited` toggled |
| Add comment on post | `comments` gains new entry; `posts[postId].commentCount` +1 |
| Like a comment | `comments[commentId].isLiked` toggled; `comments[commentId].likeCount` +1 or -1 |
| Follow a user | `users[userId].isFollowing` → true; `users[userId].followersCount` +1; `currentUser.followingCount` +1; `users["user_current"].followingCount` +1 |
| Unfollow a user | `users[userId].isFollowing` → false; `users[userId].followersCount` -1; `currentUser.followingCount` -1 |
| Switch feed tab | `ui.feedTab` → `"following"` or `"recommended"` |
| Send DM message | `messages` gains new entry; `conversations[convId].lastMessageId` updated; `conversations[convId].lastMessageAt` updated |
| Open conversation | `conversations[convId].unreadCount` → 0; `ui.messageUnreadCount` decremented |
| Open notifications page | all `notifications[i].isRead` → true; `ui.notificationUnreadCount` → 0 |
| Follow-back from notification | `users[userId].isFollowing` → true; follower/following counts updated |
| Change a setting (toggle/select) | `settings[key]` updated to new value |
| Follow a topic | `followedTopics` gains `topicId`; button changes to "已关注" |
| Unfollow a topic | `followedTopics` loses `topicId`; button reverts to "关注话题" |
| Edit profile (save) | `currentUser.screenName`, `.bio`, `.location` updated; `users["user_current"]` updated |
