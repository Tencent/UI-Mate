import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';

function fmt(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

const TYPE_COLORS = { Order: '#067d62', Refund: '#d13212', Fee: '#555', Adjustment: '#b7791f', Disbursement: '#0066c0' };
const TYPE_BADGE = { Order: 'badge-success', Refund: 'badge-error', Fee: 'badge-inactive', Adjustment: 'badge-pending', Disbursement: 'badge-info' };

export default function Payments() {
  const { state } = useApp();
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  if (!state) return null;
  const { payments } = state;

  const feeData = [
    { name: 'Referral', amount: payments.feeBreakdown.referralFees },
    { name: 'FBA Fulfillment', amount: payments.feeBreakdown.fbaFulfillmentFees },
    { name: 'FBA Storage', amount: payments.feeBreakdown.fbaStorageFees },
    { name: 'Subscription', amount: payments.feeBreakdown.subscriptionFee },
    { name: 'Other', amount: payments.feeBreakdown.otherFees }
  ];

  const filtered = payments.transactions.filter(t => typeFilter === 'All' || t.type === typeFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageTxns = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Payments</h1>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: '#555' }}>Current Balance</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#067d62' }}>{fmt(payments.currentBalance)}</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: '#555' }}>Next Disbursement</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{new Date(payments.nextDisbursementDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div style={{ fontSize: 13, color: '#555' }}>Est. {fmt(payments.nextDisbursementEstimate)}</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: '#555' }}>Last Disbursement</div>
          {payments.recentDisbursements.slice(0, 1).map(d => (
            <div key={d.id}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(d.amount)}</div>
              <div style={{ fontSize: 13, color: '#555' }}>{new Date(d.date).toLocaleDateString()} · <span className="badge badge-success">{d.status}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="card">
        <div className="card-title">Fee Breakdown (Last 30 Days)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={feeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [fmt(v), 'Amount']} />
              <Bar dataKey="amount">
                {feeData.map((_, i) => <Cell key={i} fill={['#d13212', '#b7791f', '#555', '#0066c0', '#888'][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div>
            {feeData.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee', fontSize: 13 }}>
                <span>{f.name}</span>
                <span style={{ fontWeight: 700, color: '#d13212' }}>-{fmt(f.amount)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, fontWeight: 700 }}>
              <span>Total Fees</span>
              <span style={{ color: '#d13212' }}>-{fmt(Object.values(payments.feeBreakdown).reduce((s, v) => s + v, 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Transaction History</div>
          <select className="form-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="All">All Types</option>
            {['Order', 'Refund', 'Fee', 'Adjustment', 'Disbursement'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {pageTxns.map(txn => (
              <tr key={txn.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{new Date(txn.date).toLocaleDateString()}</td>
                <td><span className={`badge ${TYPE_BADGE[txn.type]}`}>{txn.type}</span></td>
                <td>{txn.description}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: txn.amount >= 0 ? '#067d62' : '#d13212' }}>
                  {txn.amount >= 0 ? '+' : ''}{fmt(txn.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
          ))}
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
