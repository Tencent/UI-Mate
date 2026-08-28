import React, { useState, useRef, useEffect } from 'react';
import { Upload, MoreHorizontal, ArrowUpRight, Search, Plus, Heart } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { useNavigate } from 'react-router-dom';
import { downloadPinImage, getSourceDomain } from '../lib/utils';

const PinCard = ({ pin, onClick, onDeleted }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { state, savePinToBoard, deletePin, createBoard, likePin } = useStore();
  const [showBoardSelect, setShowBoardSelect] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [boardSearch, setBoardSearch] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [savedToBoard, setSavedToBoard] = useState(null);
  const [showCreateInline, setShowCreateInline] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [shareToast, setShareToast] = useState(false);
  const moreMenuRef = useRef(null);
  const boardSelectRef = useRef(null);
  const navigate = useNavigate();

  const isOwnPin = pin.userId === state.currentUser.id;
  const isLiked = (pin.likedBy || []).includes(state.currentUser.id);
  const pinAuthor = state.users.find(u => u.id === pin.userId);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
      if (boardSelectRef.current && !boardSelectRef.current.contains(e.target)) {
        setShowBoardSelect(false);
        setShowCreateInline(false);
        setBoardSearch('');
      }
    };
    if (showMoreMenu || showBoardSelect) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [showMoreMenu, showBoardSelect]);

  const savedBoard = state.boards.find(b => b.userId === state.currentUser.id && b.pins.includes(pin.id));
  const lastUsedBoard = state.boards.find(b => b.id === state.lastUsedBoardId && b.userId === state.currentUser.id);
  const myBoards = state.boards.filter(b => b.userId === state.currentUser.id);
  const quickSaveBoard = lastUsedBoard || myBoards[0];

  const handleQuickSave = (e) => {
    e.stopPropagation();
    if (savedBoard) return;
    if (quickSaveBoard) {
      savePinToBoard(pin.id, quickSaveBoard.id);
      setJustSaved(true);
      setSavedToBoard(quickSaveBoard);
      setTimeout(() => { setJustSaved(false); setSavedToBoard(null); }, 3000);
    }
  };

  const handleSave = (e, boardId) => {
    e.stopPropagation();
    const board = state.boards.find(b => b.id === boardId);
    savePinToBoard(pin.id, boardId);
    setShowBoardSelect(false);
    setBoardSearch('');
    setJustSaved(true);
    setSavedToBoard(board);
    setTimeout(() => { setJustSaved(false); setSavedToBoard(null); }, 3000);
  };

  const handleSharePin = (e) => {
    e.stopPropagation();
    const shareUrl = pin.url || `${window.location.origin}/pin/${pin.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {}).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      });
    } else {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const handleDownloadImage = async (e) => {
    e.stopPropagation();
    setShowMoreMenu(false);
    await downloadPinImage(pin);
  };

  const handleDeletePin = (e) => {
    e.stopPropagation();
    deletePin(pin.id);
    setShowMoreMenu(false);
    if (onDeleted) onDeleted('Pin deleted');
  };

  const handleCreateBoard = (e) => {
    e.stopPropagation();
    if (newBoardName.trim()) {
      const newBoard = createBoard({ name: newBoardName, privacy: 'public' });
      if (newBoard) {
        savePinToBoard(pin.id, newBoard.id);
        setJustSaved(true);
        setSavedToBoard(newBoard);
        setTimeout(() => { setJustSaved(false); setSavedToBoard(null); }, 3000);
      }
      setNewBoardName('');
      setShowCreateInline(false);
      setShowBoardSelect(false);
    }
  };

  const filteredBoards = boardSearch
    ? myBoards.filter(b => b.name.toLowerCase().includes(boardSearch.toLowerCase()))
    : myBoards;

  const isSaved = !!savedBoard;
  const saveLabel = isSaved ? 'Saved' : (justSaved ? 'Saved' : 'Save');

  const sourceDomain = getSourceDomain(pin.url, pin.source);

  return (
    <div
      className="masonry-item relative rounded-2xl overflow-visible cursor-zoom-in group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!showBoardSelect && !showMoreMenu) {
          setShowBoardSelect(false);
          setShowMoreMenu(false);
        }
      }}
      onClick={() => onClick(pin)}
    >
      {/* Image Container */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={pin.image}
          alt={pin.altText || pin.title}
          className="w-full h-auto object-cover block"
          loading="lazy"
          style={{ minHeight: '100px', backgroundColor: '#e5e5e0' }}
        />

        {/* Hover Overlay */}
        <div className={`absolute inset-0 transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Top row: Board selector + Save button */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="relative" ref={boardSelectRef}>
              {!isSaved && !justSaved && (
                <button
                  className="flex items-center gap-1 bg-white/90 hover:bg-white text-black px-3 py-1.5 rounded-full text-[13px] font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBoardSelect(!showBoardSelect);
                  }}
                >
                  {quickSaveBoard?.name || 'Board'}
                  <ChevronDownIcon />
                </button>
              )}

              {/* Board select dropdown */}
              {showBoardSelect && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-3 border-b border-gray-100 text-center">
                    <p className="text-sm font-bold">Save to board</p>
                  </div>
                  <div className="p-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search"
                        className="w-full pl-9 pr-3 py-2 bg-[#e5e5e0] rounded-lg text-sm outline-none focus:ring-2 focus:ring-xinterest-focus-blue"
                        value={boardSearch}
                        onChange={(e) => setBoardSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto px-2">
                    {filteredBoards.map(board => {
                      const coverPin = state.pins.find(p => board.pins[0] === p.id);
                      return (
                        <button
                          key={board.id}
                          className="w-full text-left px-2 py-2 hover:bg-gray-100 flex items-center gap-3 rounded-lg"
                          onClick={(e) => handleSave(e, board.id)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                            {coverPin && <img src={coverPin.image} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-sm truncate block">{board.name}</span>
                            <span className="text-xs text-gray-400">{board.pins.length} Pins</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-gray-100 p-2">
                    {!showCreateInline ? (
                      <button
                        className="w-full text-left px-2 py-2 hover:bg-gray-100 flex items-center gap-3 rounded-lg text-sm font-semibold"
                        onClick={(e) => { e.stopPropagation(); setShowCreateInline(true); }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Plus size={18} />
                        </div>
                        Create board
                      </button>
                    ) : (
                      <div className="p-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          placeholder="Board name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-xinterest-focus-blue mb-2"
                          value={newBoardName}
                          onChange={(e) => setNewBoardName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleCreateBoard(e); }}
                        />
                        <button
                          className="w-full py-2 bg-xinterest-red text-white rounded-lg text-sm font-semibold hover:bg-xinterest-hover disabled:opacity-50"
                          disabled={!newBoardName.trim()}
                          onClick={handleCreateBoard}
                        >
                          Create
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              className={`font-semibold px-4 py-2.5 rounded-full text-[15px] transition-colors ${
                isSaved || justSaved
                  ? 'bg-black text-white'
                  : 'bg-xinterest-red hover:bg-xinterest-hover text-white'
              }`}
              onClick={handleQuickSave}
            >
              {saveLabel}
            </button>
          </div>

          {/* Bottom row: Source link + action buttons */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            {sourceDomain && (
              <a
                href={pin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/90 hover:bg-white text-black px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 truncate max-w-[150px]"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowUpRight size={12} />
                <span className="truncate">{sourceDomain}</span>
              </a>
            )}

            <div className="flex gap-1.5 ml-auto">
              <button
                className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-black"
                onClick={handleSharePin}
              >
                <Upload size={14} />
              </button>
              <div className="relative" ref={moreMenuRef}>
                <button
                  className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreMenu(!showMoreMenu);
                  }}
                >
                  <MoreHorizontal size={14} />
                </button>
                {showMoreMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm"
                      onClick={handleDownloadImage}
                    >
                      Download image
                    </button>
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMoreMenu(false);
                      }}
                    >
                      Hide Pin
                    </button>
                    {isOwnPin && (
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm text-red-600"
                        onClick={handleDeletePin}
                      >
                        Delete Pin
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below-image info */}
      <div className="px-1 pt-2 pb-1">
        {pin.title && (
          <p className="text-[14px] font-semibold leading-tight truncate">{pin.title}</p>
        )}
        <div className="flex items-center justify-between mt-1">
          {pinAuthor && (
            <div
              className="flex items-center gap-1.5 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${pinAuthor.id}`);
              }}
            >
              <img src={pinAuthor.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
              <span className="text-xs text-gray-600 truncate max-w-[100px]">{pinAuthor.name}</span>
            </div>
          )}
          <button
            className={`flex items-center gap-0.5 text-xs flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors ${
              isLiked ? 'text-xinterest-red' : 'text-gray-400'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              likePin(pin.id);
            }}
          >
            <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
            {pin.likes > 0 && <span>{pin.likes}</span>}
          </button>
        </div>
      </div>

      {/* Saved toast */}
      {justSaved && savedToBoard && (
        <div className="absolute bottom-14 left-3 right-3 bg-black text-white text-xs font-semibold px-3 py-2 rounded-lg text-center z-10">
          Saved to {savedToBoard.name}
        </div>
      )}

      {shareToast && (
        <div className="absolute bottom-14 left-3 right-3 bg-black text-white text-xs font-semibold px-3 py-2 rounded-lg text-center z-10">
          Link copied!
        </div>
      )}
    </div>
  );
};

const ChevronDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

export default PinCard;
