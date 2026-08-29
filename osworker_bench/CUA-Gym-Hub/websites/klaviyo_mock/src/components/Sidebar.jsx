import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const CampaignIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const FlowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>
);
const FormIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
);
const AudienceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
);
const ContentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { state } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    audience: location.pathname.startsWith('/audience'),
    content: location.pathname.startsWith('/content'),
    analytics: location.pathname.startsWith('/analytics')
  });

  const query = searchParams.toString();
  const appendQuery = (path) => query ? `${path}?${query}` : path;
  const isActive = (path) => location.pathname === path;
  const isActivePrefix = (prefix) => location.pathname.startsWith(prefix);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const nav = (path) => {
    navigate(appendQuery(path));
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchResults = normalizedSearch.length > 1 ? [
    ...state.campaigns.filter(c => c.name.toLowerCase().includes(normalizedSearch) || (c.subject || '').toLowerCase().includes(normalizedSearch)).slice(0, 3).map(c => ({ label: c.name, meta: 'Campaign', path: `/campaigns/${c.id}` })),
    ...state.flows.filter(f => f.name.toLowerCase().includes(normalizedSearch)).slice(0, 3).map(f => ({ label: f.name, meta: 'Flow', path: `/flows/${f.id}` })),
    ...state.profiles.filter(p => `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(normalizedSearch)).slice(0, 3).map(p => ({ label: p.email, meta: 'Profile', path: `/audience/profiles/${p.id}` })),
    ...state.templates.filter(t => t.name.toLowerCase().includes(normalizedSearch)).slice(0, 2).map(t => ({ label: t.name, meta: 'Template', path: '/content/templates' }))
  ].slice(0, 8) : [];

  const openSearchResult = (path) => {
    setSearchQuery('');
    nav(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-k">K</span>laviyo<sup style={{ color: 'var(--accent-green)' }}></sup>
      </div>

      <div className="sidebar-search">
        <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        {normalizedSearch.length > 1 && (
          <div style={{ position: 'absolute', left: 12, right: 12, top: 46, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: '0 12px 30px rgba(0,0,0,0.35)', zIndex: 20, overflow: 'hidden' }}>
            {searchResults.length > 0 ? searchResults.map(result => (
              <button key={`${result.meta}-${result.label}`} onClick={() => openSearchResult(result.path)} style={{ display: 'block', width: '100%', padding: '10px 12px', textAlign: 'left', background: 'transparent', border: 0, borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{result.meta}</div>
              </button>
            )) : (
              <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: 13 }}>No results</div>
            )}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className={`nav-item ${isActive('/') ? 'active' : ''}`} onClick={() => nav('/')}>
          <span className="nav-icon"><HomeIcon /></span>
          Home
        </div>

        <div className={`nav-item ${isActivePrefix('/campaigns') ? 'active' : ''}`} onClick={() => nav('/campaigns')}>
          <span className="nav-icon"><CampaignIcon /></span>
          Campaigns
        </div>

        <div className={`nav-item ${isActivePrefix('/flows') ? 'active' : ''}`} onClick={() => nav('/flows')}>
          <span className="nav-icon"><FlowIcon /></span>
          Flows
        </div>

        <div className={`nav-item ${isActivePrefix('/signup-forms') ? 'active' : ''}`} onClick={() => nav('/signup-forms')}>
          <span className="nav-icon"><FormIcon /></span>
          Sign-up forms
        </div>

        {/* Audience section */}
        <div
          className={`nav-section-header ${isActivePrefix('/audience') ? 'active' : ''}`}
          onClick={() => toggleSection('audience')}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="nav-icon"><AudienceIcon /></span>
            Audience
          </div>
          <span className={`chevron ${expandedSections.audience ? 'open' : ''}`}><ChevronRight /></span>
        </div>
        {expandedSections.audience && (
          <>
            <div className={`nav-sub-item ${isActive('/audience/lists-segments') ? 'active' : ''}`} onClick={() => nav('/audience/lists-segments')}>
              Lists & segments
            </div>
            <div className={`nav-sub-item ${isActivePrefix('/audience/profiles') ? 'active' : ''}`} onClick={() => nav('/audience/profiles')}>
              Profiles
            </div>
          </>
        )}

        {/* Content section */}
        <div
          className={`nav-section-header ${isActivePrefix('/content') ? 'active' : ''}`}
          onClick={() => toggleSection('content')}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="nav-icon"><ContentIcon /></span>
            Content
          </div>
          <span className={`chevron ${expandedSections.content ? 'open' : ''}`}><ChevronRight /></span>
        </div>
        {expandedSections.content && (
          <>
            <div className={`nav-sub-item ${isActive('/content/templates') ? 'active' : ''}`} onClick={() => nav('/content/templates')}>
              Templates
            </div>
            <div className={`nav-sub-item ${isActive('/content/brand') ? 'active' : ''}`} onClick={() => nav('/content/brand')}>
              Images & Brand
            </div>
          </>
        )}

        {/* Analytics section */}
        <div
          className={`nav-section-header ${isActivePrefix('/analytics') ? 'active' : ''}`}
          onClick={() => toggleSection('analytics')}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="nav-icon"><AnalyticsIcon /></span>
            Analytics
          </div>
          <span className={`chevron ${expandedSections.analytics ? 'open' : ''}`}><ChevronRight /></span>
        </div>
        {expandedSections.analytics && (
          <>
            <div className={`nav-sub-item ${isActive('/analytics/dashboards') ? 'active' : ''}`} onClick={() => nav('/analytics/dashboards')}>
              Dashboards
            </div>
            <div className={`nav-sub-item ${isActive('/analytics/metrics') ? 'active' : ''}`} onClick={() => nav('/analytics/metrics')}>
              Metrics
            </div>
            <div className={`nav-sub-item ${isActive('/analytics/benchmarks') ? 'active' : ''}`} onClick={() => nav('/analytics/benchmarks')}>
              Benchmarks
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-account">
        <div className="account-avatar">
          {state.account.user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="account-info">
          <div className="account-name">{state.account.companyName}</div>
          <div className="account-email">{state.account.user.email}</div>
        </div>
      </div>
    </div>
  );
}
