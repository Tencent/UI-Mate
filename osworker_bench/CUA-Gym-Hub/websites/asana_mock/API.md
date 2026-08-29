# Xsana Mock - State API Documentation

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

#### 1. 设置 Sprint 任务 (Task #7)

```bash
curl -X POST http://localhost:3000/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "state": {
      "projects": [
        {
          "projectId": "proj_sprint",
          "name": "Sprint 12",
          "teamId": "team_dev",
          "color": "blue",
          "starred": true,
          "status": "on_track"
        }
      ],
      "tasks": [
        {
          "taskId": "task_auth",
          "title": "Implement User Authentication",
          "description": "Add login/logout functionality with JWT tokens",
          "projectId": "proj_sprint",
          "assigneeId": "user_1",
          "dueDate": "2026-02-15",
          "priority": "high",
          "status": "in_progress",
          "completed": false,
          "subtasks": [
            { "id": "sub_1", "title": "Setup JWT", "completed": true },
            { "id": "sub_2", "title": "Create login UI", "completed": false }
          ]
        },
        {
          "taskId": "task_api",
          "title": "API Rate Limiting",
          "description": "Implement rate limiting for public endpoints",
          "projectId": "proj_sprint",
          "assigneeId": "user_2",
          "dueDate": "2026-02-12",
          "priority": "medium",
          "status": "not_started",
          "completed": false
        }
      ]
    }
  }'
```

#### 2. 设置多项目视图

```bash
curl -X POST http://localhost:3000/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "state": {
      "teams": [
        {
          "teamId": "team_dev",
          "name": "Development Team",
          "members": ["user_1", "user_2", "user_3"]
        }
      ],
      "projects": [
        {
          "projectId": "proj_1",
          "name": "Mobile App",
          "teamId": "team_dev",
          "color": "green"
        },
        {
          "projectId": "proj_2",
          "name": "Backend API",
          "teamId": "team_dev",
          "color": "purple"
        }
      ],
      "tasks": [
        {
          "taskId": "task_1",
          "title": "Design home screen",
          "projectId": "proj_1",
          "completed": false
        },
        {
          "taskId": "task_2",
          "title": "Setup database",
          "projectId": "proj_2",
          "completed": true
        }
      ]
    }
  }'
```

#### 3. 重置到默认状态

```bash
curl -X POST http://localhost:3000/post \
  -H "Content-Type: application/json" \
  -d '{"action": "reset"}'
```

## GET /go - 查看状态

访问 `http://localhost:3000/go` 返回：

```json
{
  "initial_state": { ... },
  "current_state": { ... },
  "state_diff": { ... }
}
```

## 数据结构参考

### User 结构

```json
{
  "userId": "user_1",
  "name": "John Doe",
  "email": "john@company.com",
  "avatar": "https://...",
  "role": "admin"
}
```

### Team 结构

```json
{
  "teamId": "team_1",
  "name": "Development Team",
  "description": "Product development team",
  "members": ["user_1", "user_2"]
}
```

### Project 结构

```json
{
  "projectId": "proj_1",
  "name": "Sprint 12",
  "teamId": "team_1",
  "color": "blue",
  "starred": false,
  "status": "on_track",
  "description": "Current sprint",
  "dueDate": "2026-02-28",
  "createdDate": "2026-02-01T10:00:00Z",
  "modifiedDate": "2026-02-09T10:00:00Z"
}
```

项目状态 (status):
- `on_track`: 按计划进行
- `at_risk`: 存在风险
- `off_track`: 落后于计划

### Task 结构

```json
{
  "taskId": "task_1",
  "title": "Implement feature X",
  "description": "Detailed description...",
  "projectId": "proj_1",
  "sectionId": "section_1",
  "assigneeId": "user_1",
  "dueDate": "2026-02-15",
  "priority": "high",
  "status": "in_progress",
  "completed": false,
  "completedDate": null,
  "createdDate": "2026-02-01T10:00:00Z",
  "modifiedDate": "2026-02-09T10:00:00Z",
  "tags": ["frontend", "urgent"],
  "subtasks": [
    { "id": "sub_1", "title": "Subtask 1", "completed": false }
  ],
  "dependencies": ["task_0"]
}
```

优先级 (priority):
- `high`: 高优先级
- `medium`: 中优先级
- `low`: 低优先级

状态 (status):
- `not_started`: 未开始
- `in_progress`: 进行中
- `blocked`: 被阻塞
- `completed`: 已完成

### Comment 结构

```json
{
  "commentId": "comment_1",
  "taskId": "task_1",
  "authorId": "user_1",
  "content": "This looks good!",
  "createdDate": "2026-02-09T10:00:00Z"
}
```

### Notification 结构

```json
{
  "notificationId": "notif_1",
  "type": "task_assigned",
  "userId": "user_1",
  "taskId": "task_1",
  "message": "You were assigned to 'Implement feature X'",
  "read": false,
  "createdDate": "2026-02-09T10:00:00Z"
}
```

### Portfolio 结构

```json
{
  "portfolioId": "portfolio_1",
  "name": "Q1 Initiatives",
  "ownerId": "user_1",
  "projects": ["proj_1", "proj_2"],
  "status": "on_track"
}
```

### Goal 结构

```json
{
  "goalId": "goal_1",
  "title": "Increase user engagement",
  "ownerId": "user_1",
  "dueDate": "2026-03-31",
  "progress": 45,
  "status": "on_track"
}
```

## 使用流程

### 在 Playwright 中使用

```javascript
const { test, expect } = require('@playwright/test');

test('Task 7: 完成 Sprint 任务', async ({ page }) => {
  // 1. 设置 Sprint 任务数据
  await page.request.post('http://localhost:3000/post', {
    data: {
      action: 'set',
      state: {
        projects: [{
          projectId: 'proj_sprint',
          name: 'Sprint 12',
          teamId: 'team_dev',
          color: 'blue'
        }],
        tasks: [{
          taskId: 'task_auth',
          title: 'Implement Authentication',
          projectId: 'proj_sprint',
          assigneeId: 'user_1',
          dueDate: '2026-02-15',
          priority: 'high',
          completed: false
        }]
      }
    }
  });

  // 2. 访问项目页面
  await page.goto('http://localhost:3000/projects/proj_sprint');

  // 3. 找到任务
  await expect(page.locator('text=Implement Authentication')).toBeVisible();

  // 4. 点击完成任务
  await page.click('[data-testid="task-checkbox"]');

  // 5. 验证状态变化
  const response = await page.goto('http://localhost:3000/go');
  const state = await response.json();
  const task = state.current_state.tasks.find(t => t.taskId === 'task_auth');
  expect(task.completed).toBe(true);
});
```

## 功能清单

### 已实现功能

- [x] Home 仪表盘
- [x] My Tasks (我的任务)
- [x] Inbox (收件箱/通知)
- [x] Projects (项目列表)
- [x] Project Detail (项目详情)
- [x] 任务创建/编辑/删除
- [x] 任务完成状态切换
- [x] 任务拖拽排序
- [x] 子任务管理
- [x] 评论功能
- [x] Portfolios (项目组合)
- [x] Goals (目标)
- [x] Teams (团队)
- [x] Search (搜索)
- [x] Settings (设置)

### State Diff 追踪

- [x] 任务变化
- [x] 项目变化
- [x] 通知已读状态

## 重要说明

1. **使用 BrowserRouter**：URL 格式为 `/`, `/my-tasks`, `/projects/:projectId` 等
2. **POST 后需要刷新浏览器**：POST 只修改服务器端状态文件
3. **状态存储在 `.mock-state.json`**：这个文件在项目根目录
4. **默认端口 3000**：与其他 mock 不同，Xsana 使用 3000 端口
