import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Plus, DollarSign, X, Search, List, LayoutGrid, ChevronUp, ChevronDown, Edit2, Trash2, AlertTriangle, Download, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'react-router-dom';
import { downloadCsv, readCsvFile } from '../utils/crmFiles';

const EMPTY_FORM = {
  name: '', stage: 'appointment_scheduled', amount: '',
  closeDate: '', dealType: 'new_business', priority: 'medium',
  owner: 'Admin User', companyId: '', contactId: '', description: '', probability: ''
};

const stageColorBar = {
  appointment_scheduled: '#3B82F6',
  qualified_to_buy: '#F97316',
  presentation_scheduled: '#EAB308',
  decision_maker_bought_in: '#22C55E',
  contract_sent: '#06B6D4',
  closed_won: '#16A34A',
  closed_lost: '#EF4444',
};

const stageBadgeColor = {
  appointment_scheduled: 'bg-blue-100 text-blue-700',
  qualified_to_buy: 'bg-orange-100 text-orange-700',
  presentation_scheduled: 'bg-yellow-100 text-yellow-700',
  decision_maker_bought_in: 'bg-green-100 text-green-700',
  contract_sent: 'bg-cyan-100 text-cyan-700',
  closed_won: 'bg-green-200 text-green-800',
  closed_lost: 'bg-red-100 text-red-700',
};

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronDown size={13} className="ml-1 text-gray-300 opacity-50" />;
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="ml-1 text-xubspot" />
    : <ChevronDown size={13} className="ml-1 text-xubspot" />;
}

export default function Deals() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const importInputRef = useRef(null);

  // Clear highlight after 3s
  React.useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => setSearchParams({}, { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, setSearchParams]);

  const dealStages = state.dealStages || {};
  const stagesOrdered = Object.values(dealStages).sort((a, b) => (a.order || 0) - (b.order || 0));

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    if (destination.droppableId !== source.droppableId) {
      dispatch({
        type: 'UPDATE_DEAL_STAGE',
        payload: { dealId: draggableId, stage: destination.droppableId }
      });
    }
  };

  const getDealsByStage = (stageId) => filteredDeals.filter(deal => deal.stage === stageId);

  const openCreate = (stage = 'appointment_scheduled') => {
    setEditDeal(null);
    setForm({ ...EMPTY_FORM, stage });
    setIsModalOpen(true);
  };

  const openEdit = (deal) => {
    setEditDeal(deal);
    setForm({
      name: deal.name || '',
      stage: deal.stage || 'appointment_scheduled',
      amount: deal.amount || '',
      closeDate: deal.closeDate || '',
      dealType: deal.dealType || 'new_business',
      priority: deal.priority || 'medium',
      owner: deal.owner || 'Admin User',
      companyId: deal.companyId || '',
      contactId: (deal.contactIds && deal.contactIds[0]) || '',
      description: deal.description || '',
      probability: deal.probability || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      amount: form.amount ? parseFloat(form.amount) : 0,
      probability: form.probability !== '' ? parseInt(form.probability) : null,
      companyId: form.companyId || null,
      contactIds: form.contactId ? [form.contactId] : (editDeal?.contactIds || []),
    };
    if (editDeal) {
      dispatch({ type: 'UPDATE_DEAL', payload: { ...editDeal, ...payload, lastActivityDate: new Date().toISOString() } });
      addToast(`Deal "${payload.name}" updated successfully.`, 'success');
    } else {
      dispatch({
        type: 'ADD_DEAL',
        payload: { ...payload, id: uuidv4(), contactIds: [], createDate: new Date().toISOString(), lastActivityDate: new Date().toISOString() }
      });
      addToast(`Deal "${payload.name}" created successfully.`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const deal = state.deals.find(d => d.id === id);
    setDeleteConfirm({ id, name: deal?.name || 'this deal' });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    dispatch({ type: 'DELETE_DEAL', payload: deleteConfirm.id });
    addToast('Deal deleted.', 'success');
    setDeleteConfirm(null);
  };

  const handleExport = () => {
    downloadCsv('xubspot-deals.csv', sortedDeals, [
      { label: 'Deal Name', value: d => d.name },
      { label: 'Stage', value: d => d.stage },
      { label: 'Amount', value: d => d.amount },
      { label: 'Close Date', value: d => d.closeDate },
      { label: 'Deal Type', value: d => d.dealType },
      { label: 'Priority', value: d => d.priority },
      { label: 'Owner', value: d => d.owner },
      { label: 'Company', value: d => state.companies.find(c => c.id === d.companyId)?.name || '' },
      { label: 'Probability', value: d => d.probability },
      { label: 'Description', value: d => d.description },
    ]);
    addToast(`Exported ${sortedDeals.length} deal${sortedDeals.length !== 1 ? 's' : ''}.`, 'success');
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const rows = await readCsvFile(file);
      let imported = 0;
      rows.forEach(row => {
        const name = row.dealName || row.name || '';
        if (!name) return;
        const companyName = row.company || row.companyName || '';
        const company = state.companies.find(c => c.name.toLowerCase() === companyName.toLowerCase());
        dispatch({
          type: 'ADD_DEAL',
          payload: {
            id: uuidv4(),
            name,
            stage: row.stage || 'appointment_scheduled',
            amount: row.amount ? parseFloat(row.amount) : 0,
            closeDate: row.closeDate || '',
            dealType: row.dealType || 'new_business',
            priority: row.priority || 'medium',
            owner: row.owner || 'Admin User',
            companyId: company?.id || null,
            contactIds: [],
            probability: row.probability ? parseInt(row.probability) : null,
            description: row.description || '',
            createDate: new Date().toISOString(),
            lastActivityDate: new Date().toISOString(),
          }
        });
        imported += 1;
      });
      addToast(`Imported ${imported} deal${imported !== 1 ? 's' : ''} from ${file.name}.`, imported ? 'success' : 'warning');
    } catch (error) {
      addToast(`Could not import ${file.name}.`, 'error');
    }
  };

  // Filter/search
  const filteredDeals = state.deals.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    const company = state.companies.find(c => c.id === d.companyId);
    return (d.name || '').toLowerCase().includes(q) || (company?.name || '').toLowerCase().includes(q);
  });

  // Sorted for list view
  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    let aVal = '', bVal = '';
    if (sortCol === 'name') { aVal = (a.name || '').toLowerCase(); bVal = (b.name || '').toLowerCase(); }
    else if (sortCol === 'stage') { aVal = a.stage || ''; bVal = b.stage || ''; }
    else if (sortCol === 'amount') { return sortDir === 'asc' ? (a.amount || 0) - (b.amount || 0) : (b.amount || 0) - (a.amount || 0); }
    else if (sortCol === 'closeDate') { aVal = a.closeDate || ''; bVal = b.closeDate || ''; }
    else if (sortCol === 'owner') { aVal = (a.owner || '').toLowerCase(); bVal = (b.owner || '').toLowerCase(); }
    else if (sortCol === 'company') {
      const ca = state.companies.find(c => c.id === a.companyId);
      const cb = state.companies.find(c => c.id === b.companyId);
      aVal = (ca?.name || '').toLowerCase(); bVal = (cb?.name || '').toLowerCase();
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const thClass = "px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors text-xs uppercase text-gray-500 font-semibold";

  // Pagination for list view
  const totalDeals = sortedDeals.length;
  const totalPages = Math.ceil(totalDeals / pageSize);
  const startIdx = (page - 1) * pageSize;
  const pagedDeals = sortedDeals.slice(startIdx, startIdx + pageSize);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Deals Pipeline</h2>
          <p className="text-gray-500 text-sm">Sales Pipeline • {state.deals.length} deals</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${viewMode === 'board' ? 'bg-xubspot text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              title="Board view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm border-l border-gray-300 transition-colors ${viewMode === 'list' ? 'bg-xubspot text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              title="List view"
            >
              <List size={15} />
            </button>
          </div>
          <input ref={importInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} />
          <button
            onClick={() => importInputRef.current?.click()}
            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Upload size={14} /> Import
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => openCreate()}
            className="px-4 py-2 bg-xubspot text-white rounded-md text-sm font-medium hover:bg-xubspot-hover flex items-center gap-2"
          >
            <Plus size={16} /> Create Deal
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search deals by name or company..."
          className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {viewMode === 'board' ? (
        <div className="flex-1 overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full min-w-max pb-4">
              {stagesOrdered.map(stage => {
                const deals = getDealsByStage(stage.id);
                const totalAmount = deals.reduce((acc, d) => acc + (d.amount || 0), 0);
                const barColor = stageColorBar[stage.id] || '#FF7A59';

                return (
                  <div key={stage.id} className="w-72 flex flex-col bg-gray-50 rounded-lg border border-gray-200 max-h-[calc(100vh-280px)]">
                    <div className="p-3 bg-white rounded-t-lg border-b border-gray-200 sticky top-0 z-10">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide truncate">{stage.label}</h3>
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-bold text-gray-500 flex-shrink-0 ml-2">
                          {deals.length}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium mb-2">
                        ${totalAmount.toLocaleString()}
                      </div>
                      <div className="h-0.5 w-full rounded-full" style={{ backgroundColor: barColor }}></div>
                    </div>

                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-2 overflow-y-auto space-y-2 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                        >
                          {deals.map((deal, index) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-3 rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab group ${snapshot.isDragging ? 'shadow-lg ring-2 ring-xubspot rotate-1 opacity-90' : ''}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <button
                                      onClick={() => openEdit(deal)}
                                      className="font-medium text-xubspot-text hover:text-xubspot text-sm text-left leading-tight flex-1 mr-2"
                                    >
                                      {deal.name}
                                    </button>
                                    <button
                                      onClick={() => handleDelete(deal.id)}
                                      className="invisible group-hover:visible text-gray-300 hover:text-red-400 flex-shrink-0 mt-0.5"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                  <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm font-semibold text-gray-700 flex items-center">
                                      <DollarSign size={12} className="mr-0.5 text-gray-400" />
                                      {(deal.amount || 0).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                    </span>
                                  </div>
                                  {deal.companyId && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 truncate">
                                      {state.companies.find(c => c.id === deal.companyId)?.name}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          <button
                            onClick={() => openCreate(stage.id)}
                            className="w-full py-1.5 text-xs text-gray-400 hover:text-xubspot hover:bg-white rounded border border-dashed border-gray-200 hover:border-xubspot transition-colors mt-1"
                          >
                            + Add deal
                          </button>
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      ) : (
        /* List view */
        <div className="flex-1 overflow-auto">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className={thClass} onClick={() => handleSort('name')}>
                    <span className="flex items-center">Deal Name <SortIcon col="name" sortCol={sortCol} sortDir={sortDir} /></span>
                  </th>
                  <th className={thClass} onClick={() => handleSort('stage')}>
                    <span className="flex items-center">Stage <SortIcon col="stage" sortCol={sortCol} sortDir={sortDir} /></span>
                  </th>
                  <th className={thClass} onClick={() => handleSort('amount')}>
                    <span className="flex items-center">Amount <SortIcon col="amount" sortCol={sortCol} sortDir={sortDir} /></span>
                  </th>
                  <th className={thClass} onClick={() => handleSort('closeDate')}>
                    <span className="flex items-center">Close Date <SortIcon col="closeDate" sortCol={sortCol} sortDir={sortDir} /></span>
                  </th>
                  <th className={thClass} onClick={() => handleSort('owner')}>
                    <span className="flex items-center">Owner <SortIcon col="owner" sortCol={sortCol} sortDir={sortDir} /></span>
                  </th>
                  <th className={thClass} onClick={() => handleSort('company')}>
                    <span className="flex items-center">Company <SortIcon col="company" sortCol={sortCol} sortDir={sortDir} /></span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs uppercase text-gray-500 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedDeals.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-400 text-sm">
                      {search ? 'No deals match your search.' : 'No deals yet. Create your first deal.'}
                    </td>
                  </tr>
                )}
                {pagedDeals.map(deal => {
                  const company = state.companies.find(c => c.id === deal.companyId);
                  const stageLabel = dealStages[deal.stage]?.label || deal.stage;
                  const badgeClass = stageBadgeColor[deal.stage] || 'bg-gray-100 text-gray-600';
                  const isHighlighted = deal.id === highlightId;
                  return (
                    <tr key={deal.id} className={`hover:bg-gray-50 group transition-colors ${isHighlighted ? 'bg-yellow-50 ring-2 ring-inset ring-yellow-400' : ''}`}>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEdit(deal)}
                          className="font-medium text-xubspot-text hover:text-xubspot text-sm text-left"
                        >
                          {deal.name}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>{stageLabel}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        ${(deal.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{deal.owner || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{company?.name || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="invisible group-hover:visible flex justify-end gap-2">
                          <button onClick={() => openEdit(deal)} className="p-1 text-gray-400 hover:text-xubspot"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(deal.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {totalDeals > pageSize && (
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
                <span>Showing {startIdx + 1}–{Math.min(startIdx + pageSize, totalDeals)} of {totalDeals} deals</span>
                <div className="flex items-center gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">&lt; Prev</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                    return <button key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded text-xs font-medium ${page === p ? 'bg-xubspot text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>{p}</button>;
                  })}
                  <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">Next &gt;</button>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="ml-2 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-xubspot">
                    {[10, 25, 50].map(s => <option key={s} value={s}>{s} / page</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
          <div className="bg-white h-full w-full max-w-md shadow-xl flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{editDeal ? 'Edit Deal' : 'Create Deal'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Name <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Deal name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Stage</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.stage}
                  onChange={e => setForm({ ...form, stage: e.target.value })}
                >
                  {stagesOrdered.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Close Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.closeDate}
                    onChange={e => setForm({ ...form, closeDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Type</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.dealType}
                    onChange={e => setForm({ ...form, dealType: e.target.value })}
                  >
                    <option value="new_business">New Business</option>
                    <option value="existing_business">Existing Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Associated Company</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Associated Contact</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.contactId || ''}
                  onChange={e => setForm({ ...form, contactId: e.target.value })}
                >
                  <option value="">None</option>
                  {state.contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.probability}
                    onChange={e => setForm({ ...form, probability: e.target.value })}
                    placeholder="0–100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.owner}
                    onChange={e => setForm({ ...form, owner: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot resize-none"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Deal description..."
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
                  {editDeal ? 'Save Changes' : 'Create Deal'}
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
              Are you sure you want to delete deal "{deleteConfirm.name}"? This action cannot be undone.
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
