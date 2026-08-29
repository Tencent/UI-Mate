import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AlertCircle, Layers, Zap, Package, MessageSquare, Bell,
  BarChart2, LayoutDashboard, Monitor, Activity, TrendingUp,
  Settings, HelpCircle, ChevronDown, ChevronRight, Star,
  ChevronsLeft, Menu
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { getInitials, getAvatarColor } from '../utils/helpers.js'
import { withCurrentSearch } from '../utils/navigation.js'

const SIDEBAR_BG = '#362D59'
const SIDEBAR_TEXT = '#9386A0'
const ACTIVE_BG = '#4A3E6B'
const ACTIVE_BORDER = '#6C5FC7'
const DIVIDER = 'rgba(255,255,255,0.1)'

const navItems = [
  { label: 'Issues', icon: AlertCircle, path: '/issues/' },
  { label: 'Projects', icon: Layers, path: '/projects/' },
  { label: 'Performance', icon: Zap, path: '/performance/' },
  { label: 'Releases', icon: Package, path: '/releases/' },
  { label: 'User Feedback', icon: MessageSquare, path: '/user-feedback/' },
  { label: 'Alerts', icon: Bell, path: '/alerts/' },
  { label: 'Discover', icon: BarChart2, path: '/discover/' },
  { label: 'Dashboards', icon: LayoutDashboard, path: '/dashboards/' },
  { label: 'Monitors', icon: Monitor, path: '/monitors/' },
  { label: 'Activity', icon: Activity, path: '/activity/' },
  { label: 'Stats', icon: TrendingUp, path: '/stats/' },
]

const bottomItems = [
  { label: 'Settings', icon: Settings, path: '/settings/' },
  { label: 'Help', icon: HelpCircle, path: null },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const currentUser = state.currentUser || { name: 'Jane Schmidt' }
  const org = state.organization || { name: 'Empower Plant' }

  function isActive(path) {
    if (!path) return false
    if (path === '/issues/' && location.pathname.startsWith('/issues')) return true
    if (path !== '/issues/' && location.pathname.startsWith(path)) return true
    return false
  }

  const sidebarWidth = collapsed ? 60 : 220
  const toPath = (path) => withCurrentSearch(path, location.search)

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: sidebarWidth, backgroundColor: SIDEBAR_BG,
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s ease', zIndex: 100,
      overflowX: 'hidden', overflowY: 'auto'
    }}>
      {/* Org header */}
      <div style={{
        padding: collapsed ? '12px 0' : '12px 14px',
        borderBottom: `1px solid ${DIVIDER}`,
        display: 'flex', alignItems: 'center', gap: 8,
        minHeight: 56, cursor: 'pointer',
        justifyContent: collapsed ? 'center' : 'flex-start'
      }} onClick={() => !collapsed && navigate(toPath('/issues/'))}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          backgroundColor: '#6C5FC7', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px'
        }}>EP</div>
        {!collapsed && <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {org.name}
            </div>
          </div>
          <ChevronDown size={14} color={SIDEBAR_TEXT} />
        </>}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, paddingTop: 8 }}>
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = isActive(path)
          return (
            <div key={label}
              onClick={() => path && navigate(toPath(path))}
              style={{
                display: 'flex', alignItems: 'center',
                gap: 10, height: 40,
                paddingLeft: collapsed ? 0 : 16,
                paddingRight: collapsed ? 0 : 12,
                justifyContent: collapsed ? 'center' : 'flex-start',
                cursor: 'pointer', position: 'relative',
                backgroundColor: active ? ACTIVE_BG : 'transparent',
                borderLeft: active ? `3px solid ${ACTIVE_BORDER}` : '3px solid transparent',
                color: active ? '#fff' : SIDEBAR_TEXT,
                fontSize: 13, fontWeight: active ? 500 : 400,
                transition: 'background-color 0.15s',
                userSelect: 'none'
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>}
            </div>
          )
        })}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: DIVIDER, margin: '8px 0' }} />

        {bottomItems.map(({ label, icon: Icon, path }) => (
          <div key={label}
            onClick={() => path ? navigate(toPath(path)) : setShowHelp(true)}
            style={{
              display: 'flex', alignItems: 'center',
              gap: 10, height: 40,
              paddingLeft: collapsed ? 0 : 16,
              justifyContent: collapsed ? 'center' : 'flex-start',
              cursor: 'pointer',
              backgroundColor: isActive(path) ? ACTIVE_BG : 'transparent',
              borderLeft: isActive(path) ? `3px solid ${ACTIVE_BORDER}` : '3px solid transparent',
              color: SIDEBAR_TEXT, fontSize: 13,
              userSelect: 'none'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = isActive(path) ? ACTIVE_BG : 'transparent' }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </div>
        ))}
      </nav>

      {/* Bottom: user + collapse */}
      <div style={{ borderTop: `1px solid ${DIVIDER}`, padding: '8px 0' }}>
        {/* User */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          paddingLeft: collapsed ? 0 : 14, height: 40,
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
            backgroundColor: getAvatarColor(currentUser.name),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff'
          }}>
            {getInitials(currentUser.name)}
          </div>
          {!collapsed && <span style={{ color: SIDEBAR_TEXT, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser.name}
          </span>}
        </div>

        {/* Collapse toggle */}
        <div
          onClick={() => setCollapsed(c => !c)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            paddingLeft: collapsed ? 0 : 14, height: 36,
            justifyContent: collapsed ? 'center' : 'flex-start',
            cursor: 'pointer', color: SIDEBAR_TEXT, fontSize: 12,
            userSelect: 'none'
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          {collapsed
            ? <ChevronRight size={16} />
            : <><ChevronsLeft size={16} /><span>Collapse</span></>
          }
        </div>
      </div>
      {showHelp && (
        <div onClick={() => setShowHelp(false)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 460, maxWidth: '90vw', backgroundColor: '#fff', borderRadius: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', padding: 24, color: '#2B2233'
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Xentry Help</h2>
            <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
              {['Issues', 'Alerts', 'Discover', 'Dashboards'].map(label => (
                <button key={label} onClick={() => { setShowHelp(false); navigate(toPath(`/${label.toLowerCase() === 'issues' ? 'issues' : label.toLowerCase()}/`)) }}
                  style={{ textAlign: 'left', padding: 12, border: '1px solid #E2DBE8', borderRadius: 6, backgroundColor: '#FAF9FB', color: '#2B2233' }}>
                  Open {label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button onClick={() => setShowHelp(false)} style={{ backgroundColor: '#6C5FC7', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 16px' }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
