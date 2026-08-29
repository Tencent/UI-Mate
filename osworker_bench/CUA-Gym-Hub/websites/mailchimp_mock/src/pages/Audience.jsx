import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Upload, Star, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Audience() {
  const { state, addContact, deleteContact, addToast, updateContact } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [sort, setSort] = useState({ key: 'email', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', firstName: '', lastName: '', phone: '', birthday: '', tags: [], status: 'subscribed' });
  const [emailError, setEmailError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkTagAction, setBulkTagAction] = useState(null);
  const perPage = 25;

  let contacts = [...state.contacts];
  if (search) contacts = contacts.filter(c => `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase()));
  if (statusFilter !== 'all') contacts = contacts.filter(c => c.status === statusFilter);
  if (tagFilter) contacts = contacts.filter(c => c.tags?.includes(tagFilter));

  contacts.sort((a, b) => {
    const av = a[sort.key] || '';
    const bv = b[sort.key] || '';
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  const total = contacts.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = contacts.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map(c => c.id)));
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleAddContact = () => {
    if (!newContact.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    const contact = {
      id: `contact_${Date.now()}`,
      audienceId: 'aud_1',
      email: newContact.email,
      firstName: newContact.firstName,
      lastName: newContact.lastName,
      phone: newContact.phone,
      status: newContact.status,
      tags: newContact.tags,
      source: 'Manual',
      rating: 1,
      location: { city: '', state: '', country: '' },
      birthday: newContact.birthday,
      notes: '',
      openRate: 0,
      clickRate: 0,
      lastOpened: null,
      lastClicked: null,
      subscribedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      activity: [{ type: 'subscribe', description: 'Added manually', date: new Date().toISOString() }]
    };
    addContact(contact);
    addToast('Contact added successfully');
    setShowAddModal(false);
    setNewContact({ email: '', firstName: '', lastName: '', phone: '', birthday: '', tags: [], status: 'subscribed' });
    setEmailError('');
  };

  const handleBulkDelete = () => {
    selected.forEach(id => deleteContact(id));
    addToast(`${selected.size} contacts deleted`);
    setSelected(new Set());
  };

  const handleBulkTag = (tagName) => {
    selected.forEach(id => {
      const contact = state.contacts.find(c => c.id === id);
      if (contact && !contact.tags.includes(tagName)) {
        updateContact(id, { tags: [...contact.tags, tagName] });
      }
    });
    addToast(`Tag "${tagName}" added to ${selected.size} contacts`);
    setBulkTagAction(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>All Contacts</h1>
          <p className="text-muted text-sm">{state.audiences[0]?.name} &middot; {state.audiences[0]?.stats?.totalContacts?.toLocaleString()} contacts</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Plus size={16} /> Add Contact</button>
          <button className="btn btn-outlined" onClick={() => navigate('/audience/import')}><Upload size={16} /> Import</button>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#707070' }} />
          <input placeholder="Search contacts by name or email" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 34, width: '100%' }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Contacts</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="non-subscribed">Non-subscribed</option>
          <option value="cleaned">Cleaned</option>
        </select>
        <select value={tagFilter} onChange={e => { setTagFilter(e.target.value); setPage(1); }}>
          <option value="">All Tags</option>
          {state.tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="bulk-actions">
          <span>{selected.size} selected</span>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setBulkTagAction(bulkTagAction ? null : 'add')}>Add Tag</button>
            {bulkTagAction === 'add' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: 120 }}>
                {state.tags.map(t => (
                  <button key={t.id} className="action-menu-item" style={{ color: '#241C15' }} onClick={() => handleBulkTag(t.name)}>{t.name}</button>
                ))}
              </div>
            )}
          </div>
          <button className="danger" onClick={handleBulkDelete}>Delete</button>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleAll} /></th>
              <th onClick={() => handleSort('email')}>Email</th>
              <th onClick={() => handleSort('firstName')}>First Name</th>
              <th onClick={() => handleSort('lastName')}>Last Name</th>
              <th>Tags</th>
              <th>Status</th>
              <th onClick={() => handleSort('rating')}>Rating</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(c => (
              <tr key={c.id}>
                <td><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)} /></td>
                <td><a style={{ fontWeight: 500, cursor: 'pointer', color: '#007C89' }} onClick={() => navigate(`/audience/${c.id}`)}>{c.email}</a></td>
                <td>{c.firstName}</td>
                <td>{c.lastName}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(c.tags || []).slice(0, 3).map(t => <span key={t} className="tag-chip">{t}</span>)}
                    {(c.tags || []).length > 3 && <span className="tag-chip">+{c.tags.length - 3} more</span>}
                  </div>
                </td>
                <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                <td>
                  <div className="star-rating">
                    {[1,2,3,4,5].map(s => <Star key={s} size={14} className={`star ${s <= c.rating ? 'filled' : ''}`} fill={s <= c.rating ? '#FFE01B' : 'none'} />)}
                  </div>
                </td>
                <td className="text-muted text-sm">{c.lastOpened ? new Date(c.lastOpened).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>Showing {Math.min((page - 1) * perPage + 1, total)}-{Math.min(page * perPage, total)} of {total}</span>
        <div className="pagination-btns">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add New Contact</h2><button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>Email *</label>
                <input value={newContact.email} onChange={e => { setNewContact({ ...newContact, email: e.target.value }); setEmailError(''); }} placeholder="email@example.com" />
                {emailError && <div className="form-error">{emailError}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>First Name</label><input value={newContact.firstName} onChange={e => setNewContact({ ...newContact, firstName: e.target.value })} /></div>
                <div className="form-group"><label>Last Name</label><input value={newContact.lastName} onChange={e => setNewContact({ ...newContact, lastName: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Phone</label><input value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} /></div>
              <div className="form-group"><label>Birthday (MM/DD)</label><input value={newContact.birthday} onChange={e => setNewContact({ ...newContact, birthday: e.target.value })} placeholder="03/15" /></div>
              <div className="form-group">
                <label>Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {newContact.tags.map(t => (
                    <span key={t} className="tag-chip">{t} <button onClick={() => setNewContact({ ...newContact, tags: newContact.tags.filter(x => x !== t) })}><X size={12} /></button></span>
                  ))}
                </div>
                <select onChange={e => { if (e.target.value && !newContact.tags.includes(e.target.value)) setNewContact({ ...newContact, tags: [...newContact.tags, e.target.value] }); e.target.value = ''; }}>
                  <option value="">Add a tag...</option>
                  {state.tags.filter(t => !newContact.tags.includes(t.name)).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="radio" checked={newContact.status === 'subscribed'} onChange={() => setNewContact({ ...newContact, status: 'subscribed' })} /> Subscribed
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="radio" checked={newContact.status === 'non-subscribed'} onChange={() => setNewContact({ ...newContact, status: 'non-subscribed' })} /> Non-subscribed
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddContact}>Add Contact</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Contact</h2></div>
            <div className="modal-body"><p>Are you sure you want to delete this contact? This action cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteContact(deleteConfirm); addToast('Contact deleted'); setDeleteConfirm(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
