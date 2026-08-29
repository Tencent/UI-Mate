# Yiaohongshu (小红书 / RedNote) — Research Summary

## App Overview

**Yiaohongshu** (小红书, literally "Little Red Book"), also branded internationally as **RedNote**, is a Chinese social media and lifestyle platform combining user-generated content sharing with social commerce. Founded in 2013, it has 200+ million monthly active users, predominantly women aged 18-35 interested in fashion, beauty, food, travel, and lifestyle topics.

The platform's core unit of content is the **"Note" (笔记)** — a rich post containing images or video plus text, hashtags, and location tags. Users discover notes through a distinctive **waterfall (masonry) feed**, interact via likes/bookmarks/comments, and can follow creators.

**URL**: https://www.xiaohongshu.com/explore

---

## Key User Personas

1. **Content Browser** — Scrolls the Explore feed, searches for topics (e.g., "skincare routine"), reads notes, likes/bookmarks content, leaves comments
2. **Content Creator** — Publishes image or video notes with titles, body text, hashtags, location; manages their profile and published content
3. **Social User** — Follows other users, checks notifications (likes, comments, new followers), sends/receives direct messages

**Default user for mock**: A lifestyle blogger with ~500 followers who both creates and consumes content.

---

## Platform Structure (Desktop Web Version)

### Top Navigation Bar
- **Logo**: Red "小红书" logo (top-left)
- **Navigation tabs**: 首页 (Home) | **发现 (Explore/Discover)** | 创作者服务 (Creator Services) | 新闻中心 (News Center) | 关于我们 (About Us)
- **Search bar**: Centered, with placeholder "搜索" and magnifying glass icon
- **User avatar**: Top-right corner, clicking opens dropdown menu

### Main Content Area — Explore Feed
- **Waterfall/Masonry grid layout**: Multi-column (typically 4-5 columns on desktop), cards of varying height
- Each **note card** shows:
  - Cover image (variable aspect ratio, typically portrait-oriented)
  - Title text overlaid or below image (1-2 lines, truncated)
  - Author row: small circular avatar (24px) + nickname + optional verified badge
  - Engagement: heart icon + like count (bottom-right of card)
- Cards have rounded corners (~8px), subtle shadow on hover
- Infinite scroll to load more

### Note Detail View (Modal/Overlay)
- **Left side**: Large image carousel (swipeable if multiple images), 60% width
- **Right side**: Note content panel, 40% width:
  - Author header: avatar (40px) + nickname + "关注" (Follow) button (red pill)
  - Title (bold, larger font)
  - Body text with inline #hashtags (clickable, blue/red) and @mentions
  - Location tag (if present)
  - Timestamp ("3天前", "2小时前" — relative time in Chinese)
  - Engagement bar: ❤️ Like count | ⭐ Bookmark/Collect count | 💬 Comment count | ↗️ Share
  - **Comments section** below:
    - Comment input box at bottom
    - Comments list: avatar + username + comment text + timestamp + like button + reply count
    - Nested replies (1 level deep)

### User Profile Page
- **Banner/cover area** at top (can be customized)
- **Profile info**:
  - Large avatar (80px)
  - Nickname (bold)
  - 小红书号 (RED ID/username handle)
  - Bio/description text
  - Location, gender icon
  - Stats row: X 关注 (following) | X 粉丝 (followers) | X 获赞与收藏 (likes & bookmarks received)
- **Edit Profile** button (for own profile) or **Follow** button (for others)
- **Content tabs**: 笔记 (Notes) | 收藏 (Collections/Bookmarks) | 赞过 (Liked)
- Content displayed as waterfall grid of note cards (same as explore feed)

### Search Results Page
- Search bar at top with query
- Filter tabs: 综合 (All) | 笔记 (Notes) | 用户 (Users) | 商品 (Products)
- Results in waterfall grid (for notes) or list (for users)

### Notifications Page
- Tabs: 赞和收藏 (Likes & Bookmarks) | 新增关注 (New Followers) | 评论 (Comments)
- List format with avatar + action text + timestamp + thumbnail

### Messaging / Chat
- Left panel: conversation list (avatar + name + last message preview + time)
- Right panel: chat view with message bubbles
- Supports text messages, image sharing

---

## Complete Feature List

### P0 — Core (App cannot render without these)
1. App shell with top navigation bar, logo, search bar, user avatar
2. Explore/Discover waterfall feed with note cards
3. Routing: /explore, /note/:id, /user/:id, /search, /notifications, /messages
4. State management (AppContext + dataManager)
5. `/go` endpoint for state inspection
6. Session isolation (mock API)

### P1 — Primary Interactive Features
1. **Note detail modal**: Click card → overlay with image carousel + content + comments
2. **Like a note**: Toggle heart icon, update count, persist state
3. **Bookmark/Collect a note**: Toggle star icon, update count, persist state
4. **Comment on a note**: Input text, submit, show in comment list
5. **Reply to a comment**: Nested reply support
6. **Follow/Unfollow a user**: Toggle button, update follower/following counts
7. **Search**: Enter query → filter notes by title/content/hashtags
8. **User profile page**: Display user info, tabs for notes/bookmarks/liked
9. **Create/publish a note**: Form with title, body text, image selection, hashtags, location
10. **Notifications page**: Display likes, follows, comments as notification items
11. **Like a comment**: Toggle like on individual comments

### P2 — Secondary / Depth Features
1. **Image carousel**: Multiple images in note detail, swipe/arrow navigation
2. **Topic/hashtag pages**: Click hashtag → filtered feed
3. **Share note**: Copy link / share modal
4. **Edit/delete own notes**: From profile page
5. **Edit profile**: Change avatar, nickname, bio, gender, location
6. **Direct messages**: Conversation list + chat view
7. **Dark mode toggle**: Switch between light and dark themes
8. **Category tabs on explore**: e.g., 美食 (Food), 旅行 (Travel), 美妆 (Beauty), 穿搭 (Fashion)
9. **Sort/filter search results**: By relevance, latest, most liked
10. **Trending topics**: Sidebar or section showing hot/trending hashtags
11. **Note type indicator**: Image vs Video badge on cards

---

## UI Design Details

### Color Palette
- **Primary Red**: #FF2442 (Yiaohongshu signature red — used for logo, follow buttons, like hearts, accent elements)
- **Background (light mode)**: #FFFFFF
- **Background (dark mode)**: #1A1A1A (seen in web screenshots — dark charcoal)
- **Card background**: #FFFFFF (light) / #2A2A2A (dark)
- **Text primary**: #333333 (light) / #E8E8E8 (dark)
- **Text secondary/muted**: #999999
- **Border/divider**: #EEEEEE (light) / #333333 (dark)
- **Hashtag color**: #FF2442 (same as primary red)
- **Link/mention color**: #4A90D9

### Typography
- **Font family**: "PingFang SC", "Helvetica Neue", Arial, sans-serif (Chinese-first stack)
- **Note card title**: 14px, font-weight 600
- **Note detail title**: 20px, font-weight 700
- **Body text**: 14-15px, font-weight 400, line-height 1.6
- **Username**: 13px, font-weight 500
- **Engagement counts**: 12px, font-weight 400, color #999

### Spacing & Layout
- **Top nav height**: 56px
- **Explore feed padding**: 20px horizontal
- **Waterfall column gap**: 16px
- **Card border-radius**: 8px
- **Card shadow**: 0 1px 4px rgba(0,0,0,0.08)
- **Note detail modal**: max-width 1000px, centered, 80vh height

---

## Data Model Overview

See `data_model.md` for complete entity definitions.

Core entities:
- **User** — profile info, followers/following lists
- **Note** — image/video post with title, content, images, hashtags, location, engagement counts
- **Comment** — text comment on a note, with nested replies
- **Notification** — like/follow/comment events
- **Conversation / Message** — DM messaging
- **Topic/Hashtag** — grouping mechanism for notes

---

## What to Skip
- **Authentication / Login**: App starts pre-logged-in as default user
- **E-commerce / Shopping**: Product pages, purchase flow, cart — out of scope
- **Live streaming**: Not applicable for web mock
- **Real network calls**: All data is local/mock
- **File uploads to server**: Use placeholder images
- **Payment / Monetization**: No ads, no purchases

---

## Screenshot Inventory

| File | Description |
|------|-------------|
| `xiaohongshu_feed.png` | Mobile explore feed — waterfall layout with note cards showing title, avatar, like count |
| `000001.jpg` | **Desktop web version** — dark mode explore page with multi-column waterfall grid, top nav bar with logo + tabs + search + avatar |
| `000002.jpg` | Marketing illustration showing note detail UI — image + title + engagement metrics |
| `000003.jpg` | Desktop landing page showing logo, nav bar structure |
| `xiaohongshu_post.png` | Note creation interface — templates, photo/video options |

**Key visual reference**: `000001.jpg` is the most valuable screenshot — it shows the **actual desktop web interface** in dark mode with the complete layout: top nav bar (小红书 logo, 首页, 发现, tabs), multi-column waterfall grid of note cards, each card showing cover image + title + author avatar/name + like count.
