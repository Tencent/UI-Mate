import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Menu, Search, Bell, ChevronDown, Server, Cloud } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProductCatalog from './ProductCatalog'
import NotificationPanel from './NotificationPanel'

const PRODUCTS = [
  { id: 'ecs', name: 'ECS', nameZh: '云服务器', path: '/ecs' },
  { id: 'oss', name: 'OSS', nameZh: '对象存储', path: '/oss' },
  { id: 'rds', name: 'RDS', nameZh: '云数据库', path: '/rds' },
  { id: 'vpc', name: 'VPC', nameZh: '专有网络', path: '/vpc' },
  { id: 'slb', name: 'SLB', nameZh: '负载均衡', path: '/slb' },
  { id: 'billing', name: '费用中心', nameZh: '费用中心', path: '/billing' },
  { id: 'monitor', name: '云监控', nameZh: '云监控', path: '/monitor' },
  { id: 'tickets', name: '工单', nameZh: '工单系统', path: '/tickets' }
]

export default function TopNav({ serviceName, sidebarCollapsed, onToggleSidebar }) {
  const { state, updateState } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')

  const [showCatalog, setShowCatalog] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const searchTimer = useRef(null)
  const searchRef = useRef(null)

  const unreadCount = state.messages.filter(m => !m.isRead).length

  const buildPath = (path) => sid ? `${path}?sid=${sid}` : path

  const handleRegionChange = (e) => {
    updateState({ currentRegion: e.target.value })
  }

  const handleSearch = (val) => {
    setSearchVal(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!val.trim()) { setSearchResults(null); return }
    searchTimer.current = setTimeout(() => {
      const q = val.toLowerCase()
      const products = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.nameZh.includes(q)).slice(0, 5)
      const resources = [
        ...state.ecsInstances.filter(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)).map(i => ({ type: 'ECS实例', name: i.name, id: i.id, path: `/ecs/instances/${i.id}` })),
        ...state.ossBuckets.filter(b => b.name.toLowerCase().includes(q)).map(b => ({ type: 'OSS Bucket', name: b.name, id: b.name, path: `/oss/buckets/${b.name}` })),
        ...state.rdsInstances.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)).map(r => ({ type: 'RDS实例', name: r.name, id: r.id, path: `/rds/instances/${r.id}` }))
      ].slice(0, 5)
      setSearchResults({ products, resources })
    }, 200)
  }

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchResults(null)
      if (!e.target.closest('.notif-area')) setShowNotif(false)
      if (!e.target.closest('.user-area')) setShowUser(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      <nav className="top-nav">
        <button className="nav-icon-btn" onClick={() => { onToggleSidebar(); setShowCatalog(false) }} title="切换侧栏">
          <Menu size={18} />
        </button>

        <Link to={buildPath('/')} className="nav-logo-area">
          <span className="nav-logo">阿里云</span>
        </Link>

        <button className="nav-text-btn" onClick={() => navigate(buildPath('/'))}>控制台首页</button>

        {serviceName && <span className="nav-service-name">| {serviceName}</span>}

        <select
          className="nav-region-select"
          value={state.currentRegion}
          onChange={handleRegionChange}
          title="地域选择"
        >
          <optgroup label="中国大陆">
            {state.regions.filter(r => r.zone === 'cn').map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </optgroup>
          <optgroup label="海外及港澳台">
            {state.regions.filter(r => r.zone === 'intl').map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </optgroup>
        </select>

        <div className="nav-search-wrap" ref={searchRef}>
          <span className="nav-search-icon"><Search size={14} /></span>
          <input
            className="nav-search-input"
            placeholder="搜索产品和资源..."
            value={searchVal}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') { setSearchVal(''); setSearchResults(null) }
            }}
          />
          {searchResults && (
            <div className="search-results">
              {searchResults.products.length > 0 && (
                <div className="search-results-section">
                  <div className="search-results-label">产品</div>
                  {searchResults.products.map(p => (
                    <div key={p.id} className="search-result-item" onClick={() => { navigate(buildPath(p.path)); setSearchResults(null); setSearchVal('') }}>
                      <Cloud size={14} />{p.nameZh} ({p.name})
                    </div>
                  ))}
                </div>
              )}
              {searchResults.resources.length > 0 && (
                <div className="search-results-section">
                  <div className="search-results-label">资源</div>
                  {searchResults.resources.map(r => (
                    <div key={r.id} className="search-result-item" onClick={() => { navigate(buildPath(r.path)); setSearchResults(null); setSearchVal('') }}>
                      <Server size={14} /><span><strong>{r.name}</strong> <span style={{ color: '#999', fontSize: 12 }}>{r.type}</span></span>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.products.length === 0 && searchResults.resources.length === 0 && (
                <div className="search-result-item" style={{ color: '#999' }}>无结果</div>
              )}
            </div>
          )}
        </div>

        <div className="nav-right">
          <div className="notif-area" style={{ position: 'relative' }}>
            <div className="nav-badge-wrap">
              <button className="nav-icon-btn" onClick={() => { setShowNotif(!showNotif); setShowUser(false) }} title="消息">
                <Bell size={18} />
              </button>
              {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
            </div>
            {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
          </div>

          <button className="nav-text-btn" onClick={() => navigate(buildPath('/billing'))}>费用</button>
          <button className="nav-text-btn" onClick={() => navigate(buildPath('/tickets'))}>工单</button>
          <button className="nav-text-btn" onClick={() => setShowCatalog(!showCatalog)}>产品</button>

          <div className="user-area" style={{ position: 'relative' }}>
            <button className="nav-user-btn" onClick={() => { setShowUser(!showUser); setShowNotif(false) }}>
              <div className="user-avatar">{state.user.displayName[0]}</div>
              <span>{state.user.displayName}</span>
              <ChevronDown size={12} />
            </button>
            {showUser && (
              <div className="user-dropdown">
                <div className="user-dropdown-item" style={{ cursor: 'default' }}>
                  <div style={{ fontWeight: 600 }}>{state.user.accountName}</div>
                  <div style={{ color: '#999', fontSize: 12 }}>账号ID: {state.user.accountId}</div>
                </div>
                <hr className="user-dropdown-divider" />
                <div className="user-dropdown-item" onClick={() => { navigate(buildPath('/billing')); setShowUser(false) }}>费用中心</div>
                <div className="user-dropdown-item" onClick={() => { navigate(buildPath('/tickets')); setShowUser(false) }}>工单管理</div>
                <div className="user-dropdown-item" onClick={() => { navigate(buildPath('/account/settings')); setShowUser(false) }}>账号设置</div>
                <div className="user-dropdown-item" onClick={() => { navigate(buildPath('/account/security')); setShowUser(false) }}>安全设置</div>
                <hr className="user-dropdown-divider" />
                <div className="user-dropdown-item">退出登录</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showCatalog && <ProductCatalog onClose={() => setShowCatalog(false)} />}
    </>
  )
}
