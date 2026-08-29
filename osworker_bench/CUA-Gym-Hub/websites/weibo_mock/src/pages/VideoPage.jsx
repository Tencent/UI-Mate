import { useApp } from '../context/AppContext';
import PostCard from '../components/Post/PostCard';
import './Pages.css';

export default function VideoPage() {
  const { state } = useApp();

  const videoPosts = Object.values(state.posts || {})
    .filter(p => p.video || (p.text && p.text.includes('视频')))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="page-content">
      <div className="card" style={{ borderRadius: '8px 8px 0 0', borderBottom: '1px solid var(--color-border)', marginBottom: 8 }}>
        <div className="page-header">视频</div>
      </div>

      {videoPosts.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🎬</div>
          <p>暂无视频内容</p>
        </div>
      ) : (
        videoPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
}
