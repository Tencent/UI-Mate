import React, { useState, useRef, useEffect } from 'react'
import {
  RotateCcw, RotateCw, MousePointer, BarChart2, SlidersHorizontal,
  Link, Image, Type, Minus, Square, ChevronDown, ZoomIn, ZoomOut
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const CHART_TYPES_MENU = [
  { section: 'Table', items: [{ type: 'table', label: 'Table' }, { type: 'pivot_table', label: 'Pivot Table' }] },
  { section: 'Scorecard', items: [{ type: 'scorecard', label: 'Scorecard' }] },
  { section: 'Time Series', items: [{ type: 'time_series', label: 'Time Series' }] },
  { section: 'Bar', items: [{ type: 'bar', label: 'Bar Chart' }, { type: 'stacked_bar', label: 'Stacked Bar' }, { type: 'column', label: 'Column Chart' }] },
  { section: 'Line', items: [{ type: 'line', label: 'Line Chart' }, { type: 'area', label: 'Area Chart' }] },
  { section: 'Pie', items: [{ type: 'pie', label: 'Pie Chart' }, { type: 'donut', label: 'Donut Chart' }] },
  { section: 'Other', items: [{ type: 'geo', label: 'Geo Map' }, { type: 'scatter', label: 'Scatter Chart' }, { type: 'gauge', label: 'Gauge' }, { type: 'treemap', label: 'Treemap' }, { type: 'combo', label: 'Combo Chart' }] }
]

const CONTROL_TYPES_MENU = [
  { type: 'dropdown', label: 'Drop-down list' },
  { type: 'fixed_list', label: 'Fixed-size list' },
  { type: 'input_box', label: 'Input box' },
  { type: 'slider', label: 'Slider' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'date_range', label: 'Date range control' },
  { type: 'button', label: 'Button' }
]

function ToolbarDropdown({ children, items, onSelect, sections }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        className="icon-btn"
        style={{ display: 'flex', alignItems: 'center', gap: '2px', width: 'auto', padding: '4px 8px' }}
        onClick={() => setOpen(v => !v)}
      >
        {children}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="dropdown-menu" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, maxHeight: '400px', overflowY: 'auto' }}>
          {sections ? (
            sections.map(section => (
              <div key={section.section}>
                <div style={{ padding: '6px 16px', fontSize: '11px', color: '#5F6368', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {section.section}
                </div>
                {section.items.map(item => (
                  <div key={item.type} className="dropdown-item" onClick={() => { onSelect(item.type); setOpen(false) }}>
                    {item.label}
                  </div>
                ))}
              </div>
            ))
          ) : (
            items.map(item => (
              <div key={item.type} className="dropdown-item" onClick={() => { onSelect(item.type); setOpen(false) }}>
                {item.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function EditorToolbar({ report }) {
  const { state, dispatch } = useApp()
  const { editor } = state

  const setTool = (tool) => dispatch({ type: 'SET_EDITOR', payload: { activeTool: tool, activeChartType: null, activeControlType: null } })

  const selectChart = (chartType) => {
    dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'chart', activeChartType: chartType, activeControlType: null } })
  }

  const selectControl = (controlType) => {
    dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'control', activeChartType: null, activeControlType: controlType } })
  }

  const canUndo = editor.undoStack?.length > 0
  const canRedo = editor.redoStack?.length > 0

  const activeToolStyle = (tool) => editor.activeTool === tool ? 'active' : ''

  return (
    <div style={{
      height: '48px',
      background: '#F8F9FA',
      borderBottom: '1px solid #DADCE0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: '4px',
      flexShrink: 0
    }}>
      {/* Undo / Redo */}
      <button className={`icon-btn`} disabled={!canUndo} onClick={() => dispatch({ type: 'UNDO' })} title="Undo (Ctrl+Z)">
        <RotateCcw size={18} />
      </button>
      <button className={`icon-btn`} disabled={!canRedo} onClick={() => dispatch({ type: 'REDO' })} title="Redo (Ctrl+Shift+Z)">
        <RotateCw size={18} />
      </button>

      {/* Separator */}
      <div style={{ width: '1px', height: '24px', background: '#DADCE0', margin: '0 4px' }} />

      {/* Select tool */}
      <button
        className={`icon-btn ${editor.activeTool === 'select' ? 'active' : ''}`}
        onClick={() => setTool('select')}
        title="Select"
      >
        <MousePointer size={18} />
      </button>

      {/* Separator */}
      <div style={{ width: '1px', height: '24px', background: '#DADCE0', margin: '0 4px' }} />

      {/* Add chart dropdown */}
      <ToolbarDropdown sections={CHART_TYPES_MENU} onSelect={selectChart}>
        <BarChart2 size={18} />
        <span style={{ fontSize: '13px' }}>Add a chart</span>
      </ToolbarDropdown>

      {/* Add control dropdown */}
      <ToolbarDropdown items={CONTROL_TYPES_MENU} onSelect={selectControl}>
        <SlidersHorizontal size={18} />
        <span style={{ fontSize: '13px' }}>Add a control</span>
      </ToolbarDropdown>

      {/* Separator */}
      <div style={{ width: '1px', height: '24px', background: '#DADCE0', margin: '0 4px' }} />

      {/* Insert tools */}
      <button className={`icon-btn ${editor.activeTool === 'text' ? 'active' : ''}`} onClick={() => setTool('text')} title="Text">
        <Type size={18} />
      </button>
      <button className={`icon-btn ${editor.activeTool === 'image' ? 'active' : ''}`} onClick={() => setTool('image')} title="Image">
        <Image size={18} />
      </button>
      <button className={`icon-btn ${editor.activeTool === 'line' ? 'active' : ''}`} onClick={() => setTool('line')} title="Line">
        <Minus size={18} />
      </button>
      <button className={`icon-btn ${editor.activeTool === 'shape' ? 'active' : ''}`} onClick={() => setTool('shape')} title="Shape">
        <Square size={18} />
      </button>

      {/* Separator */}
      <div style={{ width: '1px', height: '24px', background: '#DADCE0', margin: '0 4px' }} />

      {/* Zoom controls */}
      <button className="icon-btn" onClick={() => dispatch({ type: 'SET_EDITOR', payload: { zoom: Math.max(25, editor.zoom - 10) } })} title="Zoom out">
        <ZoomOut size={18} />
      </button>
      <div style={{ fontSize: '12px', color: '#5F6368', minWidth: '40px', textAlign: 'center' }}>{editor.zoom}%</div>
      <button className="icon-btn" onClick={() => dispatch({ type: 'SET_EDITOR', payload: { zoom: Math.min(200, editor.zoom + 10) } })} title="Zoom in">
        <ZoomIn size={18} />
      </button>
      <button
        style={{ fontSize: '11px', color: '#5F6368', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
        onClick={() => dispatch({ type: 'SET_EDITOR', payload: { zoom: 100 } })}
      >
        Reset
      </button>

      {/* Active tool indicator */}
      {(editor.activeChartType || editor.activeControlType) && (
        <div style={{ marginLeft: '8px', fontSize: '12px', color: '#1A73E8', background: '#E8F0FE', padding: '4px 10px', borderRadius: '12px' }}>
          Drawing: {editor.activeChartType || editor.activeControlType} — click and drag on canvas
        </div>
      )}
    </div>
  )
}
