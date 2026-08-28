import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initializeData, getInitialState, fetchCustomState, getSessionId, saveState, calculateStateDiff } from './initialData';
import { generateId } from './utils';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      // Check BEFORE initializeData if session data already exists in localStorage
      const sessionKey = `reddit_clone_initial_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        setState(data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setLoading(false);
        });
      }
    } else {
      const data = initializeData();
      setState(data);
      setLoading(false);
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    if (state && !loading) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  const actions = {
    vote: (targetId, targetType, value) => {
      setState(prev => {
        const userId = prev.currentUser.id;
        const existingVoteIndex = prev.votes.findIndex(v => v.userId === userId && v.targetId === targetId);
        let newVotes = [...prev.votes];

        const collection = targetType === 'post' ? 'posts' : 'comments';
        const targetIndex = prev[collection].findIndex(i => i.id === targetId);
        if (targetIndex === -1) return prev;

        const newCollection = [...prev[collection]];
        const item = { ...newCollection[targetIndex] };

        if (existingVoteIndex >= 0) {
          const existingVote = newVotes[existingVoteIndex];
          if (existingVote.value === value) {
            // Toggle off (remove vote)
            newVotes.splice(existingVoteIndex, 1);
            if (value === 1) item.upvotes--;
            else if (value === -1) item.downvotes--;
          } else {
            // Switch vote (e.g. up to down)
            newVotes[existingVoteIndex] = { ...existingVote, value };
            if (value === 1) {
              item.upvotes++;
              item.downvotes--;
            } else {
              item.upvotes--;
              item.downvotes++;
            }
          }
        } else {
          // New vote
          newVotes.push({ id: generateId(), userId, targetId, targetType, value });
          if (value === 1) item.upvotes++;
          else if (value === -1) item.downvotes++;
        }

        newCollection[targetIndex] = item;
        return { ...prev, votes: newVotes, [collection]: newCollection };
      });
    },

    addComment: (postId, content, parentId = null) => {
      setState(prev => {
        const newComment = {
          id: generateId(),
          postId,
          parentId,
          userId: prev.currentUser.id,
          content,
          upvotes: 1,
          downvotes: 0,
          created: new Date().toISOString(),
          isEdited: false,
          isDistinguished: false,
          awards: []
        };

        const newComments = [...prev.comments, newComment];
        const newPosts = prev.posts.map(p => {
          if (p.id === postId) {
            return { ...p, commentIds: [...(p.commentIds || []), newComment.id] };
          }
          return p;
        });

        return { ...prev, comments: newComments, posts: newPosts };
      });
    },

    addPost: ({ subredditId, title, content, type, url, flairId = null, isSpoiler = false, isNSFW = false }) => {
      const newPost = {
        id: generateId(),
        subredditId,
        userId: state.currentUser.id,
        title,
        content,
        type,
        url,
        flairId,
        upvotes: 1,
        downvotes: 0,
        created: new Date().toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler,
        isNSFW,
        commentIds: [],
        awards: [],
        pollOptions: null,
      };
      setState(prev => ({
        ...prev,
        posts: [newPost, ...prev.posts]
      }));
      return newPost.id;
    },

    createCommunity: ({ name, description = '' }) => {
      setState(prev => {
        const newSub = {
          id: generateId(),
          name,
          description,
          icon: `https://picsum.photos/64/64?random=${name}`,
          bannerColor: '#0079D3',
          members: 1,
          online: 1,
          created: new Date().toISOString(),
          rules: [],
          moderators: [prev.currentUser.id],
          flairs: [],
        };
        return {
          ...prev,
          subreddits: [...prev.subreddits, newSub],
          currentUser: {
            ...prev.currentUser,
            joinedSubreddits: [...(prev.currentUser.joinedSubreddits || []), newSub.id],
          },
        };
      });
    },

    giveAward: (targetId, targetType, awardId) => {
      setState(prev => {
        const collection = targetType === 'post' ? 'posts' : 'comments';
        const targetIndex = prev[collection].findIndex(i => i.id === targetId);
        if (targetIndex === -1) return prev;

        const newCollection = [...prev[collection]];
        const item = { ...newCollection[targetIndex] };
        item.awards = [...(item.awards || []), awardId];
        newCollection[targetIndex] = item;

        return { ...prev, [collection]: newCollection };
      });
    },

    // --- Join / Leave subreddit ---
    joinSubreddit: (subredditId) => {
      setState(prev => {
        const joined = prev.currentUser.joinedSubreddits || [];
        if (joined.includes(subredditId)) return prev;
        return {
          ...prev,
          currentUser: {
            ...prev.currentUser,
            joinedSubreddits: [...joined, subredditId]
          }
        };
      });
    },

    leaveSubreddit: (subredditId) => {
      setState(prev => {
        const joined = prev.currentUser.joinedSubreddits || [];
        return {
          ...prev,
          currentUser: {
            ...prev.currentUser,
            joinedSubreddits: joined.filter(id => id !== subredditId)
          }
        };
      });
    },

    // --- Save / Unsave post ---
    savePost: (postId) => {
      setState(prev => {
        const saved = prev.currentUser.savedPosts || [];
        if (saved.includes(postId)) return prev;
        return {
          ...prev,
          currentUser: {
            ...prev.currentUser,
            savedPosts: [...saved, postId]
          }
        };
      });
    },

    unsavePost: (postId) => {
      setState(prev => ({
        ...prev,
        currentUser: {
          ...prev.currentUser,
          savedPosts: (prev.currentUser.savedPosts || []).filter(id => id !== postId)
        }
      }));
    },

    // --- Save / Unsave comment ---
    saveComment: (commentId) => {
      setState(prev => {
        const saved = prev.currentUser.savedComments || [];
        if (saved.includes(commentId)) return prev;
        return {
          ...prev,
          currentUser: {
            ...prev.currentUser,
            savedComments: [...saved, commentId]
          }
        };
      });
    },

    unsaveComment: (commentId) => {
      setState(prev => ({
        ...prev,
        currentUser: {
          ...prev.currentUser,
          savedComments: (prev.currentUser.savedComments || []).filter(id => id !== commentId)
        }
      }));
    },

    // --- Hide / Unhide post ---
    hidePost: (postId) => {
      setState(prev => {
        const hidden = prev.currentUser.hiddenPosts || [];
        if (hidden.includes(postId)) return prev;
        return {
          ...prev,
          currentUser: {
            ...prev.currentUser,
            hiddenPosts: [...hidden, postId]
          }
        };
      });
    },

    unhidePost: (postId) => {
      setState(prev => ({
        ...prev,
        currentUser: {
          ...prev.currentUser,
          hiddenPosts: (prev.currentUser.hiddenPosts || []).filter(id => id !== postId)
        }
      }));
    },

    // --- Edit / Delete comment ---
    editComment: (commentId, newContent) => {
      setState(prev => ({
        ...prev,
        comments: prev.comments.map(c =>
          c.id === commentId ? { ...c, content: newContent, isEdited: true } : c
        )
      }));
    },

    deleteComment: (commentId) => {
      setState(prev => ({
        ...prev,
        comments: prev.comments.map(c =>
          c.id === commentId ? { ...c, content: "[deleted]", userId: null } : c
        )
      }));
    },

    // --- Edit / Delete post ---
    editPost: (postId, updates) => {
      setState(prev => ({
        ...prev,
        posts: prev.posts.map(p =>
          p.id === postId ? { ...p, ...updates } : p
        )
      }));
    },

    deletePost: (postId) => {
      setState(prev => ({
        ...prev,
        posts: prev.posts.map(p =>
          p.id === postId ? { ...p, title: "[deleted]", content: "[removed]", userId: null } : p
        )
      }));
    },

    // --- Report post ---
    reportPost: (postId) => {
      setState(prev => {
        const reported = prev.currentUser.reportedPosts || [];
        if (reported.includes(postId)) return prev;
        return {
          ...prev,
          currentUser: {
            ...prev.currentUser,
            reportedPosts: [...reported, postId],
          },
        };
      });
    },

    // --- Notifications ---
    markNotificationRead: (notificationId) => {
      setState(prev => ({
        ...prev,
        notifications: (prev.notifications || []).map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      }));
    },

    markAllNotificationsRead: () => {
      setState(prev => ({
        ...prev,
        notifications: (prev.notifications || []).map(n => ({ ...n, read: true }))
      }));
    },
  };

  const getDebugState = () => {
    const initial = getInitialState(sidRef.current);
    const initialState = initial || state;
    const diff = calculateStateDiff(initialState, state);

    return {
      initial_state: initialState,
      current_state: state,
      state_diff: diff
    };
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{ state, actions, getDebugState, getInitialState: () => getInitialState(sidRef.current) }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
