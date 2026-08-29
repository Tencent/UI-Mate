import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { ChartRenderer } from '../charts/ChartRenderer'

function ResizeHandle({ position, onDrag }) {
  const handleStyles = {
    'nw': { top: -4, left: -4, cursor: 'nw-resize' },
    'n': { top: -4, left: 'calc(50% - 4px)', cursor: 'n-resize' },
    'ne': { top: -4, right: -4, cursor: 'ne-resize' },
    'e': { top: 'calc(50% - 4px)', right: -4, cursor: 'e-resize' },
    'se': { bottom: -4, right: -4, cursor: 'se-resize' },
    's': { bottom: -4, left: 'calc(50% - 4px)', cursor: 's-resize' },
    'sw': { bottom: -4, left: -4, cursor: 'sw-resize' },
    'w': { top: 'calc(50% - 4px)', left: -4, cursor: 'w-resize' }
  }

  return (
    <div
      style={{
        position: 'absolute',
        width: 8, height: 8,
        background: '#4285F4',
        border: '1px solid white',
        zIndex: 10,
        ...handleStyles[position]
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onDrag(e, position)
      }}
    />
  )
}

function CanvasComponent({ compId, canvasRect, zoom, onContextMenu }) {
  const { state, dispatch } = useApp()
  const comp = state.components[compId]
  const isSelected = state.editor.selectedComponentIds.includes(compId)
  const isDragging = useRef(false)
  const dragStart = useRef(null)

  if (!comp) return null

  const scale = zoom / 100

  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    e.stopPropagation()

    // Select
    dispatch({ type: 'SELECT_COMPONENT', payload: { id: compId, multi: e.shiftKey } })

    // Start drag
    isDragging.current = false
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, compX: comp.x, compY: comp.y }

    const onMove = (ev) => {
      const dx = (ev.clientX - dragStart.current.mouseX) / scale
      const dy = (ev.clientY - dragStart.current.mouseY) / scale
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDragging.current = true
      if (isDragging.current) {
        const snapSize = state.editor.snapToGrid ? state.editor.gridSize : 1
        const newX = Math.round((dragStart.current.compX + dx) / snapSize) * snapSize
        const newY = Math.round((dragStart.current.compY + dy) / snapSize) * snapSize
        dispatch({ type: 'MOVE_COMPONENT', payload: { id: compId, x: Math.max(0, newX), y: Math.max(0, newY) } })
      }
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      isDragging.current = false
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const handleResize = (e, position) => {
    e.stopPropagation()
    e.preventDefault()

    const startX = e.clientX
    const startY = e.clientY
    const startComp = { x: comp.x, y: comp.y, width: comp.width, height: comp.height }
    const snapSize = state.editor.snapToGrid ? state.editor.gridSize : 1

    const onMove = (ev) => {
      const dx = (ev.clientX - startX) / scale
      const dy = (ev.clientY - startY) / scale

      let { x, y, width, height } = startComp

      if (position.includes('e')) width = Math.max(50, Math.round((startComp.width + dx) / snapSize) * snapSize)
      if (position.includes('s')) height = Math.max(30, Math.round((startComp.height + dy) / snapSize) * snapSize)
      if (position.includes('w')) {
        const newWidth = Math.max(50, Math.round((startComp.width - dx) / snapSize) * snapSize)
        x = startComp.x + (startComp.width - newWidth)
        width = newWidth
      }
      if (position.includes('n')) {
        const newHeight = Math.max(30, Math.round((startComp.height - dy) / snapSize) * snapSize)
        y = startComp.y + (startComp.height - newHeight)
        height = newHeight
      }

      dispatch({ type: 'RESIZE_COMPONENT', payload: { id: compId, x, y, width, height } })
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const s = comp.style || {}

  return (
    <div
      data-comp-id={compId}
      style={{
        position: 'absolute',
        left: comp.x,
        top: comp.y,
        width: comp.width,
        height: comp.height,
        background: s.backgroundColor || 'white',
        border: isSelected
          ? '2px solid #4285F4'
          : `${s.borderWidth || 0}px solid ${s.borderColor || '#DADCE0'}`,
        borderRadius: s.borderRadius || 0,
        opacity: s.opacity ?? 1,
        boxSizing: 'border-box',
        cursor: 'move',
        userSelect: 'none',
        overflow: 'hidden'
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => { e.preventDefault(); if (onContextMenu) onContextMenu(e, compId) }}
    >
      <ChartRenderer component={comp} />

      {/* Resize handles when selected */}
      {isSelected && ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(pos => (
        <ResizeHandle key={pos} position={pos} onDrag={handleResize} />
      ))}
    </div>
  )
}

function GridLines({ width, height, gridSize }) {
  const lines = []
  for (let x = gridSize; x < width; x += gridSize) {
    lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} stroke="#E8EAED" strokeWidth={0.5} />)
  }
  for (let y = gridSize; y < height; y += gridSize) {
    lines.push(<line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} stroke="#E8EAED" strokeWidth={0.5} />)
  }
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} width={width} height={height}>
      {lines}
    </svg>
  )
}

export default function Canvas({ report }) {
  const { state, dispatch } = useApp()
  const { editor } = state
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [drawRect, setDrawRect] = useState(null)
  const [contextMenu, setContextMenu] = useState(null) // { x, y, compId }

  const currentPageId = report?.currentPageId
  const page = currentPageId ? state.pages[currentPageId] : null
  const scale = editor.zoom / 100
  const pageWidth = page?.width || 1160
  const pageHeight = page?.height || 900

  const handleCanvasClick = (e) => {
    setContextMenu(null)
    if (e.target === canvasRef.current || e.target.closest('[data-canvas-bg]')) {
      dispatch({ type: 'DESELECT_ALL' })
    }
  }

  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return
    if (e.target !== canvasRef.current && !e.target.hasAttribute('data-canvas-bg')) return

    // If active tool is not select, start drawing
    if (editor.activeTool !== 'select' || editor.activeChartType) {
      e.preventDefault()
      const rect = canvasRef.current.getBoundingClientRect()
      const startX = (e.clientX - rect.left) / scale
      const startY = (e.clientY - rect.top) / scale

      let currentRect = { x: startX, y: startY, width: 0, height: 0 }

      const onMove = (ev) => {
        const dx = (ev.clientX - rect.left) / scale - startX
        const dy = (ev.clientY - rect.top) / scale - startY
        currentRect = {
          x: dx < 0 ? startX + dx : startX,
          y: dy < 0 ? startY + dy : startY,
          width: Math.abs(dx),
          height: Math.abs(dy)
        }
        setDrawRect(currentRect)
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)

        if (currentRect.width > 30 && currentRect.height > 20) {
          const id = `comp_${Date.now()}`
          const newComp = {
            id,
            pageId: currentPageId,
            type: editor.activeChartType ? 'chart' : editor.activeControlType ? 'control' : editor.activeTool === 'text' ? 'text' : 'shape',
            chartType: editor.activeChartType || null,
            controlType: editor.activeControlType || null,
            x: Math.round(currentRect.x),
            y: Math.round(currentRect.y),
            width: Math.round(currentRect.width),
            height: Math.round(currentRect.height),
            dataSourceId: state.dataSources[0]?.id || null,
            dimensions: [],
            metrics: [],
            sortField: null,
            sortDirection: 'DESC',
            rowLimit: 10,
            filters: [],
            style: {
              title: editor.activeChartType ? (editor.activeChartType.charAt(0).toUpperCase() + editor.activeChartType.slice(1) + ' Chart') : '',
              showTitle: true,
              titleFontSize: 14,
              titleColor: '#202124',
              backgroundColor: '#FFFFFF',
              borderColor: '#DADCE0',
              borderWidth: 1,
              borderRadius: 0,
              fontFamily: 'Roboto',
              fontSize: 12,
              colors: ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FF6D01', '#46BDC6'],
              showLegend: true,
              legendPosition: 'bottom',
              showDataLabels: false,
              opacity: 1,
              padding: 16
            },
            compactNumber: true,
            comparisonField: null,
            textContent: editor.activeTool === 'text' ? 'Text' : '',
            textAlign: 'left',
            textBold: false,
            textItalic: false,
            textSize: 14,
            textColor: '#202124',
            shapeType: editor.activeTool === 'shape' ? 'rectangle' : null,
            strokeColor: '#5F6368',
            strokeWidth: 1,
            fillColor: '#FFFFFF',
            selected: false,
            locked: false
          }

          dispatch({ type: 'PUSH_UNDO' })
          dispatch({ type: 'ADD_COMPONENT', payload: newComp })
          dispatch({ type: 'SELECT_COMPONENT', payload: { id, multi: false } })
          dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'select', activeChartType: null, activeControlType: null } })
        }

        setDrawRect(null)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }
  }

  // Keyboard shortcut for delete
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && editor.selectedComponentIds.length) {
        dispatch({ type: 'PUSH_UNDO' })
        editor.selectedComponentIds.forEach(id => dispatch({ type: 'DELETE_COMPONENT', payload: { id } }))
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); dispatch({ type: 'UNDO' }) }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); dispatch({ type: 'REDO' }) }
        if (e.key === 'y') { e.preventDefault(); dispatch({ type: 'REDO' }) }
        if (e.key === 'c') {
          // Copy selected components
          const copies = editor.selectedComponentIds.map(id => state.components[id]).filter(Boolean)
          if (copies.length) dispatch({ type: 'SET_EDITOR', payload: { clipboard: copies } })
        }
        if (e.key === 'v' && editor.clipboard && editor.clipboard.length) {
          e.preventDefault()
          dispatch({ type: 'PUSH_UNDO' })
          editor.clipboard.forEach(comp => {
            const newId = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
            dispatch({ type: 'ADD_COMPONENT', payload: { ...comp, id: newId, pageId: currentPageId, x: comp.x + 10, y: comp.y + 10 } })
          })
        }
        if (e.key === 'a') {
          e.preventDefault()
          const pageId = report?.currentPageId
          const pg = pageId ? state.pages[pageId] : null
          if (pg?.components?.length) {
            pg.components.forEach((id, i) => dispatch({ type: 'SELECT_COMPONENT', payload: { id, multi: i > 0 } }))
          }
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [editor.selectedComponentIds, editor.clipboard, currentPageId])

  if (!page) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F0F0', color: '#5F6368' }}>
        No page selected
      </div>
    )
  }

  const components = page.components || []

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        background: '#F0F0F0',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '32px'
      }}
      onClick={handleCanvasClick}
    >
      {/* White canvas */}
      <div
        ref={canvasRef}
        data-canvas-bg
        style={{
          position: 'relative',
          width: pageWidth * scale,
          height: pageHeight * scale,
          background: page.backgroundColor || 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.15)',
          flexShrink: 0,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          // Undo scale so the DOM element takes correct space
          marginRight: pageWidth * (scale - 1),
          marginBottom: pageHeight * (scale - 1)
        }}
        onMouseDown={handleCanvasMouseDown}
      >
        {editor.showGrid && <GridLines width={pageWidth} height={pageHeight} gridSize={editor.gridSize} />}

        {components.map(cid => (
          <CanvasComponent key={cid} compId={cid} canvasRect={canvasRef.current?.getBoundingClientRect()} zoom={editor.zoom}
            onContextMenu={(e, id) => setContextMenu({ x: e.clientX, y: e.clientY, compId: id })} />
        ))}

        {/* Draw preview rect */}
        {drawRect && (
          <div style={{
            position: 'absolute',
            left: drawRect.x, top: drawRect.y,
            width: drawRect.width, height: drawRect.height,
            border: '2px dashed #4285F4',
            background: 'rgba(66, 133, 244, 0.1)',
            pointerEvents: 'none'
          }} />
        )}
      </div>
      {/* Context menu */}
      {contextMenu && (
        <div
          className="dropdown-menu"
          style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 1000 }}
          onClick={() => setContextMenu(null)}
        >
          <div className="dropdown-item" onClick={() => {
            const comp = state.components[contextMenu.compId]
            if (comp) dispatch({ type: 'SET_EDITOR', payload: { clipboard: [comp] } })
          }}>Copy</div>
          <div className="dropdown-item" onClick={() => {
            // Duplicate in place
            const comp = state.components[contextMenu.compId]
            if (!comp) return
            dispatch({ type: 'PUSH_UNDO' })
            const newId = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
            dispatch({ type: 'ADD_COMPONENT', payload: { ...comp, id: newId, x: comp.x + 20, y: comp.y + 20 } })
            dispatch({ type: 'SELECT_COMPONENT', payload: { id: newId, multi: false } })
          }}>Duplicate</div>
          <div className="dropdown-item" onClick={() => {
            dispatch({ type: 'PUSH_UNDO' })
            dispatch({ type: 'DELETE_COMPONENT', payload: { id: contextMenu.compId } })
          }}>Delete</div>
          <div className="dropdown-separator" />
          <div className="dropdown-item" onClick={() => {
            if (!page) return
            dispatch({ type: 'PUSH_UNDO' })
            dispatch({ type: 'BRING_TO_FRONT', payload: { compId: contextMenu.compId, pageId: page.id } })
          }}>Bring to front</div>
          <div className="dropdown-item" onClick={() => {
            if (!page) return
            dispatch({ type: 'PUSH_UNDO' })
            dispatch({ type: 'SEND_TO_BACK', payload: { compId: contextMenu.compId, pageId: page.id } })
          }}>Send to back</div>
        </div>
      )}
    </div>
  )
}
