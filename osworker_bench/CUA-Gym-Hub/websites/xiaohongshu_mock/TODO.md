# Yiaohongshu (小红书) Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] **Project scaffold**: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`. Dependencies: `react`, `react-dom`, `react-router-dom`, `uuid`. Plain CSS only (no Tailwind).

- [x] **Visual design system**: `src/index.css` with all CSS custom properties:
  - `--xhs-red`: #FF2442, `--xhs-bg`, `--xhs-card-bg`, `--xhs-text`, `--xhs-text-secondary`, `--xhs-border`, `--xhs-link`
  - Font stack: "PingFang SC", "Helvetica Neue", "Microsoft YaHei", Arial, sans-serif
  - Full reset, dark mode via `[data-theme="dark"]`

- [x] **App layout**: TopNav fixed 56px height, logo, nav tabs, search bar, avatar/notification icons with badges

- [x] **Routing**: All routes implemented:
  - `/` → redirect to `/explore`
  - `/explore`, `/explore/:category` → ExplorePage
  - `/note/:noteId` → NoteDetailPage
  - `/user/:userId` → UserProfilePage
  - `/user/:userId/followers`, `/user/:userId/following` → FollowListPage
  - `/search` → SearchPage
  - `/notifications` → NotificationsPage
  - `/messages`, `/messages/:conversationId` → MessagesPage
  - `/publish` → PublishNotePage
  - `/go` → Go.jsx (state inspector)

- [x] **State management**: `src/context/AppContext.jsx` with all action dispatchers; `src/utils/dataManager.js` with `createInitialData()`, localStorage persistence, `getStateDiff()`

- [x] **`/go` endpoint**: `src/pages/Go.jsx` renders JSON `{ initial_state, current_state, state_diff }`

- [x] **Session isolation**: `vite.config.js` mock-api plugin with `/post`, `/go`, `/state`, `/upload`, `/files` endpoints; `?sid=` support

---

## P1 — Primary Features

<!-- Core features a user interacts with in the first 5 minutes. -->

- [x] **Explore waterfall feed** (`src/pages/ExplorePage.jsx`): CSS columns masonry grid, 4-5 columns responsive, category tabs, NoteCard components

- [x] **Note detail view** (`src/pages/NoteDetailPage.jsx` + `src/components/NoteDetailModal.jsx`): Modal overlay, image carousel, author header, content with hashtag/mention parsing, engagement bar, comments section

- [x] **Like a note**: Toggle heart on NoteCard and in NoteDetailModal, updates likedByIds, heart pulse animation

- [x] **Bookmark/Collect a note**: Toggle star/bookmark, updates bookmarkedByIds, fills yellow when bookmarked

- [x] **Comment on a note**: Input in note detail, submit creates comment, increments commentCount

- [x] **Reply to a comment**: Click "回复" sets parentCommentId, shows nested replies

- [x] **Like a comment**: Toggle heart on individual comments

- [x] **Follow/Unfollow user**: On user profile and in note detail author header, toggles followingIds/followerIds

- [x] **User profile page** (`src/pages/UserProfilePage.jsx`): Banner, avatar, stats, tabs (笔记/收藏/赞过), waterfall grid

- [x] **Search** (`src/pages/SearchPage.jsx`): Query in URL, filter tabs (笔记/用户), topic header for hashtag searches

- [x] **Notifications page** (`src/pages/NotificationsPage.jsx`): Tabs (赞和收藏/新增关注/评论和@), unread highlighting, mark all read

---

## P2 — Secondary Features

<!-- Depth and realism. Implement after P1 is complete. -->

- [x] **Publish a note** (`src/pages/PublishNotePage.jsx`): Image picker (preset images), title, content, category, location; validate then create note

- [x] **Image carousel in note detail**: Left/right arrows, dot indicators, image counter, keyboard navigation

- [x] **Edit/Delete own notes**: "···" menu on note detail, edit navigates to publish page, delete with confirmation dialog, pin toggle

- [x] **Edit profile** (`src/components/EditProfileModal.jsx`): Avatar picker, nickname, RED ID, bio, gender, location

- [x] **Direct messages** (`src/pages/MessagesPage.jsx`): Conversation list sidebar, chat view, message bubbles, send messages

- [x] **Topic/Hashtag page**: Clicking hashtag → `/search?q={hashtag}` with topic header showing note/view counts

- [x] **Dark mode**: Toggle in user dropdown, applies `data-theme="dark"` on `<html>`, persisted in localStorage

- [x] **Share note**: Copies note URL to clipboard, shows "链接已复制" toast

- [x] **Followers/Following pages** (`src/pages/FollowListPage.jsx`): User list with follow buttons

- [x] **Publish floating button** (FAB): Red circle bottom-right, navigates to `/publish`, hides on publish page

- [x] **Trending topics sidebar/section**: Hot hashtags list on explore page (not yet implemented)

---

## Data Seed (implement in createInitialData())

- [x] **Users**: 8 users (u1-u8) with avatars, banners, bios in Chinese, follower/following relationships
- [x] **Notes**: 25 notes across all categories, multiple images, titles/content in Chinese, varied like/bookmark counts
- [x] **Comments**: 37 comments across notes, including reply chains, Chinese text
- [x] **Notifications**: 18 notifications for u1, mix of types, 6 unread
- [x] **Conversations**: 3 conversations (u1↔u2, u1↔u3, u1↔u5), 5-7 messages each
- [x] **Topics**: 12 topics matching hashtags with realistic viewCount/noteCount

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login / logout (app starts pre-logged-in as user `u1` "生活美学家")
- E-commerce / shopping / product pages / cart / purchase flow
- Live streaming features
- Real file uploads (use preset placeholder images)
- Real network API calls (everything is local state)
- Payment or monetization features
- Account creation or registration
- Push notifications or email
- Video playback (video notes show a "▶" badge on thumbnail but don't need a real player)
