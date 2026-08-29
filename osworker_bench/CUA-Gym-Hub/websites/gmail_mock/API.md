# Xmail Mock - State API Documentation

## Overview

两个简单的端点用于设置和读取状态：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/#/go` | GET | 获取当前状态、初始状态和 diff (注意使用 HashRouter) |
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

#### 1. 设置 Benefits Enrollment 邮件 (Task #6)

```bash
curl -X POST http://localhost:5181/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "state": {
      "emails": [
        {
          "id": "email_hr_benefits",
          "threadId": "thread_hr",
          "from": { "name": "HR Department", "email": "HR@company.com" },
          "to": [{ "name": "John Doe", "email": "john@company.com" }],
          "cc": [],
          "bcc": [],
          "subject": "Benefits Enrollment - Action Required",
          "body": "Please complete the attached Benefits Form.",
          "snippet": "Please complete the attached Benefits Form.",
          "timestamp": "2026-02-09T10:00:00Z",
          "read": false,
          "starred": false,
          "important": true,
          "labels": [],
          "category": "primary",
          "folder": "inbox",
          "attachments": [
            { "id": "attach_1", "name": "Benefits_Form.pdf", "size": "156 KB", "type": "pdf" }
          ]
        }
      ]
    }
  }'
```

#### 2. 设置 Q1 Budget Discussion 线程 (Task #10)

```bash
curl -X POST http://localhost:5181/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "state": {
      "emails": [
        {
          "id": "email_budget_1",
          "threadId": "thread_budget",
          "from": { "name": "Sarah Manager", "email": "sarah@company.com" },
          "to": [{"name": "Demo User", "email": "demo@example.com"}],
          "subject": "Q1 Budget Discussion",
          "body": "I propose we start with $50,000 for the initial phase.",
          "timestamp": "2026-02-07T10:00:00Z",
          "read": true,
          "folder": "inbox",
          "category": "primary"
        },
        {
          "id": "email_budget_2",
          "threadId": "thread_budget",
          "from": { "name": "Mike Chen", "email": "mike@company.com" },
          "to": [{"name": "Demo User", "email": "demo@example.com"}],
          "subject": "Re: Q1 Budget Discussion",
          "body": "I think we should allocate $75,000 to cover the expanded scope.",
          "timestamp": "2026-02-08T10:00:00Z",
          "read": true,
          "folder": "inbox",
          "category": "primary"
        },
        {
          "id": "email_budget_3",
          "threadId": "thread_budget",
          "from": { "name": "Lisa Anderson", "email": "lisa@company.com" },
          "to": [{"name": "Demo User", "email": "demo@example.com"}],
          "subject": "Re: Q1 Budget Discussion",
          "body": "Based on last year, I recommend $62,500 as a balanced approach.",
          "timestamp": "2026-02-09T10:00:00Z",
          "read": true,
          "folder": "inbox",
          "category": "primary"
        }
      ]
    }
  }'
```

#### 3. 重置到默认状态

```bash
curl -X POST http://localhost:5181/post \
  -H "Content-Type: application/json" \
  -d '{"action": "reset"}'
```

## GET /#/go - 查看状态

访问 `http://localhost:5181/#/go` 返回：

```json
{
  "initial_state": { ... },
  "current_state": { ... },
  "state_diff": {
    "newEmails": ["email_id_1"],
    "deletedEmails": ["email_id_2"],
    "modifiedEmails": {
      "email_id_3": {
        "read": { "from": false, "to": true },
        "starred": { "from": false, "to": true }
      }
    }
  }
}
```

## 使用流程

### 方法 1：启动前设置（推荐）

```bash
# 1. 启动服务器
npm run dev -- --port 5181

# 2. POST 设置初始数据
curl -X POST http://localhost:5181/post -H "Content-Type: application/json" -d '...'

# 3. 刷新浏览器（或首次访问）
# 浏览器会自动加载自定义状态
```

### 方法 2：在 Playwright 中使用

```javascript
const { test, expect } = require('@playwright/test');

test('Task 6: Reply to HR Benefits Email', async ({ page }) => {
  // 1. 设置初始数据
  await page.request.post('http://localhost:5181/post', {
    data: {
      action: 'set',
      state: {
        emails: [{
          id: 'email_hr',
          threadId: 'thread_hr',
          from: { name: 'HR Department', email: 'HR@company.com' },
          to: [{ name: 'John Doe', email: 'john@company.com' }],
          subject: 'Benefits Enrollment',
          body: 'Please complete the attached form.',
          timestamp: '2026-02-09T10:00:00Z',
          read: false,
          folder: 'inbox',
          category: 'primary',
          attachments: [{ id: 'att1', name: 'Benefits_Form.pdf', size: '156 KB', type: 'pdf' }]
        }]
      }
    }
  });

  // 2. 访问收件箱
  await page.goto('http://localhost:5181/#/inbox');

  // 3. 找到 HR 邮件
  await expect(page.locator('text=Benefits Enrollment')).toBeVisible();

  // 4. 点击邮件查看
  await page.click('text=Benefits Enrollment');

  // 5. 验证附件
  await expect(page.locator('text=Benefits_Form.pdf')).toBeVisible();
});
```

## 数据结构参考

### Email 结构

```json
{
  "id": "email_xxx",
  "threadId": "thread_xxx",
  "from": { "name": "Sender Name", "email": "sender@example.com", "avatar": "https://..." },
  "to": [{ "name": "Recipient", "email": "recipient@example.com" }],
  "cc": [],
  "bcc": [],
  "subject": "Email Subject",
  "body": "HTML body content",
  "snippet": "Plain text preview",
  "timestamp": "2026-02-09T10:00:00Z",
  "read": false,
  "starred": false,
  "important": false,
  "labels": ["l1"],
  "category": "primary",
  "folder": "inbox",
  "attachments": [
    { "id": "attach_1", "name": "file.pdf", "size": "2.4 MB", "type": "pdf", "url": "https://..." }
  ]
}
```

### 文件夹类型

| folder | 描述 |
|--------|------|
| inbox | 收件箱 |
| sent | 已发送 |
| drafts | 草稿 |
| spam | 垃圾邮件 |
| trash | 回收站 |
| all-mail | 所有邮件 |

### 类别（Category）

| category | 描述 |
|----------|------|
| primary | 主要（默认标签页） |
| social | 社交 |
| promotions | 促销 |

### 默认标签

| id | name | color |
|----|------|-------|
| l1 | Work | #ef4444 (红色) |
| l2 | Personal | #3b82f6 (蓝色) |
| l3 | Travel | #22c55e (绿色) |
| l4 | Finance | #eab308 (黄色) |

## 功能清单

### 已实现功能

- [x] 邮件列表（按文件夹/标签过滤）
- [x] 邮件线程视图
- [x] 撰写新邮件
- [x] 回复邮件
- [x] 草稿自动保存
- [x] 星标/重要标记
- [x] 标签管理
- [x] 搜索（支持 from:, has:attachment, is:starred 等）
- [x] 批量操作（存档、删除、标签）
- [x] 附件上传（模拟）
- [x] 键盘快捷键（C: 撰写, /: 搜索, E: 存档, #: 删除）
- [x] 分类标签页（Primary, Social, Promotions）

### State Diff 追踪

- [x] 新增邮件
- [x] 删除邮件
- [x] 已读/未读状态变化
- [x] 星标变化
- [x] 重要标记变化
- [x] 文件夹变化
- [x] 标签变化

## 重要说明

1. **使用 HashRouter**：URL 格式为 `/#/inbox`，不是 `/inbox`
2. **POST 后需要刷新浏览器**：POST 只修改服务器端状态文件
3. **状态存储在 `.mock-state.json`**：这个文件在项目根目录
4. **自定义 emails 会完全替换默认 emails**：不会合并
