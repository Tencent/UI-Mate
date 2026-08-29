import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initializeData, getInitialState, fetchCustomState, getSessionId, saveState, initialData } from './initialData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openChatWindows, setOpenChatWindows] = useState([]); // array of conversationIds (max 2)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      const sessionKey = `fb_mock_initialState_${sid}`;
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

  // Persist state changes
  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  // Actions
  const addPost = (post) => {
    setState(prev => ({
      ...prev,
      posts: [post, ...prev.posts]
    }));
  };

  const toggleLike = (postId, userId, reactionType = 'like') => {
    setState(prev => {
      const posts = prev.posts.map(post => {
        if (post.id === postId) {
          const existingReactionIndex = post.reactions ? post.reactions.findIndex(r => r.userId === userId) : -1;

          let newReactions = post.reactions ? [...post.reactions] : [];

          if (!post.reactions && post.likes) {
             newReactions = post.likes.map(uid => ({ userId: uid, type: 'like' }));
          }

          if (existingReactionIndex >= 0) {
            if (newReactions[existingReactionIndex].type === reactionType) {
              newReactions = newReactions.filter(r => r.userId !== userId);
            } else {
              newReactions[existingReactionIndex].type = reactionType;
            }
          } else {
            newReactions = [...newReactions, { userId, type: reactionType }];
          }

          return { ...post, reactions: newReactions, likes: newReactions.map(r => r.userId) };
        }
        return post;
      });
      return { ...prev, posts };
    });
  };

  const deletePost = (postId) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== postId)
    }));
  };

  const editPost = (postId, newContent) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p =>
        p.id === postId ? { ...p, content: newContent, edited: true } : p
      )
    }));
  };

  const toggleCommentLike = (postId, commentId, userId, isReply = false, parentCommentId = null) => {
    setState(prev => {
      const posts = prev.posts.map(post => {
        if (post.id !== postId) return post;
        if (isReply && parentCommentId) {
          const updatedComments = post.comments.map(c => {
            if (c.id !== parentCommentId) return c;
            const updatedReplies = (c.replies || []).map(r => {
              if (r.id !== commentId) return r;
              const likes = r.likes || [];
              return {
                ...r,
                likes: likes.includes(userId) ? likes.filter(id => id !== userId) : [...likes, userId]
              };
            });
            return { ...c, replies: updatedReplies };
          });
          return { ...post, comments: updatedComments };
        }
        const updatedComments = post.comments.map(c => {
          if (c.id !== commentId) return c;
          const likes = c.likes || [];
          return {
            ...c,
            likes: likes.includes(userId) ? likes.filter(id => id !== userId) : [...likes, userId]
          };
        });
        return { ...post, comments: updatedComments };
      });
      return { ...prev, posts };
    });
  };

  const deleteComment = (postId, commentId, isReply = false, parentCommentId = null) => {
    setState(prev => {
      const posts = prev.posts.map(post => {
        if (post.id !== postId) return post;
        if (isReply && parentCommentId) {
          const updatedComments = post.comments.map(c => {
            if (c.id !== parentCommentId) return c;
            return { ...c, replies: (c.replies || []).filter(r => r.id !== commentId) };
          });
          return { ...post, comments: updatedComments };
        }
        return { ...post, comments: post.comments.filter(c => c.id !== commentId) };
      });
      return { ...prev, posts };
    });
  };

  const addComment = (postId, comment, parentId = null) => {    setState(prev => {
      const posts = prev.posts.map(post => {
        if (post.id === postId) {
          if (parentId) {
            const updatedComments = post.comments.map(c => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), comment]
                };
              }
              return c;
            });
            return { ...post, comments: updatedComments };
          } else {
            return {
              ...post,
              comments: [...post.comments, { ...comment, replies: [] }]
            };
          }
        }
        return post;
      });
      return { ...prev, posts };
    });
  };

  const addStory = (story) => {
    setState(prev => ({
      ...prev,
      stories: [story, ...(prev.stories || [])]
    }));
  };

  const markStoryViewed = (storyId) => {
    setState(prev => ({
      ...prev,
      stories: (prev.stories || []).map(s => s.id === storyId ? { ...s, viewed: true } : s)
    }));
  };

  const markNotificationRead = (notifId) => {
    setState(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n =>
        n.id === notifId ? { ...n, read: true } : n
      )
    }));
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => ({ ...n, read: true }))
    }));
  };

  const sendMessage = (convKey, content, senderId) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId,
      content,
      timestamp: Date.now(),
      read: true
    };
    setState(prev => ({
      ...prev,
      messages: {
        ...(prev.messages || {}),
        [convKey]: [...(prev.messages?.[convKey] || []), newMsg]
      }
    }));
  };

  const openChatWith = (userId) => {
    const convKey = `conv_${userId}`;
    setOpenChatWindows(prev => {
      if (prev.includes(convKey)) return prev;
      const next = [convKey, ...prev].slice(0, 2);
      return next;
    });
    setIsChatOpen(false);
  };

  const closeChatWindow = (convKey) => {
    setOpenChatWindows(prev => prev.filter(k => k !== convKey));
  };

  const handleFriendRequest = (requesterId, action) => {
    setState(prev => {
      const newRequests = prev.friendRequests.filter(req => req.id !== requesterId);
      let newFriends = prev.currentUser.friends;

      if (action === 'confirm') {
        newFriends = [...newFriends, requesterId];
      }

      return {
        ...prev,
        friendRequests: newRequests,
        currentUser: {
          ...prev.currentUser,
          friends: newFriends
        },
        users: {
          ...prev.users,
          [prev.currentUser.id]: {
            ...prev.users[prev.currentUser.id],
            friends: newFriends
          },
          [requesterId]: {
            ...prev.users[requesterId],
            friends: action === 'confirm' ? [...prev.users[requesterId].friends, prev.currentUser.id] : prev.users[requesterId].friends
          }
        }
      };
    });
  };

  const sendFriendRequest = (targetUserId) => {
    // Add a friend request from current user to target (stored in target's perspective as incoming)
    // For mock purposes, we directly add to friendRequests of currentUser to simulate mutual
    // Actually: we model this by tracking outgoing requests in state
    setState(prev => {
      const alreadyFriends = (prev.currentUser.friends || []).includes(targetUserId);
      if (alreadyFriends) return prev;
      const alreadyRequested = (prev.outgoingFriendRequests || []).includes(targetUserId);
      if (alreadyRequested) return prev;
      return {
        ...prev,
        outgoingFriendRequests: [...(prev.outgoingFriendRequests || []), targetUserId]
      };
    });
  };

  const unfriend = (targetUserId) => {
    setState(prev => {
      const newFriends = (prev.currentUser.friends || []).filter(fid => fid !== targetUserId);
      return {
        ...prev,
        currentUser: {
          ...prev.currentUser,
          friends: newFriends
        },
        users: {
          ...prev.users,
          [prev.currentUser.id]: {
            ...prev.users[prev.currentUser.id],
            friends: newFriends
          },
          [targetUserId]: {
            ...prev.users[targetUserId],
            friends: (prev.users[targetUserId]?.friends || []).filter(fid => fid !== prev.currentUser.id)
          }
        }
      };
    });
  };

  const savePost = (postId) => {
    setState(prev => {
      const alreadySaved = (prev.savedItems || []).some(
        item => item.type === 'post' && item.referenceId === postId
      );
      if (alreadySaved) return prev;
      const newItem = {
        id: `saved_${Date.now()}`,
        type: 'post',
        referenceId: postId,
        savedAt: Date.now(),
        collection: null
      };
      return {
        ...prev,
        savedItems: [...(prev.savedItems || []), newItem]
      };
    });
  };

  const unsaveItem = (savedItemId) => {
    setState(prev => ({
      ...prev,
      savedItems: (prev.savedItems || []).filter(item => item.id !== savedItemId)
    }));
  };

  const hidePost = (postId) => {
    setState(prev => ({
      ...prev,
      hiddenPosts: [...(prev.hiddenPosts || []), postId]
    }));
  };

  const reportPost = (postId) => {
    setState(prev => ({
      ...prev,
      reportedPosts: [...(prev.reportedPosts || []), { postId, reportedAt: Date.now() }]
    }));
  };

  const addListing = (listing) => {
    setState(prev => ({
      ...prev,
      marketplace: [listing, ...(prev.marketplace || [])]
    }));
  };

  const toggleSaveListing = (listingId) => {
    setState(prev => ({
      ...prev,
      marketplace: (prev.marketplace || []).map(l =>
        l.id === listingId ? { ...l, saved: !l.saved } : l
      )
    }));
  };

  const updateRSVP = (eventId, status) => {
    setState(prev => {
      const userId = prev.currentUser.id;
      const events = (prev.events || []).map(event => {
        if (event.id !== eventId) return event;
        let going = [...(event.going || [])];
        let interested = [...(event.interested || [])];
        // Remove from both lists first
        going = going.filter(id => id !== userId);
        interested = interested.filter(id => id !== userId);
        // Add to appropriate list
        if (status === 'going') {
          going = [...going, userId];
        } else if (status === 'interested') {
          interested = [...interested, userId];
        }
        return { ...event, going, interested };
      });
      return { ...prev, events };
    });
  };

  const updateProfile = (updates) => {
    setState(prev => ({
      ...prev,
      currentUser: { ...prev.currentUser, ...updates },
      users: {
        ...prev.users,
        [prev.currentUser.id]: { ...prev.users[prev.currentUser.id], ...updates }
      }
    }));
  };

  const togglePageLike = (pageId) => {
    setState(prev => {
      const userId = prev.currentUser.id;
      const pages = (prev.pages || []).map(page => {
        if (page.id !== pageId) return page;
        const isLiked = page.isLiked;
        const followers = isLiked
          ? (page.followers || []).filter(id => id !== userId)
          : [...(page.followers || []), userId];
        return { ...page, isLiked: !isLiked, followers };
      });
      return { ...prev, pages };
    });
  };

  const sharePost = (postId) => {
    setState(prev => {
      const posts = (prev.posts || []).map(post => {
        if (post.id !== postId) return post;
        return { ...post, shares: (post.shares || 0) + 1 };
      });
      return { ...prev, posts };
    });
  };

  const addEvent = (event) => {
    setState(prev => ({
      ...prev,
      events: [...(prev.events || []), event]
    }));
  };

  const joinGroup = (groupId) => {
    setState(prev => {
      const groups = (prev.groups || []).map(g => {
        if (g.id !== groupId) return g;
        if ((g.members || []).includes(prev.currentUser.id)) return g;
        return { ...g, members: [...(g.members || []), prev.currentUser.id] };
      });
      return { ...prev, groups };
    });
  };

  const leaveGroup = (groupId) => {
    setState(prev => {
      const groups = (prev.groups || []).map(g => {
        if (g.id !== groupId) return g;
        return { ...g, members: (g.members || []).filter(id => id !== prev.currentUser.id) };
      });
      return { ...prev, groups };
    });
  };

  const createGroup = (groupData) => {
    setState(prev => ({
      ...prev,
      groups: [...(prev.groups || []), groupData]
    }));
  };

  const addPageReview = (pageId, review) => {
    setState(prev => {
      const pages = (prev.pages || []).map(page => {
        if (page.id !== pageId) return page;
        return { ...page, reviews: [...(page.reviews || []), review] };
      });
      return { ...prev, pages };
    });
  };

  const getUser = (userId) => state ? state.users[userId] : null;
  const getGroup = (groupId) => state ? state.groups.find(g => g.id === groupId) : null;
  const getPage = (pageId) => state ? state.pages.find(p => p.id === pageId) : null;

  const value = {
    state,
    loading,
    initialState: getInitialState(sidRef.current) || initialData,
    currentUser: state ? state.currentUser : null,
    addPost,
    toggleLike,
    addComment,
    deletePost,
    editPost,
    toggleCommentLike,
    deleteComment,
    getUser,
    getGroup,
    getPage,
    joinGroup,
    leaveGroup,
    createGroup,
    handleFriendRequest,
    sendFriendRequest,
    unfriend,
    savePost,
    unsaveItem,
    hidePost,
    reportPost,
    addListing,
    toggleSaveListing,
    updateRSVP,
    addEvent,
    updateProfile,
    togglePageLike,
    addPageReview,
    sharePost,
    addStory,
    markStoryViewed,
    markNotificationRead,
    markAllNotificationsRead,
    sendMessage,
    openChatWith,
    closeChatWindow,
    openChatWindows,
    isChatOpen,
    setIsChatOpen,
    isNotificationsOpen,
    setIsNotificationsOpen
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
