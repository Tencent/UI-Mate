import React, { useState } from 'react';
import { Plus, X, Edit3, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { Avatar, StatusIcon } from '../components/Icons.jsx';
import './Settings.css';

const SECTIONS = ['General', 'Members', 'Labels', 'Workflows', 'Integrations'];

const LABEL_COLORS = [
  '#eb5757', '#5e6ad2', '#27a644', '#f2994a', '#8a8f98',
  '#bb6bd9', '#e5484d', '#56b4be', '#f2c94c', '#2196f3',
];

export default function Settings() {
  const { state, dispatch } = useApp();
  const [section, setSection] = useState('General');
  const [workspaceName, setWorkspaceName] = useState(state.workspace?.name || '');

  // Member invite
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteMsg, setInviteMsg] = useState('');

  // Integration state
  const [integrations, setIntegrations] = useState([
    { name: 'GitHub', desc: 'Link pull requests and commits to issues', icon: '🔗', connected: true },
    { name: 'Slack', desc: 'Get notifications and create issues from Slack', icon: '💬', connected: true },
    { name: 'Figma', desc: 'Embed Figma designs in issues', icon: '🎨', connected: false },
    { name: 'Sentry', desc: 'Create issues from Sentry errors', icon: '🐛', connected: false },
    { name: 'GitLab', desc: 'Link merge requests to issues', icon: '🦊', connected: false },
    { name: 'Zendesk', desc: 'Track customer tickets alongside issues', icon: '🎫', connected: false },
  ]);

  // Label management
  const [showNewLabel, setShowNewLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#5e6ad2');
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editLabelName, setEditLabelName] = useState('');
  const [editLabelColor, setEditLabelColor] = useState('');

  function createLabel() {
    if (!newLabelName.trim()) return;
    dispatch({
      type: 'CREATE_LABEL',
      label: {
        id: `l${Date.now()}`,
        name: newLabelName.trim(),
        color: newLabelColor,
        teamId: null,
      },
    });
    setNewLabelName('');
    setNewLabelColor('#5e6ad2');
    setShowNewLabel(false);
  }

  function startEditLabel(label) {
    setEditingLabelId(label.id);
    setEditLabelName(label.name);
    setEditLabelColor(label.color);
  }

  function saveEditLabel() {
    if (!editLabelName.trim()) return;
    dispatch({
      type: 'UPDATE_LABEL',
      labelId: editingLabelId,
      updates: { name: editLabelName.trim(), color: editLabelColor },
    });
    setEditingLabelId(null);
  }

  function deleteLabel(labelId) {
    dispatch({ type: 'DELETE_LABEL', labelId });
  }

  return (
    <div className="settings-page">
      <div className="settings-nav">
        <div className="settings-nav-title">Settings</div>
        {SECTIONS.map(s => (
          <button key={s} className={`settings-nav-item ${section === s ? 'active' : ''}`} onClick={() => setSection(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="settings-content">
        {section === 'General' && (
          <div>
            <h2 className="settings-section-title">General</h2>
            <div className="settings-field">
              <label className="settings-label">Workspace name</label>
              <input
                className="settings-input"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                onBlur={() => dispatch({ type: 'UPDATE_WORKSPACE', updates: { name: workspaceName } })}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label">Workspace URL</label>
              <input className="settings-input" value={`linear.app/${state.workspace?.urlKey || 'acme'}`} readOnly style={{ opacity: 0.6 }} />
            </div>
            <div className="settings-field">
              <label className="settings-label">Timezone</label>
              <input className="settings-input" value="America/Los_Angeles (UTC-7)" readOnly style={{ opacity: 0.6 }} />
            </div>
          </div>
        )}

        {section === 'Members' && (
          <div>
            <h2 className="settings-section-title">Members</h2>
            <p className="settings-subtitle">{(state.users || []).length} members in workspace</p>
            <button className="btn-primary" style={{ marginBottom: 16 }} onClick={() => setShowInviteForm(true)}>
              <Plus size={13} style={{ marginRight: 6 }} />
              Invite member
            </button>
            {showInviteForm && (
              <div className="label-form" style={{ marginBottom: 16 }}>
                <input
                  className="label-form-input"
                  placeholder="Email address"
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') { setShowInviteForm(false); setInviteEmail(''); }
                  }}
                  autoFocus
                />
                <select className="settings-input" style={{ marginTop: 8 }} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                  <option value="Guest">Guest</option>
                </select>
                <div className="label-form-actions" style={{ marginTop: 8 }}>
                  <button className="btn-primary btn-sm" disabled={!inviteEmail.trim() || !inviteEmail.includes('@')} onClick={() => {
                    const email = inviteEmail.trim().toLowerCase();
                    dispatch({
                      type: 'INVITE_MEMBER',
                      invitation: {
                        id: `inv${Date.now()}`,
                        email,
                        role: inviteRole,
                        status: 'pending',
                        invitedBy: state.currentUserId,
                        createdAt: new Date().toISOString(),
                      },
                    });
                    setInviteMsg(`Invitation sent to ${inviteEmail}`);
                    setInviteEmail('');
                    setInviteRole('Member');
                    setShowInviteForm(false);
                    setTimeout(() => setInviteMsg(''), 3000);
                  }}>Send invite</button>
                  <button className="btn-ghost btn-sm" onClick={() => { setShowInviteForm(false); setInviteEmail(''); }}>Cancel</button>
                </div>
              </div>
            )}
            {inviteMsg && <div style={{ padding: '8px 12px', background: '#d4edda', borderRadius: 4, fontSize: 13, marginBottom: 12, color: '#155724' }}>{inviteMsg}</div>}
            <div className="members-list">
              {(state.users || []).map(u => (
                <div key={u.id} className="member-row">
                  <Avatar user={u} size={32} />
                  <div className="member-info">
                    <span className="member-name">{u.name}</span>
                    <span className="member-email">{u.email}</span>
                  </div>
                  <span className={`member-role-badge ${u.role === 'Admin' ? 'admin' : u.role === 'Guest' ? 'guest' : ''}`}>
                    {u.role}
                  </span>
                  <span className={`member-status ${u.active ? 'active' : 'inactive'}`}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
              {(state.invitations || []).map(inv => (
                <div key={inv.id} className="member-row">
                  <Avatar user={{ name: inv.email[0]?.toUpperCase() || '?', avatarColor: '#5e6ad2' }} size={32} />
                  <div className="member-info">
                    <span className="member-name">{inv.email}</span>
                    <span className="member-email">Invitation pending</span>
                  </div>
                  <span className={`member-role-badge ${inv.role === 'Admin' ? 'admin' : inv.role === 'Guest' ? 'guest' : ''}`}>
                    {inv.role}
                  </span>
                  <span className="member-status inactive">Pending</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'Labels' && (
          <div>
            <h2 className="settings-section-title">Labels</h2>
            <p className="settings-subtitle">Manage workspace labels used across all teams.</p>
            <button className="btn-primary btn-sm" style={{ marginBottom: 16 }} onClick={() => setShowNewLabel(true)}>
              <Plus size={12} style={{ marginRight: 4 }} /> New label
            </button>

            {showNewLabel && (
              <div className="label-form">
                <input
                  className="label-form-input"
                  placeholder="Label name"
                  value={newLabelName}
                  onChange={e => setNewLabelName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') createLabel(); if (e.key === 'Escape') setShowNewLabel(false); }}
                  autoFocus
                />
                <div className="label-color-picker">
                  {LABEL_COLORS.map(c => (
                    <button
                      key={c}
                      className={`label-color-btn ${newLabelColor === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setNewLabelColor(c)}
                    />
                  ))}
                </div>
                <div className="label-form-actions">
                  <button className="btn-primary btn-sm" onClick={createLabel} disabled={!newLabelName.trim()}>Create</button>
                  <button className="btn-ghost btn-sm" onClick={() => setShowNewLabel(false)}>Cancel</button>
                </div>
              </div>
            )}

            <div className="labels-list">
              {(state.labels || []).map(l => (
                <div key={l.id} className="label-row">
                  {editingLabelId === l.id ? (
                    <>
                      <span className="label-dot" style={{ background: editLabelColor }} />
                      <input
                        className="label-edit-input"
                        value={editLabelName}
                        onChange={e => setEditLabelName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEditLabel(); if (e.key === 'Escape') setEditingLabelId(null); }}
                        autoFocus
                      />
                      <div className="label-color-picker-inline">
                        {LABEL_COLORS.map(c => (
                          <button
                            key={c}
                            className={`label-color-btn-sm ${editLabelColor === c ? 'selected' : ''}`}
                            style={{ background: c }}
                            onClick={() => setEditLabelColor(c)}
                          />
                        ))}
                      </div>
                      <button className="btn-primary btn-sm" onClick={saveEditLabel}>Save</button>
                      <button className="btn-ghost btn-sm" onClick={() => setEditingLabelId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="label-dot" style={{ background: l.color }} />
                      <span className="label-name">{l.name}</span>
                      <span className="label-color-text" style={{ color: l.color }}>{l.color}</span>
                      <div className="label-actions">
                        <button className="label-action-btn" onClick={() => startEditLabel(l)} title="Edit">
                          <Edit3 size={12} />
                        </button>
                        <button className="label-action-btn danger" onClick={() => deleteLabel(l.id)} title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'Workflows' && (
          <div>
            <h2 className="settings-section-title">Workflows</h2>
            <p className="settings-subtitle">Workflow states define how issues progress through your process.</p>
            {(state.teams || []).map(team => (
              <div key={team.id} className="workflow-team">
                <h3 className="workflow-team-name">{team.icon} {team.name}</h3>
                <div className="workflow-states-grid">
                  {team.workflowStates?.map(s => (
                    <div key={s.id} className="workflow-state-row">
                      <StatusIcon state={s} size={14} />
                      <span className="workflow-state-name">{s.name}</span>
                      <span className="workflow-state-category">{s.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {section === 'Integrations' && (
          <div>
            <h2 className="settings-section-title">Integrations</h2>
            <p className="settings-subtitle">Connect Xinear with your favorite tools.</p>
            <div className="integrations-grid">
              {integrations.map(integration => (
                <div key={integration.name} className="integration-card">
                  <div className="integration-icon">{integration.icon}</div>
                  <div className="integration-info">
                    <span className="integration-name">{integration.name}</span>
                    <span className="integration-desc">{integration.desc}</span>
                  </div>
                  <button
                    className={`integration-btn ${integration.connected ? 'connected' : ''}`}
                    onClick={() => setIntegrations(prev => prev.map(i => i.name === integration.name ? { ...i, connected: !i.connected } : i))}
                  >
                    {integration.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
