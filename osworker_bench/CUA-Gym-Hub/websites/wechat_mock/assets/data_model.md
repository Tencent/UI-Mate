# XeChat Mock — Data Model

> For `src/utils/storage.js` `getInitialData()` and `src/store.js`
> Last updated: 2025-03-09

---

## Entity Types

### 1. User (Current User)

The logged-in user. Only one instance.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| userId | string | Unique ID | `"user_1"` |
| nickname | string | Display name (Chinese) | `"张三"` |
| avatar | string | URL to avatar image | `"https://picsum.photos/100/100?random=1"` |
| wechatId | string | XeChat ID (unique handle) | `"zhangsan_2024"` |
| signature | string | Personal signature/bio | `"每天进步一点点"` |
| region | string | Location | `"北京 海淀"` |
| gender | string | Gender | `"男"` / `"女"` |
| coverImage | string | Moments cover photo URL | `"https://picsum.photos/800/300?random=cover"` |
| phone | string | Phone number (optional) | `"138****1234"` |

### 2. Contact

People in the user's address book.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| userId | string | Unique ID | `"user_2"` |
| nickname | string | Display name | `"李四"` |
| avatar | string | Avatar URL | `"https://picsum.photos/100/100?random=2"` |
| wechatId | string | XeChat ID | `"lisi_wx"` |
| phone | string | Phone number | `"139****5678"` |
| signature | string | Bio | `"简单生活"` |
| region | string | Location | `"上海 浦东"` |
| gender | string | Gender | `"男"` |
| tag | string | Contact tag/group (optional) | `"同事"` / `"朋友"` / `"家人"` |
| isStar | boolean | Starred contact (optional) | `false` |

**Relationships**: Contact `userId` is referenced in `conversations.contactId`, `messages[contactId]`, `moments.userId`, `groups.members[]`.

### 3. Conversation

An entry in the chats list. Can be 1-on-1 or group.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| contactId | string | Contact or Group ID | `"user_2"` or `"group_1"` |
| lastMessage | string | Preview of last message | `"好的，收到了！"` |
| lastTime | string | ISO timestamp of last message | `"2025-03-09T10:30:00Z"` |
| unreadCount | number | Number of unread messages | `3` |
| isGroup | boolean | Whether this is a group chat | `false` |
| isPinned | boolean | Whether conversation is pinned to top | `false` |
| isMuted | boolean | Whether notifications are muted | `false` |
| draft | string | Unsaved draft text (optional) | `""` |

### 4. Message

Individual messages within a conversation thread. Stored as `messages: { [contactId]: Message[] }`.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| messageId | string | Unique ID | `"msg_1678901234"` |
| senderId | string | User ID of sender | `"user_1"` (self) or `"user_2"` |
| content | string | Message text or metadata | `"你好！"` / `"https://picsum.photos/400/300"` |
| type | string | Message type enum | `"text"` / `"image"` / `"file"` / `"voice"` / `"location"` / `"transfer"` / `"hongbao"` / `"system"` |
| timestamp | string | ISO timestamp | `"2025-03-09T10:30:00Z"` |
| isSelf | boolean | Sent by current user? | `true` |
| amount | number | For transfer/hongbao: CNY amount | `88.88` |
| greeting | string | For hongbao: greeting text | `"恭喜发财，大吉大利"` |
| opened | boolean | For hongbao: already opened? | `false` |
| duration | number | For voice messages: seconds | `5` |
| fileName | string | For file messages: file name | `"report.pdf"` |
| fileSize | string | For file messages: size text | `"2.5MB"` |
| locationName | string | For location messages: place name | `"北京天安门"` |
| locationAddress | string | For location: detailed address | `"北京市东城区天安门广场"` |
| recalled | boolean | Whether message was recalled | `false` |

**Message type display rules:**
- `text` → render content as text
- `image` → render content as `<img>` with click-to-enlarge
- `voice` → green/white bubble with waveform icon + duration seconds
- `file` → file icon + fileName + fileSize
- `location` → map thumbnail + locationName + locationAddress
- `transfer` → orange card: "转账" + ¥amount
- `hongbao` → orange envelope card: greeting text + "微信红包"; tappable to "open"
- `system` → centered gray text (e.g., "You recalled a message", "张三 joined the group")

### 5. Moment (朋友圈 Post)

Social feed posts.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| postId | string | Unique ID | `"moment_1"` |
| userId | string | Author's user ID | `"user_2"` |
| content | string | Post text | `"周末去爬山了，风景太美了！"` |
| images | string[] | Array of image URLs (0-9) | `["https://picsum.photos/400/300?random=1"]` |
| timestamp | string | ISO timestamp | `"2025-03-09T08:00:00Z"` |
| likes | string[] | Array of user IDs who liked | `["user_1", "user_3"]` |
| comments | Comment[] | Array of comments | (see below) |
| location | string | Optional location tag | `"北京·颐和园"` |
| visibility | string | Who can see (optional) | `"public"` / `"friends"` |

### 6. Comment (Moment Comment)

Embedded within Moment objects.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| commentId | string | Unique ID | `"comment_1"` |
| userId | string | Commenter's user ID | `"user_3"` |
| content | string | Comment text | `"好美啊！在哪里？"` |
| timestamp | string | ISO timestamp | `"2025-03-09T09:00:00Z"` |
| replyTo | string | User ID being replied to (optional) | `"user_2"` |

### 7. Group

Group chat entities.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| groupId | string | Unique ID | `"group_1"` |
| name | string | Group name | `"项目讨论组"` |
| avatar | string | Group avatar URL (optional) | `"https://picsum.photos/100/100?random=g1"` |
| members | string[] | Array of member user IDs | `["user_1", "user_2", "user_3"]` |
| createdAt | string | ISO timestamp | `"2025-01-15T09:00:00Z"` |
| createdBy | string | Creator user ID | `"user_1"` |
| description | string | Group description | `"用于讨论项目进度"` |
| announcement | string | Group announcement/notice | `"本周五下午3点开会"` |

### 8. OfficialAccount (Optional P2)

Subscription accounts the user follows.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| accountId | string | Unique ID | `"oa_1"` |
| name | string | Account name | `"微信团队"` |
| avatar | string | Avatar URL | `"https://picsum.photos/100/100?random=oa1"` |
| description | string | Account description | `"微信官方帐号"` |
| lastArticle | string | Latest article title | `"微信8.0更新说明"` |
| lastTime | string | ISO timestamp | `"2025-03-08T14:00:00Z"` |

### 9. Favorites (Optional P2)

Saved items.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| favoriteId | string | Unique ID | `"fav_1"` |
| type | string | Content type | `"text"` / `"image"` / `"link"` / `"file"` |
| content | string | Saved content or URL | `"这段话很有道理..."` |
| source | string | Where it was saved from | `"李四"` |
| timestamp | string | When saved | `"2025-03-05T11:00:00Z"` |

---

## Relationships Diagram

```
User (1)
  ├── has many Contacts (7+)
  ├── has many Conversations (links to Contact or Group)
  ├── has many Message threads (keyed by contactId/groupId)
  ├── has many Moments (authored + from contacts)
  ├── has many Groups (created/member of)
  └── has many Favorites (saved items)

Contact
  ├── referenced in Conversations.contactId
  ├── referenced in Messages[contactId]
  ├── referenced in Moments.userId
  ├── referenced in Moments.likes[]
  ├── referenced in Moments.comments[].userId
  └── referenced in Groups.members[]

Group
  ├── referenced in Conversations.contactId (with isGroup=true)
  ├── referenced in Messages[groupId]
  └── has members[] → Contact userIds
```

---

## Suggested `createInitialData()` Structure

```javascript
function createInitialData() {
  return {
    user: {
      userId: 'user_1',
      nickname: '张三',
      avatar: 'https://picsum.photos/100/100?random=1',
      wechatId: 'zhangsan_2024',
      signature: '每天进步一点点',
      region: '北京 海淀',
      gender: '男',
      coverImage: 'https://picsum.photos/800/300?random=cover',
      phone: '138****1234'
    },

    contacts: [
      // 7 contacts with diverse names for alphabetical grouping
      { userId: 'user_2', nickname: '李四', avatar: '...', wechatId: 'lisi_wx', phone: '139****5678', signature: '简单生活', region: '上海 浦东', gender: '男', tag: '朋友' },
      { userId: 'user_3', nickname: '王五', avatar: '...', wechatId: 'wangwu_88', phone: '136****9012', signature: '热爱运动', region: '广州 天河', gender: '男', tag: '同事' },
      { userId: 'user_4', nickname: '赵六', avatar: '...', wechatId: 'zhaoliu_66', phone: '137****3456', signature: '', region: '深圳 南山', gender: '女', tag: '同事' },
      { userId: 'user_5', nickname: '小明', avatar: '...', wechatId: 'xiaoming_99', phone: '135****7890', signature: '代码改变世界', region: '杭州 西湖', gender: '男', tag: '朋友' },
      { userId: 'user_6', nickname: '小红', avatar: '...', wechatId: 'xiaohong_love', phone: '158****2345', signature: '生活不止眼前', region: '成都 锦江', gender: '女', tag: '朋友' },
      { userId: 'user_7', nickname: '老板', avatar: '...', wechatId: 'boss_wang', phone: '186****6789', signature: '专注工作', region: '北京 朝阳', gender: '男', tag: '同事' },
      { userId: 'user_8', nickname: '小美', avatar: '...', wechatId: 'xiaomei_art', phone: '159****0123', signature: '艺术是生活', region: '南京 鼓楼', gender: '女', tag: '家人' }
    ],

    conversations: [
      // 5 conversations for a realistic chats list (3 individual + 2 group refs possible)
      { contactId: 'user_2', lastMessage: '好的，明天见！', lastTime: '2025-03-09T10:30:00Z', unreadCount: 2, isGroup: false, isPinned: true, isMuted: false, draft: '' },
      { contactId: 'user_3', lastMessage: '[图片]', lastTime: '2025-03-09T09:15:00Z', unreadCount: 0, isGroup: false, isPinned: false, isMuted: false, draft: '' },
      { contactId: 'user_4', lastMessage: '项目文件已发给你了', lastTime: '2025-03-08T18:00:00Z', unreadCount: 1, isGroup: false, isPinned: false, isMuted: false, draft: '' },
      { contactId: 'group_1', lastMessage: '王五: 收到了', lastTime: '2025-03-09T11:00:00Z', unreadCount: 5, isGroup: true, isPinned: false, isMuted: false, draft: '' },
      { contactId: 'user_7', lastMessage: '下周一开会', lastTime: '2025-03-07T16:00:00Z', unreadCount: 0, isGroup: false, isPinned: false, isMuted: true, draft: '' }
    ],

    messages: {
      'user_2': [
        // 6-8 diverse messages showing various types
        { messageId: 'msg_001', senderId: 'user_2', content: '在吗？', type: 'text', timestamp: '2025-03-09T10:00:00Z', isSelf: false },
        { messageId: 'msg_002', senderId: 'user_1', content: '在的，怎么了？', type: 'text', timestamp: '2025-03-09T10:01:00Z', isSelf: true },
        { messageId: 'msg_003', senderId: 'user_2', content: '明天下午有空吗？一起去打球', type: 'text', timestamp: '2025-03-09T10:02:00Z', isSelf: false },
        { messageId: 'msg_004', senderId: 'user_1', content: '可以啊，几点？', type: 'text', timestamp: '2025-03-09T10:05:00Z', isSelf: true },
        { messageId: 'msg_005', senderId: 'user_2', content: '下午3点，老地方', type: 'text', timestamp: '2025-03-09T10:06:00Z', isSelf: false },
        { messageId: 'msg_006', senderId: 'user_1', content: '好的，明天见！', type: 'text', timestamp: '2025-03-09T10:30:00Z', isSelf: true }
      ],
      'user_3': [
        { messageId: 'msg_010', senderId: 'user_3', content: '看看这个风景', type: 'text', timestamp: '2025-03-09T09:10:00Z', isSelf: false },
        { messageId: 'msg_011', senderId: 'user_3', content: 'https://picsum.photos/400/300?random=photo1', type: 'image', timestamp: '2025-03-09T09:15:00Z', isSelf: false }
      ],
      'user_4': [
        { messageId: 'msg_020', senderId: 'user_4', content: '项目文件已发给你了', type: 'text', timestamp: '2025-03-08T18:00:00Z', isSelf: false },
        { messageId: 'msg_021', senderId: 'user_4', content: 'Q1报告.pdf', type: 'file', timestamp: '2025-03-08T18:01:00Z', isSelf: false, fileName: 'Q1报告.pdf', fileSize: '3.2MB' }
      ],
      'user_7': [
        { messageId: 'msg_030', senderId: 'user_7', content: '下周一开会', type: 'text', timestamp: '2025-03-07T16:00:00Z', isSelf: false },
        { messageId: 'msg_031', senderId: 'user_1', content: '好的，收到', type: 'text', timestamp: '2025-03-07T16:05:00Z', isSelf: true }
      ],
      'group_1': [
        { messageId: 'msg_040', senderId: 'user_1', content: '大家好，项目进度更新一下', type: 'text', timestamp: '2025-03-09T10:50:00Z', isSelf: true },
        { messageId: 'msg_041', senderId: 'user_3', content: '我这边已经完成了设计稿', type: 'text', timestamp: '2025-03-09T10:55:00Z', isSelf: false },
        { messageId: 'msg_042', senderId: 'user_4', content: '开发进度80%', type: 'text', timestamp: '2025-03-09T10:58:00Z', isSelf: false },
        { messageId: 'msg_043', senderId: 'user_3', content: '收到了', type: 'text', timestamp: '2025-03-09T11:00:00Z', isSelf: false }
      ]
    },

    moments: [
      {
        postId: 'moment_1',
        userId: 'user_2',
        content: '周末去爬山了，风景太美了！🏔️',
        images: [
          'https://picsum.photos/400/300?random=m1',
          'https://picsum.photos/400/300?random=m2',
          'https://picsum.photos/400/300?random=m3'
        ],
        timestamp: '2025-03-09T08:00:00Z',
        likes: ['user_1', 'user_3', 'user_5'],
        comments: [
          { commentId: 'c1', userId: 'user_3', content: '好美啊！在哪里？', timestamp: '2025-03-09T08:30:00Z' },
          { commentId: 'c2', userId: 'user_2', content: '香山！推荐你也去', timestamp: '2025-03-09T08:35:00Z', replyTo: 'user_3' }
        ],
        location: '北京·香山公园'
      },
      {
        postId: 'moment_2',
        userId: 'user_6',
        content: '新做的甜点，大家觉得怎么样？😋',
        images: [
          'https://picsum.photos/400/400?random=m4'
        ],
        timestamp: '2025-03-08T19:00:00Z',
        likes: ['user_1', 'user_2', 'user_4', 'user_8'],
        comments: [
          { commentId: 'c3', userId: 'user_8', content: '看起来好好吃！', timestamp: '2025-03-08T19:20:00Z' }
        ],
        location: ''
      },
      {
        postId: 'moment_3',
        userId: 'user_1',
        content: '读完了这本书，收获很多，推荐给大家！📚',
        images: [],
        timestamp: '2025-03-07T20:00:00Z',
        likes: ['user_2', 'user_6'],
        comments: [
          { commentId: 'c4', userId: 'user_2', content: '什么书？分享一下', timestamp: '2025-03-07T20:15:00Z' },
          { commentId: 'c5', userId: 'user_1', content: '《原则》，Ray Dalio写的', timestamp: '2025-03-07T20:20:00Z', replyTo: 'user_2' }
        ],
        location: ''
      },
      {
        postId: 'moment_4',
        userId: 'user_5',
        content: '代码终于跑通了！🎉🎉🎉',
        images: [],
        timestamp: '2025-03-06T23:00:00Z',
        likes: ['user_1', 'user_3'],
        comments: [],
        location: '杭州·阿里巴巴西溪园区'
      }
    ],

    groups: [
      {
        groupId: 'group_1',
        name: '项目讨论组',
        avatar: 'https://picsum.photos/100/100?random=g1',
        members: ['user_1', 'user_3', 'user_4', 'user_5'],
        createdAt: '2025-01-15T09:00:00Z',
        createdBy: 'user_1',
        description: '用于讨论项目进度',
        announcement: '本周五下午3点开会，请大家准时参加'
      },
      {
        groupId: 'group_2',
        name: '老同学聚会',
        avatar: 'https://picsum.photos/100/100?random=g2',
        members: ['user_1', 'user_2', 'user_5', 'user_6'],
        createdAt: '2024-12-20T18:00:00Z',
        createdBy: 'user_2',
        description: '高中同学群',
        announcement: ''
      }
    ]
  };
}
```

---

## Notes for Dev Agent

1. **All user IDs follow `user_N` pattern** — keep consistent when referencing across entities
2. **Group IDs follow `group_N` pattern** — conversations referencing groups use the groupId as contactId with `isGroup: true`
3. **Messages are keyed by contactId/groupId** — the same key used in conversations
4. **Timestamps are ISO 8601** — formatted for display using `helpers.js` functions
5. **Avatar URLs use picsum.photos** — with unique random seeds for each user
6. **New fields added vs existing store**: `isPinned`, `isMuted`, `draft` on conversations; `tag`, `isStar` on contacts; `voice`, `greeting`, `opened`, `duration`, `fileName`, `fileSize`, `locationName`, `locationAddress`, `recalled` on messages; `location`, `replyTo` on moments/comments; `announcement` on groups — dev should merge these into existing data structures
