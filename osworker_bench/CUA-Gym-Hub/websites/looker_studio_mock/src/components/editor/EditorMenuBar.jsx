import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Eye, Edit2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import ShareDialog from '../shared/ShareDialog'
import PublishDialog from '../shared/PublishDialog'

function MenuDropdown({ label, items, open, onOpen, onClose }) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        onMouseDown={() => open ? onClose() : onOpen()}
        style={{
          background: open ? '#F1F3F4' : 'none',
          border: 'none',
          padding: '4px 12px',
          fontSize: '14px',
          color: '#202124',
          cursor: 'pointer',
          borderRadius: '4px',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={e => { if (!open) e.target.style.background = '#F1F3F4' }}
        onMouseLeave={e => { if (!open) e.target.style.background = 'none' }}
      >
        {label}
      </button>
      {open && (
        <div className="dropdown-menu" style={{ position: 'absolute', top: 'calc(100% + 2px)', left: 0, minWidth: '220px', zIndex: 500 }}>
          {items.map((item, i) => {
            if (item.separator) return <div key={i} className="dropdown-separator" />
            return (
              <div
                key={i}
                className="dropdown-item"
                style={{ justifyContent: 'space-between', opacity: item.disabled ? 0.5 : 1 }}
                onClick={() => { if (item.action && !item.disabled) item.action(); onClose() }}
              >
                <span>{item.label}</span>
                {item.shortcut && <span style={{ fontSize: '12px', color: '#80868B' }}>{item.shortcut}</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function EditorMenuBar({ report }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(report?.name || '')
  const [toast, setToast] = useState(null)
  const menuRef = useRef(null)
  const nameRef = useRef(null)
  const editor = state.editor

  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const addPage = () => {
    if (!report) return
    const pageId = `page_${Date.now()}`
    const page = {
      id: pageId, reportId: report.id,
      name: `Page ${(report.pages || []).length + 1}`,
      width: 1160, height: 900, backgroundColor: '#FFFFFF', components: []
    }
    dispatch({ type: 'ADD_PAGE', payload: page })
    dispatch({ type: 'SET_CURRENT_PAGE', payload: { reportId: report.id, pageId } })
  }

  const currentPageId = report?.currentPageId
  const page = currentPageId ? state.pages[currentPageId] : null
  const selectedIds = editor.selectedComponentIds

  const menus = {
    File: [
      { label: 'New report', action: () => {
        const id = `rpt_${Date.now()}`
        const now = new Date().toISOString()
        dispatch({ type: 'CREATE_REPORT', payload: {
          id, name: 'Untitled Report',
          ownerId: state.user.id, ownerName: state.user.name, ownerEmail: state.user.email,
          createdAt: now, modifiedAt: now, lastOpenedAt: now,
          thumbnailColor: '#4285F4', starred: false, shared: false, trashed: false, sharedWith: [],
          dataSources: [], pages: [], currentPageId: null
        }})
        navigate(`/report/${id}`)
      }},
      { label: 'Rename', action: () => { setEditingName(true); setTimeout(() => nameRef.current?.focus(), 0) } },
      { label: 'Make a copy', action: () => {
        if (!report) return
        const newId = `rpt_${Date.now()}`
        dispatch({ type: 'DUPLICATE_REPORT', payload: { sourceId: report.id, newId } })
        showToast('Report duplicated')
        navigate(`/report/${newId}`)
      }},
      { separator: true },
      { label: 'Share', action: () => dispatch({ type: 'OPEN_SHARE_DIALOG', payload: report?.id }) },
      { label: 'Publish report', action: () => dispatch({ type: 'OPEN_PUBLISH_DIALOG', payload: report?.id }) },
      { separator: true },
      { label: 'Move to trash', action: () => { dispatch({ type: 'MOVE_TO_TRASH', payload: { id: report?.id } }); navigate('/') } },
      { separator: true },
      { label: 'Download as PDF', action: () => showToast('Report downloaded as PDF') },
      { label: 'Download as CSV', action: () => showToast('Report downloaded as CSV') }
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: () => dispatch({ type: 'UNDO' }), disabled: !editor.undoStack?.length },
      { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => dispatch({ type: 'REDO' }), disabled: !editor.redoStack?.length },
      { separator: true },
      { label: 'Copy', shortcut: 'Ctrl+C', action: () => {
        const copies = selectedIds.map(id => state.components[id]).filter(Boolean)
        if (copies.length) dispatch({ type: 'SET_EDITOR', payload: { clipboard: copies } })
      }, disabled: !selectedIds.length },
      { label: 'Paste', shortcut: 'Ctrl+V', action: () => {
        if (editor.clipboard?.length) {
          dispatch({ type: 'PUSH_UNDO' })
          editor.clipboard.forEach(comp => {
            const newId = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
            dispatch({ type: 'ADD_COMPONENT', payload: { ...comp, id: newId, pageId: currentPageId, x: comp.x + 10, y: comp.y + 10 } })
          })
        }
      }, disabled: !editor.clipboard?.length },
      { label: 'Delete', shortcut: 'Del', action: () => {
        if (selectedIds.length) {
          dispatch({ type: 'PUSH_UNDO' })
          selectedIds.forEach(id => dispatch({ type: 'DELETE_COMPONENT', payload: { id } }))
        }
      }, disabled: !selectedIds.length },
      { separator: true },
      { label: 'Select all', shortcut: 'Ctrl+A', action: () => {
        if (page?.components?.length) {
          page.components.forEach((id, i) => dispatch({ type: 'SELECT_COMPONENT', payload: { id, multi: i > 0 } }))
        }
      }}
    ],
    View: [
      { label: 'Edit mode', action: () => dispatch({ type: 'SET_EDITOR_MODE', payload: 'edit' }) },
      { label: 'View mode', action: () => dispatch({ type: 'SET_EDITOR_MODE', payload: 'view' }) },
      { separator: true },
      { label: 'Zoom in', shortcut: 'Ctrl++', action: () => dispatch({ type: 'SET_EDITOR', payload: { zoom: Math.min(200, editor.zoom + 10) } }) },
      { label: 'Zoom out', shortcut: 'Ctrl+-', action: () => dispatch({ type: 'SET_EDITOR', payload: { zoom: Math.max(25, editor.zoom - 10) } }) },
      { label: 'Reset zoom (100%)', shortcut: 'Ctrl+0', action: () => dispatch({ type: 'SET_EDITOR', payload: { zoom: 100 } }) },
      { separator: true },
      { label: `${editor.showGrid ? '~ ' : ''}Show grid`, action: () => dispatch({ type: 'SET_EDITOR', payload: { showGrid: !editor.showGrid } }) },
      { label: `${editor.snapToGrid ? '~ ' : ''}Snap to grid`, action: () => dispatch({ type: 'SET_EDITOR', payload: { snapToGrid: !editor.snapToGrid } }) }
    ],
    Insert: [
      { label: 'Table', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'chart', activeChartType: 'table', activeControlType: null } }) },
      { label: 'Scorecard', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'chart', activeChartType: 'scorecard', activeControlType: null } }) },
      { label: 'Time Series', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'chart', activeChartType: 'time_series', activeControlType: null } }) },
      { label: 'Bar Chart', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'chart', activeChartType: 'bar', activeControlType: null } }) },
      { label: 'Line Chart', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'chart', activeChartType: 'line', activeControlType: null } }) },
      { label: 'Pie Chart', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'chart', activeChartType: 'pie', activeControlType: null } }) },
      { label: 'Geo Map', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'chart', activeChartType: 'geo', activeControlType: null } }) },
      { separator: true },
      { label: 'Date Range Control', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'control', activeChartType: null, activeControlType: 'date_range' } }) },
      { label: 'Drop-down List', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'control', activeChartType: null, activeControlType: 'dropdown' } }) },
      { label: 'Slider', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'control', activeChartType: null, activeControlType: 'slider' } }) },
      { separator: true },
      { label: 'Text', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'text', activeChartType: null, activeControlType: null } }) },
      { label: 'Image', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'image', activeChartType: null, activeControlType: null } }) },
      { label: 'Shape', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'shape', activeChartType: null, activeControlType: null } }) },
      { label: 'Line', action: () => dispatch({ type: 'SET_EDITOR', payload: { activeTool: 'line', activeChartType: null, activeControlType: null } }) }
    ],
    Format: [
      { label: 'Bring to front', action: () => {
        if (selectedIds.length && page) {
          dispatch({ type: 'PUSH_UNDO' })
          selectedIds.forEach(id => dispatch({ type: 'BRING_TO_FRONT', payload: { compId: id, pageId: page.id } }))
        }
      }, disabled: !selectedIds.length },
      { label: 'Send to back', action: () => {
        if (selectedIds.length && page) {
          dispatch({ type: 'PUSH_UNDO' })
          selectedIds.forEach(id => dispatch({ type: 'SEND_TO_BACK', payload: { compId: id, pageId: page.id } }))
        }
      }, disabled: !selectedIds.length },
      { separator: true },
      { label: 'Align left', action: () => {
        if (selectedIds.length) { dispatch({ type: 'PUSH_UNDO' }); dispatch({ type: 'ALIGN_COMPONENTS', payload: { alignment: 'left' } }) }
      }, disabled: selectedIds.length < 2 },
      { label: 'Align center', action: () => {
        if (selectedIds.length) { dispatch({ type: 'PUSH_UNDO' }); dispatch({ type: 'ALIGN_COMPONENTS', payload: { alignment: 'center' } }) }
      }, disabled: selectedIds.length < 2 },
      { label: 'Align right', action: () => {
        if (selectedIds.length) { dispatch({ type: 'PUSH_UNDO' }); dispatch({ type: 'ALIGN_COMPONENTS', payload: { alignment: 'right' } }) }
      }, disabled: selectedIds.length < 2 },
      { separator: true },
      { label: 'Align top', action: () => {
        if (selectedIds.length) { dispatch({ type: 'PUSH_UNDO' }); dispatch({ type: 'ALIGN_COMPONENTS', payload: { alignment: 'top' } }) }
      }, disabled: selectedIds.length < 2 },
      { label: 'Align middle', action: () => {
        if (selectedIds.length) { dispatch({ type: 'PUSH_UNDO' }); dispatch({ type: 'ALIGN_COMPONENTS', payload: { alignment: 'middle' } }) }
      }, disabled: selectedIds.length < 2 },
      { label: 'Align bottom', action: () => {
        if (selectedIds.length) { dispatch({ type: 'PUSH_UNDO' }); dispatch({ type: 'ALIGN_COMPONENTS', payload: { alignment: 'bottom' } }) }
      }, disabled: selectedIds.length < 2 }
    ],
    Page: [
      { label: 'New page', action: addPage },
      { separator: true },
      { label: 'Duplicate current page', action: () => {
        if (!page || !report) return
        const newPageId = `page_${Date.now()}`
        const newComps = {}
        const newCompIds = []
        page.components.forEach(cid => {
          const comp = state.components[cid]
          if (!comp) return
          const newCid = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
          newComps[newCid] = { ...comp, id: newCid, pageId: newPageId }
          newCompIds.push(newCid)
        })
        const newPage = { id: newPageId, reportId: report.id, name: `${page.name} (copy)`, width: page.width, height: page.height, backgroundColor: page.backgroundColor, components: newCompIds }
        // We need to add each component, then the page
        dispatch({ type: 'ADD_PAGE', payload: { ...newPage, components: [] } })
        Object.values(newComps).forEach(c => dispatch({ type: 'ADD_COMPONENT', payload: c }))
        dispatch({ type: 'SET_CURRENT_PAGE', payload: { reportId: report.id, pageId: newPageId } })
        showToast('Page duplicated')
      }},
      { separator: true },
      { label: 'Page settings', action: () => showToast('Page settings: Adjust width, height, and background in the Properties panel') }
    ],
    Resource: [
      { label: 'Manage added data sources', action: () => navigate('/datasources') },
      { label: 'Add a data source', action: () => dispatch({ type: 'OPEN_CONNECTOR_DIALOG' }) }
    ],
    Help: [
      { label: 'Xooker Studio Help Center', action: () => showToast('Help Center: support.google.com/looker-studio') },
      { label: 'Report an issue', action: () => showToast('Issue reported. Thank you!') },
      { label: 'Keyboard shortcuts', action: () => showToast('Ctrl+Z Undo | Ctrl+Y Redo | Del Delete | Ctrl+C/V Copy/Paste | Ctrl+A Select All') }
    ]
  }

  const saveName = () => {
    if (nameVal.trim() && report) {
      dispatch({ type: 'UPDATE_REPORT', payload: { id: report.id, name: nameVal.trim() } })
    } else {
      setNameVal(report?.name || '')
    }
    setEditingName(false)
  }

  return (
    <>
      <div
        ref={menuRef}
        style={{
          height: '40px',
          background: 'white',
          borderBottom: '1px solid #DADCE0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: '4px',
          flexShrink: 0,
          zIndex: 50
        }}
      >
        <button className="icon-btn" onClick={() => navigate('/')} title="Back to home">
          <ArrowLeft size={20} />
        </button>

        <div style={{ margin: '0 4px', flexShrink: 0 }}>
          {editingName ? (
            <input
              ref={nameRef}
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameVal(report?.name || ''); setEditingName(false) } }}
              style={{
                fontSize: '16px', color: '#202124', border: 'none',
                borderBottom: '2px solid #1A73E8', outline: 'none',
                background: 'transparent', fontFamily: 'inherit', padding: '2px 4px', minWidth: '120px'
              }}
            />
          ) : (
            <span
              style={{ fontSize: '16px', color: '#202124', cursor: 'text', padding: '2px 4px' }}
              onClick={() => { setNameVal(report?.name || ''); setEditingName(true); setTimeout(() => nameRef.current?.focus(), 0) }}
            >
              {report?.name || 'Untitled'}
            </span>
          )}
        </div>

        {Object.entries(menus).map(([label, items]) => (
          <MenuDropdown
            key={label}
            label={label}
            items={items}
            open={openMenu === label}
            onOpen={() => setOpenMenu(label)}
            onClose={() => setOpenMenu(null)}
          />
        ))}

        <div style={{ flex: 1 }} />

        <button
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 16px', border: '1px solid #DADCE0', borderRadius: '4px',
            background: editor.mode === 'view' ? '#E8F0FE' : 'white',
            color: editor.mode === 'view' ? '#1A73E8' : '#202124',
            fontSize: '14px', fontWeight: 500, cursor: 'pointer'
          }}
          onClick={() => dispatch({ type: 'SET_EDITOR_MODE', payload: editor.mode === 'edit' ? 'view' : 'edit' })}
        >
          {editor.mode === 'edit' ? <Eye size={16} /> : <Edit2 size={16} />}
          {editor.mode === 'edit' ? 'View' : 'Edit'}
        </button>

        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px' }}
          onClick={() => dispatch({ type: 'OPEN_SHARE_DIALOG', payload: report?.id })}
        >
          <Share2 size={16} />
          Share
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
      {state.shareDialog.open && <ShareDialog />}
      {state.publishDialog?.open && <PublishDialog />}
    </>
  )
}
