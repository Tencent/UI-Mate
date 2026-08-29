import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_STATE, getSessionId, fetchCustomState, saveState, initializeData, getInitialState } from './initialData';
import { generateId } from '../lib/utils';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

const BASE_INITIAL_KEY = 'pinteract_initialState';

export const StoreProvider = ({ children }) => {
  const [initialStateRef, setInitialStateRef] = useState(null);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        setState(data);
        setInitialStateRef(getInitialState(sid) || data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setInitialStateRef(getInitialState(sid) || data);
          setLoading(false);
        });
      }
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const data = initializeData(null, customState);
          setState(data);
          setInitialStateRef(getInitialState(null) || data);
        } else {
          const data = initializeData();
          setState(data);
          setInitialStateRef(getInitialState(null) || data);
        }
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  // --- Actions ---

  const addPin = (pinData) => {
    const newPin = {
      id: generateId(),
      userId: state.currentUser.id,
      imageWidth: 400,
      imageHeight: 500,
      altText: '',
      tags: [],
      likes: 0,
      likedBy: [],
      commentCount: 0,
      saves: 0,
      source: '',
      sectionId: null,
      createdAt: Date.now(),
      ...pinData
    };
    setState(prev => ({ ...prev, pins: [newPin, ...prev.pins] }));

    if (pinData.boardId) {
      savePinToBoard(newPin.id, pinData.boardId);
    }
  };

  const createBoard = (boardData) => {
    const newBoard = {
      id: generateId(),
      userId: state.currentUser.id,
      description: '',
      privacy: 'public',
      coverPinId: null,
      pins: [],
      sections: [],
      collaborators: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...boardData
    };
    setState(prev => ({ ...prev, boards: [...prev.boards, newBoard] }));
    return newBoard;
  };

  const updateBoard = (boardId, updates) => {
    setState(prev => ({
      ...prev,
      boards: prev.boards.map(b => b.id === boardId ? { ...b, ...updates, updatedAt: Date.now() } : b)
    }));
  };

  const savePinToBoard = (pinId, boardId) => {
    setState(prev => {
      const updatedBoards = prev.boards.map(board => {
        if (board.id === boardId) {
          if (!board.pins.includes(pinId)) {
            return { ...board, pins: [...board.pins, pinId], updatedAt: Date.now() };
          }
        }
        return board;
      });
      const updatedPins = prev.pins.map(p => {
        if (p.id === pinId && !p.boardId) {
          return { ...p, boardId, saves: (p.saves || 0) + 1 };
        }
        return p;
      });
      return { ...prev, boards: updatedBoards, pins: updatedPins, lastUsedBoardId: boardId };
    });
  };

  const removePinFromBoard = (pinId, boardId) => {
    setState(prev => {
      const updatedBoards = prev.boards.map(board => {
        if (board.id === boardId) {
          const updatedSections = board.sections.map(section => ({
            ...section,
            pins: section.pins.filter(id => id !== pinId)
          }));
          return {
            ...board,
            pins: board.pins.filter(id => id !== pinId),
            sections: updatedSections,
            updatedAt: Date.now()
          };
        }
        return board;
      });
      const updatedPins = prev.pins.map(p => {
        if (p.id === pinId && p.boardId === boardId) {
          return { ...p, boardId: null, sectionId: null };
        }
        return p;
      });
      return { ...prev, boards: updatedBoards, pins: updatedPins };
    });
  };

  const deleteBoard = (boardId) => {
    setState(prev => {
      const updatedPins = prev.pins.map(p => {
        if (p.boardId === boardId) {
          return { ...p, boardId: null, sectionId: null };
        }
        return p;
      });
      return {
        ...prev,
        boards: prev.boards.filter(b => b.id !== boardId),
        pins: updatedPins
      };
    });
  };

  const createSection = (boardId, name) => {
    const newSection = {
      id: generateId(),
      boardId,
      name,
      pins: []
    };
    setState(prev => ({
      ...prev,
      boards: prev.boards.map(b =>
        b.id === boardId
          ? { ...b, sections: [...b.sections, newSection], updatedAt: Date.now() }
          : b
      )
    }));
  };

  const followUser = (targetUserId) => {
    if (state.currentUser.id === targetUserId) return;

    setState(prev => {
      const isFollowing = prev.currentUser.following.includes(targetUserId);

      let newFollowing = [...prev.currentUser.following];
      if (isFollowing) {
        newFollowing = newFollowing.filter(id => id !== targetUserId);
      } else {
        newFollowing.push(targetUserId);
      }

      const updatedCurrentUser = { ...prev.currentUser, following: newFollowing };

      const updatedUsers = prev.users.map(u => {
        if (u.id === prev.currentUser.id) return updatedCurrentUser;
        if (u.id === targetUserId) {
          let newFollowers = [...u.followers];
          if (isFollowing) {
            newFollowers = newFollowers.filter(id => id !== prev.currentUser.id);
          } else {
            newFollowers.push(prev.currentUser.id);
          }
          return { ...u, followers: newFollowers };
        }
        return u;
      });

      return { ...prev, users: updatedUsers, currentUser: updatedCurrentUser };
    });
  };

  const setSearchQuery = (query) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const addComment = (pinId, text) => {
    const newComment = {
      id: generateId(),
      pinId,
      userId: state.currentUser.id,
      text,
      likes: 0,
      likedBy: [],
      createdAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      comments: [...prev.comments, newComment],
      pins: prev.pins.map(p =>
        p.id === pinId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
      )
    }));
  };

  const deleteComment = (commentId) => {
    setState(prev => {
      const comment = prev.comments.find(c => c.id === commentId);
      if (!comment) return prev;
      return {
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId),
        pins: prev.pins.map(p =>
          p.id === comment.pinId ? { ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) } : p
        )
      };
    });
  };

  const likePin = (pinId) => {
    setState(prev => {
      const userId = prev.currentUser.id;
      return {
        ...prev,
        pins: prev.pins.map(p => {
          if (p.id !== pinId) return p;
          const alreadyLiked = (p.likedBy || []).includes(userId);
          if (alreadyLiked) {
            return {
              ...p,
              likedBy: p.likedBy.filter(id => id !== userId),
              likes: Math.max(0, (p.likes || 1) - 1)
            };
          } else {
            return {
              ...p,
              likedBy: [...(p.likedBy || []), userId],
              likes: (p.likes || 0) + 1
            };
          }
        })
      };
    });
  };

  const likeComment = (commentId) => {
    setState(prev => {
      const userId = prev.currentUser.id;
      return {
        ...prev,
        comments: prev.comments.map(c => {
          if (c.id !== commentId) return c;
          const alreadyLiked = (c.likedBy || []).includes(userId);
          if (alreadyLiked) {
            return {
              ...c,
              likedBy: c.likedBy.filter(id => id !== userId),
              likes: Math.max(0, (c.likes || 1) - 1)
            };
          } else {
            return {
              ...c,
              likedBy: [...(c.likedBy || []), userId],
              likes: (c.likes || 0) + 1
            };
          }
        })
      };
    });
  };

  const deletePin = (pinId) => {
    setState(prev => {
      const updatedBoards = prev.boards.map(board => {
        const updatedSections = board.sections.map(section => ({
          ...section,
          pins: section.pins.filter(id => id !== pinId)
        }));
        return {
          ...board,
          pins: board.pins.filter(id => id !== pinId),
          sections: updatedSections,
          coverPinId: board.coverPinId === pinId ? null : board.coverPinId
        };
      });
      const updatedComments = prev.comments.filter(c => c.pinId !== pinId);
      return {
        ...prev,
        pins: prev.pins.filter(p => p.id !== pinId),
        boards: updatedBoards,
        comments: updatedComments
      };
    });
  };

  const updatePin = (pinId, updates) => {
    setState(prev => ({
      ...prev,
      pins: prev.pins.map(p => p.id === pinId ? { ...p, ...updates } : p)
    }));
  };

  const markNotificationRead = (notificationId) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    }));
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
  };

  const updateProfile = (updates) => {
    setState(prev => {
      const updatedCurrentUser = { ...prev.currentUser, ...updates };
      const updatedUsers = prev.users.map(u =>
        u.id === prev.currentUser.id ? updatedCurrentUser : u
      );
      return { ...prev, currentUser: updatedCurrentUser, users: updatedUsers };
    });
  };

  const sendMessage = (conversationId, text) => {
    const newMsg = {
      id: generateId(),
      senderId: state.currentUser.id,
      text,
      createdAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      messages: (prev.messages || []).map(conv =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, newMsg], updatedAt: Date.now() }
          : conv
      )
    }));
  };

  const createConversation = (otherUserId) => {
    // Check if conversation already exists
    const existing = (state.messages || []).find(conv =>
      conv.participants.includes(state.currentUser.id) && conv.participants.includes(otherUserId)
    );
    if (existing) return existing.id;

    const newConv = {
      id: generateId(),
      participants: [state.currentUser.id, otherUserId],
      messages: [],
      updatedAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      messages: [...(prev.messages || []), newConv]
    }));
    return newConv.id;
  };

  const getDebugState = () => {
    return {
      initial_state: initialStateRef,
      current_state: state,
      state_diff: calculateDiff(initialStateRef, state)
    };
  };

  if (loading || !state) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <svg height="40" width="40" viewBox="0 0 24 24" fill="#E60023" style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M0 12c0 5.123 3.211 9.497 7.73 11.218-.11-.937-.227-2.482.025-3.566.217-.932 1.401-5.938 1.401-5.938s-.357-.715-.357-1.774c0-1.66.962-2.899 2.16-2.899 1.017 0 1.508.765 1.508 1.682 0 1.026-.653 2.56-1.01 3.982-.297 1.186.597 2.153 1.769 2.153 2.126 0 3.76-2.245 3.76-5.487 0-2.87-2.064-4.875-5.008-4.875-3.65 0-5.789 2.732-5.789 5.558 0 1.1.424 2.279.952 2.917.105.127.12.237.09.429-.098.636-.316 1.29-.358 1.465-.057.237-.233.287-.536.147-2.002-.932-3.256-3.854-3.256-6.205 0-5.053 3.674-9.696 10.59-9.696 5.56 0 9.874 3.96 9.874 9.24 0 5.514-3.475 9.942-8.293 9.942-1.62 0-3.14-.841-3.66-1.832l-.997 3.79c-.358 1.375-1.332 3.097-1.984 4.025 1.49.46 3.09.71 4.74.71 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12S0 5.373 0 12" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <StoreContext.Provider value={{
      state,
      addPin,
      createBoard,
      updateBoard,
      savePinToBoard,
      removePinFromBoard,
      deleteBoard,
      createSection,
      followUser,
      setSearchQuery,
      addComment,
      deleteComment,
      likePin,
      likeComment,
      deletePin,
      updatePin,
      markNotificationRead,
      markAllNotificationsRead,
      updateProfile,
      sendMessage,
      createConversation,
      getDebugState
    }}>
      {children}
    </StoreContext.Provider>
  );
};

// Simple diff helper
function calculateDiff(obj1, obj2) {
  if (!obj1 || !obj2) return {};
  const diff = {};
  for (let key in obj2) {
    if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      diff[key] = { from: obj1[key], to: obj2[key] };
    }
  }
  return diff;
}
