import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus, X } from 'lucide-react';
import Card from './Card';
import { useStore } from '../context/StoreContext';

const List = ({ list, index, onCardClick, onQuickAction, filter }) => {
  const { state, dispatch } = useStore();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(list.title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoveAllOpen, setIsMoveAllOpen] = useState(false);
  const [isCopyListOpen, setIsCopyListOpen] = useState(false);
  const [copyListTitle, setCopyListTitle] = useState(`Copy of ${list.title}`);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;
    dispatch({
      type: 'ADD_CARD',
      payload: {
        title: newCardTitle,
        listId: list.id,
        boardId: list.boardId
      }
    });
    setNewCardTitle('');
    setIsAddingCard(true); // Keep input open
  };

  const handleUpdateTitle = () => {
    if (titleText !== list.title) {
      dispatch({
        type: 'UPDATE_LIST_TITLE',
        payload: { listId: list.id, title: titleText }
      });
    }
    setIsEditingTitle(false);
  };

  const handleArchiveList = () => {
    dispatch({
      type: 'ARCHIVE_LIST',
      payload: { listId: list.id, boardId: list.boardId }
    });
    setIsArchiveConfirmOpen(false);
  }

  const handleSortList = (type) => {
    dispatch({
      type: 'SORT_LIST',
      payload: { listId: list.id, type }
    });
  }

  // Filter cards logic
  const filteredCardIds = list.cardIds.filter(cardId => {
    const card = state.cards[cardId];
    if (!card) return false;
    
    // If no filters, show all
    if (!filter.label && !filter.due) return true;
    
    let matchesLabel = true;
    let matchesDue = true;

    if (filter.label) {
      matchesLabel = (card.labelIds || []).includes(filter.label);
    }

    if (filter.due) {
      if (!card.dueDate) return false;
      const now = new Date();
      const due = new Date(card.dueDate);
      const diffHours = (due - now) / (1000 * 60 * 60);

      if (filter.due === 'overdue') matchesDue = due < now && !card.completed;
      if (filter.due === 'soon') matchesDue = diffHours > 0 && diffHours < 24 && !card.completed;
      if (filter.due === 'complete') matchesDue = card.completed;
    }

    return matchesLabel && matchesDue;
  });

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-72 flex-shrink-0 h-full max-h-full flex flex-col"
        >
          <div 
            className="bg-xrello-gray rounded-xl max-h-full flex flex-col shadow-sm mx-1.5"
          >
            {/* List Header - This is now the drag handle */}
            <div 
              className="p-2.5 flex justify-between items-start gap-2 cursor-grab active:cursor-grabbing"
              {...provided.dragHandleProps}
            >
              {isEditingTitle ? (
                <input 
                  autoFocus
                  className="w-full px-2 py-1 text-sm font-semibold border-2 border-blue-500 rounded focus:outline-none"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                  onClick={(e) => e.stopPropagation()} // Prevent drag when clicking input
                  onMouseDown={(e) => e.stopPropagation()} // Prevent drag start on input
                />
              ) : (
                <h2 
                  onClick={() => setIsEditingTitle(true)}
                  className="px-2.5 py-1 text-sm font-semibold text-xrello-text cursor-pointer w-full"
                >
                  {list.title}
                </h2>
              )}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-gray-300 rounded text-gray-600"
                >
                  <MoreHorizontal size={16} />
                </button>
                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-full bg-white shadow-lg rounded p-2 z-30 w-52 border border-gray-200">
                    <div className="flex justify-between items-center mb-1 px-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">List actions</span>
                      <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                    </div>
                    <button onClick={() => { handleSortList('title'); setIsMenuOpen(false); }} className="text-gray-700 text-sm hover:bg-gray-100 w-full text-left px-2 py-1 rounded">Sort by Title</button>
                    <button onClick={() => { handleSortList('date'); setIsMenuOpen(false); }} className="text-gray-700 text-sm hover:bg-gray-100 w-full text-left px-2 py-1 rounded">Sort by Date</button>
                    <div className="h-px bg-gray-200 my-1"></div>
                    <button
                      onClick={() => { setIsMoveAllOpen(true); setIsMenuOpen(false); }}
                      className="text-gray-700 text-sm hover:bg-gray-100 w-full text-left px-2 py-1 rounded"
                    >
                      Move all cards in this list...
                    </button>
                    <button
                      onClick={() => { setCopyListTitle(`Copy of ${list.title}`); setIsCopyListOpen(true); setIsMenuOpen(false); }}
                      className="text-gray-700 text-sm hover:bg-gray-100 w-full text-left px-2 py-1 rounded"
                    >
                      Copy list
                    </button>
                    <div className="h-px bg-gray-200 my-1"></div>
                    <button onClick={() => { setIsArchiveConfirmOpen(true); setIsMenuOpen(false); }} className="text-red-600 text-sm hover:bg-red-50 w-full text-left px-2 py-1 rounded">Archive List</button>
                  </div>
                )}
                {/* Archive List Confirm Popover */}
                {isArchiveConfirmOpen && (
                  <div className="absolute right-0 top-full bg-white shadow-xl rounded p-3 z-30 w-56 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">Archive List?</h4>
                      <button onClick={() => setIsArchiveConfirmOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">This will archive the list and all its cards. You can view archived items in board settings.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleArchiveList}
                        className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 flex-1"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => setIsArchiveConfirmOpen(false)}
                        className="bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {/* Move All Cards Popover */}
                {isMoveAllOpen && (
                  <div className="absolute right-0 top-full bg-white shadow-xl rounded p-3 z-30 w-56 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">Move all cards to...</h4>
                      <button onClick={() => setIsMoveAllOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                    </div>
                    <div className="space-y-1">
                      {(state.boards[list.boardId]?.listIds || [])
                        .filter(lid => lid !== list.id)
                        .map(lid => {
                          const l = state.lists[lid];
                          if (!l) return null;
                          return (
                            <button
                              key={lid}
                              onClick={() => {
                                dispatch({ type: 'MOVE_ALL_CARDS', payload: { srcListId: list.id, destListId: lid } });
                                setIsMoveAllOpen(false);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-sm text-gray-700"
                            >
                              {l.title}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
                {/* Copy List Popover */}
                {isCopyListOpen && (
                  <div className="absolute right-0 top-full bg-white shadow-xl rounded p-3 z-30 w-56 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">Copy list</h4>
                      <button onClick={() => setIsCopyListOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                    </div>
                    <input
                      autoFocus
                      className="w-full border rounded px-2 py-1.5 text-sm mb-2"
                      value={copyListTitle}
                      onChange={(e) => setCopyListTitle(e.target.value)}
                      placeholder="List title"
                    />
                    <button
                      onClick={() => {
                        dispatch({ type: 'COPY_LIST', payload: { listId: list.id, boardId: list.boardId, newTitle: copyListTitle.trim() || `Copy of ${list.title}` } });
                        setIsCopyListOpen(false);
                      }}
                      className="bg-blue-600 text-white w-full py-1.5 rounded text-sm hover:bg-blue-700"
                    >
                      Create list
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cards Container */}
            <Droppable droppableId={list.id} type="card">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`px-2 flex-1 overflow-y-auto min-h-[20px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                >
                  {filteredCardIds.map((cardId, index) => {
                    const card = state.cards[cardId];
                    if (!card) return null;
                    return (
                      <Card
                        key={card.id}
                        card={card}
                        index={index}
                        onClick={() => onCardClick(card.id)}
                        onQuickAction={onQuickAction}
                      />
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add Card Footer */}
            <div className="p-2">
              {isAddingCard ? (
                <div className="w-full">
                  <textarea
                    autoFocus
                    placeholder="Enter a title for this card..."
                    className="w-full p-2 rounded shadow-sm border-none focus:ring-2 focus:ring-blue-500 text-sm resize-none mb-2"
                    rows="3"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddCard();
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleAddCard}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                    >
                      Add card
                    </button>
                    <button 
                      onClick={() => setIsAddingCard(false)}
                      className="text-gray-600 hover:text-gray-800 p-1.5 hover:bg-gray-300 rounded"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingCard(true)}
                  className="w-full flex items-center gap-2 text-gray-600 hover:bg-gray-300/50 p-2 rounded text-sm font-medium text-left transition-colors"
                >
                  <Plus size={16} />
                  Add a card
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default List;