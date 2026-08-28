import React, { useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  Home, BarChart2, BarChart, GitBranch, RotateCcw,
  Users, UserCheck, Database, Search, Settings, HelpCircle, PlaySquare,
  ChevronsLeft, ChevronsRight, Plus, ChevronDown, ChevronRight,
  Layers, Star
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import CreateMenu from './CreateMenu.jsx'

export default function Sidebar() {
  const { state, sidebarCollapsed, setSidebarCollapsed, setActiveModal } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const [reportsExpanded, setReportsExpanded] = useState(true)
  const [usersExpanded, setUsersExpanded] = useState(true)
  const [boardsExpanded, setBoardsExpanded] = useState(true)
  const [createMenuOpen, setCreateMenuOpen] = useState(false)

  function navTo(path) {
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const boards = state?.boards || []
  const collapsed = sidebarCollapsed

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: collapsed ? 52 : 240,
      background: '#fff',
      borderRight: '1px solid #E4E4E8',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease-in-out',
      zIndex: 100,
      overflow: 'hidden'
    }}>
      {/* Xixpanel logo / project */}
      <div style={{
        padding: collapsed ? '16px 0' : '14px 16px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        flexShrink: 0,
        justifyContent: collapsed ? 'center' : 'flex-start'
      }}>
        {/* Xixpanel-style logo */}
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: '#4F44E0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 4L12 12M12 12L20 4M12 12L4 20M12 12L20 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1B1B2E', lineHeight: 1.2 }}>{state?.project?.name || 'Xixpanel'}</div>
              <div style={{ fontSize: 11, color: '#8E8EA0', lineHeight: 1.2 }}>{state?.project?.dataView || 'All Project Data'}</div>
            </div>
            <ChevronDown size={14} color="#8E8EA0" />
          </>
        )}
      </div>

      {/* Search bar */}
      {!collapsed && (
        <button onClick={() => setActiveModal({ type: 'search' })} style={{
          margin: '2px 12px 6px', padding: '7px 10px',
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F7F7F8', border: '1px solid #E4E4E8', borderRadius: 6,
          cursor: 'pointer', color: '#8E8EA0', fontSize: 13,
          transition: 'border-color 0.15s',
          flexShrink: 0
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#4F44E0'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#E4E4E8'}>
          <Search size={14} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
          <span style={{ fontSize: 10, color: '#8E8EA0', background: '#fff', padding: '1px 5px', borderRadius: 3, border: '1px solid #E4E4E8' }}>Cmd+K</span>
        </button>
      )}
      {collapsed && (
        <button onClick={() => setActiveModal({ type: 'search' })} style={{
          margin: '2px 8px', padding: '8px', borderRadius: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F7F7F8'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <Search size={18} color="#8E8EA0" />
        </button>
      )}

      {/* Main nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '0 6px' : '0 8px' }}>
        <NavItem icon={<Home size={16} />} label="Home" active={isActive('/home')}
          onClick={() => navTo('/home')} collapsed={collapsed} />

        {/* Boards section */}
        {!collapsed && (
          <>
            <SectionHeader label="Boards" open={boardsExpanded} onClick={() => setBoardsExpanded(v => !v)} />
            {boardsExpanded && boards.map(board => (
              <NavItem key={board.id}
                icon={board.isFavorite ? <Star size={14} color="#F5A623" fill="#F5A623" /> : <Layers size={14} />}
                label={board.name}
                active={location.pathname === `/board/${board.id}`}
                onClick={() => navTo(`/board/${board.id}`)}
                collapsed={false} small />
            ))}
          </>
        )}

        {/* Reports section */}
        <div style={{ marginTop: collapsed ? 0 : 4 }}>
          <NavItem icon={<BarChart2 size={16} />} label="Reports"
            active={isActive('/insights') || isActive('/funnels') || isActive('/flows') || isActive('/retention') || isActive('/report')}
            onClick={() => setReportsExpanded(v => !v)}
            hasChevron={!collapsed}
            chevronOpen={reportsExpanded}
            collapsed={collapsed} />
          {reportsExpanded && !collapsed && (
            <div style={{ paddingLeft: 12 }}>
              <NavItem icon={<BarChart2 size={14} />} label="Insights" active={isActive('/insights')} onClick={() => navTo('/insights')} collapsed={false} small />
              <NavItem icon={<BarChart size={14} />} label="Funnels" active={isActive('/funnels')} onClick={() => navTo('/funnels')} collapsed={false} small />
              <NavItem icon={<GitBranch size={14} />} label="Flows" active={isActive('/flows')} onClick={() => navTo('/flows')} collapsed={false} small />
              <NavItem icon={<RotateCcw size={14} />} label="Retention" active={isActive('/retention')} onClick={() => navTo('/retention')} collapsed={false} small />
            </div>
          )}
        </div>

        {/* Users section */}
        <NavItem icon={<Users size={16} />} label="Users"
          active={isActive('/users') || isActive('/cohorts') || isActive('/session-replay')}
          onClick={() => setUsersExpanded(v => !v)}
          hasChevron={!collapsed}
          chevronOpen={usersExpanded}
          collapsed={collapsed} />
        {usersExpanded && !collapsed && (
          <div style={{ paddingLeft: 12 }}>
            <NavItem icon={<Users size={14} />} label="Explore" active={isActive('/users')} onClick={() => navTo('/users')} collapsed={false} small />
            <NavItem icon={<UserCheck size={14} />} label="Cohorts" active={isActive('/cohorts')} onClick={() => navTo('/cohorts')} collapsed={false} small />
            <NavItem icon={<PlaySquare size={14} />} label="Session Replay" active={isActive('/session-replay')} onClick={() => navTo('/session-replay')} collapsed={false} small />
          </div>
        )}

        {/* Data Management */}
        <NavItem icon={<Database size={16} />} label="Data Management"
          active={isActive('/lexicon') || isActive('/events')}
          onClick={() => navTo('/lexicon')}
          collapsed={collapsed} />
      </div>

      {/* Create new button */}
      <div style={{ padding: collapsed ? '8px 8px' : '8px 12px', position: 'relative', flexShrink: 0 }}>
        {collapsed ? (
          <button onClick={() => setCreateMenuOpen(v => !v)} style={{
            width: 36, height: 36, borderRadius: 6,
            background: '#4F44E0', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer'
          }}>
            <Plus size={18} />
          </button>
        ) : (
          <button onClick={() => setCreateMenuOpen(v => !v)} style={{
            width: '100%', background: '#4F44E0', color: '#fff',
            border: 'none', borderRadius: 6, padding: '8px 12px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#3D34C0'}
          onMouseLeave={e => e.currentTarget.style.background = '#4F44E0'}>
            <Plus size={15} />
            <span style={{ flex: 1, textAlign: 'left' }}>New Report</span>
          </button>
        )}
        {createMenuOpen && (
          <CreateMenu onClose={() => setCreateMenuOpen(false)} navTo={navTo} />
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '8px 0' : '8px 10px',
        borderTop: '1px solid #E4E4E8',
        flexShrink: 0,
        gap: collapsed ? 0 : 4
      }}>
        {collapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <IconBtn icon={<HelpCircle size={16} />} />
            <IconBtn icon={<Settings size={16} />} onClick={() => navTo('/settings')} />
            <IconBtn icon={<ChevronsRight size={16} />} onClick={() => setSidebarCollapsed(false)} />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 2 }}>
              <IconBtn icon={<HelpCircle size={16} />} />
              <IconBtn icon={<Settings size={16} />} onClick={() => navTo('/settings')} />
            </div>
            <IconBtn icon={<ChevronsLeft size={16} />} onClick={() => setSidebarCollapsed(true)} />
          </>
        )}
      </div>
    </div>
  )
}

function NavItem({ icon, label, active, onClick, collapsed, hasChevron, chevronOpen, small }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={collapsed ? label : undefined}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: collapsed ? '9px 9px' : small ? '5px 10px' : '7px 10px',
        borderRadius: 6,
        border: 'none',
        background: active ? '#F0EFFC' : hover ? '#F7F7F8' : 'transparent',
        color: active ? '#1B1B2E' : '#585870',
        fontSize: small ? 13 : 14,
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        textAlign: 'left',
        marginBottom: 1,
        justifyContent: collapsed ? 'center' : 'flex-start'
      }}
    >
      <span style={{ flexShrink: 0, color: active ? '#4F44E0' : '#8E8EA0', display: 'flex' }}>{icon}</span>
      {!collapsed && (
        <>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
          {hasChevron && (chevronOpen
            ? <ChevronDown size={13} color="#8E8EA0" />
            : <ChevronRight size={13} color="#8E8EA0" />)}
        </>
      )}
    </button>
  )
}

function SectionHeader({ label, open, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 4,
      padding: '10px 10px 4px',
      background: 'none', border: 'none', cursor: 'pointer',
      fontSize: 11, fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      color: '#8E8EA0'
    }}>
      {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      {label}
    </button>
  )
}

function IconBtn({ icon, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28, borderRadius: 6,
        background: hover ? '#F7F7F8' : 'transparent',
        border: 'none', cursor: onClick ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#8E8EA0', position: 'relative',
        transition: 'background 0.15s'
      }}
    >
      {icon}
    </button>
  )
}
