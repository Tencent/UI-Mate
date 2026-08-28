import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import MasonryGrid from '../components/MasonryGrid';
import PinModal from '../components/PinModal';
import { MoreHorizontal, Upload, Link as LinkIcon, ChevronDown, Heart, Trash2, Search, Plus, X, ArrowUpRight } from 'lucide-react';
import { relativeTime, cn, downloadPinImage, getSourceDomain } from '../lib/utils';

const PinDetail = () => {
  const { pinId } = useParams();
  const navigate = useNavigate();
  const { state, savePinToBoard, followUser, addComment, deleteComment, likeComment, likePin, createBoard } = useStore();
  const [commentText, setCommentText] = useState('');
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [boardSearch, setBoardSearch] = useState('');
  const [showCreateInline, setShowCreateInline] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [savedToBoardName, setSavedToBoardName] = useState('');
  const [toast, setToast] = useState(null);
  const [relatedPinModal, setRelatedPinModal] = useState(null);
  const boardDropdownRef = useRef(null);

  const pin = state.pins.find(p => p.id === pinId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pinId]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (boardDropdownRef.current && !boardDropdownRef.current.contains(e.target)) {
        setShowBoardDropdown(false);
        setBoardSearch('');
        setShowCreateInline(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!pin) return (
    <div className="pt-[56px] min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Pin not found</h1>
        <button className="px-6 py-2 bg-xinterest-red text-white rounded-full font-semibold" onClick={() => navigate('/')}>
          Go home
        </button>
      </div>
    </div>
  );

  const pinAuthor = state.users.find(u => u.id === pin.userId) || { name: 'Unknown', avatar: '', followers: [] };
  const isFollowing = state.currentUser.following.includes(pinAuthor.id);
  const savedBoard = state.boards.find(b => b.userId === state.currentUser.id && b.pins.includes(pin.id));
  const pinComments = state.comments.filter(c => c.pinId === pin.id);
  const isOwnPin = pin.userId === state.currentUser.id;
  const isLiked = (pin.likedBy || []).includes(state.currentUser.id);
  const myBoards = state.boards.filter(b => b.userId === state.currentUser.id);
  const lastUsedBoard = state.boards.find(b => b.id === state.lastUsedBoardId && b.userId === state.currentUser.id);
  const quickSaveBoard = lastUsedBoard || myBoards[0];

  const relatedPins = useMemo(() => {
    if (!pin.tags || pin.tags.length === 0) return state.pins.filter(p => p.id !== pin.id).slice(0, 16);
    const pinTags = new Set(pin.tags.map(t => t.toLowerCase()));
    return state.pins
      .filter(p => p.id !== pin.id)
      .map(p => ({ pin: p, score: (p.tags || []).filter(t => pinTags.has(t.toLowerCase())).length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 16)
      .map(s => s.pin);
  }, [pin.id, pin.tags, state.pins]);

  const isSaved = !!savedBoard || justSaved;
  const boardDisplayName = savedBoard ? savedBoard.name : (justSaved ? savedToBoardName : (quickSaveBoard?.name || 'Profile'));

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    addComment(pin.id, commentText.trim());
    setCommentText('');
  };

  const handleQuickSave = () => {
    if (savedBoard) return;
    if (quickSaveBoard) {
      savePinToBoard(pin.id, quickSaveBoard.id);
      setJustSaved(true);
      setSavedToBoardName(quickSaveBoard.name);
      showToastMsg(`Saved to ${quickSaveBoard.name}`);
      setTimeout(() => setJustSaved(false), 3000);
    }
  };

  const handleSaveToBoard = (boardId) => {
    const board = state.boards.find(b => b.id === boardId);
    savePinToBoard(pin.id, boardId);
    setShowBoardDropdown(false);
    setJustSaved(true);
    setSavedToBoardName(board?.name || '');
    showToastMsg(`Saved to ${board?.name || 'board'}`);
    setTimeout(() => setJustSaved(false), 3000);
  };

  const handleCreateBoardInline = () => {
    if (newBoardName.trim()) {
      const newBoard = createBoard({ name: newBoardName, privacy: 'public' });
      if (newBoard) {
        savePinToBoard(pin.id, newBoard.id);
        setJustSaved(true);
        setSavedToBoardName(newBoard.name);
        showToastMsg(`Saved to ${newBoard.name}`);
        setTimeout(() => setJustSaved(false), 3000);
      }
      setNewBoardName('');
      setShowCreateInline(false);
      setShowBoardDropdown(false);
    }
  };

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard?.writeText(`${window.location.origin}/pin/${pin.id}`);
    } catch {
      // Clipboard permission can be unavailable in sandboxed browsers; still provide stable UI feedback.
    }
    showToastMsg('Link copied!');
  };

  const handleDownloadImage = async () => {
    await downloadPinImage(pin);
    showToastMsg('Image download started');
  };

  const filteredBoards = boardSearch
    ? myBoards.filter(b => b.name.toLowerCase().includes(boardSearch.toLowerCase()))
    : myBoards;

  const sourceDomain = getSourceDomain(pin.url, pin.source);

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      {/* Pin Detail Card */}
      <div className="max-w-[1016px] mx-auto mt-4 mb-8 bg-white rounded-[32px] shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="w-full md:w-1/2 bg-[#e5e5e0] flex items-center justify-center">
            <img
              src={pin.image}
              alt={pin.altText || pin.title}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 p-8 flex flex-col">
            {/* Action bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-1">
                <button className="p-2.5 hover:bg-gray-100 rounded-full" onClick={handleCopyLink} title="Copy Pin link">
                  <Upload size={18} />
                </button>
                <button className="p-2.5 hover:bg-gray-100 rounded-full" onClick={handleDownloadImage} title="Download image">
                  <LinkIcon size={18} />
                </button>
                <button
                  className={cn(
                    "p-2.5 hover:bg-gray-100 rounded-full flex items-center gap-1 transition-colors",
                    isLiked ? 'text-xinterest-red' : ''
                  )}
                  onClick={() => likePin(pin.id)}
                >
                  <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                  {pin.likes > 0 && <span className="text-sm font-semibold">{pin.likes}</span>}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative" ref={boardDropdownRef}>
                  <button
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#e5e5e0] hover:bg-[#d5d5d0] font-semibold text-sm"
                    onClick={() => setShowBoardDropdown(!showBoardDropdown)}
                  >
                    {boardDisplayName}
                    <ChevronDown size={14} />
                  </button>

                  {showBoardDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                      <div className="p-3 border-b border-gray-100 text-center">
                        <p className="text-sm font-bold">Save to board</p>
                      </div>
                      <div className="p-3">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search"
                            className="w-full pl-9 pr-3 py-2 bg-[#e5e5e0] rounded-lg text-sm outline-none"
                            value={boardSearch}
                            onChange={e => setBoardSearch(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto px-2">
                        {filteredBoards.map(board => (
                          <button
                            key={board.id}
                            className="w-full text-left px-2 py-2 hover:bg-gray-100 flex items-center gap-3 rounded-lg"
                            onClick={() => handleSaveToBoard(board.id)}
                          >
                            <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                              {state.pins.find(p => board.pins[0] === p.id) && (
                                <img src={state.pins.find(p => board.pins[0] === p.id).image} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-sm truncate block">{board.name}</span>
                              <span className="text-xs text-gray-400">{board.pins.length} Pins</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 p-2">
                        {!showCreateInline ? (
                          <button
                            className="w-full text-left px-2 py-2 hover:bg-gray-100 flex items-center gap-3 rounded-lg text-sm font-semibold"
                            onClick={() => setShowCreateInline(true)}
                          >
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Plus size={18} />
                            </div>
                            Create board
                          </button>
                        ) : (
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Board name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none mb-2"
                              value={newBoardName}
                              onChange={e => setNewBoardName(e.target.value)}
                              autoFocus
                              onKeyDown={e => { if (e.key === 'Enter') handleCreateBoardInline(); }}
                            />
                            <button
                              className="w-full py-2 bg-xinterest-red text-white rounded-lg text-sm font-semibold hover:bg-xinterest-hover disabled:opacity-50"
                              disabled={!newBoardName.trim()}
                              onClick={handleCreateBoardInline}
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
                  className={cn(
                    "px-6 py-2.5 rounded-full font-bold text-white transition-colors",
                    isSaved ? 'bg-black' : 'bg-xinterest-red hover:bg-xinterest-hover'
                  )}
                  onClick={handleQuickSave}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Source link */}
            {sourceDomain && (
              <a
                href={pin.url}
                target="_blank"
                rel="noreferrer"
                className="text-[14px] font-semibold text-black hover:underline flex items-center gap-1.5 mb-4"
              >
                <ArrowUpRight size={14} />
                {sourceDomain}
              </a>
            )}

            <h1 className="text-[28px] font-bold mb-3 leading-tight">{pin.title}</h1>
            <p className="text-gray-600 text-[15px] mb-6 leading-relaxed">{pin.description}</p>

            {/* Author */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${pinAuthor.id}`)}
              >
                <img src={pinAuthor.avatar} alt={pinAuthor.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-[15px] hover:underline">{pinAuthor.name}</p>
                  <p className="text-sm text-gray-500">{pinAuthor.followers.length} followers</p>
                </div>
              </div>
              {!isOwnPin && (
                <button
                  className={`px-5 py-2.5 rounded-full font-semibold text-[15px] transition-colors ${
                    isFollowing ? 'bg-black text-white' : 'bg-[#e5e5e0] hover:bg-[#d5d5d0] text-black'
                  }`}
                  onClick={() => followUser(pinAuthor.id)}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            {/* Comments */}
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="font-bold text-[17px] mb-3">
                Comments
                {pinComments.length > 0 && <span className="text-gray-400 font-normal ml-2">{pinComments.length}</span>}
              </h3>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[250px]">
                {pinComments.length === 0 ? (
                  <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
                ) : (
                  pinComments.map(comment => {
                    const commentUser = state.users.find(u => u.id === comment.userId) || { name: 'Unknown', avatar: '' };
                    const isCommentLiked = (comment.likedBy || []).includes(state.currentUser.id);
                    const isOwnComment = comment.userId === state.currentUser.id;

                    return (
                      <div key={comment.id} className="flex gap-2.5 group/comment">
                        <img src={commentUser.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px]">
                            <span className="font-bold mr-1">{commentUser.name}</span>
                            {comment.text}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400">{relativeTime(comment.createdAt)}</span>
                            <button
                              className={`flex items-center gap-0.5 text-xs ${isCommentLiked ? 'text-xinterest-red' : 'text-gray-400 hover:text-gray-600'}`}
                              onClick={() => likeComment(comment.id)}
                            >
                              <Heart size={12} fill={isCommentLiked ? 'currentColor' : 'none'} />
                              {comment.likes > 0 && <span>{comment.likes}</span>}
                            </button>
                            {isOwnComment && (
                              <button
                                className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover/comment:opacity-100"
                                onClick={() => deleteComment(comment.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comment Input */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <img src={state.currentUser.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(); } }}
                    className="flex-1 px-4 py-2 rounded-full border-2 border-gray-200 focus:border-gray-400 focus:outline-none text-sm"
                  />
                  {commentText.trim() && (
                    <button
                      className="px-4 py-2 rounded-full bg-xinterest-red text-white font-semibold text-sm hover:bg-xinterest-hover"
                      onClick={handlePostComment}
                    >
                      Post
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More like this */}
      {relatedPins.length > 0 && (
        <div className="max-w-[1800px] mx-auto px-4 pb-8">
          <h2 className="text-xl font-bold mb-4 text-center">More like this</h2>
          <MasonryGrid
            pins={relatedPins}
            onPinClick={(p) => navigate(`/pin/${p.id}`)}
            onPinDeleted={() => {}}
          />
        </div>
      )}

      {relatedPinModal && (
        <PinModal
          pin={relatedPinModal}
          onClose={() => setRelatedPinModal(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-[100] text-sm font-semibold">
          {toast}
        </div>
      )}
    </div>
  );
};

export default PinDetail;
