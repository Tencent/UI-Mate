import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, getStatusBadge, SortableHeader, Pagination, EmptyState, Modal, FormField } from '../../components/ui/index.jsx';

// Campaigns List
export function CampaignsList() {
  const { state, addItem, showToast } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const PER_PAGE = 25;

  const campaigns = state.campaigns || [];

  const filtered = useMemo(() => {
    let items = campaigns;
    if (search) items = items.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') items = items.filter(c => c.status === statusFilter);
    return items;
  }, [campaigns, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = `campaign-${Date.now()}`;
    addItem('campaigns', {
      id, name: newName, status: 'draft', goal: '', startDate: new Date().toISOString(),
      endDate: null, owner: 'user-1', createdDate: new Date().toISOString(), budget: 0,
      assets: { emails: [], landingPages: [], forms: [], blogPosts: [], socialPosts: [], workflows: [], ctas: [] },
      metrics: { sessions: 0, newContacts: 0, influencedContacts: 0, closedDeals: 0, revenue: 0 }
    });
    setShowCreate(false); setNewName('');
    showToast('Campaign created', 'success');
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left"><h1>Campaigns</h1></div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create campaign</button>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--hs-text-muted)' }} />
          <input style={{ paddingLeft: 32 }} placeholder="Search campaigns..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {['all','active','draft','completed','paused'].map(s => (
          <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {pageItems.length === 0 ? (
          <EmptyState icon="📣" title="No campaigns found" description="Create your first campaign to group related marketing assets." actionLabel="Create campaign" onAction={() => setShowCreate(true)} />
        ) : (
          <>
            <table className="hs-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Start Date</th>
                  <th>Sessions</th>
                  <th>Contacts</th>
                  <th>Revenue</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(campaign => {
                  const owner = (state.users||[]).find(u=>u.id===campaign.owner);
                  return (
                    <tr key={campaign.id} onClick={() => navigate(`/marketing/campaigns/${campaign.id}`)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 500, color: 'var(--hs-teal)' }}>{campaign.name}</td>
                      <td>{getStatusBadge(campaign.status)}</td>
                      <td style={{ color: 'var(--hs-text-secondary)' }}>{owner ? `${owner.firstName} ${owner.lastName}` : '—'}</td>
                      <td style={{ color: 'var(--hs-text-secondary)' }}>{formatDate(campaign.startDate)}</td>
                      <td>{campaign.metrics?.sessions?.toLocaleString() || '0'}</td>
                      <td>{campaign.metrics?.newContacts?.toLocaleString() || '0'}</td>
                      <td>{campaign.metrics?.revenue ? `$${campaign.metrics.revenue.toLocaleString()}` : '—'}</td>
                      <td><button onClick={e=>e.stopPropagation()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-text-muted)' }}><MoreHorizontal size={16} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} />
          </>
        )}
      </div>

      {showCreate && (
        <Modal title="Create campaign" onClose={() => setShowCreate(false)} width={440}>
          <FormField label="Campaign name" required>
            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Q3 Product Launch" onKeyDown={e => e.key==='Enter' && handleCreate()} />
          </FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Create</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Campaign Detail
export function CampaignDetail() {
  const { id } = useParams();
  const { state, updateItem, addItem, deleteItem, showToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assets');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(null); // section key
  const [selectedAssetId, setSelectedAssetId] = useState('');

  const campaign = state.campaigns?.find(c => c.id === id);

  if (!campaign) return <div style={{ padding: 24 }}><button className="btn btn-ghost" onClick={() => navigate('/marketing/campaigns')}>← Back</button><div style={{ textAlign: 'center', padding: 60, color: 'var(--hs-text-muted)' }}>Campaign not found.</div></div>;

  const metrics = [
    { label: 'Sessions', value: campaign.metrics?.sessions?.toLocaleString() || '0' },
    { label: 'New Contacts', value: campaign.metrics?.newContacts?.toLocaleString() || '0' },
    { label: 'Influenced Contacts', value: campaign.metrics?.influencedContacts?.toLocaleString() || '0' },
    { label: 'Closed Deals', value: campaign.metrics?.closedDeals?.toString() || '0' },
    { label: 'Revenue', value: campaign.metrics?.revenue ? `$${campaign.metrics.revenue.toLocaleString()}` : '$0' }
  ];

  const assetSections = [
    { key: 'emails', label: 'Marketing Emails', items: campaign.assets?.emails || [], data: state.emails || [] },
    { key: 'forms', label: 'Forms', items: campaign.assets?.forms || [], data: state.forms || [] },
    { key: 'landingPages', label: 'Landing Pages', items: campaign.assets?.landingPages || [], data: state.landingPages || [] },
    { key: 'socialPosts', label: 'Social Posts', items: campaign.assets?.socialPosts || [], data: state.socialPosts || [] },
    { key: 'workflows', label: 'Workflows', items: campaign.assets?.workflows || [], data: state.workflows || [] },
    { key: 'ctas', label: 'CTAs', items: campaign.assets?.ctas || [], data: state.ctas || [] }
  ];

  const owner = (state.users||[]).find(u=>u.id===campaign.owner);

  const handleDeleteCampaign = () => {
    deleteItem('campaigns', id);
    showToast('Campaign deleted', 'success');
    navigate('/marketing/campaigns');
  };

  const handleAddAsset = () => {
    if (!selectedAssetId || !showAddAsset) return;
    const currentItems = campaign.assets?.[showAddAsset] || [];
    if (currentItems.includes(selectedAssetId)) {
      showToast('Asset already associated', 'info');
      setShowAddAsset(null);
      return;
    }
    updateItem('campaigns', id, {
      assets: {
        ...(campaign.assets || {}),
        [showAddAsset]: [...currentItems, selectedAssetId]
      }
    });
    showToast('Asset added to campaign', 'success');
    setShowAddAsset(null);
    setSelectedAssetId('');
  };

  const currentSection = assetSections.find(s => s.key === showAddAsset);
  const availableAssets = currentSection ? currentSection.data.filter(item => !currentSection.items.includes(item.id)) : [];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate('/marketing/campaigns')}>← Campaigns</button>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>{campaign.name}</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {getStatusBadge(campaign.status)}
            {owner && <span style={{ fontSize: 13, color: 'var(--hs-text-muted)' }}>{owner.firstName} {owner.lastName}</span>}
            <span style={{ fontSize: 13, color: 'var(--hs-text-muted)' }}>{formatDate(campaign.startDate)} — {campaign.endDate ? formatDate(campaign.endDate) : 'Ongoing'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <button className="btn btn-ghost" onClick={() => setShowActionsMenu(v => !v)}>Actions ▾</button>
          {showActionsMenu && (
            <div className="dropdown-menu" style={{ right: 0, top: '100%', minWidth: 160 }}>
              <div className="dropdown-item" onClick={() => {
                setShowActionsMenu(false);
                const clonedId = `campaign-${Date.now()}`;
                addItem('campaigns', { ...campaign, id: clonedId, name: campaign.name + ' (copy)', status: 'draft', createdDate: new Date().toISOString() });
                showToast('Campaign cloned', 'success');
                navigate(`/marketing/campaigns/${clonedId}`);
              }}>Clone campaign</div>
              <div className="dropdown-divider" />
              <div className="dropdown-item" style={{ color: 'var(--hs-danger)' }} onClick={() => { setShowActionsMenu(false); handleDeleteCampaign(); }}>Delete campaign</div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {metrics.map((m, i) => (
          <div key={i} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>Assets</div>
        <div className={`tab ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>Performance</div>
      </div>

      {activeTab === 'assets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {assetSections.map(section => {
            const linkedItems = section.data.filter(item => section.items.includes(item.id));
            return (
              <div key={section.key} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: 'var(--hs-page-bg)', borderBottom: '1px solid var(--hs-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{section.label} <span style={{ fontSize: 12, background: 'var(--hs-border)', borderRadius: 10, padding: '1px 7px', fontWeight: 400 }}>{linkedItems.length}</span></span>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-teal)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => { setShowAddAsset(section.key); setSelectedAssetId(''); }}><Plus size={13} /> Add {section.label.slice(0,-1)}</button>
                </div>
                {linkedItems.length === 0 ? (
                  <div style={{ padding: '16px', color: 'var(--hs-text-muted)', fontSize: 13 }}>No {section.label.toLowerCase()} associated.</div>
                ) : (
                  linkedItems.map(item => (
                    <div key={item.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--hs-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 14 }}>{item.name}</div>
                      {getStatusBadge(item.status)}
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'performance' && (
        <div style={{ padding: '24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Email Opens', value: campaign.metrics?.emailOpens || 0, suffix: '' },
              { label: 'Click-Through Rate', value: campaign.metrics?.ctr || 0, suffix: '%' },
              { label: 'Form Submissions', value: campaign.metrics?.formSubmissions || 0, suffix: '' }
            ].map((m, i) => (
              <div key={i} className="card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{m.value.toLocaleString()}{m.suffix}</div>
                <div style={{ fontSize: 13, color: 'var(--hs-text-muted)', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Sessions over time — SVG line chart */}
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16, fontSize: 14 }}>Sessions Over Time</h3>
            {(() => {
              const totalSessions = campaign.metrics?.sessions || 1200;
              const points = [0.18, 0.22, 0.15, 0.30, 0.45, 0.38, 0.55, 0.48, 0.62, 0.58, 0.75, 1.0].map((f, i) => ({
                day: i + 1,
                value: Math.round(totalSessions * f / 12 * (0.85 + Math.random() * 0.3))
              }));
              const maxVal = Math.max(...points.map(p => p.value));
              const W = 560, H = 160, PAD = { t: 12, r: 16, b: 28, l: 44 };
              const xScale = (i) => PAD.l + (i / (points.length - 1)) * (W - PAD.l - PAD.r);
              const yScale = (v) => PAD.t + (1 - v / (maxVal || 1)) * (H - PAD.t - PAD.b);
              const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(p.value).toFixed(1)}`).join(' ');
              const areaD = pathD + ` L${xScale(points.length - 1).toFixed(1)},${yScale(0).toFixed(1)} L${xScale(0).toFixed(1)},${yScale(0).toFixed(1)} Z`;
              const yTicks = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];
              return (
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
                  {yTicks.map(t => (
                    <g key={t}>
                      <line x1={PAD.l} y1={yScale(t)} x2={W - PAD.r} y2={yScale(t)} stroke="#CBD6E2" strokeWidth="1" strokeDasharray="3,3" />
                      <text x={PAD.l - 6} y={yScale(t) + 4} textAnchor="end" fontSize="10" fill="#7C98B6">{t}</text>
                    </g>
                  ))}
                  {points.filter((_, i) => i % 2 === 0).map((p, idx) => {
                    const i = idx * 2;
                    return <text key={i} x={xScale(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#7C98B6">Day {p.day}</text>;
                  })}
                  <path d={areaD} fill="rgba(0,164,189,0.08)" />
                  <path d={pathD} fill="none" stroke="#00A4BD" strokeWidth="2" strokeLinejoin="round" />
                  {points.map((p, i) => (
                    <circle key={i} cx={xScale(i)} cy={yScale(p.value)} r="3" fill="#00A4BD" />
                  ))}
                </svg>
              );
            })()}
          </div>

          {/* Contacts by source — SVG donut chart */}
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16, fontSize: 14 }}>Contacts by Source</h3>
            {(() => {
              const sources = [
                { label: 'Email', value: Math.round((campaign.metrics?.influencedContacts || 120) * 0.38), color: '#FF7A59' },
                { label: 'Organic Search', value: Math.round((campaign.metrics?.influencedContacts || 120) * 0.26), color: '#00A4BD' },
                { label: 'Social Media', value: Math.round((campaign.metrics?.influencedContacts || 120) * 0.18), color: '#00BDA5' },
                { label: 'Direct', value: Math.round((campaign.metrics?.influencedContacts || 120) * 0.12), color: '#DBAE17' },
                { label: 'Referral', value: Math.round((campaign.metrics?.influencedContacts || 120) * 0.06), color: '#F2545B' }
              ];
              const total = sources.reduce((s, d) => s + d.value, 0) || 1;
              const cx = 80, cy = 80, r = 60, ir = 36;
              let angle = -Math.PI / 2;
              const slices = sources.map(d => {
                const a = (d.value / total) * 2 * Math.PI;
                const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
                angle += a;
                const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
                const ix1 = cx + ir * Math.cos(angle - a), iy1 = cy + ir * Math.sin(angle - a);
                const ix2 = cx + ir * Math.cos(angle), iy2 = cy + ir * Math.sin(angle);
                const large = a > Math.PI ? 1 : 0;
                return { ...d, d: `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} L${ix2.toFixed(1)},${iy2.toFixed(1)} A${ir},${ir} 0 ${large} 0 ${ix1.toFixed(1)},${iy1.toFixed(1)} Z` };
              });
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                  <svg width={160} height={160} viewBox={`0 0 160 160`}>
                    {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} stroke="#fff" strokeWidth="1.5" />)}
                    <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#33475B">{total}</text>
                    <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#7C98B6">contacts</text>
                  </svg>
                  <div style={{ flex: 1 }}>
                    {sources.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{s.label}</span>
                        <span style={{ fontWeight: 600 }}>{s.value}</span>
                        <span style={{ color: 'var(--hs-text-muted)', width: 36, textAlign: 'right' }}>{((s.value / total) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 16, fontSize: 14 }}>Campaign Performance Summary</h3>
            <table className="hs-table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Total Sessions</td><td>{(campaign.metrics?.sessions || 0).toLocaleString()}</td></tr>
                <tr><td>New Contacts</td><td>{(campaign.metrics?.newContacts || 0).toLocaleString()}</td></tr>
                <tr><td>Influenced Contacts</td><td>{(campaign.metrics?.influencedContacts || 0).toLocaleString()}</td></tr>
                <tr><td>Closed Deals</td><td>{campaign.metrics?.closedDeals || 0}</td></tr>
                <tr><td>Revenue</td><td>{campaign.metrics?.revenue ? `$${campaign.metrics.revenue.toLocaleString()}` : '$0'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddAsset && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAddAsset(null)}>
          <div className="card" style={{ width: 480, padding: 24 }}>
            <h2 style={{ marginBottom: 20, fontSize: 18 }}>Add {currentSection?.label.slice(0,-1)}</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Select {currentSection?.label.slice(0,-1)}</label>
              <select value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)} style={{ width: '100%' }}>
                <option value="">-- Choose --</option>
                {availableAssets.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              {availableAssets.length === 0 && (
                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--hs-text-muted)' }}>
                  No available {currentSection?.label.toLowerCase()} to add.
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowAddAsset(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddAsset} disabled={!selectedAssetId}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
