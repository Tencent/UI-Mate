
import React, { useState } from 'react';
import CollectionPicker from './CollectionPicker';

interface FavoriteButtonProps {
  itemId: string;
  itemType: 'answer' | 'article' | 'idea';
  isFavorited: boolean;
  style?: React.CSSProperties;
  activeStyle?: React.CSSProperties;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemId,
  itemType,
  isFavorited,
  style = {},
  activeStyle = {},
}) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div style={styles.wrapper}>
      <button
        style={{
          ...styles.btn,
          ...style,
          ...(isFavorited ? { ...styles.btnActive, ...activeStyle } : {}),
        }}
        onClick={() => setShowPicker(!showPicker)}
      >
        ⭐ 收藏
      </button>
      {showPicker && (
        <CollectionPicker
          itemId={itemId}
          itemType={itemType}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  btn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  btnActive: {
    color: 'var(--primary-color)',
    background: 'var(--tag-bg)',
  },
};

export default FavoriteButton;
