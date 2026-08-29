# XeChat Mock - State API Documentation

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

#### 1. 设置周末活动邀请 (Task #5 相关)

```bash
curl -X POST http://localhost:5173/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "state": {
      "moments": [
        {
          "postId": "moment_activity",
          "userId": "user_2",
          "content": "周末一起去爬山！时间：周六上午9点，地点：香山公园北门集合。有兴趣的朋友留言报名~",
          "images": ["https://picsum.photos/300/300?random=201"],
          "timestamp": "2026-02-08T10:00:00Z",
          "likes": ["user_3", "user_4"],
          "comments": [
            {
              "commentId": "c1",
              "userId": "user_3",
              "content": "我要去！",
              "timestamp": "2026-02-08T11:00:00Z"
            }
          ]
        }
      ]
    }
  }'
```

#### 2. 设置群聊消息

```bash
curl -X POST http://localhost:5173/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "state": {
      "groups": [
        {
          "groupId": "group_work",
          "name": "项目讨论组",
          "avatar": "https://picsum.photos/100/100?random=500",
          "members": ["user_1", "user_2", "user_3"],
          "createdAt": "2026-01-01T10:00:00Z",
          "createdBy": "user_2",
          "description": "项目相关讨论"
        }
      ],
      "messages": {
        "group_work": [
          {
            "messageId": "m1",
            "senderId": "user_2",
            "content": "大家今天下午3点开会",
            "type": "text",
            "timestamp": "2026-02-09T09:00:00Z",
            "isSelf": false
          }
        ]
      },
      "conversations": [
        {
          "contactId": "group_work",
          "lastMessage": "大家今天下午3点开会",
          "lastTime": "2026-02-09T09:00:00Z",
          "unreadCount": 1,
          "isGroup": true
        }
      ]
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
    "conversations": {
      "added": [],
      "modified": []
    },
    "messages": {
      "newConversations": [],
      "newMessages": { "user_2": 3 }
    },
    "moments": {
      "added": 1,
      "modified": 0
    }
  }
}
```

## 数据结构参考

### User 结构

```json
{
  "userId": "user_1",
  "nickname": "张三",
  "avatar": "https://...",
  "wechatId": "zhangsan123",
  "signature": "人生就像一场旅行",
  "region": "北京 海淀",
  "gender": "男",
  "coverImage": "https://..."
}
```

### Contact 结构

```json
{
  "userId": "user_2",
  "nickname": "李四",
  "avatar": "https://...",
  "wechatId": "lisi456",
  "signature": "做最好的自己",
  "region": "上海 浦东",
  "gender": "男"
}
```

### Conversation 结构

```json
{
  "contactId": "user_2",
  "lastMessage": "好的，明天见！",
  "lastTime": "2026-02-09T10:00:00Z",
  "unreadCount": 2,
  "isGroup": false
}
```

### Message 结构

```json
{
  "messageId": "m1",
  "senderId": "user_2",
  "content": "在吗？",
  "type": "text",
  "timestamp": "2026-02-09T10:00:00Z",
  "isSelf": false
}
```

消息类型 (type):
- `text`: 文字消息
- `image`: 图片消息
- `file`: 文件消息
- `hongbao`: 红包
- `location`: 位置
- `transfer`: 转账

### Moment (朋友圈) 结构

```json
{
  "postId": "1",
  "userId": "user_2",
  "content": "今天天气真好",
  "images": ["https://..."],
  "timestamp": "2026-02-09T10:00:00Z",
  "likes": ["user_1", "user_3"],
  "comments": [
    {
      "commentId": "c1",
      "userId": "user_1",
      "content": "确实不错！",
      "timestamp": "2026-02-09T10:30:00Z"
    }
  ]
}
```

### Group (群组) 结构

```json
{
  "groupId": "group_1",
  "name": "项目讨论组",
  "avatar": "https://...",
  "members": ["user_1", "user_2", "user_3"],
  "createdAt": "2026-01-01T10:00:00Z",
  "createdBy": "user_1",
  "description": "项目相关讨论"
}
```

## 使用流程

### 在 Playwright 中使用

```javascript
const { test, expect } = require('@playwright/test');

test('Task 5: 查看朋友圈活动邀请并评论', async ({ page }) => {
  // 1. 设置初始数据
  await page.request.post('http://localhost:5173/post', {
    data: {
      action: 'set',
      state: {
        moments: [{
          postId: 'moment_hiking',
          userId: 'user_2',
          content: '周六一起去爬山！香山公园北门9点集合',
          images: ['https://picsum.photos/300/300?random=201'],
          timestamp: '2026-02-08T10:00:00Z',
          likes: [],
          comments: []
        }]
      }
    }
  });

  // 2. 访问朋友圈
  await page.goto('http://localhost:5173/moments');

  // 3. 找到活动帖子
  await expect(page.locator('text=周六一起去爬山')).toBeVisible();

  // 4. 点赞
  await page.click('[data-testid="like-button"]');

  // 5. 评论
  await page.click('[data-testid="comment-button"]');
  await page.fill('input[placeholder*="评论"]', '我要参加！');
  await page.click('button:has-text("发送")');

  // 6. 验证状态变化
  const response = await page.goto('http://localhost:5173/go');
  const state = await response.json();
  expect(state.state_diff.moments.modified).toBeGreaterThan(0);
});
```

## 功能清单

### 已实现功能

- [x] 消息列表
- [x] 单聊/群聊
- [x] 发送文字/图片/文件消息
- [x] 朋友圈浏览
- [x] 朋友圈发布
- [x] 朋友圈点赞/评论
- [x] 联系人列表
- [x] 个人资料编辑
- [x] 群组创建/管理
- [x] 搜索聊天记录

### State Diff 追踪

- [x] 新增对话
- [x] 消息数量变化
- [x] 朋友圈新增/修改
- [x] 群组变化
- [x] 用户信息变化

## 重要说明

1. **使用 BrowserRouter**：URL 格式为 `/messages`，`/moments` 等
2. **POST 后需要刷新浏览器**：POST 只修改服务器端状态文件
3. **状态存储在 `.mock-state.json`**：这个文件在项目根目录
4. **自动回复**：发送消息后会自动收到模拟回复
