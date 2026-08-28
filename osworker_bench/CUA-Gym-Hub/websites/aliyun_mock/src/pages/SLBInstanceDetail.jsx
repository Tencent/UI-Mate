import React, { useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function StatusTag({ status }) {
  return <span className={`status-tag ${status.toLowerCase()}`}><span className={`status-dot ${status.toLowerCase()}`} />{status === 'active' ? '运行中' : status === 'running' ? '运行中' : status}</span>
}

export default function SLBInstanceDetail() {
  const { id } = useParams()
  const { state } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [tab, setTab] = useState('listeners')

  const inst = state.slbInstances.find(i => i.id === id)

  if (!inst) {
    return <div className="card"><div className="empty-state">负载均衡实例不存在。</div></div>
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <Link to={buildPath('/slb/instances')} className="link">负载均衡 SLB</Link>
        <span className="sep">&gt;</span>
        <span>{inst.name}</span>
      </div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="page-title">{inst.name}</h1>
          <StatusTag status={inst.status} />
        </div>
      </div>

      {/* Instance info card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0 }}>
          {[
            ['实例ID', inst.id],
            ['网络类型', inst.addressType === 'internet' ? '公网' : '内网'],
            ['服务地址', inst.address],
            ['VPC ID', inst.vpcId],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}><span className="mono">{value}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="tab-nav">
        {[['listeners','监听'], ['backends','后端服务器'], ['health','健康检查']].map(([k,v]) => (
          <div key={k} className={`tab-item${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{v}</div>
        ))}
      </div>

      {tab === 'listeners' && (
        <div className="card">
          <div className="card-title">监听列表</div>
          <table className="data-table">
            <thead><tr><th>协议</th><th>前端端口</th><th>后端端口</th><th>调度算法</th><th>健康检查</th><th>状态</th></tr></thead>
            <tbody>
              {(inst.listeners || []).length === 0 && <tr><td colSpan={6} className="empty-state">暂无监听</td></tr>}
              {(inst.listeners || []).map((l, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{l.protocol}</td>
                  <td>{l.frontendPort}</td>
                  <td>{l.backendPort}</td>
                  <td>{l.scheduler === 'wrr' ? '加权轮询' : l.scheduler === 'rr' ? '轮询' : l.scheduler}</td>
                  <td>{l.healthCheck ? <span style={{ color: '#1DC11D' }}>已开启</span> : <span style={{ color: '#999' }}>未开启</span>}</td>
                  <td><StatusTag status={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'backends' && (
        <div className="card">
          <div className="card-title">后端服务器</div>
          <table className="data-table">
            <thead><tr><th>服务器ID</th><th>名称</th><th>端口</th><th>权重</th><th>健康状态</th></tr></thead>
            <tbody>
              {(inst.backendServers || []).length === 0 && <tr><td colSpan={5} className="empty-state">暂无后端服务器</td></tr>}
              {(inst.backendServers || []).map((s, i) => (
                <tr key={i}>
                  <td><Link to={buildPath(`/ecs/instances/${s.serverId}`)} className="link mono">{s.serverId}</Link></td>
                  <td>{s.serverName}</td>
                  <td>{s.port}</td>
                  <td>{s.weight}</td>
                  <td>
                    <span className={`status-tag ${s.status === '正常' ? 'ok' : 'alarm'}`}>
                      <span className={`status-dot ${s.status === '正常' ? 'ok' : 'alarm'}`} />
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'health' && (
        <div className="card">
          <div className="card-title">健康检查配置</div>
          {(inst.listeners || []).length === 0 && <div className="empty-state">暂无监听配置</div>}
          {(inst.listeners || []).map((l, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{l.protocol} :{l.frontendPort}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 0 }}>
                <div className="kv-label">健康检查</div>
                <div className="kv-value">{l.healthCheck ? '已开启' : '未开启'}</div>
                {l.healthCheckPath && <>
                  <div className="kv-label">检查路径</div>
                  <div className="kv-value"><span className="mono">{l.healthCheckPath}</span></div>
                </>}
                <div className="kv-label">检查端口</div>
                <div className="kv-value">{l.backendPort}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
