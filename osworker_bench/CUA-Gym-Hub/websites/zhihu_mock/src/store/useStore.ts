
import { create } from 'zustand';
import { AppState, Question, Answer, Comment, Collection } from '../types';
import { getDefaultData, getSessionId, fetchCustomState, saveState, initializeData, getInitialState } from '../data/initialData';

const BASE_INITIAL_KEY = 'zhihu_initial_state';

// Resolve the session ID once at module load
const resolvedSid = getSessionId();

// We need a sync initial state for the zustand store creation.
// On first load with sid, we check localStorage BEFORE calling initializeData.
function loadInitialSync(): AppState {
  if (resolvedSid) {
    const sessionKey = `${BASE_INITIAL_KEY}_${resolvedSid}`;
    const isRefresh = localStorage.getItem(sessionKey) !== null;
    if (isRefresh) {
      return initializeData(resolvedSid);
    }
    // First visit with sid -- return defaults for now, async init will override
    return getDefaultData();
  }
  // No sid -- try loading from localStorage
  return initializeData(null);
}

interface Store extends AppState {
  _initialState: AppState | null;
  _loading: boolean;
  _initSession: () => Promise<void>;
  toggleVoteup: (id: string) => void;
  toggleArticleVoteup: (articleId: string) => void;
  toggleIdeaVoteup: (ideaId: string) => void;
  toggleFavorite: (id: string) => void;
  toggleArticleFavorite: (articleId: string) => void;
  toggleFollowUser: (userId: string) => void;
  toggleFollowTopic: (topicId: string) => void;
  toggleFollowQuestion: (questionId: string) => void;
  toggleThankAnswer: (answerId: string) => void;
  addAnswer: (answer: Answer) => void;
  addQuestion: (question: Question) => void;
  updateQuestionAnswerCount: (questionId: string) => void;
  addComment: (targetId: string, comment: Comment, targetType?: 'answer' | 'article' | 'idea') => void;
  addCommentReply: (targetId: string, parentCommentId: string, reply: Comment, targetType?: 'answer' | 'article' | 'idea') => void;
  toggleCommentVoteup: (commentId: string, targetId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  addItemToCollection: (collectionId: string, itemId: string, itemType: 'answer' | 'article' | 'idea') => void;
  removeItemFromCollection: (collectionId: string, itemId: string) => void;
  createCollection: (collection: Collection) => void;
  updateUserProfile: (updates: Partial<AppState['currentUser']>) => void;
  getInitialState: () => AppState;
  getCurrentState: () => AppState;
}

// Explicit list of all AppState property names for reliable extraction
const APP_STATE_KEYS: (keyof AppState)[] = [
  'currentUser',
  'users',
  'questions',
  'answers',
  'articles',
  'comments',
  'topics',
  'collections',
  'notifications',
  'ideas',
  'userVoteups',
  'userFavorites',
  'userFollowings',
  'userFollowedTopics',
  'userFollowedQuestions',
  'userCommentVoteups',
];

// Extract only AppState keys from a Store state object
function extractAppState(state: Store): AppState {
  const appState: Record<string, unknown> = {};
  for (const key of APP_STATE_KEYS) {
    appState[key] = state[key];
  }
  return appState as unknown as AppState;
}

export const useStore = create<Store>((set, get) => ({
  ...loadInitialSync(),
  _initialState: null,
  _loading: true,

  _initSession: async () => {
    const sid = resolvedSid;

    if (sid) {
      const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        set({ ...data, _initialState: data, _loading: false });
      } else {
        const customState = await fetchCustomState(sid);
        const data = initializeData(sid, customState);
        set({ ...data, _initialState: data, _loading: false });
      }
    } else {
      const customState = await fetchCustomState();
      if (customState) {
        const data = initializeData(null, customState);
        set({ ...data, _initialState: data, _loading: false });
      } else {
        const data = initializeData(null);
        set({ ...data, _initialState: data, _loading: false });
      }
    }
  },

  toggleVoteup: (id: string) => {
    set((state) => {
      const newVoteups = { ...state.userVoteups };
      const isVoted = newVoteups[id];

      if (isVoted) {
        delete newVoteups[id];
      } else {
        newVoteups[id] = true;
      }

      const newAnswers = state.answers.map(a => {
        if (a.answerId === id) {
          return {
            ...a,
            voteupCount: isVoted ? a.voteupCount - 1 : a.voteupCount + 1
          };
        }
        return a;
      });

      const newState = {
        ...state,
        userVoteups: newVoteups,
        answers: newAnswers
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  toggleArticleVoteup: (articleId: string) => {
    set((state) => {
      const newVoteups = { ...state.userVoteups };
      const isVoted = newVoteups[articleId];

      if (isVoted) {
        delete newVoteups[articleId];
      } else {
        newVoteups[articleId] = true;
      }

      const newArticles = state.articles.map(a => {
        if (a.articleId === articleId) {
          return {
            ...a,
            voteupCount: isVoted ? a.voteupCount - 1 : a.voteupCount + 1,
          };
        }
        return a;
      });

      const newState = {
        ...state,
        userVoteups: newVoteups,
        articles: newArticles,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  toggleIdeaVoteup: (ideaId: string) => {
    set((state) => {
      const newVoteups = { ...state.userVoteups };
      const isVoted = newVoteups[ideaId];

      if (isVoted) {
        delete newVoteups[ideaId];
      } else {
        newVoteups[ideaId] = true;
      }

      const newIdeas = state.ideas.map(idea => {
        if (idea.ideaId === ideaId) {
          return {
            ...idea,
            voteupCount: isVoted ? idea.voteupCount - 1 : idea.voteupCount + 1,
          };
        }
        return idea;
      });

      const newState = {
        ...state,
        userVoteups: newVoteups,
        ideas: newIdeas,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  toggleFavorite: (id: string) => {
    set((state) => {
      const newFavorites = { ...state.userFavorites };
      const isFavorited = newFavorites[id];

      if (isFavorited) {
        delete newFavorites[id];
      } else {
        newFavorites[id] = true;
      }

      const newAnswers = state.answers.map(a => {
        if (a.answerId === id) {
          return {
            ...a,
            favoriteCount: isFavorited ? a.favoriteCount - 1 : a.favoriteCount + 1
          };
        }
        return a;
      });

      const newState = {
        ...state,
        userFavorites: newFavorites,
        answers: newAnswers
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  toggleArticleFavorite: (articleId: string) => {
    set((state) => {
      const newFavorites = { ...state.userFavorites };
      const isFavorited = newFavorites[articleId];

      if (isFavorited) {
        delete newFavorites[articleId];
      } else {
        newFavorites[articleId] = true;
      }

      const newArticles = state.articles.map(a => {
        if (a.articleId === articleId) {
          return {
            ...a,
            favoriteCount: isFavorited ? a.favoriteCount - 1 : a.favoriteCount + 1,
          };
        }
        return a;
      });

      const newState = {
        ...state,
        userFavorites: newFavorites,
        articles: newArticles,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  toggleFollowUser: (userId: string) => {
    set((state) => {
      const newFollowings = { ...state.userFollowings };
      const isFollowing = !!newFollowings[userId];
      if (isFollowing) {
        delete newFollowings[userId];
      } else {
        newFollowings[userId] = true;
      }

      // Update target user's followerCount
      const newUsers = state.users.map(u => {
        if (u.userId === userId) {
          return { ...u, followerCount: isFollowing ? u.followerCount - 1 : u.followerCount + 1 };
        }
        return u;
      });

      // Update current user's followingCount
      const newCurrentUser = {
        ...state.currentUser,
        followingCount: isFollowing ? state.currentUser.followingCount - 1 : state.currentUser.followingCount + 1,
      };

      const newState = {
        ...state,
        userFollowings: newFollowings,
        users: newUsers,
        currentUser: newCurrentUser,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  toggleFollowTopic: (topicId: string) => {
    set((state) => {
      const newFollowedTopics = { ...state.userFollowedTopics };
      const isFollowing = !!newFollowedTopics[topicId];
      if (isFollowing) {
        delete newFollowedTopics[topicId];
      } else {
        newFollowedTopics[topicId] = true;
      }

      // Update topic's followerCount
      const newTopics = state.topics.map(t => {
        if (t.topicId === topicId) {
          return { ...t, followerCount: isFollowing ? t.followerCount - 1 : t.followerCount + 1 };
        }
        return t;
      });

      const newState = {
        ...state,
        userFollowedTopics: newFollowedTopics,
        topics: newTopics,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  toggleFollowQuestion: (questionId: string) => {
    set((state) => {
      const newFollowedQuestions = { ...state.userFollowedQuestions };
      const isFollowing = !!newFollowedQuestions[questionId];
      if (isFollowing) {
        delete newFollowedQuestions[questionId];
      } else {
        newFollowedQuestions[questionId] = true;
      }

      // Update question's followerCount
      const newQuestions = state.questions.map(q => {
        if (q.questionId === questionId) {
          return { ...q, followerCount: isFollowing ? q.followerCount - 1 : q.followerCount + 1 };
        }
        return q;
      });

      const newState = {
        ...state,
        userFollowedQuestions: newFollowedQuestions,
        questions: newQuestions,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  addAnswer: (answer: Answer) => {
    set((state) => {
      const newState = {
        ...state,
        answers: [answer, ...state.answers],
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  addQuestion: (question: Question) => {
    set((state) => {
      const newCurrentUser = {
        ...state.currentUser,
        questionCount: state.currentUser.questionCount + 1,
      };
      const newState = {
        ...state,
        questions: [question, ...state.questions],
        currentUser: newCurrentUser,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  updateQuestionAnswerCount: (questionId: string) => {
    set((state) => {
      const newQuestions = state.questions.map(q => {
        if (q.questionId === questionId) {
          return { ...q, answerCount: q.answerCount + 1 };
        }
        return q;
      });

      const newState = {
        ...state,
        questions: newQuestions,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  toggleThankAnswer: (answerId: string) => {
    set((state) => {
      const key = `thank_${answerId}`;
      const newThanks = { ...state.userVoteups };
      const isThanked = !!newThanks[key];
      if (isThanked) {
        delete newThanks[key];
      } else {
        newThanks[key] = true;
      }

      const newAnswers = state.answers.map(a => {
        if (a.answerId === answerId) {
          return { ...a, thankCount: isThanked ? a.thankCount - 1 : a.thankCount + 1 };
        }
        return a;
      });

      const newState = {
        ...state,
        userVoteups: newThanks,
        answers: newAnswers,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  addComment: (targetId: string, comment: Comment, targetType?: 'answer' | 'article' | 'idea') => {
    set((state) => {
      const newComments = { ...state.comments };
      if (!newComments[targetId]) {
        newComments[targetId] = [];
      }
      newComments[targetId] = [...newComments[targetId], comment];

      // Update commentCount on the answer if targetId is an answer
      const newAnswers = state.answers.map(a => {
        if (a.answerId === targetId) {
          return { ...a, commentCount: a.commentCount + 1 };
        }
        return a;
      });

      // Update commentCount on article if targetId is an article
      const newArticles = state.articles.map(a => {
        if (a.articleId === targetId) {
          return { ...a, commentCount: a.commentCount + 1 };
        }
        return a;
      });

      // Update commentCount on idea if targetId is an idea
      const newIdeas = state.ideas.map(idea => {
        if (idea.ideaId === targetId) {
          return { ...idea, commentCount: idea.commentCount + 1 };
        }
        return idea;
      });

      const newState = {
        ...state,
        comments: newComments,
        answers: newAnswers,
        articles: newArticles,
        ideas: newIdeas,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  addCommentReply: (targetId: string, parentCommentId: string, reply: Comment, targetType?: 'answer' | 'article' | 'idea') => {
    set((state) => {
      const newComments = { ...state.comments };
      if (!newComments[targetId]) {
        newComments[targetId] = [];
      }

      // Find the parent comment and add the reply
      newComments[targetId] = newComments[targetId].map(c => {
        if (c.commentId === parentCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), reply],
          };
        }
        return c;
      });

      // Update commentCount on the answer
      const newAnswers = state.answers.map(a => {
        if (a.answerId === targetId) {
          return { ...a, commentCount: a.commentCount + 1 };
        }
        return a;
      });

      // Update commentCount on article
      const newArticles = state.articles.map(a => {
        if (a.articleId === targetId) {
          return { ...a, commentCount: a.commentCount + 1 };
        }
        return a;
      });

      // Update commentCount on idea
      const newIdeas = state.ideas.map(idea => {
        if (idea.ideaId === targetId) {
          return { ...idea, commentCount: idea.commentCount + 1 };
        }
        return idea;
      });

      const newState = {
        ...state,
        comments: newComments,
        answers: newAnswers,
        articles: newArticles,
        ideas: newIdeas,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  toggleCommentVoteup: (commentId: string, targetId: string) => {
    set((state) => {
      const newCommentVoteups = { ...state.userCommentVoteups };
      const isVoted = newCommentVoteups[commentId];

      if (isVoted) {
        delete newCommentVoteups[commentId];
      } else {
        newCommentVoteups[commentId] = true;
      }

      // Update the voteupCount on the comment (could be top-level or a reply)
      const newComments = { ...state.comments };
      if (newComments[targetId]) {
        newComments[targetId] = newComments[targetId].map(c => {
          if (c.commentId === commentId) {
            return {
              ...c,
              voteupCount: isVoted ? c.voteupCount - 1 : c.voteupCount + 1,
            };
          }
          // Check in replies
          if (c.replies && c.replies.length > 0) {
            const updatedReplies = c.replies.map(r => {
              if (r.commentId === commentId) {
                return {
                  ...r,
                  voteupCount: isVoted ? r.voteupCount - 1 : r.voteupCount + 1,
                };
              }
              return r;
            });
            return { ...c, replies: updatedReplies };
          }
          return c;
        });
      }

      const newState = {
        ...state,
        userCommentVoteups: newCommentVoteups,
        comments: newComments,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  markNotificationRead: (notificationId: string) => {
    set((state) => {
      const newNotifications = state.notifications.map(n =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      );

      const newState = {
        ...state,
        notifications: newNotifications
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  markAllNotificationsRead: () => {
    set((state) => {
      const newNotifications = state.notifications.map(n => ({ ...n, isRead: true }));

      const newState = {
        ...state,
        notifications: newNotifications,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  updateUserProfile: (updates: Partial<AppState['currentUser']>) => {
    set((state) => {
      const newCurrentUser = { ...state.currentUser, ...updates };
      const newUsers = state.users.map(u =>
        u.userId === state.currentUser.userId ? newCurrentUser : u
      );

      const newState = {
        ...state,
        currentUser: newCurrentUser,
        users: newUsers,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  addItemToCollection: (collectionId: string, itemId: string, itemType: 'answer' | 'article' | 'idea') => {
    set((state) => {
      const newCollections = state.collections.map(c => {
        if (c.collectionId === collectionId) {
          if (c.itemIds.includes(itemId)) return c;
          return {
            ...c,
            itemIds: [...c.itemIds, itemId],
            itemTypes: [...c.itemTypes, itemType],
            updatedTime: Date.now(),
          };
        }
        return c;
      });

      // Also mark as favorited in userFavorites
      const newFavorites = { ...state.userFavorites, [itemId]: true };

      const newState = {
        ...state,
        collections: newCollections,
        userFavorites: newFavorites,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  removeItemFromCollection: (collectionId: string, itemId: string) => {
    set((state) => {
      const newCollections = state.collections.map(c => {
        if (c.collectionId === collectionId) {
          const idx = c.itemIds.indexOf(itemId);
          if (idx === -1) return c;
          const newItemIds = c.itemIds.filter((_, i) => i !== idx);
          const newItemTypes = c.itemTypes.filter((_, i) => i !== idx);
          return {
            ...c,
            itemIds: newItemIds,
            itemTypes: newItemTypes,
            updatedTime: Date.now(),
          };
        }
        return c;
      });

      // Check if item is still in ANY collection
      const isStillFavorited = newCollections.some(c => c.itemIds.includes(itemId));
      const newFavorites = { ...state.userFavorites };
      if (!isStillFavorited) {
        delete newFavorites[itemId];
      }

      const newState = {
        ...state,
        collections: newCollections,
        userFavorites: newFavorites,
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  createCollection: (collection: Collection) => {
    set((state) => {
      const newState = {
        ...state,
        collections: [...state.collections, collection],
      };

      saveState(extractAppState(newState as Store), resolvedSid);
      return newState;
    });
  },

  getInitialState: (): AppState => {
    const state = get();
    if (state._initialState) return state._initialState;
    // Fallback
    const stored = getInitialState(resolvedSid);
    if (stored) return stored;
    return getDefaultData();
  },

  getCurrentState: (): AppState => {
    return extractAppState(get());
  },
}));
