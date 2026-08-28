import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Shield, Key, Smartphone, Eye, EyeOff, Check, X, AlertTriangle, Lock, Monitor } from 'lucide-react'
import { useApp } from '../context/AppContext'

function SectionCard({ icon: Icon, title, badge, badgeColor, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && <Icon size={16} style={{ color: '#FF6A00' }} />}
        {title}
        {badge && (
          <span style={{ marginLeft: 'auto', background: badgeColor || '#E6F4FF', color: badgeColor ? '#fff' : '#0070CC', padding: '2px 10px', borderRadius: 12, fontSize: 12 }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
      <div>
        <div style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 24 }}>
        {children}
      </div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 22, borderRadius: 11, cursor: 'pointer',
        background: value ? '#0070CC' : '#ccc',
        position: 'relative', transition: 'background 0.2s'
      }}
    >
      <div style={{
        position: 'absolute', top: 2, left: value ? 24 : 2,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </div>
  )
}

function ChangePasswordModal({ onClose, onSave }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!form.current) { setError('请输入当前密码'); return }
    if (form.next.length < 8) { setError('新密码长度不能少于8位'); return }
    if (form.next !== form.confirm) { setError('两次输入的密码不一致'); return }
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 420 }}>
        <div className="modal-title">修改登录密码</div>

        {['current', 'next', 'confirm'].map((key, i) => (
          <div key={key} className="form-group">
            <label className="form-label">{['当前密码', '新密码', '确认新密码'][i]}</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={show[key] ? 'text' : 'password'}
                value={form[key]}
                onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setError('') }}
                placeholder={['请输入当前密码', '至少8位，含字母和数字', '请再次输入新密码'][i]}
                style={{ paddingRight: 36 }}
              />
              <button
                type="button"
                onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
              >
                {show[key] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        ))}

        {error && (
          <div style={{ color: '#FF4D4F', fontSize: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={12} /> {error}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-normal" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>确认修改</button>
        </div>
      </div>
    </div>
  )
}

const LOGIN_LOG = [
  { time: '2024-03-15 14:32', ip: '120.26.45.67', location: '中国·浙江·杭州', device: 'Chrome / macOS', result: '成功' },
  { time: '2024-03-14 09:18', ip: '120.26.45.67', location: '中国·浙江·杭州', device: 'Chrome / macOS', result: '成功' },
  { time: '2024-03-14 23:45', ip: '203.0.113.45', location: '未知地区', device: 'Firefox / Windows', result: '失败' },
  { time: '2024-03-13 17:05', ip: '120.26.45.67', location: '中国·浙江·杭州', device: 'Safari / iOS', result: '成功' },
  { time: '2024-03-12 11:22', ip: '120.26.45.67', location: '中国·浙江·杭州', device: 'Chrome / macOS', result: '成功' },
]

export default function SecuritySettings() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = p => sid ? `${p}?sid=${sid}` : p

  const security = state.security || {
    mfaEnabled: false,
    loginNotify: true,
    ipWhitelistEnabled: false,
    accessKeyCount: 2,
    lastPasswordChange: '2024-01-10',
  }

  const [showPwdModal, setShowPwdModal] = useState(false)
  const [pwdChanged, setPwdChanged] = useState(false)
  const [bindMfaOpen, setBindMfaOpen] = useState(false)
  const [mfaStep, setMfaStep] = useState(1)

  const updateSecurity = patch => {
    updateState(prev => ({ ...prev, security: { ...(prev.security || security), ...patch } }))
  }

  const secState = state.security || security

  const handlePasswordSave = () => {
    setShowPwdModal(false)
    setPwdChanged(true)
    updateSecurity({ lastPasswordChange: new Date().toISOString().split('T')[0] })
    setTimeout(() => setPwdChanged(false), 3000)
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <span>安全设置</span>
      </div>

      <div className="page-header">
        <h1 className="page-title">安全设置</h1>
        {pwdChanged && (
          <span style={{ color: '#52C41A', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={14} /> 密码已更新
          </span>
        )}
      </div>

      {/* Security Score */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: 80, height: 80, transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F0F0F0" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={secState.mfaEnabled ? '#52C41A' : '#FF9900'} strokeWidth="3"
                strokeDasharray={`${secState.mfaEnabled ? 75 : 55} 100`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: secState.mfaEnabled ? '#52C41A' : '#FF9900' }}>
                {secState.mfaEnabled ? '75' : '55'}
              </div>
              <div style={{ fontSize: 10, color: '#999' }}>分</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4 }}>
              安全分数：{secState.mfaEnabled ? '良好' : '待提升'}
            </div>
            <div style={{ fontSize: 12, color: '#999', lineHeight: 1.6 }}>
              {secState.mfaEnabled
                ? '您的账号安全状态良好。建议定期更换密码并检查登录记录。'
                : '建议开启多因素认证（MFA）以提升账号安全等级。'}
            </div>
          </div>
        </div>
      </div>

      {/* Login Password */}
      <SectionCard icon={Key} title="登录密码">
        <SettingRow
          label="登录密码"
          desc={`上次修改时间：${secState.lastPasswordChange || '未知'}`}
        >
          <button className="btn-normal" onClick={() => setShowPwdModal(true)}>修改密码</button>
        </SettingRow>
      </SectionCard>

      {/* MFA */}
      <SectionCard icon={Smartphone} title="多因素认证（MFA）"
        badge={secState.mfaEnabled ? '已启用' : '未启用'}
        badgeColor={secState.mfaEnabled ? '#52C41A' : undefined}
      >
        <SettingRow
          label="虚拟MFA设备"
          desc="使用手机App（如Google Authenticator）作为第二验证因素"
        >
          {secState.mfaEnabled ? (
            <button className="btn-normal" onClick={() => updateSecurity({ mfaEnabled: false })}>解绑MFA</button>
          ) : (
            <button className="btn-blue" onClick={() => { setBindMfaOpen(true); setMfaStep(1) }}>绑定MFA</button>
          )}
        </SettingRow>
      </SectionCard>

      {/* Login Notifications */}
      <SectionCard icon={Shield} title="登录保护">
        <SettingRow
          label="异地登录通知"
          desc="当检测到异地IP登录时，发送短信和邮件提醒"
        >
          <Toggle value={secState.loginNotify !== false} onChange={v => updateSecurity({ loginNotify: v })} />
        </SettingRow>
        <SettingRow
          label="IP白名单"
          desc="仅允许白名单内的IP地址登录控制台"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Toggle value={!!secState.ipWhitelistEnabled} onChange={v => updateSecurity({ ipWhitelistEnabled: v })} />
            {secState.ipWhitelistEnabled && (
              <button className="btn-normal" style={{ fontSize: 12, height: 26 }}>管理白名单</button>
            )}
          </div>
        </SettingRow>
      </SectionCard>

      {/* Access Keys */}
      <SectionCard icon={Lock} title="访问密钥（AccessKey）">
        <SettingRow
          label="AccessKey 管理"
          desc={`当前共有 ${secState.accessKeyCount ?? 2} 个 AccessKey`}
        >
          <button className="btn-normal">管理 AccessKey</button>
        </SettingRow>
        <div style={{ background: '#FFFBE6', border: '1px solid #FFE58F', borderRadius: 4, padding: '10px 14px', marginTop: 8, fontSize: 12, color: '#666', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <AlertTriangle size={14} style={{ color: '#FA8C16', marginTop: 1, flexShrink: 0 }} />
          <span>AccessKey 拥有账号的完整权限，请妥善保管，不要泄露给他人。建议为子账号创建单独的 AccessKey 并按需授权。</span>
        </div>
      </SectionCard>

      {/* Login History */}
      <SectionCard icon={Monitor} title="近期登录记录">
        <table className="data-table" style={{ marginTop: 4 }}>
          <thead>
            <tr>
              <th>登录时间</th>
              <th>IP地址</th>
              <th>登录地区</th>
              <th>设备/浏览器</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            {LOGIN_LOG.map((log, i) => (
              <tr key={i}>
                <td>{log.time}</td>
                <td><span className="mono">{log.ip}</span></td>
                <td>{log.location}</td>
                <td>{log.device}</td>
                <td>
                  <span style={{ color: log.result === '成功' ? '#52C41A' : '#FF4D4F', fontWeight: 500 }}>
                    {log.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Password Modal */}
      {showPwdModal && (
        <ChangePasswordModal onClose={() => setShowPwdModal(false)} onSave={handlePasswordSave} />
      )}

      {/* Bind MFA Modal */}
      {bindMfaOpen && (
        <div className="modal-overlay" onClick={() => setBindMfaOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 460 }}>
            <div className="modal-title">绑定虚拟MFA设备</div>

            <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
              {['安装App', '扫描二维码', '验证绑定'].map((s, i) => (
                <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', margin: '0 auto 6px',
                    background: mfaStep > i ? '#0070CC' : mfaStep === i + 1 ? '#0070CC' : '#F0F0F0',
                    color: mfaStep >= i + 1 ? '#fff' : '#999',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600
                  }}>
                    {mfaStep > i + 1 ? <Check size={14} /> : i + 1}
                  </div>
                  <div style={{ fontSize: 12, color: mfaStep === i + 1 ? '#0070CC' : '#999' }}>{s}</div>
                  {i < 2 && <div style={{ position: 'absolute', top: 14, left: '60%', right: '-40%', height: 2, background: mfaStep > i + 1 ? '#0070CC' : '#F0F0F0' }} />}
                </div>
              ))}
            </div>

            {mfaStep === 1 && (
              <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                <div style={{ fontSize: 13, color: '#333', marginBottom: 12 }}>请在您的手机上安装虚拟MFA应用程序</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
                  {['Google Authenticator', 'Microsoft Authenticator', '阿里云App'].map(app => (
                    <div key={app} style={{ padding: '12px 16px', border: '1px solid #E8E8E8', borderRadius: 6, fontSize: 12, color: '#666', textAlign: 'center', width: 110 }}>
                      <div style={{ width: 32, height: 32, background: '#F5F5F5', borderRadius: 8, margin: '0 auto 8px' }} />
                      {app}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mfaStep === 2 && (
              <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                <div style={{ fontSize: 13, color: '#333', marginBottom: 16 }}>使用MFA应用扫描以下二维码</div>
                <div style={{ width: 140, height: 140, background: '#F5F5F5', border: '1px solid #E8E8E8', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,16px)', gap: 2 }}>
                    {Array.from({ length: 49 }, (_, i) => (
                      <div key={i} style={{ width: 16, height: 16, background: Math.random() > 0.5 ? '#333' : 'transparent', borderRadius: 1 }} />
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>密钥：JBSWY3DPEHPK3PXP</div>
              </div>
            )}

            {mfaStep === 3 && (
              <div style={{ padding: '8px 0 20px' }}>
                <div style={{ fontSize: 13, color: '#333', marginBottom: 16 }}>输入MFA应用中显示的6位验证码</div>
                <div className="form-group">
                  <label className="form-label">第一个验证码</label>
                  <input className="form-input" placeholder="请输入6位验证码" maxLength={6} style={{ letterSpacing: 4, fontSize: 18, textAlign: 'center' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">第二个验证码</label>
                  <input className="form-input" placeholder="请等待刷新后输入" maxLength={6} style={{ letterSpacing: 4, fontSize: 18, textAlign: 'center' }} />
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-normal" onClick={() => setBindMfaOpen(false)}>取消</button>
              {mfaStep > 1 && <button className="btn-normal" onClick={() => setMfaStep(s => s - 1)}>上一步</button>}
              {mfaStep < 3
                ? <button className="btn-primary" onClick={() => setMfaStep(s => s + 1)}>下一步</button>
                : <button className="btn-primary" onClick={() => { updateSecurity({ mfaEnabled: true }); setBindMfaOpen(false) }}>完成绑定</button>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
