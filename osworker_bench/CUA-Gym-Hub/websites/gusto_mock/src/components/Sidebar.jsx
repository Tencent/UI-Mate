import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const NavItem = ({ label, path, children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = location.pathname === path
  const hasChildren = children && children.length > 0
  const isChildActive = hasChildren && children.some(c => location.pathname.startsWith(c.path))
  const [expanded, setExpanded] = useState(isChildActive || isActive)

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(e => !e)
    } else if (path) {
      navigate(path)
    }
  }

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          cursor: 'pointer',
          borderLeft: isActive ? '3px solid var(--teal)' : '3px solid transparent',
          color: isActive ? 'var(--teal)' : isChildActive ? 'var(--teal)' : 'var(--charcoal)',
          background: isActive ? 'var(--teal-light)' : 'transparent',
          fontWeight: isActive ? '500' : '400',
          fontSize: '14px',
          transition: 'background 0.1s',
          userSelect: 'none',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--hover-bg)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
      >
        <span>{label}</span>
        {hasChildren && (
          <span style={{ color: 'var(--medium-gray)' }}>
            {expanded ? <ChevronDown /> : <ChevronRight />}
          </span>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {children.map(child => (
            <SubNavItem key={child.path} label={child.label} path={child.path} />
          ))}
        </div>
      )}
    </div>
  )
}

const SubNavItem = ({ label, path }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  return (
    <div
      onClick={() => navigate(path)}
      style={{
        padding: '7px 16px 7px 32px',
        cursor: 'pointer',
        borderLeft: isActive ? '3px solid var(--teal)' : '3px solid transparent',
        color: isActive ? 'var(--teal)' : 'var(--charcoal)',
        background: isActive ? 'var(--teal-light)' : 'transparent',
        fontWeight: isActive ? '500' : '400',
        fontSize: '13px',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--hover-bg)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      {label}
    </div>
  )
}

const Separator = () => (
  <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
)

const Sidebar = () => {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minWidth: 'var(--sidebar-width)',
      background: 'var(--white)',
      borderRight: '1px solid var(--border)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--xusto-green)', letterSpacing: '-0.5px' }}>
          xusto
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: '8px', paddingBottom: '16px' }}>
        <NavItem label="Home" path="/" />
        <NavItem
          label="People"
          children={[
            { label: 'Team members', path: '/people/team-members' },
            { label: 'Org chart', path: '/people/org-chart' },
            { label: 'Team insights', path: '/people/team-insights' },
            { label: 'Performance', path: '/people/performance' },
          ]}
        />
        <NavItem label="Company" path="/company" />
        <NavItem
          label="Payroll"
          children={[
            { label: 'Run Payroll', path: '/payroll/run' },
            { label: 'Payroll History', path: '/payroll/history' },
            { label: 'Pay Contractors', path: '/payroll/contractors' },
          ]}
        />
        <NavItem
          label="Time tools"
          children={[
            { label: 'Time Tracking', path: '/time-tools/time-tracking' },
            { label: 'Time Off', path: '/time-tools/time-off' },
          ]}
        />
        <NavItem label="Benefits" path="/benefits" />
        <NavItem label="Taxes & compliance" path="/taxes" />
        <Separator />
        <NavItem label="Reports" path="/reports" />
        <NavItem label="App directory" path="/app-directory" />
        <Separator />
        <NavItem label="Settings" path="/settings" />
        <NavItem label="Refer & earn" path="/refer" />
        <NavItem label="Help" path="/help" />
      </nav>
    </aside>
  )
}

export default Sidebar
