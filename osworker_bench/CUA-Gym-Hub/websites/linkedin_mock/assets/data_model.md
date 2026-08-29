# XinkedIn Mock — Data Model

> Used by `src/data/mockData.js` → `createInitialData()` and `StoreContext.jsx`

## Entity Types

### 1. CurrentUser (singleton)

The logged-in user's full profile. Always `user_admin`.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"user_admin"` | Fixed |
| name | string | `"Alex Morgan"` | Display name |
| headline | string | `"Senior Software Engineer at TechCorp \| Full Stack Developer"` | Professional tagline |
| location | string | `"San Francisco Bay Area"` | |
| about | string | (multi-paragraph) | Editable biography |
| avatar | string | URL | Profile photo (use picsum/placeholder) |
| banner | string | URL | Banner/cover image |
| connections | string[] | `["user_2", "user_3", "user_5"]` | IDs of connected users |
| experience | Experience[] | see below | Work history |
| education | Education[] | see below | Academic history |
| skills | Skill[] | see below | Professional skills |

### 2. User

Other people on the platform. Stored in `state.users` as `{ [userId]: User }` map.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"user_2"` | Unique ID |
| name | string | `"Sarah Jenkins"` | |
| headline | string | `"Product Manager at InnovateTech"` | |
| location | string | `"New York, NY"` | |
| about | string | Bio text | Optional, shown on profile |
| avatar | string | URL | |
| banner | string | URL | |
| connections | string[] | `["user_admin", "user_3"]` | Bidirectional |
| experience | Experience[] | | Optional, for profile view |
| education | Education[] | | Optional |
| skills | Skill[] | | Optional |

### 3. Experience (nested in User/CurrentUser)

| Field | Type | Example |
|-------|------|---------|
| id | string/number | `"exp_1"` |
| title | string | `"Senior Software Engineer"` |
| company | string | `"TechCorp"` |
| companyId | string | `"company_1"` | Optional, links to Company |
| startDate | string | `"2020-01"` |
| endDate | string | `"Present"` or `"2024-06"` |
| location | string | `"San Francisco, CA"` |
| description | string | `"Led frontend architecture migration to React..."` |

### 4. Education (nested in User/CurrentUser)

| Field | Type | Example |
|-------|------|---------|
| id | string/number | `"edu_1"` |
| school | string | `"Stanford University"` |
| degree | string | `"BS Computer Science"` |
| fieldOfStudy | string | `"Computer Science"` | Optional |
| year | string | `"2016"` | Graduation year |
| startYear | string | `"2012"` | Optional |
| activities | string | `"ACM, Hackathon Club"` | Optional |

### 5. Skill (nested in User/CurrentUser)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"s1"` |
| name | string | `"React"` |
| endorsements | number | `24` |

### 6. Post

Feed posts created by users. Stored in `state.posts` as an array (newest first).

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"post_1"` | |
| userId | string | `"user_2"` | Author |
| content | string | (post text with \n, #hashtags) | |
| image | string\|null | URL or null | Optional media |
| reactions | object | `{ like: ["user_admin"], celebrate: [], love: ["user_3"], insightful: [], funny: [], curious: [] }` | **NEW**: Replaces simple `likes` array |
| comments | Comment[] | see below | |
| created | string (ISO) | `"2026-03-01T10:30:00Z"` | |
| repostedBy | string\|null | `"user_5"` or null | If this is a repost, who reposted |
| repostOf | string\|null | `"post_1"` or null | Original post ID if repost |

### 7. Comment (nested in Post)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"c1"` |
| userId | string | `"user_3"` |
| content | string | `"Congrats! This is great."` |
| created | string (ISO) | |
| likes | string[] | `["user_admin"]` | Users who liked this comment |

### 8. Job

Job listings. Stored in `state.jobs` as an array.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"job_1"` | |
| title | string | `"Frontend Engineer"` | |
| company | string | `"InnovateTech"` | |
| companyId | string | `"company_1"` | Optional link |
| location | string | `"Remote"` | |
| type | string | `"Full-time"` | Full-time/Part-time/Contract/Internship |
| level | string | `"Mid-Senior level"` | Entry/Associate/Mid-Senior/Director/Executive |
| logo | string | URL | Company logo |
| description | string | (multi-paragraph) | Full job description |
| requirements | string[] | `["3+ years React", "TypeScript"]` | Bullet list |
| salary | string | `"$120k - $180k/yr"` | Optional |
| posted | string | `"2 days ago"` | Relative time string |
| applicants | number | `47` | How many applied |
| saved | boolean | `false` | Whether current user saved this job |
| applied | boolean | `false` | Whether current user applied |

### 9. Chat (Messaging Conversation)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"chat_1"` |
| participants | string[] | `["user_admin", "user_2"]` |
| messages | Message[] | see below |

### 10. Message (nested in Chat)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"m1"` |
| senderId | string | `"user_2"` |
| content | string | `"Hi! Are you available for a quick call?"` |
| created | string (ISO) | |
| read | boolean | `true` | Optional read receipt |

### 11. Notification

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"n1"` | |
| type | string | `"like"` | like/comment/connection_request/connection_accept/mention/job_alert/profile_view/endorsement |
| actorId | string | `"user_2"` | Who triggered |
| targetId | string\|null | `"post_1"` | What was acted on (post, job, etc.) |
| content | string | `"liked your post"` | Display text |
| read | boolean | `false` | |
| created | string (ISO) | | |

### 12. ConnectionRequest

| Field | Type | Example |
|-------|------|---------|
| id | string | `"req_1"` |
| fromUserId | string | `"user_4"` |
| toUserId | string | `"user_admin"` |
| note | string | `"I'd love to connect!"` |
| status | string | `"pending"` | pending/accepted/ignored |
| created | string (ISO) | |

### 13. Company (NEW — for realistic job/experience linking)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"company_1"` |
| name | string | `"TechCorp"` |
| logo | string | URL |
| industry | string | `"Technology"` |
| size | string | `"1,001-5,000 employees"` |
| headquarters | string | `"San Francisco, CA"` |
| description | string | Short company bio |

---

## Relationships

```
CurrentUser ──1:N──> Experience
CurrentUser ──1:N──> Education
CurrentUser ──1:N──> Skill
CurrentUser ──M:N──> User (via connections[])
User ──1:N──> Post (via post.userId)
Post ──1:N──> Comment (nested)
Post ──1:N──> Reactions (nested object with arrays of userIds)
Chat ──M:N──> User (via participants[])
Chat ──1:N──> Message (nested)
Notification ──N:1──> User (via actorId)
ConnectionRequest ──> User (fromUserId, toUserId)
Company ──1:N──> Job (via companyId)
Company ──1:N──> Experience (via companyId, optional)
```

---

## Suggested `createInitialData()` Structure

```javascript
export const INITIAL_STATE = {
  currentUser: {
    id: 'user_admin',
    name: 'Alex Morgan',
    headline: 'Senior Software Engineer at TechCorp | Full Stack Developer',
    location: 'San Francisco Bay Area',
    about: 'Passionate software engineer with 8+ years of experience building scalable web applications. I specialize in React, TypeScript, and cloud architecture.\n\nCurrently leading frontend development at TechCorp, where we\'re building the next generation of developer tools.\n\nOpen to connecting with fellow engineers, product managers, and anyone passionate about technology.',
    avatar: 'https://picsum.photos/200/200?random=admin',
    banner: 'https://picsum.photos/1200/400?random=banner_admin',
    connections: ['user_2', 'user_3', 'user_5', 'user_6', 'user_8'],
    experience: [
      { id: 'exp_1', title: 'Senior Software Engineer', company: 'TechCorp', companyId: 'company_1', startDate: '2021-03', endDate: 'Present', location: 'San Francisco, CA', description: 'Leading frontend architecture and mentoring junior engineers. Built component library used by 50+ developers.' },
      { id: 'exp_2', title: 'Software Engineer', company: 'StartupXYZ', companyId: 'company_2', startDate: '2018-06', endDate: '2021-02', location: 'San Francisco, CA', description: 'Full stack development with React and Node.js. Shipped 3 major product features.' },
      { id: 'exp_3', title: 'Junior Developer', company: 'WebAgency', companyId: 'company_3', startDate: '2016-08', endDate: '2018-05', location: 'Oakland, CA', description: 'Built responsive websites and web applications for clients.' }
    ],
    education: [
      { id: 'edu_1', school: 'Stanford University', degree: 'BS Computer Science', year: '2016' },
      { id: 'edu_2', school: 'De Anza College', degree: 'AA Liberal Arts', year: '2014' }
    ],
    skills: [
      { id: 's1', name: 'React', endorsements: 34 },
      { id: 's2', name: 'JavaScript', endorsements: 28 },
      { id: 's3', name: 'TypeScript', endorsements: 19 },
      { id: 's4', name: 'Node.js', endorsements: 15 },
      { id: 's5', name: 'Python', endorsements: 12 },
      { id: 's6', name: 'AWS', endorsements: 8 },
      { id: 's7', name: 'GraphQL', endorsements: 6 },
      { id: 's8', name: 'System Design', endorsements: 4 }
    ]
  },

  users: {
    // 8 users with varied profiles
    'user_2': { id: 'user_2', name: 'Sarah Jenkins', headline: 'Product Manager at InnovateTech', location: 'New York, NY', about: '...', avatar: '...', banner: '...', connections: ['user_admin', 'user_3', 'user_5'], experience: [...], education: [...], skills: [...] },
    'user_3': { id: 'user_3', name: 'David Chen', headline: 'UX Designer | Creative Director at DesignStudio', ... },
    'user_4': { id: 'user_4', name: 'Emily Watson', headline: 'Technical Recruiter at GlobalTalent', ... },
    'user_5': { id: 'user_5', name: 'Marcus Johnson', headline: 'Backend Engineer at CloudScale', ... },
    'user_6': { id: 'user_6', name: 'Priya Patel', headline: 'Data Scientist at AnalyticsCo', ... },
    'user_7': { id: 'user_7', name: 'James Rodriguez', headline: 'VP of Engineering at FinanceApp', ... },
    'user_8': { id: 'user_8', name: 'Lisa Thompson', headline: 'Marketing Director at BrandFirst', ... },
    'user_9': { id: 'user_9', name: 'Kevin Wu', headline: 'Startup Founder | CEO at DevTools Inc', ... }
  },

  companies: {
    'company_1': { id: 'company_1', name: 'TechCorp', logo: '...', industry: 'Technology', size: '1,001-5,000 employees', headquarters: 'San Francisco, CA', description: 'Building next-gen developer tools.' },
    'company_2': { id: 'company_2', name: 'StartupXYZ', ... },
    'company_3': { id: 'company_3', name: 'WebAgency', ... },
    'company_4': { id: 'company_4', name: 'InnovateTech', ... },
    'company_5': { id: 'company_5', name: 'CloudScale', ... },
    'company_6': { id: 'company_6', name: 'GlobalTalent', ... }
  },

  posts: [
    // 10+ posts from different users, various types, with reactions
    { id: 'post_1', userId: 'user_2', content: '...', image: '...', reactions: { like: ['user_admin', 'user_5'], celebrate: ['user_3'], love: [], insightful: ['user_6'], funny: [], curious: [] }, comments: [...], created: '...' },
    // ... etc
  ],

  jobs: [
    // 6+ jobs at different companies with full descriptions
    { id: 'job_1', title: 'Frontend Engineer', company: 'InnovateTech', companyId: 'company_4', location: 'Remote', type: 'Full-time', level: 'Mid-Senior level', logo: '...', description: '...', requirements: ['3+ years React', '...'], salary: '$130k - $180k/yr', posted: '2 days ago', applicants: 47, saved: false, applied: false },
    // ... etc
  ],

  chats: [
    // 4+ conversations with realistic multi-message threads
    { id: 'chat_1', participants: ['user_admin', 'user_2'], messages: [
      { id: 'm1', senderId: 'user_2', content: 'Hi Alex! Are you coming to the tech meetup next week?', created: '...', read: true },
      { id: 'm2', senderId: 'user_admin', content: 'Hey Sarah! Yes, I wouldn\'t miss it. Are you presenting?', created: '...', read: true },
      { id: 'm3', senderId: 'user_2', content: 'I am! Talking about product-led growth strategies. Would love your feedback.', created: '...', read: true },
      { id: 'm4', senderId: 'user_admin', content: 'Absolutely! Let\'s grab coffee before and go over your slides.', created: '...', read: true }
    ]},
    // ... etc
  ],

  notifications: [
    // 8+ notifications of various types
    { id: 'n1', type: 'like', actorId: 'user_2', targetId: 'post_1', content: 'liked your post', read: false, created: '...' },
    { id: 'n2', type: 'comment', actorId: 'user_3', targetId: 'post_1', content: 'commented on your post', read: false, created: '...' },
    { id: 'n3', type: 'connection_request', actorId: 'user_4', targetId: null, content: 'wants to connect with you', read: false, created: '...' },
    { id: 'n4', type: 'connection_accept', actorId: 'user_6', targetId: null, content: 'accepted your connection request', read: true, created: '...' },
    { id: 'n5', type: 'profile_view', actorId: 'user_7', targetId: null, content: 'viewed your profile', read: true, created: '...' },
    { id: 'n6', type: 'endorsement', actorId: 'user_5', targetId: null, content: 'endorsed you for React', read: true, created: '...' },
    { id: 'n7', type: 'job_alert', actorId: null, targetId: 'job_1', content: 'New job matches your preferences: Frontend Engineer at InnovateTech', read: false, created: '...' },
    { id: 'n8', type: 'mention', actorId: 'user_8', targetId: 'post_5', content: 'mentioned you in a post', read: false, created: '...' }
  ],

  connectionRequests: [
    // 2-3 pending inbound requests for the agent to practice accepting/ignoring
    { id: 'req_1', fromUserId: 'user_4', toUserId: 'user_admin', note: 'Hi Alex! I came across your profile and would love to connect. I\'m a recruiter specializing in tech roles.', status: 'pending', created: '...' },
    { id: 'req_2', fromUserId: 'user_7', toUserId: 'user_admin', note: '', status: 'pending', created: '...' },
    { id: 'req_3', fromUserId: 'user_9', toUserId: 'user_admin', note: 'Fellow engineer here! Love your posts about React architecture.', status: 'pending', created: '...' }
  ]
};
```

### Notes on Data Design

1. **Reactions migration**: The current `likes: string[]` on posts should be replaced with `reactions: { like: [], celebrate: [], love: [], insightful: [], funny: [], curious: [] }`. The `toggleLike` action becomes `toggleReaction(postId, reactionType)`. Backward compat: if a post has `likes` but no `reactions`, treat likes as the `like` reaction array.

2. **Companies map**: New entity added to provide logos and info for experience entries and job listings. Not critical for MVP but makes the UI much more realistic.

3. **Job enrichment**: Jobs now have `saved`, `applied`, `requirements`, `salary`, `applicants`, `level` fields to support job detail view and save/apply actions.

4. **Notification enrichment**: Added `targetId` to link notifications to specific posts/jobs, and added more notification types (profile_view, endorsement, job_alert, mention).

5. **Comment likes**: Added `likes: string[]` to comments for comment-level reactions.

6. **Message read receipts**: Added `read: boolean` to messages.
