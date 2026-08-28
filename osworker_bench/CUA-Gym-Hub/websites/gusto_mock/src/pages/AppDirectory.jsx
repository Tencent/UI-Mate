import { useState } from 'react'

const apps = [
  { id: 'app_1', name: 'QuickBooks Online', category: 'Accounting', description: 'Sync payroll data, expenses, and journal entries automatically.', icon: '📊', installed: true, popular: true },
  { id: 'app_2', name: 'Xero', category: 'Accounting', description: 'Automatically export payroll journal entries to Xero.', icon: '📘', installed: false, popular: true },
  { id: 'app_3', name: 'Slack', category: 'Communication', description: 'Get payroll reminders and HR notifications in Slack channels.', icon: '💬', installed: true, popular: true },
  { id: 'app_4', name: 'Google Workspace', category: 'Productivity', description: 'Sync employee directory with Google Contacts and Calendar.', icon: '📧', installed: false, popular: true },
  { id: 'app_5', name: 'Microsoft 365', category: 'Productivity', description: 'Integrate with Outlook and Teams for employee onboarding.', icon: '📎', installed: false, popular: false },
  { id: 'app_6', name: 'Lattice', category: 'Performance', description: 'Connect employee data for seamless performance reviews.', icon: '🎯', installed: false, popular: false },
  { id: 'app_7', name: 'Greenhouse', category: 'Recruiting', description: 'Automatically onboard new hires from Greenhouse into Xusto.', icon: '🌱', installed: true, popular: true },
  { id: 'app_8', name: 'Lever', category: 'Recruiting', description: 'Sync candidate data and streamline the hiring-to-onboarding flow.', icon: '🔗', installed: false, popular: false },
  { id: 'app_9', name: 'Expensify', category: 'Expense Management', description: 'Import expense reports and reimbursements into payroll.', icon: '🧾', installed: false, popular: true },
  { id: 'app_10', name: 'Justworks', category: 'Benefits', description: 'Coordinate benefits administration across platforms.', icon: '🏥', installed: false, popular: false },
  { id: 'app_11', name: 'Zapier', category: 'Automation', description: 'Build custom workflows connecting Xusto with 5,000+ apps.', icon: '⚡', installed: false, popular: true },
  { id: 'app_12', name: 'Carta', category: 'Equity', description: 'Manage equity grants and cap table alongside payroll.', icon: '📈', installed: false, popular: false },
]

const categories = ['All', ...new Set(apps.map(a => a.category))]

const AppDirectory = () => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [installedApps, setInstalledApps] = useState(() => new Set(apps.filter(a => a.installed).map(a => a.id)))
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const filtered = apps.filter(app => {
    const matchesSearch = !search || app.name.toLowerCase().includes(search.toLowerCase()) || app.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleInstall = (appId, appName) => {
    setInstalledApps(prev => {
      const next = new Set(prev)
      if (next.has(appId)) {
        next.delete(appId)
        showToast(`${appName} has been disconnected`)
      } else {
        next.add(appId)
        showToast(`${appName} has been connected`)
      }
      return next
    })
  }

  return (
    <div className="page-container">
      <h1 className="page-title">App Directory</h1>
      <p style={{ color: 'var(--medium-gray)', fontSize: '14px', marginBottom: '24px' }}>
        Connect your favorite tools to streamline your HR, payroll, and benefits workflows.
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search apps..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '8px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                border: selectedCategory === cat ? '1px solid var(--teal)' : '1px solid var(--border)',
                background: selectedCategory === cat ? 'var(--teal)' : 'var(--white)',
                color: selectedCategory === cat ? 'var(--white)' : 'var(--dark-gray)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.map(app => (
          <div key={app.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '28px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--light-gray)', borderRadius: '10px' }}>
                {app.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>{app.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{app.category}</div>
              </div>
              {app.popular && <span style={{ fontSize: '11px', background: '#FFF3E0', color: '#E65100', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>Popular</span>}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--medium-gray)', lineHeight: '1.5', flex: 1 }}>{app.description}</div>
            <button
              onClick={() => toggleInstall(app.id, app.name)}
              style={{
                padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                border: installedApps.has(app.id) ? '1px solid var(--border)' : '1px solid var(--teal)',
                background: installedApps.has(app.id) ? 'var(--white)' : 'var(--teal)',
                color: installedApps.has(app.id) ? 'var(--medium-gray)' : 'var(--white)',
              }}
            >
              {installedApps.has(app.id) ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--medium-gray)' }}>
          No apps match your search. Try a different keyword or category.
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default AppDirectory
