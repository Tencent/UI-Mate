import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

export default function SecurityGroupList() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', vpcId: '', type: '普通' })

  const groups = state.securityGroups.filter(sg => sg.regionId === state.currentRegion)

  const createGroup = () => {
    if (!form.name || !form.vpcId) return
    const newSg = { id: `sg-bp${Math.random().toString(16).slice(2, 18)}`, name: form.name, description: form.description, regionId: state.currentRegion, vpcId: form.vpcId, type: form.type, instanceCount: 0, creationTime: new Date().toISOString(), rules: [] }
    updateState(prev => ({ ...prev, securityGroups: [...prev.securityGroups, newSg] }))
    setShowCreate(false)
    setForm({ name: '', description: '', vpcId: '', type: '普通' })
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link><span className="sep">&gt;</span>
        <Link to={buildPath('/ecs/instances')} className="link">云服务器 ECS</Link><span className="sep">&gt;</span><span>安全组</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">安全组</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ 创建安全组</button>
      </div>
      <table className="data-table">
        <thead><tr><th>名称 / ID</th><th>VPC</th><th>类型</th><th>实例数</th><th>规则数</th><th>描述</th><th>创建时间</th></tr></thead>
        <tbody>
          {groups.length === 0 && <tr><td colSpan={7} className="empty-state">暂无安全组</td></tr>}
          {groups.map(sg => (
            <tr key={sg.id}>
              <td><Link to={buildPath(`/ecs/security-groups/${sg.id}`)} className="link">{sg.name}</Link><br /><span className="mono">{sg.id}</span></td>
              <td><Link to={buildPath('/vpc/list')} className="link mono">{sg.vpcId}</Link></td>
              <td>{sg.type}</td>
              <td>{sg.instanceCount}</td>
              <td>{sg.rules.length}</td>
              <td style={{ fontSize: 12, color: '#666' }}>{sg.description}</td>
              <td style={{ fontSize: 12, color: '#666' }}>{sg.creationTime?.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">创建安全组</div>
            <div className="form-group"><label className="form-label required">名称</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例如：my-sg-prod" /></div>
            <div className="form-group"><label className="form-label">描述</label><textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label required">VPC</label>
              <select className="form-select" value={form.vpcId} onChange={e => setForm(f => ({ ...f, vpcId: e.target.value }))}>
                <option value="">请选择VPC...</option>
                {state.vpcs.filter(v => v.regionId === state.currentRegion).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">类型</label>
              <div style={{ display: 'flex', gap: 16 }}>
                {['普通', '企业级'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => setForm(f => ({ ...f, type: t }))} />{t}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-actions"><button className="btn-normal" onClick={() => setShowCreate(false)}>取消</button><button className="btn-primary" disabled={!form.name || !form.vpcId} onClick={createGroup}>创建</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
