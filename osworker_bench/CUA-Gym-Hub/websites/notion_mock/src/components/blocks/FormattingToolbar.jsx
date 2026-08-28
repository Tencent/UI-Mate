import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Strikethrough, Code, Link, Palette } from 'lucide-react';
import { TEXT_COLORS, BG_COLORS } from './BlockMenu';
import clsx from 'clsx';

const ColorPicker = ({ onClose }) => {
  const ref = useRef(null);
  const textColorNames = ['default', 'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];
  const bgColorNames = ['default_background', 'gray_background', 'brown_background', 'orange_background', 'yellow_background', 'green_background', 'blue_background', 'purple_background', 'pink_background', 'red_background'];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const applyColor = (color) => {
    document.execCommand('foreColor', false, color);
    onClose();
  };

  const applyBg = (color) => {
    document.execCommand('hiliteColor', false, color);
    onClose();
  };

  return (
    <div ref={ref} className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[200px] z-50">
      <div className="px-3 py-1 text-xs font-medium text-gray-500">Text color</div>
      <div className="flex flex-wrap gap-1 px-3 py-1">
        {textColorNames.map(name => (
          <button
            key={name}
            className="w-6 h-6 rounded border border-gray-200 hover:border-gray-400 flex items-center justify-center text-xs font-bold"
            style={{ color: TEXT_COLORS[name] === 'inherit' ? '#37352F' : TEXT_COLORS[name] }}
            onClick={() => applyColor(TEXT_COLORS[name] === 'inherit' ? '#37352F' : TEXT_COLORS[name])}
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
            className="w-6 h-6 rounded border border-gray-200 hover:border-gray-400"
            style={{ backgroundColor: BG_COLORS[name] === 'transparent' ? '#fff' : BG_COLORS[name] }}
            onClick={() => applyBg(BG_COLORS[name] === 'transparent' ? 'transparent' : BG_COLORS[name])}
            title={name.replace('_background', '')}
          />
        ))}
      </div>
    </div>
  );
};

export const FormattingToolbar = ({ position }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedSelectionRef = useRef(null);
  const ref = useRef(null);

  const execCmd = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
  };

  const openLinkEditor = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
    setShowColorPicker(false);
    setShowLinkEditor(true);
  };

  const applyLink = (event) => {
    event.preventDefault();
    const url = linkUrl.trim();
    if (!url) return;
    const selection = window.getSelection();
    if (savedSelectionRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    execCmd('createLink', href);
    setLinkUrl('');
    setShowLinkEditor(false);
  };

  return (
    <div
      ref={ref}
      className="fixed z-[100] flex items-center bg-gray-900 text-white rounded-md shadow-xl px-1 py-0.5 space-x-0.5"
      style={{ top: position.top - 42, left: position.left }}
    >
      <button
        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
        onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }}
        title="Bold (Cmd+B)"
      >
        <Bold size={14} />
      </button>
      <button
        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
        onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }}
        title="Italic (Cmd+I)"
      >
        <Italic size={14} />
      </button>
      <button
        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
        onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }}
        title="Underline (Cmd+U)"
      >
        <Underline size={14} />
      </button>
      <button
        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
        onMouseDown={(e) => { e.preventDefault(); execCmd('strikeThrough'); }}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </button>
      <button
        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
        onMouseDown={(e) => {
          e.preventDefault();
          const sel = window.getSelection();
          if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const code = document.createElement('code');
            code.className = 'bg-gray-200 text-red-600 px-1 py-0.5 rounded text-sm font-mono';
            range.surroundContents(code);
          }
        }}
        title="Code (Cmd+E)"
      >
        <Code size={14} />
      </button>
      <button
        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
        onMouseDown={(e) => { e.preventDefault(); openLinkEditor(); }}
        title="Link (Cmd+K)"
      >
        <Link size={14} />
      </button>
      {showLinkEditor && (
        <form
          className="absolute top-full left-0 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-3 text-gray-900 shadow-xl"
          onSubmit={applyLink}
        >
          <label className="mb-1 block text-xs font-medium text-gray-500">Link URL</label>
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-400"
              autoFocus
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setShowLinkEditor(false);
                  setLinkUrl('');
                }
              }}
            />
            <button
              type="submit"
              className="rounded bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        </form>
      )}
      <div className="w-px h-5 bg-gray-600" />
      <div className="relative">
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(!showColorPicker); }}
          title="Color"
        >
          <Palette size={14} />
        </button>
        {showColorPicker && <ColorPicker onClose={() => setShowColorPicker(false)} />}
      </div>
    </div>
  );
};
