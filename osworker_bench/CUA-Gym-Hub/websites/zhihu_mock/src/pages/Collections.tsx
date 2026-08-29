
import React from 'react';
import { useStore } from '../store/useStore';

const Collections: React.FC = () => {
  const collections = useStore(state => state.collections);
  
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>我的收藏夹</h1>
        
        <div style={styles.list}>
          {collections.map(collection => (
            <div key={collection.collectionId} className="card" style={styles.collectionCard}>
              <h3 style={styles.collectionName}>{collection.name}</h3>
              <div style={styles.collectionDesc}>{collection.description}</div>
              <div style={styles.collectionMeta}>
                {collection.itemIds.length} 项内容 · {collection.privacy === 'private' ? '私密' : '公开'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: 'var(--bg-secondary)',
    minHeight: 'calc(100vh - 56px)',
    paddingTop: '20px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '24px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  collectionCard: {
    padding: '20px',
  },
  collectionName: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  collectionDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  collectionMeta: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
};

export default Collections;
  