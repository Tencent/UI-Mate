
    import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
    import { INITIAL_STATE, getSessionId, fetchCustomState, saveState, getInitialState, initializeData } from './mockData';

    const StoreContext = createContext();

    const BASE_INITIAL_KEY = 'gitmock_initialState';

    const ACTIONS = {
      INIT: 'INIT',
      RESET: 'RESET',
      ADD_REPO: 'ADD_REPO',
      DELETE_REPO: 'DELETE_REPO',
      UPDATE_REPO: 'UPDATE_REPO',
      CREATE_REPO: 'CREATE_REPO',
      ADD_ISSUE: 'ADD_ISSUE',
      UPDATE_ISSUE: 'UPDATE_ISSUE',
      UPDATE_ISSUE_STATUS: 'UPDATE_ISSUE_STATUS',
      ADD_COMMENT: 'ADD_COMMENT',
      UPDATE_COMMENT: 'UPDATE_COMMENT',
      DELETE_COMMENT: 'DELETE_COMMENT',
      STAR_REPO: 'STAR_REPO',
      WATCH_REPO: 'WATCH_REPO',
      FORK_REPO: 'FORK_REPO',
      MOVE_ISSUE_COLUMN: 'MOVE_ISSUE_COLUMN',
      ADD_PULL_REQUEST: 'ADD_PULL_REQUEST',
      UPDATE_PR: 'UPDATE_PR',
      UPDATE_PR_STATUS: 'UPDATE_PR_STATUS',
      MERGE_PR: 'MERGE_PR',
      ADD_PR_COMMENT: 'ADD_PR_COMMENT',
      ADD_WIKI_PAGE: 'ADD_WIKI_PAGE',
      UPDATE_WIKI_PAGE: 'UPDATE_WIKI_PAGE',
      ADD_NOTIFICATION: 'ADD_NOTIFICATION',
      MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
      MARK_ALL_NOTIFICATIONS_READ: 'MARK_ALL_NOTIFICATIONS_READ',
      ADD_LABEL: 'ADD_LABEL',
      DELETE_LABEL: 'DELETE_LABEL',
      ADD_MILESTONE: 'ADD_MILESTONE',
      UPDATE_MILESTONE: 'UPDATE_MILESTONE',
      ADD_REACTION: 'ADD_REACTION',
      REMOVE_REACTION: 'REMOVE_REACTION',
      ADD_ACTION: 'ADD_ACTION',
      ADD_DISCUSSION: 'ADD_DISCUSSION',
      ADD_DISCUSSION_REPLY: 'ADD_DISCUSSION_REPLY',
      ADD_RELEASE: 'ADD_RELEASE',
      DELETE_BRANCH: 'DELETE_BRANCH',
      ADD_BRANCH: 'ADD_BRANCH',
      UPDATE_FILE: 'UPDATE_FILE',
      ADD_COMMIT: 'ADD_COMMIT',
    };

    function reducer(state, action) {
      switch (action.type) {
        case ACTIONS.INIT:
          return action.payload;
        case ACTIONS.RESET:
          return INITIAL_STATE;
        case ACTIONS.ADD_REPO:
          return { ...state, repos: [...state.repos, action.payload] };

        case ACTIONS.CREATE_REPO: {
          const { repo, branch, files: newFiles } = action.payload;
          return {
            ...state,
            repos: [...state.repos, repo],
            branches: [...state.branches, branch],
            files: [...state.files, ...newFiles],
          };
        }

        case ACTIONS.ADD_ISSUE:
          return { ...state, issues: [...state.issues, action.payload] };
        case ACTIONS.MOVE_ISSUE_COLUMN:
          return {
            ...state,
            issues: state.issues.map(issue =>
              issue.id === action.payload.issueId
                ? { ...issue, column: action.payload.column }
                : issue
            )
          };
        case ACTIONS.ADD_COMMENT:
          return {
            ...state,
            issues: state.issues.map(issue =>
              issue.id === action.payload.issueId
                ? { ...issue, comments: [...issue.comments, action.payload.comment] }
                : issue
            )
          };

        case ACTIONS.UPDATE_COMMENT: {
          const { targetType, parentId, commentId, content } = action.payload;
          if (targetType === 'issue') {
            return {
              ...state,
              issues: state.issues.map(issue =>
                issue.id === parentId
                  ? {
                      ...issue,
                      comments: issue.comments.map(c =>
                        c.id === commentId ? { ...c, content } : c
                      )
                    }
                  : issue
              )
            };
          } else if (targetType === 'pr') {
            return {
              ...state,
              pullRequests: state.pullRequests.map(pr =>
                pr.id === parentId
                  ? {
                      ...pr,
                      comments: (pr.comments || []).map(c =>
                        c.id === commentId ? { ...c, content } : c
                      )
                    }
                  : pr
              )
            };
          }
          return state;
        }

        case ACTIONS.DELETE_COMMENT: {
          const { targetType: delTargetType, parentId: delParentId, commentId: delCommentId } = action.payload;
          if (delTargetType === 'issue') {
            return {
              ...state,
              issues: state.issues.map(issue =>
                issue.id === delParentId
                  ? {
                      ...issue,
                      comments: issue.comments.filter(c => c.id !== delCommentId)
                    }
                  : issue
              )
            };
          } else if (delTargetType === 'pr') {
            return {
              ...state,
              pullRequests: state.pullRequests.map(pr =>
                pr.id === delParentId
                  ? {
                      ...pr,
                      comments: (pr.comments || []).filter(c => c.id !== delCommentId)
                    }
                  : pr
              )
            };
          }
          return state;
        }

        case ACTIONS.UPDATE_ISSUE_STATUS:
          return {
            ...state,
            issues: state.issues.map(issue =>
              issue.id === action.payload.issueId
                ? {
                    ...issue,
                    status: action.payload.status,
                    closedAt: action.payload.status === 'closed' ? new Date().toISOString() : null
                  }
                : issue
            )
          };
        case ACTIONS.STAR_REPO:
          return {
            ...state,
            repos: state.repos.map(repo =>
              repo.id === action.payload.repoId
                ? { ...repo, stars: repo.stars + (action.payload.starred ? 1 : -1) }
                : repo
            )
          };
        case ACTIONS.WATCH_REPO:
          return {
            ...state,
            repos: state.repos.map(repo =>
              repo.id === action.payload.repoId
                ? { ...repo, watchers: (repo.watchers || 0) + (action.payload.watched ? 1 : -1) }
                : repo
            )
          };
        case ACTIONS.FORK_REPO: {
          const sourceRepo = state.repos.find(r => r.id === action.payload.repoId);
          if (!sourceRepo) return state;
          const forkedRepoId = action.payload.newRepoId || `r_fork_${Date.now()}`;
          const forkedRepo = {
            ...sourceRepo,
            id: forkedRepoId,
            ownerId: state.currentUser.id,
            forkedFrom: sourceRepo.id,
            stars: 0,
            forks: 0,
            watchers: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const forkedBranches = state.branches
            .filter(b => b.repoId === sourceRepo.id)
            .map(b => ({ ...b, id: `b_fork_${Date.now()}_${b.id}`, repoId: forkedRepoId }));
          const forkedFiles = state.files
            .filter(f => f.repoId === sourceRepo.id)
            .map(f => ({ ...f, id: `f_fork_${Date.now()}_${f.id}`, repoId: forkedRepoId }));
          const forkedCommits = state.commits
            .filter(c => c.repoId === sourceRepo.id)
            .map(c => ({ ...c, id: `c_fork_${Date.now()}_${c.id}`, repoId: forkedRepoId }));
          return {
            ...state,
            repos: [
              ...state.repos.map(repo =>
                repo.id === action.payload.repoId
                  ? { ...repo, forks: (repo.forks || 0) + 1 }
                  : repo
              ),
              forkedRepo
            ],
            branches: [...state.branches, ...forkedBranches],
            files: [...state.files, ...forkedFiles],
            commits: [...state.commits, ...forkedCommits],
          };
        }
        case ACTIONS.DELETE_REPO:
          return {
            ...state,
            repos: state.repos.filter(r => r.id !== action.payload.repoId),
            issues: state.issues.filter(i => i.repoId !== action.payload.repoId),
            pullRequests: state.pullRequests.filter(p => p.repoId !== action.payload.repoId),
            branches: state.branches.filter(b => b.repoId !== action.payload.repoId),
            files: state.files.filter(f => f.repoId !== action.payload.repoId),
            commits: state.commits.filter(c => c.repoId !== action.payload.repoId),
            wiki: state.wiki.filter(w => w.repoId !== action.payload.repoId),
            actions: state.actions.filter(a => a.repoId !== action.payload.repoId),
            notifications: (state.notifications || []).filter(n => n.repoId !== action.payload.repoId),
            labels: (state.labels || []).filter(l => l.repoId !== action.payload.repoId),
            milestones: (state.milestones || []).filter(m => m.repoId !== action.payload.repoId),
            discussions: (state.discussions || []).filter(d => d.repoId !== action.payload.repoId),
            releases: (state.releases || []).filter(r => r.repoId !== action.payload.repoId),
          };
        case ACTIONS.UPDATE_REPO:
          return {
            ...state,
            repos: state.repos.map(repo =>
              repo.id === action.payload.repoId
                ? { ...repo, ...action.payload.updates }
                : repo
            )
          };
        case ACTIONS.UPDATE_ISSUE:
          return {
            ...state,
            issues: state.issues.map(issue =>
              issue.id === action.payload.issueId
                ? { ...issue, ...action.payload.updates }
                : issue
            )
          };
        case ACTIONS.ADD_PULL_REQUEST:
          return { ...state, pullRequests: [...state.pullRequests, action.payload] };
        case ACTIONS.UPDATE_PR:
          return {
            ...state,
            pullRequests: state.pullRequests.map(pr =>
              pr.id === action.payload.prId
                ? { ...pr, ...action.payload.updates }
                : pr
            )
          };
        case ACTIONS.UPDATE_PR_STATUS:
          return {
            ...state,
            pullRequests: state.pullRequests.map(pr =>
              pr.id === action.payload.prId
                ? {
                    ...pr,
                    status: action.payload.status,
                    closedAt: action.payload.status === 'closed' ? new Date().toISOString() : null
                  }
                : pr
            )
          };
        case ACTIONS.MERGE_PR:
          return {
            ...state,
            pullRequests: state.pullRequests.map(pr =>
              pr.id === action.payload.prId
                ? {
                    ...pr,
                    status: 'merged',
                    mergedAt: new Date().toISOString(),
                    mergedBy: action.payload.userId,
                    mergeStrategy: action.payload.mergeStrategy || pr.mergeStrategy || 'merge'
                  }
                : pr
            )
          };
        case ACTIONS.ADD_PR_COMMENT: {
          const { prId: commentPrId, comment: prComment, review } = action.payload;
          return {
            ...state,
            pullRequests: state.pullRequests.map(pr => {
              if (pr.id !== commentPrId) return pr;
              let updatedPr = { ...pr, comments: [...(pr.comments || []), prComment] };
              if (review) {
                const existingReviewers = updatedPr.reviewers || [];
                const existingIdx = existingReviewers.findIndex(r => r.userId === review.userId);
                const reviewerEntry = {
                  userId: review.userId,
                  status: review.status,
                  date: review.date || new Date().toISOString(),
                  body: review.body || ''
                };
                if (existingIdx >= 0) {
                  updatedPr.reviewers = existingReviewers.map((r, idx) =>
                    idx === existingIdx ? reviewerEntry : r
                  );
                } else {
                  updatedPr.reviewers = [...existingReviewers, reviewerEntry];
                }
              }
              return updatedPr;
            })
          };
        }
        case ACTIONS.ADD_WIKI_PAGE:
          return { ...state, wiki: [...state.wiki, action.payload] };
        case ACTIONS.UPDATE_WIKI_PAGE:
          return {
            ...state,
            wiki: state.wiki.map(page =>
              page.id === action.payload.pageId
                ? { ...page, ...action.payload.updates }
                : page
            )
          };

        // --- Notification actions ---
        case ACTIONS.ADD_NOTIFICATION:
          return {
            ...state,
            notifications: [...(state.notifications || []), action.payload]
          };
        case ACTIONS.MARK_NOTIFICATION_READ:
          return {
            ...state,
            notifications: (state.notifications || []).map(n =>
              n.id === action.payload.notificationId
                ? { ...n, isRead: true }
                : n
            )
          };
        case ACTIONS.MARK_ALL_NOTIFICATIONS_READ:
          return {
            ...state,
            notifications: (state.notifications || []).map(n => ({ ...n, isRead: true }))
          };

        // --- Label actions ---
        case ACTIONS.ADD_LABEL:
          return {
            ...state,
            labels: [...(state.labels || []), action.payload]
          };
        case ACTIONS.DELETE_LABEL:
          return {
            ...state,
            labels: (state.labels || []).filter(l => l.id !== action.payload.labelId)
          };

        // --- Milestone actions ---
        case ACTIONS.ADD_MILESTONE:
          return {
            ...state,
            milestones: [...(state.milestones || []), action.payload]
          };
        case ACTIONS.UPDATE_MILESTONE:
          return {
            ...state,
            milestones: (state.milestones || []).map(ms =>
              ms.id === action.payload.milestoneId
                ? { ...ms, ...action.payload.updates }
                : ms
            )
          };

        // --- Reaction actions ---
        case ACTIONS.ADD_REACTION: {
          const { targetType: rxTargetType, targetId: rxTargetId, issueId: rxIssueId, reactionKey, userId: rxUserId } = action.payload;
          if (rxTargetType === 'issue') {
            return {
              ...state,
              issues: state.issues.map(issue =>
                issue.id === rxTargetId
                  ? {
                      ...issue,
                      reactions: {
                        ...(issue.reactions || {}),
                        [reactionKey]: ((issue.reactions || {})[reactionKey] || 0) + 1
                      }
                    }
                  : issue
              )
            };
          } else if (rxTargetType === 'comment') {
            return {
              ...state,
              issues: state.issues.map(issue =>
                issue.id === rxIssueId
                  ? {
                      ...issue,
                      comments: issue.comments.map(c =>
                        c.id === rxTargetId
                          ? {
                              ...c,
                              reactions: {
                                ...(c.reactions || {}),
                                [reactionKey]: ((c.reactions || {})[reactionKey] || 0) + 1
                              }
                            }
                          : c
                      )
                    }
                  : issue
              )
            };
          }
          return state;
        }

        case ACTIONS.REMOVE_REACTION: {
          const { targetType: rmTargetType, targetId: rmTargetId, issueId: rmIssueId, reactionKey: rmReactionKey, userId: rmUserId } = action.payload;
          if (rmTargetType === 'issue') {
            return {
              ...state,
              issues: state.issues.map(issue =>
                issue.id === rmTargetId
                  ? {
                      ...issue,
                      reactions: {
                        ...(issue.reactions || {}),
                        [rmReactionKey]: Math.max(0, ((issue.reactions || {})[rmReactionKey] || 0) - 1)
                      }
                    }
                  : issue
              )
            };
          } else if (rmTargetType === 'comment') {
            return {
              ...state,
              issues: state.issues.map(issue =>
                issue.id === rmIssueId
                  ? {
                      ...issue,
                      comments: issue.comments.map(c =>
                        c.id === rmTargetId
                          ? {
                              ...c,
                              reactions: {
                                ...(c.reactions || {}),
                                [rmReactionKey]: Math.max(0, ((c.reactions || {})[rmReactionKey] || 0) - 1)
                              }
                            }
                          : c
                      )
                    }
                  : issue
              )
            };
          }
          return state;
        }

        case ACTIONS.ADD_ACTION:
          return {
            ...state,
            actions: [action.payload, ...(state.actions || [])]
          };

        // --- Discussion actions ---
        case ACTIONS.ADD_DISCUSSION:
          return {
            ...state,
            discussions: [...(state.discussions || []), action.payload]
          };
        case ACTIONS.ADD_DISCUSSION_REPLY: {
          const { discussionId, reply } = action.payload;
          return {
            ...state,
            discussions: (state.discussions || []).map(d =>
              d.id === discussionId
                ? { ...d, replies: [...(d.replies || []), reply] }
                : d
            )
          };
        }

        // --- Release actions ---
        case ACTIONS.ADD_RELEASE:
          return {
            ...state,
            releases: [action.payload, ...(state.releases || [])]
          };

        // --- Branch actions ---
        case ACTIONS.ADD_BRANCH:
          return {
            ...state,
            branches: [...state.branches, action.payload]
          };
        case ACTIONS.DELETE_BRANCH:
          return {
            ...state,
            branches: state.branches.filter(b => b.id !== action.payload.branchId)
          };

        // --- File editing actions ---
        case ACTIONS.UPDATE_FILE:
          return {
            ...state,
            files: state.files.map(f =>
              f.id === action.payload.fileId
                ? { ...f, content: action.payload.content }
                : f
            )
          };
        case ACTIONS.ADD_COMMIT:
          return {
            ...state,
            commits: [action.payload, ...state.commits]
          };

        default:
          return state;
      }
    }

    export function StoreProvider({ children }) {
      const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
      const [isLoaded, setIsLoaded] = React.useState(false);
      const [initialStateSnapshot, setInitialStateSnapshot] = React.useState(INITIAL_STATE);

      const sidRef = useRef(getSessionId());
      const initDone = useRef(false);

      useEffect(() => {
        if (initDone.current) return;
        initDone.current = true;

        const sid = sidRef.current;

        if (sid) {
          // CRITICAL: Check localStorage BEFORE initializeData
          const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
          const isRefresh = localStorage.getItem(sessionKey) !== null;

          if (isRefresh) {
            const data = initializeData(sid);
            dispatch({ type: ACTIONS.INIT, payload: data });
            setInitialStateSnapshot(getInitialState(sid) || data);
            setIsLoaded(true);
          } else {
            fetchCustomState(sid).then(customState => {
              const data = initializeData(sid, customState);
              dispatch({ type: ACTIONS.INIT, payload: data });
              setInitialStateSnapshot(getInitialState(sid) || data);
              setIsLoaded(true);
            });
          }
        } else {
          fetchCustomState().then(customState => {
            if (customState) {
              const data = initializeData(null, customState);
              dispatch({ type: ACTIONS.INIT, payload: data });
              setInitialStateSnapshot(data);
            } else {
              const data = initializeData();
              dispatch({ type: ACTIONS.INIT, payload: data });
              setInitialStateSnapshot(data);
            }
            setIsLoaded(true);
          });
        }
      }, []);

      useEffect(() => {
        if (isLoaded) {
          saveState(state, sidRef.current);
        }
      }, [state, isLoaded]);

      const value = {
        state,
        dispatch,
        initialState: initialStateSnapshot,
        actions: ACTIONS
      };

      if (!isLoaded) return <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">Loading...</div>;

      return (
        <StoreContext.Provider value={value}>
          {children}
        </StoreContext.Provider>
      );
    }

    export function useStore() {
      return useContext(StoreContext);
    }
