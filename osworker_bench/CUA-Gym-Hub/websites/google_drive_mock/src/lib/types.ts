export type FileType = 'folder' | 'image' | 'pdf' | 'doc' | 'spreadsheet' | 'presentation' | 'form' | 'video' | 'audio' | 'text' | 'code' | 'archive' | 'unknown';

export interface SharedUser {
  userId: string;
  role: 'viewer' | 'commenter' | 'editor';
  addedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface FileSystemItem {
  id: string;
  parentId: string | null;
  name: string;
  type: FileType;
  mimeType?: string;
  size: number; // in bytes
  ownerId: string;
  sharedWith: SharedUser[];
  starred: boolean;
  trashed: boolean;
  color?: string | null;
  createdAt: number; // timestamp
  modifiedAt: number; // timestamp
  accessedAt: number; // timestamp
  description?: string;
  thumbnailUrl?: string | null;
  content?: string | null;
}

export interface AppState {
  items: Record<string, FileSystemItem>;
  users: Record<string, User>;
  currentUser: User;
  viewMode: 'grid' | 'list';
  sortConfig: {
    key: 'name' | 'modifiedAt' | 'size' | 'type';
    direction: 'asc' | 'desc';
  };
  uploadQueue: UploadItem[];
  storageUsed: number;
  storageTotal: number;
  selectedItems: string[];
}

export interface UploadItem {
  id: string;
  name: string;
  progress: number; // 0-100
  status: 'uploading' | 'completed' | 'error';
}

export interface StateDiff {
  added: string[];
  modified: string[];
  deleted: string[];
}
