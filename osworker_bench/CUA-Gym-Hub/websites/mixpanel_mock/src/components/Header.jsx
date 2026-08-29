import React, { useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Link2, MoreHorizontal, Heart, Bell, Share2, Copy, Undo, Download, RefreshCw, FileText } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function Header({ title, reportType, onSave, savedFlash = false, showSave = false, isFavorite, onFavorite }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { state, addReport, updateReport } = useApp()
  const sid = searchParams.get('sid')

  const pathParts = location.pathname.split('/').filter(Boolean)
  const pageType = pathParts[0]

  function navTo(path) {
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  const isReport = pageType === 'report'
  const isBoard = pageType === 'board'

  const currentReportId = pathParts[1]
  const currentReport = state?.reports?.find(r => r.id === currentReportId)

  function handleDuplicate() {
    if (!currentReport) return
    const id = 'report_dup_' + Date.now()
    addReport({ ...currentReport, id, name: currentReport.name + ' (copy)', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    setMoreOpen(false)
    navTo(`/report/${id}`)
  }

  function handleExport() {
    if (!currentReport) return
    const blob = new Blob([JSON.stringify(currentReport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (currentReport.name || 'report') + '.json'
    a.click()
    URL.revokeObjectURL(url)
    setMoreOpen(false)
  }

  function handleRefreshData() {
    if (currentReport) {
      updateReport(currentReportId, { lastRefreshed: new Date().toISOString() })
    }
    setMoreOpen(false)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
  }

  return (
    <div style={{
      height: 48, display: 'flex', alignItems: 'center',
      padding: '0 20px', borderBottom: '1px solid #E4E4E8',
      background: '#fff', flexShrink: 0, gap: 8
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <button onClick={() => navTo('/home')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, color: '#4F44E0', fontWeight: 500, padding: 0
        }}>{state?.project?.name || 'Xixpanel'}</button>
        <span style={{ color: '#8E8EA0', fontSize: 14 }}>/</span>
        <span style={{ fontSize: 14, color: '#1B1B2E', fontWeight: 500 }} className="truncate">{title || 'Untitled'}</span>
        {reportType && (
          <>
            <span style={{ color: '#8E8EA0', fontSize: 14 }}>/</span>
            <span style={{ fontSize: 12, color: '#8E8EA0', background: '#F7F7F8', padding: '2px 8px', borderRadius: 4, textTransform: 'capitalize' }}>{reportType}</span>
          </>
        )}
      </div>

      {shareOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShareOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 12, padding: 24, width: 400,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Share</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input readOnly value={window.location.href} style={{
                flex: 1, border: '1px solid #E4E4E8', borderRadius: 6,
                padding: '8px 12px', fontSize: 13, outline: 'none'
              }} />
              <button onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); setShareOpen(false) }} style={{
                padding: '8px 14px', border: 'none', borderRadius: 6,
                background: '#4F44E0', color: '#fff', cursor: 'pointer', fontSize: 13
              }}>Copy</button>
            </div>
            <button onClick={() => setShareOpen(false)} style={{
              width: '100%', padding: '8px', border: '1px solid #E4E4E8',
              borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13
            }}>Close</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {isBoard && (
          <>
            <ActionBtn
              icon={<Bell size={15} fill={subscribed ? '#4F44E0' : 'none'} color={subscribed ? '#4F44E0' : '#8E8EA0'} />}
              label="Subscribe"
              onClick={() => setSubscribed(v => !v)}
            />
            <ActionBtn icon={<Share2 size={15} />} label="Share" onClick={() => setShareOpen(true)} />
            <ActionBtn icon={<Heart size={15} fill={isFavorite ? '#EB5757' : 'none'} color={isFavorite ? '#EB5757' : '#8E8EA0'} />}
              onClick={onFavorite} />
            <ActionBtn icon={<Link2 size={15} />} onClick={handleCopyLink} />
          </>
        )}
        {isReport && (
          <ActionBtn icon={<Link2 size={15} />} onClick={handleCopyLink} />
        )}
        <div style={{ position: 'relative' }}>
          <ActionBtn icon={<MoreHorizontal size={15} />} onClick={() => setMoreOpen(v => !v)} />
          {moreOpen && (
            <MoreMenu
              onClose={() => setMoreOpen(false)}
              onDuplicate={handleDuplicate}
              onExport={handleExport}
              onRefreshData={handleRefreshData}
              currentReport={currentReport}
            />
          )}
        </div>
        {(isReport || showSave) && (
          <button onClick={onSave} style={{
            background: savedFlash ? '#27AE60' : '#4F44E0', color: '#fff', border: 'none',
            borderRadius: 6, padding: '6px 14px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => { if (!savedFlash) e.currentTarget.style.background = '#3D34C0' }}
          onMouseLeave={e => { if (!savedFlash) e.currentTarget.style.background = '#4F44E0' }}>
            {savedFlash ? 'Saved' : 'Save'}
          </button>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ icon, label, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} title={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: label ? '5px 8px' : '5px 7px',
        border: '1px solid transparent',
        borderRadius: 6, background: hover ? '#F7F7F8' : 'none',
        cursor: 'pointer', color: '#8E8EA0', fontSize: 13,
        transition: 'background 0.15s'
      }}>
      {icon}
      {label && <span>{label}</span>}
    </button>
  )
}

function MoreMenu({ onClose, onDuplicate, onExport, onRefreshData, currentReport }) {
  const items = [
    { icon: <Copy size={14} />, label: 'Duplicate', action: onDuplicate },
    { icon: <FileText size={14} />, label: 'New Report', action: onClose },
    { icon: <Download size={14} />, label: 'Export', action: onExport },
    {
      icon: <RefreshCw size={14} />, label: 'Refresh Data',
      sub: currentReport?.lastRefreshed
        ? 'Refreshed ' + new Date(currentReport.lastRefreshed).toLocaleTimeString()
        : 'Data from 0 min ago',
      action: onRefreshData
    },
  ]
  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, zIndex: 200,
      background: '#fff', border: '1px solid #E4E4E8',
      borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      padding: 4, width: 200, marginTop: 4
    }}>
      {items.map(item => (
        <button key={item.label} onClick={item.action || onClose} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 10px', border: 'none', borderRadius: 4,
          background: 'none', cursor: 'pointer', textAlign: 'left',
          transition: 'background 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F7F7F8'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <span style={{ color: '#8E8EA0' }}>{item.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#1B1B2E' }}>{item.label}</div>
            {item.sub && <div style={{ fontSize: 11, color: '#8E8EA0' }}>{item.sub}</div>}
          </div>
        </button>
      ))}
    </div>
  )
}
