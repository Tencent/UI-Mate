import { useApp } from '../context/AppContext'

export default function MePage() {
  const { state, dispatch } = useApp()
  const user = state.currentUser
  const settings = state.settings || {}

  const setSetting = (key, val) => dispatch({ type: 'UPDATE_SETTINGS', settings: { [key]: val } })

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Middle panel */}
      <div className="list-panel" style={{ background: 'white' }}>
        <div className="list-panel-header">
          <span style={{ fontWeight: 600, fontSize: 15 }}>我的</span>
        </div>
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
          <div className="avatar-circle" style={{ width: 64, height: 64, fontSize: 24, background: user.avatar }}>
            {user.name.charAt(0)}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.title}</div>
        </div>
      </div>

      {/* Right content */}
      <div style={{ flex: 1, overflow: 'auto', background: '#f7f8fa', padding: 24 }}>
        <div style={{ maxWidth: 560 }}>
          {/* Profile card */}
          <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--border)', padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>基本信息</div>
            {[
              ['姓名', user.name],
              ['职位', user.title],
              ['部门', user.department],
              ['手机', user.phone],
              ['邮箱', user.email],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', marginBottom: 12 }}>
                <span style={{ width: 60, fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 13 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Notification settings */}
          <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--border)', padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>消息通知</div>
            <ToggleRow label="通知声音" checked={settings.notificationSound ?? true} onChange={v => setSetting('notificationSound', v)} />
            <ToggleRow label="消息预览" checked={settings.messagePreview ?? true} onChange={v => setSetting('messagePreview', v)} />
            <ToggleRow label="勿扰模式" checked={settings.dndEnabled ?? false} onChange={v => setSetting('dndEnabled', v)} />
          </div>

          {/* General settings */}
          <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--border)', padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>通用设置</div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ flex: 1, fontSize: 13 }}>语言</span>
              <select value={settings.language || '中文'} onChange={e => setSetting('language', e.target.value)}
                style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 13, fontFamily: 'var(--font-family)' }}>
                <option>中文</option>
                <option>English</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1, fontSize: 13 }}>字体大小</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="range" min={12} max={18} value={settings.fontSize || 14} onChange={e => setSetting('fontSize', parseInt(e.target.value))}
                  style={{ width: 100 }} />
                <span style={{ fontSize: 13, width: 24 }}>{settings.fontSize || 14}</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--border)', padding: '16px 24px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>关于钉钉</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>版本号：7.5.0</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>© 2024 钉钉科技有限公司</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
      <span style={{ flex: 1, fontSize: 13 }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 11, cursor: 'pointer', transition: 'background 0.2s',
          background: checked ? 'var(--primary)' : '#D0D4DA', position: 'relative', flexShrink: 0
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 2, transition: 'left 0.2s',
          left: checked ? 20 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </div>
    </div>
  )
}
