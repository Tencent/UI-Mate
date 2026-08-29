import React, { useState } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Copy, Edit2, Check, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUS_MAP = { Running: '运行中', Stopped: '已停止', Starting: '启动中', Stopping: '停止中', Expired: '已过期' }

function StatusTag({ status }) {
  const s = status.toLowerCase()
  return <span className={`status-tag ${s}`}><span className={`status-dot ${s}`} />{STATUS_MAP[status] || status}</span>
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}

function MockChart({ color = '#FF6A00' }) {
  const points = Array.from({ length: 20 }, (_, i) => ({
    x: (i / 19) * 100,
    y: 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10
  }))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: '100%', height: 60 }}>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
      <path d={pathD + ` L ${points[points.length-1].x} 60 L 0 60 Z`} fill={color} fillOpacity="0.1" />
    </svg>
  )
}

export default function ECSInstanceDetail() {
  const { id } = useParams()
  const { state, updateState } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p

  const inst = state.ecsInstances.find(i => i.id === id)
  const [tab, setTab] = useState('details')
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [timeRange, setTimeRange] = useState('1小时')
  const [addSgOpen, setAddSgOpen] = useState(false)
  const [selectedSg, setSelectedSg] = useState('')

  if (!inst) {
    return (
      <div>
        <div className="breadcrumb"><Link to={buildPath('/ecs/instances')} className="link">实例列表</Link><span className="sep">&gt;</span><span>未找到</span></div>
        <div className="card"><div className="empty-state">实例不存在或已被释放。</div></div>
      </div>
    )
  }

  const updateInstance = (changes, logEntry) => {
    updateState(prev => ({
      ...prev,
      ecsInstances: prev.ecsInstances.map(i => i.id === id ? { ...i, ...changes } : i),
      operationLog: logEntry ? [logEntry, ...prev.operationLog] : prev.operationLog
    }))
  }

  const startInstance = () => {
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'ECS', eventName: '启动实例', resourceType: 'Instance', resourceId: id, resourceName: inst.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateInstance({ status: 'Starting' }, logEntry)
    setTimeout(() => updateInstance({ status: 'Running' }), 1500)
  }

  const stopInstance = () => {
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'ECS', eventName: '停止实例', resourceType: 'Instance', resourceId: id, resourceName: inst.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateInstance({ status: 'Stopping' }, logEntry)
    setTimeout(() => updateInstance({ status: 'Stopped' }), 1500)
  }

  const restartInstance = () => {
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'ECS', eventName: '重启实例', resourceType: 'Instance', resourceId: id, resourceName: inst.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateInstance({ status: 'Stopping' }, logEntry)
    setTimeout(() => updateInstance({ status: 'Starting' }), 1000)
    setTimeout(() => updateInstance({ status: 'Running' }), 2000)
  }

  const releaseInstance = () => {
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'ECS', eventName: '释放实例', resourceType: 'Instance', resourceId: id, resourceName: inst.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateState(prev => ({
      ...prev,
      ecsInstances: prev.ecsInstances.filter(i => i.id !== id),
      disks: prev.disks.map(d => d.instanceId === id && d.diskType === 'data' ? { ...d, instanceId: '', device: '', status: 'Available' } : d).filter(d => !(d.instanceId === id && d.diskType === 'system')),
      operationLog: [logEntry, ...prev.operationLog]
    }))
    navigate(buildPath('/ecs/instances'))
  }

  const saveName = () => {
    if (editName.trim()) {
      const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'ECS', eventName: '修改实例属性', resourceType: 'Instance', resourceId: id, resourceName: editName.trim(), userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
      updateInstance({ name: editName.trim() }, logEntry)
    }
    setEditing(false)
  }

  const sgs = state.securityGroups.filter(sg => inst.securityGroupIds.includes(sg.id))
  const disks = state.disks.filter(d => d.instanceId === id)
  const availableSgs = state.securityGroups.filter(sg => !inst.securityGroupIds.includes(sg.id) && sg.regionId === inst.regionId)

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <Link to={buildPath('/ecs/instances')} className="link">云服务器 ECS</Link>
        <span className="sep">&gt;</span>
        <Link to={buildPath('/ecs/instances')} className="link">实例</Link>
        <span className="sep">&gt;</span>
        <span>{inst.name}</span>
      </div>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {editing ? (
            <div className="inline-edit-wrap">
              <input className="inline-edit-input" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false) }} autoFocus />
              <button className="btn-text" onClick={saveName}><Check size={16} /></button>
              <button className="btn-text" onClick={() => setEditing(false)}><X size={16} /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="page-title">{inst.name}</h1>
              <button className="copy-btn" onClick={() => { setEditName(inst.name); setEditing(true) }} title="重命名"><Edit2 size={14} /></button>
            </div>
          )}
          <StatusTag status={inst.status} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {inst.status === 'Stopped' && <button className="btn-normal" onClick={startInstance}>启动</button>}
          {inst.status === 'Running' && <button className="btn-normal" onClick={() => setConfirm({ type: 'stop' })}>停止</button>}
          {inst.status === 'Running' && <button className="btn-normal" onClick={() => setConfirm({ type: 'restart' })}>重启</button>}
          <button className="btn-danger" onClick={() => setConfirm({ type: 'release' })}>释放</button>
        </div>
      </div>

      <div className="tab-nav">
        {[['details','基本信息'], ['monitoring','监控'], ['security','安全组'], ['disks','云盘']].map(([k,v]) => (
          <div key={k} className={`tab-item${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{v}</div>
        ))}
      </div>

      {tab === 'details' && (
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[
              ['实例名称', inst.name],
              ['VPC ID', <Link to={buildPath('/vpc/list')} className="link">{inst.vpcId}</Link>],
              ['实例ID', <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="mono">{inst.id}</span><button className="copy-btn" onClick={() => copyToClipboard(inst.id)}><Copy size={12} /></button></span>],
              ['交换机ID', <span className="mono">{inst.vswitchId}</span>],
              ['状态', <StatusTag status={inst.status} />],
              ['安全组', <div>{sgs.map(sg => <div key={sg.id}><Link to={buildPath(`/ecs/security-groups/${sg.id}`)} className="link">{sg.name}</Link></div>)}</div>],
              ['地域', state.regions.find(r => r.id === inst.regionId)?.name || inst.regionId],
              ['私网IP', inst.privateIpAddress],
              ['可用区', inst.zoneId],
              ['公网IP', inst.publicIpAddress || '--'],
              ['实例规格', inst.instanceType],
              ['密钥对', inst.keyPairName || '--'],
              ['vCPU / 内存', `${inst.vCPU} vCPU / ${inst.memory} GiB`],
              ['付费方式', inst.billingMethod],
              ['操作系统', inst.osName],
              ['自动续费', inst.renewalStatus || '--'],
              ['创建时间', inst.creationTime?.split('T')[0]],
              ['到期时间', inst.expiredTime ? inst.expiredTime.split('T')[0] : '--'],
            ].map(([label, value], i) => (
              <React.Fragment key={i}>
                <div className="kv-label">{label}</div>
                <div className="kv-value">{value}</div>
              </React.Fragment>
            ))}
          </div>
          {inst.tags.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E8E8E8' }}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>标签</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {inst.tags.map((tag, i) => (
                  <span key={i} className="tag-pill">{tag.key}: {tag.value}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'monitoring' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['1小时', '6小时', '1天', '7天'].map(tr => (
              <button key={tr} className={timeRange === tr ? 'btn-blue' : 'btn-normal'} style={{ height: 28, fontSize: 12 }} onClick={() => setTimeRange(tr)}>{tr}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'CPU使用率 (%)', value: '23.4%', color: '#FF6A00' },
              { title: '内存使用率 (%)', value: '67.8%', color: '#52C41A' },
              { title: '网络流入 (Mbps)', value: '12.3 Mbps', color: '#0070CC' },
              { title: '网络流出 (Mbps)', value: '8.7 Mbps', color: '#EB2F96' }
            ].map(m => (
              <div key={m.title} className="metric-card">
                <div className="metric-title">{m.title}</div>
                <div className="metric-value">{m.value}</div>
                <MockChart color={m.color} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-title" style={{ margin: 0, border: 'none', padding: 0 }}>关联安全组</div>
            <button className="btn-normal" onClick={() => setAddSgOpen(true)}>加入安全组</button>
          </div>
          <table className="data-table">
            <thead><tr><th>安全组名称 / ID</th><th>描述</th><th>规则数</th><th>VPC ID</th></tr></thead>
            <tbody>
              {sgs.map(sg => (
                <tr key={sg.id}>
                  <td><Link to={buildPath(`/ecs/security-groups/${sg.id}`)} className="link">{sg.name}</Link><br /><span className="mono">{sg.id}</span></td>
                  <td>{sg.description}</td>
                  <td>{sg.rules.length}</td>
                  <td><span className="mono">{sg.vpcId}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {addSgOpen && (
            <div className="modal-overlay" onClick={() => setAddSgOpen(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-title">加入安全组</div>
                <div className="form-group">
                  <label className="form-label">安全组</label>
                  <select className="form-select" value={selectedSg} onChange={e => setSelectedSg(e.target.value)}>
                    <option value="">请选择安全组...</option>
                    {availableSgs.map(sg => <option key={sg.id} value={sg.id}>{sg.name} ({sg.id})</option>)}
                  </select>
                </div>
                <div className="modal-actions">
                  <button className="btn-normal" onClick={() => setAddSgOpen(false)}>取消</button>
                  <button className="btn-primary" disabled={!selectedSg} onClick={() => {
                    updateInstance({ securityGroupIds: [...inst.securityGroupIds, selectedSg] })
                    setAddSgOpen(false)
                    setSelectedSg('')
                  }}>添加</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'disks' && (
        <div className="card">
          <div className="card-title">云盘列表</div>
          <table className="data-table">
            <thead><tr><th>云盘ID</th><th>名称</th><th>状态</th><th>类型</th><th>容量(GiB)</th><th>设备名</th><th>磁盘类型</th></tr></thead>
            <tbody>
              {disks.length === 0 && <tr><td colSpan={7} className="empty-state">暂无挂载云盘</td></tr>}
              {disks.map(d => (
                <tr key={d.id}>
                  <td><span className="mono">{d.id}</span></td>
                  <td>{d.name}</td>
                  <td><span className={`status-tag ${d.status === 'In_use' ? 'in-use' : 'available'}`}>{d.status === 'In_use' ? '使用中' : '可用'}</span></td>
                  <td>{d.category}</td>
                  <td>{d.size}</td>
                  <td><span className="mono">{d.device}</span></td>
                  <td>{d.diskType === 'system' ? '系统盘' : '数据盘'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.type === 'release' ? '释放实例' : confirm.type === 'stop' ? '停止实例' : '重启实例'}
          message={
            confirm.type === 'release'
              ? `此操作不可撤销！实例 "${inst.name}" 及其系统盘将被永久删除。`
              : confirm.type === 'stop'
              ? `确定要停止实例 "${inst.name}" 吗？`
              : `确定要重启实例 "${inst.name}" 吗？`
          }
          danger={confirm.type === 'release'}
          requireTyping={confirm.type === 'release' ? inst.id : null}
          confirmText={confirm.type === 'release' ? '释放' : '确认'}
          cancelText="取消"
          onConfirm={() => {
            if (confirm.type === 'stop') stopInstance()
            else if (confirm.type === 'restart') restartInstance()
            else if (confirm.type === 'release') releaseInstance()
            setConfirm(null)
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
