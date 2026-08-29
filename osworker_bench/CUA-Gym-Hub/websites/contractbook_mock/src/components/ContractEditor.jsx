import React, { useRef, useCallback } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare,
  Quote, Minus, Undo, Redo,
  AlignLeft,
} from 'lucide-react';

export default function ContractEditor({ content, onChange }) {
  const editorRef = useRef(null);

  const exec = useCallback((command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    const html = editorRef.current?.innerHTML || '';
    onChange(html);
  }, [onChange]);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || '';
    onChange(html);
  };

  const isActive = (command) => {
    try { return document.queryCommandState(command); } catch (e) { return false; }
  };

  const insertHeading = (tag) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
    const html = editorRef.current?.innerHTML || '';
    onChange(html);
  };

  const insertBulletList = () => exec('insertUnorderedList');
  const insertOrderedList = () => exec('insertOrderedList');

  const insertBlockquote = () => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, 'blockquote');
    const html = editorRef.current?.innerHTML || '';
    onChange(html);
  };

  const insertHR = () => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, '<hr/>');
    const html = editorRef.current?.innerHTML || '';
    onChange(html);
  };

  const ToolBtn = ({ icon: Icon, command, title, onClick }) => (
    <button
      className={`toolbar-btn ${command && isActive(command) ? 'active' : ''}`}
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        else if (command) exec(command);
      }}
    >
      {Icon ? <Icon size={14} /> : null}
    </button>
  );

  return (
    <div>
      <div className="editor-toolbar">
        <ToolBtn icon={Bold} command="bold" title="Bold (Ctrl+B)" />
        <ToolBtn icon={Italic} command="italic" title="Italic (Ctrl+I)" />
        <ToolBtn icon={Underline} command="underline" title="Underline (Ctrl+U)" />
        <ToolBtn icon={Strikethrough} command="strikethrough" title="Strikethrough" />
        <div className="toolbar-sep" />
        <button className="toolbar-btn" title="Heading 1" onMouseDown={(e) => { e.preventDefault(); insertHeading('h1'); }}>H1</button>
        <button className="toolbar-btn" title="Heading 2" onMouseDown={(e) => { e.preventDefault(); insertHeading('h2'); }}>H2</button>
        <button className="toolbar-btn" title="Heading 3" onMouseDown={(e) => { e.preventDefault(); insertHeading('h3'); }}>H3</button>
        <div className="toolbar-sep" />
        <ToolBtn icon={List} title="Bullet List" onClick={insertBulletList} />
        <ToolBtn icon={ListOrdered} title="Numbered List" onClick={insertOrderedList} />
        <div className="toolbar-sep" />
        <ToolBtn icon={Quote} title="Block Quote" onClick={insertBlockquote} />
        <ToolBtn icon={Minus} title="Horizontal Rule" onClick={insertHR} />
        <div className="toolbar-sep" />
        <ToolBtn icon={Undo} command="undo" title="Undo" />
        <ToolBtn icon={Redo} command="redo" title="Redo" />
      </div>
      <div
        ref={editorRef}
        className="editor-area"
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={handleInput}
        style={{ minHeight: 600 }}
      />
    </div>
  );
}
