import React, { useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Copy, FolderOpen, File } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

function copyToClipboard(text) { navigator.clipboard.writeText(text).catch(() => {}) }

function aclTag(acl) {
  if (acl === 'private') return <span className="acl-tag private">私有</span>
  if (acl === 'public-read') return <span className="acl-tag public-read">公共读</span>
  if (acl === 'public-read-write') return <span className="acl-tag public-read-write">公共读写</span>
  return <span>{acl}</span>
}

function formatSize(bytes) {
  if (bytes === 0) return '--'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1048576).toFixed(1)} MB`
}

function formatSizeGiB(gib) {
  if (gib < 0.001) return '0 B'
  if (gib < 1) return `${(gib * 1024).toFixed(1)} MiB`
  return `${gib.toFixed(2)} GiB`
}

export default function OSSBucketDetail() {
  const { name } = useParams()
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p

  const bucket = state.ossBuckets.find(b => b.name === name)
  const [tab, setTab] = useState('overview')
  const [showUpload, setShowUpload] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [folderName, setFolderName] = useState('')
  const [deleteFile, setDeleteFile] = useState(null)

  if (!bucket) {
    return <div className="card"><div className="empty-state">Bucket不存在。</div></div>
  }

  const endpoint = `${bucket.name}.oss-${bucket.regionId}.aliyuncs.com`

  const updateBucket = (changes) => {
    updateState(prev => ({
      ...prev,
      ossBuckets: prev.ossBuckets.map(b => b.name === name ? { ...b, ...changes } : b)
    }))
  }

  const uploadFile = () => {
    if (!uploadName.trim()) return
    const newFile = {
      name: uploadName.trim(),
      size: Math.floor(Math.random() * 1000000) + 1000,
      lastModified: new Date().toISOString(),
      storageClass: bucket.storageClass,
      type: 'file'
    }
    updateBucket({
      files: [...(bucket.files || []), newFile],
      objectCount: (bucket.objectCount || 0) + 1,
      lastModifiedTime: new Date().toISOString()
    })
    setUploadName('')
    setShowUpload(false)
  }

  const createFolder = () => {
    if (!folderName.trim()) return
    const fName = folderName.trim().endsWith('/') ? folderName.trim() : folderName.trim() + '/'
    const newFolder = {
      name: fName,
      size: 0,
      lastModified: new Date().toISOString(),
      storageClass: bucket.storageClass,
      type: 'folder'
    }
    updateBucket({ files: [...(bucket.files || []), newFolder] })
    setFolderName('')
    setShowCreateFolder(false)
  }

  const deleteFileByName = (fileName) => {
    updateBucket({
      files: (bucket.files || []).filter(f => f.name !== fileName),
      objectCount: Math.max(0, (bucket.objectCount || 0) - 1)
    })
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <Link to={buildPath('/oss/buckets')} className="link">对象存储 OSS</Link>
        <span className="sep">&gt;</span>
        <span>{name}</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">{name}</h1>
        <span className="status-tag active"><span className="status-dot active" />已激活</span>
      </div>

      <div className="tab-nav">
        {[['overview','概览'], ['files','文件列表'], ['settings','基础设置']].map(([k,v]) => (
          <div key={k} className={`tab-item${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{v}</div>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="card">
          <div className="card-title">Bucket 信息</div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 0 }}>
            {[
              ['Bucket名称', name],
              ['地域', state.regions.find(r => r.id === bucket.regionId)?.name || bucket.regionId],
              ['存储类型', bucket.storageClass],
              ['读写权限', aclTag(bucket.acl)],
              ['版本控制', bucket.versioning === 'Enabled' ? '已开启' : bucket.versioning === 'Suspended' ? '已暂停' : '未开启'],
              ['服务端加密', bucket.encryption || '无'],
              ['对象数', bucket.objectCount?.toLocaleString()],
              ['存储量', formatSizeGiB(bucket.storageSize)],
              ['创建时间', bucket.creationTime?.split('T')[0]],
              ['最后修改', bucket.lastModifiedTime?.split('T')[0]],
            ].map(([label, value]) => (
              <React.Fragment key={label}>
                <div className="kv-label">{label}</div>
                <div className="kv-value">{value}</div>
              </React.Fragment>
            ))}
            <div className="kv-label">访问域名</div>
            <div className="kv-value">
              <span className="mono">{endpoint}</span>
              <button className="copy-btn" onClick={() => copyToClipboard(endpoint)} title="复制"><Copy size={12} /></button>
            </div>
          </div>
        </div>
      )}

      {tab === 'files' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-title" style={{ margin: 0, border: 'none', padding: 0 }}>
              文件列表 <span style={{ color: '#999', fontSize: 12 }}>/ (根目录)</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-normal" onClick={() => setShowCreateFolder(true)}>新建目录</button>
              <button className="btn-primary" onClick={() => setShowUpload(true)}>上传文件</button>
            </div>
          </div>
          <table className="data-table">
            <thead><tr><th>文件名</th><th>大小</th><th>最后修改</th><th>存储类型</th><th>操作</th></tr></thead>
            <tbody>
              {(bucket.files || []).length === 0 && <tr><td colSpan={5} className="empty-state">暂无文件</td></tr>}
              {(bucket.files || []).map(f => (
                <tr key={f.name}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {f.type === 'folder' ? <FolderOpen size={14} color="#FFA003" /> : <File size={14} color="#0070CC" />}
                    <span>{f.name}</span>
                  </td>
                  <td>{f.type === 'folder' ? '--' : formatSize(f.size)}</td>
                  <td style={{ fontSize: 12, color: '#666' }}>{f.lastModified?.split('T')[0]}</td>
                  <td>{f.storageClass}</td>
                  <td>
                    <div className="row-actions">
                      {f.type === 'file' && <button className="btn-text" style={{ fontSize: 12 }}>下载</button>}
                      <button className="btn-text" style={{ color: '#FF3333', fontSize: 12 }} onClick={() => setDeleteFile(f)}>删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'settings' && (
        <div className="card">
          <div className="card-title">基础设置</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>版本控制</div>
                <div style={{ fontSize: 12, color: '#666' }}>当前状态：{bucket.versioning === 'Enabled' ? '已开启' : bucket.versioning === 'Suspended' ? '已暂停' : '未开启'}</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={bucket.versioning === 'Enabled'} onChange={e => updateBucket({ versioning: e.target.checked ? 'Enabled' : 'Suspended' })} />
                <span className="toggle-slider" />
              </label>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>读写权限 (ACL)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['private', '私有'], ['public-read', '公共读'], ['public-read-write', '公共读写']].map(([a, label]) => (
                  <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" name="acl-setting" value={a} checked={bucket.acl === a} onChange={() => updateBucket({ acl: a })} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>存储类型</div>
              <div style={{ fontSize: 12, color: '#666' }}>{bucket.storageClass}</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>服务端加密</div>
              <div style={{ fontSize: 12, color: '#666' }}>{bucket.encryption || '无'}</div>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">上传文件</div>
            <div className="form-group">
              <label className="form-label required">文件名</label>
              <input className="form-input" value={uploadName} onChange={e => setUploadName(e.target.value)} placeholder="例如：document.pdf 或 images/photo.jpg" autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn-normal" onClick={() => setShowUpload(false)}>取消</button>
              <button className="btn-primary" disabled={!uploadName.trim()} onClick={uploadFile}>上传</button>
            </div>
          </div>
        </div>
      )}

      {showCreateFolder && (
        <div className="modal-overlay" onClick={() => setShowCreateFolder(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">新建目录</div>
            <div className="form-group">
              <label className="form-label required">目录名称</label>
              <input className="form-input" value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="例如：backup" autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn-normal" onClick={() => setShowCreateFolder(false)}>取消</button>
              <button className="btn-primary" disabled={!folderName.trim()} onClick={createFolder}>创建</button>
            </div>
          </div>
        </div>
      )}

      {deleteFile && (
        <ConfirmDialog
          title="删除文件"
          message={`确定要删除 "${deleteFile.name}" 吗？此操作不可撤销。`}
          danger
          confirmText="删除"
          cancelText="取消"
          onConfirm={() => { deleteFileByName(deleteFile.name); setDeleteFile(null) }}
          onCancel={() => setDeleteFile(null)}
        />
      )}
    </div>
  )
}
