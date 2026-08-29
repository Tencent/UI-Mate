# Xeddit Mock — Data Model

> For `src/lib/initialData.js` `createInitialData()` structure.
> All entity types, fields, relationships, and realistic example values.

---

## Entity Types

### §CurrentUser (Logged-in user — always present)

```js
currentUser: {
  id: "u1",                                    // String, unique user ID
  username: "redditor_42",                      // String, display name
  avatar: "https://picsum.photos/100/100?random=u1", // String, avatar URL
  postKarma: 3450,                              // Number, karma from posts
  commentKarma: 8920,                           // Number, karma from comments
  cakeDay: "2021-03-15T00:00:00.000Z",         // String (ISO), account creation date
  about: "Just a regular redditor. I love tech, gaming, and cats.", // String, bio
  joinedSubreddits: ["s1", "s2", "s3", "s4", "s5", "s6"], // String[], subscribed subreddit IDs
  savedPosts: [],                               // String[], saved post IDs
  savedComments: [],                            // String[], saved comment IDs
  hiddenPosts: [],                              // String[], hidden post IDs
}
```

### §Users (All users in the system including currentUser)

```js
users: [
  {
    id: "u1",                                   // String, unique ID
    username: "redditor_42",                     // String, display name
    avatar: "https://picsum.photos/100/100?random=u1", // String, avatar URL
    postKarma: 3450,                            // Number
    commentKarma: 8920,                         // Number
    cakeDay: "2021-03-15T00:00:00.000Z",        // String (ISO)
    about: "Just a regular redditor.",           // String, user bio
  },
  // ... more users
]
```

**Suggested seed users (8 total):**
| id | username | postKarma | commentKarma | about |
|----|----------|-----------|-------------|-------|
| u1 | redditor_42 | 3,450 | 8,920 | "Just a regular redditor. I love tech, gaming, and cats." |
| u2 | tech_guru_99 | 45,200 | 12,800 | "Software engineer by day, hardware enthusiast by night." |
| u3 | astro_nerd | 22,100 | 31,500 | "PhD candidate in astrophysics. Space is cool." |
| u4 | pixel_artist | 89,400 | 5,600 | "Digital artist and game designer. Portfolio in pinned post." |
| u5 | history_buff | 15,700 | 42,300 | "History teacher. Ask me about ancient Rome!" |
| u6 | code_monkey | 8,900 | 19,200 | "Full-stack dev. Rust evangelist. Coffee addict." |
| u7 | nature_lover | 67,300 | 3,200 | "Wildlife photographer. National Geographic contributor." |
| u8 | debate_champion | 2,100 | 55,800 | "Philosophy grad. I argue for fun." |

### §Subreddits

```js
subreddits: [
  {
    id: "s1",                                   // String, unique ID
    name: "technology",                          // String, subreddit name (no r/ prefix)
    description: "Subreddit dedicated to the news and discussions about the creation and use of technology.", // String
    icon: "https://picsum.photos/64/64?random=s1", // String, community icon URL
    bannerColor: "#0079D3",                     // String (hex), banner background color
    members: 14500000,                          // Number, subscriber count
    online: 12000,                              // Number, currently online
    created: "2008-01-25T00:00:00.000Z",        // String (ISO), community creation date
    rules: [                                    // String[], community rules
      "Submissions must be about technology",
      "No images, audio, or video",
      "Titles must be from the article",
      "No personal attacks",
      "No self-promotion or spam"
    ],
    moderators: ["u2", "u5"],                   // String[], user IDs of moderators
    flairs: [                                   // Object[], available post flairs
      { id: "f1", text: "Discussion", color: "#0079D3", bgColor: "#E3F2FD" },
      { id: "f2", text: "News", color: "#FF4500", bgColor: "#FFF3E0" },
      { id: "f3", text: "Software", color: "#46D160", bgColor: "#E8F5E9" },
      { id: "f4", text: "Hardware", color: "#9C27B0", bgColor: "#F3E5F5" }
    ]
  },
  // ... more subreddits
]
```

**Suggested seed subreddits (6 total):**
| id | name | members | online | bannerColor | flairs |
|----|------|---------|--------|-------------|--------|
| s1 | technology | 14.5M | 12K | #0079D3 | Discussion, News, Software, Hardware |
| s2 | funny | 45M | 85K | #FF4500 | Meme, OC, Repost, Wholesome |
| s3 | programming | 5.2M | 4.5K | #1DB954 | Question, Show & Tell, Article, Tutorial |
| s4 | science | 31M | 22K | #7B1FA2 | Biology, Physics, Chemistry, Research |
| s5 | gaming | 38M | 95K | #E91E63 | Discussion, Screenshot, News, Review |
| s6 | AskReddit | 42M | 110K | #FF6F00 | Serious, Discussion, Stories, Advice |

### §Posts

```js
posts: [
  {
    id: "p1",                                   // String, unique ID
    subredditId: "s1",                          // String, parent subreddit ID
    userId: "u2",                               // String, author user ID
    title: "The future of AI is here, and it's changing everything", // String, max 300 chars
    content: "Artificial Intelligence has made massive strides...", // String, body text (for text posts)
    type: "text",                               // String: "text" | "image" | "link" | "poll"
    url: null,                                  // String | null, external URL (for image/link posts)
    flairId: "f1",                              // String | null, post flair ID from subreddit.flairs
    upvotes: 14500,                             // Number
    downvotes: 230,                             // Number
    created: "2026-03-02T14:00:00.000Z",        // String (ISO), creation timestamp
    isStickied: false,                          // Boolean, pinned at top of subreddit
    isLocked: false,                            // Boolean, comments disabled
    isSpoiler: false,                           // Boolean, content hidden behind spoiler warning
    isNSFW: false,                              // Boolean, NSFW content flag
    commentIds: ["c1", "c2"],                   // String[], top-level + nested comment IDs on this post
    awards: [],                                 // String[], award IDs given to this post
  },
  // ... more posts
]
```

**Suggested seed posts (12+ total):**
- 2 stickied posts (one per active subreddit)
- 3 text posts with substantial body content
- 3 image posts (use picsum.photos URLs)
- 2 link posts (pointing to realistic external URLs like rust-lang.org, arxiv.org)
- 1 poll post
- 1 locked post
- Mix of flairs across subreddits
- Vote counts ranging from 5 to 45,000
- Created timestamps spanning last 48 hours (use `Date.now() - X` pattern)
- At least 2 posts by currentUser (u1) for edit/delete testing

### §Comments

```js
comments: [
  {
    id: "c1",                                   // String, unique ID
    postId: "p1",                               // String, parent post ID
    parentId: null,                             // String | null, parent comment ID (null = top-level)
    userId: "u3",                               // String, author user ID
    content: "I'm honestly a bit terrified but also excited.", // String, comment text
    upvotes: 500,                               // Number
    downvotes: 10,                              // Number
    created: "2026-03-02T14:30:00.000Z",        // String (ISO)
    isEdited: false,                            // Boolean, has been edited
    isDistinguished: false,                     // Boolean, moderator/admin distinguished
    awards: [],                                 // String[], award IDs
  },
  // ... more comments
]
```

**Note:** Nesting is determined by `parentId`. To find replies to comment "c1", filter comments where `parentId === "c1"`. The `commentIds` array on posts lists all comment IDs (flat), while the tree structure is reconstructed by parentId relationships.

**Suggested seed comments (25+ total):**
- 3-4 top-level comments per popular post
- 2-3 nesting levels deep on some threads
- At least 2 comments by currentUser (u1) for edit/delete testing
- 1 moderator-distinguished comment
- Mix of vote counts (1 to 2000)
- Include "OP" responses (post author commenting on their own post)
- Timestamps after their parent post/comment

### §Votes (User vote tracking)

```js
votes: [
  {
    id: "v1",                                   // String, unique ID
    userId: "u1",                               // String, who voted
    targetId: "p1",                             // String, post or comment ID
    targetType: "post",                         // String: "post" | "comment"
    value: 1,                                   // Number: 1 (upvote) | -1 (downvote)
  },
  // ... more votes
]
```

Pre-populate with 5-10 votes by currentUser on various posts/comments so the UI shows some items already voted on.

### §Awards (Available award types)

```js
awards: [
  { id: "silver", name: "Silver", icon: "🥈", cost: 100 },
  { id: "gold", name: "Gold", icon: "🥇", cost: 500 },
  { id: "platinum", name: "Platinum", icon: "💎", cost: 1800 },
  { id: "wholesome", name: "Wholesome", icon: "🦭", cost: 125 },
  { id: "helpful", name: "Helpful", icon: "🤝", cost: 150 },
  { id: "hugz", name: "Hugz", icon: "🐻", cost: 80 },
  { id: "rocket", name: "Rocket Like", icon: "🚀", cost: 200 },
  { id: "mind_blown", name: "Mind Blown", icon: "🤯", cost: 250 },
]
```

### §Notifications

```js
notifications: [
  {
    id: "n1",                                   // String, unique ID
    type: "reply",                              // String: "reply" | "mention" | "upvote" | "award" | "post_reply"
    fromUserId: "u3",                           // String, who triggered it
    postId: "p1",                               // String | null, related post
    commentId: "c1",                            // String | null, related comment
    content: "astro_nerd replied to your comment in 'The future of AI...'", // String, notification text
    read: false,                                // Boolean, has been read
    created: "2026-03-02T15:00:00.000Z",        // String (ISO)
  },
  // ... more notifications
]
```

Seed with 5-8 notifications, mix of read/unread, various types.

---

## Relationships

```
User (1) ──posts──> (N) Post
User (1) ──writes──> (N) Comment
User (1) ──casts──> (N) Vote
Subreddit (1) ──contains──> (N) Post
Post (1) ──has──> (N) Comment (via postId)
Comment (1) ──has──> (N) Comment (via parentId, tree structure)
Post (N) ──tagged──> (1) Flair (via flairId → subreddit.flairs)
User (N) ──subscribes──> (N) Subreddit (via currentUser.joinedSubreddits)
```

---

## Suggested createInitialData() Structure

```js
const createInitialData = () => ({
  currentUser: { /* see §CurrentUser */ },
  users: [ /* 8 users, see §Users */ ],
  subreddits: [ /* 6 subreddits, see §Subreddits */ ],
  posts: [ /* 12+ posts, see §Posts */ ],
  comments: [ /* 25+ comments, see §Comments */ ],
  votes: [ /* 5-10 pre-existing votes by currentUser */ ],
  awards: [ /* 8 award types, see §Awards */ ],
  notifications: [ /* 5-8 notifications, see §Notifications */ ],
});
```

### Timestamp Strategy

All timestamps should be relative to `Date.now()` so data always feels fresh:

```js
const now = Date.now();
const HOUR = 3600000;
const DAY = 86400000;

// Post created 2 hours ago
created: new Date(now - 2 * HOUR).toISOString(),

// Comment created 1.5 hours ago
created: new Date(now - 1.5 * HOUR).toISOString(),
```

### Data Normalization (for POST API)

The `deepMergeWithDefaults()` function must normalize incoming custom state:

- **users**: Ensure `postKarma`/`commentKarma` default to 0, `about` defaults to empty string
- **subreddits**: Ensure `flairs` defaults to [], `rules` defaults to [], `moderators` defaults to []
- **posts**: Ensure `flairId` defaults to null, `isStickied`/`isLocked`/`isSpoiler`/`isNSFW` default to false, `commentIds` defaults to [], `awards` defaults to []
- **comments**: Ensure `isEdited` defaults to false, `isDistinguished` defaults to false, `awards` defaults to []
- **notifications**: Ensure `read` defaults to false
- **currentUser**: Ensure `joinedSubreddits`/`savedPosts`/`savedComments`/`hiddenPosts` default to []
