import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Star, Users, MoreHorizontal, Plus, X, Activity, Image as ImageIcon, Archive, Filter, Zap, RotateCcw, Lock, Globe } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import List from './List';
import CardModal from './CardModal';
import Navbar from './Navbar';

const Board = () => {
  const { boardId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, dispatch } = useStore();
  const board = state.boards[boardId];
  const users = state.users || {};

  const [selectedCardId, setSelectedCardId] = useState(null);

  // Track last visited time
  useEffect(() => {
    if (board) {
      dispatch({ type: 'UPDATE_BOARD', payload: { boardId: board.id, field: 'lastVisitedAt', value: new Date().toISOString() } });
    }
  }, [boardId]);

  // Handle openCard from search results
  useEffect(() => {
    const openCard = searchParams.get('openCard');
    if (openCard && state.cards[openCard]) {
      setSelectedCardId(openCard);
      // Remove the query param after using it
      searchParams.delete('openCard');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setIsShareOpen(false);
      setIsPowerUpOpen(false);
      setIsFilterOpen(false);
      setIsVisibilityOpen(false);
      setIsMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [cardModalInitialAction, setCardModalInitialAction] = useState(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPowerUpOpen, setIsPowerUpOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUserId, setShareUserId] = useState('');
  const [sharePermission, setSharePermission] = useState('member');
  const [shareMessage, setShareMessage] = useState('');

  const [filter, setFilter] = useState({ label: null, due: null });
  const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
  const [boardTitleText, setBoardTitleText] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);

  if (!board) return <div className="text-white p-10">Board not found</div>;

  const boardLabels = board.labels || [];
  const boardMemberIds = board.memberIds || [];
  const availableShareUsers = Object.values(users).filter(user => !boardMemberIds.includes(user.id));
  const boardPowerUps = board.powerUps || [];
  const powerUps = [
    { id: 'calendar', name: 'Calendar', desc: 'See due dates in a local calendar view.', icon: 'Calendar' },
    { id: 'voting', name: 'Voting', desc: 'Record local votes on cards for prioritization.', icon: 'Vote' },
    { id: 'google-drive', name: 'Google Drive', desc: 'Track Drive-style file attachment workflows locally.', icon: 'Drive' },
    { id: 'slack', name: 'Slack', desc: 'Create local notification entries for card activity.', icon: 'Slack' },
    { id: 'custom-fields', name: 'Custom Fields', desc: 'Enable local board-level custom field metadata.', icon: 'Fields' },
    { id: 'map-view', name: 'Map View', desc: 'Enable location metadata for cards in the sandbox.', icon: 'Map' }
  ];

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'list') {
      dispatch({
        type: 'MOVE_LIST',
        payload: {
          sourceIndex: source.index,
          destinationIndex: destination.index,
          boardId: board.id
        }
      });
      return;
    }

    dispatch({
      type: 'MOVE_CARD',
      payload: {
        source,
        destination,
        draggableId
      }
    });
  };

  const handleAddList = () => {
    if (!newListTitle.trim()) return;
    dispatch({
      type: 'ADD_LIST',
      payload: { title: newListTitle, boardId: board.id }
    });
    setNewListTitle('');
    setIsAddingList(false);
  };

  const changeBackground = (bg) => {
    dispatch({
      type: 'UPDATE_BOARD',
      payload: { boardId: board.id, field: 'background', value: bg }
    });
  };

  const handleRestoreList = (listId) => {
    dispatch({
      type: 'RESTORE_LIST',
      payload: { listId, boardId: board.id }
    });
  };

  const handleRestoreCard = (cardId) => {
    const card = state.cards[cardId];
    if (card) {
      dispatch({
        type: 'RESTORE_CARD',
        payload: { cardId, listId: card.listId }
      });
    }
  };

  const handleQuickAction = (cardId, action) => {
    setCardModalInitialAction(action);
    setSelectedCardId(cardId);
  };

  const handleInviteMember = () => {
    if (!shareUserId) return;
    const nextMembers = boardMemberIds.includes(shareUserId)
      ? boardMemberIds
      : [...boardMemberIds, shareUserId];
    const nextShareSettings = {
      ...(board.shareSettings || {}),
      permissions: {
        ...(board.shareSettings?.permissions || {}),
        [shareUserId]: sharePermission
      },
      lastInvitedAt: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_BOARD', payload: { boardId: board.id, field: 'memberIds', value: nextMembers } });
    dispatch({ type: 'UPDATE_BOARD', payload: { boardId: board.id, field: 'shareSettings', value: nextShareSettings } });
    setShareMessage(`${users[shareUserId]?.name || 'Member'} added as ${sharePermission}.`);
    setShareUserId('');
  };

  const handleCopyShareLink = async () => {
    const sid = searchParams.get('sid') || sessionStorage.getItem('mock_sid') || '';
    const shareLink = `${window.location.origin}/board/${board.id}${sid ? `?sid=${encodeURIComponent(sid)}` : ''}`;
    const nextShareSettings = {
      ...(board.shareSettings || {}),
      link: shareLink,
      linkCopiedAt: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_BOARD', payload: { boardId: board.id, field: 'shareSettings', value: nextShareSettings } });
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareMessage('Board link copied.');
    } catch (e) {
      setShareMessage(shareLink);
    }
  };

  const togglePowerUp = (powerUpId) => {
    const isEnabled = boardPowerUps.includes(powerUpId);
    const nextPowerUps = isEnabled
      ? boardPowerUps.filter(id => id !== powerUpId)
      : [...boardPowerUps, powerUpId];
    dispatch({ type: 'UPDATE_BOARD', payload: { boardId: board.id, field: 'powerUps', value: nextPowerUps } });
  };

  // Collect real activity data from all cards on this board
  const allActivities = [];
  for (const listId of board.listIds) {
    const list = state.lists[listId];
    if (!list) continue;
    for (const cardId of list.cardIds) {
      const card = state.cards[cardId];
      if (!card) continue;
      for (const comment of (card.comments || [])) {
        if (comment.type === 'activity') {
          allActivities.push({ ...comment, cardTitle: card.title });
        }
      }
    }
  }
  allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recentActivities = allActivities.slice(0, 10);

  return (
    <div
      className="h-screen flex flex-col bg-cover bg-center transition-all duration-500"
      style={{
        backgroundImage: board.background.startsWith('http') ? `url(${board.background})` : undefined,
        backgroundColor: !board.background.startsWith('http') ? board.background : undefined
      }}
    >
      <Navbar />

      {/* Board Header */}
      <div className="h-14 bg-black/20 backdrop-blur-sm flex items-center justify-between px-4 text-white shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          {isEditingBoardTitle ? (
            <input
              autoFocus
              className="text-xl font-bold px-2 py-1 rounded bg-transparent text-white border-2 border-blue-400 focus:outline-none"
              value={boardTitleText}
              onChange={(e) => setBoardTitleText(e.target.value)}
              onBlur={() => {
                if (boardTitleText.trim() && boardTitleText !== board.title) {
                  dispatch({ type: 'UPDATE_BOARD', payload: { boardId: board.id, field: 'title', value: boardTitleText.trim() } });
                }
                setIsEditingBoardTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (boardTitleText.trim() && boardTitleText !== board.title) {
                    dispatch({ type: 'UPDATE_BOARD', payload: { boardId: board.id, field: 'title', value: boardTitleText.trim() } });
                  }
                  setIsEditingBoardTitle(false);
                }
                if (e.key === 'Escape') {
                  setIsEditingBoardTitle(false);
                }
              }}
              onFocus={(e) => e.target.select()}
            />
          ) : (
            <h1
              onClick={() => { setBoardTitleText(board.title); setIsEditingBoardTitle(true); }}
              className="text-xl font-bold px-2 py-1 rounded hover:bg-white/20 cursor-pointer"
            >
              {board.title}
            </h1>
          )}
          <button
            onClick={() => dispatch({ type: 'UPDATE_BOARD', payload: { boardId: board.id, field: 'starred', value: !board.starred } })}
            className={`p-1.5 rounded hover:bg-white/20 ${board.starred ? 'text-yellow-400' : 'text-white'}`}
          >
            <Star size={18} fill={board.starred ? "currentColor" : "none"} />
          </button>
          <div className="h-4 w-[1px] bg-white/30"></div>
          <div className="relative">
            <button
              onClick={() => setIsVisibilityOpen(!isVisibilityOpen)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm font-medium flex items-center gap-1.5"
            >
              {board.visibility === 'private' && <Lock size={14} />}
              {board.visibility === 'workspace' && <Users size={14} />}
              {board.visibility === 'public' && <Globe size={14} />}
              {board.visibility}
            </button>
            {isVisibilityOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded shadow-xl text-gray-800 p-2 z-30">
                <div className="flex justify-between items-center mb-2 px-2">
                  <h4 className="text-sm font-semibold text-gray-700">Change Visibility</h4>
                  <button onClick={() => setIsVisibilityOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={14}/></button>
                </div>
                {[
                  { value: 'private', icon: Lock, label: 'Private', desc: 'Only board members can see this' },
                  { value: 'workspace', icon: Users, label: 'Workspace', desc: 'All Workspace members can see this' },
                  { value: 'public', icon: Globe, label: 'Public', desc: 'Anyone can see this' },
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        dispatch({ type: 'UPDATE_BOARD', payload: { boardId: board.id, field: 'visibility', value: opt.value } });
                        setIsVisibilityOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-start gap-2 ${board.visibility === opt.value ? 'bg-blue-50' : ''}`}
                    >
                      <Icon size={16} className="mt-0.5 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium">{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex -space-x-2">
            {boardMemberIds.map(mid => {
              const user = users[mid];
              if (!user) return null;
              return (
                <div key={mid} className="w-7 h-7 rounded-full border-2 border-transparent overflow-hidden bg-gray-400 text-xs flex items-center justify-center" title={user.name}>
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
              );
            })}
          </div>
          <button
            onClick={() => {
              setShareUserId(availableShareUsers[0]?.id || '');
              setShareMessage('');
              setIsShareOpen(true);
            }}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm font-medium flex items-center gap-2"
          >
            <Users size={14} /> Share
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Power-Ups Button */}
          <button
            onClick={() => setIsPowerUpOpen(true)}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm font-medium flex items-center gap-2"
          >
            <Zap size={14} /> Power-Ups
          </button>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-3 py-1.5 hover:bg-white/30 rounded text-sm font-medium flex items-center gap-2 ${filter.label || filter.due ? 'bg-blue-600 text-white' : 'bg-white/20'}`}
            >
              <Filter size={14} /> Filter
            </button>
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded shadow-xl text-gray-800 p-4 z-20">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-gray-600">Filter Cards</h3>
                  <button onClick={() => setIsFilterOpen(false)}><X size={16}/></button>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">By Label</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setFilter(p => ({ ...p, label: null }))}
                      className={`w-full text-left px-2 py-1 rounded text-sm ${!filter.label ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
                    >
                      All Labels
                    </button>
                    {boardLabels.map(l => (
                      <button
                        key={l.id}
                        onClick={() => setFilter(p => ({ ...p, label: l.id === p.label ? null : l.id }))}
                        className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"
                      >
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: l.color }}></div>
                        <span className="text-sm">{l.name}</span>
                        {filter.label === l.id && <X size={12} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">By Due Date</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setFilter(p => ({ ...p, due: null }))}
                      className={`w-full text-left px-2 py-1 rounded text-sm ${!filter.due ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
                    >
                      Any Date
                    </button>
                    <button onClick={() => setFilter(p => ({ ...p, due: 'overdue' }))} className={`w-full text-left px-2 py-1 rounded text-sm ${filter.due === 'overdue' ? 'bg-red-50 text-red-700' : 'hover:bg-gray-100'}`}>Overdue</button>
                    <button onClick={() => setFilter(p => ({ ...p, due: 'soon' }))} className={`w-full text-left px-2 py-1 rounded text-sm ${filter.due === 'soon' ? 'bg-yellow-50 text-yellow-700' : 'hover:bg-gray-100'}`}>Due in 24h</button>
                    <button onClick={() => setFilter(p => ({ ...p, due: 'complete' }))} className={`w-full text-left px-2 py-1 rounded text-sm ${filter.due === 'complete' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'}`}>Completed</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-white/20 rounded flex items-center gap-2 text-sm font-medium"
          >
            <MoreHorizontal size={20} />
            <span className="hidden sm:inline">Show Menu</span>
          </button>
        </div>
      </div>

      {/* Board Canvas */}
      <div className="flex-1 overflow-hidden relative">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="h-full overflow-x-auto overflow-y-hidden flex items-start px-4 py-6 gap-2"
              >
                {board.listIds.map((listId, index) => {
                  const list = state.lists[listId];
                  if (!list) return null;
                  return (
                    <List
                      key={list.id}
                      list={list}
                      index={index}
                      onCardClick={setSelectedCardId}
                      onQuickAction={handleQuickAction}
                      filter={filter}
                    />
                  );
                })}
                {provided.placeholder}

                {/* Add List Button */}
                <div className="w-72 flex-shrink-0 mx-1.5">
                  {isAddingList ? (
                    <div className="bg-gray-100 p-2 rounded-xl shadow-sm">
                      <input
                        autoFocus
                        className="w-full px-2 py-1.5 text-sm border-2 border-blue-500 rounded mb-2 focus:outline-none"
                        placeholder="Enter list title..."
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleAddList}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                        >
                          Add list
                        </button>
                        <button
                          onClick={() => setIsAddingList(false)}
                          className="text-gray-600 hover:text-gray-800 p-1.5 hover:bg-gray-300 rounded"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingList(true)}
                      className="w-full bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl flex items-center gap-2 font-medium transition-colors backdrop-blur-sm"
                    >
                      <Plus size={16} />
                      Add another list
                    </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Board Menu Sidebar */}
        <div
          className={`absolute top-0 right-0 h-full w-80 bg-gray-100 shadow-2xl transform transition-transform duration-300 z-10 flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-4 border-b border-gray-300 flex justify-between items-center">
            <h2 className="font-bold text-gray-700 text-center flex-1">Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-gray-800">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* About */}
            <section>
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Activity size={16} />
                <h3>About this board</h3>
              </div>
              {isEditingDescription ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    className="w-full min-h-[80px] p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    placeholder="Add a description..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        dispatch({ type: 'UPDATE_BOARD', payload: { boardId: board.id, field: 'description', value: descriptionText } });
                        setIsEditingDescription(false);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >Save</button>
                    <button onClick={() => { setIsEditingDescription(false); setDescriptionText(board.description || ''); }} className="text-gray-600 px-2 py-1 text-sm hover:bg-gray-200 rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => { setDescriptionText(board.description || ''); setIsEditingDescription(true); }}
                  className={`text-sm leading-relaxed cursor-pointer rounded p-2 ${board.description ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-400 bg-gray-200 hover:bg-gray-300'}`}
                >
                  {board.description ? (
                    board.description.split('\n').map((line, i) => {
                      // Basic markdown: bold, italic
                      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                      const rendered = parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) return <strong key={j}>{part.slice(2, -2)}</strong>;
                        if (part.startsWith('*') && part.endsWith('*')) return <em key={j}>{part.slice(1, -1)}</em>;
                        return part;
                      });
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return <div key={i} className="flex gap-1"><span>&bull;</span><span>{rendered}</span></div>;
                      }
                      return <div key={i} className="min-h-[1.2em]">{rendered}</div>;
                    })
                  ) : (
                    'Add a description...'
                  )}
                </div>
              )}
            </section>

            {/* Backgrounds */}
            <section>
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <ImageIcon size={16} />
                <h3>Change Background</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => changeBackground('#0079BF')}
                  className="h-16 rounded bg-[#0079BF] hover:opacity-80"
                ></button>
                <button
                  onClick={() => changeBackground('#D29034')}
                  className="h-16 rounded bg-[#D29034] hover:opacity-80"
                ></button>
                <button
                  onClick={() => changeBackground('#519839')}
                  className="h-16 rounded bg-[#519839] hover:opacity-80"
                ></button>
                <button
                  onClick={() => changeBackground('#B04632')}
                  className="h-16 rounded bg-[#B04632] hover:opacity-80"
                ></button>
                <button
                  onClick={() => changeBackground('https://picsum.photos/1920/1080?random=bg1')}
                  className="h-16 rounded bg-cover bg-center hover:opacity-80"
                  style={{ backgroundImage: 'url(https://picsum.photos/1920/1080?random=bg1)' }}
                ></button>
                <button
                  onClick={() => changeBackground('https://picsum.photos/1920/1080?random=bg2')}
                  className="h-16 rounded bg-cover bg-center hover:opacity-80"
                  style={{ backgroundImage: 'url(https://picsum.photos/1920/1080?random=bg2)' }}
                ></button>
              </div>
            </section>

            {/* Archived Items */}
            <section>
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Archive size={16} />
                <h3>Archived Items</h3>
              </div>
              <div className="space-y-2">
                {board.archivedListIds?.length > 0 && (
                  <div className="bg-gray-200 p-2 rounded">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Lists</h4>
                    {board.archivedListIds.map(id => {
                      const list = state.lists[id];
                      if(!list) return null;
                      return (
                        <div key={id} className="flex justify-between items-center text-sm mb-1">
                          <span>{list.title}</span>
                          <button onClick={() => handleRestoreList(id)} className="text-blue-600 hover:underline flex items-center gap-1">
                            <RotateCcw size={12} /> Send to board
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {board.archivedCardIds?.length > 0 && (
                  <div className="bg-gray-200 p-2 rounded">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Cards</h4>
                    {board.archivedCardIds.map(id => {
                      const card = state.cards[id];
                      if(!card) return null;
                      return (
                        <div key={id} className="flex justify-between items-center text-sm mb-1">
                          <span>{card.title}</span>
                          <button onClick={() => handleRestoreCard(id)} className="text-blue-600 hover:underline flex items-center gap-1">
                            <RotateCcw size={12} /> Send to board
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(!board.archivedListIds?.length && !board.archivedCardIds?.length) && (
                  <div className="text-sm text-gray-500 italic">No archived items</div>
                )}
              </div>
            </section>

            {/* Activity Feed (real data) */}
            <section>
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Activity size={16} />
                <h3>Activity</h3>
              </div>
              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <div className="text-sm text-gray-500 italic">No activity yet</div>
                ) : (
                  recentActivities.map(act => {
                    const user = users[act.userId];
                    return (
                      <div key={act.id} className="flex gap-2 text-sm">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                          <img src={user ? user.avatarUrl : `https://picsum.photos/50/50?random=${act.userId}`} className="rounded-full w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <span className="font-bold">{user ? user.name : act.userId}</span>{' '}
                          {act.text}
                          {act.cardTitle && <span className="text-gray-500"> on {act.cardTitle}</span>}
                          <div className="text-xs text-gray-500">
                            {new Date(act.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsShareOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg text-gray-800" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Share board</h2>
                <p className="text-sm text-gray-500">{board.title}</p>
              </div>
              <button onClick={() => setIsShareOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={22} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-[1fr_120px_auto] gap-2">
                <select
                  value={shareUserId}
                  onChange={(e) => setShareUserId(e.target.value)}
                  className="border rounded px-2 py-2 text-sm bg-white"
                >
                  {availableShareUsers.length === 0 ? (
                    <option value="">All workspace members are on this board</option>
                  ) : (
                    availableShareUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                    ))
                  )}
                </select>
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value)}
                  className="border rounded px-2 py-2 text-sm bg-white"
                >
                  <option value="member">Member</option>
                  <option value="observer">Observer</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={handleInviteMember}
                  disabled={!shareUserId}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Share
                </button>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Board members</h3>
                <div className="space-y-2">
                  {boardMemberIds.map(memberId => {
                    const user = users[memberId];
                    const permission = board.shareSettings?.permissions?.[memberId] || (memberId === state.currentUser ? 'admin' : 'member');
                    if (!user) return null;
                    return (
                      <div key={memberId} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded capitalize">{permission}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-t pt-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Board link</div>
                  <div className="text-xs text-gray-500 truncate max-w-[280px]">{board.shareSettings?.link || `${window.location.origin}/board/${board.id}`}</div>
                </div>
                <button onClick={handleCopyShareLink} className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm font-medium">
                  Copy link
                </button>
              </div>
              {shareMessage && (
                <div className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded p-2">{shareMessage}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Power-Ups Modal */}
      {isPowerUpOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsPowerUpOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Power-Ups</h2>
              <button onClick={() => setIsPowerUpOpen(false)}><X size={24} className="text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {powerUps.map(pu => {
                  const enabled = boardPowerUps.includes(pu.id);
                  return (
                  <div key={pu.name} className="border rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold">{pu.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{pu.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{pu.desc}</p>
                      <button
                        onClick={() => togglePowerUp(pu.id)}
                        className={`px-3 py-1 rounded text-sm font-medium ${enabled ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                      >
                        {enabled ? 'Enabled' : 'Add'}
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
              {boardPowerUps.length > 0 && (
                <div className="mt-6 rounded bg-blue-50 border border-blue-100 p-3 text-sm text-blue-900">
                  Enabled Power-Ups: {boardPowerUps.map(id => powerUps.find(pu => pu.id === id)?.name || id).join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedCardId && (
        <CardModal
          cardId={selectedCardId}
          initialAction={cardModalInitialAction}
          onClose={() => { setSelectedCardId(null); setCardModalInitialAction(null); }}
        />
      )}
    </div>
  );
};

export default Board;
