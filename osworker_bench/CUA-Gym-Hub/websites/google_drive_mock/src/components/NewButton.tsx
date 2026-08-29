import React, { useState, useRef, useEffect } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { useToast } from '../context/ToastContext';
import { FolderPlus, Upload, FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { FileNameDialog } from './FileNameDialog';

interface NewMenuProps {
  currentFolderId: string | null;
  onClose: () => void;
}

const NewMenu: React.FC<NewMenuProps> = ({ currentFolderId, onClose }) => {
  const { dispatch, uploadFile } = useFileSystem();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const createFile = (name: string, fileType: 'doc' | 'spreadsheet' | 'presentation' | 'form', mimeType: string) => {
    dispatch({
      type: 'CREATE_FILE',
      payload: { name, fileType, mimeType, parentId: currentFolderId }
    });
    showToast(`Created "${name}"`);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(f => uploadFile(f, currentFolderId));
      showToast(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`);
    }
    onClose();
  };

  const menuItems = [
    {
      group: 'create',
      items: [
        {
          icon: (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" fill="#5F6368"/>
            </svg>
          ),
          label: 'New folder',
          action: () => setFolderDialogOpen(true)
        }
      ]
    },
    {
      group: 'upload',
      items: [
        {
          icon: <Upload className="w-5 h-5 text-[#5F6368]" />,
          label: 'File upload',
          action: () => { fileInputRef.current?.click(); }
        }
      ]
    },
    {
      group: 'workspace',
      items: [
        {
          icon: (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <rect x="3" y="2" width="18" height="20" rx="2" fill="#4285F4"/>
              <rect x="7" y="8" width="10" height="1.5" rx="0.75" fill="white"/>
              <rect x="7" y="11" width="10" height="1.5" rx="0.75" fill="white"/>
              <rect x="7" y="14" width="7" height="1.5" rx="0.75" fill="white"/>
            </svg>
          ),
          label: 'Google Docs',
          action: () => createFile('Untitled document', 'doc', 'application/vnd.google-apps.document')
        },
        {
          icon: (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <rect x="3" y="2" width="18" height="20" rx="2" fill="#0F9D58"/>
              <rect x="6" y="7" width="12" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
              <rect x="6" y="10.5" width="12" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
              <rect x="6" y="14" width="12" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
              <line x1="12" y1="6" x2="12" y2="17" stroke="white" strokeWidth="0.8" opacity="0.7"/>
            </svg>
          ),
          label: 'Google Sheets',
          action: () => createFile('Untitled spreadsheet', 'spreadsheet', 'application/vnd.google-apps.spreadsheet')
        },
        {
          icon: (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <rect x="3" y="2" width="18" height="20" rx="2" fill="#F4B400"/>
              <rect x="6" y="6" width="12" height="8" rx="1" fill="white" opacity="0.9"/>
              <rect x="9" y="16" width="6" height="1.5" rx="0.75" fill="white" opacity="0.8"/>
            </svg>
          ),
          label: 'Google Slides',
          action: () => createFile('Untitled presentation', 'presentation', 'application/vnd.google-apps.presentation')
        },
        {
          icon: (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <rect x="3" y="2" width="18" height="20" rx="2" fill="#7627BB"/>
              <rect x="7" y="7" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
              <rect x="13" y="8" width="5" height="1.5" rx="0.75" fill="white" opacity="0.8"/>
              <rect x="7" y="13" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
              <rect x="13" y="14" width="5" height="1.5" rx="0.75" fill="white" opacity="0.8"/>
            </svg>
          ),
          label: 'Google Forms',
          action: () => createFile('Untitled form', 'form', 'application/vnd.google-apps.form')
        }
      ]
    }
  ];

  const handleFolderCreate = (name: string) => {
    dispatch({ type: 'CREATE_FOLDER', payload: { name, parentId: currentFolderId } });
    showToast(`Folder "${name}" created`);
    setFolderDialogOpen(false);
    onClose();
  };

  return (
    <>
      <div
        ref={menuRef}
        className="absolute left-3 top-[calc(100%+4px)] z-50 w-56 bg-white rounded-lg shadow-xl border border-[#DADCE0] py-2"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,.2), 0 4px 8px rgba(0,0,0,.15)' }}
      >
        {menuItems.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <div className="my-1 border-t border-[#DADCE0]" />}
            {group.items.map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#202124] hover:bg-[#F1F3F4] transition-colors text-left"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </React.Fragment>
        ))}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {folderDialogOpen && (
        <FileNameDialog
          title="New folder"
          defaultName="Untitled folder"
          onConfirm={handleFolderCreate}
          onCancel={() => { setFolderDialogOpen(false); onClose(); }}
        />
      )}
    </>
  );
};

interface NewButtonProps {
  currentFolderId: string | null;
}

export const NewButton: React.FC<NewButtonProps> = ({ currentFolderId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        data-new-button="true"
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-3 bg-white border border-[#DADCE0] shadow-sm hover:shadow-md hover:bg-[#F6F8FE] rounded-2xl px-5 py-3.5 transition-all"
        style={{ minWidth: '112px' }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1A73E8]" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span className="font-medium text-sm text-[#202124]">New</span>
      </button>

      {isOpen && (
        <NewMenu currentFolderId={currentFolderId} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};
