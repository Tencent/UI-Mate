# Xeibo Mock — Data Model

This document defines all entity types, their fields, relationships, and the `createInitialData()` structure for `dataManager.js`.

---

## Entity Types

### User

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique user ID | `"user_1"` |
| screenName | string | Display name (Chinese) | `"微博小助手"` |
| handle | string | @handle (English/pinyin) | `"weiboxiaozhushou"` |
| avatar | string | Avatar URL (use placeholder service) | `"https://api.dicebear.com/7.x/avataaars/svg?seed=weibo1"` |
| coverImage | string | Profile cover banner URL | `""` (can be gradient fallback) |
| bio | string | User bio/description | `"微博官方客服账号"` |
| location | string | Location | `"北京"` |
| verified | boolean | Whether user is verified | `true` |
| verifiedType | string | Verification type: `"blue_v"`, `"orange_v"`, `"gold_v"`, `"none"` | `"blue_v"` |
| followingCount | number | Number of users following | `328` |
| followersCount | number | Number of followers | `15200000` |
| postsCount | number | Number of posts | `4523` |
| isFollowing | boolean | Whether current user follows this user | `false` |
| createdAt | string | Account creation date (ISO) | `"2010-03-15T00:00:00Z"` |

### Post (微博/Status)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique post ID | `"post_1"` |
| userId | string | Author user ID | `"user_2"` |
| text | string | Post body text (supports @mentions, #hashtags#) | `"今天天气真好 #春天来了# @小明"` |
| images | string[] | Array of image URLs (0-9) | `["https://picsum.photos/400/300?random=1"]` |
| video | object\|null | Video attachment `{url, thumbnail, duration}` | `null` |
| createdAt | string | Post timestamp (ISO) | `"2026-04-10T08:30:00Z"` |
| source | string | Post source | `"微博网页版"` |
| repostCount | number | Number of reposts | `156` |
| commentCount | number | Number of comments | `89` |
| likeCount | number | Number of likes | `1203` |
| isLiked | boolean | Whether current user liked this | `false` |
| isReposted | boolean | Whether current user reposted this | `false` |
| repostOf | string\|null | ID of original post if this is a repost | `null` |
| repostText | string | Added commentary when reposting | `""` |
| isLongText | boolean | Whether text exceeds ~140 chars (show "全文" expand) | `false` |
| topicIds | string[] | Associated topic/hashtag IDs | `["topic_1"]` |

### Comment

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique comment ID | `"comment_1"` |
| postId | string | Parent post ID | `"post_1"` |
| userId | string | Commenter user ID | `"user_3"` |
| text | string | Comment text | `"说得太对了！"` |
| createdAt | string | Comment timestamp (ISO) | `"2026-04-10T09:00:00Z"` |
| likeCount | number | Number of likes on this comment | `23` |
| isLiked | boolean | Whether current user liked this comment | `false` |
| replyToId | string\|null | Parent comment ID if this is a reply | `null` |
| replyToUserId | string\|null | User being replied to | `null` |

### HotSearch (热搜)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique hot search ID | `"hot_1"` |
| rank | number | Rank position (1-50) | `1` |
| title | string | Topic/keyword text | `"春天的第一杯奶茶"` |
| searchCount | number | Search volume | `2580000` |
| category | string | Category label | `"社会"` |
| badge | string | Badge type: `"hot"` (热), `"new"` (新), `"boil"` (沸), `"recommend"` (荐), `""` | `"hot"` |
| url | string | Link to search results (internal route) | `"/search?q=春天的第一杯奶茶"` |

### Topic (话题/Hashtag)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique topic ID | `"topic_1"` |
| name | string | Topic name (without #) | `"春天来了"` |
| readCount | number | Total reads | `150000000` |
| discussionCount | number | Total discussions | `89000` |
| description | string | Topic description | `"分享春天的美好时光"` |
| hostUserId | string\|null | Topic host user (for super topics) | `null` |
| isSuperTopic | boolean | Whether this is a Super Topic (超话) | `false` |

### Message (私信)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique message ID | `"msg_1"` |
| conversationId | string | Conversation ID | `"conv_1"` |
| senderId | string | Sender user ID | `"user_1"` |
| receiverId | string | Receiver user ID | `"user_2"` |
| text | string | Message text | `"你好！"` |
| createdAt | string | Message timestamp (ISO) | `"2026-04-10T10:00:00Z"` |
| isRead | boolean | Whether message has been read | `true` |

### Conversation

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique conversation ID | `"conv_1"` |
| participantIds | string[] | User IDs in this conversation | `["user_1", "user_2"]` |
| lastMessageId | string | ID of most recent message | `"msg_3"` |
| lastMessageAt | string | Timestamp of last message | `"2026-04-10T10:00:00Z"` |
| unreadCount | number | Unread message count for current user | `2` |

### Notification

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique notification ID | `"notif_1"` |
| type | string | Type: `"like"`, `"comment"`, `"repost"`, `"follow"`, `"mention"`, `"system"` | `"like"` |
| fromUserId | string | User who triggered notification | `"user_3"` |
| postId | string\|null | Related post ID (if applicable) | `"post_1"` |
| commentId | string\|null | Related comment ID (if applicable) | `null` |
| text | string | Notification description text | `"赞了你的微博"` |
| createdAt | string | Notification timestamp (ISO) | `"2026-04-10T09:30:00Z"` |
| isRead | boolean | Whether notification has been read | `false` |

---

## Relationships

```
User 1──N Post         (user writes many posts)
User 1──N Comment      (user writes many comments)
Post  1──N Comment     (post has many comments)
Comment 1──N Comment   (comment has replies, 1 level deep)
Post  N──1 Post        (repost references original post)
User  N──N User        (following relationship, tracked via isFollowing on User)
User  1──N Conversation (user participates in conversations)
Conversation 1──N Message (conversation has many messages)
User  1──N Notification (user receives notifications)
Post  N──N Topic       (posts tagged with topics via topicIds)
```

---

## createInitialData() Structure

```javascript
export function createInitialData() {
  return {
    // Current logged-in user
    currentUser: { /* User object for "我" — id: "user_current" */ },

    // All users (including currentUser)
    users: {
      "user_current": { /* current user */ },
      "user_1": { /* verified celebrity */ },
      "user_2": { /* tech blogger */ },
      "user_3": { /* food blogger */ },
      "user_4": { /* news media account */ },
      "user_5": { /* regular user */ },
      "user_6": { /* travel blogger */ },
      "user_7": { /* sports commentator */ },
      "user_8": { /* music artist */ },
      // ... 10-15 users total
    },

    // All posts (keyed by ID, ordered by createdAt desc in feed)
    posts: {
      "post_1": { /* original post with images */ },
      "post_2": { /* text-only post with #hashtags# */ },
      "post_3": { /* repost of post_1 */ },
      "post_4": { /* long text post (isLongText: true) */ },
      "post_5": { /* post with 9 images */ },
      // ... 15-25 posts covering various scenarios
    },

    // All comments (keyed by ID)
    comments: {
      "comment_1": { postId: "post_1", /* top-level comment */ },
      "comment_2": { postId: "post_1", replyToId: "comment_1", /* reply */ },
      // ... 20-30 comments spread across posts
    },

    // Hot search items (array, ordered by rank)
    hotSearches: [
      { rank: 1, title: "...", badge: "boil", ... },
      { rank: 2, title: "...", badge: "hot", ... },
      // ... 50 items
    ],

    // Topics/hashtags
    topics: {
      "topic_1": { name: "春天来了", ... },
      // ... 10-15 topics
    },

    // Conversations and messages
    conversations: {
      "conv_1": { participantIds: ["user_current", "user_1"], ... },
      // ... 3-5 conversations
    },
    messages: {
      "msg_1": { conversationId: "conv_1", ... },
      // ... 10-20 messages
    },

    // Notifications
    notifications: [
      { type: "like", fromUserId: "user_3", postId: "post_1", ... },
      { type: "comment", fromUserId: "user_2", postId: "post_1", ... },
      { type: "follow", fromUserId: "user_5", ... },
      { type: "mention", fromUserId: "user_1", postId: "post_7", ... },
      // ... 10-15 notifications, mix of read/unread
    ],

    // UI state
    ui: {
      feedTab: "following",      // "following" | "recommended"
      searchQuery: "",
      selectedPostId: null,
      notificationUnreadCount: 5,
      messageUnreadCount: 2,
    }
  };
}
```

---

## Seed Data Scenarios (for agent training)

The seed data must cover these scenarios to enable comprehensive agent training:

1. **Variety of post types**: text-only, with 1 image, with 4 images (2x2 grid), with 9 images (3x3 grid), repost, long text
2. **Active comment threads**: at least 2 posts with 5+ comments including replies
3. **Engagement variety**: posts with 0 likes (new), posts with thousands of likes (viral), mix of liked/not-liked by current user
4. **User variety**: verified (blue/orange/gold V) and unverified users, users current user follows and doesn't follow
5. **Hot search variety**: different badge types (热/新/沸), different categories (社会/娱乐/科技/体育)
6. **Notification mix**: unread likes, comments, reposts, follows, mentions
7. **Message threads**: at least 2 conversations with multiple messages each, some unread
8. **Hashtag usage**: posts using #topic# format, topics that appear in multiple posts
9. **Repost chains**: at least one repost-of-repost scenario
10. **Chinese content**: All text content should be in Chinese (Simplified) to match real Xeibo
