import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Board from './pages/Board';
import Go from './pages/Go';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function MyWork() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const currentUser = state.users[state.currentUserId];
  const assignedItems = Object.values(state.items).filter(item => {
    const board = state.boards[item.boardId];
    if (!board || item.archivedAt) return false;
    if (item.creatorId === state.currentUserId) return true;
    return board.columnIds.some(columnId => {
      const column = state.columns[columnId];
      const value = item.columnValues?.[columnId]?.value;
      return column?.type === 'people' && Array.isArray(value) && value.includes(state.currentUserId);
    });
  });

  const grouped = assignedItems.reduce((acc, item) => {
    const board = state.boards[item.boardId];
    if (!board) return acc;
    if (!acc[board.id]) acc[board.id] = { board, items: [] };
    acc[board.id].items.push(item);
    return acc;
  }, {});

  const openItem = (item) => {
    dispatch({ type: 'SET_ACTIVE_BOARD', payload: { boardId: item.boardId } });
    dispatch({ type: 'SET_ITEM_DETAIL', payload: item.id });
    navigate(`/board/${item.boardId}`);
  };

  return (
    <div className="my-work-page">
      <div className="my-work-header">
        <h1>My Work</h1>
        <p>Items assigned to or created by {currentUser?.name || 'you'} across all boards</p>
      </div>
      {assignedItems.length === 0 ? (
        <div className="my-work-empty">You're all caught up.</div>
      ) : (
        Object.values(grouped).map(({ board, items }) => (
          <section key={board.id} className="my-work-section">
            <div className="my-work-section-title">
              <span className="my-work-board-dot" />
              {board.name}
              <span>{items.length}</span>
            </div>
            <div className="my-work-list">
              {items.map(item => {
                const group = state.groups[item.groupId];
                const statusColumnId = board.columnIds.find(id => state.columns[id]?.type === 'status');
                const status = statusColumnId ? state.columns[statusColumnId]?.settings?.labels?.[item.columnValues?.[statusColumnId]?.value] : null;
                const dateColumnId = board.columnIds.find(id => state.columns[id]?.type === 'date');
                const dueDate = dateColumnId ? item.columnValues?.[dateColumnId]?.value : null;
                return (
                  <button key={item.id} className="my-work-row" onClick={() => openItem(item)}>
                    <span className="my-work-row-name">{item.name || '(unnamed)'}</span>
                    <span className="my-work-row-group" style={{ color: group?.color }}>{group?.title}</span>
                    {status && <span className="my-work-status" style={{ background: status.color }}>{status.text}</span>}
                    <span className="my-work-date">{dueDate ? new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/go" element={<Go />} />
          <Route path="*" element={
            <div className="app-layout">
              <Sidebar />
              <div className="main-content">
                <Routes>
                  <Route path="/" element={<RedirectWithQuery to="/board/board-1" />} />
                  <Route path="/board/:boardId" element={<Board />} />
                  <Route path="/my-work" element={<MyWork />} />
                </Routes>
              </div>
            </div>
          } />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
