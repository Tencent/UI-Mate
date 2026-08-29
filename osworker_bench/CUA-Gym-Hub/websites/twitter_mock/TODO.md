# Xwitter/X Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-02-28
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Primary screenshot reference: `assets/screenshots/profile_000002.jpg`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

These items maintain/fix the existing foundation. The mock already has a working scaffold, routing, state management, and session isolation. P0 items fill critical gaps in the core shell.

- [x] Project scaffold: Vite + React + Tailwind + react-router-dom (already done)
- [x] App layout: 3-column (left sidebar 275px / main 600px max / right sidebar 350px) with responsive collapse (already done)
- [x] Routing: BrowserRouter with routes for `/`, `/explore`, `/notifications`, `/messages`, `/bookmarks`, `/lists`, `/profile/:handle`, `/profile/:handle/following`, `/status/:id`, `/go` (partially done — `/messages`, `/bookmarks`, `/lists` routes need adding)
- [x] State management: DataContext + mockData.js with createInitialData() (already done)
- [x] `/go` endpoint: GoPage.jsx returning `{initial_state, current_state, state_diff}` (already done)
- [x] Session isolation: vite.config.js mock-api plugin with POST `/post?sid=` and GET `/state?sid=` (already done)

- [x] **Visual design system audit**: Review all components against `assets/screenshots/profile_000002.jpg`. The existing mock uses Tailwind. Ensure the following exact design tokens are applied consistently:
  - **Primary color**: `#1DA1F2` (Xwitter Blue) — used for links, active tab indicators, Follow button fill, Post button fill, active icons
  - **Text primary**: `#0F1419` — display names, post body, page titles
  - **Text secondary**: `#536471` — handles, timestamps, inactive nav labels, meta text
  - **Background**: `#FFFFFF` — main bg
  - **Background hover**: `#F7F9F9` — post card hover, sidebar nav item hover
  - **Border/divider**: `#EFF3F4` — 1px borders between posts, right sidebar panel borders
  - **Like active**: `#F91880` (pink-red) — filled heart icon + count color
  - **Repost active**: `#00BA7C` (green) — filled repost icon + count color
  - **Bookmark active**: `#1DA1F2` — filled bookmark icon
  - **Danger**: `#F4212E` — delete actions
  - **Font**: System font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
  - Verify all hover states use circular background highlight on icon buttons (e.g., like button hover = pink bg circle, repost hover = green bg circle)

- [x] **Add missing routes**: Add routes in App.jsx for `/messages`, `/bookmarks`, `/lists`, `/compose` (for modal-based compose via URL). Create placeholder pages if components don't exist yet. Ensure all sidebar navigation items link to correct routes.

- [x] **Expand seed data**: Update `mockData.js` `createInitialData()` to include all entity types from `data_model.md`. Currently has 3 users and 3 posts — expand to: 8 users, 18 posts, 10 replies, 10 notifications, 4 conversations, 15 direct messages, 2 lists, 10 trends, and a `bookmarkedPostIds` array. Keep existing fields (`tweetId` aliased to `postId` in replies for backward compat) but add new fields: `bookmarks[]` on posts, `views` number on posts, `quotedPostId` on posts, `inReplyToPostId`/`inReplyToUserId` on posts, `pinnedPostId` on users, `website`/`location`/`joinedDate` on users, `banner` on users. See `data_model.md` for complete field specs and realistic values.

- [x] **Update DataContext with new actions**: Add these state actions to DataContext.jsx:
  - `toggleBookmark(postId)` — add/remove currentUser.id from post.bookmarks[], update bookmarkedPostIds[] order
  - `addQuotePost(content, quotedPostId)` — create new post with quotedPostId set
  - `deletePost(postId)` — remove post from posts array, clean up replies/notifications referencing it
  - `pinPost(postId)` — set currentUser.pinnedPostId = postId (or null to unpin)
  - `updateProfile({ name, bio, location, website })` — update currentUser fields
  - `sendDirectMessage(conversationId, content)` — add DM to directMessages, update conversation.lastMessageId/lastMessageAt
  - `markConversationRead(conversationId)` — set all messages as read, reset unreadCount
  - `createList(name, description, isPrivate)` — add new list
  - `addToList(listId, userId)` / `removeFromList(listId, userId)` — manage list members
  - `deleteList(listId)` — remove list
  - `markNotificationRead(notificationId)` — mark single notification as read
  - Ensure all mutations trigger proper state diff tracking for `/go` endpoint

- [x] **Data normalization for POST API**: In `mockData.js` (or wherever custom state merging happens), add normalizers for new entity types: `conversations`, `directMessages`, `lists`, `trends`, `bookmarkedPostIds`. Ensure POSTed custom state with missing fields gets sensible defaults (empty arrays, 0 counts, false booleans). Normalize `tweetId` ↔ `postId` in replies. Ensure `post.bookmarks` defaults to `[]`, `post.views` defaults to `0`.

---

## P1 — Primary Features

Core interactive workflows that users perform in the first 5 minutes. Dev must implement these after P0.

### P1.1 — Home Feed Improvements

- [x] **Feed tab switching ("For you" / "Following")**: Add a tab bar at top of Home page with two tabs: "For you" (shows all posts sorted by engagement — likes + reposts desc) and "Following" (shows only posts from users the currentUser follows, sorted chronologically desc). Active tab has a 3px bottom border in `#1DA1F2`. Tabs are horizontally centered, each taking 50% width. Tab text is 15px, bold when active, gray (`#536471`) when inactive. Clicking a tab filters the feed instantly. Default to "For you" tab.

- [x] **Post card engagement bar improvements**: Each post card action bar must show: 💬 reply icon + count, 🔁 repost icon + count, ❤️ like icon + count, 📊 views count (eye icon), 🔖 bookmark icon, ↗️ share icon. Currently missing: views count, bookmark icon. Add `views` display between like and bookmark. Bookmark icon toggles filled/unfilled — filled = `#1DA1F2`, unfilled = `#536471`. Each icon button should have a circular hover background: reply → light blue, repost → light green, like → light pink, bookmark → light blue, share → light blue. The hover circle is 34px diameter, icon is 18px.

- [x] **Post three-dot menu (⋯)**: Each post card shows a `⋯` button in the top-right corner (next to timestamp). Clicking opens a dropdown menu positioned below the button. Menu items depend on whether post belongs to currentUser:
  - **Own post**: "📌 Pin to your profile" / "Unpin from profile", "🗑️ Delete" (red text, confirm dialog), "📋 Copy link to post"
  - **Other's post**: "🔇 Mute @handle", "🚫 Block @handle", "📋 Copy link to post", "⚑ Not interested in this post"
  - Menu has rounded corners (12px), shadow, white background, ~200px wide. Each item is 48px tall with icon + label. Click outside closes menu.

### P1.2 — Bookmark System

- [x] **Toggle bookmark on posts**: Clicking the bookmark icon on any post card or post detail page toggles the bookmark state. When bookmarked: icon fills solid blue (`#1DA1F2`), count is NOT shown (bookmarks are private). When un-bookmarked: icon is outline gray. This calls `toggleBookmark(postId)` action. Animate the icon on toggle (brief scale-up 1.0→1.2→1.0, 200ms).

- [x] **Bookmarks page (`/bookmarks`)**: Top bar: "Bookmarks" left-aligned title (20px bold), @handle below in gray (13px). Right side: `⋯` menu button (opens dropdown with "Clear all Bookmarks" option — shows confirm dialog). Below: list of bookmarked posts in reverse-bookmark-order (most recently bookmarked first), using the same PostCard component as the home feed. If no bookmarks: empty state — centered icon (large bookmark outline), "Save posts for later" title (30px bold), "Bookmark posts to easily find them again in the future." subtitle (15px gray).

### P1.3 — Quote Post

- [x] **Quote post flow**: When user clicks repost icon, show a dropdown with two options: "🔁 Repost" (toggles repost) and "✍️ Quote" (opens compose modal with quoted post embedded). The compose modal for quote shows: current user avatar, textarea ("Add a comment"), and below the textarea a mini embedded card showing the quoted post (avatar, name, handle, truncated content, border-radius 16px, border `#EFF3F4`). Posting calls `addQuotePost(content, quotedPostId)`. The resulting post displays in the feed with the quoted post card embedded below the content.

- [x] **Quoted post display in feed**: When a post has `quotedPostId` set, render an embedded card below the post content showing: the quoted post's author avatar (20px), name, handle, truncated content (max 3 lines, ellipsis), and if it has an image, a small thumbnail. The embedded card has `border: 1px solid #EFF3F4`, `border-radius: 16px`, `padding: 12px`, and is clickable (navigates to the quoted post's detail page `/status/:quotedPostId`).

### P1.4 — Profile Page Enhancements

- [x] **Edit profile modal**: On own profile page, show "Edit profile" button (pill-shaped, black border, "Edit profile" label) instead of Follow button. Clicking opens a modal (centered, max-width 600px, dimmed backdrop). Modal has: "Edit profile" title + "Save" button (top bar), banner image (clickable camera icon to "change" — just show a placeholder swap), avatar (clickable camera icon), form fields: Name (input, max 50 chars), Bio (textarea, max 160 chars), Location (input), Website (input). Character counters appear under Name and Bio when focused. "Save" calls `updateProfile()` and closes modal. "X" button in top-left closes without saving.

- [x] **Profile tabs (Posts / Replies / Media / Likes)**: Currently only "Posts" tab works. Add 4 functional tabs:
  - "Posts" — current user's posts (excluding replies), reverse chronological. Show pinned post at top with "📌 Pinned" label if `pinnedPostId` is set.
  - "Replies" — posts by this user where `inReplyToPostId` is not null, each shown with the parent post context above it (muted, smaller)
  - "Media" — posts by this user that have `images.length > 0`, displayed as a grid of thumbnails (3 columns, square aspect ratio, 4px gap)
  - "Likes" — posts that this user has liked (iterate all posts, filter where `post.likes.includes(profileUser.id)`)
  - Active tab: bold text, 3px bottom border `#1DA1F2`. Inactive: gray text `#536471`, no border.

- [x] **Followers page (`/profile/:handle/followers`)**: Similar to existing FollowingList page but shows users who follow the profile user. Each user card: avatar (48px), name (bold), handle (gray), bio (1 line truncated), "Follow"/"Following" button (pill). "Following" button has black bg + white text; on hover shows "Unfollow" in red. "Follow" button has black border, white bg, black text.

### P1.5 — Notifications Improvements

- [x] **Notification tabs ("All" / "Mentions")**: Add tab bar at top of Notifications page. "All" shows all notification types. "Mentions" filters to only `type: "mention"` and `type: "reply"` notifications. Active tab styling: bold text, `#1DA1F2` bottom border. Persist active tab in component state.

- [x] **Rich notification rendering**: Each notification type needs a distinct visual treatment:
  - **Follow**: Blue person+ icon (left), then "[Name] followed you". No post preview.
  - **Like**: Red heart icon (left), then "[Name] liked your post" + below: the liked post content preview (truncated 2 lines, gray text, padded-left).
  - **Repost**: Green repost icon (left), then "[Name] reposted your post" + post preview.
  - **Reply**: Blue reply icon (left), then "[Name] replied to your post" + reply content, clickable → navigates to post detail.
  - **Mention**: Blue @ icon (left), then "[Name] mentioned you in a post" + post content preview.
  - Unread notifications: white background. Read notifications: `#F7F9F9` background (or vice versa — unread should be visually prominent). Clicking a notification marks it as read and navigates to the relevant post/profile.

- [x] **Notification badge in sidebar**: The Notifications nav item in the sidebar shows a badge with the count of unread notifications. Badge is a blue circle (`#1DA1F2`) with white number, positioned top-right of the bell icon. If count > 9, show "9+". If 0 unread, hide badge. Similarly, Messages nav item shows unread DM count badge.

### P1.6 — Direct Messages

- [x] **Messages page (`/messages`)**: Split-pane layout within the main content area (no right sidebar on this page). Left pane (~380px): "Messages" title + "⚙️" settings icon + "✉️+" new message icon (top bar), search bar ("Search Direct Messages"), then conversation list. Right pane (remaining width): active conversation or "Select a message" empty state.

- [x] **Conversation list**: Each conversation row: avatar of other participant (48px), name (bold, 15px), @handle (gray, 15px), " · " separator, relative timestamp, second line: last message preview (truncated, gray, 14px). If unread: name is bold, blue dot indicator on left. Clicking a conversation selects it (light blue background `#EFF3F4`) and loads messages in the right pane. Conversations sorted by `lastMessageAt` descending.

- [x] **Conversation view**: Top bar: other user's name (bold) + @handle + "ℹ️" info icon. Message area: scrollable, messages displayed as bubbles. Sent messages (from currentUser): right-aligned, blue background (`#1DA1F2`), white text, rounded corners (18px, bottom-right: 4px). Received messages: left-aligned, gray background (`#EFF3F4`), dark text, rounded corners (18px, bottom-left: 4px). Timestamps shown as thin separators between message groups (when >1 hour gap). Compose bar at bottom: text input ("Start a new message"), send button (arrow icon, blue, enabled when input non-empty). Sending calls `sendDirectMessage()`. Auto-scroll to bottom on new message.

- [x] **New message modal**: Clicking the new message icon (✉️+) opens a modal: "New message" title, search bar to find users ("Search people"), results list showing matching users (avatar, name, handle). Selecting a user opens/creates a conversation with them. If conversation already exists, navigate to it. If new, create a new conversation entry.

### P1.7 — "Who to Follow" Panel

- [x] **"Who to follow" in right sidebar**: Below the "Trends for you" panel, add a "Who to follow" panel. Shows 3 users that currentUser does NOT follow. Each row: avatar (40px), name (bold, 15px), handle (gray, 15px), verified badge if applicable, "Follow" button (pill, black bg, white text, 32px height). On Follow click: button changes to "Following" (white bg, black border), user added to currentUser.following[]. "Show more" link at bottom in `#1DA1F2`. Panel has white background, border-radius 16px, and thin `#EFF3F4` border.

### P1.8 — Compose Modal Improvements

- [x] **Compose modal (triggered by sidebar "Post" button)**: Opens a centered modal (max-width 600px). Top bar: "X" close button (left), "Drafts" link (right, blue). Content area: current user avatar (40px, left), textarea placeholder "What is happening?!" expanding as user types. Below textarea: toolbar with icons — 🖼️ Image (blue), GIF (blue), 📊 Poll (blue), 😊 Emoji (blue), 📅 Schedule (blue), 📍 Location (blue). These icons are 20px, `#1DA1F2` color. Bottom bar: "🌐 Everyone can reply" dropdown selector + character counter (circular ring that fills clockwise, blue when <260 chars, yellow at 260-280, red at >280) + "Post" button (pill, `#1DA1F2` bg, white text, disabled/50% opacity when empty). When a character is typed, the Post button becomes enabled. Max 280 characters — counter shows remaining when <20 chars left. For this mock: Image button can show a file input or just add a placeholder image URL, GIF button can show a small picker of 4-6 preset GIFs, Poll/Schedule/Location can show "Coming soon" toast. Pressing Ctrl+Enter also submits.

---

## P2 — Secondary Features

Depth and realism features. Implement only after all P1 is solid.

- [x] **Hashtag highlighting**: In post content, detect `#word` patterns and render them as blue (`#1DA1F2`) clickable links. Clicking a hashtag navigates to `/explore?q=%23word` (search for that hashtag).

- [x] **@mention highlighting**: In post content, detect `@word` patterns and render them as blue (`#1DA1F2`) clickable links. Clicking a mention navigates to `/profile/word`.

- [x] **URL link detection**: In post content, detect `https?://...` URLs and render them as blue clickable links (truncated to domain + path, max 30 chars). URLs open in new tab (`target="_blank"`).

- [ ] **Image lightbox/modal**: Clicking an image in a post opens a fullscreen dark overlay modal. The image is centered and scaled to fit viewport. Navigation arrows if multiple images. Close with X button or Escape key or clicking outside. Show post content + engagement below the image.

- [ ] **Post polls**: Add poll support to composer. Clicking poll icon in compose toolbar adds poll fields: 2-4 option inputs (placeholder "Choice 1", "Choice 2", etc.), "+" button to add option (max 4), duration selector (1 day, 3 days, 1 week). Poll data stored in post as `poll: { options: [{text, votes: 0}], totalVotes: 0, endsAt }`. In feed, polls render as vertical button list — each option is a full-width rounded bar showing option text. After "voting" (clicking an option), bars fill proportionally by percentage, winning option is bold, show vote count. Poll is non-editable after creation.

- [ ] **Lists page (`/lists`)**: Top bar: "Lists" title + new list button (📋+). "Your Lists" section: cards showing list name (bold), description (gray), member count. Clicking a list shows the list timeline (posts from members only). "Create a new list" button opens modal: name input, description textarea, private toggle. List detail page (`/lists/:id`): list name, description, member count, "Edit list" / "Delete list" buttons, member list, feed of posts from members.

- [x] **Pinned post on profile**: If currentUser.pinnedPostId is set, show that post at the top of the "Posts" tab with a gray "📌 Pinned" label above it. The three-dot menu on own posts includes "Pin to your profile" / "Unpin from profile" option.

- [ ] **Thread creation (multi-post composer)**: In the compose modal, add a "+" button below the first post's textarea to add another post to the thread. Each subsequent post shows: thin vertical line connecting to previous, new avatar + textarea. User can add up to 10 posts in a thread. Posting creates multiple post objects linked via `inReplyToPostId` chain.

- [ ] **Mute/block user from post menu**: When clicking "Mute @handle" in the three-dot menu: add userId to a `mutedUsers[]` array in state, hide their posts from feeds (filter out), show confirmation toast "You muted @handle". When clicking "Block @handle": add to `blockedUsers[]`, remove from following/followers, hide posts, show confirmation toast.

- [ ] **Keyboard shortcuts**: Implement the core keyboard shortcuts from the Xwitter shortcut panel. Priority shortcuts: `N` (new post → open compose modal), `/` (focus search), `G+H` (go home), `G+E` (go explore), `G+N` (go notifications), `G+M` (go messages), `G+P` (go profile), `G+B` (go bookmarks). Post-level shortcuts when a post is "focused" (via J/K navigation): `L` (like), `R` (reply), `T` (repost), `B` (bookmark), `Enter` (open detail). Show "?" modal with shortcut reference.

- [x] **Character counter ring animation**: Replace text-only character counter in composer with a circular SVG ring (20px diameter). The ring fills clockwise as user types. Blue (`#1DA1F2`) from 0-260 chars, yellow (`#FFAD1F`) from 260-280, red (`#F4212E`) above 280. When <20 chars remaining, show the remaining count number inside the ring. When at 280, ring is complete. Above 280, ring overflows with a red sector and count turns negative.

- [x] **Explore page tabs**: Add tabs to Explore page: "For you" | "Trending" | "News" | "Sports" | "Entertainment". "For you" shows trending topics + suggested posts. "Trending" shows the trends list (numbered, with category, name, post count). Other tabs filter trends by category. Each trending item is clickable → navigates to search results.

- [ ] **Profile "Replies" tab context**: In the "Replies" tab on profile, each reply should show the parent post it's replying to as a muted, smaller card above the reply, connected by a thin vertical gray line, so users can see the conversation context.

- [ ] **Followers/Following mutual indicator**: On the Followers/Following pages, if a user follows currentUser AND currentUser follows them, show "Follows you" badge next to their handle in gray.

---

## Data Seed (implement in createInitialData())

- [x] **Users**: 8 users total (see `data_model.md` §Users table). currentUser = u1 (Alex Johnson). Include diverse bios, mix of verified/unverified. Each user has realistic followers/following arrays creating a connected social graph.

- [x] **Posts**: 18 posts covering: 5 text-only, 4 with single image (`https://picsum.photos/seed/pN/600/400`), 2 with 4 images (image grid), 1 quote post, 2 replies-as-posts (inReplyToPostId set), 1 viral post (100+ likes), 1 zero-engagement post, 1 pinned post for currentUser, 1 long post (~280 chars). Posts span across 6 different users. Timestamps range from 2 minutes ago to 3 days ago.

- [x] **Replies**: 10 replies across 4 different posts. The most replied-to post should have 4 replies from different users. Include replies with varying engagement (some with likes).

- [x] **Notifications**: 10 notifications: 2 follow, 3 like, 2 repost, 2 reply, 1 mention. 4 unread, 6 read. Timestamps within last 24 hours.

- [x] **Conversations**: 4 DM conversations with 15 total messages. Each conversation has 2-6 messages alternating between participants. Realistic small talk content.

- [x] **Lists**: 2 lists (one public "Tech News", one private "Close Friends") with member arrays.

- [x] **Trends**: 10 trending topics covering Technology, Sports, Entertainment, Science, Gaming, Business, Music. Each with realistic post counts.

- [x] **BookmarkedPostIds**: Array of 3 post IDs that currentUser has bookmarked.

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login / signup (app starts pre-logged-in as Alex Johnson, `u1`)
- X Premium / subscription tiers / monetization
- Grok AI integration
- Spaces (live audio rooms)
- Communities (complex group feature)
- Real video playback (use image thumbnails)
- Ads / promoted content
- Analytics dashboard
- Account settings / privacy settings
- Real-time WebSocket updates
- Email/SMS sending
- File uploads to real servers
- End-to-end encryption for DMs
