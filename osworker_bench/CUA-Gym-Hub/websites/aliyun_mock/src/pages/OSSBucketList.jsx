import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function aclTag(acl) {
  if (acl === 'private') return <span className="acl-tag private">私有</span>
  if (acl === 'public-read') return <span className="acl-tag public-read">公共读</span>
  if (acl === 'public-read-write') return <span className="acl-tag public-read-write">公共读写</span>
  return <span>{acl}</span>
}

function formatSize(sizeGiB) {
  if (sizeGiB < 1) return `${(sizeGiB * 1024).toFixed(1)} MiB`
  return `${sizeGiB.toFixed(1)} GiB`
}

const STORAGE_CLASS_MAP = { Standard: '标准存储', IA: '低频访问', Archive: '归档存储', ColdArchive: '冷归档存储' }

export default function OSSBucketList() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', regionId: 'cn-hangzhou', storageClass: 'Standard', acl: 'private' })

  const buckets = state.ossBuckets.filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()))

  const createBucket = () => {
    if (!form.name) return
    const newBucket = {
      name: form.name,
      regionId: form.regionId,
      storageClass: form.storageClass,
      acl: form.acl,
      creationTime: new Date().toISOString(),
      objectCount: 0,
      storageSize: 0,
      lastModifiedTime: new Date().toISOString(),
      versioning: null,
      encryption: null,
      tags: [],
      files: []
    }
    const logEntry = { id: `log-${Date.now()}`, eventTime: new Date().toISOString(), serviceName: 'OSS', eventName: '创建Bucket', resourceType: 'Bucket', resourceId: form.name, resourceName: form.name, userAgent: 'console', sourceIpAddress: '120.26.45.67', result: '成功' }
    updateState(prev => ({ ...prev, ossBuckets: [...prev.ossBuckets, newBucket], operationLog: [logEntry, ...prev.operationLog] }))
    setShowCreate(false)
    setForm({ name: '', regionId: 'cn-hangzhou', storageClass: 'Standard', acl: 'private' })
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <span>对象存储 OSS</span>
        <span className="sep">&gt;</span>
        <span>Bucket 列表</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">Bucket 列表</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ 创建 Bucket</button>
      </div>
      <div className="filter-bar">
        <input className="filter-input" placeholder="按Bucket名称搜索" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Bucket 名称</th><th>地域</th><th>存储类型</th><th>读写权限</th><th>对象数</th><th>存储量</th><th>创建时间</th></tr>
        </thead>
        <tbody>
          {buckets.length === 0 && <tr><td colSpan={7} className="empty-state">未找到Bucket</td></tr>}
          {buckets.map(b => (
            <tr key={b.name}>
              <td><Link to={buildPath(`/oss/buckets/${b.name}`)} className="link">{b.name}</Link></td>
              <td>{state.regions.find(r => r.id === b.regionId)?.name || b.regionId}</td>
              <td><span className="tag-pill">{STORAGE_CLASS_MAP[b.storageClass] || b.storageClass}</span></td>
              <td>{aclTag(b.acl)}</td>
              <td>{b.objectCount.toLocaleString()}</td>
              <td>{formatSize(b.storageSize)}</td>
              <td style={{ fontSize: 12, color: '#666' }}>{b.creationTime?.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">创建 Bucket</div>
            <div className="form-group">
              <label className="form-label required">Bucket 名称</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} placeholder="3-63位小写字母、数字和连字符" />
            </div>
            <div className="form-group">
              <label className="form-label">地域</label>
              <select className="form-select" value={form.regionId} onChange={e => setForm(f => ({ ...f, regionId: e.target.value }))}>
                {state.regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">存储类型</label>
              <select className="form-select" value={form.storageClass} onChange={e => setForm(f => ({ ...f, storageClass: e.target.value }))}>
                {Object.entries(STORAGE_CLASS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">读写权限</label>
              <div style={{ display: 'flex', gap: 16 }}>
                {[['private', '私有'], ['public-read', '公共读'], ['public-read-write', '公共读写']].map(([a, label]) => (
                  <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="acl" value={a} checked={form.acl === a} onChange={() => setForm(f => ({ ...f, acl: a }))} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-normal" onClick={() => setShowCreate(false)}>取消</button>
              <button className="btn-primary" disabled={!form.name || form.name.length < 3} onClick={createBucket}>创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
