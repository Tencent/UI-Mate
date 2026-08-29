import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowUpRight, ArrowDownLeft, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { CommunicationModal } from '../components/Modals'

export default function Communications() {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All')
  const [directionFilter, setDirectionFilter] = useState('All')
  const [matterFilter, setMatterFilter] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [replyContext, setReplyContext] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const filtered = state.communications
    .filter(c => typeFilter === 'All' || c.type === typeFilter)
    .filter(c => directionFilter === 'All' || c.direction === directionFilter)
    .filter(c => matterFilter === 'All' || c.matterId === matterFilter)
    .filter(c => !dateFrom || new Date(c.date) >= new Date(dateFrom))
    .filter(c => !dateTo || new Date(c.date) <= new Date(dateTo + 'T23:59:59'))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const getBadgeClass = (type) => {
    const map = { Email: 'badge-email', Phone: 'badge-phone', Text: 'badge-text', Portal: 'badge-portal' }
    return map[type] || 'badge-closed'
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Communications</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> New Communication</button>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 12 }}>
        <select className="select-field" style={{ height: 34, width: 120 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="All">All Types</option>
          {['Email','Phone','Text','Portal'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="select-field" style={{ height: 34, width: 130 }} value={directionFilter} onChange={e => setDirectionFilter(e.target.value)}>
          <option value="All">All Directions</option>
          <option>Incoming</option><option>Outgoing</option>
        </select>
        <select className="select-field" style={{ height: 34, width: 200 }} value={matterFilter} onChange={e => setMatterFilter(e.target.value)}>
          <option value="All">All Matters</option>
          {state.matters.map(m => <option key={m.id} value={m.id}>{m.matterNumber}</option>)}
        </select>
        <input className="input-field" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ height: 34, width: 140 }} placeholder="From" />
        <input className="input-field" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ height: 34, width: 140 }} placeholder="To" />
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No communications found</p></div>
        ) : (
          <table>
            <thead>
              <tr className="table-header">
                <th style={{ width: 40 }}></th>
                <th>Type</th>
                <th>Subject</th>
                <th>From</th>
                <th>To</th>
                <th>Matter</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <React.Fragment key={c.id}>
                  <tr onClick={() => setExpanded(expanded === c.id ? null : c.id)} style={{ cursor: 'pointer' }}>
                    <td>{c.direction === 'Outgoing' ? <ArrowUpRight size={14} color="#1A73E8" /> : <ArrowDownLeft size={14} color="#34A853" />}</td>
                    <td><span className={`badge ${getBadgeClass(c.type)}`}>{c.type}</span></td>
                    <td style={{ fontWeight: 500 }}>{c.subject}</td>
                    <td style={{ fontSize: 12, color: '#5F6368', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.from}</td>
                    <td style={{ fontSize: 12, color: '#5F6368', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.to}</td>
                    <td style={{ fontSize: 12 }}>
                      {c.matterId ? (
                        <span className="text-link" onClick={e => { e.stopPropagation(); navigate(`/matters/${c.matterId}`) }}>
                          {state.matters.find(m => m.id === c.matterId)?.matterNumber || '—'}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: '#9AA0A6', whiteSpace: 'nowrap' }}>{new Date(c.date).toLocaleDateString()}</td>
                  </tr>
                  {expanded === c.id && (
                    <tr key={`${c.id}-expand`}>
                      <td colSpan={7} style={{ padding: '0 16px 12px', background: '#F8F9FA' }}>
                        <div style={{ padding: '12px', background: '#FFFFFF', borderRadius: 4, border: '1px solid #E0E0E0', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: '20px' }}>
                          {c.body}
                        </div>
                        {c.attachments?.length > 0 && (
                          <div style={{ marginTop: 8, fontSize: 12, color: '#5F6368' }}>
                            Attachments: {c.attachments.map(a => a.name).join(', ')}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setReplyContext(c); setShowModal(true) }}>Reply</button>
                          <button className="btn-icon btn-sm" style={{ color: '#EA4335', fontSize: 12 }}
                            onClick={() => { dispatch({ type: 'DELETE_COMMUNICATION', payload: c.id }); addToast('Communication deleted'); setExpanded(null) }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <CommunicationModal onClose={() => { setShowModal(false); setReplyContext(null) }}
        matterId={replyContext?.matterId || undefined}
        contactId={replyContext?.contactId || undefined} />}
    </div>
  )
}
