import React, { useEffect, useRef } from 'react';

export const ContextMenu = ({ x, y, items, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to fit within viewport
  const style = {
    position: 'fixed',
    top: y,
    left: x,
    zIndex: 100,
  };

  return (
    <div ref={ref} style={style} className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
      {items.map((item, idx) => {
        if (item.separator) {
          return <div key={idx} className="my-1 border-t border-gray-100" />;
        }
        return (
          <button
            key={idx}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2 ${
              item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
            }`}
            disabled={item.disabled}
          >
            {item.icon && <item.icon size={12} className={item.danger ? 'text-red-500' : 'text-gray-400'} />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
