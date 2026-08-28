import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Edit2, Search, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'react-router-dom';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronDown size={13} className="ml-1 text-gray-300 opacity-50" />;
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="ml-1 text-xubspot" />
    : <ChevronDown size={13} className="ml-1 text-xubspot" />;
}

const TICKET_STATUSES = ['new', 'waiting_on_contact', 'waiting_on_us', 'in_progress', 'closed'];
const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = ['general_inquiry', 'bug_report', 'feature_request', 'billing', 'technical_support'];
const SOURCES = ['email', 'phone', 'chat', 'form', 'manual'];

const STATUS_CONFIG = {
  new: { label: 'New', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  waiting_on_contact: { label: 'Waiting on Contact', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  waiting_on_us: { label: 'Waiting on Us', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  in_progress: { label: 'In Progress', bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  closed: { label: 'Closed', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
};

const EMPTY_FORM = {
  subject: '', description: '', status: 'new', pipeline: 'support',
  priority: 'medium', category: 'general_inquiry', source: 'email',
  owner: 'Admin User', contactId: '', companyId: ''
};

export default function Tickets() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortCol, setSortCol] = useState('createDate');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Clear highlight after 3s
  React.useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => setSearchParams({}, { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, setSearchParams]);

  const openCreate = () => {
    setEditTicket(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (ticket) => {
    setEditTicket(ticket);
    setForm({
      subject: ticket.subject || '',
      description: ticket.description || '',
      status: ticket.status || 'new',
      pipeline: ticket.pipeline || 'support',
      priority: ticket.priority || 'medium',
      category: ticket.category || 'general_inquiry',
      source: ticket.source || 'email',
      owner: ticket.owner || 'Admin User',
      contactId: ticket.contactId || '',
      companyId: ticket.companyId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      contactId: form.contactId || null,
      companyId: form.companyId || null,
      lastActivityDate: new Date().toISOString(),
    };
    if (editTicket) {
      const closeDate = payload.status === 'closed' && !editTicket.closeDate
        ? new Date().toISOString()
        : editTicket.closeDate;
      dispatch({ type: 'UPDATE_TICKET', payload: { ...editTicket, ...payload, closeDate } });
      addToast('Ticket updated successfully.', 'success');
    } else {
      dispatch({
        type: 'ADD_TICKET',
        payload: {
          ...payload,
          id: uuidv4(),
          createDate: new Date().toISOString(),
          closeDate: payload.status === 'closed' ? new Date().toISOString() : null,
        }
      });
      addToast('Ticket created successfully.', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const ticket = state.tickets.find(t => t.id === id);
    setDeleteConfirm({ type: 'single', id, subject: ticket?.subject || 'this ticket' });
  };

  const handleBulkDelete = () => {
    setDeleteConfirm({ type: 'bulk', count: selectedIds.length });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'single') {
      dispatch({ type: 'DELETE_TICKET', payload: deleteConfirm.id });
      setSelectedIds(prev => prev.filter(s => s !== deleteConfirm.id));
      addToast('Ticket deleted.', 'success');
    } else {
      selectedIds.forEach(id => dispatch({ type: 'DELETE_TICKET', payload: id }));
      addToast(`${selectedIds.length} ticket(s) deleted.`, 'success');
      setSelectedIds([]);
    }
    setDeleteConfirm(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  let filtered = state.tickets.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const contact = state.contacts.find(c => c.id === t.contactId);
    const contactName = contact ? `${contact.firstName} ${contact.lastName}`.toLowerCase() : '';
    return (t.subject || '').toLowerCase().includes(q) || contactName.includes(q);
  });

  filtered = [...filtered].sort((a, b) => {
    let aVal = '', bVal = '';
    if (sortCol === 'subject') { aVal = (a.subject || '').toLowerCase(); bVal = (b.subject || '').toLowerCase(); }
    else if (sortCol === 'status') { aVal = a.status || ''; bVal = b.status || ''; }
    else if (sortCol === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      return sortDir === 'asc' ? (order[a.priority] || 1) - (order[b.priority] || 1) : (order[b.priority] || 1) - (order[a.priority] || 1);
    }
    else if (sortCol === 'category') { aVal = a.category || ''; bVal = b.category || ''; }
    else if (sortCol === 'owner') { aVal = (a.owner || '').toLowerCase(); bVal = (b.owner || '').toLowerCase(); }
    else if (sortCol === 'createDate') { aVal = a.createDate || ''; bVal = b.createDate || ''; }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);
  const startIdx = (page - 1) * pageSize;
  const paged = filtered.slice(startIdx, startIdx + pageSize);

  const thClass = "px-6 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Service Tickets</h2>
          <p className="text-gray-500 text-sm">{state.tickets.length} tickets</p>
        </div>
        <div className="flex gap-3">
          <select
            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {TICKET_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-xubspot text-white rounded-md text-sm font-medium hover:bg-xubspot-hover flex items-center gap-2"
          >
            <Plus size={16} /> Create Ticket
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search subject, contact name..."
          className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-sm font-medium text-blue-700">{selectedIds.length} selected</span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
          >
            Deselect All
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
              <th className="px-6 py-3 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={paged.length > 0 && paged.every(t => selectedIds.includes(t.id))}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedIds(prev => [...new Set([...prev, ...paged.map(t => t.id)])]);
                    } else {
                      setSelectedIds(prev => prev.filter(id => !paged.map(t => t.id).includes(id)));
                    }
                  }}
                />
              </th>
              <th className={thClass} onClick={() => handleSort('subject')}>
                <span className="flex items-center">Subject <SortIcon col="subject" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('status')}>
                <span className="flex items-center">Status <SortIcon col="status" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('priority')}>
                <span className="flex items-center">Priority <SortIcon col="priority" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('category')}>
                <span className="flex items-center">Category <SortIcon col="category" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className="px-6 py-3">Contact</th>
              <th className={thClass} onClick={() => handleSort('owner')}>
                <span className="flex items-center">Owner <SortIcon col="owner" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('createDate')}>
                <span className="flex items-center">Created <SortIcon col="createDate" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paged.length === 0 && (
              <tr>
                <td colSpan="9" className="px-6 py-10 text-center text-gray-400 text-sm">
                  No tickets found.
                </td>
              </tr>
            )}
            {paged.map(ticket => {
              const contact = state.contacts.find(c => c.id === ticket.contactId);
              const statusConf = STATUS_CONFIG[ticket.status] || { label: ticket.status, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
              const isHighlighted = ticket.id === highlightId;
              return (
                <tr key={ticket.id} className={`hover:bg-gray-50 group transition-colors ${isHighlighted ? 'bg-yellow-50 ring-2 ring-inset ring-yellow-400' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedIds.includes(ticket.id)}
                      onChange={() => toggleSelect(ticket.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openEdit(ticket)}
                      className="font-medium text-xubspot-text hover:text-xubspot text-sm text-left"
                    >
                      {ticket.subject}
                    </button>
                    {ticket.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{ticket.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}></span>
                      {statusConf.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PRIORITY_COLORS[ticket.priority] || 'bg-gray-100 text-gray-600'}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    {(ticket.category || '').replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {contact ? `${contact.firstName} ${contact.lastName}` : <span className="text-gray-400 italic">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {ticket.owner || <span className="text-gray-400 italic">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {ticket.createDate ? new Date(ticket.createDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(ticket)}
                        className="p-1 text-gray-400 hover:text-xubspot"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalFiltered > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {startIdx + 1}–{Math.min(startIdx + pageSize, totalFiltered)} of {totalFiltered} tickets</span>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">&lt; Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded text-xs font-medium ${page === p ? 'bg-xubspot text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>{p}</button>;
              })}
              <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">Next &gt;</button>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-xubspot">
                {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} / page</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
          <div className="bg-white h-full w-full max-w-md shadow-xl flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{editTicket ? 'Edit Ticket' : 'Create Ticket'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="Ticket subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot resize-none"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    {TICKET_STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.source}
                    onChange={e => setForm({ ...form, source: e.target.value })}
                  >
                    {SOURCES.map(s => (
                      <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.contactId}
                  onChange={e => setForm({ ...form, contactId: e.target.value })}
                >
                  <option value="">None</option>
                  {state.contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.companyId}
                  onChange={e => setForm({ ...form, companyId: e.target.value })}
                >
                  <option value="">None</option>
                  {state.companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.owner}
                  onChange={e => setForm({ ...form, owner: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-xubspot text-white rounded text-sm hover:bg-xubspot-hover"
                >
                  {editTicket ? 'Save Changes' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              {deleteConfirm.type === 'single'
                ? `Are you sure you want to delete ticket "${deleteConfirm.subject}"? This action cannot be undone.`
                : `Are you sure you want to delete ${deleteConfirm.count} selected ticket(s)? This action cannot be undone.`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
