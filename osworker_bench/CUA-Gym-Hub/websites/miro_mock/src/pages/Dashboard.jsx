import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Clock, Star, Monitor, LayoutGrid, ChevronDown, Plus,
  Search, MoreHorizontal, Pencil, Copy, FolderInput, Trash2, StarOff
} from 'lucide-react';
import { useAppContext } from '../context/AppContext.jsx';
import { generateId } from '../utils/dataManager.js';

export default function Dashboard() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('boards');
  const [activeProject, setActiveProject] = useState(null);
  const [menuBoardId, setMenuBoardId] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [renamingBoardId, setRenamingBoardId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const menuRef = useRef(null);
  const renameRef = useRef(null);
  const newProjectRef = useRef(null);

  const sid = searchParams.get('sid');
  const sidQuery = sid ? `?sid=${sid}` : '';

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuBoardId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus rename input
  useEffect(() => {
    if (renamingBoardId && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingBoardId]);

  // Focus new project input
  useEffect(() => {
    if (addingProject && newProjectRef.current) {
      newProjectRef.current.focus();
    }
  }, [addingProject]);

  // Filter boards
  let filteredBoards = [...state.boards];
  if (activeFilter === 'recent') {
    filteredBoards.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));
  } else if (activeFilter === 'starred') {
    filteredBoards = filteredBoards.filter(b => b.starred);
  } else if (activeFilter === 'project' && activeProject) {
    filteredBoards = filteredBoards.filter(b => b.projectId === activeProject);
  }

  // Search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredBoards = filteredBoards.filter(b => b.name.toLowerCase().includes(q));
  }

  const getSectionTitle = () => {
    if (activeFilter === 'recent') return 'Recent boards';
    if (activeFilter === 'starred') return 'Starred boards';
    if (activeFilter === 'templates') return 'Templates';
    if (activeFilter === 'project' && activeProject) {
      const p = state.projects.find(pr => pr.id === activeProject);
      return p ? p.name : 'Project boards';
    }
    return 'Boards in this team';
  };

  const handleCreateBoard = () => {
    const newId = generateId();
    dispatch({ type: 'ADD_BOARD', payload: { id: newId } });
    navigate(`/board/${newId}${sidQuery}`);
  };

  const handleBoardClick = (boardId) => {
    dispatch({ type: 'UPDATE_BOARD', payload: { id: boardId, changes: { viewedAt: new Date().toISOString() } } });
    navigate(`/board/${boardId}${sidQuery}`);
  };

  const handleMenuClick = (e, boardId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
    setMenuBoardId(boardId);
  };

  const handleRename = (boardId) => {
    const board = state.boards.find(b => b.id === boardId);
    setRenamingBoardId(boardId);
    setRenameValue(board?.name || '');
    setMenuBoardId(null);
  };

  const handleRenameSubmit = () => {
    if (renamingBoardId && renameValue.trim()) {
      dispatch({ type: 'UPDATE_BOARD', payload: { id: renamingBoardId, changes: { name: renameValue.trim() } } });
    }
    setRenamingBoardId(null);
  };

  const handleDuplicate = (boardId) => {
    dispatch({ type: 'DUPLICATE_BOARD', payload: { id: boardId } });
    setMenuBoardId(null);
  };

  const handleDelete = (boardId) => {
    setConfirmDeleteId(boardId);
    setMenuBoardId(null);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      dispatch({ type: 'DELETE_BOARD', payload: { id: confirmDeleteId } });
      setConfirmDeleteId(null);
    }
  };

  const handleStar = (e, boardId) => {
    e.stopPropagation();
    dispatch({ type: 'STAR_BOARD', payload: { id: boardId } });
  };

  const handleMoveToProject = (boardId, projectId) => {
    dispatch({ type: 'MOVE_BOARD_TO_PROJECT', payload: { boardId, projectId } });
    setMenuBoardId(null);
  };

  const handleAddProject = () => {
    setAddingProject(true);
    setNewProjectName('');
  };

  const handleNewProjectSubmit = () => {
    if (newProjectName.trim()) {
      dispatch({ type: 'ADD_PROJECT', payload: { name: newProjectName.trim() } });
    }
    setAddingProject(false);
    setNewProjectName('');
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  return (
    <div className="dashboard">
      {/* Top area with logo and search */}
      <div className="dashboard-header">
        <div className="dashboard-logo">xiro</div>
        <div className="dashboard-search">
          <Search size={20} color="#b3b3b3" />
          <input
            type="text"
            placeholder="Search boards"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-body">
        {/* Left sidebar */}
        <div className="dashboard-sidebar">
          <button
            className={`sidebar-item ${activeFilter === 'recent' ? 'active' : ''}`}
            onClick={() => { setActiveFilter('recent'); setActiveProject(null); }}
          >
            <Clock size={16} />
            <span>Recent</span>
          </button>
          <button
            className={`sidebar-item ${activeFilter === 'starred' ? 'active' : ''}`}
            onClick={() => { setActiveFilter('starred'); setActiveProject(null); }}
          >
            <Star size={16} />
            <span>Starred</span>
          </button>

          <div className="sidebar-divider" />

          <div className="sidebar-team">
            <div className="team-name">
              <span>My Team</span>
              <ChevronDown size={16} color="#b3b3b3" />
            </div>
            <div className="team-members">{state.team.memberCount} members</div>
          </div>

          <button
            className={`sidebar-item ${activeFilter === 'boards' && !activeProject ? 'active' : ''}`}
            onClick={() => { setActiveFilter('boards'); setActiveProject(null); }}
          >
            <Monitor size={16} />
            <span>Boards in this team</span>
          </button>
          <button
            className={`sidebar-item ${activeFilter === 'templates' ? 'active' : ''}`}
            onClick={() => { setActiveFilter('templates'); setActiveProject(null); }}
          >
            <LayoutGrid size={16} />
            <span>Templates</span>
          </button>

          <div className="sidebar-divider" />

          <div className="sidebar-projects-header">
            <span className="projects-title">Projects</span>
            <button className="add-project-btn" onClick={handleAddProject}>+ Add</button>
          </div>

          {addingProject && (
            <div style={{ padding: '0 12px 8px' }}>
              <input
                ref={newProjectRef}
                className="board-rename-input"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onBlur={handleNewProjectSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNewProjectSubmit();
                  if (e.key === 'Escape') { setAddingProject(false); setNewProjectName(''); }
                }}
              />
            </div>
          )}

          {state.projects.map(project => (
            <button
              key={project.id}
              className={`sidebar-item ${activeFilter === 'project' && activeProject === project.id ? 'active' : ''}`}
              onClick={() => { setActiveFilter('project'); setActiveProject(project.id); }}
            >
              <span>{project.name}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="dashboard-main">
          <h1 className="dashboard-section-title">{getSectionTitle()}</h1>

          {activeFilter === 'templates' ? (
            <TemplatesView onCreateFromTemplate={(templateName) => {
              const newId = generateId();
              dispatch({ type: 'ADD_BOARD', payload: { id: newId, name: templateName } });
              navigate(`/board/${newId}${sidQuery}`);
            }} />
          ) : (
            <div className="board-cards-grid">
            {/* New board card */}
            <div className="board-card new-board-card" onClick={handleCreateBoard}>
              <div className="new-board-icon">
                <Plus size={48} color="white" strokeWidth={1.5} />
              </div>
              <div className="new-board-text">New board</div>
            </div>

            {/* Board cards */}
            {filteredBoards.map(board => (
              <div
                key={board.id}
                className="board-card"
                onClick={() => handleBoardClick(board.id)}
              >
                <div className="board-card-thumbnail" style={{ backgroundColor: board.thumbnailColor || '#f5f5f5' }}>
                  {/* Star */}
                  <button
                    className={`board-star ${board.starred ? 'starred' : ''}`}
                    onClick={(e) => handleStar(e, board.id)}
                  >
                    <Star size={16} fill={board.starred ? '#f5d128' : 'none'} color={board.starred ? '#f5d128' : '#999'} />
                  </button>
                </div>
                <div className="board-card-info">
                  <div className="board-card-name">
                    {renamingBoardId === board.id ? (
                      <input
                        ref={renameRef}
                        className="board-rename-input"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit();
                          if (e.key === 'Escape') setRenamingBoardId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      board.name
                    )}
                  </div>
                  <div className="board-card-meta">
                    <span className="board-card-date">{formatDate(board.modifiedAt)}</span>
                    <button
                      className="board-card-menu-btn"
                      onClick={(e) => handleMenuClick(e, board.id)}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Context menu */}
      {menuBoardId && (
        <div
          ref={menuRef}
          className="board-context-menu"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          <button className="context-menu-item" onClick={() => handleRename(menuBoardId)}>
            <Pencil size={16} />
            <span>Rename</span>
          </button>
          <button className="context-menu-item" onClick={() => handleDuplicate(menuBoardId)}>
            <Copy size={16} />
            <span>Duplicate</span>
          </button>
          <div className="context-menu-submenu-wrapper">
            <button className="context-menu-item">
              <FolderInput size={16} />
              <span>Move to project</span>
              <ChevronDown size={14} style={{ marginLeft: 'auto', transform: 'rotate(-90deg)' }} />
            </button>
            <div className="context-menu-submenu">
              {state.projects.map(p => (
                <button
                  key={p.id}
                  className="context-menu-item"
                  onClick={() => handleMoveToProject(menuBoardId, p.id)}
                >
                  {p.name}
                </button>
              ))}
              <button
                className="context-menu-item"
                onClick={() => handleMoveToProject(menuBoardId, null)}
              >
                No project
              </button>
            </div>
          </div>
          <button className="context-menu-item" onClick={() => {
            dispatch({ type: 'STAR_BOARD', payload: { id: menuBoardId } });
            setMenuBoardId(null);
          }}>
            {state.boards.find(b => b.id === menuBoardId)?.starred
              ? <><StarOff size={16} /><span>Unstar</span></>
              : <><Star size={16} /><span>Star</span></>
            }
          </button>
          <div className="context-menu-divider" />
          <button className="context-menu-item danger" onClick={() => handleDelete(menuBoardId)}>
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <h3>Delete board?</h3>
            <p>This action cannot be undone. The board and all its content will be permanently deleted.</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button className="modal-btn danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TEMPLATE_LIST = [
  { id: 'retrospective', name: 'Sprint Retrospective', description: 'Reflect on your last sprint with your team', color: '#7bc86c' },
  { id: 'roadmap', name: 'Product Roadmap', description: 'Plan and visualize your product timeline', color: '#4262ff' },
  { id: 'brainstorm', name: 'Brainstorming', description: 'Generate and organize ideas collaboratively', color: '#fff9b1' },
  { id: 'user-journey', name: 'User Journey Map', description: 'Map out the end-to-end user experience', color: '#ff9d48' },
  { id: 'kanban', name: 'Kanban Board', description: 'Visualize and manage workflow', color: '#97d5f2' },
  { id: 'flowchart', name: 'Flowchart', description: 'Create clear process flows and diagrams', color: '#be88c7' },
  { id: 'mindmap', name: 'Mind Map', description: 'Explore ideas through branching structures', color: '#d5f692' },
  { id: 'architecture', name: 'System Architecture', description: 'Document your technical architecture', color: '#b5c4e3' },
];

function TemplatesView({ onCreateFromTemplate }) {
  return (
    <div>
      <div className="board-cards-grid">
        {TEMPLATE_LIST.map(tpl => (
          <div
            key={tpl.id}
            className="board-card"
            onClick={() => onCreateFromTemplate(tpl.name)}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="board-card-thumbnail"
              style={{ backgroundColor: tpl.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span style={{ fontSize: 32, color: 'rgba(255,255,255,0.6)' }}>⊞</span>
            </div>
            <div className="board-card-info">
              <div className="board-card-name">{tpl.name}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2, lineHeight: 1.4 }}>{tpl.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
