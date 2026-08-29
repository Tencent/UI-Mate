# Xeibo Mock — Research Summary

## App Overview

**Sina Xeibo** (新浪微博, weibo.com) is China's largest microblogging platform — often called "China's Twitter." Launched in 2009, it has 591 million MAU and 261 million DAU. Users post short-form content (text, images, videos), repost others' content, comment, and engage with trending topics. The platform is a hybrid of Twitter and Instagram, emphasizing celebrity culture, trending topics (热搜), and community-driven Super Topics (超话).

## Key User Personas

1. **Casual Browser** — scrolls the home feed, reads hot search topics, likes/reposts interesting posts
2. **Content Creator** — composes posts with text/images, uses hashtags, interacts with followers
3. **Celebrity/KOL Follower** — follows verified accounts, comments on celebrity posts, participates in Super Topics
4. **News Consumer** — uses hot search/trending to follow current events, reads @mentions

## Primary Workflows (for agent training)

1. Browse home timeline (scroll, read posts)
2. Compose and publish a new post (text + optional images + hashtags + @mentions)
3. Repost (转发) someone else's post with added commentary
4. Comment on a post / reply to comments
5. Like (点赞) a post
6. View and browse trending Hot Search (热搜榜)
7. Search for posts/users/topics
8. View user profile (own and others)
9. Follow/unfollow users
10. View notifications / @mentions
11. Send/receive direct messages (私信)
12. Browse and interact with Super Topics (超话)

---

## UI Layout — Desktop Web (weibo.com)

### Top Navigation Bar
- **Left**: Xeibo logo (red eye icon + "微博")
- **Center**: Navigation tabs — 首页 (Home), 热门 (Hot/Popular), 视频 (Video), with potential for more category tabs
- **Right**: Search bar, notification bell icon, message icon, user avatar dropdown

### Three-Column Layout (centered, max-width ~1200px)

#### Left Sidebar (~200px)
- User profile card (avatar, display name, bio snippet)
- Stats row: 关注 (Following) count | 粉丝 (Followers) count | 微博 (Posts) count
- Navigation links:
  - 首页 (Home)
  - 热门 (Hot/Popular)
  - 超话 (Super Topics)
  - 视频 (Video)
  - 消息 (Messages)
  - 收藏 (Favorites)
  - 我的 (My Profile)
  - 更多 (More)

#### Main Feed (~600px center column)
- **Compose Box** at top:
  - Textarea with placeholder "有什么新鲜事想告诉大家？" ("What's new to share?")
  - Toolbar below: image upload icon, video icon, emoji picker, topic/hashtag (#) icon, @mention icon, location pin
  - "发布" (Publish) button (orange/red)
  - Tab toggles: 关注 (Following) | 推荐 (Recommended)

- **Post Cards** (vertical feed, infinite scroll):
  - User avatar (48px circle), display name (bold), verification badge (V icon — blue/orange/gold), @handle
  - Timestamp (relative: "5分钟前", "昨天 09:45") + source ("来自 微博网页版")
  - Post body text (up to 2000 chars, with "全文" expand link for long posts)
  - @mentions highlighted in blue, #hashtag# highlighted in blue
  - Image grid (1-9 images in grid layout: 1=full width, 2-3=row, 4=2x2, 5-6=2x3, 7-9=3x3)
  - Reposted content box (indented gray background showing original post)
  - Action bar: 转发 (Repost) count | 评论 (Comment) count | 点赞 (Like) count
  - On hover: more options (...) menu

#### Right Sidebar (~300px)
- **Hot Search (热搜榜)** panel:
  - Title: "热搜" with fire icon
  - Numbered list (1-10+) of trending topics
  - Each item: rank number, topic text, view/discussion count, optional "热" (hot) / "新" (new) / "沸" (boiling) badge
  - "更多" (More) link to full hot search page
- **Recommended Users** panel:
  - "推荐用户" header
  - User cards: avatar, name, V badge, follow button
- **Trending Topics** panel (optional secondary)

### Post Detail Page
- Full post content (expanded)
- Comments section below:
  - Sort tabs: 最热 (Hottest) | 最新 (Latest)
  - Comment cards: avatar, name, timestamp, text, like count, reply button
  - Nested replies (1 level deep)
  - Pagination or "load more"

### User Profile Page
- Cover banner image
- Avatar (large, ~100px)
- Display name, V badge, bio/description
- Stats: 关注 Following | 粉丝 Followers | 微博 Posts
- Follow/Unfollow button (for other users), Edit Profile (for self)
- Tab bar: 微博 (Posts) | 转发 (Reposts) | 视频 (Videos) | 相册 (Albums) | 收藏 (Favorites)
- Post feed filtered by selected tab

### Messages Page
- Left: conversation list (user avatar, name, last message preview, timestamp)
- Right: active conversation with message bubbles

### Search Results Page
- Search bar at top
- Tab filters: 综合 (All) | 实时 (Real-time) | 用户 (Users) | 图片 (Images) | 视频 (Video)
- Results list matching post card format

### Hot Search Page (Full)
- Ranked list of 50 trending topics
- Each: rank, topic text, search volume, category tag, hot/new/boiling badge
- Click → search results for that topic

---

## Color Palette & Visual Design

- **Primary (Brand)**: Xeibo Orange-Red `#FF8200` (logo), `#FF6600` (buttons, accents)
- **Secondary**: `#F44336` (hot badges, notifications)
- **Background**: `#F7F9FA` (page bg), `#FFFFFF` (cards)
- **Text Primary**: `#333333`
- **Text Secondary**: `#999999` (timestamps, source labels)
- **Text Link/Mention**: `#EB7350` (orange links) or `#4C8BF5` (blue for @mentions and #topics#)
- **Border**: `#E8E8E8`
- **Verification Badges**: Blue V `#4A90D9`, Orange V `#FF8200`, Gold V `#FFB800`
- **Like Active**: `#FF4D4F` (red heart)
- **Font**: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif
- **Font Sizes**: 14px body, 16px post name, 12px timestamps, 20px section headers

---

## Feature List with Priority

### P0 — Core Shell (Must have for app to render)
1. Project scaffold (Vite + React)
2. Visual design system (colors, typography matching Xeibo)
3. Three-column layout (left sidebar, center feed, right sidebar)
4. Top navigation bar
5. Routing (home, profile, detail, search, trending, messages, notifications)
6. State management (AppContext + dataManager)
7. `/go` endpoint for state inspection
8. Session isolation (mock API plugin)

### P1 — Primary Features (Core interactions)
1. Home timeline feed with post cards
2. Compose box (text + image + hashtag + @mention + emoji)
3. Post detail page with comments
4. Repost (转发) with comment
5. Comment on posts (create, reply, delete)
6. Like/unlike posts
7. Hot Search (热搜) sidebar panel (top 10)
8. Full Hot Search page (top 50)
9. User profile page (own + others)
10. Follow/unfollow users
11. Search (posts, users)
12. Notifications / @mentions page

### P2 — Secondary Features (Depth)
1. Direct messages (私信)
2. Super Topics (超话) community page
3. Post image grid (1-9 image layouts)
4. Video posts (placeholder/thumbnail)
5. User verification badges
6. Favorites/bookmarks
7. Trending tab (热门) with category filtering
8. Post deletion
9. Edit profile
10. Recommended users sidebar

---

## Data Model Overview

See `data_model.md` for full entity definitions.

**Core entities**: User, Post (微博), Comment, Message, Topic, Notification, HotSearch

---

## Out of Scope

- Authentication / login / registration (app starts pre-logged-in)
- Real Xeibo API calls
- Payment / VIP membership
- Live streaming
- E-commerce integration
- Real-time push notifications
- Content moderation / reporting
- Ad display system

---

## Screenshot Descriptions

### screenshots/000003.jpg — Hot Search (Mobile)
Shows the "实时热搜" (Real-time Hot Search) panel with:
- Search bar at top
- "实时热点，每分钟更新一次" subtitle
- Numbered list of trending topics (1-7 visible)
- Each item: rank number, topic text, view count (e.g., "258万次")
- First item has special "置" (pinned) icon
- Orange/red color scheme

### screenshots/000004.jpg — User Profile (Mobile)
Shows a user profile with:
- Cover banner (dark gradient)
- Circular avatar
- Display name with verification badges
- "关注 4 | 粉丝 3" stats
- Bio text
- Tab bar: 主页 (Home) | 微博 (Posts) | 相册 (Albums) | +
- Share sheet overlay showing sharing options

### screenshots/000005.jpg — Feed & Compose (Mobile)
Shows the home feed with:
- Top: "关注" (Following) | "推荐" (Recommended) toggle tabs
- Compose button (orange "+" in top right) with dropdown: 写微博 (Write post), 图片 (Image), 视频 (Video), 文章 (Article), 直播 (Live)
- Post card showing: avatar + name + V badge + timestamp + source
- Repost content with video thumbnail
- Action bar: 转发 (Repost) | 评论 1 (Comments) | 点赞 1 (Likes)
- Bottom tabs: 首页 (Home) | 超话 (Super Topics) | 发现 (Discover) | 消息 (Messages) | 我 (Me)
