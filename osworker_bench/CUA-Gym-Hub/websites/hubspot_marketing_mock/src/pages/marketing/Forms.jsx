import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, Trash2, GripVertical, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, getStatusBadge, Pagination, EmptyState, FormField } from '../../components/ui/index.jsx';

const FORM_TYPES = [
  { type: 'email', label: 'Email', icon: '✉' },
  { type: 'text', label: 'First Name', icon: '📝' },
  { type: 'text', label: 'Last Name', icon: '📝' },
  { type: 'text', label: 'Phone', icon: '📞' },
  { type: 'text', label: 'Company', icon: '🏢' },
  { type: 'select', label: 'Dropdown', icon: '▾' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑' },
  { type: 'radio', label: 'Radio', icon: '◉' },
  { type: 'textarea', label: 'Multi-line text', icon: '¶' },
];

// Forms List
export function FormsList() {
  const { state, addItem, showToast } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('forms');
  const [selectedFormFilter, setSelectedFormFilter] = useState('all');
  const PER_PAGE = 25;

  const forms = state.forms || [];
  const submissions = state.formSubmissions || [];

  const filtered = useMemo(() => {
    let items = forms;
    if (search) items = items.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') items = items.filter(f => f.status === statusFilter);
    return items;
  }, [forms, search, statusFilter]);

  const filteredSubmissions = useMemo(() => {
    if (selectedFormFilter === 'all') return submissions;
    return submissions.filter(s => s.formId === selectedFormFilter);
  }, [submissions, selectedFormFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCreate = () => navigate('/marketing/forms/new');

  const typeLabel = (t) => ({ embedded: 'Embedded', popup: 'Pop-up', standalone: 'Standalone', slide_in: 'Slide-in', dropdown_banner: 'Banner' }[t] || t);

  const getFormName = (formId) => forms.find(f => f.id === formId)?.name || formId;
  const getContactName = (contactId) => {
    const c = (state.contacts || []).find(c => c.id === contactId);
    return c ? `${c.firstName} ${c.lastName}` : contactId;
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left"><h1>Forms</h1></div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handleCreate}><Plus size={15} /> Create form</button>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'forms' ? 'active' : ''}`} onClick={() => setActiveTab('forms')}>Forms</div>
        <div className={`tab ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
          Submissions <span style={{ fontSize: 11, background: 'var(--hs-border)', borderRadius: 10, padding: '1px 7px', marginLeft: 4 }}>{submissions.length}</span>
        </div>
      </div>

      {activeTab === 'forms' && (
        <>
          <div className="filter-bar">
            <div style={{ position: 'relative', flex: '0 0 260px' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--hs-text-muted)' }} />
              <input style={{ paddingLeft: 32 }} placeholder="Search forms..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            {['all','published','draft'].map(s => (
              <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)} forms
              </button>
            ))}
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {pageItems.length === 0 ? (
              <EmptyState icon="📋" title="No forms yet" description="Forms help you collect leads and grow your contact database." actionLabel="Create your first form" onAction={handleCreate} />
            ) : (
              <>
                <table className="hs-table">
                  <thead>
                    <tr>
                      <th>Form Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Submissions</th>
                      <th>Sub. Rate</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map(form => (
                      <tr key={form.id} onClick={() => navigate(`/marketing/forms/${form.id}`)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 500, color: 'var(--hs-teal)' }}>{form.name}</td>
                        <td><span className="badge badge-gray">{typeLabel(form.type)}</span></td>
                        <td>{getStatusBadge(form.status)}</td>
                        <td>{form.views?.toLocaleString()}</td>
                        <td>{form.submissions?.toLocaleString()}</td>
                        <td>{form.submissionRate?.toFixed(2)}%</td>
                        <td style={{ color: 'var(--hs-text-secondary)' }}>{formatDate(form.createdDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} />
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'submissions' && (
        <>
          <div className="filter-bar">
            <select value={selectedFormFilter} onChange={e => setSelectedFormFilter(e.target.value)} style={{ width: 'auto', padding: '8px 12px' }}>
              <option value="all">All forms</option>
              {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {filteredSubmissions.length === 0 ? (
              <EmptyState icon="📋" title="No submissions yet" description="Form submissions will appear here as contacts fill out your forms." />
            ) : (
              <table className="hs-table">
                <thead>
                  <tr>
                    <th>Form</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Submitted</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map(sub => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 500 }}>{getFormName(sub.formId)}</td>
                      <td style={{ color: 'var(--hs-teal)' }}>{getContactName(sub.contactId)}</td>
                      <td style={{ color: 'var(--hs-text-secondary)' }}>{sub.data?.email || '—'}</td>
                      <td style={{ color: 'var(--hs-text-secondary)' }}>{formatDate(sub.submittedAt)}</td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--hs-text-muted)' }}>
                          {Object.keys(sub.data || {}).length} fields
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Form Builder
function FieldPreview({ field, selected, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        border: `2px solid ${selected ? 'var(--hs-teal)' : 'var(--hs-border)'}`,
        borderRadius: 4,
        marginBottom: 8,
        background: selected ? 'rgba(0,164,189,0.03)' : '#fff',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <GripVertical size={14} style={{ color: 'var(--hs-text-muted)' }} />
        <label style={{ fontSize: 13, fontWeight: 500 }}>
          {field.label}
          {field.required && <span style={{ color: 'var(--hs-danger)', marginLeft: 4 }}>*</span>}
        </label>
        {selected && (
          <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-danger)' }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {field.type === 'textarea' ? (
        <textarea placeholder={field.placeholder || ''} style={{ resize: 'none', height: 60, pointerEvents: 'none' }} readOnly />
      ) : field.type === 'select' ? (
        <select style={{ pointerEvents: 'none' }}>
          <option>{field.placeholder || 'Select an option'}</option>
          {(field.options||[]).map((o,i) => <option key={i}>{o}</option>)}
        </select>
      ) : field.type === 'checkbox' ? (
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'default' }}>
          <input type="checkbox" style={{ width: 16, marginTop: 2, pointerEvents: 'none' }} readOnly />
          <span style={{ fontSize: 13 }}>{field.label}</span>
        </label>
      ) : field.type === 'radio' ? (
        <div style={{ pointerEvents: 'none' }}>
          {(field.options||[]).slice(0,3).map((o,i) => (
            <label key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, cursor: 'default' }}>
              <input type="radio" style={{ pointerEvents: 'none' }} readOnly /> <span style={{ fontSize: 13 }}>{o}</span>
            </label>
          ))}
        </div>
      ) : (
        <input type={field.type === 'email' ? 'email' : 'text'} placeholder={field.placeholder || ''} style={{ pointerEvents: 'none' }} readOnly />
      )}
    </div>
  );
}

export function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addItem, updateItem, showToast } = useApp();

  const isNew = !id || id === 'new';
  const existing = isNew ? null : state.forms?.find(f => f.id === id);

  const [formData, setFormData] = useState(() => existing || {
    id: `form-${Date.now()}`,
    name: 'Untitled form',
    type: 'embedded',
    status: 'draft',
    views: 0,
    submissions: 0,
    submissionRate: 0,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    campaignId: null,
    fields: [
      { id: 'f-1', type: 'email', label: 'Email Address', required: true, placeholder: 'you@example.com' },
      { id: 'f-2', type: 'text', label: 'First Name', required: true, placeholder: 'John' }
    ],
    settings: {
      submitButtonText: 'Submit',
      redirectUrl: '',
      thankYouMessage: 'Thank you for your submission!',
      notifyEmails: ['sarah.johnson@acmecorp.com'],
      lifecycleStage: 'lead'
    }
  });

  const [activeTab, setActiveTab] = useState('build');
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(formData.name);
  const [showPreview, setShowPreview] = useState(false);

  const fields = formData.fields || [];
  const selectedField = fields.find(f => f.id === selectedFieldId);

  const addField = (type, label) => {
    const newField = {
      id: `f-${Date.now()}`,
      type,
      label,
      required: type === 'email',
      placeholder: type === 'email' ? 'you@example.com' : '',
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : []
    };
    setFormData(prev => ({ ...prev, fields: [...(prev.fields||[]), newField] }));
    setSelectedFieldId(newField.id);
  };

  const updateField = (fieldId, updates) => {
    setFormData(prev => ({ ...prev, fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f) }));
  };

  const deleteField = (fieldId) => {
    setFormData(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== fieldId) }));
    setSelectedFieldId(null);
  };

  const handleSave = (publish = false) => {
    const updated = { ...formData, name: nameValue, updatedDate: new Date().toISOString(), ...(publish ? { status: 'published' } : {}) };
    if (isNew) addItem('forms', updated);
    else updateItem('forms', id, updated);
    showToast(publish ? 'Form published' : 'Form saved', 'success');
    navigate('/marketing/forms');
  };

  const FIELD_PALETTE = [
    { category: 'Common', fields: [{ type: 'email', label: 'Email' }, { type: 'text', label: 'First Name' }, { type: 'text', label: 'Last Name' }, { type: 'text', label: 'Phone' }, { type: 'text', label: 'Company' }] },
    { category: 'Advanced', fields: [{ type: 'select', label: 'Dropdown' }, { type: 'checkbox', label: 'Checkbox' }, { type: 'radio', label: 'Radio' }, { type: 'textarea', label: 'Multi-line text' }, { type: 'text', label: 'Single-line text' }] }
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid var(--hs-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/marketing/forms')} style={{ padding: '6px 10px', fontSize: 13 }}>← Back to forms</button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {editingName ? (
            <input autoFocus value={nameValue} onChange={e => setNameValue(e.target.value)} onBlur={() => setEditingName(false)} onKeyDown={e => { if(['Enter','Escape'].includes(e.key)) setEditingName(false); }} style={{ fontWeight: 600, fontSize: 15, border: 'none', borderBottom: '2px solid var(--hs-teal)', outline: 'none', textAlign: 'center', minWidth: 200, padding: '2px 8px' }} />
          ) : (
            <span onClick={() => setEditingName(true)} style={{ fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: '2px 8px', borderRadius: 3 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hs-table-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {nameValue}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowPreview(true)}>Preview</button>
          <button className="btn btn-secondary" onClick={() => handleSave(false)}>Save draft</button>
          <button className="btn btn-primary" onClick={() => handleSave(true)}>Publish</button>
        </div>
      </div>

      {/* Sub tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--hs-border)', display: 'flex', padding: '0 16px', flexShrink: 0 }}>
        {['build','options','style'].map(tab => (
          <div key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize', fontSize: 13 }}>
            {tab}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {activeTab === 'build' && (
          <>
            {/* Left: Field palette */}
            <div style={{ width: 240, flexShrink: 0, background: 'var(--hs-page-bg)', borderRight: '1px solid var(--hs-border)', overflowY: 'auto', padding: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Add form field</div>
              {FIELD_PALETTE.map(cat => (
                <div key={cat.category} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--hs-text-muted)', marginBottom: 8 }}>{cat.category}</div>
                  {cat.fields.map(f => (
                    <div key={f.label} onClick={() => addField(f.type, f.label)}
                      style={{ padding: '7px 10px', borderRadius: 3, cursor: 'pointer', background: '#fff', marginBottom: 4, border: '1px solid var(--hs-border)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hs-table-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      {f.label} <Plus size={12} style={{ color: 'var(--hs-text-muted)' }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Center: Form preview */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#E0E6EE', padding: 24, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 500, background: '#fff', borderRadius: 4, padding: '24px 28px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minHeight: 300 }} onClick={() => setSelectedFieldId(null)}>
                {fields.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--hs-text-muted)', fontSize: 14 }}>
                    Add fields from the left panel.
                  </div>
                ) : (
                  fields.map(field => (
                    <FieldPreview
                      key={field.id}
                      field={field}
                      selected={selectedFieldId === field.id}
                      onClick={e => { e.stopPropagation(); setSelectedFieldId(field.id); }}
                      onDelete={() => deleteField(field.id)}
                    />
                  ))
                )}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <div style={{ display: 'inline-block', background: 'var(--hs-orange)', color: '#fff', padding: '10px 28px', borderRadius: 3, fontWeight: 600, fontSize: 14, cursor: 'default' }}>
                    {formData.settings?.submitButtonText || 'Submit'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Field properties */}
            <div style={{ width: 280, flexShrink: 0, background: '#fff', borderLeft: '1px solid var(--hs-border)', overflowY: 'auto' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--hs-border)', fontWeight: 600, fontSize: 13 }}>Field Properties</div>
              {selectedField ? (
                <div style={{ padding: 16 }}>
                  <FormField label="Label">
                    <input value={selectedField.label} onChange={e => updateField(selectedFieldId, { label: e.target.value })} />
                  </FormField>
                  {selectedField.type !== 'checkbox' && (
                    <FormField label="Placeholder">
                      <input value={selectedField.placeholder || ''} onChange={e => updateField(selectedFieldId, { placeholder: e.target.value })} />
                    </FormField>
                  )}
                  <FormField label="Required">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedField.required} onChange={e => updateField(selectedFieldId, { required: e.target.checked })} style={{ width: 16 }} />
                      <span style={{ fontSize: 13 }}>Required</span>
                    </label>
                  </FormField>
                  {(selectedField.type === 'select' || selectedField.type === 'radio') && (
                    <FormField label="Options">
                      <textarea value={(selectedField.options||[]).join('\n')} onChange={e => updateField(selectedFieldId, { options: e.target.value.split('\n').filter(Boolean) })} style={{ minHeight: 100, resize: 'vertical' }} />
                      <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 4 }}>One option per line</div>
                    </FormField>
                  )}
                </div>
              ) : (
                <div style={{ padding: 16, fontSize: 13, color: 'var(--hs-text-muted)' }}>Select a field to edit its properties.</div>
              )}
            </div>
          </>
        )}

        {activeTab === 'options' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div style={{ maxWidth: 580 }}>
              <FormField label="Thank you message">
                <textarea value={formData.settings?.thankYouMessage || ''} onChange={e => setFormData(prev => ({ ...prev, settings: { ...prev.settings, thankYouMessage: e.target.value } }))} style={{ minHeight: 80, resize: 'vertical' }} />
              </FormField>
              <FormField label="Redirect URL (optional)" hint="If set, visitors will be redirected to this URL instead of showing the thank you message.">
                <input value={formData.settings?.redirectUrl || ''} onChange={e => setFormData(prev => ({ ...prev, settings: { ...prev.settings, redirectUrl: e.target.value } }))} placeholder="https://..." />
              </FormField>
              <FormField label="Notification emails">
                <input value={(formData.settings?.notifyEmails || []).join(', ')} onChange={e => setFormData(prev => ({ ...prev, settings: { ...prev.settings, notifyEmails: e.target.value.split(',').map(s=>s.trim()) } }))} placeholder="email@example.com" />
              </FormField>
              <FormField label="Set lifecycle stage to">
                <select value={formData.settings?.lifecycleStage || 'lead'} onChange={e => setFormData(prev => ({ ...prev, settings: { ...prev.settings, lifecycleStage: e.target.value } }))}>
                  {['subscriber','lead','marketing_qualified_lead','sales_qualified_lead'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
                </select>
              </FormField>
              <FormField label="Submit button text">
                <input value={formData.settings?.submitButtonText || 'Submit'} onChange={e => setFormData(prev => ({ ...prev, settings: { ...prev.settings, submitButtonText: e.target.value } }))} />
              </FormField>
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div style={{ flex: 1, padding: 32 }}>
            <div style={{ maxWidth: 400 }}>
              <FormField label="Font family">
                <select value={formData.style?.fontFamily || 'inherit'} onChange={e => setFormData(prev => ({ ...prev, style: { ...prev.style, fontFamily: e.target.value } }))}>
                  <option value="inherit">Default (Inherit)</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="monospace">Monospace</option>
                </select>
              </FormField>
              <FormField label="Label color">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={formData.style?.labelColor || '#33475B'} onChange={e => setFormData(prev => ({ ...prev, style: { ...prev.style, labelColor: e.target.value } }))} style={{ width: 36, height: 28, padding: 0, border: 'none', cursor: 'pointer' }} />
                  <input value={formData.style?.labelColor || '#33475B'} onChange={e => setFormData(prev => ({ ...prev, style: { ...prev.style, labelColor: e.target.value } }))} style={{ flex: 1 }} />
                </div>
              </FormField>
              <FormField label="Submit button color">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={formData.style?.buttonColor || '#FF7A59'} onChange={e => setFormData(prev => ({ ...prev, style: { ...prev.style, buttonColor: e.target.value } }))} style={{ width: 36, height: 28, padding: 0, border: 'none', cursor: 'pointer' }} />
                  <input value={formData.style?.buttonColor || '#FF7A59'} onChange={e => setFormData(prev => ({ ...prev, style: { ...prev.style, buttonColor: e.target.value } }))} style={{ flex: 1 }} />
                </div>
              </FormField>
              <FormField label="Field border radius">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="range" min="0" max="16" value={formData.style?.borderRadius || 3} onChange={e => setFormData(prev => ({ ...prev, style: { ...prev.style, borderRadius: parseInt(e.target.value) } }))} style={{ flex: 1 }} />
                  <span style={{ fontSize: 13, minWidth: 30 }}>{formData.style?.borderRadius || 3}px</span>
                </div>
              </FormField>
              <FormField label="Form width">
                <select value={formData.style?.width || '100%'} onChange={e => setFormData(prev => ({ ...prev, style: { ...prev.style, width: e.target.value } }))}>
                  <option value="100%">Full width (100%)</option>
                  <option value="500px">Medium (500px)</option>
                  <option value="400px">Compact (400px)</option>
                </select>
              </FormField>
            </div>
          </div>
        )}
      </div>

      {/* Form Preview Modal */}
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 6, width: 560, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hs-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Form Preview — {nameValue}</span>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-text-muted)', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px 32px' }}>
              {fields.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--hs-text-muted)', padding: '24px 0', fontSize: 14 }}>No fields added yet.</div>
              ) : (
                fields.map(field => (
                  <div key={field.id} style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                      {field.label}
                      {field.required && <span style={{ color: 'var(--hs-danger)', marginLeft: 4 }}>*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea placeholder={field.placeholder || ''} style={{ width: '100%', minHeight: 80, resize: 'vertical', boxSizing: 'border-box' }} />
                    ) : field.type === 'select' ? (
                      <select style={{ width: '100%' }}>
                        <option value="">{field.placeholder || 'Select an option'}</option>
                        {(field.options || []).map((o, i) => <option key={i} value={o}>{o}</option>)}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: 16, marginTop: 2 }} />
                        <span style={{ fontSize: 13 }}>{field.label}</span>
                      </label>
                    ) : field.type === 'radio' ? (
                      <div>
                        {(field.options || []).map((o, i) => (
                          <label key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, cursor: 'pointer' }}>
                            <input type="radio" name={field.id} /> <span style={{ fontSize: 13 }}>{o}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input type={field.type === 'email' ? 'email' : 'text'} placeholder={field.placeholder || ''} style={{ width: '100%', boxSizing: 'border-box' }} />
                    )}
                  </div>
                ))
              )}
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button style={{ background: 'var(--hs-orange)', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 3, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  {formData.settings?.submitButtonText || 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
