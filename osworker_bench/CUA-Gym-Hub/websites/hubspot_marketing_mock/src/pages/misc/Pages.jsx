import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, ArrowLeft, Trash2, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, getStatusBadge, Pagination, EmptyState, Modal, FormField } from '../../components/ui/index.jsx';

// Companies list
export function CompaniesList() {
  const { state, addItem, showToast } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', industry: '', city: '', state: '' });
  const PER_PAGE = 25;

  const companies = state.companies || [];
  const filtered = useMemo(() => {
    if (!search) return companies;
    const q = search.toLowerCase();
    return companies.filter(c => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
  }, [companies, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCreate = () => {
    if (!newCompany.name.trim()) return;
    addItem('companies', {
      id: `company-${Date.now()}`,
      name: newCompany.name.trim(),
      industry: newCompany.industry || 'Other',
      employeeCount: 0,
      annualRevenue: '$0',
      city: newCompany.city || '',
      state: newCompany.state || '',
      contactCount: 0,
      createDate: new Date().toISOString()
    });
    setShowCreate(false);
    setNewCompany({ name: '', industry: '', city: '', state: '' });
    showToast('Company created', 'success');
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Companies</h1>
          <div className="record-count">{filtered.length} records</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create company</button>
        </div>
      </div>
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--hs-text-muted)' }} />
          <input style={{ paddingLeft: 32 }} placeholder="Search companies..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="hs-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Company Name</th>
              <th>Industry</th>
              <th>Employees</th>
              <th>Annual Revenue</th>
              <th>Location</th>
              <th>Contacts</th>
              <th>Create Date</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(company => (
              <tr key={company.id} style={{ cursor: 'pointer' }}>
                <td><input type="checkbox" /></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, background: '#E0E6EE', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--hs-text-secondary)' }}>
                      {company.name[0]}
                    </div>
                    <a style={{ color: 'var(--hs-teal)', fontWeight: 500 }}>{company.name}</a>
                  </div>
                </td>
                <td style={{ color: 'var(--hs-text-secondary)' }}>{company.industry}</td>
                <td>{company.employeeCount?.toLocaleString()}</td>
                <td>{company.annualRevenue}</td>
                <td style={{ color: 'var(--hs-text-secondary)' }}>{company.city}, {company.state}</td>
                <td>{company.contactCount}</td>
                <td style={{ color: 'var(--hs-text-secondary)' }}>{formatDate(company.createDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} />
      </div>

      {showCreate && (
        <Modal title="Create company" onClose={() => setShowCreate(false)} width={440}>
          <FormField label="Company name" required>
            <input autoFocus value={newCompany.name} onChange={e => setNewCompany(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Acme Corp" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </FormField>
          <FormField label="Industry">
            <select value={newCompany.industry} onChange={e => setNewCompany(p => ({ ...p, industry: e.target.value }))}>
              <option value="">Select industry</option>
              {['Technology','Finance','Healthcare','Retail','Manufacturing','Education','Media','Real Estate','Other'].map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </FormField>
          <FormField label="City">
            <input value={newCompany.city} onChange={e => setNewCompany(p => ({ ...p, city: e.target.value }))} placeholder="e.g. San Francisco" />
          </FormField>
          <FormField label="State">
            <input value={newCompany.state} onChange={e => setNewCompany(p => ({ ...p, state: e.target.value }))} placeholder="e.g. CA" />
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

// Deals list
export function DealsList() {
  const { state, addItem, showToast } = useApp();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newDeal, setNewDeal] = useState({ name: '', amount: '', stage: 'appointment_scheduled', owner: 'user-1', closeDate: '' });
  const PER_PAGE = 25;

  const deals = state.deals || [];
  const stageLabels = {
    appointment_scheduled: 'Appointment Scheduled',
    qualified_to_buy: 'Qualified to Buy',
    presentation_scheduled: 'Presentation Scheduled',
    decision_maker_bought_in: 'Decision Maker Bought In',
    contract_sent: 'Contract Sent',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost'
  };

  const totalPages = Math.ceil(deals.length / PER_PAGE);
  const pageItems = deals.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCreate = () => {
    if (!newDeal.name.trim()) return;
    addItem('deals', {
      id: `deal-${Date.now()}`,
      name: newDeal.name.trim(),
      amount: parseFloat(newDeal.amount) || 0,
      stage: newDeal.stage,
      owner: newDeal.owner,
      closeDate: newDeal.closeDate || new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
      contactId: null,
      createDate: new Date().toISOString()
    });
    setShowCreate(false);
    setNewDeal({ name: '', amount: '', stage: 'appointment_scheduled', owner: 'user-1', closeDate: '' });
    showToast('Deal created', 'success');
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Deals</h1>
          <div className="record-count">{deals.length} deals</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create deal</button>
        </div>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="hs-table">
          <thead>
            <tr>
              <th>Deal Name</th>
              <th>Stage</th>
              <th>Amount</th>
              <th>Close Date</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(deal => {
              const owner = (state.users||[]).find(u=>u.id===deal.owner);
              return (
                <tr key={deal.id} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 500, color: 'var(--hs-teal)' }}>{deal.name}</td>
                  <td><span className="badge badge-gray">{stageLabels[deal.stage] || deal.stage}</span></td>
                  <td style={{ fontWeight: 500 }}>${deal.amount?.toLocaleString()}</td>
                  <td style={{ color: 'var(--hs-text-secondary)' }}>{formatDate(deal.closeDate)}</td>
                  <td style={{ color: 'var(--hs-text-secondary)' }}>{owner ? `${owner.firstName} ${owner.lastName}` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPage={setPage} total={deals.length} />
      </div>

      {showCreate && (
        <Modal title="Create deal" onClose={() => setShowCreate(false)} width={440}>
          <FormField label="Deal name" required>
            <input autoFocus value={newDeal.name} onChange={e => setNewDeal(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Enterprise Contract" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </FormField>
          <FormField label="Deal stage">
            <select value={newDeal.stage} onChange={e => setNewDeal(p => ({ ...p, stage: e.target.value }))}>
              {Object.entries(stageLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
          <FormField label="Amount">
            <input type="number" value={newDeal.amount} onChange={e => setNewDeal(p => ({ ...p, amount: e.target.value }))} placeholder="0" min="0" />
          </FormField>
          <FormField label="Close date">
            <input type="date" value={newDeal.closeDate} onChange={e => setNewDeal(p => ({ ...p, closeDate: e.target.value }))} />
          </FormField>
          <FormField label="Deal owner">
            <select value={newDeal.owner} onChange={e => setNewDeal(p => ({ ...p, owner: e.target.value }))}>
              {(state.users || []).map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
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

// Social posts
export function SocialPosts() {
  const { state, addItem, updateItem, showToast } = useApp();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('publishing');
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ platforms: ['linkedin'], content: '', status: 'draft', scheduledDate: '' });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const PER_PAGE = 25;

  const posts = state.socialPosts || [];
  const totalPages = Math.ceil(posts.length / PER_PAGE);
  const pageItems = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const platformIcon = (p) => ({ facebook: 'FB', twitter: 'TW', linkedin: 'IN', instagram: 'IG' }[p] || p.toUpperCase().slice(0,2));
  const platformColor = (p) => ({ facebook: '#1877F2', twitter: '#1DA1F2', linkedin: '#0A66C2', instagram: '#E1306C' }[p] || '#516F90');

  const togglePlatform = (p) => {
    setNewPost(prev => {
      const platforms = prev.platforms.includes(p) ? prev.platforms.filter(x => x !== p) : [...prev.platforms, p];
      return { ...prev, platforms: platforms.length ? platforms : [p] };
    });
  };

  const handleCreate = () => {
    if (!newPost.content.trim() || !newPost.platforms.length) return;
    addItem('socialPosts', {
      id: `social-${Date.now()}`,
      platform: newPost.platforms[0],
      platforms: newPost.platforms,
      content: newPost.content,
      status: newPost.status,
      scheduledDate: newPost.scheduledDate || null,
      publishedDate: newPost.status === 'published' ? new Date().toISOString() : null,
      campaignId: null,
      metrics: { likes: 0, shares: 0, comments: 0, clicks: 0, impressions: 0 }
    });
    setShowCreate(false);
    setNewPost({ platforms: ['linkedin'], content: '', status: 'draft', scheduledDate: '' });
    showToast('Post saved', 'success');
  };

  const handlePublishNow = (postId) => {
    updateItem('socialPosts', postId, {
      status: 'published',
      publishedDate: new Date().toISOString()
    });
    showToast('Post published!', 'success');
  };

  // Social metrics totals
  const totalMetrics = posts.filter(p => p.status === 'published').reduce((acc, p) => ({
    likes: acc.likes + (p.metrics?.likes || 0),
    shares: acc.shares + (p.metrics?.shares || 0),
    comments: acc.comments + (p.metrics?.comments || 0),
    clicks: acc.clicks + (p.metrics?.clicks || 0),
    impressions: acc.impressions + (p.metrics?.impressions || 0)
  }), { likes: 0, shares: 0, comments: 0, clicks: 0, impressions: 0 });

  // Calendar data
  const calendarDays = (() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  })();

  const getPostsForDay = (day) => {
    if (!day) return [];
    const { year, month } = calendarMonth;
    return posts.filter(p => {
      const d = p.publishedDate || p.scheduledDate;
      if (!d) return false;
      const dt = new Date(d);
      return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === day;
    });
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const monitoringFeeds = [
    { id: 'm1', type: 'mention', platform: 'twitter', user: '@techinsider', text: 'Just tried @acmecorp\'s new automation features -- game changer for our marketing team!', time: '2h ago', sentiment: 'positive' },
    { id: 'm2', type: 'mention', platform: 'linkedin', user: 'Sarah M.', text: 'Acme Corp\'s webinar series has been incredibly insightful. Highly recommend to all marketers.', time: '5h ago', sentiment: 'positive' },
    { id: 'm3', type: 'comment', platform: 'facebook', user: 'Mike Johnson', text: 'When is the next webinar? The last one was fantastic!', time: '1d ago', sentiment: 'positive' },
    { id: 'm4', type: 'mention', platform: 'twitter', user: '@marketingweekly', text: 'Article: Top 10 Marketing Automation Tools 2025 -- @acmecorp makes the list at #4', time: '2d ago', sentiment: 'neutral' },
    { id: 'm5', type: 'review', platform: 'facebook', user: 'Lisa Chen', text: 'The customer support could be more responsive. Waited 3 days for a reply.', time: '3d ago', sentiment: 'negative' }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left"><h1>Social</h1></div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create social post</button>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'publishing' ? 'active' : ''}`} onClick={() => setActiveTab('publishing')}>Publishing</div>
        <div className={`tab ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>Calendar</div>
        <div className={`tab ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>Monitoring</div>
        <div className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</div>
      </div>

      {activeTab === 'publishing' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Post Content</th>
                <th>Status</th>
                <th>Date</th>
                <th>Engagement</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(post => (
                <tr key={post.id}>
                  <td>
                    <div style={{ width: 32, height: 32, background: platformColor(post.platform), borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>
                      {platformIcon(post.platform)}
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{post.content}</div>
                  </td>
                  <td>{getStatusBadge(post.status)}</td>
                  <td style={{ color: 'var(--hs-text-secondary)', fontSize: 13 }}>
                    {formatDate(post.publishedDate || post.scheduledDate)}
                  </td>
                  <td style={{ color: 'var(--hs-text-secondary)', fontSize: 13 }}>
                    {post.metrics?.likes || 0} likes · {post.metrics?.shares || 0} shares · {post.metrics?.comments || 0} comments
                  </td>
                  <td>
                    {(post.status === 'draft' || post.status === 'scheduled') && (
                      <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => handlePublishNow(post.id)}>Publish</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} total={posts.length} />
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button className="btn btn-ghost" onClick={() => setCalendarMonth(prev => {
              const d = new Date(prev.year, prev.month - 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })}>← Prev</button>
            <h3 style={{ fontSize: 18, margin: 0 }}>{monthNames[calendarMonth.month]} {calendarMonth.year}</h3>
            <button className="btn btn-ghost" onClick={() => setCalendarMonth(prev => {
              const d = new Date(prev.year, prev.month + 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })}>Next →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--hs-border)' }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ padding: '8px', textAlign: 'center', background: 'var(--hs-table-header-bg)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--hs-text-muted)' }}>{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              const dayPosts = getPostsForDay(day);
              return (
                <div key={i} style={{ background: '#fff', minHeight: 80, padding: 6 }}>
                  {day && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--hs-text-muted)', marginBottom: 4 }}>{day}</div>
                      {dayPosts.slice(0, 2).map(p => (
                        <div key={p.id} style={{ background: platformColor(p.platform) + '18', borderLeft: `3px solid ${platformColor(p.platform)}`, padding: '2px 4px', marginBottom: 2, borderRadius: 2, fontSize: 10, color: 'var(--hs-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {platformIcon(p.platform)} {p.content.slice(0, 25)}...
                        </div>
                      ))}
                      {dayPosts.length > 2 && <div style={{ fontSize: 10, color: 'var(--hs-text-muted)' }}>+{dayPosts.length - 2} more</div>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div>
          <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--hs-border)', fontWeight: 600, fontSize: 14 }}>Brand Mentions & Interactions</div>
            {monitoringFeeds.map(feed => (
              <div key={feed.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--hs-border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, background: platformColor(feed.platform), borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                  {platformIcon(feed.platform)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{feed.user}</span>
                    <span className={`badge ${feed.sentiment === 'positive' ? 'badge-success' : feed.sentiment === 'negative' ? 'badge-danger' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                      {feed.sentiment}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginLeft: 'auto' }}>{feed.time}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--hs-text-secondary)', lineHeight: 1.5 }}>{feed.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Impressions', value: totalMetrics.impressions.toLocaleString() },
              { label: 'Clicks', value: totalMetrics.clicks.toLocaleString() },
              { label: 'Likes', value: totalMetrics.likes.toLocaleString() },
              { label: 'Shares', value: totalMetrics.shares.toLocaleString() },
              { label: 'Comments', value: totalMetrics.comments.toLocaleString() }
            ].map((m, i) => (
              <div key={i} className="card" style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{m.value}</div>
                <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--hs-border)', fontWeight: 600 }}>Post Performance</div>
            <table className="hs-table" style={{ fontSize: 13 }}>
              <thead>
                <tr><th>Post</th><th>Platform</th><th>Impressions</th><th>Clicks</th><th>Likes</th><th>Shares</th><th>Engagement Rate</th></tr>
              </thead>
              <tbody>
                {posts.filter(p => p.status === 'published').sort((a, b) => (b.metrics?.impressions || 0) - (a.metrics?.impressions || 0)).slice(0, 10).map(p => {
                  const engRate = p.metrics?.impressions ? (((p.metrics.likes || 0) + (p.metrics.shares || 0) + (p.metrics.comments || 0)) / p.metrics.impressions * 100).toFixed(2) : '0.00';
                  return (
                    <tr key={p.id}>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.content.slice(0, 60)}...</td>
                      <td><span style={{ width: 20, height: 20, background: platformColor(p.platform), borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 700 }}>{platformIcon(p.platform)}</span></td>
                      <td>{(p.metrics?.impressions || 0).toLocaleString()}</td>
                      <td>{(p.metrics?.clicks || 0).toLocaleString()}</td>
                      <td>{(p.metrics?.likes || 0).toLocaleString()}</td>
                      <td>{(p.metrics?.shares || 0).toLocaleString()}</td>
                      <td>{engRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="overlay" onClick={e => e.target===e.currentTarget && setShowCreate(false)}>
          <div className="card" style={{ width: 520, padding: 24 }}>
            <h2 style={{ marginBottom: 20, fontSize: 18 }}>Create social post</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 8 }}>Platforms <span style={{ fontWeight: 400, color: 'var(--hs-text-muted)' }}>(select one or more)</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['facebook','twitter','linkedin','instagram'].map(p => {
                  const selected = newPost.platforms.includes(p);
                  return (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px', borderRadius: 4, border: `2px solid ${selected ? platformColor(p) : 'var(--hs-border)'}`, background: selected ? `${platformColor(p)}18` : '#fff', transition: 'all 0.15s' }}>
                      <input type="checkbox" checked={selected} onChange={() => togglePlatform(p)} style={{ display: 'none' }} />
                      <div style={{ width: 28, height: 28, background: platformColor(p), borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10 }}>{platformIcon(p)}</div>
                      <span style={{ fontSize: 12, fontWeight: selected ? 600 : 400 }}>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                    </label>
                  );
                })}
              </div>
              {newPost.platforms.length === 0 && <div style={{ fontSize: 12, color: 'var(--hs-danger)', marginTop: 4 }}>Select at least one platform</div>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Content</label>
              <textarea value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} style={{ minHeight: 120, resize: 'vertical' }} placeholder="What do you want to share?" />
              {newPost.platforms.includes('twitter') && <div style={{ fontSize: 12, color: newPost.content.length > 280 ? 'var(--hs-danger)' : 'var(--hs-text-muted)', textAlign: 'right' }}>{newPost.content.length}/280</div>}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Status</label>
              <select value={newPost.status} onChange={e => setNewPost(p => ({ ...p, status: e.target.value }))}>
                <option value="draft">Save as draft</option>
                <option value="scheduled">Schedule</option>
                <option value="published">Publish now</option>
              </select>
            </div>
            {newPost.status === 'scheduled' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Schedule date & time</label>
                <input type="datetime-local" value={newPost.scheduledDate} onChange={e => setNewPost(p => ({ ...p, scheduledDate: e.target.value }))} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ads page with real ad campaign data
export function AdsPage() {
  const { state, addItem, updateItem, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newAd, setNewAd] = useState({ name: '', platform: 'google', budget: '', status: 'draft' });

  const adCampaigns = state.adCampaigns || [];

  const platformIcon = (p) => ({ google: '🔍', facebook: '📘', linkedin: '💼' }[p] || '📣');
  const platformLabel = (p) => ({ google: 'Google Ads', facebook: 'Facebook Ads', linkedin: 'LinkedIn Ads' }[p] || p);
  const platformColor = (p) => ({ google: '#4285F4', facebook: '#1877F2', linkedin: '#0A66C2' }[p] || '#516F90');

  const filtered = statusFilter === 'all' ? adCampaigns : adCampaigns.filter(a => a.status === statusFilter);

  const totals = adCampaigns.reduce((acc, ad) => ({
    spent: acc.spent + (ad.spent || 0),
    impressions: acc.impressions + (ad.impressions || 0),
    clicks: acc.clicks + (ad.clicks || 0),
    conversions: acc.conversions + (ad.conversions || 0)
  }), { spent: 0, impressions: 0, clicks: 0, conversions: 0 });

  const overallCTR = totals.impressions ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : '0.00';
  const overallConvRate = totals.clicks ? ((totals.conversions / totals.clicks) * 100).toFixed(2) : '0.00';
  const overallCPC = totals.clicks ? (totals.spent / totals.clicks).toFixed(2) : '0.00';

  const handleCreate = () => {
    if (!newAd.name.trim()) return;
    addItem('adCampaigns', {
      id: `ad-${Date.now()}`,
      name: newAd.name.trim(),
      platform: newAd.platform,
      status: newAd.status,
      budget: parseFloat(newAd.budget) || 0,
      spent: 0, impressions: 0, clicks: 0, conversions: 0,
      cpc: 0, ctr: 0, conversionRate: 0, costPerConversion: 0,
      startDate: new Date().toISOString(),
      endDate: null,
      campaignId: null
    });
    setShowCreate(false);
    setNewAd({ name: '', platform: 'google', budget: '', status: 'draft' });
    showToast('Ad campaign created', 'success');
  };

  const handleToggleStatus = (ad) => {
    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    updateItem('adCampaigns', ad.id, { status: newStatus });
    showToast(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`, 'success');
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Ads</h1>
          <div className="record-count">{adCampaigns.length} campaigns</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create ad campaign</button>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}>Campaigns</div>
        <div className={`tab ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>Performance</div>
        <div className={`tab ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Ad Accounts</div>
      </div>

      {activeTab === 'campaigns' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Spend', value: `$${totals.spent.toLocaleString()}` },
              { label: 'Impressions', value: totals.impressions.toLocaleString() },
              { label: 'Clicks', value: totals.clicks.toLocaleString() },
              { label: 'Conversions', value: totals.conversions.toLocaleString() }
            ].map((m, i) => (
              <div key={i} className="card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--hs-text-primary)' }}>{m.value}</div>
                <div style={{ fontSize: 13, color: 'var(--hs-text-muted)', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>

          <div className="filter-bar">
            {['all','active','paused','draft','completed'].map(s => (
              <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <EmptyState icon="📣" title="No ad campaigns" description="Create ad campaigns to track performance across Google, Facebook, and LinkedIn." actionLabel="Create campaign" onAction={() => setShowCreate(true)} />
            ) : (
              <table className="hs-table">
                <thead>
                  <tr>
                    <th>Campaign Name</th>
                    <th>Platform</th>
                    <th>Status</th>
                    <th>Budget</th>
                    <th>Spent</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                    <th>Conversions</th>
                    <th>CPC</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ad => (
                    <tr key={ad.id}>
                      <td style={{ fontWeight: 500, color: 'var(--hs-teal)' }}>{ad.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 24, height: 24, background: platformColor(ad.platform), borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {ad.platform === 'google' ? 'G' : ad.platform === 'facebook' ? 'f' : 'in'}
                          </span>
                          <span style={{ fontSize: 13 }}>{platformLabel(ad.platform)}</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(ad.status)}</td>
                      <td>${ad.budget?.toLocaleString()}</td>
                      <td>${ad.spent?.toLocaleString()}</td>
                      <td>{ad.impressions?.toLocaleString()}</td>
                      <td>{ad.clicks?.toLocaleString()}</td>
                      <td>{ad.ctr?.toFixed(1)}%</td>
                      <td>{ad.conversions?.toLocaleString()}</td>
                      <td>${ad.cpc?.toFixed(2)}</td>
                      <td>
                        {(ad.status === 'active' || ad.status === 'paused') && (
                          <button
                            className="btn btn-ghost"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                            onClick={() => handleToggleStatus(ad)}
                          >
                            {ad.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'performance' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Avg CTR', value: `${overallCTR}%` },
              { label: 'Avg Conversion Rate', value: `${overallConvRate}%` },
              { label: 'Avg CPC', value: `$${overallCPC}` }
            ].map((m, i) => (
              <div key={i} className="card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{m.value}</div>
                <div style={{ fontSize: 13, color: 'var(--hs-text-muted)', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--hs-border)', fontWeight: 600 }}>Performance by Platform</div>
            <table className="hs-table">
              <thead>
                <tr><th>Platform</th><th>Campaigns</th><th>Total Spend</th><th>Impressions</th><th>Clicks</th><th>Conversions</th><th>CTR</th><th>Conv. Rate</th></tr>
              </thead>
              <tbody>
                {['google','facebook','linkedin'].map(p => {
                  const ads = adCampaigns.filter(a => a.platform === p);
                  const t = ads.reduce((acc, a) => ({ spent: acc.spent + a.spent, impressions: acc.impressions + a.impressions, clicks: acc.clicks + a.clicks, conversions: acc.conversions + a.conversions }), { spent: 0, impressions: 0, clicks: 0, conversions: 0 });
                  return (
                    <tr key={p}>
                      <td style={{ fontWeight: 500 }}>{platformLabel(p)}</td>
                      <td>{ads.length}</td>
                      <td>${t.spent.toLocaleString()}</td>
                      <td>{t.impressions.toLocaleString()}</td>
                      <td>{t.clicks.toLocaleString()}</td>
                      <td>{t.conversions.toLocaleString()}</td>
                      <td>{t.impressions ? ((t.clicks/t.impressions)*100).toFixed(1) : 0}%</td>
                      <td>{t.clicks ? ((t.conversions/t.clicks)*100).toFixed(1) : 0}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { name: 'Google Ads', icon: '🔍', color: '#4285F4', connected: true, accountId: 'ACC-GGL-84921', campaigns: adCampaigns.filter(a=>a.platform==='google').length },
            { name: 'Facebook Ads', icon: '📘', color: '#1877F2', connected: true, accountId: 'ACC-FB-72834', campaigns: adCampaigns.filter(a=>a.platform==='facebook').length },
            { name: 'LinkedIn Ads', icon: '💼', color: '#0A66C2', connected: true, accountId: 'ACC-LI-39281', campaigns: adCampaigns.filter(a=>a.platform==='linkedin').length }
          ].map(p => (
            <div key={p.name} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, background: p.color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{p.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--hs-text-muted)' }}>{p.accountId}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--hs-text-secondary)', marginBottom: 12 }}>{p.campaigns} campaign{p.campaigns !== 1 ? 's' : ''} connected</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-green">Connected</span>
              </div>
              <button className="btn btn-ghost" style={{ marginTop: 16, width: '100%', fontSize: 13 }}>Manage account</button>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Create ad campaign" onClose={() => setShowCreate(false)} width={440}>
          <FormField label="Campaign name" required>
            <input autoFocus value={newAd.name} onChange={e => setNewAd(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Q3 Search Campaign" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </FormField>
          <FormField label="Platform">
            <select value={newAd.platform} onChange={e => setNewAd(p => ({ ...p, platform: e.target.value }))}>
              <option value="google">Google Ads</option>
              <option value="facebook">Facebook Ads</option>
              <option value="linkedin">LinkedIn Ads</option>
            </select>
          </FormField>
          <FormField label="Budget">
            <input type="number" value={newAd.budget} onChange={e => setNewAd(p => ({ ...p, budget: e.target.value }))} placeholder="5000" min="0" />
          </FormField>
          <FormField label="Status">
            <select value={newAd.status} onChange={e => setNewAd(p => ({ ...p, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
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

// CTAs list
export function CTAsList() {
  const { state, addItem, updateItem, showToast } = useApp();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newCTA, setNewCTA] = useState({ name: '', type: 'button', status: 'draft' });
  const [editCTA, setEditCTA] = useState(null);
  const [editForm, setEditForm] = useState({});
  const PER_PAGE = 25;
  const ctas = state.ctas || [];

  const handleCreate = () => {
    if (!newCTA.name.trim()) return;
    addItem('ctas', {
      id: `cta-${Date.now()}`,
      name: newCTA.name.trim(),
      type: newCTA.type,
      status: newCTA.status,
      views: 0,
      clicks: 0,
      clickRate: 0,
      createDate: new Date().toISOString()
    });
    setShowCreate(false);
    setNewCTA({ name: '', type: 'button', status: 'draft' });
    showToast('CTA created', 'success');
  };

  const openEdit = (cta) => {
    setEditCTA(cta);
    setEditForm({ name: cta.name, type: cta.type, text: cta.text || '', url: cta.url || '', color: cta.color || '#FF7A59', status: cta.status });
  };

  const handleSaveCTA = () => {
    if (!editCTA) return;
    updateItem('ctas', editCTA.id, {
      name: editForm.name,
      type: editForm.type,
      text: editForm.text,
      url: editForm.url,
      color: editForm.color,
      status: editForm.status
    });
    showToast('CTA updated', 'success');
    setEditCTA(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left"><h1>CTAs</h1></div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create CTA</button>
        </div>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="hs-table">
          <thead>
            <tr>
              <th>CTA Name</th>
              <th>Type</th>
              <th>Views</th>
              <th>Clicks</th>
              <th>Click Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ctas.map(cta => (
              <tr key={cta.id} style={{ cursor: 'pointer' }} onClick={() => openEdit(cta)}>
                <td style={{ fontWeight: 500, color: 'var(--hs-teal)' }}>{cta.name}</td>
                <td><span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{cta.type.replace(/_/g,' ')}</span></td>
                <td>{cta.views?.toLocaleString()}</td>
                <td>{cta.clicks?.toLocaleString()}</td>
                <td>{cta.clickRate?.toFixed(2)}%</td>
                <td>{getStatusBadge(cta.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <Modal title="Create CTA" onClose={() => setShowCreate(false)} width={440}>
          <FormField label="CTA name" required>
            <input autoFocus value={newCTA.name} onChange={e => setNewCTA(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Get Started Button" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </FormField>
          <FormField label="CTA type">
            <select value={newCTA.type} onChange={e => setNewCTA(p => ({ ...p, type: e.target.value }))}>
              {['button','image','text_link','anchor'].map(t => <option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select value={newCTA.status} onChange={e => setNewCTA(p => ({ ...p, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Create</button>
          </div>
        </Modal>
      )}

      {editCTA && (
        <Modal title="Edit CTA" onClose={() => setEditCTA(null)} width={440}>
          <FormField label="CTA Name" required>
            <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="CTA Name" />
          </FormField>
          <FormField label="Type">
            <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}>
              {['button','image','text_link','anchor','popup','slide_in'].map(t => <option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
            </select>
          </FormField>
          <FormField label="Button text">
            <input value={editForm.text} onChange={e => setEditForm(p => ({ ...p, text: e.target.value }))} placeholder="e.g. Get Started" />
          </FormField>
          <FormField label="URL">
            <input value={editForm.url} onChange={e => setEditForm(p => ({ ...p, url: e.target.value }))} placeholder="/your-page" />
          </FormField>
          <FormField label="Color">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={editForm.color} onChange={e => setEditForm(p => ({ ...p, color: e.target.value }))} style={{ width: 48, height: 32, padding: 2, cursor: 'pointer' }} />
              <input value={editForm.color} onChange={e => setEditForm(p => ({ ...p, color: e.target.value }))} style={{ flex: 1 }} placeholder="#FF7A59" />
            </div>
          </FormField>
          <FormField label="Status">
            <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="published">Published</option>
            </select>
          </FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setEditCTA(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveCTA}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Landing pages list
export function LandingPagesList() {
  const { state, addItem, showToast } = useApp();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newPage, setNewPage] = useState({ name: '', slug: '', status: 'draft' });
  const pages = state.landingPages || [];

  const handleCreate = () => {
    if (!newPage.name.trim()) return;
    const slug = newPage.slug.trim() || newPage.name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const id = `lp-${Date.now()}`;
    addItem('landingPages', {
      id,
      name: newPage.name.trim(),
      slug: `/${slug}`,
      status: newPage.status,
      publishDate: newPage.status === 'published' ? new Date().toISOString() : null,
      views: 0,
      submissions: 0,
      conversionRate: 0,
      newContacts: 0,
      content: { blocks: [] }
    });
    setShowCreate(false);
    setNewPage({ name: '', slug: '', status: 'draft' });
    showToast('Landing page created', 'success');
    navigate(`/marketing/landing-pages/${id}`);
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left"><h1>Landing Pages</h1></div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create landing page</button>
        </div>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="hs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>URL</th>
              <th>Publish Date</th>
              <th>Views</th>
              <th>Submissions</th>
              <th>Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(p => (
              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/marketing/landing-pages/${p.id}`)}>
                <td style={{ fontWeight: 500, color: 'var(--hs-teal)' }}>{p.name}</td>
                <td>{getStatusBadge(p.status)}</td>
                <td style={{ fontSize: 12, color: 'var(--hs-text-muted)', fontFamily: 'monospace' }}>{p.slug}</td>
                <td style={{ color: 'var(--hs-text-secondary)' }}>{p.publishDate ? formatDate(p.publishDate) : '—'}</td>
                <td>{p.views?.toLocaleString()}</td>
                <td>{p.submissions?.toLocaleString()}</td>
                <td>{p.conversionRate?.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <Modal title="Create landing page" onClose={() => setShowCreate(false)} width={440}>
          <FormField label="Page name" required>
            <input autoFocus value={newPage.name} onChange={e => setNewPage(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Q3 Promotion Page" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </FormField>
          <FormField label="URL slug">
            <input value={newPage.slug} onChange={e => setNewPage(p => ({ ...p, slug: e.target.value }))} placeholder="e.g. q3-promotion (auto-generated if blank)" />
          </FormField>
          <FormField label="Status">
            <select value={newPage.status} onChange={e => setNewPage(p => ({ ...p, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
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

// Analytics
export function Analytics() {
  const { state } = useApp();
  const [dateRange, setDateRange] = useState('last_30_days');
  const [activeSection, setActiveSection] = useState('traffic');

  // Computed metrics from state
  const contacts = state.contacts || [];
  const emails = state.emails || [];
  const forms = state.forms || [];
  const landingPages = state.landingPages || [];
  const campaigns = state.campaigns || [];
  const socialPosts = state.socialPosts || [];

  const totalSessions = campaigns.reduce((acc, c) => acc + (c.metrics?.sessions || 0), 0);
  const totalNewContacts = campaigns.reduce((acc, c) => acc + (c.metrics?.newContacts || 0), 0);
  const totalCustomers = contacts.filter(c => c.lifecycleStage === 'customer').length;
  const totalRevenue = campaigns.reduce((acc, c) => acc + (c.metrics?.revenue || 0), 0);

  const sentEmails = emails.filter(e => e.status === 'sent' && e.stats);
  const avgOpenRate = sentEmails.length ? (sentEmails.reduce((a, e) => a + e.stats.openRate, 0) / sentEmails.length) : 0;
  const avgClickRate = sentEmails.length ? (sentEmails.reduce((a, e) => a + e.stats.clickRate, 0) / sentEmails.length) : 0;

  const totalFormViews = forms.reduce((a, f) => a + (f.views || 0), 0);
  const totalFormSubs = forms.reduce((a, f) => a + (f.submissions || 0), 0);
  const overallConvRate = totalFormViews ? ((totalFormSubs / totalFormViews) * 100) : 0;

  const sources = [
    { label: 'Organic Search', value: 4250, color: '#00A4BD' },
    { label: 'Direct', value: 2890, color: '#FF7A59' },
    { label: 'Social', value: 1820, color: '#00BDA5' },
    { label: 'Email', value: 1540, color: '#DBAE17' },
    { label: 'Referral', value: 980, color: '#516F90' },
    { label: 'Paid Search', value: 970, color: '#F2545B' },
    { label: 'Paid Social', value: 650, color: '#8C4FFF' }
  ];
  const totalSourceSessions = sources.reduce((a, s) => a + s.value, 0);
  const maxSource = Math.max(...sources.map(s => s.value));

  // Lifecycle funnel
  const lifecycleCounts = {
    subscriber: contacts.filter(c => c.lifecycleStage === 'subscriber').length,
    lead: contacts.filter(c => c.lifecycleStage === 'lead').length,
    mql: contacts.filter(c => c.lifecycleStage === 'marketing_qualified_lead').length,
    sql: contacts.filter(c => c.lifecycleStage === 'sales_qualified_lead').length,
    opportunity: contacts.filter(c => c.lifecycleStage === 'opportunity').length,
    customer: contacts.filter(c => c.lifecycleStage === 'customer').length
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left"><h1>Analytics</h1></div>
        <div className="page-header-actions">
          <select style={{ width: 'auto', padding: '8px 12px' }} value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="last_7_days">Last 7 days</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="this_month">This month</option>
            <option value="this_quarter">This quarter</option>
            <option value="last_quarter">Last quarter</option>
          </select>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeSection === 'traffic' ? 'active' : ''}`} onClick={() => setActiveSection('traffic')}>Traffic</div>
        <div className={`tab ${activeSection === 'sources' ? 'active' : ''}`} onClick={() => setActiveSection('sources')}>Sources</div>
        <div className={`tab ${activeSection === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveSection('campaigns')}>Campaigns</div>
        <div className={`tab ${activeSection === 'attribution' ? 'active' : ''}`} onClick={() => setActiveSection('attribution')}>Attribution</div>
      </div>

      {activeSection === 'traffic' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Sessions', value: totalSessions.toLocaleString(), trend: 12.4 },
              { label: 'New Contacts', value: totalNewContacts.toLocaleString(), trend: 18.5 },
              { label: 'Customers', value: totalCustomers.toString(), trend: 5.2 },
              { label: 'Overall Conv. Rate', value: `${overallConvRate.toFixed(1)}%`, trend: 2.1 }
            ].map((m, i) => (
              <div key={i} className="card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{m.value}</div>
                <div style={{ fontSize: 13, color: 'var(--hs-text-muted)', marginTop: 4 }}>{m.label}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: m.trend >= 0 ? 'var(--hs-success)' : 'var(--hs-danger)' }}>
                  {m.trend >= 0 ? '▲' : '▼'} {Math.abs(m.trend)}% vs last period
                </div>
              </div>
            ))}
          </div>

          {/* Lifecycle funnel */}
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>Contact Lifecycle Funnel</h3>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 140 }}>
              {Object.entries(lifecycleCounts).map(([key, count], i) => {
                const maxCount = Math.max(...Object.values(lifecycleCounts), 1);
                const labels = { subscriber: 'Subscriber', lead: 'Lead', mql: 'MQL', sql: 'SQL', opportunity: 'Opportunity', customer: 'Customer' };
                const colors = ['#CBD6E2', '#00A4BD', '#FF7A59', '#DBAE17', '#00BDA5', '#516F90'];
                return (
                  <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{count}</div>
                    <div style={{ width: '100%', background: colors[i], height: Math.max(8, (count / maxCount) * 100), borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} />
                    <div style={{ fontSize: 11, color: 'var(--hs-text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{labels[key]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hs-border)', fontWeight: 600, fontSize: 14 }}>Top Pages</div>
              <table className="hs-table" style={{ fontSize: 13 }}>
                <thead>
                  <tr><th>Page</th><th>Views</th><th>Submissions</th><th>New Contacts</th></tr>
                </thead>
                <tbody>
                  {landingPages.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.slug}</td>
                      <td>{p.views?.toLocaleString()}</td>
                      <td>{p.submissions?.toLocaleString()}</td>
                      <td>{p.newContacts?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 16 }}>Email Performance</h3>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>Avg Open Rate</span>
                  <span style={{ fontWeight: 600 }}>{avgOpenRate.toFixed(1)}%</span>
                </div>
                <div style={{ height: 8, background: '#EAF0F6', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${Math.min(avgOpenRate, 100)}%`, background: 'var(--hs-teal)', borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>Avg Click Rate</span>
                  <span style={{ fontWeight: 600 }}>{avgClickRate.toFixed(1)}%</span>
                </div>
                <div style={{ height: 8, background: '#EAF0F6', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${Math.min(avgClickRate * 3, 100)}%`, background: 'var(--hs-orange)', borderRadius: 4 }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>Total Emails Sent</span>
                  <span style={{ fontWeight: 600 }}>{sentEmails.reduce((a, e) => a + (e.stats?.sent || 0), 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeSection === 'sources' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>Traffic by Source</h3>
            {sources.map((s, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                    <span>{s.label}</span>
                  </div>
                  <span style={{ color: 'var(--hs-text-muted)' }}>{s.value.toLocaleString()} ({((s.value/totalSourceSessions)*100).toFixed(0)}%)</span>
                </div>
                <div style={{ height: 6, background: '#EAF0F6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(s.value / maxSource) * 100}%`, background: s.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>Source Performance</h3>
            <table className="hs-table" style={{ fontSize: 13 }}>
              <thead>
                <tr><th>Source</th><th>Sessions</th><th>Contacts</th><th>Conv. Rate</th></tr>
              </thead>
              <tbody>
                {sources.map((s, i) => {
                  const contactsPct = (s.value / totalSourceSessions * totalNewContacts).toFixed(0);
                  const convRate = (contactsPct / s.value * 100).toFixed(1);
                  return (
                    <tr key={i}>
                      <td>{s.label}</td>
                      <td>{s.value.toLocaleString()}</td>
                      <td>{contactsPct}</td>
                      <td>{convRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'campaigns' && (
        <div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--hs-border)', fontWeight: 600, fontSize: 14 }}>Campaign Analytics</div>
            <table className="hs-table">
              <thead>
                <tr><th>Campaign</th><th>Status</th><th>Sessions</th><th>New Contacts</th><th>Influenced</th><th>Deals Closed</th><th>Revenue</th><th>ROI</th></tr>
              </thead>
              <tbody>
                {campaigns.map(c => {
                  const roi = c.budget ? (((c.metrics?.revenue || 0) - c.budget) / c.budget * 100) : 0;
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500, color: 'var(--hs-teal)' }}>{c.name}</td>
                      <td>{getStatusBadge(c.status)}</td>
                      <td>{(c.metrics?.sessions || 0).toLocaleString()}</td>
                      <td>{(c.metrics?.newContacts || 0).toLocaleString()}</td>
                      <td>{(c.metrics?.influencedContacts || 0).toLocaleString()}</td>
                      <td>{c.metrics?.closedDeals || 0}</td>
                      <td>{c.metrics?.revenue ? `$${c.metrics.revenue.toLocaleString()}` : '$0'}</td>
                      <td style={{ color: roi > 0 ? 'var(--hs-success)' : roi < 0 ? 'var(--hs-danger)' : 'var(--hs-text-muted)', fontWeight: 600 }}>
                        {roi > 0 ? '+' : ''}{roi.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'attribution' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
              { label: 'Revenue per Contact', value: `$${totalNewContacts ? (totalRevenue / totalNewContacts).toFixed(0) : 0}` },
              { label: 'Total Deals Closed', value: campaigns.reduce((a, c) => a + (c.metrics?.closedDeals || 0), 0).toString() }
            ].map((m, i) => (
              <div key={i} className="card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{m.value}</div>
                <div style={{ fontSize: 13, color: 'var(--hs-text-muted)', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>Attribution by Source (First Touch)</h3>
            {(() => {
              const sourceCounts = {};
              contacts.forEach(c => {
                const src = (c.source || 'unknown').replace(/_/g, ' ');
                sourceCounts[src] = (sourceCounts[src] || 0) + 1;
              });
              const sorted = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
              const maxVal = Math.max(...sorted.map(([, v]) => v), 1);
              const attrColors = ['#FF7A59', '#00A4BD', '#00BDA5', '#DBAE17', '#516F90', '#F2545B', '#8C4FFF'];
              return sorted.map(([src, count], i) => (
                <div key={src} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize' }}>{src}</span>
                    <span style={{ fontWeight: 500 }}>{count} contacts ({((count / contacts.length) * 100).toFixed(0)}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#EAF0F6', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${(count / maxVal) * 100}%`, background: attrColors[i % attrColors.length], borderRadius: 3 }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// Settings
export function SettingsPage() {
  const { state, updateState, showToast } = useApp();
  const [activeSection, setActiveSection] = useState('general');
  const sections = ['General', 'Marketing', 'Email', 'Forms', 'Social', 'Users & Teams', 'Integrations'];

  const [generalForm, setGeneralForm] = useState({
    accountName: state.settings?.general?.accountName || '',
    timezone: state.settings?.general?.timezone || '',
    dateFormat: state.settings?.general?.dateFormat || '',
    currency: state.settings?.general?.currency || ''
  });

  const [emailForm, setEmailForm] = useState({
    defaultFromName: state.settings?.email?.defaultFromName || '',
    defaultFromEmail: state.settings?.email?.defaultFromEmail || '',
    footerInfo: state.settings?.email?.footerInfo || ''
  });

  const [marketingForm, setMarketingForm] = useState({
    utmTracking: state.settings?.marketing?.utmTracking ?? true,
    utmSource: state.settings?.marketing?.utmSource || '',
    utmMedium: state.settings?.marketing?.utmMedium || ''
  });

  const [formsForm, setFormsForm] = useState({
    thankYouMessage: state.settings?.forms?.thankYouMessage || 'Thank you for submitting the form. A member of our team will be in touch soon.',
    notificationEmails: state.settings?.forms?.notificationEmails || '',
    gdprConsent: state.settings?.forms?.gdprConsent ?? false
  });

  const [socialForm, setSocialForm] = useState({
    autoPublish: state.settings?.social?.autoPublish ?? false
  });

  const [integrationStates, setIntegrationStates] = useState(
    state.settings?.integrations || {
      salesforce: false, 'google-analytics': false, zapier: false, wordpress: false, mailchimp: false, hubdb: false
    }
  );

  const handleSaveGeneral = () => {
    updateState(prev => ({ ...prev, settings: { ...prev.settings, general: { ...generalForm } } }));
    showToast('Settings saved', 'success');
  };

  const handleSaveEmail = () => {
    updateState(prev => ({ ...prev, settings: { ...prev.settings, email: { ...emailForm } } }));
    showToast('Settings saved', 'success');
  };

  const handleSaveMarketing = () => {
    updateState(prev => ({ ...prev, settings: { ...prev.settings, marketing: { ...marketingForm } } }));
    showToast('Settings saved', 'success');
  };

  const handleSaveForms = () => {
    updateState(prev => ({ ...prev, settings: { ...prev.settings, forms: { ...formsForm } } }));
    showToast('Settings saved', 'success');
  };

  const handleSaveSocial = () => {
    updateState(prev => ({ ...prev, settings: { ...prev.settings, social: { ...socialForm } } }));
    showToast('Settings saved', 'success');
  };

  const handleToggleIntegration = (key) => {
    const next = { ...integrationStates, [key]: !integrationStates[key] };
    setIntegrationStates(next);
    updateState(prev => ({ ...prev, settings: { ...prev.settings, integrations: next } }));
    showToast(next[key] ? 'Integration connected!' : 'Integration disconnected', 'success');
  };

  const sectionKey = (s) => s.toLowerCase().replace(/ & /g,'-').replace(/ /g,'-');

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid var(--hs-border)', padding: '16px 0' }}>
        {sections.map(s => {
          const key = sectionKey(s);
          const isActive = activeSection === key;
          return (
            <div key={s} onClick={() => setActiveSection(key)}
              style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 14, background: isActive ? 'var(--hs-table-selected)' : 'transparent', color: isActive ? 'var(--hs-teal)' : 'var(--hs-text-primary)', borderLeft: isActive ? '3px solid var(--hs-teal)' : '3px solid transparent' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--hs-table-hover)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              {s}
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1, padding: 32, overflowY: 'auto', maxWidth: 640 }}>
        {activeSection === 'general' && (
          <>
            <h2 style={{ marginBottom: 24 }}>General Settings</h2>
            {[
              { label: 'Account Name', key: 'accountName', placeholder: 'Acme Corp' },
              { label: 'Timezone', key: 'timezone', placeholder: 'America/New_York' },
              { label: 'Date Format', key: 'dateFormat', placeholder: 'MM/DD/YYYY' },
              { label: 'Currency', key: 'currency', placeholder: 'USD' }
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>{f.label}</label>
                <input value={generalForm[f.key]} onChange={e => setGeneralForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
              </div>
            ))}
            <button className="btn btn-primary" onClick={handleSaveGeneral}>Save changes</button>
          </>
        )}
        {activeSection === 'email' && (
          <>
            <h2 style={{ marginBottom: 24 }}>Email Settings</h2>
            {[
              { label: 'Default From Name', key: 'defaultFromName', placeholder: 'Acme Corp Marketing' },
              { label: 'Default From Email', key: 'defaultFromEmail', placeholder: 'marketing@acmecorp.com' },
              { label: 'Footer Information', key: 'footerInfo', placeholder: 'Address, etc.' }
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>{f.label}</label>
                <input value={emailForm[f.key]} onChange={e => setEmailForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
              </div>
            ))}
            <button className="btn btn-primary" onClick={handleSaveEmail}>Save changes</button>
          </>
        )}
        {activeSection === 'marketing' && (
          <>
            <h2 style={{ marginBottom: 24 }}>Marketing Settings</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={marketingForm.utmTracking} onChange={e => setMarketingForm(p => ({ ...p, utmTracking: e.target.checked }))} />
                Enable UTM tracking on all marketing links
              </label>
            </div>
            {marketingForm.utmTracking && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Default UTM Source</label>
                  <input value={marketingForm.utmSource} onChange={e => setMarketingForm(p => ({ ...p, utmSource: e.target.value }))} placeholder="e.g. hubspot" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Default UTM Medium</label>
                  <input value={marketingForm.utmMedium} onChange={e => setMarketingForm(p => ({ ...p, utmMedium: e.target.value }))} placeholder="e.g. email" />
                </div>
              </>
            )}
            <button className="btn btn-primary" onClick={handleSaveMarketing}>Save changes</button>
          </>
        )}
        {activeSection === 'users-teams' && (
          <>
            <h2 style={{ marginBottom: 24 }}>Users &amp; Teams</h2>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="hs-table" style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.users || []).map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                      <td style={{ color: 'var(--hs-text-secondary)' }}>{u.email}</td>
                      <td><span className="badge badge-gray">{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {!['general','email','marketing','users-teams'].includes(activeSection) && (
          <div>
            {activeSection === 'forms' && (
              <>
                <h2 style={{ marginBottom: 24 }}>Forms Settings</h2>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Default thank you message</label>
                  <textarea
                    value={formsForm.thankYouMessage}
                    onChange={e => setFormsForm(p => ({ ...p, thankYouMessage: e.target.value }))}
                    style={{ minHeight: 80, resize: 'vertical', width: '100%' }}
                    placeholder="Thank you for submitting the form..."
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Notification emails</label>
                  <input
                    value={formsForm.notificationEmails}
                    onChange={e => setFormsForm(p => ({ ...p, notificationEmails: e.target.value }))}
                    placeholder="email@example.com, another@example.com"
                  />
                  <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 4 }}>Separate multiple addresses with commas</div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={formsForm.gdprConsent} onChange={e => setFormsForm(p => ({ ...p, gdprConsent: e.target.checked }))} />
                    Enable GDPR consent checkbox on all forms
                  </label>
                  <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 4, marginLeft: 24 }}>Adds a required consent checkbox to all published forms</div>
                </div>
                <button className="btn btn-primary" onClick={handleSaveForms}>Save changes</button>
              </>
            )}
            {activeSection === 'social' && (
              <>
                <h2 style={{ marginBottom: 24 }}>Social Settings</h2>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Connected Accounts</h3>
                  {[
                    { name: 'Twitter', handle: '@acmecorp', color: '#1DA1F2', icon: 'TW' },
                    { name: 'LinkedIn', handle: 'Acme Corp', color: '#0A66C2', icon: 'IN' },
                    { name: 'Facebook', handle: 'Acme Corp Official', color: '#1877F2', icon: 'FB' }
                  ].map(acc => (
                    <div key={acc.name} className="card" style={{ padding: '12px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, background: acc.color, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{acc.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{acc.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--hs-text-muted)' }}>{acc.handle}</div>
                      </div>
                      <span className="badge badge-green" style={{ fontSize: 11 }}>Connected</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={socialForm.autoPublish} onChange={e => setSocialForm(p => ({ ...p, autoPublish: e.target.checked }))} />
                    Auto-publish drafted posts at scheduled time
                  </label>
                  <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 4, marginLeft: 24 }}>When enabled, scheduled posts publish automatically without manual confirmation</div>
                </div>
                <button className="btn btn-primary" onClick={handleSaveSocial}>Save changes</button>
              </>
            )}
            {activeSection === 'integrations' && (
              <>
                <h2 style={{ marginBottom: 24 }}>Integrations</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { key: 'salesforce', name: 'Salesforce', desc: 'Sync contacts, deals, and companies with Salesforce CRM', icon: '☁️' },
                    { key: 'google-analytics', name: 'Google Analytics', desc: 'Track website traffic and conversions in Google Analytics', icon: '📊' },
                    { key: 'zapier', name: 'Zapier', desc: 'Connect HubSpot with 5,000+ apps via automated workflows', icon: '⚡' },
                    { key: 'wordpress', name: 'WordPress', desc: 'Add HubSpot forms, live chat, and analytics to your WordPress site', icon: '🌐' },
                    { key: 'mailchimp', name: 'Mailchimp', desc: 'Sync contacts and lists between HubSpot and Mailchimp', icon: '📧' },
                    { key: 'hubdb', name: 'Slack', desc: 'Receive HubSpot notifications and updates in Slack channels', icon: '💬' }
                  ].map(intg => {
                    const connected = integrationStates[intg.key];
                    return (
                      <div key={intg.key} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 24 }}>{intg.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{intg.name}</div>
                            {connected && <span className="badge badge-green" style={{ fontSize: 11 }}>Connected</span>}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--hs-text-muted)', lineHeight: 1.5, flex: 1 }}>{intg.desc}</div>
                        <button
                          className={connected ? 'btn btn-ghost' : 'btn btn-primary'}
                          style={{ fontSize: 13, padding: '6px 14px' }}
                          onClick={() => handleToggleIntegration(intg.key)}
                        >
                          {connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Dashboard reports page (just routes to main dashboard)
export function ReportsDashboard() {
  return <div style={{ padding: 24 }}>
    <h1 style={{ marginBottom: 8 }}>Dashboards</h1>
    <p style={{ color: 'var(--hs-text-muted)' }}>Use the main dashboard to view your reports.</p>
  </div>;
}

// Landing Page Editor
const MODULE_TYPES = [
  { type: 'heading', label: 'Heading', icon: 'H' },
  { type: 'text', label: 'Text', icon: '¶' },
  { type: 'image', label: 'Image', icon: '🖼' },
  { type: 'form', label: 'Form', icon: '📋' },
  { type: 'button', label: 'Button', icon: '⬛' },
  { type: 'divider', label: 'Divider', icon: '—' },
];

function BlockPreview({ block, selected, onClick, onDelete }) {
  const renderContent = () => {
    switch (block.type) {
      case 'heading': return <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#33475B' }}>{block.text || 'Heading Text'}</h2>;
      case 'text': return <p style={{ margin: 0, fontSize: 15, color: '#516F90', lineHeight: 1.6 }}>{block.text || 'Your text content goes here.'}</p>;
      case 'image': return (
        <div style={{ background: '#E0E6EE', borderRadius: 4, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C98B6', fontSize: 13 }}>
          🖼 Image Block
        </div>
      );
      case 'form': return (
        <div style={{ border: '1px dashed #CBD6E2', borderRadius: 4, padding: 16, background: '#F5F8FA' }}>
          <div style={{ fontSize: 13, color: '#7C98B6', textAlign: 'center' }}>📋 Embedded Form</div>
        </div>
      );
      case 'button': return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'var(--hs-orange)', color: '#fff', padding: '10px 28px', borderRadius: 3, fontWeight: 600, fontSize: 14 }}>
            {block.text || 'Click here'}
          </div>
        </div>
      );
      case 'divider': return <hr style={{ border: 'none', borderTop: '1px solid #CBD6E2', margin: '8px 0' }} />;
      default: return null;
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        border: `2px solid ${selected ? 'var(--hs-teal)' : 'transparent'}`,
        borderRadius: 4,
        marginBottom: 8,
        background: selected ? 'rgba(0,164,189,0.03)' : 'transparent',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {selected && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-danger)' }}
        >
          <Trash2 size={14} />
        </button>
      )}
      {renderContent()}
    </div>
  );
}

export function LandingPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateItem, showToast } = useApp();

  const page = state.landingPages?.find(p => p.id === id);

  const [blocks, setBlocks] = useState(() => page?.content?.blocks || []);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [pageName, setPageName] = useState(page?.name || 'Untitled Page');

  if (!page) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 16, color: 'var(--hs-text-muted)' }}>Page not found</div>
        <button className="btn btn-ghost" onClick={() => navigate('/marketing/landing-pages')}>← Back to landing pages</button>
      </div>
    );
  }

  const addBlock = (type) => {
    const newBlock = { id: `block-${Date.now()}`, type, text: type === 'heading' ? 'New Heading' : type === 'button' ? 'Click here' : type === 'text' ? 'Enter your text here.' : '' };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const deleteBlock = (blockId) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    setSelectedBlockId(null);
  };

  const handleSave = () => {
    updateItem('landingPages', id, { name: pageName, content: { blocks }, updatedAt: new Date().toISOString() });
    showToast('Page saved', 'success');
  };

  const handlePublish = () => {
    updateItem('landingPages', id, {
      name: pageName,
      status: 'published',
      publishedAt: new Date().toISOString(),
      publishDate: new Date().toISOString(),
      content: { blocks },
    });
    showToast('Landing page published!', 'success');
  };

  const isPublished = page.status === 'published';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid var(--hs-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/marketing/landing-pages')} style={{ padding: '6px 10px', fontSize: 13 }}>
          ← Back to landing pages
        </button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {editingName ? (
            <input
              autoFocus
              value={pageName}
              onChange={e => setPageName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => { if (['Enter', 'Escape'].includes(e.key)) setEditingName(false); }}
              style={{ fontWeight: 600, fontSize: 15, border: 'none', borderBottom: '2px solid var(--hs-teal)', outline: 'none', textAlign: 'center', minWidth: 200, padding: '2px 8px' }}
            />
          ) : (
            <span
              onClick={() => setEditingName(true)}
              style={{ fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: '2px 8px', borderRadius: 3 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hs-table-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {pageName}
            </span>
          )}
          <span style={{ marginLeft: 10, alignSelf: 'center' }}>{getStatusBadge(page.status)}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => { handleSave(); showToast('Preview saved', 'info'); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={14} /> Preview
          </button>
          <button className="btn btn-primary" onClick={handlePublish}>
            {isPublished ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Left: Module palette */}
        <div style={{ width: 220, flexShrink: 0, background: 'var(--hs-page-bg)', borderRight: '1px solid var(--hs-border)', overflowY: 'auto', padding: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Add module</div>
          {MODULE_TYPES.map(mod => (
            <div
              key={mod.type}
              onClick={() => addBlock(mod.type)}
              style={{ padding: '8px 10px', borderRadius: 3, cursor: 'pointer', background: '#fff', marginBottom: 6, border: '1px solid var(--hs-border)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hs-table-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ width: 20, textAlign: 'center', fontSize: 15 }}>{mod.icon}</span>
              {mod.label}
            </div>
          ))}
        </div>

        {/* Center: Page canvas */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#E0E6EE', padding: 32, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{ width: 720, background: '#fff', borderRadius: 4, padding: '32px 40px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', minHeight: 500 }}
            onClick={() => setSelectedBlockId(null)}
          >
            {blocks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--hs-text-muted)', fontSize: 14 }}>
                Click a module on the left to add it to your page.
              </div>
            ) : (
              blocks.map(block => (
                <BlockPreview
                  key={block.id}
                  block={block}
                  selected={selectedBlockId === block.id}
                  onClick={e => { e.stopPropagation(); setSelectedBlockId(block.id); }}
                  onDelete={() => deleteBlock(block.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Block properties */}
        <div style={{ width: 240, flexShrink: 0, background: '#fff', borderLeft: '1px solid var(--hs-border)', overflowY: 'auto' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--hs-border)', fontWeight: 600, fontSize: 13 }}>Properties</div>
          {selectedBlockId ? (
            <div style={{ padding: 16 }}>
              {['heading', 'text', 'button'].includes(blocks.find(b => b.id === selectedBlockId)?.type) && (
                <FormField label="Text">
                  <textarea
                    value={blocks.find(b => b.id === selectedBlockId)?.text || ''}
                    onChange={e => setBlocks(prev => prev.map(b => b.id === selectedBlockId ? { ...b, text: e.target.value } : b))}
                    style={{ minHeight: 80, resize: 'vertical' }}
                  />
                </FormField>
              )}
              <button className="btn btn-ghost" style={{ color: 'var(--hs-danger)', fontSize: 13, width: '100%', marginTop: 8 }} onClick={() => deleteBlock(selectedBlockId)}>
                <Trash2 size={13} /> Remove block
              </button>
            </div>
          ) : (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--hs-text-muted)' }}>Select a block to edit its properties.</div>
          )}
        </div>
      </div>
    </div>
  );
}
