import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { GenerateBillModal } from '../components/Modals'

function getBadgeClass(status) {
  const map = { Draft: 'badge-draft', 'Awaiting Approval': 'badge-awaiting', Sent: 'badge-sent', Paid: 'badge-paid', Overdue: 'badge-overdue', Void: 'badge-void' }
  return map[status] || 'badge-closed'
}

export default function Billing() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  const tabs = ['All', 'Draft', 'Awaiting Approval', 'Sent', 'Paid', 'Overdue', 'Void']
  const counts = {}
  tabs.forEach(t => counts[t] = t === 'All' ? state.bills.length : state.bills.filter(b => b.status === t).length)

  const filtered = state.bills
    .filter(b => tab === 'All' || b.status === tab)
    .sort((a, b) => {
      let va = a[sortKey] || '', vb = b[sortKey] || ''
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ k }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp size={12} className="sort-arrow" /> : <ChevronDown size={12} className="sort-arrow" />)
    : null

  // Summary stats
  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = today.substring(0, 7) + '-01'
  const totalOutstanding = state.bills.filter(b => b.status !== 'Paid' && b.status !== 'Void').reduce((s, b) => s + b.balance, 0)
  const totalOverdue = state.bills.filter(b => b.status === 'Overdue').reduce((s, b) => s + b.balance, 0)
  const totalDraft = state.bills.filter(b => b.status === 'Draft').reduce((s, b) => s + b.balance, 0)
  const totalPaidThisMonth = state.bills.filter(b => b.status === 'Paid' && b.paidDate >= firstOfMonth).reduce((s, b) => s + b.amountPaid, 0)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Billing</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Generate Bill</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        {[
          { label: 'Total Outstanding', value: `$${totalOutstanding.toLocaleString()}`, color: '#1A73E8' },
          { label: 'Total Overdue', value: `$${totalOverdue.toLocaleString()}`, color: '#EA4335' },
          { label: 'Total Draft', value: `$${totalDraft.toLocaleString()}`, color: '#FBBC04' },
          { label: 'Paid This Month', value: `$${totalPaidThisMonth.toLocaleString()}`, color: '#34A853' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 0, borderRadius: '8px 8px 0 0' }}>
        {tabs.map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      <div className="table-container" style={{ borderRadius: '0 0 8px 8px' }}>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No bills found</p></div>
        ) : (
          <table>
            <thead>
              <tr className="table-header">
                <th onClick={() => toggleSort('billNumber')} style={{ cursor: 'pointer' }}>Bill # <SortIcon k="billNumber" /></th>
                <th onClick={() => toggleSort('clientName')} style={{ cursor: 'pointer' }}>Client <SortIcon k="clientName" /></th>
                <th>Matter</th>
                <th>Status</th>
                <th onClick={() => toggleSort('issuedDate')} style={{ cursor: 'pointer' }}>Issued <SortIcon k="issuedDate" /></th>
                <th onClick={() => toggleSort('dueDate')} style={{ cursor: 'pointer' }}>Due <SortIcon k="dueDate" /></th>
                <th>Total Due</th>
                <th>Amount Paid</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} onClick={() => navigate(`/billing/${b.id}`)}>
                  <td><span className="text-link">{b.billNumber}</span></td>
                  <td style={{ fontSize: 13 }}>{b.clientName}</td>
                  <td style={{ fontSize: 12, color: '#5F6368' }}>{b.matterDescription?.split(' - ')[0] || '—'}</td>
                  <td><span className={`badge ${getBadgeClass(b.status)}`}>{b.status}</span></td>
                  <td style={{ fontSize: 12 }}>{b.issuedDate || '—'}</td>
                  <td style={{ fontSize: 12, color: b.status === 'Overdue' ? '#EA4335' : 'inherit', fontWeight: b.status === 'Overdue' ? 600 : 400 }}>{b.dueDate || '—'}</td>
                  <td style={{ fontWeight: 500 }}>${b.totalDue.toFixed(2)}</td>
                  <td style={{ color: '#34A853' }}>${b.amountPaid.toFixed(2)}</td>
                  <td style={{ fontWeight: 700 }}>${b.balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <GenerateBillModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
