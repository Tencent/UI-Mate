import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Calendar, ChevronDown, Plus, Edit2, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, Badge, getStatusBadge, getLifecycleBadge, formatDate } from '../../components/ui/index.jsx';

const LIFECYCLE_OPTIONS = ['subscriber', 'lead', 'marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer', 'evangelist'];
const LEAD_STATUS_OPTIONS = ['new', 'open', 'in_progress', 'open_deal', 'unqualified', 'attempted_to_contact', 'connected'];

function ActivityIcon({ type }) {
  const icons = { email: '✉', note: '📝', call: '📞', meeting: '📅', form_submission: '📋', task: '✅' };
  return <span style={{ fontSize: 18 }}>{icons[type] || '•'}</span>;
}

function InlineEdit({ value, onSave, type = 'text', options }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const handleSave = () => { onSave(val); setEditing(false); };
  const handleCancel = () => { setVal(value); setEditing(false); };

  if (!editing) {
    return (
      <span
        className="inline-edit-trigger"
        onClick={() => setEditing(true)}
        style={{ color: 'var(--hs-text-primary)', fontSize: 14 }}
        title="Click to edit"
      >
        {type === 'select' ? (options?.find(o=>o.value===value)?.label || value || '—') : (value || '—')}
        <Edit2 size={11} style={{ marginLeft: 4, opacity: 0.4 }} />
      </span>
    );
  }

  if (type === 'select') {
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        <select value={val} onChange={e => setVal(e.target.value)} style={{ fontSize: 13, padding: '4px 6px' }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-success)' }}><Check size={14} /></button>
        <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-danger)' }}><X size={14} /></button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <input value={val} onChange={e => setVal(e.target.value)} style={{ fontSize: 13, padding: '4px 6px' }} onKeyDown={e => { if(e.key==='Enter') handleSave(); if(e.key==='Escape') handleCancel(); }} autoFocus />
      <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-success)' }}><Check size={14} /></button>
      <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-danger)' }}><X size={14} /></button>
    </div>
  );
}

function PropertyRow({ label, value, onSave, type, options, render }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '10px 0', borderBottom: '1px solid var(--hs-border)' }}>
      <div style={{ fontSize: 11, color: 'var(--hs-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
      {render ? render() : (
        <InlineEdit value={value} onSave={onSave} type={type} options={options} />
      )}
    </div>
  );
}

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateItem, addItem, addActivity, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('activity');
  const [noteText, setNoteText] = useState('');
  const [showLogMenu, setShowLogMenu] = useState(false);
  const [showLogModal, setShowLogModal] = useState(null); // 'note'|'call'|'email'|'task'
  const [logFormData, setLogFormData] = useState({ title: '', body: '', duration: '', subject: '' });
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [newTicketData, setNewTicketData] = useState({ subject: '', priority: 'medium', status: 'open' });
  const [tickets, setTickets] = useState([]);
  const [newDealData, setNewDealData] = useState({ name: '', amount: '', stage: 'appointment_scheduled' });
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const logMenuRef = useRef(null);

  const contact = state.contacts?.find(c => c.id === id);
  const activities = state.activities?.[id] || [];
  const users = state.users || [];
  const deals = (state.deals || []).filter(d => d.contactId === id);
  const company = contact?.companyId ? state.companies?.find(c => c.id === contact.companyId) : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (logMenuRef.current && !logMenuRef.current.contains(e.target)) {
        setShowLogMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!contact) {
    return (
      <div style={{ padding: 24 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/contacts')}>
          <ArrowLeft size={15} /> Back to contacts
        </button>
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--hs-text-muted)' }}>Contact not found.</div>
      </div>
    );
  }

  const updateContact = (field, value) => {
    updateItem('contacts', id, { [field]: value });
    showToast('Contact updated', 'success');
  };

  const getUserName = (userId) => {
    const u = users.find(u => u.id === userId);
    return u ? `${u.firstName} ${u.lastName}` : 'Unassigned';
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const note = {
      id: `act-${id}-${Date.now()}`,
      type: 'note',
      title: 'Note added',
      body: noteText,
      timestamp: new Date().toISOString(),
      createdBy: 'user-1'
    };
    addActivity(id, note);
    showToast('Note saved', 'success');
    setNoteText('');
  };

  const handleLogActivity = (type) => {
    setShowLogMenu(false);
    setShowLogModal(type);
    setLogFormData({ title: '', body: '', duration: '', subject: '' });
  };

  const submitLogActivity = () => {
    const typeLabels = { call: 'Call logged', email: 'Email logged', task: 'Task created' };
    const activity = {
      id: `act-${id}-${Date.now()}`,
      type: showLogModal,
      title: logFormData.title || typeLabels[showLogModal] || 'Activity logged',
      body: logFormData.body || '',
      duration: logFormData.duration || null,
      subject: logFormData.subject || null,
      timestamp: new Date().toISOString(),
      createdBy: 'user-1'
    };
    addActivity(id, activity);
    showToast(`${showLogModal.charAt(0).toUpperCase() + showLogModal.slice(1)} logged`, 'success');
    setShowLogModal(null);
  };

  const handleAddCompany = () => {
    if (!selectedCompanyId) return;
    updateItem('contacts', id, { companyId: selectedCompanyId });
    showToast('Company associated', 'success');
    setShowAddCompany(false);
    setSelectedCompanyId('');
  };

  const handleAddDeal = () => {
    if (!newDealData.name.trim()) return;
    addItem('deals', {
      id: `deal-${Date.now()}`,
      name: newDealData.name.trim(),
      amount: parseFloat(newDealData.amount) || 0,
      stage: newDealData.stage,
      contactId: id,
      owner: 'user-1',
      closeDate: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
      createDate: new Date().toISOString()
    });
    showToast('Deal created', 'success');
    setShowAddDeal(false);
    setNewDealData({ name: '', amount: '', stage: 'appointment_scheduled' });
  };

  const stageLabel = (s) => s?.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase()) || '';

  const stageLabels = {
    appointment_scheduled: 'Appointment Scheduled',
    qualified_to_buy: 'Qualified to Buy',
    presentation_scheduled: 'Presentation Scheduled',
    decision_maker_bought_in: 'Decision Maker Bought In',
    contract_sent: 'Contract Sent',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost'
  };

  const emailActivities = activities.filter(a => a.type === 'email');
  const callActivities = activities.filter(a => a.type === 'call');
  const taskActivities = activities.filter(a => a.type === 'task');

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      {/* Left panel */}
      <div style={{ width: 320, flexShrink: 0, borderRight: '1px solid var(--hs-border)', overflowY: 'auto', padding: '20px 0' }}>
        <div style={{ padding: '0 20px', marginBottom: 20 }}>
          <button className="btn btn-ghost" style={{ marginBottom: 16, padding: '6px 10px', fontSize: 13 }} onClick={() => navigate('/contacts')}>
            <ArrowLeft size={14} /> Contacts
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar firstName={contact.firstName} lastName={contact.lastName} size={48} id={contact.id} />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{contact.firstName} {contact.lastName}</h2>
              {contact.jobTitle && <div style={{ fontSize: 13, color: 'var(--hs-text-muted)' }}>{contact.jobTitle}</div>}
              {company && <div style={{ fontSize: 13, color: 'var(--hs-teal)' }}>{company.name}</div>}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>
          <div style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--hs-text-muted)', marginBottom: 8 }}>
            Contact Properties
          </div>
          <PropertyRow label="Email" value={contact.email} onSave={v => updateContact('email', v)} />
          <PropertyRow label="Phone" value={contact.phone} onSave={v => updateContact('phone', v)} />
          <PropertyRow label="Job Title" value={contact.jobTitle} onSave={v => updateContact('jobTitle', v)} />
          <PropertyRow label="Contact Owner"
            value={contact.contactOwner}
            onSave={v => updateContact('contactOwner', v)}
            type="select"
            options={users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
          />
          <PropertyRow label="Lifecycle Stage"
            value={contact.lifecycleStage}
            onSave={v => updateContact('lifecycleStage', v)}
            type="select"
            options={['subscriber','lead','marketing_qualified_lead','sales_qualified_lead','opportunity','customer','evangelist'].map(s => ({ value: s, label: stageLabel(s) }))}
          />
          <PropertyRow label="Lead Status"
            value={contact.leadStatus}
            onSave={v => updateContact('leadStatus', v)}
            type="select"
            options={['new','open','in_progress','open_deal','unqualified','attempted_to_contact','connected'].map(s => ({ value: s, label: stageLabel(s) }))}
          />
          <PropertyRow label="Source" value={contact.source?.replace(/_/g,' ')} onSave={v => updateContact('source', v)} />
          <PropertyRow label="Create Date" render={() => <span style={{ fontSize: 14 }}>{formatDate(contact.createDate)}</span>} />
        </div>
      </div>

      {/* Center panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Log activity button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div style={{ position: 'relative' }} ref={logMenuRef}>
            <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowLogMenu(v => !v)}>
              Log activity ▾
            </button>
            {showLogMenu && (
              <div className="dropdown-menu" style={{ right: 0, top: '100%', minWidth: 180 }}>
                <div className="dropdown-item" onClick={() => { setShowLogMenu(false); setActiveTab('notes'); setNoteText(''); }}>Log note</div>
                <div className="dropdown-item" onClick={() => handleLogActivity('call')}>Log call</div>
                <div className="dropdown-item" onClick={() => handleLogActivity('email')}>Log email</div>
                <div className="dropdown-item" onClick={() => handleLogActivity('task')}>Create task</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 16 }}>
          {['activity', 'notes', 'emails', 'calls', 'tasks'].map(tab => (
            <div key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}
              style={{ textTransform: 'capitalize' }}>
              {tab}
            </div>
          ))}
        </div>

        {/* Activity timeline */}
        {activeTab === 'activity' && (
          <div>
            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--hs-text-muted)', fontSize: 14 }}>
                No activity yet for this contact.
              </div>
            ) : (
              activities.map(act => (
                <div key={act.id} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, background: 'var(--hs-page-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--hs-border)' }}>
                    <ActivityIcon type={act.type} />
                  </div>
                  <div className="card" style={{ flex: 1, padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{act.title}</div>
                    {act.body && <div style={{ fontSize: 13, color: 'var(--hs-text-secondary)', marginBottom: 6 }}>{act.body}</div>}
                    <div style={{ fontSize: 12, color: 'var(--hs-text-muted)' }}>{formatDate(act.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <textarea
                style={{ resize: 'vertical', minHeight: 80 }}
                placeholder="Add a note..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-primary" onClick={addNote} disabled={!noteText.trim()}>Save note</button>
              </div>
            </div>
            {activities.filter(a => a.type === 'note').map(act => (
              <div key={act.id} className="card" style={{ padding: '12px 16px', marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: 'var(--hs-text-primary)', marginBottom: 6 }}>{act.body}</div>
                <div style={{ fontSize: 12, color: 'var(--hs-text-muted)' }}>{formatDate(act.timestamp)} · {getUserName(act.createdBy)}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'emails' && (
          <div>
            {emailActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--hs-text-muted)', fontSize: 14 }}>
                No emails logged yet. Use "Log activity" to log an email.
              </div>
            ) : emailActivities.map(act => (
              <div key={act.id} className="card" style={{ padding: '12px 16px', marginBottom: 10, display: 'flex', gap: 12 }}>
                <div style={{ width: 32, height: 32, background: 'var(--hs-page-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--hs-border)' }}>
                  <ActivityIcon type="email" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{act.title}</div>
                  {act.subject && <div style={{ fontSize: 12, color: 'var(--hs-text-secondary)', marginBottom: 4 }}>Subject: {act.subject}</div>}
                  {act.body && <div style={{ fontSize: 13, color: 'var(--hs-text-secondary)' }}>{act.body}</div>}
                  <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 4 }}>{formatDate(act.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'calls' && (
          <div>
            {callActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--hs-text-muted)', fontSize: 14 }}>
                No calls logged yet. Use "Log activity" to log a call.
              </div>
            ) : callActivities.map(act => (
              <div key={act.id} className="card" style={{ padding: '12px 16px', marginBottom: 10, display: 'flex', gap: 12 }}>
                <div style={{ width: 32, height: 32, background: 'var(--hs-page-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--hs-border)' }}>
                  <ActivityIcon type="call" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{act.title}</div>
                  {act.duration && <div style={{ fontSize: 12, color: 'var(--hs-text-secondary)', marginBottom: 4 }}>Duration: {act.duration} min</div>}
                  {act.body && <div style={{ fontSize: 13, color: 'var(--hs-text-secondary)' }}>{act.body}</div>}
                  <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 4 }}>{formatDate(act.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            {taskActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--hs-text-muted)', fontSize: 14 }}>
                No tasks yet. Use "Log activity" to create a task.
              </div>
            ) : taskActivities.map(act => (
              <div key={act.id} className="card" style={{ padding: '12px 16px', marginBottom: 10, display: 'flex', gap: 12 }}>
                <div style={{ width: 32, height: 32, background: 'var(--hs-page-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--hs-border)' }}>
                  <ActivityIcon type="task" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{act.title}</div>
                  {act.body && <div style={{ fontSize: 13, color: 'var(--hs-text-secondary)' }}>{act.body}</div>}
                  <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 4 }}>{formatDate(act.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div style={{ width: 280, flexShrink: 0, borderLeft: '1px solid var(--hs-border)', overflowY: 'auto', padding: 16 }}>
        {/* Companies */}
        <div className="card" style={{ padding: 0, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--hs-page-bg)', borderBottom: '1px solid var(--hs-border)' }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Companies</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-teal)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 3 }} onClick={() => setShowAddCompany(true)}><Plus size={14} /> Add</button>
          </div>
          <div style={{ padding: '10px 14px' }}>
            {company ? (
              <div style={{ fontSize: 13, color: 'var(--hs-teal)' }}>{company.name}</div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--hs-text-muted)' }}>No companies</div>
            )}
          </div>
        </div>

        {/* Deals */}
        <div className="card" style={{ padding: 0, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--hs-page-bg)', borderBottom: '1px solid var(--hs-border)' }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Deals <span style={{ fontSize: 11, background: 'var(--hs-border)', borderRadius: 10, padding: '1px 6px' }}>{deals.length}</span></span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-teal)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 3 }} onClick={() => setShowAddDeal(true)}><Plus size={14} /> Add</button>
          </div>
          <div style={{ padding: '10px 14px' }}>
            {deals.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--hs-text-muted)' }}>No deals</div>
            ) : deals.map(d => (
              <div key={d.id} style={{ marginBottom: 8, padding: '6px 0', borderBottom: '1px solid var(--hs-border)' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--hs-text-secondary)' }}>${d.amount.toLocaleString()}</span>
                  {getStatusBadge(d.stage)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--hs-page-bg)', borderBottom: '1px solid var(--hs-border)' }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Tickets {tickets.length > 0 && <span style={{ fontSize: 11, background: 'var(--hs-border)', borderRadius: 10, padding: '1px 6px' }}>{tickets.length}</span>}</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-teal)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 3 }} onClick={() => setShowAddTicket(true)}><Plus size={14} /> Add</button>
          </div>
          <div style={{ padding: '10px 14px' }}>
            {tickets.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--hs-text-muted)' }}>No tickets</div>
            ) : tickets.map(t => (
              <div key={t.id} style={{ marginBottom: 8, padding: '6px 0', borderBottom: '1px solid var(--hs-border)' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.subject}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 3, background: t.priority === 'high' ? '#FFEAEA' : t.priority === 'medium' ? '#FFF4E5' : '#E5F5FF', color: t.priority === 'high' ? '#D64545' : t.priority === 'medium' ? '#B36D00' : '#0070B3' }}>{t.priority}</span>
                  <span style={{ fontSize: 12, color: 'var(--hs-text-secondary)' }}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      {showLogModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowLogModal(null)}>
          <div className="card" style={{ width: 480, padding: 24 }}>
            <h2 style={{ marginBottom: 20, fontSize: 18 }}>
              {showLogModal === 'call' ? 'Log call' : showLogModal === 'email' ? 'Log email' : 'Create task'}
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>
                {showLogModal === 'task' ? 'Task title' : 'Title'}
              </label>
              <input
                autoFocus
                value={logFormData.title}
                onChange={e => setLogFormData(p => ({ ...p, title: e.target.value }))}
                placeholder={showLogModal === 'call' ? 'e.g. Discovery call' : showLogModal === 'email' ? 'e.g. Follow-up email' : 'e.g. Follow up with prospect'}
              />
            </div>
            {showLogModal === 'email' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Subject</label>
                <input value={logFormData.subject} onChange={e => setLogFormData(p => ({ ...p, subject: e.target.value }))} placeholder="Email subject" />
              </div>
            )}
            {showLogModal === 'call' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Duration (minutes)</label>
                <input type="number" value={logFormData.duration} onChange={e => setLogFormData(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 15" min="1" />
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Notes</label>
              <textarea value={logFormData.body} onChange={e => setLogFormData(p => ({ ...p, body: e.target.value }))} style={{ minHeight: 80, resize: 'vertical' }} placeholder="Add notes..." />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowLogModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitLogActivity}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAddCompany(false)}>
          <div className="card" style={{ width: 440, padding: 24 }}>
            <h2 style={{ marginBottom: 20, fontSize: 18 }}>Associate company</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Select company</label>
              <select value={selectedCompanyId} onChange={e => setSelectedCompanyId(e.target.value)} style={{ width: '100%' }}>
                <option value="">-- Choose a company --</option>
                {(state.companies || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowAddCompany(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddCompany} disabled={!selectedCompanyId}>Associate</button>
            </div>
          </div>
        </div>
      )}

      {showAddTicket && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAddTicket(false)}>
          <div className="card" style={{ width: 440, padding: 24 }}>
            <h2 style={{ marginBottom: 20, fontSize: 18 }}>Create ticket</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Subject *</label>
              <input autoFocus value={newTicketData.subject} onChange={e => setNewTicketData(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Billing question" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Priority</label>
              <select value={newTicketData.priority} onChange={e => setNewTicketData(p => ({ ...p, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowAddTicket(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (!newTicketData.subject.trim()) return;
                setTickets(prev => [...prev, { id: `ticket-${Date.now()}`, subject: newTicketData.subject.trim(), priority: newTicketData.priority, status: 'open', contactId: id, createDate: new Date().toISOString() }]);
                showToast('Ticket created', 'success');
                setShowAddTicket(false);
                setNewTicketData({ subject: '', priority: 'medium', status: 'open' });
              }}>Create ticket</button>
            </div>
          </div>
        </div>
      )}

      {showAddDeal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAddDeal(false)}>
          <div className="card" style={{ width: 440, padding: 24 }}>
            <h2 style={{ marginBottom: 20, fontSize: 18 }}>Create deal</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Deal name *</label>
              <input autoFocus value={newDealData.name} onChange={e => setNewDealData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Enterprise Contract" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Stage</label>
              <select value={newDealData.stage} onChange={e => setNewDealData(p => ({ ...p, stage: e.target.value }))}>
                {Object.entries(stageLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Amount</label>
              <input type="number" value={newDealData.amount} onChange={e => setNewDealData(p => ({ ...p, amount: e.target.value }))} placeholder="0" min="0" />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowAddDeal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddDeal}>Create deal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
