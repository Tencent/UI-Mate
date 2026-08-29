import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

function formatCurrency(n) {
  return n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'
}

function EarningsTable({ earnings, label }) {
  const total = earnings.reduce((s, e) => s + e.current, 0)
  const ytdTotal = earnings.reduce((s, e) => s + e.ytd, 0)
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 12 }}>{label}</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Type</th>
            <th className="amount">Hours</th>
            <th className="amount">Rate</th>
            <th className="amount">Current</th>
            <th className="amount">YTD</th>
          </tr>
        </thead>
        <tbody>
          {earnings.map((e, i) => (
            <tr key={i + '-' + e.type}>
              <td>{e.type}</td>
              <td className="amount">{e.hours}</td>
              <td className="amount">{e.rate ? `$${e.rate.toFixed(2)}` : '-'}</td>
              <td className="amount">{formatCurrency(e.current)}</td>
              <td className="amount">{formatCurrency(e.ytd)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 600, background: '#F9FAFB' }}>
            <td colSpan={3}>Total Earnings</td>
            <td className="amount">{formatCurrency(total)}</td>
            <td className="amount">{formatCurrency(ytdTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function SimpleTable({ items, label }) {
  const total = items.reduce((s, e) => s + e.current, 0)
  const ytdTotal = items.reduce((s, e) => s + e.ytd, 0)
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 12 }}>{label}</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Type</th>
            <th className="amount">Current</th>
            <th className="amount">YTD</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e, i) => (
            <tr key={i + '-' + e.type}>
              <td>{e.type}</td>
              <td className="amount">{formatCurrency(e.current)}</td>
              <td className="amount">{formatCurrency(e.ytd)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 600, background: '#F9FAFB' }}>
            <td>Total</td>
            <td className="amount">{formatCurrency(total)}</td>
            <td className="amount">{formatCurrency(ytdTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function PayStatementDetail() {
  const { id } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()
  const pay = (state.payStatements || []).find(p => p.id === id)

  if (!pay) {
    return (
      <div className="page-container">
        <button className="back-link" onClick={() => navigate('/myself/pay')}>← Back to Pay Statements</button>
        <div className="card">Pay statement not found.</div>
      </div>
    )
  }

  const totalDeductions = (pay.deductions || []).reduce((s, d) => s + d.current, 0)
  const totalTaxes = (pay.taxes || []).reduce((s, t) => s + t.current, 0)

  return (
    <div className="page-container">
      <button className="back-link" onClick={() => navigate('/myself/pay')}>← Back to Pay Statements</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1>Pay Statement</h1>
          <div style={{ color: 'var(--color-gray-medium)', marginTop: 4 }}>
            Pay Period: {pay.periodStart} – {pay.periodEnd} &nbsp;|&nbsp; Pay Date: <strong>{pay.payDate}</strong>
          </div>
          <div style={{ color: 'var(--color-gray-medium)', fontSize: 13 }}>Acme Corporation</div>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <EarningsTable earnings={pay.earnings || []} label="Earnings" />
      <SimpleTable items={pay.deductions || []} label="Deductions" />
      <SimpleTable items={pay.taxes || []} label="Taxes" />

      {/* Net Pay Summary */}
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Summary</h3>
        <table className="table">
          <tbody>
            <tr>
              <td>Gross Pay</td>
              <td className="amount">{formatCurrency(pay.grossPay)}</td>
            </tr>
            <tr>
              <td>Total Deductions</td>
              <td className="amount" style={{ color: 'var(--color-danger)' }}>-{formatCurrency(totalDeductions)}</td>
            </tr>
            <tr>
              <td>Total Taxes</td>
              <td className="amount" style={{ color: 'var(--color-danger)' }}>-{formatCurrency(totalTaxes)}</td>
            </tr>
            <tr style={{ fontWeight: 700, fontSize: 16, borderTop: '2px solid var(--color-border)' }}>
              <td>Net Pay</td>
              <td className="amount" style={{ color: 'var(--color-success)', fontSize: 20 }}>{formatCurrency(pay.netPay)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--color-gray-medium)' }}>
          YTD Gross: <strong>{formatCurrency(pay.ytdGross)}</strong> &nbsp;|&nbsp;
          YTD Net: <strong>{formatCurrency(pay.ytdNet)}</strong>
        </div>
      </div>
    </div>
  )
}
