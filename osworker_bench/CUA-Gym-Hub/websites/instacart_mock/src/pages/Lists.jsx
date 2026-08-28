import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Lists() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const [newItemName, setNewItemName] = useState('');

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    dispatch({ type: ACTION_TYPES.CREATE_LIST, payload: newListName.trim() });
    setNewListName('');
  };

  const handleAddItem = (e, listId) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    dispatch({ type: ACTION_TYPES.ADD_TO_LIST, payload: { listId, name: newItemName.trim(), quantity: 1 } });
    setNewItemName('');
  };

  const activeList = selectedList ? state.shoppingLists.find(l => l.id === selectedList) : null;

  return (
    <div className="page-content">
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Shopping Lists</h1>

      {!selectedList ? (
        <>
          <form onSubmit={handleCreateList} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input type="text" placeholder="Create a new list..." value={newListName} onChange={(e) => setNewListName(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontSize: 14 }} />
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>Create List</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {state.shoppingLists.map(list => (
              <div key={list.id} className="list-card" onClick={() => setSelectedList(list.id)}>
                <div className="list-card-name">{list.name}</div>
                <div className="list-card-meta">
                  {list.items.length} items &middot; {list.items.filter(i => i.checked).length} completed
                </div>
              </div>
            ))}
          </div>
          {state.shoppingLists.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>&#x1F4DD;</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No lists yet</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>Create a shopping list to get started</p>
            </div>
          )}
        </>
      ) : (
        <>
          <button style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 16 }} onClick={() => setSelectedList(null)}>
            &#x2190; Back to Lists
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{activeList?.name}</h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="btn-primary" style={{ width: 'auto', padding: '8px 18px', fontSize: 14 }}
                onClick={() => {
                  const itemsToAdd = activeList?.items.filter(i => !i.checked && i.productId) || [];
                  itemsToAdd.forEach(item => {
                    const existingCartItem = state.cart.find(ci => ci.productId === item.productId);
                    if (!existingCartItem) {
                      dispatch({ type: ACTION_TYPES.ADD_TO_CART, payload: { productId: item.productId, storeId: state.selectedStoreId, quantity: item.quantity } });
                    }
                  });
                }}>
                Add All to Cart
              </button>
              <button style={{ color: 'var(--color-red)', fontSize: 14, fontWeight: 600 }} onClick={() => { dispatch({ type: ACTION_TYPES.DELETE_LIST, payload: selectedList }); setSelectedList(null); }}>Delete List</button>
            </div>
          </div>

          <form onSubmit={(e) => handleAddItem(e, selectedList)} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input type="text" placeholder="Add an item..." value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
              style={{ flex: 1, padding: '10px 16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontSize: 14 }} />
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Add Item</button>
          </form>

          {activeList?.items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', marginBottom: 8 }}>
              <input type="checkbox" checked={item.checked} onChange={() => dispatch({ type: ACTION_TYPES.TOGGLE_LIST_ITEM, payload: { listId: selectedList, itemId: item.id } })}
                style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }} />
              <span style={{ flex: 1, textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', fontWeight: 500 }}>
                {item.name}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>x{item.quantity}</span>
              <button style={{ color: 'var(--color-text-secondary)', fontSize: 16 }} onClick={() => dispatch({ type: ACTION_TYPES.REMOVE_FROM_LIST, payload: { listId: selectedList, itemId: item.id } })}>
                &#x2715;
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
