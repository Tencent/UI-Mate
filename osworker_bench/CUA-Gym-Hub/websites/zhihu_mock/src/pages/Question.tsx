
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Answer } from '../types';
import CommentSection from '../components/CommentSection';
import FavoriteButton from '../components/FavoriteButton';

const Question: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const questions = useStore(state => state.questions);
  const answers = useStore(state => state.answers);
  const users = useStore(state => state.users);
  const topics = useStore(state => state.topics);
  const currentUser = useStore(state => state.currentUser);
  const userVoteups = useStore(state => state.userVoteups);
  const userFavorites = useStore(state => state.userFavorites);
  const userFollowedQuestions = useStore(state => state.userFollowedQuestions);
  const toggleVoteup = useStore(state => state.toggleVoteup);
  const toggleFollowQuestion = useStore(state => state.toggleFollowQuestion);
  const toggleThankAnswer = useStore(state => state.toggleThankAnswer);
  const addAnswer = useStore(state => state.addAnswer);
  const updateQuestionAnswerCount = useStore(state => state.updateQuestionAnswerCount);

  const [showEditor, setShowEditor] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [sortMode, setSortMode] = useState<'default' | 'time'>('default');

  const question = questions.find(q => q.questionId === id);
  const baseAnswers = answers.filter(a => a.questionId === id);
  const questionAnswers = sortMode === 'time'
    ? [...baseAnswers].sort((a, b) => b.createdTime - a.createdTime)
    : [...baseAnswers].sort((a, b) => b.voteupCount - a.voteupCount);

  if (!question) {
    return <div style={styles.page}>问题不存在</div>;
  }

  const isFollowed = userFollowedQuestions[question.questionId];

  const handleWriteAnswer = () => {
    setShowEditor(true);
  };

  const handleSubmitAnswer = () => {
    if (answerContent.trim().length < 10) return;

    const now = Date.now();
    const newAnswer: Answer = {
      answerId: 'a_' + now,
      questionId: question.questionId,
      authorId: currentUser.userId,
      content: answerContent.trim(),
      createdTime: now,
      updatedTime: now,
      voteupCount: 0,
      commentCount: 0,
      favoriteCount: 0,
      thankCount: 0,
    };

    addAnswer(newAnswer);
    updateQuestionAnswerCount(question.questionId);
    setAnswerContent('');
    setShowEditor(false);
    setToastMsg('回答已发布');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <main style={styles.main}>
          <div className="card" style={styles.questionCard}>
            <h1 style={styles.questionTitle}>{question.title}</h1>
            <div style={styles.questionDesc}>{question.description}</div>

            <div style={styles.questionMeta}>
              <span>{question.followerCount} 人关注</span>
              <span style={{marginLeft: '16px'}}>{question.viewCount.toLocaleString()} 次浏览</span>
            </div>

            <div style={styles.questionTopics}>
              {question.topics.map(topicId => {
                const topic = topics.find(t => t.topicId === topicId);
                return topic ? (
                  <Link key={topicId} to={`/topic/${topicId}`} className="tag">
                    {topic.name}
                  </Link>
                ) : null;
              })}
            </div>

            <div style={styles.questionActions}>
              <button
                style={{...styles.actionBtn, ...(isFollowed ? styles.actionBtnActive : {})}}
                onClick={() => toggleFollowQuestion(question.questionId)}
              >
                {isFollowed ? '✓ 已关注' : '+ 关注问题'}
              </button>
              <button style={styles.actionBtn} onClick={() => {
                const msg = '请选择要邀请回答的用户（演示功能）';
                setToastMsg(msg);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
              }}>邀请回答</button>              <button
                style={{...styles.actionBtn, ...styles.writeBtn}}
                onClick={handleWriteAnswer}
              >
                写回答
              </button>
            </div>
          </div>

          {/* Inline Answer Editor */}
          {showEditor && (
            <div className="card" style={styles.editorCard}>
              <div style={styles.editorAuthorRow}>
                <img src={currentUser.avatar} alt="" style={styles.editorAvatar} />
                <div>
                  <div style={styles.editorAuthorName}>{currentUser.nickname}</div>
                  <div style={styles.editorAuthorHeadline}>{currentUser.headline}</div>
                </div>
              </div>
              <textarea
                placeholder="写下你的回答..."
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                style={styles.editorTextarea}
              />
              <div style={styles.editorFooter}>
                <span style={styles.editorCharCount}>
                  {answerContent.length} 字
                  {answerContent.trim().length < 10 && answerContent.trim().length > 0 && (
                    <span style={styles.editorCharWarn}>（至少10字）</span>
                  )}
                </span>
                <div style={styles.editorButtons}>
                  <button
                    style={styles.editorCancelBtn}
                    onClick={() => { setShowEditor(false); setAnswerContent(''); }}
                  >
                    取消
                  </button>
                  <button
                    style={{
                      ...styles.editorSubmitBtn,
                      ...(answerContent.trim().length >= 10 ? {} : styles.editorSubmitBtnDisabled),
                    }}
                    disabled={answerContent.trim().length < 10}
                    onClick={handleSubmitAnswer}
                  >
                    提交回答
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={styles.answersHeader}>
            <h2 style={styles.answersTitle}>{questionAnswers.length} 个回答</h2>
            <div style={styles.sortButtons}>
              <button
                style={{ ...styles.sortBtn, ...(sortMode === 'default' ? styles.sortBtnActive : {}) }}
                onClick={() => setSortMode('default')}
              >
                默认排序
              </button>
              <button
                style={{ ...styles.sortBtn, ...(sortMode === 'time' ? styles.sortBtnActive : {}) }}
                onClick={() => setSortMode('time')}
              >
                按时间
              </button>
            </div>
          </div>

          {questionAnswers.map(answer => {
            const author = users.find(u => u.userId === answer.authorId);
            if (!author) return null;

            const isVoted = userVoteups[answer.answerId];
            const isFavorited = userFavorites[answer.answerId];
            const isThanked = !!userVoteups[`thank_${answer.answerId}`];

            return (
              <div key={answer.answerId} className="card" style={styles.answerCard}>
                <Link to={`/user/${author.userId}`} style={styles.authorLink}>
                  <img src={author.avatar} alt="" style={styles.authorAvatar} />
                  <div>
                    <div style={styles.authorName}>{author.nickname}</div>
                    <div style={styles.authorHeadline}>{author.headline}</div>
                  </div>
                </Link>

                <div style={styles.answerContent}>{answer.content}</div>

                <div style={styles.answerActions}>
                  <button
                    style={{...styles.answerActionBtn, ...(isVoted ? styles.answerActionBtnActive : {})}}
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
                    style={{...styles.answerActionBtn, ...(isThanked ? styles.answerActionBtnActive : {})}}
                    onClick={() => toggleThankAnswer(answer.answerId)}
                  >
                    ❤️ 感谢 {answer.thankCount > 0 ? answer.thankCount : ''}
                  </button>
                  <button style={styles.answerActionBtn}>🔗 分享</button>
                </div>
              </div>
            );
          })}
        </main>

        <aside style={styles.sidebar}>
          <div className="card" style={styles.sideCard}>
            <div style={styles.sideCardTitle}>相关问题</div>
            {questions.slice(0, 5).filter(q => q.questionId !== id).map(q => (
              <Link key={q.questionId} to={`/question/${q.questionId}`} style={styles.relatedQuestion}>
                {q.title}
              </Link>
            ))}
          </div>
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
    padding: '24px',
  },
  questionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  questionDesc: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  questionMeta: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
  },
  questionTopics: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  },
  questionActions: {
    display: 'flex',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
  },
  actionBtn: {
    padding: '8px 16px',
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionBtnActive: {
    background: 'var(--primary-color)',
    color: 'white',
    borderColor: 'var(--primary-color)',
  },
  writeBtn: {
    background: 'var(--primary-color)',
    color: 'white',
    borderColor: 'var(--primary-color)',
  },
  // Editor styles
  editorCard: {
    padding: '20px',
  },
  editorAuthorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  editorAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
  },
  editorAuthorName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  editorAuthorHeadline: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  editorTextarea: {
    width: '100%',
    minHeight: '200px',
    padding: '12px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '15px',
    lineHeight: '1.8',
    color: 'var(--text-primary)',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
  },
  editorFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
  },
  editorCharCount: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  editorCharWarn: {
    color: 'var(--danger-color)',
    fontSize: '12px',
    marginLeft: '4px',
  },
  editorButtons: {
    display: 'flex',
    gap: '8px',
  },
  editorCancelBtn: {
    padding: '8px 16px',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  editorSubmitBtn: {
    padding: '8px 20px',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  editorSubmitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // Answers section
  answersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
  },
  answersTitle: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  sortButtons: {
    display: 'flex',
    gap: '8px',
  },
  sortBtn: {
    padding: '6px 12px',
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    color: 'var(--text-secondary)',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  sortBtnActive: {
    background: 'var(--primary-color)',
    color: 'white',
    borderColor: 'var(--primary-color)',
  },
  answerCard: {
    padding: '20px',
  },
  authorLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  authorAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
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
  answerContent: {
    fontSize: '15px',
    lineHeight: '1.8',
    color: 'var(--text-primary)',
    marginBottom: '20px',
    whiteSpace: 'pre-wrap',
  },
  answerActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
  },
  answerActionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  answerActionBtnActive: {
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
  relatedQuestion: {
    display: 'block',
    padding: '12px 0',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontSize: '14px',
    borderBottom: '1px solid var(--border-color)',
  },
};

export default Question;
