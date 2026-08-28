import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Flag, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

function KeyCiteFlag({ flag }) {
  if (!flag) return null;
  const colors = { red: '#CC0000', yellow: '#F0AD00', orange: '#E8600A', green: '#2E8B57', blue: '#3B82C4' };
  return (
    <span className={`keycite-flag flag-${flag}`} title={`KeyCite: ${flag}`}>
      <Flag size={14} fill={colors[flag]} color={colors[flag]} />
    </span>
  );
}

export default function SearchResults() {
  const { state, dispatch } = useApp();
  const [sortBy, setSortBy] = useState('relevance');
  const [expandedSynopsis, setExpandedSynopsis] = useState({});
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [page, setPage] = useState(1);
  const [activeContentType, setActiveContentType] = useState('All');

  const allDocs = [...(state.cases || []), ...(state.statutes || [])];
  const query = state.searchQuery || '';

  // If no search performed, show all docs
  const baseResults = (state.searchResults && state.searchResults.length > 0) ? state.searchResults : (query ? [] : allDocs);

  // Filter by content type
  const filteredResults = useMemo(() => {
    let results = baseResults;
    if (activeContentType === 'Cases') results = results.filter(r => r.type === 'case');
    else if (activeContentType === 'Statutes') results = results.filter(r => r.type === 'statute');
    return results;
  }, [baseResults, activeContentType]);

  // Sort
  const sortedResults = useMemo(() => {
    const arr = [...filteredResults];
    if (sortBy === 'date') arr.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    else if (sortBy === 'title') arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  }, [filteredResults, sortBy]);

  const totalPages = Math.ceil(sortedResults.length / ITEMS_PER_PAGE);
  const pagedResults = sortedResults.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const casesCount = baseResults.filter(r => r.type === 'case').length;
  const statutesCount = baseResults.filter(r => r.type === 'statute').length;

  const contentTypes = [
    { label: 'All', count: baseResults.length },
    { label: 'Cases', count: casesCount },
    { label: 'Statutes', count: statutesCount }
  ];

  const toggleSelect = (id) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedItems(next);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === pagedResults.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(pagedResults.map(r => r.id)));
    }
  };

  // Jurisdiction filter options
  const jurisdictions = ['All', 'Federal', 'State'];
  const courts = ['All', 'Supreme Court', 'Circuit Courts', 'District Courts'];

  return (
    <div className="search-results-layout">
      <aside className="search-results-sidebar">
        <div className="search-sidebar-section">
          <div className="search-sidebar-heading">Content Type</div>
          {contentTypes.map(ct => (
            <div
              key={ct.label}
              className={`content-type-item ${activeContentType === ct.label ? 'active' : ''}`}
              onClick={() => { setActiveContentType(ct.label); setPage(1); }}
            >
              <span>{ct.label}</span>
              <span className="content-type-count">{ct.count}</span>
            </div>
          ))}
        </div>

        <div className="search-sidebar-section">
          <div className="search-sidebar-heading">Jurisdiction</div>
          {jurisdictions.map(j => (
            <div
              key={j}
              className={`content-type-item ${state.filters?.jurisdiction === j ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_FILTERS', payload: { jurisdiction: j } })}
            >
              <span>{j}</span>
            </div>
          ))}
        </div>

        <div className="search-sidebar-section">
          <div className="search-sidebar-heading">Court</div>
          {courts.map(c => (
            <div
              key={c}
              className={`content-type-item ${state.filters?.court === c ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_FILTERS', payload: { court: c } })}
            >
              <span>{c}</span>
            </div>
          ))}
        </div>

        <div className="search-sidebar-section">
          <div className="search-sidebar-heading">Date</div>
          <div className="filter-date-row">
            <input type="text" className="filter-date-input" placeholder="From" />
            <span style={{ color: '#8A94A6', fontSize: 12 }}>to</span>
            <input type="text" className="filter-date-input" placeholder="To" />
            <button className="filter-date-apply">Go</button>
          </div>
        </div>
      </aside>

      <div className="search-results-main">
        <h1 className="search-results-title">
          {query ? `Results for "${query}"` : 'All Documents'}
        </h1>

        <div className="results-toolbar">
          <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="relevance">Sort by Relevance</option>
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
          <span className="results-count-text">
            {sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="select-all-row">
          <input
            type="checkbox"
            checked={selectedItems.size === pagedResults.length && pagedResults.length > 0}
            onChange={toggleSelectAll}
          />
          <label onClick={toggleSelectAll}>Select All</label>
        </div>

        {pagedResults.length === 0 && (
          <div className="no-results">
            <h3>No results found</h3>
            <p>Try adjusting your search terms or filters.</p>
          </div>
        )}

        {pagedResults.map((doc, idx) => {
          const globalIdx = (page - 1) * ITEMS_PER_PAGE + idx + 1;
          const isCase = doc.type === 'case';
          const docPath = isCase ? `/document/${doc.id}` : `/statute/${doc.id}`;

          return (
            <div key={doc.id} className={`result-item ${selectedItems.has(doc.id) ? 'selected-row' : ''}`}>
              <input
                type="checkbox"
                className="result-item-checkbox"
                checked={selectedItems.has(doc.id)}
                onChange={() => toggleSelect(doc.id)}
              />
              <div className="result-item-body">
                <div className="result-item-header">
                  <span className="result-number">{globalIdx}.</span>
                  {isCase && <KeyCiteFlag flag={doc.keyciteFlag} />}
                  <Link to={docPath} className="result-title" onClick={() => {
                    dispatch({ type: 'ADD_HISTORY', payload: { type: 'document', documentId: doc.id, title: doc.title } });
                  }}>
                    {doc.title}
                  </Link>
                </div>
                <div className="result-metadata">
                  {doc.citation} | {isCase ? doc.court : doc.jurisdiction} | {doc.date || doc.effectiveDate}
                </div>
                {doc.topics && (
                  <div className="result-topics">
                    Topics: {doc.topics.join(', ')}
                  </div>
                )}
                <div className="result-snippet">
                  {(doc.synopsis || doc.text || '').substring(0, 200)}...
                </div>
                {(doc.synopsis || doc.text) && (
                  <>
                    <button
                      className="result-synopsis-toggle"
                      onClick={() => setExpandedSynopsis(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                    >
                      {expandedSynopsis[doc.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expandedSynopsis[doc.id] ? 'Hide synopsis' : 'Show full synopsis'}
                    </button>
                    {expandedSynopsis[doc.id] && (
                      <div className="result-synopsis-full">
                        {doc.synopsis || doc.text}
                      </div>
                    )}
                  </>
                )}
                {isCase && (
                  <div style={{ marginTop: 6 }}>
                    <Link to={`/keycite/${doc.id}`} style={{ fontSize: 12, color: '#1A73BA' }}>
                      KeyCite
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
