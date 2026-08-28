import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Scale, BookOpen, FileText, Gavel, ScrollText, Clock, Sparkles } from 'lucide-react';

export default function Home() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [jurisdiction, setJurisdiction] = useState('All Federal');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    dispatch({ type: 'SEARCH', payload: { query: query.trim() } });
    navigate('/search');
  };

  const recentHistory = (state.history || []).slice(0, 5);
  const recentDocs = (state.history || [])
    .filter(h => h.type === 'document')
    .slice(0, 4);

  const contentTypes = [
    { icon: <Scale size={18} />, label: 'Cases', count: (state.cases || []).length },
    { icon: <ScrollText size={18} />, label: 'Statutes & Court Rules', count: (state.statutes || []).length },
    { icon: <BookOpen size={18} />, label: 'Secondary Sources', count: 0 },
    { icon: <FileText size={18} />, label: 'Regulations', count: 0 },
    { icon: <Gavel size={18} />, label: 'Briefs', count: 0 },
    { icon: <FileText size={18} />, label: 'Trial Court Orders', count: 0 }
  ];

  const allDocs = [...(state.cases || []), ...(state.statutes || [])];

  return (
    <div className="home-page">
      <div className="home-quickaccess">
        <button className="home-quickaccess-btn" onClick={() => navigate('/folders')}>My Folders</button>
        <button className="home-quickaccess-btn" onClick={() => navigate('/history')}>Recent History</button>
        <button className="home-quickaccess-btn">KeyCite Alerts</button>
        <button className="home-quickaccess-btn">WestClip</button>
      </div>

      <div className="home-tab-bar">
        <button
          className={`home-tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Sparkles size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
          AI-Assisted Research
        </button>
        <button
          className={`home-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
        <button
          className={`home-tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse
        </button>
      </div>

      {activeTab === 'ai' && (
        <div className="ai-tab-content">
          <h2 className="ai-welcome-heading">AI-Assisted Research</h2>
          <p className="ai-welcome-desc">
            Ask questions in natural language and get AI-powered answers with citations to primary and secondary sources.
          </p>
          <div className="ai-cards-row">
            <div className="ai-card">
              <h3>Ask a Legal Question</h3>
              <p>Get answers synthesized from cases, statutes, and secondary sources with full citations.</p>
            </div>
            <div className="ai-card">
              <h3>Analyze Documents</h3>
              <p>Upload briefs or contracts for AI-powered analysis, issue spotting, and research suggestions.</p>
            </div>
          </div>
          <div className="ai-search-area">
            <h3>Ask Xestlaw AI</h3>
            <div className="ai-jurisdiction-row">
              <span>Jurisdiction:</span>
              <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}>
                <option>All Federal</option>
                <option>All State</option>
                <option>Federal - Supreme Court</option>
                <option>Federal - Circuit Courts</option>
              </select>
            </div>
            <textarea
              className="ai-textarea"
              placeholder="Ask a legal question, e.g., 'What are the elements of a Section 1983 claim?'"
            />
            <button className="btn-primary" onClick={() => {
              const textarea = document.querySelector('.ai-textarea');
              const q = textarea?.value?.trim();
              if (!q) return;
              dispatch({ type: 'SEARCH', payload: { query: q } });
              navigate('/search');
            }}>
              <Sparkles size={14} /> Ask Question
            </button>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="precision-search-section">
          <form onSubmit={handleSearch}>
            <div className="precision-search-bar-row">
              <input
                className="precision-search-input"
                type="text"
                placeholder="Enter search terms, citations, or party names..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <select className="precision-jurisdiction-select" value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}>
                <option>All Federal</option>
                <option>All State</option>
                <option>Supreme Court</option>
                <option>Circuit Courts</option>
              </select>
              <button type="submit" className="precision-search-btn">
                <Search size={16} /> Search
              </button>
            </div>
          </form>

          <div className="content-type-quick-btns" style={{ marginBottom: 32 }}>
            {contentTypes.map(ct => (
              <button key={ct.label} className="content-type-quick-btn" onClick={() => {
                dispatch({ type: 'SET_FILTERS', payload: { contentType: ct.label === 'Cases' ? 'case' : ct.label === 'Statutes & Court Rules' ? 'statute' : 'All' } });
              }}>
                {ct.icon}
                <span style={{ marginLeft: 6 }}>{ct.label}</span>
                {ct.count > 0 && <span style={{ color: '#8A94A6', marginLeft: 4 }}>({ct.count})</span>}
              </button>
            ))}
          </div>

          {recentHistory.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 className="browse-heading"><Clock size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Recent Searches</h3>
              {recentHistory.filter(h => h.type === 'search').slice(0, 5).map(h => (
                <div key={h.id} style={{ padding: '6px 0', borderBottom: '1px solid #E8ECF0' }}>
                  <a
                    style={{ color: '#1A73BA', cursor: 'pointer', fontSize: 14 }}
                    onClick={() => {
                      dispatch({ type: 'SEARCH', payload: { query: h.query } });
                      navigate('/search');
                    }}
                  >
                    {h.query}
                  </a>
                  <span style={{ color: '#8A94A6', fontSize: 12, marginLeft: 10 }}>{h.resultCount} results</span>
                </div>
              ))}
            </div>
          )}

          {recentDocs.length > 0 && (
            <div>
              <h3 className="browse-heading"><FileText size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Recent Documents</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {recentDocs.map(h => {
                  const doc = allDocs.find(d => d.id === h.documentId);
                  return (
                    <div key={h.id} style={{ border: '1px solid #D9DDE3', borderRadius: 2, padding: 12 }}>
                      <Link
                        to={doc?.type === 'statute' ? `/statute/${h.documentId}` : `/document/${h.documentId}`}
                        style={{ fontSize: 14, fontWeight: 600, color: '#1A73BA' }}
                      >
                        {h.title || doc?.title}
                      </Link>
                      {doc && <div style={{ fontSize: 12, color: '#5A6577', marginTop: 4 }}>{doc.citation}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'browse' && (
        <div>
          <h3 className="browse-heading">Content Types</h3>
          <div className="content-types-grid">
            {contentTypes.map(ct => (
              <div key={ct.label} className="content-type-card" onClick={() => {
                dispatch({ type: 'SEARCH', payload: { query: '' } });
                navigate('/search');
              }}>
                {ct.icon}
                {ct.label}
              </div>
            ))}
          </div>

          <h3 className="browse-heading">Browse by Topic</h3>
          <div className="browse-grid">
            {['Constitutional Law', 'Criminal Law', 'Civil Procedure', 'Contract Law', 'Tort Law', 'Property Law', 'Administrative Law', 'Tax Law'].map(topic => (
              <a key={topic} className="browse-link" onClick={() => {
                dispatch({ type: 'SEARCH', payload: { query: topic } });
                navigate('/search');
              }}>
                {topic}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
