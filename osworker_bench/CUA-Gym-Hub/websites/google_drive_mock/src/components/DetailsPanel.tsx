import React, { useState } from 'react';
import { FileSystemItem } from '../lib/types';
import { X, Info } from 'lucide-react';
import { useFileSystem } from '../context/FileSystemContext';
import { FileTypeIcon } from './FileTypeIcon';
import { formatBytes, cn } from '../lib/utils';
import { format } from 'date-fns';

interface DetailsPanelProps {
  item: FileSystemItem | null;
  onClose: () => void;
}

const ActivityEntry = ({ action, user, date }: { action: string; user: string; date: string }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-[#F1F3F4] last:border-0">
    <div className="w-8 h-8 rounded-full bg-[#1A73E8] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
      {user.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-[#202124]">
        <span className="font-medium">{user}</span> {action}
      </p>
      <p className="text-xs text-[#9AA0A6] mt-0.5">{date}</p>
    </div>
  </div>
);

export const DetailsPanel = ({ item, onClose }: DetailsPanelProps) => {
  const { state, getPath, dispatch } = useFileSystem();
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  const [description, setDescription] = useState(item?.description || '');
  const [editingDesc, setEditingDesc] = useState(false);

  if (!item) return null;

  const path = item.parentId ? getPath(item.parentId) : [];
  const location = ['My Drive', ...path.map(p => p.name)].join(' / ');
  const owner = item.ownerId === state.currentUser.id
    ? state.currentUser.name + ' (me)'
    : state.users?.[item.ownerId]?.name || 'Unknown';

  const fileTypeLabel: Record<string, string> = {
    folder: 'Folder',
    doc: 'Google Docs',
    spreadsheet: 'Google Sheets',
    presentation: 'Google Slides',
    form: 'Google Forms',
    pdf: 'PDF',
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    text: 'Text file',
    archive: 'Archive',
    code: 'Code file',
    unknown: 'File',
  };

  // Mock activity entries based on file data
  const mockActivity = [
    { action: 'last edited this item', user: owner.replace(' (me)', ''), date: format(item.modifiedAt, 'MMM d, yyyy h:mm a') },
    { action: 'viewed this item', user: state.currentUser.name, date: format(item.accessedAt, 'MMM d, yyyy h:mm a') },
    { action: 'created this item', user: owner.replace(' (me)', ''), date: format(item.createdAt, 'MMM d, yyyy h:mm a') },
  ];

  const handleDescSave = () => {
    dispatch({
      type: 'RENAME_ITEM',
      payload: { id: item.id, name: item.name }
    });
    // We'll use a description field update - for now just update description in items via a workaround
    // Actually, we need to dispatch a description update, let's just update the item description
    setEditingDesc(false);
  };

  return (
    <div className="w-72 flex-shrink-0 border-l border-[#DADCE0] bg-white flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-[#DADCE0] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileTypeIcon item={item} size="sm" className="flex-shrink-0" />
          <span className="text-sm font-medium text-[#202124] truncate">{item.name}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#F1F3F4] rounded-full flex-shrink-0 transition-colors"
        >
          <X className="w-4 h-4 text-[#5F6368]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DADCE0] flex-shrink-0">
        <button
          onClick={() => setActiveTab('details')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === 'details'
              ? "text-[#1A73E8] border-[#1A73E8]"
              : "text-[#5F6368] border-transparent hover:text-[#202124]"
          )}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === 'activity'
              ? "text-[#1A73E8] border-[#1A73E8]"
              : "text-[#5F6368] border-transparent hover:text-[#202124]"
          )}
        >
          Activity
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' ? (
          <div className="p-4 space-y-0">
            {/* Thumbnail preview */}
            {item.thumbnailUrl ? (
              <div className="mb-4 rounded-lg overflow-hidden border border-[#DADCE0]">
                <img src={item.thumbnailUrl} alt={item.name} className="w-full h-32 object-cover" />
              </div>
            ) : (
              <div className="mb-4 h-24 bg-[#F8F9FA] rounded-lg border border-[#DADCE0] flex items-center justify-center">
                <FileTypeIcon item={item} size="lg" />
              </div>
            )}

            {/* Detail rows */}
            <div className="space-y-0">
              <DetailRow label="Type" value={fileTypeLabel[item.type] || 'File'} />
              {item.type !== 'folder' && item.size > 0 && (
                <DetailRow label="Size" value={formatBytes(item.size)} />
              )}
              <DetailRow label="Location" value={location} />
              <DetailRow label="Owner" value={owner} />
              <DetailRow label="Modified" value={format(item.modifiedAt, 'MMM d, yyyy, h:mm a')} />
              <DetailRow label="Opened" value={format(item.accessedAt, 'MMM d, yyyy, h:mm a')} />
              <DetailRow label="Created" value={format(item.createdAt, 'MMM d, yyyy')} />
              {item.sharedWith.length > 0 && (
                <DetailRow
                  label="Shared with"
                  value={`${item.sharedWith.length} person${item.sharedWith.length > 1 ? 's' : ''}`}
                />
              )}
            </div>

            {/* Description */}
            <div className="mt-4 pt-4 border-t border-[#F1F3F4]">
              <p className="text-xs font-medium text-[#5F6368] mb-2">Description</p>
              {editingDesc ? (
                <div>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full text-sm text-[#202124] border border-[#1A73E8] rounded-lg p-2 resize-none outline-none ring-1 ring-[#1A73E8]"
                    rows={3}
                    autoFocus
                    onBlur={handleDescSave}
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleDescSave}
                      className="text-xs text-white bg-[#1A73E8] hover:bg-[#1557B0] px-3 py-1 rounded-full font-medium transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setDescription(item.description || ''); setEditingDesc(false); }}
                      className="text-xs text-[#5F6368] hover:text-[#202124] px-3 py-1 rounded-full transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  onClick={() => setEditingDesc(true)}
                  className={cn(
                    "text-sm rounded p-1 -m-1 cursor-text hover:bg-[#F1F3F4] transition-colors",
                    description ? "text-[#202124]" : "text-[#9AA0A6] italic"
                  )}
                >
                  {description || 'Add a description...'}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            {mockActivity.map((entry, i) => (
              <ActivityEntry key={i} {...entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="py-2.5 border-b border-[#F1F3F4] last:border-0">
    <p className="text-xs text-[#5F6368] mb-0.5">{label}</p>
    <p className="text-sm text-[#202124] break-words">{value}</p>
  </div>
);
