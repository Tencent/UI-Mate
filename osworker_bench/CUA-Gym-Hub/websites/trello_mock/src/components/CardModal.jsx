import React, { useEffect, useRef, useState } from 'react';
import { X, CreditCard, AlignLeft, CheckSquare, Clock, Tag, User, Paperclip, Activity, Trash2, Plus, ChevronLeft, ChevronRight, Image as ImageIcon, List as ListIcon, Type, Bold, Italic, ArrowRight, Copy, Eye } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const CardModal = ({ cardId, onClose, initialAction }) => {
  const { state, dispatch } = useStore();
  const card = state.cards[cardId];
  const list = state.lists[card.listId];
  const board = state.boards[card.boardId];
  const users = state.users || {};
  const currentUser = state.currentUser || 'u1';

  const [descEditing, setDescEditing] = useState(false);
  const [descText, setDescText] = useState(card.description);
  const [commentText, setCommentText] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [isLabelPickerOpen, setIsLabelPickerOpen] = useState(initialAction === 'labels');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(initialAction === 'dates');
  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(initialAction === 'members');
  const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] = useState(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [showActivityDetails, setShowActivityDetails] = useState(true);
  const [isMovePickerOpen, setIsMovePickerOpen] = useState(initialAction === 'move');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isCopyPickerOpen, setIsCopyPickerOpen] = useState(false);
  const [copyTitle, setCopyTitle] = useState(`Copy of ${card.title}`);
  const [copyBoardId, setCopyBoardId] = useState(card.boardId);
  const [copyListId, setCopyListId] = useState(card.listId);
  const [moveBoardId, setMoveBoardId] = useState(card.boardId);
  const [moveListId, setMoveListId] = useState(card.listId);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editingLabelName, setEditingLabelName] = useState('');
  const [editingLabelColor, setEditingLabelColor] = useState('');
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#61bd4f');
  const [deletingChecklistId, setDeletingChecklistId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [attachmentUploadStatus, setAttachmentUploadStatus] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Resolve board-level labels for this card
  const boardLabels = board?.labels || [];
  const cardLabelIds = card.labelIds || [];
  const resolvedLabels = cardLabelIds
    .map(id => boardLabels.find(l => l.id === id))
    .filter(Boolean);

  // Board members (users who are members of this board)
  const boardMemberIds = board?.memberIds || [];
  const boardMembers = boardMemberIds
    .map(id => users[id])
    .filter(Boolean);

  if (!card) return null;

  const handleSaveDesc = () => {
    dispatch({
      type: 'UPDATE_CARD',
      payload: { cardId, field: 'description', value: descText }
    });
    setDescEditing(false);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    dispatch({
      type: 'ADD_COMMENT',
      payload: { cardId, text: commentText }
    });
    setCommentText('');
  };

  const handleAddChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    dispatch({
      type: 'ADD_CHECKLIST',
      payload: { cardId, title: newChecklistTitle }
    });
    setNewChecklistTitle('');
    setIsAddingChecklist(false);
  };

  const handleDeleteChecklist = (checklistId) => {
    setDeletingChecklistId(checklistId);
  };

  const handleAddItem = (checklistId, text) => {
    if (!text.trim()) return;
    dispatch({
      type: 'ADD_CHECKLIST_ITEM',
      payload: { cardId, checklistId, text }
    });
  };

  const toggleItem = (checklistId, itemId) => {
    dispatch({
      type: 'TOGGLE_CHECKLIST_ITEM',
      payload: { cardId, checklistId, itemId }
    });
  };

  const handleToggleLabel = (labelId) => {
    dispatch({
      type: 'TOGGLE_LABEL',
      payload: { cardId, labelId }
    });
  };

  const handleDateSelect = (date) => {
    dispatch({
      type: 'UPDATE_CARD',
      payload: { cardId, field: 'dueDate', value: date.toISOString() }
    });
  };

  const toggleMember = (userId) => {
    dispatch({
      type: 'TOGGLE_MEMBER',
      payload: { cardId, memberId: userId }
    });
  };

  const getSid = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sid') || sessionStorage.getItem('mock_sid') || '';
  };

  const handleAttachmentFiles = async (files) => {
    const selectedFiles = Array.from(files || []);
    if (selectedFiles.length === 0) return;
    setAttachmentUploadStatus('Uploading...');
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('files', file));
      const sid = getSid();
      const response = await fetch(`/upload${sid ? `?sid=${encodeURIComponent(sid)}` : ''}`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      for (const uploaded of data.files || []) {
        dispatch({
          type: 'ADD_ATTACHMENT',
          payload: {
            cardId,
            name: uploaded.original_name,
            url: uploaded.url,
            size: uploaded.size,
            contentType: uploaded.content_type,
            storedName: uploaded.stored_name
          }
        });
      }
      setAttachmentUploadStatus(`${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} attached.`);
      setIsAttachmentPickerOpen(false);
    } catch (e) {
      setAttachmentUploadStatus('Upload failed. Try another local file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = (attachmentId) => {
    dispatch({
      type: 'DELETE_ATTACHMENT',
      payload: { cardId, attachmentId }
    });
  };

  const handleSetCover = (coverObj) => {
    dispatch({
      type: 'UPDATE_CARD',
      payload: { cardId, field: 'cover', value: coverObj }
    });
    setIsCoverPickerOpen(false);
  };

  const handleMoveCard = () => {
    if (moveListId === card.listId && moveBoardId === card.boardId) {
      setIsMovePickerOpen(false);
      return;
    }
    dispatch({
      type: 'MOVE_CARD_TO_LIST',
      payload: {
        cardId,
        srcListId: card.listId,
        destListId: moveListId,
        destBoardId: moveBoardId
      }
    });
    setIsMovePickerOpen(false);
  };

  const handleCopyCard = () => {
    if (!copyTitle.trim()) return;
    const srcCard = state.cards[cardId];
    // Reset checklists items to uncompleted
    const copiedChecklists = (srcCard.checklists || []).map(cl => ({
      id: uuidv4(),
      title: cl.title,
      items: cl.items.map(item => ({
        id: uuidv4(),
        text: item.text,
        completed: false,
        assigneeId: item.assigneeId,
        dueDate: item.dueDate
      }))
    }));
    dispatch({
      type: 'ADD_CARD',
      payload: {
        title: copyTitle.trim(),
        listId: copyListId,
        boardId: copyBoardId,
        description: srcCard.description,
        labelIds: copyBoardId === srcCard.boardId ? [...(srcCard.labelIds || [])] : [],
        memberIds: [...(srcCard.memberIds || [])],
        dueDate: srcCard.dueDate,
        checklists: copiedChecklists,
        cover: srcCard.cover ? { ...srcCard.cover } : null,
        watching: false
      }
    });
    setIsCopyPickerOpen(false);
  };

  const handleArchiveCard = () => {
    dispatch({
      type: 'ARCHIVE_CARD',
      payload: { cardId, listId: card.listId }
    });
    onClose();
  };

  // Simple Markdown Renderer
  const renderMarkdown = (text) => {
    if (!text) return <span className="text-gray-500">Add a more detailed description...</span>;

    const applyInlineFormatting = (str) => {
      const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={j}>{part.slice(1, -1)}</em>;
        }
        return part;
      });
    };

    return text.split('\n').map((line, i) => {
      let content = line;
      let className = "min-h-[1.2em] mb-1";

      // Headers
      if (line.startsWith('# ')) {
        content = line.substring(2);
        className += " text-xl font-bold";
      } else if (line.startsWith('## ')) {
        content = line.substring(3);
        className += " text-lg font-bold";
      }

      // List items — apply inline formatting to text portion
      if (line.startsWith('- ') || line.startsWith('* ')) {
        content = (
            <div className="flex gap-2">
                <span className="text-gray-500">&bull;</span>
                <span>{applyInlineFormatting(line.substring(2))}</span>
            </div>
        );
      }

      if (typeof content === 'string') {
        content = applyInlineFormatting(content);
      }

      return <div key={i} className={className}>{content}</div>;
    });
  };

  const insertFormat = (fmt) => {
    const textarea = document.getElementById('desc-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = descText;
    let newText = '';

    if (fmt === 'bold') {
        newText = text.substring(0, start) + '**' + text.substring(start, end) + '**' + text.substring(end);
    } else if (fmt === 'italic') {
        newText = text.substring(0, start) + '*' + text.substring(start, end) + '*' + text.substring(end);
    } else if (fmt === 'list') {
        newText = text.substring(0, start) + '\n- ' + text.substring(start, end) + text.substring(end);
    }

    setDescText(newText);
    textarea.focus();
  };

  // Calendar Helpers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calStartDate = startOfWeek(monthStart);
    const calEndDate = endOfWeek(monthEnd);
    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = calStartDate;

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    while (day <= calEndDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const isSelected = card.dueDate && isSameDay(day, new Date(card.dueDate));

        let statusColorClass = "bg-blue-600 text-white hover:bg-blue-700";
        if (isSelected) {
            if (card.completed) {
                statusColorClass = "bg-green-500 text-white hover:bg-green-600";
            } else if (isPast(day) && !isToday(day)) {
                statusColorClass = "bg-red-500 text-white hover:bg-red-600";
            } else if (addDays(new Date(), 1) > day) {
                statusColorClass = "bg-yellow-400 text-white hover:bg-yellow-500";
            }
        }

        days.push(
          <div
            className={`col-span-1 p-2 text-center text-sm cursor-pointer rounded hover:bg-blue-100
              ${!isSameMonth(day, monthStart) ? "text-gray-300" : "text-gray-700"}
              ${isToday(day) ? "font-bold border border-blue-500" : ""}
              ${isSelected ? statusColorClass : ""}
            `}
            key={day}
            onClick={() => handleDateSelect(cloneDay)}
          >
            <span>{formattedDate}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day}>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="w-64">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded"><ChevronLeft size={16} /></button>
          <span className="font-bold text-gray-700">{format(currentMonth, "MMMM yyyy")}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded"><ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(d => (
             <div key={d} className="text-center text-xs font-bold text-gray-500">{d}</div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  // Render cover based on type
  const renderCover = () => {
    if (!card.cover) return null;
    if (card.cover.type === 'color') {
      return (
        <div
          className="h-32 w-full rounded-t-lg relative group"
          style={{ backgroundColor: card.cover.value }}
        >
          <button
            onClick={() => setIsCoverPickerOpen(true)}
            className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Change Cover
          </button>
        </div>
      );
    }
    if (card.cover.type === 'image') {
      return (
        <div
          className="h-32 w-full rounded-t-lg bg-cover bg-center relative group"
          style={{ backgroundImage: `url(${card.cover.value})` }}
        >
          <button
            onClick={() => setIsCoverPickerOpen(true)}
            className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Change Cover
          </button>
        </div>
      );
    }
    return null;
  };

  // Get user display info
  const getUserName = (userId) => {
    const user = users[userId];
    return user ? user.name : userId;
  };
  const getUserAvatar = (userId) => {
    const user = users[userId];
    return user ? user.avatarUrl : `https://picsum.photos/100/100?random=${userId}`;
  };
  const getUserInitials = (userId) => {
    const user = users[userId];
    return user ? user.initials : userId.substring(0, 2).toUpperCase();
  };

  const currentUserObj = users[currentUser];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto pt-12 pb-12" onClick={onClose}>
      <div className="bg-gray-100 w-full max-w-3xl rounded-lg shadow-2xl relative min-h-[600px]" onClick={e => e.stopPropagation()}>
        {renderCover()}

        <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-200 rounded-full text-gray-600 z-10">
          <X size={20} />
        </button>

        <div className="p-6 grid grid-cols-[1fr_200px] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex gap-4">
              <CreditCard className="mt-1 text-gray-600" size={24} />
              <div className="w-full">
                <input
                  className="text-xl font-bold bg-transparent border-2 border-transparent focus:bg-white focus:border-blue-500 rounded w-full px-2 -ml-2 text-gray-800"
                  value={card.title}
                  onChange={(e) => dispatch({ type: 'UPDATE_CARD', payload: { cardId, field: 'title', value: e.target.value }})}
                />
                <p className="text-sm text-gray-500 mt-1">
                  in list <span className="underline">{list.title}</span>
                </p>
              </div>
            </div>

            {/* Labels, Members, Due Date Row */}
            <div className="pl-10 flex flex-wrap gap-6">
              {(card.memberIds || []).length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Members</h3>
                  <div className="flex gap-1 flex-wrap">
                    {(card.memberIds || []).map(mid => {
                      const user = users[mid];
                      return (
                        <div key={mid} className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden" title={user ? user.name : mid}>
                          <img src={getUserAvatar(mid)} alt={getUserName(mid)} className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                    <button
                        onClick={() => setIsMemberPickerOpen(!isMemberPickerOpen)}
                        className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-gray-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {resolvedLabels.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Labels</h3>
                  <div className="flex gap-1 flex-wrap">
                    {resolvedLabels.map(l => (
                      <span key={l.id} className="px-2 py-1 rounded text-white text-sm font-medium" style={{ backgroundColor: l.color }}>
                        {l.name || '\u00A0\u00A0'}
                      </span>
                    ))}
                    <button
                        onClick={() => setIsLabelPickerOpen(!isLabelPickerOpen)}
                        className="bg-gray-200 hover:bg-gray-300 p-1 rounded text-gray-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {card.dueDate && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={card.completed}
                      onChange={(e) => dispatch({ type: 'UPDATE_CARD', payload: { cardId, field: 'completed', value: e.target.checked }})}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                      className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm text-gray-700 flex items-center gap-2"
                    >
                      {format(new Date(card.dueDate), 'MMM d, yyyy')}
                      {card.completed && <span className="bg-green-500 text-white text-xs px-1.5 rounded">Complete</span>}
                      {!card.completed && new Date(card.dueDate) < new Date() && <span className="bg-red-500 text-white text-xs px-1.5 rounded">Overdue</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="flex gap-4">
              <AlignLeft className="mt-1 text-gray-600" size={24} />
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  {!descEditing && (
                    <button onClick={() => { setDescText(card.description); setDescEditing(true); }} className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm">Edit</button>
                  )}
                </div>

                {descEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-1 mb-1">
                        <button onClick={() => insertFormat('bold')} className="p-1 hover:bg-gray-200 rounded" title="Bold"><Bold size={14}/></button>
                        <button onClick={() => insertFormat('italic')} className="p-1 hover:bg-gray-200 rounded" title="Italic"><Italic size={14}/></button>
                        <button onClick={() => insertFormat('list')} className="p-1 hover:bg-gray-200 rounded" title="List"><ListIcon size={14}/></button>
                    </div>
                    <textarea
                      id="desc-textarea"
                      className="w-full min-h-[100px] p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      value={descText}
                      onChange={(e) => setDescText(e.target.value)}
                      placeholder="Add a more detailed description..."
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveDesc} className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700">Save</button>
                      <button onClick={() => { setDescEditing(false); setDescText(card.description); }} className="text-gray-600 px-3 py-1.5 hover:bg-gray-200 rounded">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => { setDescText(card.description); setDescEditing(true); }}
                    className={`min-h-[60px] p-3 rounded cursor-pointer ${card.description ? 'bg-transparent hover:bg-gray-200' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {renderMarkdown(card.description)}
                  </div>
                )}
              </div>
            </div>

            {/* Checklists */}
            {card.checklists?.map(cl => {
              const completedCount = cl.items.filter(i => i.completed).length;
              const progress = cl.items.length > 0 ? Math.round((completedCount / cl.items.length) * 100) : 0;

              return (
                <div key={cl.id} className="flex gap-4">
                  <CheckSquare className="mt-1 text-gray-600" size={24} />
                  <div className="w-full space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">{cl.title}</h3>
                      {deletingChecklistId === cl.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-600 mr-1">Delete?</span>
                          <button
                            onClick={() => {
                              dispatch({ type: 'DELETE_CHECKLIST', payload: { cardId, checklistId: cl.id } });
                              setDeletingChecklistId(null);
                            }}
                            className="bg-red-600 text-white px-2 py-0.5 rounded text-xs hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeletingChecklistId(null)}
                            className="bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded text-xs text-gray-700"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteChecklist(cl.id)}
                          className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8">{progress}%</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {cl.items.map(item => (
                        <div key={item.id} className="flex items-start gap-3 group hover:bg-gray-200 p-1 rounded -ml-1">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleItem(cl.id, item.id)}
                            className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={`${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{item.text}</span>
                        </div>
                      ))}

                      <div className="pl-0">
                        <input
                          type="text"
                          placeholder="Add an item"
                          className="bg-gray-200 hover:bg-gray-300 focus:bg-white border border-transparent focus:border-blue-500 px-3 py-1.5 rounded text-sm w-full transition-colors"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddItem(cl.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Attachments */}
            {card.attachments?.length > 0 && (
              <div className="flex gap-4">
                <Paperclip className="mt-1 text-gray-600" size={24} />
                <div className="w-full">
                  <h3 className="font-semibold text-gray-700 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {card.attachments.map(att => {
                      const isImage = (att.contentType || '').startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(att.name || att.url || '');
                      return (
                      <div key={att.id} className="flex gap-3 hover:bg-gray-200 p-2 rounded group relative">
                        <a href={att.url} download className="w-20 h-14 bg-gray-300 rounded overflow-hidden flex items-center justify-center text-gray-600 text-xs font-semibold">
                          {isImage ? (
                            <img src={att.url} className="w-full h-full object-cover" alt={att.name} />
                          ) : (
                            <span className="px-2 text-center break-all">{(att.name || 'File').split('.').pop()?.toUpperCase()}</span>
                          )}
                        </a>
                        <div className="flex flex-col justify-center min-w-0">
                          <a href={att.url} download className="font-bold text-sm text-gray-800 hover:underline truncate">{att.name}</a>
                          <div className="text-xs text-gray-500">
                            {att.size ? `${Math.ceil(att.size / 1024)} KB` : 'Attachment'}{att.contentType ? ` · ${att.contentType}` : ''}
                          </div>
                          <div className="text-xs text-gray-500 space-x-2">
                            <span>{att.uploadedAt ? format(new Date(att.uploadedAt), 'MMM d') : 'Added just now'}</span>
                            <a
                              href={att.url}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="underline hover:text-gray-800"
                            >
                              Download
                            </a>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteAttachment(att.id); }}
                              className="underline hover:text-gray-800"
                            >
                              Delete
                            </button>
                            {isImage && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSetCover({ type: 'image', value: att.url }); }}
                                className="underline hover:text-gray-800"
                              >
                                Make Cover
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Activity/Comments */}
            <div className="flex gap-4">
              <Activity className="mt-1 text-gray-600" size={24} />
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">Activity</h3>
                  <button
                    onClick={() => setShowActivityDetails(!showActivityDetails)}
                    className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
                  >
                    {showActivityDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                    <img src={currentUserObj ? currentUserObj.avatarUrl : 'https://picsum.photos/100/100?random=me'} alt="Me" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-full space-y-2">
                    <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                      <textarea
                        className="w-full p-2 text-sm resize-none focus:outline-none"
                        placeholder="Write a comment..."
                        rows="1"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      {commentText && (
                        <div className="p-2 bg-gray-50 flex justify-between items-center">
                          <button
                            onClick={handleAddComment}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {card.comments?.map(comment => {
                    if (comment.type === 'activity' && !showActivityDetails) return null;

                    const isEditing = editingCommentId === comment.id;

                    return (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                          <img src={getUserAvatar(comment.userId)} alt={getUserName(comment.userId)} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-2 items-baseline">
                            <span className="font-bold text-sm text-gray-800">{getUserName(comment.userId)}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                              {comment.editedAt && <span className="ml-1 italic">(edited)</span>}
                            </span>
                          </div>
                          {comment.type === 'activity' ? (
                            <div className="text-sm text-gray-600 italic">
                              {comment.text}
                            </div>
                          ) : isEditing ? (
                            <div className="mt-1 space-y-2">
                              <textarea
                                autoFocus
                                className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows="3"
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (editingCommentText.trim()) {
                                      dispatch({ type: 'EDIT_COMMENT', payload: { cardId, commentId: comment.id, text: editingCommentText.trim() } });
                                    }
                                    setEditingCommentId(null);
                                  }}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingCommentId(null)}
                                  className="text-gray-600 px-3 py-1 hover:bg-gray-200 rounded text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-sm text-gray-800 bg-white p-2 rounded border border-gray-200 shadow-sm mt-1">
                                {comment.text}
                              </div>
                              <div className="flex gap-2 mt-1 items-center flex-wrap">
                                <button
                                  onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.text); }}
                                  className="text-xs text-gray-500 underline hover:text-gray-800"
                                >
                                  Edit
                                </button>
                                {deletingCommentId === comment.id ? (
                                  <span className="flex items-center gap-1">
                                    <span className="text-xs text-gray-600">Delete?</span>
                                    <button
                                      onClick={() => {
                                        dispatch({ type: 'DELETE_COMMENT', payload: { cardId, commentId: comment.id } });
                                        setDeletingCommentId(null);
                                      }}
                                      className="bg-red-600 text-white px-2 py-0.5 rounded text-xs hover:bg-red-700"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setDeletingCommentId(null)}
                                      className="bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded text-xs text-gray-700"
                                    >
                                      No
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => setDeletingCommentId(comment.id)}
                                    className="text-xs text-gray-500 underline hover:text-gray-800"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Add to card</h4>

            {/* Members Picker */}
            <div className="relative">
              <button
                onClick={() => setIsMemberPickerOpen(!isMemberPickerOpen)}
                className="w-full text-left bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm text-gray-700 flex items-center gap-2"
              >
                <User size={16} /> Members
              </button>
              {isMemberPickerOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded z-20 p-2 border border-gray-200 mt-1">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h4 className="text-sm font-semibold text-gray-700">Members</h4>
                    <button onClick={() => setIsMemberPickerOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={14}/></button>
                  </div>
                  <div className="space-y-1">
                    {boardMembers.map(user => {
                      const isSelected = (card.memberIds || []).includes(user.id);
                      return (
                        <button
                          key={user.id}
                          onClick={() => toggleMember(user.id)}
                          className="w-full h-10 rounded hover:bg-gray-100 flex items-center gap-2 px-2 text-sm transition-colors relative"
                        >
                          <img src={user.avatarUrl} className="w-6 h-6 rounded-full object-cover" alt={user.name} />
                          <span>{user.name}</span>
                          {isSelected && <CheckSquare size={14} className="ml-auto text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Label Button & Popover */}
            <div className="relative">
                <button
                    onClick={() => setIsLabelPickerOpen(!isLabelPickerOpen)}
                    className="w-full text-left bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm text-gray-700 flex items-center gap-2"
                >
                    <Tag size={16} /> Labels
                </button>
                {isLabelPickerOpen && (
                    <div className="absolute top-full left-0 w-72 bg-white shadow-xl rounded z-20 p-2 border border-gray-200 mt-1">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <h4 className="text-sm font-semibold text-gray-700">Labels</h4>
                            <button onClick={() => { setIsLabelPickerOpen(false); setEditingLabelId(null); setIsCreatingLabel(false); }} className="text-gray-500 hover:text-gray-800"><X size={14}/></button>
                        </div>
                        <div className="space-y-1 mb-2">
                            {boardLabels.map(l => {
                                const isSelected = cardLabelIds.includes(l.id);
                                if (editingLabelId === l.id) {
                                  return (
                                    <div key={l.id} className="p-2 bg-gray-50 rounded space-y-2">
                                      <input
                                        autoFocus
                                        className="w-full border rounded px-2 py-1 text-sm"
                                        value={editingLabelName}
                                        onChange={(e) => setEditingLabelName(e.target.value)}
                                        placeholder="Label name"
                                      />
                                      <div className="grid grid-cols-7 gap-1">
                                        {['#61bd4f','#f2d600','#ff9f1a','#eb5a46','#c377e0','#0079bf','#5ba4cf','#29cce5','#6deca9','#ff78cb','#344563','#b3bac5','#172b4d','#505f79'].map(c => (
                                          <button
                                            key={c}
                                            onClick={() => setEditingLabelColor(c)}
                                            className={`h-6 rounded ${editingLabelColor === c ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                                            style={{ backgroundColor: c }}
                                          />
                                        ))}
                                      </div>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => {
                                            dispatch({ type: 'UPDATE_BOARD_LABEL', payload: { boardId: card.boardId, label: { id: l.id, name: editingLabelName, color: editingLabelColor } } });
                                            setEditingLabelId(null);
                                          }}
                                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                                        >Save</button>
                                        <button onClick={() => setEditingLabelId(null)} className="text-gray-600 px-2 py-1 text-xs hover:bg-gray-200 rounded">Cancel</button>
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                    <div key={l.id} className="flex items-center gap-1">
                                      <button
                                          onClick={() => handleToggleLabel(l.id)}
                                          className="flex-1 h-8 rounded hover:opacity-80 flex items-center justify-between px-2 text-white font-medium text-sm transition-opacity"
                                          style={{ backgroundColor: l.color }}
                                      >
                                          <span>{l.name}</span>
                                          {isSelected && <CheckSquare size={14} />}
                                      </button>
                                      <button
                                        onClick={() => { setEditingLabelId(l.id); setEditingLabelName(l.name); setEditingLabelColor(l.color); }}
                                        className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                        title="Edit label"
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                      </button>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Create new label */}
                        {isCreatingLabel ? (
                          <div className="p-2 bg-gray-50 rounded space-y-2 border-t border-gray-200">
                            <input
                              autoFocus
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={newLabelName}
                              onChange={(e) => setNewLabelName(e.target.value)}
                              placeholder="Label name"
                            />
                            <div className="grid grid-cols-7 gap-1">
                              {['#61bd4f','#f2d600','#ff9f1a','#eb5a46','#c377e0','#0079bf','#5ba4cf','#29cce5','#6deca9','#ff78cb','#344563','#b3bac5','#172b4d','#505f79'].map(c => (
                                <button
                                  key={c}
                                  onClick={() => setNewLabelColor(c)}
                                  className={`h-6 rounded ${newLabelColor === c ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  dispatch({ type: 'ADD_BOARD_LABEL', payload: { boardId: card.boardId, name: newLabelName, color: newLabelColor } });
                                  setNewLabelName('');
                                  setIsCreatingLabel(false);
                                }}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                              >Create</button>
                              <button onClick={() => setIsCreatingLabel(false)} className="text-gray-600 px-2 py-1 text-xs hover:bg-gray-200 rounded">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsCreatingLabel(true)}
                            className="w-full bg-gray-200 hover:bg-gray-300 py-1.5 rounded text-sm text-gray-700 flex items-center justify-center gap-1"
                          >
                            <Plus size={14} /> Create a new label
                          </button>
                        )}
                    </div>
                )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsAddingChecklist(!isAddingChecklist)}
                className="w-full text-left bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm text-gray-700 flex items-center gap-2"
              >
                <CheckSquare size={16} /> Checklist
              </button>
              {isAddingChecklist && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded z-20 p-2 border border-gray-200 mt-1">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h4 className="text-sm font-semibold text-center">Add Checklist</h4>
                    <button onClick={() => setIsAddingChecklist(false)} className="text-gray-500 hover:text-gray-800"><X size={14}/></button>
                  </div>
                  <input
                    autoFocus
                    className="w-full border rounded px-2 py-1 text-sm mb-2"
                    placeholder="Checklist title"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                  />
                  <button
                    onClick={handleAddChecklist}
                    className="bg-blue-600 text-white w-full py-1 rounded text-sm"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div className="relative">
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="w-full text-left bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm text-gray-700 flex items-center gap-2"
              >
                <Clock size={16} /> Dates
              </button>
              {isDatePickerOpen && (
                <div className="absolute top-full left-0 bg-white shadow-xl rounded z-20 p-4 border border-gray-200 mt-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-gray-700">Due Date</h4>
                    <button onClick={() => setIsDatePickerOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={14}/></button>
                  </div>
                  {renderCalendar()}
                  {card.dueDate && (
                    <button
                      onClick={() => {
                        dispatch({ type: 'UPDATE_CARD', payload: { cardId, field: 'dueDate', value: null } });
                        dispatch({ type: 'UPDATE_CARD', payload: { cardId, field: 'completed', value: false } });
                        setIsDatePickerOpen(false);
                      }}
                      className="w-full mt-3 bg-gray-200 hover:bg-gray-300 py-1.5 rounded text-sm text-gray-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Attachment Picker */}
            <div className="relative">
              <button
                onClick={() => setIsAttachmentPickerOpen(!isAttachmentPickerOpen)}
                className="w-full text-left bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm text-gray-700 flex items-center gap-2"
              >
                <Paperclip size={16} /> Attachment
              </button>
              {isAttachmentPickerOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded z-20 p-2 border border-gray-200 mt-1">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h4 className="text-sm font-semibold text-gray-700">Attach from...</h4>
                    <button onClick={() => setIsAttachmentPickerOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={14}/></button>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left hover:bg-gray-100 px-2 py-1.5 rounded text-sm text-gray-700"
                  >
                    Computer
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleAttachmentFiles(e.target.files)}
                  />
                  {attachmentUploadStatus && (
                    <div className="text-xs text-gray-500 px-2 py-1">{attachmentUploadStatus}</div>
                  )}
                </div>
              )}
            </div>

            {/* Cover Picker */}
            <div className="relative">
              <button
                onClick={() => setIsCoverPickerOpen(!isCoverPickerOpen)}
                className="w-full text-left bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm text-gray-700 flex items-center gap-2"
              >
                <ImageIcon size={16} /> Cover
              </button>
              {isCoverPickerOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded z-20 p-2 border border-gray-200 mt-1">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h4 className="text-sm font-semibold text-gray-700">Cover</h4>
                    <button onClick={() => setIsCoverPickerOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={14}/></button>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSetCover(null)}
                      className="w-full bg-gray-200 hover:bg-gray-300 py-1 rounded text-sm"
                    >
                      Remove Cover
                    </button>
                    <div>
                      <h5 className="text-xs font-bold text-gray-500 mb-1">Colors</h5>
                      <div className="grid grid-cols-5 gap-1">
                        {['#7BC86C', '#F5DD29', '#FFAF3F', '#EF7564', '#CD8DE5', '#5BA4CF', '#29CCE5', '#6DECA9', '#FF8ED4', '#172B4D'].map(c => (
                          <button
                            key={c}
                            onClick={() => handleSetCover({ type: 'color', value: c })}
                            className="h-8 rounded"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-gray-500 mb-1">Photos (Unsplash)</h5>
                      <div className="grid grid-cols-3 gap-1">
                        {[1,2,3,4,5,6].map(i => (
                          <button
                            key={i}
                            onClick={() => handleSetCover({ type: 'image', value: `https://picsum.photos/400/200?random=cover${i}` })}
                            className="h-12 rounded bg-cover bg-center"
                            style={{ backgroundImage: `url(https://picsum.photos/400/200?random=cover${i})` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Watch Toggle */}
            <button
              onClick={() => dispatch({ type: 'UPDATE_CARD', payload: { cardId, field: 'watching', value: !card.watching } })}
              className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 ${card.watching ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            >
              <Eye size={16} /> {card.watching ? 'Watching' : 'Watch'}
              {card.watching && <CheckSquare size={14} className="ml-auto" />}
            </button>

            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 mt-6">Actions</h4>

            {/* Move Card */}
            <div className="relative">
              <button
                onClick={() => {
                  setMoveBoardId(card.boardId);
                  setMoveListId(card.listId);
                  setIsMovePickerOpen(!isMovePickerOpen);
                }}
                className="w-full text-left bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm text-gray-700 flex items-center gap-2"
              >
                <ArrowRight size={16} /> Move
              </button>
              {isMovePickerOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded z-20 p-3 border border-gray-200 mt-1">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Move Card</h4>
                    <button onClick={() => setIsMovePickerOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={14}/></button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Board</label>
                      <select
                        value={moveBoardId}
                        onChange={(e) => {
                          const newBoardId = e.target.value;
                          setMoveBoardId(newBoardId);
                          const newBoard = state.boards[newBoardId];
                          if (newBoard && newBoard.listIds.length > 0) {
                            setMoveListId(newBoard.listIds[0]);
                          }
                        }}
                        className="w-full border rounded px-2 py-1.5 text-sm bg-gray-50"
                      >
                        {state.boardOrder.map(bid => {
                          const b = state.boards[bid];
                          if (!b) return null;
                          return <option key={bid} value={bid}>{b.title}{bid === card.boardId ? ' (current)' : ''}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">List</label>
                      <select
                        value={moveListId}
                        onChange={(e) => setMoveListId(e.target.value)}
                        className="w-full border rounded px-2 py-1.5 text-sm bg-gray-50"
                      >
                        {(state.boards[moveBoardId]?.listIds || []).map(lid => {
                          const l = state.lists[lid];
                          if (!l) return null;
                          return <option key={lid} value={lid}>{l.title}{lid === card.listId ? ' (current)' : ''}</option>;
                        })}
                      </select>
                    </div>
                    <button
                      onClick={handleMoveCard}
                      className="bg-blue-600 text-white w-full py-1.5 rounded text-sm hover:bg-blue-700"
                    >
                      Move
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Copy Card */}
            <div className="relative">
              <button
                onClick={() => {
                  setCopyTitle(`Copy of ${card.title}`);
                  setCopyBoardId(card.boardId);
                  setCopyListId(card.listId);
                  setIsCopyPickerOpen(!isCopyPickerOpen);
                }}
                className="w-full text-left bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm text-gray-700 flex items-center gap-2"
              >
                <Copy size={16} /> Copy
              </button>
              {isCopyPickerOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded z-20 p-3 border border-gray-200 mt-1">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Copy Card</h4>
                    <button onClick={() => setIsCopyPickerOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={14}/></button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Title</label>
                      <textarea
                        className="w-full border rounded px-2 py-1.5 text-sm resize-none"
                        rows="2"
                        value={copyTitle}
                        onChange={(e) => setCopyTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Board</label>
                      <select
                        value={copyBoardId}
                        onChange={(e) => {
                          const newBoardId = e.target.value;
                          setCopyBoardId(newBoardId);
                          const newBoard = state.boards[newBoardId];
                          if (newBoard && newBoard.listIds.length > 0) {
                            setCopyListId(newBoard.listIds[0]);
                          }
                        }}
                        className="w-full border rounded px-2 py-1.5 text-sm bg-gray-50"
                      >
                        {state.boardOrder.map(bid => {
                          const b = state.boards[bid];
                          if (!b) return null;
                          return <option key={bid} value={bid}>{b.title}{bid === card.boardId ? ' (current)' : ''}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">List</label>
                      <select
                        value={copyListId}
                        onChange={(e) => setCopyListId(e.target.value)}
                        className="w-full border rounded px-2 py-1.5 text-sm bg-gray-50"
                      >
                        {(state.boards[copyBoardId]?.listIds || []).map(lid => {
                          const l = state.lists[lid];
                          if (!l) return null;
                          return <option key={lid} value={lid}>{l.title}{lid === card.listId ? ' (current)' : ''}</option>;
                        })}
                      </select>
                    </div>
                    <button
                      onClick={handleCopyCard}
                      className="bg-blue-600 text-white w-full py-1.5 rounded text-sm hover:bg-blue-700"
                    >
                      Create card
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isArchiveConfirmOpen ? (
              <div className="bg-white border border-gray-200 rounded p-2 shadow-sm space-y-1">
                <p className="text-xs text-gray-600">Archive this card?</p>
                <div className="flex gap-1">
                  <button
                    onClick={handleArchiveCard}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 flex-1"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => setIsArchiveConfirmOpen(false)}
                    className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-xs text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsArchiveConfirmOpen(true)}
                className="w-full text-left bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm text-gray-700 flex items-center gap-2"
              >
                <Trash2 size={16} /> Archive
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
