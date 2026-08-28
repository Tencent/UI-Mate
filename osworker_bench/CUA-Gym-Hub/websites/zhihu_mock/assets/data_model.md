# Xhihu Mock — Data Model

> Last updated by: plan agent, 2025-03-09
> Used by: `src/data/initialData.ts` → `getDefaultData()` function
> Type definitions: `src/types/index.ts`

---

## Entity Types

### 1. User

Already defined in `types/index.ts` as `User` interface. Current implementation is correct.

```typescript
interface User {
  userId: string;           // e.g. "user0", "user1"
  nickname: string;         // Chinese name, e.g. "张小凡"
  avatar: string;           // URL to avatar image (use picsum.photos or ui-avatars.com)
  headline: string;         // Short tagline, e.g. "产品经理 / 科技爱好者"
  description: string;      // Bio paragraph
  gender: 'male' | 'female' | 'other';
  location: string;         // City, e.g. "北京", "上海"
  industry: string;         // e.g. "互联网", "金融", "教育"
  employment: Employment[]; // [{company: "某互联网公司", job: "产品经理"}]
  education: Education[];   // [{school: "清华大学", major: "计算机科学"}]
  followingCount: number;
  followerCount: number;
  voteupCount: number;
  thankedCount: number;
  favoriteCount: number;
  answerCount: number;
  articleCount: number;
  questionCount: number;
}
```

**Seed data**: 6 users already exist (user0-user5). Recommend expanding to **10 users** with diverse backgrounds:
- user0: 张小凡 (current user, PM, Beijing) — **default logged-in user**
- user1: 李明 (internet observer, Shanghai)
- user2: 王芳 (psychology researcher, Beijing)
- user3: 赵强 (fullstack engineer, Shenzhen)
- user4: 刘洋 (financial analyst, Beijing)
- user5: 陈思 (food blogger, Chengdu)
- user6: 周雨 (medical doctor, Guangzhou)
- user7: 孙磊 (lawyer, Hangzhou)
- user8: 吴佳 (design director, Shanghai)
- user9: 郑涛 (AI researcher, Beijing)

---

### 2. Question

Already defined. Current implementation is correct.

```typescript
interface Question {
  questionId: string;       // e.g. "q1", "q2"
  title: string;            // Question title in Chinese
  description: string;      // Extended question description
  topics: string[];         // Array of topicId references
  authorId: string;         // userId who asked
  createdTime: number;      // Unix timestamp (ms)
  updatedTime: number;
  followerCount: number;    // Users following this question
  viewCount: number;        // Total views
  answerCount: number;      // Count of answers
}
```

**Seed data**: Expand from 3 to **8 questions** across different topics:
- q1: "如何评价人工智能的发展前景？" (AI, tech) — 5 answers
- q2: "有哪些高效的学习方法？" (psychology, education) — 3 answers
- q3: "程序员如何保持技术竞争力？" (tech, career) — 2 answers
- q4: "2024年有哪些值得推荐的好书？" (reading, culture) — 2 answers
- q5: "如何看待当前的房价走势？" (finance, economics) — 2 answers
- q6: "有哪些令你难忘的旅行经历？" (travel, life) — 1 answer
- q7: "如何科学有效地减肥？" (health, medicine) — 2 answers
- q8: "设计师如何提升审美能力？" (design, art) — 1 answer

---

### 3. Answer

Already defined. Current implementation is correct.

```typescript
interface Answer {
  answerId: string;         // e.g. "a1", "a2"
  questionId: string;       // FK to Question
  authorId: string;         // FK to User
  content: string;          // Full answer text (can include \n for paragraphs)
  createdTime: number;
  updatedTime: number;
  voteupCount: number;
  commentCount: number;
  favoriteCount: number;
  thankCount: number;
}
```

**Seed data**: Expand from 7 to **18 answers** with longer, more realistic content (300-800 chars each). Each answer should have multiple paragraphs separated by `\n\n`. Distribute across all 8 questions.

---

### 4. Article

Already defined. Currently only 1 article exists — needs expansion.

```typescript
interface Article {
  articleId: string;        // e.g. "art1"
  title: string;
  content: string;          // Full article body (longer than answers, 500-2000 chars)
  coverImage: string;       // URL to cover image
  authorId: string;         // FK to User
  columnId?: string;        // Optional FK to Column (not currently modeled)
  topics: string[];         // Array of topicId references
  createdTime: number;
  updatedTime: number;
  viewCount: number;
  voteupCount: number;
  commentCount: number;
  favoriteCount: number;
}
```

**Seed data**: Expand to **5 articles**:
- art1: "互联网产品设计的十大原则" (user1)
- art2: "深度学习入门：从零开始" (user9 — AI researcher)
- art3: "心理学视角下的拖延症" (user2 — psychologist)
- art4: "前端技术趋势2024" (user3 — engineer)
- art5: "成都美食地图：本地人推荐" (user5 — food blogger)

---

### 5. Comment

Already defined. Currently only 3 comments exist.

```typescript
interface Comment {
  commentId: string;        // e.g. "c1"
  targetId: string;         // ID of the target (answerId, articleId, ideaId, or commentId)
  targetType: 'answer' | 'article' | 'idea' | 'comment';
  authorId: string;         // FK to User
  content: string;          // Comment text
  createdTime: number;
  voteupCount: number;
  replies: Comment[];       // Nested replies (same structure)
}
```

**Storage format**: Comments are stored in `state.comments` as `{ [targetId: string]: Comment[] }`.

**Seed data**: Expand to **15+ comments** spread across answers, some with nested replies. Each popular answer (a1, a3, a7) should have 3-5 comments, some with 1-2 reply levels.

Example structure:
```json
{
  "a1": [
    {
      "commentId": "c1",
      "targetId": "a1",
      "targetType": "answer",
      "authorId": "user2",
      "content": "说得很有道理，AI确实在快速发展",
      "createdTime": 1709000000000,
      "voteupCount": 23,
      "replies": [
        {
          "commentId": "c1r1",
          "targetId": "c1",
          "targetType": "comment",
          "authorId": "user3",
          "content": "同意，而且速度比预期更快",
          "createdTime": 1709100000000,
          "voteupCount": 8,
          "replies": []
        }
      ]
    }
  ]
}
```

---

### 6. Topic

Already defined. Currently only 3 topics exist — needs expansion for realistic coverage.

```typescript
interface Topic {
  topicId: string;          // e.g. "topic1"
  name: string;             // Chinese name, e.g. "互联网"
  icon: string;             // URL to topic icon
  description: string;      // Topic description
  followerCount: number;    // Usually in millions (百万级)
  questionCount: number;
  parentId?: string;        // Optional parent topic for hierarchy
}
```

**Seed data**: Expand to **10 topics**:
- topic1: 互联网 (5.23M followers)
- topic2: 人工智能 (2.89M)
- topic3: 心理学 (4.12M)
- topic4: 金融 (3.56M)
- topic5: 职业发展 (6.78M)
- topic6: 阅读 (5.45M)
- topic7: 美食 (7.23M)
- topic8: 设计 (2.34M)
- topic9: 健康 (4.89M)
- topic10: 旅行 (3.67M)

---

### 7. Collection

Already defined. Currently only 1 collection exists.

```typescript
interface Collection {
  collectionId: string;     // e.g. "col1"
  name: string;
  description: string;
  privacy: 'public' | 'private';
  itemIds: string[];        // Array of answer/article/idea IDs
  itemTypes: ('answer' | 'article' | 'idea')[];  // Parallel array of types
  createdTime: number;
  updatedTime: number;
}
```

**Seed data**: Expand to **3 collections** for the current user:
- col1: "我的收藏" (private, default) — 3 items
- col2: "技术文章精选" (public) — 2 items
- col3: "好答案" (public) — 4 items

---

### 8. Notification

Already defined. Currently only 1 notification exists.

```typescript
interface Notification {
  notificationId: string;   // e.g. "notif1"
  type: 'voteup' | 'comment' | 'follow' | 'favorite' | 'thank' | 'invite' | 'system';
  fromUserId?: string;      // Who triggered (undefined for system)
  targetId?: string;        // What was targeted
  targetType?: 'answer' | 'article' | 'question' | 'comment';
  content: string;          // Description text, e.g. "赞同了你的回答"
  isRead: boolean;
  createdTime: number;
}
```

**Seed data**: Expand to **8 notifications** covering all types, with 3-4 unread:
- notif1: voteup — "赞同了你的回答" (unread)
- notif2: comment — "评论了你的回答" (unread)
- notif3: follow — "关注了你" (unread)
- notif4: favorite — "收藏了你的回答" (read)
- notif5: thank — "感谢了你的回答" (read)
- notif6: invite — "邀请你回答问题" (unread)
- notif7: system — "你的回答被收录到热门话题" (read)
- notif8: comment — "回复了你的评论" (read)

---

### 9. Idea (想法)

Already defined. Currently only 1 idea exists.

```typescript
interface Idea {
  ideaId: string;           // e.g. "idea1"
  authorId: string;
  content: string;          // Short-form text (usually 50-300 chars)
  images: string[];         // Array of image URLs
  topics: string[];         // Array of topicId references
  createdTime: number;
  voteupCount: number;
  commentCount: number;
  shareCount: number;
}
```

**Seed data**: Expand to **5 ideas** from various users:
- idea1: Quote/thought from user1 (no images)
- idea2: Food photo post from user5 (2 images)
- idea3: Tech observation from user3 (no images)
- idea4: Book recommendation from user2 (1 image)
- idea5: Travel photo from user0 (3 images)

---

### 10. AppState (Root State Shape)

```typescript
interface AppState {
  currentUser: User;                              // Always user0 (张小凡)
  users: User[];                                  // All users in the system
  questions: Question[];                          // All questions
  answers: Answer[];                              // All answers
  articles: Article[];                            // All articles
  comments: { [targetId: string]: Comment[] };    // Comments keyed by target ID
  topics: Topic[];                                // All topics
  collections: Collection[];                      // Current user's collections
  notifications: Notification[];                  // Current user's notifications
  ideas: Idea[];                                  // All ideas/thoughts
  userVoteups: { [answerId: string]: boolean };   // Answers the current user has upvoted
  userFavorites: { [answerId: string]: boolean }; // Answers the current user has favorited
  userFollowings: { [userId: string]: boolean };  // Users the current user follows
  userFollowedTopics: { [topicId: string]: boolean };     // Topics followed
  userFollowedQuestions: { [questionId: string]: boolean }; // Questions followed
}
```

---

## Suggested createInitialData() Expansion Summary

| Entity | Current Count | Target Count | Key Changes |
|--------|---------------|--------------|-------------|
| Users | 6 | 10 | Add doctor, lawyer, designer, AI researcher |
| Questions | 3 | 8 | Cover more topics (books, finance, travel, health, design) |
| Answers | 7 | 18 | Longer content, better distribution across questions |
| Articles | 1 | 5 | Different authors, diverse topics |
| Comments | 3 (across 2 targets) | 15+ (across 5+ targets) | Nested replies, more diversity |
| Topics | 3 | 10 | Cover all question topic areas |
| Collections | 1 | 3 | Mix of public/private |
| Notifications | 1 | 8 | All notification types represented, 3-4 unread |
| Ideas | 1 | 5 | Some with images, diverse authors |

### Pre-set Interaction States
```typescript
userVoteups: { a1: true, a3: true, a7: true }        // 3 answers already upvoted
userFavorites: { a1: true, a3: true }                  // 2 answers favorited
userFollowings: { user1: true, user3: true }           // Following 2 users
userFollowedTopics: { topic1: true, topic2: true, topic5: true }  // Following 3 topics
userFollowedQuestions: { q1: true, q2: true }          // Following 2 questions
```
