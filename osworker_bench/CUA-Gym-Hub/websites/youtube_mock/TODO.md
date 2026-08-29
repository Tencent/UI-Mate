# XouTube Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-02-28
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell
<!-- These already exist and mostly work. Items here are fixes/refinements. -->

- [x] Project scaffold: Vite + React already set up with react-router-dom, lucide-react
- [x] **Visual design system**: CSS variables defined in `index.css` — light/dark themes with XouTube's exact colors (`--primary-red: #FF0000`, `--bg-primary`, `--text-primary`, etc.). Font: Roboto, Arial, sans-serif.
- [x] App layout: Fixed header (56px), sidebar (240px full / 72px mini / 0 closed), main content with margin-left transition
- [x] Routing: All major routes defined in App.jsx (`/`, `/watch/:videoId`, `/channel/:channelId`, `/search`, `/subscriptions`, `/watch-later`, `/history`, `/liked`, `/library`, `/trending`, `/settings`, `/go`)
- [x] State management: DataContext + initialData.js with session-aware localStorage persistence
- [x] `/go` endpoint: StateInspector component + vite.config.js server middleware for `/go`, `/state`, `/post` endpoints
- [x] Session isolation: vite.config.js mock-api plugin with `POST /post?sid=`, `GET /state?sid=`, `GET /go?sid=` + dataManager session helpers with `deepMergeWithDefaults` and array normalizers

---

## P1 — Primary Features (Fix Stub Pages)
<!-- These pages exist but are barely functional text-only stubs. They need full XouTube-like UI. -->

- [x] **Subscriptions page rewrite** (`src/pages/SubscriptionsPage.jsx` + new `SubscriptionsPage.css`): Replace the bare text list with a proper XouTube subscriptions feed. Layout: at the top, show a horizontal scrollable row of subscribed channel avatars (48px circles) with channel name below each; clicking a channel avatar filters the feed to that channel only (with an "All" option to reset). Below that, show a responsive video grid (same card style as HomePage — 16:9 thumbnail with duration badge, channel avatar 36px, title 2-line clamp, channel name, "views • time ago" metadata). Videos should come from all subscribed channels sorted by `uploadDate` descending. Each card should have the three-dot menu (Watch Later, Share, Add to playlist) identical to HomePage. If no subscriptions, show an empty state: centered icon + "No subscriptions yet" message.

- [x] **History page rewrite** (`src/pages/HistoryPage.jsx` + new `HistoryPage.css`): Replace the unstyled list with a two-column layout: left side (flex:1) shows the video list, right side (300px) shows a search bar that filters history by title. Each history item should be a horizontal card (like XouTube search results): thumbnail (240px wide, 16:9 aspect ratio) with duration badge + right side has title (16px, 2-line clamp), channel name, "views • time ago", and a brief description snippet (1-line clamp). On hover, show an X button in the top-right corner of the card to remove that item from history. At the top of the right panel: a "Search watch history" input with search icon. Below it, a "Clear all watch history" button styled as a bordered outline button (not the current unstyled default). Add a confirmation dialog (use existing `ConfirmDialog` component) before clearing all history. Group history items by date section: "Today", "Yesterday", "This week", "This month", "Older". The existing `removeFromHistory` and `clearHistory` context actions should be used.

- [x] **Watch Later page rewrite** (`src/pages/WatchLaterPage.jsx` + new `WatchLaterPage.css`): Transform from bare text into a XouTube playlist-style page. Left column (340px, fixed): large playlist cover showing the first video's thumbnail as background with gradient overlay, playlist title "Watch Later" in white bold text, video count, and a "Play all" button (blue/white rounded pill). Also show "Shuffle" and "Remove all" action buttons below. Right column (flex:1): vertical list of video items. Each item: drag handle (≡ icon, 6 dots pattern) on left, index number (#1, #2...), thumbnail (160px, 16:9) with duration badge, title (14px, 2-line clamp), channel name, "views • time ago". On hover, show a three-dot menu with "Remove from Watch later" and "Add to playlist" options. Clicking a video navigates to `/watch/:videoId`. The list should use `data.user.watchLater` mapped to video objects.

- [x] **Liked Videos page rewrite** (`src/pages/LikedVideosPage.jsx` + new `LikedVideosPage.css`): Same playlist-style layout as Watch Later (left info column + right video list). Left column: gradient background (#065FD4 to #09a0f7 blue gradient), "Liked videos" title, video count, user avatar + display name, "Play all" and "Shuffle" buttons. Right column: numbered vertical list of liked videos with thumbnail, title, channel, metadata. Each item has hover menu to "Remove from Liked videos" (calls `toggleLike`), "Add to Watch later", "Add to playlist". Use `data.user.likedVideos` mapped to video objects.

- [x] **Library page rewrite** (`src/pages/LibraryPage.jsx` + new `LibraryPage.css`): Transform from bare links into a XouTube-style library with horizontal carousel sections. Each section: section header with title ("History", "Watch later", "Liked videos", "Playlists") + "View all" link that navigates to the respective page. Below each header: a horizontal scrollable row of video cards (max 6 visible, with left/right scroll arrows on hover). Card style: 16:9 thumbnail (220px wide), title 2-line clamp, channel name, metadata. For the "Playlists" section, show playlist cards instead: playlist thumbnail with a dark overlay bar at bottom showing video count + playlist icon, then playlist name below. If a section has no items, show "No videos" placeholder text. At the top of the page, show a user info section: avatar (80px) + display name + handle.

- [x] **Trending page rewrite** (`src/pages/TrendingPage.jsx` + new `TrendingPage.css`): Replace text-only with proper XouTube Trending layout. Add a tab bar at the top: "Now" (default), "Music", "Gaming", "Movies". Filter videos by matching categories (Music tab shows Music category, Gaming tab shows Gaming, "Now" shows all sorted by viewCount). Below tabs, show a vertical list of video items similar to search results: large thumbnail (360px wide) on the left, video info on the right (title 18px bold, channel name with avatar, "views • time ago", brief description 2-line clamp). Each result should be numbered (#1, #2, etc.) with the rank displayed.

- [x] **Settings page rewrite** (`src/pages/SettingsPage.jsx` + new `SettingsPage.css`): Replace the unstyled page with a proper XouTube-style settings layout. Max-width 800px, centered. Sections with clear headings (18px, weight 500) separated by dividers. Sections to include: (1) **Account** — show user avatar, display name, email, handle in a card layout; (2) **Playback** — toggles for "Autoplay next video" (default on), "Always show captions" (default off), "Subtitles language" dropdown; (3) **General** — "Theme" radio group (Light / Dark / System), "Location" dropdown, "Language" dropdown; (4) **Notifications** — toggles for "Subscriptions", "Recommended videos", "Channel activity", "Comment replies"; (5) **Privacy** — toggles for "Keep watch history" (default on), "Keep search history" (default on), buttons for "Clear watch history" and "Clear search history" (with confirm dialog). All toggles should use the same switch component style as the theme toggle in the user menu (40px wide, 20px tall, red when active). Settings should persist to the data context (add a `settings` object to the state).

- [x] **Playlist detail page** — NEW page at route `/playlist/:playlistId` (`src/pages/PlaylistPage.jsx` + `PlaylistPage.css`): Same left-column + right-list layout as Watch Later and Liked Videos. Left column shows: playlist thumbnail (first video thumb or generic), playlist name (editable — click to show input), description (editable), privacy badge (Public/Private/Unlisted), video count, total duration estimate, creator info (avatar + name), "Play all" button, "Shuffle" button. Right column: ordered video list with index numbers, thumbnails, title, channel, metadata. Each item has a three-dot menu: "Remove from playlist", "Move to top", "Move to bottom", "Add to Watch later". Clicking "Play all" navigates to the first video's watch page. Add this route to App.jsx: `<Route path="/playlist/:playlistId" element={<PlaylistPage />} />`. Update the Library page playlist cards to link to this page.

- [x] **Add `removeFromPlaylist` action to DataContext**: New function `removeFromPlaylist(playlistId, videoId)` that removes the given videoId from the playlist's videoIds array. Also add `removeFromWatchLater(videoId)` which removes from `data.user.watchLater`. Also add `deletePlaylist(playlistId)` which removes the playlist from `data.playlists` and from `data.user.playlists`.

- [x] **Add `updatePlaylist` action to DataContext**: New function `updatePlaylist(playlistId, updates)` where updates can include `{ name, description, privacy }`. Used by the playlist detail page for inline editing.

- [x] **Add `settings` object to data model**: Add a `settings` object to `getDefaultData()` in `initialData.js`: `settings: { autoplay: true, captions: false, subtitlesLang: "English", theme: "light", location: "United States", language: "English", notifSubscriptions: true, notifRecommended: true, notifActivity: true, notifReplies: true, keepWatchHistory: true, keepSearchHistory: true }`. Add `updateSettings(updates)` action to DataContext that shallow-merges updates into `data.settings`. Add a normalizer for settings in the `arrayNormalizers` (or add it in `deepMergeWithDefaults` for object keys).

- [x] **Comment sort toggle**: On the VideoPlayerPage, make the "Top comments" / "Newest first" sort actually work. Add a dropdown or toggle that switches between sorting comments by `likeCount` descending (top) or `timestamp` descending (newest). Currently the sort button exists visually but has no handler.

- [x] **Autoplay toggle on watch page**: Add an autoplay toggle switch in the suggested videos sidebar header (right-aligned, labeled "Autoplay"). When enabled, after the current video ends (listen for `ended` event on video element), automatically navigate to the first suggested video.

---

## P2 — Secondary Features
<!-- Depth and realism. Implement only after all P1 items are complete. -->

- [ ] **Search autocomplete**: As the user types in the header search bar, show a dropdown below the search input listing up to 8 matching video titles from the data (filtered by prefix match, case-insensitive). Each suggestion shows a search icon (🔍) on the left + the matching text. Clicking a suggestion fills the search input and triggers navigation to `/search?q=...`. Press Escape to close the dropdown. The dropdown should be absolutely positioned, same width as the search input container, with `var(--bg-primary)` background and `var(--border-color)` border.

- [ ] **"Not interested" in video card menu**: Add "Not interested" and "Don't recommend channel" options to the three-dot menu on video cards (HomePage, Subscriptions, etc.). "Not interested" removes the video from the current view (filter it out of the displayed list but don't delete from data). "Don't recommend channel" removes all videos from that channel from the current view. Show a toast "Video removed" / "Channel hidden" with an "Undo" link that reverses the action. These are view-state only (not persisted to data context).

- [ ] **Theater mode**: On VideoPlayerPage, add a theater mode toggle button in the video controls bar (between settings and fullscreen). When activated: video player expands to full width (no sidebar of suggested videos), suggested videos move below the video, and the main content has no padding. Toggle back to default layout.

- [ ] **Sidebar "Show more" subscriptions**: The sidebar currently limits to 7 subscriptions and shows "Show N more" button. Make this button work: clicking it expands to show all subscribed channels. Button text changes to "Show less". Persist expanded/collapsed state in component state.

- [ ] **Video progress in history**: In the data model, add `progress` (0-1 float) to each `watchHistory` entry. When rendering history items, show a thin red progress bar at the bottom of the thumbnail indicating how much of the video was watched (width = progress × 100%). On the watch page, update the progress when the video time changes (debounced update to history).

- [ ] **Channel playlists tab**: On the ChannelPage, populate the "Playlists" tab. Show playlists created by that channel (currently shows "No playlists available"). For the mock, assign 1-2 playlists per channel. Display as a grid of playlist cards: thumbnail with dark overlay showing video count, playlist title below.

- [ ] **Delete comment**: Add a three-dot menu (⋮) on comments authored by the current user. Menu options: "Edit", "Delete". Delete removes the comment from the comments array (add `deleteComment(videoId, commentId)` to DataContext). Edit switches the comment text to an input field for inline editing (add `editComment(videoId, commentId, newText)` to DataContext).

- [ ] **Notification types**: Add variety to notifications beyond just "new_video". Add notifications of type "comment_reply" (someone replied to your comment — show comment snippet) and "milestone" (channel reached subscriber milestone). Update notification rendering to handle these types differently. Add 2-3 more notifications of these new types to the seed data.

- [ ] **Keyboard shortcuts on video player**: When the video player is focused (or the watch page is active): Space = play/pause, M = mute/unmute, F = fullscreen, J = seek back 10s, L = seek forward 10s, K = play/pause, Left arrow = seek back 5s, Right arrow = seek forward 5s, Up arrow = volume up 5%, Down arrow = volume down 5%. Show a brief "?" keyboard shortcut help overlay.

- [ ] **Responsive sidebar collapse**: When the window width is below 1312px, the full sidebar should automatically collapse to mini mode. Below 768px, hide the sidebar entirely. Add an overlay sidebar that slides in from the left when hamburger is clicked on small screens (with a semi-transparent backdrop).

---

## Data Seed (implement in createInitialData())
<!-- These are enhancements to existing seed data -->

- [ ] **Watch history progress**: Add `progress` field (float 0-1) to each `watchHistory` entry. Example: `{ videoId: "video-1", watchedAt: "...", progress: 0.75 }`. Some should be 1.0 (fully watched), some partial.
- [ ] **More diverse comments**: Add comments to at least 20 of the 50 videos (currently only 9 have comments). Include 1-2 pinned comments (set `isPinned: true` on channel owner's comment). Add more varied comment text and higher reply counts on popular videos.
- [ ] **Notification variety**: Add 6+ notifications total. Include at least one "comment_reply" type: `{ type: "comment_reply", commentSnippet: "Great video!", commenterName: "Sarah", ... }` and one "milestone" type: `{ type: "milestone", channelId: "channel-2", milestone: "1M subscribers" }`.
- [x] **Settings defaults**: Add `settings` object to `getDefaultData()` with all default values (see §Settings in P1 item above).

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login (app starts pre-logged-in as `Alex Thompson` / `@alexthompson`)
- Real video upload or file handling (Create button is non-functional)
- XouTube Studio / Creator dashboard
- XouTube Shorts viewer (sidebar link exists but no dedicated page)
- Live streaming functionality
- XouTube Music / XouTube TV integration
- Monetization, ads, memberships
- Real network requests (all data is local/mock)
- Mobile-specific UI (we target desktop only)
- XouTube Premium features
