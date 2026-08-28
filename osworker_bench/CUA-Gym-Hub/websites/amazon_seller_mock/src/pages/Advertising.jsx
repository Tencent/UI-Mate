import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

function fmt(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Advertising() {
  const { state, dispatch, showToast } = useApp();
  const navigate = useNavigate();

  if (!state) return null;
  const { campaigns } = state;

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Enabled' ? 'Paused' : 'Enabled';
    dispatch({ type: 'UPDATE_CAMPAIGN', payload: { id, status: newStatus } });
    showToast(`Campaign ${newStatus.toLowerCase()}`, 'info');
  };

  const statusClass = { Enabled: 'badge-success', Paused: 'badge-pending', Archived: 'badge-inactive' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Campaign Manager</h1>
        <button className="btn-primary" onClick={() => navigate('/advertising/create')}>+ Create Campaign</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Status</th>
              <th>Type</th>
              <th>Daily Budget</th>
              <th>Spend</th>
              <th>Sales</th>
              <th>ACoS</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>CTR</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(camp => (
              <tr key={camp.id}>
                <td><Link to={`/advertising/${camp.id}`} style={{ fontWeight: 700, maxWidth: 200, display: 'block' }} className="truncate">{camp.name}</Link></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`badge ${statusClass[camp.status]}`}>{camp.status}</span>
                    {camp.status !== 'Archived' && (
                      <label className="toggle-switch" style={{ width: 32, height: 18 }}>
                        <input type="checkbox" checked={camp.status === 'Enabled'} onChange={() => toggleStatus(camp.id, camp.status)} />
                        <span className="toggle-slider" />
                      </label>
                    )}
                  </div>
                </td>
                <td style={{ fontSize: 12 }}>{camp.type}</td>
                <td>{fmt(camp.dailyBudget)}</td>
                <td>{fmt(camp.metrics.spend)}</td>
                <td style={{ fontWeight: 700 }}>{fmt(camp.metrics.sales)}</td>
                <td style={{ color: camp.metrics.acos > 30 ? '#d13212' : '#067d62', fontWeight: 700 }}>{camp.metrics.acos.toFixed(1)}%</td>
                <td>{camp.metrics.impressions.toLocaleString()}</td>
                <td>{camp.metrics.clicks.toLocaleString()}</td>
                <td>{camp.metrics.ctr.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
