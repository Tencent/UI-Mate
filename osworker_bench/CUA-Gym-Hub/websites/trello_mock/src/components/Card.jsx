import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, CheckSquare, AlignLeft, Paperclip, Eye, Tag, User, ArrowRight, Archive } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useStore } from '../context/StoreContext';

const Card = ({ card, index, onClick, onQuickAction }) => {
  const { state, dispatch } = useStore();
  const board = state.boards[card.boardId];
  const users = state.users || {};
  const boardLabels = board?.labels || [];

  const [isQuickEditing, setIsQuickEditing] = useState(false);
  const [quickEditTitle, setQuickEditTitle] = useState(card.title);
  const quickEditRef = useRef(null);
  const cardRef = useRef(null);
  const [isArchiveConfirming, setIsArchiveConfirming] = useState(false);

  // Resolve labels from board-level definitions
  const resolvedLabels = (card.labelIds || [])
    .map(id => boardLabels.find(l => l.id === id))
    .filter(Boolean);

  const completedChecklistItems = card.checklists?.reduce((acc, cl) => acc + cl.items.filter(i => i.completed).length, 0) || 0;
  const totalChecklistItems = card.checklists?.reduce((acc, cl) => acc + cl.items.length, 0) || 0;

  const isOverdue = card.dueDate && isPast(new Date(card.dueDate)) && !card.completed;
  const isDueSoon = card.dueDate && !isPast(new Date(card.dueDate)) && (new Date(card.dueDate) - new Date() < 86400000);

  // Render cover based on type
  const renderCover = () => {
    if (!card.cover) return null;
    if (card.cover.type === 'color') {
      return (
        <div
          className="h-8 w-full rounded-t-lg"
          style={{ backgroundColor: card.cover.value }}
        />
      );
    }
    if (card.cover.type === 'image') {
      return (
        <div
          className="h-32 w-full rounded-t-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${card.cover.value})` }}
        />
      );
    }
    return null;
  };

  const handleQuickEditOpen = (e) => {
    e.stopPropagation();
    setQuickEditTitle(card.title);
    setIsQuickEditing(true);
  };

  const handleQuickEditSave = () => {
    if (quickEditTitle.trim() && quickEditTitle !== card.title) {
      dispatch({ type: 'UPDATE_CARD', payload: { cardId: card.id, field: 'title', value: quickEditTitle.trim() } });
    }
    setIsQuickEditing(false);
  };

  const handleQuickAction = (action) => {
    setIsQuickEditing(false);
    if (onQuickAction) {
      onQuickAction(card.id, action);
    }
  };

  useEffect(() => {
    if (isQuickEditing && quickEditRef.current) {
      const handleClickOutside = (e) => {
        if (quickEditRef.current && !quickEditRef.current.contains(e.target)) {
          setIsQuickEditing(false);
        }
      };
      const handleEsc = (e) => {
        if (e.key === 'Escape') setIsQuickEditing(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isQuickEditing]);

  return (
    <>
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={(el) => { provided.innerRef(el); cardRef.current = el; }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-lg shadow-sm mb-2 group relative hover:bg-gray-50 border-b border-gray-200 ${snapshot.isDragging ? 'rotate-2 shadow-xl z-50' : ''}`}
        >
          {/* Cover */}
          {renderCover()}

          <div className="p-2.5">
            {/* Labels */}
            {resolvedLabels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {resolvedLabels.map(label => (
                  <div
                    key={label.id}
                    className="h-2 w-10 rounded-full"
                    style={{ backgroundColor: label.color }}
                    title={label.name}
                  />
                ))}
              </div>
            )}

            {/* Title */}
            <h3 className="text-gray-800 text-sm mb-1.5 leading-tight">{card.title}</h3>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 text-gray-500 text-xs">
              {/* Due Date */}
              {card.dueDate && (
                <div className={`flex items-center gap-1 px-1 rounded ${
                  card.completed ? 'bg-green-500 text-white' :
                  isOverdue ? 'bg-red-500 text-white' :
                  isDueSoon ? 'bg-yellow-400 text-white' : ''
                }`}>
                  <Clock size={12} />
                  <span>{format(new Date(card.dueDate), 'MMM d')}</span>
                </div>
              )}

              {/* Description Badge */}
              {card.description && <AlignLeft size={14} />}

              {/* Attachments Badge */}
              {card.attachments?.length > 0 && (
                <div className="flex items-center gap-0.5">
                  <Paperclip size={12} />
                  <span>{card.attachments.length}</span>
                </div>
              )}

              {/* Checklist Badge */}
              {totalChecklistItems > 0 && (
                <div className={`flex items-center gap-1 ${completedChecklistItems === totalChecklistItems ? 'bg-green-500 text-white px-1 rounded' : ''}`}>
                  <CheckSquare size={12} />
                  <span>{completedChecklistItems}/{totalChecklistItems}</span>
                </div>
              )}

              {/* Watching Badge */}
              {card.watching && (
                <Eye size={14} className="text-gray-400" />
              )}
            </div>

            {/* Members */}
            {(card.memberIds || []).length > 0 && (
              <div className="flex justify-end -space-x-1 mt-2">
                {(card.memberIds || []).map(mid => {
                  const user = users[mid];
                  return (
                    <div key={mid} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200" title={user ? user.name : mid}>
                      {user ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                          {mid.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drag badge - show source list name */}
          {snapshot.isDragging && (
            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow font-medium whitespace-nowrap">
              {state.lists[card.listId]?.title || ''}
            </div>
          )}

          {/* Hover Edit Button */}
          <button
            onClick={handleQuickEditOpen}
            className="absolute top-1 right-1 p-1 bg-gray-100/80 hover:bg-gray-200 rounded text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
        </div>
      )}
    </Draggable>

    {/* Quick Edit Floating Panel */}
    {isQuickEditing && (
      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setIsQuickEditing(false)}>
        <div
          ref={quickEditRef}
          className="absolute bg-white rounded-lg shadow-2xl w-72 p-0"
          style={{
            top: cardRef.current ? cardRef.current.getBoundingClientRect().top + window.scrollY : 100,
            left: cardRef.current ? cardRef.current.getBoundingClientRect().left : 100,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            autoFocus
            className="w-full p-2 text-sm rounded-t-lg border-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]"
            value={quickEditTitle}
            onChange={(e) => setQuickEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuickEditSave();
              }
              if (e.key === 'Escape') setIsQuickEditing(false);
            }}
          />
          <div className="p-2 flex flex-col gap-1">
            <button
              onClick={handleQuickEditSave}
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 w-fit"
            >
              Save
            </button>
            <div className="flex flex-wrap gap-1 mt-1">
              <button onClick={() => handleQuickAction('labels')} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs text-gray-700">
                <Tag size={12} /> Change Labels
              </button>
              <button onClick={() => handleQuickAction('members')} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs text-gray-700">
                <User size={12} /> Change Members
              </button>
              <button onClick={() => handleQuickAction('dates')} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs text-gray-700">
                <Clock size={12} /> Change Due Date
              </button>
              <button onClick={() => handleQuickAction('move')} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs text-gray-700">
                <ArrowRight size={12} /> Move
              </button>
              <button
                onClick={() => {
                  setIsArchiveConfirming(true);
                }}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs text-gray-700"
              >
                <Archive size={12} /> Archive
              </button>
              {isArchiveConfirming && (
                <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                  <p className="text-xs text-red-700 mb-2">Archive this card?</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        dispatch({ type: 'ARCHIVE_CARD', payload: { cardId: card.id, listId: card.listId } });
                        setIsArchiveConfirming(false);
                        setIsQuickEditing(false);
                      }}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => setIsArchiveConfirming(false)}
                      className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-xs text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Card;
