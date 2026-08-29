import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo2, Redo2, Printer, SpellCheck, PaintBucket,
  Bold, Italic, Underline, Strikethrough,
  Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  IndentDecrease, IndentIncrease,
  ChevronDown, Minus, Type, Baseline, Highlighter, RemoveFormatting, ChevronsUpDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from './Toast';

const FONT_FAMILIES = [
  'Arial',
  'Courier New',
  'Georgia',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'Comic Sans MS',
  'Impact',
  'Roboto',
  'Open Sans',
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72, 96];

const HEADING_STYLES = [
  { label: 'Normal Text', level: 0 },
  { label: 'Title', level: 'title' },
  { label: 'Subtitle', level: 'subtitle' },
  { label: 'Heading 1', level: 1 },
  { label: 'Heading 2', level: 2 },
  { label: 'Heading 3', level: 3 },
  { label: 'Heading 4', level: 4 },
  { label: 'Heading 5', level: 5 },
  { label: 'Heading 6', level: 6 },
];

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
];

const HIGHLIGHT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc',
  '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000',
  '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#ead1dc',
  '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#d5a6bd',
];

const ZOOM_LEVELS = [50, 75, 90, 100, 110, 125, 150, 200];

function Dropdown({ trigger, children, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={clsx(
            'absolute top-full left-0 mt-1 bg-white rounded shadow-lg border border-gray-200 z-50',
            className
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ onClick, active, disabled, title, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        'p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed min-w-[28px] h-[28px] flex items-center justify-center',
        active && 'bg-[#d3e3fd] text-[#1a73e8]',
        className
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-300 mx-0.5" />;
}

const Toolbar = ({ editor, zoom = 100, onZoomChange }) => {
  const [fontSizeInput, setFontSizeInput] = useState('11');
  const [paintFormatActive, setPaintFormatActive] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState(null);
  const { showToast } = useToast();

  // Sync font size from editor selection
  useEffect(() => {
    if (!editor) return;
    const updateFontSize = () => {
      const attrs = editor.getAttributes('textStyle');
      if (attrs.fontSize) {
        const size = parseInt(attrs.fontSize, 10);
        if (!isNaN(size)) setFontSizeInput(String(size));
      }
    };
    editor.on('selectionUpdate', updateFontSize);
    editor.on('transaction', updateFontSize);
    return () => {
      editor.off('selectionUpdate', updateFontSize);
      editor.off('transaction', updateFontSize);
    };
  }, [editor]);

  // Paint format: capture formatting from current selection
  const handlePaintFormat = useCallback(() => {
    if (!editor) return;
    if (paintFormatActive) {
      // Deactivate paint format
      setPaintFormatActive(false);
      setCopiedFormat(null);
      return;
    }
    // Capture current formatting marks
    const marks = {};
    marks.bold = editor.isActive('bold');
    marks.italic = editor.isActive('italic');
    marks.underline = editor.isActive('underline');
    marks.strike = editor.isActive('strike');
    marks.superscript = editor.isActive('superscript');
    marks.subscript = editor.isActive('subscript');
    const textStyle = editor.getAttributes('textStyle');
    if (textStyle.color) marks.color = textStyle.color;
    if (textStyle.fontFamily) marks.fontFamily = textStyle.fontFamily;
    if (textStyle.fontSize) marks.fontSize = textStyle.fontSize;
    const highlight = editor.getAttributes('highlight');
    if (highlight.color) marks.highlightColor = highlight.color;

    setCopiedFormat(marks);
    setPaintFormatActive(true);
    showToast('Paint format active — select text to apply formatting');
  }, [editor, paintFormatActive, showToast]);

  // Apply paint format when clicking in the editor while active
  useEffect(() => {
    if (!editor || !paintFormatActive || !copiedFormat) return;
    const handleClick = () => {
      const { from, to } = editor.state.selection;
      if (from === to) return; // No selection, wait for selection
      let chain = editor.chain().focus();
      // Clear existing marks first
      chain = chain.unsetAllMarks();
      // Apply copied marks
      if (copiedFormat.bold) chain = chain.setBold();
      if (copiedFormat.italic) chain = chain.setItalic();
      if (copiedFormat.underline) chain = chain.setUnderline();
      if (copiedFormat.strike) chain = chain.setStrike();
      if (copiedFormat.superscript) chain = chain.setSuperscript();
      if (copiedFormat.subscript) chain = chain.setSubscript();
      if (copiedFormat.color) chain = chain.setColor(copiedFormat.color);
      if (copiedFormat.fontFamily) chain = chain.setFontFamily(copiedFormat.fontFamily);
      if (copiedFormat.fontSize) chain = chain.setFontSize(copiedFormat.fontSize);
      if (copiedFormat.highlightColor) chain = chain.setHighlight({ color: copiedFormat.highlightColor });
      chain.run();
      // Deactivate after applying
      setPaintFormatActive(false);
      setCopiedFormat(null);
    };
    editor.on('selectionUpdate', handleClick);
    return () => {
      editor.off('selectionUpdate', handleClick);
    };
  }, [editor, paintFormatActive, copiedFormat]);

  const getCurrentHeadingLabel = useCallback(() => {
    if (!editor) return 'Normal Text';
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) return `Heading ${i}`;
    }
    return 'Normal Text';
  }, [editor]);

  const getCurrentFontFamily = useCallback(() => {
    if (!editor) return 'Arial';
    const attrs = editor.getAttributes('textStyle');
    return attrs.fontFamily || 'Arial';
  }, [editor]);

  const applyHeadingStyle = useCallback((style) => {
    if (!editor) return;
    if (style.level === 0) {
      editor.chain().focus().setParagraph().run();
    } else if (style.level === 'title') {
      editor.chain().focus().setHeading({ level: 1 }).run();
    } else if (style.level === 'subtitle') {
      editor.chain().focus().setHeading({ level: 2 }).run();
    } else {
      editor.chain().focus().setHeading({ level: style.level }).run();
    }
  }, [editor]);

  const applyFontFamily = useCallback((font) => {
    if (!editor) return;
    editor.chain().focus().setFontFamily(font).run();
  }, [editor]);

  const applyFontSize = useCallback((size) => {
    if (!editor) return;
    setFontSizeInput(String(size));
    editor.chain().focus().setFontSize(`${size}pt`).run();
  }, [editor]);

  const handleFontSizeInputChange = useCallback((e) => {
    setFontSizeInput(e.target.value);
  }, []);

  const handleFontSizeInputBlur = useCallback(() => {
    const size = parseInt(fontSizeInput, 10);
    if (!isNaN(size) && size > 0 && size <= 400) {
      applyFontSize(size);
    }
  }, [fontSizeInput, applyFontSize]);

  const handleFontSizeInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  }, []);

  const incrementFontSize = useCallback((delta) => {
    const current = parseInt(fontSizeInput, 10) || 11;
    const newSize = Math.max(1, Math.min(400, current + delta));
    setFontSizeInput(String(newSize));
    applyFontSize(newSize);
  }, [fontSizeInput, applyFontSize]);

  const setTextColor = useCallback((color) => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
  }, [editor]);

  const setHighlightColor = useCallback((color) => {
    if (!editor) return;
    editor.chain().focus().setHighlight({ color }).run();
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = previousUrl || 'https://example.com';
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: 'https://picsum.photos/800/450?random=docs-image' }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 px-3 py-1 bg-[#edf2fa] rounded-full mx-2 my-1 flex-wrap">
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => window.print()} title="Print (Ctrl+P)">
        <Printer size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => showToast('Spell check completed: no issues found')} title="Spelling and grammar check">
        <SpellCheck size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={handlePaintFormat} active={paintFormatActive} title="Paint format">
        <PaintBucket size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Zoom */}
      <Dropdown
        trigger={
          <button className="flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-gray-200 text-xs text-gray-600 h-[28px]">
            <span>{zoom}%</span>
            <ChevronDown size={12} className="shrink-0" />
          </button>
        }
        className="w-[100px] py-1"
      >
        {ZOOM_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onZoomChange?.(level)}
            className={clsx(
              'w-full text-left px-3 py-1 text-sm hover:bg-gray-100',
              zoom === level && 'text-blue-600 font-medium'
            )}
          >
            {level}%
          </button>
        ))}
      </Dropdown>

      <ToolbarDivider />

      {/* Heading Style Dropdown */}
      <Dropdown
        trigger={
          <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-gray-200 text-sm min-w-[120px] text-left h-[28px]">
            <span className="truncate">{getCurrentHeadingLabel()}</span>
            <ChevronDown size={14} className="shrink-0" />
          </button>
        }
        className="w-[200px] py-1 max-h-[300px] overflow-y-auto"
      >
        {HEADING_STYLES.map((style) => (
          <button
            key={style.label}
            onClick={() => applyHeadingStyle(style)}
            className={clsx(
              'w-full text-left px-3 py-1.5 hover:bg-gray-100',
              style.level === 'title' && 'text-2xl',
              style.level === 'subtitle' && 'text-lg text-gray-500',
              typeof style.level === 'number' && style.level === 1 && 'text-xl font-bold',
              typeof style.level === 'number' && style.level === 2 && 'text-lg font-bold',
              typeof style.level === 'number' && style.level === 3 && 'text-base font-bold',
              typeof style.level === 'number' && style.level >= 4 && 'text-sm font-bold',
              style.level === 0 && 'text-sm'
            )}
          >
            {style.label}
          </button>
        ))}
      </Dropdown>

      <ToolbarDivider />

      {/* Font Family Dropdown */}
      <Dropdown
        trigger={
          <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-gray-200 text-sm min-w-[100px] text-left h-[28px]">
            <span className="truncate" style={{ fontFamily: getCurrentFontFamily() }}>
              {getCurrentFontFamily()}
            </span>
            <ChevronDown size={14} className="shrink-0" />
          </button>
        }
        className="w-[200px] py-1 max-h-[300px] overflow-y-auto"
      >
        {FONT_FAMILIES.map((font) => (
          <button
            key={font}
            onClick={() => applyFontFamily(font)}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
            style={{ fontFamily: font }}
          >
            {font}
          </button>
        ))}
      </Dropdown>

      <ToolbarDivider />

      {/* Font Size */}
      <div className="flex items-center">
        <ToolbarButton onClick={() => incrementFontSize(-1)} title="Decrease font size">
          <Minus size={14} />
        </ToolbarButton>
        <input
          type="text"
          value={fontSizeInput}
          onChange={handleFontSizeInputChange}
          onBlur={handleFontSizeInputBlur}
          onKeyDown={handleFontSizeInputKeyDown}
          className="w-8 h-[28px] text-center text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
        />
        <Dropdown
          trigger={
            <button className="p-0.5 rounded hover:bg-gray-200 h-[28px] flex items-center">
              <ChevronDown size={14} />
            </button>
          }
          className="w-[80px] py-1 max-h-[200px] overflow-y-auto"
        >
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => applyFontSize(size)}
              className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
            >
              {size}
            </button>
          ))}
        </Dropdown>
        <ToolbarButton onClick={() => incrementFontSize(1)} title="Increase font size">
          <span className="text-sm font-bold">+</span>
        </ToolbarButton>
      </div>

      <ToolbarDivider />

      {/* Bold / Italic / Underline / Strikethrough */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <Underline size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough (Alt+Shift+5)"
      >
        <Strikethrough size={16} />
      </ToolbarButton>

      {/* Text Color */}
      <Dropdown
        trigger={
          <button className="p-1 rounded hover:bg-gray-200 min-w-[28px] h-[28px] flex items-center justify-center" title="Text color">
            <div className="flex flex-col items-center">
              <Type size={14} />
              <div className="w-4 h-1 rounded-sm mt-px" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
            </div>
          </button>
        }
        className="p-2 w-[220px]"
      >
        <div className="text-xs font-medium text-gray-500 mb-1">Text color</div>
        <div className="grid grid-cols-10 gap-0.5">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setTextColor(color)}
              className="w-5 h-5 rounded-sm border border-gray-200 hover:scale-125 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </Dropdown>

      {/* Highlight Color */}
      <Dropdown
        trigger={
          <button className="p-1 rounded hover:bg-gray-200 min-w-[28px] h-[28px] flex items-center justify-center" title="Highlight color">
            <Highlighter size={16} />
          </button>
        }
        className="p-2 w-[180px]"
      >
        <div className="text-xs font-medium text-gray-500 mb-1">Highlight color</div>
        <div className="grid grid-cols-6 gap-0.5">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setHighlightColor(color)}
              className="w-5 h-5 rounded-sm border border-gray-200 hover:scale-125 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <button
          onClick={() => editor.chain().focus().unsetHighlight().run()}
          className="w-full text-left text-xs text-gray-500 mt-1 hover:text-gray-700 px-1"
        >
          None
        </button>
      </Dropdown>

      <ToolbarDivider />

      {/* Link / Image / Comment */}
      <ToolbarButton
        onClick={addLink}
        active={editor.isActive('link')}
        title="Insert link (Ctrl+K)"
      >
        <LinkIcon size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Insert image">
        <ImageIcon size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Align left (Ctrl+Shift+L)"
      >
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Align center (Ctrl+Shift+E)"
      >
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Align right (Ctrl+Shift+R)"
      >
        <AlignRight size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        active={editor.isActive({ textAlign: 'justify' })}
        title="Justify (Ctrl+Shift+J)"
      >
        <AlignJustify size={16} />
      </ToolbarButton>

      {/* Line Spacing */}
      <Dropdown
        trigger={
          <button className="p-1 rounded hover:bg-gray-200 min-w-[28px] h-[28px] flex items-center justify-center" title="Line & paragraph spacing">
            <ChevronsUpDown size={15} />
          </button>
        }
        className="w-[160px] py-1"
      >
        <div className="text-xs font-medium text-gray-400 px-3 py-1">Line spacing</div>
        {[
          { label: 'Single', value: '1' },
          { label: '1.15 (Default)', value: '1.15' },
          { label: '1.5', value: '1.5' },
          { label: 'Double', value: '2' },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => editor.chain().focus().setLineHeight(value).run()}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 text-gray-700"
          >
            {label}
          </button>
        ))}
      </Dropdown>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bulleted list (Ctrl+Shift+8)"
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered list (Ctrl+Shift+7)"
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive('taskList')}
        title="Checklist"
      >
        <CheckSquare size={16} />
      </ToolbarButton>

      {/* Indent / Outdent */}
      <ToolbarButton
        onClick={() => {
          if (editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')) {
            editor.chain().focus().liftListItem('listItem').run();
          } else {
            editor.chain().focus().outdent().run();
          }
        }}
        title="Decrease indent (Ctrl+[)"
      >
        <IndentDecrease size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          if (editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')) {
            editor.chain().focus().sinkListItem('listItem').run();
          } else {
            editor.chain().focus().indent().run();
          }
        }}
        title="Increase indent (Ctrl+])"
      >
        <IndentIncrease size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Clear Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        title="Clear formatting (Ctrl+\)"
      >
        <RemoveFormatting size={16} />
      </ToolbarButton>
    </div>
  );
};

export default Toolbar;
