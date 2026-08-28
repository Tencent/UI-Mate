import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Plus, Building, Trash2, Edit2, Search, ChevronUp, ChevronDown, Download, Upload, AlertTriangle, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'react-router-dom';
import { downloadCsv, readCsvFile } from '../utils/crmFiles';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronDown size={13} className="ml-1 text-gray-300 opacity-50" />;
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="ml-1 text-xubspot" />
    : <ChevronDown size={13} className="ml-1 text-xubspot" />;
}

const INDUSTRIES = ['Technology', 'Marketing', 'Manufacturing', 'Finance', 'Healthcare', 'Education', 'Environmental Services', 'Design', 'Venture Capital', 'Other'];
const LIFECYCLE_STAGES = ['lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'];

const EMPTY_FORM = {
  name: '', domain: '', industry: '', phone: '', city: '', state: '',
  country: 'United States', numberOfEmployees: '', annualRevenue: '',
  lifecycleStage: 'lead', owner: 'Admin User', description: ''
};

export default function Companies() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterLifecycle, setFilterLifecycle] = useState('');
  const [domainPreview, setDomainPreview] = useState(null);
  const importInputRef = useRef(null);

  // Clear highlight after 3s
  React.useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => setSearchParams({}, { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, setSearchParams]);

  const openCreate = () => {
    setEditCompany(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (company) => {
    setEditCompany(company);
    setForm({
      name: company.name || '',
      domain: company.domain || '',
      industry: company.industry || '',
      phone: company.phone || '',
      city: company.city || '',
      state: company.state || '',
      country: company.country || 'United States',
      numberOfEmployees: company.numberOfEmployees || '',
      annualRevenue: company.annualRevenue || '',
      lifecycleStage: company.lifecycleStage || 'lead',
      owner: company.owner || 'Admin User',
      description: company.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      numberOfEmployees: form.numberOfEmployees ? parseInt(form.numberOfEmployees) : null,
      annualRevenue: form.annualRevenue ? parseFloat(form.annualRevenue) : null,
    };
    if (editCompany) {
      dispatch({ type: 'UPDATE_COMPANY', payload: { ...editCompany, ...payload } });
      addToast(`Company "${payload.name}" updated successfully.`, 'success');
    } else {
      dispatch({
        type: 'ADD_COMPANY',
        payload: { ...payload, id: uuidv4(), createDate: new Date().toISOString() }
      });
      addToast(`Company "${payload.name}" created successfully.`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const company = state.companies.find(c => c.id === id);
    setDeleteConfirm({ type: 'single', id, name: company?.name || 'this company' });
  };

  const handleBulkDelete = () => {
    setDeleteConfirm({ type: 'bulk', count: selectedIds.length });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'single') {
      dispatch({ type: 'DELETE_COMPANY', payload: deleteConfirm.id });
      setSelectedIds(prev => prev.filter(s => s !== deleteConfirm.id));
      addToast('Company deleted.', 'success');
    } else {
      selectedIds.forEach(id => dispatch({ type: 'DELETE_COMPANY', payload: id }));
      addToast(`${selectedIds.length} company(ies) deleted.`, 'success');
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

  const handleExport = () => {
    downloadCsv('xubspot-companies.csv', filtered, [
      { label: 'Company Name', value: c => c.name },
      { label: 'Domain', value: c => c.domain },
      { label: 'Industry', value: c => c.industry },
      { label: 'Phone', value: c => c.phone },
      { label: 'City', value: c => c.city },
      { label: 'State', value: c => c.state },
      { label: 'Country', value: c => c.country },
      { label: 'Employees', value: c => c.numberOfEmployees },
      { label: 'Annual Revenue', value: c => c.annualRevenue },
      { label: 'Lifecycle Stage', value: c => c.lifecycleStage },
      { label: 'Description', value: c => c.description },
    ]);
    addToast(`Exported ${filtered.length} compan${filtered.length === 1 ? 'y' : 'ies'}.`, 'success');
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const rows = await readCsvFile(file);
      let imported = 0;
      rows.forEach(row => {
        const name = row.companyName || row.name || '';
        if (!name) return;
        dispatch({
          type: 'ADD_COMPANY',
          payload: {
            id: uuidv4(),
            name,
            domain: row.domain || '',
            industry: row.industry || 'Other',
            phone: row.phone || '',
            city: row.city || '',
            state: row.state || '',
            country: row.country || 'United States',
            numberOfEmployees: row.employees || row.numberOfEmployees ? parseInt(row.employees || row.numberOfEmployees) : null,
            annualRevenue: row.annualRevenue ? parseFloat(row.annualRevenue) : null,
            lifecycleStage: row.lifecycleStage || 'lead',
            owner: 'Admin User',
            description: row.description || '',
            createDate: new Date().toISOString(),
          }
        });
        imported += 1;
      });
      addToast(`Imported ${imported} compan${imported === 1 ? 'y' : 'ies'} from ${file.name}.`, imported ? 'success' : 'warning');
    } catch (error) {
      addToast(`Could not import ${file.name}.`, 'error');
    }
  };

  const openDomainPreview = (company) => {
    setDomainPreview(company);
    dispatch({
      type: 'ADD_NOTE',
      payload: {
        id: uuidv4(),
        body: `Opened local website preview for ${company.domain}.`,
        associatedType: 'company',
        associatedId: company.id,
        createdBy: 'Admin User',
        createDate: new Date().toISOString(),
      }
    });
  };

  let filtered = state.companies.filter(c => {
    if (filterIndustry && c.industry !== filterIndustry) return false;
    if (filterLifecycle && c.lifecycleStage !== filterLifecycle) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) ||
      (c.domain || '').toLowerCase().includes(q) ||
      (c.industry || '').toLowerCase().includes(q);
  });

  filtered = [...filtered].sort((a, b) => {
    let aVal = '', bVal = '';
    if (sortCol === 'name') { aVal = (a.name || '').toLowerCase(); bVal = (b.name || '').toLowerCase(); }
    else if (sortCol === 'domain') { aVal = (a.domain || '').toLowerCase(); bVal = (b.domain || '').toLowerCase(); }
    else if (sortCol === 'industry') { aVal = (a.industry || '').toLowerCase(); bVal = (b.industry || '').toLowerCase(); }
    else if (sortCol === 'city') { aVal = (a.city || '').toLowerCase(); bVal = (b.city || '').toLowerCase(); }
    else if (sortCol === 'employees') { return sortDir === 'asc' ? (a.numberOfEmployees || 0) - (b.numberOfEmployees || 0) : (b.numberOfEmployees || 0) - (a.numberOfEmployees || 0); }
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
          <h2 className="text-2xl font-bold text-gray-800">Companies</h2>
          <p className="text-gray-500 text-sm">{state.companies.length} records</p>
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
            <Plus size={16} /> Create Company
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search company name, domain, industry..."
          className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <select
          className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
          value={filterIndustry}
          onChange={e => { setFilterIndustry(e.target.value); setPage(1); }}
        >
          <option value="">All Industries</option>
          {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
        </select>
        <select
          className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
          value={filterLifecycle}
          onChange={e => { setFilterLifecycle(e.target.value); setPage(1); }}
        >
          <option value="">All Lifecycle Stages</option>
          {LIFECYCLE_STAGES.map(s => <option key={s} value={s} className="capitalize">{s.toUpperCase()}</option>)}
        </select>
        {(filterIndustry || filterLifecycle) && (
          <button
            onClick={() => { setFilterIndustry(''); setFilterLifecycle(''); setPage(1); }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-red-500 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Clear Filters
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
                <span className="flex items-center">Company Name <SortIcon col="name" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('domain')}>
                <span className="flex items-center">Domain <SortIcon col="domain" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('industry')}>
                <span className="flex items-center">Industry <SortIcon col="industry" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('city')}>
                <span className="flex items-center">City / State <SortIcon col="city" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('employees')}>
                <span className="flex items-center">Employees <SortIcon col="employees" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className="px-6 py-3">Associated Contacts</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paged.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-10 text-center text-gray-400 text-sm">
                  {search ? 'No companies match your search.' : 'No companies yet.'}
                </td>
              </tr>
            )}
            {paged.map(company => {
              const contacts = state.contacts.filter(c => c.companyId === company.id);
              const isHighlighted = company.id === highlightId;
              return (
                <tr key={company.id} className={`hover:bg-gray-50 group transition-colors ${isHighlighted ? 'bg-yellow-50 ring-2 ring-inset ring-yellow-400' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedIds.includes(company.id)}
                      onChange={() => toggleSelect(company.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <Building size={16} className="text-gray-500" />
                      </div>
                      <button
                        onClick={() => openEdit(company)}
                        className="font-medium text-xubspot-text hover:text-xubspot cursor-pointer text-left"
                      >
                        {company.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {company.domain ? (
                      <a
                        href={`https://${company.domain}`}
                        className="text-blue-600 hover:underline"
                        onClick={e => { e.preventDefault(); openDomainPreview(company); }}
                      >
                        {company.domain}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{company.industry || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {company.city && company.state ? `${company.city}, ${company.state}` : company.city || company.state || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {company.numberOfEmployees ? company.numberOfEmployees.toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex -space-x-1 items-center">
                      {contacts.slice(0, 4).map(c => {
                        const initials = `${(c.firstName || '')[0] || ''}${(c.lastName || '')[0] || ''}`.toUpperCase();
                        return (
                          <div
                            key={c.id}
                            title={`${c.firstName} ${c.lastName}`}
                            className="w-6 h-6 rounded-full bg-xubspot border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                          >
                            {initials}
                          </div>
                        );
                      })}
                      {contacts.length > 4 && (
                        <span className="text-xs text-gray-500 ml-1">+{contacts.length - 4}</span>
                      )}
                      {contacts.length === 0 && <span className="text-gray-400 italic">No contacts</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="invisible group-hover:visible flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(company)}
                        className="p-1 text-gray-400 hover:text-xubspot"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
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

        {totalFiltered > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {startIdx + 1}–{Math.min(startIdx + pageSize, totalFiltered)} of {totalFiltered} companies</span>
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
              <h3 className="text-lg font-bold text-gray-800">{editCompany ? 'Edit Company' : 'Create Company'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.domain}
                  onChange={e => setForm({ ...form, domain: e.target.value })}
                  placeholder="example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.industry}
                  onChange={e => setForm({ ...form, industry: e.target.value })}
                >
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.numberOfEmployees}
                    onChange={e => setForm({ ...form, numberOfEmployees: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Revenue ($)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.annualRevenue}
                    onChange={e => setForm({ ...form, annualRevenue: e.target.value })}
                  />
                </div>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot resize-none"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
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
                  {editCompany ? 'Save Changes' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {domainPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{domainPreview.name}</h3>
                <p className="text-sm text-blue-600">{domainPreview.domain}</p>
              </div>
              <button onClick={() => setDomainPreview(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border border-gray-200 rounded-md bg-gray-50 p-4">
                <div className="h-24 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  Local website preview
                </div>
                <p className="mt-3 text-sm text-gray-700">{domainPreview.description || 'No description available.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Industry</span><div className="font-medium text-gray-800">{domainPreview.industry || '—'}</div></div>
                <div><span className="text-gray-500">Employees</span><div className="font-medium text-gray-800">{domainPreview.numberOfEmployees ? domainPreview.numberOfEmployees.toLocaleString() : '—'}</div></div>
                <div><span className="text-gray-500">Phone</span><div className="font-medium text-gray-800">{domainPreview.phone || '—'}</div></div>
                <div><span className="text-gray-500">Location</span><div className="font-medium text-gray-800">{[domainPreview.city, domainPreview.state].filter(Boolean).join(', ') || '—'}</div></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setDomainPreview(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">Close</button>
              <button onClick={() => { openEdit(domainPreview); setDomainPreview(null); }} className="px-4 py-2 bg-xubspot text-white rounded text-sm hover:bg-xubspot-hover">Edit company</button>
            </div>
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
                : `Are you sure you want to delete ${deleteConfirm.count} selected company(ies)? This action cannot be undone.`}
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
