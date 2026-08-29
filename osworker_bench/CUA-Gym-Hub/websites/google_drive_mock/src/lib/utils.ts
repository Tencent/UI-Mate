import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FileSystemItem } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getFileIcon(type: string) {
  // This helper will be used in components to decide which icon to show
  // Returning generic types for mapping to Lucide icons
  return type;
}

export function downloadDriveItem(item: FileSystemItem) {
  let blob: Blob;
  let filename = item.name;

  if (item.type === 'folder') {
    filename = `${item.name.replace(/\s+/g, '_')}-manifest.json`;
    blob = new Blob([JSON.stringify({
      id: item.id,
      name: item.name,
      type: item.type,
      createdAt: new Date(item.createdAt).toISOString(),
      modifiedAt: new Date(item.modifiedAt).toISOString(),
      sharedWith: item.sharedWith,
      starred: item.starred
    }, null, 2)], { type: 'application/json' });
  } else if (item.thumbnailUrl?.startsWith('data:')) {
    const [meta, data] = item.thumbnailUrl.split(',');
    const mime = meta.match(/data:(.*?);/)?.[1] || 'application/octet-stream';
    const binary = atob(data || '');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    blob = new Blob([bytes], { type: mime });
  } else {
    const content = item.content || `${item.name}\n\nMock Drive local download.\n`;
    const type = item.type === 'pdf' ? 'application/pdf' : 'text/plain';
    blob = new Blob([content], { type });
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Alias kept for callers that import the older name.
export const downloadItem = downloadDriveItem;
