import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

const Discover: React.FC = () => {
  const topics = useStore(state => state.topics);
  const questions = useStore(state => state.questions);
  const articles = useStore(state => state.articles);
  const users = useStore(state => state.users);
  const userFollowedTopics = useStore(state => state.userFollowedTopics);
  const toggleFollowTopic = useStore(state => state.toggleFollowTopic);

  const [activeTab, setActiveTab] = useState<'topics' | 'articles' | 'people'>('topics');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToastBriefly = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleFollowTopic = (topicId: string) => {
    const isFollowing = !!userFollowedTopics[topicId];
    toggleFollowTopic(topicId);
    showToastBriefly(isFollowing ? '已取消关注话题' : '已关注话题');
  };

  // Trending questions: top questions by viewCount
  const trendingQuestions = [...questions].sort((a, b) => b.viewCount - a.viewCount).slice(0, 6);

  // Featured articles: top articles by voteupCount
  const featuredArticles = [...articles].sort((a, b) => b.voteupCount - a.voteupCount).slice(0, 4);

  // Recommended users: users with highest followerCount
  const recommendedUsers = [...users].sort((a, b) => b.followerCount - a.followerCount).slice(0, 6);

  const renderTopics = () => (
    <div>
      <div style={styles.sectionTitle}>推荐话题</div>
      <div style={styles.topicGrid}>
        {topics.map(topic => {
          const isFollowing = !!userFollowedTopics[topic.topicId];
          return (
            <div key={topic.topicId} className="card" style={styles.topicCard}>
              <Link to={`/topic/${topic.topicId}`} style={styles.topicCardLink}>
                <img src={topic.icon} alt={topic.name} style={styles.topicIcon} />
                <div style={styles.topicInfo}>
                  <div style={styles.topicName}>{topic.name}</div>
                  <div style={styles.topicStats}>
                    {(topic.followerCount / 10000).toFixed(0)}万关注 · {topic.questionCount.toLocaleString()}问题
                  </div>
                  <div style={styles.topicDesc}>{topic.description.substring(0, 40)}...</div>
                </div>
              </Link>
              <button
                style={{ ...styles.followBtn, ...(isFollowing ? styles.followBtnActive : {}) }}
                onClick={() => handleFollowTopic(topic.topicId)}
              >
                {isFollowing ? '✓ 已关注' : '+ 关注'}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ ...styles.sectionTitle, marginTop: '32px' }}>热门讨论</div>
      <div style={styles.questionList}>
        {trendingQuestions.map((q, idx) => (
          <Link key={q.questionId} to={`/question/${q.questionId}`} className="card" style={styles.questionItem}>
            <div style={styles.questionRank}>{idx + 1}</div>
            <div style={styles.questionContent}>
              <div style={styles.questionTitle}>{q.title}</div>
              <div style={styles.questionMeta}>
                {q.answerCount} 个回答 · {q.viewCount.toLocaleString()} 次浏览
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  const renderArticles = () => (
    <div>
      <div style={styles.sectionTitle}>精选文章</div>
      <div style={styles.articleGrid}>
        {featuredArticles.map(article => {
          const author = users.find(u => u.userId === article.authorId);
          return (
            <Link key={article.articleId} to={`/article/${article.articleId}`} className="card" style={styles.articleCard}>
              {article.coverImage && (
                <img src={article.coverImage} alt={article.title} style={styles.articleCover} />
              )}
              <div style={styles.articleBody}>
                <div style={styles.articleTitle}>{article.title}</div>
                {author && (
                  <div style={styles.articleAuthor}>
                    <img src={author.avatar} alt="" style={styles.articleAuthorAvatar} />
                    <span>{author.nickname}</span>
                  </div>
                )}
                <div style={styles.articleStats}>
                  👍 {article.voteupCount} · 💬 {article.commentCount} · 👁 {article.viewCount}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  const renderPeople = () => (
    <div>
      <div style={styles.sectionTitle}>推荐关注</div>
      <div style={styles.peopleList}>
        {recommendedUsers.map(user => (
          <div key={user.userId} className="card" style={styles.personCard}>
            <Link to={`/user/${user.userId}`} style={styles.personLink}>
              <img src={user.avatar} alt="" style={styles.personAvatar} />
              <div style={styles.personInfo}>
                <div style={styles.personName}>{user.nickname}</div>
                <div style={styles.personHeadline}>{user.headline}</div>
                <div style={styles.personStats}>
                  {user.followerCount.toLocaleString()} 关注者 · {user.answerCount} 回答 · {user.voteupCount.toLocaleString()} 获赞
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'topics' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('topics')}
          >
            话题 & 热门
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'articles' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('articles')}
          >
            精选文章
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'people' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('people')}
          >
            推荐关注
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === 'topics' && renderTopics()}
          {activeTab === 'articles' && renderArticles()}
          {activeTab === 'people' && renderPeople()}
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 20px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    background: 'var(--card-bg)',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
  },
  tab: {
    padding: '8px 20px',
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
  content: {},
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  topicGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  topicCard: {
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  topicCardLink: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    flex: 1,
    minWidth: 0,
  },
  topicIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    flexShrink: 0,
  },
  topicInfo: {
    flex: 1,
    minWidth: 0,
  },
  topicName: {
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '4px',
  },
  topicStats: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  topicDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  followBtn: {
    padding: '6px 14px',
    border: '1px solid var(--primary-color)',
    background: 'var(--card-bg)',
    color: 'var(--primary-color)',
    borderRadius: '20px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },
  followBtnActive: {
    background: 'var(--primary-color)',
    color: 'white',
  },
  questionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  questionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  questionRank: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    minWidth: '24px',
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  questionContent: {
    flex: 1,
  },
  questionTitle: {
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '6px',
    lineHeight: '1.4',
  },
  questionMeta: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  articleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  articleCard: {
    textDecoration: 'none',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  articleCover: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
  },
  articleBody: {
    padding: '16px',
    flex: 1,
  },
  articleTitle: {
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '1.4',
    marginBottom: '10px',
  },
  articleAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  },
  articleAuthorAvatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
  },
  articleStats: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  peopleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  personCard: {
    padding: '16px',
  },
  personLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  personAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '4px',
  },
  personHeadline: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  },
  personStats: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
};

export default Discover;
