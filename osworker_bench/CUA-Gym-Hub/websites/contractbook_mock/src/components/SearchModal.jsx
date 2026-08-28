import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, FileText, LayoutTemplate, Users, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SearchModal({ onClose }) {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sidQuery = sid ? `?sid=${sid}` : '';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.toLowerCase().trim();

  const contractResults = q
    ? state.contracts.filter(c => c.title.toLowerCase().includes(q))
    : [];

  const templateResults = q
    ? state.templates.filter(t => t.title.toLowerCase().includes(q))
    : [];

  const contactResults = q
    ? state.contacts.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    : [];

  const hasResults = contractResults.length + templateResults.length + contactResults.length > 0;

  const handleNav = (path) => {
    navigate(path + sidQuery);
    onClose();
  };

  return (
    <div className="search-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="search-modal-box">
        <div className="search-input-row">
          <Search size={20} color="var(--color-text-muted)" />
          <input
            ref={inputRef}
            className="search-modal-input"
            placeholder="Search contracts, templates, contacts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && onClose()}
          />
          {query && (
            <button className="btn btn-ghost btn-icon" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {q && (
          <div className="search-results">
            {!hasResults && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
                No results for "{query}"
              </div>
            )}

            {contractResults.length > 0 && (
              <>
                <div className="search-group-title">Contracts</div>
                {contractResults.slice(0, 5).map(c => (
                  <div key={c.id} className="search-result-item" onClick={() => handleNav(`/contracts/${c.id}`)}>
                    <div className="search-result-icon"><FileText size={16} /></div>
                    <div>
                      <div className="search-result-title">{c.title}</div>
                      <div className="search-result-sub capitalize">{c.status}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {templateResults.length > 0 && (
              <>
                <div className="search-group-title">Templates</div>
                {templateResults.slice(0, 5).map(t => (
                  <div key={t.id} className="search-result-item" onClick={() => handleNav(`/templates`)}>
                    <div className="search-result-icon"><LayoutTemplate size={16} /></div>
                    <div>
                      <div className="search-result-title">{t.title}</div>
                      <div className="search-result-sub">{t.category}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {contactResults.length > 0 && (
              <>
                <div className="search-group-title">Contacts</div>
                {contactResults.slice(0, 5).map(c => (
                  <div key={c.id} className="search-result-item" onClick={() => handleNav(`/contacts`)}>
                    <div className="search-result-icon"><Users size={16} /></div>
                    <div>
                      <div className="search-result-title">{c.firstName} {c.lastName}</div>
                      <div className="search-result-sub">{c.company}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {!q && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
            Start typing to search...
          </div>
        )}
      </div>
    </div>
  );
}
