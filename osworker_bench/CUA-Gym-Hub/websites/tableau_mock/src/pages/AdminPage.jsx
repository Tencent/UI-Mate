import React from 'react'
import { useApp } from '../context/AppContext'

export default function AdminPage() {
  const { state, setAdminTab } = useApp()
  const { uiState, users, groups, schedules, tasks, site } = state
  const activeTab = uiState.adminTab || 'users'

  const tabs = [
    { id: 'users', label: 'Users' },
    { id: 'groups', label: 'Groups' },
    { id: 'schedules', label: 'Schedules' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'site', label: 'Site Settings' }
  ]

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Site Administration</h1>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setAdminTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3>{users.length} Users</h3>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Site Role</th>
                  <th>Group</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar">{u.name.split(' ').map(n => n[0]).join('')}</div>
                        {u.name}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge ${u.siteRole.toLowerCase().replace(/ /g, '-')}`}>{u.siteRole}</span></td>
                    <td>{u.group}</td>
                    <td>{new Date(u.lastLogin).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3>{groups.length} Groups</h3>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Members</th>
                  <th>Minimum Site Role</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(g => (
                  <tr key={g.id}>
                    <td className="group-name-cell">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="6" cy="6" r="3" stroke="#6B7280" strokeWidth="1.2"/>
                        <circle cx="11" cy="8" r="2.5" stroke="#6B7280" strokeWidth="1.2"/>
                        <path d="M1 14c0-2.8 2.2-5 5-5 1.3 0 2.4.5 3.3 1.2" stroke="#6B7280" strokeWidth="1.2"/>
                      </svg>
                      {g.name}
                    </td>
                    <td>{g.userCount}</td>
                    <td>{g.minimumSiteRole}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3>{schedules.length} Schedules</h3>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Frequency</th>
                  <th>Next Run</th>
                  <th>Priority</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td><span className={`ds-badge ${s.type === 'Extract' ? 'extract' : 'live'}`}>{s.type}</span></td>
                    <td>{s.frequency}</td>
                    <td>{new Date(s.nextRun).toLocaleString()}</td>
                    <td>{s.priority}</td>
                    <td><span className="status-badge active">{s.state}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3>{tasks.length} Tasks</h3>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Schedule</th>
                  <th>Type</th>
                  <th>Last Run</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{t.schedule}</td>
                    <td>{t.type}</td>
                    <td>{new Date(t.lastRun).toLocaleString()}</td>
                    <td><span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span></td>
                    <td>{t.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'site' && (
          <div className="admin-site-settings">
            <div className="site-setting-card">
              <h3>Site Information</h3>
              <div className="site-setting-grid">
                <div className="site-setting-item">
                  <span className="site-setting-label">Site Name</span>
                  <span className="site-setting-value">{site.name}</span>
                </div>
                <div className="site-setting-item">
                  <span className="site-setting-label">Site URL</span>
                  <span className="site-setting-value">{site.url}</span>
                </div>
                <div className="site-setting-item">
                  <span className="site-setting-label">Users</span>
                  <span className="site-setting-value">{site.userCount}</span>
                </div>
                <div className="site-setting-item">
                  <span className="site-setting-label">Groups</span>
                  <span className="site-setting-value">{site.groupCount}</span>
                </div>
                <div className="site-setting-item">
                  <span className="site-setting-label">Storage Used</span>
                  <span className="site-setting-value">{site.storageUsed} / {site.storageLimit}</span>
                </div>
              </div>
            </div>
            <div className="site-storage-bar">
              <div className="site-storage-label">Storage Usage</div>
              <div className="site-storage-track">
                <div className="site-storage-fill" style={{ width: `${(parseFloat(site.storageUsed) / parseFloat(site.storageLimit)) * 100}%` }} />
              </div>
              <div className="site-storage-text">{site.storageUsed} of {site.storageLimit}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
