
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getSessionId, fetchCustomState, saveState, initializeData, getInitialState } from '../data/initialData';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

const BASE_INITIAL_KEY = 'youtubeInitialData';

export const DataProvider = ({ children }) => {
  const [initialStateRef, setInitialStateRef] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  const [miniPlayer, setMiniPlayer] = useState(null);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      // CRITICAL: Check localStorage BEFORE initializeData
      const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const loaded = initializeData(sid);
        setData(loaded);
        setInitialStateRef(getInitialState(sid) || loaded);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const loaded = initializeData(sid, customState);
          setData(loaded);
          setInitialStateRef(getInitialState(sid) || loaded);
          setLoading(false);
        });
      }
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const loaded = initializeData(null, customState);
          setData(loaded);
          setInitialStateRef(getInitialState(null) || loaded);
        } else {
          const loaded = initializeData();
          setData(loaded);
          setInitialStateRef(getInitialState(null) || loaded);
        }
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && data) {
      saveState(data, sidRef.current);
    }
  }, [data, loading]);

  const updateData = (updates) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const addToWatchHistory = (videoId) => {
    setData(prev => {
      const video = prev.videos.find(v => v.videoId === videoId);
      if (!video) return prev;

      const historyEntry = {
        videoId,
        watchedAt: new Date().toISOString()
      };

      const newHistory = [historyEntry, ...prev.user.watchHistory.filter(h => h.videoId !== videoId)];

      return {
        ...prev,
        user: {
          ...prev.user,
          watchHistory: newHistory
        }
      };
    });
  };

  const toggleDislike = (videoId) => {
    setData(prev => {
      const isDisliked = prev.user.dislikedVideos
        ? prev.user.dislikedVideos.includes(videoId)
        : false;
      const newDislikedVideos = isDisliked
        ? (prev.user.dislikedVideos || []).filter(id => id !== videoId)
        : [...(prev.user.dislikedVideos || []), videoId];

      const newVideos = prev.videos.map(v => {
        if (v.videoId === videoId) {
          return {
            ...v,
            dislikeCount: isDisliked ? v.dislikeCount - 1 : v.dislikeCount + 1
          };
        }
        return v;
      });

      return {
        ...prev,
        user: {
          ...prev.user,
          dislikedVideos: newDislikedVideos
        },
        videos: newVideos
      };
    });
  };

  const toggleCommentLike = (videoId, commentId, isReply = false, parentCommentId = null) => {
    setData(prev => {
      const updatedComments = { ...prev.comments };
      if (!updatedComments[videoId]) return prev;

      if (!isReply) {
        updatedComments[videoId] = updatedComments[videoId].map(comment => {
          if (comment.commentId === commentId) {
            const isLiked = (comment.likedBy || []).includes(prev.user.userId);
            return {
              ...comment,
              likeCount: isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
              likedBy: isLiked
                ? (comment.likedBy || []).filter(id => id !== prev.user.userId)
                : [...(comment.likedBy || []), prev.user.userId]
            };
          }
          return comment;
        });
      } else {
        updatedComments[videoId] = updatedComments[videoId].map(comment => {
          if (comment.commentId === parentCommentId) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply.commentId === commentId) {
                  const isLiked = (reply.likedBy || []).includes(prev.user.userId);
                  return {
                    ...reply,
                    likeCount: isLiked ? reply.likeCount - 1 : reply.likeCount + 1,
                    likedBy: isLiked
                      ? (reply.likedBy || []).filter(id => id !== prev.user.userId)
                      : [...(reply.likedBy || []), prev.user.userId]
                  };
                }
                return reply;
              })
            };
          }
          return comment;
        });
      }

      return { ...prev, comments: updatedComments };
    });
  };


  const toggleLike = (videoId) => {
    setData(prev => {
      const video = prev.videos.find(v => v.videoId === videoId);
      if (!video) return prev;

      const isLiked = prev.user.likedVideos.includes(videoId);
      const newLikedVideos = isLiked
        ? prev.user.likedVideos.filter(id => id !== videoId)
        : [...prev.user.likedVideos, videoId];

      const newVideos = prev.videos.map(v => {
        if (v.videoId === videoId) {
          return {
            ...v,
            likeCount: isLiked ? v.likeCount - 1 : v.likeCount + 1
          };
        }
        return v;
      });

      return {
        ...prev,
        user: {
          ...prev.user,
          likedVideos: newLikedVideos
        },
        videos: newVideos
      };
    });
  };

  const toggleWatchLater = (videoId) => {
    setData(prev => {
      const isInWatchLater = prev.user.watchLater.includes(videoId);
      const newWatchLater = isInWatchLater
        ? prev.user.watchLater.filter(id => id !== videoId)
        : [...prev.user.watchLater, videoId];

      return {
        ...prev,
        user: {
          ...prev.user,
          watchLater: newWatchLater
        }
      };
    });
  };

  const toggleSubscription = (channelId) => {
    setData(prev => {
      const isSubscribed = prev.user.subscribedChannels.includes(channelId);
      const newSubscribed = isSubscribed
        ? prev.user.subscribedChannels.filter(id => id !== channelId)
        : [...prev.user.subscribedChannels, channelId];

      const newChannels = prev.channels.map(c => {
        if (c.channelId === channelId) {
          return {
            ...c,
            subscriberCount: isSubscribed ? c.subscriberCount - 1 : c.subscriberCount + 1
          };
        }
        return c;
      });

      return {
        ...prev,
        user: {
          ...prev.user,
          subscribedChannels: newSubscribed
        },
        channels: newChannels
      };
    });
  };

  const addComment = (videoId, text, parentCommentId = null) => {
    setData(prev => {
      const newComment = {
        commentId: `comment-${Date.now()}`,
        videoId,
        userId: prev.user.userId,
        userName: prev.user.displayName,
        userAvatar: prev.user.avatar,
        text,
        timestamp: new Date().toISOString(),
        likeCount: 0,
        dislikeCount: 0,
        likedBy: [],
        replies: [],
        isPinned: false
      };

      if (parentCommentId) {
        const updatedComments = { ...prev.comments };
        if (updatedComments[videoId]) {
          updatedComments[videoId] = updatedComments[videoId].map(comment => {
            if (comment.commentId === parentCommentId) {
              return {
                ...comment,
                replies: [...comment.replies, newComment]
              };
            }
            return comment;
          });
        }
        return { ...prev, comments: updatedComments };
      } else {
        const updatedComments = { ...prev.comments };
        if (!updatedComments[videoId]) {
          updatedComments[videoId] = [];
        }
        updatedComments[videoId] = [newComment, ...updatedComments[videoId]];
        return { ...prev, comments: updatedComments };
      }
    });
  };

  const createPlaylist = (name, description, privacy) => {
    setData(prev => {
      const newPlaylist = {
        playlistId: `playlist-${Date.now()}`,
        name,
        description,
        creatorId: prev.user.userId,
        videoIds: [],
        privacy,
        createdDate: new Date().toISOString(),
        thumbnail: 'https://picsum.photos/640/360?random=playlist'
      };

      return {
        ...prev,
        playlists: [...prev.playlists, newPlaylist],
        user: {
          ...prev.user,
          playlists: [...prev.user.playlists, newPlaylist.playlistId]
        }
      };
    });
  };

  const addUploadedVideo = (video) => {
    setData(prev => {
      const videoId = video.videoId || `video-upload-${Date.now()}`;
      const newVideo = {
        videoId,
        title: video.title || 'Untitled upload',
        description: video.description || '',
        channelId: prev.user.userId,
        channelName: prev.user.displayName,
        channelAvatar: prev.user.avatar,
        thumbnail: video.thumbnail || `https://picsum.photos/seed/${videoId}/640/360`,
        duration: video.duration || '0:12',
        uploadDate: new Date().toISOString(),
        viewCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        category: video.category || 'Entertainment',
        tags: Array.isArray(video.tags) ? video.tags : [],
        videoUrl: video.videoUrl || '',
        visibility: video.visibility || 'public',
        sourceFile: video.sourceFile || null
      };

      return {
        ...prev,
        videos: [newVideo, ...prev.videos],
        comments: {
          ...prev.comments,
          [videoId]: []
        },
        channels: prev.channels.map(channel => {
          if (channel.channelId !== prev.user.userId) return channel;
          return {
            ...channel,
            videoCount: channel.videoCount + 1,
            videos: [videoId, ...(channel.videos || [])]
          };
        })
      };
    });
  };

  const addToPlaylist = (playlistId, videoId) => {
    setData(prev => {
      const newPlaylists = prev.playlists.map(p => {
        if (p.playlistId === playlistId) {
          if (!p.videoIds.includes(videoId)) {
            return {
              ...p,
              videoIds: [...p.videoIds, videoId]
            };
          }
        }
        return p;
      });

      return {
        ...prev,
        playlists: newPlaylists
      };
    });
  };

  const updatePlaylist = (playlistId, updates) => {
    setData(prev => ({
      ...prev,
      playlists: prev.playlists.map(p => {
        if (p.playlistId === playlistId) {
          return { ...p, ...updates };
        }
        return p;
      })
    }));
  };

  const removeFromPlaylist = (playlistId, videoId) => {
    setData(prev => ({
      ...prev,
      playlists: prev.playlists.map(p => {
        if (p.playlistId === playlistId) {
          return { ...p, videoIds: p.videoIds.filter(id => id !== videoId) };
        }
        return p;
      })
    }));
  };

  const removeFromWatchLater = (videoId) => {
    setData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        watchLater: prev.user.watchLater.filter(id => id !== videoId)
      }
    }));
  };

  const deletePlaylist = (playlistId) => {
    setData(prev => ({
      ...prev,
      playlists: prev.playlists.filter(p => p.playlistId !== playlistId),
      user: {
        ...prev.user,
        playlists: prev.user.playlists.filter(id => id !== playlistId)
      }
    }));
  };

  const removeFromHistory = (videoId) => {
    setData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        watchHistory: prev.user.watchHistory.filter(h => h.videoId !== videoId)
      }
    }));
  };

  const clearHistory = () => {
    setData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        watchHistory: []
      }
    }));
  };

  const addToSearchHistory = (query) => {
    setData(prev => {
      if (!prev.settings.keepSearchHistory) return prev;
      const trimmed = query.trim();
      if (!trimmed) return prev;
      const existing = prev.user.searchHistory || [];
      const filtered = existing.filter(q => q !== trimmed);
      return {
        ...prev,
        user: {
          ...prev.user,
          searchHistory: [trimmed, ...filtered].slice(0, 30)
        }
      };
    });
  };

  const clearSearchHistory = () => {
    setData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        searchHistory: []
      }
    }));
  };

  const updateSettings = (updates) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  const markNotificationAsRead = (notificationId) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      )
    }));
  };

  const markAllNotificationsAsRead = () => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, isRead: true }))
    }));
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const getDebugState = () => {
    return {
      initial_state: initialStateRef,
      current_state: data,
      state_diff: calculateDiff(initialStateRef, data)
    };
  };

  if (loading || !data) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  const value = {
    data,
    updateData,
    addToWatchHistory,
    toggleLike,
    toggleDislike,
    toggleCommentLike,
    toggleWatchLater,
    toggleSubscription,
    addComment,
    createPlaylist,
    addUploadedVideo,
    addToPlaylist,
    updatePlaylist,
    removeFromPlaylist,
    removeFromWatchLater,
    deletePlaylist,
    removeFromHistory,
    clearHistory,
    addToSearchHistory,
    clearSearchHistory,
    updateSettings,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    showToast,
    miniPlayer,
    setMiniPlayer,
    getDebugState
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
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
