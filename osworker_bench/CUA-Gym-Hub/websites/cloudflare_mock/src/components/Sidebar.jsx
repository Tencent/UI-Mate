import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './Sidebar.css'

const navItems = [
  {
    id: 'overview', label: 'Overview', path: 'overview',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  },
  {
    id: 'analytics', label: 'Analytics & Logs', path: 'analytics',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    children: [
      { id: 'analytics-traffic', label: 'Traffic', path: 'analytics/traffic' },
      { id: 'analytics-security', label: 'Security', path: 'analytics/security' },
      { id: 'analytics-performance', label: 'Performance', path: 'analytics/performance' },
    ]
  },
  {
    id: 'dns', label: 'DNS', path: 'dns',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    children: [
      { id: 'dns-records', label: 'Records', path: 'dns' },
      { id: 'dns-settings', label: 'Settings', path: 'dns/settings' },
    ]
  },
  {
    id: 'ssl-tls', label: 'SSL/TLS', path: 'ssl-tls',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    children: [
      { id: 'ssl-overview', label: 'Overview', path: 'ssl-tls' },
      { id: 'ssl-edge', label: 'Edge Certificates', path: 'ssl-tls/edge-certificates' },
    ]
  },
  {
    id: 'security', label: 'Security', path: 'security',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    children: [
      { id: 'security-overview', label: 'Overview', path: 'security' },
      { id: 'security-waf', label: 'WAF', path: 'security/waf' },
      { id: 'security-bots', label: 'Bots', path: 'security/bots' },
      { id: 'security-ddos', label: 'DDoS', path: 'security/ddos' },
      { id: 'security-settings', label: 'Settings', path: 'security/settings' },
    ]
  },
  {
    id: 'speed', label: 'Speed', path: 'speed',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    children: [
      { id: 'speed-overview', label: 'Overview', path: 'speed' },
      { id: 'speed-optimization', label: 'Optimization', path: 'speed/optimization' },
    ]
  },
  {
    id: 'caching', label: 'Caching', path: 'caching',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    children: [
      { id: 'caching-overview', label: 'Overview', path: 'caching' },
      { id: 'caching-config', label: 'Configuration', path: 'caching/configuration' },
      { id: 'caching-rules', label: 'Cache Rules', path: 'caching/rules' },
    ]
  },
  {
    id: 'workers', label: 'Workers Routes', path: 'workers',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  },
  {
    id: 'rules', label: 'Rules', path: 'rules/page-rules',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    children: [
      { id: 'rules-page', label: 'Page Rules', path: 'rules/page-rules' },
      { id: 'rules-redirect', label: 'Redirect Rules', path: 'rules/redirect-rules' },
      { id: 'rules-transform', label: 'Transform Rules', path: 'rules/transform-rules' },
    ]
  },
  {
    id: 'network', label: 'Network', path: 'network',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
  },
  {
    id: 'scrape-shield', label: 'Scrape Shield', path: 'scrape-shield',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  },
  {
    id: 'email', label: 'Email Routing', path: 'email',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  }
]

export default function Sidebar({ zoneId }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { getZone, state } = useApp()
  const zone = getZone(zoneId)

  const [expandedItems, setExpandedItems] = useState(new Set(['analytics', 'dns', 'ssl-tls', 'security', 'speed', 'caching', 'rules']))
  const [showZoneDropdown, setShowZoneDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowZoneDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentPath = location.pathname

  function isActive(path) {
    const fullPath = `/${zoneId}/${path}`
    return currentPath === fullPath || currentPath.startsWith(fullPath + '/')
  }

  function isParentActive(item) {
    if (!item.children) return false
    return item.children.some(c => isActive(c.path))
  }

  function toggleExpand(id) {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleNavClick(path, hasChildren, id) {
    if (hasChildren) {
      toggleExpand(id)
    } else {
      navigate(`/${zoneId}/${path}`)
    }
  }

  function getZoneStatusClass(z) {
    if (z.paused) return 'paused'
    return z.status === 'active' ? 'active' : 'pending'
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <button className="sidebar-back" onClick={() => navigate('/')}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          Back to all sites
        </button>

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="sidebar-zone-selector"
            onClick={() => setShowZoneDropdown(v => !v)}
          >
            <span className={`sidebar-zone-dot ${getZoneStatusClass(zone || {})}`} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-zone-name">{zone?.name || 'Loading...'}</div>
              <div className="sidebar-zone-plan">{zone?.plan?.name || 'Free'}</div>
            </div>
            <span className="sidebar-zone-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </button>

          {showZoneDropdown && (
            <div className="sidebar-zone-dropdown">
              {(state.zones || []).map(z => (
                <button
                  key={z.id}
                  className={`sidebar-zone-option ${z.id === zoneId ? 'selected' : ''}`}
                  onClick={() => {
                    navigate(`/${z.id}/overview`)
                    setShowZoneDropdown(false)
                  }}
                >
                  <span className={`sidebar-zone-dot ${getZoneStatusClass(z)}`} />
                  <span className="sidebar-zone-option-name">{z.name}</span>
                  <span className="sidebar-zone-option-plan">{z.plan?.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ul className="sidebar-nav">
        {navItems.map(item => {
          const active = item.children ? isParentActive(item) : isActive(item.path)
          const expanded = expandedItems.has(item.id)

          return (
            <li key={item.id} className="sidebar-nav-item">
              <button
                className={`sidebar-nav-link ${active && !item.children ? 'active' : ''} ${item.children && active ? 'parent-active' : ''}`}
                onClick={() => handleNavClick(item.path, !!item.children, item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.children && (
                  <span className={`nav-arrow ${expanded ? 'expanded' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                  </span>
                )}
              </button>

              {item.children && expanded && (
                <ul className="sidebar-subnav">
                  {item.children.map(child => (
                    <li key={child.id}>
                      <button
                        className={`sidebar-subnav-link ${isActive(child.path) ? 'active' : ''}`}
                        onClick={() => navigate(`/${zoneId}/${child.path}`)}
                      >
                        {child.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
