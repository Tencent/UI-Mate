# Xnstagram Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Screenshots: `assets/screenshots/` (sidebar, feed, profile, explore, messages, reels, stories, post_detail)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

These items must be completed first. Without them, the app cannot render properly.

- [x] **Visual design system**: Xnstagram design tokens applied (colors, fonts, icon sizes, avatar sizes, border colors, Satisfy font for logo).

- [x] **Expand seed data in mockData.js**: 8 users, 15 posts, 8 stories, 12 notifications, 5 conversations, 25 messages, savedPostIds. Normalizers for all new entity types.

- [x] **Update DataContext with new actions**: toggleSave, deletePost, deleteComment, sendMessage, markConversationRead, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount, getUnreadMessageCount, getSavedPosts, getConversationMessages all implemented and exposed.

- [x] **Fix sidebar navigation**: Full Xnstagram sidebar (Home, Search, Explore, Reels, Messages, Notifications, Create, Profile, More) with badges, active states, collapsed/expanded modes, slide-out panels.

- [x] **Add routing for new pages**: /reels, /direct/inbox, /direct/t/:conversationId all routed.

## P1 — Primary Features

Core interactive workflows for agent training. Implement after P0 is complete.

- [x] **Bookmark/Save toggle on posts**: Wire up in PostCard and PostDetailModal.

- [x] **Saved posts tab on Profile page**: Functional saved tab on own profile.

- [x] **Post options menu ("..." button)**: Dropdown menu on post headers.

- [x] **Delete comment**: Trash icon on own comments in PostDetailModal.

- [x] **Notifications panel**: Slide-out panel from sidebar with grouped notifications, avatars, timestamps, follow buttons.

- [x] **Direct Messages page**: Split panel layout with conversation list, chat area, message sending, empty state.

- [x] **Reels page**: Full-viewport scroll snap, action buttons, user info overlay, audio bar.

- [x] **Edit Profile modal**: Modal with form fields for editing profile.

- [x] **Search panel (sidebar slide-out)**: Slide-out search panel with user and hashtag results.

- [x] **Notification badges on sidebar**: Red dot badges on Messages and Notifications nav items.

- [x] **Hashtag and mention highlighting in captions**: Already implemented in RichText.jsx.

## P2 — Secondary Features

Depth and realism. Implement only after P1 is solid.

- [ ] **Explore page grid improvements**
- [ ] **Post share action**
- [ ] **Story creation**
- [ ] **Responsive design polish**
- [ ] **Followers/Following list improvements**
- [ ] **Post timestamp detail**
- [ ] **Comment replies (threads)**
- [ ] **Profile page "Tagged" tab**
- [ ] **Suggested users improvements**
- [ ] **Infinite scroll on Explore and Profile**
- [ ] **Dark mode toggle**

## Data Seed (implement in createInitialData())

- [x] **Users**: 8 users with realistic data.
- [x] **Posts**: 15 posts with varied content.
- [x] **Stories**: 8 stories from 5-6 users.
- [x] **Notifications**: 12 notifications covering all types.
- [x] **Conversations**: 5 conversations with varied participants.
- [x] **Messages**: 25 messages across conversations.
- [x] **Saved Post IDs**: 2-3 post IDs bookmarked.

## Out of Scope

Dev must NOT implement these:
- Authentication / login / signup (app starts pre-logged-in as `alex_morgan` / `user_admin`)
- Real file uploads (mock with picsum.photos URLs)
- Real video playback (Reels simulated with static images)
- Xnstagram Shopping / Marketplace
- Ads / Sponsored content
- Account privacy settings (private/public toggle)
- Two-factor authentication
- Email/push notifications
- Real API calls to external services
- WebSocket / real-time features
