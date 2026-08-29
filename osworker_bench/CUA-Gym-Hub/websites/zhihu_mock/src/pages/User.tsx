
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatRelativeTime } from '../utils/timeHelper';

type TabType = 'answers' | 'articles' | 'ideas' | 'collections';

const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const users = useStore(state => state.users);
  const currentUser = useStore(state => state.currentUser);
  const answers = useStore(state => state.answers);
  const articles = useStore(state => state.articles);
  const ideas = useStore(state => state.ideas);
  const collections = useStore(state => state.collections);
  const questions = useStore(state => state.questions);
  const topics = useStore(state => state.topics);
  const userFollowings = useStore(state => state.userFollowings);
  const toggleFollowUser = useStore(state => state.toggleFollowUser);

  const [activeTab, setActiveTab] = useState<TabType>('answers');

  const user = id === currentUser.userId ? currentUser : users.find(u => u.userId === id);
  const userAnswers = answers.filter(a => a.authorId === id);
  const userArticles = articles.filter(a => a.authorId === id);
  const userIdeas = ideas.filter(i => i.authorId === id);
  const isFollowing = userFollowings[id || ''];
  const isSelf = id === currentUser.userId;

  if (!user) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>用户不存在</div>;
  }

  const renderAnswersTab = () => (
    <div style={styles.listContainer}>
      {userAnswers.length === 0 ? (
        <div style={styles.emptyState}>还没有回答，去回答一个问题吧！</div>
      ) : (
        userAnswers.map(answer => {
          const question = questions.find(q => q.questionId === answer.questionId);
          if (!question) return null;

          return (
            <div key={answer.answerId} className="card" style={styles.itemCard}>
              <Link to={`/question/${question.questionId}`} style={styles.itemTitle}>
                {question.title}
              </Link>
              <div style={styles.itemContent}>
                {answer.content.substring(0, 150)}...
              </div>
              <div style={styles.itemStats}>
                <span>👍 {answer.voteupCount}</span>
                <span style={{ marginLeft: '16px' }}>💬 {answer.commentCount}</span>
                <span style={{ marginLeft: '16px' }}>⭐ {answer.favoriteCount}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderArticlesTab = () => (
    <div style={styles.listContainer}>
      {userArticles.length === 0 ? (
        <div style={styles.emptyState}>还没有发表文章</div>
      ) : (
        userArticles.map(article => (
          <div key={article.articleId} className="card" style={styles.articleCard}>
            <div style={styles.articleMain}>
              <Link to={`/article/${article.articleId}`} style={styles.articleTitle}>
                {article.title}
              </Link>
              <div style={styles.itemContent}>
                {article.content.substring(0, 100)}...
              </div>
              <div style={styles.itemStats}>
                <span>👁 {article.viewCount}</span>
                <span style={{ marginLeft: '16px' }}>👍 {article.voteupCount}</span>
                <span style={{ marginLeft: '16px' }}>💬 {article.commentCount}</span>
              </div>
            </div>
            {article.coverImage && (
              <img
                src={article.coverImage}
                alt=""
                style={styles.articleThumb}
              />
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderIdeasTab = () => (
    <div style={styles.listContainer}>
      {userIdeas.length === 0 ? (
        <div style={styles.emptyState}>还没有发表想法</div>
      ) : (
        userIdeas.map(idea => (
          <div key={idea.ideaId} className="card" style={styles.itemCard}>
            <div style={styles.ideaContent}>{idea.content}</div>
            {idea.images && idea.images.length > 0 && (
              <div style={styles.ideaImages}>
                {idea.images.slice(0, 3).map((img, idx) => (
                  <img key={idx} src={img} alt="" style={styles.ideaImage} />
                ))}
              </div>
            )}
            <div style={styles.ideaMeta}>
              <span style={styles.ideaTime}>{formatRelativeTime(idea.createdTime)}</span>
              <div style={styles.ideaStats}>
                <span>👍 {idea.voteupCount}</span>
                <span style={{ marginLeft: '12px' }}>💬 {idea.commentCount}</span>
                <span style={{ marginLeft: '12px' }}>🔄 {idea.shareCount}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderCollectionsTab = () => (
    <div style={styles.listContainer}>
      {collections.length === 0 ? (
        <div style={styles.emptyState}>收藏夹为空</div>
      ) : (
        collections.map(col => (
          <div key={col.collectionId} className="card" style={styles.collectionCard}>
            <div style={styles.collectionHeader}>
              <div style={styles.collectionName}>{col.name}</div>
              <span style={styles.collectionBadge}>
                {col.privacy === 'private' ? '🔒 私密' : '🌐 公开'}
              </span>
            </div>
            {col.description && (
              <div style={styles.collectionDesc}>{col.description}</div>
            )}
            <div style={styles.collectionMeta}>
              <span>{col.itemIds.length} 个内容</span>
              <span style={{ marginLeft: '12px' }}>{formatRelativeTime(col.updatedTime)} 更新</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'answers': return renderAnswersTab();
      case 'articles': return renderArticlesTab();
      case 'ideas': return renderIdeasTab();
      case 'collections': return renderCollectionsTab();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <img src={user.avatar} alt="" style={styles.avatar} />
          <div style={styles.userInfo}>
            <h1 style={styles.nickname}>{user.nickname}</h1>
            <div style={styles.headline}>{user.headline}</div>
            <div style={styles.description}>{user.description}</div>
            <div style={styles.meta}>
              <span>{user.location}</span>
              <span style={{ marginLeft: '16px' }}>{user.industry}</span>
            </div>
            {!isSelf && (
              <button
                style={{ ...styles.followBtn, ...(isFollowing ? styles.followBtnActive : {}) }}
                onClick={() => toggleFollowUser(user.userId)}
              >
                {isFollowing ? '✓ 已关注' : '+ 关注'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={styles.stats}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{user.followingCount}</div>
          <div style={styles.statLabel}>关注</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{user.followerCount}</div>
          <div style={styles.statLabel}>粉丝</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{user.voteupCount}</div>
          <div style={styles.statLabel}>获赞</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{user.favoriteCount}</div>
          <div style={styles.statLabel}>收藏</div>
        </div>
      </div>

      <div style={styles.container}>
        <main style={styles.main}>
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'answers' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('answers')}
            >
              回答 {userAnswers.length}
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'articles' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('articles')}
            >
              文章 {userArticles.length}
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'ideas' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('ideas')}
            >
              想法 {userIdeas.length}
            </button>
            {isSelf && (
              <button
                style={{ ...styles.tab, ...(activeTab === 'collections' ? styles.tabActive : {}) }}
                onClick={() => setActiveTab('collections')}
              >
                收藏夹 {collections.length}
              </button>
            )}
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: 'var(--bg-secondary)',
    minHeight: 'calc(100vh - 56px)',
  },
  header: {
    background: 'var(--card-bg)',
    borderBottom: '1px solid var(--border-color)',
    padding: '40px 0',
  },
  headerContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    gap: '24px',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
  },
  userInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: '28px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  headline: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  meta: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
  },
  followBtn: {
    padding: '8px 24px',
    border: '1px solid var(--primary-color)',
    background: 'var(--card-bg)',
    color: 'var(--primary-color)',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  followBtnActive: {
    background: 'var(--primary-color)',
    color: 'white',
  },
  stats: {
    background: 'var(--card-bg)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'center',
    gap: '60px',
    padding: '20px 0',
  },
  statItem: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
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
    background: 'var(--bg-secondary)',
    color: 'var(--primary-color)',
    fontWeight: '500',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '15px',
    background: 'var(--card-bg)',
    borderRadius: '4px',
  },
  itemCard: {
    padding: '20px',
  },
  itemTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '12px',
  },
  itemContent: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  itemStats: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  // Article tab styles
  articleCard: {
    padding: '20px',
    display: 'flex',
    gap: '16px',
  },
  articleMain: {
    flex: 1,
    minWidth: 0,
  },
  articleTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  articleThumb: {
    width: '120px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '4px',
    flexShrink: 0,
  },
  // Idea tab styles
  ideaContent: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: 'var(--text-primary)',
    marginBottom: '12px',
    whiteSpace: 'pre-wrap',
  },
  ideaImages: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  ideaImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  ideaMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ideaTime: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  ideaStats: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  // Collection tab styles
  collectionCard: {
    padding: '20px',
  },
  collectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  collectionName: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  collectionBadge: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    padding: '2px 8px',
    background: 'var(--bg-secondary)',
    borderRadius: '10px',
  },
  collectionDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  },
  collectionMeta: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
};

export default User;
