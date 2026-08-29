# Xwitter/X Mock — Research Summary

> **Application**: X (formerly Xwitter) — [x.com](https://x.com)
> **Category**: Microblogging / Social Media Platform
> **Researched**: 2026-02-28
> **Current state**: Existing twitter_mock with ~85% core features; needs DM, bookmarks, lists, quote tweet, edit profile, and improved polish

---

## 1. Application Overview

X (formerly Xwitter) is a real-time microblogging and social media platform where users post short messages ("posts" / formerly "tweets") of up to 280 characters (25,000 for Premium subscribers). Users follow other accounts, engage via likes/reposts/replies, and discover content through algorithmic and chronological feeds.

### Key Distinguishing Features
- **Real-time feed** with two modes: "For you" (algorithmic) and "Following" (chronological)
- **Threaded conversations** with nested replies and conversation views
- **Repost ecosystem**: repost (share as-is) and quote post (add commentary)
- **Hashtag and trending** discovery system
- **Direct messages** with 1:1 and group conversations
- **Bookmarks** for private content saving
- **Lists** for curated account groups
- **Notifications** split into "All" and "Mentions" tabs

### Target User Personas
1. **Casual Browser** — Scrolls feed, likes/bookmarks posts, occasionally replies
2. **Content Creator** — Composes posts with media, builds threads, monitors engagement metrics
3. **Networker** — Uses DMs, follows/unfollows, manages lists
4. **News Consumer** — Uses Explore/Trending, searches hashtags, reads threads

---

## 2. UI Layout (Desktop Web — 3-Column)

Reference: `screenshots/profile_000002.jpg` (primary reference for full layout)

### Left Sidebar (275px on XL, 68px collapsed on smaller screens)
- **X Logo** (top) — links to Home
- **Navigation items** (icon + label on XL, icon-only on smaller):
  - Home (house icon)
  - Explore (hashtag / magnifying glass icon)
  - Notifications (bell icon + unread badge)
  - Messages (envelope icon + unread badge)
  - Grok (sparkle/AI icon) — *out of scope for mock*
  - Bookmarks (bookmark icon)
  - Lists (list icon)
  - Communities (people icon) — *P2 feature*
  - Premium (X logo) — *out of scope*
  - Profile (user avatar)
  - More (three dots ellipsis — opens dropdown)
- **"Post" button** (large, rounded, Xwitter-blue `#1DA1F2`) — opens compose modal
- **User account pill** (bottom) — avatar + name + handle + ⋯ dropdown

### Main Content Area (max-width ~600px, centered)
- **Top bar** — page title (e.g., "Home") + tab switcher (e.g., "For you" | "Following")
- **Content feed** — list of post cards in reverse chronological order
- **Composer** (on Home page only) — inline at top of feed: avatar + "What is happening?!" placeholder + media buttons + Post button

### Right Sidebar (350px, hidden on <1024px)
- **Search bar** (magnifying glass, rounded, "Search" placeholder)
- **"What's happening"** / "Trends for you" panel — numbered trending topics with category, hashtag, post count
- **"Who to follow"** panel — 3 suggested accounts with avatar, name, handle, Follow button, "Show more" link
- **Footer** — Terms · Privacy policy · Cookies · Ads info · More · © X Corp.

---

## 3. Complete Feature List

### P0 — Core Shell (required for app to render)
| # | Feature | Status in Current Mock |
|---|---------|----------------------|
| 1 | Project scaffold (Vite + React + Tailwind) | ✅ Done |
| 2 | 3-column layout (sidebar / main / right sidebar) | ✅ Done |
| 3 | React Router routing | ✅ Done |
| 4 | DataContext + dataManager state management | ✅ Done |
| 5 | Session isolation (vite.config.js middleware) | ✅ Done |
| 6 | `/go` state inspection endpoint | ✅ Done |
| 7 | Responsive sidebar collapse | ✅ Done |

### P1 — Primary Features (core workflows)
| # | Feature | Status |
|---|---------|--------|
| 1 | Home feed with "For you" / "Following" tabs | 🟡 Partial (no tab switching) |
| 2 | Compose post (inline + modal) with 280-char limit | ✅ Done |
| 3 | Post card: avatar, name, handle, timestamp, content, media | ✅ Done |
| 4 | Like/unlike toggle | ✅ Done |
| 5 | Repost/un-repost toggle | ✅ Done |
| 6 | Reply to post | ✅ Done |
| 7 | Quote post (compose modal pre-filled with quoted post) | ❌ Missing |
| 8 | Bookmark/un-bookmark post | ❌ Missing |
| 9 | Bookmarks page (`/bookmarks`) | ❌ Missing |
| 10 | Post detail page with thread/reply view | ✅ Done |
| 11 | Profile page: banner, avatar, bio, stats, tabs | 🟡 Partial (tabs non-functional) |
| 12 | Edit profile modal (name, bio, location, website) | ❌ Missing |
| 13 | Follow/unfollow | ✅ Done |
| 14 | Notifications page with "All" / "Mentions" tabs | 🟡 Partial (no tab filtering) |
| 15 | Explore page with search | ✅ Done |
| 16 | Trending topics in right sidebar | ✅ Done |
| 17 | "Who to follow" suggestions in right sidebar | ❌ Missing |
| 18 | Direct Messages page (`/messages`) | ❌ Missing |
| 19 | DM conversation view | ❌ Missing |
| 20 | Post three-dot menu (delete, pin, bookmark) | ❌ Missing |
| 21 | Share post (copy link) | ✅ Done |

### P2 — Secondary Features (depth and polish)
| # | Feature | Status |
|---|---------|--------|
| 1 | Profile tabs: Posts, Replies, Media, Likes | ❌ Only Posts |
| 2 | Lists page (`/lists`) — create, view, manage lists | ❌ Missing |
| 3 | Followers/Following page with user cards | 🟡 Partial (Following only) |
| 4 | Hashtag highlighting in post content | ❌ Missing |
| 5 | @mention highlighting and linking | ❌ Missing |
| 6 | URL link detection in post content | ❌ Missing |
| 7 | Image lightbox/modal on click | ❌ Missing |
| 8 | Post polls (create + vote) | ❌ Missing |
| 9 | Thread creation (multi-post composer) | ❌ Missing |
| 10 | Pinned post on profile | ❌ Missing |
| 11 | Mute/block user from post menu | ❌ Missing |
| 12 | Keyboard shortcuts | ❌ Missing |
| 13 | Character counter ring animation in composer | ❌ Missing |
| 14 | Notification types: follow, like, repost, mention, reply | 🟡 Partial |
| 15 | Mark individual notifications as read on view | ❌ Missing |

---

## 4. Keyboard Shortcuts Reference

From X's built-in shortcut panel (`?` key):

### Navigation
| Key | Action |
|-----|--------|
| G + H | Go to Home |
| G + E | Go to Explore |
| G + N | Go to Notifications |
| G + M | Go to Direct Messages |
| G + P | Go to Profile |
| G + L | Go to Likes |
| G + I | Go to Lists |
| G + B | Go to Bookmarks |
| G + S | Go to Settings |

### Actions
| Key | Action |
|-----|--------|
| N | New post |
| / | Focus search |
| L | Like selected post |
| R | Reply to selected post |
| T | Repost selected post |
| B | Bookmark selected post |
| Enter | Open post details |
| J / K | Next / previous post |

---

## 5. Color Palette & Visual Design

### Colors (from X/Twitter default theme — dark text on white)
| Role | Color | Hex |
|------|-------|-----|
| Primary / Brand | Xwitter Blue | `#1DA1F2` |
| Text Primary | Near-black | `#0F1419` |
| Text Secondary | Gray | `#536471` |
| Text Tertiary / Muted | Light gray | `#8B98A5` |
| Background | White | `#FFFFFF` |
| Background Hover | Light gray | `#F7F9F9` |
| Border / Divider | Faint gray | `#EFF3F4` |
| Like (active) | Red/Pink | `#F91880` |
| Repost (active) | Green | `#00BA7C` |
| Bookmark (active) | Blue | `#1DA1F2` |
| Reply icon | Gray | `#536471` |
| Share icon | Gray | `#536471` |
| Danger / Delete | Red | `#F4212E` |
| Verified badge | Blue | `#1DA1F2` |

### Typography
| Element | Font | Size | Weight |
|---------|------|------|--------|
| System font stack | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | — | — |
| Display name | System | 15px | 700 (bold) |
| Handle (@username) | System | 15px | 400 |
| Post body | System | 15px | 400 |
| Timestamp | System | 15px | 400 |
| Page title | System | 20px | 700 |
| Sidebar nav label | System | 20px | 400 (700 when active) |
| Trending label | System | 13px | 400 |
| Trending topic | System | 15px | 700 |
| Post count | System | 13px | 400 |

### Spacing & Sizing
| Element | Value |
|---------|-------|
| Sidebar width (XL) | 275px |
| Sidebar width (collapsed) | 68px |
| Main feed max-width | 600px |
| Right sidebar width | 350px |
| Post avatar size | 40px (48px in detail view) |
| Post padding | 12px horizontal, 12px vertical |
| Border-radius (buttons) | 9999px (pill shape) |
| Border-radius (cards/panels) | 16px |
| Post button height | 36px (inline), 52px (sidebar) |

---

## 6. UI Layout Per View

### Home (`/`)
- Top bar: "Home" title, no back arrow
- Tab bar: "For you" | "Following" (underline indicator on active tab)
- Inline composer: current user avatar (40px) + "What is happening?!" textarea + toolbar (image, GIF, poll, emoji, schedule, location) + character count + "Post" button
- Horizontal divider
- Feed: list of PostCards, reverse chronological
- Each PostCard: avatar | header (name · @handle · relative time · ⋯ menu) | content | media grid | action bar (reply count, repost count, like count, views count, bookmark icon, share icon)

### Explore (`/explore`)
- Top bar: Search input (full width, rounded)
- Tabs: "For you" | "Trending" | "News" | "Sports" | "Entertainment"
- Trending list: category label, trend name/hashtag, post count
- Each trending item clickable → search results for that topic

### Notifications (`/notifications`)
- Top bar: "Notifications" title + gear icon (settings)
- Tab bar: "All" | "Verified" | "Mentions"
- Notification items grouped by type:
  - **Follow**: "[avatar] [name] followed you"
  - **Like**: "[avatar] [name] liked your post" + post preview
  - **Repost**: "[avatar] [name] reposted your post" + post preview
  - **Reply**: "[avatar] [name] replied to your post" + reply content
  - **Mention**: "[avatar] [name] mentioned you" + post content

### Messages (`/messages`)
- Split view: conversation list (left) | active conversation (right)
- Conversation list: search DMs bar, list of conversations (avatar, name, handle, last message preview, timestamp)
- Active conversation: header (name, @handle) | message bubbles (sent=right/blue, received=left/gray) | compose bar (input + media + GIF + emoji + send)
- New message button (envelope + plus icon)

### Profile (`/profile/:handle` or `/:handle`)
- Back arrow + display name + post count
- Banner image (200px tall, full width)
- Avatar (overlapping banner, 134px, circular, white border)
- Action buttons: More (⋯), Message, Follow/Following
- Info section: display name (bold), @handle, bio, link icon + URL, location icon + location, calendar icon + "Joined [month year]"
- Stats: N Following · N Followers (clickable)
- Tabs: Posts | Replies | Highlights | Media | Likes
- Feed filtered by active tab

### Post Detail (`/status/:id`)
- Back arrow + "Post" title
- Full post: large avatar (48px), name, handle, full content, timestamp (absolute: "HH:MM · Mon DD, YYYY"), media, engagement stats bar (reposts, quotes, likes, bookmarks, views)
- Action bar: reply, repost, like, bookmark, share
- Reply composer
- Replies list (threaded)

### Bookmarks (`/bookmarks`)
- Top bar: "Bookmarks" title + ⋯ menu (clear all bookmarks)
- List of bookmarked posts

### Lists (`/lists`)
- Top bar: "Lists" title + new list button
- "Your Lists" section: list cards (name, description, member count)
- "Pinned Lists" section

---

## 7. What to Skip (Out of Scope)

- **Authentication** — App starts pre-logged-in as default user
- **X Premium / subscription** — No monetization features
- **Grok AI** — No AI assistant integration
- **Spaces (live audio)** — Too complex for mock
- **Communities** — Simplified or omitted
- **Real-time updates / WebSocket** — Static data with user-triggered updates
- **Video playback** — Static image thumbnails only
- **Ads / promoted content** — Omitted
- **Analytics dashboard** — Omitted
- **Account settings** — Omitted (except display preferences if P2)

---

## 8. Screenshots Index

| File | Description |
|------|-------------|
| `home_000001.jpg` | Xwitter profile card embed showing user stats and post |
| `home_000003.jpg` | Embedded tweet feed showing posts with engagement metrics |
| `home_000004.jpg` | Tweet feed customization panel with live preview |
| `profile_000001.jpg` | X profile page wireframe/mockup (X logo in top bar, banner, avatar, "You might like") |
| `profile_000002.jpg` | **⭐ PRIMARY REFERENCE** — Full desktop 3-column layout: left sidebar (Home, Explore, Notifications, Messages, Bookmarks, Lists, Profile, More, Tweet button), main content (profile with banner, avatar, bio, stats, tabs: Tweets / Tweets & replies / Media / Likes, tweet cards), right sidebar (Search, photo grid, "You might like", "Trends for you") |
| `profile_000004.jpg` | Multiple mobile Xwitter screens showing: sidebar drawer menu, home feed, notifications (All/Mentions tabs), trending |
| `dm_000001.jpg` | Mobile DM conversation view (Japanese text, chat bubbles, compose bar) |
| `dm_000004.jpg` | DM inbox with pinned chats feature announcement |
| `dm_000005.jpg` | DM inbox showing conversation list with avatars, names, previews |
