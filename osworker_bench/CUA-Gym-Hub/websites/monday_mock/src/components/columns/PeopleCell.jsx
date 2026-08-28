import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function PeopleCell({ column, item, value }) {
  const { state, dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const cellRef = useRef(null);
  const selectedIds = value?.value || [];
  const users = state.users;

  const handleToggleUser = (userId) => {
    const newValue = selectedIds.includes(userId)
      ? selectedIds.filter(id => id !== userId)
      : [...selectedIds, userId];
    dispatch({ type: 'UPDATE_COLUMN_VALUE', payload: { itemId: item.id, columnId: column.id, newValue } });
  };

  const rect = cellRef.current?.getBoundingClientRect();

  return (
    <>
      <div ref={cellRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }} onClick={() => setOpen(true)}>
        {selectedIds.length > 0 ? (
          <div className="people-cell-avatars">
            {selectedIds.map(uid => {
              const user = users[uid];
              if (!user) return null;
              return (
                <div
                  key={uid}
                  className="people-cell-avatar"
                  style={{ background: user.color }}
                  title={user.name}
                >
                  {user.initials}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="people-cell-empty">+</div>
        )}
      </div>
      {open && (
        <>
          <div className="popover-overlay" onClick={() => setOpen(false)} />
          <div
            className="popover people-popover"
            style={{
              top: rect ? rect.bottom + 4 : 0,
              left: rect ? rect.left - 60 : 0,
            }}
          >
            <div className="people-popover-list">
              {Object.values(users).map(user => (
                <div
                  key={user.id}
                  className="people-popover-item"
                  onClick={() => handleToggleUser(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    readOnly
                  />
                  <div
                    className="people-popover-avatar"
                    style={{ background: user.color }}
                  >
                    {user.initials}
                  </div>
                  <span className="people-popover-name">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
