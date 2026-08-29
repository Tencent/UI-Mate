
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Collection } from '../types';

interface CollectionPickerProps {
  itemId: string;
  itemType: 'answer' | 'article' | 'idea';
  onClose: () => void;
}

const CollectionPicker: React.FC<CollectionPickerProps> = ({ itemId, itemType, onClose }) => {
  const collections = useStore(state => state.collections);
  const addItemToCollection = useStore(state => state.addItemToCollection);
  const removeItemFromCollection = useStore(state => state.removeItemFromCollection);
  const createCollection = useStore(state => state.createCollection);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrivacy, setNewPrivacy] = useState<'public' | 'private'>('private');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const isItemInCollection = (col: Collection) => col.itemIds.includes(itemId);

  const handleToggleCollection = (col: Collection) => {
    if (isItemInCollection(col)) {
      removeItemFromCollection(col.collectionId, itemId);
      showToastBriefly('已从收藏夹移除');
    } else {
      addItemToCollection(col.collectionId, itemId, itemType);
      showToastBriefly('已收藏');
    }
  };

  const handleCreateCollection = () => {
    if (!newName.trim()) return;

    const now = Date.now();
    const collection: Collection = {
      collectionId: 'col_' + now,
      name: newName.trim(),
      description: newDesc.trim(),
      privacy: newPrivacy,
      itemIds: [itemId],
      itemTypes: [itemType],
      createdTime: now,
      updatedTime: now,
    };

    createCollection(collection);
    // Also add to userFavorites through the collection
    addItemToCollection(collection.collectionId, itemId, itemType);

    setNewName('');
    setNewDesc('');
    setNewPrivacy('private');
    setShowCreateForm(false);
    showToastBriefly('收藏夹已创建');
  };

  const showToastBriefly = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div ref={pickerRef} style={styles.picker}>
      <div style={styles.pickerHeader}>
        <span style={styles.pickerTitle}>收藏到</span>
        <button style={styles.pickerCloseBtn} onClick={onClose}>&times;</button>
      </div>

      {!showCreateForm ? (
        <>
          <div style={styles.collectionList}>
            {collections.length === 0 ? (
              <div style={styles.emptyMsg}>暂无收藏夹</div>
            ) : (
              collections.map(col => (
                <label key={col.collectionId} style={styles.collectionRow}>
                  <input
                    type="checkbox"
                    checked={isItemInCollection(col)}
                    onChange={() => handleToggleCollection(col)}
                    style={styles.checkbox}
                  />
                  <div style={styles.collectionInfo}>
                    <div style={styles.collectionName}>
                      {col.privacy === 'private' ? '🔒 ' : ''}{col.name}
                    </div>
                    <div style={styles.collectionCount}>{col.itemIds.length} 个内容</div>
                  </div>
                </label>
              ))
            )}
          </div>
          <button
            style={styles.createLink}
            onClick={() => setShowCreateForm(true)}
          >
            + 创建新收藏夹
          </button>
        </>
      ) : (
        <div style={styles.createForm}>
          <input
            type="text"
            placeholder="收藏夹名称（必填）"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={styles.createInput}
            autoFocus
          />
          <input
            type="text"
            placeholder="描述（可选）"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            style={styles.createInput}
          />
          <div style={styles.privacyRow}>
            <label style={styles.privacyLabel}>
              <input
                type="radio"
                name="privacy"
                checked={newPrivacy === 'private'}
                onChange={() => setNewPrivacy('private')}
              />
              🔒 私密
            </label>
            <label style={styles.privacyLabel}>
              <input
                type="radio"
                name="privacy"
                checked={newPrivacy === 'public'}
                onChange={() => setNewPrivacy('public')}
              />
              🌐 公开
            </label>
          </div>
          <div style={styles.createActions}>
            <button style={styles.cancelBtn} onClick={() => setShowCreateForm(false)}>
              取消
            </button>
            <button
              style={{
                ...styles.createBtn,
                ...(newName.trim() ? {} : styles.createBtnDisabled),
              }}
              disabled={!newName.trim()}
              onClick={handleCreateCollection}
            >
              创建
            </button>
          </div>
        </div>
      )}

      {showToast && (
        <div style={styles.miniToast}>{toastMsg}</div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  picker: {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    width: '280px',
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    zIndex: 100,
    marginBottom: '4px',
  },
  pickerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
  },
  pickerTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  pickerCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1',
  },
  collectionList: {
    maxHeight: '200px',
    overflowY: 'auto',
    padding: '8px 0',
  },
  emptyMsg: {
    padding: '16px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  collectionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: 'var(--primary-color)',
    cursor: 'pointer',
  },
  collectionInfo: {
    flex: 1,
    minWidth: 0,
  },
  collectionName: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  collectionCount: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  createLink: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    borderTop: '1px solid var(--border-color)',
    background: 'none',
    color: 'var(--primary-color)',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  createForm: {
    padding: '12px 16px',
  },
  createInput: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
    marginBottom: '8px',
    boxSizing: 'border-box',
  },
  privacyRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px',
  },
  privacyLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  createActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  cancelBtn: {
    padding: '6px 14px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  createBtn: {
    padding: '6px 14px',
    border: 'none',
    background: 'var(--primary-color)',
    color: 'white',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  createBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  miniToast: {
    position: 'absolute',
    bottom: '-36px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '4px',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    zIndex: 101,
  },
};

export default CollectionPicker;
