import { useState } from 'react'
import { useApp } from '../context/AppContext'

const FOLDER_ICON = '📁'
const FILE_ICONS = {
  pdf: '📄',
  xlsx: '📊',
  pptx: '📑',
  jpg: '🖼️',
  png: '🖼️',
  default: '📃'
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  return FILE_ICONS[ext] || FILE_ICONS.default
}

const SIDEBAR_ITEMS = [
  { key: 'my', label: '我的文件', icon: '🗂️' },
  { key: 'team', label: '团队文件', icon: '👥' },
  { key: 'shared', label: '共享给我', icon: '🔗' },
]

export default function DrivePage() {
  const { state, dispatch } = useApp()
  const [activeNav, setActiveNav] = useState('team')
  const [breadcrumb, setBreadcrumb] = useState(['钉盘', '团队文件', '技术部'])
  const [contextMenu, setContextMenu] = useState(null)
  const [showRenameModal, setShowRenameModal] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [toast, setToast] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMoveModal, setShowMoveModal] = useState(null)
  const [moveTargetFolder, setMoveTargetFolder] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const driveState = state.drive || { files: [], folders: [] }

  const handleUpload = () => {
    const newFile = {
      id: `file_${Date.now()}`,
      name: `上传文件_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.pdf`,
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      type: 'file',
      modifiedAt: new Date().toISOString(),
      uploaderId: state.currentUser.id
    }
    dispatch({ type: 'DRIVE_UPLOAD_FILE', file: newFile })
    showToast('上传成功')
  }

  const handleCreateFolder = () => {
    const name = `新建文件夹 ${driveState.folders.length + 1}`
    dispatch({ type: 'DRIVE_CREATE_FOLDER', folder: { id: `folder_${Date.now()}`, name } })
    showToast('文件夹已创建')
  }

  const handleContextMenu = (e, item) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, item })
  }

  const closeContextMenu = () => setContextMenu(null)

  const handleDownload = () => {
    showToast(`正在下载 ${contextMenu.item.name}`)
    closeContextMenu()
  }

  const handleRename = () => {
    setRenameValue(contextMenu.item.name)
    setShowRenameModal(contextMenu.item)
    closeContextMenu()
  }

  const handleMove = () => {
    setShowMoveModal(contextMenu.item)
    closeContextMenu()
  }

  const confirmMove = () => {
    if (!showMoveModal || !moveTargetFolder) return
    showToast(`已将 ${showMoveModal.name} 移动到 ${moveTargetFolder.name}`)
    setShowMoveModal(null)
    setMoveTargetFolder(null)
  }

  const handleDelete = () => {
    const item = contextMenu.item
    if (item.type === 'folder') {
      dispatch({ type: 'DRIVE_DELETE_FOLDER', id: item.id })
    } else {
      dispatch({ type: 'DRIVE_DELETE_FILE', id: item.id })
    }
    showToast('已删除')
    closeContextMenu()
  }

  const handleShare = () => {
    showToast('分享链接已复制到剪贴板')
    closeContextMenu()
  }

  const confirmRename = () => {
    if (!renameValue.trim()) return
    dispatch({ type: 'DRIVE_RENAME_FILE', id: showRenameModal.id, name: renameValue.trim(), itemType: showRenameModal.type })
    showToast('重命名成功')
    setShowRenameModal(null)
  }

  const handleNavClick = (key) => {
    setActiveNav(key)
    if (key === 'team') setBreadcrumb(['钉盘', '团队文件', '技术部'])
    else if (key === 'my') setBreadcrumb(['钉盘', '我的文件'])
    else setBreadcrumb(['钉盘', '共享给我'])
  }

  const handleBreadcrumbClick = (idx) => {
    setBreadcrumb(breadcrumb.slice(0, idx + 1))
  }

  const getUser = (id) => state.users?.find(u => u.id === id)

  const folders = driveState.folders || []
  const files = driveState.files || []
  const allItems = [
    ...folders.map(f => ({ ...f, type: 'folder' })),
    ...files.map(f => ({ ...f, type: 'file' }))
  ].filter(item => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f7f8fa' }} onClick={closeContextMenu}>
      {/* Left sidebar */}
      <div style={{
        width: 180, background: 'white', borderRight: '1px solid var(--border)',
        padding: '16px 0', flexShrink: 0
      }}>
        <div style={{ padding: '0 16px 12px', fontWeight: 600, fontSize: 14 }}>钉盘</div>
        {SIDEBAR_ITEMS.map(item => (
          <div
            key={item.key}
            onClick={() => handleNavClick(item.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', cursor: 'pointer', fontSize: 13,
              background: activeNav === item.key ? '#EBF4FF' : 'transparent',
              color: activeNav === item.key ? 'var(--primary)' : 'var(--text-primary)',
              borderRight: activeNav === item.key ? '2px solid var(--primary)' : 'none',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => { if (activeNav !== item.key) e.currentTarget.style.background = '#f5f6f7' }}
            onMouseLeave={e => { if (activeNav !== item.key) e.currentTarget.style.background = 'transparent' }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
        <div style={{ margin: '12px 16px 0', borderTop: '1px solid var(--border)', paddingTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
          <div>已使用 2.3 GB / 100 GB</div>
          <div style={{
            marginTop: 6, height: 4, background: '#e0e0e0', borderRadius: 2
          }}>
            <div style={{ width: '2.3%', height: '100%', background: 'var(--primary)', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{
          background: 'white', borderBottom: '1px solid var(--border)',
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <button
            onClick={handleUpload}
            style={{
              background: 'var(--primary)', color: 'white', border: 'none',
              borderRadius: 6, padding: '7px 16px', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            ⬆ 上传
          </button>
          <button
            onClick={handleCreateFolder}
            style={{
              background: 'white', color: 'var(--text-primary)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '7px 16px', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            📁 新建文件夹
          </button>
          <div style={{ flex: 1 }} />
          <input
            placeholder="搜索文件..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px',
              fontSize: 13, width: 200, outline: 'none'
            }}
          />
        </div>

        {/* Breadcrumb */}
        <div style={{
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--text-secondary)'
        }}>
          {breadcrumb.map((crumb, idx) => (
            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {idx > 0 && <span style={{ color: '#ccc' }}>/</span>}
              <span
                onClick={() => handleBreadcrumbClick(idx)}
                style={{
                  cursor: idx < breadcrumb.length - 1 ? 'pointer' : 'default',
                  color: idx < breadcrumb.length - 1 ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: idx === breadcrumb.length - 1 ? 600 : 400
                }}
              >
                {crumb}
              </span>
            </span>
          ))}
        </div>

        {/* File table */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 500 }}>名称</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 500, width: 100 }}>大小</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 500, width: 160 }}>修改时间</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 500, width: 100 }}>上传者</th>
              </tr>
            </thead>
            <tbody>
              {allItems.map(item => {
                const uploader = getUser(item.uploaderId || state.currentUser?.id)
                return (
                  <tr
                    key={item.id}
                    onContextMenu={e => handleContextMenu(e, item)}
                    style={{ borderBottom: '1px solid #f5f5f5', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>
                        {item.type === 'folder' ? FOLDER_ICON : getFileIcon(item.name)}
                      </span>
                      <span style={{ fontWeight: item.type === 'folder' ? 600 : 400 }}>{item.name}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                      {item.type === 'folder' ? '-' : item.size}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                      {item.modifiedAt ? new Date(item.modifiedAt).toLocaleDateString('zh-CN') : '-'}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                      {uploader?.name || '-'}
                    </td>
                  </tr>
                )
              })}
              {allItems.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {searchQuery ? `未找到包含"${searchQuery}"的文件` : '暂无文件，点击上传按钮上传文件'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed', top: contextMenu.y, left: contextMenu.x,
            background: 'white', border: '1px solid var(--border)', borderRadius: 6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 1000, minWidth: 140,
            padding: '4px 0'
          }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { label: '⬇ 下载', action: handleDownload },
            { label: '✏️ 重命名', action: handleRename },
            { label: '📦 移动', action: handleMove },
            { label: '🔗 分享', action: handleShare },
            { label: '🗑️ 删除', action: handleDelete, danger: true },
          ].map(item => (
            <div
              key={item.label}
              onClick={item.action}
              style={{
                padding: '8px 16px', fontSize: 13, cursor: 'pointer',
                color: item.danger ? '#ff4d4f' : 'var(--text-primary)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f6f7'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* Rename modal */}
      {showRenameModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
          }}
          onClick={() => setShowRenameModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 8, padding: 24, width: 360,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>重命名</div>
            <input
              autoFocus
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmRename() }}
              style={{
                width: '100%', border: '1px solid var(--border)', borderRadius: 6,
                padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setShowRenameModal(null)}
                style={{
                  padding: '7px 16px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'white', cursor: 'pointer', fontSize: 13
                }}
              >取消</button>
              <button
                onClick={confirmRename}
                style={{
                  padding: '7px 16px', borderRadius: 6, border: 'none',
                  background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: 13
                }}
              >确认</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)', color: 'white', padding: '8px 20px',
          borderRadius: 6, fontSize: 13, zIndex: 3000, pointerEvents: 'none'
        }}>{toast}</div>
      )}

      {/* Move modal */}
      {showMoveModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
          }}
          onClick={() => { setShowMoveModal(null); setMoveTargetFolder(null) }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 8, padding: 24, width: 360,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
              移动 "{showMoveModal.name}" 到
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 16 }}>
              {(driveState.folders || []).filter(f => f.id !== showMoveModal.id).map(folder => (
                <div
                  key={folder.id}
                  onClick={() => setMoveTargetFolder(folder)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    cursor: 'pointer',
                    background: moveTargetFolder?.id === folder.id ? '#EBF4FF' : 'transparent'
                  }}
                  onMouseEnter={e => { if (moveTargetFolder?.id !== folder.id) e.currentTarget.style.background = '#f5f6f7' }}
                  onMouseLeave={e => { if (moveTargetFolder?.id !== folder.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 18 }}>{FOLDER_ICON}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{folder.name}</span>
                  {moveTargetFolder?.id === folder.id && <span style={{ marginLeft: 'auto', color: 'var(--primary)' }}>✓</span>}
                </div>
              ))}
              {(driveState.folders || []).filter(f => f.id !== showMoveModal.id).length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                  暂无可用文件夹
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => { setShowMoveModal(null); setMoveTargetFolder(null) }}
                style={{
                  padding: '7px 16px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'white', cursor: 'pointer', fontSize: 13
                }}
              >取消</button>
              <button
                onClick={confirmMove}
                disabled={!moveTargetFolder}
                style={{
                  padding: '7px 16px', borderRadius: 6, border: 'none',
                  background: moveTargetFolder ? 'var(--primary)' : '#ccc',
                  color: 'white', cursor: moveTargetFolder ? 'pointer' : 'default', fontSize: 13
                }}
              >移动</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
