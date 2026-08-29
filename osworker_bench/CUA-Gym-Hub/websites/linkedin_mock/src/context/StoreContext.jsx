import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_STATE, getSessionId, fetchCustomState, saveState, initializeData } from '../data/mockData';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

const BASE_INITIAL_KEY = 'linkedin_mock_initialState';

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
        setInitialStateRef(data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setInitialStateRef(data);
          setLoading(false);
        });
      }
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const data = initializeData(null, customState);
          setState(data);
          setInitialStateRef(data);
        } else {
          const data = initializeData();
          setState(data);
          setInitialStateRef(data);
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

  // --- Posts ---
  const addPost = (content, image = null, repostOf = null) => {
    const newPost = {
      id: `post_${Date.now()}`,
      userId: state.currentUser.id,
      content,
      image,
      reactions: { like: [], celebrate: [], love: [], insightful: [], funny: [], curious: [] },
      comments: [],
      created: new Date().toISOString(),
      repostedBy: repostOf ? state.currentUser.id : null,
      repostOf: repostOf || null
    };
    setState(prev => ({ ...prev, posts: [newPost, ...prev.posts] }));
  };

  const deletePost = (postId) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== postId)
    }));
  };

  const toggleReaction = (postId, reactionType) => {
    setState(prev => {
      const posts = prev.posts.map(post => {
        if (post.id !== postId) return post;
        const userId = prev.currentUser.id;
        const reactions = { ...post.reactions };

        // First, check if user already has any reaction on this post
        let currentReaction = null;
        for (const type of ['like', 'celebrate', 'love', 'insightful', 'funny', 'curious']) {
          if (reactions[type] && reactions[type].includes(userId)) {
            currentReaction = type;
            break;
          }
        }

        // If clicking the same reaction, toggle it off
        if (currentReaction === reactionType) {
          reactions[reactionType] = reactions[reactionType].filter(id => id !== userId);
        } else {
          // Remove old reaction if any
          if (currentReaction) {
            reactions[currentReaction] = reactions[currentReaction].filter(id => id !== userId);
          }
          // Add new reaction
          reactions[reactionType] = [...(reactions[reactionType] || []), userId];
        }

        return { ...post, reactions };
      });
      return { ...prev, posts };
    });
  };

  // Backward compat: toggleLike maps to toggleReaction('like')
  const toggleLike = (postId) => toggleReaction(postId, 'like');

  const addComment = (postId, content) => {
    const newComment = {
      id: `c_${Date.now()}`,
      userId: state.currentUser.id,
      content,
      created: new Date().toISOString(),
      likes: []
    };
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    }));
  };

  // --- Profile ---
  const updateProfile = (updates) => {
    setState(prev => ({
      ...prev,
      currentUser: { ...prev.currentUser, ...updates }
    }));
  };

  // Experience
  const addExperience = (exp) => {
    const newExp = { ...exp, id: `exp_${Date.now()}` };
    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        experience: [newExp, ...prev.currentUser.experience]
      }
    }));
  };

  const updateExperience = (id, updates) => {
    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        experience: prev.currentUser.experience.map(e =>
          e.id === id ? { ...e, ...updates } : e
        )
      }
    }));
  };

  const deleteExperience = (id) => {
    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        experience: prev.currentUser.experience.filter(e => e.id !== id)
      }
    }));
  };

  // Education
  const addEducation = (edu) => {
    const newEdu = { ...edu, id: `edu_${Date.now()}` };
    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        education: [newEdu, ...prev.currentUser.education]
      }
    }));
  };

  const updateEducation = (id, updates) => {
    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        education: prev.currentUser.education.map(e =>
          e.id === id ? { ...e, ...updates } : e
        )
      }
    }));
  };

  const deleteEducation = (id) => {
    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        education: prev.currentUser.education.filter(e => e.id !== id)
      }
    }));
  };

  // Skills
  const addSkill = (name) => {
    const newSkill = { id: `skill_${Date.now()}`, name, endorsements: 0 };
    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        skills: [...prev.currentUser.skills, newSkill]
      }
    }));
  };

  const removeSkill = (id) => {
    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        skills: prev.currentUser.skills.filter(s => s.id !== id)
      }
    }));
  };

  // --- Network ---
  const sendConnectionRequest = (toUserId, note = '') => {
    const newRequest = {
      id: `req_${Date.now()}`,
      fromUserId: state.currentUser.id,
      toUserId,
      note,
      status: 'pending',
      created: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      connectionRequests: [...(prev.connectionRequests || []), newRequest]
    }));
  };

  const acceptConnectionRequest = (requestId) => {
    setState(prev => {
      const request = prev.connectionRequests.find(r => r.id === requestId);
      if (!request) return prev;

      const updatedRequests = prev.connectionRequests.filter(r => r.id !== requestId);
      const currentUserConnections = [...prev.currentUser.connections, request.fromUserId];

      const updatedUsers = { ...prev.users };
      if (updatedUsers[request.fromUserId]) {
         updatedUsers[request.fromUserId] = {
           ...updatedUsers[request.fromUserId],
           connections: [...(updatedUsers[request.fromUserId].connections || []), prev.currentUser.id]
         };
      }

      return {
        ...prev,
        connectionRequests: updatedRequests,
        currentUser: {
          ...prev.currentUser,
          connections: currentUserConnections
        },
        users: updatedUsers
      };
    });
  };

  const ignoreConnectionRequest = (requestId) => {
    setState(prev => ({
      ...prev,
      connectionRequests: prev.connectionRequests.filter(r => r.id !== requestId)
    }));
  };

  const connectUser = (targetUserId) => {
    sendConnectionRequest(targetUserId);
  };

  const toggleCommentLike = (postId, commentId) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(post => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id !== commentId) return comment;
            const userId = prev.currentUser.id;
            const likes = comment.likes || [];
            const alreadyLiked = likes.includes(userId);
            return {
              ...comment,
              likes: alreadyLiked ? likes.filter(id => id !== userId) : [...likes, userId]
            };
          })
        };
      })
    }));
  };

  const withdrawConnectionRequest = (requestId) => {
    setState(prev => ({
      ...prev,
      connectionRequests: prev.connectionRequests.filter(r => r.id !== requestId)
    }));
  };

  const dismissSuggestion = (userId) => {
    setState(prev => ({
      ...prev,
      dismissedSuggestions: [...(prev.dismissedSuggestions || []), userId]
    }));
  };

  const followCompany = (companyId) => {
    setState(prev => ({
      ...prev,
      followedCompanies: [...(prev.followedCompanies || []), companyId]
    }));
  };

  const unfollowCompany = (companyId) => {
    setState(prev => ({
      ...prev,
      followedCompanies: (prev.followedCompanies || []).filter(id => id !== companyId)
    }));
  };

  // --- Messaging ---
  const sendMessage = (chatId, content) => {
    const newMessage = {
       id: `m_${Date.now()}`,
       senderId: state.currentUser.id,
       content,
       created: new Date().toISOString(),
       read: true
    };

    setState(prev => ({
        ...prev,
        chats: prev.chats.map(chat =>
            chat.id === chatId
            ? { ...chat, messages: [...chat.messages, newMessage] }
            : chat
        )
    }));
  };

  const createChat = (otherUserId) => {
    const existing = state.chats.find(c =>
      c.participants.includes(otherUserId) && c.participants.includes(state.currentUser.id)
    );
    if (existing) return existing.id;

    const newChat = {
      id: `chat_${Date.now()}`,
      participants: [state.currentUser.id, otherUserId],
      messages: []
    };
    setState(prev => ({
      ...prev,
      chats: [newChat, ...prev.chats]
    }));
    return newChat.id;
  };

  const deleteChat = (chatId) => {
    setState(prev => ({
      ...prev,
      chats: prev.chats.filter(c => c.id !== chatId)
    }));
  };

  // --- Notifications ---
  const markNotificationRead = (notifId) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === notifId ? { ...n, read: true } : n
      )
    }));
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
  };

  // --- Jobs ---
  const saveJob = (jobId) => {
    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(j =>
        j.id === jobId ? { ...j, saved: !j.saved } : j
      )
    }));
  };

  const applyToJob = (jobId) => {
    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(j =>
        j.id === jobId ? { ...j, applied: true } : j
      )
    }));
  };

  const getDebugState = () => {
    return {
      initial_state: initialStateRef,
      current_state: state,
      state_diff: calculateDiff(initialStateRef, state)
    };
  };

  if (loading || !state) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f3f2ef' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{
      state,
      addPost,
      deletePost,
      toggleLike,
      toggleReaction,
      addComment,
      toggleCommentLike,
      updateProfile,
      addExperience,
      updateExperience,
      deleteExperience,
      addEducation,
      updateEducation,
      deleteEducation,
      addSkill,
      removeSkill,
      connectUser,
      sendConnectionRequest,
      acceptConnectionRequest,
      ignoreConnectionRequest,
      withdrawConnectionRequest,
      dismissSuggestion,
      followCompany,
      unfollowCompany,
      sendMessage,
      createChat,
      deleteChat,
      markNotificationRead,
      markAllNotificationsRead,
      saveJob,
      applyToJob,
      getDebugState
    }}>
      {children}
    </StoreContext.Provider>
  );
};

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
