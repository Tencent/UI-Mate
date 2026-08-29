# Xnstagram Mock — Research Summary

> Last updated: 2025-03-09 by plan agent

## App Overview

**Xnstagram** is a photo and video-sharing social networking platform owned by Meta (Facebook). Launched in 2010, it has become one of the world's largest social media platforms with over 2 billion monthly active users. The core experience revolves around sharing visual content (photos, short videos, stories, reels) and engaging with other users' content through likes, comments, saves, and direct messages.

### What Makes Xnstagram Distinct
- **Visual-first**: Content is always image/video-centric, never text-only posts
- **Stories**: Ephemeral 24-hour content with rich interactive overlays
- **Reels**: TikTok-style short-form vertical video feed
- **Explore**: Algorithmically curated discovery grid
- **Xnstagram-gradient branding**: Signature purple-pink-orange gradient on story rings
- **Double-tap to like**: Iconic interaction pattern with heart animation overlay
- **Left sidebar navigation (desktop)**: Post-2022 redesign moved navigation from top bar to left sidebar

## Key User Personas

### 1. Casual Browser (Primary for agent training)
- Scrolls feed, views stories, explores content
- Likes and comments on posts
- Follows/unfollows users
- Searches for content and users

### 2. Content Creator
- Creates new posts with captions, locations, hashtags
- Manages their profile (edit bio, avatar)
- Views post analytics (like count, comment count)
- Manages followers/following

### 3. Social Communicator
- Sends and receives direct messages
- Shares posts via DMs
- Reacts to stories

## Desktop Web Interface Layout (Modern — Post-2022 Redesign)

### Navigation Structure
The modern Xnstagram desktop uses a **fixed left sidebar** navigation pattern (confirmed in screenshots):

```
┌──────────────┬─────────────────────────────────┐
│  Xnstagram   │  [Stories Tray - horizontal]     │
│  (logo)      │                                  │
│              │  ┌───────────────────────────┐   │
│  🏠 Home     │  │  Post Card                │   │
│  🔍 Search   │  │  - User header + avatar   │   │
│  🧭 Explore  │  │  - Image (carousel)       │   │
│  🎬 Reels    │  │  - Like/Comment/Share/Save│   │
│  ✉️ Messages │  │  - Likes count            │   │
│  ❤️ Notif.  │  │  - Caption                │   │
│  ➕ Create   │  │  - Comments link          │   │
│  👤 Profile  │  │  - Timestamp              │   │
│              │  │  - Add comment input      │   │
│              │  └───────────────────────────┘   │
│              │                                  │
│  ☰ More      │  [Right Sidebar: Suggestions]    │
└──────────────┴─────────────────────────────────┘
```

### Sidebar Details (from screenshot `sidebar/000004.jpg`)
- **Width**: ~244px expanded (with labels), ~72px collapsed (icons only, at medium breakpoints)
- **Logo**: "Xnstagram" in cursive script font at the top
- **Nav Items** (top to bottom):
  1. **Home** — house icon (filled when active, outlined otherwise)
  2. **Search** — magnifying glass icon
  3. **Explore** — compass icon
  4. **Reels** — film/clapperboard icon
  5. **Messages** — messenger-style paper plane icon
  6. **Notifications** — heart icon
  7. **Create** — plus-in-square icon
  8. **Profile** — circular avatar thumbnail of current user
- **More** — hamburger menu at bottom (links to Settings, etc.)
- Active state: **bold text** + **filled icon** (vs outlined)

### Color Palette
- **Background**: `#FFFFFF` (pure white)
- **Secondary background**: `#FAFAFA` (off-white, used for inputs/panels)
- **Text primary**: `#262626` (near-black)
- **Text secondary**: `#8E8E8E` (gray, timestamps, secondary labels)
- **Text link/action**: `#0095F6` (Xnstagram blue, for buttons/links)
- **Like/heart active**: `#ED4956` (red)
- **Border**: `#DBDBDB` (light gray borders)
- **Story gradient ring**: linear-gradient from `#FBAA47` (orange) → `#D91175` (magenta) → `#7024C4` (purple)
- **Separator**: `#EFEFEF` (very light gray)

### Typography
- **Font family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Logo font**: "Billabong" or similar script — for mock use `cursive` CSS generic
- **Body text**: 14px regular (400)
- **Username/bold**: 14px semibold (600)
- **Timestamp**: 10px uppercase, gray
- **Nav labels**: 16px regular, bold when active

## Complete Feature List

### P0 — Core Shell (Must have for app to function)
1. **App Layout** — Left sidebar + main content area + right suggestions panel
2. **Sidebar Navigation** — All nav items with icons, active states, responsive collapse
3. **Routing** — Home `/`, Explore `/explore`, Profile `/profile/:username`, Reels `/reels`, Messages `/direct/inbox`, Notifications (popover), Go `/go`
4. **State Management** — DataContext with session isolation
5. **Data Seeding** — Realistic mock data with users, posts, stories, comments
6. **`/go` Endpoint** — State inspection for RL training

### P1 — Primary Interactive Features
7. **Home Feed** — Scrollable feed of posts from followed users, chronological
8. **Story Tray** — Horizontal scrollable row of story circles at top of feed
9. **Story Viewer** — Full-screen overlay with progress bar, auto-advance, tap navigation
10. **Post Card** — Image, carousel arrows/dots, user header, action bar (like/comment/share/save), likes count, caption, comments link, timestamp, add comment input
11. **Post Detail Modal** — Click-to-expand modal with image on left, comments on right (desktop)
12. **Like Interaction** — Heart toggle (red fill when liked), double-tap heart animation overlay
13. **Comment System** — Add comment inline and in modal, comment like toggle
14. **Explore Page** — Grid layout of posts (3-column), hover overlay with like/comment counts, search bar
15. **Profile Page** — Avatar, username, stats (posts/followers/following), bio, edit profile button, post grid, tabs (Posts/Saved/Tagged)
16. **Follow/Unfollow** — Toggle follow state, update follower/following counts
17. **Create Post** — Modal with image selection, caption, location, filter preview, share button
18. **Suggestions Panel** — Right sidebar on home with "Suggested for you" users + follow buttons
19. **Search** — Search bar on Explore page, filter posts by caption/location
20. **Bookmark/Save** — Toggle save on posts, view saved posts in profile tab

### P2 — Secondary Features (Depth & Realism)
21. **Notifications Page** — List of follow, like, comment, mention notifications with read/unread states
22. **Direct Messages** — Inbox list (conversation threads) + chat view with send/receive messages
23. **Reels Page** — Vertical scrollable video-style cards (simulated with images + overlay controls)
24. **Edit Profile Modal** — Change name, bio, avatar, website
25. **Post Options Menu** — "..." button opens: Delete (own posts), Copy link, Share to, Go to post
26. **User List Modals** — Followers/Following lists with follow/unfollow buttons
27. **Hashtag Highlighting** — Clickable hashtags in captions that filter explore
28. **Mention Highlighting** — @username mentions in captions/comments link to profiles
29. **Carousel Post Navigation** — Swipe/arrow navigation with dot indicators
30. **Delete Comment** — Remove own comments from posts
31. **Delete Post** — Remove own posts
32. **Responsive Design** — Mobile bottom nav, tablet collapse sidebar to icons
33. **Search Panel (Sidebar)** — Clicking Search in sidebar opens a slide-out panel with recent searches and suggestions

## UI Patterns Observed

### Post Card Layout (from screenshots)
- **Header**: 32px avatar circle + username (semibold) + location (gray, optional) + "..." menu button
- **Image**: Aspect-ratio square container, full-width, `object-cover`
- **Action Bar**: Row of icons — [Heart, Comment, Share] on left, [Bookmark] on right. 28px icons.
- **Likes**: "X likes" bold text
- **Caption**: Username bold + caption text (with hashtag/mention highlighting)
- **Comments**: "View all X comments" gray link
- **Timestamp**: 10px uppercase gray, relative time ("2 HOURS AGO")
- **Add Comment**: Emoji button + input + "Post" blue button

### Post Detail Modal (from screenshots)
- **Layout**: Horizontal split — image on left (black background, contain), comments panel on right
- **Right Panel**: ~400-500px wide, contains: header (avatar + username), scrollable comments area, action bar, likes, timestamp, comment input
- **Desktop-only**: On mobile, opens a different view

### Profile Page (from screenshots)
- **Header Section**: Large circular avatar (150px) on left, stats + buttons on right
- **Stats Row**: "X posts", "X followers", "X following" — clickable for followers/following
- **Bio**: Name (bold), bio text, website link
- **Tabs**: Posts | Reels | Saved | Tagged — with icon + uppercase label
- **Post Grid**: 3-column with ~4px gap, square aspect ratio thumbnails, hover overlay with like/comment counts

### Explore Page (from screenshots)
- **Search bar** at top
- **Grid**: 3-column mosaic-style grid, mixed sizes (some large tiles spanning 2 rows), thumbnails
- **Category chips**: Horizontal row of topic filters (IGTV, Shop, Style, Nature, etc.)

### Story Viewer (from screenshots)
- **Full-screen black overlay**
- **Progress bars** at top (segmented per story from same user)
- **User info**: Avatar + username + timestamp
- **Image**: Full-height, object-cover
- **Navigation**: Left 1/3 tap = prev, Right 2/3 tap = next
- **Desktop**: Left/right arrow buttons on sides

### Messages/DM (from screenshots)
- **Split panel**: Conversation list on left (~350px), active chat on right
- **Left panel**: "Direct" header + new message button, "Messages" subheader, conversation list with avatar + username + preview + timestamp
- **Right panel**: Chat header with username + info button, message bubbles (sent = right-aligned gray, received = left-aligned), message input at bottom with photo + heart buttons

## Data Model Overview

See `data_model.md` for detailed entity definitions. Key entities:
- **Users** — Profile data, follower/following relationships
- **Posts** — Images, caption, location, likes, comments
- **Comments** — Nested within posts, with own likes
- **Stories** — Ephemeral content with viewed state
- **Notifications** — Activity feed items (likes, follows, comments, mentions)
- **Conversations/Messages** — Direct messaging threads
- **Saved Posts** — Bookmarked post IDs

## Existing Implementation Status

The current `instagram_mock` has a basic but functional implementation:
- ✅ Layout with left sidebar (responsive)
- ✅ Home feed with post cards
- ✅ Story tray + story viewer
- ✅ Post detail modal
- ✅ Like/comment interactions
- ✅ Follow/unfollow
- ✅ Create post modal
- ✅ Explore grid with search
- ✅ Profile page with post grid
- ✅ `/go` state inspection endpoint
- ✅ Session isolation (vite middleware)

### What's Missing/Needs Improvement
- ❌ Notifications page/panel
- ❌ Direct Messages page
- ❌ Reels page
- ❌ Bookmark/save functionality (button exists but no state management)
- ❌ Edit profile modal (button exists but no handler)
- ❌ Delete post/comment functionality
- ❌ Post options menu ("..." button has no handler)
- ❌ Search panel in sidebar
- ❌ Hashtag/mention highlighting is basic
- ❌ Notification badges on sidebar icons
- ❌ User list modal needs follow/unfollow buttons
- ❌ More seed data needed (only 5 posts, 6 users, 4 stories)
- ❌ Missing "Reels" and "Messages" nav items in sidebar
- ❌ Responsive improvements needed

## Out of Scope
- Authentication / Login / Signup (app starts pre-logged-in as `admin` user)
- Real image/video upload to server
- Real-time notifications or WebSocket connections
- Video playback (Reels simulated with static images)
- Xnstagram Shopping features
- Ads / Sponsored content
- Account privacy settings (private accounts)
- Two-factor authentication

## Screenshots Reference

| View | Files | Notes |
|------|-------|-------|
| Home Feed | `screenshots/000002.jpg`, `sidebar/000004.jpg` | Post card layout, sidebar nav, stories tray |
| Profile | `screenshots/000004.jpg`, `screenshots/000005.jpg`, `profile/000003.jpg` | Stats, bio, grid, tabs |
| Explore | `explore/000001.jpg` | Grid layout, search, category chips |
| Messages | `messages/000002.jpg`, `messages/000004.jpg` | Split panel DM layout |
| Post Detail | `post_detail/000001.jpg`, `post_detail/000002.jpg` | Modal with image + comments |
| Reels | `reels/000001.jpg` | Vertical scroll, action buttons on right |
| Stories | `stories/000002.jpg`, `stories/000003.jpg` | Full-screen viewer, progress bars |
| Modern Sidebar | `sidebar/000004.jpg` | Left sidebar navigation with all items |
