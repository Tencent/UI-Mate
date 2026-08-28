import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, MoreHorizontal, X, Star, Mail, MousePointer, Eye, UserCheck, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const avatarColors = ['#007C89', '#E87040', '#7B1FA2', '#1565C0', '#2E7D32', '#C2185B', '#E65100', '#512DA8'];

export default function ContactDetail() {
  const { state, updateContact, deleteContact, addToast } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const contact = state.contacts.find(c => c.id === id);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!contact) { navigate('/audience'); return null; }

  const colorIdx = contact.firstName ? contact.firstName.charCodeAt(0) % avatarColors.length : 0;

  const startEdit = (field) => {
    setEditingField(field);
    setEditValue(contact[field] || '');
  };

  const saveField = () => {
    if (editingField) {
      updateContact(id, { [editingField]: editValue });
      addToast('Saved');
      setEditingField(null);
    }
  };

  const addTagToContact = () => {
    if (newTag && !contact.tags.includes(newTag)) {
      updateContact(id, { tags: [...contact.tags, newTag] });
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    updateContact(id, { tags: contact.tags.filter(t => t !== tag) });
  };

  const handleDelete = () => {
    deleteContact(id);
    addToast('Contact deleted');
    navigate('/audience');
  };

  const editableField = (label, field) => (
    <div style={{ marginBottom: 12 }}>
      <div className="text-xs text-muted">{label}</div>
      {editingField === field ? (
        <div className="inline-edit">
          <input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
            onBlur={saveField} onKeyDown={e => { if (e.key === 'Enter') saveField(); }} />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="text-sm">{contact[field] || '—'}</span>
          <button onClick={() => startEdit(field)} style={{ background: 'none', border: 'none', color: '#707070', cursor: 'pointer', padding: 2 }}><Edit3 size={12} /></button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/audience')}><ArrowLeft size={16} /> All Contacts</button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="contact-avatar" style={{ background: avatarColors[colorIdx] }}>
            {contact.firstName?.[0]}{contact.lastName?.[0]}
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>{contact.firstName} {contact.lastName}</h2>
            <p className="text-muted">{contact.email}</p>
            <span className={`badge badge-${contact.status}`}>{contact.status}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outlined" onClick={() => startEdit('firstName')}>Edit</button>
          <div className="action-menu">
            <button className="action-menu-btn" onClick={() => setShowMenu(!showMenu)}><MoreHorizontal size={16} /></button>
            {showMenu && (
              <div className="action-menu-dropdown">
                <button className="action-menu-item danger" onClick={() => { setShowMenu(false); setDeleteConfirm(true); }}><Trash2 size={14} style={{ marginRight: 8 }} />Delete Contact</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="two-columns-65-35">
        <div>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Activity</h3>
            <div className="activity-timeline">
              {(contact.activity || []).map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-desc">
                    {a.type === 'open' && <Eye size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: '#007C89' }} />}
                    {a.type === 'click' && <MousePointer size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: '#007C89' }} />}
                    {a.type === 'subscribe' && <UserCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: '#2E7D32' }} />}
                    {a.type === 'unsubscribe' && <X size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: '#D5432F' }} />}
                    {a.type === 'bounce' && <Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: '#E65100' }} />}
                    {a.description}
                  </div>
                  <div className="activity-date">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Contact Info</h3>
            {editableField('First Name', 'firstName')}
            {editableField('Last Name', 'lastName')}
            {editableField('Email', 'email')}
            {editableField('Phone', 'phone')}
            {editableField('Birthday', 'birthday')}
            <div style={{ marginBottom: 12 }}>
              <div className="text-xs text-muted">Location</div>
              <span className="text-sm">{contact.location ? `${contact.location.city}${contact.location.state ? `, ${contact.location.state}` : ''}, ${contact.location.country}` : '—'}</span>
            </div>
          </div>

          <div className="card mb-16">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Tags</h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {contact.tags.map(t => (
                <span key={t} className="tag-chip">{t} <button onClick={() => removeTag(t)}><X size={12} /></button></span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <select value={newTag} onChange={e => setNewTag(e.target.value)} style={{ flex: 1, height: 32, border: '1px solid #E5E5E5', borderRadius: 4, padding: '0 8px', fontSize: 13 }}>
                <option value="">Add a tag...</option>
                {state.tags.filter(t => !contact.tags.includes(t.name)).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
              <button className="btn btn-sm btn-outlined" onClick={addTagToContact} disabled={!newTag}>Add</button>
            </div>
          </div>

          <div className="card mb-16">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Notes</h3>
            <textarea
              value={contact.notes || ''}
              onChange={e => updateContact(id, { notes: e.target.value })}
              placeholder="Add notes..."
              style={{ width: '100%', minHeight: 80, border: '1px solid #E5E5E5', borderRadius: 4, padding: 8, fontSize: 14, resize: 'vertical', outline: 'none' }}
            />
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Engagement</h3>
            <div style={{ marginBottom: 8 }}>
              <div className="text-xs text-muted">Rating</div>
              <div className="star-rating">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} className={`star ${s <= contact.rating ? 'filled' : ''}`} fill={s <= contact.rating ? '#FFE01B' : 'none'} />)}
              </div>
            </div>
            <div style={{ marginBottom: 8 }}><div className="text-xs text-muted">Open Rate</div><span>{(contact.openRate * 100).toFixed(0)}%</span></div>
            <div style={{ marginBottom: 8 }}><div className="text-xs text-muted">Click Rate</div><span>{(contact.clickRate * 100).toFixed(0)}%</span></div>
            <div><div className="text-xs text-muted">Member Since</div><span>{new Date(contact.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(false)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Contact</h2></div>
            <div className="modal-body"><p>Are you sure you want to delete "{contact.firstName} {contact.lastName}"? This action cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
