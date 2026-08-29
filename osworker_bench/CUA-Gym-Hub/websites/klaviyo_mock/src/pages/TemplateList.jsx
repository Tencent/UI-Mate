import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const categoryColors = {
  outreach: '#4E7CFF',
  reminders: '#FB923C',
  confirmation: '#00D68F',
  seasonal: '#F87171',
  promotional: '#FBBF24',
  custom: '#6E6E8A'
};

export default function TemplateList() {
  const { state, addEntity, removeEntity } = useAppContext();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('custom');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categories = ['all', 'outreach', 'reminders', 'confirmation', 'seasonal', 'promotional', 'custom'];
  const filtered = categoryFilter === 'all' ? state.templates : state.templates.filter(t => t.category === categoryFilter);

  const template = selectedTemplate ? state.templates.find(t => t.id === selectedTemplate) : null;

  const handleDuplicate = (tmpl) => {
    const dup = { ...tmpl, id: `tmpl_${Date.now()}`, name: `${tmpl.name} (Copy)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    addEntity('templates', dup);
    setSelectedTemplate(dup.id);
  };

  const handleDelete = (tmplId) => {
    removeEntity('templates', tmplId);
    setDeleteTarget(null);
    setSelectedTemplate(null);
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;
    const newTmpl = {
      id: `tmpl_${Date.now()}`,
      name: newTemplateName,
      category: newTemplateCategory,
      channel: 'email',
      htmlContent: '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;padding:30px;"><p>Start building your email here.</p></div>',
      previewImageUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    };
    addEntity('templates', newTmpl);
    setNewTemplateName('');
    setShowCreateModal(false);
    setSelectedTemplate(newTmpl.id);
  };

  if (template) {
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-secondary" onClick={() => setSelectedTemplate(null)} style={{ fontSize: 13 }}>&larr; Back to Templates</button>
        </div>
        <div className="page-header">
          <h1 className="page-title">{template.name}</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => handleDuplicate(template)}>Duplicate</button>
            <button className="btn btn-danger" onClick={() => setDeleteTarget(template)}>Delete</button>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Preview</div>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 4, padding: 0, maxWidth: 620, margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: template.htmlContent }}></div>
        </div>
        <div className="card">
          <div className="card-title">Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><strong>Category:</strong> {template.category}</div>
            <div><strong>Channel:</strong> {template.channel}</div>
            <div><strong>Created:</strong> {new Date(template.createdAt).toLocaleDateString()}</div>
            <div><strong>Updated:</strong> {new Date(template.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>
        {deleteTarget && (
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Delete template</div>
              <p className="text-muted" style={{ marginBottom: 20 }}>Delete "{deleteTarget.name}"? Campaigns that already used this template will keep their saved content.</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteTarget.id)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Templates</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Create template</button>
      </div>

      <div className="tabs">
        {categories.map(c => (
          <button key={c} className={`tab ${categoryFilter === c ? 'active' : ''}`} onClick={() => setCategoryFilter(c)}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {filtered.map(t => (
          <div key={t.id} className="card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }} onClick={() => setSelectedTemplate(t.id)}>
            <div style={{ height: 120, background: `linear-gradient(135deg, ${categoryColors[t.category] || '#6E6E8A'}22, ${categoryColors[t.category] || '#6E6E8A'}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 32, opacity: 0.5 }}>&#9993;</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-scheduled" style={{ textTransform: 'capitalize' }}>{t.category}</span>
                <span className="text-muted" style={{ fontSize: 12 }}>{new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create Template</div>
            <div className="form-group">
              <label>Template name</label>
              <input type="text" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="Enter template name" autoFocus />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={newTemplateCategory} onChange={e => setNewTemplateCategory(e.target.value)}>
                {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateTemplate}>Create Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
