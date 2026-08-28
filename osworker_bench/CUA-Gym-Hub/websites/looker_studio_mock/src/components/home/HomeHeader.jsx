import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, HelpCircle, X, BarChart2, Database, Compass } from 'lucide-react'
import { useApp } from '../../context/AppContext'

// Xooker Studio logo SVG component
function LookerIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="16" r="9" fill="#4285F4" />
      <circle cx="21" cy="16" r="9" fill="#669DF6" opacity="0.8" />
      <circle cx="16" cy="16" r="3" fill="white" />
    </svg>
  )
}

export default function HomeHeader() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const createRef = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (createRef.current && !createRef.current.contains(e.target)) {
        setShowCreateMenu(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleCreateReport = () => {
    const id = `rpt_${Date.now()}`
    const now = new Date().toISOString()
    const report = {
      id,
      name: 'Untitled Report',
      ownerId: state.user.id,
      ownerName: state.user.name,
      ownerEmail: state.user.email,
      createdAt: now,
      modifiedAt: now,
      lastOpenedAt: now,
      thumbnailColor: '#4285F4',
      starred: false,
      shared: false,
      trashed: false,
      sharedWith: [],
      dataSources: [],
      pages: [],
      currentPageId: null
    }
    dispatch({ type: 'CREATE_REPORT', payload: report })
    setShowCreateMenu(false)
    navigate(`/report/${id}`)
  }

  const toast = (msg) => {
    setShowToast(msg)
    setTimeout(() => setShowToast(false), 2500)
  }

  return (
    <>
      <header style={{
        height: '64px',
        background: 'white',
        borderBottom: '1px solid #DADCE0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate('/')}>
          <LookerIcon />
          <span style={{ fontSize: '18px', color: '#5F6368', fontWeight: 400, whiteSpace: 'nowrap' }}>
            Xooker Studio
          </span>
        </div>

        {/* Search bar */}
        <div style={{
          flex: 1,
          maxWidth: '720px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F1F3F4',
            borderRadius: '24px',
            height: '48px',
            padding: '0 16px',
            gap: '8px'
          }}>
            <Search size={20} color="#5F6368" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search all items"
              value={state.home.searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '16px',
                color: '#202124',
              }}
            />
            {state.home.searchQuery && (
              <button
                onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5F6368', display: 'flex' }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Create button */}
          <div style={{ position: 'relative' }} ref={createRef}>
            <button
              onClick={() => setShowCreateMenu(v => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#1A73E8',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.target.style.background = '#1765CC'}
              onMouseLeave={e => e.target.style.background = '#1A73E8'}
            >
              <Plus size={18} />
              Create
            </button>
            {showCreateMenu && (
              <div className="dropdown-menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', minWidth: '180px' }}>
                <div className="dropdown-item" onClick={handleCreateReport}>
                  <BarChart2 size={18} color="#4285F4" />
                  Report
                </div>
                <div className="dropdown-item" onClick={() => { dispatch({ type: 'OPEN_CONNECTOR_DIALOG' }); setShowCreateMenu(false) }}>
                  <Database size={18} color="#34A853" />
                  Data source
                </div>
                <div className="dropdown-item" onClick={() => { navigate('/datasources'); setShowCreateMenu(false) }}>
                  <Compass size={18} color="#FBBC04" />
                  Explorer
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <button className="icon-btn" title="Help">
            <HelpCircle size={22} />
          </button>

          {/* User avatar */}
          <div
            className="avatar"
            style={{ background: state.user.avatarColor, cursor: 'pointer' }}
            title={state.user.email}
          >
            {state.user.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </header>

      {showToast && <div className="toast">{showToast}</div>}
    </>
  )
}
