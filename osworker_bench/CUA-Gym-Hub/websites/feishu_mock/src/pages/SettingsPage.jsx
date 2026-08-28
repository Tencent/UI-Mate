import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: '#8F959E', textTransform: 'uppercase',
        letterSpacing: '0.05em', marginBottom: 12, paddingBottom: 8,
        borderBottom: '1px solid #DEE0E3',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderBottom: '1px solid #F0F1F2',
    }}>
      <div style={{ flex: 1, paddingRight: 24 }}>
        <div style={{ fontSize: 14, color: '#1F2329', fontWeight: 500 }}>{label}</div>
        {description && (
          <div style={{ fontSize: 12, color: '#8F959E', marginTop: 2 }}>{description}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
        background: value ? '#3370FF' : '#DEE0E3', position: 'relative',
        transition: 'background 0.2s', padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
        display: 'block',
      }} />
    </button>
  );
}

function Select({ value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '5px 28px 5px 10px', border: '1px solid #DEE0E3',
        borderRadius: 6, fontSize: 13, color: '#1F2329',
        background: '#fff', cursor: 'pointer', outline: 'none',
        appearance: 'auto',
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  // General settings — backed by real state
  const language = state.settings?.language ?? 'zh-CN';
  const theme = state.settings?.theme ?? 'light';
  const fontSize = state.settings?.fontSize ?? 'medium';
  const autoStart = state.settings?.autoStart === true;
  const doNotDisturb = state.settings?.doNotDisturb ?? 'off';
  const messagePermission = state.settings?.messagePermission ?? 'everyone';

  // Notification settings — backed by real state
  const notifSound = state.settings?.notificationSound !== false;
  const notifDesktop = state.settings?.desktopNotification !== false;
  const notifMention = state.settings?.mentionNotification !== false;
  const notifEmail = state.settings?.emailDigest === true;

  function setNotifSetting(key, value) {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { [key]: value },
    });
  }

  // Privacy settings
  const showOnlineStatus = state.settings?.showOnlineStatus !== false;
  const readReceipt = state.settings?.readReceipt !== false;
  const allowSearch = state.settings?.allowSearch !== false;

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', background: '#F7F8FA', overflow: 'auto' }}>
      {/* Settings content area */}
      <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '20px 0 16px', borderBottom: '1px solid #DEE0E3', marginBottom: 24,
          position: 'sticky', top: 0, background: '#F7F8FA', zIndex: 10,
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 32, height: 32, borderRadius: 6, border: '1px solid #DEE0E3',
              background: '#fff', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#646A73',
              flexShrink: 0,
            }}
            title="返回"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1F2329', margin: 0 }}>设置</h1>
        </div>

        {/* 通用设置 */}
        <Section title="通用设置">
          <SettingRow label="语言" description="选择界面显示语言">
            <Select
              value={language}
              onChange={v => setNotifSetting('language', v)}
              options={[
                { value: 'zh-CN', label: '简体中文' },
                { value: 'zh-TW', label: '繁体中文' },
                { value: 'en-US', label: 'English' },
                { value: 'ja-JP', label: '日本語' },
              ]}
            />
          </SettingRow>
          <SettingRow label="主题" description="选择应用外观主题">
            <Select
              value={theme}
              onChange={v => setNotifSetting('theme', v)}
              options={[
                { value: 'light', label: '浅色模式' },
                { value: 'dark', label: '深色模式' },
                { value: 'auto', label: '跟随系统' },
              ]}
            />
          </SettingRow>
          <SettingRow label="字体大小" description="调整消息内容字体大小">
            <Select
              value={fontSize}
              onChange={v => setNotifSetting('fontSize', v)}
              options={[
                { value: 'small', label: '小' },
                { value: 'medium', label: '中（默认）' },
                { value: 'large', label: '大' },
              ]}
            />
          </SettingRow>
          <SettingRow label="开机自启动" description="登录系统时自动启动飞书">
            <Toggle value={autoStart} onChange={v => setNotifSetting('autoStart', v)} />
          </SettingRow>
        </Section>

        {/* 通知设置 */}
        <Section title="通知设置">
          <SettingRow label="消息通知声音" description="收到新消息时播放提示音">
            <Toggle
              value={notifSound}
              onChange={v => setNotifSetting('notificationSound', v)}
            />
          </SettingRow>
          <SettingRow label="桌面通知" description="在系统桌面显示消息弹窗提醒">
            <Toggle
              value={notifDesktop}
              onChange={v => setNotifSetting('desktopNotification', v)}
            />
          </SettingRow>
          <SettingRow label="@我时通知" description="被@提及时发出特殊提醒">
            <Toggle
              value={notifMention}
              onChange={v => setNotifSetting('mentionNotification', v)}
            />
          </SettingRow>
          <SettingRow label="邮件摘要" description="每日发送未读消息摘要到邮箱">
            <Toggle
              value={notifEmail}
              onChange={v => setNotifSetting('emailDigest', v)}
            />
          </SettingRow>
          <SettingRow label="免打扰时段" description="设置特定时间段内不接收通知">
            <Select
              value={doNotDisturb}
              onChange={v => setNotifSetting('doNotDisturb', v)}
              options={[
                { value: 'off', label: '关闭' },
                { value: '22-8', label: '22:00 - 08:00' },
                { value: '20-9', label: '20:00 - 09:00' },
                { value: 'custom', label: '自定义' },
              ]}
            />
          </SettingRow>
        </Section>

        {/* 隐私设置 */}
        <Section title="隐私设置">
          <SettingRow label="显示在线状态" description="允许其他人看到您的在线/离线状态">
            <Toggle
              value={showOnlineStatus}
              onChange={v => setNotifSetting('showOnlineStatus', v)}
            />
          </SettingRow>
          <SettingRow label="已读回执" description="发送消息后显示对方是否已读">
            <Toggle
              value={readReceipt}
              onChange={v => setNotifSetting('readReceipt', v)}
            />
          </SettingRow>
          <SettingRow label="允许搜索到我" description="其他成员可以通过姓名或邮箱搜索到您">
            <Toggle
              value={allowSearch}
              onChange={v => setNotifSetting('allowSearch', v)}
            />
          </SettingRow>
          <SettingRow label="谁可以向我发送消息" description="">
            <Select
              value={messagePermission}
              onChange={v => setNotifSetting('messagePermission', v)}
              options={[
                { value: 'everyone', label: '所有成员' },
                { value: 'contacts', label: '仅联系人' },
                { value: 'nobody', label: '仅自己' },
              ]}
            />
          </SettingRow>
        </Section>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
