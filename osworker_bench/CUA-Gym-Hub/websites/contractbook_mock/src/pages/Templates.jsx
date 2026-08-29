import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, LayoutTemplate, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { showToast } from '../components/Toast';

const CATEGORIES = ['All', 'Service Agreements', 'NDAs', 'Employment', 'Procurement', 'Licensing', 'Partnerships', 'Real Estate'];
const TEMPLATE_CATEGORIES = ['Service Agreements', 'NDAs', 'Employment', 'Procurement', 'Licensing', 'Partnerships', 'Real Estate'];

function CreateTemplateModal({ onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(TEMPLATE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({ title: title.trim(), category, description: description.trim(), content: content.trim() || `<p>${title.trim()}</p>`, tags: [] });
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2>Create Template</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="form-label">Title <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input
              className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Software Development Agreement"
              value={title}
              onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(prev => ({ ...prev, title: undefined })); }}
              autoFocus
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {TEMPLATE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              className="input"
              placeholder="Brief description of this template..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label className="form-label">Content</label>
            <textarea
              className="input"
              placeholder="Enter template body content (HTML supported)..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              style={{ fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Create Template</button>
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ template, onClose, onUse }) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-lg" style={{ height: '80vh' }}>
        <div className="modal-header">
          <div>
            <h2>{template.title}</h2>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{template.category} · {template.description}</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ overflowY: 'auto' }}>
          <div
            className="contract-rendered"
            style={{ maxWidth: '100%' }}
            dangerouslySetInnerHTML={{ __html: template.content }}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => { onUse(template); onClose(); }}>
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Templates() {
  const { state, addContract, addTemplate } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const query = sid ? `?sid=${sid}` : '';
  const isSelect = searchParams.get('select') === 'true';

  const [category, setCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = state.templates.filter(t => category === 'All' || t.category === category);

  const handleUseTemplate = (template) => {
    const newContract = addContract({
      title: `${template.title} - Draft`,
      status: 'draft',
      content: template.content,
      templateId: template.id,
      folderId: null,
      tags: [...(template.tags || [])],
      parties: [
        {
          id: `party-${Date.now()}-a`,
          name: state.currentUser?.company || 'Acme Corporation',
          type: 'internal',
          signees: [],
        },
      ],
      value: null,
      currency: 'USD',
      notes: '',
      expiresAt: null,
      signedAt: null,
      sentAt: null,
      renewalDate: null,
      approvals: [],
      createdBy: state.currentUser?.id || 'user-1',
    });
    showToast(`Created contract from ${template.title}`, 'success');
    navigate(`/contracts/${newContract.id}${query}`, { state: { editMode: true } });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Templates</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          Create Template
        </button>
      </div>

      {isSelect && (
        <div style={{
          background: '#EEF2FF', border: '1px solid var(--color-primary)', borderRadius: 8,
          padding: '12px 16px', marginBottom: 16, fontSize: 14, color: 'var(--color-primary)', fontWeight: 500,
        }}>
          Select a template to create a new contract
        </div>
      )}

      {/* Category pills */}
      <div className="category-pills">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-pill ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <LayoutTemplate size={48} className="empty-state-icon" />
          <h3>No templates found</h3>
          <p>No templates in this category yet</p>
        </div>
      ) : (
        <div className="templates-grid">
          {filtered.map(template => (
            <div key={template.id} className="template-card">
              <div>
                <h3 className="template-title" onClick={() => setPreviewTemplate(template)}>
                  {template.title}
                </h3>
                <p className="template-desc">{template.description}</p>
              </div>
              <div className="template-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge`} style={{ background: '#EEF2FF', color: 'var(--color-primary)', fontSize: 10 }}>
                    {template.category}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    Used {template.usageCount} times
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleUseTemplate(template)}
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={handleUseTemplate}
        />
      )}

      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSave={(data) => {
            addTemplate(data);
            setShowCreateModal(false);
            showToast(`Template "${data.title}" created`, 'success');
          }}
        />
      )}
    </div>
  );
}
