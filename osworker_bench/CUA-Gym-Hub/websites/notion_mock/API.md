# Xotion Mock - State API Documentation

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

#### 1. 设置预算汇总页面 (Task #10)

```bash
curl -X POST http://localhost:5173/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "state": {
      "pages": {
        "page_budget": {
          "id": "page_budget",
          "title": "Q1 Budget Summary",
          "icon": "💰",
          "cover": null,
          "parentId": null,
          "blockIds": ["block_1", "block_2", "block_3"],
          "createdDate": "2026-02-09T10:00:00Z",
          "properties": {}
        }
      },
      "blocks": {
        "block_1": {
          "id": "block_1",
          "type": "heading_1",
          "content": "Q1 2026 Budget Proposals",
          "properties": {}
        },
        "block_2": {
          "id": "block_2",
          "type": "paragraph",
          "content": "Summary of budget proposals from the team:",
          "properties": {}
        },
        "block_3": {
          "id": "block_3",
          "type": "bulleted_list",
          "content": "• Sarah: $50,000\n• Mike: $75,000\n• Lisa: $62,500",
          "properties": {}
        }
      }
    }
  }'
```

#### 2. 设置项目看板数据库

```bash
curl -X POST http://localhost:5173/post \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "state": {
      "pages": {
        "db_projects": {
          "id": "db_projects",
          "title": "Projects",
          "icon": "📊",
          "type": "database",
          "items": ["item_1", "item_2"],
          "properties": {
            "Status": { "type": "select", "options": ["Todo", "In Progress", "Done"] },
            "Priority": { "type": "select", "options": ["High", "Medium", "Low"] }
          }
        },
        "item_1": {
          "id": "item_1",
          "title": "Design Review",
          "parentId": "db_projects",
          "properties": {
            "Status": "In Progress",
            "Priority": "High"
          }
        },
        "item_2": {
          "id": "item_2",
          "title": "API Integration",
          "parentId": "db_projects",
          "properties": {
            "Status": "Todo",
            "Priority": "Medium"
          }
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
    "pagesChanged": 2,
    "blocksChanged": 5,
    "modifiedPages": ["page_1"],
    "modifiedBlocks": ["block_1", "block_2"],
    "lastActive": "2026-02-09T10:00:00Z"
  }
}
```

## 数据结构参考

### Page 结构

```json
{
  "id": "page_1",
  "title": "My Page",
  "icon": "📝",
  "cover": "https://...",
  "parentId": null,
  "blockIds": ["block_1", "block_2"],
  "createdDate": "2026-02-09T10:00:00Z",
  "lastEditedDate": "2026-02-09T11:00:00Z",
  "properties": {}
}
```

### Block 结构

```json
{
  "id": "block_1",
  "type": "paragraph",
  "content": "This is paragraph text",
  "properties": {},
  "createdDate": "2026-02-09T10:00:00Z"
}
```

### Block 类型

| type | 描述 |
|------|------|
| paragraph | 段落文本 |
| heading_1 | 一级标题 |
| heading_2 | 二级标题 |
| heading_3 | 三级标题 |
| bulleted_list | 无序列表 |
| numbered_list | 有序列表 |
| toggle | 折叠块 |
| quote | 引用 |
| divider | 分隔线 |
| callout | 提示框 |
| code | 代码块 |
| image | 图片 |

### Database Page 结构

```json
{
  "id": "db_1",
  "title": "Tasks Database",
  "type": "database",
  "icon": "📋",
  "items": ["item_1", "item_2"],
  "properties": {
    "Status": {
      "type": "select",
      "options": ["Todo", "In Progress", "Done"]
    },
    "Priority": {
      "type": "select",
      "options": ["High", "Medium", "Low"]
    },
    "Due Date": {
      "type": "date"
    }
  }
}
```

### Workspace 结构

```json
{
  "id": "workspace_1",
  "name": "My Workspace",
  "icon": "🏠",
  "pages": ["page_1", "page_2"]
}
```

## 使用流程

### 在 Playwright 中使用

```javascript
const { test, expect } = require('@playwright/test');

test('Task 10: 创建预算汇总页面', async ({ page }) => {
  // 1. 设置初始数据（空白页面用于创建汇总）
  await page.request.post('http://localhost:5173/post', {
    data: {
      action: 'set',
      state: {
        pages: {
          page_budget: {
            id: 'page_budget',
            title: 'Q1 Budget Summary',
            icon: '💰',
            parentId: null,
            blockIds: [],
            createdDate: new Date().toISOString()
          }
        },
        blocks: {}
      }
    }
  });

  // 2. 访问页面
  await page.goto('http://localhost:5173/page/page_budget');

  // 3. 验证页面标题
  await expect(page.locator('text=Q1 Budget Summary')).toBeVisible();

  // 4. 添加内容块
  await page.click('[data-testid="add-block"]');
  await page.fill('[contenteditable="true"]', 'Budget proposals from email thread:');

  // 5. 添加列表
  await page.keyboard.press('Enter');
  await page.fill('[contenteditable="true"]', '• Sarah: $50,000');

  // 6. 验证状态变化
  const response = await page.goto('http://localhost:5173/go');
  const state = await response.json();
  expect(state.state_diff.blocksChanged).toBeGreaterThan(0);
});
```

## 功能清单

### 已实现功能

- [x] 页面创建/删除
- [x] 页面标题编辑
- [x] 页面图标设置
- [x] Block 添加/删除/编辑
- [x] Block 类型切换
- [x] Block 拖拽排序
- [x] 侧边栏导航
- [x] 页面搜索

### State Diff 追踪

- [x] 页面数量变化
- [x] Block 数量变化
- [x] 修改的页面列表
- [x] 修改的 Block 列表

## 重要说明

1. **使用 BrowserRouter**：URL 格式为 `/page/:pageId`
2. **POST 后需要刷新浏览器**：POST 只修改服务器端状态文件
3. **状态存储在 `.mock-state.json`**：这个文件在项目根目录
4. **页面 ID 需要有效**：访问 `/page/xxx` 时，xxx 必须是存在的页面 ID
