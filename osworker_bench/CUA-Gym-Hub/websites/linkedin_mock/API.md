# XinkedIn Mock - State API Documentation

## Overview

两个简单的端点用于设置和读取状态：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/go` | GET | 获取当前状态、初始状态和 diff |
| `/post` | POST | 设置初始数据 |
| `/state` | GET | 获取服务器端存储的自定义状态 |

## POST /post - 设置初始数据

### 请求格式

```json
{
  "action": "set",      // "set" 或 "reset"
  "merge": false,       // 是否与现有状态合并
  "state": { ... }      // 自定义的状态数据
}
```

### 使用示例

#### 1. 设置AI博主信息 (Task #2)

```bash
curl -X POST http://localhost:5173/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "state": {
      "users": {
        "ai_blogger": {
          "id": "ai_blogger",
          "name": "AI Tech Insights",
          "headline": "AI Researcher | Machine Learning Expert | Tech Blogger",
          "avatar": "https://picsum.photos/100/100?random=100",
          "connections": 15000,
          "location": "San Francisco Bay Area"
        }
      },
      "posts": [
        {
          "id": "post_ai_1",
          "userId": "ai_blogger",
          "content": "Exciting developments in LLM technology! The latest models are showing remarkable improvements in reasoning capabilities. #AI #MachineLearning #LLM",
          "image": null,
          "likes": [],
          "comments": [],
          "created": "2026-02-09T10:00:00Z"
        }
      ]
    }
  }'
```

#### 2. 设置待处理好友申请 (Task #3)

```bash
curl -X POST http://localhost:5173/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "state": {
      "connectionRequests": [
        {
          "id": "req_1",
          "fromUserId": "user_john",
          "toUserId": "current_user",
          "note": "Hi! I saw your post about AI and would love to connect.",
          "status": "pending",
          "created": "2026-02-08T14:00:00Z"
        },
        {
          "id": "req_2",
          "fromUserId": "user_sarah",
          "toUserId": "current_user",
          "note": "We met at the tech conference last week.",
          "status": "pending",
          "created": "2026-02-09T09:00:00Z"
        }
      ],
      "users": {
        "user_john": {
          "id": "user_john",
          "name": "John Smith",
          "headline": "Software Engineer at Google",
          "avatar": "https://picsum.photos/100/100?random=101",
          "connections": 500
        },
        "user_sarah": {
          "id": "user_sarah",
          "name": "Sarah Chen",
          "headline": "Product Manager at Microsoft",
          "avatar": "https://picsum.photos/100/100?random=102",
          "connections": 800
        }
      }
    }
  }'
```

#### 3. 重置到默认状态

```bash
curl -X POST http://localhost:5173/post \
  -H "Content-Type: application/json" \
  -d '{"action": "reset"}'
```

## GET /go - 查看状态

访问 `http://localhost:5173/go` 返回：

```json
{
  "initial_state": { ... },
  "current_state": { ... },
  "state_diff": {
    "posts": {
      "from": [...],
      "to": [...]
    },
    "connectionRequests": {
      "from": [...],
      "to": [...]
    }
  }
}
```

## 数据结构参考

### CurrentUser 结构

```json
{
  "id": "current_user",
  "name": "Demo User",
  "headline": "Software Developer",
  "avatar": "https://...",
  "email": "demo@example.com",
  "connections": ["user_1", "user_2"],
  "experience": [
    {
      "id": "exp_1",
      "title": "Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco",
      "startDate": "2023-01",
      "endDate": "Present",
      "description": "..."
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "school": "Stanford University",
      "degree": "B.S. Computer Science",
      "startDate": "2019",
      "endDate": "2023"
    }
  ],
  "skills": [
    { "id": "skill_1", "name": "JavaScript", "endorsements": 25 }
  ]
}
```

### User 结构

```json
{
  "id": "user_1",
  "name": "John Doe",
  "headline": "Product Manager",
  "avatar": "https://...",
  "connections": 500,
  "location": "New York"
}
```

### Post 结构

```json
{
  "id": "post_1",
  "userId": "user_1",
  "content": "Excited to share...",
  "image": "https://...",
  "likes": ["user_2", "user_3"],
  "comments": [
    {
      "id": "c_1",
      "userId": "user_2",
      "content": "Great post!",
      "created": "2026-02-09T11:00:00Z"
    }
  ],
  "created": "2026-02-09T10:00:00Z"
}
```

### ConnectionRequest 结构

```json
{
  "id": "req_1",
  "fromUserId": "user_1",
  "toUserId": "current_user",
  "note": "Let's connect!",
  "status": "pending",
  "created": "2026-02-09T10:00:00Z"
}
```

### Chat 结构

```json
{
  "id": "chat_1",
  "participants": ["current_user", "user_1"],
  "messages": [
    {
      "id": "m_1",
      "senderId": "user_1",
      "content": "Hi there!",
      "created": "2026-02-09T10:00:00Z"
    }
  ]
}
```

## 使用流程

### 在 Playwright 中使用

```javascript
const { test, expect } = require('@playwright/test');

test('Task 2: 关注AI博主', async ({ page }) => {
  // 1. 设置初始数据
  await page.request.post('http://localhost:5173/post', {
    data: {
      action: 'set',
      state: {
        users: {
          ai_blogger: {
            id: 'ai_blogger',
            name: 'AI Tech Insights',
            headline: 'AI Researcher',
            avatar: 'https://picsum.photos/100/100?random=100'
          }
        },
        posts: [{
          id: 'post_ai',
          userId: 'ai_blogger',
          content: 'Latest AI developments...',
          likes: [],
          comments: [],
          created: '2026-02-09T10:00:00Z'
        }]
      }
    }
  });

  // 2. 访问首页
  await page.goto('http://localhost:5173/');

  // 3. 找到AI博主的帖子
  await expect(page.locator('text=AI Tech Insights')).toBeVisible();

  // 4. 点击Connect按钮
  await page.click('button:has-text("Connect")');

  // 5. 验证状态变化
  const response = await page.goto('http://localhost:5173/go');
  const state = await response.json();
  expect(state.state_diff.connectionRequests).toBeDefined();
});

test('Task 3: 处理好友申请', async ({ page }) => {
  // 1. 设置待处理的好友申请
  await page.request.post('http://localhost:5173/post', {
    data: {
      action: 'set',
      state: {
        connectionRequests: [{
          id: 'req_1',
          fromUserId: 'user_john',
          toUserId: 'current_user',
          note: 'Would love to connect!',
          status: 'pending',
          created: '2026-02-09T10:00:00Z'
        }],
        users: {
          user_john: {
            id: 'user_john',
            name: 'John Smith',
            headline: 'Engineer at Google'
          }
        }
      }
    }
  });

  // 2. 访问 My Network 页面
  await page.goto('http://localhost:5173/mynetwork');

  // 3. 找到好友申请
  await expect(page.locator('text=John Smith')).toBeVisible();

  // 4. 点击 Accept
  await page.click('button:has-text("Accept")');

  // 5. 验证好友已添加
  const response = await page.goto('http://localhost:5173/go');
  const state = await response.json();
  expect(state.current_state.currentUser.connections).toContain('user_john');
});
```

## 功能清单

### 已实现功能

- [x] Feed (帖子列表)
- [x] 发布帖子
- [x] 点赞/评论
- [x] My Network (人脉)
- [x] 发送/接受好友请求
- [x] Jobs (职位)
- [x] Messaging (消息)
- [x] Notifications (通知)
- [x] Profile (个人资料)
- [x] 编辑经历/教育/技能

### State Diff 追踪

- [x] 帖子变化
- [x] 好友请求变化
- [x] 个人资料变化
- [x] 消息变化

## 重要说明

1. **使用 BrowserRouter**：URL 格式为 `/`, `/mynetwork`, `/jobs` 等
2. **POST 后需要刷新浏览器**：POST 只修改服务器端状态文件
3. **状态存储在 `.mock-state.json`**：这个文件在项目根目录
