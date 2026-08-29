import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PostCard from '../components/Post/PostCard';
import './Pages.css';

export default function FavoritesPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  const favoritedPosts = Object.values(state.posts || {})
    .filter(p => p.isFavorited)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="page-content">
      <div className="card" style={{ borderRadius: '8px 8px 0 0', borderBottom: '1px solid var(--color-border)', marginBottom: 8 }}>
        <div className="page-header">收藏</div>
      </div>

      {favoritedPosts.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🔖</div>
          <p>还没有收藏的微博</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            点击微博右上角的 ··· 菜单，选择"收藏"来保存感兴趣的内容
          </p>
        </div>
      ) : (
        favoritedPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
}
