import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const formatPercent = (n) => n > 0 ? (n * 100).toFixed(1) + '%' : '—';
const formatCurrency = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function CampaignList() {
  const { state, updateUI, removeEntity } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  const [statusFilter, setStatusFilter] = useState(state.ui.campaignFilters.status || 'all');
  const [channelFilter, setChannelFilter] = useState(state.ui.campaignFilters.channel || 'all');
  const [search, setSearch] = useState(state.ui.campaignFilters.search || '');
  const [selected, setSelected] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filtered = useMemo(() => {
    let items = state.campaigns;
    if (statusFilter !== 'all') items = items.filter(c => c.status === statusFilter);
    if (channelFilter !== 'all') items = items.filter(c => c.channel === channelFilter);
    if (search) items = items.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [state.campaigns, statusFilter, channelFilter, search]);

  const counts = useMemo(() => ({
    all: state.campaigns.length,
    draft: state.campaigns.filter(c => c.status === 'draft').length,
    scheduled: state.campaigns.filter(c => c.status === 'scheduled').length,
    sent: state.campaigns.filter(c => c.status === 'sent').length,
  }), [state.campaigns]);

  const handleStatusFilter = (s) => {
    setStatusFilter(s);
    updateUI({ campaignFilters: { ...state.ui.campaignFilters, status: s } });
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map(c => c.id));
  };

  const handleDelete = () => {
    selected.forEach(id => removeEntity('campaigns', id));
    setSelected([]);
    setShowDeleteConfirm(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Campaigns</h1>
        <button className="btn btn-primary" onClick={() => navigate(appendQuery('/campaigns/new'))}>Create campaign</button>
      </div>

      <div className="tabs">
        {['all', 'draft', 'scheduled', 'sent'].map(s => (
          <button key={s} className={`tab ${statusFilter === s ? 'active' : ''}`} onClick={() => handleStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="tab-count">{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search campaigns..." value={search} onChange={e => { setSearch(e.target.value); updateUI({ campaignFilters: { ...state.ui.campaignFilters, search: e.target.value } }); }} />
        <select value={channelFilter} onChange={e => { setChannelFilter(e.target.value); updateUI({ campaignFilters: { ...state.ui.campaignFilters, channel: e.target.value } }); }}>
          <option value="all">All channels</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
      </div>

      {selected.length > 0 && (
        <div style={{ display: 'flex', gap: 8, padding: '8px 0', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>{selected.length} selected</span>
          <button className="btn btn-secondary" style={{ fontSize: 13, padding: '4px 12px' }} onClick={() => setShowDeleteConfirm(true)}>Delete</button>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}><input type="checkbox" className="checkbox" onChange={toggleAll} checked={selected.length === filtered.length && filtered.length > 0} /></th>
              <th>Campaign name</th>
              <th>Status</th>
              <th>Channel</th>
              <th>Send date</th>
              <th>Recipients</th>
              <th>Open rate</th>
              <th>Click rate</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(camp => (
              <tr key={camp.id}>
                <td><input type="checkbox" className="checkbox" checked={selected.includes(camp.id)} onChange={() => toggleSelect(camp.id)} /></td>
                <td><span className="clickable" onClick={() => navigate(appendQuery(`/campaigns/${camp.id}`))}>{camp.name}</span></td>
                <td>
                  <span className={`badge badge-${camp.status}`}>
                    {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
                    {camp.status === 'scheduled' && camp.scheduledAt && <span style={{ marginLeft: 4, fontSize: 11 }}>{new Date(camp.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                  </span>
                </td>
                <td>{camp.channel === 'email' ? <span className="channel-icon" title="Email">&#9993;</span> : <span className="channel-icon" title="SMS">&#128241;</span>}</td>
                <td className="text-muted">{camp.sentAt ? new Date(camp.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                <td>{camp.stats.recipients > 0 ? camp.stats.recipients.toLocaleString() : '—'}</td>
                <td>{formatPercent(camp.stats.openRate)}</td>
                <td>{formatPercent(camp.stats.clickRate)}</td>
                <td>{camp.stats.revenue > 0 ? formatCurrency(camp.stats.revenue) : '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No campaigns found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete campaigns</div>
            <p className="text-muted" style={{ marginBottom: 20 }}>Delete {selected.length} selected campaign{selected.length === 1 ? '' : 's'}? Reporting for deleted campaigns will be removed from this sandbox state.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
