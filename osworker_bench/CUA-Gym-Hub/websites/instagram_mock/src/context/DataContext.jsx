import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { generateInitialData, CURRENT_USER_ID, BASE_INITIAL_KEY, getSessionId, fetchCustomState, saveState, initializeData } from '../utils/mockData';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [initialState, setInitialState] = useState(null);
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
        setInitialState(data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setInitialState(data);
          setLoading(false);
        });
      }
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const data = initializeData(null, customState);
          setState(data);
          setInitialState(data);
        } else {
          const data = initializeData();
          setState(data);
          setInitialState(data);
        }
        setLoading(false);
      });
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  // --- Post Actions ---

  const toggleLike = (postId) => {
    setState(prev => {
      const posts = prev.posts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likes.includes(CURRENT_USER_ID);
          const newLikes = isLiked
            ? post.likes.filter(id => id !== CURRENT_USER_ID)
            : [...post.likes, CURRENT_USER_ID];
          return { ...post, likes: newLikes };
        }
        return post;
      });
      return { ...prev, posts };
    });
  };

  const toggleCommentLike = (postId, commentId) => {
    setState(prev => {
      const posts = prev.posts.map(post => {
        if (post.id === postId) {
          const comments = post.comments.map(comment => {
            if (comment.id === commentId) {
              const likes = comment.likes || [];
              const isLiked = likes.includes(CURRENT_USER_ID);
              const newLikes = isLiked
                ? likes.filter(id => id !== CURRENT_USER_ID)
                : [...likes, CURRENT_USER_ID];
              return { ...comment, likes: newLikes };
            }
            return comment;
          });
          return { ...post, comments };
        }
        return post;
      });
      return { ...prev, posts };
    });
  };

  const addComment = (postId, text) => {
    const newComment = {
      id: `c_${Date.now()}`,
      userId: CURRENT_USER_ID,
      text,
      created: new Date().toISOString(),
      likes: [],
      isReply: false,
      replyToId: null
    };

    setState(prev => {
      const posts = prev.posts.map(post => {
        if (post.id === postId) {
          return { ...post, comments: [...post.comments, newComment] };
        }
        return post;
      });
      return { ...prev, posts };
    });
  };

  const toggleSave = (postId) => {
    setState(prev => {
      const isSaved = prev.savedPostIds.includes(postId);
      const newSavedPostIds = isSaved
        ? prev.savedPostIds.filter(id => id !== postId)
        : [...prev.savedPostIds, postId];

      const posts = prev.posts.map(post => {
        if (post.id === postId) {
          const saved = post.saved || [];
          const newSaved = isSaved
            ? saved.filter(id => id !== CURRENT_USER_ID)
            : [...saved, CURRENT_USER_ID];
          return { ...post, saved: newSaved };
        }
        return post;
      });

      return { ...prev, posts, savedPostIds: newSavedPostIds };
    });
  };

  const deletePost = (postId) => {
    setState(prev => {
      const post = prev.posts.find(p => p.id === postId);
      if (!post || post.userId !== CURRENT_USER_ID) return prev;
      const posts = prev.posts.filter(p => p.id !== postId);
      const savedPostIds = prev.savedPostIds.filter(id => id !== postId);
      return { ...prev, posts, savedPostIds };
    });
  };

  const deleteComment = (postId, commentId) => {
    setState(prev => {
      const posts = prev.posts.map(post => {
        if (post.id === postId) {
          const comment = post.comments.find(c => c.id === commentId);
          if (!comment || comment.userId !== CURRENT_USER_ID) return post;
          return { ...post, comments: post.comments.filter(c => c.id !== commentId) };
        }
        return post;
      });
      return { ...prev, posts };
    });
  };

  const updatePost = (postId, updates) => {
    setState(prev => {
      const posts = prev.posts.map(post => {
        if (post.id === postId && post.userId === CURRENT_USER_ID) {
          return { ...post, ...updates };
        }
        return post;
      });
      return { ...prev, posts };
    });
  };

  const addReply = (postId, commentId, text) => {
    const newReply = {
      id: `c_${Date.now()}`,
      userId: CURRENT_USER_ID,
      text,
      created: new Date().toISOString(),
      likes: [],
      isReply: true,
      replyToId: commentId,
    };

    setState(prev => {
      const posts = prev.posts.map(post => {
        if (post.id === postId) {
          // Insert reply right after the parent comment
          const idx = post.comments.findIndex(c => c.id === commentId);
          if (idx === -1) {
            return { ...post, comments: [...post.comments, newReply] };
          }
          const newComments = [
            ...post.comments.slice(0, idx + 1),
            newReply,
            ...post.comments.slice(idx + 1),
          ];
          return { ...post, comments: newComments };
        }
        return post;
      });
      return { ...prev, posts };
    });
  };

  const switchAccount = (targetUserId) => {
    setState(prev => ({
      ...prev,
      currentUserId: targetUserId,
    }));
  };

  const getTaggedPosts = (userId) => {
    if (!state) return [];
    const user = state.users[userId];
    if (!user) return [];
    return state.posts.filter(p =>
      (p.taggedUsers && p.taggedUsers.includes(userId)) ||
      (p.caption && user.username && p.caption.includes(`@${user.username}`))
    );
  };

  // --- User Actions ---

  const toggleFollow = (targetUserId) => {
    if (targetUserId === CURRENT_USER_ID) return;

    setState(prev => {
      const currentUser = { ...prev.users[CURRENT_USER_ID] };
      const targetUser = { ...prev.users[targetUserId] };

      const isFollowing = currentUser.following.includes(targetUserId);

      if (isFollowing) {
        currentUser.following = currentUser.following.filter(id => id !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id !== CURRENT_USER_ID);
      } else {
        currentUser.following = [...currentUser.following, targetUserId];
        targetUser.followers = [...targetUser.followers, CURRENT_USER_ID];
      }

      return {
        ...prev,
        users: {
          ...prev.users,
          [CURRENT_USER_ID]: currentUser,
          [targetUserId]: targetUser
        }
      };
    });
  };

  const updateUserProfile = (updates) => {
    setState(prev => ({
      ...prev,
      users: {
        ...prev.users,
        [CURRENT_USER_ID]: { ...prev.users[CURRENT_USER_ID], ...updates }
      }
    }));
  };

  // --- Post Creation ---

  const createPost = (postData) => {
    const newPost = {
      id: `post_${Date.now()}`,
      userId: CURRENT_USER_ID,
      images: postData.images,
      caption: postData.caption,
      location: postData.location || '',
      taggedUsers: postData.taggedUsers || [],
      likes: [],
      comments: [],
      saved: [],
      created: new Date().toISOString(),
      ...(postData.altText ? { altText: postData.altText } : {}),
      ...(postData.hideLikes ? { hideLikes: postData.hideLikes } : {})
    };

    setState(prev => ({
      ...prev,
      posts: [newPost, ...prev.posts]
    }));
  };

  // --- Stories ---

  const markStoryViewed = (storyId) => {
    setState(prev => {
       const stories = prev.stories.map(s => {
         if (s.id === storyId) {
           return { ...s, viewed: true };
         }
         return s;
       });
       return { ...prev, stories };
    });
  };

  // --- Messages ---

  const sendMessage = (conversationId, text, type = 'text') => {
    const newMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: CURRENT_USER_ID,
      text,
      type,
      imageUrl: type === 'image' ? text : null,
      sharedPostId: type === 'post_share' ? text : null,
      created: new Date().toISOString()
    };

    setState(prev => {
      const messages = [...prev.messages, newMessage];
      const conversations = prev.conversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: type === 'text' ? text : (type === 'image' ? 'Sent a photo' : 'Shared a post'),
            lastMessageTime: newMessage.created,
            unreadCount: 0
          };
        }
        return conv;
      });
      return { ...prev, messages, conversations };
    });
  };

  const markConversationRead = (conversationId) => {
    setState(prev => {
      const conversations = prev.conversations.map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      });
      return { ...prev, conversations };
    });
  };

  const unsendMessage = (messageId) => {
    setState(prev => {
      const msg = prev.messages.find(m => m.id === messageId);
      if (!msg || msg.senderId !== CURRENT_USER_ID) return prev;
      const messages = prev.messages.filter(m => m.id !== messageId);
      // Update last message in conversation
      const convMessages = messages.filter(m => m.conversationId === msg.conversationId);
      const lastMsg = convMessages.length > 0 ? convMessages[convMessages.length - 1] : null;
      const conversations = prev.conversations.map(conv => {
        if (conv.id === msg.conversationId) {
          return {
            ...conv,
            lastMessage: lastMsg ? (lastMsg.type === 'text' ? lastMsg.text : 'Shared media') : '',
            lastMessageTime: lastMsg ? lastMsg.created : conv.lastMessageTime,
          };
        }
        return conv;
      });
      return { ...prev, messages, conversations };
    });
  };

  // --- Notifications ---

  const markNotificationRead = (notifId) => {
    setState(prev => {
      const notifications = prev.notifications.map(n => {
        if (n.id === notifId) {
          return { ...n, read: true };
        }
        return n;
      });
      return { ...prev, notifications };
    });
  };

  const markAllNotificationsRead = () => {
    setState(prev => {
      const notifications = prev.notifications.map(n => ({ ...n, read: true }));
      return { ...prev, notifications };
    });
  };

  // --- Computed Getters ---

  const getUnreadNotificationCount = () => {
    if (!state || !state.notifications) return 0;
    return state.notifications.filter(n => !n.read).length;
  };

  const getUnreadMessageCount = () => {
    if (!state || !state.conversations) return 0;
    return state.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  };

  const getSavedPosts = () => {
    if (!state) return [];
    return state.posts.filter(p => state.savedPostIds.includes(p.id));
  };

  const getConversationMessages = (conversationId) => {
    if (!state || !state.messages) return [];
    return state.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.created) - new Date(b.created));
  };

  const loadMorePosts = () => {
    setState(prev => {
      const existingPosts = prev.posts;
      if (existingPosts.length > 50) return prev;

      const postsToDuplicate = existingPosts.slice(0, 3);
      const newPosts = postsToDuplicate.map((p, i) => ({
        ...p,
        id: `post_dup_${Date.now()}_${i}`,
        created: new Date(new Date(p.created).getTime() - 10000000).toISOString(),
        likes: [],
        comments: [],
        saved: []
      }));

      return {
        ...prev,
        posts: [...prev.posts, ...newPosts]
      };
    });
  };

  const getFeed = () => {
    if (!state || !state.users || !state.users[CURRENT_USER_ID]) return [];
    const following = state.users[CURRENT_USER_ID].following;
    const feedUsers = [...following, CURRENT_USER_ID];
    return state.posts
      .filter(p => feedUsers.includes(p.userId))
      .sort((a, b) => new Date(b.created) - new Date(a.created));
  };

  const getExplore = () => {
    if (!state) return [];
    return [...state.posts].sort((a, b) => b.likes.length - a.likes.length);
  };

  const getUserPosts = (userId) => {
    if (!state) return [];
    return state.posts
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.created) - new Date(a.created));
  };

  if (loading || !state) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fafafa' }}>Loading...</div>;
  }

  return (
    <DataContext.Provider value={{
      state,
      initialState,
      currentUser: state.users[state.currentUserId || CURRENT_USER_ID],
      users: state.users,
      stories: state.stories,
      notifications: state.notifications || [],
      conversations: state.conversations || [],
      messages: state.messages || [],
      savedPostIds: state.savedPostIds || [],
      toggleLike,
      toggleCommentLike,
      addComment,
      addReply,
      toggleSave,
      deletePost,
      updatePost,
      deleteComment,
      toggleFollow,
      createPost,
      markStoryViewed,
      updateUserProfile,
      sendMessage,
      markConversationRead,
      unsendMessage,
      markNotificationRead,
      markAllNotificationsRead,
      getUnreadNotificationCount,
      getUnreadMessageCount,
      getSavedPosts,
      getConversationMessages,
      loadMorePosts,
      getFeed,
      getExplore,
      getUserPosts,
      getTaggedPosts,
      switchAccount,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
