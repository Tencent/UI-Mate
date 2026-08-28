import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../store/store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { SlashMenu } from './SlashMenu';
import { BlockDragMenu, TEXT_COLORS, BG_COLORS } from './BlockMenu';
import { FormattingToolbar } from './FormattingToolbar';
import { MentionMenu } from './MentionMenu';
import { generateId } from '../../utils/helpers';

// Editable Block Component - handles contentEditable properly
const EditableBlock = ({
  content,
  onChange,
  onKeyDown,
  placeholder = "Type '/' for commands",
  className = "",
  as: Component = 'div',
  autoFocus = false,
  onFocused
}) => {
  const ref = useRef(null);
  const isComposing = useRef(false);
  const lastContent = useRef(null);

  // Auto-focus when requested (e.g., after Enter creates a new block)
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
      // Place cursor at end
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      onFocused?.();
    }
  }, [autoFocus]);

  // Only update DOM when content changes from external source (not from user input)
  useEffect(() => {
    if (ref.current && lastContent.current !== content) {
      const currentText = ref.current.textContent || '';
      if (currentText !== content) {
        ref.current.textContent = content;
      }
      lastContent.current = content;
    }
  }, [content]);

  const handleInput = useCallback((e) => {
    if (isComposing.current) return;
    const newContent = e.currentTarget.textContent || '';
    lastContent.current = newContent;
    onChange(newContent);
  }, [onChange]);

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e) => {
    isComposing.current = false;
    const newContent = e.currentTarget.textContent || '';
    lastContent.current = newContent;
    onChange(newContent);
  };

  const handleKeyDownWrapper = (e) => {
    if (isComposing.current) return;
    onKeyDown(e);
  };

  return (
    <Component
      ref={ref}
      className={clsx(
        "outline-none break-words whitespace-pre-wrap cursor-text",
        "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300",
        className
      )}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDownWrapper}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      data-placeholder={placeholder}
    />
  );
};

// Block Types
const TextBlock = ({ content, onChange, onKeyDown, placeholder = "Type '/' for commands", autoFocus, onFocused }) => (
  <EditableBlock
    content={content}
    onChange={onChange}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
    className="min-h-[24px] py-1 px-2 w-full"
    autoFocus={autoFocus}
    onFocused={onFocused}
  />
);

const HeadingBlock = ({ level, content, onChange, onKeyDown, collapsed, onToggle, autoFocus, onFocused }) => {
  const sizes = {
    1: 'text-3xl font-bold mt-6 mb-2',
    2: 'text-2xl font-semibold mt-5 mb-1',
    3: 'text-xl font-semibold mt-3 mb-1'
  };

  return (
    <div className="flex items-center group/heading relative w-full">
      <div
        className="absolute -left-6 p-1 cursor-pointer hover:bg-gray-200 rounded text-gray-400 opacity-0 group-hover/heading:opacity-100 transition-opacity"
        onClick={onToggle}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
      </div>
      <EditableBlock
        content={content}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={`Heading ${level}`}
        className={clsx(sizes[level], "px-2 w-full")}
        as={level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3'}
        autoFocus={autoFocus}
        onFocused={onFocused}
      />
    </div>
  );
};

const TodoBlock = ({ content, checked, onChange, onCheck, onKeyDown, autoFocus, onFocused }) => (
  <div className="flex items-start py-1 px-2 w-full">
    <div className="mr-2 mt-1 cursor-pointer flex-shrink-0" onClick={onCheck}>
      <div className={clsx(
        "w-4 h-4 border rounded flex items-center justify-center transition-colors",
        checked ? "bg-blue-500 border-blue-500 text-white" : "border-gray-400 hover:bg-gray-100"
      )}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
    </div>
    <EditableBlock
      content={content}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="To-do"
      className={clsx("flex-1", checked && "line-through text-gray-400")}
      autoFocus={autoFocus}
      onFocused={onFocused}
    />
  </div>
);

const ListBlock = ({ type, content, onChange, onKeyDown, number, autoFocus, onFocused }) => (
  <div className="flex items-start py-1 px-2 w-full">
    <div className="mr-2 mt-1 w-4 text-center select-none flex-shrink-0 text-sm">
      {type === 'bullet-list' ? '•' : `${number ?? 1}.`}
    </div>
    <EditableBlock
      content={content}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="List item"
      className="flex-1"
      autoFocus={autoFocus}
      onFocused={onFocused}
    />
  </div>
);

const ImageBlock = ({ src, caption, onCaptionChange, onKeyDown }) => (
  <div className="my-2 group relative w-full">
    <img
      src={src || "https://picsum.photos/800/400"}
      alt="Block"
      className="max-w-full rounded-md shadow-sm"
    />
    <EditableBlock
      content={caption || ''}
      onChange={onCaptionChange}
      onKeyDown={onKeyDown}
      placeholder="Add a caption..."
      className="text-xs text-gray-500 mt-1 text-center italic"
    />
  </div>
);

const DividerBlock = () => (
  <div className="py-2 px-2 w-full">
    <hr className="border-gray-200" />
  </div>
);

const CalloutBlock = ({ content, onChange, onKeyDown, autoFocus, onFocused, icon, bgColor }) => {
  const bgStyle = bgColor && BG_COLORS[bgColor] ? { backgroundColor: BG_COLORS[bgColor] } : {};
  return (
    <div className="p-4 bg-gray-100 rounded-md flex items-start my-2 mx-2 w-full" style={bgStyle}>
      <span className="mr-3 text-xl select-none">{icon || '\u{1F4A1}'}</span>
      <EditableBlock
        content={content}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Type something..."
        className="flex-1 font-medium text-gray-800"
        autoFocus={autoFocus}
        onFocused={onFocused}
      />
    </div>
  );
};

const QuoteBlock = ({ content, onChange, onKeyDown, autoFocus, onFocused }) => (
  <div className="flex my-2 px-2 w-full">
    <div className="w-1 bg-black mr-4 rounded-full flex-shrink-0"></div>
    <EditableBlock
      content={content}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="Quote"
      className="flex-1 text-lg italic text-gray-700"
      autoFocus={autoFocus}
      onFocused={onFocused}
    />
  </div>
);

// Table Block Component
const TableBlock = ({ data, onUpdateCell, onAddRow, onAddColumn, onDeleteRow, onDeleteColumn }) => {
  const rows = data?.rows || [['', '', ''], ['', '', ''], ['', '', '']];
  const headers = data?.headers || ['Column 1', 'Column 2', 'Column 3'];

  return (
    <div className="my-2 px-2 w-full overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((header, colIndex) => (
              <th
                key={colIndex}
                className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700 min-w-[100px]"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newHeaders = [...headers];
                  newHeaders[colIndex] = e.currentTarget.textContent || '';
                  onUpdateCell(-1, colIndex, newHeaders);
                }}
              >
                {header}
              </th>
            ))}
            <th className="border border-gray-200 px-2 py-2 w-8">
              <button
                onClick={onAddColumn}
                className="text-gray-400 hover:text-gray-600 text-lg"
                title="Add column"
              >
                +
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  className="border border-gray-200 px-3 py-2 min-w-[100px]"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    onUpdateCell(rowIndex, colIndex, e.currentTarget.textContent || '');
                  }}
                >
                  {cell}
                </td>
              ))}
              <td className="border border-gray-200 px-2 py-2 w-8">
                <button
                  onClick={() => onDeleteRow(rowIndex)}
                  className="text-gray-400 hover:text-red-500 text-xs"
                  title="Delete row"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={onAddRow}
        className="mt-1 text-gray-400 hover:text-gray-600 text-sm flex items-center"
      >
        <span className="mr-1">+</span> New row
      </button>
    </div>
  );
};

// Code Block Component
const CodeBlock = ({ content, language, onChange, onKeyDown, onLanguageChange }) => {
  const [lang, setLang] = useState(language || 'javascript');

  return (
    <div className="my-2 px-2 w-full">
      <div className="bg-gray-900 rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1 bg-gray-800 text-xs">
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              onLanguageChange?.(e.target.value);
            }}
            className="bg-transparent text-gray-400 outline-none cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
            <option value="plain">Plain Text</option>
          </select>
          <button
            onClick={() => navigator.clipboard.writeText(content)}
            className="text-gray-400 hover:text-white text-xs"
          >
            Copy
          </button>
        </div>
        <div
          className="p-4 font-mono text-sm text-gray-100 outline-none min-h-[60px] whitespace-pre-wrap"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.textContent || '')}
          onKeyDown={(e) => {
            // Allow Tab key for indentation in code blocks
            if (e.key === 'Tab') {
              e.preventDefault();
              document.execCommand('insertText', false, '  ');
              return;
            }
            // Allow Enter for new lines in code blocks
            if (e.key === 'Enter') {
              e.preventDefault();
              document.execCommand('insertLineBreak');
              return;
            }
            onKeyDown(e);
          }}
          data-placeholder="// Write your code here..."
        >
          {content}
        </div>
      </div>
    </div>
  );
};

// Toggle Block Component
const ToggleBlock = ({ content, children, expanded, onChange, onKeyDown, onToggle, autoFocus, onFocused }) => {
  const [isOpen, setIsOpen] = useState(expanded ?? true);

  return (
    <div className="my-1 px-2 w-full">
      <div className="flex items-start">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            onToggle?.(!isOpen);
          }}
          className="mr-1 mt-1 p-0.5 hover:bg-gray-200 rounded text-gray-500 flex-shrink-0"
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <EditableBlock
          content={content}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Toggle heading"
          className="flex-1 font-medium"
          autoFocus={autoFocus}
          onFocused={onFocused}
        />
      </div>
      {isOpen && (
        <div className="ml-6 pl-2 border-l-2 border-gray-200 mt-1">
          {children || (
            <div className="text-gray-400 text-sm italic py-1">
              Empty toggle. Click to add content.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TableOfContentsBlock = ({ pageId }) => {
  const { state } = useStore();
  const page = state.pages[pageId];

  if (!page) return null;

  const headings = page.blockIds
    .map(id => state.blocks[id])
    .filter(b => b && b.type.startsWith('heading-'));

  if (headings.length === 0) {
    return <div className="text-gray-400 italic p-2">No headings found for Table of Contents</div>;
  }

  const scrollToHeading = (block) => {
    // Find the block's DOM anchor element
    const anchorId = `block-${block.id}`;
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Brief highlight to indicate which heading was jumped to
      el.style.transition = 'background-color 0.3s';
      el.style.backgroundColor = 'rgba(11, 111, 255, 0.08)';
      setTimeout(() => { el.style.backgroundColor = ''; }, 1200);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md my-2">
      <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Table of Contents</div>
      <div className="space-y-1">
        {headings.map(block => {
          const level = parseInt(block.type.split('-')[1]);
          return (
            <div
              key={block.id}
              className="text-sm text-gray-600 hover:underline cursor-pointer hover:text-xotion-blue truncate"
              style={{ marginLeft: `${(level - 1) * 16}px` }}
              onClick={() => scrollToHeading(block)}
            >
              {block.content || 'Untitled Heading'}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Column Layout Block Component with drag-and-drop between columns
const ColumnLayoutBlock = ({ block, pageId }) => {
  const { updateBlock, addBlock } = useStore();
  const columns = block.properties?.columns || [[], []];
  const colCount = columns.length;
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragOver = (e, colIdx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colIdx);
  };

  const handleDrop = (e, targetColIdx) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCol(null);

    const draggedBlockId = e.dataTransfer.getData('text/block-id');
    const sourceColIdx = parseInt(e.dataTransfer.getData('text/col-idx'), 10);

    if (!draggedBlockId || isNaN(sourceColIdx) || sourceColIdx === targetColIdx) return;

    // Move the block from sourceCol to targetCol
    const newColumns = columns.map((col, idx) => {
      if (idx === sourceColIdx) {
        return col.filter(id => id !== draggedBlockId);
      }
      if (idx === targetColIdx) {
        return [...col, draggedBlockId];
      }
      return col;
    });

    updateBlock(block.id, { properties: { ...block.properties, columns: newColumns } });
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleAddToColumn = (colIdx) => {
    const newBlockId = addBlock(pageId, 'text', '');
    // We need to add the newly created block to the column
    // Use a small delay to let the store update
    setTimeout(() => {
      updateBlock(block.id, {
        properties: {
          ...block.properties,
          columns: columns.map((col, idx) => idx === colIdx ? [...col, newBlockId] : col)
        }
      });
    }, 10);
  };

  return (
    <div className="my-2 px-2 w-full">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
        {columns.map((colBlockIds, colIdx) => (
          <div
            key={colIdx}
            className={clsx(
              "min-h-[60px] border border-dashed rounded-md p-2 transition-colors",
              dragOverCol === colIdx ? "border-blue-400 bg-blue-50" : "border-gray-200"
            )}
            onDragOver={(e) => handleDragOver(e, colIdx)}
            onDrop={(e) => handleDrop(e, colIdx)}
            onDragLeave={handleDragLeave}
          >
            {colBlockIds.length > 0 ? (
              colBlockIds.map(bid => (
                <div
                  key={bid}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/block-id', bid);
                    e.dataTransfer.setData('text/col-idx', String(colIdx));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <BlockRenderer key={bid} blockId={bid} pageId={pageId} />
                </div>
              ))
            ) : (
              <div className="text-gray-300 text-sm italic p-2 text-center">
                Drop blocks here or
                <button
                  className="ml-1 text-blue-400 hover:text-blue-600 hover:underline"
                  onClick={() => handleAddToColumn(colIdx)}
                >
                  add a block
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const BlockRenderer = ({ blockId, pageId, numberedListIndex }) => {
  const { state, updateBlock, deleteBlock, addBlock, clearFocus } = useStore();
  const block = state.blocks[blockId];
  const [showMenu, setShowMenu] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showDragMenu, setShowDragMenu] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [formattingToolbar, setFormattingToolbar] = useState(null);
  const blockRef = useRef(null);
  const shouldFocus = state.focusBlockId === blockId;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: blockId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Selection listener for formatting toolbar
  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to let the selection finalize
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel && sel.toString().trim().length > 0 && blockRef.current && blockRef.current.contains(sel.anchorNode)) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setFormattingToolbar({ top: rect.top, left: rect.left + rect.width / 2 - 100 });
        } else if (blockRef.current && !blockRef.current.contains(sel?.anchorNode)) {
          setFormattingToolbar(null);
        }
      }, 10);
    };

    const handleMouseDown = (e) => {
      if (formattingToolbar && blockRef.current && !blockRef.current.contains(e.target)) {
        setFormattingToolbar(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [formattingToolbar]);

  if (!block) return null;

  // Block color styles
  const blockColor = block.properties?.color;
  const blockBgColor = block.properties?.bgColor;
  const colorStyle = {};
  if (blockColor && TEXT_COLORS[blockColor]) {
    colorStyle.color = TEXT_COLORS[blockColor];
  }
  if (blockBgColor && BG_COLORS[blockBgColor]) {
    colorStyle.backgroundColor = BG_COLORS[blockBgColor];
  }

  const handleTurnInto = (newType) => {
    if (newType === 'column-layout-2') {
      updateBlock(blockId, { type: 'column-layout', content: '', properties: { columns: [[blockId], []] } });
      // Create a new block for the second column
      addBlock(pageId, 'text', '', blockId);
      return;
    }
    if (newType === 'column-layout-3') {
      updateBlock(blockId, { type: 'column-layout', content: '', properties: { columns: [[], [], []] } });
      return;
    }
    if (newType === 'divider') {
      updateBlock(blockId, { type: newType, content: '' });
    } else if (newType === 'code') {
      updateBlock(blockId, { type: newType, properties: { ...block.properties, language: 'javascript' } });
    } else if (newType === 'toggle') {
      updateBlock(blockId, { type: newType, properties: { ...block.properties, expanded: true } });
    } else {
      updateBlock(blockId, { type: newType });
    }
  };

  const handleDuplicateBlock = () => {
    const newBlockId = generateId();
    const newBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: newBlockId,
      createdDate: new Date().toISOString(),
    };
    // We need to add the block via the store - use addBlock then update it
    addBlock(pageId, block.type, block.content, blockId);
    // The newly added block gets properties from addBlock default, we need to update it
    // Actually, addBlock creates a basic block. Let's directly dispatch through updateBlock after add
    // For simplicity, add then update with block properties
    setTimeout(() => {
      const page = state.pages[pageId];
      if (page) {
        const idx = page.blockIds.indexOf(blockId);
        if (idx >= 0 && page.blockIds.length > idx + 1) {
          const nextId = page.blockIds[idx + 1];
          // If the next block is the newly added one
          if (state.blocks[nextId] && state.blocks[nextId].content === '') {
            updateBlock(nextId, { content: block.content, properties: { ...block.properties } });
          }
        }
      }
    }, 50);
  };

  const handleBlockColorChange = (color) => {
    updateBlock(blockId, { properties: { ...block.properties, color } });
  };

  const handleBlockBgColorChange = (bgColor) => {
    updateBlock(blockId, { properties: { ...block.properties, bgColor } });
  };

  const handleMentionSelect = (item) => {
    if (item.type === 'page') {
      // Insert a mention link
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        // Remove the @ and filter text from content
        const content = block.content || '';
        const atIdx = content.lastIndexOf('@');
        if (atIdx >= 0) {
          const newContent = content.substring(0, atIdx);
          updateBlock(blockId, { content: newContent + `@${item.label} ` });
        }
      }
    } else {
      const content = block.content || '';
      const atIdx = content.lastIndexOf('@');
      if (atIdx >= 0) {
        const newContent = content.substring(0, atIdx);
        updateBlock(blockId, { content: newContent + `@${item.label} ` });
      }
    }
    setShowMentionMenu(false);
    setMentionFilter('');
  };

  const handleChange = (content) => {
    updateBlock(blockId, { content });
    // Close slash menu if "/" is removed
    if (showSlashMenu && !content.includes('/')) {
      setShowSlashMenu(false);
    }
    // Handle @ mention
    if (showMentionMenu) {
      const atIdx = content.lastIndexOf('@');
      if (atIdx >= 0) {
        setMentionFilter(content.substring(atIdx + 1));
      } else {
        setShowMentionMenu(false);
        setMentionFilter('');
      }
    }
  };

  const handleCaptionChange = (caption) => {
    updateBlock(blockId, { properties: { ...block.properties, caption } });
  };

  const handleKeyDown = (e) => {
    // Let slash menu handle its own keys
    if (showSlashMenu) {
      if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
        return;
      }
    }

    // Enter key - create new block
    if (e.key === 'Enter' && !e.shiftKey && !showSlashMenu) {
      e.preventDefault();
      e.stopPropagation();
      addBlock(pageId, 'text', '', blockId);
      return;
    }

    // Backspace on empty block - delete it
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      e.stopPropagation();
      deleteBlock(pageId, blockId);
      return;
    }

    // Slash key - show command menu
    if (e.key === '/') {
      setShowSlashMenu(true);
    }

    // @ key - show mention menu
    if (e.key === '@') {
      setShowMentionMenu(true);
      setMentionFilter('');
    }
  };

  const handleSlashSelect = (type) => {
    const newContent = (block.content || '').replace(/\//g, '').trim();

    if (type === 'image') {
      updateBlock(blockId, {
        type,
        content: '',
        properties: {
          url: 'https://picsum.photos/800/400?random=' + Date.now(),
          caption: ''
        }
      });
    } else if (type === 'divider') {
      updateBlock(blockId, { type, content: '' });
    } else if (type === 'toc') {
      updateBlock(blockId, { type, content: '' });
    } else if (type === 'table') {
      updateBlock(blockId, {
        type,
        content: '',
        properties: {
          headers: ['Column 1', 'Column 2', 'Column 3'],
          rows: [['', '', ''], ['', '', '']]
        }
      });
    } else if (type === 'code') {
      updateBlock(blockId, {
        type,
        content: '',
        properties: { language: 'javascript' }
      });
    } else if (type === 'toggle') {
      updateBlock(blockId, {
        type,
        content: newContent || 'Toggle heading',
        properties: { expanded: true }
      });
    } else if (type === 'column-layout-2' || type === 'column-layout-3') {
      handleTurnInto(type);
    } else {
      updateBlock(blockId, { type, content: newContent });
    }
    setShowSlashMenu(false);
  };

  // Table handlers
  const handleTableUpdateCell = (rowIndex, colIndex, value) => {
    const props = block.properties || {};
    if (rowIndex === -1) {
      // Update headers
      updateBlock(blockId, {
        properties: { ...props, headers: value }
      });
    } else {
      const rows = [...(props.rows || [])];
      rows[rowIndex] = [...rows[rowIndex]];
      rows[rowIndex][colIndex] = value;
      updateBlock(blockId, {
        properties: { ...props, rows }
      });
    }
  };

  const handleTableAddRow = () => {
    const props = block.properties || {};
    const colCount = (props.headers || []).length || 3;
    const newRow = Array(colCount).fill('');
    updateBlock(blockId, {
      properties: {
        ...props,
        rows: [...(props.rows || []), newRow]
      }
    });
  };

  const handleTableAddColumn = () => {
    const props = block.properties || {};
    const headers = [...(props.headers || []), `Column ${(props.headers || []).length + 1}`];
    const rows = (props.rows || []).map(row => [...row, '']);
    updateBlock(blockId, {
      properties: { ...props, headers, rows }
    });
  };

  const handleTableDeleteRow = (rowIndex) => {
    const props = block.properties || {};
    const rows = (props.rows || []).filter((_, i) => i !== rowIndex);
    updateBlock(blockId, {
      properties: { ...props, rows }
    });
  };

  const handleTableDeleteColumn = (colIndex) => {
    const props = block.properties || {};
    const headers = (props.headers || []).filter((_, i) => i !== colIndex);
    const rows = (props.rows || []).map(row => row.filter((_, i) => i !== colIndex));
    updateBlock(blockId, {
      properties: { ...props, headers, rows }
    });
  };

  const toggleCollapse = () => {
    updateBlock(blockId, {
      properties: { ...block.properties, collapsed: !block.properties?.collapsed }
    });
  };

  const handleAddBlockClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addBlock(pageId, 'text', '', blockId);
  };

  const handleFocused = () => {
    if (shouldFocus) clearFocus();
  };

  const renderContent = () => {
    const focusProps = { autoFocus: shouldFocus, onFocused: handleFocused };

    switch (block.type) {
      case 'heading-1':
        return (
          <HeadingBlock
            level={1}
            content={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            collapsed={block.properties?.collapsed}
            onToggle={toggleCollapse}
            {...focusProps}
          />
        );
      case 'heading-2':
        return (
          <HeadingBlock
            level={2}
            content={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            collapsed={block.properties?.collapsed}
            onToggle={toggleCollapse}
            {...focusProps}
          />
        );
      case 'heading-3':
        return (
          <HeadingBlock
            level={3}
            content={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            collapsed={block.properties?.collapsed}
            onToggle={toggleCollapse}
            {...focusProps}
          />
        );
      case 'todo':
        return (
          <TodoBlock
            content={block.content}
            checked={block.properties?.checked}
            onChange={handleChange}
            onCheck={() => updateBlock(blockId, {
              properties: { ...block.properties, checked: !block.properties?.checked }
            })}
            onKeyDown={handleKeyDown}
            {...focusProps}
          />
        );
      case 'bullet-list':
        return (
          <ListBlock
            type="bullet-list"
            content={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...focusProps}
          />
        );
      case 'numbered-list':
        return (
          <ListBlock
            type="numbered-list"
            content={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            number={numberedListIndex}
            {...focusProps}
          />
        );
      case 'image':
        return (
          <ImageBlock
            src={block.properties?.url}
            caption={block.properties?.caption}
            onCaptionChange={handleCaptionChange}
            onKeyDown={handleKeyDown}
          />
        );
      case 'divider':
        return <DividerBlock />;
      case 'callout':
        return (
          <CalloutBlock
            content={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            icon={block.properties?.icon}
            bgColor={block.properties?.bgColor}
            {...focusProps}
          />
        );
      case 'quote':
        return (
          <QuoteBlock
            content={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...focusProps}
          />
        );
      case 'table':
        return (
          <TableBlock
            data={block.properties}
            onUpdateCell={handleTableUpdateCell}
            onAddRow={handleTableAddRow}
            onAddColumn={handleTableAddColumn}
            onDeleteRow={handleTableDeleteRow}
            onDeleteColumn={handleTableDeleteColumn}
          />
        );
      case 'code':
        return (
          <CodeBlock
            content={block.content}
            language={block.properties?.language}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onLanguageChange={(lang) => updateBlock(blockId, {
              properties: { ...block.properties, language: lang }
            })}
          />
        );
      case 'toggle':
        return (
          <ToggleBlock
            content={block.content}
            expanded={block.properties?.expanded}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onToggle={(expanded) => updateBlock(blockId, {
              properties: { ...block.properties, expanded }
            })}
            {...focusProps}
          />
        );
      case 'toc':
        return <TableOfContentsBlock pageId={pageId} />;
      case 'column-layout':
        return <ColumnLayoutBlock block={block} pageId={pageId} />;
      default:
        return (
          <TextBlock
            content={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...focusProps}
          />
        );
    }
  };

  return (
    <div
      id={`block-${blockId}`}
      ref={setNodeRef}
      style={{ ...style, ...colorStyle }}
      className={clsx("group relative flex items-start -ml-8 pl-8 py-0.5 w-full", blockBgColor && blockBgColor !== 'default_background' && "rounded")}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => { setShowMenu(false); if (!showDragMenu) setShowDragMenu(false); }}
    >
      {/* Drag Handle & Menu Trigger */}
      <div
        className={clsx(
          "absolute left-0 top-1.5 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10",
          (showMenu || showDragMenu) && "opacity-100"
        )}
      >
        <div
          className="p-0.5 hover:bg-gray-200 rounded cursor-pointer"
          onClick={handleAddBlockClick}
        >
          <Plus size={14} className="text-gray-400" />
        </div>
        <div className="relative">
          <div
            className="p-0.5 hover:bg-gray-200 rounded ml-0.5 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setShowDragMenu(!showDragMenu); }}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} className="text-gray-400" />
          </div>
          {showDragMenu && (
            <BlockDragMenu
              blockId={blockId}
              pageId={pageId}
              onClose={() => setShowDragMenu(false)}
              onDelete={() => deleteBlock(pageId, blockId)}
              onDuplicate={handleDuplicateBlock}
              onTurnInto={handleTurnInto}
              onColorChange={handleBlockColorChange}
              onBgColorChange={handleBlockBgColorChange}
              currentColor={blockColor || 'default'}
              currentBgColor={blockBgColor || 'default_background'}
              currentType={block.type}
            />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 relative" ref={blockRef}>
        {renderContent()}
        {showSlashMenu && (
          <SlashMenu
            onClose={() => setShowSlashMenu(false)}
            onSelect={handleSlashSelect}
          />
        )}
        {showMentionMenu && (
          <MentionMenu
            onSelect={handleMentionSelect}
            onClose={() => { setShowMentionMenu(false); setMentionFilter(''); }}
            filter={mentionFilter}
          />
        )}
      </div>

      {/* Formatting Toolbar */}
      {formattingToolbar && <FormattingToolbar position={formattingToolbar} />}
    </div>
  );
};
