# trello_mock Schema

**Deploy order**: 49 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8049)
**Base URL**: `http://172.17.46.46:8049/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | string | Active user ID (default: `"u1"`) |
| `users` | object | Map of userId → user object (see below) |
| `boards` | object | Map of boardId → board object (see below) |
| `lists` | object | Map of listId → list object (see below) |
| `cards` | object | Map of cardId → card object (see below) |
| `boardOrder` | string[] | Ordered array of boardIds for home page display |
| `lastReadNotificationAt` | ISO string \| null | Timestamp when notifications were last marked as read |

### User object
`id`, `name`, `username`, `initials`, `email`, `avatarUrl` (string, may be empty)

### Board object
`id`, `title`, `description` (markdown string), `background` (hex color string), `listIds` (string[]), `starred` (bool), `visibility` (`"private"` \| `"workspace"` \| `"public"`), `archivedListIds` (string[]), `archivedCardIds` (string[]), `labels` (array of `{id, name, color}`), `memberIds` (string[]), `lastVisitedAt` (ISO string), `closed` (bool), `createdAt` (ISO string)

### List object
`id`, `title`, `boardId`, `cardIds` (string[]), `archived` (bool)

### Card object
`id`, `title`, `description` (markdown string), `listId`, `boardId`, `labelIds` (string[]), `memberIds` (string[]), `dueDate` (ISO string | null), `startDate` (ISO string | null), `completed` (bool), `cover` (`{type:"color"|"image", value:string}` | null), `checklists` (array of `{id, title, items:[{id,text,completed,assigneeId,dueDate}]}`), `comments` (array of comment objects), `attachments` (array of `{id,name,url,uploadedAt,uploadedBy}`), `archived` (bool), `watching` (bool), `position` (int), `createdAt` (ISO string)

### Comment object
`id`, `userId`, `text`, `type` (`"comment"` | `"activity"`), `createdAt` (ISO string), `editedAt` (ISO string | null)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Board list home page (displays starred boards, recently viewed, and all workspaces) |
| `/board/:boardId` | Individual board view with lists and cards |
| `/go` | Debug state inspection page |

## Available Reducer Actions

### Board Management
- `ADD_BOARD` - Create new board (`{title, background, visibility}`)
- `UPDATE_BOARD` - Update board field (`{boardId, field, value}`)

### List Management
- `ADD_LIST` - Create new list in board (`{title, boardId}`)
- `UPDATE_LIST_TITLE` - Rename list (`{listId, title}`)
- `ARCHIVE_LIST` - Archive list (`{listId, boardId}`)
- `RESTORE_LIST` - Restore archived list (`{listId, boardId}`)
- `SORT_LIST` - Sort cards in list (`{listId, type: "title"|"date"}`)
- `MOVE_LIST` - Reorder list in board (`{sourceIndex, destinationIndex, boardId}`)
- `MOVE_ALL_CARDS` - Move all cards from one list to another (`{srcListId, destListId}`)
- `COPY_LIST` - Duplicate list with all cards (`{listId, boardId, newTitle}`)

### Card Management
- `ADD_CARD` - Create new card (`{title, listId, boardId, description?, labelIds?, memberIds?, dueDate?, checklists?, cover?, watching?}`)
- `UPDATE_CARD` - Update card field (`{cardId, field, value}`)
- `MOVE_CARD` - Drag-and-drop card between lists (internal drag-drop action)
- `MOVE_CARD_TO_LIST` - Move card via modal picker (`{cardId, srcListId, destListId, destBoardId}`)
- `ARCHIVE_CARD` - Archive card (`{cardId, listId}`)
- `RESTORE_CARD` - Restore archived card (`{cardId, listId}`)

### Comments & Activity
- `ADD_COMMENT` - Add user comment to card (`{cardId, text}`)
- `EDIT_COMMENT` - Edit existing comment (`{cardId, commentId, text}`)
- `DELETE_COMMENT` - Delete comment (`{cardId, commentId}`)

### Checklists
- `ADD_CHECKLIST` - Create checklist on card (`{cardId, title}`)
- `DELETE_CHECKLIST` - Delete checklist (`{cardId, checklistId}`)
- `ADD_CHECKLIST_ITEM` - Add item to checklist (`{cardId, checklistId, text}`)
- `TOGGLE_CHECKLIST_ITEM` - Check/uncheck checklist item (`{cardId, checklistId, itemId}`)

### Members & Labels
- `TOGGLE_MEMBER` - Add/remove member from card (`{cardId, memberId}`)
- `TOGGLE_LABEL` - Add/remove label from card (`{cardId, labelId}`)
- `UPDATE_BOARD_LABEL` - Update board-level label (`{boardId, label}`)
- `ADD_BOARD_LABEL` - Create new board label (`{boardId, name, color}`)

### Attachments
- `ADD_ATTACHMENT` - Add attachment to card (`{cardId, name, url}`)
- `DELETE_ATTACHMENT` - Remove attachment (`{cardId, attachmentId}`)

### Notifications
- `MARK_NOTIFICATIONS_READ` - Update `lastReadNotificationAt` timestamp

### State Management
- `SET_STATE` - Replace entire state (internal use for initialization/injection)

## Default Data Summary

- 4 users: u1 (Alice), u2 (Bob), u3 (Charlie), u4 (Diana)
- 3 boards: `board-1` "Project Alpha" (lists 1-4), `board-2` "Marketing Campaign" (lists 5-7), `board-3` "Personal Tasks" (lists 8-9)
- 9 lists total; 14 cards total (card-1 through card-14)

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8049/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "currentUser": "u1",
        "users": {
          "u1": {"id":"u1","name":"Alice Johnson","username":"alice","initials":"AJ","email":"alice@example.com","avatarUrl":""}
        },
        "boards": {
          "board-1": {
            "id":"board-1","title":"Project Alpha","description":"","background":"#0079BF",
            "listIds":["list-1","list-2"],"starred":false,"visibility":"workspace",
            "archivedListIds":[],"archivedCardIds":[],"labels":[],"memberIds":["u1"],"createdAt":"2025-01-15T10:00:00.000Z"
          }
        },
        "lists": {
          "list-1": {"id":"list-1","title":"To Do","boardId":"board-1","cardIds":["card-1"],"archived":false},
          "list-2": {"id":"list-2","title":"Done","boardId":"board-1","cardIds":[],"archived":false}
        },
        "cards": {
          "card-1": {
            "id":"card-1","title":"Write report","description":"","listId":"list-1","boardId":"board-1",
            "labelIds":[],"memberIds":[],"dueDate":null,"startDate":null,"completed":false,"cover":null,
            "checklists":[],"comments":[],"attachments":[],"archived":false,"watching":false,"position":0,"createdAt":"2025-01-20T10:00:00.000Z"
          }
        },
        "boardOrder": ["board-1"]
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

### Board Actions
| User Action | Changed State Fields |
|-------------|---------------------|
| Star/unstar board | `boards[boardId].starred` flips |
| Change board title | `boards[boardId].title` updates |
| Change board description | `boards[boardId].description` updates |
| Change board visibility | `boards[boardId].visibility` changes to `"private"` \| `"workspace"` \| `"public"` |
| Update board background | `boards[boardId].background` changes |
| Add new board | `boards` gains new entry; `boardOrder` prepends new boardId |
| Close board | `boards[boardId].closed` = true |
| Visit board | `boards[boardId].lastVisitedAt` updates to current timestamp |

### List Actions
| User Action | Changed State Fields |
|-------------|---------------------|
| Add list to board | `lists` gains new entry; `boards[boardId].listIds` appends new id |
| Rename list | `lists[listId].title` updates |
| Archive list | `lists[listId].archived` = true; `boards[boardId].listIds` removes id; `boards[boardId].archivedListIds` appends id |
| Restore list | `lists[listId].archived` = false; `boards[boardId].listIds` appends id; `boards[boardId].archivedListIds` removes id |
| Reorder list | `boards[boardId].listIds` array reordered |
| Sort list | `lists[listId].cardIds` array reordered by title or date |
| Move all cards from list | All affected `cards[cardId].listId` change; `lists[srcListId].cardIds` empties; `lists[destListId].cardIds` gains all ids |
| Copy list | New `lists` entry created; new `cards` entries created with copies of all cards |

### Card Actions
| User Action | Changed State Fields |
|-------------|---------------------|
| Add card to list | `cards` gains new entry with activity; `lists[listId].cardIds` appends new id |
| Update card title | `cards[cardId].title` changes |
| Update card description | `cards[cardId].description` changes |
| Move card between lists (drag) | `lists[srcListId].cardIds` removes id; `lists[destListId].cardIds` adds id; `cards[cardId].listId` changes; activity logged |
| Move card between lists (modal) | Same as drag; `cards[cardId].boardId` may also change if moving across boards |
| Archive card | `cards[cardId].archived` = true; `lists[listId].cardIds` removes id; `boards[boardId].archivedCardIds` appends id; activity logged |
| Restore card | `cards[cardId].archived` = false; `lists[listId].cardIds` appends id; `boards[boardId].archivedCardIds` removes id; activity logged |
| Copy card | New `cards` entry created with pre-filled data; `lists[listId].cardIds` appends new id |
| Watch/unwatch card | `cards[cardId].watching` toggles |

### Card Detail Actions
| User Action | Changed State Fields |
|-------------|---------------------|
| Update card due date | `cards[cardId].dueDate` changes; activity logged |
| Remove due date | `cards[cardId].dueDate` = null; `cards[cardId].completed` = false |
| Mark card complete | `cards[cardId].completed` = true; activity logged |
| Mark card incomplete | `cards[cardId].completed` = false; activity logged |
| Set card cover (color) | `cards[cardId].cover` = `{type:"color", value:"#hex"}` |
| Set card cover (image) | `cards[cardId].cover` = `{type:"image", value:"url"}` |
| Remove card cover | `cards[cardId].cover` = null |
| Toggle label on card | `cards[cardId].labelIds` gains/loses labelId; activity logged |
| Toggle member on card | `cards[cardId].memberIds` gains/loses memberId; activity logged |
| Add attachment | `cards[cardId].attachments` gains new entry; activity logged |
| Delete attachment | `cards[cardId].attachments` loses entry; activity logged |

### Checklist Actions
| User Action | Changed State Fields |
|-------------|---------------------|
| Add checklist | `cards[cardId].checklists` gains new entry; activity logged |
| Delete checklist | `cards[cardId].checklists` loses entry by id; activity logged |
| Add checklist item | `cards[cardId].checklists[n].items` gains new item |
| Toggle checklist item | `cards[cardId].checklists[n].items[m].completed` flips; activity logged |

### Comment Actions
| User Action | Changed State Fields |
|-------------|---------------------|
| Add comment | `cards[cardId].comments` prepends new comment (type="comment") |
| Edit comment | `cards[cardId].comments[m].text` updates; `cards[cardId].comments[m].editedAt` set to timestamp |
| Delete comment | `cards[cardId].comments` loses entry; activity prepended ("deleted a comment") |

### Label Actions
| User Action | Changed State Fields |
|-------------|---------------------|
| Create board label | `boards[boardId].labels` gains new entry |
| Update board label | `boards[boardId].labels[n]` fields update (name, color) |

### Notification Actions
| User Action | Changed State Fields |
|-------------|---------------------|
| Open notifications panel | `state.lastReadNotificationAt` updates to current timestamp |

### Activity/Comment Additions
Most card state mutations automatically add an activity entry to `cards[cardId].comments` with:
- `type: "activity"`
- `userId: currentUser`
- `text: <descriptive action text>`
- `createdAt: <ISO timestamp>`
