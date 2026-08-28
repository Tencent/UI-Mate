# Xhihu (知乎) — Comprehensive Research Summary

> Last updated by: plan agent, 2025-03-09
> Target: Desktop web interface (zhihu.com logged-in experience)

---

## 1. App Overview

**Xhihu** (知乎, meaning "Do you know?" in classical Chinese) is China's largest Q&A and knowledge-sharing platform — often described as "China's Quora + Medium + Twitter" combined. Founded in 2011 by Yuan Zhou (周源), it evolved from an invite-only community into a massive platform with 94M+ monthly active users, listed on the NYSE (ticker: ZH).

**Core mission**: Enable credible, expert-driven knowledge sharing across professional domains (tech, finance, psychology, medicine, law, culture, education).

**Tagline**: "有问题，上知乎" (Got questions? Go to Xhihu.)

**URL**: https://www.zhihu.com

---

## 2. Key User Personas & Primary Workflows

### Persona A: Knowledge Seeker (知识探索者)
- **Profile**: College student or young professional
- **Workflow**: Browse feed → Read answers → Upvote quality content → Search topics → Save to collections → Check Hot List

### Persona B: Expert Contributor (专业回答者)
- **Profile**: Industry professional or academic
- **Workflow**: Check notifications/invitations → Browse "等你来答" → Write detailed answers → Respond to comments → Publish articles in column

### Persona C: Content Creator (内容创作者)
- **Profile**: Writer, blogger, influencer
- **Workflow**: Publish articles → Post Ideas (short-form) → Answer trending questions → Monitor engagement → Host Live sessions

### Persona D: Casual Browser (休闲浏览者)
- **Profile**: General user
- **Workflow**: Scroll recommended feed → Check Hot List (热榜) → Read story-style answers → Upvote/share → Occasionally post Ideas

---

## 3. Complete Feature List with Priority

### P0 — Core Shell (app cannot render without these)
| Feature | Chinese | Description |
|---------|---------|-------------|
| Sticky Header | 顶部导航栏 | Logo, nav tabs (首页/会员/发现/等你来答), search bar, "提问" button, notification bell, user avatar menu |
| Three-column Home Layout | 首页 | Left sidebar (user card, nav, followed topics), center feed, right sidebar (recommended topics) |
| Routing | 路由 | All page routes with react-router-dom |
| State Management | 状态管理 | Zustand store with session isolation, localStorage persistence |
| `/go` endpoint | 状态检查 | State inspector returning initial_state, current_state, state_diff |

### P1 — Primary Features (core interactive workflows)
| Feature | Chinese | Description |
|---------|---------|-------------|
| Home Feed | 首页信息流 | Answer cards with question title, author info, content preview, action buttons; tab switching (综合/关注/热榜) |
| Question Page | 问题详情页 | Question card with title, description, topics, stats; answer list with full content; follow/invite/write-answer actions |
| Answer Voting | 赞同/反对 | Toggle upvote on answers, update count in real-time |
| Answer Detail Page | 回答详情 | Full answer view with author info, content, and all actions |
| User Profile Page | 个人主页 | Profile header, stats bar, content tabs (回答/文章/想法/收藏夹) with actual content |
| Comment System | 评论系统 | View comments on answers/articles; add new comments; reply to comments; upvote comments |
| Ask Question Modal | 提问 | Modal dialog to create a new question with title, description, and topic tags |
| Write Answer | 写回答 | Rich text area on question page to submit a new answer |
| Hot List (热榜) | 热榜 | Ranked trending questions with heat scores, top-3 highlighted, "热" badges |
| Search | 搜索 | Full-text search with tabs for content types (综合/问题/用户/话题) |
| Topic Pages | 话题页 | Topic header, description, follower count, related questions; follow topic |
| Notifications | 消息中心 | Notification list with types (voteup/comment/follow/favorite/thank); mark as read |
| Collections | 收藏夹 | Create/manage collections; add/remove items; public/private toggle |
| Follow System | 关注系统 | Follow/unfollow users, topics, and questions; update counts |

### P2 — Secondary Features (depth & realism)
| Feature | Chinese | Description |
|---------|---------|-------------|
| Article Page | 文章详情页 | Full article view with title, cover image, content, author, actions |
| Ideas (Xiangfa) | 想法 | Short-form microblog posts with images and topics |
| "Following" Feed Tab | 关注 tab | Feed filtered to show content only from followed users and topics |
| Answer Sorting | 回答排序 | Sort answers by default (Wilson score) or by time |
| User Hover Card | 用户预览卡 | Hovering over username shows popup with user info and follow button |
| "Read Full" Expand | 阅读全文 | Long answers in feed show truncated with "阅读全文" button to expand |
| Thank Action | 感谢 | Separate "感谢" button distinct from upvote on answers |
| Invite to Answer | 邀请回答 | Modal to search and invite specific users to answer a question |
| Settings Page | 设置页 | Profile editing, notification preferences, privacy settings |
| Create Collection | 创建收藏夹 | Modal to create a new collection with name, description, privacy |
| Discover/Explore | 发现 | Featured content, trending topics, curated specials, roundtable discussions |
| "Waiting for Answer" | 等你来答 | Questions in user's expertise areas that need answers |
| Back to Top | 回到顶部 | Floating button to scroll back to top on long pages |
| Toast Notifications | 提示消息 | Transient success/error messages for actions |

---

## 4. UI Layout Description — Major Views

### 4.1 Global Header (56px height, sticky)
```
+---------------------------------------------------------------------------------+
| [知乎 Logo] [首页] [会员] [发现] [等你来答]  [...搜索框...]  [提问] [🔔badge] [👤▼] |
+---------------------------------------------------------------------------------+
```
- **Logo**: "知乎" in blue (`#0084ff`), bold, 24px, links to `/`
- **Nav tabs**: 首页, 会员, 发现, 等你来答 — 15px text, 16px gap
- **Search bar**: Pill-shaped input, 400px max-width, placeholder "搜索你感兴趣的内容..."
- **Ask button**: "提问", blue primary button, 14px
- **Bell**: 🔔 with orange badge count for unread notifications
- **Avatar**: 32px circle, dropdown menu on click (profile, collections, settings, logout)

### 4.2 Home Page (Three-Column Grid)
```
+-------------------+----------------------------+-------------------+
|   LEFT (240px)    |     CENTER (flex)          |   RIGHT (280px)   |
|                   |                            |                   |
| [User Card]       | [综合|关注|热榜] tabs       | [推荐话题]         |
|  60px avatar      |                            |  Topic icon+name  |
|  Name             | [Feed Card]                |  Follower count   |
|  关注|粉丝|获赞   |  Question title (18px bold) |  ...              |
|                   |  Author: 32px avatar+name  |                   |
| [Nav Card]        |  +headline                 |                   |
|  📱推荐 🔥热榜    |  Content preview (200ch)   |                   |
|  🎬视频 ⭐关注    |  Actions: 👍💬⭐🔗         |                   |
|                   |  Topic tags                |                   |
| [我关注的话题]    |                            |                   |
|  24px icon+name   | [Feed Card 2...]           |                   |
+-------------------+----------------------------+-------------------+
```
- Grid: `grid-template-columns: 240px 1fr 280px`, gap 20px, max-width 1200px

### 4.3 Question Page (Two-Column)
```
+------------------------------------------+-------------------+
|          MAIN (flex)                     |  SIDEBAR (280px)  |
|                                          |                   |
| [Question Card]                          | [相关问题]         |
|  Title (24px, bold)                      |  Question links   |
|  Description text                        |  ...              |
|  X人关注 · Y次浏览                        |                   |
|  Topic tags                              |                   |
|  [+关注问题] [邀请回答] [写回答]           |                   |
|                                          |                   |
| N 个回答  [默认排序] [按时间]              |                   |
|                                          |                   |
| [Answer Card]                            |                   |
|  40px avatar + name + headline           |                   |
|  Full answer content (pre-wrap)          |                   |
|  [👍赞同X] [💬X评论] [⭐收藏] [❤️感谢] [🔗分享] |              |
+------------------------------------------+-------------------+
```
- Grid: `grid-template-columns: 1fr 280px`, max-width 1000px

### 4.4 Hot List Page
```
+--------------------------------------------------+
|  知乎热榜 · 更新于 HH:MM                          |
|                                                   |
|  [1] Question title          热度: X万  [热badge] |
|      Description excerpt                          |
|  [2] Question title          热度: X万  [热]      |
|  ...                                              |
|  [50]                                             |
+--------------------------------------------------+
```
- Max-width 800px, centered
- Top 3 rank numbers in orange (`#ec5e28`)
- Top 10 items show red "热" badge

### 4.5 User Profile Page
```
+--------------------------------------------------+
| [PROFILE HEADER]                                  |
|  100px Avatar | Nickname (28px bold)              |
|               | Headline · Location · Industry    |
|               | Description                       |
|               | [+关注] or [编辑个人资料]          |
+--------------------------------------------------+
| [STATS: 关注X | 粉丝X | 获赞X | 收藏X]            |
+--------------------------------------------------+
| [回答 N] [文章] [想法] [收藏夹]  ← tabs           |
|                                                   |
| [Content cards matching selected tab]             |
+--------------------------------------------------+
```

### 4.6 Comment Dialog (from screenshot reference)
```
+--------------------------------------------------+
| 查看对话                                    [×]   |
|                                                   |
| [Full comment with context]                       |
|  👍 1643                                          |
|                                                   |
| 127 条回复                                        |
|                                                   |
| [Reply 1]                                         |
|  🖼️ [avatar] Username 回复 TargetUser  · 10天前   |
|  Reply content text                               |
|  👍 1935                                          |
|                                                   |
| [Reply 2...]                                      |
+--------------------------------------------------+
```
- Modal overlay with scrollable reply thread
- Each reply shows: avatar, username, "回复" target user, relative time
- Upvote count with thumbs-up icon
- Close button (×) in top-right

---

## 5. Color Palette & Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--primary-color` | `#0084ff` | Links, active tabs, primary buttons, logo |
| `--primary-hover` | `#056de8` | Hover state for primary elements |
| `--bg-color` | `#ffffff` | Card backgrounds, input backgrounds |
| `--bg-secondary` | `#f6f6f6` | Page background, search input bg |
| `--text-primary` | `#1a1a1a` | Headings, body text |
| `--text-secondary` | `#8590a6` | Meta text, timestamps, placeholders |
| `--border-color` | `#ebebeb` | Card borders, dividers, input borders |
| `--card-bg` | `#ffffff` | Cards and dropdown menus |
| `--link-color` | `#0084ff` | All clickable links |
| `--success-color` | `#00c853` | Success states |
| `--danger-color` | `#ec5e28` | Hot badges, notification badges, top rankings |
| `--tag-bg` | `#e8f3ff` | Topic tag background, active button highlight |
| `--shadow` | `0 1px 3px rgba(26,26,26,0.1)` | Default card shadow |
| `--shadow-hover` | `0 2px 8px rgba(26,26,26,0.15)` | Card hover shadow |

**Typography**: System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
**Border radius**: 4px for cards, 20px for search input (pill), 50% for avatars

---

## 6. Data Model Overview

See `data_model.md` for complete entity definitions.

**Core entities**: User, Question, Answer, Article, Comment, Topic, Collection, Notification, Idea

**Key relationships**:
- User → asks Questions, writes Answers, publishes Articles, posts Ideas
- Question → has many Answers, tagged with Topics
- Answer → belongs to Question, has many Comments
- Comment → nested replies (self-referencing), polymorphic target (answer/article/idea/comment)
- Topic → hierarchical (optional parentId), tagged on Questions/Articles/Ideas
- Collection → contains mixed Answer/Article/Idea items

---

## 7. What's Unique About Xhihu vs Quora

1. **Asymmetric voting**: Upvote (赞同) is prominent; downvote (反对) exists but is deliberately hidden
2. **"Thank" action**: Separate ❤️ 感谢 button — lighter appreciation without affecting ranking
3. **Hot List (热榜)**: Real-time trending rankings are a major destination (no Quora equivalent)
4. **Ideas (想法)**: Built-in microblog feature (like Twitter/Weibo within the Q&A platform)
5. **Articles/Columns (专栏)**: Full blogging platform integrated (like Medium)
6. **Answer collapse**: Low-quality answers auto-collapse with "该回答已被折叠" message
7. **Invite to Answer**: Strong culture of inviting specific experts
8. **All-Chinese UI**: Every label, placeholder, and interaction is in Simplified Chinese

---

## 8. Out of Scope for Mock

- **Authentication/Login**: App starts pre-logged-in as 张小凡 (user0)
- **Paid features**: Xhihu Salt membership, paid columns, Xhihu Live, e-books
- **Real-time communication**: WebSocket-based notifications, live updates
- **Video content**: Video section and video answers
- **E-commerce**: Product recommendations, affiliate links
- **AI features**: AI-generated summaries, recommendation algorithms
- **Mobile-specific features**: The mock targets desktop web only

---

## 9. Screenshots Reference

| File | Description |
|------|-------------|
| `zhihu_design_system_icons_colors.jpg` | Xhihu brand design system showing icon set, color palette (#1E84FC, #BAC6D5, #F3CC00, #0BCCE9, #343434, #747474, #CECECE) |
| `zhihu_mobile_homepage_feed.jpg` | Mobile homepage feed with tabs (关注/推荐/热榜/故事/直播/数码), answer cards with question titles, author badges, content previews, action bars (赞同/收藏) |
| `zhihu_desktop_comments_dialog.jpg` | Desktop comment dialog showing "查看对话" modal with nested reply thread, 273条评论, 精选评论(19), upvote counts, "回复" links, relative timestamps (10天前). Right sidebar partially visible showing navigation items. |
| `zhihu_article_submit_to_question.jpg` | Desktop "投稿至问题" dialog — submit article to a question with topic search, recommended questions with answer counts, follower counts, and view counts |
| `zhihu_hot_list_trending.jpg` | Trending hot search comparison showing heat scores and ranking badges |
