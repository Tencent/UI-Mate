# Xoogle Drive Mock — Data Model

> For use by dev agent when implementing `createInitialData()` in dataManager / FileSystemContext

## Entity Types

### FileSystemItem
The core entity. Represents both files and folders.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique ID | `"file_001"`, `"folder_001"` |
| `parentId` | `string \| null` | Parent folder ID. `null` = root (My Drive) | `"folder_001"` |
| `name` | `string` | Display name with extension | `"Q4 Report.pdf"` |
| `type` | `FileType` | File category | `"folder"`, `"pdf"`, `"doc"`, `"spreadsheet"`, `"presentation"`, `"image"`, `"video"`, `"audio"`, `"unknown"` |
| `mimeType` | `string` | MIME type string | `"application/vnd.google-apps.folder"`, `"application/pdf"` |
| `size` | `number` | Size in bytes (0 for folders, Google Docs) | `2457600` |
| `ownerId` | `string` | Owner user ID | `"user_001"` |
| `sharedWith` | `SharedUser[]` | Users this item is shared with | See SharedUser below |
| `starred` | `boolean` | Whether current user starred this | `true` |
| `trashed` | `boolean` | Whether item is in Trash | `false` |
| `color` | `string \| null` | Folder color (folders only) | `null`, `"#4285F4"`, `"#0B8043"` |
| `createdAt` | `string` | ISO 8601 creation timestamp | `"2025-11-15T10:30:00Z"` |
| `modifiedAt` | `string` | ISO 8601 last modified timestamp | `"2026-02-20T14:22:00Z"` |
| `accessedAt` | `string` | ISO 8601 last accessed timestamp | `"2026-03-07T09:15:00Z"` |
| `description` | `string` | Optional file description | `""` |
| `thumbnailUrl` | `string \| null` | Preview thumbnail URL | `null` (use type-based icon) |
| `content` | `string \| null` | Text content for text/code files | `"Hello world..."` |

### SharedUser
Represents a sharing permission entry.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `userId` | `string` | User ID | `"user_002"` |
| `role` | `"viewer" \| "commenter" \| "editor"` | Permission level | `"editor"` |
| `addedAt` | `string` | When sharing was added | `"2026-01-10T08:00:00Z"` |

### User
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique user ID | `"user_001"` |
| `name` | `string` | Full display name | `"Alex Johnson"` |
| `email` | `string` | Email address | `"alex.johnson@company.com"` |
| `avatar` | `string` | Avatar URL or initials fallback | `"https://ui-avatars.com/api/?name=Alex+Johnson&background=1A73E8&color=fff"` |

### UploadItem
Transient state for upload progress tracking.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique upload ID | `"upload_001"` |
| `name` | `string` | Filename being uploaded | `"presentation.pptx"` |
| `progress` | `number` | 0-100 percentage | `45` |
| `status` | `"uploading" \| "completed" \| "error"` | Current state | `"uploading"` |

## FileType Enum Values
```
"folder" | "doc" | "spreadsheet" | "presentation" | "form" | "pdf" | "image" | "video" | "audio" | "text" | "code" | "archive" | "unknown"
```

### MIME Type Mapping (for display icons/colors)
| FileType | MIME Type | Icon Color |
|----------|----------|------------|
| `folder` | `application/vnd.google-apps.folder` | `#5F6368` (gray) |
| `doc` | `application/vnd.google-apps.document` | `#4285F4` (blue) |
| `spreadsheet` | `application/vnd.google-apps.spreadsheet` | `#0F9D58` (green) |
| `presentation` | `application/vnd.google-apps.presentation` | `#F4B400` (yellow) |
| `form` | `application/vnd.google-apps.form` | `#7627BB` (purple) |
| `pdf` | `application/pdf` | `#EA4335` (red) |
| `image` | `image/*` | `#EA4335` (red) |
| `video` | `video/*` | `#EA4335` (red) |
| `audio` | `audio/*` | `#EA4335` (red) |
| `text` | `text/plain` | `#4285F4` (blue) |
| `archive` | `application/zip` | `#5F6368` (gray) |

## AppState Shape

```typescript
interface AppState {
  items: Record<string, FileSystemItem>;
  users: Record<string, User>;
  currentUser: User;
  viewMode: 'grid' | 'list';
  sortConfig: {
    key: 'name' | 'modifiedAt' | 'size' | 'type';
    direction: 'asc' | 'desc';
  };
  uploadQueue: UploadItem[];
  storageUsed: number;       // bytes
  storageTotal: number;      // bytes (15 GB = 16106127360)
  selectedItems: string[];   // array of item IDs for multi-select
}
```

## Relationships

```
User (1) ──owns──> (N) FileSystemItem
FileSystemItem (1) ──parentId──> (1) FileSystemItem [folder]
FileSystemItem (1) ──sharedWith──> (N) SharedUser ──userId──> User
```

- Root items have `parentId: null` (direct children of "My Drive")
- Folders can contain folders (recursive nesting)
- `sharedWith` array on each item tracks per-user permissions
- `ownerId` references a User; for "Shared with me" view, filter items where `ownerId !== currentUser.id && sharedWith.some(s => s.userId === currentUser.id)`

## createInitialData() Structure

```javascript
function createInitialData() {
  return {
    currentUser: {
      id: "user_001",
      name: "Alex Johnson",
      email: "alex.johnson@company.com",
      avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=1A73E8&color=fff"
    },
    users: {
      "user_001": { /* currentUser */ },
      "user_002": { id: "user_002", name: "Sarah Chen", email: "sarah.chen@company.com", avatar: "..." },
      "user_003": { id: "user_003", name: "Mike Williams", email: "mike.williams@company.com", avatar: "..." },
      "user_004": { id: "user_004", name: "Emily Davis", email: "emily.davis@gmail.com", avatar: "..." },
      "user_005": { id: "user_005", name: "James Wilson", email: "james.wilson@company.com", avatar: "..." }
    },
    items: {
      // === ROOT FOLDERS (parentId: null) ===
      "folder_001": { id: "folder_001", parentId: null, name: "Work Projects", type: "folder", mimeType: "application/vnd.google-apps.folder", size: 0, ownerId: "user_001", sharedWith: [{userId: "user_002", role: "editor", addedAt: "..."}], starred: true, trashed: false, color: "#4285F4", createdAt: "2025-06-01T...", modifiedAt: "2026-03-01T...", accessedAt: "2026-03-07T..." },
      "folder_002": { /* "Personal" folder */ },
      "folder_003": { /* "Photos" folder, starred */ },
      "folder_004": { /* "Shared Documents" folder */ },

      // === NESTED FOLDERS ===
      "folder_005": { parentId: "folder_001", name: "Q4 Reports", /* ... */ },
      "folder_006": { parentId: "folder_001", name: "Design Assets", /* ... */ },
      "folder_007": { parentId: "folder_002", name: "Taxes 2025", /* ... */ },

      // === GOOGLE WORKSPACE FILES (size: 0, owned by current user) ===
      "file_001": { parentId: "folder_001", name: "Project Roadmap", type: "doc", mimeType: "application/vnd.google-apps.document", size: 0, ownerId: "user_001", sharedWith: [{userId:"user_002",role:"editor"},{userId:"user_003",role:"viewer"}], starred: false, trashed: false, modifiedAt: "2026-03-06T..." },
      "file_002": { parentId: "folder_001", name: "Budget 2026", type: "spreadsheet", mimeType: "application/vnd.google-apps.spreadsheet", size: 0, starred: true, /* ... */ },
      "file_003": { parentId: "folder_005", name: "Q4 Revenue Analysis", type: "spreadsheet", /* ... */ },
      "file_004": { parentId: "folder_001", name: "Team Standup Notes", type: "doc", /* ... */ },
      "file_005": { parentId: null, name: "Product Launch Deck", type: "presentation", mimeType: "application/vnd.google-apps.presentation", size: 0, sharedWith: [{userId:"user_002",role:"editor"},{userId:"user_005",role:"viewer"}], starred: false, /* ... */ },

      // === UPLOADED FILES (have real sizes) ===
      "file_006": { parentId: "folder_005", name: "Q4_Financial_Report.pdf", type: "pdf", size: 2457600, /* 2.4 MB */ },
      "file_007": { parentId: "folder_003", name: "vacation_photo_01.jpg", type: "image", size: 3145728, thumbnailUrl: "https://picsum.photos/seed/vacation1/400/300" },
      "file_008": { parentId: "folder_003", name: "vacation_photo_02.jpg", type: "image", size: 2867200, thumbnailUrl: "https://picsum.photos/seed/vacation2/400/300" },
      "file_009": { parentId: "folder_006", name: "logo_final.png", type: "image", size: 524288, thumbnailUrl: "https://picsum.photos/seed/logo/400/300" },
      "file_010": { parentId: null, name: "meeting_recording.mp4", type: "video", size: 52428800, /* 50 MB */ },
      "file_011": { parentId: "folder_002", name: "resume_2026.pdf", type: "pdf", size: 184320, starred: true },
      "file_012": { parentId: "folder_007", name: "tax_return_2025.pdf", type: "pdf", size: 1048576 },
      "file_013": { parentId: null, name: "notes.txt", type: "text", size: 2048, content: "Meeting notes from March 3rd\n- Discussed Q1 targets\n- Action items assigned\n- Follow up next week" },
      "file_014": { parentId: null, name: "project_archive.zip", type: "archive", size: 10485760 },

      // === SHARED WITH ME (owned by other users) ===
      "file_015": { parentId: null, name: "Marketing Strategy 2026", type: "doc", ownerId: "user_002", sharedWith: [{userId:"user_001",role:"editor"}], /* ... */ },
      "file_016": { parentId: null, name: "Company Handbook", type: "pdf", ownerId: "user_003", sharedWith: [{userId:"user_001",role:"viewer"}], size: 5242880 },
      "file_017": { parentId: null, name: "Team Photo Album", type: "folder", ownerId: "user_004", sharedWith: [{userId:"user_001",role:"viewer"}] },
      "file_018": { parentId: null, name: "Sales Dashboard", type: "spreadsheet", ownerId: "user_005", sharedWith: [{userId:"user_001",role:"commenter"}] },

      // === TRASHED ITEMS ===
      "file_019": { parentId: null, name: "Old_Draft.txt", type: "text", trashed: true, size: 1024 },
      "file_020": { parentId: null, name: "Untitled Document", type: "doc", trashed: true, size: 0 },
      "file_021": { parentId: null, name: "Screenshot_2025.png", type: "image", trashed: true, size: 786432 }
    },
    viewMode: "list",
    sortConfig: { key: "name", direction: "asc" },
    uploadQueue: [],
    storageUsed: 9876543210,   // ~9.2 GB
    storageTotal: 16106127360, // 15 GB
    selectedItems: []
  };
}
```

## Computed Views (derived from state, not stored)

| View | Logic |
|------|-------|
| My Drive (root) | `items where parentId === null && !trashed && ownerId === currentUser.id` |
| Folder contents | `items where parentId === folderId && !trashed` |
| Shared with me | `items where ownerId !== currentUser.id && sharedWith includes currentUser.id && !trashed` |
| Starred | `items where starred === true && !trashed` |
| Recent | `items where type !== "folder" && !trashed`, sorted by `accessedAt` desc, limit 20 |
| Trash | `items where trashed === true` |
| Search | `items where name.toLowerCase().includes(query) && !trashed` |

## Storage Calculation
`storageUsed = sum of all non-trashed items' size where ownerId === currentUser.id`
(Google Workspace files like Docs/Sheets/Slides have size 0 and don't count toward quota)
