import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import TopNav from './TopNav.jsx'

const sidebarSections = [
  {
    heading: null,
    links: [
      { label: 'Home', to: '/', icon: '\u2302' },
    ],
  },
  {
    heading: 'Myself',
    links: [
      { label: 'Profile & Contact', to: '/myself/info' },
      { label: 'Pay Statements', to: '/myself/pay' },
      { label: 'Tax Statements', to: '/myself/tax' },
      { label: 'Direct Deposit', to: '/myself/direct-deposit' },
      { label: 'Timecard', to: '/myself/time' },
      { label: 'Schedule', to: '/myself/schedule' },
      { label: 'Attendance', to: '/myself/attendance' },
      { label: 'Time Off', to: '/myself/timeoff' },
      { label: 'Benefits', to: '/myself/benefits' },
      { label: 'Dependents', to: '/myself/dependents' },
    ],
  },
  {
    heading: 'People',
    links: [
      { label: 'Employee Directory', to: '/people' },
      { label: 'Org Chart', to: '/people/org-chart' },
    ],
  },
  {
    heading: 'My Team',
    links: [
      { label: 'Team Members', to: '/my-team' },
      { label: 'Approvals', to: '/my-team/approvals' },
    ],
  },
  {
    heading: 'Payroll',
    links: [
      { label: 'Pay Runs', to: '/payroll' },
    ],
  },
  {
    heading: 'Reports',
    links: [
      { label: 'Reports', to: '/reports' },
    ],
  },
  {
    heading: 'Administration',
    links: [
      { label: 'Settings', to: '/settings' },
    ],
  },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <TopNav onToggleSidebar={() => setCollapsed(v => !v)} />
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{
          width: collapsed ? 0 : 220,
          minWidth: collapsed ? 0 : 220,
          background: '#1F2937',
          minHeight: 'calc(100vh - 56px)',
          overflow: collapsed ? 'hidden' : 'auto',
          transition: 'width 0.2s, min-width 0.2s',
          borderRight: '1px solid #374151',
        }}>
          <nav style={{ padding: '12px 0' }}>
            {sidebarSections.map((section, si) => (
              <div key={si}>
                {section.heading && (
                  <div style={{
                    padding: '14px 16px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    {section.heading}
                  </div>
                )}
                {section.links.map(link => {
                  const active = isActive(link.to)
                  return (
                    <button
                      key={link.to}
                      onClick={() => navigate(link.to)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '7px 16px 7px 20px',
                        background: active ? 'rgba(208,2,27,0.15)' : 'transparent',
                        color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                        fontSize: 13,
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                        border: 'none',
                        borderLeft: active ? '3px solid #D0021B' : '3px solid transparent',
                        transition: 'all 0.1s',
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                        }
                      }}
                    >
                      {link.icon && <span style={{ marginRight: 6 }}>{link.icon}</span>}
                      {link.label}
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
