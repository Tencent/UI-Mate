import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './CampaignDetailPage.css';

function formatCurrency(n) {
  return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatNum(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function CampaignDetailPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();

  const campaign = state.campaigns.find(c => c.id === campaignId);
  if (!campaign) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Campaign not found. <button className="link-btn" onClick={() => navigate('/campaigns')}>Back to campaigns</button>
      </div>
    );
  }

  const adSets = state.adSets.filter(a => a.campaignId === campaignId);
  const adSetIds = adSets.map(a => a.id);
  const ads = state.ads.filter(a => adSetIds.includes(a.adSetId));

  const statusColor = {
    active: '#31A24C',
    paused: '#65676B',
    draft: '#8A8D91',
    completed: '#65676B',
    error: '#FA383E',
    in_review: '#0866FF',
    not_delivering: '#65676B',
  };

  return (
    <div className="detail-page">
      <div className="detail-breadcrumb">
        <button className="back-btn" onClick={() => navigate('/campaigns')}>
          <ArrowLeft size={16} />
          Campaigns
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{campaign.name}</span>
      </div>

      <div className="detail-header">
        <div className="detail-title">{campaign.name}</div>
        <div className="detail-badges">
          <span className="detail-status-badge" style={{ color: statusColor[campaign.deliveryStatus] || '#65676B' }}>
            ● {campaign.deliveryStatus.replace(/_/g, ' ')}
          </span>
          <span className="detail-obj-badge">{campaign.objective.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="detail-metrics">
        {[
          { label: 'Amount Spent', value: formatCurrency(campaign.amountSpent) },
          { label: 'Results', value: formatNum(campaign.results) },
          { label: 'Reach', value: formatNum(campaign.reach) },
          { label: 'Impressions', value: formatNum(campaign.impressions) },
          { label: 'Cost per Result', value: campaign.costPerResult ? formatCurrency(campaign.costPerResult) : '—' },
          { label: 'ROAS', value: campaign.roas ? campaign.roas.toFixed(2) + 'x' : '—' },
        ].map(m => (
          <div key={m.label} className="detail-metric-card">
            <div className="detail-metric-label">{m.label}</div>
            <div className="detail-metric-value">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Ad Sets */}
      <div className="detail-section">
        <div className="detail-section-title">Ad Sets ({adSets.length})</div>
        <table className="data-table-basic">
          <thead>
            <tr>
              <th>Ad Set Name</th>
              <th>Status</th>
              <th>Budget</th>
              <th style={{ textAlign: 'right' }}>Results</th>
              <th style={{ textAlign: 'right' }}>Reach</th>
              <th style={{ textAlign: 'right' }}>Amount Spent</th>
            </tr>
          </thead>
          <tbody>
            {adSets.map(as => (
              <tr key={as.id}>
                <td style={{ fontWeight: 500 }}>{as.name}</td>
                <td style={{ textTransform: 'capitalize', color: statusColor[as.status] }}>{as.status}</td>
                <td>{as.dailyBudget ? formatCurrency(as.dailyBudget) + '/day' : as.lifetimeBudget ? formatCurrency(as.lifetimeBudget) + ' lifetime' : '—'}</td>
                <td style={{ textAlign: 'right' }}>{formatNum(as.results)}</td>
                <td style={{ textAlign: 'right' }}>{formatNum(as.reach)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(as.amountSpent)}</td>
              </tr>
            ))}
            {adSets.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>No ad sets</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ads */}
      <div className="detail-section">
        <div className="detail-section-title">Ads ({ads.length})</div>
        <table className="data-table-basic">
          <thead>
            <tr>
              <th>Ad Name</th>
              <th>Ad Set</th>
              <th>Review</th>
              <th style={{ textAlign: 'right' }}>Results</th>
              <th style={{ textAlign: 'right' }}>Reach</th>
              <th style={{ textAlign: 'right' }}>Amount Spent</th>
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => {
              const adSet = adSets.find(a => a.id === ad.adSetId);
              const reviewMap = {
                approved: { label: 'Approved', bg: '#E6F4EA', color: '#31A24C' },
                pending: { label: 'In Review', bg: '#FFF9E6', color: '#F7B928' },
                rejected: { label: 'Rejected', bg: '#FFF0F0', color: '#FA383E' },
              };
              const rev = reviewMap[ad.reviewStatus] || reviewMap['pending'];
              return (
                <tr key={ad.id}>
                  <td style={{ fontWeight: 500 }}>{ad.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{adSet?.name || '—'}</td>
                  <td><span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: rev.bg, color: rev.color, fontSize: 11, fontWeight: 600 }}>{rev.label}</span></td>
                  <td style={{ textAlign: 'right' }}>{formatNum(ad.results)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNum(ad.reach)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(ad.amountSpent)}</td>
                </tr>
              );
            })}
            {ads.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>No ads</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
