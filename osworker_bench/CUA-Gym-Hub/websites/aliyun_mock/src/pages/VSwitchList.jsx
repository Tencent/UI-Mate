import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function VSwitchList() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', vpcId: '', zoneId: 'cn-hangzhou-h', cidrBlock: '', description: '' })

  const vswitches = state.vswitches.filter(v => {
    const vpc = state.vpcs.find(p => p.id === v.vpcId)
    return vpc?.regionId === state.currentRegion
  })

  const createVswitch = () => {
    if (!form.name || !form.vpcId || !form.cidrBlock) return
    const id = `vsw-bp${Math.random().toString(16).slice(2, 18)}`
    const newVsw = { id, name: form.name, status: 'Available', vpcId: form.vpcId, zoneId: form.zoneId, cidrBlock: form.cidrBlock, availableIpCount: 250, description: form.description, creationTime: new Date().toISOString(), isDefault: false }
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'VPC', eventName: '创建交换机', resourceType: 'VSwitch', resourceId: id, resourceName: form.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateState(prev => ({
      ...prev,
      vswitches: [...prev.vswitches, newVsw],
      vpcs: prev.vpcs.map(v => v.id === form.vpcId ? { ...v, vswitchCount: v.vswitchCount + 1 } : v),
      operationLog: [logEntry, ...prev.operationLog]
    }))
    setShowCreate(false)
    setForm({ name: '', vpcId: '', zoneId: 'cn-hangzhou-h', cidrBlock: '', description: '' })
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link><span className="sep">&gt;</span>
        <span>专有网络 VPC</span><span className="sep">&gt;</span><span>交换机</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">交换机</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ 创建交换机</button>
      </div>
      <table className="data-table">
        <thead><tr><th>名称 / ID</th><th>状态</th><th>所属VPC</th><th>可用区</th><th>IPv4网段</th><th>可用IP数</th><th>描述</th><th>创建时间</th></tr></thead>
        <tbody>
          {vswitches.length === 0 && <tr><td colSpan={8} className="empty-state">暂无交换机</td></tr>}
          {vswitches.map(v => (
            <tr key={v.id}>
              <td><div style={{ fontWeight: 500 }}>{v.name}</div><span className="mono">{v.id}</span></td>
              <td><span className="status-tag available"><span className="status-dot available" />可用</span></td>
              <td><Link to={buildPath('/vpc/list')} className="link mono">{v.vpcId}</Link></td>
              <td style={{ fontSize: 12 }}>{v.zoneId}</td>
              <td><span className="mono">{v.cidrBlock}</span></td>
              <td>{v.availableIpCount}</td>
              <td style={{ fontSize: 12, color: '#666' }}>{v.description}</td>
              <td style={{ fontSize: 12, color: '#666' }}>{v.creationTime?.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">创建交换机</div>
            <div className="form-group"><label className="form-label required">所属VPC</label>
              <select className="form-select" value={form.vpcId} onChange={e => setForm(f => ({ ...f, vpcId: e.target.value }))}>
                <option value="">请选择VPC...</option>
                {state.vpcs.filter(v => v.regionId === state.currentRegion).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">可用区</label><input className="form-input" value={form.zoneId} onChange={e => setForm(f => ({ ...f, zoneId: e.target.value }))} placeholder="例如：cn-hangzhou-h" /></div>
            <div className="form-group"><label className="form-label required">名称</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例如：my-vswitch" /></div>
            <div className="form-group"><label className="form-label required">IPv4网段</label><input className="form-input" value={form.cidrBlock} onChange={e => setForm(f => ({ ...f, cidrBlock: e.target.value }))} placeholder="例如：172.16.5.0/24" /></div>
            <div className="form-group"><label className="form-label">描述</label><textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="modal-actions"><button className="btn-normal" onClick={() => setShowCreate(false)}>取消</button><button className="btn-primary" disabled={!form.name || !form.vpcId || !form.cidrBlock} onClick={createVswitch}>创建</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
