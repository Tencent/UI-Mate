import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatPercent, getStatusBadge, SortableHeader, Pagination, EmptyState } from '../../components/ui/index.jsx';

const STATUS_COLORS = {
  sent: 'badge-success',
  scheduled: 'badge-blue',
  draft: 'badge-gray',
  archived: 'badge-gray',
  automated: 'badge-orange'
};

export default function EmailList() {
  const { state, showToast } = useApp();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState('manage');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('updatedDate');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  const emails = state.emails || [];

  const statusFilters = [
    { key: 'all', label: 'All emails', count: emails.length },
    { key: 'draft', label: 'Draft', count: emails.filter(e => e.status === 'draft').length },
    { key: 'scheduled', label: 'Scheduled', count: emails.filter(e => e.status === 'scheduled').length },
    { key: 'sent', label: 'Sent', count: emails.filter(e => e.status === 'sent').length },
    { key: 'archived', label: 'Archived', count: emails.filter(e => e.status === 'archived').length },
  ];

  const filtered = useMemo(() => {
    let items = emails;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(e => e.name.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') items = items.filter(e => e.status === statusFilter);
    return [...items].sort((a, b) => {
      const va = a[sortField] || '', vb = b[sortField] || '';
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [emails, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Marketing Email</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/marketing/email/new')}>
            <Plus size={15} /> Create email
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${mainTab === 'manage' ? 'active' : ''}`} onClick={() => setMainTab('manage')}>Manage</div>
        <div className={`tab ${mainTab === 'analyze' ? 'active' : ''}`} onClick={() => setMainTab('analyze')}>Analyze</div>
      </div>

      {mainTab === 'manage' && (
        <div style={{ display: 'flex', gap: 20 }}>
          {/* Left sidebar */}
          <div style={{ width: 180, flexShrink: 0 }}>
            {statusFilters.map(f => (
              <div
                key={f.key}
                onClick={() => { setStatusFilter(f.key); setPage(1); }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderRadius: 3,
                  background: statusFilter === f.key ? 'var(--hs-table-selected)' : 'transparent',
                  color: statusFilter === f.key ? 'var(--hs-teal)' : 'var(--hs-text-primary)',
                  fontWeight: statusFilter === f.key ? 600 : 400,
                  fontSize: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 2
                }}
              >
                <span>{f.label}</span>
                <span style={{ fontSize: 12, color: 'var(--hs-text-muted)', background: 'var(--hs-border)', borderRadius: 10, padding: '1px 7px' }}>{f.count}</span>
              </div>
            ))}
          </div>

          {/* Main table */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Search + controls */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: '0 0 260px' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--hs-text-muted)' }} />
                <input style={{ paddingLeft: 32 }} placeholder="Search emails..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <select style={{ width: 'auto', padding: '8px 12px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">Type: All emails</option>
                <option value="regular">Regular</option>
                <option value="automated">Automated</option>
              </select>
              <button className="btn btn-ghost" style={{ marginLeft: 'auto' }}>Export</button>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              {pageItems.length === 0 ? (
                <EmptyState icon="✉️" title="No emails found" description="Create your first email campaign." actionLabel="Create email" onAction={() => navigate('/marketing/email/new')} />
              ) : (
                <>
                  <table className="hs-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}><input type="checkbox" /></th>
                        <SortableHeader label="Title" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                        <SortableHeader label="Last Updated" field="updatedDate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                        <th>Open Rate</th>
                        <th>Click Rate</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map(email => (
                        <tr key={email.id} onClick={() => navigate(`/marketing/email/${email.id}`)} style={{ cursor: 'pointer' }}>
                          <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                          <td>
                            <div style={{ fontWeight: 500, color: 'var(--hs-teal)' }}>{email.name}</div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                              {getStatusBadge(email.status)}
                              <span style={{ fontSize: 12, color: 'var(--hs-text-muted)' }}>Updated {formatDate(email.updatedDate)}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--hs-text-secondary)' }}>{formatDate(email.updatedDate)}</td>
                          <td style={{ color: 'var(--hs-text-primary)', fontWeight: email.stats ? 500 : 400 }}>
                            {email.stats ? formatPercent(email.stats.openRate) : '—'}
                          </td>
                          <td style={{ color: 'var(--hs-text-primary)', fontWeight: email.stats ? 500 : 400 }}>
                            {email.stats ? formatPercent(email.stats.clickRate) : '—'}
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-text-muted)', padding: 4 }}>
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {mainTab === 'analyze' && <EmailAnalytics emails={emails} />}
    </div>
  );
}

function EmailAnalytics({ emails }) {
  const sentEmails = emails.filter(e => e.status === 'sent' && e.stats);
  const totalSent = sentEmails.reduce((acc, e) => acc + (e.stats?.sent || 0), 0);
  const avgOpen = sentEmails.length > 0 ? sentEmails.reduce((acc, e) => acc + e.stats.openRate, 0) / sentEmails.length : 0;
  const avgClick = sentEmails.length > 0 ? sentEmails.reduce((acc, e) => acc + e.stats.clickRate, 0) / sentEmails.length : 0;
  const avgUnsub = sentEmails.length > 0 ? sentEmails.reduce((acc, e) => acc + e.stats.unsubscribeRate, 0) / sentEmails.length : 0;

  const metrics = [
    { label: 'Total Sent', value: totalSent.toLocaleString() },
    { label: 'Avg Open Rate', value: `${avgOpen.toFixed(1)}%` },
    { label: 'Avg Click Rate', value: `${avgClick.toFixed(1)}%` },
    { label: 'Avg Unsubscribe', value: `${avgUnsub.toFixed(2)}%` }
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {metrics.map((m, i) => (
          <div key={i} className="card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--hs-text-primary)' }}>{m.value}</div>
            <div style={{ fontSize: 13, color: 'var(--hs-text-muted)', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--hs-border)', fontWeight: 600 }}>Email Performance</div>
        <table className="hs-table">
          <thead>
            <tr>
              <th>Email Name</th>
              <th>Status</th>
              <th>Sent Date</th>
              <th>Sent</th>
              <th>Open Rate</th>
              <th>Click Rate</th>
              <th>Bounce Rate</th>
            </tr>
          </thead>
          <tbody>
            {sentEmails.map(email => (
              <tr key={email.id}>
                <td style={{ fontWeight: 500, color: 'var(--hs-teal)' }}>{email.name}</td>
                <td>{getStatusBadge(email.status)}</td>
                <td style={{ color: 'var(--hs-text-secondary)' }}>{formatDate(email.sentDate)}</td>
                <td>{email.stats?.sent?.toLocaleString()}</td>
                <td>{formatPercent(email.stats?.openRate)}</td>
                <td>{formatPercent(email.stats?.clickRate)}</td>
                <td>{formatPercent(email.stats?.bounceRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
