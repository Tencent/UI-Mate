import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Mail, Calendar, FileText, Plus, Copy, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { downloadCsv } from '../utils/crmFiles';

// ---------- EMAIL TEMPLATES ----------

const EMPTY_TEMPLATE = { name: '', subject: '', body: '', folder: 'Sales' };

export function Templates() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTpl, setEditTpl] = useState(null);
  const [form, setForm] = useState(EMPTY_TEMPLATE);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openCreate = () => { setEditTpl(null); setForm(EMPTY_TEMPLATE); setIsModalOpen(true); };
  const openEdit = (t) => { setEditTpl(t); setForm({ name: t.name, subject: t.subject, body: t.body, folder: t.folder }); setIsModalOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTpl) {
      dispatch({ type: 'UPDATE_TEMPLATE', payload: { ...editTpl, ...form } });
      addToast('Template updated successfully.', 'success');
    } else {
      dispatch({ type: 'ADD_TEMPLATE', payload: { ...form, id: uuidv4(), createdBy: 'Admin User', createDate: new Date().toISOString(), timesUsed: 0 } });
      addToast('Template created successfully.', 'success');
    }
    setIsModalOpen(false);
  };

  const handleCopy = (t) => {
    dispatch({ type: 'ADD_TEMPLATE', payload: { ...t, id: uuidv4(), name: `${t.name} (Copy)`, createDate: new Date().toISOString(), timesUsed: 0 } });
    addToast(`Template "${t.name}" duplicated.`, 'success');
  };

  const handleDelete = (id) => {
    const tpl = state.templates.find(t => t.id === id);
    setDeleteConfirm({ id, name: tpl?.name || 'this template' });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    dispatch({ type: 'DELETE_TEMPLATE', payload: deleteConfirm.id });
    addToast('Template deleted.', 'success');
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Email Templates</h2>
          <p className="text-gray-500 text-sm">{state.templates.length} templates</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-xubspot text-white rounded-md text-sm font-medium hover:bg-xubspot-hover flex items-center gap-2">
          <Plus size={16} /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.templates.map(t => (
          <div key={t.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-orange-50 rounded">
                <Mail className="text-xubspot" size={20} />
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleCopy(t)} className="p-1 text-gray-400 hover:text-xubspot" title="Duplicate"><Copy size={14} /></button>
                <button onClick={() => openEdit(t)} className="p-1 text-gray-400 hover:text-xubspot"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(t.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{t.name}</h3>
            <p className="text-xs text-gray-500 mb-1">Subject: {t.subject}</p>
            <p className="text-xs text-gray-400 mb-3">Folder: {t.folder} · Used {t.timesUsed || 0}x</p>
            <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-2 rounded border border-gray-100 whitespace-pre-wrap">
              {t.body}
            </p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
          <div className="bg-white h-full w-full max-w-md shadow-xl flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{editTpl ? 'Edit Template' : 'New Template'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name <span className="text-red-500">*</span></label>
                <input required type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Folder</label>
                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.folder} onChange={e => setForm({ ...form, folder: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                <input required type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Hi {{first_name}}, following up" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea rows={8} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot resize-none font-mono"
                  value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Use {{first_name}}, {{company_name}} etc." />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-xubspot text-white rounded text-sm hover:bg-xubspot-hover">{editTpl ? 'Save' : 'Create'}</button>
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
              Are you sure you want to delete template "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- MEETINGS ----------

const EMPTY_MEETING = { title: '', date: '', duration: 30, location: 'Zoom', contactId: '', companyId: '', notes: '', status: 'scheduled' };

export function Meetings() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMeeting, setEditMeeting] = useState(null);
  const [form, setForm] = useState(EMPTY_MEETING);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openCreate = () => { setEditMeeting(null); setForm(EMPTY_MEETING); setIsModalOpen(true); };
  const openEdit = (m) => {
    setEditMeeting(m);
    setForm({
      title: m.title, date: m.date ? new Date(m.date).toISOString().slice(0, 16) : '',
      duration: m.duration, location: m.location || 'Zoom',
      contactId: m.contactId || '', companyId: m.companyId || '',
      notes: m.notes || '', status: m.status || 'scheduled'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, date: form.date ? new Date(form.date).toISOString() : null, contactId: form.contactId || null, companyId: form.companyId || null };
    if (editMeeting) {
      dispatch({ type: 'UPDATE_MEETING', payload: { ...editMeeting, ...payload } });
      addToast('Meeting updated successfully.', 'success');
    } else {
      dispatch({ type: 'ADD_MEETING', payload: { ...payload, id: uuidv4(), owner: 'Admin User', createDate: new Date().toISOString() } });
      addToast('Meeting scheduled successfully.', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const meeting = state.meetings.find(m => m.id === id);
    setDeleteConfirm({ id, title: meeting?.title || 'this meeting' });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    dispatch({ type: 'DELETE_MEETING', payload: deleteConfirm.id });
    addToast('Meeting cancelled.', 'success');
    setDeleteConfirm(null);
  };

  const statusConfig = {
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelled' },
    no_show: { bg: 'bg-red-100', text: 'text-red-700', label: 'No Show' },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Meetings</h2>
          <p className="text-gray-500 text-sm">{state.meetings.length} meetings</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-xubspot text-white rounded-md text-sm font-medium hover:bg-xubspot-hover flex items-center gap-2">
          <Plus size={16} /> Schedule Meeting
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {state.meetings.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">No meetings scheduled. Create one to get started.</div>
        )}
        {state.meetings.map(m => {
          const contact = state.contacts.find(c => c.id === m.contactId);
          const conf = statusConfig[m.status] || statusConfig.scheduled;
          return (
            <div key={m.id} className="p-4 border-b border-gray-200 last:border-0 flex items-center justify-between group hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full text-xubspot flex-shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{m.title}</h4>
                  <p className="text-sm text-gray-500">
                    {m.date ? new Date(m.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}
                    {m.duration ? ` · ${m.duration} min` : ''}
                    {m.location ? ` · ${m.location}` : ''}
                  </p>
                  {contact && <p className="text-xs text-gray-400">{contact.firstName} {contact.lastName}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${conf.bg} ${conf.text}`}>{conf.label}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(m)} className="p-1 text-gray-400 hover:text-xubspot"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
          <div className="bg-white h-full w-full max-w-md shadow-xl flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{editMeeting ? 'Edit Meeting' : 'Schedule Meeting'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input required type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input type="datetime-local" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
                    <option>Zoom</option>
                    <option>Google Meet</option>
                    <option>In-person</option>
                    <option>Phone</option>
                    <option>Microsoft Teams</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.contactId} onChange={e => setForm({ ...form, contactId: e.target.value })}>
                  <option value="">None</option>
                  {state.contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={3} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot resize-none"
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-xubspot text-white rounded text-sm hover:bg-xubspot-hover">{editMeeting ? 'Save' : 'Schedule'}</button>
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
              <h3 className="text-lg font-semibold text-gray-800">Confirm Cancel</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel meeting "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">Keep</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Cancel Meeting</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- FORMS ----------

export function Forms() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [form, setForm] = useState({ name: '', status: 'active', fields: [] });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submissionsForm, setSubmissionsForm] = useState(null);

  const ALL_FIELDS = ['email', 'first_name', 'last_name', 'company', 'phone', 'message', 'company_size', 'rating', 'feedback', 'recommend'];

  const openCreate = () => {
    setEditForm(null);
    setForm({ name: '', status: 'active', fields: [] });
    setIsModalOpen(true);
  };

  const openEdit = (f) => {
    setEditForm(f);
    setForm({ name: f.name, status: f.status, fields: f.fields ? [...f.fields] : [] });
    setIsModalOpen(true);
  };

  const toggleStatus = (f) => {
    const newStatus = f.status === 'active' ? 'inactive' : 'active';
    dispatch({ type: 'UPDATE_FORM', payload: { ...f, status: newStatus } });
    addToast(`Form "${f.name}" is now ${newStatus}.`, 'success');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editForm) {
      dispatch({ type: 'UPDATE_FORM', payload: { ...editForm, ...form } });
      addToast(`Form "${form.name}" updated successfully.`, 'success');
    } else {
      dispatch({ type: 'ADD_FORM', payload: { ...form, id: uuidv4(), submissions: 0, createDate: new Date().toISOString(), lastSubmission: null } });
      addToast(`Form "${form.name}" created successfully.`, 'success');
    }
    setIsModalOpen(false);
    setForm({ name: '', status: 'active', fields: [] });
  };

  const handleDelete = (id) => {
    const f = state.forms.find(frm => frm.id === id);
    setDeleteConfirm({ id, name: f?.name || 'this form' });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    dispatch({ type: 'DELETE_FORM', payload: deleteConfirm.id });
    addToast('Form deleted.', 'success');
    setDeleteConfirm(null);
  };

  const toggleField = (field) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.includes(field) ? prev.fields.filter(f => f !== field) : [...prev.fields, field]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Forms</h2>
          <p className="text-gray-500 text-sm">{state.forms.length} forms</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-xubspot text-white rounded-md text-sm font-medium hover:bg-xubspot-hover flex items-center gap-2">
          <Plus size={16} /> Create Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.forms.map(f => (
          <div key={f.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-100 rounded text-gray-600">
                <FileText size={24} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(f)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none
                    ${f.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}
                  title={f.status === 'active' ? 'Click to deactivate' : 'Click to activate'}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
                    ${f.status === 'active' ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(f)} className="p-1 text-gray-400 hover:text-xubspot"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(f.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{f.name}</h3>
            <p className="text-sm text-gray-500 mb-1">
              <span className={`font-medium ${f.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                {f.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              {f.fields && f.fields.length > 0 && ` · ${f.fields.length} field${f.fields.length > 1 ? 's' : ''}`}
            </p>
            <div className="mt-4 flex justify-between items-end">
              <div>
                <span className="text-2xl font-bold text-gray-900">{f.submissions}</span>
                <p className="text-xs text-gray-500">Submissions</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSubmissionsForm(f)}
                  className="text-sm text-xubspot hover:underline"
                >
                  View Submissions
                </button>
              </div>
            </div>
            {f.lastSubmission && (
              <p className="text-xs text-gray-400 mt-2">Last submission: {new Date(f.lastSubmission).toLocaleDateString()}</p>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
          <div className="bg-white h-full w-full max-w-md shadow-xl flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{editForm ? 'Edit Form' : 'Create Form'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Name <span className="text-red-500">*</span></label>
                <input required type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fields</label>
                <div className="space-y-2">
                  {ALL_FIELDS.map(field => (
                    <label key={field} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.fields.includes(field)} onChange={() => toggleField(field)}
                        className="rounded border-gray-300 text-xubspot focus:ring-xubspot" />
                      <span className="text-sm text-gray-700 capitalize">{field.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-xubspot text-white rounded text-sm hover:bg-xubspot-hover">{editForm ? 'Save Changes' : 'Create Form'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {submissionsForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{submissionsForm.name} submissions</h3>
                <p className="text-sm text-gray-500">{submissionsForm.submissions} total submissions</p>
              </div>
              <button onClick={() => setSubmissionsForm(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="p-6">
              <div className="overflow-hidden border border-gray-200 rounded-md">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {state.contacts.slice(0, Math.min(5, Math.max(1, submissionsForm.submissions))).map((contact, index) => {
                      const company = state.companies.find(c => c.id === contact.companyId);
                      return (
                        <tr key={`${submissionsForm.id}-${contact.id}`}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{contact.firstName} {contact.lastName}</div>
                            <div className="text-xs text-gray-500">{contact.email}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{company?.name || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {submissionsForm.lastSubmission
                              ? new Date(new Date(submissionsForm.lastSubmission).getTime() - index * 86400000).toLocaleDateString()
                              : 'Draft'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Processed</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setSubmissionsForm(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">Close</button>
              <button
                onClick={() => {
                  const rows = state.contacts.slice(0, Math.min(5, Math.max(1, submissionsForm.submissions))).map((contact, index) => {
                    const company = state.companies.find(c => c.id === contact.companyId);
                    return {
                      name: `${contact.firstName} ${contact.lastName}`,
                      email: contact.email,
                      company: company?.name || '',
                      submittedAt: submissionsForm.lastSubmission
                        ? new Date(new Date(submissionsForm.lastSubmission).getTime() - index * 86400000).toISOString()
                        : '',
                      status: 'Processed',
                    };
                  });
                  downloadCsv(`${submissionsForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-submissions.csv`, rows, [
                    { label: 'Name', value: row => row.name },
                    { label: 'Email', value: row => row.email },
                    { label: 'Company', value: row => row.company },
                    { label: 'Submitted At', value: row => row.submittedAt },
                    { label: 'Status', value: row => row.status },
                  ]);
                  addToast(`Exported submissions for "${submissionsForm.name}".`, 'success');
                  setSubmissionsForm(null);
                }}
                className="px-4 py-2 bg-xubspot text-white rounded text-sm hover:bg-xubspot-hover"
              >
                Export submissions
              </button>
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
              Are you sure you want to delete form "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
