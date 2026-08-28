
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

const HotList: React.FC = () => {
  const questions = useStore(state => state.questions);

  const hotQuestions = [...questions]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 50);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>知乎热榜</h1>
        <div style={styles.updateTime}>更新于 {new Date().toLocaleTimeString()}</div>

        <div style={styles.list}>
          {hotQuestions.map((question, index) => (
            <Link
              key={question.questionId}
              to={`/question/${question.questionId}`}
              className="card hot-list-item"
              style={styles.hotItem}
            >
              <div style={{
                ...styles.rank,
                ...(index < 3 ? styles.rankTop : {})
              }}>
                {index + 1}
              </div>
              <div style={styles.content}>
                <div style={styles.hotTitle}>{question.title}</div>
                {question.description && (
                  <div style={styles.hotDesc}>
                    {question.description.length > 80
                      ? question.description.substring(0, 80) + '...'
                      : question.description}
                  </div>
                )}
                <div style={styles.hotMeta}>
                  <span>{(question.viewCount / 10000).toFixed(0)}万 热度</span>
                  <span style={styles.answerBadge}>{question.answerCount} 回答</span>
                </div>
              </div>
              {index < 10 && <div style={styles.hotBadge}>热</div>}
            </Link>
          ))}
        </div>
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
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  updateTime: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  hotItem: {
    padding: '20px',
    display: 'flex',
    gap: '16px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    position: 'relative',
    transition: 'background 0.2s',
  },
  rank: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    minWidth: '32px',
  },
  rankTop: {
    color: '#ec5e28',
  },
  content: {
    flex: 1,
  },
  hotTitle: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '8px',
    lineHeight: '1.5',
  },
  hotDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '8px',
  },
  hotMeta: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  answerBadge: {
    marginLeft: '8px',
    background: 'var(--tag-bg)',
    color: 'var(--primary-color)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  hotBadge: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: '#ec5e28',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
};

export default HotList;
  