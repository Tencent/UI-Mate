# Xacebook Mock — Research Summary

> Last updated: 2026-03-09 by plan agent

## App Overview

**Xacebook** is the world's largest social networking platform (owned by Meta Platforms, Inc.), used by billions to connect with friends, family, and communities. The desktop web interface (facebook.com) provides a comprehensive social experience centered around a personalized News Feed, user profiles, messaging, groups, marketplace, video content (Watch), pages, events, and notifications.

**Category**: Social Networking / Social Media
**Primary Users**: General public — individuals, content creators, businesses, community organizers
**Platform**: Web (desktop focus), iOS, Android

## Key User Personas & Primary Workflows

### Persona 1: Casual Social User (default: "Admin User")
- Scrolls News Feed to read/react to friends' posts
- Creates text/photo status updates
- Comments on and reacts to posts (like, love, haha, wow, sad, angry)
- Manages friend requests (accept/decline)
- Checks notifications for activity on their content
- Browses profiles of friends/connections
- Uses Messenger chat popup to message friends

### Persona 2: Community Member
- Joins and browses Groups (topic-based communities)
- Posts questions/content within Groups
- Follows Pages for news/brand content
- Attends/creates Events
- Browses Marketplace listings

### Persona 3: Content Creator / Page Admin
- Manages a Xacebook Page (posts content, responds to reviews)
- Creates and schedules posts
- Monitors page followers and engagement
- Responds to comments on page posts

## Complete Feature List (Priority Ratings)

### P0 — Core Shell (App Cannot Render Without These)

| # | Feature | Status |
|---|---------|--------|
| 1 | Top Navbar: FB logo, search bar, center nav tabs (Home/Friends/Watch/Marketplace/Groups), right icons (profile, menu, messenger, notifications, account) | DONE |
| 2 | Left Sidebar: User profile link, quick navigation links (Friends, Groups, Marketplace, Watch, Memories, Saved, Events, Pages), shortcuts | DONE |
| 3 | Right Sidebar: Sponsored ads, Contacts list with online indicators | DONE |
| 4 | News Feed: Story carousel, create post box, scrollable feed of posts | DONE |
| 5 | Routing: Home (/), Profile (/profile), Friends (/friends), Groups (/groups), Page (/pages/:id), Go (/go) | DONE |
| 6 | State management: AppContext with localStorage persistence and session isolation | DONE |
| 7 | `/go` state inspection endpoint | DONE |
| 8 | Session isolation: POST /post, GET /state, GET /go with sid support | DONE |

### P1 — Primary Interactive Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Create Post (text, with modal dialog) | DONE |
| 2 | Reactions (7 types: like/love/care/haha/wow/sad/angry) with hover picker | DONE |
| 3 | Comments with nested replies | DONE |
| 4 | Friend Requests (accept/decline) | DONE |
| 5 | User Profile page (cover, avatar, bio, posts, tabs) | DONE |
| 6 | Notifications dropdown | DONE |
| 7 | Chat window (simple messenger popup) | DONE |
| 8 | Groups page with group posts | DONE |
| 9 | Page profiles with followers and reviews | DONE |
| 10 | Share dialog (share to feed) | DONE |
| 11 | Search functionality (search bar types but doesn't filter/search) | NEEDS FIX |
| 12 | Profile tabs (About, Friends, Photos, Videos) — currently non-functional | NEEDS FIX |
| 13 | Post edit/delete | MISSING |
| 14 | Comment edit/delete | MISSING |
| 15 | Comment liking | NEEDS FIX |
| 16 | Marketplace page with listings | MISSING |
| 17 | Watch page with video feed | MISSING |
| 18 | Story creation and viewing | MISSING |
| 19 | Post visibility/privacy selector | MISSING |
| 20 | Feeling/activity when creating post | MISSING |

### P2 — Secondary / Depth Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Events page (browse/create events) | MISSING |
| 2 | Saved items page | MISSING |
| 3 | Memories/On This Day | MISSING |
| 4 | Photo gallery/albums on profile | MISSING |
| 5 | Multiple chat conversations (Messenger panel) | MISSING |
| 6 | Post types: poll, feeling/activity, check-in, live, fundraiser | MISSING |
| 7 | Page creation | MISSING |
| 8 | Group creation | MISSING |
| 9 | Dark mode toggle | MISSING |
| 10 | Keyboard shortcuts | MISSING |
| 11 | Notification settings/mark as read | PARTIAL |
| 12 | Friend removal/unfriend | MISSING |
| 13 | Block/report user | MISSING |

## UI Layout Description (Desktop — Primary Target)

### Global Shell
- **Top Navbar** (56px height): Fixed at top, full width, white background (#FFFFFF), subtle bottom border
  - Left: Xacebook "f" logo (blue circle, 40px), search bar with magnifying glass (240px wide, #F0F2F5 background, 36px height, rounded-full)
  - Center: 5 navigation tabs evenly spaced (Home, Friends, Watch, Marketplace, Groups) — each ~110px wide, active tab has blue bottom border (3px) and blue icon, inactive has gray icon; hover shows #F0F2F5 background
  - Right: Profile avatar (28px circle), Menu grid icon (36px circle #E4E6EB), Messenger icon, Notifications bell icon (with red badge count), Account chevron dropdown
- **Left Sidebar** (280px wide): Fixed below navbar, scrollable, starts with user avatar+name link, then navigation items — each item: 36px icon + 15px text, 8px padding, hover #E4E6EB rounded-lg. Items: Friends, Most Recent, Groups, Marketplace, Watch, Memories, Saved, Events, Pages. Below: "Your Shortcuts" section with page thumbnails. Footer: Meta copyright, Privacy links
- **Right Sidebar** (280px wide): Fixed, visible on xl screens (>1280px). "Sponsored" section with 2 ad cards (image + title + URL). Divider. "Contacts" header with video/search/more icons. Contact list: 32px circle avatar + name + green online dot
- **Main Content** (fluid center, ~590px max-width): Top padding for navbar (56px), left margin for sidebar (280px), right margin for right sidebar

### News Feed (Home Page `/`)
- **Story Carousel**: Horizontal scroll, first card "Create Story" with + icon, remaining cards show friend stories with full-bleed thumbnail, gradient overlay, avatar (28px at top-left), name at bottom. Each card ~112px wide x 200px tall, rounded-xl
- **Create Post Box**: White card, top area: user avatar (40px) + "What's on your mind, [Name]?" placeholder in gray rounded pill (#F0F2F5); bottom row: "Live Video" (red cam icon), "Photo/Video" (green landscape icon), "Feeling/Activity" (yellow smiley icon). Clicking opens modal
- **Post Cards**: White card, rounded-lg, margin-bottom 16px. Header: 40px avatar + bold name + timestamp (gray, relative e.g. "2h") + more "..." button. Content: text body. Optional media: full-width image or video player. Reaction summary: top 3 emoji icons (16px) + "You and X others". Divider. Action row: Like (with hover reaction picker), Comment, Share. Comments section: each comment has 32px avatar, gray bubble (#F0F2F5) with bold name + text, reply/like/timestamp below. Nested reply indented 40px

### Profile Page (`/profile`)
- **Cover Photo**: Full width (max 940px), 348px tall, relative positioned. Camera icon button for edit
- **Avatar**: 168px circle, white border (4px), positioned at bottom-left of cover (offset -84px), camera icon for edit
- **Name + Bio**: Large bold name (32px), bio/tagline below in gray
- **Action Bar**: "Add to Story", "Edit Profile" buttons, blue primary / gray secondary
- **Tabs**: Posts | About | Friends | Photos | Videos | Check-ins — horizontal tab bar, active has blue text + underline
- **Two-Column Layout below tabs**: Left (360px): Intro box (bio, work, education, location, joined date), Photos grid (3x3, rounded), Friends grid (3x3 with count). Right (fluid): Create Post + Posts

### Friends Page (`/friends`)
- **Friend Requests** section: Grid of cards, each card: vertical layout with 120px square avatar, name, mutual friends count, "Confirm" (blue) and "Delete" (gray) buttons
- **All Friends** section: Similar grid layout but horizontal card with avatar + name + "Remove" button

### Groups Page (`/groups`)
- **Left Sidebar** (360px): Search groups, "Your Groups" list, "Create Group" button, "Discover" section
- **Main Feed**: Group activity — create post in group + group post feed. Group suggestion cards in horizontal scroll

### Marketplace Page (`/marketplace`) — NOT YET IMPLEMENTED
- **Left Sidebar**: Search Marketplace, "Browse All", "Notifications", "Your Account", "+ Create New Listing" button, Filters (location, category, price), Categories list (Vehicles, Property, Apparel, Electronics, etc.)
- **Main Grid**: Product listing cards in 2-4 column grid, each card: square image, price (bold), title, location. Click opens detail view

### Watch Page (`/watch`) — NOT YET IMPLEMENTED
- **Left Sidebar**: Search videos, "Home", "Live", "Reels", "Shows", "Explore", "Saved Videos", "Your Watch List"
- **Main Feed**: Video cards — large video player/thumbnail + title + page name + views count + reactions

### Page Profile (`/pages/:id`)
- Similar to user profile but for business/brand pages
- Cover + avatar + page name + category + follower count
- Action buttons: "Like", "Message", "More ..."
- Tabs: Posts | About | Reviews | Followers | Photos
- Left column: About info, Reviews with star ratings
- Right column: Create post + page's posts

## Data Model Overview

See `data_model.md` for complete entity definitions.

**Core Entities:**
- **User** (6 users): id, name, avatar, cover, bio, friends[]
- **Post** (7 posts): id, userId/groupId/pageId, content, type, media, reactions[], comments[], likes[], timestamp
- **Comment**: id, userId, content, timestamp, replies[] (nested)
- **FriendRequest**: id (userId), timestamp
- **Group** (2 groups): id, name, cover, members[], description, posts[]
- **Page** (1 page): id, name, avatar, cover, description, followers[], reviews[], posts[]
- **Notification** (2 notifications): id, type, userId, content, read, timestamp
- **Reaction Types**: like, love, care, haha, wow, sad, angry

## Notes on What to Skip

- **Authentication / Login**: App starts pre-logged-in as "Admin User" (user_1). No login/logout flows
- **Real API calls**: All data is local (localStorage). No actual Xacebook API
- **File uploads to server**: Image/video in posts reference external URLs (picsum.photos, etc.)
- **Real-time messaging**: Chat is purely local state
- **Push notifications**: No real notification system
- **Video streaming**: Use sample video URLs
- **Ads**: Sponsored content is static mock data
- **Xacebook Pixel / Analytics**: No tracking

## Screenshots Reference

Screenshots are stored in `assets/screenshots/`:
- `000001-000005.jpg` — News feed desktop UI overview, page following dropdown, mobile post view, dark mode template, menu/settings screens
- `profile/` — Xacebook profile page cover photo layouts
- `marketplace/` — Marketplace listing grid and category filters
- `groups/` — Groups page with discover/browse
- `messenger/` — Chat window and messenger popups
- `watch/` — Video tab interface
- `friends/` — Friend requests and friend list pages

These screenshots serve as visual ground truth for the dev agent to replicate the real Xacebook design.
