import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastProvider'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUS_CLASS = {
  'Posted': 'status-delivered', 'Parked': 'status-partial', 'Reversed': 'status-cancelled'
}
const DOC_TYPE_LABELS = { SA: 'General Ledger', DR: 'Customer Invoice', KR: 'Vendor Invoice', AB: 'Closing Entry' }

export default function JournalEntryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updateJournalEntry } = useApp()
  const { showToast } = useToast()
  const je = state.journalEntries.find(j => j.id === id)
  const items = state.journalEntryItems ? state.journalEntryItems.filter(i => i.journalEntryId === id) : []

  const [activeTab, setActiveTab] = useState('general')
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [confirmReverse, setConfirmReverse] = useState(false)

  if (!je) return <div style={{ padding: '24px', color: 'var(--xap-text-secondary)' }}>Journal Entry not found.</div>

  function startEdit() {
    if (je.status === 'Posted' || je.status === 'Reversed') {
      showToast('Posted or reversed journal entries cannot be edited directly. Use reversal.', 'warning')
      return
    }
    setEditData({ ...je }); setEditMode(true)
  }
  function cancelEdit() { setEditData({}); setEditMode(false) }
  function saveEdit() {
    updateJournalEntry(id, editData)
    setEditMode(false)
    showToast(`Journal Entry ${je.documentNumber} saved successfully`, 'success')
  }
  function handlePost() {
    if (je.status !== 'Parked') { showToast('Only parked entries can be posted', 'warning'); return }
    updateJournalEntry(id, { ...je, status: 'Posted' })
    showToast(`Journal Entry ${je.documentNumber} posted successfully`, 'success')
  }
  function handleReverse() {
    if (je.status !== 'Posted') { showToast('Only posted entries can be reversed', 'warning'); return }
    setConfirmReverse(true)
  }
  function doReverse() {
    updateJournalEntry(id, { ...je, status: 'Reversed' })
    showToast(`Journal Entry ${je.documentNumber} reversed`, 'success')
    setConfirmReverse(false)
  }

  const TABS = ['general', 'lineItems', 'notes']
  const TAB_LABELS = { general: 'Header', lineItems: 'Line Items', notes: 'Notes' }

  function Field({ label, value, field, type = 'text', options }) {
    if (editMode && field) {
      if (type === 'select') {
        return (
          <div className="form-field">
            <label>{label}</label>
            <select value={editData[field] || ''} onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))}>
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        )
      }
      return (
        <div className="form-field">
          <label>{label}</label>
          <input type={type} value={editData[field] || ''} onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))} />
        </div>
      )
    }
    return (
      <div className="form-field">
        <label>{label}</label>
        <div style={{ fontSize: '14px', padding: '6px 0', color: 'var(--xap-text-primary)', borderBottom: '1px solid var(--xap-border)', minHeight: '32px' }}>
          {value || '—'}
        </div>
      </div>
    )
  }

  // Calculate debit/credit totals
  const totalDebit = items.reduce((s, i) => s + (i.debitAmount || 0), 0)
  const totalCredit = items.reduce((s, i) => s + (i.creditAmount || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--xap-border)', padding: '12px 24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--xap-blue)', marginBottom: '4px', cursor: 'pointer' }}
          onClick={() => navigate('/app/journal-entries')}>
          Journal Entries /
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--xap-text-primary)' }}>{je.documentNumber}</h1>
            <div style={{ fontSize: '13px', color: 'var(--xap-text-secondary)' }}>
              {je.documentType} — {DOC_TYPE_LABELS[je.documentType] || je.documentType} · {je.postingDate}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`status-badge ${STATUS_CLASS[je.status] || ''}`}>{je.status}</span>
            {je.status === 'Parked' && (
              <>
                <button className="btn-secondary" onClick={startEdit}>Edit</button>
                <button className="btn-primary" onClick={handlePost}>Post</button>
              </>
            )}
            {je.status === 'Posted' && (
              <button className="btn-secondary" onClick={handleReverse}>Reverse</button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="object-tabs" style={{ paddingLeft: '24px', background: '#fff' }}>
        {TABS.map(t => (
          <button key={t} className={`object-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {activeTab === 'general' && (
          <div className="section-card">
            <div className="section-header"><h3>Document Header</h3></div>
            <div className="section-body">
              <div className="form-grid-3" style={{ gap: '20px' }}>
                <Field label="Document Number" value={je.documentNumber} />
                <Field label="Document Type" value={`${je.documentType} — ${DOC_TYPE_LABELS[je.documentType] || je.documentType}`} />
                <Field label="Status" value={je.status} field="status" type="select"
                  options={['Parked', 'Posted', 'Reversed']} />
                <Field label="Posting Date" value={je.postingDate} field="postingDate" type="date" />
                <Field label="Document Date" value={je.documentDate || je.postingDate} field="documentDate" type="date" />
                <Field label="Fiscal Year" value={je.fiscalYear || new Date(je.postingDate).getFullYear().toString()} />
                <Field label="Posting Period" value={je.postingPeriod || '—'} />
                <Field label="Company Code" value={`${je.companyCode} — ${je.companyCode === '1000' ? 'BestRun US' : 'BestRun DE'}`} />
                <Field label="Currency" value={je.currency} />
                <Field label="Reference" value={je.reference || '—'} field="reference" />
                <Field label="Header Text" value={je.headerText || '—'} field="headerText" />
                <Field label="Created By" value={je.createdBy} />
                <Field label="Total Debit" value={new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalDebit)} />
                <Field label="Total Credit" value={new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalCredit)} />
                <div className="form-field">
                  <label>Balance</label>
                  <div style={{ fontSize: '14px', padding: '6px 0', minHeight: '32px', borderBottom: '1px solid var(--xap-border)', color: isBalanced ? 'var(--xap-status-success)' : 'var(--xap-status-error)', fontWeight: 600 }}>
                    {isBalanced ? '✓ Balanced' : `⚠ Unbalanced (diff: ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(Math.abs(totalDebit - totalCredit))})`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lineItems' && (
          <div className="section-card">
            <div className="section-header">
              <h3>Line Items ({items.length})</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="xap-table">
                <thead>
                  <tr>
                    <th>Line #</th>
                    <th>GL Account</th>
                    <th>Account Description</th>
                    <th>Cost Center</th>
                    <th>D/C</th>
                    <th style={{ textAlign: 'right' }}>Debit</th>
                    <th style={{ textAlign: 'right' }}>Credit</th>
                    <th>Text</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--xap-text-secondary)' }}>No line items</td></tr>
                  ) : items.map(item => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--xap-text-secondary)' }}>{item.lineNumber}</td>
                      <td>{item.glAccount}</td>
                      <td>{item.accountDescription || '—'}</td>
                      <td>{item.costCenter || '—'}</td>
                      <td>
                        <span style={{
                          fontWeight: 600,
                          color: item.debitCreditIndicator === 'D' ? 'var(--xap-status-error)' : 'var(--xap-status-success)'
                        }}>
                          {item.debitCreditIndicator === 'D' ? 'Debit' : 'Credit'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--xap-status-error)', fontVariantNumeric: 'tabular-nums' }}>
                        {item.debitAmount ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.debitAmount) : '—'}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--xap-status-success)', fontVariantNumeric: 'tabular-nums' }}>
                        {item.creditAmount ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.creditAmount) : '—'}
                      </td>
                      <td>{item.itemText || '—'}</td>
                    </tr>
                  ))}
                  {items.length > 0 && (
                    <tr style={{ borderTop: '2px solid var(--xap-border)', fontWeight: 600, background: 'var(--xap-page-bg)' }}>
                      <td colSpan={5} style={{ textAlign: 'right', fontSize: '13px', color: 'var(--xap-text-secondary)' }}>Totals</td>
                      <td style={{ textAlign: 'right', color: 'var(--xap-status-error)' }}>
                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalDebit)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--xap-status-success)' }}>
                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalCredit)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="section-card">
            <div className="section-header"><h3>Notes</h3></div>
            <div className="section-body">
              {editMode
                ? <textarea rows={6} value={editData.notes || ''} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))} style={{ width: '100%', resize: 'vertical', border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '8px', fontFamily: 'inherit', fontSize: '13px' }} />
                : <p style={{ fontSize: '14px', color: je.notes ? 'var(--xap-text-primary)' : 'var(--xap-text-secondary)' }}>{je.notes || 'No notes'}</p>
              }
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer edit bar */}
      {editMode && (
        <div className="sticky-footer">
          <span style={{ fontSize: '13px', color: 'var(--xap-text-secondary)', marginRight: 'auto' }}>
            Editing Journal Entry {je.documentNumber}
          </span>
          <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
          <button className="btn-primary" onClick={saveEdit}>Save</button>
        </div>
      )}

      {confirmReverse && (
        <ConfirmDialog
          title="Reverse Journal Entry"
          message={`Are you sure you want to reverse journal entry ${je.documentNumber}? This will create a reversing entry and cannot be undone.`}
          confirmLabel="Reverse"
          confirmClass="btn-danger"
          onConfirm={doReverse}
          onCancel={() => setConfirmReverse(false)}
        />
      )}
    </div>
  )
}
