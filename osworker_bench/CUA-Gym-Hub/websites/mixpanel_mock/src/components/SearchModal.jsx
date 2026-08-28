import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X, BarChart2, Layers, Zap, Users } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function SearchModal({ onClose }) {
  const { state } = useApp()
  const [query, setQuery] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sid = searchParams.get('sid')

  useEffect(() => {
    function handler(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const reports = (state?.reports || []).filter(r => !query || r.name.toLowerCase().includes(query.toLowerCase()))
  const boards = (state?.boards || []).filter(b => !query || b.name.toLowerCase().includes(query.toLowerCase()))

  function navTo(path) {
    navigate(sid ? `${path}?sid=${sid}` : path)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)', display: 'flex',
      alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 560, background: '#fff', borderRadius: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #E4E4E8' }}>
          <Search size={18} color="#8E8EA0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search reports, boards, events..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#1B1B2E' }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8EA0' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {reports.length > 0 && (
            <div>
              <div style={{ padding: '8px 20px 4px', fontSize: 11, fontWeight: 600, color: '#8E8EA0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Reports</div>
              {reports.slice(0, 6).map(r => (
                <button key={r.id} onClick={() => navTo(`/report/${r.id}`)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 20px', border: 'none', background: 'none',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F7F7F8'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <BarChart2 size={16} color="#4F44E0" />
                  <span style={{ flex: 1, fontSize: 14, color: '#1B1B2E' }}>{r.name}</span>
                  <span style={{ fontSize: 11, color: '#8E8EA0', background: '#F7F7F8', padding: '2px 6px', borderRadius: 4, textTransform: 'capitalize' }}>{r.type}</span>
                </button>
              ))}
            </div>
          )}

          {boards.length > 0 && (
            <div>
              <div style={{ padding: '8px 20px 4px', fontSize: 11, fontWeight: 600, color: '#8E8EA0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Boards</div>
              {boards.slice(0, 4).map(b => (
                <button key={b.id} onClick={() => navTo(`/board/${b.id}`)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 20px', border: 'none', background: 'none',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F7F7F8'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <Layers size={16} color="#F5A623" />
                  <span style={{ flex: 1, fontSize: 14, color: '#1B1B2E' }}>{b.name}</span>
                </button>
              ))}
            </div>
          )}

          {reports.length === 0 && boards.length === 0 && query && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#8E8EA0', fontSize: 14 }}>
              No results for "{query}"
            </div>
          )}

          {!query && (
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: '#8E8EA0', marginBottom: 12 }}>Quick links</div>
              {[
                { label: 'Events', path: '/events', icon: <Zap size={14} /> },
                { label: 'Users', path: '/users', icon: <Users size={14} /> },
                { label: 'Insights', path: '/insights', icon: <BarChart2 size={14} /> },
              ].map(item => (
                <button key={item.label} onClick={() => navTo(item.path)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left'
                }}>
                  <span style={{ color: '#8E8EA0' }}>{item.icon}</span>
                  <span style={{ fontSize: 14, color: '#1B1B2E' }}>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
