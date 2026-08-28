# XinkedIn Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-02
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Screenshots: `assets/screenshots/` (35+ reference images across 8 subdirectories)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

These are already implemented. Verify each works and mark done.

- [x] Project scaffold: Vite + React with react-router-dom, lucide-react, date-fns, tailwindcss, clsx
- [x] **Visual design system**: Tailwind config has XinkedIn brand colors. Primary `#0a66c2`, dark `#004182`, bg `#f3f2ef`, search bg `#eef3f8`. Font stack: `-apple-system, system-ui, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, sans-serif`. Study `assets/screenshots/feed_ui/000005.jpg` for the canonical layout — three columns, white cards with thin gray borders, round avatars, blue link color. Post action buttons are gray-600 with semibold 14px text. Navbar is white with 52px height, sticky, thin gray bottom border. Active nav item has 2px black bottom border. Card border-radius is 8px (rounded-lg).
- [x] App layout: `min-h-screen bg-[#f3f2ef]`, sticky top navbar, `<Outlet />` for page content
- [x] Routing: `App.jsx` with BrowserRouter — `/` (Feed), `/mynetwork`, `/jobs`, `/messaging`, `/notifications`, `/profile/:id`, `/search`, `/go`
- [x] State management: `StoreContext.jsx` with React Context, `mockData.js` with `INITIAL_STATE`, `initializeData()`, session-aware localStorage, data normalizers
- [x] `/go` endpoint: `GoDebug.jsx` component + vite.config.js server middleware returning `{initial_state, current_state, state_diff}` as JSON
- [x] Session isolation: vite.config.js mock-api plugin with `POST /post?sid=`, `GET /state?sid=`, `GET /go?sid=` endpoints, plus `deepMergeWithDefaults` and per-entity normalizers

---

## P1 — Primary Features

### P1.1 — Expand Mock Data (Critical for Realism)

The current data has only 3 users, 2 posts, 2 jobs, and 1 chat. This makes the app feel empty and provides insufficient variety for agent training.

- [x] **Expand users to 8**: Add users `user_5` through `user_9` in `mockData.js` with diverse profiles: varied headlines (engineer, designer, recruiter, data scientist, VP, marketing director, founder), locations (NYC, Seattle, Austin, London, Chicago), realistic avatars via `https://i.pravatar.cc/200?u=<userId>` (consistent per user). Each user should have `about`, `experience` (1-3 entries), `education` (1-2 entries), `skills` (3-5), and `connections` arrays. See `data_model.md §User` for field definitions.

- [x] **Expand posts to 10+**: Add 8 more posts from various users with realistic XinkedIn content: career announcements ("Excited to share I've joined..."), thought leadership ("5 things I learned about..."), job postings shared, article links, milestone celebrations, questions to the community. At least 3 posts should have images. Each post should have 1-5 comments from different users. Posts should have `reactions` object instead of `likes` array (see P1.2). Spread `created` timestamps across the last 7 days.

- [x] **Expand jobs to 6+**: Add 4 more job listings with full fields: `title`, `company`, `location`, `type` (Full-time/Contract/Internship), `level` (Entry/Mid-Senior/Director), `logo`, `description` (3-5 sentences), `requirements` (4-6 bullet strings), `salary`, `posted`, `applicants` (number), `saved: false`, `applied: false`. Diverse roles: Frontend Engineer, Product Manager, Data Analyst, DevOps Engineer, UX Researcher, Marketing Manager.

- [x] **Expand chats to 4+**: Add 3 more conversations with 3-6 messages each. Realistic back-and-forth: project discussion, meeting scheduling, congratulations on new role, sharing an article link. Use realistic timestamps spread across last few days.

- [x] **Expand notifications to 8+**: Add notifications of varied types: `like`, `comment`, `connection_request`, `connection_accept`, `profile_view`, `endorsement`, `job_alert`, `mention`. Include `targetId` for post/job-related notifications. 4 unread (`read: false`), 4 read. Add `actorId: null` for system notifications (job_alert).

- [x] **Add 3 inbound connection requests**: Create `connectionRequests` array with 3 pending requests from `user_4`, `user_7`, `user_9` to `user_admin`. At least 2 should include a personalized `note`. This gives agents invitations to practice accepting/ignoring on the My Network page.

- [x] **Add companies map** (optional enrichment): Add `state.companies` object with 6 companies (`company_1` through `company_6`) each having `id`, `name`, `logo`, `industry`, `size`, `headquarters`, `description`. Link to jobs via `companyId` and experience via `companyId`. Use picsum or placeholder logos.

### P1.2 — Reactions System (Replace Simple Likes)

XinkedIn uses 6 reaction types instead of just "Like". This is a core interaction agents need to practice.

- [x] **Migrate post data model from `likes` to `reactions`**: Change each post's `likes: string[]` to `reactions: { like: [], celebrate: [], love: [], insightful: [], funny: [], curious: [] }`. Each array contains user IDs. Update all seed data posts to use the new format. In `normalizePost()`, handle backward-compat: if incoming post has `likes` but no `reactions`, convert `likes` to `reactions.like`.

- [x] **Add `toggleReaction(postId, reactionType)` action** in StoreContext: Replaces `toggleLike`. If user already has a reaction on this post (any type), remove it. Then add the new reaction type. If the same reaction type is clicked again, just remove it (toggle off). This means a user can only have one reaction per post.

- [x] **Reaction picker UI on PostCard**: When user hovers over the "Like" button (or long-presses), show a horizontal reaction picker bar above the button with 6 reaction icons: Like, Celebrate, Love, Insightful, Funny, Curious. Each icon is ~32px, shown in a white pill-shaped container with subtle shadow, appearing with a CSS fade-in animation. Clicking one selects it and closes the picker. The "Like" button text and icon should change to reflect the active reaction (e.g., show "Love" in red if Love is selected). If no reaction, show the default gray "Like".

- [x] **Update reaction count display on PostCard**: The stats bar should show the top 3 reaction type icons (ordered by count, deduplicated) followed by total reaction count. Example: "42" — clicking this count could show a tooltip/popover listing who reacted with what (optional, not required).

### P1.3 — Job Search, Filters, and Detail View

The Jobs page currently just lists jobs statically. Agents need to search, filter, save, and "apply" to jobs.

- [x] **Job search bar**: Add a search input at the top of the Jobs page main area: "Search by title, skill, or company" text input + "Location" text input + "Search" blue button. Filtering is client-side: filter `state.jobs` by matching `title`, `company`, or `description` against the keyword, and `location` against location input. Show filtered results below, or all jobs if no query.

- [x] **Job filter chips/buttons**: Below the search bar, add filter buttons: "Date Posted" (dropdown: Past 24h, Past week, Past month, Any time), "Experience Level" (dropdown: Entry, Associate, Mid-Senior, Director, Executive), "Job Type" (dropdown: Full-time, Part-time, Contract, Internship), "Remote" (toggle). Filters should combine with search. Show active filter count badge.

- [x] **Job detail panel**: When a job card is clicked, show a detail panel on the right side (or expand inline for mobile). Detail shows: company logo (large), job title, company name, location, posted date, applicant count, "Save" button (bookmark icon, toggles `job.saved`), "Apply" button (blue, sets `job.applied = true` and changes to "Applied"), full description, requirements list (bulleted), salary (if present). Add `saveJob(jobId)` and `applyToJob(jobId)` actions to StoreContext.

- [x] **"My Jobs" sidebar**: In the left sidebar of Jobs page, add clickable items: "Saved Jobs" (shows count of saved jobs), "Applied Jobs" (shows count of applied jobs). Clicking these filters the job list to show only saved or applied jobs respectively. Active item is highlighted with XinkedIn blue.

### P1.4 — Notification Badges and Read/Unread

- [x] **Notification badge counts on Navbar**: In `Navbar.jsx`, calculate unread counts from state: messaging unread = count of chats where last message is not from currentUser and has `read: false`; notification unread = count of notifications where `read: false`. Show red badge circle (16px, white text, red bg `#cc1016`) on the Messaging and Notifications nav icons when count > 0. Display the count number if <= 9, or "9+" if more.

- [x] **Mark notification as read on click**: Add `markNotificationRead(notifId)` action to StoreContext. When a notification item is clicked in the Notifications page, mark it as read. Provide a "Mark all as read" button at the top of the notifications list.

- [x] **Visual distinction for unread notifications**: Unread notifications should have a light blue background (`bg-blue-50`) and a small blue dot indicator on the left side. Read notifications have white background.

### P1.5 — Post Interactions Enhancement

- [x] **"See more" truncation**: If post content exceeds 3 lines (approximately 250 characters), truncate with "...see more" link in XinkedIn blue. Clicking expands to full text. Use CSS `line-clamp-3` for truncation and a `showFull` toggle state.

- [x] **Hashtag rendering**: Parse post content for `#hashtags` and render them as XinkedIn blue clickable links (they don't need to navigate anywhere, just visually stand out as `text-xinkedin-blue font-semibold hover:underline`).

- [x] **Delete own post**: Add a 3-dot menu (MoreHorizontal icon) to the top-right of posts authored by currentUser. On click, show a small dropdown with "Delete post" option. Add `deletePost(postId)` action to StoreContext that removes the post from `state.posts`.

- [x] **Repost/Share action**: When "Share" button is clicked on a post, show a small dropdown: "Repost" (instantly reposts — creates a new post with `repostOf: originalPostId` and `repostedBy: currentUserId`) and "Share with thoughts" (opens create post modal pre-filled with a link/reference to the original post). For reposted posts in the feed, show a header line: "[User] reposted this" above the original post content.

### P1.6 — Profile Enhancements

- [x] **Edit existing experience/education**: Currently only add and delete are supported. Add an edit (pencil) icon on each experience and education entry (visible on hover, for own profile only). Clicking opens the same form modal but pre-populated with the existing data. Add `updateExperience(id, updates)` and `updateEducation(id, updates)` actions to StoreContext.

- [x] **Profile Activity section**: Below the About section on own profile, add an "Activity" card showing recent posts by the currentUser. Display the last 2-3 posts (content preview, like/comment counts, timestamp). "Show all activity" link at bottom (no-op or scrolls).

- [x] **"People also viewed" with real data**: Replace the hardcoded dummy data in the Profile right sidebar with actual users from `state.users` (exclude self and already-connected users). Show up to 3 users with avatar, name, headline, and "Connect" button.

- [x] **Connection degree labels**: In post headers and profile views, show "1st" next to connected users, "2nd" for users connected to your connections, and "3rd+" for others. Implement a simple helper: `getConnectionDegree(userId)` that checks `state.currentUser.connections`.

---

## P2 — Secondary Features

Implement after P1 is complete and solid.

- [ ] **Comment likes**: Add a "Like" action (small thumbs-up icon) on each comment in the expanded comment section. Clicking toggles the currentUser's ID in `comment.likes[]`. Show like count next to the icon. Add `toggleCommentLike(postId, commentId)` to StoreContext.

- [ ] **Messaging read receipts**: Show a small "Read" or "Delivered" indicator below the last sent message in chat. If `message.read` is true, show a tiny gray "Seen" text. For the latest message, show "Sent" if `read: false`.

- [ ] **Messaging search**: The search input in the messaging sidebar should filter conversations by the other participant's name. Client-side filter as the user types.

- [ ] **Messaging new chat via compose**: The edit icon in messaging header opens a new chat panel. Currently implemented but can be improved: add a search input to filter connections by name.

- [ ] **Notification type-specific actions**: Different notification types should have appropriate action labels. "Like" -> show "React" link, "Comment" -> show "Reply" link, "Connection request" -> show "Accept/Ignore" buttons inline, "Job alert" -> show "View job" link. Currently all notifications show the same static layout.

- [ ] **Job application confirmation modal**: When "Apply" is clicked on a job, show a modal: "Apply to [Job Title] at [Company]?" with applicant info preview (name, headline) and "Submit Application" / "Cancel" buttons. On submit, mark `job.applied = true`.

- [ ] **Search results tabs**: Add filter tabs at the top of search results: "People" (default), "Posts", "Jobs". "Posts" tab filters `state.posts` by content containing the search query. "Jobs" tab filters `state.jobs` by title/company matching query. Show counts in tab labels.

- [ ] **Footer component**: Add a simple XinkedIn-style footer below the main content on feed pages: links for "About", "Accessibility", "Help Center", "Privacy & Terms", "Ad Choices", "Advertising", "Business Services", plus "XinkedIn Corporation (c) 2026" -- all non-functional, just styled as small gray links in a centered row.

- [ ] **Edit headline/name inline on profile**: Add a pencil icon next to the name on the profile header card. Clicking opens an inline edit form for `name` and `headline`. Save updates the profile. Currently only "About" is editable inline.

- [ ] **Endorsement button on skills for other profiles**: When viewing another user's profile (who is a connection), show a "+" or "Endorse" button next to each skill. Clicking increments that skill's endorsement count. Add `endorseSkill(userId, skillId)` to StoreContext.

- [ ] **Withdraw connection request**: On the Network page, the "Sent Requests" section shows a "Withdraw" button. Make it functional -- add `withdrawConnectionRequest(requestId)` to StoreContext that removes the request.

- [ ] **Sort feed**: The "Sort by: Top" divider on the feed should be a clickable dropdown allowing "Top" (default, sorted by reaction count) and "Recent" (sorted by created date). Implement client-side sorting of `state.posts`.

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specifications:

- [x] **8 users** (user_2 through user_9): Varied titles (PM, Designer, Recruiter, Backend Engineer, Data Scientist, VP Engineering, Marketing Director, Startup Founder), locations (New York, Seattle, Austin, London, Chicago, San Francisco, Remote), realistic `about` texts (2-3 sentences), 1-3 experience entries, 1-2 education entries, 3-5 skills with endorsement counts. Use `https://i.pravatar.cc/200?u=<userId>` for deterministic avatars.

- [x] **10+ posts**: Mix of text-only and text+image posts. Diverse content: job announcements, thought leadership, technical insights, celebrations, questions. Each with 1-5 comments. Varied reaction counts across types. Timestamps spread over 7 days.

- [x] **6+ jobs**: From different companies, varied types/levels, full descriptions with requirements. 2 jobs from companies in the user's network. At least 1 remote job, 1 internship.

- [x] **4+ chats**: Each with 3-8 messages showing realistic conversation flow. Mix of professional and casual tones. Varied timestamps.

- [x] **8+ notifications**: Covering all types (like, comment, connection_request, connection_accept, profile_view, endorsement, job_alert, mention). 4 unread.

- [x] **3 pending connection requests**: Inbound to user_admin from users not in connections list. 2 with personalized notes.

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login / signup (app starts pre-logged-in as Alex Morgan / `user_admin`)
- XinkedIn Premium features (InMail, profile viewers, etc.)
- XinkedIn Learning courses
- Real file/image uploads (use placeholder URLs)
- Real-time messaging (WebSocket)
- Email/push notifications
- XinkedIn Pages admin dashboard
- XinkedIn Ads manager
- Video posts or live streaming
- XinkedIn Events creation/management
- XinkedIn Groups
- Profile background/cover photo upload
- Password or account settings
