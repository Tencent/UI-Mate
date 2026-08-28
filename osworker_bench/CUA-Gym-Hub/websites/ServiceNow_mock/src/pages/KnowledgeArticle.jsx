import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getUserDisplayName } from '../utils/dataManager';
import { formatDistanceToNow } from 'date-fns';

export default function KnowledgeArticle() {
  const { state, dispatch } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';
  // Track vote in local state (key: articleId -> 'up'|'down'|null)
  const [voted, setVoted] = useState(null);

  const article = state.kbArticles.find(a => a.sys_id === id);

  // Increment view count on mount
  useEffect(() => {
    if (article) {
      dispatch({ type: 'INCREMENT_KB_VIEW', payload: id });
    }
  }, [id]);

  if (!article) return <div className="sn-page-body"><p>Article not found.</p></div>;

  const category = state.kbCategories.find(c => c.sys_id === article.category);

  const handleVote = (newVote) => {
    // Toggle: clicking the same vote again removes it
    const effectiveVote = voted === newVote ? null : newVote;
    const previousVote = voted;
    dispatch({ type: 'RATE_KB_ARTICLE', payload: { articleId: id, vote: effectiveVote, previousVote } });
    setVoted(effectiveVote);
  };

  // Get the up-to-date counts from state
  const currentArticle = state.kbArticles.find(a => a.sys_id === id) || article;
  const helpfulCount = currentArticle.helpful_count || 0;
  const notHelpfulCount = currentArticle.not_helpful_count || 0;

  return (
    <div className="sn-page">
      <div className="sn-breadcrumb">
        <a onClick={() => navigate('/' + sp)}>Home</a>
        <span className="sn-breadcrumb-sep">&gt;</span>
        <a onClick={() => navigate('/knowledge' + sp)}>Knowledge Base</a>
        <span className="sn-breadcrumb-sep">&gt;</span>
        {category && <><span>{category.label}</span><span className="sn-breadcrumb-sep">&gt;</span></>}
        <span>{article.short_description}</span>
      </div>
      <div className="sn-page-body" style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{article.short_description}</h1>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 20, display: 'flex', gap: 16 }}>
          <span>Article {article.number}</span>
          <span>By {getUserDisplayName(state.users, article.author)}</span>
          <span>{article.published ? formatDistanceToNow(new Date(article.published), { addSuffix: true }) : ''}</span>
          <span>{currentArticle.view_count} views</span>
        </div>
        <div className="sn-kb-article-body" dangerouslySetInnerHTML={{ __html: article.text }} />

        <div className="sn-kb-rating">
          <span style={{ fontSize: 13, color: '#666' }}>Was this helpful?</span>
          <button
            className={`sn-kb-rating-btn ${voted === 'up' ? 'active' : ''}`}
            onClick={() => handleVote('up')}
            title="Helpful"
          >
            {'\u{1F44D}'} {helpfulCount}
          </button>
          <button
            className={`sn-kb-rating-btn ${voted === 'down' ? 'active' : ''}`}
            onClick={() => handleVote('down')}
            title="Not Helpful"
          >
            {'\u{1F44E}'} {notHelpfulCount}
          </button>
          {voted && (
            <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
              {voted === 'up' ? 'Thanks for your feedback!' : 'Sorry this wasn\'t helpful.'}
            </span>
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          <a style={{ cursor: 'pointer' }} onClick={() => navigate('/knowledge' + sp)}>
            {'\u2190'} Back to Knowledge Base
          </a>
        </div>
      </div>
    </div>
  );
}
