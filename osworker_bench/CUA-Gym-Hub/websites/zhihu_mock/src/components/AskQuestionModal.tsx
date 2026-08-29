import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Question } from '../types';

interface AskQuestionModalProps {
  onClose: () => void;
}

const AskQuestionModal: React.FC<AskQuestionModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const currentUser = useStore(state => state.currentUser);
  const topics = useStore(state => state.topics);
  const addQuestion = useStore(state => state.addQuestion);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      }
      if (prev.length >= 5) return prev;
      return [...prev, topicId];
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const now = Date.now();
    const newQuestion: Question = {
      questionId: 'q_' + now,
      title: title.trim(),
      description: description.trim(),
      topics: selectedTopics,
      authorId: currentUser.userId,
      createdTime: now,
      updatedTime: now,
      followerCount: 0,
      viewCount: 0,
      answerCount: 0,
    };

    addQuestion(newQuestion);
    setShowToast(true);

    setTimeout(() => {
      onClose();
      navigate(`/question/${newQuestion.questionId}`);
    }, 500);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleBackdropClick}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>提问</h2>
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div style={styles.body}>
          <input
            type="text"
            placeholder="输入问题标题（最多50个字）"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 50))}
            maxLength={50}
            style={styles.titleInput}
          />
          <div style={styles.charCount}>{title.length}/50</div>

          <textarea
            placeholder="问题补充说明（可选）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.descTextarea}
          />

          <div style={styles.topicSection}>
            <div style={styles.topicLabel}>选择话题（最多5个）</div>
            <div style={styles.topicGrid}>
              {topics.map(topic => {
                const isSelected = selectedTopics.includes(topic.topicId);
                return (
                  <button
                    key={topic.topicId}
                    onClick={() => toggleTopic(topic.topicId)}
                    className="tag"
                    style={{
                      ...styles.topicChip,
                      ...(isSelected ? styles.topicChipSelected : {}),
                    }}
                  >
                    {topic.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>取消</button>
          <button
            style={{
              ...styles.submitBtn,
              ...(title.trim() ? {} : styles.submitBtnDisabled),
            }}
            disabled={!title.trim()}
            onClick={handleSubmit}
          >
            发布问题
          </button>
        </div>
      </div>

      {showToast && (
        <div className="toast">问题已发布</div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    width: '640px',
    maxHeight: '80vh',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 16px',
    borderBottom: '1px solid var(--border-color)',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: 'var(--text-secondary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '50%',
    transition: 'background 0.2s',
  },
  body: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  titleInput: {
    width: '100%',
    padding: '12px 0',
    border: 'none',
    borderBottom: '2px solid var(--border-color)',
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    outline: 'none',
    background: 'transparent',
  },
  charCount: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    textAlign: 'right',
    marginTop: '4px',
    marginBottom: '16px',
  },
  descTextarea: {
    width: '100%',
    height: '120px',
    padding: '12px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '15px',
    color: 'var(--text-primary)',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.6',
  },
  topicSection: {
    marginTop: '20px',
  },
  topicLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  topicGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  topicChip: {
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.2s',
  },
  topicChipSelected: {
    background: 'var(--primary-color)',
    color: 'white',
    borderColor: 'var(--primary-color)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderTop: '1px solid var(--border-color)',
  },
  cancelBtn: {
    padding: '8px 20px',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '8px 24px',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default AskQuestionModal;
