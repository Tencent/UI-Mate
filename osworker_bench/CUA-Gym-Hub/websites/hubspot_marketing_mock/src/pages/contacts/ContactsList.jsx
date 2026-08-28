import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Search, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, Badge, SortableHeader, formatDate, getStatusBadge, getLifecycleBadge, Pagination, EmptyState, Drawer, FormField, ConfirmModal } from '../../components/ui/index.jsx';

const LIFECYCLE_OPTIONS = ['subscriber', 'lead', 'marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer', 'evangelist'];
const LEAD_STATUS_OPTIONS = ['new', 'open', 'in_progress', 'open_deal', 'unqualified', 'attempted_to_contact', 'connected'];

function CreateContactDrawer({ onClose, onSave }) {
  const { state } = useApp();
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', contactOwner: 'user-1',
    jobTitle: '', phone: '', lifecycleStage: 'lead', leadStatus: 'new',
    company: '', companyId: ''
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.firstName) e.firstName = 'First name is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <Drawer title="Create contact" onClose={onClose}>
      <div style={{ padding: 20 }}>
        <FormField label="Email" required>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@example.com" style={{ borderColor: errors.email ? 'var(--hs-danger)' : '' }} />
          {errors.email && <div style={{ color: 'var(--hs-danger)', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
        </FormField>
        <FormField label="First name" required>
          <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First name" style={{ borderColor: errors.firstName ? 'var(--hs-danger)' : '' }} />
          {errors.firstName && <div style={{ color: 'var(--hs-danger)', fontSize: 12, marginTop: 4 }}>{errors.firstName}</div>}
        </FormField>
        <FormField label="Last name">
          <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Last name" />
        </FormField>
        <FormField label="Contact owner">
          <select value={form.contactOwner} onChange={e => set('contactOwner', e.target.value)}>
            {(state.users || []).map(u => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Job title">
          <input value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder="Marketing Manager" />
        </FormField>
        <FormField label="Phone number">
          <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
        </FormField>
        <FormField label="Lifecycle stage">
          <select value={form.lifecycleStage} onChange={e => set('lifecycleStage', e.target.value)}>
            {LIFECYCLE_OPTIONS.map(o => <option key={o} value={o}>{o.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
          </select>
        </FormField>
        <FormField label="Lead status">
          <select value={form.leadStatus} onChange={e => set('leadStatus', e.target.value)}>
            {LEAD_STATUS_OPTIONS.map(o => <option key={o} value={o}>{o.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
          </select>
        </FormField>
        <FormField label="Company">
          <select value={form.companyId} onChange={e => {
            const co = (state.companies||[]).find(c=>c.id===e.target.value);
            set('companyId', e.target.value);
            set('company', co?.name || '');
          }}>
            <option value="">-- No company --</option>
            {(state.companies||[]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
      </div>
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--hs-border)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <button className="btn btn-primary" onClick={handleSubmit}>Create</button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Drawer>
  );
}

export default function ContactsList() {
  const { state, addItem, deleteItem, updateItem, showToast } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('createDate');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWorkflowPicker, setShowWorkflowPicker] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
  const PER_PAGE = 25;

  const contacts = state.contacts || [];
  const users = state.users || [];

  const filtered = useMemo(() => {
    let items = contacts;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone||'').includes(q)
      );
    }
    if (activeTab === 'mine') items = items.filter(c => c.contactOwner === 'user-1');
    if (filterOwner) items = items.filter(c => c.contactOwner === filterOwner);
    if (filterStage) items = items.filter(c => c.lifecycleStage === filterStage);
    return [...items].sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [contacts, search, activeTab, sortField, sortDir, filterOwner, filterStage]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selected.length === pageItems.length) setSelected([]);
    else setSelected(pageItems.map(c => c.id));
  };

  const handleCreate = (form) => {
    const id = `contact-${Date.now()}`;
    addItem('contacts', {
      id,
      ...form,
      createDate: new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
      source: 'direct_traffic',
      marketingStatus: 'marketing',
      city: '', state: '', country: 'United States',
      tags: [], notes: ''
    });
    setShowCreate(false);
    showToast('Contact created successfully', 'success');
  };

  const handleBulkDelete = () => {
    selected.forEach(id => deleteItem('contacts', id));
    setSelected([]);
    setShowConfirmDelete(false);
    showToast(`${selected.length} contact(s) deleted`, 'success');
  };

  const handleEnrollInWorkflow = () => {
    if (!selectedWorkflowId) return;
    selected.forEach(contactId => {
      const contact = (state.contacts || []).find(c => c.id === contactId);
      if (!contact) return;
      const enrolled = contact.enrolledWorkflows || [];
      if (!enrolled.includes(selectedWorkflowId)) {
        updateItem('contacts', contactId, { enrolledWorkflows: [...enrolled, selectedWorkflowId] });
      }
    });
    showToast(`${selected.length} contact(s) enrolled in workflow`, 'success');
    setShowWorkflowPicker(false);
    setSelectedWorkflowId('');
    setSelected([]);
  };

  const getUserName = (userId) => {
    const u = users.find(u => u.id === userId);
    return u ? `${u.firstName} ${u.lastName}` : 'Unassigned';
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Contacts</h1>
          <div className="record-count">{filtered.length} records</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost"><Download size={15} /> Import</button>
          <button className="btn btn-ghost">Actions ▾</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Create contact
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All contacts</div>
        <div className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>My contacts</div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--hs-text-muted)' }} />
          <input
            style={{ paddingLeft: 32 }}
            placeholder="Search name, phone, email"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="filter-btn" value={filterOwner} onChange={e => setFilterOwner(e.target.value)} style={{ cursor: 'pointer' }}>
          <option value="">Contact owner ▾</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
        </select>
        <select className="filter-btn" value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ cursor: 'pointer' }}>
          <option value="">Lifecycle stage ▾</option>
          {LIFECYCLE_OPTIONS.map(o => <option key={o} value={o}>{o.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
        </select>
        {(filterOwner || filterStage) && (
          <button className="btn btn-tertiary" onClick={() => { setFilterOwner(''); setFilterStage(''); }}>Clear filters</button>
        )}
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div style={{ background: 'var(--hs-table-selected)', border: '1px solid var(--hs-teal)', borderRadius: 4, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--hs-teal)' }}>{selected.length} selected</span>
          <button className="btn btn-ghost" style={{ fontSize: 13, padding: '4px 10px' }} onClick={() => setShowConfirmDelete(true)}>Delete</button>
          <button className="btn btn-ghost" style={{ fontSize: 13, padding: '4px 10px' }} onClick={() => { setSelectedWorkflowId(''); setShowWorkflowPicker(true); }}>Enroll in workflow</button>
          <button onClick={() => setSelected([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-text-muted)' }}>✕</button>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {pageItems.length === 0 ? (
          <EmptyState
            icon="👤"
            title="No contacts found"
            description={search ? `No contacts match "${search}"` : "You haven't created any contacts yet."}
            actionLabel={!search ? "Create contact" : undefined}
            onAction={!search ? () => setShowCreate(true) : undefined}
          />
        ) : (
          <>
            <table className="hs-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" checked={selected.length === pageItems.length && pageItems.length > 0} onChange={toggleSelectAll} />
                  </th>
                  <SortableHeader label="Name" field="firstName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Email" field="email" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th>Phone</th>
                  <th>Contact Owner</th>
                  <SortableHeader label="Create Date" field="createDate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th>Lifecycle Stage</th>
                  <th>Lead Status</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(contact => (
                  <tr
                    key={contact.id}
                    className={selected.includes(contact.id) ? 'selected' : ''}
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.includes(contact.id)} onChange={() => toggleSelect(contact.id)} onClick={e => e.stopPropagation()} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar firstName={contact.firstName} lastName={contact.lastName} size={28} id={contact.id} />
                        <a className="link" style={{ color: 'var(--hs-teal)', fontWeight: 500 }}>
                          {contact.firstName} {contact.lastName}
                        </a>
                      </div>
                    </td>
                    <td><a href={`mailto:${contact.email}`} onClick={e=>e.stopPropagation()} style={{ color: 'var(--hs-teal)' }}>{contact.email}</a></td>
                    <td style={{ color: 'var(--hs-text-secondary)' }}>{contact.phone || '—'}</td>
                    <td style={{ color: 'var(--hs-text-secondary)' }}>{getUserName(contact.contactOwner)}</td>
                    <td style={{ color: 'var(--hs-text-secondary)' }}>{formatDate(contact.createDate)}</td>
                    <td>{getLifecycleBadge(contact.lifecycleStage)}</td>
                    <td>{getStatusBadge(contact.leadStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} />
          </>
        )}
      </div>

      {showCreate && <CreateContactDrawer onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {showConfirmDelete && (
        <ConfirmModal
          title="Delete contacts?"
          description={`Are you sure you want to delete ${selected.length} contact(s)? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
      {showWorkflowPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 6, width: 460, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hs-border)' }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Enroll {selected.length} contact(s) in workflow</span>
            </div>
            <div style={{ padding: '20px' }}>
              {(state.workflows || []).filter(w => w.status === 'active').length === 0 ? (
                <div style={{ color: 'var(--hs-text-muted)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>No active workflows available.</div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Select a workflow:</div>
                  {(state.workflows || []).filter(w => w.status === 'active').map(w => (
                    <label key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 4, cursor: 'pointer', marginBottom: 4, background: selectedWorkflowId === w.id ? 'rgba(0,164,189,0.08)' : 'transparent', border: `1px solid ${selectedWorkflowId === w.id ? 'var(--hs-teal)' : 'var(--hs-border)'}` }}>
                      <input type="radio" name="workflow" checked={selectedWorkflowId === w.id} onChange={() => setSelectedWorkflowId(w.id)} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{w.name}</div>
                        {w.description && <div style={{ fontSize: 12, color: 'var(--hs-text-muted)' }}>{w.description}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--hs-border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowWorkflowPicker(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={!selectedWorkflowId} onClick={handleEnrollInWorkflow}>Enroll</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
