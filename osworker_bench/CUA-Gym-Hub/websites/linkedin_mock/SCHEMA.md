# linkedin_mock Schema

**Deploy order**: 27 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8027)
**Base URL**: `http://172.17.46.46:8027/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}` (note: inject uses `/post`, not `/go`)
**State Endpoint**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Routes**: `/` (Feed), `/mynetwork`, `/jobs`, `/messaging`, `/notifications`, `/profile/:id`, `/search`, `/go`, `*` (404)

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | The logged-in user (id: `user_admin`, name: Alex Morgan). Subfields: `id`, `name`, `headline`, `location`, `about`, `avatar`, `banner`, `connections[]` (array of userIds), `experience[]`, `education[]`, `skills[]` |
| `users` | object (map) | Other users keyed by userId (`user_2`..`user_9`). Each has same shape as `currentUser` |
| `companies` | object (map) | Companies keyed by companyId (`company_1`..`company_6`). Fields: `id`, `name`, `logo`, `industry`, `size`, `headquarters`, `description` |
| `posts` | array | Feed posts. Each: `id`, `userId`, `content`, `image`, `reactions` (object with keys `like/celebrate/love/insightful/funny/curious`, each an array of userIds), `comments[]` (`id`, `userId`, `content`, `created`, `likes[]` array of userIds who liked the comment), `created`, `repostedBy`, `repostOf` |
| `jobs` | array | Job listings. Each: `id`, `title`, `company`, `companyId`, `location`, `type`, `level`, `logo`, `description`, `requirements[]`, `salary`, `posted` (human-readable string), `postedDate` (ISO date string for filtering), `applicants`, `saved` (bool), `applied` (bool) |
| `chats` | array | DM conversations. Each: `id`, `participants[]` (userIds), `messages[]` (`id`, `senderId`, `content`, `created`, `read`) |
| `notifications` | array | Notifications. Each: `id`, `type` (like/comment/connection_request/connection_accept/profile_view/endorsement/job_alert/mention), `actorId`, `targetId`, `content`, `read` (bool), `created` |
| `connectionRequests` | array | Pending connection requests. Each: `id`, `fromUserId`, `toUserId`, `note`, `status` (pending), `created` |
| `followedCompanies` | array | Array of companyIds the current user follows. Initially `[]` |
| `dismissedSuggestions` | array | Array of userIds dismissed from "People you may know". Initially `[]` |

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8027/?sid=task001",
    "inject_state": true,
    "state_content": {"action": "set", "state": {
      "currentUser": {
        "id": "user_admin",
        "name": "Alex Morgan",
        "headline": "Senior Software Engineer at TechCorp",
        "location": "San Francisco Bay Area",
        "about": "Software engineer.",
        "avatar": "https://i.pravatar.cc/200?u=user_admin",
        "banner": "https://picsum.photos/1200/400?random=banner_admin",
        "connections": ["user_2", "user_3"],
        "experience": [],
        "education": [],
        "skills": []
      },
      "users": {},
      "companies": {},
      "posts": [],
      "jobs": [],
      "chats": [],
      "notifications": [],
      "connectionRequests": [],
      "followedCompanies": [],
      "dismissedSuggestions": []
    }}
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Create a post | `posts` array gains new entry at index 0 |
| Delete a post | `posts` array loses the entry |
| React to a post (like/celebrate/etc.) | `posts[i].reactions.<type>` array adds/removes `user_admin` |
| Comment on a post | `posts[i].comments` array gains new entry |
| Like a comment | `posts[i].comments[j].likes` array adds/removes `user_admin` |
| Repost (no text) | `posts` array gains new entry with `repostOf` = original post id, `repostedBy` = `user_admin`, empty `content` |
| Repost with thoughts | `posts` array gains new entry with `repostOf` = original post id, `repostedBy` = `user_admin`, non-empty `content` |
| Send post via DM | `chats[i].messages` array gains new entry referencing the shared post |
| Save a job | `jobs[i].saved` flips to `true` (or `false` if toggled off) |
| Apply to a job | `jobs[i].applied` flips to `true` (irreversible) |
| Follow a company | `followedCompanies` array gains the `companyId` |
| Unfollow a company | `followedCompanies` array loses the `companyId` |
| Send a message | `chats[i].messages` array gains new entry |
| Start new conversation | `chats` array gains new entry if no existing chat with that user |
| Accept connection request | `connectionRequests` loses entry; `currentUser.connections` gains userId |
| Ignore connection request | `connectionRequests` loses entry |
| Send connection request | `connectionRequests` gains new entry with `status: "pending"` |
| Withdraw sent connection request | `connectionRequests` loses the entry |
| Dismiss connection suggestion | `dismissedSuggestions` array gains the userId |
| Mark notification read | `notifications[i].read` flips to `true` |
| Mark all notifications read | All `notifications[*].read` flip to `true` |
| Update profile | `currentUser.name/headline/location/about` fields updated |
| Add/remove experience | `currentUser.experience` array modified |
| Add/remove education | `currentUser.education` array modified |
| Add/remove skill | `currentUser.skills` array modified |

## Actions Reference

| Action | Context | Notes |
|--------|---------|-------|
| `toggleReaction(postId, type)` | Feed / PostCard | type ∈ {like, celebrate, love, insightful, funny, curious}; clicking same type toggles off |
| `addComment(postId, content)` | PostCard comments section | Creates comment with `likes: []` |
| `toggleCommentLike(postId, commentId)` | PostCard comment | Toggles `user_admin` in `comment.likes` |
| `addPost(content, image, repostOf)` | Feed / Share modals | `repostOf` is original post id for reposts; `repostedBy` auto-set to current user |
| `deletePost(postId)` | PostCard 3-dot menu | Own posts only |
| `sendConnectionRequest(toUserId, note)` | Profile / Network / Search | Creates pending request |
| `withdrawConnectionRequest(requestId)` | Network sent requests | Removes request by id |
| `acceptConnectionRequest(requestId)` | Network invitations | Also updates both users' connections arrays |
| `ignoreConnectionRequest(requestId)` | Network invitations | Removes request without connecting |
| `dismissSuggestion(userId)` | Network suggestions | Adds userId to `dismissedSuggestions` |
| `followCompany(companyId)` | Jobs detail panel | Adds to `followedCompanies` |
| `unfollowCompany(companyId)` | Jobs detail panel | Removes from `followedCompanies` |
| `saveJob(jobId)` | Jobs | Toggles `saved` boolean |
| `applyToJob(jobId)` | Jobs detail panel | Sets `applied: true` (one-way) |
| `sendMessage(chatId, content)` | Messaging | Appends to existing chat |
| `createChat(otherUserId)` | Messaging / Profile | Returns existing or new chat id |
| `markNotificationRead(notifId)` | Notifications | Sets `read: true` |
| `markAllNotificationsRead()` | Notifications | Sets all `read: true` |
| `updateProfile(updates)` | Profile (own) | Updates `currentUser` fields |

## Search Scope

The `/search?q=<query>` route searches across 4 scopes displayed as tabs:

| Tab | Fields Searched |
|-----|----------------|
| People | `user.name`, `user.headline`, `user.skills[*].name` |
| Posts | `post.content` |
| Jobs | `job.title`, `job.company`, `job.description` |
| Companies | `company.name`, `company.industry`, `company.description` |

## Messaging Search

The search input in the Messaging sidebar filters conversations by:
- Participant name (`users[otherId].name`)
- Any message content (`chat.messages[*].content`)

## Jobs Date Filter

The "Date Posted" filter uses `job.postedDate` (ISO string) for machine-readable comparison:

| Filter Option | Cutoff |
|--------------|--------|
| Any time | No filter |
| Past 24 hours | `postedDate` within last 24h |
| Past week | `postedDate` within last 7 days |
| Past month | `postedDate` within last 30 days |
