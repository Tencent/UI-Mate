import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function PageTabs({ report }) {
  const { state, dispatch } = useApp()
  const [editingId, setEditingId] = useState(null)
  const [editVal, setEditVal] = useState('')

  if (!report) return null

  const pageIds = report.pages || []
  const currentPageId = report.currentPageId

  const setPage = (pageId) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: { reportId: report.id, pageId } })
  }

  const addPage = () => {
    const pageId = `page_${Date.now()}`
    const page = {
      id: pageId, reportId: report.id,
      name: `Page ${pageIds.length + 1}`,
      width: 1160, height: 900, backgroundColor: '#FFFFFF', components: []
    }
    dispatch({ type: 'ADD_PAGE', payload: page })
    dispatch({ type: 'SET_CURRENT_PAGE', payload: { reportId: report.id, pageId } })
  }

  const deletePage = (e, pageId) => {
    e.stopPropagation()
    if (pageIds.length <= 1) return
    dispatch({ type: 'DELETE_PAGE', payload: { pageId } })
  }

  const startEdit = (e, pageId) => {
    e.stopPropagation()
    const page = state.pages[pageId]
    setEditingId(pageId)
    setEditVal(page?.name || '')
  }

  const saveName = () => {
    if (editVal.trim() && editingId) {
      dispatch({ type: 'RENAME_PAGE', payload: { pageId: editingId, name: editVal.trim() } })
    }
    setEditingId(null)
  }

  return (
    <div style={{
      height: '36px',
      background: 'white',
      borderTop: '1px solid #DADCE0',
      display: 'flex',
      alignItems: 'stretch',
      padding: '0 8px',
      gap: '2px',
      flexShrink: 0,
      overflowX: 'auto',
      scrollbarWidth: 'none'
    }}>
      {pageIds.map(pageId => {
        const page = state.pages[pageId]
        if (!page) return null
        const isActive = pageId === currentPageId

        return (
          <div
            key={pageId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0 12px',
              cursor: 'pointer',
              borderBottom: isActive ? '2px solid #1A73E8' : '2px solid transparent',
              color: isActive ? '#1A73E8' : '#5F6368',
              fontSize: '12px',
              fontWeight: isActive ? 500 : 400,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onClick={() => setPage(pageId)}
            onDoubleClick={(e) => startEdit(e, pageId)}
          >
            {editingId === pageId ? (
              <input
                autoFocus
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingId(null) }}
                onClick={e => e.stopPropagation()}
                style={{ border: 'none', outline: 'none', fontSize: '12px', width: '80px', color: '#1A73E8', background: 'transparent' }}
              />
            ) : (
              page.name || `Page ${pageIds.indexOf(pageId) + 1}`
            )}

            {isActive && pageIds.length > 1 && (
              <button
                onClick={(e) => deletePage(e, pageId)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#5F6368', padding: '0', marginLeft: '2px' }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        )
      })}

      {/* Add page button */}
      <button
        className="icon-btn"
        style={{ width: 32, height: 32, alignSelf: 'center' }}
        onClick={addPage}
        title="Add page"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
