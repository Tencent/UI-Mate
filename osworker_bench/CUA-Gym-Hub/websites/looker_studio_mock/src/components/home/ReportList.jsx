import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, MoreVertical, Grid, List, ChevronDown } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatDistanceToNow } from 'date-fns'

function getRelativeTime(dateStr) {
  if (!dateStr) return ''
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch (e) { return '' }
}

function ReportThumb({ color }) {
  return (
    <div style={{
      width: '100%',
      height: '130px',
      background: color || '#4285F4',
      opacity: 0.7,
      borderRadius: '4px 4px 0 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
        <rect x="2" y="20" width="8" height="18" rx="1" fill="white" opacity="0.7"/>
        <rect x="14" y="12" width="8" height="26" rx="1" fill="white" opacity="0.7"/>
        <rect x="26" y="8" width="8" height="30" rx="1" fill="white" opacity="0.7"/>
        <rect x="38" y="16" width="8" height="22" rx="1" fill="white" opacity="0.7"/>
        <rect x="50" y="4" width="8" height="34" rx="1" fill="white" opacity="0.7"/>
      </svg>
    </div>
  )
}

function CardMenu({ report, onClose }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const isTrash = report.trashed

  const actions = isTrash ? [
    { label: 'Restore', action: () => dispatch({ type: 'RESTORE_FROM_TRASH', payload: { id: report.id } }) },
    { label: 'Delete permanently', action: () => {
      if (window.confirm('Permanently delete this report? This cannot be undone.')) {
        dispatch({ type: 'DELETE_PERMANENTLY', payload: { id: report.id } })
      }
    }}
  ] : [
    { label: 'Open', action: () => navigate(`/report/${report.id}`) },
    { label: 'Open in view mode', action: () => navigate(`/report/${report.id}/view`) },
    { separator: true },
    { label: report.starred ? 'Remove star' : 'Add star', action: () => dispatch({ type: 'TOGGLE_STAR', payload: { id: report.id } }) },
    { label: 'Rename', action: () => {
      const newName = window.prompt('Rename report:', report.name)
      if (newName && newName.trim()) {
        dispatch({ type: 'RENAME_REPORT', payload: { id: report.id, name: newName.trim() } })
      }
    }},
    { label: 'Make a copy', action: () => {
      const newId = `rpt_${Date.now()}`
      dispatch({ type: 'DUPLICATE_REPORT', payload: { sourceId: report.id, newId } })
    }},
    { separator: true },
    { label: 'Share', action: () => dispatch({ type: 'OPEN_SHARE_DIALOG', payload: report.id }) },
    { separator: true },
    { label: 'Move to trash', action: () => dispatch({ type: 'MOVE_TO_TRASH', payload: { id: report.id } }) }
  ]

  return (
    <div className="dropdown-menu" style={{ position: 'absolute', right: 4, top: 30, zIndex: 200 }}
      onClick={e => e.stopPropagation()}>
      {actions.map((a, i) => {
        if (a.separator) return <div key={i} className="dropdown-separator" />
        return <div key={i} className="dropdown-item" onClick={() => { a.action(); onClose() }}>{a.label}</div>
      })}
    </div>
  )
}

function ReportCard({ report }) {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const dateStr = report.lastOpenedAt || report.modifiedAt

  return (
    <div
      style={{
        width: '220px',
        background: 'white',
        border: '1px solid #DADCE0',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        boxShadow: hovered ? '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)' : '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        position: 'relative',
        flexShrink: 0
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      onClick={() => navigate(`/report/${report.id}`)}
    >
      <ReportThumb color={report.thumbnailColor} />

      {(hovered || report.starred) && (
        <button
          style={{
            position: 'absolute',
            top: 6, left: 6,
            background: 'white',
            borderRadius: '50%',
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
          onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_STAR', payload: { id: report.id } }) }}
        >
          <Star size={14} fill={report.starred ? '#FBBC04' : 'none'} color={report.starred ? '#FBBC04' : '#5F6368'} />
        </button>
      )}

      {hovered && (
        <div ref={menuRef} style={{ position: 'absolute', top: 6, right: 6 }}>
          <button
            style={{
              background: 'white',
              borderRadius: '50%',
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
          >
            <MoreVertical size={14} color="#5F6368" />
          </button>
          {menuOpen && <CardMenu report={report} onClose={() => setMenuOpen(false)} />}
        </div>
      )}

      <div style={{ padding: '8px 12px 12px' }}>
        <div style={{ fontSize: '14px', color: '#202124', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {report.name}
        </div>
        <div style={{ fontSize: '12px', color: '#5F6368', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {report.ownerName}
        </div>
        <div style={{ fontSize: '12px', color: '#5F6368', marginTop: '2px' }}>
          Opened {getRelativeTime(dateStr)}
        </div>
      </div>
    </div>
  )
}

function ReportListRow({ report }) {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const dateStr = report.lastOpenedAt || report.modifiedAt

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '48px',
        padding: '0 16px',
        borderBottom: '1px solid #F1F3F4',
        cursor: 'pointer',
        background: hovered ? '#F8F9FA' : 'white',
        gap: '12px',
        position: 'relative'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      onClick={() => navigate(`/report/${report.id}`)}
    >
      <div style={{ width: '20px', height: '20px', background: report.thumbnailColor, borderRadius: '2px', flexShrink: 0 }} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: '14px', color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {report.name}
        </div>
      </div>
      <div style={{ width: '160px', fontSize: '12px', color: '#5F6368', flexShrink: 0 }}>{report.ownerName}</div>
      <div style={{ width: '160px', fontSize: '12px', color: '#5F6368', flexShrink: 0 }}>{getRelativeTime(dateStr)}</div>
      {hovered && (
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            style={{ width: 32, height: 32 }}
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && <CardMenu report={report} onClose={() => setMenuOpen(false)} />}
        </div>
      )}
    </div>
  )
}

export default function ReportList() {
  const { state, dispatch } = useApp()
  const { reports, home } = state

  const filtered = reports.filter(r => {
    if (home.view === 'recent') return !r.trashed
    if (home.view === 'owned') return r.ownerId === state.user.id && !r.trashed
    if (home.view === 'shared') return r.ownerId !== state.user.id && !r.trashed
    if (home.view === 'trash') return r.trashed
    return !r.trashed
  }).filter(r => {
    if (!home.searchQuery) return true
    return r.name.toLowerCase().includes(home.searchQuery.toLowerCase())
  }).sort((a, b) => {
    const fa = home.sortBy === 'name' ? a.name : (a.lastOpenedAt || a.modifiedAt || '')
    const fb = home.sortBy === 'name' ? b.name : (b.lastOpenedAt || b.modifiedAt || '')
    if (home.sortBy === 'name') return fa.localeCompare(fb) * (home.sortDirection === 'asc' ? 1 : -1)
    return fa > fb ? -1 : 1
  })

  const isGrid = home.viewMode === 'grid'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5F6368', fontSize: '14px', cursor: 'pointer' }}
          onClick={() => {
            const opts = ['lastOpened', 'lastModified', 'name']
            const next = opts[(opts.indexOf(home.sortBy) + 1) % opts.length]
            dispatch({ type: 'SET_HOME_SORT', payload: next })
          }}>
          {home.sortBy === 'name' ? 'Name' : home.sortBy === 'lastModified' ? 'Last modified' : 'Last opened by me'}
          <ChevronDown size={16} />
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={`icon-btn ${isGrid ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_HOME_VIEW_MODE', payload: 'grid' })}
            title="Grid view"
          >
            <Grid size={18} />
          </button>
          <button
            className={`icon-btn ${!isGrid ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_HOME_VIEW_MODE', payload: 'list' })}
            title="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#5F6368' }}>
          {home.searchQuery ? 'No results match your search.' : home.view === 'trash' ? 'Trash is empty.' : 'No reports here.'}
        </div>
      ) : isGrid ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {filtered.map(r => <ReportCard key={r.id} report={r} />)}
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #DADCE0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '40px', padding: '0 16px', borderBottom: '1px solid #DADCE0', gap: '12px' }}>
            <div style={{ width: '20px', flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '12px', color: '#5F6368', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</div>
            <div style={{ width: '160px', fontSize: '12px', color: '#5F6368', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>Owner</div>
            <div style={{ width: '160px', fontSize: '12px', color: '#5F6368', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>Last opened</div>
            <div style={{ width: 32, flexShrink: 0 }} />
          </div>
          {filtered.map(r => <ReportListRow key={r.id} report={r} />)}
        </div>
      )}
    </div>
  )
}
