import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { formatDate } from '../utils/helpers'

const Documents = () => {
  const { state, addDocument } = useAppContext()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({ name: '', category: 'Policies', employeeId: '' })

  const documents = state?.documents || []
  const employees = state?.employees || []

  const categories = ['All', ...new Set(documents.map(d => d.category))]

  const filtered = documents.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !q || d.name.toLowerCase().includes(q)
    const matchCat = catFilter === 'All' || d.category === catFilter
    return matchSearch && matchCat
  })

  const handleUpload = () => {
    if (!uploadForm.name) return
    const newDoc = {
      id: `doc_${Date.now()}`,
      name: uploadForm.name,
      type: 'Document',
      category: uploadForm.category,
      employeeId: uploadForm.employeeId || undefined,
      uploadedDate: '2025-04-10',
      uploadedBy: 'Jessica Jackson',
      size: '150 KB'
    }
    addDocument(newDoc)
    setUploadForm({ name: '', category: 'Policies', employeeId: '' })
    setShowUploadModal(false)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Documents</h1>
        <button className="btn-primary" onClick={() => setShowUploadModal(true)}>Upload document</button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--medium-gray)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </span>
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: '160px' }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Category</th>
              <th>Related Employee</th>
              <th>Uploaded</th>
              <th>Uploaded By</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(doc => {
              const emp = doc.employeeId ? employees.find(e => e.id === doc.employeeId) : null
              return (
                <tr key={doc.id}>
                  <td style={{ fontWeight: '500' }}>📄 {doc.name}</td>
                  <td style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>{doc.type}</td>
                  <td><span className="badge badge-upcoming">{doc.category}</span></td>
                  <td style={{ fontSize: '13px' }}>{emp ? `${emp.firstName} ${emp.lastName}` : '—'}</td>
                  <td style={{ color: 'var(--medium-gray)' }}>{formatDate(doc.uploadedDate)}</td>
                  <td style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>{doc.uploadedBy}</td>
                  <td style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>{doc.size}</td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--medium-gray)', padding: '32px' }}>No documents found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showUploadModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowUploadModal(false)}>
          <div className="modal-content" style={{ width: '480px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', color: 'var(--medium-gray)', fontSize: '20px', padding: 0 }}>×</button>
            </div>
            <div className="form-field">
              <label>Document name *</label>
              <input value={uploadForm.name} onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Employee Handbook 2025" />
            </div>
            <div className="form-field">
              <label>Category</label>
              <select value={uploadForm.category} onChange={e => setUploadForm(f => ({ ...f, category: e.target.value }))}>
                {['Policies', 'Compliance', 'Tax', 'Hiring', 'Payroll', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Related employee (optional)</label>
              <select value={uploadForm.employeeId} onChange={e => setUploadForm(f => ({ ...f, employeeId: e.target.value }))}>
                <option value="">None</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn-outline" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpload} disabled={!uploadForm.name}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents
