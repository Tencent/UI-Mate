# XeChat Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Screenshots: `assets/screenshots/`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] **Visual design system**: Study `assets/screenshots/` — the exact color palette is: primary green `#07c160`, self bubble `#95ec69`, other bubble `#ffffff`, background `#f5f5f5`, text primary `#333333`, text secondary `#999999`, moments link text `#576b95`, divider `#e0e0e0`, red badge `#f44336`, hongbao orange `#fa9d3b`, tab inactive `#999999`. Font: `-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif`. The app uses Chinese (simplified) throughout. Review each screenshot file in `assets/screenshots/` and replicate the exact visual style.

- [x] **Data model upgrade**: Update `src/utils/storage.js` `getInitialData()` to include all new fields from `assets/data_model.md`. Key additions: (1) `isPinned`, `isMuted`, `draft` fields on conversations; (2) `tag` field on contacts; (3) `announcement` field on groups; (4) 2 groups in initial data (`group_1` "项目讨论组" and `group_2` "老同学聚会") with pre-seeded group messages; (5) 5 conversations including 1 group conversation and 1 muted conversation; (6) `location` field on moments; (7) `replyTo` field on comments. Keep all existing fields and behavior intact. See `data_model.md §Suggested createInitialData()` for the full structure.

- [x] **Update Zustand store**: Add these new persisted fields and actions to `src/store.js`: (1) `pinConversation(contactId)` — toggles `isPinned` on the conversation, persists to storage; (2) `muteConversation(contactId)` — toggles `isMuted`, persists to storage; (3) `saveDraft(contactId, text)` — saves draft text to conversation, persists; (4) `deleteConversation(contactId)` — removes conversation from list (NOT messages, just the list entry); (5) `recallMessage(contactId, messageId)` — marks message as `recalled: true` and updates content to empty; (6) `addContact(contact)` — adds a new contact; (7) `removeContact(userId)` — removes contact; (8) `exitGroup(groupId)` — removes user from group members, removes group conversation; (9) `setGroupAnnouncement(groupId, text)` — updates group announcement. Ensure all actions call `saveToStorage()`.

- [x] **Session isolation + `/go` endpoint**: Already implemented. Verify that the new fields (`isPinned`, `isMuted`, `draft`, `tag`, `announcement`) are correctly included in `getStateDiff()`. The diff should detect changes in pinned/muted status and group announcements.

---

## P1 — Primary Features

<!-- Core features a user interacts with in the first 5 minutes. These must work correctly for agent training. -->

### Chats Tab (Messages Page)

- [x] **Pinned conversations**: Pinned conversations (where `isPinned === true`) should render at the top of the list with a subtle light gray background (`#f7f7f7`). See `assets/screenshots/chats_list_with_search.jpg` for reference layout. Currently pin/mute are local state only in ChatSettingsPage — wire them to the Zustand store's `pinConversation()` / `muteConversation()` actions so they persist.

- [x] **Muted conversation indicator**: Conversations where `isMuted === true` should show a small muted icon (🔇 or a crossed-bell SVG) to the right of the timestamp. Muted conversations should NOT contribute to the total unread badge count on the bottom tab bar.

- [x] **Draft indicator**: If a conversation has a non-empty `draft` field, show `[草稿]` in red (#f44336) followed by the draft text (truncated) as the last message preview, instead of the actual last message. When user navigates to a chat and starts typing but leaves without sending, save the text as a draft via `saveDraft(contactId, text)`.

- [x] **Swipe-to-reveal actions on conversations**: Implement left-swipe (or show on long-press for desktop) on each conversation item to reveal 3 action buttons: "置顶" (Pin/Unpin, blue), "已读" (Mark as Read, gray), "删除" (Delete, red). Pin calls `pinConversation()`, Mark as Read calls `markAsRead()`, Delete calls `deleteConversation()` with a confirmation dialog. Reference: this is standard XeChat behavior for managing conversations.

- [x] **"+" header menu (top-right)**: The "+" button in the top-right header should open a dropdown menu (dark background, white text) with 4 items: "发起群聊" (Start Group Chat → navigate to `/groups`), "添加朋友" (Add Friend → show search modal), "扫一扫" (Scan → show scan modal), "收付款" (Pay/Receive → show mock QR code). Currently the "+" just navigates to contacts; replace with proper dropdown menu. See `assets/screenshots/chats_list_with_search.jpg` for the "+" button position.

### Chat View (ChatPage)

- [x] **Voice message type**: Add support for `type: 'voice'` messages. Render as a bubble with a speaker/waveform icon (三道弧线) and duration text (e.g., "5''"). Self voice messages: green bubble, right-aligned. Others: white bubble, left-aligned. Tapping a voice message should toggle an "unplayed" → "played" visual state (red dot indicator removed). See `assets/screenshots/voice_recording_ui.jpg` for the recording UI.

- [x] **Voice input toggle**: The voice button (🎙) on the left of the input bar should toggle between text input mode and voice input mode. In voice mode, the text input is replaced with a large "按住 说话" (Hold to Talk) button. Pressing and holding shows a recording overlay (dark semi-transparent background with green waveform animation and "松开 发送" text). Releasing sends a mock voice message (random duration 2-8 seconds). Swiping up while holding shows "松开 取消" and cancels. See `assets/screenshots/voice_recording_ui.jpg`.

- [x] **Emoji picker improvement**: The emoji picker (triggered by 😊 button) should display a proper grid of common emojis organized in categories: "最近使用" (Recently Used), "默认表情" (Default Smileys), etc. At minimum provide 30-40 common emojis in a scrollable grid (6 columns). Currently it may be basic — ensure it's a proper bottom sheet / panel that slides up from the input area, not a modal.

- [x] **More menu (+) grid improvement**: The "+" button next to input should expand a grid panel (slides up from bottom, same area as emoji picker). The grid should have 8 action buttons in a 4x2 layout with icons and labels: 照片 (Photos), 拍摄 (Camera), 视频通话 (Video Call), 位置 (Location), 红包 (Red Packet), 转账 (Transfer), 语音通话 (Voice Call), 收藏 (Favorites). See `assets/screenshots/chat_more_menu_location.jpg` for reference: the bottom panel shows Photos, Video, Location, Name Card, Favorite, Walkie Talkie icons. Ensure all action buttons have working click handlers that open appropriate input dialogs.

- [x] **Hongbao (Red Packet) flow**: Sending: tap "红包" in more menu → modal with amount input (¥), greeting text input (default "恭喜发财,大吉大利"), "塞钱进红包" (Send) button → sends message with `type: 'hongbao'`. Receiving: tap an unopened hongbao bubble → full-screen overlay with red background, sender avatar, greeting text, gold "開" (Open) button → animate open → show amount reveal. See `assets/screenshots/hongbao_open_dialog.jpg` for the open dialog and `assets/screenshots/red_packet_hongbao.jpg` for the amount reveal screen. Opened hongbao should show "已领取" (Claimed) status and the amount. Store `opened: true` after opening.

- [x] **Message long-press context menu**: Long-pressing (or right-clicking) on any message bubble should show a floating context menu above the bubble with options: "复制" (Copy — copies text to clipboard), "转发" (Forward — shows contact picker), "删除" (Delete — removes message from local store), "撤回" (Recall — only for self messages within 2 minutes, replaces message with system text "你撤回了一条消息"). The menu should be a dark rounded rect with white text, positioned above the tapped bubble.

- [x] **System messages**: Support `type: 'system'` messages that render as centered gray text with no bubble, used for: recalled messages ("你撤回了一条消息"), member join/leave in groups ("张三 邀请 李四 加入了群聊"), time separators, and red packet claimed notifications.

### Contacts Tab

- [x] **Contact shortcuts at top**: The top of contacts page should show 4 shortcut items (each 56px height with colored icon + label + right arrow + optional red badge): "新的朋友" (New Friends — orange people icon, with badge for pending requests), "群聊" (Group Chats — green people icon), "标签" (Tags — blue tag icon), "公众号" (Official Accounts — blue megaphone icon). Currently "新的朋友" shows empty modal and "群聊" shows groups — enhance "群聊" to show existing groups as a proper list with group avatars/names, and tapping a group navigates to `/group/:groupId`. "标签" should show tags like "朋友", "同事", "家人" with contact counts. "公众号" can show a simple list of 2-3 mock official accounts.

- [x] **Add group member from GroupInfoPage**: The "+" button in the member grid of GroupInfoPage currently has no handler. Wire it to show a contact picker (list of contacts NOT already in the group with checkboxes), and on confirm call `addGroupMember(groupId, userId)` for each selected contact.

- [x] **Exit group handler**: The "退出群聊" (Exit Group) button in GroupInfoPage currently has no handler. Wire it to show a confirmation dialog "确定退出群聊？", and on confirm call `exitGroup(groupId)` then navigate to `/messages`.

- [x] **Group announcement**: Add an "群公告" (Group Announcement) section to GroupInfoPage between the member grid and the settings toggles. If an announcement exists, show the text (truncated to 2 lines with "查看全部" expand). If the current user is the group creator, show an "编辑" (Edit) button that opens a text input modal to update the announcement via `setGroupAnnouncement(groupId, text)`.

### Discover Tab

- [x] **Discover page sections with proper grouping and icons**: Enhance DiscoverPage to match real XeChat layout (see `assets/screenshots/mini_programs_discover_page.jpg`). The items should be grouped in sections separated by 8px gray dividers: Section 1: 朋友圈 (Moments — camera icon in circle, with red dot if new moments). Section 2: 视频号 (Channels — play icon), 直播 (Live — broadcast icon). Section 3: 扫一扫 (Scan — scan icon), 摇一摇 (Shake — phone icon). Section 4: 看一看 (Top Stories — eye icon, with red dot for new content), 搜一搜 (Search — magnifier icon). Section 5: 附近的人 (Nearby — location icon). Section 6: 小程序 (Mini Programs — chain link icon). Each item should be a 56px height row with: 28px colored icon on left, label text, right arrow chevron (>), and optionally a red dot badge.

- [x] **Channels page (视频号)**: Create a new route `/channels` with a simple short-video feed mock. Show 3-4 cards, each with: large video thumbnail (16:9 aspect), creator avatar + name overlay at bottom, like count ❤️, comment count 💬, share icon. This is visual-only; tapping shows a "视频播放中..." placeholder. Accessible from Discover tab's "视频号" item.

### Me Tab

- [x] **Complete Me page menu items**: Enhance ProfilePage to show all menu items matching real XeChat (see `assets/screenshots/me_tab_profile.jpg`): Profile card at top (avatar 64px, nickname, XeChat ID, QR icon, right arrow). Below that, grouped sections: Section 1: "服务" (Services — wallet icon, green). Section 2: "收藏" (Favorites — star icon, yellow), "朋友圈" (Moments — camera icon), "卡包" (Cards & Offers — card icon), "表情" (Sticker Gallery — smiley icon). Section 3: "设置" (Settings — gear icon). Currently some items like "表情" have no handler — all items should navigate somewhere or show a modal.

- [x] **Favorites page**: Create a new route `/favorites` accessible from Me tab. Show a list of 4-5 mock saved items: text notes, images, links (with title + preview), files. Each item shows: type icon, content preview (truncated), source ("来自 李四"), timestamp. This is read-only for now.

- [x] **Sticker gallery page**: Create a new route `/stickers` accessible from Me tab's "表情" item. Show a grid of sticker packs (4-6 mock packs), each with: pack thumbnail, pack name, "已添加" (Added) or "下载" (Download) button. Tapping a pack shows its sticker grid (4x2 of emoji/sticker images). This is visual-only.

### Moments (朋友圈)

- [x] **Moments post composition with image selection**: Currently new post creation uses random images. Replace with a proper compose flow: tap camera icon (top-right) → compose screen with text area + image picker grid. The image picker should show a grid of 12 placeholder images (from picsum.photos) that the user can select (up to 9, with selection count badge). Selected images show a check overlay. Include a "位置" (Location) option at bottom (tap → pick from list of 5 mock locations). "发表" (Post) button creates the moment with selected images and optional location.

- [x] **Moments comment reply**: Currently comments only show username + text. Enhance to support reply-to-comment: clicking on a comment should populate the comment input with "@username" and set `replyTo` field. Display replies as "张三 回复 李四: comment text" format with both names as clickable links in `#576b95` color.

- [x] **Delete own moments**: Show a "删除" (Delete) option when long-pressing on your own moment posts. Confirmation dialog → removes the moment from state.

- [x] **Moments cover image interaction**: Tap the cover image at the top of Moments feed → show option to "更换封面" (Change Cover) → pick from 6 preset cover images (picsum.photos with different seeds). Updates `user.coverImage`.

### Chat Settings Page

- [x] **Persist pin/mute toggles**: The "Sticky on Top" and "Mute Notifications" toggles in ChatSettingsPage and GroupInfoPage are currently local state only. Wire them to the Zustand store's `pinConversation()` and `muteConversation()` actions. The toggle state should initialize from the conversation's `isPinned`/`isMuted` fields and persist across page navigations. See `assets/screenshots/chat_info_settings.jpg` for the settings layout showing: Search Chat History, Sticky on Top toggle, Mute Notifications toggle, Chat Alert toggle, Background, Clear Chat History, Report.

- [x] **Chat background setting**: Add a "聊天背景" (Background) option in ChatSettingsPage. Tapping it shows a grid of 6 background options (solid colors + 2 image patterns). Selecting one saves it to localStorage per-conversation and applies it as the chat view's background. Default is the standard `#f5f5f5`.

---

## P2 — Secondary Features

<!-- Depth and realism, implement after P1 is solid. -->

- [ ] **Typing indicator**: When the user starts typing in a 1-on-1 chat, show "对方正在输入..." (The other party is typing...) in the header bar after a 1-second delay (simulating the contact typing back). Display for 3 seconds then revert to contact name. This adds realism to the auto-reply simulation.

- [ ] **Message forwarding flow**: When "转发" (Forward) is selected from the message context menu, show a contact/group picker modal (list of all contacts + groups with checkboxes). On confirm, the message is "forwarded" — a new message with the same content is sent to each selected contact/group.

- [ ] **Multi-select messages**: Add a "多选" (Multi-select) option to the message context menu. When activated, show checkboxes next to each message bubble. A bottom action bar appears with: "转发" (Forward selected), "删除" (Delete selected), "收藏" (Save to Favorites). Exit multi-select with "取消" button.

- [ ] **Contact tagging**: In ContactsPage, the "标签" (Tags) shortcut should show existing tags with contact counts. Tapping a tag shows contacts in that tag. Support creating new tags and adding/removing contacts from tags. Tags are: "朋友", "同事", "家人" (seeded from contact data).

- [ ] **Official Accounts list**: In ContactsPage, the "公众号" (Official Accounts) shortcut should navigate to a list of 3 mock accounts: "微信团队" (XeChat Team), "腾讯新闻" (Tencent News), "人民日报" (People's Daily). Each shows avatar, name, latest article title. Tapping an account shows a detail page with a list of 3 mock articles (title + thumbnail + date).

- [ ] **XeChat Pay / Services page**: Create a route `/services` accessible from Me tab's "服务" item. Show a mock wallet dashboard: balance "¥2,580.00", recent transactions list (5 items: transfers, red packets, purchases with amounts and dates), "收付款" (Pay/Receive) button showing a mock QR code, "钱包" (Wallet) section with: "银行卡" (Bank Cards), "零钱" (Change), "零钱通" (Money Market Fund).

- [ ] **Mini Programs page enhancement**: Create a route `/mini-programs` accessible from Discover tab. Show: search bar, "最近使用" (Recently Used) section with 4 mini program icons in a row, "我的小程序" (My Mini Programs) section with 8 more. Each mini program: 48px icon + name below. Tapping shows a "小程序加载中..." placeholder page. Use realistic Chinese app names: "美团外卖", "京东购物", "滴滴出行", "拼多多", "大众点评", "12306", "腾讯文档", "微信读书".

- [ ] **Search (搜一搜) enhancement**: The Discover tab's "搜一搜" (Search) item should navigate to a full search page with: search input at top, category tabs below (全部/朋友圈/公众号/小程序/音乐), hot search topics list (8-10 trending Chinese phrases). Typing in search filters/shows mock results. Currently it's a basic modal — make it a proper page.

- [ ] **Message recall within 2 minutes**: Implement the "撤回" (Recall) option on self messages. Only show this option for messages sent within the last 2 minutes (compare timestamp). On recall: replace message content with empty, set `recalled: true`, add a system message "你撤回了一条消息" with a "重新编辑" (Re-edit) link that puts the original text back in the input field.

- [ ] **User profile page photo wall**: On UserProfilePage, show a "个人相册" (Photo Wall) section that displays the 6 most recent images from that user's moments, in a 3x2 grid. Tapping an image navigates to the corresponding moment post.

- [ ] **Settings page**: Create a route `/settings` accessible from Me tab's "设置" item. Show grouped menu items: "帐号与安全" (Account & Security), "青少年模式" (Teen Mode), "关怀模式" (Care Mode — larger fonts), "新消息通知" (New Message Notifications), "隐私" (Privacy), "通用" (General), "关于微信" (About XeChat → shows version "XeChat 8.0.44"). Each item navigates to a stub page or shows a simple toggle. No real functionality needed — just realistic-looking menu structure.

- [ ] **Conversation search (global)**: The search bar on the Chats tab should support global search: (1) filter conversations by name/content (existing), (2) show matching contacts in a "联系人" section, (3) show matching messages in a "聊天记录" section with the matching message highlighted. Currently only filters conversations — add the additional result sections.

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. -->

- [x] **User**: 1 current user (张三, user_1) with all fields populated including coverImage for Moments
- [x] **Contacts**: 7 contacts (user_2 through user_8) with diverse names for alphabetical grouping, each with tag field ("朋友"/"同事"/"家人"), diverse regions, mix of male/female
- [x] **Conversations**: 5 conversations — 3 individual (1 pinned, 1 muted, 1 normal) + 1 group + 1 with unread messages. Include relative timestamps within last 3 days
- [x] **Messages**: Pre-seeded message threads for all 5 conversations, including diverse message types: text (most common), 1 image message, 1 file message, 1 hongbao in user_2 thread (unopened), 1 voice message in user_3 thread. At least 4-6 messages per active thread
- [x] **Moments**: 4-5 moments from various contacts and self, with: 1 post with 3 images + location + comments, 1 post with 1 image, 1 text-only post from self, 1 post from user_5 with likes but no comments. Include reply-to comments
- [x] **Groups**: 2 groups — "项目讨论组" (4 members, has announcement) and "老同学聚会" (4 members, no announcement), with pre-seeded group messages
- [x] **Favorites**: 4-5 saved items of different types (text, image, link, file) with sources and timestamps — for the Favorites page

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login / registration (app starts pre-logged-in as 张三 user_1)
- Real QR code generation or scanning
- Real payment processing (all amounts are mock)
- Real file upload to server (use placeholder URLs)
- Real voice/video calls (simulated timer UI only)
- Real push notifications
- XeChat Work (enterprise) features
- XeChat Pay merchant features
- Real mini program execution
- Server-side message delivery
- End-to-end encryption
- Account creation or password management
