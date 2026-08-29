import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { ArrowLeft, Edit2, ArrowUpRight, ArrowDownLeft, Plus, Trash2 } from 'lucide-react'
import { ContactModal, MatterModal, CommunicationModal, NoteModal, DocumentModal, TimeEntryModal, ExpenseModal, RecordPaymentModal, GenerateBillModal } from '../components/Modals'
import { formatDistanceToNow } from 'date-fns'

function getBadgeClass(status) {
  const map = { Open: 'badge-open', Pending: 'badge-pending', Closed: 'badge-closed', Overdue: 'badge-overdue', Draft: 'badge-draft', Sent: 'badge-sent', Paid: 'badge-paid' }
  return map[status] || 'badge-closed'
}

function formatBytes(b) {
  if (!b) return '—'
  if (b < 1000) return `${b} B`
  if (b < 1000000) return `${(b/1000).toFixed(0)} KB`
  return `${(b/1000000).toFixed(1)} MB`
}

export default function ContactDetail() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Dashboard')
  const [modal, setModal] = useState(null)
  const [mattersFilter, setMattersFilter] = useState('All')

  const contact = state.contacts.find(c => c.id === id)

  useEffect(() => {
    if (id) dispatch({ type: 'UPDATE_RECENT_CONTACTS', payload: id })
  }, [id])

  if (!contact) return <div style={{ padding: 40, color: '#5F6368' }}>Contact not found. <Link to="/contacts">Back</Link></div>

  const clientMatters = state.matters.filter(m => m.clientId === id)
  const associatedMatters = state.matters.filter(m =>
    m.relatedContacts?.some(rc => rc.contactId === id)
  )

  const filteredClientMatters = mattersFilter === 'All' ? clientMatters : clientMatters.filter(m => m.status === 'Open')

  const bills = state.bills.filter(b => b.clientId === id)
  const documents = state.documents.filter(d => clientMatters.some(m => m.id === d.matterId))
  const activities = state.activities.filter(a => clientMatters.some(m => m.id === a.matterId))
  const communications = state.communications.filter(c => c.contactId === id)
  const notes = state.notes.filter(n => {
    return clientMatters.some(m => m.id === n.matterId)
  })

  const colors = ['#1A73E8','#34A853','#FBBC04','#EA4335','#9C27B0']
  const getColor = (id) => colors[parseInt(id.replace(/\D/g,'')) % colors.length]
  const getInitials = (c) => {
    if (c.type === 'Company') return c.displayName.substring(0,2).toUpperCase()
    return `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase()
  }

  const tabs = ['Dashboard', 'Communications', 'Notes', 'Documents', 'Bills', 'Transactions']

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/contacts')} style={{ marginBottom: 12 }}>
        <ArrowLeft size={14} /> Back to Contacts
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: 0, borderRadius: '8px 8px 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div className="avatar avatar-lg" style={{ background: getColor(id) }}>{getInitials(contact)}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E' }}>{contact.displayName}</h1>
                {(contact.tags || []).map(tag => (
                  <span key={tag} className="badge badge-tag">{tag}</span>
                ))}
              </div>
              <div style={{ fontSize: 13, color: '#5F6368' }}>
                {contact.type === 'Person' ? `${contact.prefix ? contact.prefix + ' ' : ''}${contact.jobTitle || ''}${contact.companyName ? ` · ${contact.companyName}` : ''}` : 'Company'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setModal('generateBill')}>Quick bill</button>
            <button className="btn btn-secondary btn-sm" onClick={() => addToast('Trust requests are not available in this demo', 'info')}>New trust request</button>
            <button className="btn btn-primary btn-sm" onClick={() => setModal('edit')}><Edit2 size={13} /> Edit contact</button>
          </div>
        </div>
      </div>

      <div className="tabs" style={{ borderRadius: 0 }}>
        {tabs.map(t => <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      <div style={{ marginTop: 16 }}>
        {/* Dashboard Tab */}
        {tab === 'Dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
            <div>
              {/* Contact Info */}
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Contact information</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {contact.type === 'Person' && contact.jobTitle && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 140, fontSize: 13, color: '#5F6368', fontWeight: 500 }}>Title</span>
                      <span style={{ fontSize: 13 }}>{contact.jobTitle}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 140, fontSize: 13, color: '#5F6368', fontWeight: 500 }}>Phone</span>
                      <a href={`tel:${contact.phone}`} style={{ color: '#1A73E8', fontSize: 13 }}>{contact.phone}</a>
                      {contact.phoneType && <span style={{ fontSize: 12, color: '#9AA0A6' }}>({contact.phoneType})</span>}
                    </div>
                  )}
                  {contact.email && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 140, fontSize: 13, color: '#5F6368', fontWeight: 500 }}>Email</span>
                      <a href={`mailto:${contact.email}`} style={{ color: '#1A73E8', fontSize: 13 }}>{contact.email}</a>
                      {contact.emailSecondary && <span style={{ fontSize: 12, color: '#9AA0A6' }}>1 more</span>}
                    </div>
                  )}
                  {contact.website && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 140, fontSize: 13, color: '#5F6368', fontWeight: 500 }}>Website</span>
                      <span style={{ fontSize: 13 }}>{contact.website}</span>
                    </div>
                  )}
                  {contact.address && (contact.address.street || contact.address.city) && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 140, fontSize: 13, color: '#5F6368', fontWeight: 500 }}>Address</span>
                      <div style={{ fontSize: 13 }}>
                        {contact.address.street && <div>{contact.address.street}</div>}
                        {(contact.address.city || contact.address.state) && <div>{[contact.address.city, contact.address.state, contact.address.zip].filter(Boolean).join(', ')}</div>}
                        {contact.address.country && <div>{contact.address.country}</div>}
                      </div>
                    </div>
                  )}
                  {contact.type === 'Person' && contact.dateOfBirth && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 140, fontSize: 13, color: '#5F6368', fontWeight: 500 }}>Date of Birth</span>
                      <span style={{ fontSize: 13 }}>{new Date(contact.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  )}
                  {contact.type === 'Person' && contact.maritalStatus && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 140, fontSize: 13, color: '#5F6368', fontWeight: 500 }}>Marital Status</span>
                      <span style={{ fontSize: 13 }}>{contact.maritalStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Fields */}
              {contact.customFields && Object.keys(contact.customFields).length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Custom Fields</h3>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {Object.entries(contact.customFields).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 12 }}>
                        <span style={{ width: 200, fontSize: 13, color: '#5F6368', fontWeight: 500 }}>{k}</span>
                        <span style={{ fontSize: 13 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Billing Info */}
              {contact.billingInfo && (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>Billing information</h3>
                    <button className="btn-icon" style={{ color: '#1A73E8', fontSize: 13, fontWeight: 500 }} onClick={() => setModal('edit')}>Manage</button>
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 160, fontSize: 13, color: '#5F6368', fontWeight: 500 }}>LEDES Client ID</span>
                      <span style={{ fontSize: 13 }}>{contact.billingInfo.ledesClientId || 'Not set'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 160, fontSize: 13, color: '#5F6368', fontWeight: 500 }}>Payment Profile</span>
                      <span style={{ fontSize: 13 }}>{contact.billingInfo.paymentProfile || 'Default'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* Client's Matters */}
              <div className="card" style={{ marginBottom: 16, padding: 0 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #EEEEEE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>Client's matters</h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div className="tabs" style={{ borderBottom: 'none', gap: 0 }}>
                      {['All','Open'].map(f => (
                        <button key={f} className={`tab ${mattersFilter === f ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setMattersFilter(f)}>{f}</button>
                      ))}
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'newMatter', clientId: id })}><Plus size={12} /> New matter</button>
                  </div>
                </div>
                {filteredClientMatters.length === 0 ? (
                  <div style={{ padding: '16px', color: '#9AA0A6', fontSize: 13, textAlign: 'center' }}>No matters</div>
                ) : (
                  filteredClientMatters.map(m => (
                    <div key={m.id} style={{ padding: '10px 16px', borderBottom: '1px solid #EEEEEE', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div className="text-link" style={{ cursor: 'pointer', fontSize: 13 }} onClick={() => navigate(`/matters/${m.id}`)}>{m.matterNumber}</div>
                        <div style={{ fontSize: 12, color: '#5F6368' }}>{m.description}</div>
                      </div>
                      <span className={`badge ${getBadgeClass(m.status)}`} style={{ fontSize: 10 }}>{m.status}</span>
                    </div>
                  ))
                )}
                {clientMatters.length > 0 && (
                  <div style={{ padding: '10px 16px' }}>
                    <span className="text-link" style={{ fontSize: 13 }} onClick={() => navigate('/matters')}>View all matters</span>
                  </div>
                )}
              </div>

              {/* Associated Matters */}
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Associated matters</h3>
                {associatedMatters.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9AA0A6' }}>This contact isn't associated with any matters.</p>
                ) : (
                  associatedMatters.map(m => (
                    <div key={m.id} style={{ marginBottom: 8 }}>
                      <span className="text-link" style={{ cursor: 'pointer', fontSize: 13 }} onClick={() => navigate(`/matters/${m.id}`)}>{m.matterNumber}</span>
                      <span style={{ fontSize: 12, color: '#5F6368' }}> — {m.description}</span>
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
                  <thead><tr className="table-header"><th style={{ width: 40 }}></th><th>Type</th><th>Subject</th><th>From/To</th><th>Date</th></tr></thead>
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
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{n.subject}</div>
                  <p style={{ fontSize: 13, color: '#1A1A2E', whiteSpace: 'pre-wrap' }}>{n.body.length > 200 ? n.body.substring(0,200) + '...' : n.body}</p>
                  <div style={{ fontSize: 11, color: '#9AA0A6', marginTop: 8 }}>{n.authorName} · {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'Documents' && (
          <div className="table-container">
            {documents.length === 0 ? <div className="empty-state"><p>No documents</p></div> : (
              <table>
                <thead><tr className="table-header"><th>Name</th><th>Category</th><th>Date</th><th>Size</th></tr></thead>
                <tbody>
                  {documents.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 500 }}>{d.name}</td>
                      <td><span className="badge badge-draft">{d.category}</span></td>
                      <td style={{ fontSize: 12, color: '#9AA0A6' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontSize: 12, color: '#5F6368' }}>{formatBytes(d.size)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'Bills' && (
          <div className="table-container">
            {bills.length === 0 ? <div className="empty-state"><p>No bills</p></div> : (
              <table>
                <thead><tr className="table-header"><th>Bill #</th><th>Status</th><th>Total</th><th>Balance</th></tr></thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b.id} onClick={() => navigate(`/billing/${b.id}`)}>
                      <td><span className="text-link">{b.billNumber}</span></td>
                      <td><span className={`badge ${getBadgeClass(b.status)}`}>{b.status}</span></td>
                      <td>${b.totalDue.toFixed(2)}</td>
                      <td style={{ fontWeight: 600 }}>${b.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'Transactions' && (
          <div className="table-container">
            {activities.length === 0 ? <div className="empty-state"><p>No transactions</p></div> : (
              <table>
                <thead><tr className="table-header"><th>Date</th><th>Type</th><th>Description</th><th>Total</th></tr></thead>
                <tbody>
                  {activities.sort((a,b) => new Date(b.date) - new Date(a.date)).map(a => (
                    <tr key={a.id}>
                      <td style={{ fontSize: 12 }}>{a.date}</td>
                      <td><span className={`badge ${a.type === 'TimeEntry' ? 'badge-time' : 'badge-expense'}`}>{a.type === 'TimeEntry' ? 'Time' : 'Expense'}</span></td>
                      <td style={{ fontSize: 13 }}>{a.description.length > 60 ? a.description.substring(0,60) + '...' : a.description}</td>
                      <td style={{ fontWeight: 500 }}>${a.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'edit' && <ContactModal contact={contact} onClose={() => setModal(null)} />}
      {modal === 'comm' && <CommunicationModal onClose={() => setModal(null)} contactId={id} />}
      {modal === 'note' && <NoteModal onClose={() => setModal(null)} matterId={clientMatters[0]?.id || null} />}
      {modal?.type === 'newMatter' && <MatterModal defaultClientId={modal.clientId} onClose={() => setModal(null)} />}
      {modal === 'generateBill' && <GenerateBillModal defaultMatterId={clientMatters[0]?.id || null} onClose={() => setModal(null)} />}
    </div>
  )
}
