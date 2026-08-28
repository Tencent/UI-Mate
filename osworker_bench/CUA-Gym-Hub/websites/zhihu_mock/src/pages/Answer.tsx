
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import CommentSection from '../components/CommentSection';
import FavoriteButton from '../components/FavoriteButton';
import { formatRelativeTime } from '../utils/timeHelper';

const Answer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const answers = useStore(state => state.answers);
  const questions = useStore(state => state.questions);
  const users = useStore(state => state.users);
  const topics = useStore(state => state.topics);
  const currentUser = useStore(state => state.currentUser);
  const userVoteups = useStore(state => state.userVoteups);
  const userFavorites = useStore(state => state.userFavorites);
  const userFollowings = useStore(state => state.userFollowings);
  const toggleVoteup = useStore(state => state.toggleVoteup);
  const toggleFollowUser = useStore(state => state.toggleFollowUser);
  const toggleThankAnswer = useStore(state => state.toggleThankAnswer);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const answer = answers.find(a => a.answerId === id);

  if (!answer) {
    return (
      <div className="placeholder-page">
        <h2>回答不存在</h2>
        <p>该回答可能已被删除</p>
        <Link to="/">返回首页</Link>
      </div>
    );
  }

  const question = questions.find(q => q.questionId === answer.questionId);
  const author = users.find(u => u.userId === answer.authorId);
  const isVoted = userVoteups[answer.answerId];
  const isFavorited = userFavorites[answer.answerId];
  const isFollowingAuthor = author ? userFollowings[author.userId] : false;
  const isSelf = author?.userId === currentUser.userId;
  const isThanked = !!userVoteups[`thank_${answer.answerId}`];

  // Related answers from same question (excluding this one)
  const relatedAnswers = answers
    .filter(a => a.questionId === answer.questionId && a.answerId !== answer.answerId)
    .slice(0, 5);

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
          {/* Parent question link */}
          {question && (
            <div className="card" style={styles.questionCard}>
              <Link to={`/question/${question.questionId}`} style={styles.questionLink}>
                {question.title}
              </Link>
              <div style={styles.questionMeta}>
                {question.answerCount} 个回答 · {question.followerCount} 人关注
              </div>
            </div>
          )}

          {/* Answer content card */}
          <div className="card" style={styles.answerCard}>
            {/* Author card */}
            {author && (
              <div style={styles.authorBar}>
                <Link to={`/user/${author.userId}`} style={styles.authorLink}>
                  <img src={author.avatar} alt="" style={styles.authorAvatar} />
                  <div style={styles.authorInfo}>
                    <div style={styles.authorName}>{author.nickname}</div>
                    <div style={styles.authorHeadline}>{author.headline}</div>
                  </div>
                </Link>
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
            )}

            {/* Full answer content */}
            <div style={styles.answerContent}>{answer.content}</div>

            {/* Publish time */}
            <div style={styles.publishTime}>
              发布于 {formatRelativeTime(answer.createdTime)}
              {answer.updatedTime > answer.createdTime && (
                <span> · 编辑于 {formatRelativeTime(answer.updatedTime)}</span>
              )}
            </div>

            {/* Action bar */}
            <div style={styles.actionBar}>
              <button
                style={{
                  ...styles.actionBtn,
                  ...(isVoted ? styles.actionBtnActive : {}),
                }}
                onClick={() => toggleVoteup(answer.answerId)}
              >
                👍 赞同 {answer.voteupCount}
              </button>
              <CommentSection targetId={answer.answerId} commentCount={answer.commentCount} />
              <FavoriteButton
                itemId={answer.answerId}
                itemType="answer"
                isFavorited={!!isFavorited}
              />
              <button
                style={{ ...styles.actionBtn, ...(isThanked ? styles.actionBtnActive : {}) }}
                onClick={() => toggleThankAnswer(answer.answerId)}
              >
                ❤️ 感谢 {answer.thankCount > 0 ? answer.thankCount : ''}
              </button>              <button style={styles.actionBtn}>🔗 分享</button>
            </div>
          </div>
        </main>

        {/* Right sidebar */}
        <aside style={styles.sidebar}>
          {relatedAnswers.length > 0 && (
            <div className="card" style={styles.sideCard}>
              <div style={styles.sideCardTitle}>相关回答</div>
              {relatedAnswers.map(ra => {
                const raAuthor = users.find(u => u.userId === ra.authorId);
                return (
                  <Link key={ra.answerId} to={`/answer/${ra.answerId}`} style={styles.relatedAnswer}>
                    <div style={styles.relatedAnswerAuthor}>
                      {raAuthor && (
                        <>
                          <img src={raAuthor.avatar} alt="" style={styles.relatedAvatar} />
                          <span>{raAuthor.nickname}</span>
                        </>
                      )}
                    </div>
                    <div style={styles.relatedAnswerPreview}>
                      {ra.content.substring(0, 80)}...
                    </div>
                    <div style={styles.relatedAnswerStats}>
                      👍 {ra.voteupCount} · 💬 {ra.commentCount}
                    </div>
                  </Link>
                );
              })}
              {question && (
                <Link to={`/question/${question.questionId}`} style={styles.viewAllLink}>
                  查看全部 {question.answerCount} 个回答 →
                </Link>
              )}
            </div>
          )}

          {/* Question topics */}
          {question && question.topics.length > 0 && (
            <div className="card" style={styles.sideCard}>
              <div style={styles.sideCardTitle}>相关话题</div>
              <div style={styles.topicTags}>
                {question.topics.map(topicId => {
                  const topic = topics.find(t => t.topicId === topicId);
                  return topic ? (
                    <Link key={topicId} to={`/topic/${topicId}`} className="tag" style={styles.topicTag}>
                      {topic.name}
                    </Link>
                  ) : null;
                })}
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
  questionCard: {
    padding: '16px 20px',
  },
  questionLink: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--primary-color)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  questionMeta: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  answerCard: {
    padding: '24px',
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
    width: '48px',
    height: '48px',
    borderRadius: '50%',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  authorHeadline: {
    fontSize: '14px',
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
  answerContent: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: 'var(--text-primary)',
    whiteSpace: 'pre-wrap',
    marginBottom: '20px',
  },
  publishTime: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
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
  relatedAnswer: {
    display: 'block',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color)',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  relatedAnswerAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '6px',
    color: 'var(--text-primary)',
  },
  relatedAvatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
  },
  relatedAnswerPreview: {
    fontSize: '13px',
    lineHeight: '1.5',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  relatedAnswerStats: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  viewAllLink: {
    display: 'block',
    textAlign: 'center',
    padding: '12px 0',
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontSize: '14px',
    marginTop: '8px',
  },
  topicTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  topicTag: {
    display: 'inline-block',
  },
};

export default Answer;
