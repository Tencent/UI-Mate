import React from 'react';
import {
  MousePointer2, LayoutGrid, Type, StickyNote, Pen,
  Square, ChevronsRight, Undo2, Redo2, Minus, Frame
} from 'lucide-react';

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)', shortcut: 'V' },
  { id: 'templates', icon: LayoutGrid, label: 'Templates', shortcut: null },
  { id: 'text', icon: Type, label: 'Text (T)', shortcut: 'T' },
  { id: 'sticky_note', icon: StickyNote, label: 'Sticky Note (N)', shortcut: 'N' },
  { id: 'pen', icon: Pen, label: 'Pen (P) — visual only', shortcut: 'P' },
  { id: 'shape', icon: Square, label: 'Shapes (S)', shortcut: 'S' },
  { id: 'frame', icon: Frame, label: 'Frame (F)', shortcut: 'F' },
  { id: 'connector', icon: Minus, label: 'Connector (L)', shortcut: 'L' },
  { id: 'more', icon: ChevronsRight, label: 'More tools', shortcut: null, hasDot: true },
];

export default function LeftToolbar({ activeTool, onToolSelect, onUndo, onRedo, connectorStart }) {
  return (
    <div className="left-toolbar">
      <div className="toolbar-tools">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`toolbar-tool-btn ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => onToolSelect(tool.id)}
            title={tool.label}
          >
            <tool.icon size={20} />
            {tool.hasDot && <span className="tool-dot" />}
            {/* Show a dot indicator when connector first click is done */}
            {tool.id === 'connector' && connectorStart && (
              <span className="tool-dot" style={{ background: '#f5a623' }} />
            )}
          </button>
        ))}
      </div>
      <div className="toolbar-separator" />
      <div className="toolbar-actions">
        <button
          className="toolbar-tool-btn"
          title="Undo (Ctrl+Z)"
          onClick={onUndo}
        >
          <Undo2 size={20} />
        </button>
        <button
          className="toolbar-tool-btn"
          title="Redo (Ctrl+Shift+Z)"
          onClick={onRedo}
        >
          <Redo2 size={20} />
        </button>
      </div>
    </div>
  );
}
