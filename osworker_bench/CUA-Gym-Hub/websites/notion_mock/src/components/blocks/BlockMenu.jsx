import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/store';
import { Trash2, Files, Type, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Quote, MessageSquare, Minus, Code, ToggleRight, Palette, ChevronRight, Columns, Check } from 'lucide-react';
import clsx from 'clsx';

// Block color values mapping
export const TEXT_COLORS = {
  default: 'inherit',
  gray: 'rgb(120,119,116)',
  brown: 'rgb(159,107,83)',
  orange: 'rgb(217,115,13)',
  yellow: 'rgb(203,145,47)',
  green: 'rgb(68,131,97)',
  blue: 'rgb(51,126,169)',
  purple: 'rgb(144,101,176)',
  pink: 'rgb(193,76,138)',
  red: 'rgb(212,76,71)',
};

export const BG_COLORS = {
  default_background: 'transparent',
  gray_background: 'rgb(241,241,239)',
  brown_background: 'rgb(244,238,232)',
  orange_background: 'rgb(251,236,221)',
  yellow_background: 'rgb(251,243,219)',
  green_background: 'rgb(237,243,236)',
  blue_background: 'rgb(231,243,248)',
  purple_background: 'rgb(244,240,247)',
  pink_background: 'rgb(249,238,243)',
  red_background: 'rgb(253,235,236)',
};

const TURN_INTO_TYPES = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'heading-1', label: 'Heading 1', icon: Heading1 },
  { id: 'heading-2', label: 'Heading 2', icon: Heading2 },
  { id: 'heading-3', label: 'Heading 3', icon: Heading3 },
  { id: 'todo', label: 'To-do list', icon: CheckSquare },
  { id: 'bullet-list', label: 'Bulleted list', icon: List },
  { id: 'numbered-list', label: 'Numbered list', icon: ListOrdered },
  { id: 'toggle', label: 'Toggle list', icon: ToggleRight },
  { id: 'quote', label: 'Quote', icon: Quote },
  { id: 'callout', label: 'Callout', icon: MessageSquare },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'divider', label: 'Divider', icon: Minus },
  { id: 'column-layout-2', label: '2 Columns', icon: Columns },
  { id: 'column-layout-3', label: '3 Columns', icon: Columns },
];

const ColorSubmenu = ({ currentColor, currentBgColor, onColorChange, onBgColorChange }) => {
  const textColorNames = ['default', 'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];
  const bgColorNames = ['default_background', 'gray_background', 'brown_background', 'orange_background', 'yellow_background', 'green_background', 'blue_background', 'purple_background', 'pink_background', 'red_background'];

  return (
    <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[200px] z-50">
      <div className="px-3 py-1 text-xs font-medium text-gray-500">Color</div>
      <div className="flex flex-wrap gap-1 px-3 py-1">
        {textColorNames.map(name => (
          <button
            key={name}
            className={clsx(
              "w-6 h-6 rounded border flex items-center justify-center text-xs font-bold",
              currentColor === name ? "border-blue-500 ring-1 ring-blue-300" : "border-gray-200 hover:border-gray-400"
            )}
            style={{ color: TEXT_COLORS[name] === 'inherit' ? '#37352F' : TEXT_COLORS[name] }}
            onClick={() => onColorChange(name)}
            title={name}
          >
            A
          </button>
        ))}
      </div>
      <div className="border-t border-gray-100 my-1" />
      <div className="px-3 py-1 text-xs font-medium text-gray-500">Background</div>
      <div className="flex flex-wrap gap-1 px-3 py-1">
        {bgColorNames.map(name => (
          <button
            key={name}
            className={clsx(
              "w-6 h-6 rounded border",
              currentBgColor === name ? "border-blue-500 ring-1 ring-blue-300" : "border-gray-200 hover:border-gray-400"
            )}
            style={{ backgroundColor: BG_COLORS[name] === 'transparent' ? '#fff' : BG_COLORS[name] }}
            onClick={() => onBgColorChange(name)}
            title={name.replace('_background', '')}
          />
        ))}
      </div>
    </div>
  );
};

// Move to submenu - page picker
const MoveToSubmenu = ({ blockId, pageId, onClose }) => {
  const { state, updatePage } = useStore();

  // Get all non-database pages except the current one
  const allPages = Object.values(state.pages).filter(
    p => p.id !== pageId && p.type !== 'database'
  );

  const handleMove = (targetPageId) => {
    const sourcePage = state.pages[pageId];
    const targetPage = state.pages[targetPageId];
    if (!sourcePage || !targetPage) return;

    // Remove block from source page
    const newSourceBlockIds = sourcePage.blockIds.filter(id => id !== blockId);
    updatePage(pageId, { blockIds: newSourceBlockIds });

    // Add block to target page
    const newTargetBlockIds = [...(targetPage.blockIds || []), blockId];
    updatePage(targetPageId, { blockIds: newTargetBlockIds });

    onClose();
  };

  return (
    <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[220px] max-h-[300px] overflow-y-auto z-50">
      <div className="px-3 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-100">Move block to page</div>
      {allPages.length === 0 ? (
        <div className="px-3 py-3 text-xs text-gray-400">No other pages available</div>
      ) : (
        allPages.map(p => (
          <button key={p.id} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700 text-xs" onClick={() => handleMove(p.id)}>
            <span className="mr-2">{p.icon || '\u{1F4C4}'}</span>
            <span className="truncate">{p.title || 'Untitled'}</span>
          </button>
        ))
      )}
    </div>
  );
};

export const BlockDragMenu = ({ blockId, pageId, onClose, onDelete, onDuplicate, onTurnInto, onColorChange, onBgColorChange, currentColor, currentBgColor, currentType }) => {
  const ref = useRef(null);
  const [showTurnInto, setShowTurnInto] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [showMoveTo, setShowMoveTo] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleCopyLinkToBlock = () => {
    const blockAnchorUrl = `${window.location.origin}/page/${pageId}#block-${blockId}`;
    navigator.clipboard.writeText(blockAnchorUrl);
    setLinkCopied(true);
    setTimeout(() => { setLinkCopied(false); onClose(); }, 1500);
  };

  return (
    <div ref={ref} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[200px] text-sm" style={{ top: '100%', left: 0, marginTop: 4 }}>
      <button
        className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-red-600"
        onClick={() => { onDelete(); onClose(); }}
      >
        <Trash2 size={14} className="mr-2" /> Delete
      </button>
      <button
        className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700"
        onClick={() => { onDuplicate(); onClose(); }}
      >
        <Files size={14} className="mr-2 text-gray-500" /> Duplicate
      </button>
      <div className="border-t border-gray-100 my-1" />
      <div className="relative"
        onMouseEnter={() => setShowTurnInto(true)}
        onMouseLeave={() => setShowTurnInto(false)}
      >
        <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between text-gray-700">
          <span className="flex items-center"><Type size={14} className="mr-2 text-gray-500" /> Turn into</span>
          <ChevronRight size={12} className="text-gray-400" />
        </button>
        {showTurnInto && (
          <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[200px] max-h-[300px] overflow-y-auto z-50">
            {TURN_INTO_TYPES.map(item => (
              <button
                key={item.id}
                className={clsx(
                  "w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700 text-sm",
                  currentType === item.id && "bg-gray-50 font-medium"
                )}
                onClick={() => { onTurnInto(item.id); onClose(); }}
              >
                <item.icon size={14} className="mr-2 text-gray-500" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative"
        onMouseEnter={() => setShowColor(true)}
        onMouseLeave={() => setShowColor(false)}
      >
        <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between text-gray-700">
          <span className="flex items-center"><Palette size={14} className="mr-2 text-gray-500" /> Color</span>
          <ChevronRight size={12} className="text-gray-400" />
        </button>
        {showColor && (
          <ColorSubmenu
            currentColor={currentColor}
            currentBgColor={currentBgColor}
            onColorChange={(c) => { onColorChange(c); onClose(); }}
            onBgColorChange={(c) => { onBgColorChange(c); onClose(); }}
          />
        )}
      </div>
      <div className="border-t border-gray-100 my-1" />
      <button
        className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700"
        onClick={handleCopyLinkToBlock}
      >
        {linkCopied ? (
          <><Check size={14} className="mr-2 text-green-500" /> <span className="text-green-600">Link copied!</span></>
        ) : (
          'Copy link to block'
        )}
      </button>
      <div className="relative"
        onMouseEnter={() => setShowMoveTo(true)}
        onMouseLeave={() => setShowMoveTo(false)}
      >
        <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between text-gray-700">
          <span>Move to</span>
          <ChevronRight size={12} className="text-gray-400" />
        </button>
        {showMoveTo && (
          <MoveToSubmenu blockId={blockId} pageId={pageId} onClose={onClose} />
        )}
      </div>
    </div>
  );
};
