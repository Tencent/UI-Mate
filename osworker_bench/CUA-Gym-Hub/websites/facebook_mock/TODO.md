# Xacebook Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Screenshots: `assets/screenshots/` (30+ reference images across categories)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

These items ensure the app can render and function. Most are **already implemented** — verify and fix any issues.

- [x] Project scaffold: Vite + React, react-router-dom, lucide-react, date-fns, tailwindcss, clsx, tailwind-merge
- [x] App layout: Fixed top navbar (56px), left sidebar (280px), right sidebar (280px on xl), fluid center content area with #F0F2F5 background
- [x] Routing: App.jsx with BrowserRouter — `/` (Home), `/profile` (Profile), `/friends` (Friends), `/groups` (Groups), `/pages/:id` (PageProfile), `/go` (Go)
- [x] State management: AppContext.jsx + initialData.js with localStorage persistence, session isolation via `sid` URL param
- [x] `/go` endpoint: Go.jsx returns `{initial_state, current_state, state_diff}` in dark terminal UI
- [x] Session isolation: vite.config.js mock-api plugin with `POST /post?sid=`, `GET /state?sid=`, `GET /go?sid=`, `POST /upload?sid=`, `GET /files/:sid/:filename`

- [~] **Visual design system audit**: Study `assets/screenshots/` — verify and enforce the exact Xacebook design:
  - Primary blue: `#1877F2` (already in tailwind config ✓)
  - Secondary green: `#42b72a` (already in tailwind config ✓)
  - Background: `#F0F2F5` (already in tailwind config ✓)
  - Card/surface: `#FFFFFF`
  - Text primary: `#050505`, Text secondary: `#65676B` (already in tailwind config ✓)
  - Hover/active surface: `#E4E6EB` (already in tailwind config ✓)
  - Reaction hover background: `#F7F8FA`
  - Divider/border: `#CED0D4`
  - Online green dot: `#31A24C`
  - Error/danger red: `#FA3E3E`
  - Font: `Segoe UI, Helvetica, Arial, sans-serif` (already in tailwind config ✓)
  - Post text: 15px regular, Heading: 20px bold, Meta/timestamp: 13px, Comments: 13px
  - Navbar height: 56px, Sidebar width: 280px (left), 280px (right on xl+)
  - Card border-radius: 8px, Avatar border-radius: 50%, Button border-radius: 6px
  - Post card: white bg, 8px rounded, no border (subtle shadow), 16px margin-bottom
  - Ensure consistent padding: 16px in cards, 8px between icon items in sidebar

- [x] **Add missing routes**: Add routes for `/marketplace`, `/watch`, `/events`, `/saved`, `/profile/:userId` (viewing other users' profiles). Update Navbar center tabs and Sidebar links to navigate to these routes with proper active state highlighting.

---

## P1 — Primary Features

Core interactive workflows an agent needs to practice. These are the daily-use features.

### 1.1 — Fix Non-Functional UI Elements (Wire Up Dead Buttons)

- [x] **Search bar functionality**: Implement search across posts, users, groups, pages. Typing in the navbar search should show a dropdown with filtered results grouped by category (People, Posts, Groups, Pages). Clicking a result navigates to the relevant page/profile. Search should filter by name/content substring match. Show "No results" if nothing matches. The dropdown should appear below the search input, white card, rounded-lg, max-height 400px with scroll, shadow-lg.

- [x] **Profile tabs switching**: On `/profile`, the tabs (Posts, About, Friends, Photos, Videos) should switch the displayed content below:
  - **Posts** (default): Show CreatePost + user's posts (current behavior)
  - **About**: Show a card with user details — Workplace, Education, Location, Relationship status, Joined date. Each row: icon (Briefcase, GraduationCap, MapPin, Heart, Calendar) + label + value. "Edit Details" button (non-functional is OK)
  - **Friends**: Grid of friend cards (3 columns) — each card shows avatar (100px), name, mutual friend count. Click navigates to their profile
  - **Photos**: Grid of post images (3 columns) from user's photo posts. Click opens a lightbox overlay showing full-size image with prev/next arrows

- [ ] **Page profile tabs switching**: On `/pages/:id`, the tabs (Posts, About, Reviews, Followers, Photos) should work similarly:
  - **Posts** (default): Page's posts
  - **About**: Page description, category, website, phone, address
  - **Reviews**: Full review list with star ratings, user avatar/name, review text, timestamp
  - **Followers**: Grid of follower avatars/names
  - **Photos**: Grid of page post images

- [x] **Comment liking**: Each comment and reply should have a functional "Like" text button. Clicking toggles the current user's like on that comment. Show like count if > 0. Like text turns blue (#1877F2) when liked. Requires adding `likes: string[]` to Comment in data model (see data_model.md §Comment).

- [x] **Post "..." more menu**: Clicking the three-dot "..." button on a post should show a dropdown menu with: "Save post", "Edit post" (only on own posts), "Delete post" (only on own posts), "Hide post", "Report post". Dropdown: white card, rounded-lg, shadow-lg, each option 40px tall with icon + text, hover #F0F2F5.

- [x] **Post edit**: From the "..." menu, "Edit post" opens the CreatePost modal pre-filled with the post's current content. On save, update the post content and set `edited: true`. Show "(edited)" text next to timestamp on edited posts.

- [x] **Post delete**: From the "..." menu, "Delete post" shows a confirmation dialog ("Are you sure you want to delete this post?") with "Delete" (red) and "Cancel" buttons. On confirm, remove the post from state.

- [x] **Comment delete**: Long-press or right-click a comment by the current user should show "Delete" option. Alternatively, show a small "..." button on hover for own comments. On delete, remove comment from the post's comments array.

### 1.2 — Marketplace Page (New Route: `/marketplace`)

- [ ] **Marketplace page layout**: Create `src/pages/Marketplace.jsx`. Layout: left sidebar (360px) + main content grid.
  - **Left sidebar**: "Marketplace" title (24px bold), search input (#F0F2F5 rounded pill), navigation links: "Browse All" (active blue), "Notifications", "Your Listings", Divider, "Filters" header, Location input ("San Francisco, CA - Within 60 km"), Category dropdown. "+ Create New Listing" button (blue, full-width, rounded-md).
  - **Main area**: "Today's Picks" header, responsive grid (2-4 columns depending on viewport) of listing cards.
  - Each **listing card**: Square image (aspect-ratio 1:1, object-cover), price (bold, 17px), title (15px, 1 line truncated), location (13px gray). Hover: subtle shadow elevation. Click opens listing detail modal.

- [ ] **Marketplace listing detail modal**: Full-screen-ish modal (max 900px wide). Left: Image carousel with dots/arrows. Right: Price (24px bold), title (20px), listed time ago, seller avatar + name + "Message Seller" button, condition badge, description text, category. "Save" button (heart icon), "Share" button.

- [ ] **Create listing modal**: Button "+ Create New Listing" opens modal with form: Title input, Price input ($), Category dropdown (Vehicles, Electronics, Apparel, Home & Garden, etc.), Condition dropdown (New, Used - Like New, Used - Good, Used - Fair), Location (pre-filled), Description textarea, "Add Photos" area. "Post" button creates listing in state.

- [ ] **Marketplace search/filter**: Search filters listings by title substring. Category filter shows only matching category. Combine filters with AND logic.

### 1.3 — Watch Page (New Route: `/watch`)

- [ ] **Watch page layout**: Create `src/pages/Watch.jsx`. Layout: left sidebar (360px) + main video feed.
  - **Left sidebar**: "Watch" title (24px bold), search input, nav links: "Home", "Live", "Reels", "Saved Videos". Divider. "Your Watch List" with saved video count.
  - **Main feed**: Vertical list of video cards, each card: Video thumbnail/player (16:9 aspect, 100% width), below: page avatar (40px) + page name (bold) + timestamp + "..." more button. Title text (17px bold). Reaction count + comment count row. Like/Comment/Share action bar (same as regular posts).

- [x] **Video player interaction**: Clicking a video thumbnail should show a basic video player with play/pause. Use HTML5 `<video>` element. Show play button overlay on thumbnail. On click, auto-play. Controls: play/pause, mute, fullscreen.

### 1.4 — Stories Feature

- [x] **Story viewing**: Clicking a story card in the carousel should open a full-screen overlay (black background) showing the story image (centered, max 420px wide, full viewport height). Top: progress bar + user avatar + name + timestamp + close X button. Auto-advance after 5 seconds (or click to advance). Left/right arrows or swipe to navigate between stories. Close button returns to feed.

- [x] **Create Story**: First card in carousel ("Create Story" with + icon) opens a modal. User can select from a set of predefined background colors + type text, OR select a sample image. "Share to Story" button adds story to state. Story appears in carousel with user's avatar.

### 1.5 — Enhanced Chat/Messenger

- [x] **Multiple chat conversations**: Replace single hardcoded chat with a proper messenger system. Clicking the Messenger icon in navbar opens a dropdown panel (360px wide, 480px tall) showing: search bar, list of conversations (avatar + name + last message preview + timestamp + unread dot). Clicking a conversation opens the ChatWindow for that person.

- [x] **Chat window improvements**: Current ChatWindow is basic. Enhance to: show messages with proper bubbles (sent = blue #1877F2, received = #E4E6EB), timestamps between message groups, typing indicator ("..."), emoji picker button (show a small grid of common emojis), "thumbs up" quick-send button. Support opening multiple chat windows (up to 2 side by side at bottom-right).

- [x] **Send new message**: Typing in chat input and pressing Enter or clicking send should add message to state. Message appears immediately in the chat window. Update the conversation's last message preview in messenger dropdown.

### 1.6 — Notifications Enhancement

- [ ] **Richer notifications**: Add more notification types and seed data: friend request accepted, birthday reminder, group post activity, page post, event reminder, memory ("On This Day"). Each notification type has a distinct icon/badge color overlay on the user's avatar: 👍 blue (like), 💬 green (comment), 👥 blue (friend), 🎂 pink (birthday), 📢 orange (group), 📅 purple (event).

- [x] **Mark notifications read**: Clicking a notification should mark it as read (remove blue unread dot). Add "Mark all as read" link at top of notification dropdown. Update the notification badge count on the bell icon to reflect unread count dynamically.

- [x] **Notification click navigation**: Clicking a notification should navigate to the relevant content: like/comment → scroll to post, friend request → /friends page, group → /groups, event → /events.

### 1.7 — Post Privacy & Feelings

- [ ] **Post privacy selector**: In CreatePost modal, add a privacy dropdown below the user name. Options: "Public" (globe icon), "Friends" (people icon), "Only Me" (lock icon). Default to "Friends". Selected privacy is saved with the post and displayed as an icon next to the timestamp.

- [ ] **Feeling/Activity**: In CreatePost modal, clicking "Feeling/Activity" row opens a sub-modal with common feelings (Happy 😊, Sad 😢, Excited 🤩, Angry 😤, Loved 🥰, Thankful 🙏, etc.) in a grid. Selecting one shows "feeling [emoji] [feeling]" below the user name in the post header.

### 1.8 — View Other Users' Profiles

- [ ] **Profile route for other users**: Add route `/profile/:userId`. When visiting another user's profile, show their cover, avatar, name, bio, friend count. Show "Add Friend" button (if not friends), "Message" button, "Following" button. Show their posts in the feed section. Reuse existing Profile component with conditional rendering based on whether it's the current user or another user.

---

## P2 — Secondary Features

Depth and realism features. Implement after P1 is solid.

### 2.1 — Events Page

- [ ] **Events page**: Create `src/pages/Events.jsx` at route `/events`. Left sidebar (360px): "Events" title, search, "Your Events", "Birthdays", "Create Event" button. Main area: "Upcoming Events" section with event cards — each card: cover image, date badge (month + day overlay), event name, date/time, location, interested/going counts. "Interested" and "Going" buttons on each card.

- [ ] **Event detail view**: Clicking event card shows detail: full cover, title, date/time, location (with map placeholder), host info, description, going/interested user list (avatars). "Going" / "Interested" / "Can't Go" buttons.

### 2.2 — Saved Items Page

- [ ] **Saved page**: Create `src/pages/Saved.jsx` at route `/saved`. Show list/grid of saved items (posts, marketplace listings, events, links). Each item shows: thumbnail, title/content preview, "Saved from [source]", timestamp. "Unsave" button (bookmark icon toggle). Optional: group by collections.

- [ ] **Save post action**: Add "Save post" to post "..." menu. Toggling adds/removes from savedItems in state. Bookmark icon in menu fills when saved.

### 2.3 — Memories / On This Day

- [ ] **Memories page**: Simple page at `/memories` showing "On This Day" content. Display 1-2 posts from "years ago" (mock timestamps). Card with "X years ago today" header, preview of old post, "Share" and "Hide" buttons.

### 2.4 — Photo Lightbox

- [ ] **Photo lightbox overlay**: Clicking any post image opens a full-screen dark overlay with the image centered (max 90vh x 90vw). Left/right navigation if post has multiple images (future: album support). Close on X click or Escape key or clicking dark overlay. Below image: post comments and reaction bar (mini version).

### 2.5 — Enhanced Groups

- [ ] **Group detail page**: Route `/groups/:groupId`. Show group cover, name, privacy badge, member count, description. Tabs: Discussion (posts), Members, About, Photos. CreatePost at top of Discussion tab. Member list shows avatars + names + "Admin" badge for creator.

- [ ] **Join/Leave group**: On group detail page, show "Join Group" button for non-members, "Joined" dropdown (Leave Group) for members. Joining adds user to group.members, leaving removes.

- [ ] **Create group modal**: "Create Group" button in groups sidebar opens modal: Group Name input, Privacy selector (Public/Private), Description textarea, Invite Friends checkboxes. "Create" button adds group to state.

### 2.6 — Drag & Drop and Bulk Actions

- [ ] **Reorder saved items**: On Saved page, allow drag-and-drop reordering of saved items (optional — nice-to-have for agent training).

### 2.7 — Dark Mode

- [ ] **Dark mode toggle**: Add a toggle in the account dropdown menu (top-right chevron). When enabled: background #18191A, card surface #242526, hover #3A3B3C, text #E4E6EB, secondary text #B0B3B8. Persist preference in localStorage. Toggle all tailwind classes or use CSS variables.

### 2.8 — Keyboard Shortcuts

- [ ] **Keyboard shortcuts**: `j`/`k` to scroll between posts in feed, `l` to like focused post, `c` to open comment box, `Escape` to close modals/overlays, `/` to focus search bar, `n` to open create post.

---

## Data Seed Enhancements

Implement these in `getDefaultData()` in `initialData.js` to make the mock feel alive:

- [x] **Expand user base**: Add 4 more users (user_7 through user_10) with realistic names, bios, avatars, and friendship connections. Add `location`, `workplace`, `education`, `joinedDate`, `relationship`, `online` fields to ALL users (see data_model.md §User).

- [x] **Expand posts**: Add 8 more posts (total ~15) covering all types: 2 more photo posts, 1 more video post, 2 status-only posts, 1 link post, 1 life_event, 1 feeling post. Distribute across different users. Add `privacy` (default "friends"), `shares` (default 0), and more comments (aim for 8-10 comments total across all posts). Add at least 2 replies to comments.

- [x] **Marketplace listings**: Add 8-10 listings: iPhone 14 ($450, electronics), Vintage Desk ($120, home), Mountain Bike ($350, sports), Running Shoes ($45, apparel), MacBook Pro ($900, electronics), Camping Tent ($80, sports), Designer Bag ($200, apparel), Couch ($250, home), Free Books ($0, free), Guitar ($175, entertainment). Each with realistic descriptions, varied conditions, seller from users pool.

- [x] **Events**: Add 4 events: "React Developers Meetup" (networking, in 5 days), "Summer Beach Party" (social, in 2 weeks), "Photography Workshop" (education, in 1 week), "Local Food Festival" (social, in 3 days). Each with interested/going arrays from users.

- [x] **Stories**: Add 5 stories: one for each friend (user_2 through user_6), with picsum.photos images and timestamps within last 20 hours. user_2 and user_3 stories should be unviewed.

- [x] **Notifications expansion**: Add 6 more notifications (total 8): friend request accepted (user_5), birthday reminder (user_4), group post mention (user_2 in group_1), page post (page_1), event reminder (event_1), memory/on-this-day. Mix of read/unread states. Add `postId`/`groupId`/`pageId` references.

- [x] **Messages**: Add 2-3 conversations in `messages` state: conversation with user_2 (5 messages back-and-forth), conversation with user_3 (3 messages), conversation with user_4 (2 messages). Realistic chat content with proper timestamps spread over the last few hours.

- [x] **Additional groups**: Add 2 more groups: "Photography Enthusiasts" (group_3, 4 members, 2 posts), "Foodie Adventures" (group_4, 3 members, 1 post). Include `privacy`, `category`, `createdBy` fields.

- [x] **Additional pages**: Add 2 more pages: "Foodie Paradise" (page_2, food category, 3 followers), "Travel Adventures Blog" (page_3, travel category, 2 followers). Each with 1-2 posts and 1 review.

- [x] **Saved items**: Add 3 saved items: a saved post (post_2), a saved marketplace listing (listing_1), a saved event (event_1).

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login / logout (app starts pre-logged-in as `Admin User` / user_1)
- Real Xacebook API / Graph API calls
- Real file uploads (use external image URLs from picsum.photos)
- Real-time messaging (WebSocket, polling) — all local state
- Push notifications / service workers
- Xacebook Pixel / analytics tracking
- OAuth / SSO / identity verification
- Email / SMS sending
- Payment processing (Marketplace is browse-only)
- Accessibility compliance (nice-to-have but not required)
- Responsive mobile-first design (desktop-first is fine, basic responsiveness is already in place)
- i18n / internationalization (English only)
