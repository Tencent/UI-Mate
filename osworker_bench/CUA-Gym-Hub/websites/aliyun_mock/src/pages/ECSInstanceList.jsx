import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { RefreshCw, Copy, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUS_MAP = { Running: '运行中', Stopped: '已停止', Starting: '启动中', Stopping: '停止中', Expired: '已过期' }

function CreateInstanceModal({ onClose, onConfirm, regions, currentRegion }) {
  const [name, setName] = useState('')
  const [instanceType, setInstanceType] = useState('ecs.g7.large')
  const [zone, setZone] = useState('cn-hangzhou-h')
  const [os, setOs] = useState('linux')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) { setError('请输入实例名称'); return }
    onConfirm({ name: name.trim(), instanceType, zone, os })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">创建ECS实例</div>
        <div className="form-group">
          <label className="form-label required">实例名称</label>
          <input className="form-input" value={name} onChange={e => { setName(e.target.value); setError('') }} placeholder="例如：my-server-01" autoFocus />
          {error && <div style={{ color: '#FF3333', fontSize: 12, marginTop: 4 }}>{error}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">实例规格</label>
          <select className="form-select" value={instanceType} onChange={e => setInstanceType(e.target.value)}>
            <option value="ecs.g7.large">ecs.g7.large (2 vCPU, 8 GiB)</option>
            <option value="ecs.g7.xlarge">ecs.g7.xlarge (4 vCPU, 16 GiB)</option>
            <option value="ecs.c7.large">ecs.c7.large (2 vCPU, 4 GiB)</option>
            <option value="ecs.r7.large">ecs.r7.large (2 vCPU, 16 GiB)</option>
            <option value="ecs.t6-c1m1.large">ecs.t6-c1m1.large (1 vCPU, 1 GiB)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">可用区</label>
          <select className="form-select" value={zone} onChange={e => setZone(e.target.value)}>
            <option value="cn-hangzhou-h">cn-hangzhou-h</option>
            <option value="cn-hangzhou-g">cn-hangzhou-g</option>
            <option value="cn-hangzhou-i">cn-hangzhou-i</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">操作系统</label>
          <select className="form-select" value={os} onChange={e => setOs(e.target.value)}>
            <option value="linux">Alibaba Cloud Linux 3.2104 LTS 64位</option>
            <option value="centos">CentOS 7.9 64位</option>
            <option value="ubuntu">Ubuntu 22.04 64位</option>
            <option value="windows">Windows Server 2022 数据中心版 64位</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn-normal" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>创建实例</button>
        </div>
      </div>
    </div>
  )
}

function StatusTag({ status }) {
  const s = status.toLowerCase()
  return <span className={`status-tag ${s}`}><span className={`status-dot ${s}`} />{STATUS_MAP[status] || status}</span>
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}

export default function ECSInstanceList() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [billingFilter, setBillingFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [selected, setSelected] = useState([])
  const [openDropdown, setOpenDropdown] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const [showCreate, setShowCreate] = useState(false)

  const instances = state.ecsInstances.filter(i => i.regionId === state.currentRegion)

  const filtered = instances.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || i.status.toLowerCase() === statusFilter.toLowerCase()
    const matchBilling = billingFilter === 'all' || i.billingMethod === billingFilter
    return matchSearch && matchStatus && matchBilling
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 800)
  }

  const OS_MAP = {
    linux: { name: 'Alibaba Cloud Linux 3.2104 LTS 64位', id: 'aliyun_3_x64_20G_alibase_20230727' },
    centos: { name: 'CentOS 7.9 64位', id: 'centos_7_9_x64_20G_alibase_20230901' },
    ubuntu: { name: 'Ubuntu 22.04 64位', id: 'ubuntu_22_04_x64_20G_alibase_20230901' },
    windows: { name: 'Windows Server 2022 数据中心版 64位', id: 'win2022_dc_x64_20G_alibase_20230901' }
  }

  const createInstance = ({ name, instanceType, zone, os }) => {
    const typeMap = {
      'ecs.g7.large': { vCPU: 2, memory: 8 },
      'ecs.g7.xlarge': { vCPU: 4, memory: 16 },
      'ecs.c7.large': { vCPU: 2, memory: 4 },
      'ecs.r7.large': { vCPU: 2, memory: 16 },
      'ecs.t6-c1m1.large': { vCPU: 1, memory: 1 }
    }
    const specs = typeMap[instanceType] || { vCPU: 2, memory: 8 }
    const osInfo = OS_MAP[os] || OS_MAP.linux
    const newId = `i-${Date.now().toString(36)}`
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'ECS', eventName: '创建实例', resourceType: 'Instance', resourceId: newId, resourceName: name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    const newInst = {
      id: newId, name, status: 'Starting', regionId: state.currentRegion, zoneId: zone,
      instanceType, vCPU: specs.vCPU, memory: specs.memory,
      osType: os === 'windows' ? 'windows' : 'linux', osName: osInfo.name,
      imageId: osInfo.id,
      publicIpAddress: '', privateIpAddress: '172.16.0.' + Math.floor(Math.random() * 200 + 20),
      vpcId: 'vpc-bp1prod123456789', vswitchId: 'vsw-bp1web123456789',
      securityGroupIds: ['sg-bp1web123456789'], keyPairName: '',
      billingMethod: '按量付费', renewalStatus: '',
      creationTime: new Date().toISOString(), expiredTime: null,
      tags: [], systemDiskSize: 40, systemDiskCategory: 'cloud_essd', dataDiskCount: 0
    }
    updateState(prev => ({
      ...prev,
      ecsInstances: [...prev.ecsInstances, newInst],
      operationLog: [logEntry, ...prev.operationLog]
    }))
    setTimeout(() => {
      updateState(prev => ({
        ...prev,
        ecsInstances: prev.ecsInstances.map(i => i.id === newId ? { ...i, status: 'Running' } : i)
      }))
    }, 1500)
    setShowCreate(false)
  }

  const updateInstance = (id, changes, logEntry) => {
    updateState(prev => ({
      ...prev,
      ecsInstances: prev.ecsInstances.map(i => i.id === id ? { ...i, ...changes } : i),
      operationLog: logEntry ? [logEntry, ...prev.operationLog] : prev.operationLog
    }))
  }

  const startInstance = (inst) => {
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'ECS', eventName: '启动实例', resourceType: 'Instance', resourceId: inst.id, resourceName: inst.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateInstance(inst.id, { status: 'Starting' }, logEntry)
    setTimeout(() => updateInstance(inst.id, { status: 'Running' }), 1500)
  }

  const stopInstance = (inst) => {
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'ECS', eventName: '停止实例', resourceType: 'Instance', resourceId: inst.id, resourceName: inst.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateInstance(inst.id, { status: 'Stopping' }, logEntry)
    setTimeout(() => updateInstance(inst.id, { status: 'Stopped' }), 1500)
  }

  const restartInstance = (inst) => {
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'ECS', eventName: '重启实例', resourceType: 'Instance', resourceId: inst.id, resourceName: inst.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateInstance(inst.id, { status: 'Stopping' }, logEntry)
    setTimeout(() => updateInstance(inst.id, { status: 'Starting' }), 1000)
    setTimeout(() => updateInstance(inst.id, { status: 'Running' }), 2000)
  }

  const releaseInstance = (inst) => {
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'ECS', eventName: '释放实例', resourceType: 'Instance', resourceId: inst.id, resourceName: inst.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateState(prev => ({
      ...prev,
      ecsInstances: prev.ecsInstances.filter(i => i.id !== inst.id),
      disks: prev.disks.map(d => d.instanceId === inst.id && d.diskType === 'data' ? { ...d, instanceId: '', device: '', status: 'Available' } : d).filter(d => !(d.instanceId === inst.id && d.diskType === 'system')),
      operationLog: [logEntry, ...prev.operationLog]
    }))
  }

  const handleAction = (action, inst) => {
    setOpenDropdown(null)
    if (action === 'start') startInstance(inst)
    else if (action === 'stop') setConfirm({ type: 'stop', inst })
    else if (action === 'restart') setConfirm({ type: 'restart', inst })
    else if (action === 'release') setConfirm({ type: 'release', inst })
  }

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelected(prev => prev.length === paged.length ? [] : paged.map(i => i.id))

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <span>云服务器 ECS</span>
        <span className="sep">&gt;</span>
        <span>实例</span>
      </div>

      <div className="page-header">
        <h1 className="page-title">实例列表</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ 创建实例</button>
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="按名称或ID搜索"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="all">全部状态</option>
          <option value="running">运行中</option>
          <option value="stopped">已停止</option>
          <option value="starting">启动中</option>
          <option value="stopping">停止中</option>
          <option value="expired">已过期</option>
        </select>
        <select className="filter-select" value={billingFilter} onChange={e => { setBillingFilter(e.target.value); setPage(1) }}>
          <option value="all">全部计费</option>
          <option value="包年包月">包年包月</option>
          <option value="按量付费">按量付费</option>
        </select>
        <button className="btn-normal" onClick={handleRefresh} title="刷新">
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
        </button>
      </div>

      {selected.length > 0 && (
        <div className="bulk-bar">
          <span>已选择 {selected.length} 项</span>
          <button className="btn-normal" style={{ height: 28 }} onClick={() => {
            state.ecsInstances.filter(i => selected.includes(i.id) && i.status === 'Stopped').forEach(i => startInstance(i))
          }}>启动</button>
          <button className="btn-normal" style={{ height: 28 }} onClick={() => {
            state.ecsInstances.filter(i => selected.includes(i.id) && i.status === 'Running').forEach(i => stopInstance(i))
          }}>停止</button>
          <button className="btn-normal" style={{ height: 28 }} onClick={() => {
            state.ecsInstances.filter(i => selected.includes(i.id) && i.status === 'Running').forEach(i => restartInstance(i))
          }}>重启</button>
          <button className="btn-danger" style={{ height: 28 }} onClick={() => setConfirm({ type: 'bulkRelease', ids: [...selected] })}>释放</button>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <input type="checkbox" className="table-checkbox" checked={selected.length === paged.length && paged.length > 0} onChange={toggleAll} />
            </th>
            <th>实例名称 / ID</th>
            <th>状态</th>
            <th>可用区</th>
            <th>IP 地址</th>
            <th>实例规格</th>
            <th>操作系统</th>
            <th>付费方式</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 && (
            <tr><td colSpan={9} className="empty-state">暂无实例</td></tr>
          )}
          {paged.map(inst => (
            <tr key={inst.id} className={selected.includes(inst.id) ? 'selected' : ''}>
              <td><input type="checkbox" className="table-checkbox" checked={selected.includes(inst.id)} onChange={() => toggleSelect(inst.id)} /></td>
              <td>
                <div>
                  <Link to={buildPath(`/ecs/instances/${inst.id}`)} className="link" style={{ fontWeight: 500 }}>{inst.name}</Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <span className="mono">{inst.id}</span>
                  <button className="copy-btn" onClick={() => copyToClipboard(inst.id)} title="复制ID"><Copy size={12} /></button>
                </div>
              </td>
              <td><StatusTag status={inst.status} /></td>
              <td style={{ fontSize: 12, color: '#666' }}>{inst.zoneId}</td>
              <td>
                {inst.publicIpAddress && <div style={{ fontSize: 12 }}>{inst.publicIpAddress} <span style={{ color: '#999' }}>(公)</span></div>}
                <div style={{ fontSize: 12 }}>{inst.privateIpAddress} <span style={{ color: '#999' }}>(私)</span></div>
                {!inst.publicIpAddress && <div style={{ fontSize: 12, color: '#999' }}>-- (公)</div>}
              </td>
              <td>
                <div style={{ fontSize: 13 }}>{inst.instanceType}</div>
                <div style={{ fontSize: 11, color: '#999' }}>({inst.vCPU} vCPU, {inst.memory} GiB)</div>
              </td>
              <td style={{ fontSize: 12 }}>{inst.osName.split(' ').slice(0, 2).join(' ')}</td>
              <td>
                <div style={{ fontSize: 12 }}>{inst.billingMethod}</div>
                {inst.expiredTime && <div style={{ fontSize: 11, color: '#999' }}>到期 {inst.expiredTime.split('T')[0]}</div>}
              </td>
              <td>
                <div className="dropdown-wrap">
                  <button
                    className="btn-normal"
                    style={{ height: 28, fontSize: 12, gap: 2 }}
                    onClick={() => setOpenDropdown(openDropdown === inst.id ? null : inst.id)}
                  >
                    更多 <ChevronDown size={12} />
                  </button>
                  {openDropdown === inst.id && (
                    <div className="dropdown-menu" style={{ left: 'auto', right: 0 }}>
                      {inst.status === 'Stopped' && <div className="dropdown-item" onClick={() => handleAction('start', inst)}>启动</div>}
                      {inst.status === 'Running' && <div className="dropdown-item" onClick={() => handleAction('stop', inst)}>停止</div>}
                      {inst.status === 'Running' && <div className="dropdown-item" onClick={() => handleAction('restart', inst)}>重启</div>}
                      <hr className="dropdown-divider" />
                      <div className="dropdown-item danger" onClick={() => handleAction('release', inst)}>释放</div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <span style={{ marginRight: 8 }}>共 {filtered.length} 条</span>
        <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>&lt;</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} className={`pagination-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
        ))}
        <button className="pagination-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>&gt;</button>
      </div>

      {confirm && (
        <ConfirmDialog
          title={
            confirm.type === 'release' ? '释放实例' :
            confirm.type === 'stop' ? '停止实例' :
            confirm.type === 'bulkRelease' ? '批量释放' : '重启实例'
          }
          message={
            confirm.type === 'release'
              ? `此操作不可撤销！实例 "${confirm.inst.name}" 及其系统盘将被永久删除。`
              : confirm.type === 'stop'
              ? `确定要停止实例 "${confirm.inst.name}" 吗？实例将被关机。`
              : confirm.type === 'bulkRelease'
              ? `确定要释放所选的 ${confirm.ids.length} 个实例吗？此操作不可撤销！`
              : `确定要重启实例 "${confirm.inst.name}" 吗？`
          }
          danger={confirm.type === 'release' || confirm.type === 'bulkRelease'}
          requireTyping={confirm.type === 'release' ? confirm.inst.id : null}
          confirmText={confirm.type === 'release' || confirm.type === 'bulkRelease' ? '释放' : '确认'}
          cancelText="取消"
          onConfirm={() => {
            if (confirm.type === 'stop') stopInstance(confirm.inst)
            else if (confirm.type === 'restart') restartInstance(confirm.inst)
            else if (confirm.type === 'release') releaseInstance(confirm.inst)
            else if (confirm.type === 'bulkRelease') {
              confirm.ids.forEach(id => {
                const inst = state.ecsInstances.find(i => i.id === id)
                if (inst) releaseInstance(inst)
              })
              setSelected([])
            }
            setConfirm(null)
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {showCreate && <CreateInstanceModal onClose={() => setShowCreate(false)} onConfirm={createInstance} regions={state.regions} currentRegion={state.currentRegion} />}
    </div>
  )
}
