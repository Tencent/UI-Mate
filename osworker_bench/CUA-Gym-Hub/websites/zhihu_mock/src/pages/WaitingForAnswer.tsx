import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

const WaitingForAnswer: React.FC = () => {
  const questions = useStore(state => state.questions);
  const answers = useStore(state => state.answers);
  const topics = useStore(state => state.topics);
  const users = useStore(state => state.users);
  const currentUser = useStore(state => state.currentUser);
  const userFollowedQuestions = useStore(state => state.userFollowedQuestions);
  const userFollowedTopics = useStore(state => state.userFollowedTopics);
  const toggleFollowQuestion = useStore(state => state.toggleFollowQuestion);

  const [activeFilter, setActiveFilter] = useState<'all' | 'followed' | 'unanswered'>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToastBriefly = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleFollowQuestion = (questionId: string) => {
    const isFollowing = !!userFollowedQuestions[questionId];
    toggleFollowQuestion(questionId);
    showToastBriefly(isFollowing ? '已取消关注问题' : '已关注问题');
  };

  // Filter questions based on tab
  const getFilteredQuestions = () => {
    let filtered = [...questions];

    if (activeFilter === 'followed') {
      // Questions in followed topics or explicitly followed questions
      filtered = filtered.filter(q =>
        userFollowedQuestions[q.questionId] ||
        q.topics.some(t => userFollowedTopics[t])
      );
    } else if (activeFilter === 'unanswered') {
      // Questions with 0 or very few answers (answerCount <= 1)
      filtered = filtered.filter(q => q.answerCount <= 1);
    }

    // Sort by ascending answerCount (least answered first), then by followerCount
    return filtered.sort((a, b) => a.answerCount - b.answerCount || b.followerCount - a.followerCount);
  };

  const filteredQuestions = getFilteredQuestions();

  const getTopicNames = (topicIds: string[]) => {
    return topicIds
      .map(tid => topics.find(t => t.topicId === tid)?.name)
      .filter(Boolean)
      .join(' · ');
  };

  const getAnswerAuthorAvatars = (questionId: string) => {
    const qAnswers = answers.filter(a => a.questionId === questionId);
    return qAnswers.slice(0, 3).map(a => users.find(u => u.userId === a.authorId)?.avatar).filter(Boolean) as string[];
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>等你来答</h1>
          <p style={styles.pageSubtitle}>这些问题还没有足够多的回答，你来说说？</p>
        </div>

        <div style={styles.filters}>
          <button
            style={{ ...styles.filterBtn, ...(activeFilter === 'all' ? styles.filterBtnActive : {}) }}
            onClick={() => setActiveFilter('all')}
          >
            全部问题
          </button>
          <button
            style={{ ...styles.filterBtn, ...(activeFilter === 'followed' ? styles.filterBtnActive : {}) }}
            onClick={() => setActiveFilter('followed')}
          >
            关注的话题
          </button>
          <button
            style={{ ...styles.filterBtn, ...(activeFilter === 'unanswered' ? styles.filterBtnActive : {}) }}
            onClick={() => setActiveFilter('unanswered')}
          >
            待回答
          </button>
        </div>

        <div style={styles.questionList}>
          {filteredQuestions.length === 0 ? (
            <div className="card" style={styles.emptyState}>
              <div style={styles.emptyIcon}>🤔</div>
              <div style={styles.emptyText}>暂无符合条件的问题</div>
              <div style={styles.emptyHint}>去关注更多话题，发现更多等待回答的问题</div>
              <Link to="/discover" style={styles.discoverLink}>浏览话题</Link>
            </div>
          ) : (
            filteredQuestions.map(question => {
              const isFollowed = !!userFollowedQuestions[question.questionId];
              const avatars = getAnswerAuthorAvatars(question.questionId);
              const topicNames = getTopicNames(question.topics);

              return (
                <div key={question.questionId} className="card" style={styles.questionCard}>
                  <div style={styles.questionMain}>
                    <Link to={`/question/${question.questionId}`} style={styles.questionTitle}>
                      {question.title}
                    </Link>
                    {question.description && (
                      <div style={styles.questionDesc}>
                        {question.description.length > 100
                          ? question.description.substring(0, 100) + '...'
                          : question.description}
                      </div>
                    )}

                    <div style={styles.questionMeta}>
                      {topicNames && <span style={styles.topicLabel}>{topicNames}</span>}
                      <div style={styles.metaStats}>
                        {avatars.length > 0 && (
                          <div style={styles.answererAvatars}>
                            {avatars.map((avatar, i) => (
                              <img key={i} src={avatar} alt="" style={{ ...styles.answererAvatar, left: `${i * 16}px` }} />
                            ))}
                          </div>
                        )}
                        <span style={styles.metaStat}>{question.answerCount} 个回答</span>
                        <span style={styles.metaStat}>{question.followerCount} 人关注</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.questionActions}>
                    <button
                      style={{ ...styles.followBtn, ...(isFollowed ? styles.followBtnActive : {}) }}
                      onClick={() => handleFollowQuestion(question.questionId)}
                    >
                      {isFollowed ? '✓ 已关注' : '关注问题'}
                    </button>
                    <Link to={`/question/${question.questionId}`} style={styles.answerBtn}>
                      写回答
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showToast && <div className="toast">{toastMsg}</div>}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: 'var(--bg-secondary)',
    minHeight: 'calc(100vh - 56px)',
    paddingTop: '20px',
    paddingBottom: '40px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px',
  },
  pageHeader: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
  },
  filters: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  filterBtn: {
    padding: '8px 20px',
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    color: 'var(--text-secondary)',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    background: 'var(--primary-color)',
    color: 'white',
    borderColor: 'var(--primary-color)',
    fontWeight: '500',
  },
  questionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  questionCard: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  questionMain: {
    flex: 1,
    minWidth: 0,
  },
  questionTitle: {
    fontSize: '17px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    display: 'block',
    lineHeight: '1.4',
    marginBottom: '8px',
  },
  questionDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  questionMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  topicLabel: {
    fontSize: '12px',
    color: 'var(--primary-color)',
    background: 'var(--tag-bg)',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  metaStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  answererAvatars: {
    position: 'relative',
    display: 'inline-flex',
    height: '20px',
    width: '52px',
  },
  answererAvatar: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '1px solid var(--card-bg)',
  },
  metaStat: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  questionActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexShrink: 0,
  },
  followBtn: {
    padding: '6px 16px',
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    color: 'var(--text-secondary)',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  },
  followBtnActive: {
    background: 'var(--primary-color)',
    color: 'white',
    borderColor: 'var(--primary-color)',
  },
  answerBtn: {
    padding: '6px 16px',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'none',
    textAlign: 'center' as const,
    fontWeight: '500',
    whiteSpace: 'nowrap' as const,
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  emptyHint: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '20px',
  },
  discoverLink: {
    display: 'inline-block',
    padding: '8px 24px',
    background: 'var(--primary-color)',
    color: 'white',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default WaitingForAnswer;
