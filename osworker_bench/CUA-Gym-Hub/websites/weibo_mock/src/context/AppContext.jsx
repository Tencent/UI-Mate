import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { createInitialData, loadState, saveState, getStateDiff } from '../utils/dataManager';

const AppContext = createContext(null);

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload };

    case 'SET_FEED_TAB':
      return { ...state, ui: { ...state.ui, feedTab: action.tab } };

    case 'SET_SEARCH_QUERY':
      return { ...state, ui: { ...state.ui, searchQuery: action.query } };

    case 'PUBLISH_POST': {
      const newPost = {
        id: generateId('post'),
        userId: 'user_current',
        text: action.text,
        images: action.images || [],
        video: action.video || null,
        createdAt: new Date().toISOString(),
        source: '微博网页版',
        repostCount: 0,
        commentCount: 0,
        likeCount: 0,
        isLiked: false,
        isReposted: false,
        repostOf: null,
        repostText: '',
        isLongText: action.text.length > 140,
        topicIds: [],
      };
      const updatedCurrentUser = {
        ...state.currentUser,
        postsCount: state.currentUser.postsCount + 1,
      };
      return {
        ...state,
        currentUser: updatedCurrentUser,
        users: {
          ...state.users,
          user_current: updatedCurrentUser,
        },
        posts: {
          [newPost.id]: newPost,
          ...state.posts,
        },
      };
    }

    case 'REPOST_POST': {
      const originalPost = state.posts[action.postId];
      if (!originalPost) return state;
      const newPost = {
        id: generateId('post'),
        userId: 'user_current',
        text: action.text || '',
        images: [],
        video: null,
        createdAt: new Date().toISOString(),
        source: '微博网页版',
        repostCount: 0,
        commentCount: 0,
        likeCount: 0,
        isLiked: false,
        isReposted: true,
        repostOf: action.postId,
        repostText: action.text || '',
        isLongText: false,
        topicIds: [],
      };
      const updatedCurrentUser = {
        ...state.currentUser,
        postsCount: state.currentUser.postsCount + 1,
      };
      return {
        ...state,
        currentUser: updatedCurrentUser,
        users: {
          ...state.users,
          user_current: updatedCurrentUser,
        },
        posts: {
          [newPost.id]: newPost,
          ...state.posts,
          [action.postId]: {
            ...originalPost,
            repostCount: originalPost.repostCount + 1,
            isReposted: true,
          },
        },
      };
    }

    case 'TOGGLE_LIKE_POST': {
      const post = state.posts[action.postId];
      if (!post) return state;
      return {
        ...state,
        posts: {
          ...state.posts,
          [action.postId]: {
            ...post,
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
          },
        },
      };
    }

    case 'DELETE_POST': {
      const { [action.postId]: deletedPost, ...remainingPosts } = state.posts;
      const updatedCurrentUser = {
        ...state.currentUser,
        postsCount: Math.max(0, state.currentUser.postsCount - 1),
      };
      return {
        ...state,
        currentUser: updatedCurrentUser,
        users: {
          ...state.users,
          user_current: updatedCurrentUser,
        },
        posts: remainingPosts,
      };
    }

    case 'FAVORITE_POST': {
      const post = state.posts[action.postId];
      if (!post) return state;
      return {
        ...state,
        posts: {
          ...state.posts,
          [action.postId]: {
            ...post,
            isFavorited: !post.isFavorited,
          },
        },
      };
    }

    case 'ADD_COMMENT': {
      const newComment = {
        id: generateId('comment'),
        postId: action.postId,
        userId: 'user_current',
        text: action.text,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        isLiked: false,
        replyToId: action.replyToId || null,
        replyToUserId: action.replyToUserId || null,
      };
      const post = state.posts[action.postId];
      return {
        ...state,
        comments: {
          [newComment.id]: newComment,
          ...state.comments,
        },
        posts: post ? {
          ...state.posts,
          [action.postId]: {
            ...post,
            commentCount: post.commentCount + 1,
          },
        } : state.posts,
      };
    }

    case 'TOGGLE_LIKE_COMMENT': {
      const comment = state.comments[action.commentId];
      if (!comment) return state;
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.commentId]: {
            ...comment,
            isLiked: !comment.isLiked,
            likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
          },
        },
      };
    }

    case 'TOGGLE_FOLLOW': {
      const user = state.users[action.userId];
      if (!user) return state;
      const wasFollowing = user.isFollowing;
      const updatedCurrentUser = {
        ...state.currentUser,
        followingCount: wasFollowing
          ? state.currentUser.followingCount - 1
          : state.currentUser.followingCount + 1,
      };
      return {
        ...state,
        currentUser: updatedCurrentUser,
        users: {
          ...state.users,
          user_current: updatedCurrentUser,
          [action.userId]: {
            ...user,
            isFollowing: !wasFollowing,
            followersCount: wasFollowing
              ? user.followersCount - 1
              : user.followersCount + 1,
          },
        },
      };
    }

    case 'SEND_MESSAGE': {
      const newMsg = {
        id: generateId('msg'),
        conversationId: action.conversationId,
        senderId: 'user_current',
        receiverId: action.receiverId,
        text: action.text,
        createdAt: new Date().toISOString(),
        isRead: true,
      };
      return {
        ...state,
        messages: {
          ...state.messages,
          [newMsg.id]: newMsg,
        },
        conversations: {
          ...state.conversations,
          [action.conversationId]: {
            ...state.conversations[action.conversationId],
            lastMessageId: newMsg.id,
            lastMessageAt: newMsg.createdAt,
          },
        },
      };
    }

    case 'MARK_NOTIFICATIONS_READ': {
      const notifUnreadCount = 0;
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        ui: { ...state.ui, notificationUnreadCount: notifUnreadCount },
      };
    }

    case 'MARK_CONVERSATION_READ': {
      const conv = state.conversations[action.conversationId];
      if (!conv) return state;
      const unreadDelta = conv.unreadCount;
      // Mark messages as read
      const updatedMessages = {};
      for (const [mid, msg] of Object.entries(state.messages)) {
        if (msg.conversationId === action.conversationId && msg.receiverId === 'user_current') {
          updatedMessages[mid] = { ...msg, isRead: true };
        } else {
          updatedMessages[mid] = msg;
        }
      }
      const newUnreadTotal = Math.max(0, (state.ui.messageUnreadCount || 0) - unreadDelta);
      return {
        ...state,
        messages: updatedMessages,
        conversations: {
          ...state.conversations,
          [action.conversationId]: { ...conv, unreadCount: 0 },
        },
        ui: { ...state.ui, messageUnreadCount: newUnreadTotal },
      };
    }

    case 'UPDATE_PROFILE': {
      const updatedUser = {
        ...state.currentUser,
        ...action.updates,
      };
      return {
        ...state,
        currentUser: updatedUser,
        users: {
          ...state.users,
          user_current: updatedUser,
        },
      };
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.updates,
        },
      };
    }

    case 'FOLLOW_TOPIC': {
      const followed = state.followedTopics || [];
      if (followed.includes(action.topicId)) return state;
      return { ...state, followedTopics: [...followed, action.topicId] };
    }

    case 'UNFOLLOW_TOPIC': {
      return {
        ...state,
        followedTopics: (state.followedTopics || []).filter(id => id !== action.topicId),
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const initialData = createInitialData();
  const savedState = loadState();
  const [state, dispatch] = useReducer(appReducer, savedState || initialData);
  const initialStateRef = useRef(savedState || initialData);

  // Load server state if sid present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('sid');
    if (sid) {
      fetch(`/go?sid=${sid}`)
        .then(r => r.json())
        .then(data => {
          if (data.current_state) {
            dispatch({ type: 'SET_STATE', payload: data.current_state });
            initialStateRef.current = data.initial_state || data.current_state;
          }
        })
        .catch(() => {});
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const getInitialState = () => initialStateRef.current;

  return (
    <AppContext.Provider value={{ state, dispatch, getInitialState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
