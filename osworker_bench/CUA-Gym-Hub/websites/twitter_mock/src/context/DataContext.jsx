import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CURRENT_USER_ID, getSessionId, fetchCustomState, saveState, initializeData } from '../utils/mockData';
import { v4 as uuidv4 } from 'uuid';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const BASE_INITIAL_KEY = 'x_clone_initialState';

export const DataProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialState, setInitialState] = useState(null);

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

  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  // --- Actions ---

  const addTweet = (content, images = []) => {
    const newTweet = {
      id: uuidv4(),
      userId: state.currentUser.id,
      content,
      images,
      createdAt: new Date().toISOString(),
      likes: [],
      reposts: [],
      retweets: [],
      replies: [],
      bookmarks: [],
      quotedPostId: null,
      inReplyToPostId: null,
      inReplyToUserId: null,
      views: 0,
    };

    // Generate mention notifications
    const mentionMatches = content.match(/@(\w+)/g) || [];
    const newNotifications = mentionMatches
      .map(m => m.slice(1))
      .map(handle => state.users.find(u => u.handle === handle))
      .filter(u => u && u.id !== state.currentUser.id)
      .map(u => ({
        id: uuidv4(),
        type: 'mention',
        userId: state.currentUser.id,
        postId: newTweet.id,
        tweetId: newTweet.id,
        content: content,
        createdAt: new Date().toISOString(),
        read: false,
      }));

    setState(prev => ({
      ...prev,
      tweets: [newTweet, ...prev.tweets],
      notifications: [...newNotifications, ...prev.notifications],
    }));
  };

  const addReply = (tweetId, content) => {
    const newReply = {
      id: uuidv4(),
      tweetId,
      postId: tweetId,
      userId: state.currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
    };

    setState(prev => {
      const parentTweet = prev.tweets.find(t => t.id === tweetId);
      const updatedTweets = prev.tweets.map(t => {
        if (t.id === tweetId) {
          return { ...t, replies: [...(t.replies || []), newReply.id] };
        }
        return t;
      });

      // Notify original post author (if not self)
      const replyNotifications = [];
      if (parentTweet && parentTweet.userId !== prev.currentUser.id) {
        replyNotifications.push({
          id: uuidv4(),
          type: 'reply',
          userId: prev.currentUser.id,
          postId: tweetId,
          tweetId: tweetId,
          content: content,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      return {
        ...prev,
        tweets: updatedTweets,
        replies: [...prev.replies, newReply],
        notifications: [...replyNotifications, ...prev.notifications],
      };
    });
  };

  const toggleLike = (tweetId) => {
    setState(prev => {
      const tweet = prev.tweets.find(t => t.id === tweetId);
      if (!tweet) return prev;

      const likes = tweet.likes || [];
      const isLiked = likes.includes(prev.currentUser.id);
      const newLikes = isLiked
        ? likes.filter(id => id !== prev.currentUser.id)
        : [...likes, prev.currentUser.id];

      // Generate like notification for post author (only when liking, not unliking)
      const likeNotifications = [];
      if (!isLiked && tweet.userId !== prev.currentUser.id) {
        likeNotifications.push({
          id: uuidv4(),
          type: 'like',
          userId: prev.currentUser.id,
          postId: tweetId,
          tweetId: tweetId,
          content: tweet.content,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      return {
        ...prev,
        tweets: prev.tweets.map(t => t.id === tweetId ? { ...t, likes: newLikes } : t),
        notifications: [...likeNotifications, ...prev.notifications],
      };
    });
  };

  const toggleRetweet = (tweetId) => {
    setState(prev => {
      const tweet = prev.tweets.find(t => t.id === tweetId);
      if (!tweet) return prev;

      const reposts = tweet.reposts || tweet.retweets || [];
      const isRetweeted = reposts.includes(prev.currentUser.id);
      const newReposts = isRetweeted
        ? reposts.filter(id => id !== prev.currentUser.id)
        : [...reposts, prev.currentUser.id];

      // Generate repost notification for post author (only when retweeting, not un-retweeting)
      const retweetNotifications = [];
      if (!isRetweeted && tweet.userId !== prev.currentUser.id) {
        retweetNotifications.push({
          id: uuidv4(),
          type: 'repost',
          userId: prev.currentUser.id,
          postId: tweetId,
          tweetId: tweetId,
          content: tweet.content,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      return {
        ...prev,
        tweets: prev.tweets.map(t => t.id === tweetId ? { ...t, reposts: newReposts, retweets: newReposts } : t),
        notifications: [...retweetNotifications, ...prev.notifications],
      };
    });
  };

  const toggleFollow = (targetUserId) => {
    setState(prev => {
      const isFollowing = prev.currentUser.following.includes(targetUserId);

      const updatedCurrentUser = {
        ...prev.currentUser,
        following: isFollowing
          ? prev.currentUser.following.filter(id => id !== targetUserId)
          : [...prev.currentUser.following, targetUserId]
      };

      const updatedUsers = prev.users.map(u => {
        if (u.id === prev.currentUser.id) return updatedCurrentUser;
        if (u.id === targetUserId) {
          return {
            ...u,
            followers: isFollowing
              ? u.followers.filter(id => id !== prev.currentUser.id)
              : [...u.followers, prev.currentUser.id]
          };
        }
        return u;
      });

      // Generate follow notification (only when following, not unfollowing)
      const followNotifications = [];
      if (!isFollowing) {
        followNotifications.push({
          id: uuidv4(),
          type: 'follow',
          userId: prev.currentUser.id,
          postId: null,
          tweetId: null,
          content: null,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      return {
        ...prev,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        notifications: [...followNotifications, ...prev.notifications],
      };
    });
  };

  const markNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
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

  const toggleBookmark = (postId) => {
    setState(prev => {
      const tweet = prev.tweets.find(t => t.id === postId);
      if (!tweet) return prev;

      const bookmarks = tweet.bookmarks || [];
      const isBookmarked = bookmarks.includes(prev.currentUser.id);
      const newBookmarks = isBookmarked
        ? bookmarks.filter(id => id !== prev.currentUser.id)
        : [...bookmarks, prev.currentUser.id];

      const currentBookmarkedIds = prev.bookmarkedPostIds || [];
      const newBookmarkedPostIds = isBookmarked
        ? currentBookmarkedIds.filter(id => id !== postId)
        : [postId, ...currentBookmarkedIds];

      return {
        ...prev,
        tweets: prev.tweets.map(t => t.id === postId ? { ...t, bookmarks: newBookmarks } : t),
        bookmarkedPostIds: newBookmarkedPostIds,
      };
    });
  };

  const addQuotePost = (content, quotedPostId) => {
    const newTweet = {
      id: uuidv4(),
      userId: state.currentUser.id,
      content,
      images: [],
      createdAt: new Date().toISOString(),
      likes: [],
      reposts: [],
      retweets: [],
      replies: [],
      bookmarks: [],
      quotedPostId,
      inReplyToPostId: null,
      inReplyToUserId: null,
      views: 0,
    };
    setState(prev => ({ ...prev, tweets: [newTweet, ...prev.tweets] }));
  };

  const deletePost = (postId) => {
    setState(prev => {
      const updatedTweets = prev.tweets.filter(t => t.id !== postId);
      const updatedReplies = prev.replies.filter(r => (r.tweetId !== postId && r.postId !== postId));
      const updatedNotifications = prev.notifications.filter(n => n.postId !== postId && n.tweetId !== postId);
      const updatedBookmarkedPostIds = (prev.bookmarkedPostIds || []).filter(id => id !== postId);

      return {
        ...prev,
        tweets: updatedTweets,
        replies: updatedReplies,
        notifications: updatedNotifications,
        bookmarkedPostIds: updatedBookmarkedPostIds,
      };
    });
  };

  const pinPost = (postId) => {
    setState(prev => {
      const newPinnedId = prev.currentUser.pinnedPostId === postId ? null : postId;
      const updatedCurrentUser = { ...prev.currentUser, pinnedPostId: newPinnedId };
      return {
        ...prev,
        currentUser: updatedCurrentUser,
        users: prev.users.map(u => u.id === prev.currentUser.id ? updatedCurrentUser : u),
      };
    });
  };

  const updateProfile = ({ name, bio, location, website, avatar, banner }) => {
    setState(prev => {
      const updatedCurrentUser = {
        ...prev.currentUser,
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(avatar !== undefined && { avatar }),
        ...(banner !== undefined && { banner }),
      };
      return {
        ...prev,
        currentUser: updatedCurrentUser,
        users: prev.users.map(u => u.id === prev.currentUser.id ? updatedCurrentUser : u),
      };
    });
  };

  const sendDirectMessage = (conversationId, content) => {
    const newMessage = {
      id: uuidv4(),
      conversationId,
      senderId: state.currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      read: true,
    };

    setState(prev => {
      const updatedConversations = (prev.conversations || []).map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessageId: newMessage.id,
            lastMessageAt: newMessage.createdAt,
          };
        }
        return c;
      });

      return {
        ...prev,
        directMessages: [...(prev.directMessages || []), newMessage],
        conversations: updatedConversations,
      };
    });
  };

  const markConversationRead = (conversationId) => {
    setState(prev => {
      const updatedMessages = (prev.directMessages || []).map(dm => {
        if (dm.conversationId === conversationId && dm.senderId !== prev.currentUser.id) {
          return { ...dm, read: true };
        }
        return dm;
      });

      const updatedConversations = (prev.conversations || []).map(c => {
        if (c.id === conversationId) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      });

      return {
        ...prev,
        directMessages: updatedMessages,
        conversations: updatedConversations,
      };
    });
  };

  const createList = (name, description, isPrivate = false) => {
    const newList = {
      id: uuidv4(),
      name,
      description,
      ownerId: state.currentUser.id,
      memberIds: [],
      followerIds: [],
      isPrivate,
      createdAt: new Date().toISOString(),
      bannerUrl: null,
    };
    setState(prev => ({
      ...prev,
      lists: [...(prev.lists || []), newList],
    }));
  };

  const addToList = (listId, userId) => {
    setState(prev => ({
      ...prev,
      lists: (prev.lists || []).map(l => {
        if (l.id === listId && !(l.memberIds || []).includes(userId)) {
          return { ...l, memberIds: [...(l.memberIds || []), userId] };
        }
        return l;
      }),
    }));
  };

  const removeFromList = (listId, userId) => {
    setState(prev => ({
      ...prev,
      lists: (prev.lists || []).map(l => {
        if (l.id === listId) {
          return { ...l, memberIds: (l.memberIds || []).filter(id => id !== userId) };
        }
        return l;
      }),
    }));
  };

  const deleteList = (listId) => {
    setState(prev => ({
      ...prev,
      lists: (prev.lists || []).filter(l => l.id !== listId),
    }));
  };

  const muteUser = (targetUserId) => {
    setState(prev => {
      const mutedUsers = prev.mutedUsers || [];
      const isMuted = mutedUsers.includes(targetUserId);
      return {
        ...prev,
        mutedUsers: isMuted
          ? mutedUsers.filter(id => id !== targetUserId)
          : [...mutedUsers, targetUserId],
      };
    });
  };

  const blockUser = (targetUserId) => {
    setState(prev => {
      const blockedUsers = prev.blockedUsers || [];
      const isBlocked = blockedUsers.includes(targetUserId);
      return {
        ...prev,
        blockedUsers: isBlocked
          ? blockedUsers.filter(id => id !== targetUserId)
          : [...blockedUsers, targetUserId],
      };
    });
  };

  const notInterestedInPost = (postId) => {
    setState(prev => {
      const notInterestedIds = prev.notInterestedPostIds || [];
      return {
        ...prev,
        notInterestedPostIds: notInterestedIds.includes(postId)
          ? notInterestedIds
          : [...notInterestedIds, postId],
      };
    });
  };

  const createNewConversation = (targetUserId) => {
    setState(prev => {
      const existing = (prev.conversations || []).find(c =>
        c.participants.includes(prev.currentUser.id) && c.participants.includes(targetUserId)
      );
      if (existing) return prev;
      const newConv = {
        id: uuidv4(),
        participants: [prev.currentUser.id, targetUserId],
        lastMessageId: null,
        lastMessageAt: new Date().toISOString(),
        isPinned: false,
        unreadCount: 0,
      };
      return {
        ...prev,
        conversations: [newConv, ...(prev.conversations || [])],
      };
    });
  };

  // --- Diff ---

  const getDiff = () => {
    if (!initialState || !state) return {};
    const diff = {};
    const keys = new Set([...Object.keys(initialState), ...Object.keys(state)]);
    for (const key of keys) {
      if (JSON.stringify(initialState[key]) !== JSON.stringify(state[key])) {
        diff[key] = { old: initialState[key], new: state[key] };
      }
    }
    return diff;
  };

  if (loading || !state) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#0F1419' }}>Loading...</div>;
  }

  return (
    <DataContext.Provider value={{
      state,
      initialState,
      addTweet,
      addReply,
      toggleLike,
      toggleRetweet,
      toggleFollow,
      toggleBookmark,
      addQuotePost,
      deletePost,
      pinPost,
      updateProfile,
      sendDirectMessage,
      markConversationRead,
      createList,
      addToList,
      removeFromList,
      deleteList,
      markNotificationsRead,
      markNotificationRead,
      muteUser,
      blockUser,
      notInterestedInPost,
      createNewConversation,
      getDiff,
    }}>
      {children}
    </DataContext.Provider>
  );
};
