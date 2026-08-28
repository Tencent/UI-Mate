import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, FileText, BookOpen, Clock, Trash2, List, GitBranch } from 'lucide-react';

export default function History() {
  const { state } = useApp();
  const [viewMode, setViewMode] = useState('list');
  const [filterType, setFilterType] = useState('all');

  const history = state.history || [];

  const filtered = filterType === 'all'
    ? history
    : history.filter(h => h.type === filterType);

  const getIcon = (type) => {
    switch (type) {
      case 'search': return <Search size={16} />;
      case 'document': return <FileText size={16} />;
      case 'keycite': return <BookOpen size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getLink = (item) => {
    if (item.type === 'search') return `/search`;
    if (item.type === 'document') {
      const doc = [...(state.cases || []), ...(state.statutes || [])].find(d => d.id === item.documentId);
      if (doc?.type === 'statute') return `/statute/${item.documentId}`;
      return `/document/${item.documentId}`;
    }
    if (item.type === 'keycite') return `/keycite/${item.documentId}`;
    return '/';
  };

  const getDescription = (item) => {
    if (item.type === 'search') return `Search: "${item.query}" - ${item.resultCount} results`;
    if (item.type === 'document') return `Viewed: ${item.title}`;
    if (item.type === 'keycite') return `KeyCite: ${item.title}`;
    return item.title || 'Activity';
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString();
  };

  const formatDay = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Group by day for timeline view
  const groupedByDay = {};
  filtered.forEach(item => {
    const day = formatDay(item.timestamp);
    if (!groupedByDay[day]) groupedByDay[day] = [];
    groupedByDay[day].push(item);
  });

  return (
    <div className="history-page">
      <div className="history-page-header">
        <h1 className="history-page-title">Research History</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            className="sort-select"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">All Activity</option>
            <option value="search">Searches</option>
            <option value="document">Documents</option>
            <option value="keycite">KeyCite</option>
          </select>
          <div className="history-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List size={14} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
              title="Timeline view"
            >
              <GitBranch size={14} />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="no-results">
          <h3>No history yet</h3>
          <p>Your research activity will appear here.</p>
        </div>
      )}

      {viewMode === 'list' && filtered.map(item => (
        <Link key={item.id} to={getLink(item)} className="history-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="history-item-icon">{getIcon(item.type)}</div>
          <div className="history-item-body">
            <div className="history-item-title">{getDescription(item)}</div>
            <div className="history-item-meta">
              {item.type === 'search' && `${item.resultCount} results`}
              {item.type !== 'search' && item.documentId && (
                <span>Document ID: {item.documentId}</span>
              )}
            </div>
          </div>
          <div className="history-item-time">{formatTime(item.timestamp)}</div>
        </Link>
      ))}

      {viewMode === 'timeline' && Object.entries(groupedByDay).map(([day, items]) => (
        <div key={day} className="timeline-day-group">
          <div className="timeline-day-label">{day}</div>
          <div className="timeline-entries">
            {items.map(item => (
              <Link key={item.id} to={getLink(item)} className="timeline-entry" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="timeline-entry-title">{getDescription(item)}</div>
                <div className="timeline-entry-meta">
                  {new Date(item.timestamp).toLocaleTimeString()} | {item.type}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
