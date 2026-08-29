
    import React, { useState, useRef, useEffect } from 'react';
    import { X, Send, Paperclip, MessageSquare, Activity, LayoutList } from 'lucide-react';
    import { useStore } from '../context/StoreContext';
    import { format } from 'date-fns';
    import clsx from 'clsx';
    import { USERS, COLUMN_TYPES } from '../utils/mockData';
    import StatusCell from './cells/StatusCell';
    import PersonCell from './cells/PersonCell';
    import DateCell from './cells/DateCell';
    import TimelineCell from './cells/TimelineCell';

    const CellEditor = ({ type, value, column, onChange }) => {
      switch (type) {
        case COLUMN_TYPES.STATUS:
          return <div className="h-10 w-40"><StatusCell value={value} column={column} onChange={onChange} /></div>;
        case COLUMN_TYPES.PERSON:
          return <div className="h-10 w-full"><PersonCell value={value} onChange={onChange} /></div>;
        case COLUMN_TYPES.DATE:
          return <div className="h-10 w-full border border-gray-200 rounded"><DateCell value={value} onChange={onChange} /></div>;
        case COLUMN_TYPES.TIMELINE:
          return <div className="h-10 w-full"><TimelineCell value={value} onChange={onChange} /></div>;
        case COLUMN_TYPES.NUMBERS:
          return (
             <div className="flex items-center gap-2">
               <span className="text-gray-500">{column.settings?.prefix}</span>
               <input
                 type="number"
                 className="w-full h-10 border border-gray-200 rounded px-2"
                 value={value || ''}
                 onChange={(e) => onChange(e.target.value)}
               />
             </div>
          );
        default:
          return (
            <input
              className="w-full h-10 border border-gray-200 rounded px-2"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          );
      }
    };

    export default function ItemDetailPanel({ item, board, onClose }) {
      const { state, updateItemName, updateItemValue, addItemUpdate, addItemFile } = useStore();
      const [activeTab, setActiveTab] = useState('updates');
      const [updateText, setUpdateText] = useState('');
      const [showMentions, setShowMentions] = useState(false);
      const [mentionFilter, setMentionFilter] = useState('');
      const [previewFile, setPreviewFile] = useState(null);
      const textareaRef = useRef(null);
      const fileInputRef = useRef(null);

      if (!item) return null;

      const liveItem = board.items.find(candidate => candidate.id === item.id) || item;
      const group = board.groups.find(g => g.id === item.groupId);
      const updates = liveItem.updates || [];
      const files = liveItem.files || [];

      const handlePostUpdate = () => {
        if (!updateText.trim()) return;

        const newUpdate = {
          id: Date.now().toString(),
          userId: state.currentUser.id,
          content: updateText,
          created: new Date().toISOString(),
          likes: 0
        };

        addItemUpdate(board.id, liveItem.id, newUpdate);
        setUpdateText('');
        setShowMentions(false);
      };

      const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const storedFile = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          createdAt: new Date().toISOString()
        };
        addItemFile(board.id, liveItem.id, storedFile);
        event.target.value = '';
      };

      const handleTextChange = (e) => {
        const val = e.target.value;
        setUpdateText(val);

        const lastWord = val.split(' ').pop();
        if (lastWord.startsWith('@')) {
          setShowMentions(true);
          setMentionFilter(lastWord.slice(1));
        } else {
          setShowMentions(false);
        }
      };

      const insertMention = (userName) => {
        const words = updateText.split(' ');
        words.pop(); // Remove the partial @mention
        const newText = [...words, `@${userName} `].join(' ');
        setUpdateText(newText);
        setShowMentions(false);
        textareaRef.current?.focus();
      };

      const filteredUsers = USERS.filter(u =>
        u.name.toLowerCase().includes(mentionFilter.toLowerCase())
      );

      // Helper to render text with highlighted mentions
      const renderContent = (content) => {
        const parts = content.split(/(@\w+(?: \w+)?)/g);
        return parts.map((part, i) => {
          if (part.startsWith('@')) {
            return <span key={i} className="text-primary font-medium bg-blue-50 px-1 rounded">{part}</span>;
          }
          return part;
        });
      };

      return (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
          <div className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <input
                  className="text-2xl font-bold text-gray-800 bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-primary w-full mr-4 transition-colors"
                  value={liveItem.name}
                  onChange={(e) => updateItemName(board.id, liveItem.id, e.target.value)}
                />
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 flex-shrink-0">
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span
                  className="px-2 py-1 rounded text-white font-medium"
                  style={{ backgroundColor: group?.color || '#ccc' }}
                >
                  {group?.title}
                </span>
                <span className="text-gray-500">
                  Created {format(new Date(), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
              <button
                className={clsx("px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'updates' ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700")}
                onClick={() => setActiveTab('updates')}
              >
                Updates
              </button>
              <button
                className={clsx("px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'columns' ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700")}
                onClick={() => setActiveTab('columns')}
              >
                Columns
              </button>
              <button
                className={clsx("px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'files' ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700")}
                onClick={() => setActiveTab('files')}
              >
                Files
              </button>
              <button
                className={clsx("px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'activity' ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700")}
                onClick={() => setActiveTab('activity')}
              >
                Activity Log
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-surface-gray p-6">
              {activeTab === 'updates' && (
                <div className="space-y-6">
                  {/* Input */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm relative">
                    <textarea
                      ref={textareaRef}
                      className="w-full min-h-[100px] resize-none outline-none text-sm placeholder-gray-400"
                      placeholder="Write an update... (Type @ to mention)"
                      value={updateText}
                      onChange={handleTextChange}
                    />

                    {/* Mentions Dropdown */}
                    {showMentions && (
                      <div className="absolute left-4 bottom-14 bg-white shadow-xl rounded-lg border border-gray-200 w-64 max-h-48 overflow-y-auto z-10">
                        {filteredUsers.map(user => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => insertMention(user.name)}
                          >
                            <img src={user.avatar} className="w-6 h-6 rounded-full" />
                            <span className="text-sm text-gray-700">{user.name}</span>
                          </div>
                        ))}
                        {filteredUsers.length === 0 && (
                          <div className="p-2 text-sm text-gray-400">No users found</div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                      <div className="flex gap-2 text-gray-400">
                        <button className="p-1 hover:bg-gray-100 rounded"><Paperclip size={18} /></button>
                      </div>
                      <button
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                        onClick={handlePostUpdate}
                        disabled={!updateText.trim()}
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  {/* Feed */}
                  {updates.length > 0 ? (
                    <div className="space-y-4">
                      {updates.map(update => {
                        const user = USERS.find(u => u.id === update.userId) || state.currentUser;
                        return (
                          <div key={update.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                              <img src={user.avatar} className="w-8 h-8 rounded-full" />
                              <div>
                                <div className="font-medium text-sm">{user.name}</div>
                                <div className="text-xs text-gray-400">{format(new Date(update.created), 'MMM d, h:mm a')}</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-800 whitespace-pre-wrap">{renderContent(update.content)}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <MessageSquare size={48} className="mb-2 opacity-20" />
                      <p>No updates yet. Write one above!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'columns' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  {board.columns.map(col => (
                    <div key={col.id} className="p-4 border-b border-gray-100 last:border-0 flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-500 flex items-center gap-2">
                        <LayoutList size={14} />
                        {col.title}
                      </div>
                      <div className="flex-1">
                        <CellEditor
                          type={col.type}
                          value={liveItem.columnValues[col.id]}
                          column={col}
                          onChange={(val) => updateItemValue(board.id, liveItem.id, col.id, val)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'files' && (
                <div className="grid grid-cols-2 gap-4">
                  <div onClick={() => setPreviewFile({ name: 'campaign-reference.jpg', type: 'image/jpeg', size: 239000 })} className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative group cursor-pointer">
                    <img src="https://picsum.photos/300/200?random=1" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                      View
                    </div>
                  </div>
                  <div onClick={() => setPreviewFile({ name: 'wireframe-preview.jpg', type: 'image/jpeg', size: 184000 })} className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative group cursor-pointer">
                    <img src="https://picsum.photos/300/200?random=2" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                      View
                    </div>
                  </div>
                  {files.map(file => (
                    <button key={file.id} onClick={() => setPreviewFile(file)} className="aspect-video rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-primary">
                      <Paperclip size={24} className="mb-2 text-primary" />
                      <div className="font-medium text-gray-800">{file.name}</div>
                      <div className="mt-1 text-xs text-gray-500">{Math.max(1, Math.round(file.size / 1024))} KB</div>
                    </button>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors cursor-pointer bg-gray-50">
                    <Paperclip size={24} className="mb-2" />
                    <span className="text-sm font-medium">Add File</span>
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                  {previewFile && (
                    <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800">{previewFile.name}</div>
                          <div className="text-xs text-gray-500">{previewFile.type || 'file'} · {Math.max(1, Math.round((previewFile.size || 0) / 1024))} KB</div>
                        </div>
                        <button onClick={() => setPreviewFile(null)} className="rounded px-3 py-1 text-sm text-gray-500 hover:bg-gray-100">Close preview</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                 <div className="space-y-4">
                   {board.activities?.filter(a => a.itemId === liveItem.id).map(activity => (
                     <div key={activity.id} className="flex gap-3 text-sm">
                       <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                         <Activity size={14} className="text-gray-500" />
                       </div>
                       <div>
                         <div className="text-gray-800">{activity.details}</div>
                         <div className="text-xs text-gray-400">{format(new Date(activity.timestamp), 'MMM d, h:mm a')}</div>
                       </div>
                     </div>
                   ))}
                   {!board.activities?.some(a => a.itemId === liveItem.id) && (
                     <div className="text-center text-gray-400 py-8">No activity recorded yet.</div>
                   )}
                 </div>
              )}
            </div>
          </div>
        </>
      );
    }

