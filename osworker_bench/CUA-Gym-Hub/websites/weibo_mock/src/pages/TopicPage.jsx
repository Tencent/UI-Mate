import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PostCard from '../components/Post/PostCard';
import { formatCount } from '../utils/helpers';
import './Pages.css';

export default function TopicPage() {
  const { topicId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const topic = state.topics?.[topicId];
  const followedTopics = state.followedTopics || [];
  const isFollowed = followedTopics.includes(topicId);

  if (!topic) {
    return (
      <div className="empty-state card">
        <div className="empty-state-icon">🏷️</div>
        <p>话题不存在</p>
      </div>
    );
  }

  const topicPosts = Object.values(state.posts || {})
    .filter(p => (p.topicIds || []).includes(topicId) || p.text.includes(topic.name))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleFollowToggle = () => {
    if (isFollowed) {
      dispatch({ type: 'UNFOLLOW_TOPIC', topicId });
    } else {
      dispatch({ type: 'FOLLOW_TOPIC', topicId });
    }
  };

  return (
    <div className="page-content">
      {/* Topic Header */}
      <div className="card" style={{ padding: 20, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: 8 }}>
              #{topic.name}#
              {topic.isSuperTopic && (
                <span style={{
                  fontSize: 12, background: 'var(--color-primary)', color: 'white',
                  padding: '2px 8px', borderRadius: 10, marginLeft: 8
                }}>超话</span>
              )}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 12 }}>
              {topic.description}
            </p>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--color-text-secondary)' }}>
              <span>{formatCount(topic.readCount)} 阅读</span>
              <span>{formatCount(topic.discussionCount)} 讨论</span>
            </div>
          </div>
          <button
            className={`btn ${isFollowed ? 'btn-secondary' : 'btn-outline'}`}
            onClick={handleFollowToggle}
          >
            {isFollowed ? '已关注' : '关注话题'}
          </button>
        </div>
      </div>

      {/* Posts */}
      {topicPosts.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📝</div>
          <p>暂无相关微博</p>
        </div>
      ) : (
        topicPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
}
