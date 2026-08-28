import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Send, Zap, TrendingUp, DollarSign, Mail, Eye, MousePointer, ArrowUpRight, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';

function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function MiniLineChart({ data, color = '#007C89', height = 60, width = '100%' }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const padding = 4;
  const chartH = height - padding * 2;
  const chartW = 200;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartW;
    const y = padding + chartH - ((d.value - min) / range) * chartH;
    return `${x},${y}`;
  });
  const areaPoints = [...points, `${chartW},${height}`, `0,${height}`];
  return (
    <svg viewBox={`0 0 ${chartW} ${height}`} style={{ width, height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints.join(' ')} fill={`url(#grad-${color.replace('#','')})`} />
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AudienceGrowthChart({ data }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d.total));
  const min = Math.min(...data.map(d => d.total));
  const range = max - min || 1;
  const svgW = 600;
  const svgH = 200;
  const pad = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = svgW - pad.left - pad.right;
  const chartH = svgH - pad.top - pad.bottom;

  const points = data.map((d, i) => {
    const x = pad.left + (i / (data.length - 1)) * chartW;
    const y = pad.top + chartH - ((d.total - min) / range) * chartH;
    return { x, y, ...d };
  });

  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = [...points.map(p => `${p.x},${p.y}`), `${pad.left + chartW},${pad.top + chartH}`, `${pad.left},${pad.top + chartH}`].join(' ');

  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => Math.round(min + (range / yTicks) * i));

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 200 }}>
      <defs>
        <linearGradient id="audienceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#007C89" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#007C89" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {yLabels.map((label, i) => {
        const y = pad.top + chartH - ((label - min) / range) * chartH;
        return (
          <g key={i}>
            <line x1={pad.left} y1={y} x2={pad.left + chartW} y2={y} stroke="#E5E5E5" strokeWidth="1" />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#707070">{label.toLocaleString()}</text>
          </g>
        );
      })}
      {/* X-axis labels */}
      {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 5)) === 0 || i === points.length - 1).map((p, i) => (
        <text key={i} x={p.x} y={svgH - 8} textAnchor="middle" fontSize="10" fill="#707070">
          {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
      ))}
      <polygon points={areaPoints} fill="url(#audienceGrad)" />
      <polyline points={linePoints} fill="none" stroke="#007C89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#007C89" stroke="#fff" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const totalContacts = state.audiences[0]?.stats?.totalContacts || 0;
  const subscribedContacts = state.audiences[0]?.stats?.subscribed || 0;
  const sentCampaigns = state.campaigns.filter(c => c.status === 'sent');
  const avgOpenRate = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, c) => sum + (c.report?.openRate || 0), 0) / sentCampaigns.length
    : 0;
  const avgClickRate = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, c) => sum + (c.report?.clickRate || 0), 0) / sentCampaigns.length
    : 0;
  const activeAutomations = state.automations.filter(a => a.status === 'active');
  const totalAutoEmails = activeAutomations.reduce((sum, a) => sum + (a.stats?.emailsSent || 0), 0);
  const totalEmailsSent = sentCampaigns.reduce((sum, c) => sum + (c.report?.sent || 0), 0) + totalAutoEmails;
  const totalRevenue = state.ecommerce?.totalRevenue || 0;

  const recentCampaigns = [...state.campaigns]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const growthData = state.audiences[0]?.growthHistory || [];
  const growthDelta = growthData.length >= 2 ? growthData[growthData.length - 1].total - growthData[0].total : 0;

  // Email sends mini chart data
  const emailSendsData = sentCampaigns
    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
    .map(c => ({ value: c.report?.sent || 0, label: c.name }));

  // Revenue mini chart data
  const revenueData = (state.ecommerce?.revenueByMonth || []).map(r => ({ value: r.revenue, label: r.month }));

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 24, padding: '28px 32px', background: '#241C15', borderRadius: 12, color: '#fff' }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, fontFamily: '"Georgia", "Times New Roman", serif' }}>{greeting}, {state.user.firstName}</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Here is what is happening with your audience and campaigns.</p>
        <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
          <div style={{ background: 'rgba(255,224,27,0.15)', borderRadius: 8, padding: '12px 20px', flex: 1 }}>
            <div style={{ fontSize: 12, color: '#FFE01B', fontWeight: 500, marginBottom: 2 }}>PLAN</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{state.user.plan}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
              {state.user.emailsSentThisMonth?.toLocaleString()} / {state.user.monthlyEmailLimit?.toLocaleString()} emails
            </div>
          </div>
          <div style={{ background: 'rgba(255,224,27,0.15)', borderRadius: 8, padding: '12px 20px', flex: 1 }}>
            <div style={{ fontSize: 12, color: '#FFE01B', fontWeight: 500, marginBottom: 2 }}>AUDIENCE</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{totalContacts.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
              {subscribedContacts.toLocaleString()} subscribed
            </div>
          </div>
          <div style={{ background: 'rgba(255,224,27,0.15)', borderRadius: 8, padding: '12px 20px', flex: 1 }}>
            <div style={{ fontSize: 12, color: '#FFE01B', fontWeight: 500, marginBottom: 2 }}>THIS MONTH</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>${(state.ecommerce?.revenueThisMonth || 0).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
              tracked revenue
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/audience')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label"><Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Total Contacts</div>
              <div className="stat-value">{totalContacts.toLocaleString()}</div>
              <div className="stat-trend up">+{growthDelta} last 90 days</div>
            </div>
            <ArrowUpRight size={16} style={{ color: '#707070' }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <MiniLineChart data={growthData.map(d => ({ value: d.total }))} />
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/campaigns')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label"><Send size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Emails Sent</div>
              <div className="stat-value">{totalEmailsSent.toLocaleString()}</div>
              <div className="stat-sub">{sentCampaigns.length} campaigns &middot; Avg open: {(avgOpenRate * 100).toFixed(1)}%</div>
            </div>
            <ArrowUpRight size={16} style={{ color: '#707070' }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <MiniLineChart data={emailSendsData} color="#1565C0" />
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/analytics')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label"><DollarSign size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Revenue Tracked</div>
              <div className="stat-value">${totalRevenue.toLocaleString()}</div>
              <div className="stat-trend up"><TrendingUp size={12} /> +{((state.ecommerce?.revenueThisMonth / (state.ecommerce?.revenueLastMonth || 1) - 1) * 100).toFixed(0)}% vs last month</div>
            </div>
            <ArrowUpRight size={16} style={{ color: '#707070' }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <MiniLineChart data={revenueData} color="#2E7D32" />
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/automations')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label"><Zap size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Active Automations</div>
              <div className="stat-value">{activeAutomations.length}</div>
              <div className="stat-sub">{totalAutoEmails.toLocaleString()} emails sent total</div>
            </div>
            <ArrowUpRight size={16} style={{ color: '#707070' }} />
          </div>
        </div>
      </div>

      {/* Audience Growth */}
      <div className="card mb-24">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Audience Growth</h3>
          <button className="btn btn-sm btn-outlined" onClick={() => navigate('/audience')}>View All</button>
        </div>
        <AudienceGrowthChart data={growthData} />
      </div>

      {/* Recent Campaigns */}
      <div className="two-columns-65-35">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Recent Campaigns</h3>
            <button className="btn btn-sm btn-outlined" onClick={() => navigate('/campaigns')}>View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Open Rate</th>
                <th>Click Rate</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {recentCampaigns.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(c.status === 'sent' ? `/campaigns/${c.id}/report` : `/campaigns/${c.id}`)}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td>{c.sentAt ? formatRelativeDate(c.sentAt) : '--'}</td>
                  <td>
                    {c.report ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 36, height: 5, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${c.report.openRate * 100}%`, height: '100%', background: '#007C89', borderRadius: 3 }} />
                        </div>
                        <span className="text-sm">{(c.report.openRate * 100).toFixed(1)}%</span>
                      </div>
                    ) : '--'}
                  </td>
                  <td>
                    {c.report ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 36, height: 5, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(c.report.clickRate * 100 * 3, 100)}%`, height: '100%', background: '#007C89', borderRadius: 3 }} />
                        </div>
                        <span className="text-sm">{(c.report.clickRate * 100).toFixed(1)}%</span>
                      </div>
                    ) : '--'}
                  </td>
                  <td style={{ fontWeight: 500 }}>{c.report?.revenue ? `$${c.report.revenue.toLocaleString()}` : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          {/* Email Performance Summary */}
          <div className="card mb-16">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Email Performance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: 12, background: '#F6F6F4', borderRadius: 8 }}>
                <Eye size={18} style={{ color: '#007C89', marginBottom: 4 }} />
                <div style={{ fontSize: 20, fontWeight: 700 }}>{(avgOpenRate * 100).toFixed(1)}%</div>
                <div className="text-xs text-muted">Avg Open Rate</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: '#F6F6F4', borderRadius: 8 }}>
                <MousePointer size={18} style={{ color: '#007C89', marginBottom: 4 }} />
                <div style={{ fontSize: 20, fontWeight: 700 }}>{(avgClickRate * 100).toFixed(1)}%</div>
                <div className="text-xs text-muted">Avg Click Rate</div>
              </div>
            </div>
            <div style={{ marginTop: 12, padding: '8px 0', borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span className="text-muted">Industry avg open rate</span>
              <span style={{ fontWeight: 500 }}>21.3%</span>
            </div>
            <div style={{ padding: '8px 0', borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span className="text-muted">Industry avg click rate</span>
              <span style={{ fontWeight: 500 }}>2.6%</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="quick-action-btn" style={{ textAlign: 'left', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => navigate('/campaigns/new')}>
                <Send size={16} /> Create Campaign
              </button>
              <button className="quick-action-btn" style={{ textAlign: 'left', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => navigate('/audience')}>
                <Users size={16} /> View Audience
              </button>
              <button className="quick-action-btn" style={{ textAlign: 'left', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => navigate('/analytics')}>
                <BarChart3 size={16} /> Check Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
