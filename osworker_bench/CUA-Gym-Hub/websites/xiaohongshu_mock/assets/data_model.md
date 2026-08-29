# Yiaohongshu Mock — Data Model

> This document defines all entity types, their fields, relationships, and example values.
> The dev agent should implement `createInitialData()` in `src/utils/dataManager.js` following these structures.

---

## Entity: User

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique user ID | `"u1"` |
| `nickname` | string | Display name | `"生活美学家"` |
| `redId` | string | Yiaohongshu ID (handle) | `"lifestyle_guru"` |
| `avatar` | string | Avatar URL | `"https://i.pravatar.cc/150?u=u1"` |
| `banner` | string | Profile banner image URL | `"https://picsum.photos/seed/u1b/800/300"` |
| `bio` | string | Profile bio/description | `"分享日常美好生活 ✨ 美食 | 旅行 | 穿搭"` |
| `gender` | string | Gender: "female" / "male" / "other" | `"female"` |
| `location` | string | City/location | `"上海"` |
| `verified` | boolean | Is verified creator | `true` |
| `followingIds` | string[] | IDs of users this user follows | `["u2", "u3"]` |
| `followerIds` | string[] | IDs of followers | `["u2", "u4", "u5"]` |
| `likesAndBookmarksReceived` | number | Total likes + bookmarks on all notes | `12800` |

### Relationships
- User → Note: one-to-many (user.id === note.authorId)
- User → User: many-to-many via followingIds/followerIds
- User → Notification: one-to-many (as recipient)

---

## Entity: Note

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique note ID | `"n1"` |
| `authorId` | string | Author user ID | `"u2"` |
| `type` | string | "image" or "video" | `"image"` |
| `title` | string | Note title (1-2 lines) | `"周末探店｜藏在巷子里的咖啡馆"` |
| `content` | string | Body text with #hashtags and @mentions | `"终于找到了这家宝藏咖啡馆！\n环境超级好，特别适合拍照📸\n\n推荐他们家的拿铁和提拉米苏\n\n#咖啡探店 #周末好去处 #上海美食"` |
| `images` | string[] | Array of image URLs | `["https://picsum.photos/seed/n1a/600/800", "https://picsum.photos/seed/n1b/600/800"]` |
| `videoUrl` | string \| null | Video URL (if type=video) | `null` |
| `hashtags` | string[] | Extracted hashtag strings | `["咖啡探店", "周末好去处", "上海美食"]` |
| `location` | string \| null | Location tag | `"上海·静安区"` |
| `likedByIds` | string[] | User IDs who liked | `["u1", "u3", "u5"]` |
| `bookmarkedByIds` | string[] | User IDs who bookmarked | `["u1", "u4"]` |
| `commentCount` | number | Cached comment count | `15` |
| `shareCount` | number | Share count | `3` |
| `isPinned` | boolean | Pinned to author's profile | `false` |
| `createdAt` | number | Timestamp (ms since epoch) | `1712600000000` |
| `category` | string | Content category | `"美食"` |

### Relationships
- Note → User: many-to-one (note.authorId → user.id)
- Note → Comment: one-to-many (comment.noteId === note.id)
- Note → Topic: many-to-many via hashtags

---

## Entity: Comment

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique comment ID | `"c1"` |
| `noteId` | string | Parent note ID | `"n1"` |
| `authorId` | string | Comment author user ID | `"u3"` |
| `content` | string | Comment text | `"环境看起来好棒！求地址🙏"` |
| `likedByIds` | string[] | User IDs who liked this comment | `["u1"]` |
| `parentCommentId` | string \| null | ID of parent comment (for replies) | `null` |
| `createdAt` | number | Timestamp | `1712650000000` |

### Relationships
- Comment → Note: many-to-one
- Comment → User: many-to-one (authorId)
- Comment → Comment: self-referential (parentCommentId for replies, 1 level deep)

---

## Entity: Notification

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique notification ID | `"notif1"` |
| `recipientId` | string | User who receives this | `"u1"` |
| `actorId` | string | User who triggered | `"u3"` |
| `type` | string | "like" / "bookmark" / "follow" / "comment" / "reply" | `"like"` |
| `noteId` | string \| null | Related note (for like/comment/bookmark) | `"n1"` |
| `commentId` | string \| null | Related comment (for reply) | `null` |
| `isRead` | boolean | Has the user seen this | `false` |
| `createdAt` | number | Timestamp | `1712700000000` |

---

## Entity: Conversation

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique conversation ID | `"conv1"` |
| `participantIds` | string[] | Exactly 2 user IDs | `["u1", "u2"]` |
| `lastMessagePreview` | string | Truncated last message text | `"好的，明天见！"` |
| `lastMessageAt` | number | Timestamp of last message | `1712690000000` |
| `unreadCount` | number | Unread messages for current user | `2` |

---

## Entity: Message

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique message ID | `"msg1"` |
| `conversationId` | string | Parent conversation ID | `"conv1"` |
| `senderId` | string | Sender user ID | `"u2"` |
| `content` | string | Message text | `"你好！看到你发的那篇笔记了，写得好好！"` |
| `type` | string | "text" / "image" / "note_share" | `"text"` |
| `imageUrl` | string \| null | Image URL (if type=image) | `null` |
| `sharedNoteId` | string \| null | Shared note ID (if type=note_share) | `null` |
| `createdAt` | number | Timestamp | `1712680000000` |

---

## Entity: Topic (Hashtag)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique topic ID | `"t1"` |
| `name` | string | Hashtag text (without #) | `"咖啡探店"` |
| `noteCount` | number | Number of notes using this topic | `5200` |
| `viewCount` | number | Total views | `1200000` |

---

## Categories (Static)

Used for the category tabs on the explore page:

```js
const CATEGORIES = [
  { id: "all", label: "推荐", icon: null },       // Recommended (default)
  { id: "food", label: "美食", icon: "🍜" },       // Food
  { id: "travel", label: "旅行", icon: "✈️" },     // Travel
  { id: "beauty", label: "美妆", icon: "💄" },     // Beauty/Makeup
  { id: "fashion", label: "穿搭", icon: "👗" },    // Fashion/Outfit
  { id: "fitness", label: "健身", icon: "💪" },     // Fitness
  { id: "home", label: "家居", icon: "🏠" },       // Home Decor
  { id: "digital", label: "数码", icon: "📱" },    // Digital/Tech
  { id: "study", label: "学习", icon: "📚" },      // Study
  { id: "pets", label: "萌宠", icon: "🐱" },       // Pets
];
```

---

## Suggested `createInitialData()` Structure

```js
function createInitialData() {
  return {
    currentUserId: "u1",
    users: { u1: {...}, u2: {...}, ... },          // 8-10 users
    notes: { n1: {...}, n2: {...}, ... },           // 20-25 notes across categories
    comments: { c1: {...}, c2: {...}, ... },        // 30-40 comments with some replies
    notifications: { notif1: {...}, ... },          // 15-20 notifications for current user
    conversations: { conv1: {...}, ... },           // 3-4 conversations
    messages: { msg1: {...}, ... },                 // 15-20 messages across conversations
    topics: { t1: {...}, t2: {...}, ... },          // 10-15 trending topics
  };
}
```

### Seed Data Requirements

**Users (8-10)**:
- `u1`: Current user — "生活美学家" — lifestyle blogger, female, 上海, ~500 followers, verified
- `u2`: "美食达人小林" — food blogger, female, 北京, ~2000 followers
- `u3`: "旅行摄影师Leo" — travel photographer, male, 广州, ~8000 followers, verified
- `u4`: "穿搭日记本" — fashion blogger, female, 杭州, ~1200 followers
- `u5`: "健身教练Amy" — fitness coach, female, 深圳, ~3500 followers, verified
- `u6`: "咖啡与书" — lifestyle, male, 成都, ~600 followers
- `u7`: "家居设计师Mia" — home decor, female, 上海, ~4200 followers
- `u8`: "数码测评君" — tech reviewer, male, 北京, ~1800 followers

**Notes (20-25)**: Mix of categories, some with multiple images. Titles and content in Chinese. Include notes from various users. Current user (u1) should have 4-5 published notes. Some notes should have many likes (1000+) and some few (10-50) for realistic variety.

**Comments (30-40)**: Distributed across notes. Include some reply chains. Mix of short reactions ("太好看了！", "收藏了") and longer substantive comments. Some comments by current user.

**Notifications (15-20)**: For current user. Mix of likes, bookmarks, follows, comments. Some read, some unread (5-8 unread).

**Conversations (3-4)**: Between current user and others. Include varied message types.

**Messages (15-20)**: Realistic chat exchanges in Chinese.

**Topics (10-15)**: Match the hashtags used in notes. Include view/note counts.
