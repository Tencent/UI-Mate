import { useApp } from '../context/AppContext';
import './Pages.css';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const settings = state.settings || {
    receiveDMs: true,
    commentPermission: 'everyone',
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
  };

  const toggle = (key) => {
    dispatch({ type: 'UPDATE_SETTINGS', updates: { [key]: !settings[key] } });
  };

  const setPermission = (value) => {
    dispatch({ type: 'UPDATE_SETTINGS', updates: { commentPermission: value } });
  };

  return (
    <div className="page-content">
      <div className="card">
        <div className="page-header">设置</div>

        {/* Account Settings */}
        <div style={{ padding: '0 16px' }}>
          <div className="settings-section">
            <h3 className="settings-section-title">账号设置</h3>
            <SettingRow
              label="接收私信"
              description="允许其他用户向你发送私信"
              checked={settings.receiveDMs}
              onChange={() => toggle('receiveDMs')}
            />
            <SettingRow
              label="邮件通知"
              description="重要消息发送邮件提醒"
              checked={settings.emailNotifications}
              onChange={() => toggle('emailNotifications')}
            />
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">隐私设置</h3>
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>评论权限</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>谁可以评论你的微博</div>
                </div>
                <select
                  value={settings.commentPermission}
                  onChange={e => setPermission(e.target.value)}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontSize: 13,
                    fontFamily: 'var(--font-family)',
                    outline: 'none',
                  }}
                >
                  <option value="everyone">所有人</option>
                  <option value="followers">关注者</option>
                  <option value="nobody">仅自己</option>
                </select>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">通知设置</h3>
            <SettingRow
              label="推送通知"
              description="新消息、点赞和评论推送"
              checked={settings.pushNotifications}
              onChange={() => toggle('pushNotifications')}
            />
            <SettingRow
              label="夜间模式"
              description="减少蓝光，保护眼睛（占位功能）"
              checked={settings.darkMode}
              onChange={() => toggle('darkMode')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, description, checked, onChange }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 0', borderBottom: '1px solid var(--color-border)'
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {description && (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>{description}</div>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div
      className="settings-toggle"
      onClick={onChange}
      style={{
        width: 44, height: 24,
        borderRadius: 12,
        background: checked ? 'var(--color-primary)' : '#ccc',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2, left: checked ? 22 : 2,
        width: 20, height: 20,
        borderRadius: '50%',
        background: 'white',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}
