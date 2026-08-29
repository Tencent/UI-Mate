import React, { useState, useRef, useEffect } from 'react';
import { AIRPORTS } from '../lib/data';

export default function Autocomplete({ placeholder, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const ref = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const list = (Array.isArray(AIRPORTS) ? AIRPORTS : []).filter((a) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const code = (a.code || a.iata || '').toLowerCase();
    const name = (a.name || a.city || '').toLowerCase();
    return code.includes(q) || name.includes(q);
  }).slice(0, 8);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); onChange?.(e.target.value); }}
      />
      {open && list.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded shadow-lg max-h-64 overflow-y-auto">
          {list.map((a, i) => {
            const code = a.code || a.iata || '';
            const label = a.name || a.city || code;
            return (
              <button
                key={code + i}
                type="button"
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                onClick={() => { setQuery(code); onChange?.(code); setOpen(false); }}
              >
                <span className="font-medium">{code}</span>
                <span className="ml-2 text-gray-500">{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
