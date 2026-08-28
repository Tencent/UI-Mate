import React, { useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

const PROTOCOLS = ['tcp', 'udp', 'icmp', 'all']

export default function SecurityGroupDetail() {
  const { id } = useParams()
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p

  const sg = state.securityGroups.find(s => s.id === id)
  const [direction, setDirection] = useState('ingress')
  const [showAdd, setShowAdd] = useState(false)
  const [deleteRule, setDeleteRule] = useState(null)
  const [form, setForm] = useState({ protocol: 'tcp', portRange: '80/80', sourceCidrIp: '0.0.0.0/0', priority: 1, policy: 'Accept', description: '' })

  if (!sg) {
    return <div className="card"><div className="empty-state">安全组不存在。</div></div>
  }

  const rules = sg.rules.filter(r => r.direction === direction)

  const addRule = () => {
    const newRule = { id: `rule-${Date.now()}`, direction, ...form }
    updateState(prev => ({
      ...prev,
      securityGroups: prev.securityGroups.map(s => s.id === id ? { ...s, rules: [...s.rules, newRule] } : s)
    }))
    setShowAdd(false)
    setForm({ protocol: 'tcp', portRange: '80/80', sourceCidrIp: '0.0.0.0/0', priority: 1, policy: 'Accept', description: '' })
  }

  const deleteRuleById = (ruleId) => {
    updateState(prev => ({
      ...prev,
      securityGroups: prev.securityGroups.map(s => s.id === id ? { ...s, rules: s.rules.filter(r => r.id !== ruleId) } : s)
    }))
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link><span className="sep">&gt;</span>
        <Link to={buildPath('/ecs/security-groups')} className="link">安全组</Link><span className="sep">&gt;</span>
        <span>{sg.name}</span>
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{sg.name}</h1>
          <div style={{ fontSize: 12, color: '#999' }}><span className="mono">{sg.id}</span></div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {[['ingress', '入方向'], ['egress', '出方向']].map(([d, label]) => (
            <button key={d} className={direction === d ? 'btn-blue' : 'btn-normal'} style={{ height: 32 }} onClick={() => setDirection(d)}>{label}</button>
          ))}
          <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowAdd(true)}>+ 添加规则</button>
        </div>
        <table className="data-table">
          <thead><tr><th>优先级</th><th>协议</th><th>端口范围</th><th>{direction === 'ingress' ? '授权对象' : '目的地址'}</th><th>策略</th><th>描述</th><th>操作</th></tr></thead>
          <tbody>
            {rules.length === 0 && <tr><td colSpan={7} className="empty-state">暂无{direction === 'ingress' ? '入方向' : '出方向'}规则</td></tr>}
            {rules.map(rule => (
              <tr key={rule.id || rule.description}>
                <td>{rule.priority}</td>
                <td style={{ textTransform: 'uppercase' }}>{rule.protocol}</td>
                <td><span className="mono">{rule.portRange}</span></td>
                <td><span className="mono">{rule.sourceCidrIp}</span></td>
                <td><span style={{ color: rule.policy === 'Accept' ? '#1DC11D' : '#FF3333', fontWeight: 500 }}>{rule.policy === 'Accept' ? '允许' : '拒绝'}</span></td>
                <td style={{ fontSize: 12, color: '#666' }}>{rule.description}</td>
                <td><button className="btn-text" style={{ color: '#FF3333' }} onClick={() => setDeleteRule(rule)}>删除</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">添加{direction === 'ingress' ? '入方向' : '出方向'}规则</div>
            <div className="form-group"><label className="form-label">协议类型</label>
              <select className="form-select" value={form.protocol} onChange={e => setForm(f => ({ ...f, protocol: e.target.value }))}>
                {PROTOCOLS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">端口范围</label><input className="form-input" value={form.portRange} onChange={e => setForm(f => ({ ...f, portRange: e.target.value }))} placeholder="例如：80/80 或 1/65535" /></div>
            <div className="form-group"><label className="form-label">{direction === 'ingress' ? '授权对象' : '目的地址'}</label><input className="form-input" value={form.sourceCidrIp} onChange={e => setForm(f => ({ ...f, sourceCidrIp: e.target.value }))} placeholder="例如：0.0.0.0/0" /></div>
            <div className="form-group"><label className="form-label">优先级 (1-100)</label><input type="number" className="form-input" min={1} max={100} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 1 }))} /></div>
            <div className="form-group"><label className="form-label">策略</label>
              <div style={{ display: 'flex', gap: 16 }}>
                {[['Accept', '允许'], ['Drop', '拒绝']].map(([p, label]) => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="policy" value={p} checked={form.policy === p} onChange={() => setForm(f => ({ ...f, policy: p }))} />{label}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">描述</label><input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="modal-actions"><button className="btn-normal" onClick={() => setShowAdd(false)}>取消</button><button className="btn-primary" onClick={addRule}>添加</button></div>
          </div>
        </div>
      )}

      {deleteRule && (
        <ConfirmDialog title="删除规则" message={`确定要删除此规则吗？（${deleteRule.protocol.toUpperCase()} ${deleteRule.portRange} 来源 ${deleteRule.sourceCidrIp}）`} danger confirmText="删除" cancelText="取消"
          onConfirm={() => { deleteRuleById(deleteRule.id); setDeleteRule(null) }}
          onCancel={() => setDeleteRule(null)}
        />
      )}
    </div>
  )
}
