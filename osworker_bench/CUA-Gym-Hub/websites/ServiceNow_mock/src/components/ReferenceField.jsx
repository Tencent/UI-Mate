import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function ReferenceField({ value, displayValue, options, onChange, placeholder = 'Search...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sn-ref-field" ref={ref}>
      <input
        type="text"
        className="sn-form-input"
        value={isOpen ? search : (displayValue || '')}
        onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
        onFocus={() => { setIsOpen(true); setSearch(''); }}
        placeholder={placeholder}
      />
      <button className="sn-ref-field-btn" onClick={() => setIsOpen(!isOpen)} type="button">
        <Search size={14} />
      </button>
      {isOpen && (
        <div className="sn-ref-dropdown">
          {value && (
            <div className="sn-ref-dropdown-item" style={{ color: '#999', fontStyle: 'italic' }} onClick={() => { onChange(null); setIsOpen(false); setSearch(''); }}>
              -- None --
            </div>
          )}
          {filtered.map(opt => (
            <div key={opt.value} className="sn-ref-dropdown-item" onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(''); }}>
              {opt.label}
            </div>
          ))}
          {filtered.length === 0 && <div className="sn-ref-dropdown-item" style={{ color: '#999' }}>No results</div>}
        </div>
      )}
    </div>
  );
}
