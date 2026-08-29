# Xeddit Mock — Research Summary

> Last updated: 2026-03-02 by plan agent

## App Overview

**Xeddit** is a social news aggregation, content rating, and discussion platform. Users submit text posts, images, links, and videos to topic-specific communities called "subreddits" (prefixed with `r/`). Content is organized by community-driven voting (upvote/downvote), where the most popular posts rise to the top. Xeddit calls itself "the front page of the internet."

**Category:** Social / Community forum / News aggregation
**URL:** https://www.reddit.com
**Tagline:** "Dive Into Anything"

---

## Key User Personas

1. **Casual Browser** — Browses the homepage/popular feed, upvotes/downvotes posts, reads comments, occasionally comments. Primary actions: scroll feed, vote, read post + comments, search.
2. **Active Contributor** — Creates posts (text, image, link), writes detailed comments, replies to threads, gives awards. Primary actions: create post, comment, reply, vote, give awards, join communities.
3. **Community Member** — Subscribes to multiple subreddits, uses sidebar filters, sorts by new/top/hot, uses subreddit-specific flairs. Primary actions: browse subreddit, filter by flair, sort, follow rules.
4. **Power User** — Manages multiple community subscriptions, uses keyboard shortcuts, saves/hides posts, has high karma. Primary actions: save posts, hide posts, manage subscriptions, use keyboard shortcuts, search.

---

## Core Workflows (Agent Training Targets)

1. **Browse & vote** — Scroll feed → upvote/downvote posts → read comments
2. **Read post & comments** — Click post → scroll comments → collapse/expand threads → sort comments → reply
3. **Create a post** — Select subreddit → choose post type (text/image/link) → fill title/body → add flair → submit
4. **Comment & reply** — Open comment box → type reply → submit → reply to specific comment
5. **Search** — Type in search bar → browse results (posts/communities/users) → filter by type/time
6. **Join/leave communities** — Visit subreddit → click Join/Leave → see in left sidebar
7. **Save/hide content** — Click save on post/comment → access saved items on profile → hide unwanted posts
8. **Give awards** — Click award button → select award → confirm
9. **View user profile** — Click username → see overview/posts/comments tabs → view karma breakdown
10. **Manage subscriptions** — Use left sidebar → browse favorites/subscriptions → filter

---

## Complete Feature List (Priority)

### P0 — Core Shell (App cannot render without these)
- Left sidebar navigation (Home, Popular, All, Favorites, Subscriptions)
- Top navbar (Xeddit logo, search bar, notification icons, user avatar/karma, create button)
- App layout: left sidebar (270px) + main content (centered, max ~750px) + right sidebar (~310px)
- Route structure: /, /r/:name, /post/:id, /user/:username, /submit, /search, /go
- State management with React Context + dataManager (session isolation)
- Visual design system matching Xeddit's current (2024) desktop theme

### P1 — Primary Features (Core interactive workflows)
- Post feed with sort tabs (Hot/New/Top/Rising) and view mode
- Post card: vote sidebar, subreddit/user/time metadata, flair, title, content preview, action bar
- Post detail page: full content, comment editor with formatting, threaded comments
- Comment system: nested replies with indentation lines, collapse/expand, voting, awards
- Comment sorting (Best/Top/New/Controversial/Old)
- Subreddit page: banner, icon, name, Join button, about sidebar, rules, members/online
- Create post page: subreddit selector, type tabs (Post/Image/Link/Poll), title, body, flair picker
- Search with tabs (Posts/Communities/People), time filter, sort
- User profile: banner, avatar, karma breakdown, tabs (Overview/Posts/Comments/Saved)
- Upvote/downvote system for posts and comments with visual feedback
- Award system with modal picker
- Join/Leave subreddit (persisted in state)
- Save/unsave posts and comments
- Share button (copy link)
- Post flairs (colored tags)
- Left sidebar with subscribed subreddits

### P2 — Secondary Features (Depth & realism)
- Hide/unhide posts from feed
- Post actions dropdown menu (Save, Hide, Report, Copy Link)
- Comment actions (Reply, Award, Save, Report, Copy Link)
- Notifications panel with badge count
- Messages inbox stub
- Markdown preview in comment editor
- User dropdown menu (profile, settings, dark mode)
- Sticky/pinned posts in subreddits
- "OP" badge on original poster comments
- Moderator distinguished badge
- Crosspost UI
- Edit/delete own posts and comments
- Compact/Card view toggle for feed
- Community creation modal
- Dark mode toggle

---

## UI Layout Description (Desktop)

### Homepage / Feed
**Reference:** `screenshots/homepage/000001.jpg`, `screenshots/search_000001.jpg`

- **Left sidebar** (~270px, white bg):
  - Xeddit logo + "xeddit" text at very top
  - "XEDDIT FEEDS" section: Home, Popular, All (with icons)
  - Search/filter text input
  - "FAVORITES" section: starred subreddits (icon + r/name + star)
  - "MULTIS" section: custom multireddit feeds
  - "SUBSCRIPTIONS" section: alphabetical list of subscribed subreddits (icon + r/name + three-dot menu)
  - Scrollable, sticky position

- **Top navbar** (48px, white bg, border-bottom):
  - Left: hamburger menu (mobile), Xeddit Snoo logo + "xeddit" wordmark
  - Center: search bar "Find a community or post" (rounded full, gray bg #F6F7F8)
  - Right: icon buttons (chat, create +, notifications bell with red badge), "Advertise" link, user avatar + green online dot + karma display + dropdown chevron

- **Main feed** (center, max ~700px):
  - Create post bar: user avatar + text input "Create Post" + image icon + link icon
  - Sort tabs: Hot (flame icon), New (sparkle icon), Top (trending icon), Rising (rocket icon) — active tab is blue/highlighted
  - View mode toggle: Card / Classic / Compact (icons on right)
  - Post cards (see Post Card section below)

- **Right sidebar** (~310px):
  - Xeddit Premium ad card (orange "Try Now" button)
  - "Home" card: Snoo mascot, banner, "Your personal Xeddit frontpage" description, "Create Post" button (blue), "Create Community" button (outline)
  - "Popular Communities" list
  - Footer links (Content Policy, Privacy, etc.)

### Post Card (in Feed)
- Left vote sidebar: up arrow, score (abbreviated), down arrow (gray bg strip)
- Main content area:
  - Metadata line: subreddit icon (20px round) + "r/name" (bold) + "•" + "Posted by u/username" + time ago + flair badges + award icons
  - Title (18px, medium weight, dark text)
  - Content preview: text (3 lines max, clipped), image (max height 500px, centered on dark bg), link (blue, external icon)
  - Action bar: 💬 N Comments | ↗ Share | 🎁 Award | ⊕ Save | ••• More

### Subreddit Page
**Reference:** `screenshots/subreddit/000001.jpg`

- Full-width colored banner (128px height, customizable color)
- Subreddit icon (80px round, overlapping banner, white border)
- Subreddit name (large bold) + "r/name" (muted) + "Joined" button (outline when joined, filled blue when not) + bell icon
- Tab bar: Posts (default), About
- Create post bar (same as homepage)
- Sort tabs (same as homepage)
- Post feed (showSubreddit=false)
- Right sidebar:
  - "About Community" card (blue header): description, Members count, Online count (green dot), Created date (cake icon), "Create Post" button
  - "COMMUNITY OPTIONS" expandable
  - Rules card: numbered list
  - Filter by Flair card
  - Moderators list

### Post Detail Page
- Dark overlay background (#000000CC)
- White card (max 740px wide):
  - Vote sidebar on left
  - Subreddit + user + time metadata
  - Post title (larger)
  - Full post content
  - Action bar
  - Comment editor: "Comment as [username]" link, textarea "What are your thoughts?", formatting toolbar (B, I, Link, Strikethrough, Code, etc.), Submit button
  - Comment sort: "Sort By: Best" dropdown + search comments input
  - Threaded comments with left border lines (2px gray) for each nesting level

### User Profile Page
- Banner (blue, 128px)
- Avatar (96px, rounded square, white border, overlapping banner)
- Username (large bold) + "u/username"
- Tab bar: Overview | Posts | Comments | Saved
- Post/comment feed in main area
- Right sidebar: user card with avatar, karma breakdown (Post Karma / Comment Karma), Cake Day, "New Post" button

### Create Post Page
- "Create a post" heading
- Subreddit selector dropdown (searchable)
- Type tabs: Post (text icon) | Image & Video | Link | Poll
- Title input (300 char limit)
- Content area (varies by type)
- Flair picker
- Options: NSFW toggle, Spoiler toggle
- Cancel + Post buttons

### Search Page
- Search header with query
- Tab bar: Posts | Communities | People
- Filter sidebar: Time (All time, Past hour, Past 24h, Past week, Past month, Past year), Sort (Relevance, Hot, Top, New, Comments)
- Results list

---

## Data Model Overview

See `data_model.md` for complete schema. Key entities:
- **User**: id, username, avatar, postKarma, commentKarma, cakeDay, about, joinedSubreddits
- **Subreddit**: id, name, description, icon, banner, bannerColor, members, online, rules, moderators, created, flairs
- **Post**: id, subredditId, userId, title, content, type, url, flair, upvotes, downvotes, created, isStickied, isLocked, isSpoiler
- **Comment**: id, postId, parentId, userId, content, upvotes, downvotes, created, isOP, isDistinguished
- **Vote**: id, userId, targetId, targetType, value
- **Award**: id, name, icon, cost
- **Notification**: id, type, content, postId, commentId, read, created

---

## What to Skip (Out of Scope)

- **Authentication/Login** — App starts pre-logged-in as default user "redditor_42"
- **Real API calls** — All data from localStorage/dataManager
- **File uploads** — Image posts use URL input, not file upload
- **Xeddit Premium/Gold** — Visual only, no purchase flow
- **Moderation tools** — No mod queue, automod, ban management (keep visual moderator badges only)
- **Real-time updates** — No WebSocket, polling, or live comment updates
- **Video/GIF posts** — Only text, image (URL), and link post types
- **Xeddit Chat** — Full chat system out of scope (show icon in navbar but non-functional)
- **Advertising** — No ad cards in feed
- **Custom CSS themes** — Subreddits use predefined banner colors only
