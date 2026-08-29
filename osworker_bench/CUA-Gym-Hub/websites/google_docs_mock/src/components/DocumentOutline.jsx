import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, List } from 'lucide-react';
import { clsx } from 'clsx';

function DocumentOutline({ editor, isOpen, onToggle }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const extractHeadings = useCallback(() => {
    if (!editor) return;
    const items = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        const level = node.attrs.level;
        const text = node.textContent;
        if (text.trim()) {
          items.push({ level, text, pos });
        }
      }
    });
    setHeadings(items);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    extractHeadings();
    editor.on('update', extractHeadings);
    return () => editor.off('update', extractHeadings);
  }, [editor, extractHeadings]);

  const scrollToHeading = useCallback((pos) => {
    if (!editor) return;
    setActiveId(pos);
    editor.chain().focus().setTextSelection(pos).run();
    const domNode = editor.view.domAtPos(pos + 1)?.node;
    if (domNode?.nodeType === Node.TEXT_NODE && domNode.parentElement) {
      domNode.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (domNode instanceof Element) {
      domNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editor]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-white border border-gray-200 rounded-r shadow-sm hover:bg-gray-50 flex items-center justify-center z-10"
        title="Show document outline"
      >
        <List size={12} className="text-gray-500" />
      </button>
    );
  }

  return (
    <div className="w-[220px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Outline</span>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-gray-100 text-gray-400"
          title="Hide outline"
        >
          <ChevronLeft size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {headings.length === 0 ? (
          <p className="px-3 text-xs text-gray-400 italic">
            Add headings (H1–H6) to create an outline
          </p>
        ) : (
          headings.map((h, idx) => (
            <button
              key={idx}
              onClick={() => scrollToHeading(h.pos)}
              className={clsx(
                'w-full text-left px-3 py-1 text-xs hover:bg-blue-50 hover:text-blue-700 truncate transition-colors',
                activeId === h.pos ? 'bg-blue-50 text-blue-700' : 'text-gray-700',
              )}
              style={{ paddingLeft: `${8 + (h.level - 1) * 12}px` }}
              title={h.text}
            >
              {h.text}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default DocumentOutline;
