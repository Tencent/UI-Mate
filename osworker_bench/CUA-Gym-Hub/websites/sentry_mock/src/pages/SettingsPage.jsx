import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { getInitials, getAvatarColor, formatDate } from '../utils/helpers.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

const SETTINGS_TABS = [
  { key: 'general', label: 'General' },
  { key: 'teams', label: 'Teams' },
  { key: 'members', label: 'Members' },
  { key: 'projects', label: 'Projects' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'notifications', label: 'Notifications' },
]

const INTEGRATIONS = [
  { id: 'int-1', name: 'GitHub', icon: '🐙', status: 'installed', description: 'Track commits and pull requests' },
  { id: 'int-2', name: 'Jira', icon: '🔵', status: 'installed', description: 'Create and link Jira issues' },
  { id: 'int-3', name: 'Slack', icon: '💬', status: 'installed', description: 'Get notifications in Slack channels' },
  { id: 'int-4', name: 'PagerDuty', icon: '🔔', status: 'not_installed', description: 'Route alerts to PagerDuty' },
  { id: 'int-5', name: 'Asana', icon: '📋', status: 'not_installed', description: 'Create and link Asana tasks' },
  { id: 'int-6', name: 'Vercel', icon: '▲', status: 'installed', description: 'Monitor Vercel deployments' },
]

export default function SettingsPage() {
  const { state, updateOrganizationSettings, toggleIntegration, toggleNotificationRule } = useApp()
  const { organization, users = [], teams = [], projects = [], installedIntegrations = ['GitHub', 'Jira', 'Slack', 'Vercel'], notificationRules = {} } = state
  const [activeTab, setActiveTab] = useState('general')
  const [orgName, setOrgName] = useState(organization?.name || 'Empower Plant')
  const [timezone, setTimezone] = useState(state.settings?.timezone || 'UTC')
  const [defaultRole, setDefaultRole] = useState(state.settings?.defaultRole || 'Member')
  const [saveMessage, setSaveMessage] = useState('')

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>Settings</h1>

      <div style={{ display: 'flex', gap: 32 }}>
        {/* Left sidebar nav */}
        <div style={{ width: 180, flexShrink: 0 }}>
          {SETTINGS_TABS.map(tab => (
            <div key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 12px', borderRadius: 4, fontSize: 13, cursor: 'pointer',
                color: activeTab === tab.key ? ACCENT : TEXT_PRI,
                backgroundColor: activeTab === tab.key ? '#F0EEFF' : 'transparent',
                fontWeight: activeTab === tab.key ? 600 : 400, marginBottom: 2
              }}
              onMouseEnter={e => { if (activeTab !== tab.key) e.currentTarget.style.backgroundColor = '#FAF9FB' }}
              onMouseLeave={e => { if (activeTab !== tab.key) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeTab === 'general' && (
            <div style={{ maxWidth: 540 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: TEXT_PRI, marginBottom: 20, marginTop: 0 }}>General Settings</h2>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: TEXT_SEC, marginBottom: 4 }}>Organization Name</label>
                <input value={orgName} onChange={e => setOrgName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 13, color: TEXT_PRI, outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: TEXT_SEC, marginBottom: 4 }}>Organization Slug</label>
                <input value={organization?.slug || 'empower-plant'} readOnly
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 13, color: TEXT_SEC, backgroundColor: '#FAF9FB', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: TEXT_SEC, marginBottom: 4 }}>Timezone</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 13, color: TEXT_PRI }}>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: TEXT_SEC, marginBottom: 4 }}>Default Role</label>
                <select value={defaultRole} onChange={e => setDefaultRole(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 13, color: TEXT_PRI }}>
                  <option>Member</option>
                  <option>Admin</option>
                  <option>Manager</option>
                </select>
              </div>
              <button onClick={() => { updateOrganizationSettings(orgName, timezone, defaultRole); setSaveMessage('Saved') }} style={{
                backgroundColor: ACCENT, color: '#fff', border: 'none', borderRadius: 4,
                padding: '8px 20px', fontSize: 13, cursor: 'pointer', fontWeight: 500
              }}>Save Changes</button>
              {saveMessage && <span style={{ marginLeft: 12, color: '#2BA185', fontSize: 13 }}>{saveMessage}</span>}
            </div>
          )}

          {activeTab === 'teams' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: TEXT_PRI, marginBottom: 20, marginTop: 0 }}>Teams</h2>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
                {teams.map((team, idx) => (
                  <div key={team.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', borderBottom: idx < teams.length - 1 ? `1px solid ${BORDER}` : 'none'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: TEXT_PRI }}>#{team.slug}</div>
                      <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>{team.name} &middot; {team.memberCount} members</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {team.members.slice(0, 3).map(mId => {
                        const u = users.find(u => u.id === mId)
                        return u ? (
                          <div key={mId} style={{
                            width: 24, height: 24, borderRadius: '50%',
                            backgroundColor: getAvatarColor(u.name),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, fontWeight: 700, color: '#fff'
                          }} title={u.name}>{getInitials(u.name)}</div>
                        ) : null
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: TEXT_PRI, marginBottom: 20, marginTop: 0 }}>Members</h2>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 180px 100px 120px',
                  padding: '10px 20px', backgroundColor: '#FAF9FB', borderBottom: `1px solid ${BORDER}`,
                  fontSize: 11, fontWeight: 600, color: TEXT_SEC, textTransform: 'uppercase'
                }}>
                  <div>User</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Joined</div>
                </div>
                {users.map((user, idx) => (
                  <div key={user.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 180px 100px 120px',
                    padding: '12px 20px', borderBottom: idx < users.length - 1 ? `1px solid ${BORDER}` : 'none',
                    alignItems: 'center', fontSize: 13
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        backgroundColor: getAvatarColor(user.name),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: '#fff'
                      }}>{getInitials(user.name)}</div>
                      <span style={{ fontWeight: 500, color: TEXT_PRI }}>{user.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: TEXT_SEC }}>{user.email}</div>
                    <div>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 3,
                        backgroundColor: user.role === 'Admin' ? '#F0EEFF' : '#F4F2F7',
                        color: user.role === 'Admin' ? ACCENT : TEXT_SEC, fontWeight: 500
                      }}>{user.role}</span>
                    </div>
                    <div style={{ fontSize: 12, color: TEXT_SEC }}>{formatDate(user.dateJoined)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: TEXT_PRI, marginBottom: 20, marginTop: 0 }}>Projects</h2>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
                {projects.map((proj, idx) => {
                  const projTeams = teams.filter(t => proj.teams.includes(t.id))
                  return (
                    <div key={proj.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 20px', borderBottom: idx < projects.length - 1 ? `1px solid ${BORDER}` : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 4, height: 32, borderRadius: 2, backgroundColor: proj.color }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: TEXT_PRI }}>{proj.name}</div>
                          <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>{proj.platform}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {projTeams.map(t => (
                          <span key={t.id} style={{
                            fontSize: 10, padding: '2px 6px', borderRadius: 3,
                            backgroundColor: '#F0EEFF', color: ACCENT, fontWeight: 500
                          }}>#{t.slug}</span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: TEXT_PRI, marginBottom: 20, marginTop: 0 }}>Integrations</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {INTEGRATIONS.map(intg => (
                  <div key={intg.id} style={{
                    border: `1px solid ${BORDER}`, borderRadius: 6, padding: 16,
                    display: 'flex', flexDirection: 'column', gap: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{intg.icon}</span>
                        <span style={{ fontWeight: 600, fontSize: 14, color: TEXT_PRI }}>{intg.name}</span>
                      </div>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 3, fontWeight: 600,
                        backgroundColor: installedIntegrations.includes(intg.name) ? '#E8F8F5' : '#F4F2F7',
                        color: installedIntegrations.includes(intg.name) ? '#2BA185' : TEXT_SEC
                      }}>
                        {installedIntegrations.includes(intg.name) ? 'Installed' : 'Available'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: TEXT_SEC }}>{intg.description}</div>
                    <button onClick={() => toggleIntegration(intg.name)} style={{
                      marginTop: 'auto', border: `1px solid ${installedIntegrations.includes(intg.name) ? BORDER : ACCENT}`,
                      borderRadius: 4, padding: '5px 12px', fontSize: 12, cursor: 'pointer',
                      backgroundColor: installedIntegrations.includes(intg.name) ? '#fff' : ACCENT,
                      color: installedIntegrations.includes(intg.name) ? TEXT_PRI : '#fff', fontWeight: 500
                    }}>
                      {installedIntegrations.includes(intg.name) ? 'Disconnect' : 'Install'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ maxWidth: 540 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: TEXT_PRI, marginBottom: 20, marginTop: 0 }}>Notification Rules</h2>
              {[
                { label: 'Alerts', desc: 'Get notified when alert rules trigger', enabled: true },
                { label: 'Issue Assigned', desc: 'When an issue is assigned to you', enabled: true },
                { label: 'Issue Resolved', desc: 'When issues you follow are resolved', enabled: false },
                { label: 'Deploy', desc: 'When a new release is deployed', enabled: true },
                { label: 'Weekly Reports', desc: 'Receive weekly error summary', enabled: false }
              ].map((rule, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: `1px solid ${BORDER}`
                }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14, color: TEXT_PRI }}>{rule.label}</div>
                    <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>{rule.desc}</div>
                  </div>
                  {(() => {
                    const enabled = notificationRules[rule.label] ?? rule.enabled
                    return (
                  <div
                    onClick={() => toggleNotificationRule(rule.label)}
                    data-enabled={String(enabled)}
                    style={{
                      width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                      backgroundColor: enabled ? ACCENT : '#E2DBE8',
                      position: 'relative', transition: 'background-color 0.2s'
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff',
                      position: 'absolute', top: 2, left: enabled ? 20 : 2,
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                    )
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
