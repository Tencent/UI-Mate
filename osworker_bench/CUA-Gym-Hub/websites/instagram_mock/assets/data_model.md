# Xnstagram Mock — Data Model

> Last updated: 2025-03-09 by plan agent
> Used by: `src/utils/mockData.js` → `generateInitialData()`

## Entity Types

### 1. Users

Keyed by `userId` in an object (not array). Each user represents an Xnstagram account.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique user ID | `"user_admin"` |
| `username` | string | Unique handle (no spaces, lowercase) | `"alex_morgan"` |
| `name` | string | Display name | `"Alex Morgan"` |
| `avatar` | string | URL to profile picture | `"https://picsum.photos/150/150?random=1"` |
| `bio` | string | Profile bio (supports newlines, emojis) | `"Photographer 📸\nSF, CA"` |
| `website` | string | Optional website URL | `"https://alexmorgan.com"` |
| `followers` | string[] | Array of user IDs who follow this user | `["user_2", "user_3"]` |
| `following` | string[] | Array of user IDs this user follows | `["user_2", "user_4"]` |
| `isVerified` | boolean | Blue checkmark badge | `false` |
| `isPrivate` | boolean | Private account (for display only) | `false` |

**Current user**: `CURRENT_USER_ID = "user_admin"` — the pre-logged-in user.

### 2. Posts

Array of post objects, sorted newest-first. Each post is an image/carousel post.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique post ID | `"post_1"` |
| `userId` | string | Author's user ID | `"user_2"` |
| `images` | string[] | Array of image URLs (1=single, 2+=carousel) | `["https://picsum.photos/800/800?random=101"]` |
| `caption` | string | Post caption with hashtags/mentions | `"Beautiful sunset! 🌅 #nature @friend"` |
| `location` | string | Optional location tag | `"San Francisco, CA"` |
| `likes` | string[] | Array of user IDs who liked this post | `["user_admin", "user_3"]` |
| `comments` | Comment[] | Array of comment objects (see §Comments) | `[...]` |
| `saved` | string[] | Array of user IDs who saved/bookmarked this post | `["user_admin"]` |
| `created` | string | ISO 8601 timestamp | `"2025-03-09T10:30:00.000Z"` |

### 3. Comments

Nested within `post.comments[]`. Each comment belongs to a post.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique comment ID | `"c_1"` |
| `userId` | string | Commenter's user ID | `"user_3"` |
| `text` | string | Comment text | `"Amazing shot! 🔥"` |
| `likes` | string[] | Array of user IDs who liked this comment | `["user_admin"]` |
| `created` | string | ISO 8601 timestamp | `"2025-03-09T10:45:00.000Z"` |

### 4. Stories

Array of story objects. Each story is a single image that expires after 24 hours.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique story ID | `"story_1"` |
| `userId` | string | Creator's user ID | `"user_2"` |
| `image` | string | URL to story image | `"https://picsum.photos/400/700?random=201"` |
| `created` | string | ISO 8601 timestamp (when posted) | `"2025-03-09T08:00:00.000Z"` |
| `expires` | string | ISO 8601 timestamp (24h from created) | `"2025-03-10T08:00:00.000Z"` |
| `viewed` | boolean | Whether current user has viewed this story | `false` |

### 5. Notifications

Array of notification objects for the activity feed.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique notification ID | `"notif_1"` |
| `type` | string | One of: `"like"`, `"comment"`, `"follow"`, `"mention"`, `"like_comment"` | `"like"` |
| `fromUserId` | string | User who triggered the notification | `"user_2"` |
| `postId` | string\|null | Related post ID (if applicable) | `"post_1"` |
| `commentId` | string\|null | Related comment ID (for comment/like_comment types) | `"c_1"` |
| `text` | string | Preview text (e.g., comment text snippet) | `"liked your photo."` |
| `read` | boolean | Whether notification has been read | `false` |
| `created` | string | ISO 8601 timestamp | `"2025-03-09T11:00:00.000Z"` |

### 6. Conversations (Direct Messages)

Array of conversation objects representing DM threads.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique conversation ID | `"conv_1"` |
| `participants` | string[] | Array of user IDs in this conversation | `["user_admin", "user_2"]` |
| `lastMessage` | string | Preview of last message | `"Hey, how are you?"` |
| `lastMessageTime` | string | ISO 8601 timestamp of last message | `"2025-03-09T10:00:00.000Z"` |
| `unreadCount` | number | Number of unread messages for current user | `2` |

### 7. Messages

Array of message objects belonging to conversations.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique message ID | `"msg_1"` |
| `conversationId` | string | Parent conversation ID | `"conv_1"` |
| `senderId` | string | Sender's user ID | `"user_2"` |
| `text` | string | Message text content | `"Hey, how are you?"` |
| `type` | string | One of: `"text"`, `"image"`, `"post_share"` | `"text"` |
| `imageUrl` | string\|null | Image URL if type is "image" | `null` |
| `sharedPostId` | string\|null | Post ID if type is "post_share" | `null` |
| `created` | string | ISO 8601 timestamp | `"2025-03-09T09:55:00.000Z"` |

### 8. Saved Post IDs

Simple array tracking which posts the current user has bookmarked.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `savedPostIds` | string[] | Array of saved post IDs | `["post_1", "post_3"]` |

## Entity Relationships

```
User ──< Post (userId → user.id)
User ──< Story (userId → user.id)
User ──< Notification (fromUserId → user.id)
Post ──< Comment (nested in post.comments[])
Post ──< Like (post.likes[] contains user IDs)
Comment ──< Like (comment.likes[] contains user IDs)
User ──< Conversation (conversations.participants[] → user.id)
Conversation ──< Message (conversationId → conversation.id)
User >──< User (followers/following bidirectional)
```

## Suggested `createInitialData()` Structure

```javascript
export const generateInitialData = () => {
  return {
    users: {
      // 8 users including current user
      [CURRENT_USER_ID]: { ... },
      'user_2': { ... },
      // ... user_3 through user_8
    },
    posts: [
      // 12-15 posts covering various scenarios:
      // - Posts by current user (for own profile)
      // - Posts by followed users (for feed)
      // - Posts by unfollowed users (for explore)
      // - Single image posts
      // - Carousel posts (2-5 images)
      // - Posts with many comments
      // - Posts with no comments
      // - Posts with various like counts
      // - Posts with locations
      // - Posts with hashtags and mentions in captions
    ],
    stories: [
      // 6-8 stories from different users
      // - Current user's story
      // - Multiple stories from same user (to test story grouping)
      // - Mix of viewed and unviewed
    ],
    notifications: [
      // 10-15 notifications covering all types:
      // - like, comment, follow, mention, like_comment
      // - Mix of read/unread
      // - Various timestamps (minutes, hours, days ago)
    ],
    conversations: [
      // 4-5 conversations
      // - Active conversation with recent messages
      // - Group-like conversation (3 participants)
      // - Old conversation with no unread
      // - Conversation with unread messages
    ],
    messages: [
      // 20-30 messages across conversations
      // - Text messages
      // - Image message
      // - Shared post message
      // - Various senders (not just current user)
    ],
    savedPostIds: [
      // 2-3 saved post IDs
    ]
  };
};
```

## Seed Data Requirements (Specific Scenarios)

### Users (8 total)
1. **user_admin** — "alex_morgan" — The current user. Has posts, followers, following. Bio includes emoji and newline.
2. **user_2** — "adventure_seeker" / "Alice Walker" — Travel photographer. Multiple posts, active stories.
3. **user_3** — "tech_guru" / "Bob Chen" — Tech content. Follows current user.
4. **user_4** — "design_daily" / "Sarah Kim" — Designer. Not followed by current user (shows in suggestions).
5. **user_5** — "foodie_life" / "Chef Marco" — Food content. Has stories.
6. **user_6** — "nature_lover" / "Emma Green" — Outdoors. Not followed by current user.
7. **user_7** — "fitness_coach" / "Jake Thompson" — Fitness. Has verification badge.
8. **user_8** — "artsy_vibes" / "Mia Chen" — Art/illustration. Has stories, not followed.

### Posts (15 total)
- Posts from followed users: 8 (appear in feed)
- Posts from current user: 3 (appear in own profile)
- Posts from unfollowed users: 4 (appear in explore)
- Carousel posts (multi-image): 3-4
- Posts with location: ~8
- Posts with hashtags: ~10
- Posts with mentions: ~3
- Posts with 0 comments: 3
- Posts with 1-3 comments: 8
- Posts with 5+ comments: 2

### Stories (8 total)
- Current user: 1 story
- user_2: 2 stories (tests story grouping)
- user_3: 1 story
- user_5: 2 stories
- user_7: 1 story
- user_8: 1 story
- Viewed: 2, Unviewed: 6

### Notifications (12 total)
- "like" type: 3 (various posts)
- "comment" type: 3
- "follow" type: 2
- "mention" type: 2
- "like_comment" type: 2
- Unread: 5, Read: 7
- Timestamps: mix from 5 min ago to 3 days ago

### Conversations (5 total)
- user_2: Active chat, 0 unread
- user_3: 2 unread messages
- user_5: Old conversation, 0 unread
- user_7: New conversation, 1 unread
- Group: user_2 + user_3, 0 unread

### Messages (25 total)
- Mix of sent (from current user) and received
- Mostly text type
- 2 image messages
- 1 post_share message
- Conversations should have 3-8 messages each
