
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import CommentSection from '../components/CommentSection';
import FavoriteButton from '../components/FavoriteButton';
import { formatRelativeTime } from '../utils/timeHelper';

const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const articles = useStore(state => state.articles);
  const users = useStore(state => state.users);
  const topics = useStore(state => state.topics);
  const currentUser = useStore(state => state.currentUser);
  const userFollowings = useStore(state => state.userFollowings);
  const userVoteups = useStore(state => state.userVoteups);
  const userFavorites = useStore(state => state.userFavorites);
  const toggleFollowUser = useStore(state => state.toggleFollowUser);
  const toggleArticleVoteup = useStore(state => state.toggleArticleVoteup);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const article = articles.find(a => a.articleId === id);
  const isVoted = article ? !!userVoteups[article.articleId] : false;
  const isFavorited = article ? !!userFavorites[article.articleId] : false;

  if (!article) {
    return (
      <div className="placeholder-page">
        <h2>文章不存在</h2>
        <p>该文章可能已被删除</p>
        <Link to="/">返回首页</Link>
      </div>
    );
  }

  const author = users.find(u => u.userId === article.authorId);
  const isFollowingAuthor = author ? userFollowings[author.userId] : false;
  const isSelf = author?.userId === currentUser.userId;

  // Related articles: same topic or same author
  const relatedByTopic = articles
    .filter(a => a.articleId !== article.articleId && a.topics.some(t => article.topics.includes(t)))
    .slice(0, 3);
  const authorArticles = articles
    .filter(a => a.articleId !== article.articleId && a.authorId === article.authorId)
    .slice(0, 3);

  const showToastBriefly = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleFollowAuthor = () => {
    if (author && !isSelf) {
      toggleFollowUser(author.userId);
      showToastBriefly(isFollowingAuthor ? '已取消关注' : '已关注');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <main style={styles.main}>
          <article className="card" style={styles.article}>
            {/* Cover image */}
            {article.coverImage && (
              <img src={article.coverImage} alt={article.title} style={styles.coverImage} />
            )}

            {/* Title */}
            <h1 style={styles.title}>{article.title}</h1>

            {/* Author bar */}
            {author && (
              <div style={styles.authorBar}>
                <Link to={`/user/${author.userId}`} style={styles.authorLink}>
                  <img src={author.avatar} alt="" style={styles.authorAvatar} />
                  <div style={styles.authorInfo}>
                    <div style={styles.authorName}>{author.nickname}</div>
                    <div style={styles.authorHeadline}>{author.headline}</div>
                  </div>
                </Link>
                <div style={styles.authorRight}>
                  <span style={styles.publishDate}>{formatRelativeTime(article.createdTime)}</span>
                  {!isSelf && (
                    <button
                      style={{
                        ...styles.followBtn,
                        ...(isFollowingAuthor ? styles.followBtnActive : {}),
                      }}
                      onClick={handleFollowAuthor}
                    >
                      {isFollowingAuthor ? '✓ 已关注' : '+ 关注'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content body */}
            <div style={styles.content}>{article.content}</div>

            {/* Topic tags */}
            {article.topics.length > 0 && (
              <div style={styles.topicTags}>
                {article.topics.map(topicId => {
                  const topic = topics.find(t => t.topicId === topicId);
                  return topic ? (
                    <Link key={topicId} to={`/topic/${topicId}`} className="tag">
                      {topic.name}
                    </Link>
                  ) : null;
                })}
              </div>
            )}

            {/* Action bar */}
            <div style={styles.actionBar}>
              <button
                style={{ ...styles.actionBtn, ...(isVoted ? styles.actionBtnActive : {}) }}
                onClick={() => toggleArticleVoteup(article.articleId)}
              >
                👍 赞同 {article.voteupCount}
              </button>
              <CommentSection targetId={article.articleId} commentCount={article.commentCount} targetType="article" />
              <FavoriteButton
                itemId={article.articleId}
                itemType="article"
                isFavorited={isFavorited}
              />
              <button style={styles.actionBtn} onClick={() => showToastBriefly('链接已复制')}>🔗 分享</button>
            </div>
          </article>
        </main>

        {/* Sidebar */}
        <aside style={styles.sidebar}>
          {/* Related articles (same topic) */}
          {relatedByTopic.length > 0 && (
            <div className="card" style={styles.sideCard}>
              <div style={styles.sideCardTitle}>相关文章</div>
              {relatedByTopic.map(ra => (
                <Link key={ra.articleId} to={`/article/${ra.articleId}`} style={styles.relatedItem}>
                  <div style={styles.relatedTitle}>{ra.title}</div>
                  <div style={styles.relatedStats}>
                    👁 {ra.viewCount} · 👍 {ra.voteupCount}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Author's other articles */}
          {authorArticles.length > 0 && author && (
            <div className="card" style={styles.sideCard}>
              <div style={styles.sideCardTitle}>{author.nickname} 的其他文章</div>
              {authorArticles.map(aa => (
                <Link key={aa.articleId} to={`/article/${aa.articleId}`} style={styles.relatedItem}>
                  <div style={styles.relatedTitle}>{aa.title}</div>
                  <div style={styles.relatedStats}>
                    👁 {aa.viewCount} · 👍 {aa.voteupCount}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* About author */}
          {author && (
            <div className="card" style={styles.sideCard}>
              <div style={styles.sideCardTitle}>关于作者</div>
              <Link to={`/user/${author.userId}`} style={styles.aboutAuthor}>
                <img src={author.avatar} alt="" style={styles.aboutAuthorAvatar} />
                <div>
                  <div style={styles.aboutAuthorName}>{author.nickname}</div>
                  <div style={styles.aboutAuthorHeadline}>{author.headline}</div>
                </div>
              </Link>
              <div style={styles.aboutAuthorStats}>
                <span>{author.answerCount} 回答</span>
                <span style={{ marginLeft: '12px' }}>{author.articleCount} 文章</span>
                <span style={{ marginLeft: '12px' }}>{author.followerCount} 关注者</span>
              </div>
            </div>
          )}
        </aside>
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
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '20px',
  },
  main: {
    minWidth: 0,
  },
  article: {
    padding: '32px',
  },
  coverImage: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    lineHeight: '1.4',
    marginBottom: '20px',
    color: 'var(--text-primary)',
  },
  authorBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
  },
  authorLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  authorAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: '15px',
    fontWeight: '500',
  },
  authorHeadline: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  authorRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  publishDate: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  followBtn: {
    padding: '6px 20px',
    border: '1px solid var(--primary-color)',
    background: 'var(--card-bg)',
    color: 'var(--primary-color)',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  followBtnActive: {
    background: 'var(--primary-color)',
    color: 'white',
  },
  content: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: 'var(--text-primary)',
    whiteSpace: 'pre-wrap',
    marginBottom: '24px',
  },
  topicTags: {
    marginBottom: '20px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  actionBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  actionBtnActive: {
    color: 'var(--primary-color)',
    background: 'var(--tag-bg)',
  },
  sidebar: {
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
  relatedItem: {
    display: 'block',
    padding: '10px 0',
    borderBottom: '1px solid var(--border-color)',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  relatedTitle: {
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.4',
    marginBottom: '4px',
  },
  relatedStats: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  aboutAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  aboutAuthorAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
  },
  aboutAuthorName: {
    fontSize: '14px',
    fontWeight: '500',
  },
  aboutAuthorHeadline: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  aboutAuthorStats: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)',
  },
};

export default Article;
