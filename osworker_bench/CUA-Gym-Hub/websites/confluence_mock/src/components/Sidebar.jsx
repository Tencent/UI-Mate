import React, { useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { v4 as uuidv4 } from 'uuid';
import { 
  Layout, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Settings,
  Home,
  Hash,
  MoreHorizontal
} from 'lucide-react';
import { clsx } from 'clsx';

const PageTreeItem = ({ page, pages, level = 0, activePageId, onToggle, expanded, onCreateChild }) => {
  const navigate = useNavigate();
  const childPages = pages.filter(p => p.parentId === page.id);
  const hasChildren = childPages.length > 0;
  const isExpanded = expanded[page.id];

  const handleDragStart = (e) => {
    e.dataTransfer.setData('pageId', page.id);
    e.stopPropagation();
  };

  const handleDrop = (e, targetPageId) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedPageId = e.dataTransfer.getData('pageId');
    if (draggedPageId && draggedPageId !== targetPageId) {
      onToggle(draggedPageId, targetPageId, 'move');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="select-none">
      <div 
        className={clsx(
          "flex items-center py-1 px-2 hover:bg-gray-200 cursor-pointer rounded text-sm group relative",
          activePageId === page.id && "bg-blue-100 text-blue-700 font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        draggable
        onDragStart={handleDragStart}
        onDrop={(e) => handleDrop(e, page.id)}
        onDragOver={handleDragOver}
        onClick={() => navigate(`/spaces/${page.spaceId}/pages/${page.id}`)}
      >
        <button 
          className={clsx("p-0.5 rounded hover:bg-gray-300 mr-1", !hasChildren && "invisible")}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(page.id);
          }}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <FileText size={14} className="mr-2 text-gray-500" />
        <span className="truncate flex-1">{page.title}</span>
        
        {/* Hover Actions */}
        <div className="hidden group-hover:flex items-center">
          <button 
            className="p-1 hover:bg-gray-300 rounded text-gray-500"
            title="Create child page"
            onClick={(e) => {
              e.stopPropagation();
              onCreateChild(page.id);
            }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      {isExpanded && childPages.map(child => (
        <PageTreeItem 
          key={child.id} 
          page={child} 
          pages={pages} 
          level={level + 1}
          activePageId={activePageId}
          onToggle={onToggle}
          expanded={expanded}
          onCreateChild={onCreateChild}
        />
      ))}
    </div>
  );
};

export const Sidebar = () => {
  const { state, dispatch } = useStore();
  const { spaceId, pageId } = useParams();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState({});
  const [pageDialog, setPageDialog] = useState(null);
  const [spaceDialogOpen, setSpaceDialogOpen] = useState(false);
  const [spacePanel, setSpacePanel] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [spaceKey, setSpaceKey] = useState('');

  const space = state.spaces.find(s => s.id === spaceId);
  const spacePages = state.pages.filter(p => p.spaceId === spaceId);
  const rootPages = spacePages.filter(p => !p.parentId);

  const toggleExpand = (id, targetId, action) => {
    if (action === 'move') {
      dispatch({ type: 'MOVE_PAGE', payload: { pageId: id, newParentId: targetId } });
    } else {
      setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const createPage = (parentId = null) => {
    if (!spaceId) return;
    setPageTitle('');
    setPageDialog({ parentId });
  };

  const submitPage = (e) => {
    e.preventDefault();
    const title = pageTitle.trim();
    if (!title || !pageDialog) return;
    const id = uuidv4();
    const newPage = {
      id,
      spaceId,
      parentId: pageDialog.parentId,
      title,
      content: '<p>Start typing...</p>',
      authorId: state.currentUser.id
    };
    dispatch({ type: 'CREATE_PAGE', payload: newPage });
    if (pageDialog.parentId) setExpanded(prev => ({ ...prev, [pageDialog.parentId]: true }));
    setPageDialog(null);
    navigate(`/spaces/${spaceId}/pages/${id}`);
  };

  const submitSpace = (e) => {
    e.preventDefault();
    const name = spaceName.trim();
    const key = spaceKey.trim().toUpperCase();
    if (!name || !key) return;
    const id = uuidv4();
    dispatch({ type: 'CREATE_SPACE', payload: { id, name, key, description: '' } });
    setSpaceName('');
    setSpaceKey('');
    setSpaceDialogOpen(false);
    navigate(`/spaces/${id}`);
  };

  return (
    <div className="w-64 bg-bg-light border-r border-gray-300 flex flex-col h-full">
      {/* Space Header */}
      {space ? (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
              {space.key.substring(0, 1)}
            </div>
            <div>
              <h2 className="font-bold text-gray-800 leading-tight">{space.name}</h2>
              <span className="text-xs text-gray-500">{space.key} Space</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-4">
            <NavLink to={`/spaces/${space.id}`} end className={({isActive}) => clsx("flex items-center gap-2 text-sm px-2 py-1 rounded", isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200")}>
              <Home size={16} /> Overview
            </NavLink>
            <button
              onClick={() => setSpacePanel('blog')}
              className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-gray-200 cursor-pointer text-left"
            >
              <Hash size={16} /> Blog
            </button>
            <button
              onClick={() => setSpacePanel('settings')}
              className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-gray-200 cursor-pointer text-left"
            >
              <Settings size={16} /> Space Settings
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800">All Spaces</h2>
        </div>
      )}

      {/* Page Tree */}
      {space && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Pages</span>
            <button onClick={() => createPage(null)} className="p-1 hover:bg-gray-200 rounded" title="Create Page">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {rootPages.map(page => (
              <PageTreeItem 
                key={page.id} 
                page={page} 
                pages={spacePages} 
                activePageId={pageId}
                onToggle={toggleExpand}
                expanded={expanded}
                onCreateChild={createPage}
              />
            ))}
            {rootPages.length === 0 && (
              <div className="text-sm text-gray-400 px-2 italic">No pages yet</div>
            )}
          </div>
        </div>
      )}

      {/* Global Nav */}
      {!space && (
        <div className="p-2">
          {state.spaces.map(s => (
            <NavLink 
              key={s.id} 
              to={`/spaces/${s.id}`} 
              className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded mb-1"
            >
              <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-xs font-bold">
                {s.key[0]}
              </div>
              <span className="text-sm font-medium">{s.name}</span>
            </NavLink>
          ))}
          <button 
            className="flex items-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded w-full text-sm mt-2"
            onClick={() => setSpaceDialogOpen(true)}
          >
            <Plus size={16} /> Create Space
          </button>
        </div>
      )}

      {pageDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={submitPage} className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create page</h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page title</label>
            <input
              autoFocus
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Project notes"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPageDialog(null)} className="px-3 py-2 text-sm hover:bg-gray-100 rounded">Cancel</button>
              <button type="submit" disabled={!pageTitle.trim()} className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Create</button>
            </div>
          </form>
        </div>
      )}

      {spaceDialogOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={submitSpace} className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create space</h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">Space name</label>
            <input
              autoFocus
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Design"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Space key</label>
            <input
              value={spaceKey}
              onChange={(e) => setSpaceKey(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="DES"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setSpaceDialogOpen(false)} className="px-3 py-2 text-sm hover:bg-gray-100 rounded">Cancel</button>
              <button type="submit" disabled={!spaceName.trim() || !spaceKey.trim()} className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Create</button>
            </div>
          </form>
        </div>
      )}

      {spacePanel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">{spacePanel === 'blog' ? 'Blog' : 'Space settings'}</h2>
              <button onClick={() => setSpacePanel(null)} className="p-1 hover:bg-gray-100 rounded">x</button>
            </div>
            {spacePanel === 'blog' ? (
              <div className="text-sm text-gray-700 space-y-3">
                <p>No blog posts have been published in {space?.name} yet.</p>
                <button
                  onClick={() => {
                    setPageTitle('Team update');
                    setPageDialog({ parentId: null });
                    setSpacePanel(null);
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Draft a post
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-700 space-y-2">
                <p><span className="font-medium">Name:</span> {space?.name}</p>
                <p><span className="font-medium">Key:</span> {space?.key}</p>
                <p><span className="font-medium">Pages:</span> {spacePages.length}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
