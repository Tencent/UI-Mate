import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SearchBoxProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ onShowToast }) => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    
    // Simulate async search
    setTimeout(() => {
      const lowerQuery = searchQuery.toLowerCase();
      
      const searchResults = [
        ...state.leads.filter(l => 
          `${l.firstName} ${l.lastName}`.toLowerCase().includes(lowerQuery) ||
          l.company.toLowerCase().includes(lowerQuery) ||
          l.email.toLowerCase().includes(lowerQuery)
        ).map(l => ({ 
          type: 'Lead', 
          path: `/leads/${l.leadId}`,
          name: `${l.firstName} ${l.lastName}`,
          subtitle: l.company 
        })),
        
        ...state.accounts.filter(a => 
          a.name.toLowerCase().includes(lowerQuery)
        ).map(a => ({ 
          type: 'Account', 
          path: `/accounts/${a.accountId}`,
          name: a.name,
          subtitle: a.type 
        })),
        
        ...state.contacts.filter(c => 
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(lowerQuery) ||
          c.email.toLowerCase().includes(lowerQuery)
        ).map(c => ({ 
          type: 'Contact', 
          path: `/contacts/${c.contactId}`,
          name: `${c.firstName} ${c.lastName}`,
          subtitle: state.accounts.find(a => a.accountId === c.accountId)?.name || 'No Account'
        })),
        
        ...state.opportunities.filter(o =>
          o.name.toLowerCase().includes(lowerQuery)
        ).map(o => ({
          type: 'Opportunity',
          path: `/opportunities/${o.opportunityId}`,
          name: o.name,
          subtitle: `$${(o.amount / 1000).toFixed(0)}K • ${o.stage}`
        })),

        ...state.cases.filter(c =>
          c.subject.toLowerCase().includes(lowerQuery) ||
          c.caseNumber.toLowerCase().includes(lowerQuery) ||
          c.description.toLowerCase().includes(lowerQuery)
        ).map(c => ({
          type: 'Case',
          path: `/cases/${c.caseId}`,
          name: c.subject,
          subtitle: `${c.caseNumber} • ${c.status}`
        }))
      ];
      
      setResults(searchResults);
      setShowResults(searchResults.length > 0);
      setLoading(false);
    }, 150);
  };

  const handleResultClick = (result: any) => {
    navigate(result.path);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      setQuery('');
    } else if (e.key === 'Enter' && query.trim()) {
      if (results.length > 0) {
        // Navigate to first result
        handleResultClick(results[0]);
      } else {
        onShowToast('No results found', 'info');
      }
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div 
      ref={searchRef}
      style={{ 
        flex: 1, 
        maxWidth: '600px', 
        position: 'relative',
        margin: '0 16px'
      }}
    >
      <Search 
        size={18} 
        style={{ 
          position: 'absolute', 
          left: '12px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: 'var(--text-secondary)',
          zIndex: 1
        }} 
      />
      
      {query && (
        <button
          onClick={clearSearch}
          style={{ 
            position: 'absolute', 
            right: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            zIndex: 1
          }}
        >
          <X size={16} />
        </button>
      )}

      <input
        type="text"
        placeholder="Search Xalesforce (press Enter)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          performSearch(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setShowResults(true)}
        className="form-input"
        style={{ 
          paddingLeft: '40px', 
          paddingRight: query ? '40px' : '12px',
          width: '100%',
          zIndex: 0
        }}
      />

      {showResults && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1001
          }}
        >
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 8px', width: '24px', height: '24px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>No results found for "{query}"</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>Try searching for names, companies, or emails</p>
            </div>
          ) : (
            <div>
              <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                {results.length} result{results.length === 1 ? '' : 's'} found
              </div>
              {results.map((result: any, index) => (
                <button
                  key={`${result.path}-${index}`}
                  onClick={() => handleResultClick(result)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    border: 'none',
                    background: index % 2 === 0 ? 'white' : 'var(--bg)',
                    cursor: 'pointer',
                    borderBottom: index < results.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? 'white' : 'var(--bg)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {result.type}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{result.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{result.subtitle}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};