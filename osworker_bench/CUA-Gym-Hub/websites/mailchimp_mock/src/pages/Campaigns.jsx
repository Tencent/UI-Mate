import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Trash2, Copy, Eye, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';

function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Campaigns() {
  const { state, deleteCampaign, addCampaign, addToast } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('updated');
  const [menuOpen, setMenuOpen] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  let campaigns = [...state.campaigns];
  if (statusFilter !== 'all') campaigns = campaigns.filter(c => c.status === statusFilter);
  if (search) campaigns = campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  if (sort === 'updated') campaigns.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  else if (sort === 'name') campaigns.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'sent') campaigns.sort((a, b) => new Date(b.sentAt || 0) - new Date(a.sentAt || 0));

  const toggleAll = () => {
    if (selected.size === campaigns.length) setSelected(new Set());
    else setSelected(new Set(campaigns.map(c => c.id)));
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleDuplicate = (campaign) => {
    const newCampaign = {
      ...campaign,
      id: `camp_${Date.now()}`,
      name: `Copy of ${campaign.name}`,
      status: 'draft',
      scheduledAt: null,
      sentAt: null,
      report: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addCampaign(newCampaign);
    addToast('Campaign duplicated');
    setMenuOpen(null);
  };

  const handleDelete = (id) => {
    deleteCampaign(id);
    addToast('Campaign deleted');
    setDeleteConfirm(null);
    setMenuOpen(null);
  };

  const handleBulkDelete = () => {
    selected.forEach(id => deleteCampaign(id));
    setSelected(new Set());
    addToast(`${selected.size} campaigns deleted`);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Campaigns</h1>
        <button className="btn btn-primary" onClick={() => navigate('/campaigns/new')}><Plus size={16} /> Create Campaign</button>
      </div>

      <div className="filter-tabs">
        {['all', 'draft', 'sent', 'scheduled'].map(s => (
          <button key={s} className={`filter-tab ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#707070' }} />
          <input placeholder="Search campaigns" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, width: '100%' }} />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="updated">Last updated</option>
          <option value="name">Name A-Z</option>
          <option value="sent">Send date</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="bulk-actions">
          <span>{selected.size} selected</span>
          <button className="danger" onClick={handleBulkDelete}>Delete</button>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <Send size={48} />
          <h3>Create your first campaign</h3>
          <p>Send emails to engage your audience and grow your business.</p>
          <button className="btn btn-primary" onClick={() => navigate('/campaigns/new')}>Create Campaign</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selected.size === campaigns.length && campaigns.length > 0} onChange={toggleAll} /></th>
                <th>Campaign</th>
                <th>Type</th>
                <th>Status</th>
                <th>Audience</th>
                <th>Delivered</th>
                <th>Open Rate</th>
                <th>Click Rate</th>
                <th>Last Edited</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)} /></td>
                  <td><a style={{ fontWeight: 500, cursor: 'pointer', color: '#007C89' }} onClick={() => navigate(`/campaigns/${c.id}`)}>{c.name}</a></td>
                  <td><span className={`badge badge-${c.type}`}>{c.type === 'ab_test' ? 'A/B Test' : c.type === 'plaintext' ? 'Plain Text' : 'Regular'}</span></td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td className="text-muted text-sm">{c.recipients?.listName || '—'}</td>
                  <td>{c.report ? c.report.delivered.toLocaleString() : '—'}</td>
                  <td>
                    {c.report ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 40, height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${c.report.openRate * 100}%`, height: '100%', background: c.report.openRate > 0.25 ? '#2E7D32' : c.report.openRate > 0.15 ? '#E65100' : '#D5432F', borderRadius: 3 }} />
                        </div>
                        {(c.report.openRate * 100).toFixed(1)}%
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    {c.report ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 40, height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(c.report.clickRate * 100 * 3, 100)}%`, height: '100%', background: c.report.clickRate > 0.1 ? '#2E7D32' : c.report.clickRate > 0.05 ? '#E65100' : '#D5432F', borderRadius: 3 }} />
                        </div>
                        {(c.report.clickRate * 100).toFixed(1)}%
                      </div>
                    ) : '—'}
                  </td>
                  <td className="text-muted text-sm">{formatRelativeDate(c.updatedAt)}</td>
                  <td>
                    <div className="action-menu">
                      <button className="action-menu-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === c.id ? null : c.id); }}>
                        <MoreHorizontal size={16} />
                      </button>
                      {menuOpen === c.id && (
                        <div className="action-menu-dropdown">
                          <button className="action-menu-item" onClick={() => { navigate(`/campaigns/${c.id}`); setMenuOpen(null); }}><Edit3 size={14} style={{ marginRight: 8 }} />Edit</button>
                          <button className="action-menu-item" onClick={() => handleDuplicate(c)}><Copy size={14} style={{ marginRight: 8 }} />Duplicate</button>
                          {c.report && <button className="action-menu-item" onClick={() => { navigate(`/campaigns/${c.id}/report`); setMenuOpen(null); }}><Eye size={14} style={{ marginRight: 8 }} />View Report</button>}
                          <button className="action-menu-item danger" onClick={() => setDeleteConfirm(c)}><Trash2 size={14} style={{ marginRight: 8 }} />Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Campaign</h2></div>
            <div className="modal-body">
              <p>Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
