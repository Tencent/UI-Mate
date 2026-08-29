import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function StatusTag({ status }) {
  return <span className={`status-tag ${status.toLowerCase()}`}><span className={`status-dot ${status.toLowerCase()}`} />{status === 'active' ? '运行中' : status}</span>
}

export default function SLBInstanceList() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', addressType: 'internet' })

  const instances = state.slbInstances.filter(i => i.regionId === state.currentRegion)

  const createSLB = () => {
    if (!form.name) return
    const newId = `lb-bp${Date.now().toString(36)}`
    const newInst = {
      id: newId, name: form.name, status: 'active', regionId: state.currentRegion,
      addressType: form.addressType,
      address: form.addressType === 'internet' ? `120.${Math.floor(Math.random()*99)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}` : `172.16.0.${Math.floor(Math.random()*200+20)}`,
      networkType: 'vpc', vpcId: 'vpc-bp1prod123456789', bandwidth: 100,
      billingMethod: '按流量计费', creationTime: new Date().toISOString(),
      listenerCount: 0, backendServerCount: 0, listeners: [], backendServers: []
    }
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'SLB', eventName: '创建负载均衡', resourceType: 'LoadBalancer', resourceId: newId, resourceName: form.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateState(prev => ({ ...prev, slbInstances: [...prev.slbInstances, newInst], operationLog: [logEntry, ...prev.operationLog] }))
    setShowCreate(false)
    setForm({ name: '', addressType: 'internet' })
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <span>负载均衡 SLB</span>
        <span className="sep">&gt;</span>
        <span>实例管理</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">负载均衡实例</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ 创建负载均衡</button>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>名称 / ID</th><th>状态</th><th>网络类型</th><th>服务地址</th><th>带宽</th><th>监听</th><th>计费方式</th><th>创建时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          {instances.length === 0 && <tr><td colSpan={9} className="empty-state">当前地域无负载均衡实例</td></tr>}
          {instances.map(inst => (
            <tr key={inst.id}>
              <td>
                <Link to={buildPath(`/slb/instances/${inst.id}`)} className="link" style={{ fontWeight: 500 }}>{inst.name}</Link>
                <br /><span className="mono">{inst.id}</span>
              </td>
              <td><StatusTag status={inst.status} /></td>
              <td>{inst.addressType === 'internet' ? '公网' : '内网'}</td>
              <td><span className="mono">{inst.address}</span></td>
              <td>{inst.bandwidth === -1 ? '按流量' : `${inst.bandwidth} Mbps`}</td>
              <td>
                <div style={{ fontSize: 12 }}>
                  {inst.listeners.map((l, i) => <div key={i}>{l.protocol} :{l.frontendPort} → :{l.backendPort}</div>)}
                  {inst.listeners.length === 0 && <span style={{ color: '#999' }}>未配置</span>}
                </div>
              </td>
              <td style={{ fontSize: 12 }}>{inst.billingMethod}</td>
              <td style={{ fontSize: 12, color: '#666' }}>{inst.creationTime?.split('T')[0]}</td>
              <td><Link to={buildPath(`/slb/instances/${inst.id}`)} className="btn-text">管理</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">创建负载均衡</div>
            <div className="form-group">
              <label className="form-label required">实例名称</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例如：my-slb-01" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">网络类型</label>
              <div style={{ display: 'flex', gap: 16 }}>
                {[['internet', '公网'], ['intranet', '内网']].map(([v, label]) => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="addressType" value={v} checked={form.addressType === v} onChange={() => setForm(f => ({ ...f, addressType: v }))} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-normal" onClick={() => setShowCreate(false)}>取消</button>
              <button className="btn-primary" disabled={!form.name} onClick={createSLB}>创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
