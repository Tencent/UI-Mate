import React, { useState } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Copy } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUS_MAP = { Running: '运行中', Stopped: '已停止', Starting: '启动中', Stopping: '停止中' }

function StatusTag({ status }) {
  const s = status.toLowerCase()
  return <span className={`status-tag ${s}`}><span className={`status-dot ${s}`} />{STATUS_MAP[status] || status}</span>
}

function copyToClipboard(text) { navigator.clipboard.writeText(text).catch(() => {}) }

export default function RDSInstanceDetail() {
  const { id } = useParams()
  const { state, updateState } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [tab, setTab] = useState('basic')
  const [confirm, setConfirm] = useState(null)

  const inst = state.rdsInstances.find(i => i.id === id)

  if (!inst) {
    return <div className="card"><div className="empty-state">实例不存在。</div></div>
  }

  const restartInstance = () => {
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'RDS', eventName: '重启实例', resourceType: 'DBInstance', resourceId: id, resourceName: inst.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateState(prev => ({
      ...prev,
      rdsInstances: prev.rdsInstances.map(i => i.id === id ? { ...i, status: 'Starting' } : i),
      operationLog: [logEntry, ...prev.operationLog]
    }))
    setTimeout(() => {
      updateState(prev => ({
        ...prev,
        rdsInstances: prev.rdsInstances.map(i => i.id === id ? { ...i, status: 'Running' } : i)
      }))
    }, 2000)
  }

  const releaseInstance = () => {
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'RDS', eventName: '释放实例', resourceType: 'DBInstance', resourceId: id, resourceName: inst.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateState(prev => ({
      ...prev,
      rdsInstances: prev.rdsInstances.filter(i => i.id !== id),
      operationLog: [logEntry, ...prev.operationLog]
    }))
    navigate(buildPath('/rds/instances'))
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <Link to={buildPath('/rds/instances')} className="link">云数据库 RDS</Link>
        <span className="sep">&gt;</span>
        <span>{inst.name}</span>
      </div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="page-title">{inst.name}</h1>
          <StatusTag status={inst.status} />
          <span className="tag-pill">{inst.engine} {inst.engineVersion}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-normal" onClick={() => setConfirm({ type: 'restart' })}>重启</button>
          <button className="btn-danger" onClick={() => setConfirm({ type: 'release' })}>释放</button>
        </div>
      </div>

      <div className="tab-nav">
        {[['basic','基本信息'], ['connection','连接信息'], ['databases','数据库管理'], ['accounts','账号管理'], ['backup','备份恢复'], ['monitoring','监控']].map(([k,v]) => (
          <div key={k} className={`tab-item${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{v}</div>
        ))}
      </div>

      {tab === 'basic' && (
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[
              ['实例ID', <span className="mono">{inst.id}</span>],
              ['地域', state.regions.find(r => r.id === inst.regionId)?.name],
              ['实例名称', inst.name],
              ['可用区', inst.zoneId],
              ['状态', <StatusTag status={inst.status} />],
              ['VPC', <span className="mono">{inst.vpcId}</span>],
              ['数据库类型', inst.engine],
              ['交换机', <span className="mono">{inst.vswitchId}</span>],
              ['版本', inst.engineVersion],
              ['付费方式', inst.billingMethod],
              ['规格', <span className="mono">{inst.instanceType}</span>],
              ['创建时间', inst.creationTime?.split('T')[0]],
              ['vCPU', inst.vCPU],
              ['到期时间', inst.expiredTime ? inst.expiredTime.split('T')[0] : '--'],
              ['内存', `${inst.memory} GiB`],
              ['系列', inst.category],
              ['存储空间', `${inst.storageSize} GiB`],
              ['最大连接数', inst.maxConnections],
              ['存储类型', inst.storageType],
              ['最大IOPS', inst.maxIOPS],
            ].map(([label, value], i) => (
              <React.Fragment key={i}>
                <div className="kv-label">{label}</div>
                <div className="kv-value">{value}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {tab === 'connection' && (
        <div className="card">
          <div className="card-title">连接信息</div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 0 }}>
            <div className="kv-label">内网地址</div>
            <div className="kv-value">
              <span className="mono">{inst.connectionString}</span>
              <button className="copy-btn" onClick={() => copyToClipboard(inst.connectionString)}><Copy size={12} /></button>
            </div>
            <div className="kv-label">端口</div>
            <div className="kv-value">
              <span className="mono">{inst.port}</span>
              <button className="copy-btn" onClick={() => copyToClipboard(String(inst.port))}><Copy size={12} /></button>
            </div>
            <div className="kv-label">VPC ID</div>
            <div className="kv-value"><span className="mono">{inst.vpcId}</span></div>
            <div className="kv-label">交换机ID</div>
            <div className="kv-value"><span className="mono">{inst.vswitchId}</span></div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn-normal">申请外网地址</button>
          </div>
        </div>
      )}

      {tab === 'databases' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-title" style={{ margin: 0, border: 'none', padding: 0 }}>数据库列表</div>
          </div>
          <table className="data-table">
            <thead><tr><th>数据库名称</th><th>字符集</th><th>状态</th><th>备注</th></tr></thead>
            <tbody>
              {(!inst.databases || inst.databases.length === 0) && <tr><td colSpan={4} className="empty-state">暂无数据库</td></tr>}
              {(inst.databases || []).map(db => (
                <tr key={db.name}>
                  <td style={{ fontWeight: 500 }}>{db.name}</td>
                  <td>{db.characterSet}</td>
                  <td><span className="status-tag running"><span className="status-dot running" />{db.status === 'Running' ? '运行中' : db.status}</span></td>
                  <td style={{ fontSize: 12, color: '#666' }}>{db.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'accounts' && (
        <div className="card">
          <div className="card-title" style={{ margin: 0, border: 'none', padding: 0, marginBottom: 12 }}>账号管理</div>
          <table className="data-table">
            <thead><tr><th>账号名</th><th>账号类型</th><th>状态</th><th>备注</th></tr></thead>
            <tbody>
              {(!inst.accounts || inst.accounts.length === 0) && <tr><td colSpan={4} className="empty-state">暂无账号</td></tr>}
              {(inst.accounts || []).map(acc => (
                <tr key={acc.name}>
                  <td style={{ fontWeight: 500 }}>{acc.name}</td>
                  <td>{acc.type}</td>
                  <td><span className="status-tag available">{acc.status}</span></td>
                  <td style={{ fontSize: 12, color: '#666' }}>{acc.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'backup' && (
        <div className="card">
          <div className="card-title" style={{ margin: 0, border: 'none', padding: 0, marginBottom: 12 }}>备份列表</div>
          <table className="data-table">
            <thead><tr><th>备份ID</th><th>备份方式</th><th>备份方法</th><th>大小(MB)</th><th>开始时间</th><th>结束时间</th><th>状态</th></tr></thead>
            <tbody>
              {(!inst.backups || inst.backups.length === 0) && <tr><td colSpan={7} className="empty-state">暂无备份</td></tr>}
              {(inst.backups || []).map(bk => (
                <tr key={bk.id}>
                  <td><span className="mono">{bk.id}</span></td>
                  <td>{bk.backupMode}</td>
                  <td>{bk.backupMethod}</td>
                  <td>{bk.backupSize}</td>
                  <td style={{ fontSize: 12 }}>{bk.backupStartTime?.replace('T', ' ').slice(0, 16)}</td>
                  <td style={{ fontSize: 12 }}>{bk.backupEndTime?.replace('T', ' ').slice(0, 16)}</td>
                  <td><span className="status-tag ok">{bk.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'monitoring' && (
        <div className="card"><div className="empty-state">监控数据暂不可用（演示模式）</div></div>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.type === 'release' ? '释放实例' : '重启实例'}
          message={
            confirm.type === 'release'
              ? `此操作不可撤销！实例 "${inst.name}" 及其所有数据库将被永久删除。`
              : `确定要重启实例 "${inst.name}" 吗？重启期间数据库将不可用。`
          }
          danger={confirm.type === 'release'}
          requireTyping={confirm.type === 'release' ? inst.id : null}
          confirmText={confirm.type === 'release' ? '释放' : '确认'}
          cancelText="取消"
          onConfirm={() => {
            if (confirm.type === 'restart') restartInstance()
            else if (confirm.type === 'release') releaseInstance()
            setConfirm(null)
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
