import React, { useState } from 'react';
import { Plus, Users, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { showToast } from '../components/Toast';

function ContactModal({ contact, onClose, onSave, onDelete }) {
  const isEdit = !!contact;
  const [form, setForm] = useState(contact || {
    firstName: '', lastName: '', email: '', company: '', jobTitle: '', phone: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.firstName?.trim()) e.firstName = 'First name is required';
    if (!form.lastName?.trim()) e.lastName = 'Last name is required';
    if (!form.email?.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Contact' : 'Add Contact'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="input" value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              {errors.firstName && <span className="form-error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="input" value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              {errors.lastName && <span className="form-error">{errors.lastName}</span>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="input" type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <input className="input" value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input className="input" value={form.jobTitle || ''} onChange={e => setForm({ ...form, jobTitle: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="input" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="input" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
        </div>
        <div className="modal-footer">
          {isEdit && (
            <button className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="confirm-dialog">
          <div className="confirm-dialog-box">
            <h3>Delete Contact</h3>
            <p>Are you sure you want to delete {form.firstName} {form.lastName}?</p>
            <div className="confirm-dialog-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { onDelete(contact.id); onClose(); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Contacts() {
  const { state, addContact, updateContact, deleteContact } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('firstName');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(dir => dir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = state.contacts.filter(c =>
    searchQuery === '' ||
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    if (sortField === 'firstName') {
      aVal = `${a.firstName} ${a.lastName}`;
      bVal = `${b.firstName} ${b.lastName}`;
    }
    const cmp = aVal.localeCompare(bVal);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const handleSave = (form) => {
    if (editContact) {
      updateContact({ ...form, id: editContact.id });
      showToast('Contact updated', 'success');
    } else {
      addContact(form);
      showToast('Contact added', 'success');
    }
    setShowModal(false);
    setEditContact(null);
  };

  const handleDelete = (id) => {
    deleteContact(id);
    showToast('Contact deleted', 'info');
    setShowModal(false);
    setEditContact(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Contacts</h1>
        <button className="btn btn-primary" onClick={() => { setEditContact(null); setShowModal(true); }}>
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <Users size={48} className="empty-state-icon" />
          <h3>No contacts found</h3>
          <p>{searchQuery ? `No contacts matching "${searchQuery}"` : 'Add your first contact to get started'}</p>
          {!searchQuery && (
            <button className="btn btn-primary" onClick={() => { setEditContact(null); setShowModal(true); }}>
              Add Contact
            </button>
          )}
        </div>
      ) : (
        <div className="contracts-table-wrap">
          <table className="table contacts-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('firstName')}>
                  NAME <SortIcon field="firstName" />
                </th>
                <th className="sortable" onClick={() => handleSort('email')}>
                  EMAIL <SortIcon field="email" />
                </th>
                <th className="sortable" onClick={() => handleSort('company')}>
                  COMPANY <SortIcon field="company" />
                </th>
                <th className="sortable" onClick={() => handleSort('jobTitle')}>
                  JOB TITLE <SortIcon field="jobTitle" />
                </th>
                <th>PHONE</th>
                <th className="sortable" onClick={() => handleSort('createdAt')}>
                  CREATED <SortIcon field="createdAt" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(contact => (
                <tr
                  key={contact.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setEditContact(contact); setShowModal(true); }}
                >
                  <td>
                    <div style={{ fontWeight: 600 }}>{contact.firstName} {contact.lastName}</div>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{contact.email}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{contact.company || '—'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{contact.jobTitle || '—'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{contact.phone || '—'}</td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
                    {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ContactModal
          contact={editContact}
          onClose={() => { setShowModal(false); setEditContact(null); }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
