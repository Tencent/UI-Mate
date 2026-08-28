import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import MasonryGrid from '../components/MasonryGrid';
import PinModal from '../components/PinModal';
import { MoreHorizontal, Plus, Lock, Globe, X } from 'lucide-react';

const BoardDetail = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { state, createSection, updateBoard, deleteBoard } = useStore();
  const [selectedPin, setSelectedPin] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [showSectionInput, setShowSectionInput] = useState(false);
  const [activeSection, setActiveSection] = useState(null); // null = "All"
  const optionsRef = useRef(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrivacy, setEditPrivacy] = useState('public');
  const [mergeTargetId, setMergeTargetId] = useState('');

  const board = state.boards.find(b => b.id === boardId);

  if (!board) return <div className="pt-16 text-center">Board not found</div>;

  const isOwner = state.currentUser.id === board.userId;
  // Filter pins by active section, or show all if no section selected
  const boardPins = activeSection
    ? state.pins.filter(p => {
        const section = board.sections.find(s => s.id === activeSection);
        return section ? section.pins.includes(p.id) : false;
      })
    : state.pins.filter(p => board.pins.includes(p.id));
  const owner = state.users.find(u => u.id === board.userId);

  // Close options dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [showOptions]);

  const handleCreateSection = (e) => {
    e.preventDefault();
    if (newSectionName.trim()) {
      createSection(board.id, newSectionName);
      setNewSectionName('');
      setShowSectionInput(false);
    }
  };

  const handleDeleteBoard = () => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      deleteBoard(board.id);
      navigate(`/profile/${state.currentUser.id}`);
    }
  };

  const openEditModal = () => {
    setEditName(board.name);
    setEditDescription(board.description || '');
    setEditPrivacy(board.privacy || 'public');
    setShowEditModal(true);
    setShowOptions(false);
  };

  const handleSaveEdit = () => {
    updateBoard(board.id, {
      name: editName.trim() || board.name,
      description: editDescription,
      privacy: editPrivacy
    });
    setShowEditModal(false);
  };

  const openMergeModal = () => {
    const target = state.boards.find(b => b.userId === state.currentUser.id && b.id !== board.id && !b.archived);
    setMergeTargetId(target?.id || '');
    setShowMergeModal(true);
    setShowOptions(false);
  };

  const handleMergeBoard = () => {
    const target = state.boards.find(b => b.id === mergeTargetId);
    if (!target) return;
    const mergedPins = Array.from(new Set([...target.pins, ...board.pins]));
    updateBoard(target.id, { pins: mergedPins, updatedAt: Date.now() });
    updateBoard(board.id, { archived: true, mergedIntoBoardId: target.id, updatedAt: Date.now() });
    setShowMergeModal(false);
    navigate(`/board/${target.id}`);
  };

  const handleArchiveBoard = () => {
    updateBoard(board.id, { archived: true, updatedAt: Date.now() });
    setShowOptions(false);
    navigate(`/profile/${state.currentUser.id}`);
  };

  return (
    <div className="pt-16 min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-12 relative">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold">{board.name}</h1>
            {isOwner && (
              <div className="relative" ref={optionsRef}>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setShowOptions(!showOptions)}
                >
                  <MoreHorizontal size={24} />
                </button>

                {showOptions && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white shadow-xl rounded-xl p-2 z-10 w-52 border">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg font-semibold"
                      onClick={openEditModal}
                    >
                      Edit board
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg font-semibold"
                      onClick={openMergeModal}
                    >
                      Merge board
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg font-semibold"
                      onClick={handleArchiveBoard}
                    >
                      Archive
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg font-semibold text-red-600"
                      onClick={handleDeleteBoard}
                    >
                      Delete board
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {board.description && (
            <p className="text-gray-600 text-sm mb-3 max-w-lg text-center">{board.description}</p>
          )}

          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <img src={owner.avatar} alt={owner.name} className="w-8 h-8 rounded-full" />
            <span className="font-semibold text-black">{owner.name}</span>
            {board.privacy === 'secret' ? <Lock size={16} /> : <Globe size={16} />}
          </div>

          <div className="text-sm text-gray-500 font-semibold">
            {board.pins.length} Pins • {board.sections.length} Sections
          </div>
        </div>

        {/* Sections */}
        {isOwner && (
          <div className="mb-8 flex flex-col items-center">
            {!showSectionInput ? (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-semibold"
                onClick={() => setShowSectionInput(true)}
              >
                <Plus size={20} /> Create Section
              </button>
            ) : (
              <form onSubmit={handleCreateSection} className="flex gap-2">
                <input
                  type="text"
                  className="px-4 py-2 border rounded-full outline-none focus:ring-2 focus:ring-xinterest-red"
                  placeholder="Section Name"
                  value={newSectionName}
                  onChange={e => setNewSectionName(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-full font-semibold">Add</button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 rounded-full font-semibold"
                  onClick={() => setShowSectionInput(false)}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}

        {board.sections.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <div
              className={`px-6 py-3 rounded-2xl font-bold cursor-pointer transition-colors ${
                activeSection === null
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setActiveSection(null)}
            >
              All
            </div>
            {board.sections.map(section => (
              <div
                key={section.id}
                className={`px-6 py-3 rounded-2xl font-bold cursor-pointer transition-colors ${
                  activeSection === section.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              >
                {section.name}
                {activeSection === section.id && (
                  <span className="ml-2 text-sm font-normal opacity-70">
                    ({section.pins.length})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pins Grid */}
        <MasonryGrid pins={boardPins} onPinClick={setSelectedPin} />

        {boardPins.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            <h3 className="text-xl font-bold mb-2">There are no pins on this board yet</h3>
            <p>Save some pins to get started!</p>
          </div>
        )}
      </div>

      {selectedPin && (
        <PinModal pin={selectedPin} onClose={() => setSelectedPin(null)} />
      )}

      {/* Edit Board Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setShowEditModal(false)}
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center">Edit board</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-xinterest-red focus:border-transparent outline-none"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Board name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-xinterest-red focus:border-transparent outline-none resize-none"
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="What's your board about?"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="board-privacy-toggle"
                  checked={editPrivacy === 'secret'}
                  onChange={e => setEditPrivacy(e.target.checked ? 'secret' : 'public')}
                  className="w-5 h-5 rounded border-gray-300 text-xinterest-red focus:ring-xinterest-red cursor-pointer"
                />
                <label htmlFor="board-privacy-toggle" className="text-sm font-medium cursor-pointer select-none">
                  Keep this board secret
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                className="px-5 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-3 rounded-full font-semibold bg-xinterest-red text-white hover:bg-xinterest-hover transition-colors disabled:opacity-50"
                disabled={!editName.trim()}
                onClick={handleSaveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showMergeModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={() => setShowMergeModal(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setShowMergeModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-3 text-center">Merge board</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Move all pins from "{board.name}" into another board, then archive this board.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination board</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-xinterest-red focus:border-transparent outline-none bg-white"
              value={mergeTargetId}
              onChange={e => setMergeTargetId(e.target.value)}
            >
              {state.boards
                .filter(b => b.userId === state.currentUser.id && b.id !== board.id && !b.archived)
                .map(target => (
                  <option key={target.id} value={target.id}>
                    {target.name} ({target.pins.length} pins)
                  </option>
                ))}
            </select>
            <div className="flex justify-end gap-3 mt-8">
              <button
                className="px-5 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                onClick={() => setShowMergeModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-3 rounded-full font-semibold bg-xinterest-red text-white hover:bg-xinterest-hover transition-colors disabled:opacity-50"
                disabled={!mergeTargetId}
                onClick={handleMergeBoard}
              >
                Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDetail;
