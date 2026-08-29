import { useState } from 'react'
import { useApp } from '../context/AppContext'

const DOC_TYPES = {
  doc: { icon: '📝', color: '#1890FF' },
  sheet: { icon: '📊', color: '#52C41A' },
  slides: { icon: '📑', color: '#FA8C16' },
}

export default function DocsPage() {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('recent')
  const [docs, setDocs] = useState(() => {
    return state.drive?.files
      ?.filter(f => {
        const ext = f.name.split('.').pop().toLowerCase()
        return ['pdf', 'xlsx', 'pptx', 'doc', 'docx', 'txt', 'md'].includes(ext)
      })
      .map(f => {
        const ext = f.name.split('.').pop().toLowerCase()
        let docType = 'doc'
        if (['xlsx', 'csv'].includes(ext)) docType = 'sheet'
        if (['pptx', 'ppt'].includes(ext)) docType = 'slides'
        return {
          id: f.id,
          name: f.name,
          type: docType,
          modifiedAt: f.modifiedAt,
          ownerId: f.uploaderId,
          size: f.size,
        }
      }) || []
  })
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState(null)
  const [createTitle, setCreateTitle] = useState('')

  const getUser = (id) => state.users.find(u => u.id === id)

  const formatDate = (ts) => {
    if (!ts) return '-'
    const d = new Date(ts)
    const now = new Date()
    const diff = (now - d) / 86400000
    if (diff < 1 && d.getDate() === now.getDate()) return '今天'
    if (diff < 2) return '昨天'
    return `${d.getMonth()+1}月${d.getDate()}日`
  }

  const handleCreateDoc = () => {
    if (!createTitle.trim() || !createType) return
    const ext = createType === 'sheet' ? '.xlsx' : createType === 'slides' ? '.pptx' : '.docx'
    const newDoc = {
      id: `doc_${Date.now()}`,
      name: createTitle.trim() + ext,
      type: createType,
      modifiedAt: new Date().toISOString(),
      ownerId: state.currentUser.id,
      size: '0 KB',
    }
    setDocs(prev => [newDoc, ...prev])
    dispatch({
      type: 'DRIVE_UPLOAD_FILE',
      file: {
        id: newDoc.id,
        name: newDoc.name,
        size: newDoc.size,
        modifiedAt: newDoc.modifiedAt,
        uploaderId: state.currentUser.id,
      }
    })
    setShowCreate(false)
    setCreateTitle('')
    setCreateType(null)
  }

  const myDocs = docs.filter(d => d.ownerId === state.currentUser.id)
  const sharedDocs = docs.filter(d => d.ownerId !== state.currentUser.id)
  const list = activeTab === 'my' ? myDocs : activeTab === 'shared' ? sharedDocs : docs

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>文档</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ 新建文档</button>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        {[
          { key: 'recent', label: '最近' },
          { key: 'my', label: '我的文档' },
          { key: 'shared', label: '共享给我' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14,
              fontFamily: 'var(--font-family)',
              color: activeTab === t.key ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: activeTab === t.key ? 600 : 400
            }}
          >{t.label}</button>
        ))}
      </div>
      {list.map(doc => {
        const owner = getUser(doc.ownerId)
        const typeInfo = DOC_TYPES[doc.type] || DOC_TYPES.doc
        return (
          <div key={doc.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: 'white', border: '1px solid var(--border)', borderRadius: 8,
            marginBottom: 8, cursor: 'pointer', transition: 'box-shadow 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20, background: typeInfo.color + '15', flexShrink: 0
            }}>
              {typeInfo.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {owner?.name || '未知'} {formatDate(doc.modifiedAt)} 修改
              </div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{doc.size}</span>
          </div>
        )
      })}
      {list.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
          暂无文档
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>{createType ? '新建文档' : '选择文档类型'}</h3>
              <button onClick={() => { setShowCreate(false); setCreateType(null) }} style={{ fontSize: 18, cursor: 'pointer', color: '#8F959E' }}>✕</button>
            </div>
            <div className="modal-body">
              {!createType ? (
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '12px 0' }}>
                  {Object.entries(DOC_TYPES).map(([key, info]) => (
                    <div key={key} onClick={() => setCreateType(key)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        padding: '20px 24px', border: '1px solid var(--border)', borderRadius: 8,
                        cursor: 'pointer', transition: 'background 0.1s', minWidth: 80
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 32 }}>{info.icon}</span>
                      <span style={{ fontSize: 13 }}>{key === 'doc' ? '文字文档' : key === 'sheet' ? '表格' : '演示文稿'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>文档标题</label>
                  <input
                    autoFocus
                    value={createTitle}
                    onChange={e => setCreateTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCreateDoc() }}
                    placeholder="请输入文档标题"
                    className="form-input"
                  />
                </div>
              )}
            </div>
            {createType && (
              <div className="modal-footer">
                <button className="btn btn-default" onClick={() => setCreateType(null)}>上一步</button>
                <button className="btn btn-primary" onClick={handleCreateDoc} disabled={!createTitle.trim()}>创建</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
