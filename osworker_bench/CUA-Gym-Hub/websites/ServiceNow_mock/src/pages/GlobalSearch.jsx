import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function GlobalSearch() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';
  const qParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(qParam);

  const results = useMemo(() => {
    const q = (qParam || query).toLowerCase();
    if (!q) return null;

    const match = (record, fields) => fields.some(f => String(record[f] || '').toLowerCase().includes(q));

    const incidents = state.incidents.filter(i => match(i, ['number', 'short_description', 'description']));
    const changes = state.changeRequests.filter(c => match(c, ['number', 'short_description', 'description']));
    const problems = state.problems.filter(p => match(p, ['number', 'short_description', 'description']));
    const articles = state.kbArticles.filter(a => match(a, ['number', 'short_description', 'text']));
    const cis = state.cmdbItems.filter(c => match(c, ['name', 'sys_class_name', 'category']));

    return { incidents, changes, problems, articles, cis };
  }, [qParam, query, state]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search${sp ? sp + '&' : '?'}q=${encodeURIComponent(query.trim())}`);
    }
  };

  const totalResults = results
    ? results.incidents.length + results.changes.length + results.problems.length + results.articles.length + results.cis.length
    : 0;

  return (
    <div className="sn-page">
      <div className="sn-page-body">
        <div className="sn-search-page">
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Global Search</h1>
          <div className="sn-search-input-row">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleSearch} placeholder="Search across all records..." />
            <button className="sn-btn sn-btn-primary" onClick={() => query.trim() && navigate(`/search${sp ? sp + '&' : '?'}q=${encodeURIComponent(query.trim())}`)}>Search</button>
          </div>

          {results && (
            <div>
              <p style={{ color: '#666', marginBottom: 20 }}>{totalResults} result{totalResults !== 1 ? 's' : ''} for "{qParam || query}"</p>

              {results.incidents.length > 0 && (
                <div className="sn-search-section">
                  <h3>Incidents ({results.incidents.length})</h3>
                  {results.incidents.map(i => (
                    <div key={i.sys_id} className="sn-search-result">
                      <a onClick={() => navigate(`/incident/${i.sys_id}${sp}`)}>{i.number}</a> — {i.short_description}
                    </div>
                  ))}
                </div>
              )}
              {results.changes.length > 0 && (
                <div className="sn-search-section">
                  <h3>Change Requests ({results.changes.length})</h3>
                  {results.changes.map(c => (
                    <div key={c.sys_id} className="sn-search-result">
                      <a onClick={() => navigate(`/change/${c.sys_id}${sp}`)}>{c.number}</a> — {c.short_description}
                    </div>
                  ))}
                </div>
              )}
              {results.problems.length > 0 && (
                <div className="sn-search-section">
                  <h3>Problems ({results.problems.length})</h3>
                  {results.problems.map(p => (
                    <div key={p.sys_id} className="sn-search-result">
                      <a onClick={() => navigate(`/problem/${p.sys_id}${sp}`)}>{p.number}</a> — {p.short_description}
                    </div>
                  ))}
                </div>
              )}
              {results.articles.length > 0 && (
                <div className="sn-search-section">
                  <h3>Knowledge Articles ({results.articles.length})</h3>
                  {results.articles.map(a => (
                    <div key={a.sys_id} className="sn-search-result">
                      <a onClick={() => navigate(`/knowledge/article/${a.sys_id}${sp}`)}>{a.number}</a> — {a.short_description}
                    </div>
                  ))}
                </div>
              )}
              {results.cis.length > 0 && (
                <div className="sn-search-section">
                  <h3>Configuration Items ({results.cis.length})</h3>
                  {results.cis.map(c => (
                    <div key={c.sys_id} className="sn-search-result">
                      <a onClick={() => navigate(`/cmdb/${c.sys_id}${sp}`)}>{c.name}</a> — {c.sys_class_name}
                    </div>
                  ))}
                </div>
              )}
              {totalResults === 0 && <p style={{ color: '#999', marginTop: 20 }}>No results found.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
