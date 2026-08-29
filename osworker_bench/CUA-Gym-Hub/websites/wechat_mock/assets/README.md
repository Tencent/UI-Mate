# XeChat Mock — Research Summary

> Last updated: 2025-03-09
> Application: XeChat (微信) by Tencent
> Category: Super-app — messaging, social media, payments, mini programs

---

## App Overview

XeChat (微信, "micro-message") is China's dominant super-app with 1.3+ billion monthly active users. Originally a messaging app, it has evolved into an all-in-one platform combining:
- Instant messaging (text, voice, video, stickers, files)
- Social media (Moments/朋友圈 — similar to Facebook's News Feed)
- Digital payments (XeChat Pay)
- Mini Programs (embedded lightweight apps)
- Official Accounts (subscription content from brands/publishers)
- Video Channels (short-form video, like TikTok)
- Utility services (QR scanning, location sharing, walkie-talkie)

The app is mobile-first with a clean, minimal design language. This mock simulates the **mobile phone interface** at max-width 414px.

---

## Key User Personas & Primary Workflows

### Persona 1: Daily Messenger
- Opens Chats tab → reads unread messages → replies to friends
- Sends text, voice, images, stickers, red packets (hongbao)
- Creates/participates in group chats
- Forwards messages, shares contacts

### Persona 2: Social Browser
- Opens Moments (朋友圈) → scrolls through friends' posts
- Likes and comments on posts
- Creates new Moments with text + images
- Views friends' profile pages and photo walls

### Persona 3: Utility User
- Uses Scan (扫一扫) to scan QR codes
- Accesses Mini Programs for shopping, food delivery, transit
- Manages contacts (add, block, tag)
- Uses XeChat Pay for transfers and red packets

---

## Complete Feature List

### P0 — Core Shell (Must have to render)
1. **Bottom Tab Bar** — 4 tabs: 微信 (Chats), 通讯录 (Contacts), 发现 (Discover), 我 (Me)
   - Active tab: green icon + text
   - Chats tab shows red unread badge count
2. **Top Header Bar** — Title text + action buttons (Search 🔍, Add ➕)
   - "+" menu dropdown: Start Chat, Add Contact, Scan, Money
3. **Routing** — Tab-based navigation + push/pop for detail pages
4. **State Management** — Zustand store with localStorage persistence
5. **Session Isolation** — SID-based state via URL query params

### P1 — Primary Features (Core interactive workflows)

#### Chats Tab (微信)
6. **Conversation List** — Sorted by last message time; each item shows: avatar (40px circle), name (bold), last message preview (gray, truncated), relative timestamp, unread badge (red circle)
7. **Search Bar** — Sticky top, filters conversations by name/content
8. **Swipe Actions** on conversations — NOT IMPLEMENTED: Real XeChat allows left-swipe to reveal "Pin" / "Mark as Read" / "Delete" actions
9. **Long-press Context Menu** — NOT IMPLEMENTED: Real XeChat shows "Pin to Top" / "Mark as Read" / "Delete" on long press

#### Chat View (1-on-1)
10. **Message Bubbles** — Self messages: green background, right-aligned; Other's messages: white background, left-aligned with avatar
11. **Message Types**: text, image, file, location, transfer, hongbao (red packet), voice message
12. **Timestamp Separators** — Show time between messages if gap > 5 minutes
13. **Input Bar** — Bottom-fixed: voice toggle button (🎙), text input, emoji button (😊), "+" more button
14. **Voice Recording** — Hold-to-record interface with animated waveform, cancel by swiping up, release to send
15. **Emoji Picker** — Grid of emoji, recently used section at top
16. **More Menu (+)** — Grid of action buttons: Photos, Camera, Video Call, Location, Red Packet, Transfer, Voice Call, Favorites, File, Contact Card
17. **Red Packet (Hongbao)** — Send: enter amount + greeting → sends orange envelope bubble; Receive: tap to "open" → animated reveal showing amount
18. **Transfer** — Send amount to contact; shows as a special message bubble with amount
19. **Voice/Video Call** — Simulated calling UI (timer display, end call button)
20. **Image Messages** — Tap to view full-screen; pinch to zoom (optional)
21. **Message Context Menu** — Long-press on message shows: Copy, Forward, Delete, Reply, Multi-select

#### Contacts Tab (通讯录)
22. **Alphabetical Index** — Right sidebar with A-Z + # letters; tap to jump to section
23. **Contact Groups** — Grouped by pinyin first letter with section headers
24. **Search Bar** — Filter contacts by name or phone
25. **Top Shortcuts** — "New Friends" (新的朋友), "Group Chats" (群聊), "Tags" (标签), "Official Accounts" (公众号)
26. **Contact Count** — Footer showing total number of contacts
27. **Contact Profile** — Tap contact → full profile page with avatar, name, region, signature, action buttons

#### Discover Tab (发现)
28. **Moments (朋友圈)** — Entry point to social feed
29. **Channels (视频号)** — Short video feed (simplified mock)
30. **Scan (扫一扫)** — QR code scanner interface (animated frame)
31. **Shake (摇一摇)** — Shake to find nearby people (visual only)
32. **Search (搜一搜)** — Universal search with categories and hot topics
33. **Nearby (附近)** — Nearby people/places (visual only)
34. **Mini Programs (小程序)** — List of recently used/pinned mini programs
35. **Top Stories (看一看)** — Curated articles and hot topics feed

#### Me Tab (我)
36. **Profile Card** — Large avatar, nickname, XeChat ID, QR code icon → tap to view profile
37. **Menu Items**: Services (服务/钱包), Favorites (收藏), Moments (朋友圈), Cards & Offers (卡包), Sticker Gallery (表情), Settings (设置)
38. **Wallet/Services** — Mock payment dashboard (balance, recent transactions)
39. **Favorites** — Saved messages, links, images
40. **Settings** — Account, privacy, notifications, general, about

#### Moments (朋友圈) — Detailed
41. **Cover Image + Avatar Header** — Full-width cover photo at top with user avatar overlaid
42. **Post Feed** — Each post: avatar, name, text content, images (1-9 in CSS grid), timestamp, location tag
43. **Image Grid Layout** — 1 image: full width; 2 images: side by side; 3 images: 1+2 row; 4 images: 2x2; 5-6: 2+2+1/2; 7-9: 3x3
44. **Like/Comment Popup** — Tap "..." icon next to post → popup with ❤️ Like and 💬 Comment buttons
45. **Like List** — ❤️ icon + comma-separated names of likers in blue box below post
46. **Comments** — Name: comment text; supports replies to comments
47. **New Post** — Camera icon in top right → compose: text area + image picker (up to 9)
48. **Delete Own Post** — Visible delete button on own posts
49. **Time Display** — Relative timestamps: "刚刚", "X分钟前", "X小时前", "昨天", date

#### Group Chat Features
50. **Group Creation** — Select members from contacts → set name → create
51. **Group Chat View** — Similar to 1-on-1 but shows sender name above each message
52. **Group Info Page** — Member grid (avatars), group name (editable), QR code, notice/announcement, settings
53. **Add/Remove Members** — "+" button to add members from contacts; "-" button to remove (if admin)
54. **Group Announcement** — Editable text notice visible to all members
55. **Exit Group** — Leave group (with confirmation dialog)

### P2 — Secondary Features (Depth & realism)

56. **Conversation Pinning** — Pin conversations to top; pinned items have light gray background
57. **Conversation Muting** — Mute icon (🔕) next to muted conversations; muted convos don't increment tab badge
58. **Draft Indicator** — Show "[草稿] message text" in red for unsaved drafts
59. **Message Read Receipts** — NOT in XeChat (unlike WhatsApp)
60. **Typing Indicator** — Show "对方正在输入..." in header when other party is typing
61. **Message Forwarding** — Select messages → forward to other contacts
62. **Contact Tags** — Organize contacts into custom tag groups
63. **Sticker Store** — Browse and "download" sticker packs (mock)
64. **Official Accounts** — List of followed accounts with latest articles
65. **XeChat Pay** — Mock wallet with balance, recent transactions, QR pay screen
66. **Mini Programs** — Grid of recently used mini programs with icons and names
67. **Dark Mode** — NOT a priority (XeChat added dark mode but it's not the default)
68. **Message Recall** — "You recalled a message" system notification
69. **Chat Background** — Customizable chat background image
70. **Notification Settings** — Per-chat notification toggles (already partially done)

---

## UI Layout Description

### Global Shell
- **Max width**: 414px centered (mobile phone simulation)
- **Background**: #f5f5f5 (light gray)
- **Bottom Tab Bar**: 50px height, white background (#ffffff), 1px top border (#e0e0e0)
  - 4 equally-spaced tabs, each with icon (24px) + label (10px text)
  - Active state: XeChat green (#07c160) icon + text
  - Inactive state: gray (#999) icon + text
  - Chats tab: red badge circle (16px) with white count text

### Chats List Page
- **Header**: White bg, centered title "微信", right side "+" button
- **Search Bar**: Rounded rect (#f0f0f0), 36px height, "搜索" placeholder with search icon
- **Conversation Items**: 72px height, white bg, 16px horizontal padding
  - Avatar: 44px circle, left-aligned
  - Name: 16px font, #333, bold
  - Last message: 14px font, #999, single line truncated
  - Timestamp: 12px font, #999, right-aligned
  - Unread badge: 18px red circle, white 12px text, positioned top-right of avatar

### Chat View
- **Header**: White bg, back arrow (←), contact name centered, "..." menu right
- **Message Area**: Full height scroll, #f5f5f5 background
  - Self bubbles: green (#95ec69) background, 14px white rounded rect, right-aligned
  - Other bubbles: white (#ffffff) background, 14px rounded rect, left-aligned with 36px avatar
  - Timestamps: centered, 12px gray text, rounded gray bg
- **Input Bar**: White bg, 50px min-height, border-top
  - Voice toggle: 🎙 circle button, 30px
  - Text input: flex-grow, 36px height, #f0f0f0 bg, rounded
  - Emoji: 😊 button, 30px
  - "+": circle button, 30px → opens grid menu (4x2 grid of action buttons)

### Contacts Page
- **Header**: "通讯录" title
- **Shortcuts Section**: 4 items with colored icons: New Friends (orange), Group Chats (green), Tags (blue), Official Accounts (blue)
- **Contact List**: Grouped by letter headers (A, B, C...), each contact: 44px avatar + name
- **Alphabet Index**: Right edge, vertical strip of A-Z + # letters, 14px each

### Discover Page
- **Sections with dividers**: Grouped list items with icons
  - Section 1: Moments (朋友圈) — camera icon, with red dot badge for new content
  - Section 2: Channels (视频号), Live (直播)
  - Section 3: Scan (扫一扫), Shake (摇一摇)
  - Section 4: Search (搜一搜), Nearby (附近的人)
  - Section 5: Mini Programs (小程序)

### Me Page
- **Profile Card**: Full-width white card, avatar (64px), nickname (18px bold), XeChat ID (14px gray), QR code icon, right arrow
- **Menu Groups**: Separated by 8px gray dividers
  - Each item: 56px height, icon (24px) + label + right arrow (>)

### Moments Feed
- **Cover Banner**: ~200px height cover photo with user avatar (64px) overlapping bottom-right, name in white
- **Post Items**: White cards with 16px padding
  - Avatar (40px) + Name (green/blue, bold) + Content text + Image grid + Timestamp + Location
  - "..." action button → popup: Like ❤️ / Comment 💬

---

## Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Primary Green | #07c160 | Active tabs, send button, links, self chat bubbles bg variant |
| Chat Bubble Self | #95ec69 | Self message bubble background |
| Chat Bubble Other | #ffffff | Other's message bubble background |
| Background | #f5f5f5 | Page backgrounds |
| Card Background | #ffffff | List items, cards |
| Text Primary | #333333 | Main text |
| Text Secondary | #999999 | Timestamps, preview text |
| Text Link | #576b95 | Moments usernames, links |
| Divider | #e0e0e0 | Section dividers |
| Red Badge | #f44336 | Unread count badges |
| Hongbao Orange | #fa9d3b | Red packet backgrounds |
| Tab Inactive | #999999 | Inactive tab icons |

---

## Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif
- **Title**: 18px, font-weight 600
- **Body**: 16px, font-weight 400
- **Caption**: 14px, font-weight 400
- **Small**: 12px, font-weight 400
- **Chinese text** throughout (simplified Chinese / 简体中文)

---

## What to Skip
- **Authentication/Login** — App starts pre-logged-in as 张三 (user_1)
- **Real QR codes** — Visual mock only
- **Real payments** — Mock amounts and balances only
- **Real mini programs** — Visual tiles only
- **Real voice/video calls** — Simulated timer UI only
- **Real file uploads** — Use placeholder images
- **Push notifications** — Not applicable in web mock
- **XeChat Work** — Enterprise version, out of scope

---

## Screenshots Inventory

| File | Description |
|------|-------------|
| `chats_list_with_search.jpg` | Main chats list showing conversations with avatars, last message, timestamps, unread badges, search bar, and bottom tab bar (Chats/Contacts/Discover/Me). Both light and dark variants shown. |
| `desktop_chat_window.jpg` | Desktop XeChat with conversation list on left and active chat on right. Shows message bubbles, emoji bar, recalled message indicator. |
| `chat_with_images.jpg` | Mobile chat view with image messages, text bubbles (green for self), back arrow, contact name in header, "..." menu, bottom input bar with voice/emoji/more buttons. |
| `voice_recording_ui.jpg` | Voice recording overlay showing green waveform bubble, cancel (X) and text-to-speech (文) buttons, dark background overlay. |
| `contacts_page.jpg` | Contacts tab with "New Friends", "Group chat", "Tags", "Official Accounts" shortcuts at top, alphabetical sidebar (A-Z-#), contact list grouped by letter, contact count at bottom, bottom tab bar. |
| `mini_programs_discover_page.jpg` | Left: Mini Programs page with recently used programs in grid; Right: Discover tab showing Live, Scan, Shake, Top Stories, Search, Nearby, Mini Programs menu items. |
| `moments_feed.jpg` | Moments (朋友圈) feed showing header with camera icon, posts with avatar, name, text content, images, timestamps, comments, promoted content label. |
| `me_tab_profile.jpg` | Me tab header showing avatar, name, XeChat ID, QR code icon; menu items: Wallet, Favorites with chevron arrows. |
| `red_packet_hongbao.jpg` | Red packet received detail screen showing sender name, greeting message, amount (88.88 CNY), "Reply With a Sticker" prompt. Orange/red theme. |
| `red_packet_in_chat.jpg` | Group chat with multiple red packet messages from different users. Shows orange envelope bubbles with "恭喜发财,大吉大利" greeting text, input bar at bottom. |
| `hongbao_message_bubble.jpg` | Close-up of self-sent red packet bubble in chat: orange background, red envelope icon, "Best wishes" text, "微信红包" label below. |
| `hongbao_open_dialog.jpg` | Red packet open dialog: full-screen overlay with sender avatar, "Best wishes" text, gold "Open" button, XeChat logo at bottom. |
| `chat_info_settings.jpg` | Chat Info/Settings page showing: member avatar with "+" add button, "Mini Programs in Chat", "Search Chat History", "Sticky on Top" toggle, "Mute Notifications" toggle, "Chat Alert" toggle, "Background", "Clear Chat History", "Report". |
