import React from 'react';
import { FileSystemItem } from '../lib/types';

interface FileTypeIconProps {
  item: FileSystemItem;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { icon: 16, container: 20 },
  md: { icon: 20, container: 24 },
  lg: { icon: 40, container: 48 },
};

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ item, size = 'md', className = '' }) => {
  const s = sizeMap[size];
  const w = s.icon;
  const h = s.icon;

  // Use folder's custom color if set
  const folderColor = item.color || '#5F6368';

  switch (item.type) {
    case 'folder':
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" fill={folderColor}/>
        </svg>
      );

    case 'doc':
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <rect x="3" y="2" width="18" height="20" rx="2" fill="#4285F4"/>
          <rect x="7" y="8" width="10" height="1.5" rx="0.75" fill="white"/>
          <rect x="7" y="11" width="10" height="1.5" rx="0.75" fill="white"/>
          <rect x="7" y="14" width="7" height="1.5" rx="0.75" fill="white"/>
        </svg>
      );

    case 'spreadsheet':
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <rect x="3" y="2" width="18" height="20" rx="2" fill="#0F9D58"/>
          <rect x="6" y="7" width="12" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
          <rect x="6" y="10.5" width="12" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
          <rect x="6" y="14" width="12" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
          <line x1="12" y1="6" x2="12" y2="17" stroke="white" strokeWidth="0.8" opacity="0.7"/>
        </svg>
      );

    case 'presentation':
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <rect x="3" y="2" width="18" height="20" rx="2" fill="#F4B400"/>
          <rect x="6" y="6" width="12" height="8" rx="1" fill="white" opacity="0.9"/>
          <rect x="9" y="16" width="6" height="1.5" rx="0.75" fill="white" opacity="0.8"/>
        </svg>
      );

    case 'form':
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <rect x="3" y="2" width="18" height="20" rx="2" fill="#7627BB"/>
          <rect x="7" y="7" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
          <rect x="13" y="8" width="5" height="1.5" rx="0.75" fill="white" opacity="0.8"/>
          <rect x="7" y="13" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
          <rect x="13" y="14" width="5" height="1.5" rx="0.75" fill="white" opacity="0.8"/>
        </svg>
      );

    case 'pdf':
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <rect x="3" y="2" width="18" height="20" rx="2" fill="#EA4335"/>
          <text x="12" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">PDF</text>
        </svg>
      );

    case 'image':
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <rect x="2" y="4" width="20" height="16" rx="2" fill="#EA4335"/>
          <circle cx="8" cy="9" r="2" fill="white" opacity="0.9"/>
          <path d="M2 18l5-6 4 5 3-3 6 7H2z" fill="white" opacity="0.85"/>
        </svg>
      );

    case 'video':
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <rect x="2" y="4" width="20" height="16" rx="2" fill="#EA4335"/>
          <path d="M10 9l6 3-6 3V9z" fill="white"/>
        </svg>
      );

    case 'audio':
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <rect x="2" y="4" width="20" height="16" rx="2" fill="#FF7537"/>
          <path d="M12 7a5 5 0 010 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z" fill="white"/>
          <circle cx="12" cy="12" r="1.5" fill="white"/>
        </svg>
      );

    case 'text':
    case 'code':
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <rect x="3" y="2" width="18" height="20" rx="2" fill="#4285F4"/>
          <rect x="7" y="7" width="10" height="1.2" rx="0.6" fill="white"/>
          <rect x="7" y="10" width="10" height="1.2" rx="0.6" fill="white"/>
          <rect x="7" y="13" width="8" height="1.2" rx="0.6" fill="white"/>
          <rect x="7" y="16" width="6" height="1.2" rx="0.6" fill="white"/>
        </svg>
      );

    case 'archive':
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <rect x="3" y="2" width="18" height="20" rx="2" fill="#5F6368"/>
          <rect x="9" y="2" width="6" height="4" fill="#78909C"/>
          <rect x="9" y="5" width="6" height="2" fill="#5F6368"/>
          <rect x="7" y="11" width="10" height="1.5" rx="0.5" fill="white" opacity="0.7"/>
          <rect x="7" y="14" width="10" height="1.5" rx="0.5" fill="white" opacity="0.7"/>
        </svg>
      );

    default:
      return (
        <svg width={w} height={h} viewBox="0 0 24 24" className={className}>
          <rect x="3" y="2" width="18" height="20" rx="2" fill="#9E9E9E"/>
          <rect x="7" y="9" width="10" height="1.5" rx="0.75" fill="white"/>
          <rect x="7" y="12.5" width="7" height="1.5" rx="0.75" fill="white"/>
        </svg>
      );
  }
};
