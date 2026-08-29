import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { INITIAL_STATE, getSessionId, fetchCustomState, saveState, initializeData, saveInitialStateToServer, getInitialState } from '../utils/mockData';
import { v4 as uuidv4 } from 'uuid';

const StoreContext = createContext();

const BASE_INITIAL_KEY = 'trello_clone_initialState';

const createActivity = (userId, text) => ({
  id: uuidv4(),
  userId,
  text,
  createdAt: new Date().toISOString(),
  type: 'activity',
  editedAt: null
});

const reducer = (state, action) => {
  if (action.type === 'SET_STATE') {
    return action.payload;
  }

  if (!state) return state;

  const currentUser = state.currentUser || 'u1';

  switch (action.type) {

    case 'ADD_BOARD': {
      const newBoardId = uuidv4();
      const { title, background } = action.payload;
      return {
        ...state,
        boards: {
          ...state.boards,
          [newBoardId]: {
            id: newBoardId,
            title,
            description: '',
            background,
            listIds: [],
            starred: false,
            visibility: action.payload.visibility || 'private',
            archivedListIds: [],
            archivedCardIds: [],
            labels: [
              { id: uuidv4(), name: "Urgent", color: "#eb5a46" },
              { id: uuidv4(), name: "Design", color: "#0079bf" },
              { id: uuidv4(), name: "Dev", color: "#61bd4f" },
              { id: uuidv4(), name: "Bug", color: "#ff9f1a" },
              { id: uuidv4(), name: "Feature", color: "#c377e0" },
              { id: uuidv4(), name: "Docs", color: "#f2d600" }
            ],
            memberIds: [currentUser],
            createdAt: new Date().toISOString()
          }
        },
        boardOrder: [newBoardId, ...state.boardOrder]
      };
    }

    case 'ADD_BOARD_FROM_TEMPLATE': {
      const newBoardId = uuidv4();
      const { title, background, visibility, lists } = action.payload;
      const listIds = (lists || []).map(() => uuidv4());
      const newLists = {};
      listIds.forEach((listId, index) => {
        newLists[listId] = {
          id: listId,
          title: lists[index],
          boardId: newBoardId,
          cardIds: [],
          archived: false
        };
      });

      return {
        ...state,
        boards: {
          ...state.boards,
          [newBoardId]: {
            id: newBoardId,
            title,
            description: '',
            background,
            listIds,
            starred: false,
            visibility: visibility || 'workspace',
            archivedListIds: [],
            archivedCardIds: [],
            labels: [
              { id: uuidv4(), name: "Urgent", color: "#eb5a46" },
              { id: uuidv4(), name: "Design", color: "#0079bf" },
              { id: uuidv4(), name: "Dev", color: "#61bd4f" },
              { id: uuidv4(), name: "Bug", color: "#ff9f1a" },
              { id: uuidv4(), name: "Feature", color: "#c377e0" },
              { id: uuidv4(), name: "Docs", color: "#f2d600" }
            ],
            memberIds: [currentUser],
            createdAt: new Date().toISOString()
          }
        },
        lists: {
          ...state.lists,
          ...newLists
        },
        boardOrder: [newBoardId, ...state.boardOrder]
      };
    }

    case 'UPDATE_BOARD': {
      const { boardId, field, value } = action.payload;
      return {
        ...state,
        boards: {
          ...state.boards,
          [boardId]: {
            ...state.boards[boardId],
            [field]: value
          }
        }
      };
    }

    case 'ADD_LIST': {
      const newListId = uuidv4();
      const { title, boardId } = action.payload;
      const board = state.boards[boardId];
      return {
        ...state,
        lists: {
          ...state.lists,
          [newListId]: { id: newListId, title, cardIds: [], boardId, archived: false }
        },
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            listIds: [...board.listIds, newListId]
          }
        }
      };
    }

    case 'ADD_CARD': {
      const newCardId = uuidv4();
      const { title, listId, boardId, description, labelIds, memberIds, dueDate, checklists, cover, watching } = action.payload;
      const list = state.lists[listId];
      return {
        ...state,
        cards: {
          ...state.cards,
          [newCardId]: {
            id: newCardId,
            title,
            description: description || '',
            listId,
            boardId,
            labelIds: labelIds || [],
            memberIds: memberIds || [],
            dueDate: dueDate || null,
            startDate: null,
            completed: false,
            cover: cover || null,
            checklists: checklists || [],
            comments: [createActivity(currentUser, `added this card to ${list.title}`)],
            attachments: [],
            archived: false,
            watching: watching || false,
            position: list.cardIds.length,
            createdAt: new Date().toISOString()
          }
        },
        lists: {
          ...state.lists,
          [listId]: {
            ...list,
            cardIds: [...list.cardIds, newCardId]
          }
        }
      };
    }

    case 'MOVE_LIST': {
      const { sourceIndex, destinationIndex, boardId } = action.payload;
      const board = state.boards[boardId];
      const newListIds = Array.from(board.listIds);
      const [removed] = newListIds.splice(sourceIndex, 1);
      newListIds.splice(destinationIndex, 0, removed);

      return {
        ...state,
        boards: {
          ...state.boards,
          [boardId]: { ...board, listIds: newListIds }
        }
      };
    }

    case 'MOVE_CARD': {
      const { source, destination, draggableId } = action.payload;
      const startList = state.lists[source.droppableId];
      const finishList = state.lists[destination.droppableId];
      const card = state.cards[draggableId];

      // Moving within the same list
      if (startList === finishList) {
        const newCardIds = Array.from(startList.cardIds);
        newCardIds.splice(source.index, 1);
        newCardIds.splice(destination.index, 0, draggableId);

        return {
          ...state,
          lists: {
            ...state.lists,
            [startList.id]: { ...startList, cardIds: newCardIds }
          }
        };
      }

      // Moving from one list to another
      const startCardIds = Array.from(startList.cardIds);
      startCardIds.splice(source.index, 1);

      const finishCardIds = Array.from(finishList.cardIds);
      finishCardIds.splice(destination.index, 0, draggableId);

      return {
        ...state,
        lists: {
          ...state.lists,
          [startList.id]: { ...startList, cardIds: startCardIds },
          [finishList.id]: { ...finishList, cardIds: finishCardIds }
        },
        cards: {
          ...state.cards,
          [draggableId]: {
            ...card,
            listId: finishList.id,
            comments: [createActivity(currentUser, `moved this card from ${startList.title} to ${finishList.title}`), ...(card.comments || [])]
          }
        }
      };
    }

    case 'MOVE_CARD_TO_LIST': {
      const { cardId, srcListId, destListId, destBoardId } = action.payload;
      const card = state.cards[cardId];
      const srcList = state.lists[srcListId];
      const destList = state.lists[destListId];

      const newSrcCardIds = srcList.cardIds.filter(id => id !== cardId);
      const newDestCardIds = [...destList.cardIds, cardId];

      const updatedLists = {
        ...state.lists,
        [srcListId]: { ...srcList, cardIds: newSrcCardIds },
        [destListId]: { ...destList, cardIds: newDestCardIds }
      };
      // If same list, avoid double override
      if (srcListId === destListId) {
        updatedLists[srcListId] = { ...srcList, cardIds: srcList.cardIds };
      }

      return {
        ...state,
        lists: updatedLists,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            listId: destListId,
            boardId: destBoardId || card.boardId,
            comments: [
              createActivity(currentUser, `moved this card from ${srcList.title} to ${destList.title}`),
              ...(card.comments || [])
            ]
          }
        }
      };
    }

    case 'UPDATE_CARD': {
      const { cardId, field, value } = action.payload;
      const card = state.cards[cardId];

      let activityText = '';
      if (field === 'dueDate') activityText = value ? `set the due date to ${new Date(value).toLocaleDateString()}` : 'removed the due date';
      if (field === 'completed') activityText = value ? 'marked the due date as complete' : 'marked the due date as incomplete';
      if (field === 'archived') activityText = value ? 'archived this card' : 'sent this card to the board';
      if (field === 'labelIds') activityText = 'updated labels';
      if (field === 'cover') activityText = value ? 'updated the cover' : 'removed the cover';

      const newComments = activityText
        ? [createActivity(currentUser, activityText), ...(card.comments || [])]
        : card.comments;

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            [field]: value,
            comments: newComments
          }
        }
      };
    }

    case 'UPDATE_LIST_TITLE': {
      const { listId, title } = action.payload;
      return {
        ...state,
        lists: {
          ...state.lists,
          [listId]: { ...state.lists[listId], title }
        }
      };
    }

    case 'ARCHIVE_LIST': {
      const { listId, boardId } = action.payload;
      const board = state.boards[boardId];
      const newListIds = board.listIds.filter(id => id !== listId);

      return {
        ...state,
        lists: {
          ...state.lists,
          [listId]: { ...state.lists[listId], archived: true }
        },
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            listIds: newListIds,
            archivedListIds: [...(board.archivedListIds || []), listId]
          }
        }
      };
    }

    case 'RESTORE_LIST': {
      const { listId, boardId } = action.payload;
      const board = state.boards[boardId];
      const newArchivedListIds = (board.archivedListIds || []).filter(id => id !== listId);

      return {
        ...state,
        lists: {
          ...state.lists,
          [listId]: { ...state.lists[listId], archived: false }
        },
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            listIds: [...board.listIds, listId],
            archivedListIds: newArchivedListIds
          }
        }
      };
    }

    case 'ARCHIVE_CARD': {
      const { cardId, listId } = action.payload;
      const list = state.lists[listId];
      const newCardIds = list.cardIds.filter(id => id !== cardId);
      const board = state.boards[list.boardId];
      const card = state.cards[cardId];

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            archived: true,
            comments: [createActivity(currentUser, 'archived this card'), ...(card.comments || [])]
          }
        },
        lists: {
          ...state.lists,
          [listId]: { ...list, cardIds: newCardIds }
        },
        boards: {
          ...state.boards,
          [list.boardId]: {
            ...board,
            archivedCardIds: [...(board.archivedCardIds || []), cardId]
          }
        }
      };
    }

    case 'RESTORE_CARD': {
      const { cardId, listId } = action.payload;
      const list = state.lists[listId];
      const board = state.boards[list.boardId];
      const newArchivedCardIds = (board.archivedCardIds || []).filter(id => id !== cardId);
      const card = state.cards[cardId];

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            archived: false,
            comments: [createActivity(currentUser, 'sent this card to the board'), ...(card.comments || [])]
          }
        },
        lists: {
          ...state.lists,
          [listId]: { ...list, cardIds: [...list.cardIds, cardId] }
        },
        boards: {
          ...state.boards,
          [list.boardId]: {
            ...board,
            archivedCardIds: newArchivedCardIds
          }
        }
      };
    }

    case 'SORT_LIST': {
      const { listId, type } = action.payload;
      const list = state.lists[listId];
      const cards = list.cardIds.map(id => state.cards[id]);

      let sortedCards;
      if (type === 'title') {
        sortedCards = [...cards].sort((a, b) => a.title.localeCompare(b.title));
      } else if (type === 'date') {
        sortedCards = [...cards].sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      } else {
        return state;
      }

      return {
        ...state,
        lists: {
          ...state.lists,
          [listId]: { ...list, cardIds: sortedCards.map(c => c.id) }
        }
      };
    }

    case 'ADD_CHECKLIST': {
      const { cardId, title } = action.payload;
      const newChecklist = {
        id: uuidv4(),
        title,
        items: []
      };
      const card = state.cards[cardId];
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            checklists: [...(card.checklists || []), newChecklist],
            comments: [createActivity(currentUser, `added checklist ${title}`), ...(card.comments || [])]
          }
        }
      };
    }

    case 'DELETE_CHECKLIST': {
      const { cardId, checklistId } = action.payload;
      const card = state.cards[cardId];
      const checklist = card.checklists.find(cl => cl.id === checklistId);
      const checklistTitle = checklist ? checklist.title : 'checklist';
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            checklists: card.checklists.filter(cl => cl.id !== checklistId),
            comments: [createActivity(currentUser, `removed checklist ${checklistTitle}`), ...(card.comments || [])]
          }
        }
      };
    }

    case 'ADD_CHECKLIST_ITEM': {
      const { cardId, checklistId, text } = action.payload;
      const card = state.cards[cardId];
      const checklists = card.checklists.map(cl => {
        if (cl.id === checklistId) {
          return {
            ...cl,
            items: [...cl.items, { id: uuidv4(), text, completed: false, assigneeId: null, dueDate: null }]
          };
        }
        return cl;
      });
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...card, checklists }
        }
      };
    }

    case 'TOGGLE_CHECKLIST_ITEM': {
      const { cardId, checklistId, itemId } = action.payload;
      const card = state.cards[cardId];
      let itemText = '';
      let isCompleted = false;

      const checklists = card.checklists.map(cl => {
        if (cl.id === checklistId) {
          const items = cl.items.map(item => {
            if (item.id === itemId) {
                itemText = item.text;
                isCompleted = !item.completed;
                return { ...item, completed: !item.completed };
            }
            return item;
          });
          return { ...cl, items };
        }
        return cl;
      });

      const activity = createActivity(currentUser, `${isCompleted ? 'completed' : 'marked incomplete'} ${itemText} on checklist`);

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            checklists,
            comments: [activity, ...(card.comments || [])]
          }
        }
      };
    }

    case 'ADD_COMMENT': {
      const { cardId, text } = action.payload;
      const card = state.cards[cardId];
      const newComment = {
        id: uuidv4(),
        userId: currentUser,
        text,
        createdAt: new Date().toISOString(),
        type: 'comment',
        editedAt: null
      };
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            comments: [newComment, ...(card.comments || [])]
          }
        }
      };
    }

    case 'EDIT_COMMENT': {
      const { cardId, commentId, text } = action.payload;
      const card = state.cards[cardId];
      const comments = card.comments.map(c =>
        c.id === commentId ? { ...c, text, editedAt: new Date().toISOString() } : c
      );
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...card, comments }
        }
      };
    }

    case 'DELETE_COMMENT': {
      const { cardId, commentId } = action.payload;
      const card = state.cards[cardId];
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            comments: [
              createActivity(currentUser, 'deleted a comment'),
              ...card.comments.filter(c => c.id !== commentId)
            ]
          }
        }
      };
    }

    case 'ADD_ATTACHMENT': {
      const { cardId, name, url, size, contentType, storedName } = action.payload;
      const card = state.cards[cardId];
      const newAttachment = {
        id: uuidv4(),
        name,
        url,
        size: size || null,
        contentType: contentType || null,
        storedName: storedName || null,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser
      };
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            attachments: [...(card.attachments || []), newAttachment],
            comments: [createActivity(currentUser, `attached ${name}`), ...(card.comments || [])]
          }
        }
      };
    }

    case 'DELETE_ATTACHMENT': {
      const { cardId, attachmentId } = action.payload;
      const card = state.cards[cardId];
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            attachments: card.attachments.filter(a => a.id !== attachmentId),
            comments: [createActivity(currentUser, 'removed an attachment'), ...(card.comments || [])]
          }
        }
      };
    }

    case 'TOGGLE_MEMBER': {
      const { cardId, memberId } = action.payload;
      const card = state.cards[cardId];
      const memberIds = card.memberIds || [];
      const isAdding = !memberIds.includes(memberId);
      const userName = state.users[memberId]?.name || memberId;
      const newMemberIds = isAdding
        ? [...memberIds, memberId]
        : memberIds.filter(m => m !== memberId);

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            memberIds: newMemberIds,
            comments: [createActivity(currentUser, `${isAdding ? 'added' : 'removed'} ${userName}`), ...(card.comments || [])]
          }
        }
      };
    }

    case 'TOGGLE_LABEL': {
      const { cardId, labelId } = action.payload;
      const card = state.cards[cardId];
      const labelIds = card.labelIds || [];
      const isAdding = !labelIds.includes(labelId);
      const newLabelIds = isAdding
        ? [...labelIds, labelId]
        : labelIds.filter(id => id !== labelId);

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            labelIds: newLabelIds,
            comments: [createActivity(currentUser, 'updated labels'), ...(card.comments || [])]
          }
        }
      };
    }

    case 'UPDATE_BOARD_LABEL': {
      const { boardId, label } = action.payload;
      const board = state.boards[boardId];
      const labels = board.labels.map(l => l.id === label.id ? { ...l, ...label } : l);
      return {
        ...state,
        boards: {
          ...state.boards,
          [boardId]: { ...board, labels }
        }
      };
    }

    case 'ADD_BOARD_LABEL': {
      const { boardId, name, color } = action.payload;
      const board = state.boards[boardId];
      const newLabel = { id: uuidv4(), name, color };
      return {
        ...state,
        boards: {
          ...state.boards,
          [boardId]: { ...board, labels: [...(board.labels || []), newLabel] }
        }
      };
    }

    case 'MOVE_ALL_CARDS': {
      const { srcListId, destListId } = action.payload;
      const srcList = state.lists[srcListId];
      const destList = state.lists[destListId];
      if (!srcList || !destList || srcList.cardIds.length === 0) return state;

      const movedCardIds = [...srcList.cardIds];
      const updatedCards = { ...state.cards };
      movedCardIds.forEach(cid => {
        const card = updatedCards[cid];
        if (card) {
          updatedCards[cid] = {
            ...card,
            listId: destListId,
            comments: [
              createActivity(currentUser, `moved this card from ${srcList.title} to ${destList.title}`),
              ...(card.comments || [])
            ]
          };
        }
      });

      return {
        ...state,
        cards: updatedCards,
        lists: {
          ...state.lists,
          [srcListId]: { ...srcList, cardIds: [] },
          [destListId]: { ...destList, cardIds: [...destList.cardIds, ...movedCardIds] }
        }
      };
    }

    case 'COPY_LIST': {
      const { listId, boardId, newTitle } = action.payload;
      const srcList = state.lists[listId];
      const board = state.boards[boardId];
      if (!srcList || !board) return state;

      const newListId = uuidv4();
      const newCards = {};
      const newCardIds = [];

      srcList.cardIds.forEach(cid => {
        const srcCard = state.cards[cid];
        if (!srcCard) return;
        const newCardId = uuidv4();
        newCardIds.push(newCardId);
        newCards[newCardId] = {
          ...srcCard,
          id: newCardId,
          listId: newListId,
          checklists: (srcCard.checklists || []).map(cl => ({
            ...cl,
            id: uuidv4(),
            items: cl.items.map(item => ({ ...item, id: uuidv4(), completed: false }))
          })),
          comments: [createActivity(currentUser, `added this card to ${newTitle || srcList.title}`)],
          completed: false,
          createdAt: new Date().toISOString()
        };
      });

      const srcIndex = board.listIds.indexOf(listId);
      const newListIds = [...board.listIds];
      newListIds.splice(srcIndex + 1, 0, newListId);

      return {
        ...state,
        lists: {
          ...state.lists,
          [newListId]: {
            id: newListId,
            title: newTitle || `Copy of ${srcList.title}`,
            boardId,
            cardIds: newCardIds,
            archived: false
          }
        },
        cards: { ...state.cards, ...newCards },
        boards: {
          ...state.boards,
          [boardId]: { ...board, listIds: newListIds }
        }
      };
    }

    case 'MARK_NOTIFICATIONS_READ': {
      return {
        ...state,
        lastReadNotificationAt: new Date().toISOString()
      };
    }

    default:
      return state;
  }
};

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, null);
  const [initialStateSnapshot, setInitialStateSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    const setStateAndSnapshot = (data, sid, persistInitial = true) => {
      dispatch({ type: 'SET_STATE', payload: data });
      const existingInitial = getInitialState(sid);
      const snapshot = JSON.parse(JSON.stringify(existingInitial || data));
      setInitialStateSnapshot(snapshot);
      if (persistInitial) {
        saveInitialStateToServer(snapshot, sid);
      }
      setLoading(false);
    };

    if (sid) {
      // CRITICAL: Check localStorage BEFORE initializeData
      const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        setStateAndSnapshot(data, sid, false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setStateAndSnapshot(data, sid, true);
        });
      }
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const data = initializeData(null, customState);
          setStateAndSnapshot(data, null, true);
        } else {
          const data = initializeData();
          setStateAndSnapshot(data, null, true);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  if (loading || !state) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{ state, dispatch, initialState: initialStateSnapshot }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
