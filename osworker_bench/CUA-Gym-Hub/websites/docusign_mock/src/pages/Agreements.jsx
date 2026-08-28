import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Search, Inbox, Send, FileEdit, CheckCircle, AlertCircle, Clock,
  AlertTriangle, Trash2, FolderPlus, ChevronDown, ChevronUp, Folder,
  MoreHorizontal, PenTool, Eye, X
} from 'lucide-react';

const STATIC_FOLDERS = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileEdit },
  { id: 'completed', label: 'Completed', icon: CheckCircle },
];

const MORE_FOLDERS = [
  { id: 'action-required', label: 'Action Required', icon: AlertCircle },
  { id: 'waiting', label: 'Waiting for Others', icon: Clock },
  { id: 'expiring', label: 'Expiring Soon', icon: AlertTriangle },
  { id: 'authentication-failed', label: 'Authentication Failed', icon: AlertCircle },
  { id: 'deleted', label: 'Deleted', icon: Trash2 },
];

const PAGE_SIZE = 10;

const StatusBadge = ({ status }) => {
  const styles = {
    completed: 'bg-green-100 text-green-800',
    sent: 'bg-blue-100 text-blue-800',
    delivered: 'bg-blue-100 text-blue-800',
    signed: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    declined: 'bg-red-100 text-red-800',
    voided: 'bg-gray-200 text-gray-600',
    expired: 'bg-orange-100 text-orange-800',
  };
  const labels = {
    completed: 'Completed',
    sent: 'Sent',
    delivered: 'Delivered',
    signed: 'Waiting for Others',
    draft: 'Draft',
    declined: 'Declined',
    voided: 'Voided',
    expired: 'Expired',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
};

const Agreements = () => {
  const { state, createFolder, deleteFolder, updateFolder, voidEnvelope, deleteEnvelope, moveToFolder } = useStore();
  const navigate = useNavigate();
  const { folder: folderParam } = useParams();
  const activeFolder = folderParam || 'inbox';

  const [searchQuery, setSearchQuery] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [page, setPage] = useState(1);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [datePreset, setDatePreset] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showMoveFolder, setShowMoveFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const user = state.user;

  // Filter envelopes by folder (skip folder filter when searching)
  const filteredEnvelopes = useMemo(() => {
    let envelopes = state.envelopes;

    // When search is active, search across ALL envelopes regardless of folder
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      envelopes = envelopes.filter(e =>
        e.subject.toLowerCase().includes(q) ||
        e.recipients.some(r =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q)
        )
      );
    } else {
      // Only apply folder filter when search is empty
      switch (activeFolder) {
        case 'inbox':
          envelopes = envelopes.filter(e =>
            (e.status === 'sent' || e.status === 'delivered' || e.status === 'signed') &&
            e.recipients.some(r => r.email === user.email)
          );
          break;
        case 'sent':
          envelopes = envelopes.filter(e => e.sentAt !== null);
          break;
        case 'drafts':
          envelopes = envelopes.filter(e => e.status === 'draft');
          break;
        case 'completed':
          envelopes = envelopes.filter(e => e.status === 'completed');
          break;
        case 'action-required':
          envelopes = envelopes.filter(e =>
            (e.status === 'sent' || e.status === 'delivered') &&
            e.recipients.some(r => r.email === user.email && r.status !== 'signed')
          );
          break;
        case 'waiting':
          envelopes = envelopes.filter(e =>
            (e.status === 'sent' || e.status === 'delivered' || e.status === 'signed') &&
            e.senderId === user.id
          );
          break;
        case 'expiring':
          envelopes = envelopes.filter(e => {
            if (!e.expiresAt || e.status === 'completed' || e.status === 'voided' || e.status === 'declined') return false;
            const days = (new Date(e.expiresAt) - new Date()) / (1000 * 60 * 60 * 24);
            return days <= 7 && days > 0;
          });
          break;
        case 'authentication-failed':
          envelopes = envelopes.filter(e => e.recipients.some(r => r.status === 'authentication-failed'));
          break;
        case 'deleted':
          envelopes = envelopes.filter(e => e.status === 'voided');
          break;
        default:
          // Custom folder
          envelopes = envelopes.filter(e => e.folderId === activeFolder);
          break;
      }
    }

    // Apply date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      envelopes = envelopes.filter(e => new Date(e.lastActivityAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      envelopes = envelopes.filter(e => new Date(e.lastActivityAt) <= to);
    }

    // Sort by lastActivityAt descending
    return [...envelopes].sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));
  }, [state.envelopes, activeFolder, searchQuery, user, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEnvelopes.length / PAGE_SIZE));
  const pagedEnvelopes = filteredEnvelopes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Folder counts
  const folderCount = (folderId) => {
    switch (folderId) {
      case 'inbox': return state.envelopes.filter(e => (e.status === 'sent' || e.status === 'delivered' || e.status === 'signed') && e.recipients.some(r => r.email === user.email)).length;
      case 'sent': return state.envelopes.filter(e => e.sentAt !== null).length;
      case 'drafts': return state.envelopes.filter(e => e.status === 'draft').length;
      case 'completed': return state.envelopes.filter(e => e.status === 'completed').length;
      case 'action-required': return state.envelopes.filter(e => (e.status === 'sent' || e.status === 'delivered') && e.recipients.some(r => r.email === user.email && r.status !== 'signed')).length;
      case 'waiting': return state.envelopes.filter(e => (e.status === 'sent' || e.status === 'delivered' || e.status === 'signed') && e.senderId === user.id).length;
      case 'deleted': return state.envelopes.filter(e => e.status === 'voided').length;
      case 'authentication-failed': return state.envelopes.filter(e => e.recipients.some(r => r.status === 'authentication-failed')).length;
      default: return state.envelopes.filter(e => e.folderId === folderId).length;
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleFolderClick = (folderId) => {
    setPage(1);
    navigate(`/agreements/${folderId}`);
  };

  const allFolderLabel = [...STATIC_FOLDERS, ...MORE_FOLDERS].find(f => f.id === activeFolder)?.label
    || state.folders.find(f => f.id === activeFolder)?.name
    || 'All';

  const toggleSelect = (envId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(envId)) next.delete(envId);
      else next.add(envId);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === pagedEnvelopes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pagedEnvelopes.map(e => e.id)));
    }
  };

  const bulkVoid = () => {
    selectedIds.forEach(envId => {
      const env = state.envelopes.find(e => e.id === envId);
      if (env && env.status !== 'completed' && env.status !== 'voided') {
        voidEnvelope(envId, 'Bulk void');
      }
    });
    setSelectedIds(new Set());
  };

  const bulkDelete = () => {
    selectedIds.forEach(envId => deleteEnvelope(envId));
    setSelectedIds(new Set());
  };

  const bulkMoveToFolder = (folderId) => {
    selectedIds.forEach(envId => moveToFolder(envId, folderId));
    setSelectedIds(new Set());
    setShowMoveFolder(false);
  };

  const handleDeleteFolder = (fId) => {
    deleteFolder(fId);
    if (activeFolder === fId) navigate('/agreements/inbox');
  };

  const startRenameFolder = (folder) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  const commitRenameFolder = () => {
    if (editingFolderId && editingFolderName.trim()) {
      updateFolder(editingFolderId, { name: editingFolderName.trim() });
    }
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Folders */}
      <div className="w-60 bg-white border-r flex-shrink-0 py-4 overflow-y-auto">
        <div className="px-4 mb-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Folders</h2>
        </div>
        <nav>
          {STATIC_FOLDERS.map(f => (
            <button
              key={f.id}
              onClick={() => handleFolderClick(f.id)}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${activeFolder === f.id ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <div className="flex items-center">
                <f.icon className="w-4 h-4 mr-3" />
                <span>{f.label}</span>
              </div>
              <span className="text-xs text-gray-400">{folderCount(f.id)}</span>
            </button>
          ))}

          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
          >
            {showMore ? <ChevronUp className="w-4 h-4 mr-3" /> : <ChevronDown className="w-4 h-4 mr-3" />}
            <span>{showMore ? 'Show Less' : 'Show More'}</span>
          </button>

          {showMore && MORE_FOLDERS.map(f => (
            <button
              key={f.id}
              onClick={() => handleFolderClick(f.id)}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${activeFolder === f.id ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <div className="flex items-center">
                <f.icon className="w-4 h-4 mr-3" />
                <span>{f.label}</span>
              </div>
              <span className="text-xs text-gray-400">{folderCount(f.id)}</span>
            </button>
          ))}

          {/* Custom Folders */}
          <div className="border-t mt-2 pt-2">
            <div className="flex items-center justify-between px-4 mb-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Folders</span>
              <button onClick={() => setShowNewFolder(!showNewFolder)} className="text-gray-400 hover:text-blue-600">
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
            {showNewFolder && (
              <div className="px-4 py-2 flex gap-1">
                <input
                  type="text"
                  className="flex-1 text-sm border rounded px-2 py-1"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  autoFocus
                />
                <button onClick={handleCreateFolder} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Add</button>
              </div>
            )}
            {state.folders.map(f => (
              <div
                key={f.id}
                className={`group flex items-center justify-between px-4 py-2 text-sm transition-colors cursor-pointer ${activeFolder === f.id ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => handleFolderClick(f.id)}
              >
                <div className="flex items-center">
                  <Folder className="w-4 h-4 mr-3" />
                  {editingFolderId === f.id ? (
                    <input
                      className="w-28 border rounded px-1 py-0.5 text-sm"
                      value={editingFolderName}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRenameFolder();
                        if (e.key === 'Escape') {
                          setEditingFolderId(null);
                          setEditingFolderName('');
                        }
                      }}
                      onBlur={commitRenameFolder}
                      autoFocus
                    />
                  ) : (
                    <span>{f.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">{folderCount(f.id)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); startRenameFolder(f); }}
                    className="text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    title="Rename folder"
                  >
                    <PenTool className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.id); }}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    title="Delete folder"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">{allFolderLabel}</h1>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search agreements..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            {['Last 7 days', 'Last 30 days', 'Last 6 months', 'All time'].map(preset => (
              <button
                key={preset}
                onClick={() => {
                  setDatePreset(preset);
                  const now = new Date();
                  if (preset === 'All time') { setDateFrom(''); setDateTo(''); }
                  else if (preset === 'Last 7 days') { setDateFrom(new Date(now - 7 * 86400000).toISOString().split('T')[0]); setDateTo(''); }
                  else if (preset === 'Last 30 days') { setDateFrom(new Date(now - 30 * 86400000).toISOString().split('T')[0]); setDateTo(''); }
                  else if (preset === 'Last 6 months') { setDateFrom(new Date(now - 180 * 86400000).toISOString().split('T')[0]); setDateTo(''); }
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  datePreset === preset ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-gray-500">From</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-xs"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setDatePreset(''); setPage(1); }}
            />
            <label className="text-xs text-gray-500">To</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-xs"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setDatePreset(''); setPage(1); }}
            />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="mb-3 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-blue-800">{selectedIds.size} selected</span>
            <button onClick={bulkVoid} className="text-xs px-3 py-1 bg-white border rounded text-gray-700 hover:bg-gray-50">Void Selected</button>
            <button onClick={bulkDelete} className="text-xs px-3 py-1 bg-white border border-red-200 rounded text-red-600 hover:bg-red-50">Delete Selected</button>
            <div className="relative">
              <button onClick={() => setShowMoveFolder(!showMoveFolder)} className="text-xs px-3 py-1 bg-white border rounded text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                Move to Folder <ChevronDown className="w-3 h-3" />
              </button>
              {showMoveFolder && (
                <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-20 w-48">
                  <button onClick={() => bulkMoveToFolder(null)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-500 italic">No folder</button>
                  {state.folders.map(f => (
                    <button key={f.id} onClick={() => bulkMoveToFolder(f.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{f.name}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-gray-500 hover:text-gray-700">Clear selection</button>
          </div>
        )}

        {/* Envelope Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={pagedEnvelopes.length > 0 && selectedIds.size === pagedEnvelopes.length}
                    onChange={selectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Change</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagedEnvelopes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? 'No results found' : 'No agreements in this folder'}
                  </td>
                </tr>
              ) : (
                pagedEnvelopes.map((env) => {
                  const firstRecipient = env.recipients[0];
                  const moreCount = env.recipients.length - 1;
                  return (
                    <tr
                      key={env.id}
                      onClick={() => navigate(`/agreements/detail/${env.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedIds.has(env.id)}
                          onChange={() => toggleSelect(env.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{env.subject}</div>
                        <div className="text-xs text-gray-400">{env.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={env.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600" title={format(new Date(env.lastActivityAt), 'MMM d, yyyy h:mm a')}>
                          {formatDistanceToNow(new Date(env.lastActivityAt), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">
                          {firstRecipient ? (
                            <>
                              {firstRecipient.name}
                              {moreCount > 0 && <span className="text-gray-400 ml-1">+{moreCount} more</span>}
                            </>
                          ) : (
                            <span className="text-gray-400">No recipients</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agreements;
