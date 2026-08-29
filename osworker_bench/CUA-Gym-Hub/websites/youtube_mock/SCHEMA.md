# youtube_mock Schema

**Deploy order**: 57 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8057)
**Base URL**: `http://172.17.46.46:8057/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State inspect (raw)**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

Note: Port is dynamically assigned (vite `port: 0`). 8057 is the expected port at BASE_PORT=8000.

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | HomePage | Feed of recommended videos |
| `/watch/:videoId` | VideoPlayerPage | Video player with comments |
| `/channel/:channelId` | ChannelPage | Channel overview with tabs |
| `/search?q=<query>` | SearchPage | Search results with filters |
| `/subscriptions` | SubscriptionsPage | Videos from subscribed channels |
| `/watch-later` | WatchLaterPage | Saved watch later videos |
| `/history` | HistoryPage | Watch history |
| `/liked` | LikedVideosPage | Liked videos |
| `/library` | LibraryPage | Playlists and saved content |
| `/trending` | TrendingPage | Trending content |
| `/trending?category=<category>` | TrendingPage | Trending filtered by category (e.g. `Shorts`, `Gaming`, `Music`, `News`, `Sports`, `Learning`) |
| `/playlist/:playlistId` | PlaylistPage | Individual playlist view |
| `/settings` | SettingsPage | User settings |
| `/go` | StateInspector (UI view) | Debug state viewer |

## State Schema

```
{
  user: {
    userId: string,                    // "user-1"
    displayName: string,               // "Alex Thompson"
    email: string,
    handle: string,                    // "@alexthompson"
    avatar: string,                    // URL
    subscribedChannels: string[],      // array of channelIds
    watchHistory: [                    // most recently watched first
      { videoId: string, watchedAt: ISO8601 }
    ],
    likedVideos: string[],             // array of videoIds
    dislikedVideos: string[],          // array of videoIds (new)
    watchLater: string[],              // array of videoIds
    playlists: string[],               // array of playlistIds
    searchHistory: string[]            // array of search query strings, most recent first, max 30 (new)
  },
  videos: [                            // 54 videos total
    {
      videoId: string,                 // "video-1" .. "video-54"
      title: string,
      description: string,
      channelId: string,
      channelName: string,
      channelAvatar: string,
      thumbnail: string,
      duration: string,                // "MM:SS" or "H:MM:SS"
      uploadDate: ISO8601,
      viewCount: number,
      likeCount: number,
      dislikeCount: number,
      category: string,                // see categories list below
      tags: string[],
      videoUrl: string
    }
  ],
  shorts: [                            // 20 shorts
    {
      shortId: string,                 // "short-1" .. "short-20"
      title: string,
      channelId: string,
      channelName: string,
      channelAvatar: string,
      thumbnail: string,
      viewCount: number,
      likeCount: number,
      dislikeCount: number,
      commentCount: number,
      uploadDate: ISO8601,
      isShort: true
    }
  ],
  channels: [                          // 16 channels (channel-1..channel-15 + user-1)
    {
      channelId: string,
      name: string,
      handle: string,
      avatar: string,
      banner: string,
      description: string,
      subscriberCount: number,
      videoCount: number,
      joinedDate: string,              // "YYYY-MM-DD"
      links: string[],
      videos: any[]
    }
  ],
  comments: {                          // keyed by videoId; populated for select videos
    [videoId]: [
      {
        commentId: string,
        videoId: string,
        userId: string,
        userName: string,
        userAvatar: string,
        text: string,
        timestamp: ISO8601,
        likeCount: number,
        dislikeCount: number,
        likedBy: string[],             // array of userIds who liked this comment (new)
        replies: [                     // nested reply objects, same shape as comment
          {
            commentId: string,
            videoId: string,
            userId: string,
            userName: string,
            userAvatar: string,
            text: string,
            timestamp: ISO8601,
            likeCount: number,
            dislikeCount: number,
            likedBy: string[],         // array of userIds who liked this reply (new)
            replies: [],
            isPinned: boolean
          }
        ],
        isPinned: boolean
      }
    ]
  },
  playlists: [                         // 5 user playlists
    {
      playlistId: string,              // "playlist-1".."playlist-5"
      name: string,
      description: string,
      creatorId: string,
      videoIds: string[],
      privacy: "Public"|"Private"|"Unlisted",
      createdDate: ISO8601,
      thumbnail: string
    }
  ],
  notifications: [                     // 4 default notifications
    {
      notificationId: string,
      type: "new_video",
      channelId: string,
      channelName: string,
      channelAvatar: string,
      videoId: string,
      videoTitle: string,
      videoThumbnail: string,
      timestamp: ISO8601,
      isRead: boolean
    }
  ],
  categories: string[],                // ["All","Gaming","Music","Live","News","Sports","Learning","Tech","Comedy","Cooking","Fitness","Travel","Movies","Fashion","DIY"]
  communityPosts: {                    // keyed by channelId; channel-1, channel-2, channel-5, channel-8 have posts
    [channelId]: [
      {
        postId: string,
        channelId: string,
        text: string,
        timestamp: ISO8601,
        likeCount: number,
        commentCount: number
      }
    ]
  },
  settings: {
    autoplay: boolean,
    captions: boolean,
    subtitlesLang: string,
    theme: "light"|"dark"|"system",    // "system" resolves using prefers-color-scheme at runtime
    location: string,
    language: string,
    notifSubscriptions: boolean,
    notifRecommended: boolean,
    notifActivity: boolean,
    notifReplies: boolean,
    keepWatchHistory: boolean,
    keepSearchHistory: boolean         // when false, addToSearchHistory() is a no-op
  }
}
```

## Context Actions (DataContext)

| Action | Signature | Description |
|--------|-----------|-------------|
| `updateData` | `(updates: object)` | Shallow-merge updates into root state |
| `addToWatchHistory` | `(videoId: string)` | Prepend `{videoId, watchedAt}` to `user.watchHistory`; deduplicates |
| `toggleLike` | `(videoId: string)` | Toggle `videoId` in `user.likedVideos`; update `video.likeCount` ±1 |
| `toggleDislike` | `(videoId: string)` | Toggle `videoId` in `user.dislikedVideos`; update `video.dislikeCount` ±1 |
| `toggleCommentLike` | `(videoId, commentId, isReply?, parentCommentId?)` | Toggle `userId` in `comment.likedBy`; update `comment.likeCount` ±1; works for top-level comments and nested replies |
| `toggleWatchLater` | `(videoId: string)` | Toggle `videoId` in `user.watchLater` |
| `toggleSubscription` | `(channelId: string)` | Toggle `channelId` in `user.subscribedChannels`; update `channel.subscriberCount` ±1 |
| `addComment` | `(videoId, text, parentCommentId?)` | Prepend new comment to `comments[videoId]`; if `parentCommentId` given, append as reply |
| `createPlaylist` | `(name, description, privacy)` | Create new playlist; append to `playlists`; add `playlistId` to `user.playlists` |
| `addToPlaylist` | `(playlistId, videoId)` | Append `videoId` to `playlists[i].videoIds` (deduplicates) |
| `removeFromPlaylist` | `(playlistId, videoId)` | Remove `videoId` from `playlists[i].videoIds` |
| `updatePlaylist` | `(playlistId, updates)` | Shallow-merge updates into matching playlist object |
| `removeFromWatchLater` | `(videoId: string)` | Remove `videoId` from `user.watchLater` |
| `deletePlaylist` | `(playlistId: string)` | Remove playlist from `playlists`; remove `playlistId` from `user.playlists` |
| `removeFromHistory` | `(videoId: string)` | Remove entry from `user.watchHistory` |
| `clearHistory` | `()` | Set `user.watchHistory` to `[]` |
| `addToSearchHistory` | `(query: string)` | Prepend trimmed query to `user.searchHistory` (max 30); deduplicates; no-op if `settings.keepSearchHistory` is false |
| `clearSearchHistory` | `()` | Set `user.searchHistory` to `[]` |
| `updateSettings` | `(updates: object)` | Shallow-merge updates into `settings` |
| `markNotificationAsRead` | `(notificationId: string)` | Set `notifications[i].isRead` to `true` |
| `markAllNotificationsAsRead` | `()` | Set all `notifications[i].isRead` to `true` |
| `showToast` | `(message: string)` | Imperatively append a toast DOM element; auto-removes after 3 s |
| `setMiniPlayer` | `(value: any)` | Set mini player state (for picture-in-picture feature) |

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8057/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {
          "userId": "user-1",
          "displayName": "Alex Thompson",
          "email": "alex.thompson@email.com",
          "handle": "@alexthompson",
          "avatar": "https://picsum.photos/100/100?random=current",
          "subscribedChannels": ["channel-1", "channel-2"],
          "watchHistory": [],
          "likedVideos": [],
          "dislikedVideos": [],
          "watchLater": [],
          "playlists": ["playlist-1"],
          "searchHistory": []
        },
        "playlists": [
          {
            "playlistId": "playlist-1",
            "name": "My Playlist",
            "description": "",
            "creatorId": "user-1",
            "videoIds": ["video-1"],
            "privacy": "Public",
            "createdDate": "2024-01-01T00:00:00.000Z",
            "thumbnail": ""
          }
        ]
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Like a video | `user.likedVideos` — videoId added/removed; `videos[i].likeCount` ±1 |
| Dislike a video | `user.dislikedVideos` — videoId added/removed; `videos[i].dislikeCount` ±1 |
| Like a comment | `comments[videoId][j].likedBy` — userId added/removed; `comments[videoId][j].likeCount` ±1 |
| Like a reply | `comments[videoId][j].replies[k].likedBy` — userId added/removed; `comments[videoId][j].replies[k].likeCount` ±1 |
| Subscribe to channel | `user.subscribedChannels` — channelId added/removed; `channels[i].subscriberCount` ±1 |
| Add to Watch Later | `user.watchLater` — videoId added/removed |
| Watch a video | `user.watchHistory` — `{videoId, watchedAt}` prepended (deduped) |
| Clear watch history | `user.watchHistory` — array becomes `[]` |
| Search for a query | `user.searchHistory` — query string prepended (when `settings.keepSearchHistory` is true) |
| Clear search history | `user.searchHistory` — array becomes `[]` |
| Create playlist | `playlists` — new playlist object appended; `user.playlists` — playlistId added |
| Add video to playlist | `playlists[i].videoIds` — videoId added |
| Remove video from playlist | `playlists[i].videoIds` — videoId removed |
| Delete playlist | `playlists` — object removed; `user.playlists` — playlistId removed |
| Mark notification read | `notifications[i].isRead` → `true` |
| Mark all notifications read | all `notifications[i].isRead` → `true` |
| Change setting | `settings.<key>` — value updated |
| Change theme to "system" | `settings.theme` → `"system"`; effective DOM theme resolved from `prefers-color-scheme` |
| Post comment | `comments[videoId]` — new comment object prepended |
| Post reply | `comments[videoId][j].replies` — new reply appended to matching parent comment |
