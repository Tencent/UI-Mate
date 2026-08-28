import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Edit2, Mail, Search, ChevronUp, ChevronDown, X, Download, Upload, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'react-router-dom';
import { downloadCsv, readCsvFile } from '../utils/crmFiles';

const LIFECYCLE_STAGES = ['lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'];
const LEAD_STATUSES = ['new', 'open', 'in_progress', 'open_deal', 'unqualified', 'attempted', 'connected'];

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '', jobTitle: '',
  companyId: '', lifecycleStage: 'lead', leadStatus: 'new',
  city: '', state: '', country: 'United States'
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronDown size={13} className="ml-1 text-gray-300 opacity-50" />;
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="ml-1 text-xubspot" />
    : <ChevronDown size={13} className="ml-1 text-xubspot" />;
}

function FilterDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const active = selected.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1 transition-colors
          ${active ? 'bg-orange-50 border-xubspot text-xubspot' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}`}
      >
        {label}
        {active && <span className="bg-xubspot text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{selected.length}</span>}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px] py-1">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => {
                  onChange(selected.includes(opt.value)
                    ? selected.filter(v => v !== opt.value)
                    : [...selected, opt.value]);
                }}
                className="rounded border-gray-300 text-xubspot focus:ring-xubspot"
              />
              <span className="text-sm text-gray-700 capitalize">{opt.label}</span>
            </label>
          ))}
          {selected.length > 0 && (
            <div className="border-t border-gray-100 mt-1 pt-1 px-3 pb-1">
              <button onClick={() => onChange([])} className="text-xs text-xubspot hover:underline">Clear</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Contacts() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Delete confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'single'|'bulk', id?, count? }

  // Compose email stub state
  const [composeTarget, setComposeTarget] = useState(null);
  const [composeForm, setComposeForm] = useState({ subject: '', body: '' });
  const importInputRef = useRef(null);

  // Sort state
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Filter state
  const [filterLifecycle, setFilterLifecycle] = useState([]);
  const [filterLeadStatus, setFilterLeadStatus] = useState([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Clear highlight param after a brief moment
  const highlightRef = useRef(highlightId);
  useEffect(() => {
    if (highlightId) {
      highlightRef.current = highlightId;
      const timer = setTimeout(() => {
        setSearchParams({}, { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, setSearchParams]);

  const openCreate = () => {
    setEditContact(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (contact) => {
    setEditContact(contact);
    setForm({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      jobTitle: contact.jobTitle || '',
      companyId: contact.companyId || '',
      lifecycleStage: contact.lifecycleStage || 'lead',
      leadStatus: contact.leadStatus || 'new',
      city: contact.city || '',
      state: contact.state || '',
      country: contact.country || 'United States',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editContact) {
      dispatch({ type: 'UPDATE_CONTACT', payload: { ...editContact, ...form, lastActivityDate: new Date().toISOString() } });
      addToast(`Contact "${form.firstName} ${form.lastName}" updated successfully.`, 'success');
    } else {
      dispatch({
        type: 'ADD_CONTACT',
        payload: {
          ...form,
          id: uuidv4(),
          owner: 'Admin User',
          timeline: [],
          createDate: new Date().toISOString(),
          lastActivityDate: new Date().toISOString(),
        }
      });
      addToast(`Contact "${form.firstName} ${form.lastName}" created successfully.`, 'success');
    }
    setForm(EMPTY_FORM);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const contact = state.contacts.find(c => c.id === id);
    setDeleteConfirm({ type: 'single', id, name: contact ? `${contact.firstName} ${contact.lastName}` : 'this contact' });
  };

  const handleBulkDelete = () => {
    setDeleteConfirm({ type: 'bulk', count: selectedIds.length });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'single') {
      dispatch({ type: 'DELETE_CONTACT', payload: deleteConfirm.id });
      setSelectedIds(prev => prev.filter(s => s !== deleteConfirm.id));
      addToast('Contact deleted.', 'success');
    } else {
      selectedIds.forEach(id => dispatch({ type: 'DELETE_CONTACT', payload: id }));
      addToast(`${selectedIds.length} contact(s) deleted.`, 'success');
      setSelectedIds([]);
    }
    setDeleteConfirm(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleExport = () => {
    downloadCsv('xubspot-contacts.csv', filtered, [
      { label: 'First Name', value: c => c.firstName },
      { label: 'Last Name', value: c => c.lastName },
      { label: 'Email', value: c => c.email },
      { label: 'Phone', value: c => c.phone },
      { label: 'Job Title', value: c => c.jobTitle },
      { label: 'Company', value: c => state.companies.find(company => company.id === c.companyId)?.name || '' },
      { label: 'Lifecycle Stage', value: c => c.lifecycleStage },
      { label: 'Lead Status', value: c => c.leadStatus },
      { label: 'City', value: c => c.city },
      { label: 'State', value: c => c.state },
      { label: 'Country', value: c => c.country },
    ]);
    addToast(`Exported ${filtered.length} contact${filtered.length !== 1 ? 's' : ''}.`, 'success');
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const rows = await readCsvFile(file);
      let imported = 0;
      rows.forEach(row => {
        const email = row.email || '';
        if (!email) return;
        const companyName = row.company || row.companyName || '';
        const company = state.companies.find(c =>
          c.name.toLowerCase() === companyName.toLowerCase() ||
          c.domain.toLowerCase() === companyName.toLowerCase()
        );
        dispatch({
          type: 'ADD_CONTACT',
          payload: {
            id: uuidv4(),
            firstName: row.firstName || '',
            lastName: row.lastName || '',
            email,
            phone: row.phone || '',
            jobTitle: row.jobTitle || '',
            companyId: company?.id || '',
            lifecycleStage: row.lifecycleStage || 'lead',
            leadStatus: row.leadStatus || 'new',
            owner: 'Admin User',
            city: row.city || '',
            state: row.state || '',
            country: row.country || 'United States',
            timeline: [],
            createDate: new Date().toISOString(),
            lastActivityDate: new Date().toISOString(),
          }
        });
        imported += 1;
      });
      addToast(`Imported ${imported} contact${imported !== 1 ? 's' : ''} from ${file.name}.`, imported ? 'success' : 'warning');
    } catch (error) {
      addToast(`Could not import ${file.name}.`, 'error');
    }
  };

  const openCompose = (contact) => {
    setComposeTarget(contact);
    setComposeForm({ subject: `Following up with ${contact.firstName}`, body: '' });
  };

  const saveEmailDraft = () => {
    if (!composeTarget) return;
    const subject = composeForm.subject.trim() || '(no subject)';
    dispatch({
      type: 'ADD_NOTE',
      payload: {
        id: uuidv4(),
        body: `Email draft to ${composeTarget.email}\nSubject: ${subject}\n\n${composeForm.body.trim() || '(empty message)'}`,
        associatedType: 'contact',
        associatedId: composeTarget.id,
        createdBy: 'Admin User',
        createDate: new Date().toISOString(),
      }
    });
    dispatch({ type: 'UPDATE_CONTACT', payload: { ...composeTarget, lastActivityDate: new Date().toISOString() } });
    addToast(`Email draft saved for ${composeTarget.firstName} ${composeTarget.lastName}.`, 'success');
    setComposeTarget(null);
    setComposeForm({ subject: '', body: '' });
  };

  // Filter
  let filtered = state.contacts.filter(c => {
    if (search) {
      const q = search.toLowerCase();
      const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
      if (!name.includes(q) && !(c.email || '').toLowerCase().includes(q) && !(c.phone || '').includes(q)) return false;
    }
    if (filterLifecycle.length > 0 && !filterLifecycle.includes(c.lifecycleStage)) return false;
    if (filterLeadStatus.length > 0 && !filterLeadStatus.includes(c.leadStatus)) return false;
    return true;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    let aVal = '', bVal = '';
    if (sortCol === 'name') { aVal = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase(); bVal = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase(); }
    else if (sortCol === 'email') { aVal = (a.email || '').toLowerCase(); bVal = (b.email || '').toLowerCase(); }
    else if (sortCol === 'phone') { aVal = a.phone || ''; bVal = b.phone || ''; }
    else if (sortCol === 'jobTitle') { aVal = (a.jobTitle || '').toLowerCase(); bVal = (b.jobTitle || '').toLowerCase(); }
    else if (sortCol === 'company') {
      const ca = state.companies.find(c => c.id === a.companyId);
      const cb = state.companies.find(c => c.id === b.companyId);
      aVal = (ca?.name || '').toLowerCase(); bVal = (cb?.name || '').toLowerCase();
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);
  const startIdx = (page - 1) * pageSize;
  const paged = filtered.slice(startIdx, startIdx + pageSize);

  const activeFiltersCount = filterLifecycle.length + filterLeadStatus.length;

  const thClass = "px-6 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contacts</h2>
          <p className="text-gray-500 text-sm">{state.contacts.length} records</p>
        </div>
        <div className="flex gap-3">
          <input ref={importInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} />
          <button
            onClick={() => importInputRef.current?.click()}
            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Upload size={15} /> Import
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Download size={15} /> Export
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-xubspot text-white rounded-md text-sm font-medium hover:bg-xubspot-hover flex items-center gap-2"
          >
            <Plus size={16} /> Create Contact
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search name, phone, email..."
          className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <FilterDropdown
          label="Lifecycle Stage"
          options={LIFECYCLE_STAGES.map(s => ({ value: s, label: s.toUpperCase() }))}
          selected={filterLifecycle}
          onChange={(v) => { setFilterLifecycle(v); setPage(1); }}
        />
        <FilterDropdown
          label="Lead Status"
          options={LEAD_STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ') }))}
          selected={filterLeadStatus}
          onChange={(v) => { setFilterLeadStatus(v); setPage(1); }}
        />
        {activeFiltersCount > 0 && (
          <button
            onClick={() => { setFilterLifecycle([]); setFilterLeadStatus([]); setPage(1); }}
            className="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-xs text-gray-600 hover:text-red-500 hover:border-red-300 flex items-center gap-1"
          >
            <X size={11} /> Clear all ({activeFiltersCount})
          </button>
        )}
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
                  checked={paged.length > 0 && paged.every(c => selectedIds.includes(c.id))}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedIds(prev => [...new Set([...prev, ...paged.map(c => c.id)])]);
                    } else {
                      setSelectedIds(prev => prev.filter(id => !paged.map(c => c.id).includes(id)));
                    }
                  }}
                />
              </th>
              <th className={thClass} onClick={() => handleSort('name')}>
                <span className="flex items-center">Name <SortIcon col="name" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('email')}>
                <span className="flex items-center">Email <SortIcon col="email" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('phone')}>
                <span className="flex items-center">Phone <SortIcon col="phone" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('jobTitle')}>
                <span className="flex items-center">Job Title <SortIcon col="jobTitle" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('company')}>
                <span className="flex items-center">Company <SortIcon col="company" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className="px-6 py-3">Lifecycle Stage</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paged.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-10 text-center text-gray-400 text-sm">
                  {search || activeFiltersCount > 0 ? 'No contacts match your search or filters.' : 'No contacts yet. Create your first contact.'}
                </td>
              </tr>
            )}
            {paged.map(contact => {
              const company = state.companies.find(c => c.id === contact.companyId);
              const initials = `${(contact.firstName || '')[0] || ''}${(contact.lastName || '')[0] || ''}`.toUpperCase();
              const isHighlighted = contact.id === highlightId;
              return (
                <tr key={contact.id} className={`hover:bg-gray-50 group transition-colors ${isHighlighted ? 'bg-yellow-50 ring-2 ring-inset ring-yellow-400' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedIds.includes(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-xubspot flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <button
                        onClick={() => openEdit(contact)}
                        className="font-medium text-xubspot-text hover:text-xubspot cursor-pointer text-left"
                      >
                        {contact.firstName} {contact.lastName}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-600">{contact.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{contact.phone || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{contact.jobTitle || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{company?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    {contact.lifecycleStage && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                        {contact.lifecycleStage}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="invisible group-hover:visible flex justify-end gap-2">
                      <button
                        onClick={() => openCompose(contact)}
                        className="p-1 text-gray-400 hover:text-xubspot"
                        title="Send email"
                      ><Mail size={16} /></button>
                      <button
                        onClick={() => openEdit(contact)}
                        className="p-1 text-gray-400 hover:text-xubspot"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination footer */}
        {totalFiltered > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {totalFiltered === 0 ? 0 : startIdx + 1}–{Math.min(startIdx + pageSize, totalFiltered)} of {totalFiltered} contacts
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                &lt; Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded text-xs font-medium ${page === p ? 'bg-xubspot text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next &gt;
              </button>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-xubspot"
              >
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
              <h3 className="text-lg font-bold text-gray-800">{editContact ? 'Edit Contact' : 'Create Contact'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  required
                  type="email"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.jobTitle}
                  onChange={e => setForm({ ...form, jobTitle: e.target.value })}
                />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lifecycle Stage</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.lifecycleStage}
                    onChange={e => setForm({ ...form, lifecycleStage: e.target.value })}
                  >
                    {LIFECYCLE_STAGES.map(s => (
                      <option key={s} value={s} className="capitalize">{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Status</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.leadStatus}
                    onChange={e => setForm({ ...form, leadStatus: e.target.value })}
                  >
                    {LEAD_STATUSES.map(s => (
                      <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                  />
                </div>
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
                  {editContact ? 'Save Changes' : 'Create Contact'}
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
                ? `Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`
                : `Are you sure you want to delete ${deleteConfirm.count} selected contact(s)? This action cannot be undone.`}
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

      {/* Compose Email Stub */}
      {composeTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">New Email</h3>
              <button onClick={() => setComposeTarget(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">To</label>
                <div className="px-3 py-2 border border-gray-200 rounded bg-gray-50 text-sm text-gray-700">
                  {composeTarget.firstName} {composeTarget.lastName} &lt;{composeTarget.email}&gt;
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Subject</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  placeholder="Email subject"
                  value={composeForm.subject}
                  onChange={e => setComposeForm({ ...composeForm, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Message</label>
                <textarea
                  rows={5}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot resize-none"
                  placeholder="Type your message..."
                  value={composeForm.body}
                  onChange={e => setComposeForm({ ...composeForm, body: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setComposeTarget(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">Discard</button>
              <button
                onClick={saveEmailDraft}
                className="px-4 py-2 bg-xubspot text-white rounded text-sm hover:bg-xubspot-hover"
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
