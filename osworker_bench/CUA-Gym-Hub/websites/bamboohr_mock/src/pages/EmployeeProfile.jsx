import React, { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Phone, Mail, ChevronLeft, ChevronRight, Settings, Edit2,
  Check, X, Palmtree, Heart, Clock, Folder, FileText,
  BookOpen, Package, Star, Award, Shield, Clipboard, TrendingUp,
  Calendar, User, MapPin, Briefcase, Plus, Trash2, ChevronDown, Linkedin, Twitter, Facebook
} from 'lucide-react';
import TimeOffModal from '../components/TimeOffModal';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}
function getAvatarColor(id) {
  const colors = ['#73C41D','#2196F3','#FF5722','#9C27B0','#FF9800','#00BCD4','#795548','#607D8B'];
  return colors[(id || 0) % colors.length];
}

function Avatar({ employee, size = 32 }) {
  if (!employee) return null;
  const name = (employee.preferredName || employee.firstName) + ' ' + employee.lastName;
  const initials = getInitials(name);
  const bg = getAvatarColor(employee.id);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: size < 40 ? 11 : size < 64 ? 16 : 24, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function InlineField({ label, value, onSave, type = 'text', options = [], forceEdit = false }) {
  const [editing, setEditing] = useState(forceEdit);
  const [val, setVal] = useState(value || '');
  const [hovered, setHovered] = useState(false);

  // Sync forceEdit changes (e.g. when editMode is toggled from parent)
  React.useEffect(() => {
    if (forceEdit) {
      setVal(value || '');
      setEditing(true);
    }
  }, [forceEdit]);

  if (!editing) {
    return (
      <div>
        <div style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <span style={{ fontSize: 14, color: val ? '#333' : '#ccc' }}>{val || '—'}</span>
          <button
            onClick={() => { setVal(value || ''); setEditing(true); }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#aaa', padding: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}
          >
            <Edit2 size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {type === 'select' ? (
          <select value={val} onChange={e => setVal(e.target.value)} className="form-select" style={{ fontSize: 13, padding: '4px 8px' }}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} value={val} onChange={e => setVal(e.target.value)} className="form-input" style={{ fontSize: 13, padding: '4px 8px', width: '100%' }} />
        )}
        <button onClick={() => { onSave(val); setEditing(false); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#73C41D' }}><Check size={14} /></button>
        <button onClick={() => setEditing(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#E65100' }}><X size={14} /></button>
      </div>
    </div>
  );
}

function PersonalTab({ employee, onUpdate, editMode = false, onExitEdit }) {
  function save(field) {
    return (val) => onUpdate({ [field]: val });
  }
  const fe = editMode;
  return (
    <div style={{ padding: '24px' }}>
      {editMode && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#edf8e0', border: '1px solid #b6e07a', borderRadius: 4, padding: '8px 14px' }}>
          <span style={{ fontSize: 13, color: '#5CA315', fontWeight: 500 }}>Edit mode active — click ✓ on any field to save changes</span>
          <button onClick={onExitEdit} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5CA315', fontSize: 12 }}>Done Editing</button>
        </div>
      )}
      <SectionBlock title="Contact Information" icon={<Mail size={14} />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
          <InlineField label="Work Email" value={employee.email} onSave={save('email')} type="email" forceEdit={fe} />
          <InlineField label="Home Email" value={employee.homeEmail} onSave={save('homeEmail')} type="email" forceEdit={fe} />
          <InlineField label="Work Phone" value={employee.workPhone} onSave={save('workPhone')} forceEdit={fe} />
          <InlineField label="Mobile Phone" value={employee.mobilePhone} onSave={save('mobilePhone')} forceEdit={fe} />
          <InlineField label="Home Phone" value={employee.homePhone} onSave={save('homePhone')} forceEdit={fe} />
          <InlineField label="Work Phone Ext." value={employee.workPhoneExt} onSave={save('workPhoneExt')} forceEdit={fe} />
        </div>
      </SectionBlock>

      <SectionBlock title="Personal" icon={<User size={14} />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
          <InlineField label="Date of Birth" value={employee.dateOfBirth} onSave={save('dateOfBirth')} type="date" forceEdit={fe} />
          <InlineField label="Gender" value={employee.gender} onSave={save('gender')} type="select" options={['Male','Female','Non-binary','Prefer not to say']} forceEdit={fe} />
          <InlineField label="Marital Status" value={employee.maritalStatus} onSave={save('maritalStatus')} type="select" options={['Single','Married','Domestic Partnership','Divorced','Widowed']} forceEdit={fe} />
          <div>
            <div style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 2 }}>SSN</div>
            <div style={{ fontSize: 14, color: '#333' }}>{employee.ssn || '•••-••-XXXX'}</div>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Address" icon={<MapPin size={14} />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
          <InlineField label="Street" value={employee.address1} onSave={save('address1')} forceEdit={fe} />
          <InlineField label="Apt/Suite" value={employee.address2} onSave={save('address2')} forceEdit={fe} />
          <InlineField label="City" value={employee.city} onSave={save('city')} forceEdit={fe} />
          <InlineField label="State" value={employee.state} onSave={save('state')} forceEdit={fe} />
          <InlineField label="Zip Code" value={employee.zipcode} onSave={save('zipcode')} forceEdit={fe} />
          <InlineField label="Country" value={employee.country} onSave={save('country')} forceEdit={fe} />
        </div>
      </SectionBlock>

      <SectionBlock title="Emergency Contact" icon={<Phone size={14} />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
          <InlineField label="Name" value={employee.emergencyContactName} onSave={save('emergencyContactName')} forceEdit={fe} />
          <InlineField label="Phone" value={employee.emergencyContactPhone} onSave={save('emergencyContactPhone')} forceEdit={fe} />
          <InlineField label="Relationship" value={employee.emergencyContactRelation} onSave={save('emergencyContactRelation')} forceEdit={fe} />
        </div>
      </SectionBlock>
    </div>
  );
}

function SectionBlock({ title, icon, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ color: '#73C41D' }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#444' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function JobTab({ employee, state }) {
  const dept = state.departments?.find(d => d.id === employee.departmentId);
  const location = state.locations?.find(l => l.id === employee.locationId);
  const division = state.divisions?.find(d => d.id === employee.divisionId);
  const manager = state.employees?.find(e => e.id === employee.reportsToId);

  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;

  function formatPay(emp) {
    if (!emp.payRate) return '—';
    if (emp.payType === 'Salary') return `$${emp.payRate.toLocaleString()}.00/yr`;
    return `$${emp.payRate.toFixed(2)}/hr`;
  }

  const jobHistory = [
    { date: employee.hireDate, description: `Hired as ${employee.jobTitle}`, type: 'hire' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <SectionBlock title="Job Information" icon={<Briefcase size={14} />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
          <Field label="Job Title" value={employee.jobTitle} />
          <Field label="Department" value={dept?.name} />
          <Field label="Division" value={division?.name} />
          <Field label="Location" value={location?.name} />
          <Field label="Reports To">
            {manager ? (
              <Link to={navTo(`/people/${manager.id}`)} style={{ color: '#73C41D', fontSize: 14 }}>
                {manager.displayName}
              </Link>
            ) : '—'}
          </Field>
        </div>
      </SectionBlock>

      <SectionBlock title="Employment Status" icon={<User size={14} />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
          <Field label="Status" value={employee.status} />
          <Field label="Employment Type" value={employee.employmentStatus} />
          <Field label="Hire Date" value={employee.hireDate} />
          {employee.terminationDate && <Field label="Termination Date" value={employee.terminationDate} />}
        </div>
      </SectionBlock>

      <SectionBlock title="Compensation" icon={<Star size={14} />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
          <Field label="Pay Rate" value={formatPay(employee)} />
          <Field label="Pay Type" value={employee.payType} />
          <Field label="Pay Frequency" value={employee.payFrequency} />
          <Field label="Standard Hours/Week" value={`${employee.standardHoursPerWeek} hours`} />
        </div>
      </SectionBlock>

      <SectionBlock title="Job History" icon={<Clock size={14} />}>
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: '#E0E0E0' }} />
          {jobHistory.map((entry, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: 16 }}>
              <div style={{ position: 'absolute', left: -20, top: 4, width: 12, height: 12, borderRadius: '50%', background: '#73C41D', border: '2px solid white', boxShadow: '0 0 0 2px #73C41D' }} />
              <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>{entry.date}</div>
              <div style={{ fontSize: 13, color: '#333' }}>{entry.description}</div>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}

function Field({ label, value, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#333' }}>{children || value || '—'}</div>
    </div>
  );
}

function TimeOffTab({ employee, state, dispatch }) {
  const [showModal, setShowModal] = useState(false);
  const balances = (state.timeOffBalances || []).filter(b => b.employeeId === employee.id);
  const requests = (state.timeOffRequests || []).filter(r => r.employeeId === employee.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function getPolicy(id) { return state.timeOffPolicies?.find(p => p.id === id); }

  const upcoming = requests.filter(r => r.status === 'approved' && r.startDate >= new Date().toISOString().split('T')[0]);
  const history = requests.filter(r => !upcoming.includes(r));

  function statusBadge(status) {
    const map = { approved: 'badge-green', pending: 'badge-yellow', denied: 'badge-red', cancelled: 'badge-gray' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600 }}>
          <Palmtree size={18} color="#73C41D" /> Time Off
        </div>
        <div style={{ fontSize: 12, color: '#999' }}>Accrual Level Start Date: {employee.hireDate || '—'}</div>
      </div>

      {/* Balance cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {balances.map(bal => {
          const policy = getPolicy(bal.policyId);
          if (!policy) return null;
          const icons = { Vacation: <Palmtree size={24} color="#73C41D" />, Sick: <Heart size={24} color="#73C41D" />, Bereavement: <Heart size={24} color="#73C41D" />, FMLA: <Shield size={24} color="#73C41D" />, Personal: <User size={24} color="#73C41D" /> };
          return (
            <div key={bal.policyId} style={{ minWidth: 170, border: '1px solid #E0E0E0', borderRadius: 4, padding: '16px 12px', textAlign: 'center', background: 'white', flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: '#666', fontWeight: 500, marginBottom: 8 }}>{policy.type}</div>
              <div style={{ margin: '0 auto 4px', display: 'flex', justifyContent: 'center' }}>{icons[policy.type] || <Calendar size={24} color="#73C41D" />}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#333', lineHeight: 1.1 }}>{typeof bal.available === 'number' ? bal.available.toFixed(1) : bal.available}</div>
              <div style={{ fontSize: 10, color: '#73C41D', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>HOURS AVAILABLE</div>
              {bal.scheduled > 0 && <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{bal.scheduled} hours scheduled</div>}
              <div style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>{policy.name}</div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Time Off */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
            <Clock size={14} color="#73C41D" /> Upcoming Time Off
          </div>
          {upcoming.map(r => {
            const policy = getPolicy(r.policyId);
            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#73C41D', flexShrink: 0 }} />
                <span style={{ fontWeight: 500, fontSize: 13 }}>{r.startDate} – {r.endDate}</span>
                <span style={{ fontSize: 13, color: '#666' }}>{r.hours} hours of {policy?.type || 'Time Off'}</span>
                {statusBadge(r.status)}
              </div>
            );
          })}
        </div>
      )}

      <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginBottom: 24 }}>
        <Calendar size={14} /> Request Time Off
      </button>

      {/* History table */}
      {history.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Time Off History</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {history.map(r => {
                const policy = getPolicy(r.policyId);
                return (
                  <tr key={r.id}>
                    <td style={{ fontSize: 13 }}>{r.startDate}{r.startDate !== r.endDate ? ` – ${r.endDate}` : ''}</td>
                    <td style={{ fontSize: 13 }}>{policy?.type || '—'}</td>
                    <td style={{ fontSize: 13 }}>{r.hours}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ fontSize: 12, color: '#999' }}>{r.note || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <TimeOffModal employeeId={employee.id} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function UploadDocumentModal({ employee, state, dispatch, onClose }) {
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState('Other');
  const [error, setError] = useState('');
  const categories = ['Policies', 'Tax Forms', 'Contracts', 'Certifications', 'Other'];

  function handleSubmit() {
    if (!docName.trim()) { setError('Document name is required.'); return; }
    const nextId = Math.max(0, ...(state.documents || []).map(d => d.id)) + 1;
    dispatch({ type: 'ADD_DOCUMENT', document: {
      id: nextId, employeeId: employee.id, name: docName.trim(),
      category, uploadedAt: new Date().toISOString().split('T')[0], uploadedById: 1, size: '0 KB'
    }});
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 420 }}>
        <div className="modal-header">
          <h2>Upload Document</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">Document Name *</label>
          <input className="form-input" value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. 2024 W-2 Form" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Upload</button>
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ employee, state, dispatch }) {
  const docs = (state.documents || []).filter(d => d.employeeId === employee.id);
  const [catFilter, setCatFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const categories = ['Policies', 'Tax Forms', 'Contracts', 'Certifications', 'Other'];
  const filtered = catFilter ? docs.filter(d => d.category === catFilter) : docs;

  function deleteDoc(id) {
    if (window.confirm('Delete this document?')) {
      dispatch({ type: 'DELETE_DOCUMENT', id });
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600 }}>
          <Folder size={18} color="#73C41D" /> Documents
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="form-select" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            <Plus size={14} /> Upload Document
          </button>
        </div>
      </div>
      {showUploadModal && <UploadDocumentModal employee={employee} state={state} dispatch={dispatch} onClose={() => setShowUploadModal(false)} />}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <FileText size={32} color="#E0E0E0" style={{ display: 'block', margin: '0 auto 8px' }} />
          No documents found. Upload a document to get started.
        </div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Name</th><th>Category</th><th>Date Uploaded</th><th>Uploaded By</th><th>Size</th><th></th></tr></thead>
          <tbody>
            {filtered.map(doc => {
              const uploader = state.employees?.find(e => e.id === doc.uploadedById);
              return (
                <tr key={doc.id}>
                  <td><a href="javascript:void(0)" style={{ color: '#73C41D', fontSize: 13 }}>{doc.name}</a></td>
                  <td><span className="badge badge-gray">{doc.category}</span></td>
                  <td style={{ fontSize: 13 }}>{doc.uploadedAt}</td>
                  <td style={{ fontSize: 13 }}>{uploader ? `${uploader.firstName} ${uploader.lastName}` : '—'}</td>
                  <td style={{ fontSize: 13 }}>{doc.size}</td>
                  <td>
                    <button onClick={() => deleteDoc(doc.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ccc' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function NotesTab({ employee, state, dispatch }) {
  const notes = (state.notes || []).filter(n => n.employeeId === employee.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState('');

  function getAuthor(id) { return state.employees?.find(e => e.id === id); }

  function addNote() {
    if (!newNote.trim()) return;
    const nextId = Math.max(0, ...(state.notes || []).map(n => n.id)) + 1;
    dispatch({ type: 'ADD_NOTE', note: { id: nextId, employeeId: employee.id, authorId: state.currentUser?.employeeId || 1, content: newNote, createdAt: new Date().toISOString() } });
    setNewNote('');
    setShowForm(false);
  }

  function saveEdit(id) {
    dispatch({ type: 'UPDATE_NOTE', id, changes: { content: editContent } });
    setEditId(null);
  }

  function deleteNote(id) {
    if (window.confirm('Delete this note?')) dispatch({ type: 'DELETE_NOTE', id });
  }

  function relTime(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600 }}>
          <FileText size={18} color="#73C41D" /> Notes
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={14} /> Add Note
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8fdf6', border: '1px solid #c9eb8a', borderRadius: 4, padding: '12px', marginBottom: 16 }}>
          <textarea
            className="form-textarea"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Write a note..."
            style={{ width: '100%', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={addNote}>Save</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No notes yet.</div>
      ) : notes.map(note => {
        const author = getAuthor(note.authorId);
        const isMe = note.authorId === (state.currentUser?.employeeId || 1);
        return (
          <div key={note.id} style={{ border: '1px solid #E0E0E0', borderRadius: 4, padding: '12px 16px', marginBottom: 12, background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: getAvatarColor(author?.id || 0), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                {getInitials(author?.displayName || '?')}
              </div>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{author?.displayName || '—'}</span>
              <span style={{ fontSize: 11, color: '#999' }}>{relTime(note.createdAt)}</span>
              {isMe && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                  <button onClick={() => { setEditId(note.id); setEditContent(note.content); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#73C41D', padding: 4 }}><Edit2 size={12} /></button>
                  <button onClick={() => deleteNote(note.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#E65100', padding: 4 }}><Trash2 size={12} /></button>
                </div>
              )}
            </div>
            {editId === note.id ? (
              <div>
                <textarea className="form-textarea" value={editContent} onChange={e => setEditContent(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => saveEdit(note.id)}>Save</button>
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setEditId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{note.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BenefitsTab({ employee, state }) {
  const enrollments = (state.benefitEnrollments || []).filter(e => e.employeeId === employee.id);
  const typeIcons = { Medical: '🏥', Dental: '🦷', Vision: '👁', '401k': '💰', Life: '❤️' };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        <Shield size={18} color="#73C41D" /> Benefits
      </div>
      {enrollments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No benefit plans enrolled.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {enrollments.map(en => {
            const plan = state.benefitPlans?.find(p => p.id === en.planId);
            if (!plan) return null;
            return (
              <div key={en.id} style={{ display: 'flex', alignItems: 'center', gap: 16, border: '1px solid #E0E0E0', borderRadius: 4, padding: '14px 16px', background: 'white' }}>
                <div style={{ fontSize: 28, width: 40, textAlign: 'center' }}>{typeIcons[plan.type] || '📋'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#333' }}>{plan.name}</div>
                  <div style={{ fontSize: 13, color: '#666' }}>{plan.provider}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{en.coverageLevel} · Since {en.startDate}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${en.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                    {en.status === 'active' ? 'Active' : 'Terminated'}
                  </span>
                  <div style={{ fontSize: 13, color: '#333', marginTop: 4, fontWeight: 500 }}>
                    ${plan.employeeCost}/mo
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TrainingTab({ employee, state }) {
  const trainings = (state.trainings || []).filter(t => t.employeeId === employee.id);
  function statusBadge(status) {
    if (status === 'completed') return <span className="badge badge-green">Complete</span>;
    if (status === 'overdue') return <span className="badge badge-orange">Overdue</span>;
    if (status === 'in_progress') return <span className="badge badge-blue">In Progress</span>;
    return <span className="badge badge-gray">Upcoming</span>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        <BookOpen size={18} color="#73C41D" /> Training
      </div>
      {trainings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No training assigned.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {trainings.map(t => (
            <div key={t.id} style={{ border: '1px solid #E0E0E0', borderRadius: 4, padding: '12px 16px', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                    {t.category} · {t.status === 'completed' ? `Completed ${t.completedDate}` : `Due ${t.dueDate}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-gray">{t.category}</span>
                  {statusBadge(t.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssetsTab({ employee, state }) {
  const assets = (state.assets || []).filter(a => a.employeeId === employee.id);
  const typeIcons = { Laptop: '💻', Monitor: '🖥', Phone: '📱', Badge: '🪪', Key: '🔑', 'Parking Pass': '🅿️' };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        <Package size={18} color="#73C41D" /> Assets
      </div>
      {assets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No assets assigned.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Type</th><th>Description</th><th>Serial Number</th><th>Assigned Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {assets.map(a => (
              <tr key={a.id}>
                <td>{typeIcons[a.type] || '📦'} {a.type}</td>
                <td style={{ fontSize: 13 }}>{a.description}</td>
                <td style={{ fontSize: 12, color: '#999', fontFamily: 'monospace' }}>{a.serialNumber}</td>
                <td style={{ fontSize: 13 }}>{a.assignedDate}</td>
                <td>
                  <span className={`badge ${a.status === 'assigned' ? 'badge-green' : a.status === 'lost' ? 'badge-red' : 'badge-gray'}`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PerformanceTab({ employee, state, dispatch }) {
  const [subTab, setSubTab] = useState('goals');
  const goals = (state.goals || []).filter(g => g.employeeId === employee.id || !g.employeeId);
  const reviews = (state.performanceReviews || []).filter(r => r.employeeId === employee.id);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', dueDate: '', progress: 0 });
  const [feedbackReviewer, setFeedbackReviewer] = useState('');
  const [feedbackToast, setFeedbackToast] = useState('');

  function sendFeedbackRequest() {
    if (!feedbackReviewer.trim()) {
      setFeedbackToast('Please enter a reviewer name.');
      setTimeout(() => setFeedbackToast(''), 3000);
      return;
    }
    const notifs = state.notifications || [];
    const nextId = Math.max(0, ...notifs.map(n => n.id)) + 1;
    dispatch({ type: 'ADD_NOTIFICATION', notification: {
      id: nextId, type: 'feedback_request',
      message: `Feedback request sent to ${feedbackReviewer.trim()} about ${employee.preferredName || employee.firstName}`,
      timestamp: new Date().toISOString(), isRead: false, icon: 'star',
      linkTo: `/people/${employee.id}/performance`, isPastDue: false, dueDate: null
    }});
    setFeedbackToast(`Feedback request sent to ${feedbackReviewer.trim()}!`);
    setFeedbackReviewer('');
    setTimeout(() => setFeedbackToast(''), 3000);
  }

  function addGoal() {
    if (!newGoal.title) return;
    const nextId = Math.max(0, ...(state.goals || []).map(g => g.id)) + 1;
    dispatch({ type: 'ADD_GOAL', goal: { id: nextId, employeeId: employee.id, ...newGoal, status: 'not_started', createdAt: new Date().toISOString() } });
    setNewGoal({ title: '', description: '', dueDate: '', progress: 0 });
    setShowGoalForm(false);
  }

  function statusColor(s) {
    return { on_track: '#73C41D', behind: '#FF9800', completed: '#2196F3', not_started: '#ccc' }[s] || '#ccc';
  }

  const starRating = (rating) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= rating ? '#ffc107' : 'none'} color={i <= rating ? '#ffc107' : '#ddd'} />)}
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        <Award size={18} color="#73C41D" /> Performance
      </div>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {['goals', 'feedback', 'assessment'].map(t => (
          <div key={t} className={`tab ${subTab === t ? 'active' : ''}`} onClick={() => setSubTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {subTab === 'goals' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary" onClick={() => setShowGoalForm(s => !s)}><Plus size={14} /> Add Goal</button>
          </div>
          {showGoalForm && (
            <div style={{ background: '#f8fdf6', border: '1px solid #c9eb8a', borderRadius: 4, padding: '16px', marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={newGoal.title} onChange={e => setNewGoal(g => ({ ...g, title: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={newGoal.description} onChange={e => setNewGoal(g => ({ ...g, description: e.target.value }))} /></div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Due Date</label><input type="date" className="form-input" value={newGoal.dueDate} onChange={e => setNewGoal(g => ({ ...g, dueDate: e.target.value }))} /></div>
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Progress %</label><input type="number" min={0} max={100} className="form-input" value={newGoal.progress} onChange={e => setNewGoal(g => ({ ...g, progress: Number(e.target.value) }))} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-primary" onClick={addGoal}>Save Goal</button><button className="btn btn-secondary" onClick={() => setShowGoalForm(false)}>Cancel</button></div>
            </div>
          )}
          {goals.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No goals yet.</div> : goals.map(g => (
            <div key={g.id} style={{ border: '1px solid #E0E0E0', borderRadius: 4, padding: '14px 16px', marginBottom: 10, background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: '#333', marginBottom: 4 }}>{g.title}</div>
                  {g.description && <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{g.description}</div>}
                </div>
                <span style={{ fontSize: 12, color: statusColor(g.status), fontWeight: 600, marginLeft: 12 }}>{g.progress}%</span>
              </div>
              <div style={{ background: '#E0E0E0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{ background: statusColor(g.status), width: `${g.progress}%`, height: '100%', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Due {g.dueDate}</div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'feedback' && (
        <div>
          <div style={{ background: '#f9f9f9', border: '1px solid #E0E0E0', borderRadius: 4, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#666' }}>
            Just so you know, feedback is hidden from {employee.preferredName || employee.firstName}.
          </div>
          {feedbackToast && (
            <div style={{ background: feedbackToast.includes('Please') ? '#ffebee' : '#edf8e0', border: `1px solid ${feedbackToast.includes('Please') ? '#ef9a9a' : '#b6e07a'}`, color: feedbackToast.includes('Please') ? '#c62828' : '#5CA315', borderRadius: 4, padding: '8px 14px', marginBottom: 12, fontSize: 13 }}>
              {feedbackToast}
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Request feedback about {employee.preferredName || employee.firstName}</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Select some employees who work with {employee.preferredName || employee.firstName}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                placeholder="Search Names"
                style={{ flex: 1 }}
                value={feedbackReviewer}
                onChange={e => setFeedbackReviewer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendFeedbackRequest()}
              />
              <button className="btn btn-secondary" onClick={sendFeedbackRequest}>Send Request</button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'assessment' && (
        <div>
          {reviews.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No assessments found.</div> : reviews.map(rev => {
            const reviewer = state.employees?.find(e => e.id === rev.reviewerId);
            return (
              <div key={rev.id} style={{ border: '1px solid #E0E0E0', borderRadius: 4, padding: '16px', marginBottom: 12, background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{rev.type.replace('_', ' ').toUpperCase()} — {rev.period}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Reviewed by {reviewer?.displayName || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {starRating(rev.rating)}
                    <span className="badge badge-green" style={{ marginTop: 4, display: 'block' }}>Completed</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{rev.comments}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CompensationChangeModal({ employee, state, dispatch, empId, onClose }) {
  const [payRate, setPayRate] = useState(employee.payRate || '');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!payRate) { setError('Pay rate is required.'); return; }
    if (!effectiveDate) { setError('Effective date is required.'); return; }
    const newHistory = [...(employee.payChangeHistory || []), {
      date: effectiveDate,
      description: `Compensation change${reason ? ` — ${reason}` : ''}`,
      amount: Number(payRate),
      payType: employee.payType || 'Salary'
    }];
    dispatch({ type: 'UPDATE_EMPLOYEE', id: empId, changes: { payRate: Number(payRate), payChangeHistory: newHistory } });
    const notifs = state.notifications || [];
    const nextId = Math.max(0, ...notifs.map(n => n.id)) + 1;
    dispatch({ type: 'ADD_NOTIFICATION', notification: {
      id: nextId, type: 'compensation_change',
      message: `Compensation change requested for ${employee.displayName}: $${Number(payRate).toLocaleString()} effective ${effectiveDate}${reason ? ` — ${reason}` : ''}`,
      timestamp: new Date().toISOString(), isRead: false, icon: 'dollar',
      linkTo: `/people/${empId}/job`, isPastDue: false, dueDate: null
    }});
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 480 }}>
        <div className="modal-header">
          <h2>Request Compensation Change</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">New Pay Rate (Annual) *</label>
          <input className="form-input" type="number" value={payRate} onChange={e => setPayRate(e.target.value)} placeholder="e.g. 95000" />
        </div>
        <div className="form-group">
          <label className="form-label">Effective Date *</label>
          <input className="form-input" type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Reason</label>
          <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for compensation change..." style={{ minHeight: 60 }} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Request</button>
        </div>
      </div>
    </div>
  );
}

function JobInfoChangeModal({ employee, state, dispatch, empId, onClose }) {
  const [jobTitle, setJobTitle] = useState(employee.jobTitle || '');
  const [departmentId, setDepartmentId] = useState(employee.departmentId || '');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!jobTitle.trim()) { setError('Job title is required.'); return; }
    dispatch({ type: 'UPDATE_EMPLOYEE', id: empId, changes: { jobTitle: jobTitle.trim(), departmentId: departmentId ? Number(departmentId) : employee.departmentId } });
    const notifs = state.notifications || [];
    const nextId = Math.max(0, ...notifs.map(n => n.id)) + 1;
    dispatch({ type: 'ADD_NOTIFICATION', notification: {
      id: nextId, type: 'job_info_change',
      message: `Job information change requested for ${employee.displayName}: ${jobTitle.trim()}`,
      timestamp: new Date().toISOString(), isRead: false, icon: 'briefcase',
      linkTo: `/people/${empId}/job`, isPastDue: false, dueDate: null
    }});
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 480 }}>
        <div className="modal-header">
          <h2>Request Job Information Change</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">Job Title *</label>
          <input className="form-input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="New job title" />
        </div>
        <div className="form-group">
          <label className="form-label">Department</label>
          <select className="form-select" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
            <option value="">No change</option>
            {(state.departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Request</button>
        </div>
      </div>
    </div>
  );
}

function PromotionModal({ employee, state, dispatch, empId, onClose }) {
  const [newTitle, setNewTitle] = useState(employee.jobTitle || '');
  const [newPayRate, setNewPayRate] = useState(employee.payRate || '');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!newTitle.trim()) { setError('New title is required.'); return; }
    if (!newPayRate) { setError('New pay rate is required.'); return; }
    const newHistory = [...(employee.payChangeHistory || []), {
      date: new Date().toISOString().split('T')[0],
      description: `Promotion to ${newTitle.trim()}`,
      amount: Number(newPayRate),
      payType: employee.payType || 'Salary'
    }];
    dispatch({ type: 'UPDATE_EMPLOYEE', id: empId, changes: { jobTitle: newTitle.trim(), payRate: Number(newPayRate), payChangeHistory: newHistory } });
    const notifs = state.notifications || [];
    const nextId = Math.max(0, ...notifs.map(n => n.id)) + 1;
    dispatch({ type: 'ADD_NOTIFICATION', notification: {
      id: nextId, type: 'promotion',
      message: `Promotion requested for ${employee.displayName}: ${newTitle.trim()} at $${Number(newPayRate).toLocaleString()}`,
      timestamp: new Date().toISOString(), isRead: false, icon: 'award',
      linkTo: `/people/${empId}/job`, isPastDue: false, dueDate: null
    }});
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 480 }}>
        <div className="modal-header">
          <h2>Request Promotion</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">New Title *</label>
          <input className="form-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="New job title after promotion" />
        </div>
        <div className="form-group">
          <label className="form-label">New Pay Rate (Annual) *</label>
          <input className="form-input" type="number" value={newPayRate} onChange={e => setNewPayRate(e.target.value)} placeholder="e.g. 110000" />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Promotion Request</button>
        </div>
      </div>
    </div>
  );
}

function TerminateEmployeeModal({ employee, dispatch, empId, onClose }) {
  const [terminationDate, setTerminationDate] = useState('');
  const [type, setType] = useState('Resignation');
  const [reason, setReason] = useState('');
  const [regrettable, setRegrettable] = useState(false);
  const [rehireEligible, setRehireEligible] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const { state } = useApp();

  function handleSubmit() {
    if (!terminationDate) { setError('Termination date is required.'); return; }
    if (!reason.trim()) { setError('Reason is required.'); return; }
    dispatch({ type: 'UPDATE_EMPLOYEE', id: empId, changes: {
      status: 'Inactive', terminationDate, terminationType: type,
      terminationReason: reason.trim(), regrettable, rehireEligible
    }});
    const notifs = state.notifications || [];
    const nextId = Math.max(0, ...notifs.map(n => n.id)) + 1;
    dispatch({ type: 'ADD_NOTIFICATION', notification: {
      id: nextId, type: 'termination',
      message: `${employee.displayName} has been terminated (${type}) effective ${terminationDate}`,
      timestamp: new Date().toISOString(), isRead: false, icon: 'user-x',
      linkTo: `/people/${empId}`, isPastDue: false, dueDate: null
    }});
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 520 }}>
        <div className="modal-header">
          <h2>Terminate Employee</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 4, padding: '8px 12px', marginBottom: 16, fontSize: 13, color: '#555' }}>
          You are about to terminate <strong>{employee.displayName}</strong>. This will set their status to Inactive.
        </div>
        <div className="form-group">
          <label className="form-label">Termination Date *</label>
          <input className="form-input" type="date" value={terminationDate} onChange={e => setTerminationDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Termination Type *</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            <option>Resignation</option>
            <option>Involuntary</option>
            <option>Death</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Reason *</label>
          <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for termination..." style={{ minHeight: 60 }} />
        </div>
        <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={regrettable} onChange={e => setRegrettable(e.target.checked)} />
            Regrettable
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={rehireEligible} onChange={e => setRehireEligible(e.target.checked)} />
            Eligible for Rehire
          </label>
        </div>
        <div className="form-group">
          <label className="form-label">Additional Notes</label>
          <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes (optional)..." style={{ minHeight: 60 }} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ background: '#c62828', border: 'none' }} onClick={handleSubmit}>Terminate Employee</button>
        </div>
      </div>
    </div>
  );
}

function PayInfoTab({ employee }) {
  function formatPayAmount(amount, payType) {
    if (!amount) return '—';
    if (payType === 'Salary') return `$${Number(amount).toLocaleString()}.00/yr`;
    return `$${Number(amount).toFixed(2)}/hr`;
  }
  function formatPay(emp) {
    return formatPayAmount(emp.payRate, emp.payType);
  }

  // Derive pay history: start with hire date entry, then append tracked changes
  const hireEntry = { date: employee.hireDate || '—', description: 'Initial compensation', amount: formatPay(employee) };
  const changeEntries = (employee.payChangeHistory || []).map(h => ({
    date: h.date,
    description: h.description,
    amount: formatPayAmount(h.amount, h.payType || employee.payType)
  }));
  // Show hire entry only if no change history, otherwise show all entries oldest-first
  const payHistory = changeEntries.length > 0
    ? [hireEntry, ...changeEntries]
    : [hireEntry];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
        <Star size={18} color="#73C41D" /> Pay Info
      </div>

      <SectionBlock title="Current Compensation" icon={<Star size={14} />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
          <Field label="Pay Rate" value={formatPay(employee)} />
          <Field label="Pay Type" value={employee.payType || '—'} />
          <Field label="Pay Frequency" value={employee.payFrequency || '—'} />
          <Field label="Standard Hours/Week" value={employee.standardHoursPerWeek ? `${employee.standardHoursPerWeek} hours` : '—'} />
        </div>
      </SectionBlock>

      <SectionBlock title="Pay History" icon={<Clock size={14} />}>
        <table className="data-table">
          <thead>
            <tr><th>Effective Date</th><th>Description</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {payHistory.map((entry, i) => (
              <tr key={i}>
                <td style={{ fontSize: 13 }}>{entry.date}</td>
                <td style={{ fontSize: 13 }}>{entry.description}</td>
                <td style={{ fontSize: 13, fontWeight: 500 }}>{entry.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBlock>
    </div>
  );
}

const TABS = [
  { key: 'personal', label: 'Personal' },
  { key: 'job', label: 'Job' },
  { key: 'time-off', label: 'Time Off' },
  { key: 'documents', label: 'Documents' },
  { key: 'benefits', label: 'Benefits' },
  { key: 'training', label: 'Training' },
  { key: 'assets', label: 'Assets' },
  { key: 'notes', label: 'Notes' },
  { key: 'pay-info', label: 'Pay Info' },
  { key: 'performance', label: 'Performance' },
];

export default function EmployeeProfile({ myInfo = false }) {
  const { state, dispatch, updateEmployee, getEmployee } = useApp();
  const { id, tab } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [requestMenuOpen, setRequestMenuOpen] = useState(false);
  const [gearMenuOpen, setGearMenuOpen] = useState(false);
  const [requestModal, setRequestModal] = useState(null); // 'compensation'|'job'|'promotion'
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;

  // Determine employee
  const empId = myInfo ? (state.currentUser?.employeeId || 1) : Number(id);
  const employee = getEmployee(empId);

  const activeTab = tab || 'personal';

  if (!employee) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Employee not found.</div>;
  }

  const dept = state.departments?.find(d => d.id === employee.departmentId);
  const location = state.locations?.find(l => l.id === employee.locationId);
  const manager = state.employees?.find(e => e.id === employee.reportsToId);
  const directReports = state.employees?.filter(e => e.reportsToId === employee.id && e.status === 'Active') || [];

  const activeEmployees = (state.employees || []).filter(e => e.status === 'Active');
  const empIndex = activeEmployees.findIndex(e => e.id === employee.id);

  function handlePrev() {
    const prev = activeEmployees[(empIndex - 1 + activeEmployees.length) % activeEmployees.length];
    if (prev) navigate(navTo(`/people/${prev.id}`));
  }
  function handleNext() {
    const next = activeEmployees[(empIndex + 1) % activeEmployees.length];
    if (next) navigate(navTo(`/people/${next.id}`));
  }

  function onUpdate(changes) { updateEmployee(empId, changes); }

  function handleTabClick(tabKey) {
    if (myInfo) {
      navigate(navTo(`/my-info/${tabKey}`));
    } else {
      navigate(navTo(`/people/${empId}/${tabKey}`));
    }
    // Reset editMode when switching away from personal tab
    if (tabKey !== 'personal') setEditMode(false);
  }

  function getTenure(hireDate) {
    if (!hireDate) return '';
    const hire = new Date(hireDate);
    const now = new Date();
    const totalDays = Math.floor((now - hire) / 86400000);
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    return `${years}y · ${months}m · ${days}d`;
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      {/* Profile banner */}
      <div style={{ background: 'linear-gradient(135deg, #4A8A0C 0%, #73C41D 100%)', position: 'relative', overflow: 'visible' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {/* Left: Avatar + Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid white', overflow: 'hidden', flexShrink: 0 }}>
              <Avatar employee={employee} size={100} />
            </div>
            <div style={{ paddingTop: 8 }}>
              <h1 style={{ color: 'white', fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1.2, marginBottom: 4 }}>
                {employee.displayName}
              </h1>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>
                {employee.jobTitle}{dept ? ` · ${dept.name}` : ''}
              </div>
            </div>
          </div>

          {/* Right: Actions + pagination */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            {!myInfo && (
              <div style={{ display: 'flex', gap: 8 }}>
                {/* Request a change */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => { setRequestMenuOpen(o => !o); setGearMenuOpen(false); }}
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.5)', color: 'white', padding: '6px 12px', borderRadius: 4, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    Request a Change <ChevronDown size={12} />
                  </button>
                  {requestMenuOpen && (
                    <div style={{ position: 'absolute', top: '36px', right: 0, background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 500, minWidth: 220 }}>
                      {[
                        { label: 'Request Compensation Change', type: 'compensation' },
                        { label: 'Request Job Information Change', type: 'job' },
                        { label: 'Request Promotion', type: 'promotion' }
                      ].map(({ label, type }) => (
                        <button key={label} onClick={() => { setRequestMenuOpen(false); setRequestModal(type); }} style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: 13, color: '#333', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >{label}</button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Gear */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => { setGearMenuOpen(o => !o); setRequestMenuOpen(false); }}
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.5)', color: 'white', padding: '6px 10px', borderRadius: 4, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Settings size={14} /> <ChevronDown size={12} />
                  </button>
                  {gearMenuOpen && (
                    <div style={{ position: 'absolute', top: '36px', right: 0, background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 500, minWidth: 180 }}>
                      <button onClick={() => { setGearMenuOpen(false); setEditMode(true); handleTabClick('personal'); }} style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: 13, color: '#333', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >Edit Employee</button>
                      <button onClick={() => { setGearMenuOpen(false); setShowTerminateModal(true); }} style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: 13, color: '#c62828', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >Terminate Employee</button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Pagination */}
            {!myInfo && (
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                {empIndex + 1} of {activeEmployees.length} ·
                <button onClick={handlePrev} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontSize: 12, padding: '0 2px' }}>
                  ‹ Previous
                </button>
                |
                <button onClick={handleNext} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontSize: 12, padding: '0 2px' }}>
                  Next ›
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginTop: 12, padding: '0 24px', paddingLeft: '148px', gap: 0 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => handleTabClick(t.key)}
              style={{
                padding: '12px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: 'none', border: 'none',
                color: activeTab === t.key ? 'white' : 'rgba(255,255,255,0.7)',
                borderBottom: activeTab === t.key ? '3px solid white' : '3px solid transparent',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content with sidebar */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
        {/* Left sidebar */}
        <div style={{ width: 220, flexShrink: 0, background: 'white', borderRight: '1px solid #E0E0E0', minHeight: 'calc(100vh - 160px)', padding: '20px 16px' }}>
          {/* Contact info */}
          <div style={{ marginBottom: 20 }}>
            {employee.workPhone && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: '#555', alignItems: 'center' }}>
                <Phone size={13} color="#73C41D" />
                <span>{employee.workPhone}{employee.workPhoneExt ? ` Ext. ${employee.workPhoneExt}` : ''}</span>
              </div>
            )}
            {employee.mobilePhone && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: '#555', alignItems: 'center' }}>
                <Phone size={13} color="#73C41D" />
                <span>{employee.mobilePhone}</span>
              </div>
            )}
            {employee.email && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: '#555', alignItems: 'center' }}>
                <Mail size={13} color="#73C41D" />
                <a href={`mailto:${employee.email}`} style={{ color: '#73C41D', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.email}</a>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#73C41D', fontWeight: 600, marginBottom: 2 }}>Hire Date</div>
            <div style={{ fontSize: 13, color: '#333', marginBottom: 2 }}>{employee.hireDate}</div>
            {employee.hireDate && <div style={{ fontSize: 11, color: '#999' }}>{getTenure(employee.hireDate)}</div>}
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14, marginBottom: 14 }}>
            {[
              { icon: <User size={12} color="#666" />, label: `# ${employee.employeeNumber}` },
              { icon: <Briefcase size={12} color="#666" />, label: employee.employmentStatus },
              { icon: <User size={12} color="#666" />, label: dept?.name },
              { icon: <MapPin size={12} color="#666" />, label: location?.name },
            ].filter(i => i.label).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: '#555', alignItems: 'center' }}>
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {manager && (
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 6, fontWeight: 600 }}>Manager</div>
              <Link to={navTo(`/people/${manager.id}`)} style={{ display: 'flex', gap: 8, alignItems: 'center', textDecoration: 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(manager.id), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {getInitials(manager.displayName || '')}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#73C41D', fontWeight: 500 }}>{manager.displayName}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{manager.jobTitle}</div>
                </div>
              </Link>
            </div>
          )}

          {directReports.length > 0 && (
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 6, fontWeight: 600 }}>Direct Reports</div>
              <Link to={navTo(`/people?reportsTo=${employee.id}`)} style={{ fontSize: 13, color: '#73C41D' }}>
                {directReports.length} Direct Report{directReports.length > 1 ? 's' : ''}
              </Link>
            </div>
          )}

          {/* Social media links */}
          {(employee.socialMediaLinks?.linkedin || employee.socialMediaLinks?.twitter || employee.socialMediaLinks?.facebook) && (
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14, marginTop: 14 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 8, fontWeight: 600 }}>Social Media</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {employee.socialMediaLinks?.linkedin && (
                  <a href={employee.socialMediaLinks.linkedin || '#'} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: '#aaa', display: 'flex' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0077B5'}
                    onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
                  >
                    <Linkedin size={16} />
                  </a>
                )}
                {employee.socialMediaLinks?.twitter && (
                  <a href={employee.socialMediaLinks.twitter || '#'} target="_blank" rel="noopener noreferrer" title="Twitter/X" style={{ color: '#aaa', display: 'flex' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1DA1F2'}
                    onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
                  >
                    <Twitter size={16} />
                  </a>
                )}
                {employee.socialMediaLinks?.facebook && (
                  <a href={employee.socialMediaLinks.facebook || '#'} target="_blank" rel="noopener noreferrer" title="Facebook" style={{ color: '#aaa', display: 'flex' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1877F2'}
                    onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
                  >
                    <Facebook size={16} />
                  </a>
                )}
              </div>
            </div>
          )}
          {/* Always show social media icons (grayed if empty) */}
          {!(employee.socialMediaLinks?.linkedin || employee.socialMediaLinks?.twitter || employee.socialMediaLinks?.facebook) && (
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14, marginTop: 14 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 8, fontWeight: 600 }}>Social Media</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="#" title="LinkedIn" style={{ color: '#ccc', display: 'flex' }} onClick={e => e.preventDefault()}>
                  <Linkedin size={16} />
                </a>
                <a href="#" title="Twitter/X" style={{ color: '#ccc', display: 'flex' }} onClick={e => e.preventDefault()}>
                  <Twitter size={16} />
                </a>
                <a href="#" title="Facebook" style={{ color: '#ccc', display: 'flex' }} onClick={e => e.preventDefault()}>
                  <Facebook size={16} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, background: 'white', minHeight: 'calc(100vh - 160px)' }}>
          {activeTab === 'personal' && <PersonalTab employee={employee} onUpdate={onUpdate} editMode={editMode} onExitEdit={() => setEditMode(false)} />}
          {activeTab === 'job' && <JobTab employee={employee} state={state} />}
          {activeTab === 'time-off' && <TimeOffTab employee={employee} state={state} dispatch={dispatch} />}
          {activeTab === 'documents' && <DocumentsTab employee={employee} state={state} dispatch={dispatch} />}
          {activeTab === 'notes' && <NotesTab employee={employee} state={state} dispatch={dispatch} />}
          {activeTab === 'benefits' && <BenefitsTab employee={employee} state={state} />}
          {activeTab === 'training' && <TrainingTab employee={employee} state={state} />}
          {activeTab === 'assets' && <AssetsTab employee={employee} state={state} />}
          {activeTab === 'pay-info' && <PayInfoTab employee={employee} />}
          {activeTab === 'performance' && <PerformanceTab employee={employee} state={state} dispatch={dispatch} />}
        </div>
      </div>

      {/* Request a Change modals */}
      {requestModal === 'compensation' && (
        <CompensationChangeModal employee={employee} state={state} dispatch={dispatch} empId={empId} onClose={() => setRequestModal(null)} />
      )}
      {requestModal === 'job' && (
        <JobInfoChangeModal employee={employee} state={state} dispatch={dispatch} empId={empId} onClose={() => setRequestModal(null)} />
      )}
      {requestModal === 'promotion' && (
        <PromotionModal employee={employee} state={state} dispatch={dispatch} empId={empId} onClose={() => setRequestModal(null)} />
      )}
      {showTerminateModal && (
        <TerminateEmployeeModal employee={employee} dispatch={dispatch} empId={empId} onClose={() => setShowTerminateModal(false)} />
      )}
    </div>
  );
}
