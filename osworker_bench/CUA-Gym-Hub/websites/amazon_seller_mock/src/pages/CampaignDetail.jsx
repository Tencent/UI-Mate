import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

function fmt(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function CampaignDetail() {
  const { id } = useParams();
  const { state, dispatch, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('Ad Groups');
  const [editBudget, setEditBudget] = useState(false);
  const [budgetVal, setBudgetVal] = useState('');

  if (!state) return null;
  const camp = state.campaigns.find(c => c.id === id);
  if (!camp) return <div className="alert alert-error">Campaign not found</div>;

  const saveBudget = () => {
    const b = parseFloat(budgetVal);
    if (b > 0) { dispatch({ type: 'UPDATE_CAMPAIGN', payload: { id, dailyBudget: b } }); showToast('Budget updated', 'success'); }
    setEditBudget(false);
  };

  const toggleKeyword = (agIdx, kwIdx, status) => {
    const updAdGroups = camp.adGroups.map((ag, ai) => ai !== agIdx ? ag : { ...ag, keywords: ag.keywords.map((kw, ki) => ki !== kwIdx ? kw : { ...kw, status: status === 'Enabled' ? 'Paused' : 'Enabled' }) });
    dispatch({ type: 'UPDATE_CAMPAIGN', payload: { id, adGroups: updAdGroups } });
  };

  const matchTypeClass = { Exact: 'badge-info', Phrase: 'badge-success', Broad: 'badge-inactive', Auto: 'badge-inactive' };

  return (
    <div>
      <Link to="/advertising" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, marginBottom: 12 }}>
        <ArrowLeft size={14} /> Back to Campaigns
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{camp.name}</h1>
        <span className={`badge ${camp.status === 'Enabled' ? 'badge-success' : camp.status === 'Paused' ? 'badge-pending' : 'badge-inactive'}`}>{camp.status}</span>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          ['Daily Budget', editBudget ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>$</span>
              <input type="number" className="form-input" style={{ width: 70 }} defaultValue={camp.dailyBudget} autoFocus onBlur={e => { setBudgetVal(e.target.value); saveBudget(); }} onKeyDown={e => { if (e.key === 'Enter') { setBudgetVal(e.target.value); saveBudget(); } if (e.key === 'Escape') setEditBudget(false); }} />
            </div>
          ) : <span onClick={() => { setBudgetVal(camp.dailyBudget.toString()); setEditBudget(true); }} style={{ cursor: 'pointer', color: '#0066c0', borderBottom: '1px dashed' }}>{fmt(camp.dailyBudget)}</span>],
          ['Spend', fmt(camp.metrics.spend)],
          ['Sales', fmt(camp.metrics.sales)],
          ['ACoS', <span style={{ color: camp.metrics.acos > 30 ? '#d13212' : '#067d62', fontWeight: 700 }}>{camp.metrics.acos.toFixed(1)}%</span>],
          ['ROAS', camp.metrics.roas.toFixed(2) + 'x']
        ].map(([label, val], i) => (
          <div key={i} className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 12, color: '#555' }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: '28px' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['Ad Groups', 'Keywords', 'Performance'].map(t => (
          <div key={t} className={`tab-item ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</div>
        ))}
      </div>

      {activeTab === 'Ad Groups' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ad Group Name</th>
                <th>Status</th>
                <th>Default Bid</th>
                <th>Products</th>
              </tr>
            </thead>
            <tbody>
              {camp.adGroups.map(ag => (
                <tr key={ag.id}>
                  <td style={{ fontWeight: 700 }}>{ag.name}</td>
                  <td><span className={`badge ${ag.status === 'Enabled' ? 'badge-success' : 'badge-pending'}`}>{ag.status}</span></td>
                  <td>{fmt(ag.defaultBid)}</td>
                  <td>{ag.products.length} product{ag.products.length !== 1 ? 's' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Keywords' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Match Type</th>
                <th>Bid</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>Spend</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {camp.adGroups.flatMap((ag, agIdx) => ag.keywords.map((kw, kwIdx) => (
                <tr key={`${agIdx}-${kwIdx}`}>
                  <td style={{ fontWeight: 700 }}>{kw.keyword}</td>
                  <td><span className={`badge ${matchTypeClass[kw.matchType] || 'badge-inactive'}`}>{kw.matchType}</span></td>
                  <td>{fmt(kw.bid)}</td>
                  <td>{(kw.impressions || 0).toLocaleString()}</td>
                  <td>{(kw.clicks || 0).toLocaleString()}</td>
                  <td>{fmt(kw.spend || 0)}</td>
                  <td>
                    <label className="toggle-switch" style={{ width: 32, height: 18 }}>
                      <input type="checkbox" checked={kw.status === 'Enabled'} onChange={() => toggleKeyword(agIdx, kwIdx, kw.status)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Performance' && (
        <div className="card">
          <div className="section-heading" style={{ fontSize: 14 }}>Performance Metrics</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              ['Impressions', camp.metrics.impressions.toLocaleString()],
              ['Clicks', camp.metrics.clicks.toLocaleString()],
              ['CTR', camp.metrics.ctr.toFixed(2) + '%'],
              ['CPC', fmt(camp.metrics.cpc)],
              ['Orders', camp.metrics.orders],
              ['Spend', fmt(camp.metrics.spend)],
              ['Sales', fmt(camp.metrics.sales)],
              ['ACoS', camp.metrics.acos.toFixed(1) + '%']
            ].map(([label, val], i) => (
              <div key={i} style={{ padding: 12, border: '1px solid #eee', borderRadius: 4 }}>
                <div style={{ fontSize: 12, color: '#555' }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
