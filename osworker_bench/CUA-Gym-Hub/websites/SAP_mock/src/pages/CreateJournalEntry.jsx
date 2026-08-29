import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastProvider'

const DOC_TYPES = [
  { value: 'SA', label: 'SA — General Ledger' },
  { value: 'DR', label: 'DR — Customer Invoice' },
  { value: 'KR', label: 'KR — Vendor Invoice' },
  { value: 'AB', label: 'AB — Closing Entry' }
]

const GL_ACCOUNTS = [
  { account: '100000', description: 'Bank Account' },
  { account: '110000', description: 'Accounts Receivable' },
  { account: '200000', description: 'Accounts Payable' },
  { account: '300000', description: 'Inventory' },
  { account: '400000', description: 'Cost of Goods Sold' },
  { account: '500000', description: 'Revenue' },
  { account: '600000', description: 'Salary Expense' },
  { account: '700000', description: 'Office Expense' }
]

export default function CreateJournalEntry() {
  const navigate = useNavigate()
  const { state, addJournalEntry } = useApp()
  const { showToast } = useToast()

  const today = new Date().toISOString().split('T')[0]
  const [header, setHeader] = useState({
    documentType: 'SA',
    postingDate: today,
    documentDate: today,
    companyCode: '1000',
    currency: 'USD',
    reference: '',
    headerText: '',
    status: 'Parked'
  })
  const [lines, setLines] = useState([
    { glAccount: '', accountDescription: '', costCenter: '', debitCreditIndicator: 'D', amount: '', itemText: '' },
    { glAccount: '', accountDescription: '', costCenter: '', debitCreditIndicator: 'C', amount: '', itemText: '' }
  ])
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!header.postingDate) errs.postingDate = 'Posting date is required'
    if (lines.length < 2) errs.lines = 'At least 2 line items required'
    const totalDebit = lines.filter(l => l.debitCreditIndicator === 'D').reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
    const totalCredit = lines.filter(l => l.debitCreditIndicator === 'C').reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
    if (Math.abs(totalDebit - totalCredit) > 0.01) errs.balance = `Journal entry is not balanced (Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)})`
    return errs
  }

  function handleSave(post = false) {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    const now = today
    const newId = 'je-' + Date.now()
    const maxJE = state.journalEntries.reduce((m, j) => Math.max(m, parseInt(j.documentNumber) || 0), 1000000015)
    const documentNumber = String(maxJE + 1)
    const totalAmount = lines.filter(l => l.debitCreditIndicator === 'D').reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
    const month = parseInt(header.postingDate.split('-')[1])
    const newJE = {
      id: newId,
      documentNumber,
      documentType: header.documentType,
      companyCode: header.companyCode,
      postingDate: header.postingDate,
      documentDate: header.documentDate,
      fiscalYear: header.postingDate.split('-')[0],
      postingPeriod: month.toString().padStart(2, '0'),
      currency: header.currency,
      reference: header.reference,
      headerText: header.headerText,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: post ? 'Posted' : 'Parked',
      createdBy: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
      createdDate: now
    }
    const jeItems = lines.map((line, idx) => ({
      id: 'jei-' + Date.now() + idx,
      journalEntryId: newId,
      lineNumber: (idx + 1) * 10,
      glAccount: line.glAccount,
      accountDescription: line.accountDescription || GL_ACCOUNTS.find(g => g.account === line.glAccount)?.description || '',
      costCenter: line.costCenter,
      debitCreditIndicator: line.debitCreditIndicator,
      debitAmount: line.debitCreditIndicator === 'D' ? parseFloat(line.amount) || 0 : 0,
      creditAmount: line.debitCreditIndicator === 'C' ? parseFloat(line.amount) || 0 : 0,
      currency: header.currency,
      itemText: line.itemText
    }))
    addJournalEntry(newJE, jeItems)
    showToast(`Journal Entry ${documentNumber} ${post ? 'posted' : 'parked'} successfully`, 'success')
    navigate(`/app/journal-entry/${newId}`)
  }

  function addLine() {
    setLines(prev => [...prev, { glAccount: '', accountDescription: '', costCenter: '', debitCreditIndicator: 'D', amount: '', itemText: '' }])
  }

  function removeLine(idx) {
    if (lines.length <= 2) { showToast('Minimum 2 line items required', 'warning'); return }
    setLines(prev => prev.filter((_, i) => i !== idx))
  }

  function updateLine(idx, field, val) {
    setLines(prev => prev.map((line, i) => {
      if (i !== idx) return line
      const updated = { ...line, [field]: val }
      if (field === 'glAccount') {
        const found = GL_ACCOUNTS.find(g => g.account === val)
        if (found) updated.accountDescription = found.description
      }
      return updated
    }))
  }

  const totalDebit = lines.filter(l => l.debitCreditIndicator === 'D').reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
  const totalCredit = lines.filter(l => l.debitCreditIndicator === 'C').reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--xap-border)', padding: '12px 24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--xap-blue)', marginBottom: '4px', cursor: 'pointer' }}
          onClick={() => navigate('/app/journal-entries')}>
          Journal Entries /
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>New Journal Entry</h1>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {/* Header section */}
        <div className="section-card" style={{ marginBottom: '16px' }}>
          <div className="section-header"><h3>Document Header</h3></div>
          <div className="section-body">
            <div className="form-grid-3" style={{ gap: '20px' }}>
              <div className="form-field">
                <label>Document Type</label>
                <select value={header.documentType} onChange={e => setHeader(h => ({ ...h, documentType: e.target.value }))}>
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Posting Date *</label>
                <input type="date" value={header.postingDate} onChange={e => setHeader(h => ({ ...h, postingDate: e.target.value }))}
                  style={errors.postingDate ? { borderColor: 'var(--xap-status-error)' } : {}} />
                {errors.postingDate && <span style={{ fontSize: '11px', color: 'var(--xap-status-error)' }}>{errors.postingDate}</span>}
              </div>
              <div className="form-field">
                <label>Document Date</label>
                <input type="date" value={header.documentDate} onChange={e => setHeader(h => ({ ...h, documentDate: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Company Code</label>
                <select value={header.companyCode} onChange={e => setHeader(h => ({ ...h, companyCode: e.target.value }))}>
                  <option value="1000">1000 — BestRun US</option>
                  <option value="2000">2000 — BestRun DE</option>
                </select>
              </div>
              <div className="form-field">
                <label>Currency</label>
                <select value={header.currency} onChange={e => setHeader(h => ({ ...h, currency: e.target.value }))}>
                  {['USD', 'EUR', 'GBP', 'JPY'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Reference</label>
                <input value={header.reference} onChange={e => setHeader(h => ({ ...h, reference: e.target.value }))} placeholder="Reference document number" />
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Header Text</label>
                <input value={header.headerText} onChange={e => setHeader(h => ({ ...h, headerText: e.target.value }))} placeholder="Describe this journal entry" />
              </div>
            </div>
          </div>
        </div>

        {/* Line items section */}
        <div className="section-card">
          <div className="section-header">
            <h3>Line Items ({lines.length})</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: isBalanced ? 'var(--xap-status-success)' : 'var(--xap-status-error)', fontWeight: 600 }}>
                {isBalanced ? '✓ Balanced' : `Debit: ${totalDebit.toFixed(2)} | Credit: ${totalCredit.toFixed(2)}`}
              </span>
              <button className="btn-secondary" onClick={addLine}>Add Line</button>
            </div>
          </div>
          {errors.lines && <div style={{ padding: '8px 16px', color: 'var(--xap-status-error)', fontSize: '13px' }}>{errors.lines}</div>}
          {errors.balance && <div style={{ padding: '8px 16px', color: 'var(--xap-status-error)', fontSize: '13px' }}>⚠ {errors.balance}</div>}
          <div style={{ overflowX: 'auto' }}>
            <table className="xap-table">
              <thead>
                <tr>
                  <th>Line #</th>
                  <th>GL Account</th>
                  <th>Description</th>
                  <th>Cost Center</th>
                  <th>D/C</th>
                  <th>Amount</th>
                  <th>Item Text</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--xap-text-secondary)', fontSize: '13px' }}>{(idx + 1) * 10}</td>
                    <td>
                      <select value={line.glAccount} onChange={e => updateLine(idx, 'glAccount', e.target.value)}
                        style={{ border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', minWidth: '120px' }}>
                        <option value="">— Select —</option>
                        {GL_ACCOUNTS.map(g => <option key={g.account} value={g.account}>{g.account}</option>)}
                      </select>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--xap-text-secondary)', minWidth: '140px' }}>{line.accountDescription || '—'}</td>
                    <td>
                      <input value={line.costCenter} onChange={e => updateLine(idx, 'costCenter', e.target.value)}
                        placeholder="CC1000"
                        style={{ width: '80px', border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', outline: 'none' }} />
                    </td>
                    <td>
                      <select value={line.debitCreditIndicator} onChange={e => updateLine(idx, 'debitCreditIndicator', e.target.value)}
                        style={{ border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', fontWeight: 600, color: line.debitCreditIndicator === 'D' ? 'var(--xap-status-error)' : 'var(--xap-status-success)' }}>
                        <option value="D">Debit</option>
                        <option value="C">Credit</option>
                      </select>
                    </td>
                    <td>
                      <input type="number" min="0" step="0.01" value={line.amount} onChange={e => updateLine(idx, 'amount', e.target.value)}
                        style={{ width: '100px', border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', outline: 'none' }} />
                    </td>
                    <td>
                      <input value={line.itemText} onChange={e => updateLine(idx, 'itemText', e.target.value)}
                        placeholder="Line description"
                        style={{ width: '150px', border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', outline: 'none' }} />
                    </td>
                    <td>
                      <button style={{ background: 'none', border: 'none', color: 'var(--xap-status-error)', fontSize: '18px', cursor: 'pointer' }} onClick={() => removeLine(idx)}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--xap-border)', fontWeight: 600, background: 'var(--xap-page-bg)' }}>
                  <td colSpan={5} style={{ textAlign: 'right', padding: '8px', fontSize: '13px', color: 'var(--xap-text-secondary)' }}>Totals</td>
                  <td style={{ padding: '8px', textAlign: 'left' }}>
                    <span style={{ color: 'var(--xap-status-error)' }}>D: {totalDebit.toFixed(2)}</span>
                    <span style={{ margin: '0 8px', color: 'var(--xap-text-secondary)' }}>|</span>
                    <span style={{ color: 'var(--xap-status-success)' }}>C: {totalCredit.toFixed(2)}</span>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky-footer">
        <button className="btn-secondary" onClick={() => navigate('/app/journal-entries')}>Cancel</button>
        <button className="btn-secondary" onClick={() => handleSave(false)}>Save as Parked</button>
        <button className="btn-primary" onClick={() => handleSave(true)} disabled={!isBalanced}>Post</button>
      </div>
    </div>
  )
}
