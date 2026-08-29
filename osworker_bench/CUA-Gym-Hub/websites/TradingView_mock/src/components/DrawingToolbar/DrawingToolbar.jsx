import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import {
  MousePointer2, Minus, TrendingUp, Square, Activity,
  Type, Ruler, ZoomIn, Trash2, GitBranch
} from 'lucide-react';

const TOOLS = [
  { id: 'cursor', icon: MousePointer2, label: 'Cursor', group: 'cursor' },
  { id: 'crosshair', icon: null, label: 'Crosshair', group: 'cursor', isCross: true },
  { id: 'separator_1', separator: true },
  { id: 'trend_line', icon: TrendingUp, label: 'Trend Line', group: 'lines' },
  { id: 'horizontal_line', icon: Minus, label: 'Horizontal Line', group: 'lines' },
  { id: 'vertical_line', icon: null, label: 'Vertical Line', group: 'lines', isVertical: true },
  { id: 'separator_2', separator: true },
  { id: 'rectangle', icon: Square, label: 'Rectangle', group: 'shapes' },
  { id: 'fibonacci', icon: GitBranch, label: 'Fibonacci Retracement', group: 'shapes' },
  { id: 'separator_3', separator: true },
  { id: 'text', icon: Type, label: 'Text Note', group: 'text' },
  { id: 'measure', icon: Ruler, label: 'Measure', group: 'tools' },
  { id: 'zoom', icon: ZoomIn, label: 'Zoom', group: 'tools' },
  { id: 'separator_4', separator: true },
  { id: 'eraser', icon: Trash2, label: 'Clear all drawings', group: 'actions' },
];

function CrosshairIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="7.5" y1="1" x2="7.5" y2="14" />
      <line x1="1" y1="7.5" x2="14" y2="7.5" />
      <circle cx="7.5" cy="7.5" r="3" />
    </svg>
  );
}

function VerticalLineIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="7.5" y1="1" x2="7.5" y2="14" strokeDasharray="2 1.5" />
      <line x1="4" y1="1" x2="4" y2="14" strokeOpacity="0.3" />
      <line x1="11" y1="1" x2="11" y2="14" strokeOpacity="0.3" />
    </svg>
  );
}

export default function DrawingToolbar() {
  const { state, setSelectedDrawingTool, updateState } = useAppContext();
  const activeTool = state.uiState.selectedDrawingTool || 'cursor';
  const [hoveredId, setHoveredId] = useState(null);

  const handleTool = (toolId) => {
    if (toolId === 'eraser') {
      // Clear all drawings
      updateState(prev => ({
        ...prev,
        drawings: [],
        chartState: { ...prev.chartState, drawings: [] },
      }));
      return;
    }
    setSelectedDrawingTool(toolId === activeTool ? 'cursor' : toolId);
  };

  return (
    <div style={{
      width: 48,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 8,
      gap: 2,
      overflowY: 'auto',
    }}>
      {TOOLS.map(tool => {
        if (tool.separator) {
          return (
            <div key={tool.id} style={{
              width: 28,
              height: 1,
              background: 'var(--border)',
              margin: '4px 0',
            }} />
          );
        }

        const isActive = activeTool === tool.id;
        const isHovered = hoveredId === tool.id;

        let IconComp = null;
        if (tool.isCross) IconComp = CrosshairIcon;
        else if (tool.isVertical) IconComp = VerticalLineIcon;
        else if (tool.icon) IconComp = tool.icon;

        return (
          <div
            key={tool.id}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredId(tool.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => handleTool(tool.id)}
              title={tool.label}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(41,98,255,0.15)' : isHovered ? 'var(--bg-hover)' : 'transparent',
                transition: 'background-color 0.1s, color 0.1s',
                cursor: 'pointer',
              }}
            >
              {IconComp && <IconComp size={15} />}
            </button>

            {/* Tooltip */}
            {isHovered && (
              <div style={{
                position: 'absolute',
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginLeft: 8,
                background: '#363A45',
                color: 'var(--text-primary)',
                fontSize: 11,
                padding: '4px 8px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                zIndex: 9999,
                pointerEvents: 'none',
              }}>
                {tool.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
