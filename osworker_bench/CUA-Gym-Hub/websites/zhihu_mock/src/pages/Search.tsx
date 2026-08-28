
import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

type SearchTab = 'all' | 'questions' | 'users' | 'topics' | 'articles';

const TAB_LABELS: { key: SearchTab; label: string }[] = [
  { key: 'all', label: '综合' },
  { key: 'questions', label: '问题' },
  { key: 'users', label: '用户' },
  { key: 'topics', label: '话题' },
  { key: 'articles', label: '文章' },
];

/**
 * Highlight query text in a string by wrapping matches in <mark> tags.
 */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: '#fff2cc', padding: 0 }}>{part}</mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const questions = useStore(state => state.questions);
  const users = useStore(state => state.users);
  const topics = useStore(state => state.topics);
  const articles = useStore(state => state.articles);

  const [activeTab, setActiveTab] = useState<SearchTab>('all');

  const filteredQuestions = useMemo(() =>
    questions.filter(q =>
      q.title.toLowerCase().includes(query.toLowerCase()) ||
      q.description.toLowerCase().includes(query.toLowerCase())
    ), [questions, query]);

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.nickname.toLowerCase().includes(query.toLowerCase()) ||
      u.headline.toLowerCase().includes(query.toLowerCase())
    ), [users, query]);

  const filteredTopics = useMemo(() =>
    topics.filter(t =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
    ), [topics, query]);

  const filteredArticles = useMemo(() =>
    articles.filter(a =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.content.toLowerCase().includes(query.toLowerCase())
    ), [articles, query]);

  const totalResults = filteredQuestions.length + filteredUsers.length + filteredTopics.length + filteredArticles.length;

  const hasResults = (tab: SearchTab): boolean => {
    switch (tab) {
      case 'all': return totalResults > 0;
      case 'questions': return filteredQuestions.length > 0;
      case 'users': return filteredUsers.length > 0;
      case 'topics': return filteredTopics.length > 0;
      case 'articles': return filteredArticles.length > 0;
    }
  };

  const renderQuestionResults = (items: typeof filteredQuestions) => (
    <>
      {items.map(question => (
        <div key={question.questionId} className="card" style={styles.resultCard}>
          <Link to={`/question/${question.questionId}`} style={styles.resultTitle}>
            {highlightText(question.title, query)}
          </Link>
          <div style={styles.resultDesc}>
            {highlightText(question.description.substring(0, 150), query)}
          </div>
          <div style={styles.resultMeta}>
            {question.answerCount} 回答 · {question.followerCount} 关注
          </div>
        </div>
      ))}
    </>
  );

  const renderUserResults = (items: typeof filteredUsers) => (
    <>
      {items.map(user => (
        <div key={user.userId} className="card" style={styles.resultCard}>
          <Link to={`/user/${user.userId}`} style={styles.userResult}>
            <img src={user.avatar} alt="" style={styles.userAvatar} />
            <div>
              <div style={styles.userName}>{highlightText(user.nickname, query)}</div>
              <div style={styles.userHeadline}>{highlightText(user.headline, query)}</div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );

  const renderTopicResults = (items: typeof filteredTopics) => (
    <>
      {items.map(topic => (
        <div key={topic.topicId} className="card" style={styles.resultCard}>
          <Link to={`/topic/${topic.topicId}`} style={styles.topicResult}>
            <img src={topic.icon} alt="" style={styles.topicIcon} />
            <div>
              <div style={styles.topicName}>{highlightText(topic.name, query)}</div>
              <div style={styles.topicDesc}>{highlightText(topic.description.substring(0, 100), query)}</div>
              <div style={styles.topicFollowers}>{(topic.followerCount / 10000).toFixed(0)}万 关注</div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );

  const renderArticleResults = (items: typeof filteredArticles) => (
    <>
      {items.map(article => (
        <div key={article.articleId} className="card" style={styles.resultCard}>
          <div style={styles.articleResult}>
            {article.coverImage && (
              <img src={article.coverImage} alt="" style={styles.articleCover} />
            )}
            <div style={styles.articleInfo}>
              <Link to={`/article/${article.articleId}`} style={styles.resultTitle}>
                {highlightText(article.title, query)}
              </Link>
              <div style={styles.resultDesc}>
                {highlightText(article.content.substring(0, 150), query)}
              </div>
              <div style={styles.resultMeta}>
                👁 {article.viewCount} · 👍 {article.voteupCount} · 💬 {article.commentCount}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );

  const renderContent = () => {
    if (!hasResults(activeTab)) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <div style={styles.emptyTitle}>没有找到相关结果</div>
          <div style={styles.emptySuggestion}>换个关键词试试？</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'all':
        return (
          <>
            {filteredQuestions.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>问题</h2>
                {renderQuestionResults(filteredQuestions.slice(0, 3))}
                {filteredQuestions.length > 3 && (
                  <button
                    style={styles.showMoreBtn}
                    onClick={() => setActiveTab('questions')}
                  >
                    查看更多问题 →
                  </button>
                )}
              </div>
            )}
            {filteredUsers.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>用户</h2>
                {renderUserResults(filteredUsers.slice(0, 3))}
                {filteredUsers.length > 3 && (
                  <button
                    style={styles.showMoreBtn}
                    onClick={() => setActiveTab('users')}
                  >
                    查看更多用户 →
                  </button>
                )}
              </div>
            )}
            {filteredTopics.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>话题</h2>
                {renderTopicResults(filteredTopics.slice(0, 3))}
                {filteredTopics.length > 3 && (
                  <button
                    style={styles.showMoreBtn}
                    onClick={() => setActiveTab('topics')}
                  >
                    查看更多话题 →
                  </button>
                )}
              </div>
            )}
            {filteredArticles.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>文章</h2>
                {renderArticleResults(filteredArticles.slice(0, 3))}
                {filteredArticles.length > 3 && (
                  <button
                    style={styles.showMoreBtn}
                    onClick={() => setActiveTab('articles')}
                  >
                    查看更多文章 →
                  </button>
                )}
              </div>
            )}
          </>
        );
      case 'questions':
        return renderQuestionResults(filteredQuestions);
      case 'users':
        return renderUserResults(filteredUsers);
      case 'topics':
        return renderTopicResults(filteredTopics);
      case 'articles':
        return renderArticleResults(filteredArticles);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>搜索：{query}</h1>

        <div style={styles.tabs}>
          {TAB_LABELS.map(({ key, label }) => {
            const count = key === 'all' ? totalResults
              : key === 'questions' ? filteredQuestions.length
              : key === 'users' ? filteredUsers.length
              : key === 'topics' ? filteredTopics.length
              : filteredArticles.length;

            return (
              <button
                key={key}
                style={{
                  ...styles.tab,
                  ...(activeTab === key ? styles.tabActive : {}),
                }}
                onClick={() => setActiveTab(key)}
              >
                {label}
                <span style={styles.tabCount}>{count}</span>
              </button>
            );
          })}
        </div>

        <div style={styles.results}>
          {renderContent()}
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
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '24px',
    background: 'var(--bg-color)',
    borderRadius: '4px 4px 0 0',
    padding: '0 16px',
  },
  tab: {
    padding: '12px 16px',
    border: 'none',
    borderBottom: '2px solid transparent',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tabActive: {
    color: 'var(--primary-color)',
    borderBottomColor: 'var(--primary-color)',
    fontWeight: '500',
  },
  tabCount: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    background: 'var(--bg-secondary)',
    padding: '1px 6px',
    borderRadius: '10px',
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  resultCard: {
    padding: '20px',
    marginBottom: '12px',
  },
  resultTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '8px',
    lineHeight: '1.5',
  },
  resultDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '8px',
  },
  resultMeta: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  userResult: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '4px',
  },
  userHeadline: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  topicResult: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  topicIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
  },
  topicName: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '4px',
  },
  topicDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  topicFollowers: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  articleResult: {
    display: 'flex',
    gap: '16px',
  },
  articleCover: {
    width: '120px',
    height: '80px',
    borderRadius: '4px',
    objectFit: 'cover' as const,
    flexShrink: 0,
  },
  articleInfo: {
    flex: 1,
    minWidth: 0,
  },
  showMoreBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary-color)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '12px 0',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    color: 'var(--text-primary)',
    fontWeight: '500',
    marginBottom: '8px',
  },
  emptySuggestion: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
};

export default Search;
