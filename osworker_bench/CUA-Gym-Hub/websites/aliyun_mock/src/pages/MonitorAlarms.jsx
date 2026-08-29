import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const STATUS_LABEL = { OK: '正常', ALARM: '报警', INSUFFICIENT_DATA: '数据不足' }

function StatusTag({ status }) {
  const s = status === 'OK' ? 'ok' : status === 'ALARM' ? 'alarm' : 'insufficient'
  return <span className={`status-tag ${s}`}><span className={`status-dot ${s}`} />{STATUS_LABEL[status] || status}</span>
}

export default function MonitorAlarms() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', product: 'ECS', metricName: 'CPUUtilization', threshold: 80, instanceId: '' })

  const toggleAlarm = (id) => {
    updateState(prev => ({
      ...prev,
      alarms: prev.alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)
    }))
  }

  const createAlarm = () => {
    if (!form.name) return
    const newAlarm = {
      id: `alarm-${Date.now()}`, name: form.name, status: 'INSUFFICIENT_DATA',
      product: form.product, metricName: form.metricName, threshold: form.threshold,
      comparisonOperator: '>=', statistics: 'Average', period: 300, evaluationCount: 3,
      instanceId: form.instanceId, contactGroups: ['运维团队'], enabled: true,
      creationTime: new Date().toISOString()
    }
    updateState(prev => ({ ...prev, alarms: [...prev.alarms, newAlarm] }))
    setShowCreate(false)
    setForm({ name: '', product: 'ECS', metricName: 'CPUUtilization', threshold: 80, instanceId: '' })
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link><span className="sep">&gt;</span>
        <span>云监控</span><span className="sep">&gt;</span><span>报警规则</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">报警规则</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ 创建报警规则</button>
      </div>
      <table className="data-table">
        <thead><tr><th>规则名称</th><th>状态</th><th>产品</th><th>监控指标</th><th>阈值</th><th>关联资源</th><th>报警联系人</th><th>启用</th><th>创建时间</th></tr></thead>
        <tbody>
          {state.alarms.map(alarm => (
            <tr key={alarm.id}>
              <td style={{ fontWeight: 500 }}>{alarm.name}</td>
              <td><StatusTag status={alarm.status} /></td>
              <td>{alarm.product}</td>
              <td><span className="mono" style={{ fontSize: 12 }}>{alarm.metricName}</span></td>
              <td><span className="mono">{alarm.comparisonOperator} {alarm.threshold}</span></td>
              <td><span className="mono" style={{ fontSize: 12 }}>{alarm.instanceId}</span></td>
              <td style={{ fontSize: 12 }}>{alarm.contactGroups.join(', ')}</td>
              <td>
                <label className="toggle-switch">
                  <input type="checkbox" checked={alarm.enabled} onChange={() => toggleAlarm(alarm.id)} />
                  <span className="toggle-slider" />
                </label>
              </td>
              <td style={{ fontSize: 12, color: '#666' }}>{alarm.creationTime?.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">创建报警规则</div>
            <div className="form-group"><label className="form-label required">规则名称</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例如：CPU高告警" autoFocus /></div>
            <div className="form-group"><label className="form-label">产品</label>
              <select className="form-select" value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))}>
                <option value="ECS">ECS</option><option value="RDS">RDS</option><option value="SLB">SLB</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">监控指标</label>
              <select className="form-select" value={form.metricName} onChange={e => setForm(f => ({ ...f, metricName: e.target.value }))}>
                <option value="CPUUtilization">CPU使用率</option>
                <option value="MemoryUtilization">内存使用率</option>
                <option value="DiskUtilization">磁盘使用率</option>
                <option value="ConnectionCount">连接数</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">阈值</label><input type="number" className="form-input" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: parseInt(e.target.value) || 0 }))} /></div>
            <div className="form-group"><label className="form-label">关联资源ID</label><input className="form-input" value={form.instanceId} onChange={e => setForm(f => ({ ...f, instanceId: e.target.value }))} placeholder="例如：i-bp1abc2def3ghi4jk5" /></div>
            <div className="modal-actions"><button className="btn-normal" onClick={() => setShowCreate(false)}>取消</button><button className="btn-primary" disabled={!form.name} onClick={createAlarm}>创建</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
