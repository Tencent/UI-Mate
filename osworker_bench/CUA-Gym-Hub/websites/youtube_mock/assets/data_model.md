# XouTube Mock — Data Model

> For use by dev agent when implementing `createInitialData()` in `dataManager.js` / `initialData.js`

## Entity Types

### User (single current user)

```js
{
  userId: "user-1",                    // String, unique identifier
  displayName: "Alex Thompson",        // String, display name
  email: "alex.thompson@email.com",    // String
  handle: "@alexthompson",             // String, @-prefixed handle
  avatar: "https://picsum.photos/100/100?random=current",  // URL
  subscribedChannels: ["channel-1", "channel-2", ...],     // Array<channelId>
  watchHistory: [                      // Array<{videoId, watchedAt}>, newest first
    { videoId: "video-1", watchedAt: "2024-01-15T10:30:00Z", progress: 0.75 }
  ],
  likedVideos: ["video-2", "video-7", ...],    // Array<videoId>
  watchLater: ["video-4", "video-9", ...],     // Array<videoId>
  playlists: ["playlist-1", "playlist-2", ...] // Array<playlistId>
}
```

### Video

```js
{
  videoId: "video-1",                  // String, unique
  title: "Ultimate Gaming Setup Tour 2024",  // String, max ~100 chars
  description: "Full description text with line breaks...",  // String, multi-line
  channelId: "channel-2",             // String, FK to Channel
  channelName: "GameZone",            // String, denormalized for display
  channelAvatar: "https://...",       // URL, denormalized
  thumbnail: "https://picsum.photos/640/360?random=video1",  // URL, 16:9
  duration: "12:45",                  // String, "MM:SS" or "H:MM:SS"
  uploadDate: "2024-01-15T10:30:00Z", // ISO 8601 string
  viewCount: 2500000,                 // Number
  likeCount: 125000,                  // Number
  dislikeCount: 2500,                 // Number
  category: "Gaming",                 // String, one of categories array
  tags: ["Gaming", "trending", "2024"], // Array<String>
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"  // URL, sample video
}
```

### Channel

```js
{
  channelId: "channel-1",             // String, unique
  name: "TechMaster Pro",             // String
  handle: "@techmasterpro",           // String, @-prefixed
  avatar: "https://picsum.photos/100/100?random=channel1",  // URL, circular
  banner: "https://picsum.photos/1600/400?random=banner1",  // URL, wide banner
  description: "Your ultimate destination for tech reviews...",  // String
  subscriberCount: 2500000,           // Number
  videoCount: 342,                    // Number
  joinedDate: "2018-03-15",           // Date string
  links: ["https://techmaster.com"],  // Array<URL>
  videos: []                          // Array (currently unused, videos queried by channelId)
}
```

### Playlist

```js
{
  playlistId: "playlist-1",           // String, unique
  name: "Favorite Tech Videos",       // String
  description: "My collection of...", // String
  creatorId: "user-1",                // String, FK to User
  videoIds: ["video-2", "video-17", "video-32", "video-47"],  // Array<videoId>, ordered
  privacy: "Public",                  // "Public" | "Private" | "Unlisted"
  createdDate: "2024-01-01T00:00:00Z",  // ISO 8601
  thumbnail: "https://picsum.photos/640/360?random=playlist1"  // URL
}
```

### Comment

Comments are stored as a map keyed by videoId:

```js
comments: {
  "video-1": [
    {
      commentId: "comment-video-1-1",   // String, unique
      videoId: "video-1",               // String, FK to Video
      userId: "user-2",                 // String
      userName: "Sarah Johnson",        // String
      userAvatar: "https://picsum.photos/32/32?random=user2",  // URL
      text: "This is amazing! Thanks for sharing!",  // String
      timestamp: "2024-01-15T11:30:00Z",  // ISO 8601
      likeCount: 245,                   // Number
      dislikeCount: 3,                  // Number
      replies: [                        // Array<Comment> (nested, same structure minus replies)
        {
          commentId: "comment-video-1-1-reply-1",
          videoId: "video-1",
          userId: "user-1",
          userName: "Alex Thompson",
          userAvatar: "https://...",
          text: "Glad you enjoyed it!",
          timestamp: "2024-01-15T12:00:00Z",
          likeCount: 12,
          dislikeCount: 0,
          replies: [],
          isPinned: false
        }
      ],
      isPinned: false                   // Boolean
    }
  ]
}
```

### Notification

```js
{
  notificationId: "notif-1",          // String, unique
  type: "new_video",                  // "new_video" | "comment_reply" | "milestone"
  channelId: "channel-2",             // String, FK to Channel
  channelName: "GameZone",            // String, denormalized
  channelAvatar: "https://...",       // URL, denormalized
  videoId: "video-1",                 // String, FK to Video (optional)
  videoTitle: "Ultimate Gaming...",   // String, denormalized
  videoThumbnail: "https://...",      // URL, denormalized
  timestamp: "2024-01-15T10:30:00Z", // ISO 8601
  isRead: false                       // Boolean
}
```

### Categories (static array)

```js
categories: [
  "All", "Gaming", "Music", "Live", "News", "Sports",
  "Learning", "Tech", "Comedy", "Cooking", "Fitness", "Travel"
]
```

## Relationships

```
User ──subscribedChannels──> Channel (many-to-many)
User ──watchHistory──> Video (ordered, with timestamps + progress)
User ──likedVideos──> Video (many-to-many)
User ──watchLater──> Video (ordered)
User ──playlists──> Playlist (one-to-many)

Video ──channelId──> Channel (many-to-one)
Video <──comments──> Comment (one-to-many, via comments map)

Playlist ──videoIds──> Video (ordered many-to-many)
Playlist ──creatorId──> User (many-to-one)

Comment ──videoId──> Video (many-to-one)
Comment ──replies──> Comment (one-to-many, nested)

Notification ──channelId──> Channel
Notification ──videoId──> Video (optional)
```

## Existing `createInitialData()` Structure

The current `getDefaultData()` in `src/data/initialData.js` already returns:

```js
{
  user,           // Single user object
  videos,         // Array of 50 videos
  channels,       // Array of 15 channels
  comments,       // Map of videoId -> Comment[]  (9 videos have comments)
  playlists,      // Array of 5 playlists
  notifications,  // Array of 4 notifications
  categories      // Array of 12 category strings
}
```

## Recommended Seed Data Additions

1. **Watch history progress**: Add `progress` field (0-1 float) to each watchHistory entry for progress bar display
2. **More comments**: Add comments to more videos (currently only 9 of 50 have comments)
3. **Pinned comment**: At least one video should have a pinned comment from the channel owner
4. **More notification types**: Add "comment_reply" and "milestone" notification types
5. **More varied playlists**: Include playlists with many videos (10+) for pagination testing
