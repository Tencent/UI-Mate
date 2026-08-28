import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import CommentSection from '../components/CommentSection';
import FavoriteButton from '../components/FavoriteButton';
import { formatRelativeTime } from '../utils/timeHelper';

const IdeaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ideas = useStore(state => state.ideas);
  const users = useStore(state => state.users);
  const topics = useStore(state => state.topics);
  const userVoteups = useStore(state => state.userVoteups);
  const userFavorites = useStore(state => state.userFavorites);
  const toggleIdeaVoteup = useStore(state => state.toggleIdeaVoteup);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToastBriefly = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const idea = ideas.find(i => i.ideaId === id);

  if (!idea) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div className="card" style={styles.notFound}>
            <div style={styles.notFoundIcon}>🤔</div>
            <div style={styles.notFoundText}>想法不存在</div>
            <Link to="/" style={styles.backLink}>返回首页</Link>
          </div>
        </div>
      </div>
    );
  }

  const author = users.find(u => u.userId === idea.authorId);
  const ideaTopics = idea.topics
    .map(tid => topics.find(t => t.topicId === tid))
    .filter(Boolean);

  const isVoted = !!userVoteups[idea.ideaId];
  const isFavorited = !!userFavorites[idea.ideaId];

  // Other ideas from same author (excluding current)
  const moreFromAuthor = ideas
    .filter(i => i.authorId === idea.authorId && i.ideaId !== idea.ideaId)
    .slice(0, 3);

  // Recent ideas from all (excluding current)
  const recentIdeas = ideas
    .filter(i => i.ideaId !== idea.ideaId)
    .sort((a, b) => b.createdTime - a.createdTime)
    .slice(0, 4);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <main style={styles.main}>
          {/* Idea Card */}
          <div className="card" style={styles.ideaCard}>
            {/* Author row */}
            {author && (
              <div style={styles.authorRow}>
                <Link to={`/user/${author.userId}`} style={styles.authorLink}>
                  <img src={author.avatar} alt="" style={styles.authorAvatar} />
                  <div>
                    <div style={styles.authorName}>{author.nickname}</div>
                    <div style={styles.authorMeta}>
                      <span style={styles.authorHeadline}>{author.headline}</span>
                      <span style={styles.dot}>·</span>
                      <span style={styles.ideaTime}>{formatRelativeTime(idea.createdTime)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Idea content */}
            <div style={styles.ideaContent}>{idea.content}</div>

            {/* Images */}
            {idea.images && idea.images.length > 0 && (
              <div style={{
                ...styles.imagesGrid,
                ...(idea.images.length === 1 ? styles.imagesGridSingle : {}),
                ...(idea.images.length === 2 ? styles.imagesGridDouble : {}),
              }}>
                {idea.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    style={{
                      ...styles.ideaImage,
                      ...(idea.images.length === 1 ? styles.ideaImageSingle : {}),
                    }}
                  />
                ))}
              </div>
            )}

            {/* Topics */}
            {ideaTopics.length > 0 && (
              <div style={styles.topicsRow}>
                {ideaTopics.map(topic => topic && (
                  <Link key={topic.topicId} to={`/topic/${topic.topicId}`} className="tag">
                    {topic.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={styles.actionsRow}>
              <button
                style={{ ...styles.actionBtn, ...(isVoted ? styles.actionBtnActive : {}) }}
                onClick={() => toggleIdeaVoteup(idea.ideaId)}
              >
                👍 赞同 {idea.voteupCount > 0 ? idea.voteupCount : ''}
              </button>

              <CommentSection
                targetId={idea.ideaId}
                commentCount={idea.commentCount}
                targetType="idea"
              />

              <FavoriteButton
                itemId={idea.ideaId}
                itemType="idea"
                isFavorited={isFavorited}
              />

              <button
                style={styles.actionBtn}
                onClick={() => showToastBriefly('链接已复制')}
              >
                🔗 分享 {idea.shareCount > 0 ? idea.shareCount : ''}
              </button>
            </div>
          </div>
        </main>

        <aside style={styles.sidebar}>
          {/* Author info card */}
          {author && (
            <div className="card" style={styles.sideCard}>
              <Link to={`/user/${author.userId}`} style={styles.sideAuthorLink}>
                <img src={author.avatar} alt="" style={styles.sideAuthorAvatar} />
                <div>
                  <div style={styles.sideAuthorName}>{author.nickname}</div>
                  <div style={styles.sideAuthorHeadline}>{author.headline}</div>
                </div>
              </Link>
              <div style={styles.sideAuthorStats}>
                <div style={styles.statItem}>
                  <span style={styles.statNum}>{author.followerCount.toLocaleString()}</span>
                  <span style={styles.statLabel}>关注者</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statNum}>{author.voteupCount.toLocaleString()}</span>
                  <span style={styles.statLabel}>获赞</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statNum}>{author.answerCount}</span>
                  <span style={styles.statLabel}>回答</span>
                </div>
              </div>
            </div>
          )}

          {/* More from author */}
          {moreFromAuthor.length > 0 && (
            <div className="card" style={styles.sideCard}>
              <div style={styles.sideCardTitle}>
                {author ? `${author.nickname} 的其他想法` : '更多想法'}
              </div>
              {moreFromAuthor.map(otherIdea => {
                const otherAuthor = users.find(u => u.userId === otherIdea.authorId);
                return (
                  <Link key={otherIdea.ideaId} to={`/idea/${otherIdea.ideaId}`} style={styles.sideIdeaItem}>
                    {otherAuthor && (
                      <img src={otherAuthor.avatar} alt="" style={styles.sideIdeaAvatar} />
                    )}
                    <div style={styles.sideIdeaContent}>
                      <div style={styles.sideIdeaText}>
                        {otherIdea.content.length > 60
                          ? otherIdea.content.substring(0, 60) + '...'
                          : otherIdea.content}
                      </div>
                      <div style={styles.sideIdeaMeta}>
                        👍 {otherIdea.voteupCount} · 💬 {otherIdea.commentCount}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Recent ideas */}
          {recentIdeas.length > 0 && (
            <div className="card" style={styles.sideCard}>
              <div style={styles.sideCardTitle}>最新想法</div>
              {recentIdeas.map(recentIdea => {
                const recentAuthor = users.find(u => u.userId === recentIdea.authorId);
                return (
                  <Link key={recentIdea.ideaId} to={`/idea/${recentIdea.ideaId}`} style={styles.sideIdeaItem}>
                    {recentAuthor && (
                      <img src={recentAuthor.avatar} alt="" style={styles.sideIdeaAvatar} />
                    )}
                    <div style={styles.sideIdeaContent}>
                      <div style={styles.sideIdeaAuthorName}>{recentAuthor?.nickname}</div>
                      <div style={styles.sideIdeaText}>
                        {recentIdea.content.length > 50
                          ? recentIdea.content.substring(0, 50) + '...'
                          : recentIdea.content}
                      </div>
                    </div>
                  </Link>
                );
              })}
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
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: '20px',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  ideaCard: {
    padding: '24px',
  },
  authorRow: {
    marginBottom: '16px',
  },
  authorLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  authorAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  authorName: {
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '2px',
  },
  authorMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  authorHeadline: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  dot: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  ideaTime: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  ideaContent: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: 'var(--text-primary)',
    marginBottom: '16px',
    whiteSpace: 'pre-wrap',
  },
  imagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '16px',
  },
  imagesGridSingle: {
    gridTemplateColumns: '1fr',
  },
  imagesGridDouble: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  ideaImage: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  ideaImageSingle: {
    maxWidth: '480px',
    height: '280px',
  },
  topicsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
  },
  actionsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '4px',
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
  // Sidebar styles
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sideCard: {
    padding: '16px',
  },
  sideAuthorLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  sideAuthorAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
  },
  sideAuthorName: {
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '2px',
  },
  sideAuthorHeadline: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  sideAuthorStats: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-color)',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statNum: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  sideCardTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  sideIdeaItem: {
    display: 'flex',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid var(--border-color)',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  sideIdeaAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '2px',
  },
  sideIdeaContent: {
    flex: 1,
    minWidth: 0,
  },
  sideIdeaAuthorName: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    marginBottom: '2px',
  },
  sideIdeaText: {
    fontSize: '13px',
    lineHeight: '1.5',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  sideIdeaMeta: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  notFound: {
    padding: '60px 20px',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '20px auto',
  },
  notFoundIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  notFoundText: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  backLink: {
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

export default IdeaPage;
