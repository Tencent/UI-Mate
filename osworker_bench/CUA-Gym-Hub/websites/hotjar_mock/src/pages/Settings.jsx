import { useState } from 'react'
import { User, Palette, Bell, Building, Check, Copy, Eye, EyeOff } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'

const SIDEBAR_ITEMS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'organization', label: 'Organization', icon: Building },
]

export default function Settings() {
  const { state, dispatch } = useAppContext()
  const [activeSection, setActiveSection] = useState('account')
  const [name, setName] = useState(state.currentUser?.name || '')
  const [role, setRole] = useState(state.currentUser?.role || 'Admin')
  const [savedMsg, setSavedMsg] = useState(false)
  const [theme, setTheme] = useState('Light')
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [avatarMsg, setAvatarMsg] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  const [notifications, setNotifications] = useState({
    newRecordings: true,
    surveyResponses: true,
    rageClickAlerts: true,
    weeklyDigest: true,
  })
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  function handleSave() {
    dispatch({ type: 'UPDATE_USER', payload: { name, role } })
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  function handleCopyCode() {
    const code = state.sites.find(s => s.id === state.activeSiteId)?.trackingCode
    if (code && navigator.clipboard) {
      navigator.clipboard.writeText(code)
    }
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  function toggleNotification(key) {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleAvatarFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setAvatarMsg('Choose a JPG or PNG image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg('Choose an image under 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      dispatch({ type: 'UPDATE_USER', payload: { avatar: reader.result, avatarFileName: file.name } })
      setAvatarMsg(`${file.name} selected.`)
    }
    reader.readAsDataURL(file)
  }

  function handlePasswordUpdate() {
    if (!currentPassword || !newPassword) {
      setPasswordMsg('Enter both current and new passwords.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg('New password must be at least 8 characters.')
      return
    }
    dispatch({ type: 'UPDATE_USER', payload: { passwordUpdatedAt: new Date().toISOString() } })
    setCurrentPassword('')
    setNewPassword('')
    setPasswordMsg('Password updated.')
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Settings sub-sidebar */}
      <div style={{ width: 220, minWidth: 220, borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', padding: '16px 0', overflow: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '4px 16px 12px', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SETTINGS</div>
        {SIDEBAR_ITEMS.map(item => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className={`sub-sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <Icon size={16} />
              {item.label}
            </div>
          )
        })}
      </div>

      {/* Settings content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
        {activeSection === 'account' && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Account details</h2>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <img src={state.currentUser?.avatar} alt="" style={{ width: 64, height: 64, borderRadius: '50%' }} />
              <div>
                <label className="btn-secondary" style={{ fontSize: 13, display: 'inline-flex', cursor: 'pointer' }}>
                  Choose file
                  <input type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={e => handleAvatarFile(e.target.files?.[0])} />
                </label>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>JPG, PNG up to 2MB</div>
                {avatarMsg && <div style={{ fontSize: 12, color: avatarMsg.includes('selected') ? '#047857' : '#B91C1C', marginTop: 4 }}>{avatarMsg}</div>}
              </div>
            </div>

            {/* Fields */}
            <div style={{ marginBottom: 16 }}>
              <label className="label">Full name</label>
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label">Your role</label>
              <select className="select" value={role} onChange={e => setRole(e.target.value)}>
                <option>Admin</option>
                <option>Content Designer</option>
                <option>Product Manager</option>
                <option>Developer</option>
                <option>Marketing</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="label">Email address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  className="input"
                  value={state.currentUser?.email}
                  readOnly
                  style={{ background: '#F9FAFB', color: '#6B7280' }}
                />
                <span className="badge badge-green">Verified</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn-primary" onClick={handleSave}>Save changes</button>
              {savedMsg && <span style={{ color: '#10B981', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} /> Saved!</span>}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '32px 0' }} />

            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Security</h2>
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Password</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>Last changed 3 months ago</div>
                </div>
                <button className="btn-secondary" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPassword ? 'Hide' : 'Change password'}
                </button>
              </div>
              {showPassword && (
                <div style={{ marginTop: 12, padding: 12, background: '#F9FAFB', borderRadius: 6 }}>
                  <div style={{ marginBottom: 8 }}>
                    <label className="label">Current password</label>
                    <input className="input" type="password" placeholder="Enter current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label className="label">New password</label>
                    <input className="input" type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  <button className="btn-primary" style={{ fontSize: 13 }} onClick={handlePasswordUpdate}>Update password</button>
                  {passwordMsg && <span style={{ marginLeft: 8, fontSize: 12, color: passwordMsg === 'Password updated.' ? '#047857' : '#B91C1C' }}>{passwordMsg}</span>}
                </div>
              )}
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Two-factor authentication</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>
                    {twoFAEnabled ? 'Two-factor authentication is enabled' : 'Add an extra layer of security to your account'}
                  </div>
                </div>
                <button
                  className={twoFAEnabled ? 'btn-secondary' : 'btn-primary'}
                  style={{ fontSize: 13 }}
                  onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                >
                  {twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
              {twoFAEnabled && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: 13 }}>
                  <Check size={14} /> 2FA is active on your account
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'organization' && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Organization</h2>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 600 }}>Site details</div>
                <span className="badge badge-orange">{state.organization?.plan || 'Business'} plan</span>
              </div>
              {state.sites.map(site => (
                <div key={site.id} style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{site.name}</div>
                    <div style={{ fontSize: 13, color: '#6B7280' }}>{site.url}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: site.isActive ? '#10B981' : '#9CA3AF' }} />
                    <span style={{ fontSize: 12, color: site.isActive ? '#10B981' : '#9CA3AF' }}>{site.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 600 }}>Tracking code</div>
                <button className="btn-secondary" style={{ fontSize: 13 }} onClick={handleCopyCode}>
                  {codeCopied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy code</>}
                </button>
              </div>
              <pre style={{ background: '#1A1A2E', color: '#E5E7EB', borderRadius: 6, padding: 12, fontSize: 12, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                {state.sites.find(s => s.id === state.activeSiteId)?.trackingCode}
              </pre>
            </div>
          </div>
        )}

        {activeSection === 'appearance' && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Appearance</h2>
            <div className="card">
              <div style={{ fontWeight: 500, marginBottom: 12 }}>Theme</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {['Light', 'Dark', 'System'].map(t => (
                  <div
                    key={t}
                    onClick={() => setTheme(t)}
                    style={{
                      flex: 1, padding: 12,
                      border: `2px solid ${theme === t ? '#FF3C00' : '#E5E7EB'}`,
                      borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: 13,
                      color: theme === t ? '#FF3C00' : '#6B7280',
                      background: theme === t ? '#FFF7F5' : '#FFFFFF',
                      transition: 'border-color 0.15s'
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Notifications</h2>
            <div className="card">
              {[
                { key: 'newRecordings', label: 'New recordings', desc: 'Get notified when new recordings are captured' },
                { key: 'surveyResponses', label: 'Survey responses', desc: 'Receive alerts for new survey submissions' },
                { key: 'rageClickAlerts', label: 'Rage click alerts', desc: 'Be notified of unusual rage click activity' },
                { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Receive a weekly summary email' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{item.desc}</div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                    <input type="checkbox" checked={notifications[item.key]} onChange={() => toggleNotification(item.key)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: 12,
                      background: notifications[item.key] ? '#FF3C00' : '#D1D5DB', transition: 'background 0.2s'
                    }}>
                      <span style={{
                        position: 'absolute', left: notifications[item.key] ? 22 : 2, top: 2, width: 20, height: 20,
                        background: '#FFFFFF', borderRadius: '50%', transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
