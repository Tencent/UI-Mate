# XouTube Mock — Research Summary

> Last updated: 2026-02-28 by plan agent

## App Overview

XouTube is the world's largest video-sharing platform (owned by Google). Users upload, watch, rate, share, and comment on videos. The desktop web interface features a persistent header with search, a collapsible left sidebar for navigation, and a main content area that shows video grids (home), a video player (watch page), channel pages, search results, and personal library views.

## Key User Personas & Primary Workflows

### Casual Viewer (primary persona for agent training)
1. **Browse home feed** — scroll through video grid, use category filter chips
2. **Search for content** — type query in search bar, filter results by type/date/views
3. **Watch a video** — click thumbnail, use video player controls (play/pause, seek, volume, fullscreen)
4. **Engage with video** — like/dislike, subscribe to channel, share, save to playlist, comment
5. **Manage library** — view watch history, watch later, liked videos, playlists
6. **Explore channels** — visit channel page, browse videos/playlists/about tabs
7. **Manage subscriptions** — view subscriptions feed, subscribe/unsubscribe
8. **Handle notifications** — view notification bell, click to navigate

### Content Creator (secondary)
- View own channel page
- Manage playlists (create, rename, delete, add/remove videos, reorder)

## Feature List with Priority

### P0 — Core Shell (already partially built)
- [x] Header: logo, hamburger menu, search bar with voice search button, create button, notification bell with badge, user avatar with dropdown menu
- [x] Sidebar: Home, Shorts, Subscriptions | You section (Your channel, History, Watch later, Liked videos, Library) | Subscriptions list with avatars | Explore section (Trending, Music, Gaming, News, Sports, Learning)
- [x] Video grid homepage with category filter chips
- [x] Video player page with HTML5 video controls
- [x] Routing for all major pages
- [x] Dark/light theme toggle
- [x] Session isolation (vite.config.js)
- [x] `/go` state inspection endpoint

### P1 — Primary Interactive Features
- [x] Like/unlike videos (state tracked)
- [x] Subscribe/unsubscribe to channels (state tracked)
- [x] Add/remove from Watch Later
- [x] Add comments and replies
- [x] Create playlists
- [x] Add videos to playlists
- [x] Search with filter and sort
- [x] Video player: play/pause, seek, volume, fullscreen, quality
- [x] Notification panel with read/unread
- [x] Share modal with copy link
- [ ] **NEEDS FIX**: Subscriptions page — currently a bare text list, needs proper video grid layout
- [ ] **NEEDS FIX**: History page — currently unstyled, needs thumbnails, video cards, search/filter
- [ ] **NEEDS FIX**: Watch Later page — currently bare text, needs proper video list with thumbnails
- [ ] **NEEDS FIX**: Liked Videos page — currently bare text, needs proper video list
- [ ] **NEEDS FIX**: Library page — currently bare links, needs sections with video carousels
- [ ] **NEEDS FIX**: Trending page — currently text-only, needs proper video cards
- [ ] **NEEDS FIX**: Settings page — currently unstyled, needs proper XouTube-style sections

### P2 — Secondary Features
- [ ] Playlist detail page (view all videos in a playlist, play all)
- [ ] Playlist management (rename, delete playlist, remove/reorder videos)
- [ ] Sort comments (Top comments / Newest first)
- [ ] Autoplay toggle on watch page
- [ ] Theater mode toggle
- [ ] "Not interested" / "Don't recommend channel" in video card menu
- [ ] Search suggestions/autocomplete dropdown
- [ ] Channel playlists tab content
- [ ] Remove from Watch Later on Watch Later page
- [ ] Video progress bars in history (watched percentage)
- [ ] Delete individual comments
- [ ] Edit comments
- [ ] Sidebar "Show more" subscriptions expand/collapse

## UI Layout Description

### Header (56px fixed top)
- **Left**: Hamburger menu icon (24px) → XouTube logo (red play button + "XouTube" text)
- **Center**: Search input (rounded pill, max-width 640px) with search icon button + voice search button (40px circle)
- **Right**: Create (+) button, Notification bell (with red badge count), User avatar (32px circle)

### Sidebar (240px full / 72px mini / 0px closed)
- Full sidebar: icon (24px) + label text for each item
- Mini sidebar: icon only, centered
- Sections separated by thin dividers
- Subscriptions section shows channel avatars (24px) + name
- Active item has highlighted background

### Home Page
- Sticky category chips bar below header (horizontal scroll, "All" selected by default)
- Video grid: responsive 4-5 columns, each card = 16:9 thumbnail + duration badge + channel avatar + title (2 lines max) + channel name + "views • time ago"
- Three-dot menu on thumbnail hover (Watch Later, Share, Add to playlist)

### Watch/Video Player Page
- Two-column layout: main player (flex:1) + suggested videos sidebar (400px)
- Video player: 16:9 aspect ratio, black background, red progress bar, controls overlay on hover
- Below player: title (20px), views + date, action buttons row (Like/Dislike/Share/Download/Save/More)
- Channel info: avatar + name + subscriber count + Subscribe button (red) + bell icon
- Description box (expandable, gray rounded card)
- Comments section: count + sort toggle, add comment input, comment list with avatars + replies
- Suggested sidebar: compact video items (168px thumbnail + title + channel + stats)

### Channel Page
- Full-width banner image
- Channel info row: avatar (80px) + name + handle + stats + Subscribe button
- Tab bar: Home | Videos | Shorts | Playlists | Community | Channels | About
- Content area changes per tab

### Search Results Page
- Filter tabs (All / Videos / Channels / Playlists) + sort dropdown
- Horizontal video result items: large thumbnail (360px) + title + metadata + channel avatar + description

## Color Palette

### Light Theme
| Token | Hex | Usage |
|-------|-----|-------|
| primary-red | #FF0000 | XouTube red, subscribe button, progress bar |
| bg-primary | #FFFFFF | Main backgrounds, cards |
| bg-secondary | #F9F9F9 | Page background |
| text-primary | #030303 | Headings, body text |
| text-secondary | #606060 | Metadata, timestamps |
| hover-bg | #F2F2F2 | Hover states, chip backgrounds |
| border-color | #E5E5E5 | Borders, dividers |

### Dark Theme
| Token | Hex | Usage |
|-------|-----|-------|
| bg-primary | #0F0F0F | Main backgrounds |
| bg-secondary | #181818 | Page background |
| text-primary | #FFFFFF | Text |
| text-secondary | #AAAAAA | Metadata |
| hover-bg | #3F3F3F | Hover states |
| border-color | #3F3F3F | Borders |

### Typography
- Font family: "Roboto", "Arial", sans-serif
- Video title in grid: 14px, weight 500
- Video title on watch page: 20px, weight 500
- Channel name: 12-16px
- Metadata: 12px, secondary color
- Category chips: 14px, weight 500

## Data Model Overview

See `data_model.md` for complete entity definitions.

**Core entities**: User, Video, Channel, Playlist, Comment, Notification
**Key relationships**:
- User subscribes to Channels
- User has watchHistory (ordered list of videoId + timestamp)
- User has likedVideos and watchLater (arrays of videoIds)
- Videos belong to Channels
- Comments belong to Videos and have nested replies
- Playlists contain ordered lists of videoIds
- Notifications reference Channels and Videos

## What to Skip (Out of Scope)

- **Authentication**: App starts pre-logged-in as "Alex Thompson" (@alexthompson)
- **Real video playback**: Uses a single sample video URL for all videos
- **Shorts**: Only shows as sidebar item, no actual Shorts viewer
- **Live streaming**: No live stream functionality
- **XouTube Studio**: No creator dashboard
- **Monetization**: No ad insertion, no membership features
- **Upload**: Create button exists but doesn't open upload flow
- **Real search API**: Search filters local data only
- **Community posts**: Not implemented
