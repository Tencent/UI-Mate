import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function VPCList() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', cidrBlock: '172.16.0.0/12', description: '' })

  const vpcs = state.vpcs.filter(v => v.regionId === state.currentRegion)

  const createVpc = () => {
    if (!form.name) return
    const id = `vpc-bp${Math.random().toString(16).slice(2, 18)}`
    const newVpc = { id, name: form.name, status: 'Available', regionId: state.currentRegion, cidrBlock: form.cidrBlock, description: form.description, vswitchCount: 0, routeTableCount: 1, creationTime: new Date().toISOString(), isDefault: false, tags: [] }
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'VPC', eventName: '创建VPC', resourceType: 'VPC', resourceId: id, resourceName: form.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateState(prev => ({ ...prev, vpcs: [...prev.vpcs, newVpc], operationLog: [logEntry, ...prev.operationLog] }))
    setShowCreate(false)
    setForm({ name: '', cidrBlock: '172.16.0.0/12', description: '' })
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link><span className="sep">&gt;</span>
        <span>专有网络 VPC</span><span className="sep">&gt;</span><span>专有网络</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">专有网络</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ 创建专有网络</button>
      </div>
      <table className="data-table">
        <thead><tr><th>名称 / ID</th><th>状态</th><th>IPv4网段</th><th>交换机数</th><th>路由表数</th><th>描述</th><th>创建时间</th></tr></thead>
        <tbody>
          {vpcs.length === 0 && <tr><td colSpan={7} className="empty-state">当前地域无专有网络</td></tr>}
          {vpcs.map(v => (
            <tr key={v.id}>
              <td><div className="link">{v.name}</div><span className="mono">{v.id}</span></td>
              <td><span className="status-tag available">可用</span></td>
              <td><span className="mono">{v.cidrBlock}</span></td>
              <td>{v.vswitchCount}</td>
              <td>{v.routeTableCount}</td>
              <td style={{ fontSize: 12, color: '#666' }}>{v.description}</td>
              <td style={{ fontSize: 12, color: '#666' }}>{v.creationTime?.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">创建专有网络</div>
            <div className="form-group"><label className="form-label required">名称</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例如：my-vpc" autoFocus /></div>
            <div className="form-group"><label className="form-label">IPv4网段</label>
              <select className="form-select" value={form.cidrBlock} onChange={e => setForm(f => ({ ...f, cidrBlock: e.target.value }))}>
                {['172.16.0.0/12', '10.0.0.0/8', '192.168.0.0/16'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">描述</label><textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="modal-actions"><button className="btn-normal" onClick={() => setShowCreate(false)}>取消</button><button className="btn-primary" disabled={!form.name} onClick={createVpc}>创建</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
