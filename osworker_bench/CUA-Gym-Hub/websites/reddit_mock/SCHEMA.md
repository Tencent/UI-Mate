# reddit_mock Schema

**Deploy order**: 43 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8043)
**Base URL**: `http://172.17.46.46:8043/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**Merge**: add `"merge":true` to POST body for partial update

Note: vite.config.js uses `port: 0` (random). Actual port assigned at runtime.

## Application Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Main feed of joined subreddits (or popular posts for new users) |
| `/popular` | Popular | Global popular posts sorted by upvotes across all subreddits |
| `/all` | All | All recent posts across every subreddit, sorted by new |
| `/r/:id` | Subreddit | Posts for a specific subreddit |
| `/post/:id` | PostPage | Full post view with comments (dark overlay style) |
| `/user/:id` | UserPage | User profile with their posts and comments |
| `/search?q=` | SearchPage | Search results with sort/time filter dropdowns |
| `/submit` | CreatePostPage | Post creation form (Text, Image, Link tabs) |
| `/go` | GoPage | State inspection endpoint returning JSON |

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Logged-in user with profile and lists |
| `users` | array | All user profiles |
| `subreddits` | array | All subreddit definitions |
| `posts` | array | All posts across subreddits |
| `comments` | array | All comments (flat, linked by postId/parentId) |
| `votes` | array | All vote records |
| `notifications` | array | Inbox notifications |
| `awards` | array | Available award definitions |

### currentUser fields
```
id, username, avatar, postKarma, commentKarma, cakeDay, about,
joinedSubreddits: string[],   // subreddit IDs
savedPosts: string[],         // post IDs
savedComments: string[],      // comment IDs
hiddenPosts: string[],        // post IDs (hidden from feed)
reportedPosts: string[]       // post IDs (reported by user)
```

### users[] fields
```
id, username, avatar, postKarma, commentKarma, cakeDay, about
```

### subreddits[] fields
```
id, name, description, icon, bannerColor, members, online, created,
rules: string[], moderators: string[], flairs: [{id, text, color, bgColor}]
```
Default subreddits: s1=technology, s2=funny, s3=programming, s4-s6 others.

### posts[] fields
```
id, subredditId, userId, title, content, type (text|link|image),
url, flairId, upvotes, downvotes, created,
isStickied, isLocked, isSpoiler, isNSFW,
commentIds: string[], awards: string[], pollOptions
```
- `isSpoiler`: when true, PostCard shows a "Spoiler" badge and blurs the post content
- `isNSFW`: when true, PostCard shows an "NSFW" badge and blurs the post content
- `isLocked`: when true, comment reply buttons are hidden in PostPage and Comment

### comments[] fields
```
id, postId, parentId (null=top-level), userId, content,
upvotes, downvotes, created, isEdited, isDistinguished, awards: string[]
```

### votes[] fields
```
id, userId, targetId, targetType (post|comment), value (1|-1)
```

### notifications[] fields
```
id, type (reply|mention|upvote|award|post_reply), fromUserId, postId, commentId,
content, read: bool, created
```

### awards[] fields
```
id, name, icon, cost
```

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8043/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "currentUser": {
          "id": "u1",
          "username": "redditor_42",
          "postKarma": 3450,
          "commentKarma": 8920,
          "joinedSubreddits": ["s1", "s2"],
          "savedPosts": [],
          "savedComments": [],
          "hiddenPosts": [],
          "reportedPosts": []
        },
        "subreddits": [
          {"id": "s1", "name": "technology", "members": 14500000, "online": 12000}
        ],
        "posts": [
          {
            "id": "p1",
            "subredditId": "s1",
            "userId": "u2",
            "title": "New AI breakthrough announced",
            "content": "Details here.",
            "type": "text",
            "upvotes": 1500,
            "downvotes": 50,
            "isSpoiler": false,
            "isNSFW": false,
            "isLocked": false,
            "isStickied": false,
            "commentIds": []
          }
        ],
        "comments": [],
        "votes": [],
        "notifications": [],
        "awards": []
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Fields Changed |
|-------------|---------------------|
| Upvote/downvote post | `posts[].upvotes` / `posts[].downvotes`, `votes[]` (entry added/modified) |
| Upvote/downvote comment | `comments[].upvotes` / `comments[].downvotes`, `votes[]` |
| Add comment | `comments[]` (new entry), `posts[].commentIds` (id appended) |
| Create post | `posts[]` (new entry prepended), fields include `isSpoiler` and `isNSFW` from toggle UI |
| Create community | `subreddits[]` (new entry), `currentUser.joinedSubreddits` (new id added) |
| Join subreddit | `currentUser.joinedSubreddits` (id added) |
| Leave subreddit | `currentUser.joinedSubreddits` (id removed) |
| Save post | `currentUser.savedPosts` (id added) |
| Unsave post | `currentUser.savedPosts` (id removed) |
| Save comment | `currentUser.savedComments` (id added) |
| Unsave comment | `currentUser.savedComments` (id removed) |
| Hide post | `currentUser.hiddenPosts` (id added) |
| Report post | `currentUser.reportedPosts` (id added) |
| Edit post | `posts[].title`, `posts[].content`, `posts[].url` (fields updated) |
| Delete post | `posts[].title = "[deleted]"`, `posts[].content = "[removed]"`, `posts[].userId = null` |
| Edit comment | `comments[].content`, `comments[].isEdited = true` |
| Delete comment | `comments[].content = "[deleted]"`, `comments[].userId = null` |
| Give award to post | `posts[].awards` (awardId appended) |
| Give award to comment | `comments[].awards` (awardId appended) |
| Mark notification read | `notifications[].read = true` |
| Mark all notifications read | all `notifications[].read = true` |

## UI Behaviors

### Navigation
- **Sidebar (desktop)**: Fixed left panel (270px) with Xeddit Feeds section (Home, Popular, All) and Your Communities section showing joined subreddits. Shows up to 5 communities with "See more" / "See less" toggle.
- **Sidebar (mobile)**: Hidden by default. Hamburger menu button in top-left of Navbar opens a slide-in overlay drawer. Clicking outside the drawer or any navigation link closes it.
- **Navbar**: Sticky top bar with search, bell notifications dropdown, messages dropdown, and user menu dropdown (My Profile, Dark Mode toggle, Log Out).

### PostPage (post detail)
- Renders as dark overlay (`bg-black/80`) over the previous page background.
- Back button (top-left, arrow + "Back" text) and X button (top-right) both call `navigate(-1)` to return to the previous page.
- Sort bar allows sorting comments by: Best, Top, New, Controversial.
- Locked posts (`isLocked: true`) show a lock banner and hide all reply/comment input boxes.

### PostCard
- **Spoiler posts** (`isSpoiler: true`): content is blurred with a "Spoiler" badge overlay. Clicking "Click to view spoiler" removes the blur.
- **NSFW posts** (`isNSFW: true`): content is blurred with an "NSFW" badge overlay. Clicking "Click to view" removes the blur.
- **Report**: Opens an inline report confirmation UI (no browser `alert()`). On confirm, calls `actions.reportPost(postId)` which records the post ID in `currentUser.reportedPosts`.
- **Share**: Copies the post URL (`/post/:id`) to the clipboard with a tooltip confirmation.
- **View modes**: Home and Subreddit pages support Card / Classic / Compact view toggles in the sort bar. State is local to each page (not persisted).

### Comment
- **Share button**: Copies a URL with comment anchor (`/post/:postId#comment-:commentId`) to clipboard. Shows a "Link Copied!" tooltip for 2 seconds.
- Comment root div has `id="comment-{id}"` for anchor navigation.
- Collapsible: clicking the `–` button collapses a comment thread. Clicking `[+]` expands it.
- Own comments show Edit and Delete options in a `...` menu. Delete requires confirmation in a modal.

### CreatePostPage (`/submit`)
- Tabs: Text, Image, Link
- Text tab: title is required; body text is optional (empty text posts are allowed)
- Image tab: accepts an image URL input
- Spoiler and NSFW toggle buttons set `isSpoiler` / `isNSFW` on the created post
- Subreddit selector filters by joined subreddits

### SearchPage (`/search?q=`)
- Sort dropdown and Time filter dropdown both close when clicking outside (outside-click handlers via `mousedown` event listeners).
- Searches across posts (title + content) and subreddits.

### Home page
- "Create Community" button opens an inline modal to enter community name and description. On submit, calls `actions.createCommunity({ name, description })`.
