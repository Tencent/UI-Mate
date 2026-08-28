# Xinterest Mock — TODO

> **Status:** READY FOR DEV
> **Last updated by:** plan agent, 2025-03-09
> **Research:** `assets/README.md` | **Data model:** `assets/data_model.md`
> **Existing codebase:** Vite + React + Tailwind, partially implemented (see §Existing below)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Existing Implementation (already built — do NOT rewrite from scratch)

The project already has a working scaffold with these features:
- ✅ Vite + React project structure with Tailwind CSS
- ✅ Top navbar with Xinterest logo, Home/Create links, search bar, bell/message icons, avatar
- ✅ Masonry grid home feed with CSS columns + infinite scroll
- ✅ Pin card with hover overlay (Save button, link chip, share/more buttons)
- ✅ Pin detail modal (image left, details right, author info, follow button)
- ✅ Profile page with Created/Saved tabs, board grid
- ✅ Board detail page with sections and pin masonry
- ✅ Create pin form with image upload (FileReader)
- ✅ Create board modal
- ✅ Follow/unfollow toggle
- ✅ Basic search filtering by title/description
- ✅ Visual search mock overlay
- ✅ Session management (`?sid=` support)
- ✅ `/go` debug endpoint with state diff
- ✅ State persistence to localStorage with normalizers
- ✅ vite.config.js mock-api plugin (POST /post, GET /go, POST /upload, GET /files)

**Dev agent: Build on top of the existing code. Fix bugs and add missing features below.**

---

## P0 — Critical Fixes & Foundation

<!-- These fix existing bugs or add foundational pieces needed before P1 features work. -->

- [x] **Upgrade data model**: Replace the current `initialData.js` with the richer data model from `data_model.md`. This means:
  - 5 users (instead of 3) with `bio`, `website`, `monthlyViews` fields
  - 48 pins (instead of 30) organized by 6 categories with `tags`, `altText`, `likes`, `likedBy`, `saves`, `commentCount`, `sectionId`, `imageWidth`, `imageHeight` fields
  - 7 boards (instead of 3) — 5 for current user, 2 for other users — with `description`, `coverPinId`, `collaborators`, `createdAt`, `updatedAt` fields
  - Sections pre-populated with pins correctly assigned to them
  - 10 initial comments (new entity type)
  - 8 initial notifications (new entity type)
  - New state fields: `searchFilters: []`, `selectedCategory: null`
  - **Keep** all existing normalizer functions; add `normalizeComment` and `normalizeNotification`
  - **Keep** all existing session/storage logic unchanged

- [x] **Fix StoreContext**: Add new state actions for the new entity types:
  - `addComment(pinId, text)` — creates comment, increments pin.commentCount
  - `deleteComment(commentId)` — removes comment, decrements pin.commentCount
  - `likePin(pinId)` — toggles current user in pin.likedBy, updates pin.likes count
  - `likeComment(commentId)` — toggles current user in comment.likedBy, updates comment.likes count
  - `deletePin(pinId)` — removes pin from state.pins and from any board.pins/section.pins arrays
  - `updatePin(pinId, updates)` — edit pin title/description/url
  - `markNotificationRead(notificationId)` — sets notification.read = true
  - `markAllNotificationsRead()` — sets all notifications.read = true
  - `updateProfile(updates)` — updates currentUser fields (name, bio, website, avatar) and syncs to users array
  - `removePinFromBoard(pinId, boardId)` — removes pin from board.pins and board.sections[].pins

- [x] **Visual design system alignment**: Study `assets/screenshots/` and the design tokens from `assets/README.md` §Design System. Ensure the existing Tailwind config and CSS use:
  - Xinterest Red: `#E60023` ✅ (already correct)
  - Hover Red: `#AD081B` ✅ (already correct)
  - Dark Text: `#111111` ✅ (already correct)
  - Focus Blue: `#0074E8` (search bar focus border — currently using `border-blue-400`, change to `focus:border-[#0074E8]`)
  - Font family: add "Xinterest Sans" to the beginning of the font-family stack in `index.css`
  - Navbar height should be **64px** (currently 80px `h-20`; change to `h-16`)
  - Content offset should be `pt-16` (64px) instead of `pt-24` (96px) to match 64px navbar

---

## P1 — Primary Interactive Features

<!-- Core workflows for agent training. Each item should be fully interactive. -->

- [x] **Comments system**: In the pin detail modal (`PinModal.jsx`), replace the "No comments yet" placeholder with a fully working comments section:
  - Display existing comments for this pin: each comment shows 40px circular avatar (left), bold username, comment text, relative timestamp ("2h ago", "3d ago"), like button with count
  - Comment input field at bottom: circular avatar of current user + text input + "Post" button (disabled when empty, red when active)
  - Posting a comment: calls `addComment(pin.id, text)`, clears input, new comment appears at bottom of list with current timestamp
  - Like a comment: click heart icon toggles like state, updates count
  - Delete own comment: if commenter is current user, show "..." menu → "Delete" option → removes comment
  - Comments section heading: "Comments" with count badge (e.g., "Comments · 3")

- [x] **Pin deletion**: Add "Delete Pin" option to pin cards and pin detail modal:
  - On pin card: the existing `MoreHorizontal` button (bottom-right on hover) → clicking opens a small dropdown with "Download image" (no-op) and "Delete Pin" (if current user is pin author)
  - On pin detail modal: the existing `MoreHorizontal` button → dropdown with "Delete Pin" option
  - Deleting: calls `deletePin(pinId)`, closes modal (if open), removes pin from masonry grid with no page refresh needed
  - Show a brief toast/banner "Pin deleted" at bottom of screen for 3 seconds after deletion

- [x] **Notifications dropdown**: Make the bell icon in navbar functional:
  - Click bell icon → dropdown panel (400px wide, max-height 480px, scrollable) anchored below the bell icon
  - Dropdown header: "Updates" (bold) with "Mark all as read" link button (top-right)
  - Each notification item: 48px avatar (or Xinterest icon for system), notification message text (bold username, normal text), relative timestamp, thumbnail (pin image, 48px square, if applicable)
  - Unread notifications: light blue-50 background tint
  - Click notification: marks as read, navigates to relevant content (pin detail, user profile, or board)
  - Badge: red dot on bell icon if any notification has `read: false`. Show unread count number if > 0
  - Click outside dropdown to close it

- [x] **User dropdown menu**: Make the chevron next to the avatar in navbar functional:
  - Click chevron → dropdown (240px wide) anchored below
  - Menu items: current user name + email at top (bold name, gray subtitle), divider, "Your profile" (navigates to `/profile/u1`), "Settings" (navigates to `/settings`), divider, "Your boards" (navigates to `/profile/u1` saved tab), divider, "Log out" (non-functional, shows grayed out)
  - Click outside to close

- [x] **Search improvements**: Upgrade the search experience:
  - **Search suggestions dropdown**: When search input is focused and has text, show dropdown below with matching pin titles (max 8) as clickable suggestions. Each suggestion shows search icon + text. Click → sets query and submits
  - **Filter chips on results**: When search results are displayed on the home page, show a horizontal scrollable row of filter chips below the navbar (at top of results area). Chips: "All" (default active), then unique tags from the result pins. Clicking a chip filters results to that tag. Active chip has black bg + white text; inactive has gray-100 bg + black text, rounded-full, 32px height, 12px horizontal padding
  - **"No results" state**: When search returns 0 results, show centered message with search icon, "No results found for '{query}'", and suggestion text "Try a different search or explore trending topics"

- [x] **Board editing**: Make the board options menu fully functional on the board detail page:
  - Click `MoreHorizontal` button → dropdown with: "Edit board", "Merge board" (no-op), "Archive" (no-op), "Delete board"
  - "Edit board" → modal with: Board name input (pre-filled), Description textarea (pre-filled), Privacy toggle (public/secret checkbox), Save/Cancel buttons
  - Save calls `updateBoard(boardId, { name, description, privacy })`
  - Delete board already works (keep existing implementation)

- [x] **Profile edit modal**: Make the "Edit Profile" button on the profile page functional:
  - Click → full modal overlay with:
    - Profile picture: current avatar with "Change" button overlay (clicking opens a file picker, uses FileReader for preview, updates avatar URL in state)
    - First name / Last name inputs (currently single "name" field — split or keep as single "Display name")
    - Username input (with @ prefix shown)
    - Bio/About textarea (max 500 chars, show char count)
    - Website URL input
    - Save / Cancel buttons
  - Save calls `updateProfile({ name, username, bio, website, avatar })` — updates `currentUser` and corresponding entry in `users` array

- [x] **Save pin to board (improved UX)**: Improve the existing save-to-board flow:
  - On pin card hover: the red "Save" button now shows the **last-used board name** (e.g., "Home Décor") instead of just "Save" — quick-save to that board on click
  - Clicking the dropdown arrow (next to board name) → shows board list dropdown with search filter input at top
  - Each board option shows: board name, pin count, "Secret" label if applicable
  - "Create board" option at bottom of dropdown → opens create board modal inline
  - After saving: button text changes to "Saved" with black background, dropdown shows "Saved to {Board Name}" with link to board
  - In pin detail modal: the board selector dropdown works the same way

- [x] **Pin like/reaction**: Add like functionality to pins:
  - In pin detail modal: heart icon button next to the action icons. Click toggles like (red fill = liked). Shows like count next to it
  - On pin card: small heart icon below the image (next to title), shows count if > 0
  - Calls `likePin(pinId)` on click

- [x] **Related pins section**: Below the pin detail modal content (inside the right panel, after comments), show a "More like this" section:
  - Section heading: "More like this" (bold)
  - Small masonry grid (2-3 columns) showing 6-8 pins that share tags with the current pin
  - Clicking a related pin updates the modal content to show that pin (no page navigation needed)

---

## P2 — Secondary Features

<!-- Depth, polish, and advanced interactions. Implement after P1 is solid. -->

- [ ] **Settings page**: Create `/settings` route with a settings layout:
  - Left sidebar (240px): navigation links — "Edit profile", "Account settings", "Notifications", "Privacy & data" (see `assets/screenshots/notifications/` for reference)
  - Right content area: form for selected settings section
  - "Edit profile" section: same fields as profile edit modal
  - "Account settings" section: display name, email (read-only), language dropdown (mock)
  - "Notifications" section: toggle switches for "On Xinterest" / "By email" / "By push" — each has an "Edit" button that expands options
  - "Privacy & data" section: toggles for "Private profile", "Show your profile in search engines"
  - All changes save to state (even if mock) so `/go` reflects them

- [ ] **Explore/trending categories**: Add category exploration:
  - Below the search bar on the home page (when no search query), show a row of trending topic pills: "Interior Design", "Recipes", "Travel", "Fashion", "DIY Crafts", "Art & Illustration"
  - Clicking a category pill filters home feed to pins with matching tags
  - Active category highlighted with colored background
  - "See all" link at end of row

- [ ] **Share pin modal**: Make share buttons functional:
  - Click share/upload icon on pin card or pin detail → opens a centered modal
  - Modal content: "Share" heading, copy link button (with "Copied!" feedback on click), social sharing buttons (Facebook, Twitter/X, WhatsApp, Email — all mock, no real sharing)
  - Copy link: copies a mock URL like `https://pinterest.com/pin/{pinId}` to clipboard

- [ ] **Board cover image**: On the profile page board grid:
  - Board card shows a 3-image collage cover (first pin large left, two smaller pins stacked right) instead of single image
  - If board has < 3 pins, show what's available; if 0 pins, show placeholder

- [ ] **Pin detail page route**: Add `/pin/:pinId` route as an alternative to the modal:
  - Navigating directly to `/pin/:pinId` shows the pin detail as a full page (not modal)
  - Same layout as the modal but without the overlay backdrop
  - Back button returns to previous page

- [ ] **Drag-and-drop pin reordering**: On board detail page (owner only):
  - Pins can be dragged and repositioned within the masonry grid
  - Uses `react-beautiful-dnd` or similar (already in project patterns from asana_mock)
  - Reorder updates the board.pins array order
  - Visual feedback during drag (lifted card, drop placeholder)

- [ ] **Move pin between sections**: On board detail page:
  - Pin card has additional menu option: "Move to section" → submenu showing available sections + "No section"
  - Moving updates pin.sectionId and the section.pins arrays

- [ ] **Toast notification system**: Global toast/snackbar system for action confirmations:
  - "Pin saved to {Board Name}" (with "See board" link)
  - "Pin deleted"
  - "Comment posted"
  - "Profile updated"
  - Toasts appear bottom-center, auto-dismiss after 4 seconds, can be manually dismissed

- [ ] **Infinite scroll enhancement**: Currently loads 15 pins per page. Improve:
  - Show a subtle loading spinner at the bottom when more pins are loading
  - Shuffle/cycle pin order to simulate "fresh content" when pins run out (wrap around)
  - Smooth transition as new pins appear

- [ ] **Responsive improvements**: Ensure responsive breakpoints work properly:
  - Mobile (< 640px): 2 columns, navbar collapses (hide "Home"/"Create" text, keep icons)
  - Tablet (640-1024px): 3-4 columns
  - Desktop (> 1024px): 5-7 columns
  - Pin modal: stacks vertically on mobile (image on top, details below)

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. See data_model.md for full structure. -->

- [x] **Users**: 5 users with realistic names, avatars (use `i.pravatar.cc`), bios, follower/following relationships. Current user = `u1` "Sarah Chen" (see data_model.md §Users)
- [x] **Pins**: 48 pins across 6 categories (interior, food, travel, fashion, diy, art) with 8 pins each. Each pin has realistic title, description, tags, random like/save counts. Images from `picsum.photos` with varied heights (300-800px). See data_model.md §Pin categories
- [x] **Boards**: 7 boards total — 5 for current user (u1) covering different themes, 2 for other users. Some boards have pre-populated sections. See data_model.md §Boards
- [x] **Comments**: 10 comments spread across several pins, from different users. Realistic conversation threads. See data_model.md §Comments
- [x] **Notifications**: 8 notifications for current user — mix of saves, follows, comments, likes, recommendations, board invites. 3 unread + 5 read. See data_model.md §Notifications

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login / signup (app starts pre-logged-in as `Sarah Chen`, user ID `u1`)
- Real network API calls (all data is in localStorage + React Context)
- File upload to real servers (continue using FileReader/base64)
- Email/SMS/push notification sending
- OAuth, SSO, encryption, security
- Payment / shopping checkout
- Video pin playback
- Real-time messaging between users
- PWA / service worker functionality
