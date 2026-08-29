import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Folder, Trash2, Edit2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { DocumentModal } from '../components/Modals'

function formatBytes(b) {
  if (!b) return '—'
  if (b < 1000) return `${b} B`
  if (b < 1000000) return `${(b/1000).toFixed(0)} KB`
  return `${(b/1000000).toFixed(1)} MB`
}

export default function Documents() {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [folderFilter, setFolderFilter] = useState('All Documents')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(null)

  const folders = [{ id: 'all', name: 'All Documents' }, ...state.folders]

  const filtered = state.documents
    .filter(d => folderFilter === 'All Documents' || d.folderName === folderFilter)
    .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const folderCounts = {}
  state.folders.forEach(f => {
    folderCounts[f.name] = state.documents.filter(d => d.folderName === f.name).length
  })

  const getFileIcon = (type) => {
    if (!type) return '📄'
    if (type.includes('pdf')) return '📕'
    if (type.includes('word') || type.includes('msword')) return '📘'
    if (type.includes('spreadsheet') || type.includes('excel')) return '📗'
    if (type.includes('image')) return '🖼️'
    return '📄'
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Documents</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Upload Document</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
        {/* Folder Sidebar */}
        <div className="card" style={{ padding: 0, alignSelf: 'start' }}>
          <div style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#5F6368', borderBottom: '1px solid #EEEEEE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Folders
          </div>
          {folders.map(f => {
            const count = f.id === 'all' ? state.documents.length : (folderCounts[f.name] || 0)
            const active = folderFilter === f.name
            return (
              <div key={f.id}
                onClick={() => setFolderFilter(f.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                  cursor: 'pointer', fontSize: 13,
                  background: active ? '#EEF4FD' : 'transparent',
                  color: active ? '#1A73E8' : '#1A1A2E',
                  fontWeight: active ? 600 : 400,
                  borderLeft: active ? '3px solid #1A73E8' : '3px solid transparent'
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F8F9FA' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <Folder size={14} color={active ? '#1A73E8' : '#9AA0A6'} />
                <span style={{ flex: 1 }}>{f.name}</span>
                <span style={{ fontSize: 11, color: '#9AA0A6' }}>{count}</span>
              </div>
            )
          })}
        </div>

        {/* Document List */}
        <div>
          <div className="filter-bar" style={{ marginBottom: 12 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9AA0A6', pointerEvents: 'none' }} />
              <input className="input-field search-input" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} style={{ height: 34 }} />
            </div>
          </div>

          <div className="table-container">
            {filtered.length === 0 ? (
              <div className="empty-state"><p>No documents found</p></div>
            ) : (
              <table>
                <thead>
                  <tr className="table-header">
                    <th>Name</th>
                    <th>Matter</th>
                    <th>Category</th>
                    <th>Uploaded By</th>
                    <th>Date</th>
                    <th>Size</th>
                    <th style={{ width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id} onClick={() => setSelected(selected?.id === d.id ? null : d)} style={{ cursor: 'pointer', background: selected?.id === d.id ? '#EEF4FD' : undefined }}>
                      <td style={{ fontWeight: 500 }}>
                        <span style={{ marginRight: 8 }}>{getFileIcon(d.type)}</span>
                        {d.name}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {d.matterId ? (
                          <span className="text-link" onClick={e => { e.stopPropagation(); navigate(`/matters/${d.matterId}`) }}>
                            {state.matters.find(m => m.id === d.matterId)?.matterNumber || '—'}
                          </span>
                        ) : '—'}
                      </td>
                      <td><span className="badge badge-draft">{d.category}</span></td>
                      <td style={{ fontSize: 12 }}>{d.uploadedByName}</td>
                      <td style={{ fontSize: 12, color: '#9AA0A6' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontSize: 12, color: '#5F6368' }}>{formatBytes(d.size)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn-icon" style={{ color: '#EA4335' }}
                          onClick={() => { dispatch({ type: 'DELETE_DOCUMENT', payload: d.id }); addToast('Document deleted') }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Document Detail Panel */}
          {selected && (
            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{selected.name}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Description', selected.description || '—'],
                  ['Matter', selected.matterDescription || '—'],
                  ['Category', selected.category],
                  ['Folder', selected.folderName],
                  ['Uploaded By', selected.uploadedByName],
                  ['Version', `v${selected.version}`],
                  ['Size', formatBytes(selected.size)],
                  ['Upload Date', new Date(selected.createdAt).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span style={{ fontSize: 12, color: '#5F6368', fontWeight: 500 }}>{label}: </span>
                    <span style={{ fontSize: 13 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && <DocumentModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
