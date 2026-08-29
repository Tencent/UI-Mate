import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  FileText,
  LayoutTemplate,
  CheckSquare,
  Users,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
  MoreHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { showToast } from './Toast';

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { state, addFolder, updateFolder, deleteFolder } = useApp();
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({ 'folder-1': true, 'folder-5': true });
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { folderId, x, y }
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [creatingSubfolderId, setCreatingSubfolderId] = useState(null);
  const [newSubfolderName, setNewSubfolderName] = useState('');
  const contextMenuRef = useRef(null);

  const sid = searchParams.get('sid');
  const query = sid ? `?sid=${sid}` : '';

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navTo = (path) => navigate(path + query);

  const isActive = (path) => location.pathname.startsWith(path);

  const rootFolders = state.folders.filter(f => f.parentId === null);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleFolderClick = (folderId) => {
    setSelectedFolderId(folderId === selectedFolderId ? null : folderId);
    navigate(`/contracts${query}`, { state: { folderId: folderId === selectedFolderId ? null : folderId } });
  };

  const handleContextMenuAction = (action, folder) => {
    setContextMenu(null);
    if (action === 'rename') {
      setRenamingId(folder.id);
      setRenameValue(folder.name);
    } else if (action === 'subfolder') {
      setCreatingSubfolderId(folder.id);
      setNewSubfolderName('');
      setExpandedFolders(prev => ({ ...prev, [folder.id]: true }));
    } else if (action === 'delete') {
      deleteFolder(folder.id);
      showToast(`Deleted folder "${folder.name}"`, 'success');
    }
  };

  const commitRename = (folder) => {
    if (renameValue.trim()) {
      updateFolder({ id: folder.id, name: renameValue.trim() });
      showToast('Folder renamed', 'success');
    }
    setRenamingId(null);
  };

  const commitNewSubfolder = (parentId) => {
    if (newSubfolderName.trim()) {
      addFolder({ name: newSubfolderName.trim(), parentId, color: '#6B7280' });
      showToast(`Subfolder "${newSubfolderName.trim()}" created`, 'success');
    }
    setCreatingSubfolderId(null);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const renderFolderTree = (parentId, depth = 0) => {
    const children = state.folders.filter(f => f.parentId === parentId);
    if (children.length === 0 && creatingSubfolderId !== parentId) return null;
    return (
      <>
        {children.map(folder => {
          const hasChildren = state.folders.some(f => f.parentId === folder.id);
          const isExpanded = expandedFolders[folder.id];
          const isSelected = selectedFolderId === folder.id;
          const isRenaming = renamingId === folder.id;
          return (
            <div key={folder.id}>
              <div
                className={`sidebar-folder-item ${isSelected ? 'active' : ''}`}
                style={{ paddingLeft: `${12 + depth * 16}px`, position: 'relative' }}
                onClick={() => {
                  if (isRenaming) return;
                  if (hasChildren) toggleFolder(folder.id);
                  handleFolderClick(folder.id);
                }}
              >
                {hasChildren ? (
                  isExpanded ? <ChevronDown size={12} style={{ flexShrink: 0 }} /> : <ChevronRight size={12} style={{ flexShrink: 0 }} />
                ) : <span style={{ width: 12, flexShrink: 0 }} />}
                <FolderOpen size={14} style={{ flexShrink: 0, color: folder.color || '#6B7280' }} />
                {!collapsed && (
                  isRenaming ? (
                    <input
                      className="input"
                      style={{ height: 22, fontSize: 12, padding: '0 6px', flex: 1 }}
                      value={renameValue}
                      autoFocus
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => commitRename(folder)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitRename(folder);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="truncate" style={{ flex: 1 }}>{folder.name}</span>
                  )
                )}
                {!collapsed && !isRenaming && (
                  <button
                    className="btn btn-ghost btn-icon folder-menu-btn"
                    style={{ width: 20, height: 20, padding: 0, marginLeft: 'auto', opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }}
                    onClick={e => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setContextMenu({ folderId: folder.id, folder, x: rect.right + 4, y: rect.top });
                    }}
                    title="Folder options"
                  >
                    <MoreHorizontal size={12} />
                  </button>
                )}
              </div>
              {isExpanded && hasChildren && renderFolderTree(folder.id, depth + 1)}
              {creatingSubfolderId === folder.id && (
                <div style={{ paddingLeft: `${12 + (depth + 1) * 16}px`, display: 'flex', alignItems: 'center', gap: 6, padding: `4px ${12 + (depth + 1) * 16}px` }}>
                  <Folder size={14} style={{ color: '#6B7280', flexShrink: 0 }} />
                  <input
                    className="input"
                    style={{ height: 22, fontSize: 12, padding: '0 6px', flex: 1 }}
                    placeholder="Subfolder name"
                    value={newSubfolderName}
                    autoFocus
                    onChange={e => setNewSubfolderName(e.target.value)}
                    onBlur={() => commitNewSubfolder(folder.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitNewSubfolder(folder.id);
                      if (e.key === 'Escape') setCreatingSubfolderId(null);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
        {creatingSubfolderId === parentId && parentId !== null && null}
      </>
    );
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navTo('/contracts')}>
        <FileText size={20} color="#1C00FF" />
        {!collapsed && <span className="sidebar-logo-text">Xontractbook</span>}
      </div>

      {/* New Contract Button */}
      <div className="sidebar-new-btn-wrap">
        <button
          className={`btn btn-primary sidebar-new-btn ${collapsed ? 'btn-icon' : ''}`}
          onClick={() => {
            // Will be handled by modal
            window.dispatchEvent(new CustomEvent('open-new-contract-modal'));
          }}
        >
          <Plus size={16} />
          {!collapsed && <span>New Contract</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div
          className={`sidebar-item ${isActive('/contracts') ? 'active' : ''}`}
          onClick={() => navTo('/contracts')}
          title={collapsed ? 'Contracts' : ''}
        >
          <FileText size={18} />
          {!collapsed && <span>Contracts</span>}
        </div>
        <div
          className={`sidebar-item ${isActive('/templates') ? 'active' : ''}`}
          onClick={() => navTo('/templates')}
          title={collapsed ? 'Templates' : ''}
        >
          <LayoutTemplate size={18} />
          {!collapsed && <span>Templates</span>}
        </div>
        <div
          className={`sidebar-item ${isActive('/tasks') ? 'active' : ''}`}
          onClick={() => navTo('/tasks')}
          title={collapsed ? 'Tasks' : ''}
        >
          <CheckSquare size={18} />
          {!collapsed && <span>Tasks</span>}
        </div>
        <div
          className={`sidebar-item ${isActive('/contacts') ? 'active' : ''}`}
          onClick={() => navTo('/contacts')}
          title={collapsed ? 'Contacts' : ''}
        >
          <Users size={18} />
          {!collapsed && <span>Contacts</span>}
        </div>
      </nav>

      {/* Folders Section */}
      {!collapsed && (
        <div className="sidebar-folders">
          <div
            className="sidebar-section-header"
            onClick={() => setFoldersExpanded(!foldersExpanded)}
          >
            <span>Folders</span>
            {foldersExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {foldersExpanded && (
            <div className="sidebar-folder-tree">
              {renderFolderTree(null)}
            </div>
          )}
        </div>
      )}

      {/* Bottom */}
      <div className="sidebar-bottom">
        <div className="sidebar-divider" />
        <div
          className={`sidebar-item ${isActive('/settings') ? 'active' : ''}`}
          onClick={() => navTo('/settings')}
          title={collapsed ? 'Settings' : ''}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </div>
        {!collapsed && (
          <div className="sidebar-user">
            <div className="avatar avatar-md" style={{ background: '#1C00FF' }}>
              {getInitials(state.currentUser?.firstName, state.currentUser?.lastName)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {state.currentUser?.firstName} {state.currentUser?.lastName}
              </div>
              <div className="sidebar-user-company">{state.currentUser?.company}</div>
            </div>
          </div>
        )}
      </div>

      {/* Folder context menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="dropdown-menu"
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999, minWidth: 160 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="dropdown-item" onClick={() => handleContextMenuAction('rename', contextMenu.folder)}>Rename</button>
          <button className="dropdown-item" onClick={() => handleContextMenuAction('subfolder', contextMenu.folder)}>Create Subfolder</button>
          <div className="dropdown-divider" />
          <button className="dropdown-item danger" onClick={() => handleContextMenuAction('delete', contextMenu.folder)}>Delete</button>
        </div>
      )}

      <style>{`
        .sidebar-folder-item:hover .folder-menu-btn { opacity: 1 !important; }
      `}</style>
    </aside>
  );
}
