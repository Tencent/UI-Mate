# Xlack Mock - Simple State API

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

#### 1. 设置 Sprint Planning 投票消息

```bash
curl -X POST http://localhost:5180/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "state": {
      "messages": {
        "engineering": [
          {
            "messageId": "sprint_poll_1",
            "senderId": "user_3",
            "content": "Sprint Planning - Vote for your preferred time!\n\n1️⃣ Monday 10:00 AM\n2️⃣ Tuesday 2:00 PM\n3️⃣ Wednesday 11:00 AM",
            "timestamp": "2026-02-09T10:00:00Z",
            "threadId": null,
            "reactions": [
              { "emoji": "1️⃣", "users": ["user_1", "user_2", "user_4"] },
              { "emoji": "2️⃣", "users": ["user_5"] },
              { "emoji": "3️⃣", "users": ["user_6", "user_7"] }
            ],
            "attachments": [],
            "isEdited": false
          }
        ]
      },
      "threads": {
        "thread_sprint": {
          "threadId": "thread_sprint",
          "parentMessageId": "sprint_poll_1",
          "channelId": "engineering",
          "dmId": null,
          "replies": [],
          "followers": ["user_1"]
        }
      }
    }
  }'
```

#### 2. 重置到默认状态

```bash
curl -X POST http://localhost:5180/post \
  -H "Content-Type: application/json" \
  -d '{"action": "reset"}'
```

#### 3. 合并状态（保留默认数据，只添加自定义部分）

```bash
curl -X POST http://localhost:5180/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "merge": true,
    "state": {
      "messages": {
        "engineering": [
          {
            "messageId": "new_msg",
            "senderId": "user_1",
            "content": "This will be added to existing messages"
          }
        ]
      }
    }
  }'
```

## GET /go - 查看状态

访问 `http://localhost:5180/go` 返回：

```json
{
  "initial_state": { ... },
  "current_state": { ... },
  "state_diff": { ... }
}
```

## 使用流程

### 方法 1：启动前设置（推荐）

```bash
# 1. 启动服务器
npm run dev -- --port 5180

# 2. POST 设置初始数据
curl -X POST http://localhost:5180/post -H "Content-Type: application/json" -d '...'

# 3. 刷新浏览器（或首次访问）
# 浏览器会自动加载自定义状态
```

### 方法 2：在 Playwright 中使用

```javascript
const { test } = require('@playwright/test');

test('Task 1: Sprint Planning Poll', async ({ page }) => {
  // 1. 先 POST 设置数据
  await page.request.post('http://localhost:5180/post', {
    data: {
      action: 'set',
      state: {
        messages: {
          engineering: [{
            messageId: 'poll_1',
            senderId: 'user_3',
            content: 'Vote for Sprint Planning time!',
            reactions: [
              { emoji: '1️⃣', users: ['user_1', 'user_2', 'user_4'] },
              { emoji: '2️⃣', users: ['user_5'] },
              { emoji: '3️⃣', users: ['user_6'] }
            ]
          }]
        },
        threads: {
          thread_poll: {
            threadId: 'thread_poll',
            parentMessageId: 'poll_1',
            channelId: 'engineering',
            replies: [],
            followers: ['user_1']
          }
        }
      }
    }
  });

  // 2. 访问页面（会自动加载自定义数据）
  await page.goto('http://localhost:5180/channel/engineering');

  // 3. 验证消息显示
  await expect(page.locator('.message')).toContainText('Vote for Sprint Planning');

  // 4. 检查状态
  const response = await page.request.get('http://localhost:5180/go');
  const state = await response.json();
  console.log(state.current_state);
});
```

## 数据结构参考

### Message 结构

```json
{
  "messageId": "msg_xxx",
  "senderId": "user_1",
  "content": "消息内容",
  "timestamp": "2026-02-09T10:00:00Z",
  "threadId": null,
  "reactions": [
    { "emoji": "👍", "users": ["user_1", "user_2"] }
  ],
  "attachments": [],
  "isEdited": false
}
```

### Thread 结构

```json
{
  "threadId": "thread_xxx",
  "parentMessageId": "msg_xxx",
  "channelId": "engineering",
  "dmId": null,
  "replies": ["msg_reply_1", "msg_reply_2"],
  "followers": ["user_1", "user_2"]
}
```

### 默认用户 ID

| userId | 名称 | 职位 |
|--------|------|------|
| user_1 | John Smith | Senior Developer (当前用户) |
| user_2 | Sarah Johnson | Designer |
| user_3 | Mike Chen | Product Manager |
| user_4 | Emily Davis | Developer |
| user_5 | Alex Kim | Marketing Manager |
| user_6 | Lisa Anderson | HR Manager |
| user_7 | Tom Wilson | Sales Director |
| user_8 | Rachel Lee | Support Specialist |

### 默认频道 ID

| channelId | 名称 |
|-----------|------|
| general | #general |
| random | #random |
| engineering | #engineering |
| design | #design |
| marketing | #marketing |
| project-alpha | #project-alpha |

## 重要说明

1. **POST 后需要刷新浏览器**：POST 只修改服务器端状态文件，浏览器在下次加载时才会读取
2. **状态存储在 `.mock-state.json`**：这个文件在项目根目录，可以直接编辑
3. **自定义状态会与默认状态合并**：只需要提供你想修改的部分，其他部分会使用默认值
4. **`reset` 会删除自定义状态**：恢复到代码中定义的默认数据
