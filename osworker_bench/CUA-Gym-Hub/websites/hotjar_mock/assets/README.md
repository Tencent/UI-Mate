# Xotjar Mock -- Assets & Research Summary

## App Overview

Xotjar is a product analytics and user behavior tool (now part of Contentsquare) that helps website owners understand how users interact with their sites. It provides visual analytics through heatmaps, session recordings, surveys, and feedback widgets. Unlike traditional analytics tools that show numbers and graphs, Xotjar specializes in qualitative, visual behavior data -- showing exactly where users click, how far they scroll, and what frustrates them.

## Key User Personas

### 1. UX Designer / Product Manager (Primary)
- Reviews heatmaps to understand user attention patterns
- Watches session recordings to identify usability issues
- Creates surveys to gather user feedback on new features
- Uses funnels to find conversion drop-off points
- Monitors dashboard for daily overview metrics

### 2. Marketing Manager
- Analyzes landing page heatmaps for conversion optimization
- Reviews scroll maps to check content engagement
- Monitors A/B test page performance via heatmap comparison
- Sets up on-site surveys for campaign feedback

### 3. Developer / QA
- Watches recordings with console errors to debug issues
- Filters recordings by rage clicks to find broken UI elements
- Reviews feedback reports for bug reports from users

## Complete Feature List

### P0 -- Core (Must have for app to render)
1. App shell with header bar (Xotjar logo, site selector, search, user menu)
2. Left sidebar navigation (collapsible icon bar + expanded labels)
3. Routing between all major views
4. State management (AppContext + dataManager)
5. `/go` endpoint for state inspection
6. Session isolation via mock-api plugin

### P1 -- Primary Features (Core workflows)
1. **Dashboard** -- Overview page with metric cards (Total sessions, Avg. session duration, Avg. pages/session), Top clicked buttons & links list, Top pages list, Rage clicks & u-turns summary, Feedback summary; date range filter and "+ Add filter" button
2. **Heatmaps List** -- Table of all heatmaps with name, URL, status (Recording/Paused/Complete), date created, sessions count; ability to create a new heatmap
3. **Heatmap Viewer** -- Simulated heatmap overlaid on a greyed-out mock website screenshot; device toggle (Desktop/Tablet/Mobile); type toggle (Click/Move/Scroll); click count tooltip on hover; HOT-to-COLD gradient legend; "About this heatmap" sidebar with page stats (U-turns, Rage clicks, Drop-off rate, Time on page, Total errors); download button
4. **Recordings List** -- Sortable table of session recordings with columns: checkbox, visitor ID, pages visited, duration, country, device, browser, frustration score (1-5 dots), engagement score, date; filter bar (pages visited, device, browser, OS, date range, frustration level, events); pagination
5. **Recording Player** -- Simulated session replay viewport showing a mock website with animated cursor movement; playback controls (play/pause, speed 1x/2x/4x, skip forward/back, timeline scrubber); session info sidebar (visitor ID, device, browser, screen size, location, pages visited, session start time, duration); event timeline markers (clicks, scrolls, rage clicks, u-turns); "Create Highlight" button
6. **Surveys List** -- Table of surveys with name, status (Active/Draft/Paused/Completed), responses count, date created; "Create survey" button
7. **Survey Builder** -- Step-by-step editor: question list (add/remove/reorder), question type selector (Reaction/Long text/Short text/Email/Radio/Checkbox/NPS/Rating/Statement), question text editor, answer options editor for radio/checkbox; logic/branching rules; appearance tab (widget position, color); behavior tab (show on URL, show after seconds, device targeting); preview panel showing widget on right side
8. **Survey Results** -- Response summary with charts, individual response list, NPS score display, AI-generated summary

### P2 -- Secondary Features (Depth/realism)
1. **Funnels** -- Funnel builder: define steps (page URL or event), funnel visualization (horizontal bars showing drop-off at each step), conversion rate between steps, click to view recordings for specific step
2. **Trends** -- Line chart showing custom metrics over time (sessions, pageviews, rage clicks, etc.); date range selector; compare mode; metric selector dropdown
3. **Highlights** -- Collection of saved clips from recordings and heatmaps; create highlight from recording player (select start/end time); organize highlights into collections; share highlight (copy link)
4. **Feedback Widget (legacy)** -- Mini widget preview, feedback list with thumbs-up/thumbs-down counts, sentiment breakdown, page-level feedback detail
5. **Events List** -- Table of tracked events with name, type (custom/auto), first seen, last seen, count
6. **Site Settings** -- Organization name, site URL, tracking code snippet display, team members list, notification preferences
7. **Search** -- Global search bar in header that searches across heatmaps, recordings, surveys by name/URL
8. **Comparison Mode** -- Side-by-side heatmap comparison (two heatmaps for same page with different segments)
9. **Date Range Picker** -- Popover calendar with preset ranges (Last 7 days, Last 30 days, Last 90 days, Custom range)
10. **Filter System** -- Reusable filter bar component with "+ Add filter" button, filter type dropdown, value input, applied filters shown as removable pills

## UI Layout Description by View

### Header Bar
- Left: Xotjar flame logo (links to dashboard)
- Center-left: Site selector dropdown (shows current site URL, dropdown to switch between sites)
- Center: Search bar (magnifying glass icon + "Search..." placeholder)
- Right: Help icon (question mark), notifications bell, user avatar with dropdown menu

### Left Sidebar (from top to bottom, based on screenshot 000003.jpg)
- Overview (home icon)
- Dashboard (grid/chart icon) -- active state has blue text + blue left border
- Highlights (sparkle/star icon)
- [divider]
- Trends (line chart icon)
- Funnels (funnel icon)
- [divider]
- Recordings (screen/play icon)
- Heatmaps (fire/target icon)
- [divider]
- Feedback (speech bubble icon)
- Surveys (checklist icon)
- [divider]
- Interviews (person icon) -- non-functional in mock

### Dashboard View
- Page title "Dashboard" with subtitle "An aggregated view of all your data"
- Filter bar: date range pill ("Last 30 days") + "+ Add filter" button
- Row of 3 metric cards: Total sessions (number + sparkline), Avg. session duration (time + sparkline), Avg. pages/session (number + sparkline)
- Two-column section: "Top clicked buttons & links" (bar chart list with # and icon toggle) | "Top pages" (URL list with link icons)
- Bottom section: "Feedback" summary | "Rage clicks & u-turns" summary

### Heatmap Viewer
- Top toolbar: DEVICE toggle (Desktop | Tablet | Mobile with session counts), TYPE toggle (Click | Move | Scroll), download button
- Main area: Mock website screenshot with color heatmap overlay
- Hover tooltip: shows click count and percentage at cursor position (e.g., "734 clicks (10.1%)")
- Right side: HOT-to-COLD vertical gradient legend, "CLICKS RECORDED: 7,376" counter
- Optional right sidebar: "About this heatmap" with page screenshot, Page stats (U-turns, Rage clicks, Drop-off rate, Time on page, Total errors), Map types grid (Click, Move, Scroll, Engagement, Rage)

### Recordings List
- Filter bar at top with filter pills
- Table with columns: Checkbox, User/Visitor, Pages, Duration, Country flag, Device icon, Browser icon, Frustration (dot indicators), Engagement, Date
- Each row clickable to open the recording player
- Sort by clicking column headers (arrows indicate direction)
- Pagination at bottom

### Recording Player
- Large viewport area showing the "recorded" website with an animated cursor
- Bottom control bar: play/pause, skip 10s back/forward, playback speed (1x/2x/4x), timeline scrubber with event markers, elapsed/total time
- Right sidebar: Visitor info panel (IP hash, pages count, date, duration), action icons (star, bookmark, share, delete, settings), page navigation breadcrumb (/signin > /dashboard > ...)

## Data Model Overview

See `data_model.md` for full schema. Key entities:
- **Sites**: The tracked websites/projects
- **Heatmaps**: Heatmap configurations with page URL, status, type
- **Recordings/Sessions**: Visitor session data with events timeline
- **Surveys**: Survey definitions with questions and responses
- **Feedback**: Individual feedback items with sentiment
- **Funnels**: Funnel definitions with conversion steps
- **Trends**: Metric chart configurations
- **Highlights**: Saved clips from recordings
- **Events**: Custom tracked events
- **Dashboard Metrics**: Aggregated stats for the overview

## Notes on What to Skip

- **Authentication/Login**: App starts pre-logged-in as "Alex Chen" (UX Designer)
- **Real tracking code installation**: Show a static code snippet in settings but do not execute
- **Actual session recording/replay**: Simulate with pre-built animation sequences
- **Real heatmap generation**: Use pre-rendered SVG/Canvas overlays on static screenshots
- **Interviews/Engage feature**: Show in sidebar but mark as "Coming soon" or stub
- **Real-time data collection**: All data is seeded mock data
- **Integrations**: Show integration cards but do not connect to real services

## Screenshots Reference

### Primary references (original search screenshots)
- `screenshots/000003.jpg` -- Dashboard view with sidebar navigation (BEST reference for layout)
- `screenshots/000004.jpg` -- Heatmap view with sidebar icons, device/type toggles, click heatmap overlay
- `screenshots/heatmaps/000001.jpg` -- Scroll heatmap example (red-to-green gradient)
- `screenshots/heatmaps/000002.jpg` -- Click heatmap with Xotjar UI frame
- `screenshots/heatmaps/000004.jpg` -- Heatmap example from blog
- `screenshots/surveys/000001.jpg` -- Survey builder with question editing and logic branching
- `screenshots/recordings/000004.jpg` -- Xotjar homepage showing recording player preview

### Reference screenshots (high-fidelity Mobbin captures -- use these for pixel-accurate implementation)
- `screenshots/reference/botubot_0003.webp` -- **Highlights page**: shows full app shell with sidebar icons, header with site selector + icons, highlights collection view with sub-sidebar, empty state, toast notification
- `screenshots/reference/botubot_0005.webp` -- **Heatmap viewer**: click heatmap with colored blobs, numbered top-click badges, right sidebar with "About this heatmap" panel (Map types grid, Overlays, Stats), device count bar at bottom, scroll depth indicator
- `screenshots/reference/botubot_0007.webp` -- **Account & Security settings**: settings sub-sidebar (Account/Appearance/Notifications/Organization icons), avatar upload, name/role/email fields, Save changes button
- `screenshots/reference/botubot_0010.webp` -- **Funnels page**: step builder with "Viewed page contains" conditions, "+ Add step" button, empty funnel bar chart placeholder, "+ Add to dashboard" button
- `screenshots/reference/botubot_0011.webp` -- **Dashboard view (BEST)**: full dashboard with sub-sidebar (Pinned/Dashboards sections), segment tabs, 4 metric cards with sparklines, Page overview widget, Top clicked buttons widget, "+ Add widget" button
- `screenshots/reference/botubot_0012.webp` -- **Save segment modal**: segment name input, Slack/Teams/Webhooks toggle integrations, Cancel/Save buttons
- `screenshots/reference/botubot_0013.webp` -- **Dashboard bottom section**: NPS not set up card, U-turns chart, "+ Add widget" empty state with illustration, "Widget deleted" toast
- `screenshots/reference/botubot_0016.webp` -- **Heatmap viewer (duplicate)**: same as 0005 but slightly different state, confirms layout details
- `screenshots/reference/botubot_0025.webp` -- **Feedback widget targeting**: targeting settings with device checkboxes, pages/events radio, users radio, traffic coverage input
- `screenshots/reference/botubot_0030.webp` -- **Dashboard (another view)**: same layout as 0011, "New dashboard created" toast, confirms metric card and widget layout
- `screenshots/reference/botubot_0035.webp` -- **Recording player (BEST)**: full recording playback view with recordings list sidebar, mock website viewport, playback controls (play/speed/timeline), Info/Actions tabs in right sidebar with session details and action counts, Comment popover with textarea and collections, emoji reaction bar
- `screenshots/reference/botubot_0036.webp` -- **Interviews page**: interview invitation detail with summary metric cards, Interviews/Invitations tabs, empty state
- `screenshots/reference/botubot_0037.webp` -- **Survey builder**: type selection (Popover/Button/Embedded/Full screen/Link), live preview showing emoji rating widget, accordion sections for Questions/Appearance/Targeting
- `screenshots/reference/botubot_0045.webp` -- **Home page**: Home view with tracking status sidebar, demo guide banner, suggested action cards, "capturing data" success banner
