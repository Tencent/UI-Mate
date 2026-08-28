import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ECSKeyPairs() {
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')

  const keyPairs = [
    { name: 'prod-keypair', fingerprint: 'b1:c2:d3:e4:f5:a6:b7:c8:d9:e0:f1:a2:b3:c4:d5:e6', instanceCount: 3, creationTime: '2024-01-10T06:00:00Z' },
    { name: 'dev-keypair', fingerprint: 'a1:b2:c3:d4:e5:f6:a7:b8:c9:d0:e1:f2:a3:b4:c5:d6', instanceCount: 1, creationTime: '2024-02-15T09:00:00Z' }
  ]

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <Link to={buildPath('/ecs/instances')} className="link">云服务器 ECS</Link>
        <span className="sep">&gt;</span>
        <span>密钥对</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">密钥对</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ 创建密钥对</button>
      </div>
      <table className="data-table">
        <thead><tr><th>名称</th><th>指纹</th><th>关联实例数</th><th>创建时间</th></tr></thead>
        <tbody>
          {keyPairs.map(kp => (
            <tr key={kp.name}>
              <td style={{ fontWeight: 500 }}>{kp.name}</td>
              <td><span className="mono">{kp.fingerprint}</span></td>
              <td>{kp.instanceCount}</td>
              <td style={{ fontSize: 12, color: '#666' }}>{kp.creationTime?.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">创建密钥对</div>
            <div className="form-group">
              <label className="form-label required">密钥对名称</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="例如：my-keypair" autoFocus />
            </div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>创建后，私钥文件将自动下载。请妥善保管，私钥仅此一次提供。</div>
            <div className="modal-actions">
              <button className="btn-normal" onClick={() => setShowCreate(false)}>取消</button>
              <button className="btn-primary" disabled={!name.trim()} onClick={() => { setShowCreate(false); setName('') }}>创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
