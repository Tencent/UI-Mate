import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function StatusTag({ status }) {
  const s = status.toLowerCase().replace('_', '-')
  const label = status === 'In_use' ? '使用中' : status === 'Available' ? '可用' : status
  return <span className={`status-tag ${s}`}>{label}</span>
}

export default function ECSDisks() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'cloud_essd', size: 100, zone: 'cn-hangzhou-h' })

  const disks = state.disks.filter(d => d.regionId === state.currentRegion)

  const createDisk = () => {
    if (!form.name) return
    const newDisk = {
      id: `d-bp${Date.now().toString(36)}`,
      name: form.name,
      status: 'Available',
      regionId: state.currentRegion,
      zoneId: form.zone,
      category: form.category,
      performanceLevel: 'PL1',
      size: form.size,
      instanceId: '',
      device: '',
      diskType: 'data',
      billingMethod: '按量付费',
      encrypted: false,
      creationTime: new Date().toISOString(),
      tags: []
    }
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'ECS', eventName: '创建云盘', resourceType: 'Disk', resourceId: newDisk.id, resourceName: form.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateState(prev => ({ ...prev, disks: [...prev.disks, newDisk], operationLog: [logEntry, ...prev.operationLog] }))
    setShowCreate(false)
    setForm({ name: '', category: 'cloud_essd', size: 100, zone: 'cn-hangzhou-h' })
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <Link to={buildPath('/ecs/instances')} className="link">云服务器 ECS</Link>
        <span className="sep">&gt;</span>
        <span>云盘</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">云盘列表</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ 创建云盘</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>云盘ID</th><th>名称</th><th>状态</th><th>类型</th><th>容量(GiB)</th>
            <th>挂载实例</th><th>设备名</th><th>磁盘类型</th>
          </tr>
        </thead>
        <tbody>
          {disks.length === 0 && <tr><td colSpan={8} className="empty-state">当前地域无云盘</td></tr>}
          {disks.map(d => (
            <tr key={d.id}>
              <td><span className="mono">{d.id}</span></td>
              <td>{d.name}</td>
              <td><StatusTag status={d.status} /></td>
              <td>{d.category}</td>
              <td>{d.size}</td>
              <td>{d.instanceId ? <Link to={buildPath(`/ecs/instances/${d.instanceId}`)} className="link">{d.instanceId}</Link> : '--'}</td>
              <td><span className="mono">{d.device || '--'}</span></td>
              <td>{d.diskType === 'system' ? '系统盘' : '数据盘'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">创建云盘</div>
            <div className="form-group">
              <label className="form-label required">云盘名称</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例如：data-disk-01" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">云盘类型</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="cloud_essd">ESSD云盘</option>
                <option value="cloud_ssd">SSD云盘</option>
                <option value="cloud_efficiency">高效云盘</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">容量 (GiB)</label>
              <input type="number" className="form-input" min={20} max={32768} value={form.size} onChange={e => setForm(f => ({ ...f, size: parseInt(e.target.value) || 100 }))} />
            </div>
            <div className="form-group">
              <label className="form-label">可用区</label>
              <select className="form-select" value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}>
                <option value="cn-hangzhou-h">cn-hangzhou-h</option>
                <option value="cn-hangzhou-g">cn-hangzhou-g</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-normal" onClick={() => setShowCreate(false)}>取消</button>
              <button className="btn-primary" disabled={!form.name} onClick={createDisk}>创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
