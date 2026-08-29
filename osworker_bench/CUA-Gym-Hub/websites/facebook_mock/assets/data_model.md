# Xacebook Mock — Data Model

> Last updated: 2026-03-09 by plan agent
> Source: `src/store/initialData.js`, `src/store/AppContext.jsx`

This document defines every entity type in the Xacebook mock's state. The dev agent should use this as the canonical reference when modifying `initialData.js` or `AppContext.jsx`.

---

## State Shape Overview

```javascript
{
  currentUser: User,              // The logged-in user (user_1)
  users: { [userId]: User },      // All users keyed by ID
  friendRequests: FriendRequest[], // Pending friend requests TO currentUser
  groups: Group[],                // Groups the user belongs to or can discover
  pages: Page[],                  // Xacebook Pages
  posts: Post[],                  // All posts (feed, group, page)
  notifications: Notification[],  // Activity notifications
  // NEW entities to add:
  marketplace: MarketplaceListing[], // Marketplace product listings — ADD
  events: Event[],                // Events — ADD
  stories: Story[],               // Stories — ADD
  savedItems: SavedItem[],        // Saved posts/items — ADD
  messages: { [conversationId]: Message[] }, // Chat messages — ADD
}
```

---

## §User

```typescript
interface User {
  id: string;              // Format: "user_1", "user_2", ...
  name: string;            // Full display name
  avatar: string;          // URL to avatar image (40px circle in feed, 168px on profile)
  cover: string;           // URL to cover photo (1200x400)
  bio: string;             // Short bio/tagline
  friends: string[];       // Array of user IDs
  // Fields to ADD:
  location?: string;       // "San Francisco, CA" — NOT YET IN SCHEMA, ADD
  workplace?: string;      // "Tech Corp" — NOT YET IN SCHEMA, ADD
  education?: string;      // "MIT" — NOT YET IN SCHEMA, ADD
  joinedDate?: string;     // ISO date "2020-01-15" — NOT YET IN SCHEMA, ADD
  relationship?: string;   // "Single", "In a Relationship", "Married" — NOT YET IN SCHEMA, ADD
  online?: boolean;        // Online status for contacts sidebar — NOT YET IN SCHEMA, ADD
}
```

**Default entries (6 total):**

| id | name | bio | friends |
|----|------|-----|---------|
| user_1 | Admin User | Software Engineer \| Coffee Lover \| Traveler | [user_2, user_3, user_4] |
| user_2 | Jane Doe | Digital Artist | [user_1] |
| user_3 | John Smith | Photographer | [user_1] |
| user_4 | Sarah Wilson | Travel Blogger | [user_1] |
| user_5 | Mike Brown | Chef | [] |
| user_6 | Emily Davis | Designer | [] |

**Enhancements needed:**
- Add `location`, `workplace`, `education`, `joinedDate` to each user for Profile About section
- Add `online: true/false` to each user for Contacts sidebar
- Add 2-4 more users for a richer contacts list and more diverse feed

---

## §Post

```typescript
interface Post {
  id: string;              // Format: "post_1", "post_g1" (group), "post_p1" (page)
  userId?: string;         // Author user ID (for personal/group posts)
  pageId?: string;         // Author page ID (for page posts)
  groupId?: string;        // Group this post belongs to (for group posts)
  content: string;         // Text content of the post
  type: PostType;          // "status" | "photo" | "video" | "link" | "life_event"
  image?: string;          // Image URL (for photo posts)
  video?: string;          // Video URL (for video posts)
  link?: LinkPreview;      // Link preview object
  likes: string[];         // Array of user IDs who liked (legacy — kept for backward compat)
  reactions: Reaction[];   // Array of reaction objects
  comments: Comment[];     // Array of comment objects
  timestamp: number;       // Date.now() - offset in ms
  // Fields to ADD:
  privacy?: string;        // "public" | "friends" | "only_me" — NOT YET IN SCHEMA, ADD
  feeling?: string;        // "happy" | "sad" | "excited" etc. — NOT YET IN SCHEMA, ADD
  edited?: boolean;        // Whether post was edited — NOT YET IN SCHEMA, ADD
  shares?: number;         // Share count — NOT YET IN SCHEMA, ADD
}

type PostType = "status" | "photo" | "video" | "link" | "life_event";

interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string;
}

interface Reaction {
  userId: string;
  type: ReactionType;
}

type ReactionType = "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry";
```

**Default entries (7 total):**

| id | author | type | content summary | reactions |
|----|--------|------|-----------------|-----------|
| post_1 | user_2 | photo | Digital art piece | 2 (love, like) |
| post_2 | user_3 | photo | Sunset at beach | 3 (wow, like, love) |
| post_3 | user_1 | life_event | New job at Tech Corp | 3 (care, like, wow) |
| post_4 | user_4 | link | React article | 0 |
| post_5 | user_2 | video | Painting timelapse | 1 (like) |
| post_g1 | user_2 (group_1) | status | React Server Components question | 0 |
| post_p1 | page_1 | photo | AI news breaking | 0 |

**Enhancements needed:**
- Add `privacy` field (default "friends") to each post
- Add `shares` field (default 0)
- Add 5-8 more posts for richer feed content
- Include at least 1 post with feeling/activity
- Include at least 1 post with multiple images (photo album style)

---

## §Comment

```typescript
interface Comment {
  id: string;              // Format: "c1", "c2", ...
  userId: string;          // Author user ID
  content: string;         // Comment text
  timestamp: number;       // Date.now() - offset
  replies: Comment[];      // Nested replies (same structure, max 1 level deep)
  // Fields to ADD:
  likes?: string[];        // User IDs who liked this comment — NOT YET IN SCHEMA, ADD
  edited?: boolean;        // Whether comment was edited — NOT YET IN SCHEMA, ADD
}
```

**Default entries**: 1 comment on post_1 from user_1

**Enhancements needed:**
- Add `likes` array to comments for comment liking functionality
- Add more comments across posts (aim for 3-5 comments total)
- Add at least 1 reply to a comment

---

## §FriendRequest

```typescript
interface FriendRequest {
  id: string;              // The requesting user's ID
  timestamp: number;       // When the request was sent
  // Fields to ADD:
  mutualFriends?: number;  // Count of mutual friends — NOT YET IN SCHEMA, ADD
}
```

**Default entries (2 total):**

| id (userId) | timestamp |
|-------------|-----------|
| user_5 (Mike Brown) | 1 hour ago |
| user_6 (Emily Davis) | 2 hours ago |

---

## §Group

```typescript
interface Group {
  id: string;              // Format: "group_1", "group_2"
  name: string;            // Group name
  cover: string;           // Cover image URL
  members: string[];       // Array of user IDs
  description: string;     // Group description
  posts: string[];         // Array of post IDs in this group
  // Fields to ADD:
  privacy?: string;        // "public" | "private" — NOT YET IN SCHEMA, ADD
  category?: string;       // "Technology", "Art", "Sports" — NOT YET IN SCHEMA, ADD
  createdBy?: string;      // Creator user ID — NOT YET IN SCHEMA, ADD
  rules?: string[];        // Group rules — NOT YET IN SCHEMA, ADD
}
```

**Default entries (2 total):**

| id | name | members | posts |
|----|------|---------|-------|
| group_1 | React Developers | [user_1, user_2, user_4] | [post_g1] |
| group_2 | Digital Art Community | [user_1, user_2] | [] |

**Enhancements needed:**
- Add `privacy`, `category`, `createdBy` to each group
- Add 2-3 more groups for variety
- Add more posts to groups

---

## §Page

```typescript
interface Page {
  id: string;              // Format: "page_1"
  name: string;            // Page name
  avatar: string;          // Page avatar URL
  cover: string;           // Page cover image URL
  description: string;     // Page description
  followers: string[];     // User IDs of followers
  reviews: Review[];       // Page reviews
  posts: string[];         // Post IDs belonging to this page
  // Fields to ADD:
  category?: string;       // "News", "Technology", "Food" — NOT YET IN SCHEMA, ADD
  website?: string;        // Page website URL — NOT YET IN SCHEMA, ADD
  phone?: string;          // Contact phone — NOT YET IN SCHEMA, ADD
  address?: string;        // Physical address — NOT YET IN SCHEMA, ADD
  isLiked?: boolean;       // Whether currentUser likes this page — NOT YET IN SCHEMA, ADD
}

interface Review {
  id: string;
  userId: string;
  rating: number;          // 1-5 stars
  content: string;
  timestamp: number;
}
```

**Default entries (1 total):**

| id | name | followers | reviews |
|----|------|-----------|---------|
| page_1 | Tech News Daily | [user_1, user_3] | 1 review (5 stars from user_2) |

**Enhancements needed:**
- Add `category`, `website`, `isLiked` fields
- Add 2-3 more pages for sidebar shortcuts and richer browsing

---

## §Notification

```typescript
interface Notification {
  id: string;              // Format: "n1", "n2"
  type: NotificationType;  // "like" | "comment" | "friend_request" | "share" | "mention" | "group" | "page" | "event"
  userId: string;          // User who triggered the notification
  content: string;         // Description text
  read: boolean;           // Whether user has seen it
  timestamp: number;       // When it occurred
  // Fields to ADD:
  postId?: string;         // Related post ID — NOT YET IN SCHEMA, ADD
  groupId?: string;        // Related group ID — NOT YET IN SCHEMA, ADD
  pageId?: string;         // Related page ID — NOT YET IN SCHEMA, ADD
}

type NotificationType = "like" | "comment" | "friend_request" | "share" | "mention" | "group" | "page" | "event";
```

**Default entries (2 total):**

| id | type | from | content | read |
|----|------|------|---------|------|
| n1 | like | user_2 | liked your post | false |
| n2 | comment | user_3 | commented on your photo | true |

**Enhancements needed:**
- Add 5-8 more notifications covering different types
- Add `postId` for linking to source content
- Include friend_request, share, mention, and group notification types

---

## §MarketplaceListing — NEW ENTITY

```typescript
interface MarketplaceListing {
  id: string;              // Format: "listing_1", "listing_2"
  sellerId: string;        // User ID of the seller
  title: string;           // Item title
  description: string;     // Item description
  price: number;           // Price in USD (0 = Free)
  currency: string;        // "USD"
  category: MarketplaceCategory;
  condition: string;       // "New" | "Used - Like New" | "Used - Good" | "Used - Fair"
  images: string[];        // Array of image URLs
  location: string;        // City, State
  listed: number;          // Timestamp when listed
  saved?: boolean;         // Whether currentUser saved this listing
}

type MarketplaceCategory = "vehicles" | "property" | "apparel" | "electronics" | "entertainment" | "family" | "garden" | "hobbies" | "home_goods" | "sports" | "toys" | "free";
```

**Suggested initial data (8-10 listings):** Mix of electronics, furniture, vehicles, apparel across different price points and conditions.

---

## §Story — NEW ENTITY

```typescript
interface Story {
  id: string;              // Format: "story_1"
  userId: string;          // Author user ID
  image: string;           // Story image URL
  timestamp: number;       // When posted (stories expire after 24h)
  viewed?: boolean;        // Whether currentUser has viewed it
}
```

**Suggested initial data (4-5 stories):** One per friend, with different images.

---

## §Event — NEW ENTITY

```typescript
interface Event {
  id: string;              // Format: "event_1"
  name: string;            // Event title
  description: string;     // Event description
  cover: string;           // Cover image URL
  hostId: string;          // User or Page ID hosting
  date: string;            // ISO date "2026-03-15T18:00:00Z"
  endDate?: string;        // ISO end date
  location: string;        // Venue name / address
  interested: string[];    // User IDs interested
  going: string[];         // User IDs going
  category: string;        // "social" | "music" | "sports" | "education" | "networking"
}
```

**Suggested initial data (3-4 events):** Mix of upcoming social, professional, and community events.

---

## §SavedItem — NEW ENTITY

```typescript
interface SavedItem {
  id: string;              // Format: "saved_1"
  type: "post" | "listing" | "event" | "link";
  referenceId: string;     // ID of the saved item
  savedAt: number;         // Timestamp
  collection?: string;     // Optional collection name
}
```

**Suggested initial data (2-3 saved items):** A saved post and a saved marketplace listing.

---

## §Message — NEW ENTITY

```typescript
interface Message {
  id: string;              // Format: "msg_1"
  senderId: string;        // Sender user ID
  content: string;         // Message text
  timestamp: number;       // When sent
  read: boolean;           // Whether recipient has read it
}

// Messages are keyed by conversation ID in state:
// messages: { "conv_user_2": Message[], "conv_user_3": Message[] }
```

**Suggested initial data:** 2-3 conversations with 3-5 messages each.

---

## Relationships

```
User (1) ←→ (many) Post.userId
User (1) ←→ (many) Comment.userId
User (1) ←→ (many) Reaction.userId
User (1) ←→ (many) FriendRequest.id (incoming)
User (many) ←→ (many) User.friends (bidirectional)
User (many) ←→ (many) Group.members
User (many) ←→ (many) Page.followers
Post (1) ←→ (many) Comment (embedded array)
Post (1) ←→ (many) Reaction (embedded array)
Post (optional) → (1) Group.id (via groupId)
Post (optional) → (1) Page.id (via pageId)
Group (1) ←→ (many) Post (via group.posts[])
Page (1) ←→ (many) Post (via page.posts[])
Page (1) ←→ (many) Review (embedded array)
MarketplaceListing (many) → (1) User.id (via sellerId)
Event (many) → (1) User.id (via hostId)
Message (many) → (1) User.id (via senderId)
Story (many) → (1) User.id (via userId)
Notification (many) → (1) User.id (via userId — who triggered)
```

- **Posts** are stored as a flat array; group/page posts are identified by `groupId`/`pageId` fields
- **Comments** are embedded inside posts as arrays (not separate entities)
- **Replies** are nested inside comments (max 1 level)
- **Friends** are bidirectional — both users' `friends[]` should list each other
- **Messages** are keyed by conversation partner ID: `messages["conv_user_2"]`

---

## State Shape (`createInitialData()`)

The complete state returned by `getDefaultData()` in `initialData.js`:

```javascript
{
  currentUser: {
    id: "user_1",
    name: "Admin User",
    avatar: "https://picsum.photos/100/100?random=user_1",
    cover: "https://picsum.photos/1200/400?random=cover_1",
    bio: "Software Engineer | Coffee Lover | Traveler",
    friends: ["user_2", "user_3", "user_4"],
    location: "San Francisco, CA",       // ADD
    workplace: "Tech Corp",              // ADD
    education: "Stanford University",    // ADD
    joinedDate: "2020-03-15",            // ADD
    online: true                         // ADD
  },
  users: { /* 8-10 user objects keyed by ID */ },
  friendRequests: [ /* 2-3 pending requests */ ],
  groups: [ /* 3-4 groups */ ],
  pages: [ /* 2-3 pages */ ],
  posts: [ /* 12-15 posts of various types */ ],
  notifications: [ /* 6-8 notifications */ ],
  marketplace: [ /* 8-10 listings */ ],  // ADD
  events: [ /* 3-4 events */ ],          // ADD
  stories: [ /* 4-5 stories */ ],        // ADD
  savedItems: [ /* 2-3 saved items */ ], // ADD
  messages: {                            // ADD
    "conv_user_2": [ /* 3-5 messages */ ],
    "conv_user_3": [ /* 3-5 messages */ ]
  }
}
```
