import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getUserDisplayName } from '../utils/dataManager';
import { formatDistanceToNow } from 'date-fns';

export default function KnowledgeBase() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');

  const topCategories = state.kbCategories.filter(c => !c.parent_id && c.active);
  const childCategories = (parentId) => state.kbCategories.filter(c => c.parent_id === parentId && c.active);

  const articles = useMemo(() => {
    let list = state.kbArticles.filter(a => a.workflow_state === 'Published');
    if (selectedCategory) {
      const childCatIds = state.kbCategories.filter(c => c.parent_id === selectedCategory).map(c => c.sys_id);
      list = list.filter(a => a.category === selectedCategory || childCatIds.includes(a.category));
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter(a => a.short_description.toLowerCase().includes(q) || a.text.toLowerCase().includes(q));
    }
    return list;
  }, [state.kbArticles, state.kbCategories, selectedCategory, searchText]);

  const getArticleCount = (catId) => {
    const childIds = state.kbCategories.filter(c => c.parent_id === catId).map(c => c.sys_id);
    return state.kbArticles.filter(a => a.workflow_state === 'Published' && (a.category === catId || childIds.includes(a.category))).length;
  };

  const stripHtml = (html) => html.replace(/<[^>]*>/g, '');

  return (
    <div className="sn-page">
      <div className="sn-breadcrumb">
        <a onClick={() => navigate('/' + sp)}>Home</a>
        <span className="sn-breadcrumb-sep">&gt;</span>
        <span>Knowledge Base</span>
      </div>
      <div style={{ padding: '16px 24px 0' }}>
        <input
          className="sn-form-input"
          type="text"
          placeholder="Search knowledge articles..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ maxWidth: 500, fontSize: 14, padding: '8px 12px' }}
        />
      </div>
      <div className="sn-kb-layout">
        <div className="sn-kb-sidebar">
          <div className="sn-sidebar-section">
            <div className="sn-sidebar-section-title">KB Categories</div>
            <div
              className={`sn-kb-cat-tree-item ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              <span>All Articles</span>
              <span className="sn-kb-cat-badge">{state.kbArticles.filter(a => a.workflow_state === 'Published').length}</span>
            </div>
            {topCategories.map(cat => (
              <React.Fragment key={cat.sys_id}>
                <div
                  className={`sn-kb-cat-tree-item ${selectedCategory === cat.sys_id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.sys_id)}
                >
                  <span>{cat.label}</span>
                  <span className="sn-kb-cat-badge">{getArticleCount(cat.sys_id)}</span>
                </div>
                {childCategories(cat.sys_id).map(child => (
                  <div
                    key={child.sys_id}
                    className={`sn-kb-cat-tree-item child ${selectedCategory === child.sys_id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(child.sys_id)}
                  >
                    <span>{child.label}</span>
                    <span className="sn-kb-cat-badge">{child.article_count}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="sn-kb-main">
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            {selectedCategory ? state.kbCategories.find(c => c.sys_id === selectedCategory)?.label : 'All Articles'}
          </h2>
          {articles.length === 0 ? (
            <p style={{ color: '#999' }}>No articles found.</p>
          ) : (
            articles.map(article => (
              <div key={article.sys_id} className="sn-kb-article-card" onClick={() => navigate(`/knowledge/article/${article.sys_id}${sp}`)}>
                <div className="sn-kb-article-title">{article.short_description}</div>
                <div className="sn-kb-article-excerpt">{stripHtml(article.text).substring(0, 150)}...</div>
                <div className="sn-kb-article-meta">
                  <span>Authored by {getUserDisplayName(state.users, article.author)}</span>
                  <span>{article.published ? formatDistanceToNow(new Date(article.published), { addSuffix: true }) : ''}</span>
                  <span>{article.view_count} views</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
