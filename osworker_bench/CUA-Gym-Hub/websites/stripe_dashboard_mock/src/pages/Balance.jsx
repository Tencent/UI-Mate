import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { formatCurrency } from '../utils/dataManager';
import StatusBadge from '../components/StatusBadge';

export default function Balance() {
  const { state } = useAppState();
  const [tab, setTab] = useState('overview');

  function formatTs(ts) {
    return ts ? new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--';
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Balances</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="metric-card">
          <div className="metric-label">Available balance</div>
          <div className="metric-value" style={{ color: 'var(--color-success)' }}>{formatCurrency(state.balance.available)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pending balance</div>
          <div className="metric-value">{formatCurrency(state.balance.pending)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Reserved</div>
          <div className="metric-value">{formatCurrency(state.balance.reserved)}</div>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`filter-tab ${tab === 'payouts' ? 'active' : ''}`} onClick={() => setTab('payouts')}>Payouts</button>
        <button className={`filter-tab ${tab === 'transactions' ? 'active' : ''}`} onClick={() => setTab('transactions')}>Transactions</button>
      </div>

      {tab === 'payouts' && (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Status</th>
                <th>Destination</th>
                <th>Arrival date</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {state.payouts.map(p => (
                <tr key={p.id}>
                  <td className="table-amount">{formatCurrency(p.amount, p.currency)}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ fontSize: 13 }}>{p.destination?.bank_name} ****{p.destination?.last4}</td>
                  <td className="table-secondary">{formatTs(p.arrival_date)}</td>
                  <td className="table-secondary">{formatTs(p.created)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'transactions' && (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Fee</th>
                <th>Net</th>
                <th>Source</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {state.balanceTransactions.sort((a, b) => b.created - a.created).slice(0, 30).map(t => (
                <tr key={t.id}>
                  <td style={{ textTransform: 'capitalize' }}>{t.type}</td>
                  <td className="table-amount" style={{ color: t.amount < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {t.amount < 0 ? '-' : ''}{formatCurrency(Math.abs(t.amount))}
                  </td>
                  <td className="table-amount">{formatCurrency(t.fee)}</td>
                  <td className="table-amount" style={{ color: t.net < 0 ? 'var(--color-danger)' : 'inherit' }}>
                    {t.net < 0 ? '-' : ''}{formatCurrency(Math.abs(t.net))}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{t.source}</td>
                  <td className="table-secondary">{formatTs(t.created)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'overview' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Recent payouts</div></div>
            <div className="data-table" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Arrival</th>
                  </tr>
                </thead>
                <tbody>
                  {state.payouts.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td className="table-amount">{formatCurrency(p.amount, p.currency)}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="table-secondary">{formatTs(p.arrival_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
