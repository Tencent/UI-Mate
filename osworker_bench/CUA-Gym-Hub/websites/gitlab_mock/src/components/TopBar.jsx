import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { Search, Plus, CheckSquare, ChevronDown } from 'lucide-react'
import { useApp, ACTIONS } from '../context/AppContext.jsx'

function TanukiLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 9.5L5.5 19L12 22L18.5 19L22 9.5L12 2Z" fill="#FC6D26"/>
      <path d="M12 2L5.5 19L12 22L18.5 19L12 2Z" fill="#E24329"/>
      <path d="M12 2L2 9.5L5.5 19L12 2Z" fill="#FCA326"/>
      <path d="M12 2L22 9.5L18.5 19L12 2Z" fill="#FCA326"/>
    </svg>
  )
}

export default function TopBar() {
  const navigate = useNavigate()
  const { group, project } = useParams()
  const { state, dispatch } = useApp()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [plusOpen, setPlusOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const searchRef = useRef(null)
  const currentUser = state.currentUser
  const pendingTodos = state.todos ? state.todos.filter(t => !t.isDone && t.state !== 'done').length : 0

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => searchRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') { setSearchOpen(false); setPlusOpen(false); setUserOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const currentProject = (group && project)
    ? state.projects.find(p => p.fullPath === `${group}/${project}`)
    : null

  const searchResults = searchVal.length > 1 ? [
    ...state.projects.filter(p => p.name.toLowerCase().includes(searchVal.toLowerCase()) || p.fullPath.toLowerCase().includes(searchVal.toLowerCase())).slice(0, 5).map(p => ({ type: 'Project', label: p.fullPath, path: `/${p.fullPath}` })),
    ...state.issues.filter(i => i.title.toLowerCase().includes(searchVal.toLowerCase())).slice(0, 3).map(i => {
      const proj = state.projects.find(p => p.id === i.projectId)
      return { type: 'Issue', label: i.title, path: proj ? `/${proj.fullPath}/-/issues/${i.iid}` : '/' }
    }),
    ...state.mergeRequests.filter(m => m.title.toLowerCase().includes(searchVal.toLowerCase())).slice(0, 3).map(m => {
      const proj = state.projects.find(p => p.id === m.projectId)
      return { type: 'MR', label: m.title, path: proj ? `/${proj.fullPath}/-/merge_requests/${m.iid}` : '/' }
    }),
  ] : []

  return (
    <header style={{
      height: '48px', background: '#1F1E24', borderBottom: '1px solid #3a3843',
      display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px',
      flexShrink: 0, position: 'relative', zIndex: 100,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <TanukiLogo />
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>XitLab</span>
      </Link>

      <div style={{ flex: 1, maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#2d2b38', border: '1px solid #3a3843', borderRadius: '20px',
          padding: '6px 12px', cursor: 'text',
        }} onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }}>
          <Search size={14} color="#a2a1a6" />
          <input
            ref={searchRef}
            value={searchVal}
            onChange={e => { setSearchVal(e.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search or go to..."
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: '14px', width: '100%',
            }}
          />
        </div>
        {searchOpen && searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '40px', left: 0, right: 0,
            background: '#fff', border: '1px solid var(--gl-border)',
            borderRadius: '4px', boxShadow: 'var(--gl-shadow-md)',
            zIndex: 200, maxHeight: '400px', overflowY: 'auto',
          }}>
            {searchResults.map((r, i) => (
              <div key={i} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--gl-border)' }}
                onClick={() => { navigate(r.path); setSearchOpen(false); setSearchVal('') }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <span style={{ fontSize: '11px', color: 'var(--gl-text-secondary)', marginRight: '8px', background: '#f0f0f0', padding: '2px 6px', borderRadius: '10px' }}>{r.type}</span>
                <span style={{ fontSize: '14px' }}>{r.label}</span>
              </div>
            ))}
          </div>
        )}
        {searchOpen && searchVal.length <= 1 && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setSearchOpen(false)} />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
        {/* Plus button */}
        <div style={{ position: 'relative' }}>
          <button className="gl-btn gl-btn-ghost" style={{ color: '#fff', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => { setPlusOpen(o => !o); setUserOpen(false) }}>
            <Plus size={16} /> <ChevronDown size={12} />
          </button>
          {plusOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 149 }} onClick={() => setPlusOpen(false)} />
              <div className="gl-dropdown-menu" style={{ right: 0, top: '36px', minWidth: '180px', zIndex: 150 }}>
                <div className="gl-dropdown-item" onClick={() => { navigate('/projects/new'); setPlusOpen(false) }}>New project</div>
                {currentProject && <>
                  <div className="gl-dropdown-item" onClick={() => { navigate(`/${currentProject.fullPath}/-/issues/new`); setPlusOpen(false) }}>New issue</div>
                  <div className="gl-dropdown-item" onClick={() => { navigate(`/${currentProject.fullPath}/-/merge_requests/new`); setPlusOpen(false) }}>New merge request</div>
                </>}
                {currentProject && <div className="gl-dropdown-item" onClick={() => { navigate(`/${currentProject.fullPath}/-/snippets`); setPlusOpen(false) }}>New snippet</div>}
              </div>
            </>
          )}
        </div>

        {/* Todo badge */}
        <Link to="/dashboard/todos" style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '4px 8px', color: '#fff', textDecoration: 'none' }}>
          <CheckSquare size={16} />
          {pendingTodos > 0 && (
            <span style={{
              position: 'absolute', top: '-2px', right: '0px',
              background: '#E24329', color: '#fff', borderRadius: '10px',
              fontSize: '10px', padding: '1px 5px', fontWeight: 600, minWidth: '16px', textAlign: 'center',
            }}>{pendingTodos}</span>
          )}
        </Link>

        {/* User avatar */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setUserOpen(o => !o); setPlusOpen(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <img src={currentUser.avatarUrl || currentUser.avatar} alt={currentUser.name}
              style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'block' }} />
          </button>
          {userOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 149 }} onClick={() => setUserOpen(false)} />
              <div className="gl-dropdown-menu" style={{ right: 0, top: '40px', minWidth: '200px', zIndex: 150 }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--gl-border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{currentUser.name}</div>
                  <div style={{ color: 'var(--gl-text-secondary)', fontSize: '12px' }}>@{currentUser.username}</div>
                </div>
                <div className="gl-dropdown-item" onClick={() => { navigate('/-/profile'); setUserOpen(false) }}>Edit profile</div>
                <div className="gl-dropdown-item" onClick={() => { navigate('/-/profile'); setUserOpen(false) }}>Preferences</div>
                <div className="gl-dropdown-divider" />
                <div className="gl-dropdown-item" onClick={() => { dispatch({ type: ACTIONS.RESET }); navigate('/'); setUserOpen(false) }}>Sign out</div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
