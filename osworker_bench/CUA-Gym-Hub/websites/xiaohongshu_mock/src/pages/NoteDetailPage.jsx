import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import NoteDetailModal from '../components/NoteDetailModal.jsx';

export default function NoteDetailPage() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();

  if (!state) return <div className="loading-state">加载中...</div>;

  const note = state.notes?.[noteId];

  if (!note) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📝</div>
        <div className="empty-state-text">笔记不存在或已被删除</div>
      </div>
    );
  }

  return (
    <NoteDetailModal
      note={note}
      onClose={() => navigate(-1)}
    />
  );
}
