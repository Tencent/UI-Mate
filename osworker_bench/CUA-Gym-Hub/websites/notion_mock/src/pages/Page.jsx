import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/store';
import { TopBar } from '../components/TopBar';
import { BlockRenderer } from '../components/blocks/BlockRenderer';
import { DatabaseView } from '../components/database/DatabaseView';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Smile, Image as ImageIcon, X } from 'lucide-react';

const PRESET_COVERS = [
  'https://picsum.photos/1500/400?random=c1',
  'https://picsum.photos/1500/400?random=c2',
  'https://picsum.photos/1500/400?random=c3',
  'https://picsum.photos/1500/400?random=c4',
  'https://picsum.photos/1500/400?random=c5',
  'https://picsum.photos/1500/400?random=c6',
  'https://picsum.photos/1500/400?random=c7',
  'https://picsum.photos/1500/400?random=c8',
];

const CoverPicker = ({ onSelect, onClose }) => {
  const [customUrl, setCustomUrl] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-50 bg-white border border-gray-200 shadow-xl rounded-lg p-4 w-[400px] max-h-[360px] overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-700">Cover image</span>
        <button onClick={onClose}><X size={14} className="text-gray-500 hover:text-gray-800" /></button>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {PRESET_COVERS.map((url, i) => (
          <button key={i} className="h-12 rounded overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
            onClick={() => { onSelect(url); onClose(); }}>
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-3">
        <label className="text-xs text-gray-500 mb-1 block">Image URL</label>
        <div className="flex gap-2">
          <input className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400"
            placeholder="https://..." value={customUrl} onChange={e => setCustomUrl(e.target.value)} />
          <button className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={() => { if (customUrl) { onSelect(customUrl); onClose(); } }}>Apply</button>
        </div>
      </div>
    </div>
  );
};

const EmojiPicker = ({ onSelect, onClose }) => {
  const emojis = ['\u{1F600}', '\u{1F603}', '\u{1F604}', '\u{1F601}', '\u{1F606}', '\u{1F605}', '\u{1F602}', '\u{1F923}', '\u{1F60A}', '\u{1F607}', '\u{1F642}', '\u{1F643}', '\u{1F609}', '\u{1F60C}', '\u{1F60D}', '\u{1F970}', '\u{1F618}', '\u{1F617}', '\u{1F619}', '\u{1F61A}', '\u{1F60B}', '\u{1F61B}', '\u{1F61D}', '\u{1F61C}', '\u{1F92A}', '\u{1F928}', '\u{1F9D0}', '\u{1F913}', '\u{1F60E}', '\u{1F929}', '\u{1F973}', '\u{1F60F}', '\u{1F44B}', '\u{270B}', '\u{1F44D}', '\u{1F44E}', '\u270C\uFE0F', '\u{1F918}', '\u{1F680}', '\u{1F3E0}', '\u{1F4DA}', '\u{1F4D6}', '\u{1F4DD}', '\u{1F4CB}', '\u{1F4CA}', '\u{1F4C5}', '\u{1F4C6}', '\u{1F3A8}', '\u{1F3AF}', '\u{1F9ED}', '\u{1F4D1}', '\u{1F4D7}', '\u{1F4D8}', '\u{1F4D9}', '\u{1F4D5}', '\u{1F4D3}', '\u{1F373}', '\u2708\uFE0F', '\u{1F4E2}', '\u{1F9EA}', '\u{1F5FA}\uFE0F', '\u{1F525}', '\u2B50', '\u{1F4A1}', '\u2764\uFE0F', '\u{1F389}', '\u{1F381}', '\u{1F3C6}', '\u{1F3B5}', '\u{1F3B6}', '\u{1F3AE}', '\u{1F3AD}', '\u{1F4F1}', '\u{1F4BB}', '\u{1F4F7}', '\u{1F50D}', '\u{1F512}', '\u{1F511}', '\u2699\uFE0F', '\u{1F6E0}\uFE0F', '\u{1F4A4}', '\u{1F30D}', '\u{1F30E}', '\u{1F30F}', '\u{1F308}', '\u2600\uFE0F', '\u{1F319}', '\u2B50', '\u{1F31F}', '\u26A1', '\u{1F4A5}', '\u{1F300}', '\u{1F332}', '\u{1F334}', '\u{1F33B}', '\u{1F33A}', '\u{1F337}'];

  return (
    <div className="absolute z-50 bg-white border border-gray-200 shadow-xl rounded-lg p-2 w-64 h-64 overflow-y-auto">
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-xs font-bold text-gray-500">EMOJIS</span>
        <button onClick={onClose}><X size={14} /></button>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {emojis.map((emoji, idx) => (
          <button
            key={idx}
            className="hover:bg-gray-100 p-1 rounded text-xl"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Page = () => {
  const { pageId } = useParams();
  const { state, updatePage, moveBlock, addBlock } = useStore();
  const page = state.pages[pageId];
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [coverPosition, setCoverPosition] = useState(50);
  const [repositioning, setRepositioning] = useState(false);
  const iconButtonRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reset local state when page changes
  useEffect(() => {
    setShowIconPicker(false);
    setShowCoverPicker(false);
    setRepositioning(false);
    setCoverPosition(50);
  }, [pageId]);

  if (!page) {
    return <div className="p-10 text-gray-500">Page not found</div>;
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      moveBlock(pageId, active.id, over.id);
    }
  };

  const handleIconSelect = (icon) => {
    updatePage(pageId, { icon });
    setShowIconPicker(false);
  };

  const handleCoverReposition = (e) => {
    if (!repositioning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const pct = Math.max(0, Math.min(100, (y / rect.height) * 100));
    setCoverPosition(pct);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
      <TopBar pageId={pageId} />

      {/* Cover Image */}
      {page.cover && (
        <div className="h-[200px] w-full relative group flex-shrink-0"
          onMouseMove={handleCoverReposition}
          onMouseUp={() => setRepositioning(false)}
          onMouseLeave={() => setRepositioning(false)}>
          <img src={page.cover} alt="Cover" className="w-full h-full object-cover"
            style={{ objectPosition: `center ${coverPosition}%` }}
            draggable={false} />
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="bg-white/80 hover:bg-white text-xs px-2 py-1 rounded shadow-sm"
              onClick={() => setShowCoverPicker(true)}>Change cover</button>
            <button className="bg-white/80 hover:bg-white text-xs px-2 py-1 rounded shadow-sm"
              onMouseDown={() => setRepositioning(true)}>Reposition</button>
            <button className="bg-white/80 hover:bg-white text-xs px-2 py-1 rounded shadow-sm text-red-600"
              onClick={() => updatePage(pageId, { cover: null })}>Remove</button>
          </div>
          {showCoverPicker && (
            <div className="absolute bottom-12 right-2">
              <CoverPicker onSelect={(url) => updatePage(pageId, { cover: url })} onClose={() => setShowCoverPicker(false)} />
            </div>
          )}
          {repositioning && (
            <div className="absolute inset-0 cursor-ns-resize bg-black/10 flex items-center justify-center">
              <span className="bg-black/60 text-white text-xs px-3 py-1 rounded">Drag to reposition</span>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full px-12 pb-32 pt-8">
        {/* Page Header */}
        <div className="group relative mb-8">
          {!page.icon && !page.cover && (
            <div className="opacity-0 group-hover:opacity-100 flex space-x-2 mb-2 text-gray-400 text-sm">
              <button
                className="hover:bg-gray-100 px-2 py-1 rounded flex items-center"
                onClick={() => setShowIconPicker(true)}
              >
                <Smile size={14} className="mr-1"/> Add icon
              </button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded flex items-center"
                onClick={() => updatePage(pageId, { cover: `https://picsum.photos/1500/400?random=${Date.now()}` })}>
                <ImageIcon size={14} className="mr-1"/> Add cover
              </button>
            </div>
          )}

          {!page.cover && page.icon && (
            <div className="opacity-0 group-hover:opacity-100 flex space-x-2 mb-2 text-gray-400 text-sm absolute -top-6 left-0">
              <button className="hover:bg-gray-100 px-2 py-1 rounded flex items-center text-xs"
                onClick={() => updatePage(pageId, { cover: `https://picsum.photos/1500/400?random=${Date.now()}` })}>
                <ImageIcon size={12} className="mr-1"/> Add cover
              </button>
            </div>
          )}

          {page.icon && (
            <div className="relative">
              <div
                ref={iconButtonRef}
                className="text-7xl mb-4 cursor-pointer hover:bg-gray-100 rounded-lg w-fit p-2 -ml-2 transition-colors"
                onClick={() => setShowIconPicker(!showIconPicker)}
              >
                {page.icon}
              </div>
              {showIconPicker && (
                <EmojiPicker
                  onSelect={handleIconSelect}
                  onClose={() => setShowIconPicker(false)}
                />
              )}
            </div>
          )}

          {showIconPicker && !page.icon && (
             <div className="absolute top-8 left-0 z-50">
                <EmojiPicker
                  onSelect={handleIconSelect}
                  onClose={() => setShowIconPicker(false)}
                />
             </div>
          )}

          <input
            type="text"
            value={page.title}
            onChange={(e) => updatePage(pageId, { title: e.target.value })}
            placeholder="Untitled"
            className="text-4xl font-bold w-full outline-none placeholder-gray-300"
          />
        </div>

        {/* Database View or Block Editor */}
        {page.type === 'database' ? (
          <DatabaseView pageId={pageId} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={page.blockIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {page.blockIds.map((blockId, idx) => {
                  // Compute sequential number for numbered lists
                  let numberedListIndex = 1;
                  if (state.blocks[blockId]?.type === 'numbered-list') {
                    let count = 0;
                    for (let i = idx; i >= 0; i--) {
                      const b = state.blocks[page.blockIds[i]];
                      if (b && b.type === 'numbered-list') {
                        count++;
                      } else {
                        break;
                      }
                    }
                    numberedListIndex = count;
                  }
                  return (
                    <BlockRenderer
                      key={blockId}
                      blockId={blockId}
                      pageId={pageId}
                      numberedListIndex={numberedListIndex}
                    />
                  );
                })}
              </div>
            </SortableContext>

            {/* Empty State / Click to add */}
            <div
              className="h-32 -ml-8 pl-8 cursor-text"
              onClick={(e) => {
                if(e.target === e.currentTarget) {
                   addBlock(pageId, 'text', '')
                }
              }}
            >
              {page.blockIds.length === 0 && (
                <div className="text-gray-400 italic mt-2">
                  Press Enter to continue with an empty page, or pick a template...
                </div>
              )}
            </div>
          </DndContext>
        )}
      </div>
    </div>
  );
};
