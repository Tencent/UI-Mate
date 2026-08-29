import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Users, Plus, Lock, Globe, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Navbar from './Navbar';

const BoardList = () => {
  const { state, dispatch } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [selectedBg, setSelectedBg] = useState('#0079BF');
  const [selectedVisibility, setSelectedVisibility] = useState('workspace');
  const [contextMenu, setContextMenu] = useState(null); // { boardId, x, y }

  const bgColors = ['#0079BF', '#D29034', '#519839', '#B04632', '#89609E', '#CD5A91', '#4BBF6B', '#00AECC'];

  // Close context menu on click away
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleCreateBoard = () => {
    if (!newBoardTitle.trim()) return;
    dispatch({
      type: 'ADD_BOARD',
      payload: {
        title: newBoardTitle,
        background: selectedBg,
        visibility: selectedVisibility
      }
    });
    setNewBoardTitle('');
    setSelectedVisibility('workspace');
    setIsCreating(false);
  };

  const getBoardStyle = (bg) => {
    if (bg.startsWith('http')) {
      return { backgroundImage: `url(${bg})` };
    }
    return { backgroundColor: bg };
  };

  const starredBoards = state.boardOrder
    .map(id => state.boards[id])
    .filter(b => b && b.starred && !b.closed);

  // Recently viewed boards
  const recentlyViewedBoards = [...state.boardOrder]
    .map(id => state.boards[id])
    .filter(b => b && b.lastVisitedAt && !b.closed)
    .sort((a, b) => new Date(b.lastVisitedAt) - new Date(a.lastVisitedAt))
    .slice(0, 4);

  const formatRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Viewed just now';
    if (diffMins < 60) return `Viewed ${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Viewed ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Viewed ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleContextMenu = (e, boardId) => {
    e.preventDefault();
    setContextMenu({ boardId, x: e.clientX, y: e.clientY });
  };

  const visibleBoards = state.boardOrder.filter(id => {
    const board = state.boards[id];
    return board && !board.closed;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto py-12 px-4">

        {/* Section: Recently Viewed */}
        {recentlyViewedBoards.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <Clock size={24} />
              <h2 className="text-lg font-bold">Recently viewed</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentlyViewedBoards.map(board => (
                <Link
                  key={board.id}
                  to={`/board/${board.id}`}
                  className="h-24 rounded bg-cover bg-center relative group overflow-hidden shadow-sm hover:shadow-md transition-all"
                  style={getBoardStyle(board.background)}
                  onContextMenu={(e) => handleContextMenu(e, board.id)}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors p-3">
                    <h3 className="text-white font-bold text-base drop-shadow-md">{board.title}</h3>
                    <p className="text-white/70 text-xs mt-1 drop-shadow-sm">{formatRelativeTime(board.lastVisitedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Section: Starred Boards */}
        {starredBoards.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <Star size={24} />
              <h2 className="text-lg font-bold">Starred boards</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {starredBoards.map(board => (
                <Link
                  key={board.id}
                  to={`/board/${board.id}`}
                  className="h-24 rounded bg-cover bg-center relative group overflow-hidden shadow-sm hover:shadow-md transition-all"
                  style={getBoardStyle(board.background)}
                  onContextMenu={(e) => handleContextMenu(e, board.id)}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors p-3">
                    <h3 className="text-white font-bold text-base drop-shadow-md">{board.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Section: Your Workspaces */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-700">
            <Users size={24} />
            <h2 className="text-lg font-bold">Your workspaces</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleBoards.map(id => {
              const board = state.boards[id];
              if (!board) return null;
              return (
                <div key={board.id} className="relative group">
                  <Link
                    to={`/board/${board.id}`}
                    className="block h-24 rounded bg-cover bg-center relative overflow-hidden shadow-sm hover:shadow-md transition-all"
                    style={getBoardStyle(board.background)}
                    onContextMenu={(e) => handleContextMenu(e, board.id)}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors p-3">
                      <h3 className="text-white font-bold text-base drop-shadow-md">{board.title}</h3>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dispatch({ type: 'UPDATE_BOARD', payload: { boardId: board.id, field: 'starred', value: !board.starred } });
                    }}
                    className={`absolute bottom-2 right-2 p-1 rounded transition-opacity ${board.starred ? 'opacity-100 text-yellow-400' : 'opacity-0 group-hover:opacity-100 text-white hover:text-yellow-400'}`}
                  >
                    <Star size={16} fill={board.starred ? "currentColor" : "none"} />
                  </button>
                </div>
              );
            })}

            {/* Create Board Button */}
            <button
              onClick={() => setIsCreating(true)}
              className="h-24 rounded bg-gray-100 hover:bg-gray-200 flex flex-col items-center justify-center text-gray-600 transition-colors"
            >
              <Plus size={24} />
              <span className="text-sm mt-1">Create new board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 w-48"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            to={`/board/${contextMenu.boardId}`}
            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setContextMenu(null)}
          >
            Open board
          </Link>
          <button
            onClick={() => {
              const board = state.boards[contextMenu.boardId];
              if (board) {
                dispatch({ type: 'UPDATE_BOARD', payload: { boardId: contextMenu.boardId, field: 'starred', value: !board.starred } });
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {state.boards[contextMenu.boardId]?.starred ? 'Unstar' : 'Star'}
          </button>
          <div className="h-px bg-gray-200 my-1"></div>
          <button
            onClick={() => {
              dispatch({ type: 'UPDATE_BOARD', payload: { boardId: contextMenu.boardId, field: 'closed', value: true } });
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Close board
          </button>
        </div>
      )}

      {/* Create Board Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setIsCreating(false)}>
          <div className="bg-white rounded-lg shadow-xl p-4 w-80" onClick={e => e.stopPropagation()}>
            <div
              className="h-24 rounded mb-4 relative flex items-center justify-center"
              style={{ backgroundColor: selectedBg }}
            >
              <input
                autoFocus
                className="bg-transparent text-white font-bold placeholder-white/70 text-center text-lg w-full px-4 focus:outline-none drop-shadow-md"
                placeholder="Board title"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
              />
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 block mb-2">Background</label>
              <div className="grid grid-cols-4 gap-2">
                {bgColors.map(c => (
                  <button
                    key={c}
                    className={`h-8 rounded hover:opacity-80 ${selectedBg === c ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setSelectedBg(c)}
                  />
                ))}
              </div>
            </div>

            {/* Visibility Picker */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 block mb-2">Visibility</label>
              <div className="space-y-1">
                {[
                  { value: 'private', icon: Lock, label: 'Private' },
                  { value: 'workspace', icon: Users, label: 'Workspace' },
                  { value: 'public', icon: Globe, label: 'Public' },
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedVisibility(opt.value)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm text-left ${
                        selectedVisibility === opt.value ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon size={14} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCreateBoard}
              disabled={!newBoardTitle}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Board
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardList;
