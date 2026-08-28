import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Folder, File, FolderPlus, Upload, ChevronRight, ChevronDown, FileText, Image, Code, FileSpreadsheet } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Files.css';

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getFileIcon(contentType) {
  if (!contentType) return <File size={16} />;
  if (contentType.includes('pdf')) return <FileText size={16} color="#EE0612" />;
  if (contentType.includes('image')) return <Image size={16} color="#0B874B" />;
  if (contentType.includes('python') || contentType.includes('javascript')) return <Code size={16} color="#FC5E13" />;
  if (contentType.includes('presentation') || contentType.includes('powerpoint')) return <FileSpreadsheet size={16} color="#0374B5" />;
  return <File size={16} />;
}

export default function Files() {
  const { courseId } = useParams();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useRef(null);

  const courseFolders = state.folders.filter(f => f.course_id === cid);
  const courseFiles = state.files.filter(f => f.course_id === cid);

  const rootFolder = courseFolders.find(f => f.parent_folder_id === null);

  const getSubFolders = (parentId) => courseFolders.filter(f => f.parent_folder_id === parentId);
  const getFilesInFolder = (folderId) => courseFiles.filter(f => f.folder_id === folderId);

  const activeFolderId = selectedFolderId || (rootFolder ? rootFolder.id : null);
  const activeFolder = courseFolders.find(f => f.id === activeFolderId);
  const activeSubFolders = activeFolderId ? getSubFolders(activeFolderId) : [];
  const activeFiles = activeFolderId ? getFilesInFolder(activeFolderId) : [];

  const toggleExpand = (folderId) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: Math.max(0, ...state.folders.map(f => f.id)) + 1,
      course_id: cid,
      name: newFolderName.trim(),
      parent_folder_id: activeFolderId,
      position: activeSubFolders.length + 1,
      files_count: 0,
      folders_count: 0
    };
    setState(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder]
    }));
    setShowNewFolder(false);
    setNewFolderName('');
  };

  const handleUploadFile = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    const maxId = Math.max(0, ...state.files.map(f => f.id));
    const newFiles = selectedFiles.map((file, i) => ({
      id: maxId + i + 1,
      course_id: cid,
      display_name: file.name,
      filename: file.name,
      content_type: file.type || 'application/octet-stream',
      size: file.size,
      folder_id: activeFolderId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      url: '#'
    }));
    setState(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    // Reset so the same file can be re-uploaded
    e.target.value = '';
  };

  const renderFolderTree = (parentId, depth = 0) => {
    const folders = getSubFolders(parentId);
    return folders.map(folder => {
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = folder.id === activeFolderId;
      const hasChildren = getSubFolders(folder.id).length > 0;
      return (
        <div key={folder.id}>
          <div
            className={`files-tree-item ${isSelected ? 'selected' : ''}`}
            style={{ paddingLeft: depth * 16 + 8 }}
            onClick={() => { setSelectedFolderId(folder.id); }}
          >
            {hasChildren ? (
              <button className="files-tree-toggle" onClick={e => { e.stopPropagation(); toggleExpand(folder.id); }}>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="files-tree-spacer" />
            )}
            <Folder size={14} className="files-tree-icon" />
            <span className="files-tree-name">{folder.name}</span>
          </div>
          {isExpanded && renderFolderTree(folder.id, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="files-page">
      <div className="files-header">
        <h1>Files</h1>
        <div className="files-actions">
          <button className="btn btn-secondary" onClick={() => setShowNewFolder(true)}>
            <FolderPlus size={16} /> Folder
          </button>
          <button className="btn btn-primary" onClick={handleUploadFile}>
            <Upload size={16} /> Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
        </div>
      </div>

      <div className="files-layout">
        {/* Folder Tree */}
        <div className="files-tree-panel">
          {rootFolder && (
            <div
              className={`files-tree-item ${activeFolderId === rootFolder.id ? 'selected' : ''}`}
              onClick={() => setSelectedFolderId(rootFolder.id)}
            >
              <button className="files-tree-toggle" onClick={e => { e.stopPropagation(); toggleExpand(rootFolder.id); }}>
                {expandedFolders.has(rootFolder.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <Folder size={14} className="files-tree-icon" />
              <span className="files-tree-name">{rootFolder.name}</span>
            </div>
          )}
          {rootFolder && expandedFolders.has(rootFolder.id) && renderFolderTree(rootFolder.id, 1)}
        </div>

        {/* File List */}
        <div className="files-list-panel">
          {activeFolder && (
            <div className="files-breadcrumb">
              <span>{activeFolder.name}</span>
            </div>
          )}

          {showNewFolder && (
            <div className="files-new-folder">
              <Folder size={16} />
              <input
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowNewFolder(false); }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleCreateFolder}>Create</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowNewFolder(false)}>Cancel</button>
            </div>
          )}

          <table className="files-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date Created</th>
                <th>Date Modified</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {activeSubFolders.map(folder => (
                <tr key={`folder-${folder.id}`} className="files-row-folder" onClick={() => { setSelectedFolderId(folder.id); setExpandedFolders(prev => new Set([...prev, folder.id])); }}>
                  <td className="files-name-cell">
                    <Folder size={16} className="files-icon-folder" />
                    <span>{folder.name}</span>
                  </td>
                  <td className="files-date">—</td>
                  <td className="files-date">—</td>
                  <td className="files-size">—</td>
                </tr>
              ))}
              {activeFiles.map(file => (
                <tr key={`file-${file.id}`}>
                  <td className="files-name-cell">
                    {getFileIcon(file.content_type)}
                    <span>{file.display_name}</span>
                  </td>
                  <td className="files-date">{formatDate(file.created_at)}</td>
                  <td className="files-date">{formatDate(file.updated_at)}</td>
                  <td className="files-size">{formatSize(file.size)}</td>
                </tr>
              ))}
              {activeSubFolders.length === 0 && activeFiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="files-empty">This folder is empty.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
