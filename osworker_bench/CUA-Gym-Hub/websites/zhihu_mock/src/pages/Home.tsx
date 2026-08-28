
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import FavoriteButton from '../components/FavoriteButton';

const Home: React.FC = () => {
  const currentUser = useStore(state => state.currentUser);
  const questions = useStore(state => state.questions);
  const answers = useStore(state => state.answers);
  const users = useStore(state => state.users);
  const topics = useStore(state => state.topics);
  const userVoteups = useStore(state => state.userVoteups);
  const userFavorites = useStore(state => state.userFavorites);
  const userFollowings = useStore(state => state.userFollowings);
  const userFollowedTopics = useStore(state => state.userFollowedTopics);
  const toggleVoteup = useStore(state => state.toggleVoteup);

  const [activeTab, setActiveTab] = useState('recommend');
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  const getUserById = (userId: string) => users.find(u => u.userId === userId);
  const getTopicById = (topicId: string) => topics.find(t => t.topicId === topicId);

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // All feed items (answers with their questions)
  const allFeedItems = answers.map(answer => {
    const question = questions.find(q => q.questionId === answer.questionId);
    const author = getUserById(answer.authorId);
    return { type: 'answer' as const, answer, question, author };
  });

  // "关注" tab: filter to followed authors or followed topics
  const followFeedItems = allFeedItems.filter(({ answer, question }) => {
    // Author is followed
    if (userFollowings[answer.authorId]) return true;
    // Question has a topic that user follows
    if (question && question.topics.some(t => userFollowedTopics[t])) return true;
    return false;
  });

  // "热榜" tab: top questions by viewCount
  const hotQuestions = [...questions].sort((a, b) => b.viewCount - a.viewCount);

  const followedTopics = topics.filter(t => userFollowedTopics[t.topicId]);

  const renderFeedCard = ({ answer, question, author }: typeof allFeedItems[0]) => {
    if (!question || !author) return null;

    const isVoted = userVoteups[answer.answerId];
    const isFavorited = userFavorites[answer.answerId];
    const isExpanded = expandedCards[answer.answerId];
    const contentPreview = answer.content.substring(0, 200);
    const needsExpand = answer.content.length > 200;

    return (
      <div key={answer.answerId} className="card" style={styles.feedCard}>
        <Link to={`/question/${question.questionId}`} style={styles.questionTitle}>
          {question.title}
        </Link>

        <div style={styles.answerMeta}>
          <Link to={`/user/${author.userId}`} style={styles.authorLink}>
            <img src={author.avatar} alt="" style={styles.authorAvatar} />
            <div>
              <div style={styles.authorName}>{author.nickname}</div>
              <div style={styles.authorHeadline}>{author.headline}</div>
            </div>
          </Link>
        </div>

        <div style={styles.answerContent}>
          {isExpanded ? answer.content : (needsExpand ? contentPreview + '...' : answer.content)}
          {needsExpand && (
            <button
              style={styles.expandBtn}
              onClick={() => toggleExpand(answer.answerId)}
            >
              {isExpanded ? '收起 ▲' : '阅读全文 ▼'}
            </button>
          )}
        </div>

        <div style={styles.answerActions}>
          <button
            style={{ ...styles.actionBtn, ...(isVoted ? styles.actionBtnActive : {}) }}
            onClick={() => toggleVoteup(answer.answerId)}
          >
            👍 {answer.voteupCount}
          </button>
          <Link to={`/answer/${answer.answerId}`} style={styles.actionBtn}>
            💬 {answer.commentCount}
          </Link>
          <FavoriteButton
            itemId={answer.answerId}
            itemType="answer"
            isFavorited={!!isFavorited}
          />
          <button style={styles.actionBtn}>
            🔗 分享
          </button>
        </div>

        <div style={styles.questionTopics}>
          {question.topics.map(topicId => {
            const topic = getTopicById(topicId);
            return topic ? (
              <Link key={topicId} to={`/topic/${topicId}`} className="tag">
                {topic.name}
              </Link>
            ) : null;
          })}
        </div>
      </div>
    );
  };

  const renderHotList = () => (
    <div style={styles.feed}>
      {hotQuestions.map((question, idx) => (
        <Link
          key={question.questionId}
          to={`/question/${question.questionId}`}
          className="card hot-list-item"
          style={styles.hotCard}
        >
          <div style={styles.hotCardInner}>
            <div style={{
              ...styles.hotRank,
              ...(idx < 3 ? styles.hotRankTop : {}),
            }}>
              {idx + 1}
            </div>
            <div style={styles.hotContent}>
              <div style={styles.hotTitle}>
                {question.title}
              </div>
              {question.description && (
                <div style={styles.hotDesc}>
                  {question.description.length > 80
                    ? question.description.substring(0, 80) + '...'
                    : question.description}
                </div>
              )}
              <div style={styles.hotStats}>
                <span>{question.followerCount} 人关注</span>
                <span style={{ marginLeft: '12px' }}>{question.viewCount.toLocaleString()} 次浏览</span>
                <span style={styles.hotAnswerBadge}>{question.answerCount} 回答</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'follow':
        if (followFeedItems.length === 0) {
          return (
            <div className="card" style={styles.emptyState}>
              还没有关注的内容，去关注一些用户或话题吧
            </div>
          );
        }
        return <div style={styles.feed}>{followFeedItems.map(renderFeedCard)}</div>;
      case 'hot':
        return renderHotList();
      case 'recommend':
      default:
        return <div style={styles.feed}>{allFeedItems.map(renderFeedCard)}</div>;
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <aside style={styles.sidebar}>
          <div className="card" style={styles.userCard}>
            <Link to={`/user/${currentUser.userId}`} style={styles.userLink}>
              <img src={currentUser.avatar} alt="" style={styles.userAvatar} />
              <div style={styles.userName}>{currentUser.nickname}</div>
            </Link>
            <div style={styles.userStats}>
              <div style={styles.stat}>
                <div style={styles.statValue}>{currentUser.followingCount}</div>
                <div style={styles.statLabel}>关注</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statValue}>{currentUser.followerCount}</div>
                <div style={styles.statLabel}>粉丝</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statValue}>{currentUser.voteupCount}</div>
                <div style={styles.statLabel}>获赞</div>
              </div>
            </div>
          </div>

          <nav className="card" style={styles.navCard}>
            <Link to="/" style={{ ...styles.navItem, ...(activeTab === 'recommend' ? styles.navItemActive : {}) }}>
              📱 推荐
            </Link>
            <Link to="/hot" style={styles.navItem}>
              🔥 热榜
            </Link>
            <div style={styles.navItem}>
              🎬 视频
            </div>
            <div style={styles.navItem}>
              ⭐ 关注
            </div>
          </nav>

          {followedTopics.length > 0 && (
            <div className="card" style={styles.topicsCard}>
              <div style={styles.topicsHeader}>我关注的话题</div>
              {followedTopics.slice(0, 5).map(topic => (
                <Link key={topic.topicId} to={`/topic/${topic.topicId}`} style={styles.topicItem}>
                  <img src={topic.icon} alt="" style={styles.topicIcon} />
                  <span>{topic.name}</span>
                </Link>
              ))}
            </div>
          )}
        </aside>

        <main style={styles.main}>
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'recommend' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('recommend')}
            >
              综合
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'follow' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('follow')}
            >
              关注
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'hot' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('hot')}
            >
              热榜
            </button>
          </div>

          {renderContent()}
        </main>

        <aside style={styles.rightSidebar}>
          <div className="card" style={styles.sideCard}>
            <div style={styles.sideCardTitle}>推荐话题</div>
            {topics.slice(0, 5).map(topic => (
              <Link key={topic.topicId} to={`/topic/${topic.topicId}`} style={styles.recommendTopic}>
                <img src={topic.icon} alt="" style={styles.topicIcon} />
                <div style={styles.recommendTopicInfo}>
                  <div style={styles.recommendTopicName}>{topic.name}</div>
                  <div style={styles.recommendTopicFollowers}>
                    {(topic.followerCount / 10000).toFixed(0)}万 关注
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: 'var(--bg-secondary)',
    minHeight: 'calc(100vh - 56px)',
    paddingTop: '20px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '240px 1fr 280px',
    gap: '20px',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  userCard: {
    padding: '20px',
    textAlign: 'center',
  },
  userLink: {
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  userAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    marginBottom: '12px',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '16px',
  },
  userStats: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
  },
  stat: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  navCard: {
    padding: '12px 0',
  },
  navItem: {
    display: 'block',
    padding: '12px 20px',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontSize: '15px',
    transition: 'background 0.2s',
    cursor: 'pointer',
  },
  navItemActive: {
    background: 'var(--bg-secondary)',
    color: 'var(--primary-color)',
    fontWeight: '500',
  },
  topicsCard: {
    padding: '16px',
  },
  topicsHeader: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '12px',
    color: 'var(--text-primary)',
  },
  topicItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontSize: '14px',
  },
  topicIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  tabs: {
    background: 'var(--card-bg)',
    borderRadius: '4px',
    padding: '8px',
    display: 'flex',
    gap: '8px',
  },
  tab: {
    padding: '8px 16px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '15px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'var(--primary-color)',
    color: 'white',
    fontWeight: '500',
  },
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  feedCard: {
    padding: '20px',
  },
  questionTitle: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '12px',
  },
  answerMeta: {
    marginBottom: '12px',
  },
  authorLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  authorAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
  },
  authorName: {
    fontSize: '14px',
    fontWeight: '500',
  },
  authorHeadline: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  answerContent: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: 'var(--text-primary)',
    marginBottom: '16px',
    whiteSpace: 'pre-wrap',
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary-color)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 0',
    marginLeft: '4px',
    fontWeight: '500',
  },
  answerActions: {
    display: 'flex',
    gap: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '12px',
    alignItems: 'center',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'all 0.2s',
    textDecoration: 'none',
  },
  actionBtnActive: {
    color: 'var(--primary-color)',
    background: 'var(--tag-bg)',
  },
  questionTopics: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  // Hot list card styles
  hotCard: {
    padding: '16px 20px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    display: 'block',
    transition: 'background 0.2s',
    cursor: 'pointer',
  },
  hotCardInner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  hotRank: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    minWidth: '28px',
    textAlign: 'center',
    lineHeight: '1.4',
  },
  hotRankTop: {
    color: '#ec5e28',
  },
  hotContent: {
    flex: 1,
    minWidth: 0,
  },
  hotTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    display: 'block',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  hotDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '8px',
  },
  hotStats: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  hotAnswerBadge: {
    marginLeft: '12px',
    background: 'var(--tag-bg)',
    color: 'var(--primary-color)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '15px',
  },
  rightSidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sideCard: {
    padding: '16px',
  },
  sideCardTitle: {
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '16px',
    color: 'var(--text-primary)',
  },
  recommendTopic: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
  },
  recommendTopicInfo: {
    flex: 1,
  },
  recommendTopicName: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px',
  },
  recommendTopicFollowers: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
};

export default Home;
