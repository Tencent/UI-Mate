import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { formatDate, formatCurrency } from '../utils/helpers'

const PayContractors = () => {
  const { state, updateState } = useAppContext()
  const contractors = state?.contractors || []

  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [amounts, setAmounts] = useState({})
  const [showToast, setShowToast] = useState(false)

  const toast = (msg) => {
    setShowToast(msg)
    setTimeout(() => setShowToast(false), 3000)
  }

  const openModal = () => {
    setSelectedIds([])
    setAmounts({})
    setShowPayModal(true)
  }

  const toggleContractor = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleConfirmPayment = () => {
    if (selectedIds.length === 0) return
    updateState(prev => ({
      ...prev,
      contractors: prev.contractors.map(c => {
        if (!selectedIds.includes(c.id)) return c
        const amount = parseFloat(amounts[c.id]) || 0
        return { ...c, totalPaidYTD: (c.totalPaidYTD || 0) + amount }
      })
    }))
    setShowPayModal(false)
    toast('Payment submitted')
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Pay Contractors</h1>
        <button className="btn-primary" onClick={openModal}>Pay contractors</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Business Name</th>
              <th>Type</th>
              <th>Compensation</th>
              <th>Total Paid YTD</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {contractors.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: '500' }}>{c.firstName} {c.lastName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{c.email}</div>
                </td>
                <td>{c.businessName}</td>
                <td>{c.type}</td>
                <td>{c.compensation.type === 'Fixed' ? `${formatCurrency(c.compensation.amount)}/month` : `${formatCurrency(c.compensation.amount)}/hour`}</td>
                <td style={{ fontWeight: '500' }}>{formatCurrency(c.totalPaidYTD)}</td>
                <td><span className="badge badge-active">{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--white)', borderRadius: '12px', padding: '28px',
            width: '480px', maxHeight: '80vh', overflowY: 'auto', boxShadow: 'var(--shadow-modal)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Pay Contractors</h2>
            <div style={{ marginBottom: '20px' }}>
              {contractors.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 0', borderBottom: '1px solid var(--border)'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id)}
                    onChange={() => toggleContractor(c.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{c.firstName} {c.lastName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{c.businessName}</div>
                  </div>
                  {selectedIds.includes(c.id) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--medium-gray)' }}>$</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount"
                        value={amounts[c.id] || ''}
                        onChange={e => setAmounts(a => ({ ...a, [c.id]: e.target.value }))}
                        style={{
                          width: '100px', padding: '6px 8px', border: '1px solid var(--border)',
                          borderRadius: '6px', fontSize: '13px'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn-outline" onClick={() => setShowPayModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleConfirmPayment}
                disabled={selectedIds.length === 0}
              >
                Confirm payment
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && <div className="toast">{showToast}</div>}
    </div>
  )
}

export default PayContractors
