# Xeibo Mock — TODO

> Status: COMPLETE
> Last updated by: orchestrator, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

- [x] **Project scaffold**: `npm create vite@latest weibo_mock -- --template react` inside this directory, install deps: `react-router-dom`. Use JavaScript (not TypeScript).

- [x] **Visual design system**: Xeibo uses an orange-red brand color scheme. Exact values:
  - Primary/Brand: `#FF8200` (logo orange), `#FF6600` (action buttons, links)
  - Hot/Accent: `#FF4D4F` (like hearts, hot badges, notification dots)
  - Background: `#F7F9FA` (page bg), `#FFFFFF` (card bg)
  - Text Primary: `#333333`, Text Secondary: `#999999`, Text Link: `#EB7350`
  - Border: `#E8E8E8`, Hover bg: `#F0F0F0`
  - Verification badges: Blue V `#4A90D9`, Orange V `#FF8200`, Gold V `#FFB800`
  - Font stack: `"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif`
  - Font sizes: 14px body, 15px post text, 16px display name, 12px timestamp/meta, 20px section title
  - Border radius: 8px for cards, 20px for buttons, 50% for avatars
  - All text content in the UI should be in **Chinese (Simplified)** to match real Xeibo

- [x] **App layout** — Three-column centered layout (max-width 1200px, centered on page):
  - **Top nav bar**: Fixed, height 50px, white bg, bottom border `#E8E8E8`. Left: Xeibo logo (red eye SVG icon + "微博" text in orange). Center: nav tabs (首页, 热门, 视频). Right: search input (round, 240px), notification bell icon, message envelope icon, user avatar (32px circle) with dropdown.
  - **Left sidebar**: Width 200px, sticky. Contains user profile mini-card (avatar 64px, name, bio, stats row: "关注 X | 粉丝 X | 微博 X"), then nav links vertically: 首页, 热门, 超话, 消息, 收藏, 设置. Each link has an icon + Chinese label.
  - **Center column**: Width ~620px, flex-grow. Houses the main content (feed, post detail, search results, etc.)
  - **Right sidebar**: Width 300px, sticky. Houses Hot Search panel and Recommended Users panel.
  - Responsive: below 1000px, hide right sidebar. Below 768px, hide left sidebar too.

- [x] **Routing**: `App.jsx` with `BrowserRouter`, routes:
  - `/` — Home feed (default)
  - `/hot` — Hot/Trending page
  - `/post/:id` — Post detail with comments
  - `/profile/:userId` — User profile page
  - `/profile` — Current user's profile (redirect to `/profile/user_current`)
  - `/search` — Search results page (query param `?q=`)
  - `/messages` — Direct messages
  - `/notifications` — Notifications page
  - `/topic/:topicId` — Topic/hashtag page
  - `/settings` — Settings page
  - `/go` — State inspection endpoint

- [x] **State management**: `src/context/AppContext.jsx` providing global state + dispatch. `src/utils/dataManager.js` with `createInitialData()` (see `data_model.md`), `loadState()`, `saveState()`, `getStateDiff()`. State persisted to localStorage under key `weibo_mock_state`. All mutations go through context dispatch actions.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route, renders JSON `{initial_state, current_state, state_diff}`. `state_diff` computes added/removed/changed posts, comments, follows, likes, messages, etc. Must be a plain JSON response (white page with `<pre>` tag).

- [x] **Session isolation**: `vite.config.js` mock-api plugin handling:
  - `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` — sets both initial + current state
  - `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` — sets only current state
  - `POST /post?sid=<sid>` with `{"action":"reset"}` — resets current to initial
  - `GET /go?sid=<sid>` → returns `{initial_state, current_state, state_diff}`
  - Session state stored per-sid in memory, falls back to default `createInitialData()`.

---

## P1 — Primary Features

### Home Feed

- [x] **Feed tab toggle**: At top of center column, two tabs: "关注" (Following) and "推荐" (Recommended). Active tab has orange underline. "关注" shows posts from followed users only. "推荐" shows all posts. Default: "关注". Clicking tab switches feed and updates `ui.feedTab` state.

- [x] **Compose box**: Sticky at top of feed (below tabs). White card with:
  - `<textarea>` placeholder: `"有什么新鲜事想告诉大家？"` (What's new to share?). Auto-expands on focus (min-height 80px → 120px on focus).
  - **Toolbar row** below textarea: icons for 📷 图片 (image), 🎬 视频 (video), 😊 表情 (emoji), # 话题 (topic), @ 提到 (mention), 📍 位置 (location). Each icon is 20px, gray `#999`, hover orange `#FF8200`.
  - **Emoji picker**: Clicking 😊 toggles a popover grid of common Chinese emoji/emoticons (a 6x5 grid of emoji like 😂🥰😭😍🤔👍❤️🎉🔥💪 etc). Clicking an emoji inserts it into textarea.
  - **Topic selector**: Clicking # opens an inline input that wraps text in `#...#` format.
  - **Mention input**: Clicking @ opens a dropdown of followed users to mention as `@handle `.
  - **Publish button**: Right-aligned, orange bg `#FF8200`, white text, "发布". Disabled (gray) when textarea is empty. On click: creates new post, prepends to feed, increments `currentUser.postsCount`, clears textarea. Post `source` = `"微博网页版"`.
  - Character count shown near publish button when > 0 chars.

- [x] **Post card component**: Each post in the feed rendered as a white card with 12px vertical gap between cards:
  - **Header row**: 48px circle avatar (clickable → profile), display name (bold, 16px, clickable → profile), verification badge icon (colored V circle — blue/orange/gold, only if verified), `@handle` in gray, "·", relative timestamp ("刚刚", "5分钟前", "1小时前", "昨天 09:45", "04-08"), source text ("来自 微博网页版") in gray 12px.
  - **Body text**: 15px, line-height 1.6. `@mentions` rendered as orange clickable links. `#topic#` rendered as orange clickable links. URLs shortened. If `isLongText` is true and text > 140 chars, truncate at 140 chars and show "...全文" blue link that expands.
  - **Image grid**: If post has images, render below text with 8px gap. Layout rules:
    - 1 image: max-width 360px, max-height 400px, object-fit cover
    - 2 images: 2-column row, each ~180px wide
    - 3 images: 3-column row
    - 4 images: 2x2 grid
    - 5-6 images: 2 rows (3+2 or 3+3)
    - 7-9 images: 3x3 grid (last row may have fewer)
    - All images have 4px border-radius, clickable (opens lightbox/full-size modal)
  - **Repost box**: If `repostOf` is not null, show indented box with gray bg `#F7F9FA`, border-left 3px orange. Inside: original author's `@handle` + name, original post text (truncated), original images (smaller thumbnails). If original is deleted, show "该微博已被删除".
  - **Action bar**: Below content, 3 evenly-spaced action buttons with icons + count:
    - 🔄 转发 (`repostCount`) — click opens repost dialog
    - 💬 评论 (`commentCount`) — click navigates to post detail / opens inline comment box
    - ❤️ 点赞 (`likeCount`) — click toggles like (icon turns red `#FF4D4F`, count +1/-1, updates `isLiked` in state)
    - Each button: gray icon + text, hover highlight. If active (isLiked), like button and count are red.
  - **More menu**: "..." icon in top-right of card header. Dropdown: 收藏 (Favorite), 复制链接 (Copy link), 删除 (Delete, only if own post). Clicking 删除 removes post from state + feed.

### Post Detail Page

- [x] **Post detail view** (`/post/:id`): Full post content at top (same card format but no truncation). Below: comments section.
  - **Comment sort tabs**: "最热" (Hottest, sort by likeCount desc) | "最新" (Latest, sort by createdAt desc). Active tab has orange underline.
  - **Comment compose box**: At top of comments section. Avatar (current user, 36px) + textarea `"写评论..."` + "发布" button. On submit: creates new comment, increments post's `commentCount`, prepends to list.
  - **Comment cards**: Each comment is:
    - Avatar (36px circle) + display name (bold) + V badge + timestamp (gray, relative)
    - Comment text (14px). If reply: prefixed with "回复 @handle: "
    - Action row: ❤️ like count (click toggles) + "回复" (Reply) link
    - Clicking "回复" focuses comment compose box with "回复 @handle: " prefix.
  - **Nested replies**: Show up to 3 replies inline below a comment (indented, slightly smaller). If more replies, show "查看更多回复" (View more replies) link.
  - **Load more**: "加载更多评论" button at bottom if comments > 20.

### Repost Dialog

- [x] **Repost modal**: Triggered by clicking 转发 on any post. Modal overlay with:
  - Title: "转发微博"
  - Textarea with placeholder "说说你的想法..." (Share your thoughts...). Pre-populated with original post reference.
  - Preview of original post below textarea (compact: avatar + name + text truncated).
  - Toolbar: emoji, @mention, #topic# (same as compose box).
  - "转发" (Repost) button, orange. On click: creates new post with `repostOf` set to original post ID, `repostText` = textarea content, increments original post's `repostCount`.
  - "取消" (Cancel) button to close.

### Hot Search

- [x] **Hot Search sidebar panel**: In right sidebar, white card:
  - Header: "热搜" in bold + 🔥 icon + "换一换" (Refresh) link
  - List of top 10 items. Each item:
    - Rank number (1-3 in orange bold, 4-10 in gray)
    - Topic text (clickable → `/search?q=<topic>`)
    - Badge: "沸" (boiling, red bg), "热" (hot, orange bg), "新" (new, blue bg) — small rounded label
    - Search count in gray (e.g., "258万")
  - "查看更多" (View more) link at bottom → navigates to `/hot`

- [x] **Full Hot Search page** (`/hot`): Center column content:
  - Title: "微博热搜榜"
  - Full list of 50 items with same format but more details:
    - Rank number, topic text, search count, category tag (社会/娱乐/科技/体育/etc.), badge
    - Each item clickable → `/search?q=<topic>`
  - Top 3 items have larger font and special highlight styling

### User Profile

- [x] **Profile page** (`/profile/:userId`):
  - **Cover banner**: Full-width, height 200px, gradient fallback if no image
  - **Profile header**: Avatar (80px, overlapping cover by 40px), display name (20px bold), V badge (larger), `@handle` in gray
  - **Bio section**: Bio text, location icon + location text, calendar icon + "于 YYYY年MM月 加入" (Joined date)
  - **Stats row**: "关注 **X**" | "粉丝 **X**" | "微博 **X**" — numbers are bold, labels are gray. Clicking "关注" or "粉丝" could show user list.
  - **Action button**: If viewing other user: "关注" (Follow, orange outline) / "已关注" (Following, gray fill). Click toggles follow state, updates follower/following counts in state. If viewing self: "编辑资料" (Edit Profile) button.
  - **Tab bar**: 微博 (Posts) | 转发 (Reposts) | 视频 (Videos) | 相册 (Albums) | 收藏 (Favorites). Active tab has orange underline. Each tab filters the post list below.
  - **Posts list**: Filtered posts by the selected tab, same card format as feed.

### Search

- [x] **Search functionality**:
  - **Search input** in top nav: round input, placeholder "搜索". On Enter or click search icon → navigate to `/search?q=<query>`.
  - **Search results page** (`/search`):
    - Search bar at top (pre-filled with query)
    - Filter tabs: 综合 (All) | 实时 (Real-time) | 用户 (Users) | 话题 (Topics)
    - "综合" tab: posts matching query in text, sorted by relevance (match in text > match in author name)
    - "用户" tab: user cards matching query in screenName or handle. Each card: avatar, name, V badge, bio truncated, follower count, follow button.
    - "话题" tab: topic cards matching query in name. Each card: topic name, read count, discussion count.
    - Empty state: "未找到相关结果" (No results found) with search icon.

### Notifications

- [x] **Notifications page** (`/notifications`):
  - Tab bar: 全部 (All) | 评论 (Comments) | 点赞 (Likes) | 转发 (Reposts) | 关注 (Follows) | @我 (Mentions)
  - Notification cards by type:
    - **Like**: "[User avatar+name] 赞了你的微博" + thumbnail of the post
    - **Comment**: "[User avatar+name] 评论了你的微博: [comment text]" + thumbnail
    - **Repost**: "[User avatar+name] 转发了你的微博" + thumbnail
    - **Follow**: "[User avatar+name] 关注了你" + follow-back button
    - **Mention**: "[User avatar+name] 在微博中提到了你: [post text]" + thumbnail
  - Unread notifications have subtle orange-left-border or light orange bg.
  - Opening notifications page marks all as read (updates `ui.notificationUnreadCount` to 0).
  - **Notification badge**: Red dot/count badge on bell icon in top nav when unread > 0.

### Follow/Unfollow

- [x] **Follow/Unfollow**: Clicking follow button on any user card:
  - If not following: button "关注" (orange outline) → becomes "已关注" (gray fill). Updates target user's `followersCount` +1, current user's `followingCount` +1, sets `isFollowing: true`.
  - If following: button "已关注" → on hover shows "取消关注" (Unfollow, red outline). Click reverses the above.
  - State changes reflected in `/go` diff.

---

## P2 — Secondary Features

- [x] **Direct messages** (`/messages`): Two-panel layout:
  - Left panel (280px): conversation list, each showing other user's avatar + name + last message preview (truncated 30 chars) + timestamp. Unread conversations have bold text + blue dot. Sorted by lastMessageAt desc.
  - Right panel: Active conversation. Header: user avatar + name. Message list: bubbles (own messages right-aligned orange bg, others left-aligned gray bg). Each bubble: text + timestamp. Compose bar at bottom: textarea + "发送" (Send) button. On send: creates new message, updates conversation's lastMessageAt, appends to message list.
  - **Message badge**: Red count badge on envelope icon in top nav when total unread > 0.

- [x] **Image lightbox**: Clicking any image in a post opens a full-screen modal overlay (dark bg). Shows image full-size centered. Left/right arrows to navigate between images in the same post. "X" button or click outside to close. Current image index shown (e.g., "3/9").

- [x] **Super Topics page** (`/topic/:topicId`):
  - Topic header: name in large text, read count + discussion count, "关注话题" (Follow topic) button
  - Posts list: all posts with this topicId, same card format as feed
  - For Super Topics (`isSuperTopic: true`): additional host info and "essential content" tab

- [x] **Recommended Users sidebar panel**: Below Hot Search in right sidebar:
  - Header: "推荐用户" + "换一换" (Refresh)
  - 3-5 user cards: avatar (40px) + name + V badge + one-line bio + "关注" button
  - "查看更多" (View more) link

- [x] **Favorites/Bookmarks**: Clicking 收藏 in post "..." menu or on dedicated page:
  - Adds/removes post from favorites array in state
  - `/favorites` route shows all favorited posts in feed format

- [x] **Edit profile dialog**: Clicking "编辑资料" opens modal:
  - Fields: avatar upload (preview change), cover image, display name, bio, location
  - "保存" (Save) button updates currentUser in state

- [x] **Post deletion**: Clicking 删除 in own post's "..." menu:
  - Confirmation dialog: "确定删除这条微博？" (Confirm delete?)
  - On confirm: removes post from state, updates postsCount

- [x] **Settings page** (`/settings`): Basic settings panel:
  - Sections: 账号设置 (Account), 隐私设置 (Privacy), 通知设置 (Notifications)
  - Toggle switches for: 接收私信 (Receive DMs), 评论权限 (Comment permissions), 夜间模式 (Dark mode placeholder)

- [x] **Trending/Hot tab** (`/hot` with tabs):
  - Sub-tabs: 热搜 (Hot Search) | 热门话题 (Hot Topics) | 要闻 (News)
  - "热门话题" shows topic cards sorted by discussionCount desc

---

## Data Seed (implement in createInitialData())

- [x] **Users**: 12 users total — 1 current user ("李小明", handle "lixiaoming", casual user with ~500 followers), 3 verified celebrities/media (blue V), 2 verified influencers (orange V), 1 verified brand (gold V), 5 regular users. All with Chinese names, realistic bios, varied follower counts (50 to 15M). Current user follows 6 of the other users.

- [x] **Posts**: 20 posts covering — 5 text-only posts (various lengths including 1 long text >140 chars), 4 posts with single image, 3 posts with multiple images (2, 4, 9 images), 3 reposts (one repost-of-repost chain), 2 posts with #hashtags#, 2 posts with @mentions, 1 post by current user. Spread across last 3 days with realistic timestamps. Engagement ranges: 0-50 (normal), 50-500 (popular), 500-5000 (viral).

- [x] **Comments**: 30 comments across 8 different posts — post_1 has 8 comments (including 3 reply threads), post_2 has 5, post_3 has 4, rest have 1-3 each. Mix of liked/not-liked by current user.

- [x] **Hot Searches**: 50 items covering categories: 社会 (Society), 娱乐 (Entertainment), 科技 (Technology), 体育 (Sports), 财经 (Finance), 生活 (Life). Top 3 have "沸" badge, 4-10 mix of "热" and "新", rest have "热" or empty. All topics in Chinese.

- [x] **Topics**: 10 topics — 3 are super topics (超话), 7 are regular hashtags. Each referenced by 2-4 posts via topicIds.

- [x] **Messages**: 4 conversations with 3-8 messages each. 2 conversations have unread messages (unreadCount > 0).

- [x] **Notifications**: 15 notifications — 4 likes, 3 comments, 2 reposts, 2 follows, 2 mentions, 2 system. 5 are unread.

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login / registration (app starts pre-logged-in as "李小明" @lixiaoming)
- Real API calls or network communication
- Payment / VIP membership / Super Membership (超级会员)
- Live streaming functionality
- E-commerce / Taobao integration
- Real file uploads (use placeholder image URLs)
- Content moderation / reporting system
- Ad display system
- Email/SMS verification
- Real-time push notifications (WebSocket)
