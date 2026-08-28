# Xeddit Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-02
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing code: Already has a working scaffold (Vite+React+Tailwind, routing, basic post feed, voting, comments)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Current State Summary

The app already has a functional skeleton with:
- ✅ React + Vite + Tailwind + react-router-dom scaffold
- ✅ Top navbar with Xeddit logo, search bar, create/bell/message icons, user avatar+karma
- ✅ Home page with sort tabs (Hot/New/Top), post feed, right sidebar (Home card, Popular Communities)
- ✅ Post cards with vote sidebar, metadata line, title, content preview, action bar (Comments, Share, Award)
- ✅ Post detail page with dark overlay, comment editor, threaded comments
- ✅ Subreddit page with colored banner, icon, Join button, about sidebar, rules
- ✅ User profile page with banner, avatar, tabs (non-functional), karma, posts
- ✅ Search page with community and post results
- ✅ Create post page with Text/Image/Link tabs, subreddit selector
- ✅ Award modal with 5 award types
- ✅ Vote system (upvote/downvote with toggle, visual feedback)
- ✅ Comment system with nested replies, collapse/expand, voting, awards
- ✅ `/go` endpoint (GoPage.jsx) for state inspection
- ✅ Session isolation (vite.config.js mock-api plugin, dataManager with normalization)

**What needs improvement:** No left sidebar navigation (critical missing piece — Xeddit's desktop UI has a prominent left sidebar with Home/Popular/All/Subscriptions). Feed view modes missing (Card/Classic/Compact). No post flairs. No save/hide post functionality. User profile tabs don't switch content. Comment sorting is visual-only. No notifications panel. No "OP" or "Mod" badges. Seed data too minimal (only 3 subreddits, 3 posts, 4 comments, 4 users). No edit/delete for own posts/comments. Join button is local state only (not persisted). Search has no type tabs or time filters. No share (copy link) functionality. Missing keyboard shortcuts. No post options menu (three-dot). No markdown formatting toolbar in comment editor.

---

## P0 — Core Shell Fixes

<!-- Fix critical gaps that make the app not match Xeddit's real layout. -->

- [x] **Visual design system update**: Study `assets/screenshots/` (especially `homepage/000001.jpg` and `search_000001.jpg`) and update colors + fonts to match Xeddit's current desktop theme. Key values: page background `#DAE0E6` (already correct), card background `#FFFFFF`, card border `#CCCCCC` hover `#898989`, navbar bg `#FFFFFF` border-bottom `#EDEFF1`, left sidebar bg `#FFFFFF`, Xeddit orange `#FF4500` (primary brand), blue `#0079D3` (buttons, links, active states), upvote orange `#FF4500`, downvote periwinkle `#7193FF`, text primary `#1C1C1C`, text secondary `#787C7E`, text muted `#A8AAAB`, green online dot `#46D160`. Font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (already correct). Font sizes: post title 18px medium, metadata 12px, comment body 14px, sidebar headings 10px uppercase bold tracking-wide.

- [x] **Left sidebar navigation**: Add a collapsible left sidebar (~270px width, white bg, border-right #EDEFF1) that is visible on the homepage and all main pages. Structure from top to bottom: (1) "XEDDIT FEEDS" section header (10px, uppercase, gray, bold) with links: Home (house icon), Popular (trending-up icon), All (bar-chart icon) — active item has blue text + light blue bg. (2) Horizontal divider. (3) "SUBSCRIPTIONS" section header with alphabetical list of subreddits the user has joined (from `currentUser.joinedSubreddits`): each row shows 20px round subreddit icon + "r/name" text, hover bg #F6F7F8, clicking navigates to `/r/:id`. (4) "See more" expandable if > 5 items. Left sidebar should be sticky (top: 48px for navbar height), scrollable independently. On mobile (< 768px), sidebar is hidden behind a hamburger menu.

- [x] **Expand seed data**: Replace minimal seed data with rich, realistic data per `data_model.md`. Must include: 6 subreddits (each with 3-5 rules, 3-4 flairs, proper banner colors), 8 users with diverse karma/bios, 12+ posts across subreddits (mix of text/image/link types, 2 stickied, 1 locked, varied flairs, vote counts from 5 to 45K, timestamps spanning last 48 hours using `Date.now() - X` pattern), 25+ comments with 3-4 levels of nesting on popular posts, 5-10 pre-existing votes by currentUser, 8 award types (see data_model.md §Awards), 5-8 notifications (mix of read/unread), and proper currentUser with `joinedSubreddits`, `savedPosts`, `savedComments`, `hiddenPosts` arrays. Each post by currentUser (u1) should have at least 2 posts for edit/delete testing. At least one post should have multiple awards for award display testing.

- [x] **Data model expansion**: Update `initialData.js` entity schemas to match `data_model.md`. Add fields: (a) User: `postKarma`, `commentKarma` (replace single `karma`), `cakeDay`, `about`. (b) Subreddit: `bannerColor`, `created`, `flairs[]` (each with id/text/color/bgColor). (c) Post: `flairId`, `isStickied`, `isLocked`, `isSpoiler`, `isNSFW`, rename `comments` array to `commentIds`. (d) Comment: `isEdited`, `isDistinguished`, remove `replies` field (derive replies from `parentId` lookups). (e) CurrentUser: `postKarma`, `commentKarma`, `cakeDay`, `about`, `joinedSubreddits[]`, `savedPosts[]`, `savedComments[]`, `hiddenPosts[]`. (f) Add `notifications[]` array to state. Update all normalizer functions in `deepMergeWithDefaults()` to handle new fields with proper defaults. Update the `votes` array items to use `targetType` instead of `type` for clarity (value remains `"post"` | `"comment"`).

- [x] **Store actions expansion**: Add new actions to `store.jsx`: (a) `joinSubreddit(subredditId)` — adds to currentUser.joinedSubreddits. (b) `leaveSubreddit(subredditId)` — removes from currentUser.joinedSubreddits. (c) `savePost(postId)` / `unsavePost(postId)` — toggle in currentUser.savedPosts. (d) `saveComment(commentId)` / `unsaveComment(commentId)` — toggle in currentUser.savedComments. (e) `hidePost(postId)` / `unhidePost(postId)` — toggle in currentUser.hiddenPosts. (f) `editComment(commentId, newContent)` — updates content, sets isEdited=true. (g) `deleteComment(commentId)` — sets content to "[deleted]", userId to null. (h) `editPost(postId, {title, content})` — updates post fields. (i) `deletePost(postId)` — sets title to "[deleted]", content to "[removed]", userId to null. (j) `markNotificationRead(notificationId)` — sets notification.read = true. (k) `markAllNotificationsRead()` — sets all notifications read.

---

## P1 — Primary Interactive Features

<!-- Core features a user interacts with in the first 5 minutes. Agent training essentials. -->

- [x] **Post flairs display and filter**: (a) On PostCard metadata line, after awards, display the post's flair as a colored pill badge if `post.flairId` is set: lookup flair from `subreddit.flairs` by ID, render with flair.bgColor background, flair.color text, 10px font, rounded-full, px-2 py-0.5. (b) On subreddit pages, add a "Filter by Flair" section in the right sidebar showing all available flairs as clickable pills. Clicking a flair filters the post feed to only show posts with that flairId. Show "Clear filter" link when a filter is active. (c) On CreatePostPage, add a flair picker dropdown below the title input: shows available flairs for the selected subreddit as colored options. Selected flair attaches `flairId` to the new post.

- [x] **Comment sorting (functional)**: In PostPage, replace the static "Sort By: Best" text with a working dropdown selector. Options: Best (default), Top, New, Controversial, Old. Sorting logic: Best = (upvotes - downvotes) with time decay (higher score + newer = better), Top = upvotes - downvotes (highest first), New = newest first by created date, Controversial = most total votes with close to 50/50 ratio (Math.abs(upvotes - downvotes) / (upvotes + downvotes) < 0.3, sorted by total votes), Old = oldest first. Sort applies to top-level comments; within each thread, replies stay in chronological order. Style the dropdown as a small gray pill button that opens a dropdown menu.

- [x] **Save post/comment**: (a) Add a "Save" button to PostCard action bar (bookmark icon + "Save" text, or "Unsave" if already saved). Clicking calls `savePost(postId)` / `unsavePost(postId)`. Saved state checked against `currentUser.savedPosts`. (b) Add "Save" to Comment action buttons (same pattern, uses savedComments). (c) On UserPage, make the "Saved" tab functional: when clicked, show a combined feed of saved posts (as PostCards) and saved comments (as standalone comment previews with link to parent post). Show "Nothing saved yet" empty state.

- [x] **Hide post**: (a) Add "Hide" option to PostCard action bar (eye-off icon + "Hide"). Clicking calls `hidePost(postId)`. (b) On Home/Subreddit feed, filter out posts where `currentUser.hiddenPosts.includes(post.id)`. (c) Show a brief "Post hidden" confirmation toast/banner with "Undo" link that calls `unhidePost(postId)`. Toast auto-dismisses after 5 seconds.

- [x] **Post actions dropdown menu**: Add a three-dot menu (⋯) button at the end of PostCard's action bar. On click, show a dropdown menu with options: (a) "Save" / "Unsave" (bookmark icon). (b) "Hide" (eye-off icon). (c) "Copy Link" (link icon) — copies `window.location.origin + /post/${post.id}` to clipboard, shows brief "Link copied!" tooltip. (d) "Report" (flag icon) — shows alert "Reported. Thanks for helping keep Xeddit safe." (mock). (e) If post is by currentUser: "Edit" (pencil icon) — navigates to edit mode, "Delete" (trash icon, red text) — shows confirmation modal "Are you sure? This can't be undone." with "Delete" (red) and "Cancel" buttons. Menu style: white bg, rounded-md shadow-lg, border gray-200, each item is icon + text, hover bg gray-100, 200px min-width.

- [x] **Edit/delete own posts**: (a) Edit: clicking "Edit" from post menu on a text post transforms the post content area into an editable textarea pre-filled with current content, with "Save" and "Cancel" buttons below. Save calls `editPost(postId, {content: newContent})`. Title is not editable (matches real Xeddit). For link/image posts, edit is not available. (b) Delete: Confirmation modal, then calls `deletePost(postId)`. Post card shows "[deleted]" title and "[removed]" content after deletion, with grayed-out metadata.

- [x] **Edit/delete own comments**: (a) On hover over own comment, show a three-dot menu with "Edit" and "Delete" options (or inline pencil/trash icons). (b) Edit: transforms comment text into a textarea pre-filled with current content. Show "Save Edits" and "Cancel" buttons. Save calls `editComment(commentId, newContent)`. Show "(edited)" text in muted gray after timestamp for edited comments (where `isEdited === true`). (c) Delete: show confirmation, then call `deleteComment(commentId)`. Deleted comments show "[deleted]" content with "[deleted]" username.

- [x] **Join/Leave subreddit (persisted)**: Replace the current local-state-only Join button on Subreddit page. (a) Check join status from `currentUser.joinedSubreddits.includes(subreddit.id)`. (b) "Join" button: filled blue (#0079D3), white text, rounded-full. Clicking calls `joinSubreddit(subredditId)`. (c) "Joined" button: white bg, gray border, gray text. On hover, text changes to "Leave" with red border. Clicking calls `leaveSubreddit(subredditId)`. (d) Also show Join/Leave buttons on subreddit rows in search results and on the left sidebar. (e) Left sidebar should reactively update when subreddits are joined/left.

- [x] **User profile tabs (functional)**: Make all tabs on UserPage switch content: (a) "Overview" (default): shows a mixed feed of user's posts and comments, sorted by newest first. Comments in overview show: parent post title as a link header, then the comment body with vote count. (b) "Posts": shows only the user's posts as PostCards. (c) "Comments": shows only the user's comments with context (parent post title as link, subreddit name, the comment body, vote count). (d) "Saved": only visible on currentUser's own profile — shows saved posts and comments (from `currentUser.savedPosts` and `savedComments`). (e) Each tab keeps track of its active state via URL query param or local state. Profile sidebar should show: avatar, username, postKarma + commentKarma breakdown, Cake Day (formatted as "Month Day, Year"), about/bio text.

- [x] **Notifications panel**: (a) Clicking the bell icon in Navbar opens a dropdown panel (360px wide, max-height 480px, scrollable, white bg, shadow-xl, rounded-md). (b) Header: "Notifications" title + "Mark all as read" link button. (c) Each notification row: left colored indicator (blue dot for unread, nothing for read), icon based on type (reply=message icon, upvote=arrow-up, award=gift, mention=at-sign), notification text, relative timestamp. Hover bg gray-100. Clicking navigates to the relevant post/comment and marks as read. (d) Show unread count as red badge on bell icon (absolute positioned, -top-1 -right-1, min-w-4 h-4, bg-red-500 text-white text-[10px] rounded-full). (e) Empty state: "No notifications yet" with muted icon. (f) Uses state.notifications array and actions markNotificationRead/markAllNotificationsRead.

- [x] **Share button (copy link)**: Replace the current non-functional Share button on PostCard. Clicking copies the post URL (`window.location.origin + '/post/' + post.id`) to clipboard using `navigator.clipboard.writeText()`. After copying, show a brief tooltip/toast "Link Copied!" for 2 seconds. Icon: share-2 (or external-link). Same functionality on Comment share button (copies link with comment anchor).

- [x] **Stickied posts**: In subreddit feeds, stickied posts (`isStickied === true`) should always appear at the top of the feed regardless of sort order. Render them with a green "📌 Stickied post" indicator above the title (or green shield icon + "Pinned by moderators" text in muted green). Stickied posts should have a subtle green-tinted left border or background.

- [x] **Locked posts**: Posts with `isLocked === true` should show a lock icon (🔒) next to the title in muted orange/yellow. On the post detail page, the comment editor should be replaced with a message: "🔒 Comments are locked. You won't be able to comment." No reply buttons on comments either.

- [x] **OP and Mod badges**: (a) When a comment's `userId` matches the parent post's `userId`, show an "OP" badge next to the username — small blue rounded pill, white text, "OP" (stands for Original Poster). (b) When a comment's `isDistinguished === true`, show a green "MOD" badge next to username and green-tinted username text. (c) When a comment is by a moderator of the subreddit (check `subreddit.moderators.includes(comment.userId)`), show a small green shield icon.

- [x] **Search improvements**: (a) Add tab bar at top of search results: "Posts" | "Communities" | "People" — clicking switches which type of results is shown. "People" tab filters users by username match. (b) Add sort options for post results: Relevance (default), Hot, Top, New, Comments (most comments). (c) Add time filter dropdown: All Time, Past Hour, Past 24 Hours, Past Week, Past Month, Past Year. (d) Show result count: "X results for 'query'". (e) Community results should be in a separate card section with "Join" buttons. (f) People results show user card: avatar, username, karma, about preview.

---

## P2 — Secondary Features

<!-- Depth and realism, implement after P1 is solid. -->

- [ ] **Feed view mode toggle**: Add view mode toggle buttons (3 icons) in the sort bar on home/subreddit pages: (a) "Card" view (current default): full post cards with content preview and images. (b) "Classic" view: compact cards with small thumbnail (70x52px) on the left, title + metadata on right, no body text preview. (c) "Compact" view: minimal rows — just vote arrows, thumbnail, title, subreddit, and comment count in a single tight row (~32px height). Store selected view mode in state. Toggle icons should highlight the active mode in blue.

- [ ] **Markdown formatting toolbar**: In the comment editor (PostPage and reply boxes), add a formatting toolbar between the textarea and submit button. Buttons: Bold (**B**), Italic (*I*), Link (🔗), Strikethrough (~~S~~), Inline Code (`<>`), Superscript (^), Heading (#), Bulleted List, Numbered List, Quote Block (>). Clicking a button wraps selected text in the appropriate markdown syntax (or inserts placeholder template). Show a "Markdown mode" / "Fancy Pants Editor" toggle link. The formatting is display-only (renders as plain text in comments for this mock).

- [ ] **Spoiler and NSFW post tags**: (a) On CreatePostPage, add toggle buttons below the content area: "Spoiler" toggle and "NSFW" toggle (pill-shaped, red bg when active). (b) In PostCard, if `isSpoiler === true`: blur content/images behind a "Spoiler" overlay with click-to-reveal. Show red "Spoiler" badge next to title. (c) If `isNSFW === true`: show red "NSFW" badge next to title, blur image thumbnails.

- [ ] **Poll post type**: (a) In CreatePostPage, add a "Poll" tab (bar-chart icon). UI: title input + 2-6 option inputs ("Option 1", "Option 2", + "Add Option" button up to 6) + voting duration dropdown (1 day, 2 days, 3 days, 5 days, 7 days). (b) Add `pollOptions` field to post data: array of `{id, text, votes: 0}`. (c) In PostCard/PostPage, render poll as: list of option bars with text, vote count, and fill percentage bar (blue fill). Total votes shown. If currentUser hasn't voted, show radio buttons to select an option + "Vote" button. After voting, show results with percentage bars. (d) Add `votePoll(postId, optionId)` action to store.

- [ ] **User dropdown menu**: Clicking the user avatar/karma area in the top-right of Navbar opens a dropdown menu (240px wide, white bg, rounded-md, shadow-lg). Items: user avatar + username + karma at top (not clickable, just display), divider, "My Profile" (person icon) → navigate to /user/u1, "User Settings" (gear icon) → show settings stub, "Create Avatar" (palette icon) → non-functional, divider, "Dark Mode" (moon icon) with toggle switch, divider, "Log Out" (non-functional, shows as disabled/grayed). Dark mode toggle stores preference but actual dark theme implementation is optional (P2-stretch).

- [ ] **Comment context menus**: Right-click on a comment shows context menu (or three-dot menu on mobile): "Reply", "Give Award", "Save", "Copy Text" (copies comment.content to clipboard), "Report" (mock alert), separator, "Edit" (own comments only), "Delete" (own comments only, red text). Menu style: white bg, rounded shadow, each item icon + label, hover bg gray-100. Use `onContextMenu` handler, position menu at cursor.

- [ ] **Community creation modal**: Clicking "Create Community" button on home sidebar opens a modal dialog (480px wide, white bg, rounded-lg). Content: "Create a community" title with X close button, "Name" label + text input (prefixed with "r/", 21 char limit, show remaining chars), "Community Type" radio buttons (Public / Restricted / Private — each with icon and description), "Adult content" checkbox with NSFW badge. "Cancel" and "Create Community" buttons at bottom. On create: adds new subreddit to state with default icon, auto-joins currentUser, navigates to new subreddit page. Name validation: lowercase, numbers, underscores only, 3-21 chars.

- [ ] **Infinite scroll / load more**: On Home and Subreddit feeds, only show first 10 posts initially. Add a "Load More" button (or scroll-based infinite loading) that reveals the next batch of posts. Show a loading spinner during the brief delay (setTimeout 300ms mock). If all posts are shown, display "You've reached the end" message.

- [ ] **Crosspost UI**: Add "Crosspost" option in post action bar / three-dot menu. Clicking opens a modal: "Submit a crosspost" title, shows original post preview (title, subreddit, author), subreddit selector for destination, optional title override input. Submit creates a new post of type "crosspost" with reference to the original post. In feed, crosspost cards show a nested card preview of the original post with "Crossposted from r/subredditname".

- [ ] **Keyboard shortcuts**: Implement basic Xeddit keyboard shortcuts: J/K = next/prev post in feed (highlight active post with blue left border), A = upvote highlighted post, Z = downvote highlighted post, Enter = open highlighted post, X = expand/collapse highlighted post content, C = open comments, Escape = go back / close modal. Show a "?" keyboard shortcut help modal listing all shortcuts. Only active when no input/textarea is focused.

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. -->

- [x] **Users**: 8 users per `data_model.md §Users` table, with diverse karma levels (120 to 89,400 postKarma), varied bios, different cake days spanning 2019-2024. CurrentUser (u1) is "redditor_42" with 3,450 postKarma and 8,920 commentKarma.

- [x] **Subreddits**: 6 subreddits per `data_model.md §Subreddits` table (technology, funny, programming, science, gaming, AskReddit). Each with 3-5 rules, 3-4 flairs with distinct colors, proper banner colors, member counts ranging from 5.2M to 45M, realistic creation dates. CurrentUser subscribed to all 6.

- [x] **Posts**: 12+ posts: 4 text posts with substantial body content (2-4 paragraphs), 3 image posts (picsum.photos URLs with varied dimensions), 3 link posts, 1 poll post with 3-4 options and existing votes, 1 locked post. 2 stickied posts (one in r/technology, one in r/AskReddit). 2 posts by currentUser (u1). Timestamps spanning last 48 hours. At least 3 posts should have awards (mix of Silver, Gold, Wholesome, Helpful). Vote counts vary: some with 5-50 (new), some with 1K-15K (popular), one with 25K+ (viral). Each post has at least 1 flair.

- [x] **Comments**: 25+ comments across the posts. Popular posts (p1, p2) should have 5-8 top-level comments with 2-3 levels of reply nesting. At least 2 comments by currentUser for edit/delete testing. 1 distinguished moderator comment. Several "OP" comments (post author replying). Mix of vote counts (1 to 2,000). Timestamps after their parent.

- [x] **Votes**: 8-10 pre-existing votes by currentUser (u1): 5 upvotes and 3 downvotes on various posts and comments, so the feed shows some items already voted on.

- [x] **Notifications**: 6 notifications: 2 reply notifications (unread), 1 mention notification (unread), 1 upvote milestone notification (read), 1 award notification (read), 1 post reply notification (unread). Total 3 unread for the bell badge count.

- [x] **Awards**: 8 award types per `data_model.md §Awards`: Silver, Gold, Platinum, Wholesome, Helpful, Hugz, Rocket Like, Mind Blown.

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login (app starts pre-logged-in as `redditor_42`, user ID `u1`)
- Xeddit Premium / Gold purchasing flow (visual badges only)
- Real API calls or server communication (all data from localStorage/dataManager)
- File uploads (image posts use URL input)
- Video/GIF post types
- Xeddit Chat / real-time messaging (show chat icon in navbar as non-functional)
- Moderation tools (no mod queue, automod, ban tools — keep visual moderator badges only)
- Advertising / promoted posts in feed
- Real markdown rendering engine (basic formatting is fine, no need for full CommonMark parser)
- Custom subreddit CSS/themes (use bannerColor for variety)
- Email verification, password reset, account settings that affect auth
- Subreddit analytics or traffic stats
- Xeddit coins / premium currency
- Multi-xeddit creation and management (visual stub only in sidebar)
