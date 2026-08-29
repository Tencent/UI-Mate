import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Edit2, Check, X, User, Mail, Phone, Globe, Shield, CreditCard } from 'lucide-react'
import { useApp } from '../context/AppContext'

function EditableField({ label, value, onSave, type = 'text', placeholder }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const handleSave = () => {
    if (draft.trim()) onSave(draft.trim())
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(value)
    setEditing(false)
  }

  return (
    <div className="kv-row" style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ color: '#666', fontSize: 13 }}>{label}</div>
      <div>
        {editing ? (
          <input
            autoFocus
            type={type}
            className="form-input"
            value={draft}
            placeholder={placeholder}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
            style={{ width: 280 }}
          />
        ) : (
          <span style={{ fontSize: 13, color: '#333' }}>{value || <span style={{ color: '#bbb' }}>未设置</span>}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
        {editing ? (
          <>
            <button className="btn-text" onClick={handleSave} title="保存" style={{ color: '#0070CC' }}><Check size={14} /></button>
            <button className="btn-text" onClick={handleCancel} title="取消" style={{ color: '#999' }}><X size={14} /></button>
          </>
        ) : (
          <button className="btn-text" onClick={() => { setDraft(value); setEditing(true) }} title="编辑" style={{ color: '#0070CC' }}>
            <Edit2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && <Icon size={16} style={{ color: '#FF6A00' }} />}
        {title}
      </div>
      {children}
    </div>
  )
}

export default function AccountSettings() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = p => sid ? `${p}?sid=${sid}` : p

  const [avatarInitial] = useState(state.user.displayName[0])
  const [saveSuccess, setSaveSuccess] = useState('')

  const handleSave = (field, value) => {
    updateState(prev => ({ ...prev, user: { ...prev.user, [field]: value } }))
    setSaveSuccess(`${field} 已更新`)
    setTimeout(() => setSaveSuccess(''), 2000)
  }

  const LANGUAGE_OPTIONS = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English' },
    { value: 'ja-JP', label: '日本語' }
  ]

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <span>账号设置</span>
      </div>

      <div className="page-header">
        <h1 className="page-title">账号设置</h1>
        {saveSuccess && (
          <span style={{ color: '#52C41A', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={14} /> {saveSuccess}
          </span>
        )}
      </div>

      {/* Avatar & Account Overview */}
      <SectionCard icon={User} title="账号概览">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '12px 0 20px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6A00, #ee0979)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 28, fontWeight: 700, flexShrink: 0
          }}>
            {avatarInitial}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>{state.user.displayName}</div>
            <div style={{ fontSize: 12, color: '#999' }}>账号ID: <span className="mono">{state.user.accountId}</span></div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>企业名称: {state.user.accountName}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <span style={{ background: '#E6F4FF', color: '#0070CC', padding: '2px 10px', borderRadius: 12, fontSize: 12 }}>
              {state.user.role === 'admin' ? '主账号' : '子账号'}
            </span>
            {state.user.verificationStatus === 'verified' && (
              <span style={{ background: '#F6FFED', color: '#52C41A', padding: '2px 10px', borderRadius: 12, fontSize: 12 }}>
                已实名认证
              </span>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0' }}>
          <EditableField label="显示名称" value={state.user.displayName} onSave={v => handleSave('displayName', v)} placeholder="请输入显示名称" />
          <EditableField label="企业名称" value={state.user.accountName} onSave={v => handleSave('accountName', v)} placeholder="请输入企业名称" />
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ color: '#666', fontSize: 13 }}>账号ID</div>
            <div><span className="mono" style={{ fontSize: 13 }}>{state.user.accountId}</span></div>
          </div>
        </div>
      </SectionCard>

      {/* Contact Info */}
      <SectionCard icon={Mail} title="联系信息">
        <EditableField label="邮箱地址" value={state.user.email} onSave={v => handleSave('email', v)} type="email" placeholder="请输入邮箱" />
        <EditableField label="手机号码" value={state.user.phone} onSave={v => handleSave('phone', v)} placeholder="请输入手机号" />
      </SectionCard>

      {/* Regional & Language */}
      <SectionCard icon={Globe} title="地区与语言">
        <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' }}>
          <div style={{ color: '#666', fontSize: 13 }}>默认地域</div>
          <div>
            <select
              className="form-select"
              value={state.user.region}
              onChange={e => handleSave('region', e.target.value)}
              style={{ width: 220 }}
            >
              {state.regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ padding: '12px 0', display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' }}>
          <div style={{ color: '#666', fontSize: 13 }}>界面语言</div>
          <div>
            <select
              className="form-select"
              value={state.user.language}
              onChange={e => handleSave('language', e.target.value)}
              style={{ width: 220 }}
            >
              {LANGUAGE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Account Status */}
      <SectionCard icon={CreditCard} title="账号状态">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: '8px 0' }}>
          {[
            { label: '账户余额', value: `¥ ${state.user.balance?.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) || '0.00'}`, color: '#333' },
            { label: '信用等级', value: state.user.creditRating || '--', color: '#52C41A' },
            { label: '实名认证', value: state.user.verificationStatus === 'verified' ? '已认证' : '未认证', color: state.user.verificationStatus === 'verified' ? '#52C41A' : '#FF4D4F' },
          ].map(item => (
            <div key={item.label} style={{ background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 4, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
