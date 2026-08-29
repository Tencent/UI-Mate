import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp, ACTIONS } from '../context/AppContext.jsx';
import { CheckSquare, Check } from 'lucide-react';
import { timeAgo } from '../utils/dataManager.js';

export default function Todos() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('pending');

  const todos = state.todos.filter(t => t.userId === state.currentUser.id && (tab === 'pending' ? !t.isDone : t.isDone));
  const pendingCount = state.todos.filter(t => t.userId === state.currentUser.id && !t.isDone).length;
  const getProject = id => state.projects.find(p => p.id === id);

  const handleDone = (id) => dispatch({ type: ACTIONS.MARK_TODO_DONE, payload: { todoId: id } });
  const handleDoneAll = () => dispatch({ type: ACTIONS.MARK_ALL_TODOS_DONE });

  const typeIcon = { assigned: '👤', mentioned: '💬', review_requested: '👁️' };

  const handleClick = (todo) => {
    const proj = getProject(todo.projectId);
    if (!proj) return;
    if (todo.targetType === 'issue') {
      const issue = state.issues.find(i => i.id === todo.targetId);
      if (issue) navigate(`/${proj.fullPath}/-/issues/${issue.iid}`);
    } else if (todo.targetType === 'merge_request') {
      const mr = state.mergeRequests.find(m => m.id === todo.targetId);
      if (mr) navigate(`/${proj.fullPath}/-/merge_requests/${mr.iid}`);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckSquare size={22} style={{ color: 'var(--gl-purple)' }} />
          Todos
          {pendingCount > 0 && <span style={{ fontSize: 14, background: 'var(--gl-danger)', color: '#fff', borderRadius: 10, padding: '2px 8px' }}>{pendingCount}</span>}
        </h1>
        {tab === 'pending' && pendingCount > 0 && (
          <button className="gl-btn gl-btn-secondary" onClick={handleDoneAll}>
            <Check size={14} /> Mark all as done
          </button>
        )}
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--gl-border)', marginBottom: 16 }}>
        {['pending', 'done'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--gl-purple)' : 'transparent'}`, cursor: 'pointer', fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--gl-purple)' : 'var(--gl-text-secondary)', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {todos.length === 0 ? (
        <div className="gl-empty-state">
          <CheckSquare size={48} style={{ color: 'var(--gl-success)' }} />
          <div className="gl-empty-state-title">{tab === 'pending' ? "You're all caught up!" : 'No completed todos'}</div>
          <div className="gl-empty-state-desc">{tab === 'pending' ? 'No pending todos.' : 'Completed todos will appear here.'}</div>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--gl-border)', borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
          {todos.map((todo, i) => {
            const proj = getProject(todo.projectId);
            return (
              <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < todos.length - 1 ? '1px solid var(--gl-border-light)' : 'none' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{typeIcon[todo.type] || '📌'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button onClick={() => handleClick(todo)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: 13, fontWeight: 500, color: 'var(--gl-text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--gl-purple)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--gl-text-primary)'}
                  >
                    {todo.message}
                  </button>
                  <div style={{ fontSize: 12, color: 'var(--gl-text-secondary)', marginTop: 2 }}>
                    {proj?.name} · {timeAgo(todo.createdAt)}
                  </div>
                </div>
                {!todo.isDone && (
                  <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => handleDone(todo.id)}>
                    <Check size={12} /> Done
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
