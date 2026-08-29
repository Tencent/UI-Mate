import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GitBranch, ChevronDown, Search } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function BranchSelector({ currentBranch, basePath, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { group, project } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()

  const proj = state.projects.find(p => p.fullPath === `${group}/${project}`)
  const branches = proj ? state.branches.filter(b => b.projectId === proj.id) : []
  const filtered = branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  const handleSelect = (branchName) => {
    setOpen(false)
    setSearch('')
    if (onChange) {
      onChange(branchName)
    } else if (basePath) {
      navigate(`${basePath}/${branchName}`)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <GitBranch size={14} />
        <span style={{ fontFamily: 'var(--gl-font-mono)', fontSize: '13px' }}>{currentBranch}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div className="gl-dropdown-menu" style={{ top: '36px', left: 0, minWidth: '240px', zIndex: 100, padding: '8px' }}>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '4px 8px' }}>
              <Search size={12} color="var(--gl-text-tertiary)" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search branches..." autoFocus
                style={{ border: 'none', outline: 'none', fontSize: '13px', flex: 1, background: 'transparent' }} />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filtered.map(b => (
                <div key={b.id} className="gl-dropdown-item"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--gl-font-mono)', fontSize: '13px', background: b.name === currentBranch ? 'var(--gl-bg-tertiary)' : '' }}
                  onClick={() => handleSelect(b.name)}>
                  <GitBranch size={12} />
                  <span>{b.name}</span>
                  {b.isDefault && <span style={{ fontSize: '10px', background: 'var(--gl-info-bg)', color: 'var(--gl-info)', padding: '1px 6px', borderRadius: '10px', marginLeft: 'auto' }}>default</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
