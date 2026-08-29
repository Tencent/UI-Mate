# Xhihu (知乎) Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing tech: React 18 + TypeScript + Vite + Zustand + react-router-dom
> Current state: Semi-functional with basic browsing; missing creation flows, comments UI, and many interactions

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell Fixes & Improvements

These items fix fundamental issues in the existing shell that affect all pages.

- [x] **Expand seed data in `src/data/initialData.ts`**: The mock currently has only 3 questions, 7 answers, 3 topics, 1 article, 1 idea, 1 notification, and 1 collection — far too little for a realistic experience. Expand to the counts specified in `data_model.md`: 10 users, 8 questions, 18 answers, 5 articles, 10 topics, 15+ comments with nested replies, 3 collections, 8 notifications (3-4 unread), 5 ideas. Each answer should be 300-800 Chinese characters with multiple paragraphs separated by `\n\n`. Pre-set interaction states: 3 answers upvoted, 2 favorited, 2 users followed, 3 topics followed, 2 questions followed. Use `https://api.dicebear.com/7.x/avataaars/svg?seed=<name>` for user avatars and `https://picsum.photos/48/48?random=topic<N>` for topic icons.

- [x] **Visual design system — match real Xhihu more closely**: Study `assets/screenshots/` and update `src/index.css`. The current `--primary-color: #0084ff` is correct. Ensure these exact tokens: `--primary-color: #0084ff`, `--primary-hover: #056de8`, `--bg-color: #ffffff`, `--bg-secondary: #f6f6f6`, `--text-primary: #1a1a1a`, `--text-secondary: #8590a6`, `--border-color: #ebebeb`, `--danger-color: #ec5e28`, `--tag-bg: #e8f3ff`. Add a `.btn-follow` class: blue border, blue text, 20px border-radius (pill shape), toggles to filled blue background when active. Add `.btn-danger` for delete/destructive actions. Add focus-visible outlines for accessibility.

- [x] **Fix Header nav links**: Currently "会员", "发现", and "等你来答" all link to `/hot`. Fix: "首页" → `/`, "会员" → remains non-functional (just visual), "发现" → `/discover` (new route), "等你来答" → `/waiting` (new route). Also add hover underline effect on active nav link.

- [x] **Add missing routes to App.tsx**: Add routes for: `/discover` → Discover page (P2), `/waiting` → WaitingForAnswer page (P2), `/article/:id` → Article detail page (P1), `/idea/:id` → Idea page (P2). For now, add placeholder components for P2 routes that show "功能开发中..." with a back-to-home link.

- [x] **Session isolation — already implemented via vite.config.ts middleware**: Verify the existing `/post`, `/state`, `/go`, `/upload`, `/files` endpoints work correctly. The vite.config.ts already has these. No changes needed unless testing reveals bugs.

- [x] **`/go` endpoint (StateInspector.tsx) — verify state_diff accuracy**: The existing StateInspector reads from Zustand's `getInitialState()` and `getCurrentState()`. Verify it produces correct diffs when: (a) user upvotes an answer, (b) user follows a topic, (c) user adds a comment. If `state_diff` is missing any changed fields, fix the diff logic.

---

## P1 — Primary Features

These are the core interactive workflows an agent needs to practice. Each must work end-to-end with state changes visible at `/go`.

### 1.1 Ask Question Modal

- [x] **"提问" button in Header opens modal**: When clicking the blue "提问" button in the header, show a centered modal overlay (640px wide, white background, 8px border-radius, box-shadow `0 4px 20px rgba(0,0,0,0.15)`) with:
  - Title input: `<input>` with placeholder "输入问题标题（最多50个字）", 18px font, bold, maxLength 50
  - Description textarea: `<textarea>` with placeholder "问题补充说明（可选）", 15px font, 120px height, auto-resize
  - Topic selector: Row of topic tag chips from `state.topics`; clicking a topic toggles it (blue highlight when selected, max 5 topics). Show topics as clickable `.tag` elements.
  - Action bar: "取消" secondary button (left-aligned) + "发布问题" primary blue button (right-aligned, disabled until title is non-empty)
  - Close: Clicking overlay backdrop or "取消" or × button in top-right closes the modal
  - **On submit**: Create new question object with `questionId: 'q_' + Date.now()`, `authorId: currentUser.userId`, `createdTime: Date.now()`, `followerCount: 0`, `viewCount: 0`, `answerCount: 0`, selected `topics[]`. Add to `state.questions` via new store action `addQuestion(question)`. Navigate to `/question/<new_id>`. Show toast "问题已发布".

- [x] **Add `addQuestion` action to Zustand store**: New action in `useStore.ts` that appends a question to `state.questions`, increments `currentUser.questionCount`, and calls `saveState()`.

### 1.2 Write Answer

- [x] **"写回答" button on Question page opens inline editor**: Currently the "写回答" button on the question page is non-functional. When clicked, show an inline answer editor below the question card (above the answers list):
  - Author preview: Current user avatar (32px) + name + headline
  - Textarea: 200px min-height, placeholder "写下你的回答...", 15px font, border `1px solid var(--border-color)`, focus border `var(--primary-color)`
  - Action bar: Character count (bottom-left) + "提交回答" primary button (bottom-right, disabled until content ≥ 10 chars)
  - **On submit**: Create answer object with `answerId: 'a_' + Date.now()`, `questionId: current question`, `authorId: currentUser.userId`, full content, `createdTime: Date.now()`, all counts at 0. Call `addAnswer(answer)`. Also update the question's `answerCount += 1` (add `updateQuestionAnswerCount(questionId)` store action). Clear the editor. Show toast "回答已发布". The new answer should appear at the top of the answer list.

- [x] **Add `updateQuestionAnswerCount` action to store**: Increment `answerCount` on the specified question.

### 1.3 Comment System

- [x] **Comment section UI on Question page answers**: Below each answer's action bar, add a toggleable comment section. Clicking "💬 X 条评论" button expands/collapses the comment list below the answer. The comment section shows:
  - Header: "X 条评论" with a close button
  - Comment list: Each comment shows: 24px avatar, bold author name, comment text, relative timestamp (use "X分钟前" / "X小时前" / "X天前" helper), upvote count with 👍 icon
  - Nested replies: Indented 40px left, show "Author 回复 TargetUser" pattern, same layout as parent comments
  - "Write comment" input bar at bottom: avatar + text input (placeholder "写下你的评论...") + "发布" button
  - **On submit**: Create comment with `commentId: 'c_' + Date.now()`, add via `addComment(targetId, comment)`. Update the answer's `commentCount += 1`. Clear input. Show the new comment immediately.

- [x] **Comment upvote**: Add `toggleCommentVoteup(commentId, targetId)` action to store. Clicking 👍 on a comment toggles the upvote and updates count. Track in a new `state.userCommentVoteups: { [commentId]: boolean }` — add this field to `AppState` type and initialData.

- [x] **Reply to comment**: Clicking "回复" on a comment shows a reply input below that comment. The reply input has placeholder "回复 @AuthorName". On submit, add a reply to the comment's `replies[]` array via a new store action `addCommentReply(targetId, parentCommentId, reply)`.

- [x] **Relative time helper**: Create `src/utils/timeHelper.ts` with function `formatRelativeTime(timestamp: number): string` that returns: "刚刚" (<1min), "X分钟前" (1-59min), "X小时前" (1-23h), "X天前" (1-29d), "X个月前" (1-11mo), "X年前" (>1yr). Use this throughout the app for timestamps.

### 1.4 Answer Detail Page

- [x] **Full Answer page at `/answer/:id`**: Currently shows only the answer ID. Implement a full page:
  - Header card: Link to parent question title (click navigates to `/question/:qid`)
  - Author card: 48px avatar, name (link to profile), headline, follow button
  - Full answer content with `white-space: pre-wrap`
  - Action bar: 👍 赞同 X, 💬 X 评论, ⭐ 收藏, ❤️ 感谢, 🔗 分享 — all functional
  - Comment section (same component as 1.3, reuse it)
  - Right sidebar: Related answers from the same question, "查看全部 N 个回答" link

### 1.5 User Profile — Complete Content Tabs

- [x] **User profile "回答" tab — already works**, shows user's answers. Verify it displays correctly with the expanded seed data.

- [x] **User profile "文章" tab**: Currently the "文章" tab exists but shows no content. When selected, display the user's articles from `state.articles.filter(a => a.authorId === userId)`. Each article card: cover image thumbnail (if exists, 120px×80px), title (link to `/article/:id`), content preview (100 chars), stats (👁 views, 👍 voteups, 💬 comments).

- [x] **User profile "想法" tab**: When selected, display the user's ideas from `state.ideas.filter(i => i.authorId === userId)`. Each idea card: content text, images grid (if any, max 3 thumbnails 100px×100px), stats (👍 likes, 💬 comments, 🔄 shares), relative timestamp.

- [x] **User profile "收藏夹" tab**: Only visible when viewing own profile (`userId === currentUser.userId`). Show list of `state.collections` with: name, description, item count, privacy badge (🔒 private / 🌐 public), "查看" link.

### 1.6 Article Detail Page

- [x] **Article page at `/article/:id`**: New page component `src/pages/Article.tsx`:
  - Cover image (full-width, 300px max-height, if coverImage exists)
  - Title: 28px bold
  - Author bar: 40px avatar, name (link to profile), headline, follow button, publish date
  - Content body: `white-space: pre-wrap`, 16px font, line-height 1.8
  - Topic tags at bottom
  - Action bar: 👍 赞同 X, 💬 X 评论, ⭐ 收藏, 🔗 分享
  - Comment section (reuse same comment component)
  - Sidebar: Related articles (same topic), author's other articles

### 1.7 Favorite/Collection Management

- [x] **"⭐ 收藏" action shows collection picker modal**: Currently `toggleFavorite` just toggles a boolean. Enhance: clicking "⭐ 收藏" on an answer opens a small dropdown/modal listing the user's collections with checkboxes. Each collection shows name and item count. User can check/uncheck collections to add/remove the answer. Include a "+ 创建新收藏夹" link at the bottom.
  - Add store action: `addItemToCollection(collectionId, itemId, itemType)` and `removeItemFromCollection(collectionId, itemId)`
  - The `userFavorites` dict should still track whether the answer is in ANY collection (for quick display)

- [x] **Create Collection modal**: Triggered from the collection picker's "+ 创建新收藏夹" link. Modal with: name input (required), description input (optional), privacy toggle (public/private, default private), "创建" primary button. Add store action `createCollection(collection)`.

### 1.8 Home Feed Improvements

- [x] **"关注" tab filters to followed content**: When the "关注" tab is active, filter the feed to show only answers where `userFollowings[answer.authorId]` is true OR the question's topics include a topic from `userFollowedTopics`. Currently all tabs show the same content.

- [x] **"热榜" tab shows top questions by views**: When the "热榜" tab is active, show question cards (not answer cards) sorted by `viewCount` descending. Each card: rank number (1-based), question title, follower count, view count, answer count. Top 3 ranks in orange.

- [x] **"阅读全文" expand/collapse on feed cards**: Currently feed cards truncate at 200 chars with "...". Add a "阅读全文 ▼" link after the truncated text. Clicking it expands to show full content with "收起 ▲" to collapse back. Use React state per card.

### 1.9 Search Improvements

- [x] **Search results with tabs**: Currently search shows all result types together. Add a tab bar: "综合" (default, mixed), "问题", "用户", "话题", "文章". Each tab filters to show only that content type. The "综合" tab shows the best match from each type.

- [x] **Search result highlighting**: Highlight the query text within search results using `<mark>` tags with `background: #fff2cc` styling.

- [x] **Empty search state**: When query has no results, show "没有找到相关结果" with a search icon illustration and suggestion text "换个关键词试试？".

### 1.10 Hot List Improvements

- [x] **Question descriptions on hot list items**: Currently hot list shows only titles. Add a truncated description (80 chars) below each title, plus answer count badge ("X 回答").

- [x] **Clickable hot list items**: Each item links to `/question/:id`. Add hover highlight effect (background `var(--bg-secondary)` on hover).

---

## P2 — Secondary Features

Implement after P1 is solid. These add depth and realism.

- [ ] **Thank action (感谢)**: On answer cards and the answer detail page, the "❤️ 感谢" button should toggle a thank state. Add `userThanks: { [answerId: string]: boolean }` to AppState and `toggleThank(answerId)` to store. Update the answer's `thankCount`. Style: heart turns red when thanked.

- [ ] **Downvote (反对)**: Add a subtle downvote button after the upvote button on answers. Small, gray, de-emphasized (Xhihu style: downvote exists but is not prominent). Toggle `userDownvotes` state. Downvoting removes any existing upvote and vice versa.

- [ ] **Answer sorting on Question page**: The "默认排序" and "按时间" buttons are currently non-functional. Implement: "默认排序" sorts by `voteupCount` descending (Wilson score simulation), "按时间" sorts by `createdTime` descending. Add visual active state (blue text + bottom border) to the selected sort option.

- [ ] **User hover card**: When hovering over any username link throughout the app, show a tooltip/popover card (300px wide, white bg, shadow) with: 48px avatar, name, headline, follower count, answer count, follow/unfollow button. Use `onMouseEnter`/`onMouseLeave` with a 300ms delay to show/hide. Popover should stay visible when hovering over it.

- [ ] **Discover page (`/discover`)**: New page with sections:
  - "热门话题" — Grid of trending topic cards with icon, name, description, follower count
  - "推荐专栏" — List of article collections
  - "精选圆桌" — Featured discussion panels (static mock content)
  Currently this route shows a placeholder — implement the full UI.

- [ ] **"Waiting for Answer" page (`/waiting`)**: Show questions that match the current user's followed topics and have `answerCount < 5`. Each card: question title, description preview, topic tags, answer count, "写回答" button (navigates to question page). Sort by `createdTime` descending.

- [ ] **Settings page**: Currently a placeholder. Implement a form-based settings page with sections:
  - **个人信息** (Profile): Editable nickname, headline, description, gender selector, location input, industry input. "保存" button updates `state.currentUser` via new `updateProfile(updates)` store action.
  - **通知设置** (Notifications): Toggle switches for notification types (赞同通知, 评论通知, 关注通知, 收藏通知). These are display-only settings (store in state but don't filter notifications).
  - **隐私设置** (Privacy): Toggle for "公开关注列表" and "公开收藏夹". Display-only.

- [ ] **Back-to-top button**: Add a floating "↑" button (48px circle, fixed bottom-right 40px, white bg, shadow) that appears when scroll > 300px and smoothly scrolls to top on click. Already has CSS class `.back-to-top` defined in index.css — implement the component and add it to App.tsx.

- [ ] **Toast notification system**: Create `src/components/Toast.tsx` — a toast that shows success/error messages at top-center of the page. Use the existing `.toast` CSS class. Expose via a `useToast()` hook or Zustand slice. Show toasts for: "回答已发布", "问题已发布", "评论已发布", "已收藏", "已取消收藏", "已关注", "已取消关注".

- [ ] **Close user dropdown on outside click**: The Header's user menu dropdown currently only closes when clicking the avatar button again. Add an `onClick` listener on the document to close it when clicking outside. Also close it when navigating to a new route.

- [ ] **Loading skeleton states**: When pages are loading data (initial render), show skeleton placeholder animations instead of blank space. Create a `Skeleton` component that renders gray animated rectangles matching the content layout. Apply to: feed cards, question page, user profile.

- [ ] **Empty states**: Show meaningful empty state messages when:
  - User has no answers: "还没有回答，去回答一个问题吧！"
  - User has no articles: "还没有发表文章"
  - Search has no results: "没有找到相关结果"
  - Collection is empty: "收藏夹为空"
  - No notifications: "暂无新消息"

- [ ] **Share action**: Clicking "🔗 分享" on answers/articles shows a small dropdown with: "复制链接", "分享到微信", "分享到微博". "复制链接" copies the answer/article URL to clipboard and shows a toast "链接已复制".

---

## Data Seed (implement in createInitialData())

See `assets/data_model.md` for complete specifications.

- [ ] **Users**: 10 users covering diverse professions (PM, psychologist, engineer, analyst, food blogger, doctor, lawyer, designer, AI researcher). Use Chinese names and realistic Chinese bios.
- [ ] **Questions**: 8 questions across topics (AI, learning, programming, books, finance, travel, health, design). Realistic follower/view counts.
- [ ] **Answers**: 18 answers with 300-800 Chinese character bodies, multiple paragraphs. Distribute 2-5 answers per question.
- [ ] **Articles**: 5 articles with longer content (500-1500 chars), cover images, diverse authors.
- [ ] **Comments**: 15+ comments with nested replies across 5+ answers. Each popular answer has 3-5 comments.
- [ ] **Topics**: 10 topics covering all question categories. Realistic follower counts (millions).
- [ ] **Collections**: 3 collections for current user (1 private default, 2 public themed).
- [ ] **Notifications**: 8 notifications covering all types, 3-4 unread.
- [ ] **Ideas**: 5 ideas from various users, some with images.

---

## Out of Scope

Dev must NOT implement these:

- **Authentication / login** — App starts pre-logged-in as `张小凡` (user0)
- **Paid features** — Xhihu Salt membership, paid columns, Xhihu Live, e-books, paid consultations
- **Real API calls** — All data is local state via Zustand + localStorage
- **Video content** — Video section and video answers
- **Real-time features** — WebSocket notifications, live updates
- **E-commerce** — Product recommendations, affiliate links
- **AI features** — Recommendation algorithms, AI summaries
- **Mobile responsive** — Desktop-only is fine for agent training
- **i18n** — All text is hardcoded Simplified Chinese
- **Dark mode toggle** — CSS vars are defined but no UI toggle needed
