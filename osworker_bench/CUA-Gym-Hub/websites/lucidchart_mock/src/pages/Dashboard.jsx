import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import {
  Bell, ChevronDown, ChevronRight, Clock, Star, Search, Plus,
  FolderPlus, Upload, Grid3x3, List,
  Trash2, Copy, Edit3, ExternalLink, FolderInput, X
} from 'lucide-react';

function relativeTime(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

export default function Dashboard() {
  const {
    state, addDocument, updateDocument, deleteDocument, addFolder, addPage, setUI
  } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [contextMenu, setContextMenu] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({ 'folder-root': true });
  const [renamingDoc, setRenamingDoc] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [newFolderName, setNewFolderName] = useState(null);
  const [activeHeaderTab, setActiveHeaderTab] = useState('DOCUMENTS');

  const { folders, documents, pages, currentUser, users, ui, templates } = state;
  const activeFolderId = ui.activeFolderId;
  const viewMode = ui.dashboardViewMode;
  const searchQuery = ui.dashboardSearchQuery;

  const query = searchParams.toString();
  const navTo = (path) => navigate(query ? `${path}?${query}` : path);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const rootFolders = folders.filter(f => f.parentId === null);
  const getSubFolders = (parentId) => folders.filter(f => f.parentId === parentId);

  const getDocumentsForFolder = () => {
    if (searchQuery) {
      return documents.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        d.folderId !== 'folder-trash'
      );
    }
    if (activeFolderId === 'folder-shared') {
      return documents.filter(d =>
        d.ownerId !== currentUser.id &&
        d.sharedWith.some(s => s.userId === currentUser.id)
      );
    }
    if (activeFolderId === 'folder-trash') {
      return documents.filter(d => d.folderId === 'folder-trash');
    }
    if (activeFolderId === 'starred') {
      return documents.filter(d => d.starred && d.folderId !== 'folder-trash');
    }
    if (activeFolderId === 'recent') {
      return [...documents]
        .filter(d => d.folderId !== 'folder-trash')
        .sort((a, b) => new Date(b.lastOpenedAt) - new Date(a.lastOpenedAt))
        .slice(0, 10);
    }
    return documents.filter(d => d.folderId === activeFolderId);
  };

  const displayDocs = getDocumentsForFolder();
  const childFolders = folders.filter(f => f.parentId === activeFolderId);

  const createNewDocument = (title = 'Untitled Diagram') => {
    const docId = `doc-${uuidv4().slice(0, 8)}`;
    const pageId = `page-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    addDocument({
      id: docId, title, folderId: activeFolderId === 'starred' || activeFolderId === 'recent' ? 'folder-root' : activeFolderId,
      ownerId: currentUser.id, starred: false, status: 'draft', thumbnailUrl: null,
      createdAt: now, updatedAt: now, lastOpenedAt: now,
      sharedWith: [], pageOrder: [pageId]
    });
    addPage({
      id: pageId, documentId: docId, name: 'Page 1', order: 0,
      width: 1200, height: 900, gridVisible: true, gridSize: 20, backgroundColor: '#FFFFFF'
    });
    navTo(`/editor/${docId}`);
  };

  const handleCreateFolder = () => {
    setNewFolderName('New Folder');
  };

  const commitNewFolder = () => {
    if (newFolderName && newFolderName.trim()) {
      const folderId = `folder-${uuidv4().slice(0, 8)}`;
      const now = new Date().toISOString();
      addFolder({
        id: folderId, name: newFolderName.trim(),
        parentId: activeFolderId === 'folder-root' ? 'folder-root' : activeFolderId,
        type: 'my_documents', createdAt: now, updatedAt: now
      });
    }
    setNewFolderName(null);
  };

  const handleContextMenu = (e, doc) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, doc });
  };

  const handleStarToggle = (doc) => {
    updateDocument(doc.id, { starred: !doc.starred });
  };

  const handleDuplicate = (doc) => {
    const docId = `doc-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const oldPages = pages.filter(p => p.documentId === doc.id);
    const newPageIds = oldPages.map(() => `page-${uuidv4().slice(0, 8)}`);
    addDocument({
      ...doc, id: docId, title: `${doc.title} (Copy)`,
      createdAt: now, updatedAt: now, lastOpenedAt: now,
      pageOrder: newPageIds
    });
    oldPages.forEach((p, i) => {
      addPage({ ...p, id: newPageIds[i], documentId: docId });
    });
  };

  const handleDelete = (doc) => {
    if (doc.folderId === 'folder-trash') {
      deleteDocument(doc.id);
    } else {
      updateDocument(doc.id, { folderId: 'folder-trash' });
    }
  };

  const handleRestore = (doc) => {
    updateDocument(doc.id, { folderId: 'folder-root' });
  };

  const handleRename = (doc) => {
    setRenamingDoc(doc.id);
    setRenameValue(doc.title);
  };

  const commitRename = () => {
    if (renamingDoc && renameValue.trim()) {
      updateDocument(renamingDoc, { title: renameValue.trim() });
    }
    setRenamingDoc(null);
  };

  const getUserById = (id) => {
    if (id === currentUser.id) return currentUser;
    return users.find(u => u.id === id);
  };

  const sidebarItem = (folder, depth = 0) => {
    const isActive = activeFolderId === folder.id;
    const children = getSubFolders(folder.id);
    const isExpanded = expandedFolders[folder.id];
    const sharedCount = folder.type === 'shared' ? documents.filter(d => d.sharedWith.some(s => s.userId === currentUser.id) && d.ownerId !== currentUser.id).length : 0;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center px-4 py-2 cursor-pointer text-sm text-white/90 hover:bg-white/10 ${isActive ? 'bg-white/15 font-semibold' : ''}`}
          style={{ paddingLeft: `${16 + depth * 16}px`, height: '36px' }}
          onClick={() => {
            setUI({ activeFolderId: folder.id, dashboardSearchQuery: '' });
            if (children.length > 0) toggleFolder(folder.id);
          }}
        >
          {children.length > 0 ? (
            <span className="mr-1 text-xs">{isExpanded ? '\u25BE' : '\u25B8'}</span>
          ) : (
            <span className="mr-1 text-xs opacity-0">{'\u25B8'}</span>
          )}
          <span className="truncate">{folder.name}</span>
          {folder.type === 'shared' && sharedCount > 0 && (
            <span className="ml-1 text-xs opacity-70">({sharedCount})</span>
          )}
        </div>
        {isExpanded && children.map(child => sidebarItem(child, depth + 1))}
      </div>
    );
  };

  const templateIcons = {
    blank: (
      <div className="w-full h-full flex items-center justify-center">
        <Plus size={32} className="text-orange-500" />
      </div>
    ),
    flowchart: (
      <svg viewBox="0 0 80 70" className="w-12 h-12">
        <rect x="20" y="2" width="40" height="16" rx="2" fill="none" stroke="#4A86C8" strokeWidth="1.5" />
        <line x1="40" y1="18" x2="40" y2="28" stroke="#666" strokeWidth="1" />
        <polygon points="40,28 30,44 50,44" fill="none" stroke="#4A86C8" strokeWidth="1.5" />
        <line x1="40" y1="44" x2="40" y2="54" stroke="#666" strokeWidth="1" />
        <rect x="20" y="54" width="40" height="14" rx="7" fill="none" stroke="#4A86C8" strokeWidth="1.5" />
      </svg>
    ),
    'org-chart': (
      <svg viewBox="0 0 80 70" className="w-12 h-12">
        <rect x="25" y="2" width="30" height="14" rx="2" fill="#4A86C8" opacity="0.3" stroke="#4A86C8" strokeWidth="1" />
        <line x1="40" y1="16" x2="40" y2="26" stroke="#666" strokeWidth="1" />
        <line x1="15" y1="26" x2="65" y2="26" stroke="#666" strokeWidth="1" />
        <line x1="15" y1="26" x2="15" y2="34" stroke="#666" strokeWidth="1" />
        <line x1="40" y1="26" x2="40" y2="34" stroke="#666" strokeWidth="1" />
        <line x1="65" y1="26" x2="65" y2="34" stroke="#666" strokeWidth="1" />
        <rect x="5" y="34" width="20" height="12" rx="1" fill="none" stroke="#4A86C8" strokeWidth="1" />
        <rect x="30" y="34" width="20" height="12" rx="1" fill="none" stroke="#4A86C8" strokeWidth="1" />
        <rect x="55" y="34" width="20" height="12" rx="1" fill="none" stroke="#4A86C8" strokeWidth="1" />
      </svg>
    ),
    'mind-map': (
      <svg viewBox="0 0 80 70" className="w-12 h-12">
        <ellipse cx="40" cy="35" rx="16" ry="10" fill="#4A86C8" opacity="0.3" stroke="#4A86C8" strokeWidth="1" />
        <line x1="24" y1="35" x2="10" y2="20" stroke="#666" strokeWidth="1" />
        <line x1="24" y1="35" x2="10" y2="50" stroke="#666" strokeWidth="1" />
        <line x1="56" y1="35" x2="70" y2="15" stroke="#666" strokeWidth="1" />
        <line x1="56" y1="35" x2="70" y2="55" stroke="#666" strokeWidth="1" />
        <circle cx="10" cy="20" r="5" fill="none" stroke="#E74C3C" strokeWidth="1" />
        <circle cx="10" cy="50" r="5" fill="none" stroke="#2ECC71" strokeWidth="1" />
        <circle cx="70" cy="15" r="5" fill="none" stroke="#F39C12" strokeWidth="1" />
        <circle cx="70" cy="55" r="5" fill="none" stroke="#9B59B6" strokeWidth="1" />
      </svg>
    ),
    education: (
      <svg viewBox="0 0 80 70" className="w-12 h-12">
        <polygon points="40,10 10,28 40,46 70,28" fill="#4A86C8" opacity="0.2" stroke="#4A86C8" strokeWidth="1.5" />
        <line x1="40" y1="46" x2="40" y2="62" stroke="#666" strokeWidth="1" />
        <line x1="20" y1="36" x2="20" y2="52" stroke="#666" strokeWidth="1" />
        <line x1="60" y1="36" x2="60" y2="52" stroke="#666" strokeWidth="1" />
        <path d="M20,52 Q40,60 60,52" fill="none" stroke="#666" strokeWidth="1" />
      </svg>
    ),
    business: (
      <svg viewBox="0 0 80 70" className="w-12 h-12">
        <rect x="5" y="45" width="12" height="20" fill="#4A86C8" opacity="0.5" />
        <rect x="22" y="30" width="12" height="35" fill="#4A86C8" opacity="0.6" />
        <rect x="39" y="20" width="12" height="45" fill="#4A86C8" opacity="0.7" />
        <rect x="56" y="10" width="12" height="55" fill="#4A86C8" opacity="0.8" />
        <line x1="3" y1="65" x2="75" y2="65" stroke="#333" strokeWidth="1" />
      </svg>
    )
  };

  return (
    <div className="h-screen flex flex-col" style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}>
      {/* Header */}
      <header className="h-[50px] flex items-center justify-between px-5 flex-shrink-0" style={{ backgroundColor: '#2D2D2D' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28">
              <rect x="4" y="4" width="20" height="20" rx="3" fill="#F96B13" />
              <rect x="8" y="8" width="12" height="12" rx="1" fill="white" opacity="0.9" />
            </svg>
            <span className="text-white font-semibold text-lg tracking-tight">Xucidchart</span>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <nav className="flex items-center gap-10">
            {['DOCUMENTS', 'INTEGRATIONS', 'TEAM', 'HELP'].map(tab => (
              <button
                key={tab}
                className={`text-xs font-medium tracking-widest ${tab === activeHeaderTab ? 'text-white border-b-2 border-white pb-1' : 'text-white/60 hover:text-white/90'}`}
                onClick={() => setActiveHeaderTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell size={18} className="text-white/70 cursor-pointer hover:text-white" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold text-white" style={{ backgroundColor: '#F96B13' }}>18</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: currentUser.avatarColor }}>
                {currentUser.avatar}
              </div>
              <span className="text-white/70 text-xs hidden lg:inline">{currentUser.email}</span>
              <ChevronDown size={14} className="text-white/50" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — only shown in DOCUMENTS tab */}
        {activeHeaderTab === 'DOCUMENTS' && (
        <aside className="w-[220px] flex-shrink-0 flex flex-col overflow-y-auto" style={{ backgroundColor: '#3D3D3D' }}>
          <div className="py-2">
            {rootFolders.filter(f => f.type === 'my_documents').map(f => sidebarItem(f))}
            {rootFolders.filter(f => f.type === 'shared').map(f => sidebarItem(f))}
            {rootFolders.filter(f => f.type === 'team').map(f => sidebarItem(f))}
            {rootFolders.filter(f => f.type === 'trash').map(f => sidebarItem(f))}
          </div>
          <div className="border-t border-white/10 my-1" />
          <div>
            <div
              className={`flex items-center px-4 py-2 cursor-pointer text-sm text-white/90 hover:bg-white/10 gap-2 ${activeFolderId === 'recent' ? 'bg-white/15 font-semibold' : ''}`}
              style={{ height: '36px' }}
              onClick={() => setUI({ activeFolderId: 'recent', dashboardSearchQuery: '' })}
            >
              <Clock size={14} className="opacity-70" />
              <span>Recent Documents</span>
            </div>
            <div
              className={`flex items-center px-4 py-2 cursor-pointer text-sm text-white/90 hover:bg-white/10 gap-2 ${activeFolderId === 'starred' ? 'bg-white/15 font-semibold' : ''}`}
              style={{ height: '36px' }}
              onClick={() => setUI({ activeFolderId: 'starred', dashboardSearchQuery: '' })}
            >
              <Star size={14} className="opacity-70" />
              <span>Starred Items</span>
            </div>
          </div>
          <div className="border-t border-white/10 my-1" />
          <div
            className={`flex items-center px-4 py-2 cursor-pointer text-sm text-white/90 hover:bg-white/10 gap-2 ${activeFolderId === 'search' ? 'bg-white/15 font-semibold' : ''}`}
            style={{ height: '36px' }}
            onClick={() => setUI({ activeFolderId: 'search' })}
          >
            <Search size={14} className="opacity-70" />
            <span>Search Results</span>
          </div>
        </aside>
        )}

        {/* Non-documents tabs */}
        {activeHeaderTab === 'INTEGRATIONS' && (
          <div className="flex-1 overflow-y-auto p-10 bg-white">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Integrations</h2>
            <p className="text-gray-500 mb-6">Connect Xucidchart with your favorite tools to streamline your workflow.</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Google Workspace', desc: 'Insert diagrams into Google Docs, Slides & more.', color: '#4285F4' },
                { name: 'Atlassian (Jira & Confluence)', desc: 'Embed and sync diagrams with Jira and Confluence.', color: '#0052CC' },
                { name: 'Microsoft Teams', desc: 'Share and collaborate on diagrams inside Teams.', color: '#6264A7' },
                { name: 'Slack', desc: 'Link Xucidchart diagrams directly in Slack channels.', color: '#4A154B' },
                { name: 'Salesforce', desc: 'Visualize Salesforce objects and relationships.', color: '#00A1E0' },
                { name: 'GitHub', desc: 'Connect diagrams to code repositories and pull requests.', color: '#24292E' },
              ].map(intg => (
                <div key={intg.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3" style={{ backgroundColor: intg.color }}>
                    {intg.name[0]}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{intg.name}</h3>
                  <p className="text-xs text-gray-500">{intg.desc}</p>
                  <button className="mt-3 text-xs font-medium px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">Connect</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeHeaderTab === 'TEAM' && (
          <div className="flex-1 overflow-y-auto p-10 bg-white">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Team</h2>
            <p className="text-gray-500 mb-6">Manage your team members and collaboration settings.</p>
            <div className="max-w-2xl">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-sm mb-3">Team Members</h3>
                {[state.currentUser, ...(state.users || [])].map(u => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: u.avatarColor }}>
                        {u.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{u.name} {u.id === state.currentUser.id && <span className="text-xs text-gray-400">(you)</span>}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 capitalize">{u.role || 'member'}</span>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <Plus size={14} /> Invite team member
              </button>
            </div>
          </div>
        )}
        {activeHeaderTab === 'HELP' && (
          <div className="flex-1 overflow-y-auto p-10 bg-white">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Help & Support</h2>
            <p className="text-gray-500 mb-6">Find answers, tutorials, and get in touch with our support team.</p>
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              {[
                { title: 'Getting Started Guide', desc: 'Learn the basics of creating diagrams in Xucidchart.' },
                { title: 'Keyboard Shortcuts', desc: 'Speed up your workflow with keyboard shortcuts.' },
                { title: 'Shape Libraries', desc: 'Explore the full library of shapes and templates.' },
                { title: 'Contact Support', desc: 'Reach our support team for personalized help.' },
              ].map(item => (
                <div key={item.title} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeHeaderTab === 'DOCUMENTS' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Template Banner */}
          <div className="flex-shrink-0 px-6 py-4" style={{ backgroundColor: '#F5F5F5' }}>
            <div className="flex items-center gap-4 overflow-x-auto">
              {templates.map(t => (
                <div
                  key={t.id}
                  className="flex flex-col items-center cursor-pointer group flex-shrink-0"
                  onClick={() => createNewDocument(t.name === 'Blank' ? 'Untitled Diagram' : `${t.name} Diagram`)}
                >
                  <div className="w-[100px] h-[80px] bg-white rounded-lg border border-gray-200 flex items-center justify-center group-hover:border-blue-400 group-hover:shadow-md transition-all mb-1.5">
                    {templateIcons[t.icon] || templateIcons.blank}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{t.name}</span>
                </div>
              ))}
              <div className="flex-shrink-0 ml-4">
                <button className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 whitespace-nowrap">
                  More Templates
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-2 border-b border-gray-200 h-[48px]">
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 text-white text-sm font-medium px-4 py-1.5 rounded hover:opacity-90"
                style={{ backgroundColor: '#F96B13' }}
                onClick={() => createNewDocument()}
              >
                <Plus size={16} />
                Document
              </button>
              <button
                className="flex items-center gap-2 text-white text-sm font-medium px-4 py-1.5 rounded"
                style={{ backgroundColor: '#4A86C8' }}
                onClick={handleCreateFolder}
              >
                <FolderPlus size={16} />
                Folder
              </button>
              <button className="flex items-center gap-2 text-gray-600 text-sm font-medium px-4 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.lucid,.xml,.json,.svg,.vsdx';
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const docId = `doc-${uuidv4().slice(0, 8)}`;
                    const pageId = `page-${uuidv4().slice(0, 8)}`;
                    const now = new Date().toISOString();
                    addDocument({
                      id: docId, title: file.name.replace(/\.[^.]+$/, ''),
                      folderId: activeFolderId === 'starred' || activeFolderId === 'recent' ? 'folder-root' : activeFolderId,
                      ownerId: currentUser.id, starred: false, status: 'draft', thumbnailUrl: null,
                      createdAt: now, updatedAt: now, lastOpenedAt: now,
                      sharedWith: [], pageOrder: [pageId]
                    });
                    addPage({
                      id: pageId, documentId: docId, name: 'Page 1', order: 0,
                      width: 1200, height: 900, gridVisible: true, gridSize: 20, backgroundColor: '#FFFFFF'
                    });
                    navTo(`/editor/${docId}`);
                  };
                  input.click();
                }}
              >
                <Upload size={14} />
                Import
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setUI({ dashboardSearchQuery: e.target.value });
                    if (e.target.value) setUI({ activeFolderId: 'search', dashboardSearchQuery: e.target.value });
                  }}
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm w-48 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="flex items-center gap-1 border border-gray-200 rounded">
                <button
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setUI({ dashboardViewMode: 'grid' })}
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setUI({ dashboardViewMode: 'list' })}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* New Folder Inline Input */}
          {newFolderName !== null && (
            <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-3">
              <FolderPlus size={16} className="text-blue-600" />
              <input
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitNewFolder(); if (e.key === 'Escape') setNewFolderName(null); }}
                onBlur={commitNewFolder}
                className="border border-blue-300 rounded px-2 py-1 text-sm flex-1 max-w-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Document Grid/List */}
          <div className="flex-1 overflow-y-auto p-6">
            {viewMode === 'grid' ? (
              <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {childFolders.map(f => (
                  <div
                    key={f.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
                    onDoubleClick={() => setUI({ activeFolderId: f.id, dashboardSearchQuery: '' })}
                  >
                    <div className="h-[130px] flex items-center justify-center" style={{ backgroundColor: '#F0F0F0' }}>
                      <FolderPlus size={40} className="text-gray-400" />
                    </div>
                    <div className="px-3 py-2.5 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Folder</p>
                    </div>
                  </div>
                ))}
                {displayDocs.map(doc => {
                  const owner = getUserById(doc.ownerId);
                  return (
                    <div
                      key={doc.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group"
                      onClick={() => navTo(`/editor/${doc.id}`)}
                      onContextMenu={(e) => handleContextMenu(e, doc)}
                    >
                      <div className="h-[130px] flex items-center justify-center relative" style={{ backgroundColor: '#F0F0F0' }}>
                        <div className="text-gray-300 text-xs">
                          {doc.status === 'published' && (
                            <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-medium">Published</span>
                          )}
                          <svg width="60" height="45" viewBox="0 0 60 45">
                            <rect x="5" y="2" width="20" height="12" rx="1" fill="none" stroke="#ccc" strokeWidth="1" />
                            <rect x="35" y="2" width="20" height="12" rx="1" fill="none" stroke="#ccc" strokeWidth="1" />
                            <line x1="25" y1="8" x2="35" y2="8" stroke="#ccc" strokeWidth="1" />
                            <rect x="15" y="28" width="30" height="14" rx="1" fill="none" stroke="#ccc" strokeWidth="1" />
                            <line x1="30" y1="14" x2="30" y2="28" stroke="#ccc" strokeWidth="1" />
                          </svg>
                        </div>
                      </div>
                      <div className="px-3 py-2.5 border-t border-gray-100 flex items-center justify-between">
                        <div className="min-w-0">
                          {renamingDoc === doc.id ? (
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingDoc(null); }}
                              onBlur={commitRename}
                              onClick={e => e.stopPropagation()}
                              className="text-sm font-medium border border-blue-400 rounded px-1 py-0.5 w-full focus:outline-none"
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">{relativeTime(doc.updatedAt)}</p>
                        </div>
                        <button
                          className={`flex-shrink-0 ml-2 ${doc.starred ? 'text-orange-400' : 'text-gray-300 opacity-0 group-hover:opacity-100'} hover:text-orange-400 transition-all`}
                          onClick={(e) => { e.stopPropagation(); handleStarToggle(doc); }}
                        >
                          <Star size={16} fill={doc.starred ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {displayDocs.length === 0 && childFolders.length === 0 && (
                  <div className="col-span-full text-center py-16 text-gray-400">
                    <p className="text-lg mb-2">No documents here</p>
                    <p className="text-sm">Click "+ Document" to create one</p>
                  </div>
                )}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500 font-medium">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Owner</th>
                    <th className="pb-2 pr-4">Last Modified</th>
                    <th className="pb-2">Shared with</th>
                  </tr>
                </thead>
                <tbody>
                  {displayDocs.map(doc => {
                    const owner = getUserById(doc.ownerId);
                    return (
                      <tr
                        key={doc.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer h-[40px]"
                        onClick={() => navTo(`/editor/${doc.id}`)}
                        onContextMenu={(e) => handleContextMenu(e, doc)}
                      >
                        <td className="pr-4 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              className={`flex-shrink-0 ${doc.starred ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
                              onClick={(e) => { e.stopPropagation(); handleStarToggle(doc); }}
                            >
                              <Star size={14} fill={doc.starred ? 'currentColor' : 'none'} />
                            </button>
                            {renamingDoc === doc.id ? (
                              <input
                                autoFocus
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingDoc(null); }}
                                onBlur={commitRename}
                                onClick={e => e.stopPropagation()}
                                className="text-sm border border-blue-400 rounded px-1 py-0.5 focus:outline-none"
                              />
                            ) : (
                              <span className="truncate">{doc.title}</span>
                            )}
                          </div>
                        </td>
                        <td className="pr-4 py-2 text-gray-500">{owner?.name || 'Unknown'}</td>
                        <td className="pr-4 py-2 text-gray-500">{relativeTime(doc.updatedAt)}</td>
                        <td className="py-2">
                          <div className="flex -space-x-1">
                            {doc.sharedWith.slice(0, 3).map(s => {
                              const u = getUserById(s.userId);
                              return u ? (
                                <div key={s.userId} className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold border border-white" style={{ backgroundColor: u.avatarColor }}>
                                  {u.avatar}
                                </div>
                              ) : null;
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-48"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {[
              { label: 'Open', icon: ExternalLink, action: () => navTo(`/editor/${contextMenu.doc.id}`) },
              { label: 'Rename', icon: Edit3, action: () => handleRename(contextMenu.doc) },
              { label: 'Duplicate', icon: Copy, action: () => handleDuplicate(contextMenu.doc) },
              { label: contextMenu.doc.starred ? 'Unstar' : 'Star', icon: Star, action: () => handleStarToggle(contextMenu.doc) },
              ...(contextMenu.doc.folderId === 'folder-trash'
                ? [
                    { label: 'Restore', icon: FolderInput, action: () => handleRestore(contextMenu.doc) },
                    { label: 'Delete Permanently', icon: Trash2, action: () => handleDelete(contextMenu.doc), danger: true },
                  ]
                : [
                    { label: 'Delete', icon: Trash2, action: () => handleDelete(contextMenu.doc), danger: true },
                  ]),
            ].map((item, i) => (
              <button
                key={i}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-gray-100 ${item.danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700'}`}
                onClick={() => { item.action(); setContextMenu(null); }}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
