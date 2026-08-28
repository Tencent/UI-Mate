# Xinterest Mock — Research Summary

> **Last updated:** 2025-03-09
> **Target application:** Xinterest (pinterest.com)
> **Category:** Visual discovery / social bookmarking / inspiration platform

---

## App Overview

Xinterest is a **visual discovery engine** where users find, save, and organize ideas through images ("Pins") onto categorized collections ("Boards"). It functions as a visual bookmarking tool combined with a social feed. Users browse a personalized home feed, search for specific topics, save pins to boards, create their own pins, and follow other users. The platform hosts billions of pins across categories like recipes, home décor, fashion, travel, DIY, art, and more.

### What makes Xinterest distinct:
1. **Masonry grid layout** — The signature multi-column, variable-height image grid ("waterfall" layout)
2. **Pin → Board hierarchy** — Content is organized as Pins saved to Boards (with optional Sections within Boards)
3. **Visual-first** — Images dominate; text is secondary
4. **Discovery over social** — Feed is algorithm-driven (not chronological friend posts)
5. **Save-centric** — Primary action is "Save" (red button), not "Like"
6. **Board sections** — Boards can be subdivided into sections for granular organization

---

## Key User Personas

### 1. Casual Browser ("Inspiration Seeker")
- Browses home feed for ideas
- Searches specific topics ("modern kitchen ideas")
- Saves pins to boards occasionally
- **Primary workflows:** Browse feed → Click pin → View detail → Save to board

### 2. Active Organizer ("Board Curator")
- Creates multiple themed boards with sections
- Actively saves, organizes, and curates content
- **Primary workflows:** Search → Save → Organize boards → Create sections → Rearrange pins

### 3. Content Creator ("Pin Author")
- Uploads original images with titles, descriptions, and links
- Manages their own pins and tracks engagement
- **Primary workflows:** Create pin → Select board → Add metadata → Publish

---

## Complete Feature List

### P0 — Core Shell (App cannot render without these)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Top navbar** | Fixed 64px-high white bar: Xinterest "P" logo (red, left), "Home" and "Create" nav links, full-width search bar with magnifying glass icon and camera icon for visual search, notification bell (with red badge dot), message bubble icon, user avatar (circular, 32px), chevron dropdown |
| 2 | **Masonry grid (home feed)** | Multi-column variable-height pin grid using CSS columns. Desktop: 5-7 columns. Each pin card has: rounded-2xl image, hover overlay with Save button (red), link preview chip, share/more buttons. Cards have ~8px gutter |
| 3 | **Pin card with hover** | On hover: darkened overlay, top-left red "Save" button with board dropdown, bottom-left link chip, bottom-right share + more buttons. Below image: pin title (truncated) and 3-dot menu |
| 4 | **Pin detail modal** | Full-screen overlay modal (rounded-[32px]). Left half: pin image on black bg. Right half: white panel with action bar (more/share/link icons + board selector + Save button), pin title (large bold), description, author row (avatar + name + follower count + Follow button), comments section |
| 5 | **Routing** | `/` (home), `/profile/:userId`, `/board/:boardId`, `/create`, `/search/:query`, `/settings`, `/go` (debug) |
| 6 | **State management** | React Context with `createInitialData()`, localStorage persistence, session ID support, `/go` debug endpoint |
| 7 | **Data model** | Users, Pins, Boards, Sections, Comments (see `data_model.md`) |

### P1 — Primary Features (Core interactive workflows)

| # | Feature | Description |
|---|---------|-------------|
| 8 | **Search with filter chips** | Search bar submits query → results page shows masonry grid of matching pins. Below search bar: horizontal scrollable row of filter "chips" (pill-shaped buttons) like "All", category suggestions. Search suggestions dropdown on focus |
| 9 | **Save pin to board** | Click "Save" on pin card → dropdown of user's boards appears → click board name to save. Shows "Saved" state (black button) once saved. Can also save from pin detail modal |
| 10 | **User profile page** | Centered layout: large circular avatar (128px), display name (bold), @username, follower/following counts, "Share" and "Edit Profile" buttons. Tab bar: "Created" / "Saved". Saved tab shows board grid + unorganized pins. Created tab shows masonry of user's pins |
| 11 | **Board grid on profile** | Grid of board cards (4 columns on desktop). Each card: 4:3 aspect ratio cover image (from first pin), board name (bold), pin count. "Create board" card with + icon for current user |
| 12 | **Board detail page** | Board title (large bold centered), owner avatar + name, privacy icon (lock/globe), "X Pins • Y Sections" count. Sections listed as pill buttons. Masonry grid of board's pins. Options menu for owner (edit, delete board) |
| 13 | **Create pin form** | Two-panel layout: left panel is image upload zone (drag & drop area with dashed border, "Choose file" button). Right panel: Title input (large), user avatar row, Description textarea, Destination link input, Board selector dropdown, "Publish" button (red) |
| 14 | **Follow/unfollow users** | Toggle follow state from pin modal or profile page. Updates follower/following counts bidirectionally |
| 15 | **Create board modal** | Modal: "Create Board" title, name input, secret toggle checkbox, collaborator option, Create/Cancel buttons |
| 16 | **Board sections** | Create sections within boards. Sections displayed as pill buttons. Pins can be moved between sections. Section CRUD |
| 17 | **Comments on pins** | In pin detail modal: comment list with avatar + username + text + timestamp. Comment input field at bottom. Add comment functionality updates state |
| 18 | **Pin delete** | Owner can delete their own pins via more menu on pin card or pin detail modal |
| 19 | **Board edit** | Edit board name, description, privacy, cover image. Access via board detail options menu |
| 20 | **Notifications dropdown** | Click bell icon → dropdown panel showing notification items: "X saved your pin", "X started following you", "New ideas for you". Each has avatar, text, timestamp. Unread badge count |

### P2 — Secondary Features (Depth and realism)

| # | Feature | Description |
|---|---------|-------------|
| 21 | **Related pins ("More like this")** | Below pin detail modal or below fold: grid of visually/topically related pins |
| 22 | **Explore/trending topics** | Category pills on search page: "Fashion", "Food", "Home Decor", "Travel", etc. Click to filter |
| 23 | **Profile edit modal** | Edit: display name, username, bio/about, website, profile picture. Save changes button |
| 24 | **Settings page** | Sidebar navigation: Edit profile, Account settings, Notifications, Privacy & data, Security. Main panel shows settings form for selected section |
| 25 | **Pin reactions/likes** | Heart/reaction button on pins with count |
| 26 | **Drag-and-drop pin organization** | Reorder pins within a board or move between sections via drag |
| 27 | **Board collaborators** | Invite other users to contribute to a board |
| 28 | **Share pin modal** | Share options: copy link, share to social media (mock buttons) |
| 29 | **User dropdown menu** | Click chevron next to avatar: dropdown with "Your profile", "Settings", "Your business hub", "Install app", "Log out" (non-functional) |
| 30 | **Keyboard shortcuts** | Escape closes modals, arrow keys for navigation hints |
| 31 | **Dark mode visual search overlay** | Mock visual search: camera icon opens overlay, animates "analyzing", shows mock results |
| 32 | **Responsive breakpoints** | Mobile: single column, bottom nav. Tablet: 3 columns. Desktop: 5-7 columns |

---

## UI Layout Description

### Global Shell
- **Navbar**: Fixed top, 64px height, white bg (#fff), subtle bottom shadow (`box-shadow: 0 1px 4px rgba(0,0,0,0.08)`)
  - Left: Xinterest logo (red `#E60023`), "Home" pill (black bg when active, hover effect), "Create" pill
  - Center: Search bar (full-width, gray-100 bg `#EFEFEF`, 48px height, rounded-full, focus: white bg with blue border `#0074E8`)
  - Right: Bell icon (notification badge red dot), Message icon, User avatar (32px circle), Chevron down
- **Main content**: Starts at `pt-20` (80px from top), white background, no sidebar on home feed
- **No persistent sidebar** in modern Xinterest desktop — navigation is via the top navbar

### Home Feed
- Full-width masonry grid, 5-7 columns depending on viewport
- Pin cards: rounded-2xl (16px radius), variable height, ~236px column width
- Cards have 8px gap
- Below each image: optional pin title (14px, semibold, truncated to 2 lines) + 3-dot menu
- On hover: dark overlay with Save button (top-right, red pill), link chip (bottom-left), share/more (bottom-right)

### Pin Detail Modal
- Backdrop: black/60 opacity
- Modal: rounded-[32px], max-width 1024px, flex row
- Left: image on black background, `object-contain`, hover shows source link chip
- Right: white panel, padding 32px
  - Top bar: more/share/link icon buttons (left), board dropdown + Save button (right)
  - Title: 36px bold
  - Description: 16px gray-700
  - Author row: 48px avatar, bold name, follower count, Follow button (rounded-full)
  - Comments section at bottom

### Profile Page
- Centered column layout, max-width varies
- Large avatar (128px), name (24px+ bold), @username (gray), stats, action buttons
- Tab bar: "Created" | "Saved" with underline indicator
- Saved tab: Board grid (4 columns) then "Unorganized Pins" masonry
- Created tab: Masonry grid of authored pins

### Board Detail Page
- Centered header: board name (32px+ bold), owner info, privacy icon, pin/section counts
- Section pills in horizontal row
- Full-width masonry grid of board pins

### Create Pin Page
- Centered card (max-width 896px), white bg, rounded-[32px]
- Two columns: 1/3 image upload area (dashed border), 2/3 form fields
- Form: title (large font), description (textarea), link, board selector, Publish button

---

## Design System

### Colors (from Xinterest design tokens)
| Token | Value | Usage |
|-------|-------|-------|
| Xinterest Red | `#E60023` | Primary brand, Save button, logo |
| Xinterest Hover Red | `#AD081B` | Red button hover state |
| Dark Text | `#111111` | Primary text |
| Gray Text | `#767676` | Secondary text |
| Light Gray BG | `#E9E9E9` | Input backgrounds, hover states |
| Lighter Gray | `#EFEFEF` | Search bar, card backgrounds |
| White | `#FFFFFF` | Page background, cards, modals |
| Focus Blue | `#0074E8` | Search bar focus border |
| Black | `#000000` | Active nav pills, dark buttons |

### Typography
- **Font family**: "Xinterest Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
- **Font weights**: 400 (regular), 500 (medium), 700 (bold)
- **Font sizes**: 12px (caption), 14px (body), 16px (large body), 20px (heading), 24px (section title), 28-36px (page title)
- **Line heights**: 1.2–1.5

### Spacing
- Base unit: 4px
- Common gaps: 4px, 8px, 12px, 16px, 24px, 32px
- Pin card gap: 8px
- Navbar height: 64px (padded to 80px with content offset)
- Modal padding: 32px
- Border radius: 8px (small), 16px (cards), 24px (large), 32px (modals), 999px (pills/buttons)

### Motion
- Transitions: 200ms ease for hovers, 300ms for modals
- Pin hover overlay: opacity transition 200ms
- Button hover: background-color transition 200ms

---

## Existing Implementation Status

The current pinterest_mock has a solid foundation:

### ✅ Already Implemented
- Top navbar with search, icons, profile link
- Masonry grid home feed with infinite scroll
- Pin card with hover overlay and Save button
- Pin detail modal (image + details)
- User profile with Created/Saved tabs
- Board grid display on profile
- Board detail page with pin list
- Create pin form with image upload
- Create board modal
- Follow/unfollow users
- Search filtering
- Visual search mock overlay
- Session management (`?sid=`)
- `/go` debug endpoint
- State persistence via localStorage

### ❌ Missing / Incomplete
- **Comments system** — placeholder only, no add/display functionality
- **Board sections** — can create sections but cannot assign pins to them
- **Pin deletion** — no delete functionality
- **Board editing** — limited (no name/description edit form)
- **Notifications** — bell icon present but no dropdown/panel
- **User dropdown menu** — chevron present but no dropdown
- **Search suggestions** — no dropdown, no filter chips on results
- **Related pins** — not implemented
- **Settings page** — no route or page
- **Share functionality** — buttons present but non-functional
- **Profile edit** — button present but no modal/form
- **Pin reactions/likes** — not implemented
- **Explore/categories** — not implemented
- **Drag-and-drop** — not implemented
- **Board collaborators** — not implemented
- **Alt text on pins** — not in data model
- **Pin tags/categories** — not in data model

---

## Key Notes for Development

### Out of Scope (Do NOT implement)
- Authentication / login / signup (app starts pre-logged-in as "Admin User")
- Real API calls or network communication
- File upload to real servers (use FileReader/base64 or mock URLs)
- Email/SMS sending
- OAuth, SSO, encryption
- Payment processing

### Important Behaviors
1. Xinterest has **no persistent sidebar** on desktop — all navigation is in the top navbar
2. The "Save" action is the primary CTA — always red `#E60023` with white text
3. Pin cards show title **below** the image (not in overlay) — overlay only shows on hover
4. The masonry layout is central to the Xinterest experience — must be smooth and performant
5. Board privacy can be "public" or "secret" — secret boards show a lock icon
6. The current user is always `u1` ("Admin User") — pre-logged-in state
7. All state changes must be reflected in the `/go` debug endpoint for RL training

### Screenshots Reference
See `assets/screenshots/` subdirectories:
- `home/` — Home feed masonry layouts (5 images)
- `pin_detail/` — Pin detail modal views (5 images)
- `profile/` — User profile pages (5 images)
- `board_detail/` — Board detail views (5 images)
- `create_pin/` — Pin creation form (3 images)
- `search/` — Search results with filter chips (3 images)
- `notifications/` — Notification settings/panel (3 images)
