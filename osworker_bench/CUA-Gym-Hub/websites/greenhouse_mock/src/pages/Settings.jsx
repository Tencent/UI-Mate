import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings as SettingsIcon, FileText, Users, Mail, Clipboard, Layers, Building, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Settings() {
  const { state, dispatch } = useAppContext();
  const [activeTab, setActiveTab] = useState('departments');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('');
  const [formData, setFormData] = useState({});

  const settings = state.settings || {};

  const tabs = [
    { key: 'departments', label: 'Departments', icon: Building },
    { key: 'job_templates', label: 'Job Templates', icon: Layers },
    { key: 'interview_kits', label: 'Interview Kits', icon: Clipboard },
    { key: 'scorecard_templates', label: 'Scorecard Templates', icon: FileText },
    { key: 'email_templates', label: 'Email Templates', icon: Mail },
    { key: 'team', label: 'Team Members', icon: Users },
  ];

  const openAddModal = (type) => {
    setAddType(type);
    setFormData({});
    setShowAddModal(true);
  };

  const handleAddDepartment = () => {
    if (!formData.name?.trim()) return;
    const newDept = { id: uuidv4(), name: formData.name.trim(), parentId: null };
    dispatch({ type: 'SET_STATE', payload: { ...state, departments: [...state.departments, newDept] } });
    setShowAddModal(false);
  };

  const handleAddEmailTemplate = () => {
    if (!formData.name?.trim() || !formData.subject?.trim()) return;
    const newTemplate = { id: uuidv4(), name: formData.name.trim(), subject: formData.subject.trim(), body: formData.body || '' };
    const updatedSettings = { ...settings, emailTemplates: [...(settings.emailTemplates || []), newTemplate] };
    dispatch({ type: 'SET_STATE', payload: { ...state, settings: updatedSettings } });
    setShowAddModal(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
        {/* Left nav */}
        <div>
          <div style={{ background: 'white', borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {tabs.map(item => (
              <div
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer',
                  background: activeTab === item.key ? '#F0FBF7' : 'transparent',
                  color: activeTab === item.key ? 'var(--accent)' : 'var(--text-primary)',
                  borderLeft: activeTab === item.key ? '3px solid var(--accent)' : '3px solid transparent',
                  fontWeight: activeTab === item.key ? 600 : 400,
                  fontSize: 14,
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => { if (activeTab !== item.key) e.currentTarget.style.background = 'var(--divider)'; }}
                onMouseLeave={e => { if (activeTab !== item.key) e.currentTarget.style.background = 'transparent'; }}
              >
                <item.icon size={15} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Departments */}
          {activeTab === 'departments' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Departments</span>
                <button className="btn btn-primary btn-sm" onClick={() => openAddModal('department')}><Plus size={14} /> Add Department</button>
              </div>
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Open Jobs</th>
                      <th>Total Candidates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.departments.map(dept => {
                      const deptJobs = state.jobs.filter(j => j.departmentId === dept.id);
                      const openJobs = deptJobs.filter(j => j.status === 'open').length;
                      const totalCands = state.applications.filter(a => deptJobs.some(j => j.id === a.jobId)).length;
                      return (
                        <tr key={dept.id}>
                          <td style={{ fontWeight: 600 }}>{dept.name}</td>
                          <td>{openJobs}</td>
                          <td>{totalCands}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Job Templates */}
          {activeTab === 'job_templates' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Job Templates</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                {(settings.jobTemplates || []).map(jt => {
                  const dept = state.departments.find(d => d.id === jt.departmentId);
                  return (
                    <div key={jt.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--divider)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{jt.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{dept?.name}</div>
                        </div>
                        <span className="badge badge-gray">{jt.defaultStages?.length || 0} stages</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {(jt.defaultStages || []).map((s, i) => (
                          <span key={i} style={{ fontSize: 11, background: 'var(--divider)', padding: '2px 8px', borderRadius: 10, color: 'var(--text-secondary)' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {(!settings.jobTemplates || settings.jobTemplates.length === 0) && (
                  <div className="empty-state"><h3>No job templates</h3></div>
                )}
              </div>
            </div>
          )}

          {/* Interview Kits */}
          {activeTab === 'interview_kits' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Interview Kits</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                {(settings.interviewKits || []).map(kit => (
                  <div key={kit.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--divider)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{kit.name}</div>
                      <span className="badge badge-gray">{kit.duration} min</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{kit.description}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      <strong>Sample Questions:</strong>
                      <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                        {(kit.questions || []).map((q, i) => (
                          <li key={i} style={{ marginBottom: 2 }}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
                {(!settings.interviewKits || settings.interviewKits.length === 0) && (
                  <div className="empty-state"><h3>No interview kits</h3></div>
                )}
              </div>
            </div>
          )}

          {/* Scorecard Templates */}
          {activeTab === 'scorecard_templates' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Scorecard Templates</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                {(settings.scorecardTemplates || []).map(sct => (
                  <div key={sct.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--divider)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{sct.name}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(sct.attributes || []).map((attr, i) => (
                        <span key={i} style={{ fontSize: 12, background: '#DBEAFE', color: '#1E40AF', padding: '3px 10px', borderRadius: 10, fontWeight: 500 }}>
                          {attr}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                      Rating scale: 1 (Strong No) to 4 (Strong Yes)
                    </div>
                  </div>
                ))}
                {(!settings.scorecardTemplates || settings.scorecardTemplates.length === 0) && (
                  <div className="empty-state"><h3>No scorecard templates</h3></div>
                )}
              </div>
            </div>
          )}

          {/* Email Templates */}
          {activeTab === 'email_templates' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Email Templates</span>
                <button className="btn btn-primary btn-sm" onClick={() => openAddModal('email_template')}><Plus size={14} /> Add Template</button>
              </div>
              <div style={{ padding: '8px 0' }}>
                {(settings.emailTemplates || []).map(et => (
                  <div key={et.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--divider)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{et.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 6 }}>Subject: {et.subject}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'pre-line', maxHeight: 80, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
                      {et.body}
                    </div>
                  </div>
                ))}
                {(!settings.emailTemplates || settings.emailTemplates.length === 0) && (
                  <div className="empty-state"><h3>No email templates</h3></div>
                )}
              </div>
            </div>
          )}

          {/* Team Members */}
          {activeTab === 'team' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Team Members</span>
              </div>
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Title</th>
                      <th>Department</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.users.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)',
                              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 600, flexShrink: 0
                            }}>
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user.email}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{user.title}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{user.department}</td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'badge-dark-green' : user.role === 'hiring_manager' ? 'badge-blue' : user.role === 'recruiter' ? 'badge-green' : 'badge-gray'}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal" style={{ maxWidth: addType === 'email_template' ? 560 : 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {addType === 'department' ? 'Add Department' : 'Add Email Template'}
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {addType === 'department' && (
                <div className="form-group">
                  <label className="form-label">Department Name *</label>
                  <input className="form-input" placeholder="e.g. Data Science" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                </div>
              )}
              {addType === 'email_template' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Template Name *</label>
                    <input className="form-input" placeholder="e.g. Follow Up" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input className="form-input" placeholder="Email subject line" value={formData.subject || ''} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Body</label>
                    <textarea className="form-textarea" placeholder="Email body..." value={formData.body || ''} onChange={e => setFormData(p => ({ ...p, body: e.target.value }))} style={{ minHeight: 120 }} />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addType === 'department' ? handleAddDepartment : handleAddEmailTemplate}>
                {addType === 'department' ? 'Add Department' : 'Add Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
