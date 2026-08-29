
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

const Topic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const topics = useStore(state => state.topics);
  const questions = useStore(state => state.questions);
  const userFollowedTopics = useStore(state => state.userFollowedTopics);
  const toggleFollowTopic = useStore(state => state.toggleFollowTopic);
  
  const topic = topics.find(t => t.topicId === id);
  const topicQuestions = questions.filter(q => q.topics.includes(id || ''));
  const isFollowed = userFollowedTopics[id || ''];
  
  if (!topic) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>话题不存在</div>;
  }
  
  return (
    <div style={styles.page}>
      <div className="card" style={styles.header}>
        <img src={topic.icon} alt="" style={styles.icon} />
        <div style={styles.info}>
          <h1 style={styles.name}>{topic.name}</h1>
          <div style={styles.description}>{topic.description}</div>
          <div style={styles.meta}>
            <span>{(topic.followerCount / 10000).toFixed(0)}万 关注</span>
            <span style={{marginLeft: '16px'}}>{topic.questionCount.toLocaleString()} 问题</span>
          </div>
          <button
            style={{...styles.followBtn, ...(isFollowed ? styles.followBtnActive : {})}}
            onClick={() => toggleFollowTopic(topic.topicId)}
          >
            {isFollowed ? '✓ 已关注' : '+ 关注话题'}
          </button>
        </div>
      </div>
      
      <div style={styles.container}>
        <main style={styles.main}>
          <div style={styles.questionsList}>
            {topicQuestions.map(question => (
              <div key={question.questionId} className="card" style={styles.questionCard}>
                <Link to={`/question/${question.questionId}`} style={styles.questionTitle}>
                  {question.title}
                </Link>
                <div style={styles.questionDesc}>{question.description}</div>
                <div style={styles.questionStats}>
                  <span>{question.answerCount} 回答</span>
                  <span style={{marginLeft: '16px'}}>{question.followerCount} 关注</span>
                  <span style={{marginLeft: '16px'}}>{question.viewCount.toLocaleString()} 浏览</span>
                </div>
              </div>
            ))}
          </div>
        </main>
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
  header: {
    maxWidth: '1000px',
    margin: '0 auto 20px',
    padding: '24px',
    display: 'flex',
    gap: '20px',
  },
  icon: {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
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
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  followBtnActive: {
    background: 'var(--primary-color)',
    color: 'white',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 20px',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  questionCard: {
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
  questionDesc: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  questionStats: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
};

export default Topic;
  