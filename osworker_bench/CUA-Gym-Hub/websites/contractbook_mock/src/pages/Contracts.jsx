import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, Filter, Plus, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }) {
  return <span className={`badge badge-${status.replace('_', '-')}`}>{status.replace('_', ' ')}</span>;
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getCounterparty(contract) {
  const external = contract.parties?.find(p => p.type === 'external');
  return external?.name || '—';
}

function getAllSignees(contract) {
  return contract.parties?.flatMap(p => p.signees) || [];
}

const TABS = [
  { key: 'all', label: 'All Documents' },
  { key: 'draft', label: 'Drafts' },
  { key: 'pending', label: 'Pending' },
  { key: 'signed', label: 'Signed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'expired', label: 'Expired' },
];

const SORT_OPTIONS = [
  { value: 'updatedAt_desc', label: 'Updated date (newest first)' },
  { value: 'updatedAt_asc', label: 'Updated date (oldest first)' },
  { value: 'createdAt_desc', label: 'Created date (newest first)' },
  { value: 'createdAt_asc', label: 'Created date (oldest first)' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
  { value: 'status', label: 'Status' },
];

export default function Contracts() {
  const { state, addContract } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sid = searchParams.get('sid');
  const query = sid ? `?sid=${sid}` : '';

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt_desc');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    if (location.state?.folderId !== undefined) {
      setSelectedFolder(location.state.folderId);
    }
  }, [location.state]);

  const filteredContracts = state.contracts.filter(c => {
    if (activeTab !== 'all' && c.status !== activeTab) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedFolder) {
      const folderIds = getAllFolderIds(selectedFolder, state.folders);
      if (!folderIds.includes(c.folderId)) return false;
    }
    return true;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    switch (sortBy) {
      case 'updatedAt_desc': return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'updatedAt_asc': return new Date(a.updatedAt) - new Date(b.updatedAt);
      case 'createdAt_desc': return new Date(b.createdAt) - new Date(a.createdAt);
      case 'createdAt_asc': return new Date(a.createdAt) - new Date(b.createdAt);
      case 'title_asc': return a.title.localeCompare(b.title);
      case 'title_desc': return b.title.localeCompare(a.title);
      case 'status': return a.status.localeCompare(b.status);
      default: return 0;
    }
  });

  const getTabCount = (key) => {
    if (key === 'all') return state.contracts.length;
    return state.contracts.filter(c => c.status === key).length;
  };

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || '';

  const handleCreateNew = () => {
    window.dispatchEvent(new CustomEvent('open-new-contract-modal'));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Contracts</h1>
        <button className="btn btn-primary" onClick={handleCreateNew}>
          <Plus size={16} />
          Create new document
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} <span style={{ marginLeft: 4, color: 'inherit', opacity: 0.7 }}>({getTabCount(tab.key)})</span>
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="filter-row">
        <div className="search-input-wrap" style={{ width: 280 }}>
          <Search size={16} className="search-icon" />
          <input
            className="input"
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="dropdown" style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setSortOpen(!sortOpen)}
          >
            <span>Sort: {currentSortLabel}</span>
            <ChevronDown size={14} />
          </button>
          {sortOpen && (
            <div className="dropdown-menu" style={{ minWidth: 240 }}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className="dropdown-item"
                  style={{ fontWeight: sortBy === opt.value ? 600 : 400 }}
                  onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="contracts-table-wrap">
        {sortedContracts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h3>No contracts found</h3>
            <p>{searchQuery ? `No contracts matching "${searchQuery}"` : 'Create your first contract to get started'}</p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={handleCreateNew}>
                <Plus size={16} />
                Create new document
              </button>
            )}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 24 }}></th>
                <th>CONTRACT TITLE</th>
                <th>COUNTERPARTY</th>
                <th>DATE</th>
                <th>SIGNEES</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {sortedContracts.map(contract => {
                const signees = getAllSignees(contract);
                const visibleSignees = signees.slice(0, 3);
                const overflow = signees.length - 3;
                const tags = contract.tags?.map(tagId => state.tags.find(t => t.id === tagId)).filter(Boolean) || [];

                const pendingApprovals = (contract.approvals || []).filter(a => a.status === 'pending').length;

                return (
                  <tr
                    key={contract.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/contracts/${contract.id}${query}`)}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <input type="checkbox" style={{ cursor: 'pointer' }} />
                    </td>
                    <td>
                      <div className="contract-title-link">
                        <span>{contract.title}</span>
                        {pendingApprovals > 0 && (
                          <span title={`${pendingApprovals} pending approval(s)`} style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-warning)' }}>
                            <ShieldAlert size={14} />
                          </span>
                        )}
                      </div>
                      {tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                          {tags.map(tag => (
                            <span
                              key={tag.id}
                              className="tag-pill"
                              style={{ background: tag.color + '20', color: tag.color, fontSize: 10 }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{getCounterparty(contract)}</td>
                    <td style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDate(contract.updatedAt)}
                    </td>
                    <td>
                      {signees.length > 0 ? (
                        <div className="signees-overlap">
                          {visibleSignees.map(s => (
                            <div
                              key={s.id}
                              className="avatar avatar-sm"
                              title={`${s.name} - ${s.status}`}
                              style={{
                                background: s.status === 'signed' ? '#10B981' : s.status === 'rejected' ? '#EF4444' : '#6B7280',
                              }}
                            >
                              {getInitials(s.name)}
                            </div>
                          ))}
                          {overflow > 0 && (
                            <div className="signees-overflow">+{overflow}</div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={contract.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getAllFolderIds(folderId, folders) {
  const ids = [folderId];
  const children = folders.filter(f => f.parentId === folderId);
  children.forEach(child => {
    ids.push(...getAllFolderIds(child.id, folders));
  });
  return ids;
}
