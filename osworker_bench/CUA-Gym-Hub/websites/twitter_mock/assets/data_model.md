# Xwitter/X Mock — Data Model

> Used by `src/utils/mockData.js` (or `dataManager.js`) for `createInitialData()`.
> All IDs are string UUIDs. All timestamps are ISO 8601 strings.

---

## Entity Types

### 1. User

The currently logged-in user is `currentUser`. All other users are in the `users` array.

```javascript
{
  id: "u1",                           // Unique user ID
  name: "Alex Johnson",              // Display name
  handle: "alexj",                   // Username (without @)
  bio: "Software engineer & coffee lover ☕ | Building the future one line at a time",
  avatar: "https://i.pravatar.cc/150?u=u1",  // Profile photo URL
  banner: "https://picsum.photos/seed/u1banner/600/200", // Banner image URL
  location: "San Francisco, CA",
  website: "https://alexj.dev",
  joinedDate: "2020-03-15T00:00:00Z",  // When account was created
  verified: true,                       // Blue checkmark
  followers: ["u2", "u3", "u4"],       // Array of user IDs who follow this user
  following: ["u2", "u5", "u6"],       // Array of user IDs this user follows
  pinnedPostId: "p1",                   // ID of pinned post (or null)
  // Computed (do not store, derive from data):
  // followersCount, followingCount, postsCount
}
```

### 2. Post (Tweet)

Posts are the core content unit. Supports text, images, and quoted posts.

```javascript
{
  id: "p1",                            // Unique post ID
  userId: "u1",                        // Author user ID
  content: "Just shipped a new feature! 🚀 Really excited about the performance improvements we've made. #coding #webdev",
  images: [],                          // Array of image URLs (max 4)
  createdAt: "2026-02-28T10:30:00Z",  // ISO timestamp
  likes: ["u2", "u3"],                // Array of user IDs who liked
  reposts: ["u4"],                     // Array of user IDs who reposted
  replies: ["r1", "r2"],              // Array of reply IDs
  bookmarks: ["u2"],                   // Array of user IDs who bookmarked
  quotedPostId: null,                  // ID of post being quoted (or null)
  inReplyToPostId: null,               // ID of parent post if this is a reply (or null)
  inReplyToUserId: null,               // User ID of parent post author (or null)
  isPinned: false,                     // Whether pinned on author's profile
  views: 1243,                         // View count (number)
  // Not stored but relevant for display:
  // replyCount (derived from replies.length)
  // likeCount (derived from likes.length)
  // repostCount (derived from reposts.length)
}
```

### 3. Reply

Replies are structurally similar to posts but belong to a parent post. In the existing mock they are separate objects; for improved architecture, replies should just be posts with `inReplyToPostId` set. However, to maintain compatibility with existing code, keep the separate Reply entity.

```javascript
{
  id: "r1",                            // Unique reply ID
  postId: "p1",                        // Parent post ID (tweetId in existing code)
  userId: "u2",                        // Author of reply
  content: "This is awesome! Can't wait to try it out 🙌",
  createdAt: "2026-02-28T11:00:00Z",
  likes: ["u1"],                       // Users who liked this reply
  // Note: existing code uses `tweetId` instead of `postId` — normalize on merge
}
```

### 4. Notification

```javascript
{
  id: "n1",                            // Unique notification ID
  type: "like",                        // One of: "like", "repost", "follow", "reply", "mention"
  userId: "u2",                        // User who triggered the notification
  postId: "p1",                        // Related post ID (null for "follow" type)
  content: null,                       // Optional text (for reply/mention, the reply content)
  createdAt: "2026-02-28T11:05:00Z",
  read: false,                         // Whether user has seen it
}
```

### 5. DirectMessage

```javascript
{
  id: "dm1",                           // Unique message ID
  conversationId: "conv1",            // Conversation this belongs to
  senderId: "u2",                      // Who sent it
  content: "Hey, did you see the new announcement?",
  createdAt: "2026-02-28T09:00:00Z",
  read: true,                          // Whether recipient has read it
}
```

### 6. Conversation (DM thread)

```javascript
{
  id: "conv1",                         // Unique conversation ID
  participants: ["u1", "u2"],         // Array of user IDs (2 for 1:1, 2+ for group)
  lastMessageId: "dm3",               // ID of most recent message
  lastMessageAt: "2026-02-28T09:15:00Z", // Timestamp of most recent message
  isPinned: false,                     // Whether pinned in inbox
  unreadCount: 2,                      // Unread messages for currentUser
}
```

### 7. List (Xwitter List)

```javascript
{
  id: "list1",                         // Unique list ID
  name: "Tech News",                  // List name
  description: "Latest updates from tech industry leaders",
  ownerId: "u1",                      // Creator user ID
  memberIds: ["u3", "u5", "u6"],     // Array of user IDs in the list
  followerIds: [],                     // Users following this list
  isPrivate: false,                    // Whether list is private
  createdAt: "2025-06-01T00:00:00Z",
  bannerUrl: null,                     // Optional list banner
}
```

### 8. Trend

```javascript
{
  id: "t1",                            // Unique trend ID
  category: "Technology",             // Category label (e.g., "Technology · Trending")
  name: "#WebDev",                    // Trend name or hashtag
  postCount: "28.5K",                 // Display string for post volume
}
```

### 9. Bookmark

Bookmarks are tracked as arrays on individual posts (`post.bookmarks`), but we also need a top-level ordered list for the Bookmarks page.

```javascript
// Stored in state as:
bookmarkedPostIds: ["p3", "p1", "p5"]  // Ordered by most recently bookmarked first
```

---

## Relationships Diagram

```
User ─── posts ──→ Post
User ─── likes ──→ Post (via post.likes[])
User ─── reposts ──→ Post (via post.reposts[])
User ─── bookmarks ──→ Post (via post.bookmarks[] + bookmarkedPostIds[])
User ─── follows ──→ User (via user.following[] / user.followers[])
Post ─── has replies ──→ Reply[] (via post.replies[])
Post ─── quotes ──→ Post (via post.quotedPostId)
Post ─── reply to ──→ Post (via post.inReplyToPostId)
User ─── conversations ──→ Conversation (via conversation.participants[])
Conversation ─── messages ──→ DirectMessage[]
User ─── owns ──→ List (via list.ownerId)
List ─── members ──→ User[] (via list.memberIds[])
```

---

## Suggested `createInitialData()` Structure

```javascript
export function createInitialData() {
  return {
    currentUser: { /* user object for logged-in user */ },
    users: [ /* array of User objects (6-8 users) */ ],
    posts: [ /* array of Post objects (15-20 posts) */ ],
    replies: [ /* array of Reply objects (8-12 replies) */ ],
    notifications: [ /* array of Notification objects (8-12) */ ],
    conversations: [ /* array of Conversation objects (3-4) */ ],
    directMessages: [ /* array of DirectMessage objects (15-20) */ ],
    lists: [ /* array of List objects (2-3) */ ],
    trends: [ /* array of Trend objects (8-10) */ ],
    bookmarkedPostIds: [ /* array of post IDs */ ],
  };
}
```

---

## Realistic Seed Data Specifications

### Users (7 users + currentUser)

| ID | Name | Handle | Verified | Bio snippet |
|----|------|--------|----------|-------------|
| `u1` | Alex Johnson | alexj | ✅ | Software engineer, SF |
| `u2` | Sarah Chen | sarahc | ✅ | Tech journalist, NYC |
| `u3` | Mike Rivera | mikerivera | ❌ | Photographer, LA |
| `u4` | TechCrunch | techcrunch | ✅ | Breaking tech news |
| `u5` | Emma Wilson | emmaw | ❌ | UX designer, London |
| `u6` | David Park | davidpark | ✅ | Startup founder |
| `u7` | OpenAI | openai | ✅ | AI research lab |
| `u8` | Lisa Zhang | lisaz | ❌ | Data scientist |

`currentUser` = `u1` (Alex Johnson)

### Posts (18 posts)

Cover diverse scenarios:
- Text-only posts, posts with 1 image, posts with 4 images
- Post with many likes/reposts (viral), post with 0 engagement
- Post that is a reply to another post
- Quote post (quotedPostId set)
- Long post (close to 280 chars)
- Posts with #hashtags and @mentions
- Posts from various users, not just currentUser
- Post that has many replies (for thread view testing)
- Pinned post for currentUser's profile

### Replies (10 replies)

- Mix of replies from different users
- 2-3 replies on the most popular post
- 1 reply from currentUser on another user's post
- Varying lengths and engagement

### Notifications (10 notifications)

- 2 follow notifications (someone followed currentUser)
- 3 like notifications (on different posts)
- 2 repost notifications
- 2 reply notifications
- 1 mention notification
- Mix of read (true) and unread (false)

### Conversations (4 DM conversations)

| ID | Participants | Messages | Unread |
|----|-------------|----------|--------|
| conv1 | u1 + u2 | 6 messages | 2 |
| conv2 | u1 + u5 | 4 messages | 0 |
| conv3 | u1 + u6 | 3 messages | 1 |
| conv4 | u1 + u3 | 2 messages | 0 |

### Direct Messages (15 messages across conversations)

Realistic conversation flows:
- conv1: Planning a coffee meetup
- conv2: Discussing a design project
- conv3: Sharing a startup idea
- conv4: Photography tips

### Lists (2 lists owned by currentUser)

| ID | Name | Members | Private |
|----|------|---------|---------|
| list1 | Tech News | u4, u7, u6 | No |
| list2 | Close Friends | u2, u3, u5 | Yes |

### Trends (10 trending topics)

| # | Category | Name | Post Count |
|---|----------|------|------------|
| 1 | Technology · Trending | #WebDev | 28.5K |
| 2 | Trending in US | #AI | 142K |
| 3 | Sports · Trending | Super Bowl | 1.2M |
| 4 | Entertainment | #Oscars2026 | 89K |
| 5 | Technology | React 20 | 15.3K |
| 6 | Business · Trending | Startup Funding | 8.7K |
| 7 | Trending in US | Climate Action | 45.2K |
| 8 | Gaming · Trending | #GTA6 | 234K |
| 9 | Science | Mars Mission | 12.1K |
| 10 | Music · Trending | Album Drop | 67K |

---

## Data Normalization Notes (for POST /post API)

When custom state is POSTed, normalize these fields:

1. **Users**: Ensure `followers`/`following` are arrays, `verified` is boolean, default empty arrays for missing array fields
2. **Posts**: Ensure `likes`/`reposts`/`replies`/`bookmarks` are arrays, `views` is number, `images` is array
3. **Replies**: Map `tweetId` → `postId` for compatibility
4. **Notifications**: Ensure `read` is boolean, `type` is valid enum
5. **DirectMessages**: Ensure `read` is boolean
6. **Conversations**: Ensure `participants` is array, `unreadCount` is number
