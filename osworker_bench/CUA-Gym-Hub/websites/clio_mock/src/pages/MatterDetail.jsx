import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { ArrowLeft, Edit2, ArrowUpRight, ArrowDownLeft, Plus, Trash2 } from 'lucide-react'
import { MatterModal, TimeEntryModal, ExpenseModal, CommunicationModal, NoteModal, DocumentModal, GenerateBillModal, RecordPaymentModal } from '../components/Modals'
import { formatDistanceToNow } from 'date-fns'

function getBadgeClass(status) {
  const map = { Open: 'badge-open', Pending: 'badge-pending', Closed: 'badge-closed', Overdue: 'badge-overdue', Draft: 'badge-draft', Sent: 'badge-sent', Paid: 'badge-paid', 'Awaiting Approval': 'badge-awaiting', Void: 'badge-void' }
  return map[status] || 'badge-closed'
}

function formatBytes(b) {
  if (!b) return '—'
  if (b < 1000) return `${b} B`
  if (b < 1000000) return `${(b/1000).toFixed(0)} KB`
  return `${(b/1000000).toFixed(1)} MB`
}

export default function MatterDetail() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Dashboard')
  const [modal, setModal] = useState(null)

  const matter = state.matters.find(m => m.id === id)

  useEffect(() => {
    if (id) dispatch({ type: 'UPDATE_RECENT_MATTERS', payload: id })
  }, [id])

  if (!matter) return <div style={{ padding: 40, color: '#5F6368' }}>Matter not found. <Link to="/matters">Back to Matters</Link></div>

  const client = state.contacts.find(c => c.id === matter.clientId)
  const activities = state.activities.filter(a => a.matterId === id)
  const bills = state.bills.filter(b => b.matterId === id)
  const documents = state.documents.filter(d => d.matterId === id)
  const notes = state.notes.filter(n => n.matterId === id)
  const communications = state.communications.filter(c => c.matterId === id)

  const totalBilled = bills.filter(b => b.status !== 'Void').reduce((s, b) => s + b.totalDue, 0)
  const totalUnbilled = activities.filter(a => !a.billed && a.billable).reduce((s, a) => s + a.total, 0)
  const budgetRemaining = matter.budget ? matter.budget - totalBilled - totalUnbilled : null

  const relatedContacts = (matter.relatedContacts || []).map(rc => ({
    ...rc,
    contact: state.contacts.find(c => c.id === rc.contactId)
  }))

  const recentActivity = [...activities]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—'

  const tabs = ['Dashboard', 'Communications', 'Notes', 'Documents', 'Bills', 'Transactions']

  return (
    <div>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/matters')} style={{ marginBottom: 12 }}>
        <ArrowLeft size={14} /> Back to Matters
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: 0, borderRadius: '8px 8px 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: '#9AA0A6', marginBottom: 4, fontFamily: 'monospace' }}>{matter.matterNumber}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>{matter.description}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {client && (
                <span className="text-link" onClick={() => { dispatch({ type: 'UPDATE_RECENT_CONTACTS', payload: client.id }); navigate(`/contacts/${client.id}`) }} style={{ cursor: 'pointer' }}>
                  {client.displayName}
                </span>
              )}
              <span className={`badge ${getBadgeClass(matter.status)}`}>{matter.status}</span>
              {matter.stage && <span style={{ fontSize: 12, color: '#5F6368' }}>Stage: {matter.stage}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setModal('edit')}><Edit2 size={14} /> Edit</button>
            <button className="btn btn-primary" onClick={() => setModal('generateBill')}>Quick Bill</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ borderRadius: 0 }}>
        {tabs.map(t => <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: 16 }}>
        {/* Dashboard Tab */}
        {tab === 'Dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
            <div>
              {/* Contact Info */}
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Contact Information</h3>
                {client ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[
                      ['Name', client.displayName],
                      ['Phone', client.phone],
                      ['Email', client.email],
                      ['Address', client.address ? `${client.address.street}, ${client.address.city}, ${client.address.state}` : '—'],
                    ].map(([label, value]) => value ? (
                      <div key={label} style={{ display: 'flex', gap: 12 }}>
                        <span style={{ width: 80, fontSize: 13, color: '#5F6368', fontWeight: 500, flexShrink: 0 }}>{label}</span>
                        <span style={{ fontSize: 13 }}>{value}</span>
                      </div>
                    ) : null)}
                  </div>
                ) : <p style={{ color: '#9AA0A6', fontSize: 13 }}>No client assigned</p>}
              </div>

              {/* Key Dates */}
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Key Dates</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {[
                    ['Open Date', formatDate(matter.openDate)],
                    ['Statute of Limitations', formatDate(matter.statuteOfLimitations)],
                    ['Court', matter.courtName || '—'],
                    ['Case Number', matter.caseNumber || '—'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 160, fontSize: 13, color: '#5F6368', fontWeight: 500, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: 13 }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ width: 160, fontSize: 13, color: '#5F6368', fontWeight: 500, flexShrink: 0 }}>Stage</span>
                    <select className="select-field" style={{ width: 160, height: 30, fontSize: 13 }} value={matter.stage || 'Intake'}
                      onChange={e => dispatch({ type: 'UPDATE_MATTER', payload: { ...matter, stage: e.target.value, updatedAt: new Date().toISOString() } })}>
                      {['Intake','Filing','Discovery','Negotiation','Trial','Appeal','Closed'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Related Contacts */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>Related Contacts</h3>
                </div>
                {relatedContacts.length === 0 ? (
                  <p style={{ color: '#9AA0A6', fontSize: 13 }}>No related contacts</p>
                ) : (
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #EEEEEE' }}>
                        <th style={{ fontSize: 12, textAlign: 'left', padding: '4px 0', color: '#5F6368' }}>Name</th>
                        <th style={{ fontSize: 12, textAlign: 'left', padding: '4px 0', color: '#5F6368' }}>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedContacts.map((rc, i) => (
                        <tr key={i}>
                          <td style={{ padding: '6px 0', fontSize: 13 }}>
                            {rc.contact ? (
                              <span className="text-link" onClick={() => navigate(`/contacts/${rc.contactId}`)} style={{ cursor: 'pointer' }}>
                                {rc.contact.displayName}
                              </span>
                            ) : rc.contactId}
                          </td>
                          <td style={{ padding: '6px 0', fontSize: 13, color: '#5F6368' }}>{rc.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div>
              {/* Billing Summary */}
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Billing Summary</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    ['Total Billed', `$${totalBilled.toLocaleString()}`],
                    ['Unbilled Time & Expenses', `$${totalUnbilled.toLocaleString()}`],
                    ...(budgetRemaining !== null ? [['Budget Remaining', `$${Math.max(0, budgetRemaining).toLocaleString()}`]] : []),
                    ['Billing Method', matter.billingMethod],
                    ...(matter.billingMethod === 'Hourly' ? [['Hourly Rate', `$${matter.hourlyRate}/hr`]] : []),
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#5F6368' }}>{label}</span>
                      <span style={{ fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Recent Activity</h3>
                {recentActivity.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9AA0A6' }}>No activity yet</p>
                ) : (
                  recentActivity.map(a => (
                    <div key={a.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #EEEEEE' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{a.description.length > 50 ? a.description.substring(0,50) + '...' : a.description}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>${a.total.toFixed(0)}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#9AA0A6' }}>{a.date} · {a.userName}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Communications Tab */}
        {tab === 'Communications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setModal('comm')}><Plus size={14} /> New Communication</button>
            </div>
            <div className="table-container">
              {communications.length === 0 ? <div className="empty-state"><p>No communications</p></div> : (
                <table>
                  <thead>
                    <tr className="table-header">
                      <th style={{ width: 40 }}></th>
                      <th>Type</th><th>Subject</th><th>From/To</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communications.sort((a,b) => new Date(b.date) - new Date(a.date)).map(c => (
                      <tr key={c.id}>
                        <td>{c.direction === 'Outgoing' ? <ArrowUpRight size={14} color="#1A73E8" /> : <ArrowDownLeft size={14} color="#34A853" />}</td>
                        <td><span className={`badge badge-${c.type.toLowerCase()}`}>{c.type}</span></td>
                        <td style={{ fontWeight: 500 }}>{c.subject}</td>
                        <td style={{ fontSize: 12, color: '#5F6368' }}>{c.direction === 'Outgoing' ? c.to : c.from}</td>
                        <td style={{ fontSize: 12, color: '#9AA0A6' }}>{new Date(c.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {tab === 'Notes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setModal('note')}><Plus size={14} /> New Note</button>
            </div>
            {notes.length === 0 ? <div className="empty-state"><p>No notes</p></div> : (
              notes.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(n => (
                <div key={n.id} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{n.subject}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-icon" onClick={() => setModal({ type: 'editNote', note: n })}><Edit2 size={14} /></button>
                      <button className="btn-icon" style={{ color: '#EA4335' }} onClick={() => { dispatch({ type: 'DELETE_NOTE', payload: n.id }); addToast('Note deleted') }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#1A1A2E', whiteSpace: 'pre-wrap', lineHeight: '20px' }}>{n.body}</p>
                  <div style={{ fontSize: 11, color: '#9AA0A6', marginTop: 8 }}>{n.authorName} · {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Documents Tab */}
        {tab === 'Documents' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setModal('document')}><Plus size={14} /> Upload Document</button>
            </div>
            <div className="table-container">
              {documents.length === 0 ? <div className="empty-state"><p>No documents</p></div> : (
                <table>
                  <thead><tr className="table-header"><th>Name</th><th>Category</th><th>Folder</th><th>Uploaded By</th><th>Date</th><th>Size</th></tr></thead>
                  <tbody>
                    {documents.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(d => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 500 }}>{d.name}</td>
                        <td><span className="badge badge-draft">{d.category}</span></td>
                        <td>{d.folderName}</td>
                        <td style={{ fontSize: 12 }}>{d.uploadedByName}</td>
                        <td style={{ fontSize: 12, color: '#9AA0A6' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td style={{ fontSize: 12, color: '#5F6368' }}>{formatBytes(d.size)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Bills Tab */}
        {tab === 'Bills' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setModal('generateBill')}><Plus size={14} /> Generate Bill</button>
            </div>
            <div className="table-container">
              {bills.length === 0 ? <div className="empty-state"><p>No bills</p></div> : (
                <table>
                  <thead><tr className="table-header"><th>Bill #</th><th>Status</th><th>Issued</th><th>Due</th><th>Total</th><th>Paid</th><th>Balance</th></tr></thead>
                  <tbody>
                    {bills.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(b => (
                      <tr key={b.id} onClick={() => navigate(`/billing/${b.id}`)}>
                        <td><span className="text-link">{b.billNumber}</span></td>
                        <td><span className={`badge ${getBadgeClass(b.status)}`}>{b.status}</span></td>
                        <td style={{ fontSize: 12 }}>{b.issuedDate || '—'}</td>
                        <td style={{ fontSize: 12, color: b.status === 'Overdue' ? '#EA4335' : 'inherit' }}>{b.dueDate || '—'}</td>
                        <td style={{ fontWeight: 500 }}>${b.totalDue.toFixed(2)}</td>
                        <td style={{ color: '#34A853' }}>${b.amountPaid.toFixed(2)}</td>
                        <td style={{ fontWeight: 600 }}>${b.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {tab === 'Transactions' && (
          <div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal('timeEntry')}><Plus size={14} /> Time Entry</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal('expense')}><Plus size={14} /> Expense</button>
            </div>
            <div className="table-container">
              {activities.length === 0 ? <div className="empty-state"><p>No transactions</p></div> : (
                <table>
                  <thead><tr className="table-header"><th>Date</th><th>Type</th><th>Description</th><th>User</th><th>Duration/Qty</th><th>Rate</th><th>Total</th><th>Billed</th></tr></thead>
                  <tbody>
                    {activities.sort((a,b) => new Date(b.date) - new Date(a.date)).map(a => (
                      <tr key={a.id}>
                        <td style={{ fontSize: 12 }}>{a.date}</td>
                        <td><span className={`badge ${a.type === 'TimeEntry' ? 'badge-time' : 'badge-expense'}`}>{a.type === 'TimeEntry' ? 'Time' : 'Expense'}</span></td>
                        <td style={{ maxWidth: 200, fontSize: 13 }}>{a.description.length > 60 ? a.description.substring(0,60) + '...' : a.description}</td>
                        <td style={{ fontSize: 12 }}>{a.userName}</td>
                        <td style={{ fontSize: 12 }}>{a.type === 'TimeEntry' ? `${a.duration} hrs` : `${a.quantity} x`}</td>
                        <td style={{ fontSize: 12 }}>${a.rate}</td>
                        <td style={{ fontWeight: 500 }}>${a.total.toFixed(2)}</td>
                        <td>{a.billed ? '✓' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'edit' && <MatterModal matter={matter} onClose={() => setModal(null)} />}
      {modal === 'generateBill' && <GenerateBillModal defaultMatterId={id} onClose={() => setModal(null)} />}
      {modal === 'comm' && <CommunicationModal matterId={id} onClose={() => setModal(null)} />}
      {modal === 'note' && <NoteModal matterId={id} onClose={() => setModal(null)} />}
      {modal === 'document' && <DocumentModal matterId={id} onClose={() => setModal(null)} />}
      {modal === 'timeEntry' && <TimeEntryModal prefill={{ matterId: id }} onClose={() => setModal(null)} />}
      {modal === 'expense' && <ExpenseModal prefill={{ matterId: id }} onClose={() => setModal(null)} />}
      {modal?.type === 'editNote' && <NoteModal note={modal.note} matterId={id} onClose={() => setModal(null)} />}
    </div>
  )
}
