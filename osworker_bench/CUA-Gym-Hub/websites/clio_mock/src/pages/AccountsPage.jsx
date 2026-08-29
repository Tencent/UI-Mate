import { useState } from 'react'
import { Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'

export default function AccountsPage() {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const accounts = state.trustAccounts || []
  const transactions = state.trustTransactions || []
  const [tab, setTab] = useState('All')
  const [showDeposit, setShowDeposit] = useState(false)
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [form, setForm] = useState({ accountId: accounts[0]?.id || '', type: 'Deposit', amount: '', description: '', matterId: '', contactId: '' })

  const tabs = ['All', 'Trust', 'Operating']
  const filtered = accounts.filter(a => tab === 'All' || a.type === tab)
  const totalBalance = filtered.reduce((s, a) => s + a.balance, 0)

  const acctTransactions = transactions
    .sort((a, b) => {
      const va = a[sortKey] || '', vb = b[sortKey] || ''
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ col }) => sortKey === col ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.accountId || !form.amount || !form.description) return
    const txn = {
      id: `tt-${Date.now()}`,
      accountId: form.accountId,
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description,
      matterId: form.matterId || null,
      contactId: form.contactId || null,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }
    dispatch({ type: 'ADD_TRUST_TRANSACTION', payload: txn })
    addToast(`${form.type} of $${parseFloat(form.amount).toFixed(2)} recorded`)
    setForm({ accountId: accounts[0]?.id || '', type: 'Deposit', amount: '', description: '', matterId: '', contactId: '' })
    setShowDeposit(false)
  }

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Accounts</h1>
        <button className="btn-primary" onClick={() => setShowDeposit(true)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Plus size={16} /> Record Transaction
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid var(--border-color)', background: tab === t ? 'var(--primary)' : 'white', color: tab === t ? 'white' : 'var(--text-primary)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {filtered.map(acct => (
          <div key={acct.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>{acct.name}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: acct.status === 'Active' ? '#E8F5E9' : '#FFF3E0', color: acct.status === 'Active' ? '#2E7D32' : '#E65100', fontWeight: 500 }}>{acct.status}</span>
            </div>
            <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 4 }}>{acct.bank} - {acct.accountNumber}</div>
            <div style={{ fontSize: 11, color: '#9AA0A6', marginBottom: 12 }}>Type: {acct.type}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1A73E8' }}>{fmt(acct.balance)}</div>
          </div>
        ))}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>Total Balance</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#1A1A2E' }}>{fmt(totalBalance)}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Transactions</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8F9FA' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => toggleSort('date')}>Date <SortIcon col="date" /></th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Account</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Type</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Description</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => toggleSort('amount')}>Amount <SortIcon col="amount" /></th>
            </tr>
          </thead>
          <tbody>
            {acctTransactions.map(txn => {
              const acct = accounts.find(a => a.id === txn.accountId)
              return (
                <tr key={txn.id} style={{ borderTop: '1px solid #EAECF0' }}>
                  <td style={{ padding: '10px 16px' }}>{txn.date}</td>
                  <td style={{ padding: '10px 16px' }}>{acct?.name || '—'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, background: txn.type === 'Deposit' ? '#E8F5E9' : '#FFF3E0', color: txn.type === 'Deposit' ? '#2E7D32' : '#E65100' }}>{txn.type}</span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#5F6368' }}>{txn.description}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: txn.type === 'Deposit' ? '#2E7D32' : '#C62828' }}>
                    {txn.type === 'Deposit' ? '+' : '-'}{fmt(txn.amount)}
                  </td>
                </tr>
              )
            })}
            {acctTransactions.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#9AA0A6' }}>No transactions found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeposit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDeposit(false)}>
          <div className="card" style={{ width: 440, padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Record Transaction</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Account</label>
                <select className="input-field" value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Type</label>
                <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Amount</label>
                <input className="input-field" type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Description</label>
                <input className="input-field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Matter (optional)</label>
                <select className="input-field" value={form.matterId} onChange={e => setForm(f => ({ ...f, matterId: e.target.value }))}>
                  <option value="">— None —</option>
                  {state.matters.filter(m => m.status === 'Open').map(m => <option key={m.id} value={m.id}>{m.description}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowDeposit(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
