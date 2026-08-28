# twitter_mock Schema

**Deploy order**: 50 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8050)
**Base URL**: `http://172.17.46.46:8050/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**State endpoint**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Current user**: `u1` (Alex Johnson, @alexj)

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `users` | `User[]` | All users. 8 seed users (u1–u8). |
| `tweets` | `Tweet[]` | All posts/tweets. 18 seed posts (p1–p18). |
| `replies` | `Reply[]` | Inline replies to tweets. 10 seed replies (r1–r10). |
| `notifications` | `Notification[]` | Notifications for current user (u1). 10 seed items (n1–n10). |
| `conversations` | `Conversation[]` | DM conversation metadata. 4 seed convs (conv1–conv4). |
| `directMessages` | `DirectMessage[]` | DM message bodies. 15 seed messages (dm1–dm15). |
| `lists` | `List[]` | Xwitter lists owned by u1. 2 seed lists (list1–list2). |
| `trends` | `Trend[]` | Trending topics sidebar. 10 seed trends (t1–t10). |
| `bookmarkedPostIds` | `string[]` | Post IDs bookmarked by u1. Default: `["p3","p2","p8"]`. |
| `mutedUsers` | `string[]` | User IDs muted by u1. Default: `[]`. |
| `blockedUsers` | `string[]` | User IDs blocked by u1. Default: `[]`. |
| `notInterestedPostIds` | `string[]` | Post IDs marked "not interested" by u1. Default: `[]`. |
| `currentUser` | `User` | Shallow copy of the logged-in user (u1). |

### User subfields
`id, name, handle, bio, avatar, banner, location, website, joinedDate, verified (bool), followers (userId[]), following (userId[]), pinnedPostId`

### Tweet subfields
`id, userId, content, images (url[]), createdAt, likes (userId[]), reposts (userId[]), retweets (userId[]), replies (replyId[]), bookmarks (userId[]), quotedPostId, inReplyToPostId, inReplyToUserId, views (int)`

### Reply subfields
`id, tweetId, postId, userId, content, createdAt, likes (userId[])`

### Notification subfields
`id, type (like|repost|retweet|follow|reply|mention), userId, postId, tweetId, content, createdAt, read (bool)`

### Conversation subfields
`id, participants (userId[]), lastMessageId, lastMessageAt, isPinned (bool), unreadCount (int)`

### DirectMessage subfields
`id, conversationId, senderId, content, createdAt, read (bool)`

### List subfields
`id, name, description, ownerId, memberIds (userId[]), followerIds (userId[]), isPrivate (bool), createdAt, bannerUrl`

### Trend subfields
`id, category, name, postCount (string)`

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8050/?sid=task001",
    "inject_state": true,
    "state_content": {"action": "set", "state": {
      "users": [
        {"id": "u1", "name": "Alex Johnson", "handle": "alexj", "verified": true,
         "followers": ["u2"], "following": ["u2"], "pinnedPostId": null,
         "avatar": "https://i.pravatar.cc/150?u=u1"},
        {"id": "u2", "name": "Sarah Chen", "handle": "sarahc", "verified": true,
         "followers": ["u1"], "following": ["u1"],
         "avatar": "https://i.pravatar.cc/150?u=u2"}
      ],
      "tweets": [
        {"id": "p1", "userId": "u1", "content": "Hello world!", "images": [],
         "likes": [], "reposts": [], "retweets": [], "replies": [], "bookmarks": [], "views": 0}
      ],
      "replies": [],
      "notifications": [],
      "conversations": [],
      "directMessages": [],
      "lists": [],
      "trends": [{"id": "t1", "category": "Technology", "name": "#WebDev", "postCount": "28.5K"}],
      "bookmarkedPostIds": [],
      "mutedUsers": [],
      "blockedUsers": [],
      "notInterestedPostIds": [],
      "currentUser": {"id": "u1", "name": "Alex Johnson", "handle": "alexj",
                      "verified": true, "followers": ["u2"], "following": ["u2"]}
    }}
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|-------------------|
| Like a tweet | `tweets[i].likes` — u1 added/removed |
| Repost a tweet | `tweets[i].reposts` and `tweets[i].retweets` — u1 added/removed |
| Bookmark a tweet | `bookmarkedPostIds` — postId added/removed |
| Compose new tweet | `tweets` — new entry appended with `userId: "u1"` |
| Compose tweet with images | `tweets` — new entry with `images: [dataURL, ...]` |
| Quote tweet | `tweets` — new entry with `quotedPostId` set; also accessible via `/compose?quote=<id>` |
| Reply to tweet | `replies` — new entry; `tweets[i].replies` — reply id added |
| Follow a user | `users[currentUser].following` — target uid added; `users[target].followers` — u1 added; `notifications` — new follow notification |
| Unfollow a user | Reverse of follow |
| Mute a user | `mutedUsers` — target uid added/removed |
| Block a user | `blockedUsers` — target uid added/removed |
| Not interested in post | `notInterestedPostIds` — postId added |
| Send DM | `directMessages` — new entry; `conversations[i].lastMessageId` + `lastMessageAt` updated |
| Start new DM conversation | `conversations` — new entry with participants |
| Mark notification read | `notifications[i].read` → `true` |
| Edit profile (text fields) | `users[u1]` fields (name, bio, location, website); `currentUser` object updated |
| Edit profile (avatar) | `users[u1].avatar` — dataURL of new image; `currentUser.avatar` updated |
| Edit profile (banner) | `users[u1].banner` — dataURL of new image; `currentUser.banner` updated |
| Pin tweet | `users[u1].pinnedPostId` → tweet id |
| Create list | `lists` — new entry appended with `isPrivate` flag |
| Delete tweet | `tweets` — entry removed; parent `tweets[i].replies` array updated |
| Like generates notification | `notifications` — new `like` type notification for tweet author |
| Repost generates notification | `notifications` — new `repost` type notification for tweet author |
| Reply generates notification | `notifications` — new `reply` type notification for tweet author |
| Mention generates notification | `notifications` — new `mention` type notification for each @handle |

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home` | Timeline (For You / Following tabs) |
| `/explore` | `Explore` | Search and trending topics |
| `/search` | `Explore` | Alias for `/explore` |
| `/notifications` | `Notifications` | All/Mentions tabs; marks all as read on mount |
| `/messages` | `Messages` | DM inbox + conversation view + new message modal |
| `/bookmarks` | `Bookmarks` | Bookmarked posts |
| `/lists` | `Lists` | User's Xwitter lists + create list modal |
| `/profile/:handle` | `Profile` | User profile (Posts/Replies/Media/Likes tabs) |
| `/profile/:handle/following` | `FollowingList` | Following list with follow/unfollow buttons |
| `/profile/:handle/followers` | `FollowingList` | Followers list with follow/unfollow buttons |
| `/status/:id` | `TweetDetail` | Single post with inline reply composer |
| `/compose` | `Home` + compose modal | Opens compose modal (supports `?quote=<postId>` for quote tweets) |
| `/go` | `GoPage` | State inspection: `{initial_state, current_state, state_diff}` |

## UI Components and Behaviors

### Composer
- **Image upload**: Click camera icon → file picker → up to 4 images displayed in preview grid
- **Emoji picker**: Click smiley icon → grid of emoji → inserts into text
- **Character counter**: SVG ring + count shown when nearing/over 280 char limit
- **Quote tweet**: Pre-populated when `quotedPostId` prop is set or `?quote=` URL param present
- **Keyboard shortcut**: Ctrl+Enter / Cmd+Enter submits

### Tweet three-dot menu (own posts)
- **Pin/Unpin**: Toggles `currentUser.pinnedPostId`
- **Delete**: Shows confirmation modal (no `window.confirm()`); removes from `tweets`
- **Copy link**: Writes post URL to clipboard

### Tweet three-dot menu (others' posts)
- **Mute @handle**: Toggles `mutedUsers` array
- **Block @handle**: Toggles `blockedUsers` array
- **Not interested**: Adds to `notInterestedPostIds`
- **Copy link**: Writes post URL to clipboard

### Sidebar
- **More button**: Opens popup menu with Settings & Support, Help Center, Display options
- **User avatar row**: Opens user menu with View profile, Settings, Log out options
- **Notification badge**: Shows unread count on Bell icon
- **DM badge**: Shows unread count on Mail icon

### RightSidebar
- **Trends "Show more"**: Expands to show all trends (toggles)
- **Who to Follow "Show more"**: Shows up to 10 suggested users (toggles)
- **Follow buttons**: Call `toggleFollow` to update following state

### Messages
- **New message button**: Opens modal with user search to start a new conversation
- **Conversation creation**: Creates new `conversations` entry if none exists for the pair

### Lists
- **Create List button (+)**: Opens create list modal with name/description/private toggle
- **Private toggle**: Toggle switch for `isPrivate` field

### Edit Profile Modal
- **Banner camera button**: Clicks hidden `<input type="file" accept="image/*">` → FileReader reads as DataURL → preview updates immediately → saved to `currentUser.banner` + `users[u1].banner` on Save
- **Avatar camera button**: Clicks hidden `<input type="file" accept="image/*">` → FileReader reads as DataURL → preview updates immediately → saved to `currentUser.avatar` + `users[u1].avatar` on Save
- **Name field**: Required (max 50 chars); Save button disabled when empty
- **Bio field**: Optional (max 160 chars)
- **Location / Website fields**: Optional free-text
- **Save button**: Commits all changes atomically; closes modal

### Modal
- **ESC key**: Closes modal
- **Backdrop click**: Closes modal

