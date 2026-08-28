import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const STATUS_MAP = { Running: '运行中', Stopped: '已停止', Starting: '启动中' }

function StatusTag({ status }) {
  const s = status.toLowerCase()
  return <span className={`status-tag ${s}`}><span className={`status-dot ${s}`} />{STATUS_MAP[status] || status}</span>
}

export default function RDSInstanceList() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', engine: 'MySQL', engineVersion: '8.0', instanceType: 'rds.mysql.s3.large' })

  const instances = state.rdsInstances.filter(i => i.regionId === state.currentRegion)

  const createInstance = () => {
    if (!form.name) return
    const newId = form.engine === 'MySQL' ? `rm-bp${Date.now().toString(36)}` : `pgm-bp${Date.now().toString(36)}`
    const specs = { vCPU: 2, memory: 4, storageSize: 100, maxConnections: 2000, maxIOPS: 5000 }
    const newInst = {
      id: newId, name: form.name, status: 'Running', regionId: state.currentRegion,
      zoneId: 'cn-hangzhou-h', engine: form.engine, engineVersion: form.engineVersion,
      instanceType: form.instanceType, ...specs, storageType: 'cloud_essd',
      connectionString: `${newId}.${form.engine.toLowerCase()}.rds.aliyuncs.com`,
      port: form.engine === 'MySQL' ? 3306 : 5432,
      vpcId: 'vpc-bp1prod123456789', vswitchId: 'vsw-bp1app123456789',
      billingMethod: '按量付费', creationTime: new Date().toISOString(), expiredTime: null,
      category: '高可用版', tags: [], databases: [], accounts: [], backups: []
    }
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'RDS', eventName: '创建实例', resourceType: 'DBInstance', resourceId: newId, resourceName: form.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateState(prev => ({ ...prev, rdsInstances: [...prev.rdsInstances, newInst], operationLog: [logEntry, ...prev.operationLog] }))
    setShowCreate(false)
    setForm({ name: '', engine: 'MySQL', engineVersion: '8.0', instanceType: 'rds.mysql.s3.large' })
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <span>云数据库 RDS</span>
        <span className="sep">&gt;</span>
        <span>实例列表</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">实例列表</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ 创建实例</button>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>实例名称 / ID</th><th>状态</th><th>数据库类型</th><th>规格</th><th>存储(GiB)</th><th>地域 / 可用区</th><th>VPC</th><th>付费方式</th><th>操作</th></tr>
        </thead>
        <tbody>
          {instances.length === 0 && <tr><td colSpan={9} className="empty-state">当前地域无RDS实例</td></tr>}
          {instances.map(inst => (
            <tr key={inst.id}>
              <td>
                <Link to={buildPath(`/rds/instances/${inst.id}`)} className="link" style={{ fontWeight: 500 }}>{inst.name}</Link>
                <br /><span className="mono">{inst.id}</span>
              </td>
              <td><StatusTag status={inst.status} /></td>
              <td>
                <div style={{ fontSize: 13 }}>{inst.engine}</div>
                <div style={{ fontSize: 11, color: '#999' }}>v{inst.engineVersion}</div>
              </td>
              <td><span className="mono" style={{ fontSize: 12 }}>{inst.instanceType}</span></td>
              <td>{inst.storageSize}</td>
              <td style={{ fontSize: 12 }}>
                <div>{state.regions.find(r => r.id === inst.regionId)?.name}</div>
                <div style={{ color: '#999' }}>{inst.zoneId}</div>
              </td>
              <td><span className="mono" style={{ fontSize: 12 }}>{inst.vpcId}</span></td>
              <td style={{ fontSize: 12 }}>{inst.billingMethod}</td>
              <td>
                <Link to={buildPath(`/rds/instances/${inst.id}`)} className="btn-text">管理</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">创建RDS实例</div>
            <div className="form-group">
              <label className="form-label required">实例名称</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例如：my-mysql-01" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">数据库类型</label>
              <select className="form-select" value={form.engine} onChange={e => setForm(f => ({ ...f, engine: e.target.value, engineVersion: e.target.value === 'MySQL' ? '8.0' : '15' }))}>
                <option value="MySQL">MySQL</option>
                <option value="PostgreSQL">PostgreSQL</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">版本</label>
              <select className="form-select" value={form.engineVersion} onChange={e => setForm(f => ({ ...f, engineVersion: e.target.value }))}>
                {form.engine === 'MySQL' ? (
                  <>
                    <option value="8.0">8.0</option>
                    <option value="5.7">5.7</option>
                  </>
                ) : (
                  <>
                    <option value="15">15</option>
                    <option value="14">14</option>
                  </>
                )}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-normal" onClick={() => setShowCreate(false)}>取消</button>
              <button className="btn-primary" disabled={!form.name} onClick={createInstance}>创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
