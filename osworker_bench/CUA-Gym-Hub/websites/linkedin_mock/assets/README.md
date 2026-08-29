# XinkedIn Mock — Research Summary

> Last updated: 2026-03-02 by plan agent

## App Overview

**XinkedIn** is a professional networking platform (owned by Microsoft) with ~1 billion members worldwide. It serves as a hub for professional identity management, career development, job searching, content sharing, and business networking. The desktop web app (linkedin.com) is the primary interface for power users.

**Category**: Professional social networking / Career platform
**Primary use cases**: Profile building, job searching, professional content sharing, messaging, networking

## Key User Personas

1. **Job Seeker** — Searches jobs, tailors profile, applies to positions, networks with recruiters
2. **Professional Networker** — Shares content, comments on posts, grows connections, builds personal brand
3. **Recruiter** — Searches candidates, reviews profiles, sends InMail/messages
4. **Content Creator** — Publishes articles and posts, tracks analytics, builds thought leadership
5. **Passive Browser** — Scrolls feed, reads news, checks notifications, endorses skills

## Core User Workflows (Top 10)

1. **Browse Feed** — Scroll through posts, react (Like/Celebrate/Love/Insightful/Funny/Curious), comment, share
2. **Create Post** — Write text posts, attach images, publish to feed
3. **View/Edit Profile** — Edit about, experience, education, skills sections
4. **Search People** — Find users by name, view profiles, send connection requests
5. **Manage Network** — Accept/ignore invitations, browse "People you may know" suggestions
6. **Browse Jobs** — Search jobs by keyword/location, filter results, save/apply to jobs
7. **Send Messages** — Open conversations, type and send messages, create new chats
8. **Check Notifications** — View likes, comments, connection requests, job alerts
9. **View Other Profiles** — See connection info, connect, message, view experience/skills
10. **Interact with Posts** — React with different types, comment, view comment threads

## Desktop Layout Description

### Top Navigation Bar (52px height, white, sticky)
- **Left**: XinkedIn logo (blue "in" icon) + Search bar (light blue bg `#eef3f8`, expandable)
- **Center/Right**: Icon nav items, each ~80px wide with icon + label below:
  - Home (house icon)
  - My Network (people icon)
  - Jobs (briefcase icon)
  - Messaging (chat bubble icon, badge count)
  - Notifications (bell icon, badge count)
  - Divider line
  - Me (user avatar, 24px circle + dropdown chevron)
- Active nav item: bold black with 2px black bottom border
- Inactive: gray-500

### Home Feed Page — Three Column Layout
- **Left sidebar** (~225px): Profile mini-card with banner bg, avatar overlapping, name, headline, connections count
- **Center feed** (~540px): Create post box (avatar + "Start a post" button + Media/Event/Article buttons), then post cards in reverse-chronological order, with "Sort by: Top" divider
- **Right sidebar** (~300px): "XinkedIn News" widget with bullet-pointed trending stories (title + timeago + reader count)

### Post Card Structure
- **Header**: 48px circular avatar, bold author name, gray headline, relative timestamp + globe icon, 3-dot menu
- **Content**: Text body with whitespace-pre-wrap, optional image/media below
- **Stats bar**: Reaction emoji icons + count on left, "X comments" on right
- **Action bar**: 4 equal buttons — Like, Comment, Repost/Share, Send — each with icon + label
- **Comment section** (expandable): User avatar + input field, then comment list (avatar + bubble with name + text)

### Profile Page
- **Banner image** (full width, ~200px tall)
- **Avatar** (128px, circle, overlapping banner)
- **Info section**: Name (2xl bold), headline, location + "Contact info" link, "X connections" link
- **Action buttons**: "Open to" (blue filled), "Add profile section" (blue outlined), "More" (gray outlined)
- **Sections** (each white card): About, Experience, Education, Skills
  - Each section has edit (pencil) and add (plus) icons
  - Experience entries: company logo + title + company + date range + description
  - Education entries: school logo + school name + degree + year
  - Skills entries: skill name + endorsement count

### My Network Page
- **Left sidebar**: "Manage my network" with Connections count
- **Main area**: Invitations section (received requests with Accept/Ignore), then "People you may know" grid (cards with banner, avatar, name, headline, Connect button)

### Jobs Page
- **Left sidebar**: "My Jobs" / "Preferences" links
- **Main area**: "Recommended for you" with job cards (company logo, job title, company, location, type, posted date, Apply button)

### Messaging Page
- **Left panel** (~33%): "Messaging" header + search + conversation list (avatar, name, last message preview, timestamp)
- **Right panel** (~67%): Chat header (name + headline), message bubbles (blue for sent, gray for received), text input with Send button
- Active chat highlighted with left blue border

### Notifications Page
- List of notification items: avatar + "[Name] [action]" + timestamp, unread items have light blue bg

### Search Page
- Results list: avatar + name (linked) + headline + Connect/Pending/View profile button

## Feature Priority List

### P0 — App Cannot Render Without
- [x] Vite + React project scaffold
- [x] Routing (/, /mynetwork, /jobs, /messaging, /notifications, /profile/:id, /search, /go)
- [x] State management (StoreContext + mockData.js)
- [x] Session isolation (vite.config.js mock-api plugin)
- [x] Top navbar with all nav items
- [x] /go debug endpoint

### P1 — Core Interactive Features
- [x] Feed with post cards (like, comment)
- [x] Create post modal
- [x] Profile view/edit (about, experience, education, skills)
- [x] Messaging (conversation list, send messages, new chat)
- [x] Network (invitations, suggestions, connect with note)
- [x] Search people
- [x] Notifications list
- [x] Jobs list with basic display

### P2 — Depth & Realism (NEEDS WORK)
- [ ] Reactions system (Like/Celebrate/Love/Insightful/Funny/Curious) instead of just Like
- [ ] Post sharing/repost functionality
- [ ] Job search with filters (keyword, location, type)
- [ ] Job save/bookmark functionality
- [ ] Job detail panel (click a job to see full description)
- [ ] Delete post, edit post
- [ ] Notification read/unread toggle, notification actions
- [ ] Notification badge counts on nav icons
- [ ] Messaging timestamps (real relative times)
- [ ] More realistic mock data (more users, posts, jobs, chats)
- [ ] "People also viewed" on profile (with real data from users map)
- [ ] Edit experience/education (not just add/delete)
- [ ] Footer with XinkedIn links
- [ ] Profile "Activity" section (recent posts by user)
- [ ] Hashtag rendering in post content
- [ ] "See more" truncation on long post content
- [ ] Connection degree labels (1st, 2nd, 3rd)
- [ ] Company entities in data model (for job logos & experience)

## Color Palette (from XinkedIn brand guidelines)

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#0a66c2` | Links, buttons, active states |
| Dark Blue | `#004182` | Hover states, dark accents |
| Background | `#f3f2ef` | Page background (warm light gray) |
| Card Background | `#ffffff` | All content cards |
| Text Primary | `#000000e6` | Headlines, names |
| Text Secondary | `#00000099` | Body text |
| Text Tertiary | `#666666` | Timestamps, metadata |
| Border | `#e0e0e0` | Card borders, dividers |
| Search Bg | `#eef3f8` | Search input background |
| Unread Bg | `#e8f0fe` / blue-50 tint | Unread notification highlight |

## Typography
- **Font family**: `-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
- Post body: 14px / 20px
- Author name: 14px bold
- Headline: 12px gray
- Timestamp: 12px light gray
- Section headings: 20px semibold
- Navbar labels: 12px

## Screenshots Inventory

```
assets/screenshots/
├── 000001-000005.jpg    ← XinkedIn homepage/general (older versions + feed widgets)
├── profile/             ← Profile page screenshots (about, experience, education, header card)
├── messaging/           ← Messaging inbox & conversation view
├── jobs/                ← Jobs search results and saved jobs
├── network/             ← My Network page and invitations
├── notifications/       ← Notification bell page
├── post_create/         ← Post creation dialog/modal
├── feed_ui/             ← Feed layout with three-column design
└── company_page/        ← Company profile pages
```

Key reference screenshots:
- `feed_ui/000005.jpg` — **Best reference**: Shows complete XinkedIn desktop homepage with left sidebar profile card, center feed with create post box and post cards (avatar, name, timestamp, content, image, like count, Like/Comment/Share actions), right sidebar news widget. XinkedIn blue header with search + nav icons.
- `profile/000001.jpg` — Profile header card: banner, circular avatar, name, degree badge, headline, location, connections count, Message button, More button (...)
- `profile/000002.jpg` — Education and Volunteer Experience sections with school/org logos
- `profile/000003.jpg` — Profile with About section expanded, banner image, avatar
- `messaging/000002.jpg` — Mobile messaging inbox showing conversation list with avatars, names, last messages, timestamps
- `post_create/000003.jpg` — "Share a document" modal dialog

## What Exists vs What's Missing

### Already Implemented (Good Foundation)
- Full routing structure
- Session isolation with POST/GET state API
- StoreContext with all CRUD actions
- Data normalization for POST API
- Basic implementations of all main pages
- Profile editing (about, experience, education, skills with add/delete)
- Messaging with conversation list and chat window
- Network with invitations and connection suggestions
- Post creation modal with text and media toggle

### Missing / Needs Improvement
1. **Reactions**: Only "Like" toggle exists. Need full reaction picker (Celebrate/Love/Insightful/Funny/Curious)
2. **Mock data is too sparse**: Only 3 other users, 2 posts, 2 jobs, 1 chat. Needs 8+ users, 10+ posts, 6+ jobs, 4+ chats
3. **Jobs**: No search, no filters, no job detail view, no save/apply tracking
4. **Notifications**: No read/unread toggle, no proper action handling, badge counts missing from navbar
5. **Post interactions**: No "Share/Repost" action, no "See more" truncation for long posts, no hashtag highlighting
6. **Profile**: No edit for existing experience/education items, "People also viewed" is hardcoded, no Activity section
7. **Visual polish**: No notification badges, no connection degree labels, no footer

## Out of Scope
- Authentication / Login / Signup flows (app starts pre-logged-in as "Admin User")
- XinkedIn Premium features
- XinkedIn Learning
- XinkedIn Events (beyond placeholder)
- Real file/image uploads
- Real-time messaging (WebSocket)
- Email/push notifications
- XinkedIn Pages admin
- Ad management
